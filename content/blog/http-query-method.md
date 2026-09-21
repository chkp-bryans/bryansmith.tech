---
title: "HTTP got a new method: QUERY"
date: "2026-09-21"
excerpt: "RFC 10008 adds QUERY — safe and idempotent like GET, with a body like POST. Why it matters for APIs, caches, and WAFs."
tags: "HTTP, APIs, Security, WAF, Digital Workers"
cover: "/covers/http-query.svg"
---

HTTP just got its first new standard method since PATCH in 2010: **QUERY** ([RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html), June 2026).

For years we faked “read with a body” as POST. That works until it doesn’t: caches skip it, clients can’t safely retry it, and intermediaries assume it changes state. GET stays pure — but stuffing rich filters into the URL hits length limits, leaks into logs, and fights nested JSON.

**QUERY is the missing middle.** Safe and idempotent like GET. Request body carries the query like POST. Servers can advertise formats with `Accept-Query`. Responses can be cached with a key that includes the request content (when implementations catch up).

## Why security and edge folks should care

- **WAFs and gateways** that only allow GET/POST/PUT/PATCH/DELETE will need an allowlist update before QUERY works in production.
- **Logging**: the interesting filter moves out of the query string — good for privacy in access logs, bad if your SIEM only keyed on URL params.
- **Agents and automation**: teach digital workers that QUERY is a read. Don’t treat it like a mutating POST. Retry with backoff the same way you would a GET.

Adoption is early (frameworks and proxies are landing support; browser caching and HTML forms still lag). Treat it as additive — keep GET for simple lookups, use QUERY when the filter belongs in a body.

If you want the status-code side of the house, the practical map is still here: [HTTP Response Codes, Explained Like You Actually Use Them](/writings/http-response-codes).
