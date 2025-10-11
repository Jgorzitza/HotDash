---
epoch: 2025.10.E1
doc: docs/directions/data.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Data — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Data team must not create or edit direction files; route change proposals to manager with evidence.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands and scripts without approval. Guardrails:

- Scope: local repo and local Supabase; do not alter remote infra under auto-run. Status/read-only checks are fine.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/data.md; store analyzer outputs in artifacts/data/.
- Secrets: load from vault/env; never print values.
- Tooling: npx supabase locally; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: 2 attempts then escalate with logs.

- Model KPI definitions (sales delta, SLA breach rate, traffic anomalies) and publish dbt-style specs in docs/data/
- Validate Shopify/Chatwoot/GA data contracts; raise schema drift within 24h via feedback/data.md.
- Implement anomaly thresholds + forecasting in Memory service; surface assumptions alongside facts.
- Partner with engineer to add Prisma seeds/backfills; own migration QA for dashboards on the Supabase Postgres stack (local via `supabase start`, staging via vault secrets).
- Maintain GA MCP mock dataset and swap to live host once credentials land; ensure caching + rate limits measured.
- Supply curated document feeds (Supabase decision/telemetry extracts, Chatwoot gold replies, website snapshots) for LlamaIndex ingestion and record refresh cadence with compliance sign-off.
- Tail Supabase logs (`scripts/ops/tail-supabase-logs.sh`) when running parity scripts to capture evidence alongside analyzer outputs.
- Stack guardrails: follow `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex); no Fly Postgres provisioning. PRs that introduce alternate databases will be blocked by the Canonical Toolkit Guard.
- Reference docs/dev/admin-graphql.md for admin data contracts and docs/dev/storefront-mcp.md for customer-facing datasets.
- Provide weekly insight packet (charts + narrative) attached in manager status with reproducible notebooks.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/data.md` without waiting for additional manager confirmation.

## Current Sprint Focus — 2025-10-10
Execute these tasks in order and log progress in `feedback/data.md`. For every command or outreach, capture the timestamp and outcome; retry twice before escalating with evidence.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/data.md and continue):

1. ✅ **Database Health Audit** - COMPLETE (2025-10-11, 30 min)
   - RLS coverage improved 25% → 100%
   - 3 migrations applied for security gaps
   - Evidence: 12 artifacts, 900+ lines documentation

2. **Agent SDK Database Schemas** - Create tables for approval queue and training data
   - Create migration for agent_approvals table (id, conversation_id, serialized, last_interruptions, created_at, approved_by, status)
   - Create migration for agent_feedback table (id, conversation_id, input_text, model_draft, safe_to_send, labels, rubric, annotator, notes, meta)
   - Create migration for agent_queries table (id, query, result, conversation_id, agent, approved, human_edited, latency_ms, created_at)
   - Add RLS policies: service role can write, app can read own data
   - Add indexes on conversation_id and created_at for all 3 tables
   - Test migrations on local Supabase with sample data
   - Document rollback procedures
   - Coordinate: Tag @engineer in feedback when schemas ready
   - Evidence: Migrations in prisma/migrations/, test data inserted, documented in feedback/data.md

3. **Agent Training Data Pipeline** - Support AI feedback loop
   - Create seed data for agent testing (sample conversations, approvals, queries)
   - Write helper scripts for data insertion and cleanup
   - Document data retention policy (30 days for training data)
   - Test data integrity and RLS protection
   - Evidence: Seed scripts, test results

4. **Performance Monitoring Queries** - Create views for agent metrics
   - Create view for approval queue depth over time
   - Create view for agent response accuracy metrics
   - Create view for training data quality scores
   - Add to nightly metrics rollup
   - Evidence: View definitions, sample queries

**Ongoing Requirements**:
- Coordinate with @engineer on schema access patterns
- Log all schema changes in feedback/data.md
- Test all migrations locally before proposing for staging

---

### 🚀 ADDITIONAL PARALLEL TASKS (Since Task 2 Complete)

**Execute these while Engineer works on Shopify fixes and LlamaIndex MCP**:

