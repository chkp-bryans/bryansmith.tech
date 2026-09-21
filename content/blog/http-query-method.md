---
title: "HTTP got a new method: QUERY"
date: "2026-09-21"
excerpt: "RFC 10008 adds QUERY — safe and idempotent like GET, with a body like POST. Why it matters for APIs, caches, and WAFs."
tags: "HTTP, APIs, Security, WAF, Digital Workers"
cover: "/covers/http-query.svg"
---

HTTP just got its first new standard method since PATCH in 2010: **QUERY** ([RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html), June 2026).

For years we faked “read with a body.” The workarounds work until they don’t — caches, retries, and intermediaries all get the wrong idea about what the request means.

**QUERY is the missing middle.** Safe and idempotent like GET. Request body carries the query like POST. Servers can advertise formats with `Accept-Query`. Responses can be cached with a key that includes the request content (when implementations catch up).

### How we used to fake it

**GET — filters in the URL**

```http
GET /orders?status=open&customerId=42&from=2024-01-01&to=2026-09-01&tags=vip,retry&sort=-createdAt HTTP/1.1
```

Fine until the filter is nested JSON, a long list, or anything GraphQL-shaped. Then you hit URL length limits, spray details into access logs and `Referer` headers, and break caches that only key on the path.

**POST — “search” that looks like a write**

```http
POST /orders/search HTTP/1.1
Content-Type: application/json

{ "status": "open", "tags": ["vip", "retry"], "range": { "from": "2024-01-01", "to": "2026-09-01" } }
```

The body works. The semantics lie. Intermediaries assume POST changes state, so they won’t cache or auto-retry. Clients invent idempotency keys for something that was only ever a read. (People rarely use PUT for this — PUT means replace a resource — the common hacks are GET-with-a-monster-query-string and POST-as-search.)

**QUERY — the honest read-with-a-body**

```http
QUERY /orders HTTP/1.1
Content-Type: application/json
Accept-Query: application/json

{ "status": "open", "tags": ["vip", "retry"], "range": { "from": "2024-01-01", "to": "2026-09-01" } }
```

Same body as the POST hack, GET-like safety: safe, idempotent, retryable, and (when stacks catch up) cacheable using the request content as part of the cache key.

## Why security and edge folks should care

- **WAFs and gateways** that only allow GET/POST/PUT/PATCH/DELETE will need an allowlist update before QUERY works in production.
- **Logging**: the interesting filter moves out of the query string — good for privacy in access logs, bad if your SIEM only keyed on URL params.
- **Agents and automation**: teach digital workers that QUERY is a read. Don’t treat it like a mutating POST. Retry with backoff the same way you would a GET.

Adoption is early (frameworks and proxies are landing support; browser caching and HTML forms still lag). Treat it as additive — keep GET for simple lookups, use QUERY when the filter belongs in a body.

If you want the status-code side of the house, the practical map is still here: [HTTP Response Codes, Explained Like You Actually Use Them](/writings/http-response-codes).
