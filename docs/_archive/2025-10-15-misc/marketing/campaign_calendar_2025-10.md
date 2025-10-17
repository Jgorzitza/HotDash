---
epoch: 2025.10.E1
doc: docs/marketing/campaign_calendar_2025-10.md
owner: marketing
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-31
---

# Operator Control Center — October Campaign Calendar & KPI Targets

## Overview

Plans marketing touchpoints leading into production launch. Aligns distribution with launch comms packet (`docs/marketing/launch_comms_packet.md`) and metrics guardrails from direction (`docs/directions/marketing.md`). KPIs feed dashboard telemetry (activation, retention) and weekly post-launch readouts.

## Security Incident Status — 2025-10-10

- Git history scrub completed (`af1d9f1` force-push logged 2025-10-10 08:12 UTC); all teams reset to sanitized head (`feedback/manager.md`, `feedback/marketing.md`).
- Product + reliability validated existing Supabase credentials at 2025-10-10 16:00 UTC. QA evidence for `?mock=0` remains outstanding (HTTP 410) **and the Chatwoot Fly embed token is still pending**; hold all external sends until both gates are green (200 + <300 ms synthetic run **and** embed token delivery).
- Campaign milestones stay in planning mode. Reference the updated messaging (Operator Inbox + OpenAI/LlamaIndex) in `docs/marketing/launch_comms_packet.md` while we wait on QA + embed token clearance.

## Week of 2025-10-07 (Pre-Launch Alignment)

| Date   | Channel                        | Audience                 | Purpose                                            | KPI Target                   | Owner                       | Notes                                                                                                                     |
| ------ | ------------------------------ | ------------------------ | -------------------------------------------------- | ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Oct 8  | #occ-launch (internal channel) | Internal GTM             | Share approval summary + final copy to engineering | 100% teams acknowledge       | Marketing                   | Include security status (git scrub complete, credentials pending) + link to `product_approval_packet` and tooltip handoff |
| Oct 9  | Email (beta partners)          | Riley Chen, Morgan Patel | Confirm staging walkthrough agenda + logistics     | 100% attendance confirmation | Product (marketing support) | **Hold send pending QA evidence + Chatwoot Fly embed token**; draft updated with Operator Inbox + OpenAI copy             |
| Oct 10 | Support Sync (internal)        | Support + Marketing      | Align on FAQ + training proposal                   | Sign-off on FAQ              | Marketing + Support         | Prep invite list per training proposal                                                                                    |

## Week of 2025-10-14 (Launch Prep)

| Date   | Channel                         | Audience                       | Purpose                                  | KPI Target                              | Owner                            | Notes                                                                                                                      |
| ------ | ------------------------------- | ------------------------------ | ---------------------------------------- | --------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Oct 15 | Support Training (primary slot) | Support, Product, Localization | Operator Control Center training session | Attendance ≥90%; post-session CSAT ≥4/5 | Support (Marketing facilitation) | Keep QA/embed-token hold in deck; highlight Operator Inbox + OpenAI messaging and Chatwoot Fly migration checklist         |
| Oct 16 | Social Teaser (LinkedIn)        | Public                         | Build anticipation for OCC launch        | CTR ≥4%; engagement ≥5%                 | Marketing                        | **Hold** pending QA evidence + embed token; teaser copy now references Operator Inbox + OpenAI/LlamaIndex                  |
| Oct 17 | Blog Draft handoff              | Partner Portal reviewers       | Secure portal approval window            | Approval within 2 business days         | Marketing                        | **Hold submission** until QA evidence + embed token clear; draft updated with Operator Inbox + OpenAI/LlamaIndex messaging |

## Launch Week (Tentative 2025-10-21)

