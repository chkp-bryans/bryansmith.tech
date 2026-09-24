---
title: "GitHub URL tricks worth stealing"
date: "2026-09-21"
excerpt: "Change one word in a GitHub URL and the repo draws itself, feeds your AI, opens in the browser editor, or grows docs and agent tools. Five swaps I actually use."
tags: "GitHub, Developer Tools, GitDiagram, Digital Workers"
cover: "/covers/github-url-tricks.png"
---

Notes from the edge of a problem.

Someone on Instagram put it simply: change one word in a GitHub URL and the whole codebase draws itself. That is not hype. A handful of public tools reuse the `owner/repo` path and do useful work if you swap the host (or press one key).

Here are the five I keep reaching for.

## 1. gitdiagram.com - draw the architecture

Take:

`https://github.com/chkp-bryans/bryansmith.tech`

Change `github` to `gitdiagram`:

`https://gitdiagram.com/chkp-bryans/bryansmith.tech`

You get an AI-built Mermaid map of the repo. Nodes link back to real files. I ran it on this site and wrote up the export here: [I swapped one word in my GitHub URL and got this site's architecture](/writings/gitdiagram-bryansmith-tech).

## 2. gitingest.com - feed the whole repo to an AI

Same path, different host:

`https://gitingest.com/chkp-bryans/bryansmith.tech`

Gitingest packs the tree into a prompt-friendly digest. Handy when you want a model to see structure without you hand-picking files.

## 3. Press `.` - VS Code in the browser

On any GitHub repo or file page, press the period key (`.`).

GitHub opens **github.dev**: VS Code in the browser, same repo, no local clone. Great for a quick read, a tiny edit, or showing someone a file without sharing your laptop.

## 4. deepwiki.com - docs when the README is thin

Swap to:

`https://deepwiki.com/chkp-bryans/bryansmith.tech`

DeepWiki builds a wiki-style tour from the repo. Useful when you land on a project with sharp code and soft documentation.

## 5. gitmcp.io - let an agent query the repo live

Swap to:

`https://gitmcp.io/chkp-bryans/bryansmith.tech`

GitMCP exposes the repo in a way coding agents can query. Pair it with whatever agent you already trust; it is another way to stop pasting file trees by hand.

## Quick reference

| Goal | Swap or action |
|------|----------------|
| Architecture diagram | `github.com` → `gitdiagram.com` |
| Prompt-ready repo digest | `github.com` → `gitingest.com` |
| Browser VS Code | Press `.` on GitHub |
| Auto wiki / docs | `github.com` → `deepwiki.com` |
| Agent-queryable repo | `github.com` → `gitmcp.io` |

None of these replace reading the code. They shrink the time between "what is this repo?" and "I know where to look."

If you only try one, start with GitDiagram on a repo you already know, then compare the drawing to reality. That is how I ended up with the [bryansmith.tech architecture post](/writings/gitdiagram-bryansmith-tech).
