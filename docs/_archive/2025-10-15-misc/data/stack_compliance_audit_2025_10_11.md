---
epoch: 2025.10.E1
doc: docs/data/stack_compliance_audit_2025_10_11.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Stack Compliance Audit — 2025-10-11

**Purpose:** Document data pipeline access and retention for Monday/Thursday manager review  
**Scope:** Supabase-only Postgres stack, RLS policies, AI access, data retention  
**Status:** ✅ COMPLIANT with docs/directions/README.md#canonical-toolkit  

---

## Stack Guardrails Compliance

### ✅ Canonical Toolkit (Supabase-Only)

**Requirement:** Follow `docs/directions/README.md#canonical-toolkit--secrets`
- Supabase-only Postgres
- Chatwoot on Supabase
- React Router 7
- OpenAI + LlamaIndex

**Current State:**
- ✅ All database operations on Supabase Postgres (local: 127.0.0.1:54322)
- ✅ No Fly Postgres provisioned (blocked by Canonical Toolkit Guard)
- ✅ No alternative databases (MongoDB, Redis, etc.)
- ✅ Chatwoot integration via `support_curated_replies` table
- ✅ React Router 7 data loaders for dashboard tiles
- ✅ OpenAI + LlamaIndex configured for AI workflows

**Evidence:** All migrations in `supabase/migrations/`, no other DB configs

---

## Data Pipeline Access

### Database Roles & Permissions

**Service Role (postgres):**
- Full access to all tables
- Used for: Migrations, admin operations, edge functions
- Security: Credentials in vault/env

**AI Readonly Role:**
- **Username:** ai_readonly
- **Grants:** SELECT only on:
  - decision_sync_event_logs
  - support_curated_replies
  - facts
  - decision_sync_events (view)
- **Purpose:** LlamaIndex SupabaseReader ingestion
- **Created:** 2025-10-11 20:50 UTC
- **Security:** Least-privilege, no write access
- **Credentials:** vault/ai_readonly_credentials.txt

**Authenticated Role:**
- Used by: Shopify app users
- RLS: Row-level security enforced on all tables
- Access: Project/scope-based isolation

### RLS Policy Coverage

**Tables with RLS Enabled (7 total):**
1. ✅ `facts` - 6 policies (project isolation, no update/delete)
2. ✅ `decision_sync_event_logs` - 6 policies (scope isolation)
3. ✅ `observability_logs` - 5 policies (service role + monitoring team)
4. ✅ `agent_approvals` - 6 policies (conversation isolation)
5. ✅ `agent_feedback` - 6 policies (annotator + QA access)
6. ✅ `agent_queries` - 6 policies (operator readonly)
7. ✅ `support_curated_replies` - 2 policies (webhook insert, AI read)

**Total Policies:** 37 active RLS policies  
**Coverage:** 100% of application tables  
**Audit Trail:** All policies logged in migrations with rollback scripts

---

## Data Retention Policies

### Agent SDK Tables (30-Day Retention)

**agent_approvals:**
- Retention: 30 days
- Reason: Training data freshness
- Cleanup: `scripts/data/retention-cleanup.sh`
- Exceptions: Approved records retained 90 days

**agent_feedback:**
- Retention: 30 days
- Reason: Annotation relevance
- Cleanup: `scripts/data/retention-cleanup.sh`
- Exceptions: Safe-to-send=true retained 90 days

**agent_queries:**
- Retention: 30 days
- Reason: Query pattern analysis
- Cleanup: `scripts/data/retention-cleanup.sh`
- Exceptions: Approved queries retained 90 days

**Automated Cleanup:**
- Script: `scripts/data/retention-cleanup.sh`
- Schedule: Weekly (recommended via cron)
- Verification: Test results in artifacts/data/
- Safety: Dry-run mode, backup before purge

### Operational Tables (Permanent Retention)

**decision_sync_event_logs:**
- Retention: Permanent
- Reason: Audit trail, decision history
- Archival: Not yet implemented

**support_curated_replies:**
- Retention: Permanent
- Reason: Gold knowledge base
- Growth: Incremental (Support team curated)

**facts:**
- Retention: 2 years
- Reason: Historical KPI trends
- Archival: Cold storage after 6 months (future)

