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
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SITE_URL = (process.env.SITE_URL || "https://bryansmith.tech").replace(/\/$/, "");
const PLAUSIBLE_DOMAIN = (process.env.PLAUSIBLE_DOMAIN || "").trim();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://plausible.io"],
        "connect-src": ["'self'", "https://plausible.io"],
        "img-src": ["'self'", "data:", "https:"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"]
      }
    }
  })
);
app.use(express.json());

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
      cover: meta.cover || "",
      html: marked.parse(body)
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function absoluteUrl(maybePath) {
  if (!maybePath) return `${SITE_URL}/bs.jpg`;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  return `${SITE_URL}${maybePath.startsWith("/") ? maybePath : `/${maybePath}`}`;
}

function plausibleSnippet() {
  if (!PLAUSIBLE_DOMAIN) return "";
  return `<script defer data-domain="${escapeHtml(PLAUSIBLE_DOMAIN)}" src="https://plausible.io/js/script.js"></script>`;
}

function renderWritingPage(post) {
  const url = `${SITE_URL}/writings/${encodeURIComponent(post.slug)}`;
  const image = absoluteUrl(post.cover || "/bs.jpg");
  const tags = (post.tags || [])
    .map((t) => `<span class="badge">${escapeHtml(t)}</span>`)
    .join("");
  const cover = post.cover
    ? `<img class="writing-cover" src="${escapeHtml(post.cover)}" alt="">`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)} | Bryan Smith</title>
  <meta name="description" content="${escapeHtml(post.excerpt)}">
  <link rel="canonical" href="${escapeHtml(url)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.excerpt)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.excerpt)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/styles.css">
  ${plausibleSnippet()}
</head>
<body class="writing-page">
  <a class="skip-link" href="#writing-content">Skip to main content</a>
  <header class="site-header" aria-label="Site header">
    <nav class="container nav" aria-label="Primary navigation">
      <a href="/" class="logo" aria-label="Bryan Smith home">
        <img class="logo-mark" src="/brand-mark.svg" width="28" height="28" alt="">
        <span class="logo-text">
          <span class="logo-name">Bryan Smith</span>
          <span class="logo-domain">bryansmith.tech</span>
        </span>
      </a>
      <div class="nav-links">
        <a href="/#writings">Writings</a>
        <a href="/#about">About</a>
        <a href="/#contact">Contact</a>
      </div>
    </nav>
  </header>
  <main id="writing-content" class="container writing-main">
    <p class="writing-back"><a href="/#writings">&larr; All writings</a></p>
    <article class="writing-article">
      <p class="eyebrow">${escapeHtml(post.date || "")}</p>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="card-meta writing-meta">${tags}</div>
      ${cover}
      <div class="writing-body">${post.html}</div>
    </article>
  </main>
  <footer class="container footer">
    <small>&copy; ${new Date().getFullYear()} bryansmith.tech</small>
  </footer>
</body>
</html>`;
}

function renderNotFoundPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Not found | Bryan Smith</title>
  <link rel="stylesheet" href="/css/styles.css">
  ${plausibleSnippet()}
</head>
<body class="writing-page">
  <main class="container writing-main">
    <h1>Writing not found</h1>
    <p><a href="/#writings">Back to writings</a></p>
  </main>
</body>
</html>`;
}

async function fetchRepo(repo) {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
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

app.get("/api/site-config", (_req, res) => {
  res.json({
    siteUrl: SITE_URL,
    plausibleDomain: PLAUSIBLE_DOMAIN || null
  });
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
      tags: post.tags,
      cover: post.cover,
      url: `/writings/${post.slug}`
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
    return res.json({ ...post, url: `/writings/${post.slug}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/writings/:slug", (req, res) => {
  try {
    const posts = getBlogPosts();
    const post = posts.find((p) => p.slug === req.params.slug);
    if (!post) {
      return res.status(404).type("html").send(renderNotFoundPage());
    }
    return res.type("html").send(renderWritingPage(post));
  } catch (err) {
    return res.status(500).type("html").send("<!doctype html><html><body><h1>Server error</h1></body></html>");
  }
});

// Homepage with optional Plausible injection
app.get(["/", "/index.html"], (_req, res) => {
  let html = fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf8");
  if (PLAUSIBLE_DOMAIN && !html.includes("plausible.io/js/script.js")) {
    html = html.replace(
      "</head>",
      `  ${plausibleSnippet()}\n</head>`
    );
  }
  res.type("html").send(html);
});

app.use(express.static(PUBLIC_DIR, { maxAge: "1h", index: false }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
