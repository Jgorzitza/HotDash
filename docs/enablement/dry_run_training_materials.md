---
epoch: 2025.10.E1
doc: docs/enablement/dry_run_training_materials.md
owner: enablement
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-16
---
# Operator Dry Run Training Packet — 2025-10-16

## Session Overview
- **Date / Time:** Thursday, 2025-10-16 @ 13:00 ET (90 minutes)
- **Audience:** Evergreen Outfitters operator core team (Ops, CX, Data, Enablement)
- **Facilitators:** Product — Justin (Product), Support — Morgan Patel, Enablement — Justin (acting enablement agent)
- **Environment:** Fly staging host `https://hotdash-staging.fly.dev/app?mock=1` with `FEATURE_MODAL_APPROVALS=1`; toggle `FEATURE_AI_ESCALATIONS` per scenario notes
- **Reference Agenda:** `docs/runbooks/operator_training_agenda.md`

## Preparation Checklist (T-48h)
- Access package confirmed: OCC staging credentials for `https://hotdash-staging.fly.dev/app`, Chatwoot sandbox token, Supabase service key (read-only `decision_log` scope)
- Supabase bundle verified: service key stored at `vault/occ/supabase/service_key_staging.env` with latest monitor logs in `artifacts/logs/` and `artifacts/monitoring/supabase-sync-summary-latest.json`; rehearse against sample decision IDs 101–104 until staging generates fresh telemetry.
- Staging reachability check: hit `https://hotdash-staging.fly.dev/app?mock=1` and confirm HTTP 200 or 302 back to Shopify auth. If response is 410 or unreachable, escalate to deployment/reliability and log outcome in `feedback/enablement.md` before proceeding.
- Environment parity: staging mirrors production flags, latest nightly metrics seeded via `npm run ops:nightly-metrics`
- Assets staged: Sales Pulse & CX Escalations job aids (`docs/enablement/job_aids/`), AI scenario packets (`docs/enablement/job_aids/ai_samples/`), annotation callouts (`docs/enablement/job_aids/annotations/`), Q&A template (`docs/runbooks/operator_training_qa_template.md`), rate-limit recovery playbook (`docs/runbooks/shopify_rate_limit_recovery.md`)
- Evidence capture tooling ready: screenshot utility, Memory link (`scope="ops"`), shared folder `artifacts/ops/dry_run_2025-10-16/`
- Stakeholder confirmations logged in `feedback/enablement.md` (attendees, dependencies, blockers)

### Staging Evidence Table (update immediately after QA sign-off)
| Evidence Item | Owner | Action on Green Light | Artifact Path / Placeholder |
| --- | --- | --- | --- |
| `https://hotdash-staging.fly.dev/app?mock=0` curl log | Reliability → Enablement | Capture HTTP 200 headers and drop into staging integrations folder | Placeholder → `artifacts/integrations/shopify/2025-10-10/curl_mock0_<timestamp>.log` |
| Synthetic check JSON (`?mock=0`) | Reliability | Archive sub-300 ms JSON alongside mock=1 evidence | Placeholder → `artifacts/monitoring/synthetic-check-<timestamp>-mock0.json` |
| Supabase NDJSON export | Reliability + Data | Replace placeholder with refreshed bundle; notify facilitators in Slack | Placeholder → `artifacts/logs/supabase_decision_export_<timestamp>.ndjson` |
| Annotated overlays (CX/Sales/Inventory) | Design + Enablement | Swap interim text callouts with final overlays in job aids | Placeholder → `artifacts/design/tooltip-overlays/2025-10-10/<file>.png` |
| Stakeholder acknowledgements | Enablement | Fill acknowledgement table once packets send | See “Acknowledgement Log Template” below |

## Facilitator Prep Matrix
| Owner | Focus Area | Prep Tasks | Status | Notes |
| --- | --- | --- | --- | --- |
| Support Lead (Morgan Patel) | CX Escalations walkthrough | Review mock-mode transcripts in `docs/runbooks/cx_escalations.md`, pre-write operator notes for scenarios A/D, stage reminder macros in Chatwoot sandbox | ✅ Ready — waiting on live staging evidence | Update notes with real decision IDs once DEPLOY-147 closes |
| Enablement Lead (Justin) | Session pacing & Q&A capture | Refresh agenda timing, pre-seed Q&A template rows with scenario headers, verify screenshot tooling for evidence folder | ✅ Ready — mock data rehearsed | Will swap screenshot set once QA shares live captures |
| Product (Justin) | Sales Pulse narratives & telemetry | Align KPI talking points with latest `npm run ops:nightly-metrics` output, prep Memory outline for post-session summary | ✅ Ready — metrics aligned to mock data | Needs final metric screenshot after staging refresh |
| Reliability Liaison (TBD) | Evidence verification | Confirm synthetic check rerun plan, prep curl log template for `?mock=0` validation, update smoke link references in packet | ⏳ Pending owner assignment | Support to nominate liaison during 10 Oct 15:30 UTC sync |
| QA Observer (TBD) | Issue capture | Review Q&A template expectations, ready Linear labels for bugs vs enhancements | ⏳ Pending roster confirmation | Add contact info once enablement finalizes roster |

