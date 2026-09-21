---
title: "HTTP got a new method: QUERY"
date: "2026-09-21"
excerpt: "The web has a new way to ask for data with a detailed filter. What QUERY is, why it exists, and why security teams should care."
tags: "HTTP, APIs, Security, WAF, Digital Workers"
cover: "/covers/http-query.png"
---

The web already has a small set of **methods** (also called verbs). A method is the word that tells a server what kind of action you want: read something, create something, update something, and so on.

Common ones you may already know:

- **GET:** “please read this.” Filters usually go in the web address (the URL).
- **POST:** “please accept this data.” Often used to create or change something. The details go in the **request body**, which is the payload that rides with the request instead of sitting in the address bar.
- **PUT / PATCH / DELETE:** change or remove something.

In June 2026, the internet standards process published **RFC 10008**. An **RFC** is a formal technical document. This one adds a new method called **QUERY**. It is a **Proposed Standard**, which means it is the official method, but not yet the highest maturity label in the standards process.

## The problem in plain English

Apps often need to **look something up** with a complicated filter. Example: “open orders for this customer, these tags, this date range.”

For a long time the options were awkward:

1. **Cram the filter into the URL and use GET.** Fine for short, simple filters. Falls apart when the filter is long or nested (layered). Those details also show up in server logs.
2. **Put the filter in the request body, but use POST.** The body works. The method name is misleading. Systems sitting in the middle (proxies, gateways, caches) often assume POST might create or change data, so they will not cache the answer or safely retry the request if the network blips.

Neither option clearly says: “I am only asking a question.”

## What QUERY does

**QUERY means: ask a question, and put the filter details in the request body.**

Think of it like a careful search form, not a “save” or “delete.”

Two properties matter here. We define them before we lean on them:

- **Safe:** the request should only read. It should not create, change, or delete data on the server.
- **Idempotent:** if the network glitches and you send the same request twice, you get the same result as sending it once. No accidental second order, second payment, or second write.

So QUERY is safe and idempotent like GET, but it can carry a rich filter in the body like POST.

A few related terms, defined once:

- **Cache:** a store that remembers a previous answer so the next identical ask can be faster.
- **CDN (content delivery network):** a network of caches around the world that sit in front of many websites.
- **Allowlist:** an explicit list of what is permitted. Everything else is blocked.

Servers can advertise which filter formats they understand with a header named `Accept-Query` (a short label sent with the request or response). Caching QUERY answers is allowed in the RFC, but many caches and CDNs are still catching up, because the cache key must include the body, not just the URL.

Older specialty methods from **WebDAV** (an older set of web extensions for files and folders), such as SEARCH, already allowed “safe read with a body.” QUERY is the general-purpose name for everyday APIs.

## Quick picture

- **Old approach (GET):** long URL full of filters
- **Old approach (POST):** body looks like a search, but the method sounds like a change
- **QUERY:** body holds the filter, method means “read”

## Why security and edge folks should care

- A **WAF (web application firewall)** or API gateway that only allows the usual methods may block QUERY until you add it to the allowlist.
- **Logs:** the interesting filter moves out of the URL. That is better for privacy in access logs, and worse if your monitoring only watched URL parameters.
- **Automation and AI agents:** teach them QUERY is a read. Retry it like a GET, not like a risky POST.

Adoption is early. Keep simple lookups on GET. Use QUERY when the filter belongs in the body.

If you want the status-code side of the house: [HTTP Response Codes, Explained Like You Actually Use Them](/writings/http-response-codes).
