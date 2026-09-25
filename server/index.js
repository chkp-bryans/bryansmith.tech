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
const GOATCOUNTER_CODE = (process.env.GOATCOUNTER_CODE || "").trim();

app.use(
  helmet({
    // Allow LinkedIn/other crawlers to load og:image (default same-origin blocks them).
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // GoatCounter: count.js from gc.zgo.at; beacons to *.goatcounter.com
        // Mermaid CDN for interactive diagrams in writings (click handlers need loose securityLevel in mermaid-boot.js)
        "script-src": ["'self'", "https://gc.zgo.at", "https://cdn.jsdelivr.net"],
        "connect-src": ["'self'", "https://*.goatcounter.com", "https://gc.zgo.at", "https://cdn.jsdelivr.net"],
        "img-src": ["'self'", "data:", "https:", "https://*.goatcounter.com"],
        "style-src": ["'self'", "https:", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        // Mermaid may use workers/blobs when rendering
        "worker-src": ["'self'", "blob:"],
        "child-src": ["'self'", "blob:"]
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
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    return {
      slug,
      title: meta.title || slug,
      date: meta.date || "",
      excerpt: meta.excerpt || body.slice(0, 160),
      tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()) : [],
      cover: meta.cover || "",
      wordCount: words,
      readMinutes: Math.max(1, Math.ceil(words / 200)),
      html: marked.parse(body)
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function socialLinksHtml(footer = false) {
  const cls = footer ? "social-links social-links-footer" : "social-links";
  const size = footer ? 18 : 20;
  return `<nav class="${cls}" aria-label="Social profiles">
    <a class="social-link" href="https://github.com/chkp-bryans" target="_blank" rel="noopener" aria-label="GitHub">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="M12 2C6.477 2 2 6.586 2 12.253c0 4.53 2.865 8.367 6.839 9.722.5.094.682-.222.682-.493 0-.243-.009-.886-.014-1.74-2.782.618-3.369-1.38-3.369-1.38-.454-1.18-1.11-1.494-1.11-1.494-.908-.636.069-.623.069-.623 1.004.072 1.532 1.057 1.532 1.057.892 1.566 2.341 1.114 2.91.852.092-.662.35-1.114.636-1.37-2.22-.26-4.555-1.143-4.555-5.087 0-1.124.39-2.043 1.029-2.764-.103-.26-.446-1.302.098-2.713 0 0 .84-.276 2.75 1.055A9.34 9.34 0 0 1 12 6.9c.85.004 1.705.118 2.504.346 1.909-1.331 2.747-1.055 2.747-1.055.546 1.411.203 2.453.1 2.713.64.721 1.028 1.64 1.028 2.764 0 3.954-2.339 4.824-4.566 5.08.359.317.679.943.679 1.901 0 1.371-.012 2.477-.012 2.814 0 .273.18.592.688.491C19.138 20.617 22 16.78 22 12.253 22 6.586 17.523 2 12 2z"/></svg>
    </a>
    <a class="social-link" href="https://x.com/psuimpreza" target="_blank" rel="noopener" aria-label="X">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.992 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
    </a>
    <a class="social-link" href="https://www.instagram.com/psuimpreza/" target="_blank" rel="noopener" aria-label="Instagram">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5zm8.75 1.75a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/></svg>
    </a>
    <a class="social-link" href="https://www.reddit.com/user/psuimpreza/" target="_blank" rel="noopener" aria-label="Reddit">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="M14.06 9.02a.8.8 0 0 1 .79-.7h.02a1.62 1.62 0 1 1-1.28 2.6 5.66 5.66 0 0 1 1.1.2c.1-.28.28-.52.54-.68a2.42 2.42 0 0 0-1.17-1.42zm-4.12 0a2.42 2.42 0 0 0-1.17 1.42c.26.16.44.4.54.68a5.66 5.66 0 0 1 1.1-.2 1.62 1.62 0 1 1-1.28-2.6h.02a.8.8 0 0 1 .79.7zM12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm5.57-9.5c.55 0 1 .45 1 1 0 .4-.24.74-.58.9-.03 2.18-2.38 3.95-5.99 3.95s-5.96-1.77-5.99-3.95a.99.99 0 0 1-.58-.9c0-.55.45-1 1-1 .3 0 .57.14.76.34A4.9 4.9 0 0 1 12 10.7c1.52 0 2.9.48 3.81 1.14.19-.2.46-.34.76-.34zm-7.36 2.54a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8zm4.58 2.14c.86 0 1.57-.34 1.91-.72a.4.4 0 0 0-.1-.56.4.4 0 0 0-.56.1c-.2.22-.7.48-1.25.48s-1.05-.26-1.25-.48a.4.4 0 1 0-.66.46c.34.38 1.05.72 1.91.72zm.91-2.14a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8z"/></svg>
    </a>
  </nav>`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr || "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
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

function goatCounterSnippet() {
  if (!GOATCOUNTER_CODE) return "";
  const code = escapeHtml(GOATCOUNTER_CODE);
  return `<!-- Privacy-friendly analytics by GoatCounter -->
<script data-goatcounter="https://${code}.goatcounter.com/count"
        async src="https://gc.zgo.at/count.js"></script>`;
}


function publishedTimeIso(dateStr) {
  // Frontmatter dates are YYYY-MM-DD. LinkedIn wants ISO8601; use noon UTC
  // so the calendar day is stable across US timezones.
  // Approach: `${YYYY-MM-DD}T12:00:00.000Z`
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "";
  return `${dateStr}T12:00:00.000Z`;
}

function imageExt(coverPath) {
  const clean = String(coverPath || "").split("?")[0].split("#")[0];
  const m = clean.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "";
}

function mimeFromExt(ext) {
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "svg") return "image/svg+xml";
  return "";
}

function readRasterDimensions(coverPath) {
  if (!coverPath) return null;
  const rel = coverPath.startsWith("/") ? coverPath.slice(1) : coverPath;
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!fs.existsSync(filePath)) return null;
  try {
    const buf = fs.readFileSync(filePath);
    // PNG IHDR
    if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    // JPEG SOF
    if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) {
          i += 1;
          continue;
        }
        const marker = buf[i + 1];
        if (marker === 0xd8 || marker === 0xd9) {
          i += 2;
          continue;
        }
        const length = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xc2 && length >= 7) {
          return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
        }
        i += 2 + length;
      }
    }
  } catch (_) {
    return null;
  }
  return null;
}

