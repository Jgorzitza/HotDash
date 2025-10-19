---
epoch: 2025.10.E1
doc: feedback/product.md
owner: product
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-14
---

- `cat vault/occ/shopify/embed_token_staging.env` confirms the Shopify Admin embed token remains the `shptka_staging_embed_token_placeholder_2025-10-10` value; still blocked awaiting sanctioned token drop before we can unblock localization/QA evidence capture.
- `rg -n "\?mock=0" -g"*.json" artifacts` shows the freshest synthetic check artifacts stop at 2025-10-10; no new sub-300 ms `?mock=0` run or Playwright rerun from QA, so DEPLOY-147 evidence bundle stays frozen.
- Next actions: (1) Press reliability/deployment for the sanctioned embed token handoff + rotation plan so localization can relight screenshot automation; (2) request QA to schedule the next `?mock=0` latency + Playwright run and attach artifacts; (3) hold the operator dry-run pre-read publication until both artifacts land, then push Memory/Linear updates in one package.

- Reliability confirmed no credential swap is required. Backlog remains frozen pending QA evidence, but no Supabase secret action needed.

- Conferred with support + enablement; reaffirmed 2025-10-16 13:00 ET dry run timing and facilitator coverage.
- Noted credential stability (Supabase rotation cleared 2025-10-10 15:45 UTC); remaining blocker is QA `?mock=0` evidence for packet distribution.
- Committed to follow up with QA for next smoke run and to drop curl + synthetic artifact links into `docs/enablement/dry_run_training_materials.md` once 200 achieved.
- Captured Chatwoot Fly migration reminder — if reliability schedules cut-over before rehearsal, product will align talking points and update the agenda annex with new host guidance.

## 2025-10-10 — Sanitized Branch Reset Complete

## 2025-10-11 — Sanitized Push Record & Rotation Prep

## 2025-10-11 — Backup Work Execution

- Reliability signaled the Supabase staging breach is contained; keep current secrets in place until the scheduled 2025-10-11 rotation. Product backlog items stay frozen, but no immediate credential action required today.

### Post-Rotation Checklist (Pending Secrets)

- **Reliability:** Confirm rotation status (if required) and log evidence path in `feedback/reliability.md`; current state (2025-10-11) is “no rotation needed”.
- **Deployment:** When QA evidence ready, rerun `scripts/deploy/staging-deploy.sh` if secrets change, archive the redeploy log under `artifacts/deploy/`, and capture sanitized head confirmation in `feedback/deployment.md`.
- **QA:** Execute `npm run test:e2e` and `npm run test:lighthouse`, attach artifacts in `artifacts/qa/`, and record the sub-300 ms `?mock=0` synthetic check (URL header + screenshot) in `feedback/qa.md`.
- **Product:** When evidence is attached, thaw the backlog by moving DEPLOY/OCC tickets to `Review`, update `DEPLOY-147` with artifact links, and post the Memory recap confirming verification order.
- **Marketing/Support/Enablement:** Refresh the go/no-go packet (`docs/marketing/launch_window_go_no_go_draft.md`) with new timestamps, reschedule comms/training touchpoints, and acknowledge readiness in #occ-stakeholders once product gives the all-clear.

## 2025-10-10 — Sanitized Branch Reset Prep

# Backlog Freeze Check-in — 2025-10-10 12:20 UTC

