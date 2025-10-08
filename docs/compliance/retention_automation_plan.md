---
epoch: 2025.10.E1
doc: docs/compliance/retention_automation_plan.md
owner: compliance
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-21
---
# Retention Automation Plan — Prisma & Supabase

## Objectives
- Enforce defined retention periods for operational data captured by HotDash.
- Provide implementation guidance for engineering/reliability teams.
- Supply evidence for auditors once automations are live.

## Target Policies (from `docs/compliance/data_inventory.md`)
| Dataset | System | Retention Target | Notes |
| --- | --- | --- | --- |
| `Session` records | Prisma | 90 days or on session expiry | Delete expired OAuth sessions + revoke tokens.
| Shopify facts (`factType=shopify.*`) | Prisma | 30 days | Includes sales, fulfillment, inventory.
| GA anomalies (`factType=ga.sessions.anomalies`) | Prisma | 30 days | Applies once MCP live.
| Chatwoot escalations facts (`factType=chatwoot.escalations`) | Prisma | 14 days | Contains transcript snippets.
| Supabase `decision_log` | Supabase | 12 months | Mirror of Prisma decisions.
| Supabase `facts` (dashboard analytics) | Supabase | 180 days | Emails + tile context.

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

### 4. Runbook Updates
- Update `docs/runbooks/backup_restore.md` to mention purge job (post-implementation).
- Document manual purge verification steps in reliability runbook.

## Deliverables & Owners
| Task | Owner | Due |
| --- | --- | --- |
| Implement Prisma purge script + CI wiring | Engineering | 2025-10-14 |
| Configure Supabase pg_cron job | Reliability | 2025-10-14 |
| Provide first-run evidence | Reliability | 2025-10-15 |
| Update documentation/runbooks | Compliance (review), Engineering (execution) | 2025-10-16 |

## Evidence Checklist
- [ ] PR with purge script + tests merged.
- [ ] Supabase cron screenshot saved.
- [ ] First run log archived.
- [ ] Feedback log updated after go-live.

Pending items tracked in `feedback/compliance.md` (R1).
