---
title: "HTTP got a new method: QUERY"
date: "2026-09-21"
excerpt: "RFC 10008 adds QUERY: safe and idempotent like GET, with a body like POST. Why it matters for APIs, caches, and WAFs."
tags: "HTTP, APIs, Security, WAF, Digital Workers"
cover: "/covers/http-query.png"
---

HTTP just got a new **IANA-registered general-purpose method on the standards track**, the first since PATCH in 2010: **QUERY** ([RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html), June 2026, Proposed Standard). Older WebDAV methods (SEARCH, PROPFIND, REPORT) were already safe and idempotent with a body; QUERY was chosen as the general-purpose name instead of extending those.

For years we faked “read with a body.” The workarounds work until they don’t. Caches, retries, and proxies in the middle all get the wrong idea about what the request means.

**QUERY is the missing middle.** It is safe and idempotent like GET, and the request body carries the query like POST.

In plain terms:

- **Safe** means the request is only asking for information. It should not create, change, or delete anything on the server.
- **Idempotent** means you can send the same request again and the result is the same as sending it once. A flaky network can retry without inventing a second order, a second payment, or a second write.

`Accept-Query` is the discovery header that tells clients which query formats (media types) the server accepts. Caching is written into the RFC (the cache key must include the request body), but shared caches, CDNs, and browsers will trail clients and servers while that support lands.

### How we used to fake it

**GET: filters in the URL**

```http
GET /orders?status=open&customerId=42&from=2024-01-01&to=2026-09-01&tags=vip,retry&sort=-createdAt HTTP/1.1
```

Fine until the filter is nested JSON, a long list, or anything GraphQL-shaped. Then you hit URL length limits, spray details into access logs and `Referer` headers, and break caches that only key on the path.

**POST: a “search” that looks like a write**

```http
POST /orders/search HTTP/1.1
Content-Type: application/json

{ "status": "open", "tags": ["vip", "retry"], "range": { "from": "2024-01-01", "to": "2026-09-01" } }
```

The body works. The meaning lies. Proxies and gateways assume POST changes something, so they will not cache it or auto-retry it. Clients invent special “only run this once” keys for something that was only ever a read. (People rarely use PUT for this. PUT means replace a resource. The common hacks are a huge GET query string and POST used as search.)

**QUERY: the honest read with a body**

```http
QUERY /orders HTTP/1.1
Content-Type: application/json
Accept-Query: application/json

{ "status": "open", "tags": ["vip", "retry"], "range": { "from": "2024-01-01", "to": "2026-09-01" } }
```

Same body as the POST hack, with GET-like safety: safe, idempotent, safe to retry, and cacheable per the RFC once implementations include the request content in the cache key (shared caches and CDNs will lag).

## Why security and edge folks should care

- **WAFs and gateways** that only allow GET/POST/PUT/PATCH/DELETE will need an allowlist update before QUERY works in production.
- **Logging**: the interesting filter moves out of the query string. That is better for privacy in access logs, and worse if your SIEM only looked at URL params.
- **Agents and automation**: teach digital workers that QUERY is a read. Do not treat it like a mutating POST. Retry with backoff the same way you would a GET.

Adoption is early (frameworks and proxies are landing support; browser caching and HTML forms still lag). Treat it as additive: keep GET for simple lookups, use QUERY when the filter belongs in a body.

If you want the status-code side of the house, the practical map is still here: [HTTP Response Codes, Explained Like You Actually Use Them](/writings/http-response-codes).
