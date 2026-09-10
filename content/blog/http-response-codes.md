---
title: "HTTP Response Codes, Explained Like You Actually Use Them"
date: "2026-09-09"
excerpt: "A practical map of HTTP status codes—families, WAF/edge quirks, performance, and how AI agents waste tokens when they ignore them."
tags: "HTTP, WAF, Security, APIs, Digital Workers"
---

Every request gets a three-digit answer. That number tells you whether to celebrate, fix your call, wait, or page someone. Learn the families once; the rest is pattern matching.

![HTTP status codes cheat sheet](/http-status-codes-cheatsheet.png)

---

## The five families

| Range | Meaning | What to do |
|-------|---------|------------|
| **1xx** | Still working | Rare day to day |
| **2xx** | Success | Parse the body (if any) |
| **3xx** | Redirect / cache | Follow or use cache |
| **4xx** | *Your* request | Fix URL, auth, payload, rate |
| **5xx** | *Their* service | Check origin, retry carefully |

**Cheat sheet:** `4xx` = caller. `5xx` = service. Mixing those up wastes the afternoon.

---

## Codes you will actually see

**2xx — Success**  
`200` OK · `201` created (check `Location`) · `202` accepted, not finished · `204` success with no body.

**3xx — Move along**  
`301` permanent · `302`/`307` temporary (`307` keeps POST) · `304` cache still good. Treat redirect targets as untrusted (open-redirect risk).

**4xx — Fix the call**  
`400` bad payload · `401` not authenticated · `403` authenticated but denied · `404` missing (sometimes used to hide existence) · `409` conflict · `429` rate limited—honor `Retry-After`.

**5xx — Fix or wait on the service**  
`500` bug/deploy · `502` bad upstream · `503` unavailable · `504` gateway timeout. Prefer jittered backoff on `502`/`503`/`504`; investigate most `500`s instead of hammering.

---

## WAFs and security products

A WAF, bot manager, or Zero Trust proxy often answers *before* your app:

- Edge **`403` / challenge / `429`** → policy or abuse control, not necessarily an app bug  
- Edge **`502` / `504`** → origin unreachable or slow (DNS, TLS, health, timeout)  
- App **`401`/`403`** after SSO changes → identity/scope, not “the site is down”

Capture **both** the edge request id and the app’s `x-request-id`. Prefer honest denies (`403`, `401`, `429`) over fake `200` “Access Denied” HTML that breaks APIs and agents.

When you need a before/after picture of headers, DNS, CDN/WAF fingerprints, and timing—not a full attack test—use **[Website Detective](https://github.com/chkp-bryans/web-detective)** (passive recon; pairs with [WAFBuddy](https://wafbuddy.csadocs.com) when the question is browser-path behavior like cache, `403`/`429`, or login).

---

## Performance (quick)

- Early edge deny is usually cheaper than junk hitting the origin.  
- Retry storms on `502`/`503` make outages worse—cap retries, add jitter.  
- Redirect chains and challenge pages add RTTs.  
- Keep API errors small: status + short code + request id.

---

## AI agents and token cost (accurate)

Status codes are not priced in tokens. Models bill when they **read/write text**. You burn money when agents:

1. Blind-retry the same fat prompt after `401`/`403`/`404`  
2. Paste a huge WAF HTML block page into context  
3. Keep tool-looping through `429`/`503` with no backoff  

Teach workers to branch on the code, honor `Retry-After`, and pass the model a one-line error—not a 50 KB stack page.

---

## 30-second triage

1. Note method, URL, and status.  
2. `4xx` → request/auth. `5xx` → service/path.  
3. Grab correlation ids (edge + app).  
4. Retry only when safe (idempotent GET; POST needs an idempotency key).  
5. Return honest codes from *your* APIs—clients and digital workers learn from you.

---
