---
epoch: 2025.10.E1
doc: docs/compliance/retention_automation_plan.md
owner: compliance
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-21
---

# Retention Automation Plan — Prisma & Supabase

## Objectives

- Enforce defined retention periods for operational data captured by HotDash.
- Provide implementation guidance for engineering/reliability teams.
- Supply evidence for auditors once automations are live.

## Target Policies (from `docs/compliance/data_inventory.md`)

| Dataset                                                             | System                                   | Retention Target             | Notes                                            |
| ------------------------------------------------------------------- | ---------------------------------------- | ---------------------------- | ------------------------------------------------ |
| `Session` records                                                   | Prisma                                   | 90 days or on session expiry | Delete expired OAuth sessions + revoke tokens.   |
| Shopify facts (`factType=shopify.*`)                                | Prisma                                   | 30 days                      | Includes sales, fulfillment, inventory.          |
| GA anomalies (`factType=ga.sessions.anomalies`)                     | Prisma                                   | 30 days                      | Applies once MCP live.                           |
| Chatwoot escalations facts (`factType=chatwoot.escalations`)        | Prisma                                   | 14 days                      | Contains transcript snippets.                    |
| Supabase `decision_log`                                             | Supabase                                 | 12 months                    | Mirror of Prisma decisions.                      |
| Supabase `facts` (dashboard analytics)                              | Supabase                                 | 180 days                     | Emails + tile context.                           |
| AI build logs (`packages/memory/logs/build/`)                       | Local filesystem → future artifact store | 30 days                      | Regression outputs + AI recommendation payloads. |
| LlamaIndex snapshot (`packages/memory/indexes/operator_knowledge/`) | Local filesystem → future artifact store | 90 days                      | Vector store regenerated during builds.          |

## Implementation Blueprint

### 1. Prisma Cleanup Script

- **Location**: `scripts/ops/purge-dashboard-data.ts` (TypeScript).
- **Inputs**: Environment variables `RETENTION_FACTS_DAYS`, `RETENTION_ESCALATIONS_DAYS`, `RETENTION_SESSIONS_DAYS` with defaults (30/14/90).
- **Logic**:
  1. Connect to Prisma client.
  2. Delete `DashboardFact` rows by `createdAt` older than thresholds grouped by `factType` prefix.
  3. Delete `Session` rows where `expires` is in the past beyond configured threshold.
  4. Log summary JSON to stdout for audit (`purgeRunId`, counts, duration).
  5. Exit non-zero if Prisma errors occur.
- **Schedule**: Daily via GitHub Actions cron (02:00 UTC) or container task (`npm run ops:purge-dashboard-data`).
- **Evidence**: Capture initial run output and attach to `docs/compliance/evidence/retention_runs/`.
- **Status**: First rerun captured 2025-10-10 (`docs/compliance/evidence/retention_runs/2025-10-15_purge_log.json`); review counts weekly.

### 2. Supabase Retention Function

- **Approach A (preferred)**: Create SQL scheduled task using Supabase pg_cron.
  ```sql
  SELECT cron.schedule('purge_decision_log', '0 3 * * *', $$
    DELETE FROM decision_log WHERE created_at < NOW() - INTERVAL '12 months';
  $$);
  SELECT cron.schedule('purge_facts', '30 3 * * *', $$
    DELETE FROM facts WHERE created_at < NOW() - INTERVAL '180 days';
  $$);
  ```
- **Approach B**: Use REST admin service (Supabase Functions) triggered by GitHub Actions, calling PostgREST endpoint with privileged service key.
- **Logging**: Enable Supabase log ingestion to monitor `DELETE` statements; export monthly report.
- **Evidence**: Store cron creation SQL and Supabase dashboard screenshot in `docs/compliance/evidence/supabase/retention/`.

### 3. Access Controls & Safety

- Ensure purge scripts run with dedicated service account (`RETENTION_SERVICE_KEY`) limited to `DELETE` on target tables.
- Test in staging before production; record results.
- Add feature flag `ENABLE_RETENTION_PURGE` to disable in emergencies.

### 4. AI Logging & Index Rotation

- **AI Recommendation Logs**: Extend `scripts/ai/log-recommendation.ts` pipeline with pre-run cleanup that deletes files in `packages/memory/logs/build/` older than 30 days (use `fs.readdir` + `stat`). Output summary JSON (`purgedFiles`, `retainedFiles`) and archive first run under `docs/compliance/evidence/ai_logging/`.
- **Status**: Manual purge executed 2025-10-10 (see `docs/compliance/evidence/ai_logging/purge_run_2025-10-15.json`); automation wiring with AI engineering pending.
- **LlamaIndex Snapshot**: `scripts/ai/build-llama-index.ts` already removes the entire persist directory before rebuild. Capture checksum (`sha256sum`) of `index_metadata.json` after each build and log in evidence folder for traceability.
- **Future Storage**: When artifacts move to shared bucket, enforce lifecycle policies (30-day logs, 90-day index snapshots) and ensure bucket encryption + access logs enabled.

### 5. Runbook Updates

- Update `docs/runbooks/backup_restore.md` to mention purge job (post-implementation).
- Document manual purge verification steps in reliability runbook.

## Deliverables & Owners

| Task                                        | Owner                                        | Due        |
| ------------------------------------------- | -------------------------------------------- | ---------- |
| Implement Prisma purge script + CI wiring   | Engineering                                  | 2025-10-14 |
| Configure Supabase pg_cron job              | Reliability                                  | 2025-10-14 |
| Provide first-run evidence                  | Reliability                                  | 2025-10-15 |
| Update documentation/runbooks               | Compliance (review), Engineering (execution) | 2025-10-16 |
| Implement AI log cleanup + evidence capture | AI Engineering                               | 2025-10-16 |

## Evidence Checklist

- [ ] PR with purge script + tests merged.
- [ ] Supabase cron screenshot saved.
- [x] First run log archived (`docs/compliance/evidence/retention_runs/2025-10-15_purge_log.json`).
- [x] Feedback log updated after go-live (`feedback/compliance.md` 2025-10-10 entry).

## Audit update 2025-10-11

- AI retention audit: artifacts/compliance/ai_retention_audit_2025-10-11.md
- Findings: see artifacts/compliance/ai_retention_audit_2025-10-11.json
- Blockers: tooling-only review; deeper validation may require jq/python; no infra touched.

Pending items tracked in `feedback/compliance.md` (R1).
