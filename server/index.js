const fs = require("fs");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const { marked } = require("marked");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const BLOG_DIR = path.join(__dirname, "..", "content", "blog");
const SHOWCASE_FILE = path.join(__dirname, "..", "config", "showcase.json");

app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public"), { maxAge: "1h" }));

function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function parseFrontMatter(content) {
  if (!content.startsWith("---")) {
    return { meta: {}, body: content };
  }
  const end = content.indexOf("\n---", 3);
  if (end === -1) {
    return { meta: {}, body: content };
  }
  const frontMatter = content.slice(3, end).trim();
  const body = content.slice(end + 4).trim();
  const meta = {};
  frontMatter.split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
      meta[key] = value;
    }
  });
  return { meta, body };
}

function getBlogPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((name) => path.join(BLOG_DIR, name));

  const posts = files.map((file) => {
    const slug = path.basename(file, ".md");
    const raw = fs.readFileSync(file, "utf8");
    const { meta, body } = parseFrontMatter(raw);
    return {
      slug,
      title: meta.title || slug,
      date: meta.date || "",
      excerpt: meta.excerpt || body.slice(0, 160),
      tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()) : [],
      html: marked.parse(body)
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function fetchRepo(repo) {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "bryansmith-tech-landing"
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API failed for ${repo}: ${response.status}`);
  }
  const data = await response.json();
  return {
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    url: data.html_url
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "bryansmith.tech", timestamp: new Date().toISOString() });
});

app.get("/api/showcase", async (_req, res) => {
  try {
    const config = readJSON(SHOWCASE_FILE);
    if (!Array.isArray(config.repos)) {
      return res.status(500).json({ error: "Invalid showcase configuration" });
    }
    const repos = await Promise.all(
      config.repos.slice(0, 5).map(async (item) => {
        try {
          const live = await fetchRepo(item.repo);
          return { ...live, highlight: item.highlight || "" };
        } catch (_err) {
          return {
            name: item.repo.split("/")[1] || item.repo,
            full_name: item.repo,
            description: item.description || "",
            stars: item.stars || 0,
            url: `https://github.com/${item.repo}`,
            highlight: item.highlight || "",
            fallback: true
          };
        }
      })
    );
    return res.json({ repos });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/blog", (_req, res) => {
  try {
    const posts = getBlogPosts().map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      tags: post.tags
    }));
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/blog/:slug", (req, res) => {
  try {
    const posts = getBlogPosts();
    const post = posts.find((p) => p.slug === req.params.slug);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.json(post);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
