# WAF Infinity Next Nano Integration (Dokploy)

This guide integrates Check Point Infinity Next Nano Agent with the Nginx service used by this stack.

## Prerequisites

1. Active Check Point Infinity Portal tenant.
2. Access to Dokploy project at `dokploy.csadocs.com`.
3. This repository deployed as a Docker Compose app.

## 1. Register and Create Nano Profile

1. Sign in to Check Point Infinity Portal.
2. Go to **Application Security** (or Infinity Next management area).
3. Create a **Nano Agent profile** for a web service.
4. Name service: `bryansmith-tech`.
5. Select protection mode (`Detect` for validation, then `Protect` for production).
6. Save profile.

## 2. Obtain Nano Credentials

From the Nano profile details, copy:

- `NANO_TENANT_ID`
- `NANO_PROFILE_TOKEN`

These values are sensitive secrets and must not be committed to git.

## 3. Configure Dokploy Secrets

In Dokploy:

1. Open your app.
2. Go to **Environment Variables / Secrets**.
3. Add:
   - `NANO_TENANT_ID`
   - `NANO_PROFILE_TOKEN`
   - `NANO_SERVICE_NAME=bryansmith-tech` (optional override)
   - `NANO_MODE=protect` (or `detect` for burn-in)
4. Redeploy the application.

## 4. Verify WAF Protection

1. Confirm `checkpoint-nano-agent` container is healthy in Dokploy.
2. Check traffic reaches app through Nginx.
3. Verify response includes `X-Checkpoint-WAF: Infinity-Next-Nano` header.
4. Generate benign test requests and confirm telemetry/events in Infinity Portal.
5. If in detect mode, review findings and tune before switching to protect mode.

## 5. Troubleshooting

- **Nano agent not starting**: verify tenant ID and profile token are valid and not truncated.
- **No traffic observed**: ensure agent runs with `network_mode: service:nginx` and nginx is receiving public traffic.
- **Portal shows offline**: confirm outbound connectivity from host to Check Point cloud endpoints.

## Reference Documentation

- https://sc1.checkpoint.com/documents/Infinity-Portal/WebAdminGuides/EN/Infinity-Portal-Admin-Guide/Topics-Infinity-Portal-Admin-Guide/Application-Security.htm
- https://sc1.checkpoint.com/documents/Infinity-Portal/WebAdminGuides/EN/Infinity-Portal-Admin-Guide/Topics-Infinity-Portal-Admin-Guide/Nano-Agents.htm