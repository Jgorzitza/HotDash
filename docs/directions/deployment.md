---
epoch: 2025.10.E1
doc: docs/directions/deployment.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Deployment — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Deployment agent must not modify direction docs; request changes via the manager with evidence.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands and scripts without approval. Guardrails:

- Scope and safety: local repo and local Supabase; do not alter remote infra or push git under auto-run. Status/read-only checks are fine.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/deployment.md; store logs under artifacts/deployment/.
- Secrets: use vault/env; never print secret values.
- Tooling: npx supabase locally; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: 2 attempts then escalate with evidence.

- Own environment provisioning and promotion workflows from dev → staging → production; codify scripts in `scripts/deploy/` with documentation.
- Keep CI/CD pipelines gated on evidence artifacts (Vitest, Playwright, Lighthouse) before any deploy job triggers.
- Coordinate with reliability on secrets management and rotation readiness; confirm the current Supabase credentials remain authoritative, propagate `.env.local` guidance to engineers, and keep environment variable matrices under `docs/deployment/` up to date.
- Reference: docs/dev/appreact.md (Admin guide), docs/dev/authshop.md (authenticate.admin), docs/dev/session-storage.md (session persistence).
- Ensure staging maintains parity with production toggles (feature flags, mock/live settings) and is ready for operator dry runs.
- Document rollback and hotfix procedures in `docs/runbooks/` and keep them exercised.
- Stack guardrails: enforce `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex). Remove any Fly Postgres references from scripts/runbooks.
- Log deployment readiness updates, blockers, and approvals in `feedback/deployment.md`.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/deployment.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
Execute the deployment backlog sequentially; you own each task until the evidence proves it is complete. Record every command and output in `feedback/deployment.md`, retry failures twice, and only escalate with the captured logs.

## Aligned Task List — 2025-10-11 (Updated 2025-10-11 Manager Decision)

### 🚨 URGENT P0: Chatwoot Supabase DSN Fix (Priority 1 - Execute Immediately)
**Manager Decision**: Fix Chatwoot database connection - blocking 10-task dependency chain

**Background**:
- Chatwoot Fly app pointing at Supabase pooler (wrong)
- Must point at direct Postgres connection
- Blocks: migrations, health check (503), API token, webhooks, all automation
- Evidence: artifacts/integrations/audit-2025-10-11/chatwoot_readiness_findings.md

**Action Required**:
```bash
# 1. Source correct connection string
cat vault/occ/supabase/database_url_staging.env

# 2. Extract parameters (DIRECT connection, port 5432, NOT pooler port 6543)

# 3. Update Fly secrets
source vault/occ/fly/api_token.env
~/.fly/bin/fly secrets set \
  POSTGRES_HOST="..." \
  POSTGRES_PASSWORD="..." \
  POSTGRES_USER="postgres" \
  POSTGRES_DATABASE="postgres" \
  POSTGRES_PORT="5432" \
  -a hotdash-chatwoot

# 4. Restart app
~/.fly/bin/fly apps restart hotdash-chatwoot