- Re-read `docs/directions/product.md:25-29`; backlog stays frozen until QA attaches the refreshed smoke (`?mock=0`) + Supabase parity artifacts to their log. Confirmed neither artifact is referenced in `feedback/qa.md` yet, so Linear/Memory updates remain on hold per canon.
- Collected launch-window comm inputs so we can publish the go/no-go note immediately after evidence lands (see `docs/marketing/launch_comms_packet.md` + `docs/marketing/shopify_launch_comms_backlog.md`); draft highlights telemetry receipts and pending invite evidence for marketing/support alignment.
- Finalized install plan linkages with direct artifact + QA log references and published the launch-window go/no-go draft at `docs/marketing/launch_window_go_no_go_draft.md` so comms can ship the moment the freeze lifts.
- Blockers: (1) Sub-300 ms `?mock=0` smoke proof still outstanding (DEPLOY-147 now tracks only this latency evidence); (2) QA has not yet attached the smoke + Supabase evidence, so backlog thaw and Memory/Linear updates stay paused.
- Direction update (Integrations/Product): broadcast credential availability to QA/support now that vault + GitHub staging secrets are verified, update readiness dashboards/Linear entries in draft form, and keep DEPLOY-147 open solely for the smoke latency proof once invite evidence is shared.
- Outstanding Shopify credential checklist (support sync 2025-10-10 07:30 UTC):
  - Store invites (Evergreen Outfitters, Atelier Belle Maison, Peak Performance Gear) — ✅ Delivered (audit export `store-invite-audit-20251010T0730Z.md`).
  - Shopify CLI auth token confirmation — ✅ Logged (hash evidence `cli-secret-20251010T071858Z.log`).
  - Chatwoot sandbox token rotation summary — Integrations → verify entry in `feedback/integrations.md`.
  - Supabase decision log read-only service key path — Data → confirm matches install plan appendix.
  - STAGING_SMOKE_TEST_URL evidence bundle (header + screenshot) — Reliability → attach to `docs/deployment/shopify_staging_install_plan.md`.
- Mirrored the checklist inside `docs/deployment/shopify_staging_install_plan.md` so hand-off owners have a single place to acknowledge delivery when DEPLOY-147 unblocks.
- Support staged an evidence table in `docs/runbooks/shopify_dry_run_checklist.md` to mirror artifact readiness; will cross-link once staging smoke flips green.

# Staging Install Plan Progress — 2025-10-10 23:58 UTC

- Authored `docs/deployment/shopify_staging_install_plan.md` with credential sources (vault + GitHub), Shopify CLI deploy command, and evidence requirements so Linear/Memory updates can link a single plan once artifacts land.
- Posted follow-up to deployment + integrations (04:41 UTC) referencing the green smoke artifact; resolved by 07:32 UTC when invites confirmed and broadcast sent—remaining ask is latency proof for DEPLOY-147 closure.

| Next Step                                                                 | Owner                       | Target                     | Status                                                                            |
| ------------------------------------------------------------------------- | --------------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| Broadcast Shopify staging credential availability to QA/support           | Product ↔ Integrations     | 2025-10-10                 | ✅ Completed — see `docs/integrations/shopify_credential_broadcast_2025-10-10.md` |
| Capture sub-300 ms `?mock=0` smoke proof and close DEPLOY-147             | Reliability ↔ Integrations | 2025-10-11                 | 🔴 Pending — waiting on live smoke latency artifact                               |
| Prep launch-window communication draft (go/no-go Slack + email)           | Product ↔ Marketing        | Ahead of backlog thaw      | ✅ Completed — see `docs/marketing/launch_window_go_no_go_draft.md`               |
| Post Linear/Memory update linking plan + artifacts once above two unblock | Product                     | Immediately after evidence | ⏳ Waiting on blockers                                                            |

# Product Direction Update — 2025-10-10 09:14 UTC

- Hold backlog refresh until deployment confirms Supabase staging `DATABASE_URL` + service key sync (vault path + GitHub env timestamp) and attach evidence when logging the update.
- Bundle Supabase monitoring artifacts with the M1/M2 backlog publish so telemetry commitments have traceable sources.
- Coordinate with enablement/support on Shopify credential delivery; schedule backlog/Memory updates the moment admin access is confirmed.

## Shopify Install Push — 2025-10-10 10:24 UTC

- Track reliability/deployment confirmation of Shopify + Supabase staging secrets and document the install timeline (owners, timestamps) in Linear/Memory before green-lighting QA.
- Ensure `shopify.app.toml` scope updates and CLI linking are recorded with evidence from engineering; note any remaining gaps blocking install here.
- Once validation completes, compile the readiness evidence bundle (migration logs, Playwright/Lighthouse, telemetry screenshots) and attach to the backlog refresh entry.

