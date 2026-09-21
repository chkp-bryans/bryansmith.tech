---
title: "When the automation quits, someone still has to fly"
date: "2026-09-18"
excerpt: "Security Now pointed me at Richard Mitchell’s IEEE Spectrum essay on the automation paradox — and why deliberate practice still matters when AI is flying the plane."
tags: "AI, Engineering, Automation, Skills, Safety"
cover: "/covers/automation-fly.svg"
---

Security Now pointed me at a recent IEEE Spectrum essay by Richard Mitchell, a systems engineer who’s spent decades on jet-engine and nuclear control software. The hook is uncomfortable if you live in AI-assisted work the way a lot of us do now: the more the machine handles day-to-day, the less practice humans get — until the machine hands the problem back on the worst possible day.

Mitchell calls that the automation paradox. Aviation already paid for the lesson. Air France 447 went into the Atlantic in 2009 after iced pitot tubes made the autopilot disconnect. The airplane was recoverable. The crew, conditioned by years of watching automation fly, could not hand-fly out of a high-altitude stall. The failure wasn’t exotic hardware. It was skill that had quietly atrophied.

Nuclear control rooms learned a similar instinct. Mitchell describes deliberately leaving manual steps in sequences a plant could have run alone — inefficient on purpose — so operators stayed current. Aviation’s answer looked the same: the FAA’s 2017 alert on manual flight proficiency, and airlines that encourage hand-flying climbs and descents in calm weather so the crew’s hands don’t go cold.

His design pattern for the AI era is the “manual gate”: a point in the workflow where a human takes the controls not because it’s fastest, but because that skill must stay warm. On a software team that might mean a junior engineer reproduces a critical bug and writes the failing test with the AI off, then compares their diagnosis to the model’s. Disagreement before the outage is the design working.

I’m not anti-AI. I use coding agents every week. The point is that some “inefficient” junior work isn’t waste — it’s how you still have someone who knows how to fly when the autopilot bails. Deliberate inefficiency as insurance isn’t a new idea in safety-critical engineering. We’re about to need it in everyday engineering too.

Source: [Protecting Engineers' Skills in the AI Era](https://spectrum.ieee.org/ai-engineer-skills) (IEEE Spectrum / Richard Mitchell)
