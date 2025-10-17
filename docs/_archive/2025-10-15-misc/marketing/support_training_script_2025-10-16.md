---
epoch: 2025.10.E1
doc: docs/marketing/support_training_script_2025-10-16.md
owner: marketing
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-18
---

# Operator Control Center - Support Training Script (Dry Run 2025-10-16)

## Session Overview

- **Audience:** Support agents, enablement, marketing, product liaison
- **Duration:** 90 minutes (aligns with primary slot in `docs/marketing/support_training_session_proposal_2025-10-07.md`)
- **Objective:** Equip support to demo the Operator Control Center, answer top questions, and escalate blockers before GA.
- **Materials:** Launch FAQ (`docs/marketing/launch_faq.md`), brand tone deck (`docs/marketing/brand_tone_deck.md`), staging credentials (product to supply), dashboard walkthrough slides (Designer <-> Marketing deck), staging evidence table in `docs/enablement/dry_run_training_materials.md`
- **Staging status note:** If `https://hotdash-staging.fly.dev/app?mock=0` continues returning HTTP 410, rehearse with mock mode (`?mock=1`) and reference the enablement facilitator script until Reliability posts sustained 200 (<300 ms) evidence for staging.
- **Recordings:** Save Zoom recording + chat log to Support KB per SOP

## 0:00-0:05 - Welcome & Objectives

1. Welcome participants; confirm recording consent.
2. Display session goals slide:
   - Understand the OCC value prop (daily truth in one admin surface)
   - Practice the tile walkthrough + approval flows
   - Align on escalation paths and analytics talking points
3. Reinforce English-only launch scope; note that FR assets remain in review (`docs/marketing/translation_review_request_2025-10-07.md`).
4. Set parking lot expectations: capture unanswered questions in shared doc (`docs/runbooks/operator_training_qa_template.md`).

## 0:05-0:20 - Dashboard Orientation

1. Share screen (staging dashboard at `https://hotdash-staging.fly.dev/app`) and highlight navbar path: Shopify Admin -> Apps -> HotDash -> Operator Control Center.
   - If live smoke remains 410, load `?mock=1` for demo purposes and call out the pending QA checklist; cite the latest curl log (`artifacts/integrations/shopify/2025-10-10/curl_mock0_2025-10-10T07-57-48Z.log`) so attendees know rollout is queued.

- Note the Chatwoot Fly migration: Reliability will confirm Shopify Admin surfaces are validated via the Shopify CLI 3 dev flow (no embed/session token). Until QA evidence lands, external comms stay paused and rehearsals use the mock flow.

2. Review global elements:
   - Mock/live indicator (top right)
   - Decision audit trail link (footer)
   - Settings gear (tile thresholds + AI toggles)
3. Call out telemetry opt-out toggle (Settings -> Privacy) using copy from `docs/compliance/privacy_notice_updates.md`. Reinforce the new support inbox `customer.support@hotrodan.com` (now routed through Chatwoot Fly) as the primary escalation channel.
4. Pause for questions (2 minutes); log items in Q&A template.

## 0:20-0:40 - Tile Deep Dives

### CX Escalations (0:20-0:28)

- Narrate SLA breach card, AI reply suggestion, approval flow.
- Emphasize manual approval requirement; reference DPIA (`docs/compliance/dpia_chatwoot_openai.md`).
- Demo toggle to disable AI suggestions and show resulting UI change.

### Sales Pulse (0:28-0:34)

- Highlight today vs. 7-day average metric and fulfillment blockers.
- Show click-through to order detail modal (per `docs/design/wireframes/dashboard_wireframes.md`).
- Discuss KPI expectation: >70% of merchants open tile daily (ties to `docs/marketing/campaign_calendar_2025-10.md`).

### Inventory Heatmap (0:34-0:40)

- Walk through low-stock alert, days-of-cover definition, reorder recommendation.
- Mention tooltip copy alignment with `docs/marketing/tooltip_copy_handoff_2025-10-07.md` and pending placement annotations (design due 2025-10-08 @ 12:00 ET).
- Explain escalation path if recommendations look incorrect (loop reliability via support escalation SOP).