**observability_logs:**
- Retention: 90 days
- Reason: Incident investigation window
- Cleanup: Manual purge (future automation)

---

## Data Access Patterns

### AI Ingestion (LlamaIndex)

**Source Tables:**
1. decision_sync_event_logs (decision history)
2. support_curated_replies (gold answers)
3. facts (KPI time series)

**Access Method:**
- SupabaseReader via ai_readonly role
- Read-only SELECT queries
- No write permissions

**Refresh Cadence:**
- Decision logs: Real-time (as decisions occur)
- Curated replies: On webhook trigger (Chatwoot)
- Facts: Every 15-30 minutes (tile updates)

**Compliance:**
- ✅ Documented in docs/runbooks/llamaindex_workflow.md
- ✅ PII redaction not yet required (no customer PII in ingested tables)
- ✅ Compliance sign-off: Pending with manager

### Dashboard Tiles (Operator UI)

**Source Views:**
1. v_agent_performance_snapshot
2. v_approval_queue_status
3. v_training_data_quality
4. mv_realtime_agent_performance (materialized)

**Access Method:**
- React Router 7 loaders
- Service role queries
- <10ms performance target

**Refresh:**
- Real-time: pg_notify triggers
- Materialized: Every 5 minutes
- Dashboard: Live updates via WebSocket

---

## Security Audit

### Access Control Matrix

| Role | Tables | Permissions | Purpose |
|------|--------|-------------|---------|
| postgres (service) | All | Full | Admin, migrations |
| ai_readonly | 4 tables | SELECT | LlamaIndex ingestion |
| authenticated | All (RLS) | Project/scope isolated | Shopify app users |
| operator_readonly | agent_queries, decision_logs | SELECT | Operator dashboards |
| annotator | agent_feedback | SELECT, UPDATE | QA annotation |
| qa_team | agent_feedback, decision_logs | SELECT | Quality review |
| monitoring_team | observability_logs | SELECT | Incident response |

### Credential Storage

**Vault Structure (vault/):**
- ✅ `ai_readonly_credentials.txt` - AI role credentials
- ✅ `.env.local` - Local Supabase connection
- 🔐 Production secrets via GitHub environments (not in repo)

**Credential Rotation:**
- AI readonly: Rotate quarterly
- Service role: Rotate on team changes
- Documented: docs/ops/credential_index.md

---

## Compliance Findings

### ✅ Pass Criteria

1. ✅ Supabase-only stack (no alternate databases)
2. ✅ 100% RLS coverage on application tables
3. ✅ Least-privilege AI access (read-only)
4. ✅ Data retention policies documented
5. ✅ Automated cleanup scripts ready
6. ✅ Audit trail (37 RLS policies logged)
7. ✅ Credentials secured in vault

### ⚠️ Action Items

1. **Implement automated retention cleanup**
   - Schedule: Weekly cron job
   - Target: 2025-10-15
   - Owner: data + engineer

2. **Compliance sign-off for AI ingestion**
   - Pending: Manager review
   - Target: 2025-10-12
   - Blocker: Awaiting direction

3. **Observability logs automation**
   - Current: Manual purge
   - Future: 90-day auto-cleanup
   - Target: Post-launch

4. **Cold storage archival**
   - Current: Not implemented
   - Future: facts table >6 months to S3
   - Target: Q4 2025

---

## Monday/Thursday Review Checklist

**For Manager Review:**

- [x] Stack compliance verified (Supabase-only)
- [x] RLS coverage 100% (37 policies)
- [x] AI access least-privilege (ai_readonly)
- [x] Data retention policies documented
- [x] Automated cleanup scripts ready
- [x] Credential management compliant
- [ ] Weekly cleanup automation scheduled (action item)
- [ ] AI ingestion compliance sign-off (pending manager)

**Evidence Attached:**
- feedback/data.md (3,000+ lines)
- supabase/migrations/ (12 files)
- vault/ai_readonly_credentials.txt
- scripts/data/retention-cleanup.sh
- docs/data/kpi_definitions.md
- docs/data/data_contracts_validation.md

---

**Status:** ✅ COMPLIANT with canonical toolkit  
**Next Review:** 2025-10-14 (Monday)  
**Owner:** data agent  
**Escalations:** None - all findings have action plans