**Task A: Agent Metrics Dashboard Design** - Create monitoring views
- Design database views for agent performance metrics
- Create view for approval queue depth over time
- Create view for response accuracy by agent type
- Create view for training data quality scores
- Document query patterns for dashboard tiles
- Evidence: View SQL definitions, sample queries

**Task B: Data Retention Automation** - Implement 30-day purge
- Create script for agent data retention (30-day window)
- Implement automated cleanup for old approval records
- Create backup procedure before purge
- Test on sample data
- Document in runbook
- Evidence: Cleanup script, test results

**Task C: Performance Monitoring Queries** - Optimize database performance
- Create indexes for agent query patterns
- Analyze slow query logs
- Document optimization opportunities
- Test index effectiveness
- Evidence: Index definitions, performance comparison

Execute A, B, C in any order. All independent of Engineer work.

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task D: Real-time Analytics Pipeline**
- Design real-time analytics for agent performance
- Create streaming data pipeline specification
- Plan for live dashboard updates
- Document data freshness requirements
- Evidence: Real-time pipeline design

**Task E: Data Warehouse Design**
- Design dimensional model for agent analytics
- Create fact and dimension table specifications
- Plan for historical data analysis
- Document ETL processes
- Evidence: Data warehouse schema

**Task F: Query Performance Optimization**
- Analyze query execution plans for agent tables
- Create additional indexes where beneficial
- Implement query result caching strategy
- Document optimization recommendations
- Evidence: Performance optimization report

**Task G: Data Quality Framework**
- Create data quality validation rules
- Design data quality monitoring
- Implement automated quality checks
- Document data quality metrics
- Evidence: Data quality framework

**Task H: Agent Training Data Export**
- Create export utilities for training data
- Design export formats (CSV, JSON, parquet)
- Implement privacy-preserving export (PII redaction)
- Document export procedures
- Evidence: Export utility scripts

**Task I: Database Backup Automation**
- Implement automated backup procedures for agent tables
- Create backup verification scripts
- Document recovery procedures
- Test restore process
- Evidence: Backup automation, test results

**Task J: Analytics API Design**
- Design REST API for agent metrics queries
- Document API endpoints and responses
- Create API security specifications
- Plan for API rate limiting
- Evidence: Analytics API specification

Execute D-J in any order - all enhance data infrastructure.

---

### 🚀 FOURTH MASSIVE EXPANSION (Another 25 Tasks)

**Task K-P: Advanced Data Engineering** (6 tasks)
- K: Design data streaming platform (Kafka/Kinesis style)
- L: Create data catalog with lineage tracking
- M: Implement data versioning and time travel
- N: Design data quality profiling automation
- O: Create data discovery and search system
- P: Implement data governance framework

**Task Q-V: Machine Learning Infrastructure** (6 tasks)
- Q: Design feature engineering pipeline
- R: Create model training and experimentation platform
- S: Implement model serving and inference infrastructure
- T: Design model monitoring and drift detection
- U: Create ML experiment tracking system
- V: Implement automated model retraining pipeline

**Task W-AB: Analytics & BI** (6 tasks)
- W: Design self-service analytics platform for operators
- X: Create embedded analytics SDK
- Y: Implement real-time analytics engine
- Z: Design predictive analytics framework
- AA: Create business intelligence dashboards
- AB: Implement data storytelling and narrative generation

**Task AC-AG: Data Operations** (7 tasks)
- AC: Design data pipeline orchestration (Airflow-style)
- AD: Create data observability platform
- AE: Implement data SLA monitoring
- AF: Design data incident response procedures
- AG: Create data ops automation toolkit

Execute K-AG in any order. Total: 49 tasks, ~25-30 hours work.

---

### 🚀 FIFTH MASSIVE EXPANSION (Another 20 Tasks)

**Task AH-AL: Data Quality** (5 tasks)
- AH: Design data validation rules engine
- AI: Create data cleansing automation
- AJ: Implement data consistency monitoring
- AK: Design data completeness tracking
- AL: Create data quality dashboards

