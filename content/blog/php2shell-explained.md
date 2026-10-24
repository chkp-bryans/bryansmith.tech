---
title: "PHP2Shell, Explained for People Who Just Want Their Website to Keep Working"
date: "2026-10-23"
excerpt: "A plain-language guide to the PHP2Shell security flaws, what they mean for your WordPress or small business site, and the few questions to ask your web host this week."
tags: "Security, Web, PHP, WordPress"
cover: "/covers/php2shell.png"
---

*A plain-language guide to the PHP2Shell security flaws, what they mean for your WordPress or small business site, and the few questions to ask your web host this week.*

> **Disclosure:** I work at Check Point. This is my personal blog, and the views here are my own. Everything in this post comes from public sources, which are listed at the bottom.

When the NSA (the U.S. National Security Agency) and the FBI both tell organizations to fix something right away or *take their systems offline* until they can, I pay attention. That's what happened on October 21, 2026, and the "something" is a pair of security flaws nicknamed PHP2Shell.

If you run a WordPress site, an online store, or a website for your club or small business, this probably affects you. The good news: the fix exists, and for most of you it comes down to one question for your web host.

## First, what is PHP?

PHP (the name officially stands for "PHP: Hypertext Preprocessor") is a programming language. It runs on web servers, the computers that store your website and send pages to visitors. When someone loads your site, PHP is often what assembles the page behind the scenes: pulling your latest post, showing products, handling the contact form.

It's everywhere. The web survey firm W3Techs reports that PHP is used by about 69% of the websites whose server-side language it can identify. WordPress, which is built on PHP, runs roughly 40% of all websites by the same survey. Drupal, Joomla, and Magento (other popular site builders) also run on PHP, as do many hosting control panels like cPanel and Plesk.

Think of PHP as the engine in your car. You picked the car (WordPress), you picked the paint and accessories (your theme and plugins), but the same engine model sits under the hood of a huge number of other cars on the road. If that engine model has a defect, it doesn't matter how nice your paint job is.

## What do these flaws let attackers do?

A quick bit of vocabulary first:

- A **vulnerability** is a weakness in software that an attacker can take advantage of.
- A **CVE** (Common Vulnerabilities and Exposures) is a public ID number given to a specific vulnerability, so everyone can talk about the same problem. These two are CVE-2026-109618 and CVE-2026-109619.
- **RCE** (remote code execution) means an attacker, from anywhere on the internet, can make your server run their own instructions.
- **Unauthenticated** means they don't need a username or password to do it.

Put those together and you get the scary part. According to the official PHP advisory, both flaws can allow unauthenticated remote code execution. In plain words: someone who has never logged into your site could send it specially crafted web traffic and potentially take control of the server. The NSA says that kind of access could help attackers steal sensitive data, disrupt services, or move deeper into a network.

At a high level, the problems live in two parts of PHP that almost every web request touches: how PHP manages memory, and how it cleans up after errors. Under the wrong conditions, PHP can end up trusting leftover or half-finished data in memory, and an attacker can abuse that.

Both are rated 9.2 out of 10 on CVSS (the Common Vulnerability Scoring System, a standard severity scale).

## Who's affected?

The PHP project says the risk applies to all PHP installations serving web requests. The NSA put it bluntly: these are flaws in PHP itself, not in your website or its settings.

That point matters, because it means **updating WordPress or your plugins does not fix this.** The PHP engine on the server has to be updated.

The timing made things worse. The PHP Foundation (the nonprofit that supports PHP development) says the CVE numbers leaked online on October 20, so the PHP team moved the fix up by a day.