# 5. Verify health check (wait 30s after restart)
sleep 30
curl -I https://hotdash-chatwoot.fly.dev/hc
# Expected: HTTP 200 OK (currently 503)
```

**Evidence Required**:
- Command outputs showing secret updates
- Health check returning 200 OK
- Tag @integrations in feedback when complete

**Timeline**: Complete within 2 hours

**Impact**: Unblocks Integrations, Support, Data agents (10 tasks total)

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**After Chatwoot DSN fix, execute these additional tasks**:

**Task A: Production Environment Setup**
- Create production Fly.io apps for Agent SDK services
- Configure production secrets (don't populate yet)
- Set up production monitoring
- Document production deployment checklist
- Evidence: Production apps created, checklist documented

**Task B: CI/CD Pipeline Enhancement**
- Add Agent SDK services to deployment workflows
- Create staging → production promotion workflow
- Implement deployment gates (tests, security scans)
- Document rollback procedures
- Evidence: Updated GitHub Actions workflows

**Task C: Secret Management Audit**
- Audit all vault/occ/ secrets for completeness
- Verify GitHub Actions secrets match vault
- Document secret rotation schedule
- Create secret refresh procedures
- Evidence: Secret audit report, rotation schedule

**Task D: Fly.io Resource Optimization**
- Review all Fly apps for resource efficiency
- Optimize auto-stop/auto-start configurations
- Document cost optimization opportunities
- Implement resource tagging for cost tracking
- Evidence: Cost optimization report

**Task E: Deployment Automation**
- Create one-command deployment scripts
- Automate secret mirroring
- Implement deployment verification
- Document deployment procedures
- Evidence: Automated deployment scripts

**Task F: Backup and Recovery Testing**
- Test Supabase backup procedures
- Verify Fly.io volume backups
- Test disaster recovery runbooks
- Document recovery time objectives
- Evidence: DR test results, verified procedures

**Task G: Production Monitoring Setup**
- Configure production alerting (errors, latency, costs)
- Set up log aggregation
- Create ops dashboard
- Document on-call procedures
- Evidence: Monitoring configuration, runbooks

**Task H: Security Hardening**
- Review all Fly.io security groups
- Implement network policies
- Configure SSL/TLS for all services
- Document security architecture
- Evidence: Security configuration audit

**Task I: Deployment Documentation**
- Create comprehensive deployment guide
- Document all environments (local, staging, production)
- Create troubleshooting guide
- Document environment parity checklist
- Evidence: Complete deployment documentation

Execute A-I in any order - all prepare for production readiness.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 15 Additional Tasks

**Task J-N: Infrastructure Automation** (5 tasks)
- J: Create infrastructure as code (Terraform or similar) for all Fly apps
- K: Implement automated scaling policies based on load
- L: Design zero-downtime deployment strategy
- M: Create automated rollback on failure detection
- N: Implement blue-green deployment for critical services

**Task O-S: Operational Excellence** (5 tasks)
- O: Create cost monitoring and optimization dashboard
- P: Implement automated resource cleanup (old machines, volumes)
- Q: Design capacity planning and forecasting
- R: Create SRE runbook library for all services
- S: Implement automated incident detection and response

**Task T-X: Security & Compliance** (5 tasks)
- T: Implement secret rotation automation
- U: Create network security audit and hardening
- V: Design DDoS protection and rate limiting strategy
- W: Implement automated security patching
- X: Create compliance evidence collection automation

Execute J-X in any order. Total: 24 tasks, ~15 hours of infrastructure work.

---

### 🎉 OUTSTANDING WORK ON F, G, H - Production Critical Tasks Complete!

**Manager Recognition**: Excellent prioritization and execution on HIGH priority tasks.

---

### 🚀 FOURTH MASSIVE EXPANSION (Another 25 Tasks)

**Task Y-AD: Advanced Deployment** (6 tasks)
- Y: Implement progressive deployment (canary, staged rollout)
- Z: Create deployment pipeline optimization (faster deploys)
- AA: Design multi-region deployment strategy
- AB: Implement deployment verification automation
- AC: Create deployment approval workflow for production
- AD: Design deployment analytics and insights

**Task AE-AJ: Cost & Resource Management** (6 tasks)
- AE: Create detailed cost allocation and tracking
- AF: Implement automated cost alerts and budgets
- AG: Design resource right-sizing recommendations
- AH: Create reserved capacity planning
- AI: Implement spot instance strategy for dev/staging
- AJ: Design cost showback/chargeback system

**Task AK-AP: Observability & Monitoring** (6 tasks)
- AK: Design distributed tracing implementation
- AL: Create custom metrics and dashboards
- AM: Implement log aggregation and search (ELK/Loki)
- AN: Design anomaly detection and alerting
- AO: Create SLO/SLI monitoring framework
- AP: Implement on-call rotation and escalation

**Task AQ-AV: Advanced Operations** (7 tasks)
- AQ: Design chaos engineering program
- AR: Create capacity planning and load testing
- AS: Implement autoscaling policies and testing
- AT: Design disaster recovery drills (quarterly)
- AU: Create infrastructure upgrade procedures
- AV: Implement compliance-as-code for infrastructure

Execute Y-AV in any order. Total: 49 tasks, ~25-30 hours work.

---

### ✅ COMPLETE: GA MCP Server Cleanup (Priority 2)
**Manager Decision**: Destroy the unused Fly.io GA MCP HTTP server to save costs ($50-70/year).

**Background**: 
- The `hotdash-analytics-mcp` app was an experimental HTTP wrapper for the GA MCP server
- Cursor/dev tools now use local stdio GA MCP (working perfectly)
- HotDash app will use Direct Google Analytics API (not MCP)
- Server is suspended but still billable
- **No functionality depends on this server**

**Action Required**:
```bash
# 1. Verify current status
~/.fly/bin/fly status -a hotdash-analytics-mcp

