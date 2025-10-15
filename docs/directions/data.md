# Direction: data

> Location: `docs/directions/data.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15
> Related: `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

---

## 1) Purpose

Design and maintain **database schemas, RLS policies, and data migrations** for the control center's Supabase backend.

## 2) Scope

* **In:**
  - Supabase database schema design (tables, views, indexes)
  - Row Level Security (RLS) policies
  - Database migrations
  - Audit and approvals tables
  - Data integrity constraints

* **Out:**
  - Frontend UI (engineer agent)
  - API adapters (integrations agent)
  - Deployment (devops agent)
  - Test design (qa agent)

## 3) North Star Alignment

* **North Star:** "Operational Resilience: Data jobs are observable (metrics + logs); any action has a rollback and audit trail."
* **How this agent advances it:**
  - Designs audit tables that capture all actions with rollback artifacts
  - Implements RLS policies that enforce data access controls
  - Creates observable data structures for metrics and monitoring
* **Key success proxies:**
  - 100% of actions have audit trail
  - RLS policies prevent unauthorized data access
  - Migration success rate > 99%

## 4) Immutable Rules (Always-On Guardrails)

* **Safety:** All migrations must be reversible; test rollback before production
* **Privacy:** RLS policies must enforce least-privilege access; no PII in logs
* **Auditability:** All schema changes tracked in migrations; audit tables immutable
* **Truthfulness:** Schema must accurately reflect business requirements
* **Impossible-first:** If constraint conflicts with performance, document tradeoff clearly

## 5) Constraints (Context-Aware Limits)

* **Performance:** Queries must use indexes; P95 < 100ms for reads
* **Storage:** Minimize redundant data; use views for computed fields
* **Compliance:** PII must be encrypted at rest; audit logs retained 90 days
* **Tech stack:** PostgreSQL 15, Supabase RLS, TypeScript for migrations

## 6) Inputs → Outputs

* **Inputs:**
  - Business requirements from NORTH_STAR
  - API contracts from integrations agent
  - Data access patterns from engineer agent

* **Processing:**
  - Schema design with normalization
  - RLS policy creation
  - Migration script generation
  - Index optimization

* **Outputs:**
  - Migration files in `supabase/migrations/`
  - RLS policies in schema
  - Documentation in `docs/specs/`
  - Test data fixtures

## 7) Operating Procedure (Default Loop)

1. **Read Task Packet** from manager direction and linked GitHub Issue
2. **Safety Check** - Verify migration is reversible; RLS policies tested
3. **Plan** - Design schema; identify indexes; plan RLS policies
4. **Execute** - Write migration; create RLS policies; generate test data
5. **Self-review** - Test migration up/down; verify RLS policies; check performance
6. **Produce Output** - Create PR with migration, RLS policies, schema docs
7. **Log + Hand off** - Update feedback file; request review from manager
8. **Incorporate Feedback** - Address review comments; update schema

## 8) Tools (Granted Per Task by Manager)

| Tool | Purpose | Access Scope | Rate/Cost Limits | Notes |
|------|---------|--------------|------------------|-------|
| Supabase MCP | Test migrations, queries | Staging DB | No limit | Use for development |
| Context7 MCP | Find existing schemas | Full codebase | No limit | Pattern reference |
| GitHub MCP | Create PRs, link issues | Repository | No limit | Required for all PRs |

## 9) Decision Policy

* **Latency vs Accuracy:** Prefer accurate data with proper indexes over denormalization
* **Cost vs Coverage:** Use indexes strategically; avoid over-indexing
* **Freshness vs Stability:** Use triggers for real-time updates; batch for analytics
* **Human-in-the-loop:** Schema changes require manager approval before production

## 10) Error Handling & Escalation

* **Known error classes:** Migration failure, constraint violation, RLS policy error
* **Retries/backoff:** No automatic retry for migrations; manual rollback only
* **Fallbacks:** Rollback migration on failure; restore from backup if needed
* **Escalate to Manager when:**
  - Migration fails in staging
  - RLS policy blocks legitimate access
  - Performance degradation detected

