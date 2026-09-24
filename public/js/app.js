async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed request: ${url}`);
  return response.json();
}

function estimateReadTime(text) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function projectCard(repo) {
  return `
    <article class="card">
      <h3><a href="${repo.url}" target="_blank" rel="noopener">${repo.name}</a></h3>
      <p>${repo.description || "No description provided."}</p>
      <div class="card-meta">
        <span class="badge">Star ${repo.stars}</span>
        ${repo.highlight ? `<span class="badge">${repo.highlight}</span>` : ""}
        <span class="badge status-live">${repo.fallback ? "Cached" : "Live"}</span>
      </div>
    </article>
  `;
}

function blogCard(post, index, latestSlug) {
  const tags = (post.tags || [])
    .map((t) => `<button type="button" class="badge tag-badge" data-tag="${escapeAttr(t)}" aria-label="Filter by ${escapeAttr(t)}">${escapeHtml(t)}</button>`)
    .join("");
  const cover = post.cover
    ? `<div class="card-cover"><img src="${post.cover}" alt="" loading="lazy" decoding="async"></div>`
    : `<div class="card-cover card-cover-fallback" aria-hidden="true"></div>`;
  const isLatest = latestSlug && post.slug === latestSlug;
  const latest = isLatest ? `<span class="badge latest-badge">Latest</span>` : "";
  return `
    <article class="card writing-card${isLatest ? " writing-card-latest" : ""}" data-slug="${escapeAttr(post.slug)}">
      ${cover}
      <div class="card-body">
        <h3><a href="/writings/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h3>
        <p>${escapeHtml(post.excerpt)}</p>
        <div class="card-meta">
          ${latest}
          <span class="badge">${escapeHtml(post.date || "Undated")}</span>
          <span class="badge">${estimateReadTime(post.excerpt)}</span>
        </div>
        <p class="card-meta">${tags}</p>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

const writingsState = {
  posts: [],
  latestSlug: "",
  tag: "",
  sort: "newest"
};

function readWritingsParams() {
  const params = new URLSearchParams(window.location.search);
  const tag = (params.get("tag") || "").trim();
  const sort = (params.get("sort") || "newest").trim();
  writingsState.tag = tag;
  writingsState.sort = ["newest", "oldest", "title"].includes(sort) ? sort : "newest";
}