## Direction Refresh — 2025-10-10 (15:22 UTC)

- Re-read `docs/directions/product.md:1`-`docs/directions/product.md:24` (last_reviewed 2025-10-10); no new changes beyond the backlog hold + Shopify validation coordination directives already captured at the top of this log.
- Confirmed restart checklist tracked again at `docs/runbooks/restart_cycle_checklist.md:1`; governance alignment maintained by referencing it in this log and in manager sync.

## Shopify Validation Prep — 2025-10-10

- Checked `shopify.app.toml` to confirm Partner app client ID (`4f72376ea61be956c860dd020552124d`) and requested scopes align with sprint directives; CLI config ready once credentials drop.
- Drafted install timeline and owner matrix to log into Linear/Memory immediately after credential confirmations land.
- Direction reminder (2025-10-11 12:05 UTC): Once QA publishes Prisma forward/back + Shopify parity evidence, attach artifacts in Linear/Memory, lift the backlog hold, and finalize the install timeline per `docs/directions/product.md`.

| Step                                                                                           | Owner                     | Status                  | Notes                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------- | ------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirm Shopify partner app credentials (API key/secret, store URL) delivered via `DEPLOY-147` | Integrations + Deployment | 🔴 Pending              | Waiting on deployment response; request escalated in `feedback/integrations.md` and `feedback/deployment.md`.                                                  |
| Record credential drop (vault path + GitHub env timestamp) and unblock backlog publish         | Product                   | ⏳ Awaiting evidence    | Hold backlog refresh per direction until timestamp received; prep evidence bundle with Supabase monitoring artifacts.                                          |
| Document Shopify validation install plan + owners in Linear/Memory                             | Product                   | 📝 Ready                | Outline prepared (Justin — coordination, QA — automation validation, Integrations — credential stewardship); will post once secrets confirmed.                 |
| Kick QA validation window (Playwright + GraphQL parity)                                        | QA                        | Blocked                 | Requires staging `DATABASE_URL` and Shopify admin access.                                                                                                      |
| Attach QA evidence links to Linear/Memory and clear backlog hold                               | Product + QA              | 🚫 Pending QA artifacts | Waiting on QA to deliver forward/back + Shopify parity evidence; action will trigger backlog refresh + Memory/Linear updates immediately after artifacts land. |

# Product Feedback Log — 2025-10-07

# Product Feedback Log — 2025-10-07

## 2025-10-10 Dry Run Prep Update

- Support published the cross-team `docs/runbooks/shopify_dry_run_checklist.md`; need product confirmation on attendee roster + staging access package before tasks can flip to in-progress. Please drop updates in this log or `feedback/support.md` so we can update the checklist promptly.
- Request: confirm delivery timeline for Shopify staging access bundle (demo shop creds, Chatwoot sandbox token, Supabase decision key) by 2025-10-12 EOD so T-48 checklist items can close. If blockers remain, note owner + ETA here for support escalation.
- Q&A capture template now available (`docs/runbooks/operator_training_qa_template.md`); once roster confirmed, support will log live notes there—please add product follow-ups directly in the table during session.

## Direction Sync — 2025-10-09 (Cross-role Coverage)

- Re-reviewed sprint focus (Linear backlog refresh, telemetry ownership assignments, operator dry run plan) in `docs/directions/product.md`.
- Blocked: integration workload prevents taking on product ownership; awaiting reassignment or relief before continuing roadmap coordination.

## 2025-10-09 Sprint Execution

## 2025-10-09 Production Blockers Update

