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

let blogPosts = [];
let activeTag = "";

function getTagFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("tag") || "";
  } catch (_err) {
    return "";
  }
}

function setTagInUrl(tag) {
  try {
    const url = new URL(window.location.href);
    if (tag) url.searchParams.set("tag", tag);
    else url.searchParams.delete("tag");
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  } catch (_err) {
    // ignore URL update failures
  }
}

function collectUniqueTags(posts) {
  const tags = new Set();
  posts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      if (tag) tags.add(tag);
    });
  });
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

function postMatchesTag(post, tag) {
  if (!tag) return true;
  return (post.tags || []).includes(tag);
}

function blogCard(post, { featured = false } = {}) {
  const tags = (post.tags || [])
    .map((t) => `<button type="button" class="badge writing-tag" data-tag="${t.replace(/"/g, "&quot;")}">${t}</button>`)
    .join("");
  const cover = post.cover
    ? `<div class="card-cover"><img src="${post.cover}" alt="" loading="lazy" decoding="async"></div>`
    : `<div class="card-cover card-cover-fallback" aria-hidden="true"></div>`;
  const featuredBadge = featured ? `<span class="badge featured-badge">Featured</span>` : "";
  return `
    <article class="card writing-card${featured ? " writing-card-featured" : ""}">
      ${cover}
      <div class="card-body">
        <h3><a href="/writings/${encodeURIComponent(post.slug)}">${post.title}</a></h3>
        <p>${post.excerpt}</p>
        <div class="card-meta">
          ${featuredBadge}
          <span class="badge">${post.date || "Undated"}</span>
          <span class="badge">${estimateReadTime(post.excerpt)}</span>
        </div>
        <p class="card-meta">${tags}</p>
      </div>
    </article>
  `;
}

function renderTagChips(tags) {
  const container = document.getElementById("writings-tags");
  if (!container) return;
  const chips = [
    { label: "All", value: "" },
    ...tags.map((tag) => ({ label: tag, value: tag })),
  ];
  container.innerHTML = chips
    .map((chip) => {
      const isActive = chip.value === activeTag;
      return `<button type="button" class="tag-chip${isActive ? " is-active" : ""}" data-tag="${chip.value.replace(/"/g, "&quot;")}" aria-pressed="${isActive ? "true" : "false"}">${chip.label}</button>`;
    })
    .join("");
  container.querySelectorAll(".tag-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveTag(btn.getAttribute("data-tag") || "");
    });
  });
}

function wireWritingCards(target) {
  target.querySelectorAll(".writing-card").forEach((card) => {
    const link = card.querySelector("h3 a");
    if (!link) return;
    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
      if (event.target.closest("a") || event.target.closest(".writing-tag")) return;
      window.location.href = link.href;
    });
  });
  target.querySelectorAll(".writing-tag").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setActiveTag(btn.getAttribute("data-tag") || "");
    });
  });
}

function renderBlogGrid() {
  const target = document.getElementById("blog-grid");
  if (!target) return;

  if (!blogPosts.length) {
    target.innerHTML = `<article class="card"><p>No writings yet.</p></article>`;
    return;
  }

  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);
  const showFeatured = postMatchesTag(featured, activeTag);
  const filteredRest = rest.filter((post) => postMatchesTag(post, activeTag));

  if (!showFeatured && filteredRest.length === 0) {
    target.innerHTML = `<p class="writings-empty">No writings with that tag.</p>`;
    return;
  }

  const cards = [];
  if (showFeatured) cards.push(blogCard(featured, { featured: true }));
  filteredRest.forEach((post) => cards.push(blogCard(post)));
  target.innerHTML = cards.join("");
  wireWritingCards(target);
}

function setActiveTag(tag) {
  activeTag = tag || "";
  setTagInUrl(activeTag);
  renderTagChips(collectUniqueTags(blogPosts));
  renderBlogGrid();
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

async function loadBlog() {
  const target = document.getElementById("blog-grid");
  if (!target) return;
  renderLoading(target, 3);
  try {
    const data = await getJSON("/api/blog");
    target.classList.remove("loading");
    blogPosts = data.posts || [];
    activeTag = getTagFromUrl();
    const knownTags = collectUniqueTags(blogPosts);
    if (activeTag && !knownTags.includes(activeTag)) {
      activeTag = "";
      setTagInUrl("");
    }
    renderTagChips(knownTags);
    renderBlogGrid();
  } catch (_err) {
    target.classList.remove("loading");
    target.innerHTML = `<article class="card"><p>Unable to load writings right now.</p></article>`;
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