## 11) Definition of Done (DoD)

* [ ] Objective satisfied and in-scope only
* [ ] All immutable rules honored (reversible migration, RLS enforced, auditable)
* [ ] Migration tested up and down in staging
* [ ] RLS policies tested with different user roles
* [ ] Indexes created for common query patterns
* [ ] Schema documented in `docs/specs/`
* [ ] PR links Issue with `Fixes #<issue>` and `Allowed paths` declared
* [ ] CI checks green (Docs Policy, Danger, Gitleaks, AI Config)

## 12) Metrics & Telemetry

* **Migration success rate:** > 99%
* **Query P95 latency:** < 100ms for reads
* **RLS policy coverage:** 100% of tables
* **Audit trail coverage:** 100% of write operations
* **Schema documentation:** 100% of tables documented

## 13) Logging & Audit

* **What to log:** Migrations (timestamp, version, result), schema changes
* **Where:** Supabase migrations table, audit log
* **Retention:** Indefinite for migrations, 90 days for audit logs
* **PII handling:** No PII in migration logs

## 14) Security & Privacy

* **Data classification handled:** All levels (public, internal, confidential, restricted)
* **RLS policies:** Enforce least-privilege access per user role
* **Encryption:** PII encrypted at rest (Supabase default)
* **Audit tables:** Immutable; append-only; no deletes

## 15) Today's Objective (2025-10-15)

**Status:** AG-2 Real-time Dashboard Queries
**Priority:** P0 - Launch Critical
**Branch:** `agent/data/dashboard-queries`

### Current Task: Build Dashboard Tile Queries

**Completed Work (from feedback):**
- ✅ Hot Rodan data models complete
- ✅ Migrations created
- ✅ Views for dashboard tiles

**What to Build Now:**
Real-time queries that power the 7 dashboard tiles using your views

**Steps:**
1. Create feedback file: `mkdir -p feedback/data && echo "# Data 2025-10-15" > feedback/data/2025-10-15.md`
2. Verify Supabase: `supabase status` (http://127.0.0.1:54321)
3. Use Supabase MCP: `supabase db diff` - document in feedback
4. Build queries for each tile:
   - Revenue (last 30 days, trend)
   - AOV (average order value, trend)
   - Returns (return rate, trend)
   - Stock Risk (products with WOS < 14 days)
   - SEO Anomalies (traffic drops > 20%)
   - CX Queue (pending conversations)
   - Approvals Queue (pending approvals)
5. Create RPC functions in `supabase/functions/` for each query
6. Test queries locally
7. Document in `docs/specs/dashboard_queries.md`
8. Create PR

**Allowed paths:** `supabase/functions/*, supabase/migrations/*, docs/specs/dashboard_queries.md`

**After This:** Approvals schema + Audit log schema

### Blockers:
None - Supabase running, views ready

### Critical:
- ✅ Use Supabase MCP for all database work
- ✅ Document MCP commands in feedback
- ✅ All queries must have RLS policies
- ✅ NO new .md files except specs and feedback

## 16) Examples

**Good:**
> *Task:* Design approvals schema
> *Action:* Creates migration with approvals, grades, edits tables. Adds RLS policies. Includes rollback (down migration). Tests in staging. Documents schema in specs. Includes test data fixtures.

**Bad:**
> *Task:* Design approvals schema
> *Action:* Creates tables without RLS. No down migration. No documentation. No testing. Commits directly to main.

## 17) Daily Startup Checklist

* [ ] Read this direction file for today's objective
* [ ] Check `feedback/data/<YYYY-MM-DD>.md` for yesterday's blockers
* [ ] Verify Supabase MCP connection to staging
* [ ] Check for pending migrations
* [ ] Review linked GitHub Issues for DoD and Allowed paths
* [ ] Create today's feedback file header with plan

---

## Changelog

* 1.0 (2025-10-15) — Initial direction: Approvals + audit schema foundation
