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

[Archived] 2025-10-16 objectives moved to docs/_archive/directions/data-2025-10-16.md


## Tomorrow’s Objective (2025-10-17) — Approvals/Audit Foundation

Status: ACTIVE
Priority: P0 — Ship reversible migrations + RPCs for approvals/audit

Tasks (initial 8)
1) Apply approvals/audit migrations locally; include rollback scripts
2) Seed 5 approvals rows (mixed states) for demo; document provenance
3) Implement RPCs: get_approvals_list, get_approvals_queue_tile
4) Add EXPLAIN ANALYZE notes and ensure P95 <100ms for key queries
5) Write RLS policies and tests; verify least-privilege
6) Provide sample SQL/ts queries to Engineer for tiles
7) Evidence bundle: timings, EXPLAIN output, rollback plan
8) WORK COMPLETE block with links

Allowed paths: supabase/migrations/**, supabase/functions/**, docs/specs/**, tests/**

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

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified


## Backlog (Sprint-Ready — 25 tasks)
1) Approvals tables (approvals, grades, edits) + RLS
2) Audit log table (append-only) + constraints
3) Inventory tables (snapshots, lead_times, payouts)
4) CX metrics tables (sla, response_times)
5) Growth metrics tables (seo, ads, content)
6) RPC: approvals list w/ filters
7) RPC: dashboard aggregates per tile
8) RPC: SEO anomalies feed
9) RPC: ads performance aggregates
10) RPC: content engagement aggregates
11) Views for tiles (materialized where needed)
12) Indexes for P95 < 3s tile loads
13) Row-level security policies per role
14) Triggers for audit logging on writes
15) Seeds/fixtures for dev
16) Nightly rollups + cron
17) Backup/restore scripts (local)
18) Data retention policies
19) Schema docs in docs/specs
20) Query performance dashboard
21) Test harness for RPCs
22) Migrations rollback verification
23) Data quality checks (not null, ranges)
24) Error budgets & alerts for DB
25) ETL for historical imports (if needed)
