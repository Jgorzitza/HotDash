---
epoch: 2025.10.E1
doc: feedback/product.md
owner: product
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-14
---
# Product Feedback Log — 2025-10-07

## Governance Acknowledgment
- Reviewed docs/directions/README.md and docs/directions/product.md; acknowledge manager-only ownership, canon references, and Supabase secret policy.

## Notes
- Initial product feedback log created; awaiting roadmap alignment session.
- 2025-10-08: Reliability requested staging Shopify Admin API secret (demo shop) to support 90-day rotation dry-run; pending follow-up with integrations owner.

## 2025-10-07 — Sprint Readiness Updates

### Summary
- Published the M1/M2 prioritized backlog and synced Linear IDs (`docs/strategy/m1_m2_backlog.md`) for the 2025-10-08 check-in.
- Assigned telemetry workstream ownership across activation, SLA resolution, and anomaly response per `docs/directions/product_metrics.md` expectations.
- Reviewed marketing launch assets (comms packet, release notes template, brand tone deck) and approved copy variations pending noted follow-ups.
- Authored anomaly response decision contract to unblock OCC-205 (`docs/strategy/anomaly_response_decision_spec.md`).
- Delivered demo shop coverage plan and operational prep artifacts (`docs/strategy/demo_shop_list.md`, `artifacts/translation-review-request-20251007.md`, `docs/runbooks/operator_dry_run_plan.md`).

### Telemetry Ownership Decisions
| Metric | Primary Owner | Supporting Roles | Evidence |
| --- | --- | --- | --- |
| Activation Rate (rolling 7d) | Data (Jordan Alvarez) | Engineer (modal session hooks), Reliability (nightly monitoring) | `scripts/ops/run-nightly-metrics.ts`, `app/services/analytics.server.ts`, `feedback/data_to_reliability_coordination.md` |
| SLA Resolution Time | Data (Jordan Alvarez) | Reliability (alert thresholds), Support (runbook alignment) | `scripts/ops/run-nightly-metrics.ts`, `feedback/reliability.md`, `docs/runbooks/cx_escalations.md` |
| Anomaly Response Rate | Product (Justin) | Designer (assignment UX), Engineer (decision logging), Marketing (impact messaging) | `docs/directions/product_metrics.md`, `app/components/tiles/SEOContentTile.tsx`, `docs/design/copy_deck_modals.md`, `docs/strategy/anomaly_response_decision_spec.md` |

- Logged Linear assignments OCC-201 through OCC-205 to reflect ownership and status (see backlog doc).

### Marketing Asset Approvals (Product Sign-off)
| Asset | Decision | Rationale & Evidence |
| --- | --- | --- |
| Launch communications packet (`docs/marketing/launch_comms_packet.md`) | ✅ Approved with updates | Prefer Variation B headline + CTA (`🎉 Operator Control Center is here for your daily truth.` / `View Dashboard →`) to reinforce north-star value; confirm tooltip trigger on first dashboard visit with dismiss option. Beta-partner invite language "Your feedback shapes our roadmap" accepted — aligns with operator partnership framing. |
| Release notes template (`docs/marketing/release_notes_template.md`) | ✅ Approved | Evidence gates (Vitest, Playwright, Lighthouse, metrics) match delivery protocol; keep distribution list as proposed. Requested addition: include Ops Pulse metric thresholds (activation ≥70%, SLA median ≤60m) in template next revision. |
| Brand tone & talking points deck (`docs/marketing/brand_tone_deck.md`) | ✅ Approved with follow-up | Messaging aligns with professional-but-approachable tone; flagged need for professional FR review (handoff to translation vendor initiated separately). |

- Selected copy variations communicated to marketing for final edits (Variation B for banner headline, CTA, email subject, blog subhead, inventory tooltip).
- Noted requirement to attach matching evidence links when PRs reference OCC-301/OCC-305 stories.

### Next Actions
- Coordinate with marketing and designer on FR translation review kickoff (tracked under OCC-215/OCC-305 follow-ups).
- Share backlog + ownership summary in #occ-product and ensure agents acknowledge before daily sync.

## 2025-10-08 — Operator Training Dry Run Coordination
- Support requested confirmation on the 2025-10-16 @ 13:00 ET dry run slot and staging access handoff; see `docs/runbooks/operator_training_agenda.md:214` for prep checklist. Awaiting response to proceed with invites.

## Action Request — 2025-10-07
- Review marketing deliverables outlined in `docs/marketing/product_approval_packet_2025-10-07.md`.
- Select preferred copy variations (banner CTA/headline, launch email subject, blog subhead, tooltip variant) and provide approval or redlines.
- Confirm production launch window so marketing can schedule comms distribution and support can lock training.

## Dependencies
- Tooltip placement annotations from design (`docs/marketing/tooltip_placement_request_2025-10-07.md`).
- Translation review engagement (`docs/marketing/translation_review_request_2025-10-07.md`).
- Staging access package for operator training (`docs/marketing/support_training_session_proposal_2025-10-07.md`).

## Requested Response
- Please reply in #occ-product or update this log with decisions by **2025-10-07 @ 17:00 ET** to keep launch cadence on track.

### Marketing updates (2025-10-07)
- Final copy variants applied across launch assets per approved selections (see `docs/marketing/product_approval_packet_2025-10-07.md`).
- Campaign calendar published with KPI targets pending launch date (see `docs/marketing/campaign_calendar_2025-10.md`).
