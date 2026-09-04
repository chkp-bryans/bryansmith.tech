# Deployment Guide for Dokploy (`dokploy.csadocs.com`)

Runbook for deploying **bryansmith.tech** as it runs **live today**: a single Node/Express `app` container on Dokploy, with TLS at Dokploy ingress to port 3000.

**Live site:** https://bryansmith.tech

> **Not in the critical path:** nginx and Check Point Infinity Next Nano. Folders `nginx/` and `waf/` are optional/future reference only.

## 1. Pre-deployment Checklist

1. Ensure branch contains:
   - `Dockerfile`
   - `docker-compose.yml` (app-only service)
2. Confirm secrets/env:
   - `GITHUB_TOKEN` — **optional** (recommended for GitHub API rate limits)
   - `NANO_*` — **not required** for the current stack
3. DNS for `bryansmith.tech` should point to the Dokploy host.

## 2. Create / Configure App in Dokploy

1. Sign in to `dokploy.csadocs.com`.
2. Select project/workspace.
3. Create or open the application for this site (Docker Compose type is typical).
4. Set app name (example: `bryansmith-tech`).

## 3. Connect Repository

1. Choose Git provider integration in Dokploy.
2. Connect the repository containing this project.
3. Select the branch to deploy (usually `main` for production).
4. Set compose file path to `docker-compose.yml`.
5. Enable auto-deploy on push if desired.

## 4. Configure Environment Variables

In Dokploy app settings, add:

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | Optional | Higher GitHub API limits / richer showcase metadata. |
| `NODE_ENV` | Optional | Defaults to `production` in compose. |
| `PORT` | Optional | Defaults to `3000` for the app container. |

Do **not** require `NANO_TENANT_ID`, `NANO_PROFILE_TOKEN`, or other `NANO_*` values for the live app-only stack.

## 5. Domain and SSL/TLS Setup

1. Open Dokploy domain settings for the app.
2. Add domain: `bryansmith.tech` (and optionally `www.bryansmith.tech`).
3. Enable HTTPS certificate provisioning (Let's Encrypt or your cert source).
4. Point Dokploy ingress / routing at the **`app` service port 3000**.
5. Force HTTPS redirection at Dokploy ingress.
6. Verify certificate is active and auto-renew is enabled.

TLS terminates at Dokploy; the container speaks HTTP on 3000.

## 6. Ports and Health Checks

Configured in `docker-compose.yml` (live shape):

- **Published / routed:** Dokploy → `app:3000`
- **Health check:** `GET /api/health` on the app container

There is **no** nginx service and **no** Nano agent service in the live compose path.

### Recommended follow-up: Alpine `wget` healthcheck

The runtime image is `node:20-alpine`, which typically has **no `wget`**. Compose currently uses a `wget`-based healthcheck. If the UI shows the container unhealthy while `https://bryansmith.tech/api/health` works, update the healthcheck to use Node `fetch` (or another tool present in the image). Treat this as a small follow-up; it is not a reason to rewrite compose heavily for this docs change.

## 7. Deploy

1. Trigger **Deploy** from Dokploy UI.
2. Watch build and startup logs until the `app` container is up.
3. Validate:
   - `https://bryansmith.tech/`
   - `https://bryansmith.tech/api/health`

## 8. Monitoring, Logs, and Operations

### View logs

1. Open the app in Dokploy.
2. Open **Logs**.
3. Inspect the **`app`** service logs.

### Restart

- Use Dokploy **Restart** for the application.
- Targeted restart applies to the single `app` container.

### Scale

- The app is stateless; scale `app` replicas only if Dokploy/compose supports it for this project.
- No nginx sticky-session concerns in the current architecture.

## 9. Troubleshooting

### Build fails during dependency install

- Check lockfile consistency.
- Re-run deploy after clearing Dokploy build cache.

### App unhealthy in Dokploy / healthcheck failing

- Confirm `/api/health` responds inside the container and via the public URL.
- If public health works but the compose healthcheck fails, see the Alpine `wget` caveat in section 6.

### Site loads but no GitHub showcase data

- Add/verify optional `GITHUB_TOKEN` in Dokploy env.
- Confirm repos in `config/showcase.json` are valid/public (or token has access).

### TLS / domain issues

- Verify DNS points to the Dokploy public IP.
- Ensure certificate issuance succeeded and ingress targets port **3000**.

### nginx / WAF questions

- Not part of the live path. See `nginx/` and `waf/` only if you plan a future multi-service stack.

## 10. Production Readiness Checklist (current stack)

- [x] Single `app` container on Dokploy
- [x] HTTPS/TLS at Dokploy ingress → port 3000
- [x] App health endpoint at `/api/health`
- [x] Secrets/env externalized in Dokploy (`GITHUB_TOKEN` optional)
- [x] nginx / Nano documented as optional future only
- [ ] (Follow-up) Alpine-safe healthcheck if `wget` causes false unhealthy