How much attacker activity are we seeing? [Check Point Research reports](https://blog.checkpoint.com/ai-security/php2shell-one-in-ten-organizations-impacted-as-europe-bears-the-brunt/) that about 10% of organizations worldwide, and 14% in Europe, have seen exploitation attempts since the disclosure. Their definition is worth repeating: "impacted" means someone *tried*, not that the attack succeeded. Singapore's Cyber Security Agency also says it is aware of widespread exploitation attempts. (For balance: CISA, the U.S. Cybersecurity and Infrastructure Security Agency, said in its October 21 alert that it had not yet observed exploitation at that time.)

## What should you actually do?

A **patch** is a software update that fixes a known problem. Here's your checklist:

**1. Find out what PHP version you're running.** In WordPress, go to *Tools > Site Health > Info* and open the *Server* section. You can also check your hosting control panel. If you don't see it, just ask your host.

**2. Make sure it's a fixed version.** The fixed releases are:

- PHP 8.2.35 or later
- PHP 8.3.36 or later
- PHP 8.4.27 or later
- PHP 8.5.12 or later

The full number matters. "PHP 8.3" by itself doesn't tell you anything; "8.3.36" does. If your control panel only shows the short version, ask your host.

**3. If you're on PHP 8.1 or older, treat it as urgent.** Those versions no longer get regular updates from the PHP project. Some hosts and Linux vendors provide their own fixes for older versions, so ask, but the real answer is to move to a supported version.

**4. If you use managed hosting, confirm, don't assume.** Many managed WordPress hosts update PHP for you, which is a big reason to use them. But "probably handled" isn't "handled." Send a short note: *"Is my site running a PHP version patched for CVE-2026-109618 and CVE-2026-109619? If not, when will it be?"*

**5. If you can't update yet, consider taking the site down temporarily.** That's the advice from the NSA, FBI, and CISA. A few days offline beats cleaning up a hacked server.

**6. Keep up your plugin hygiene.** Plugins won't fix PHP2Shell, but they matter in two ways. Old, abandoned plugins can break on newer PHP, which is a common reason sites get stuck on old versions. And patching doesn't remove anything an attacker already left behind. So update plugins and themes, delete the ones you don't use, and if you notice unfamiliar PHP files or strange outages, ask your host or a professional to look.

## Didn't we do this already with Log4Shell?

Sort of. In December 2021, a flaw nicknamed Log4Shell (CVE-2021-44228) turned up in Log4j, a widely used logging tool for software written in Java. It also allowed remote code execution, and it was painful because it was buried inside so many products that people didn't know they had it.

PHP2Shell rhymes with that: a shared building block under a huge amount of the internet, where the hard part is knowing where it's running. The upside for most of you is that you *know* you have a website, so you know who to ask.

## The takeaway

You don't need to understand memory management to stay safe here. You need to know three things: your site runs on an engine called PHP, that engine has a serious flaw, and the fix happens on the server, not inside WordPress.

So this week, check your PHP version or send your host that one email. Five minutes of effort, for a problem national security agencies are treating as an emergency.

If you're not sure where to start, reach out. I'm happy to help friends and family figure out what they're running.

---

## Sources

- PHP project, "Security advisory: Critical remote code execution vulnerabilities, update now" (Oct 21, 2026): https://www.php.net/archive/2026.php
- The PHP Foundation, "Today's PHP Security Release, and How We're Strengthening PHP Security" (Oct 21, 2026): https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/
- NSA, "NSA Advisory: Critical Patches Recommended for PHP Vulnerabilities" (Oct 21, 2026): https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4630238/nsa-advisory-critical-patches-recommended-for-php-vulnerabilities/
- CISA, "Critical Vulnerabilities in PHP Require Immediate Patching" (Oct 21, 2026): https://www.cisa.gov/news-events/alerts/2026/10/21/critical-vulnerabilities-php-require-immediate-patching
- FBI public statement (Facebook): https://www.facebook.com/FBI/posts/two-critical-vulnerabilities-have-been-identified-in-php-a-widely-used-programmi/1540010264839201/
- Cyber Security Agency of Singapore, "Critical Vulnerabilities in PHP (PHP2Shell)": https://www.csa.gov.sg/alerts-and-advisories/alerts/al-2026-151/
- ENISA and EU partners, "Joint statement on critical PHP vulnerabilities" (Oct 21, 2026): https://www.enisa.europa.eu/news/joint-statement-on-critical-php-vulnerabilities
- Check Point Research, "PHP2Shell Update: One in ten organizations impacted as Europe bears the brunt" (Oct 22, 2026): https://blog.checkpoint.com/ai-security/php2shell-one-in-ten-organizations-impacted-as-europe-bears-the-brunt/
- Check Point, "PHP2Shell: Log4Shell at AI Speed, A CISO's Perspective" (Oct 22, 2026): https://blog.checkpoint.com/ai-security/php2shell-log4shell-at-ai-speed-a-cisos-perspective/
- CNBC, "Why cybersecurity stocks are getting another big boost. They're key to the AI trade" (Oct 22, 2026): https://www.cnbc.com/2026/10/22/why-cybersecurity-stocks-are-getting-another-big-boost-theyre-key-to-the-ai-trade.html
- W3Techs, PHP usage statistics (Oct 2026): https://w3techs.com/technologies/details/pl-php
- W3Techs, WordPress usage statistics (Oct 2026): https://w3techs.com/technologies/details/cm-wordpress
- NIST National Vulnerability Database, CVE-2021-44228 (Log4Shell): https://nvd.nist.gov/vuln/detail/CVE-2021-44228