function ogImageMetaTags(coverPath, absoluteImageUrl) {
  const ext = imageExt(coverPath || absoluteImageUrl);
  const type = mimeFromExt(ext);
  const lines = [];
  if (type && type !== "image/svg+xml") {
    lines.push(`  <meta property="og:image:type" content="${type}">`);
    const dims = readRasterDimensions(coverPath);
    if (dims && dims.width && dims.height) {
      lines.push(`  <meta property="og:image:width" content="${dims.width}">`);
      lines.push(`  <meta property="og:image:height" content="${dims.height}">`);
    }
  }
  return lines.join("\n");
}

function renderWritingPage(post) {
  const url = `${SITE_URL}/writings/${encodeURIComponent(post.slug)}`;
  const image = absoluteUrl(post.cover || "/bs.jpg");
  const tags = (post.tags || [])
    .slice(0, 4)
    .map((t) => `<span class="badge">${escapeHtml(t)}</span>`)
    .join("");
  const cover = post.cover
    ? `<img class="writing-cover" src="${escapeHtml(post.cover)}" alt="">`
    : "";
  const displayDate = formatDisplayDate(post.date);
  const readLabel = post.readMinutes ? `${post.readMinutes} min read` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)} | Bryan Smith</title>
  <meta name="description" content="${escapeHtml(post.excerpt)}">
  <link rel="canonical" href="${escapeHtml(url)}">
  <meta name="author" content="Bryan Smith">
  <meta property="article:author" content="Bryan Smith">
  ${post.date && /^\d{4}-\d{2}-\d{2}$/.test(post.date) ? `<meta property="article:published_time" content="${publishedTimeIso(post.date)}">` : ""}
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.excerpt)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:image" content="${escapeHtml(image)}">
${ogImageMetaTags(post.cover, image)}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.excerpt)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  ${goatCounterSnippet()}
</head>
<body class="writing-page">
  <div class="page-atmosphere" aria-hidden="true"></div>
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
        <a href="/#work">Selected work</a>
        <a href="/#about">About</a>
        <a href="/#contact">Contact</a>
      </div>
    </nav>
  </header>
  <main id="writing-content" class="container writing-main">
    <p class="writing-back"><a href="/#writings">&larr; All writings</a></p>
    <article class="writing-article">
      <p class="eyebrow">${escapeHtml([displayDate, readLabel].filter(Boolean).join(" · "))}</p>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="card-meta writing-meta">${tags}</div>
      ${cover}
      <div class="writing-body">${post.html}</div>
    </article>
  </main>
  <footer class="container footer">
    <small>&copy; ${new Date().getFullYear()} Bryan Smith · bryansmith.tech</small>
    ${socialLinksHtml(true)}
  </footer>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <script src="/js/mermaid-boot.js"></script>
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
  ${goatCounterSnippet()}
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
    analytics: GOATCOUNTER_CODE ? "goatcounter" : null
  });
});

app.get("/api/showcase", async (_req, res) => {
  try {
    const config = readJSON(SHOWCASE_FILE);
    if (!Array.isArray(config.repos)) {
      return res.status(500).json({ error: "Invalid showcase configuration" });
    }
    const repos = await Promise.all(
      config.repos.slice(0, 4).map(async (item) => {
        try {
          const live = await fetchRepo(item.repo);
          return {
            ...live,
            name: item.title || live.name,
            description: item.description || live.description,
            highlight: item.highlight || ""
          };
        } catch (_err) {
          return {
            name: item.title || item.repo.split("/")[1] || item.repo,
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
      displayDate: formatDisplayDate(post.date),
      excerpt: post.excerpt,
      tags: post.tags,
      cover: post.cover,
      readMinutes: post.readMinutes,
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

// Homepage with optional GoatCounter injection (GOATCOUNTER_CODE)
app.get(["/", "/index.html"], (_req, res) => {
  let html = fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf8");
  const snippet = goatCounterSnippet();
  if (snippet && !html.includes("gc.zgo.at/count.js")) {
    html = html.replace("</head>", `  ${snippet}\n</head>`);
  }
  res.type("html").send(html);
});

app.use(express.static(PUBLIC_DIR, { maxAge: "1h", index: false }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
