---
title: "LLMs generate. Decision models choose."
date: "2026-10-01"
excerpt: "Most of the AI you have used is built to talk. A lot of software does not need a paragraph. It needs a decision."
tags: "AI, LLMs, Digital Workers, Automation, Decision Models"
cover: "/covers/llms-decision.png"
---

Most of the AI you have used is built to talk.

You ask a question. A large language model (LLM), the kind of system behind ChatGPT or Claude, writes you a paragraph. That is useful when you need words: an email, a summary, a draft reply to a customer.

A lot of software does not need a paragraph. It needs a decision.

## The support ticket example

Imagine this ticket lands in your queue:

> I was charged twice and I need this fixed right now.

Your app does not need a polite essay. It needs three answers it can act on:

- Which team? Billing.
- Is it urgent? Yes.
- Should a human step in? Yes.

If you send that ticket to a normal chatbot, you get prose. Then your code has to dig the real answers back out of the text. That is slow, expensive at volume, and easy to get wrong when the wording drifts.

## What Jev is aiming at

Jev is a new model from TypeSafe AI. TypeSafe calls it a System One model: software built to make calibrated decisions inside an application, not to chat with a person.

You give it the situation and the allowed answers. It picks one and returns a score for how sure it is. Think multiple choice, not essay.

People are already pointing it at jobs like:

- routing support tickets
- choosing an AI agent's next tool
- blocking risky commands
- filtering documents before a bigger LLM sees them

TypeSafe's own benchmarks claim big speed and cost wins on those narrow decision workflows. Treat those numbers as vendor claims until you measure them on your own traffic.

Jev will still pick the wrong option sometimes. The useful part is that it tells you how confident it was, so your code can auto-act on high confidence and escalate the fuzzy cases.

## How this maps to digital workers

This is the part that matters if you are building digital assistants and digital workers for real workflows.

Generation and decision are different jobs.

- Use an LLM when a person (or another system) needs language: write the reply, summarize the thread, explain the change.
- Use a decision layer when the options are already known and your code just needs to choose: route, score, allow or deny, pick the next tool.

You can stack them. A decision model routes the ticket. An LLM drafts the customer reply after the right team owns the context. That is closer to how good operators already think: triage first, then write.

## The line worth remembering

LLMs generate. Decision models choose.

ChatGPT and Claude are not going away. They are still the right tool when you need something written. The interesting shift is admitting that a huge share of automation is not "write me an answer." It is "pick from these options, and tell me how sure you are."

If you are designing digital workers, start by listing the decisions your system makes every day that already have a short menu of answers. Those are the places to stop asking a chat model to write an essay and start asking a decision model to choose.

---

Inspired by [rick.theengineer](https://www.instagram.com/reel/Ddm_kFQodJE/) on Instagram. Further reading: [TypeSafe AI](https://typesafe.ai/), [DEV: Will Jev Replace LLMs?](https://dev.to/vandnakapoor19/will-jev-replace-llms-a-support-ticket-routing-example-m2k).