**Task AM-AQ: Advanced Analytics** (5 tasks)
- AM: Design cohort analysis framework
- AN: Create funnel analysis platform
- AO: Implement retention analysis tools
- AP: Design attribution modeling system
- AQ: Create experimentation analysis framework

**Task AR-AV: Data Platform** (5 tasks)
- AR: Design data mesh architecture
- AS: Create data products catalog
- AT: Implement data democratization platform
- AU: Design self-service data access
- AV: Create data literacy program

**Task AW-AZ: Data Science Infrastructure** (5 tasks)
- AW: Design notebook environment (Jupyter-style)
- AX: Create model registry and versioning
- AY: Implement feature store
- AZ: Design AutoML platform
- BA: Create model explainability tools

Execute AH-BA in any order. Total: 69 tasks, ~35-40 hours work.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 15 Additional Tasks

**Task K-O: Advanced Analytics** (5 tasks)
- K: Design predictive analytics for agent performance forecasting
- L: Create customer churn risk scoring based on support interactions
- M: Implement anomaly detection for conversation patterns
- N: Design cohort analysis for pilot customer behavior
- O: Create attribution modeling for agent-assisted conversions

**Task P-T: Data Engineering** (5 tasks)
- P: Design data lakehouse architecture for long-term storage
- Q: Create data cataloging and discovery system
- R: Implement data lineage tracking
- S: Design data quality monitoring dashboards
- T: Create automated data documentation generation

**Task U-Y: ML/AI Data Infrastructure** (5 tasks)
- U: Design feature store for ML models
- V: Create training dataset versioning system
- W: Implement A/B testing data infrastructure
- X: Design model performance monitoring
- Y: Create automated model retraining pipeline

Execute K-Y in any order. Total: 24 tasks, ~15-18 hours of data work.

## Previous Task List — 2025-10-11
- Supabase only
  - Ensure read-only roles and RLS in place; provide gold-reply webhook endpoint + secret path to Chatwoot/Support.
- Shopify contracts
  - Use Shopify Dev MCP for Admin schema references; do not guess shapes.
- Evidence
  - Tail Supabase logs when running parity scripts; attach outputs and timestamps in `feedback/data.md`.

1. **Supabase access hardening** — Run through `docs/runbooks/supabase_local.md` to verify `supabase start`, `npm run setup`, and pgvector availability. Provision (or confirm) a least-privilege read-only role for AI ingestion, record credentials in vault per `docs/ops/credential_index.md`, and log evidence.
2. **Decision/telemetry readiness** — Validate the `decision_sync_events` and telemetry tables contain current data, add missing indexes if queries lag, and export schema snapshots to `artifacts/data/supabase-schema-<timestamp>.sql`. Update `docs/runbooks/incident_response_supabase.md` with the latest state.
3. **Gold reply schema** — Design and apply a Supabase migration (e.g., `supabase/migrations/*_chatwoot_gold_replies.sql`) that captures curated Chatwoot replies (message body, tags, approver, timestamps). Coordinate with Support to document the approval workflow and ensure RLS is enforced; include evidence.
4. **Chatwoot ingest bridge** — Build a storage procedure or REST endpoint (document scope) so Support’s webhook can insert curated replies. Deliver a test payload, validate inserts, and log parity results under `artifacts/monitoring/chatwoot-gold-<timestamp>.json`.
5. **LlamaIndex data feeds** — Generate a hotrodan.com sitemap snapshot (timestamp + size) and deliver to AI via Supabase storage or artifacts; confirm the Supabase view powering `SupabaseReader` exposes the required columns/filters.
6. **Evaluation dataset** — Maintain a labeled Q/A set derived from decision logs + support replies for AI regression (store under `artifacts/ai/eval/`). Update instructions in `docs/runbooks/llamaindex_workflow.md` once AI lands it.
7. **Stack compliance audit** — Participate in the Monday/Thursday review with QA/manager, focusing on data pipeline access and retention; document findings in `feedback/data.md`.
8. **Insight preparation** — Keep weekly insight notebooks prepped (metrics + narrative) so they can ship immediately after latency and embed-token blockers clear.
