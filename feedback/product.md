---
epoch: 2025.10.E1
doc: feedback/product.md
owner: product
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-14
---
# Product Feedback Log — 2025-10-07

## Direction Sync — 2025-10-09 (Cross-role Coverage)
- Re-reviewed sprint focus (Linear backlog refresh, telemetry ownership assignments, operator dry run plan) in `docs/directions/product.md`.
- Blocked: integration workload prevents taking on product ownership; awaiting reassignment or relief before continuing roadmap coordination.

## 2025-10-09 Sprint Execution
## 2025-10-09 Production Blockers Update
- Supabase fix: holding OCC-212 in blocked until reliability/data supply monitoring assets + log export; ready to update Linear backlog immediately after evidence lands.
- Staging Postgres/secrets: coordinating with deployment/reliability to capture production readiness checklist updates once secrets populate.
- GA MCP readiness: tracking integrations' credential ETA so telemetry backlog items can move to in-progress with accurate acceptance criteria.
- Operator dry run: waiting on enablement/support to confirm logistics + staging access package; Memory pre-read ready to publish once confirmations arrive.

- Began consolidating Linear backlog updates reflecting Supabase remediation and staging readiness, but publication blocked until engineering/reliability deliver monitoring evidence.
- Drafted outreach notes to assign telemetry owners explicit timelines; waiting on confirmations from data/reliability before logging in backlog.
- Coordinated with enablement/support on the 2025-10-16 dry run agenda to capture outstanding questions; responses pending before finalizing Memory pre-read.

## 2025-10-09 Production Blocker Push
- Supabase fix: tracking reliability/data escalation and holding OCC-212 in blocked until logs + mitigation evidence arrive; prepared to update backlog once metrics confirmed.
- Staging Postgres + secrets: syncing with deployment to ensure Linear tasks capture secret provisioning acceptance criteria; will publish checklist updates when reliability posts vault references.
- GA MCP readiness: coordinating with integrations/compliance to log OCC-INF-221 outcome and update the go-live readiness packet as soon as credential ETA confirmed.
- Operator dry run: drafted Memory pre-read outline and success metrics; awaiting staging access confirmation before circulating invites.
- Updated `docs/strategy/operator_dry_run_pre_read_draft.md` with backlog references (OCC-212/221/230) and recorded today’s coordination ping so the pre-read is ready to publish once confirmations arrive.

## 2025-10-10 Production Blocker Sweep
- Supabase decision sync fix: no new evidence yet—continuing to hold OCC-212; once reliability/data share monitor outputs we’ll push backlog + mitigation summary updates.
- Staging Postgres + secrets: touching base with deployment this afternoon for GitHub secret/postgres credential ETA; Linear checklist notes ready to flip to in-progress when paths arrive.
- GA MCP readiness: following up with integrations for OCC-INF-221 outcome before EOD so telemetry stories can move forward.
- Operator dry run: Memory pre-read draft stays staged; will publish and send invites immediately after enablement/support confirm staging access package.

## Governance Acknowledgment
- Reviewed docs/directions/README.md and docs/directions/product.md; acknowledge manager-only ownership, canon references, and Supabase secret policy.

## Notes
- Initial product feedback log created; awaiting roadmap alignment session.
- 2025-10-08: Reliability requested staging Shopify Admin API secret (demo shop) to support 90-day rotation dry-run; pending follow-up with integrations owner.

## 2025-10-09 Sprint Focus Kickoff
- M1/M2 backlog refresh: queued updates to incorporate Supabase logging remediation, staging env readiness, and dry run deliverables; pending reliability/data evidence before moving Linear items out of blocked.
- Telemetry task assignments: drafted owner/timeline matrix for activation, SLA resolution, and anomaly response metrics; awaiting analytics + logging inputs to finalize acceptance criteria.
- Operator dry run prep: followed up with enablement/support on 2025-10-16 logistics and staging access package; responses outstanding so Memory pre-read remains in draft.
- Blockers: Supabase monitoring assets + log export still missing, staging access package not delivered, and enablement/support confirmations pending.

## 2025-10-08 — Direction Refresh
- ✅ Re-read the sprint focus updates in `docs/directions/product.md:25` and aligned roadmap tasks accordingly.
- Blocker: Supabase logging remediation backlog item cannot close until reliability/data ship the missing monitor assets and log export referenced in `feedback/reliability.md:11`-`feedback/reliability.md:15`; keeping Linear story OCC-212 in blocked state until evidence lands.
- Blocker: Operator dry run lock still waiting on enablement/support confirmation for staging access package and invite approvals noted in `docs/runbooks/operator_training_agenda.md:214`-`docs/runbooks/operator_training_agenda.md:218`; follow-up pings sent in #occ-support.
- Outreach logged with reliability (`feedback/reliability.md:25`), data (`feedback/data.md:18`), support (`feedback/support.md:23`), and enablement (`feedback/enablement.md:19`) to secure monitoring evidence and staging access confirmations; awaiting replies by 2025-10-09 EOD.
- Drafted operator dry run pre-read summary in `docs/strategy/operator_dry_run_pre_read_draft.md` so Memory (`scope="ops"`) entry can be published immediately after confirmations land.
- Next step: once dependencies unblock, publish refreshed Linear links + Memory (ops scope) pre-read summary back into this log per direction guidance.

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
- 2025-10-08 14:35 ET — Enablement delivered job aid outlines and pinged Riley Chen for dry run confirmation, attendee roster, and staging package validation; follow-up due 2025-10-09 EOD so enablement can publish Memory pre-read bundle.
- 2025-10-09 09:00 ET — Enablement sent reminder requesting confirmation, attendee list, and staging package by 12:00 ET; awaiting response.
- 2025-10-09 12:05 ET — Enablement escalated non-response in #occ-leadership and requested manager assistance to unblock confirmations.

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