# 2. Destroy the app (saves $4-6/month)
~/.fly/bin/fly apps destroy hotdash-analytics-mcp --yes

# 3. Verify deletion
~/.fly/bin/fly apps list | grep analytics
```

**Evidence Required**:
- Command output showing successful deletion
- Confirmation that app no longer appears in `fly apps list`
- Log in `feedback/deployment.md` with timestamp

**Timeline**: Complete within 24 hours

---

### Ongoing Tasks
- Canonical toolkit
  - Enforce Supabase-only posture; remove any Fly Postgres references. CI Stack Guard will block alt DBs.
- Shopify Admin dev flow
  - Ensure runbooks reference RR7 + CLI v3 (no token workflows). Update env matrix accordingly.
- Fly memory scaling
  - Scale memory to 2GB for Chatwoot and any applicable apps; persist in fly.toml or via CLI; log evidence in `feedback/deployment.md`.
- Secret mirroring
  - Mirror only required secrets (Supabase DSN, Chatwoot Redis/API). **Note: GA MCP secrets no longer needed after server destruction.**
- Evidence
  - Keep `docs/deployment/env_matrix.md` and runbooks current; attach diffs and command outputs in feedback.

1. **Local Supabase documentation** — Update `docs/deployment/env_matrix.md` and `docs/runbooks/prisma_staging_postgres.md` to reflect the new default (`supabase start`, `.env.local`, Postgres-only migrations). Verify the instructions by running `npm run setup` locally and attaching the output.
2. **Sanitized history** — `git fetch --all --prune`, `git grep postgresql://`; log commands/output.
3. **Runbook parity** — Update `scripts/deploy/staging-deploy.sh`, `docs/deployment/env_matrix.md`, and `docs/deployment/chatwoot_fly_runbook.md` to match current secrets + Supabase posture; capture diffs.
4. **Secret mirroring** — Mirror Supabase DSN, Chatwoot Redis/API, and GA MCP bundles to GitHub (`gh secret set … --env staging/prod`); attach CLI output and verify the values immediately via `gh secret list` (embed/session tokens are not required under the current dev flow).
5. **Fly memory scaling** — Increase memory to 2GB for each Fly app to prevent crashes. For Chatwoot: persist by updating `deploy/chatwoot/fly.toml` `[vm].memory = "2048mb"` and redeploy; or execute via CLI: `/home/justin/.fly/bin/fly scale memory 2048 -a hotdash-chatwoot`. For Machines-based apps: list machines and update each: `/home/justin/.fly/bin/fly m list -a hotdash-chatwoot` then `/home/justin/.fly/bin/fly m update <id> --memory 2048`. For the embedded app, identify the app name via `/home/justin/.fly/bin/fly apps list | grep hotdash` and apply the same scaling. Log commands and outputs in `feedback/deployment.md`.
6. **Chatwoot alignment** — Pull the current Fly secrets yourself, update anything missing, and run the smoke validation. Collaborate with the Chatwoot agent for context, but do not hand the task back until secrets and evidence are archived (`artifacts/integrations/chatwoot-fly-deployment-*`).
7. **Stack compliance audit** — Attend Monday/Thursday review, focusing on CI/CD secret usage and deploy scripts; document remediation steps.
8. **Fallback readiness** — Keep staging redeploy, rollback, and dry-run checklists current so QA can execute immediately once blockers clear.
6. **Stack compliance audit** — Attend Monday/Thursday review, focusing on CI/CD secret usage and deploy scripts; document remediation steps.
7. **Fallback readiness** — Keep staging redeploy, rollback, and dry-run checklists current so QA can execute immediately once blockers clear.