## Live Materials Bundle
| Asset | Purpose | Owner | Distribution |
| --- | --- | --- | --- |
| `docs/enablement/job_aids/cx_escalations_modal.md` | CX Escalations operator one-pager | Enablement | Print/digital handout |
| `docs/enablement/job_aids/sales_pulse_modal.md` | Sales Pulse operator one-pager | Enablement | Print/digital handout |
| `docs/enablement/job_aids/ai_samples/cx_escalations_training_samples.md` | Scenario scripts + AI copy | Enablement | Facilitator packet |
| `docs/enablement/job_aids/ai_samples/sales_pulse_training_samples.md` | Sales insights scenarios | Enablement | Facilitator packet |
| `docs/enablement/job_aids/annotations/2025-10-16_dry_run_callouts.md` | Text callouts for annotated screenshots | Enablement/Design | Facilitator prep |
| `docs/runbooks/operator_training_agenda.md` | Session flow and timings | Support | Shared doc |
| `docs/runbooks/operator_training_qa_template.md` | Q&A + feedback capture | Support | Shared doc (fill live during session) |
| `docs/runbooks/shopify_rate_limit_recovery.md` | Rate-limit escalation steps | Support | Facilitator prep |
| `docs/strategy/operator_dry_run_pre_read_draft.md` | Participant pre-read context | Product | Slack `#occ-product` |

## Scenario Execution Notes
1. **CX Escalations — Late Shipment (Scenario A)**
   - Goal: demonstrate SLA breach triage with AI assist
   - Toggle: `FEATURE_AI_ESCALATIONS=1`
   - Success: operator selects `ship_update`, logs decision ID, records follow-up in Q&A template
2. **CX Escalations — Policy Exception (Scenario D)**
   - Goal: show guardrails when AI abstains
   - Toggle: `FEATURE_AI_ESCALATIONS=0`
   - Success: operator explains escalation path, captures fallback messaging screenshot
3. **Sales Pulse — Order Surge (Scenario 1)**
   - Goal: interpret KPI spike, plan staffing adjustment
   - Success: staffing decision logged (`scope="ops"`), Slack notification drafted aloud
4. **Sales Pulse — Revenue Dip (Scenario 2)**
   - Goal: identify recovery action, coordinate with marketing
   - Success: decision log or Memory fallback entry referencing Shopify discount plan

> Use the remaining Sales Pulse scenarios (Channel Mix Shift, Promo Monitoring) as optional stretch activities if the group finishes early.

## Evidence Capture
- For each scenario, archive: modal/tile screenshot, decision log row (Supabase ID), Q&A notes summary
- Reference the refreshed Supabase dataset (`artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson`) when practicing evidence capture so operators recognize success vs retry vs timeout records before live IDs land.
- Flag staging anomalies (410 response, credential failure) live in the Q&A template and `feedback/enablement.md`; pause the session if OCC can’t load in Shopify Admin.
- Upload assets to `artifacts/ops/dry_run_2025-10-16/` with naming `scenario-<letter|number>_<context>.png`
- Summarize outcomes in Memory (`scope="ops"`, `topic="dry_run_2025-10-16"`) within 2h of session end
- Mirror highlights plus open follow-ups in `feedback/enablement.md` and link to supporting artifacts

## Outstanding Dependencies & Owners
- **Design:** Final visual overlays for Sales Pulse & CX Escalations — text callouts staged; awaiting annotated exports for print-ready job aids
- **Reliability/Data:** Monitoring guide for Supabase decision_log (service key + logs delivered; need replay walkthrough)
- **Support/Product:** Attendee roster acknowledgements captured in `feedback/support.md`/`feedback/product.md`; send invites once staging package locks
- **Runbook Reference:** `docs/runbooks/restart_cycle_checklist.md` now published; sync with integrations if checklists diverge.

## Distribution Plan
- T-24h: Share finalized packet link (this doc + artifacts) in `#occ-product` and `#occ-ops`
- T-12h: Deliver reminder + access checklist to attendees; confirm staging still seeded
- Post-session: Send recording, Memory log link, and summarized feedback to stakeholders; queue updates to job aids and runbook based on findings

