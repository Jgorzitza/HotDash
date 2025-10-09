---
epoch: 2025.10.E1
doc: docs/marketing/launch_timeline_playbook.md
owner: marketing
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-18
---
# Operator Control Center - Launch Timeline Playbook

## Overview
- **Purpose:** Provide a single source of truth for launch sequencing once product locks the production window.
- **Launch window:** Pending product confirmation (tracked in `feedback/marketing.md`). All timelines below assume `T0` = production go-live date.
- **Scope:** English-only launch collateral (banner, email, blog, tooltip) plus enablement touchpoints.
- **Dependencies:**
  - Product to confirm production date and staging credentials.
  - Design to deliver tooltip placement annotations (due 2025-10-08 @ 12:00 ET).
  - Localization to validate "Centre OCC" abbreviation by 2025-10-09 @ 18:00 ET (impacts FR backlog only).

## Timeline Summary
| Phase | Relative Timing | Owner | Key Outputs | Readiness KPI |
|-------|-----------------|-------|-------------|---------------|
| Mock Alignment | T-14 to T-10 | Product + Marketing | Mock review comms, evidence bundle, updated approval packet | Mock feedback resolved < 48h |
| Staging Preview | T-9 to T-5 | Product + Enablement | Beta walkthrough invite, staging deck, FAQ handoff | Beta partner attendance > 80% |
| Enablement Dry Run | T-7 to T-2 | Marketing + Support | Training session, updated FAQ, support macros | Support CSAT on readiness > 4/5 |
| Launch Day | T0 | Marketing + Product | In-app banner live, launch email send, blog publish | Banner CTR > 15%, email open > 35% |
| Post-Launch | T+1 to T+14 | Marketing + Data | Insight digest, testimonial capture, KPI tracking | Operator activation > 70% |

## Detailed Checklist

### T-14 to T-10 (Mock Alignment)
- [x] Finalize mock review communications (`docs/marketing/launch_comms_packet.md`, sections 1-2).
- [x] Update product approval packet with latest copy decisions (`docs/marketing/product_approval_packet_2025-10-07.md`).
- [ ] Capture design tooltip placement annotations (in-flight with design).
- [ ] Document open risks in manager log (`feedback/manager.md`).

### T-9 to T-5 (Staging Preview)
- [ ] Send beta partner invite once launch date confirmed; template lives in Section 2 of the comms packet.
- [ ] Coordinate staging credentials and seeded data with product (reference `docs/runbooks/operator_training_agenda.md`).
- [ ] Prepare walkthrough deck aligning with latest tooltip copy and tone deck.
- [ ] Collect beta feedback within 24 hours and feed into approval packet evidence section.
- [ ] Incorporate designer tooltip annotations (`docs/design/tooltip_annotations_2025-10-09.md`) once delivered.

### T-7 to T-2 (Enablement & Training)
- [ ] Run dry run on 2025-10-16 using script (`docs/marketing/support_training_script_2025-10-16.md`).
- [ ] Update FAQ and macros based on training outcomes (`docs/marketing/launch_faq.md`).
- [ ] Share recording + timestamp notes with support knowledge base.
- [ ] Confirm support escalation paths for AI, data, and configuration questions.

### T-1 (Go/No-Go)
- [ ] Verify product sign-off documented in approval packet and Slack thread.
- [ ] Confirm deployment workflow approvals captured in `docs/deployment/production_go_live_checklist.md`.
- [ ] Schedule launch email send in ESP; ensure staging preview link swapped for production URL.
- [ ] Test in-app banner in staging environment (screenshot for evidence bundle).

### T0 (Launch Day)
- [ ] Publish in-app banner and confirm telemetry events firing (coordinate with engineering).
- [ ] Send launch email and monitor deliverability within first hour.
- [ ] Publish blog post and update partner portal listing.
- [ ] Post launch announcement in #occ-launch with links to comms assets.
- [ ] Capture real-time operator feedback in #occ-feedback channel.

### T+1 to T+3 (Immediate Follow-Up)
- [ ] Compile launch performance snapshot (banner CTR, email open, early tile interactions).
- [ ] Share quick wins and issues in manager log and campaign calendar.
- [ ] Kick off testimonial outreach for top operators (script in `docs/marketing/privacy_toggle_rollout.md`).

### T+4 to T+14 (Sustain & Iterate)
- [ ] Monitor KPIs weekly via campaign calendar (`docs/marketing/campaign_calendar_2025-10.md`).
- [ ] Partner with product on roadmap adjustments informed by operator feedback.
- [ ] Prepare localization handoff package if FR approval granted.
- [ ] Archive evidence bundle (comms screenshots, metrics) in marketing repository.

## KPI & Telemetry Tracking
| Metric | Target | Source | Owner | Notes |
|--------|--------|--------|-------|-------|
| In-app banner CTR | >= 15% | Shopify Admin telemetry | Marketing | Track in Mixpanel view configured by data team |
| Launch email open rate | >= 35% | ESP dashboard | Marketing | Segment install base; resend to non-openers at T+2 |
| Operator activation (dashboard open) | >= 70% first 7 days | Telemetry pipeline (Supabase) | Product | Requires Supabase credentials (see `feedback/manager.md`) |
| Tile interaction depth (>=2 tiles/session) | >= 60% | Telemetry pipeline | Data | Validate via `scripts/ops/check-dashboard-analytics-parity.ts` once Supabase schema fixed |
| Support readiness CSAT | >= 4/5 | Post-training survey | Support | Send automatically after dry run |

## 2025-10-09 Update
- Added dependency on designer tooltip annotations to staging preview checklist.
- Waiting on product go-live window before translating relative timings into calendar invites.

## Risks & Mitigations
| Risk | Impact | Mitigation | Owner |
|------|--------|-----------|-------|
| Launch date still unset | Blocks comms scheduling and partner invites | Manager to follow up with product lead (standing ping 2025-10-09 @ 10:45 ET) | Product + Manager |
| Tooltip placement annotations late | Delays engineering wiring of tooltip copy | Designer to deliver annotated screenshots; marketing ready to update handoff within 2 hours | Design + Marketing |
| Localization feedback requests FR headline change | Could require banner/email copy adjustment | Maintain English-only launch; queue FR revisions in translation packet | Localization + Marketing |
| Supabase telemetry credentials missing | Prevents KPI validation post-launch | Reliability to populate secrets (see `docs/deployment/env_matrix.md`, `feedback/reliability.md`) | Reliability |

## Communication Matrix
| Audience | Channel | Cadence | Owner | Notes |
|----------|---------|---------|-------|-------|
| Internal launch squad | #occ-launch Slack | Daily stand-up updates | Product | Include red/yellow status for dependencies |
| Manager & leadership | `feedback/manager.md` | Daily async update | Marketing | Highlight blockers + request decisions |
| Support agents | Training session + follow-up email | T-4, T-1, T+1 | Enablement | Attach FAQ and macros |
| Beta partners | Email + calendar invite | T-7, T-1 | Product | Recap feedback and highlight production go-live |
| Localization | Slack thread + doc comments | As needed | Marketing | Share FR adjustments once approved |

## Open Items (Track in Feedback Log)
1. Product launch window confirmation.
2. Tooltip placement annotations from design.
3. Localization verdict on "Centre OCC" abbreviation.
4. Supabase credential delivery for telemetry dashboards.

Update this playbook once product supplies the launch date; shift relative timing to calendar dates and attach to `feedback/marketing.md` evidence list.
