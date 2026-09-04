# bryansmith.tech Landing Page

Professional personal landing page with GitHub project showcase, markdown-powered writings, and Dokploy-ready container deployment.

**Live:** https://bryansmith.tech

## Architecture (live)

Current production is a **single Node/Express `app` container** on Dokploy (`dokploy.csadocs.com`):

- Dokploy ingress terminates TLS and routes to the app on port **3000**
- **No nginx** and **no Check Point Infinity Next Nano** in the critical path today
- `nginx/` and `waf/` folders remain in the repo as **optional / future reference only** (not required for the live stack)

### Repo layout

- `public/` — static responsive frontend (HTML/CSS/JS)
- `server/` — Node.js + Express API
- `content/blog/` — markdown articles
- `config/showcase.json` — editable project showcase config
- `Dockerfile` + `docker-compose.yml` — Dokploy app-only compose (builds/runs `app`)
- `nginx/` — optional future reverse-proxy reference (not used live)
- `waf/` — optional future Check Point Nano reference (not used live)

## Local Run

1. Copy env file:
   - `cp .env.example .env` (Windows: `copy .env.example .env`)
2. Optionally set `GITHUB_TOKEN` for higher GitHub API rate limits.
3. Install dependencies:
   - `npm install`
4. Start server:
   - `npm start`
5. Open `http://localhost:3000`

`NANO_*` variables are **not required** for the current stack.

## API Endpoints

- `GET /api/health`
- `GET /api/showcase`
- `GET /api/blog`
- `GET /api/blog/:slug`

## Content Updates

- Add/edit blog posts in `content/blog/*.md`
- Use front matter:
  - `title`, `date`, `excerpt`, `tags`
- Edit showcased repos in `config/showcase.json`

## Dokploy Deployment (current)

1. Push this repo/branch to your Git provider.
2. In Dokploy (`dokploy.csadocs.com`), create/use a Docker Compose (or equivalent) app pointed at this repository.
3. Compose file: `docker-compose.yml` (single `app` service).
4. Set environment in Dokploy:
   - `GITHUB_TOKEN` (optional, recommended for GitHub API limits)
   - `NODE_ENV=production` (optional; compose defaults)
   - `PORT=3000` (optional; compose defaults)
5. Map domain `bryansmith.tech` and enable TLS at **Dokploy ingress** → container port **3000**.
6. Deploy and verify:
   - `https://bryansmith.tech/`
   - `https://bryansmith.tech/api/health`

Do **not** require nginx or Nano credentials for this deployment path.

## Optional / future components

- **nginx/** — sample reverse proxy, compression, and headers if you later put nginx in front of `app`
- **waf/** — Check Point Infinity Next Nano notes if you later add WAF; see `waf/README.md`

## Healthcheck follow-up (recommended)

The app image is `node:20-alpine`. Alpine does **not** ship `wget` by default. The compose healthcheck currently uses `wget`; if Dokploy marks the container unhealthy despite a working `/api/health`, switch the healthcheck to Node's built-in `fetch` (or install a small HTTP client in the image). This is a recommended follow-up — do not treat it as a blocker for the live docs alignment.

## Performance Considerations

- Static assets served via Express with cache headers
- TLS and edge routing handled by Dokploy ingress
- Frontend fetches content asynchronously
