---
epoch: 2025.10.E1
doc: docs/marketing/shopify_launch_comms_backlog.md
owner: marketing
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-11
---
# Shopify Launch Communications Backlog

## Snapshot — 2025-10-10
- Copy across core surfaces (banner, email, blog) approved per `docs/marketing/product_approval_packet_2025-10-07.md`; distribution timing hinges on product go-live window.
- Tooltip placement annotations still pending from design; engineering handoff queued once overlays arrive.
- Campaign calendar + evidence bundle waiting on product launch window and full Supabase telemetry export; staging Supabase + Shopify secrets now vaulted (`vault/occ/supabase/*`, `vault/occ/shopify/*`) and synced to GitHub `staging`.
- Supabase parity (2025-10-10 01:25Z) and Fly staging smoke (2025-10-10 02:31Z) logged; readiness evidence now available for comms packet references.

## Backlog
| # | Backlog Item | Status | Owner | Next Action | Evidence | Blockers / Notes | Last Updated (UTC) |
|---|--------------|--------|-------|-------------|----------|------------------|--------------------|
| 1 | Confirm production launch window + distribution schedule | ⚠️ Escalated | Product (Marketing follow-up) | Await manager escalation outcome; once window set, update `docs/marketing/campaign_calendar_2025-10.md` and stage ESP send | `docs/marketing/launch_timeline_playbook.md` | Escalated to manager at 2025-10-10 14:00 UTC due to continued silence; awaiting response | 2025-10-09T21:32:56Z |
| 2 | Capture tooltip placement annotations for in-admin surfaces | ⚠️ Escalated | Design | Await manager escalation outcome; deliver annotated overlays + modal visuals and notify engineering within 2h once received | `docs/marketing/tooltip_placement_request_2025-10-07.md` | Escalated to manager at 2025-10-10 14:00 UTC; pinged design in `#occ-design` at 2025-10-10 18:42 UTC—waiting on overlays/visuals | 2025-10-10T18:42:00Z |
| 3 | Prep in-app banner asset for engineering handoff | ✅ Ready | Marketing | Attach final copy + placement guidance to engineering ticket once launch window scheduled | `docs/marketing/product_approval_packet_2025-10-07.md#banner` | Awaiting tooltip placements + launch window to time release | 2025-10-09T21:11:40Z |
| 4 | Load launch email into ESP staging | ⛔ Blocked | Marketing | Hold ESP slot; stage send + QA as soon as go-live window confirmed | `docs/marketing/product_approval_packet_2025-10-07.md#email` | Distribution timing + CTA confirmation tied to product launch decision | 2025-10-09T21:11:40Z |
| 5 | Finalize blog post & schedule Partner Portal submission | 🚧 In progress | Marketing | Incorporate product CTA redlines; queue Partner Portal submission 5 days before launch | `docs/marketing/launch_comms_packet.md#3.-production-launch-communications` | Need go-live date and CTA confirmation before publishing | 2025-10-09T21:11:40Z |
| 6 | Bundle launch comms evidence for audit (tone deck, approvals, screenshots) | 🚧 In progress | Marketing | Assemble package under `artifacts/marketing/launch/2025-10-PT` after tooltip + schedule lock | `feedback/marketing.md`, `artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json`, `artifacts/monitoring/supabase-sync-summary-latest.json`, `artifacts/monitoring/synthetic-check-2025-10-10T02-31-11.417Z.json` | Supabase parity + staging smoke captured; awaiting full NDJSON export + launch window before packaging. Pinged reliability in `#occ-reliability` at 2025-10-10 19:05 UTC for NDJSON + sustained synthetic evidence | 2025-10-10T19:05:00Z |
| 7 | Update campaign calendar with confirmed dates + KPI check-ins | ⛔ Blocked | Marketing | Translate milestone placeholders to calendar dates immediately after launch window lands | `docs/marketing/campaign_calendar_2025-10.md` | Dependent on product providing go-live timeline | 2025-10-09T21:11:40Z |
| 8 | Distribute operator FAQ + training script to enablement/support | 🚧 In progress | Marketing | Circulate updated FAQ + training script (includes Shopify rate-limit snippet) once design overlays land; attach approvals in `feedback/marketing.md` | `docs/marketing/launch_faq.md`, `docs/marketing/support_training_script_2025-10-16.md`, `docs/enablement/job_aids/shopify_sync_rate_limit_coaching.md` | Staging credentials delivered; still waiting on design tooltip overlays before final handoff | 2025-10-10T02:35:00Z |

## Blockers & Escalations
- **Product launch window:** No response since 2025-10-09 20:25 ET follow-up. Escalate to manager if silence persists past 2025-10-10 14:00 UTC.
- **Design tooltip overlays:** Commitment to deliver 2025-10-10 AM ET; marketing to notify engineering immediately once received.
- **Telemetry dependencies:** Supabase staging secrets + parity artifact delivered (see `feedback/reliability.md`, `artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json`); still waiting on full NDJSON export + KPI rerun before shipping comms narrative.

## Notes
- Restart cycle alignment complete per `docs/runbooks/restart_cycle_checklist.md`; marketing backlog now mirrors sprint focus in `docs/directions/marketing.md`.
- Once blockers clear, update this backlog and attach evidence links in `feedback/marketing.md` as required by direction canon.
- Launch comms packet now includes placeholders for tooltip overlays, `?mock=0` smoke, and refreshed NDJSON (`docs/marketing/launch_comms_packet.md`) so evidence can slot in immediately after QA sign-off; enablement mirrored the same table in `docs/enablement/dry_run_training_materials.md`.