- Supabase fix: holding OCC-212 in blocked until reliability/data supply monitoring assets + log export; ready to update Linear backlog immediately after evidence lands.
- Staging Postgres/secrets: coordinating with deployment/reliability to capture production readiness checklist updates once secrets populate.
- GA MCP readiness: tracking integrations' credential ETA so telemetry backlog items can move to in-progress with accurate acceptance criteria.
- Operator dry run: waiting on enablement/support to confirm logistics + staging access package; Memory pre-read ready to publish once confirmations arrive.
- 2025-10-10 18:45 ET — Enablement circulated Shopify sync rate-limit coaching guide (`docs/enablement/job_aids/shopify_sync_rate_limit_coaching.md`); reviewing for product messaging alignment and logging feedback back to enablement.
- 2025-10-10 19:00 ET — Synced with enablement on Supabase evidence expectations for the dry run (capture decision log IDs + screenshots per scenario); will confirm QA parity checks once staging secrets validated.

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

| Metric                       | Primary Owner         | Supporting Roles                                                                    | Evidence                                                                                                                                                              |
| ---------------------------- | --------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activation Rate (rolling 7d) | Data (Jordan Alvarez) | Engineer (modal session hooks), Reliability (nightly monitoring)                    | `scripts/ops/run-nightly-metrics.ts`, `app/services/analytics.server.ts`, `feedback/data_to_reliability_coordination.md`                                              |
| SLA Resolution Time          | Data (Jordan Alvarez) | Reliability (alert thresholds), Support (runbook alignment)                         | `scripts/ops/run-nightly-metrics.ts`, `feedback/reliability.md`, `docs/runbooks/cx_escalations.md`                                                                    |
| Anomaly Response Rate        | Product (Justin)      | Designer (assignment UX), Engineer (decision logging), Marketing (impact messaging) | `docs/directions/product_metrics.md`, `app/components/tiles/SEOContentTile.tsx`, `docs/design/copy_deck_modals.md`, `docs/strategy/anomaly_response_decision_spec.md` |

- Logged Linear assignments OCC-201 through OCC-205 to reflect ownership and status (see backlog doc).

### Marketing Asset Approvals (Product Sign-off)

| Asset                                                                  | Decision                   | Rationale & Evidence                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Launch communications packet (`docs/marketing/launch_comms_packet.md`) | ✅ Approved with updates   | Prefer Variation B headline + CTA (`🎉 Operator Control Center is here for your daily truth.` / `View Dashboard →`) to reinforce north-star value; confirm tooltip trigger on first dashboard visit with dismiss option. Beta-partner invite language "Your feedback shapes our roadmap" accepted — aligns with operator partnership framing. |
| Release notes template (`docs/marketing/release_notes_template.md`)    | ✅ Approved                | Evidence gates (Vitest, Playwright, Lighthouse, metrics) match delivery protocol; keep distribution list as proposed. Requested addition: include Ops Pulse metric thresholds (activation ≥70%, SLA median ≤60m) in template next revision.                                                                                                   |
| Brand tone & talking points deck (`docs/marketing/brand_tone_deck.md`) | ✅ Approved with follow-up | Messaging aligns with professional-but-approachable tone; flagged need for professional FR review (handoff to translation vendor initiated separately).                                                                                                                                                                                       |

- Selected copy variations communicated to marketing for final edits (Variation B for banner headline, CTA, email subject, blog subhead, inventory tooltip).
- Noted requirement to attach matching evidence links when PRs reference OCC-301/OCC-305 stories.

### Next Actions

- Coordinate with marketing and designer on FR translation review kickoff (tracked under OCC-215/OCC-305 follow-ups).
- Share backlog + ownership summary in #occ-product and ensure agents acknowledge before daily sync.

## 2025-10-08 — Operator Training Dry Run Coordination

- Support requested confirmation on the 2025-10-16 @ 13:00 ET dry run slot and staging access handoff; see `docs/runbooks/operator_training_agenda.md:214` for prep checklist. Awaiting response to proceed with invites.
- 2025-10-08 14:35 ET — Enablement delivered job aid outlines and pinged Riley Chen for dry run confirmation, attendee roster, and staging package validation; follow-up due 2025-10-09 EOD so enablement can publish Memory pre-read bundle.
- 2025-10-09 09:00 ET — Enablement sent reminder requesting dry run confirmation, attendee list, and staging access package by 12:00 ET; awaiting response.

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