## 0:40-0:55 - Workflow Practice (Breakouts optional)

1. Split into pairs (if >6 attendees). Provide scenario cards (Appendix A below).
2. Each pair rehearses explaining a tile + handling objection:
   - Example objection: "Can I trust AI replies?" -> Use FAQ answer referencing audit trail and manual approval.
3. 5-minute report-out with key takeaways per pair.

## 0:55-1:10 - Support Playbook & FAQ Alignment

1. Open `docs/marketing/launch_faq.md`; highlight sections by priority (Access, Integrations, AI & Automation).
2. Map each FAQ item to escalation owner (Marketing/Product/Reliability). Use table in Appendix B.
3. Call out analytics opt-out process and data retention timeline (per `docs/compliance/data_inventory.md`).
4. Reiterate messaging guardrails from brand tone deck (human, confident, never minimize risk).

## 1:10-1:20 - Enablement Logistics & Follow-Ups

1. Confirm dry run outputs: updated FAQ links, support macros, trimmed email templates.
2. Assign owners for outstanding tasks:
   - Product: Share final staging credentials + seeded conversations for CX tile.
   - Marketing: Update communications evidence once product signs off on English copy (`docs/marketing/product_approval_packet_2025-10-07.md`) and the QA gate closes.
   - Localization: Provide verdict on "Centre OCC" abbreviation by 2025-10-09 @ 18:00 ET.
   - Reliability: Deliver sustained mock=0 200 (<300 ms) evidence and log in `feedback/reliability.md`.
3. Review launch-day comms timeline (teaser, banner go-live, FAQ publish) referencing `docs/marketing/campaign_calendar_2025-10.md`.
4. Schedule 24-hour post-launch support sync to collect real merchant feedback.

## 1:20-1:30 - Q&A + Wrap

1. Open floor for final questions; document unresolved items in Q&A template.
2. Share escalation contact list (support lead, marketing POC, reliability on-call).
3. Recap next steps and deadlines:
   - Support to confirm macro updates (including new inbox + Fly messaging) by 2025-10-12
   - Marketing to circulate meeting notes + recording within 24 hours once QA evidence lands
   - Manager to endorse readiness in `feedback/manager.md` after both gates are cleared
4. Thank attendees and stop recording.

---

## Appendix A - Scenario Cards (Use for Breakouts)

1. **Escalation Timeout:** Merchant asks why a ticket auto-escalated. Show SLA settings and audit trail.
2. **Inventory Spike:** Merchant sees sudden stockout warning. Guide them through reorder recommendation and mention manual override option.
3. **SEO Dip Skepticism:** Merchant questions data accuracy. Point to Google Analytics integration status and opt-out fallback copy.
4. **AI Reply Concern:** Merchant wants to disable AI suggestions. Demonstrate toggle and reassure about decision logging.

Each card references FAQ sections for quick answers; encourage agents to quote evidence links when responding.

## Appendix B - FAQ Ownership Map

| FAQ Section                 | Primary Owner | Escalation Path                      |
| --------------------------- | ------------- | ------------------------------------ |
| Access & Activation         | Support       | Product if access bug persists >1h   |
| Integrations & Data Sources | Product       | Reliability for sync failures        |
| AI & Automation             | Marketing     | Compliance if privacy concern raised |
| Configuration & Thresholds  | Product       | Engineering for configuration bugs   |
| Data & Security             | Compliance    | Legal for regulatory requests        |
| Telemetry & Success Metrics | Marketing     | Data team for metric discrepancies   |
| Troubleshooting             | Support       | Reliability for systemic outages     |

---

## Notes & Pending Inputs

- Designer to deliver tooltip placement annotations by 2025-10-08 @ 12:00 ET; integrate into walkthrough slides once received.
- Product to confirm production launch window (blocks final comms timing) - track in `feedback/marketing.md`.
- Localization follow-up paused per manager direction; resume only if product reopens multi-language scope.
- Reliability to provide staging smoke test logs so support can reference uptime data during Q&A.
