# Deployment Guide for Dokploy (`dokploy.csadocs.com`)

This document provides a complete deployment runbook for `bryansmith.tech` using the repository's Docker Compose stack.

## 1. Pre-deployment Checklist

1. Ensure branch contains:
   - `Dockerfile`
   - `docker-compose.yml`
   - `nginx/default.conf`
2. Confirm secrets available:
   - `GITHUB_TOKEN` (recommended)
   - `NANO_TENANT_ID` (required for WAF)
   - `NANO_PROFILE_TOKEN` (required for WAF)
3. DNS for `bryansmith.tech` should point to Dokploy host.

## 2. Create Docker Compose App in Dokploy

1. Sign in to `dokploy.csadocs.com`.
2. Select project/workspace.
3. Click **Create Application**.
4. Choose **Docker Compose** type.
5. Set app name (example: `bryansmith-tech`).

## 3. Connect Repository

1. Choose Git provider integration in Dokploy.
2. Connect repository containing this project.
3. Select branch to deploy (feature or main release branch).
4. Set compose file path to `docker-compose.yml`.
5. Enable auto-deploy on push if desired.

## 4. Configure Environment Variables and Secrets

In Dokploy app settings, add:

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | Recommended | Prevents GitHub API rate limits and allows richer repo metadata. |
| `NANO_TENANT_ID` | Required for WAF | Check Point Infinity tenant identifier. |
| `NANO_PROFILE_TOKEN` | Required for WAF | Check Point Nano profile token used for registration. |
| `NANO_SERVICE_NAME` | Optional | Service name shown in Check Point portal (default `bryansmith-tech`). |
| `NANO_MODE` | Optional | `protect` or `detect`; start with `detect` during initial rollout if needed. |
| `NODE_ENV` | Optional | Defaults to `production`. |
| `PORT` | Optional | Defaults to `3000` for app container. |

## 5. Domain and SSL/TLS Setup

1. Open Dokploy domain settings for app.
2. Add domain: `bryansmith.tech` (and optionally `www.bryansmith.tech`).
3. Enable HTTPS certificate provisioning (Let's Encrypt or your cert source).
4. Force HTTPS redirection at Dokploy ingress/load balancer.
5. Verify certificate is active and auto-renew is enabled.

## 6. Ports and Health Checks

Configured in `docker-compose.yml`:

- Nginx published ports: `80`, `443`
- App service internal port: `3000` (not directly public)
- Health checks:
  - app: `GET /api/health`
  - nginx: `GET /healthz`

Dokploy should report both services healthy before routing full traffic.

## 7. Deploy

1. Trigger **Deploy** from Dokploy UI.
2. Watch build and startup logs until all containers are healthy.
3. Validate endpoints:
   - `https://bryansmith.tech/`
   - `https://bryansmith.tech/api/health`

## 8. Monitoring, Logs, and Operations

### View logs

1. Open app in Dokploy.
2. Open **Logs**.
3. Inspect logs by service (`app`, `nginx`, `checkpoint-nano-agent`).

### Restart services

- Use Dokploy **Restart** for full stack restart.
- For targeted restart, restart individual service container.

### Scale services

- For horizontal scale, increase replicas for `app` service (if Dokploy supports compose-scale settings) and keep Nginx as entrypoint.
- Ensure sticky-session is not required (stateless app).

## 9. Troubleshooting

### Build fails on npm install
- Check lockfile consistency.
- Re-run deploy after clearing Dokploy build cache.

### Nginx unhealthy
- Verify `nginx/default.conf` is mounted and valid.
- Confirm app service is healthy and reachable on `app:3000`.

### App healthy, but no GitHub data
- Add/verify `GITHUB_TOKEN` in Dokploy secrets.
- Confirm configured repos in `config/showcase.json` are valid.

### WAF agent unhealthy
- Re-check `NANO_TENANT_ID` and `NANO_PROFILE_TOKEN` values.
- Confirm outbound connectivity from host to Check Point endpoints.

### TLS issues
- Verify DNS points to Dokploy public IP.
- Ensure port 443 reachable and certificate issuance succeeded.

## 10. Production Readiness Checklist

- [x] Reverse proxy configured with security headers.
- [x] HTTP compression enabled.
- [x] App and proxy health checks configured.
- [x] Rate limiting configured for `/api/`.
- [x] Error response page configured for upstream failures.
- [x] HTTPS/TLS configured at Dokploy ingress.
- [x] WAF nano-agent integrated and documented.
- [x] Secrets externalized in Dokploy.