function writeWritingsParams() {
  const params = new URLSearchParams(window.location.search);
  if (writingsState.tag) params.set("tag", writingsState.tag);
  else params.delete("tag");
  if (writingsState.sort && writingsState.sort !== "newest") params.set("sort", writingsState.sort);
  else params.delete("sort");
  const query = params.toString();
  const hash = window.location.hash || "#writings";
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${hash.startsWith("#writings") ? hash : "#writings"}`;
  window.history.replaceState({}, "", next);
}

function tagFrequency(posts) {
  const counts = new Map();
  posts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));
}

function sortedFilteredPosts() {
  let list = writingsState.posts.slice();
  if (writingsState.tag) {
    list = list.filter((post) => (post.tags || []).includes(writingsState.tag));
  }
  if (writingsState.sort === "oldest") {
    list.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  } else if (writingsState.sort === "title") {
    list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  } else {
    list.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }
  return list;
}

function renderTagFilters() {
  const host = document.getElementById("writings-tag-filters");
  if (!host) return;
  const tags = tagFrequency(writingsState.posts);
  // Prefer tags used more than once; always include the active tag if set.
  const visible = tags.filter((item) => item.count > 1 || item.tag === writingsState.tag);
  const chips = [
    { tag: "", label: "All" },
    ...visible.map((item) => ({ tag: item.tag, label: item.tag }))
  ];
  host.innerHTML = chips.map(({ tag, label }) => {
    const active = writingsState.tag === tag || (!writingsState.tag && tag === "");
    return `<button type="button" class="tag-filter${active ? " is-active" : ""}" data-tag="${escapeAttr(tag)}" aria-pressed="${active}">${escapeHtml(label)}</button>`;
  }).join("");
}

function renderWritings() {
  const target = document.getElementById("blog-grid");
  const status = document.getElementById("writings-status");
  const sortSelect = document.getElementById("writings-sort");
  if (!target) return;

  if (sortSelect) sortSelect.value = writingsState.sort;
  renderTagFilters();

  const posts = sortedFilteredPosts();
  if (!posts.length) {
    target.innerHTML = `<article class="card"><p>No writings match this tag. Clear the filter to see everything.</p></article>`;
    if (status) status.textContent = writingsState.tag ? `0 writings tagged “${writingsState.tag}”` : "";
    return;
  }

  target.classList.remove("loading");
  target.innerHTML = posts.map((post, index) => blogCard(post, index, writingsState.latestSlug)).join("");
  if (status) {
    status.textContent = writingsState.tag
      ? `${posts.length} writing${posts.length === 1 ? "" : "s"} tagged “${writingsState.tag}”`
      : `${posts.length} writing${posts.length === 1 ? "" : "s"}`;
  }

  target.querySelectorAll(".writing-card").forEach((card) => {
    const link = card.querySelector("h3 a");
    if (!link) return;
    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      window.location.href = link.href;
    });
  });

  target.querySelectorAll(".tag-badge").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setWritingsTag(btn.getAttribute("data-tag") || "");
    });
  });
}

function setWritingsTag(tag) {
  writingsState.tag = writingsState.tag === tag ? "" : tag;
  writeWritingsParams();
  renderWritings();
}

function initWritingsControls() {
  const sortSelect = document.getElementById("writings-sort");
  const filters = document.getElementById("writings-tag-filters");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      writingsState.sort = sortSelect.value;
      writeWritingsParams();
      renderWritings();
    });
  }
  if (filters) {
    filters.addEventListener("click", (event) => {
      const btn = event.target.closest(".tag-filter");
      if (!btn) return;
      setWritingsTag(btn.getAttribute("data-tag") || "");
    });
  }
}

async function loadBlog() {
  const target = document.getElementById("blog-grid");
  renderLoading(target, 3);
  readWritingsParams();
  initWritingsControls();
  try {
    const data = await getJSON("/api/blog");
    writingsState.posts = data.posts || [];
    writingsState.latestSlug = writingsState.posts[0] ? writingsState.posts[0].slug : "";
    renderWritings();
  } catch (_err) {
    target.classList.remove("loading");
    target.innerHTML = `<article class="card"><p>Unable to load writings right now.</p></article>`;
  }
}

async function openArticle(slug) {
  const dialog = document.getElementById("article-dialog");
  const title = document.getElementById("article-title");
  const date = document.getElementById("article-date");
  const body = document.getElementById("article-body");
  body.textContent = "Loading article...";
  dialog.showModal();
  try {
    const post = await getJSON(`/api/blog/${encodeURIComponent(slug)}`);
    title.textContent = post.title;
    date.textContent = `${post.date} | ${estimateReadTime(post.body)}`;
    body.innerHTML = post.html;
  } catch (_err) {
    body.textContent = "Unable to load this article right now.";
  }
}

function initArticleDialog() {
  const dialog = document.getElementById("article-dialog");
  if (!dialog) return;
  const close = dialog.querySelector(".dialog-close");
  if (close) close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function renderLoading(target, count) {
  target.classList.add("loading");
  target.innerHTML = Array.from({ length: count }, () => `
    <article class="card">
      <h3>Loading...</h3>
      <p>Fetching content...</p>
    </article>
  `).join("");
}

async function loadProjects() {
  const target = document.getElementById("projects-grid");
  renderLoading(target, 3);
  try {
    const data = await getJSON("/api/showcase");
    target.classList.remove("loading");
    target.innerHTML = data.repos.map(projectCard).join("");
  } catch (_err) {
    target.classList.remove("loading");
    target.innerHTML = `<article class="card"><p>Unable to load projects right now.</p></article>`;
  }
}

function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });
}

function initInteractions() {
  const revealItems = document.querySelectorAll(".hero-panel, .linkedin-card, .section, .footer");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));

  document.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
  });

  document.querySelectorAll(".card, .linkedin-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -3;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 3;
      card.style.setProperty("--tilt", `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    });
    card.addEventListener("pointerleave", () => card.style.removeProperty("--tilt"));
  });
}

document.getElementById("year").textContent = new Date().getFullYear();
initMobileNav();
initArticleDialog();
initInteractions();
loadProjects();
loadBlog();