### Draft Announcement Copy (Hold Until `?mock=0` = 200)
```
Subject: OCC Dry Run Packet — staging smoke ✅

Team,

Staging smoke (`https://hotdash-staging.fly.dev/app?mock=0`) returned 200 at <timestamp>; the OCC dry run packet is now ready for review. Please confirm receipt and staging access by replying in-thread with “ack” and any blockers.

Packet link: <link to repo path>
Key assets: CX Escalations & Sales Pulse job aids, AI scenario scripts, agenda, rate-limit coaching guide.

Action requested today: review materials, confirm access package, surface open questions ahead of the facilitator huddle.

Thanks!
```

### Acknowledgement Log Template
| Stakeholder | Role | Packet Sent (UTC) | Staging Smoke Evidence | Acknowledged (UTC) | Status |
| --- | --- | --- | --- | --- | --- |
| Riley Chen | Product | Draft queued — waiting on green smoke | `artifacts/monitoring/synthetic-check-<timestamp>.json` (to attach) | Pending | Ready to blast once QA posts live evidence |
| Morgan Patel | Support | Draft queued — waiting on green smoke | same as above | Pending | Internal staging checklist pre-reviewed |
| QA Lead | QA | Draft queued — awaiting QA sign-off | `artifacts/integrations/shopify/2025-10-10/curl_mock0_<timestamp>.log` (to attach) | Pending | Will co-own validation window |
| Design Partner | Design | Draft queued — awaiting overlay handoff | same as QA | Pending | Needs annotated screenshots to confirm |

### Staging Smoke Evidence Checklist
- Re-run `curl -I https://hotdash-staging.fly.dev/app?mock=0` and save the output to `artifacts/integrations/shopify/<date>/curl_mock0_<timestamp>.log`.
- Attach the latest synthetic check JSON demonstrating sub-300 ms latency (e.g., `artifacts/monitoring/synthetic-check-<timestamp>.json`).
- Log the rerun result and evidence paths in `feedback/enablement.md`, `feedback/manager.md`, and `feedback/product.md`/`feedback/support.md` before distribution.
- Include evidence file paths in the acknowledgement table once each stakeholder responds.

### Facilitator Huddle (Draft Agenda)
- Review staging smoke status + evidence paths (5 min).
- Walk through CX Escalations talking points and rehearse capturing Supabase decision IDs (15 min).
- Walk through Sales Pulse talking points with focus on escalation thresholds (15 min).
- Confirm overlay asset swap plan and annotate any copy tweaks needed once design delivers screenshots (10 min).
- Assign owners for acknowledgement tracking and Q&A capture during the dry run (5 min).

### Evidence Table — Ready for Immediate Rollout
| Artifact | Purpose | Current Status (2025-10-10 08:05 UTC) | Path / Placeholder |
| --- | --- | --- | --- |
| `curl_mock0_<timestamp>.log` | Document sustained HTTP 200 live smoke | ⏳ Latest run still HTTP 410 | `artifacts/integrations/shopify/2025-10-10/curl_mock0_2025-10-10T072315Z.log` |
| Synthetic check JSON | Verify latency < 300 ms post-warmup | ✅ Latest `?mock=1` pass 278 ms; rerun for `?mock=0` once green | `artifacts/monitoring/synthetic-check-2025-10-10T07-19-19.492Z.json` |
| Supabase parity snapshot | Confirm data parity ahead of training | ✅ Latest snapshot stored | `artifacts/monitoring/supabase-parity_2025-10-10T07-19-29Z.json` |
| Supabase decision export | Provide fact IDs for facilitator evidence | ⏳ Await refreshed NDJSON | Placeholder `artifacts/logs/supabase_decision_export_<timestamp>.ndjson` |
| Overlay checklist + visuals | Swap interim text callouts with annotated screenshots | ⚠️ Checklist drafted; awaiting design sign-off + exports | `docs/enablement/job_aids/annotations/2025-10-16_dry_run_callouts.md` |
| Acknowledgement tracker | Capture distribution receipts | ✅ Template staged | Table above in this doc |

## Change Log
- **2025-10-10:** Initial packet assembled; awaiting design assets and staging secret delivery before distributing externally.
- **2025-10-10 14:30 ET:** Supabase vault path logged, facilitator roster confirmed with product/support, annotation callouts staged pending design exports.
- **2025-10-10 07:45 UTC:** Added facilitator prep matrix and acknowledgement statuses so packet can deploy immediately after QA sign-off.
