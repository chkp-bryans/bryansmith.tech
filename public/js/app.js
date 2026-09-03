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

function blogCard(post) {
  const tags = (post.tags || []).map((t) => `<span class="badge">${t}</span>`).join("");
  return `
    <article class="card">
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <div class="card-meta">
        <span class="badge">${post.date || "Undated"}</span>
        <span class="badge">${estimateReadTime(post.excerpt)}</span>
      </div>
      <p class="card-meta">${tags}</p>
    </article>
  `;
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
  renderLoading(target, 3);
  try {
    const data = await getJSON("/api/blog");
    target.classList.remove("loading");
    target.innerHTML = data.posts.map(blogCard).join("");
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

document.getElementById("year").textContent = new Date().getFullYear();
initMobileNav();
loadProjects();
loadBlog();