| Date           | Channel                         | Audience                        | Purpose                   | KPI Target                                     | Owner                    | Notes                                                                                                                                     |
| -------------- | ------------------------------- | ------------------------------- | ------------------------- | ---------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Launch Day     | In-app banner                   | Merchants (active app installs) | Drive OCC adoption        | CTR ≥15%; activation ≥70%                      | Engineering + Marketing  | **Hold** until QA evidence + embed token clear; banner copy updated with Operator Inbox + OpenAI insights                                 |
| Launch Day     | Email (GA)                      | Merchants (install base)        | Announce OCC availability | Open ≥35%; CTR ≥12%                            | Marketing                | **Hold** pending QA evidence + embed token; ESP draft includes Operator Inbox + OpenAI messaging and inbox badge CTA                      |
| Launch Day     | Blog Post                       | Public + partners               | Tell product story        | 1,000 visits in 7 days; avg time on page ≥2:00 | Marketing                | **Hold**; intro updated with Operator Inbox + LlamaIndex context and Chatwoot Fly migration note; publish after QA + embed token sign-off |
| Launch Day     | Social Posts (LinkedIn/Twitter) | Public                          | Amplify hero message      | Engagement ≥5%; share ≥25 total                | Marketing                | **Hold**; planned captions highlight Operator Inbox + OpenAI/LlamaIndex stack and Chatwoot Fly migration                                  |
| Launch +3 days | Operator telemetry snapshot     | Internal leadership             | Report early adoption     | Activation ≥70%; SLA median ≤60m               | Data (Marketing support) | Pull metrics from Ops Pulse tile                                                                                                          |

## Post-Launch Follow-Up (Weeks of 2025-10-28 & 2025-11-04)

| Date   | Channel                 | Audience                     | Purpose                       | KPI Target                      | Owner               | Notes                                            |
| ------ | ----------------------- | ---------------------------- | ----------------------------- | ------------------------------- | ------------------- | ------------------------------------------------ |
| Oct 29 | Customer Story outreach | Beta merchants               | Capture testimonials          | 2 operator testimonials secured | Marketing + Product | Feed into roadmap decisions                      |
| Nov 1  | Feature Usage Digest    | Internal teams               | Share key metrics + learnings | Deliver digest by EOD           | Marketing           | Use telemetry + support insights                 |
| Nov 5  | Social Sentiment Update | Internal (Product/Marketing) | Share Phase 2 readiness       | Decision on vendor              | Marketing           | Reference `social_sentiment_integration_plan.md` |

## KPI Summary

| Metric                     | Target                        | Measurement Source                             |
| -------------------------- | ----------------------------- | ---------------------------------------------- |
| Email open rate (GA)       | ≥35%                          | Email platform analytics                       |
| Email CTR (GA)             | ≥12%                          | Email platform analytics                       |
| In-app banner CTR          | ≥15%                          | Dashboard telemetry (`dashboard.banner.click`) |
| Support training CSAT      | ≥4/5                          | Post-session survey                            |
| Blog traffic (7 days)      | ≥1,000 visits                 | Google Analytics                               |
| Social engagement          | ≥5% (LinkedIn), ≥3% (Twitter) | Native platform dashboards                     |
| Operator activation rate   | ≥70% within 7 days            | Ops Pulse tile telemetry                       |
| SLA median resolution time | ≤60 minutes                   | CX tile telemetry                              |

## Next Steps

- Update dates once production launch window confirmed by product.
- Keep clearance timestamp (2025-10-10 16:00 UTC) in all asset approvals; attach QA evidence immediately after mock=0 passes.
- Add campaign artifacts (email drafts, social copy) as soon as localization sign-off completes; include Operator Inbox + OpenAI messaging plus QA/embed-token hold note in each approval packet.
- Draft alternate launch variants and testimonial snippets now (see `docs/marketing/launch_comms_packet.md` supporting materials) so assets can swap immediately post-clearance; coordinate testimonial outreach with product once staging walkthrough feedback lands.
- Review KPI performance weekly and log deltas in `feedback/marketing.md` with evidence links.
