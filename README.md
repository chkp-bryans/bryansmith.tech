# bryansmith.tech Landing Page

Professional personal landing page with GitHub project showcase, markdown-powered writings, and Dokploy-ready container deployment.

## Architecture

- `public/` static responsive frontend (HTML/CSS/JS)
- `server/` Node.js + Express API
- `content/blog/` markdown articles
- `config/showcase.json` editable project showcase config
- `nginx/default.conf` reverse proxy, compression, and security headers
- `waf/` Check Point Infinity Next Nano setup docs
- `Dockerfile` + `docker-compose.yml` deployment stack

## Local Run

1. Copy env file:
   - `cp .env.example .env` (Windows: `copy .env.example .env`)
2. Set optional `GITHUB_TOKEN` for higher GitHub API limits.
3. Install dependencies:
   - `npm install`
4. Start server:
   - `npm start`
5. Open `http://localhost:3000`

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

## Dokploy Deployment

1. Push this repo/branch to your Git provider.
2. In Dokploy (`dokploy.csadocs.com`), create a Docker Compose app.
3. Point Dokploy to this repository and branch.
4. Set environment secrets in Dokploy:
   - `GITHUB_TOKEN` (optional)
   - `NANO_TENANT_ID`
   - `NANO_PROFILE_TOKEN`
5. Deploy.
6. Configure domain + SSL/TLS certificate in Dokploy.
7. Verify:
   - `https://your-domain/api/health`
   - homepage loads and cards render.

## Nginx Notes

- Reverse proxies to `app:3000`
- Enables gzip compression
- Adds baseline security headers
- Includes WAF marker header (`X-Checkpoint-WAF`)
- Ready for TLS termination at Dokploy ingress

## Check Point WAF Infinity Next Nano

- Follow `waf/README.md`
- Keep nano credentials only in secret vars (not in git)

## Performance Considerations

- Static assets served via Express with cache headers
- Nginx compression enabled
- Frontend fetches content asynchronously