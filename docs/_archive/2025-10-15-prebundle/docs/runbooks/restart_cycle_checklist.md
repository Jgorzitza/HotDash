---
epoch: 2025.10.E1
doc: docs/runbooks/restart_cycle_checklist.md
owner: product
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-18
---

# Restart Cycle Checklist — Operator Control Center

## Purpose

Ensure every service restart or environment recycle follows a repeatable sequence that preserves operator telemetry, protects in-flight work, and records evidence for audit trails. This checklist aligns with direction governance (`docs/directions/product.md`) and the deployment protocol (`docs/git_protocol.md`).

## Preconditions

- You have an assigned restart window and communication plan approved in `feedback/manager.md`.
- Local workspace is on the correct branch (`agent/<role>/<task>` or `main`) with latest changes pulled.
- Required credentials (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, Shopify Admin API demo shop, etc.) are present locally and in CI.
- Alerting partners (reliability, enablement, support) acknowledged the restart window in # `#occ-launch`.

## Checklist

| Step | Action                                                                                                                                                                 | Evidence / Notes                                                                                        |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1    | Run `git status -sb` and capture screenshot or text snippet for the restart record.                                                                                    | Attach output to `feedback/<role>.md` if any unexpected changes appear.                                 |
| 2    | Execute `git stash push --include-untracked --message "restart-cycle-YYYY-MM-DD"` to snapshot local work.                                                              | Record resulting stash ID (e.g., `stash@{0}`) in `feedback/product.md` under **Restart Cycle** section. |
| 3    | Verify `git stash list` includes the new entry; confirm no other uncommitted work remains.                                                                             | If stash fails (clean tree), explicitly note the clean state in the feedback log.                       |
| 4    | Capture current monitoring artifacts prior to restart: `artifacts/monitoring/supabase-sync-summary-latest.json`, synthetic check logs, and any feature flag overrides. | Link artifacts in the feedback log so telemetry deltas can be compared post-restart.                    |
| 5    | Coordinate go/no-go with reliability and deployment; confirm Supabase decision sync and staging secrets remain intact after restart.                                   | Update `feedback/product.md` and ping reliability if anomalies surface.                                 |
| 6    | Execute restart script/runbook steps (see `docs/deployment/production_go_live_checklist.md` or environment-specific guide).                                            | Note the exact command(s) and timestamps in the feedback log.                                           |
| 7    | Post-restart validation: run smoke tests (`npm run test:smoke` or agreed subset), confirm dashboards render, and check Supabase telemetry ingestion.                   | Log results and any regressions, including links to updated artifacts.                                  |
| 8    | If blockers remain, create follow-up task in Linear (OCC-###) with evidence links; tag owning teams.                                                                   | Reference backlog updates in `feedback/product.md` to maintain audit trail.                             |
| 9    | Once validation passes, notify stakeholders in `#occ-launch` and close the restart cycle entry in the feedback log with final status.                                  | Include stash pop instructions if remaining work must resume (`git stash pop stash@{n}`).               |

## Reminders

- Do **not** delete stashes created for restart cycles until all teams confirm work completed or rescheduled.
- Update this runbook only via manager-approved change requests (direction governance).
- Archive restart evidence bundles older than 30 days under `artifacts/archive/restart-cycles/`.
