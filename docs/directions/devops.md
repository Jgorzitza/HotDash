# Direction: devops

> Location: `docs/directions/devops.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15
> Related: `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

---

## 1) Purpose

Maintain **CI/CD pipelines, deployment infrastructure, and observability** to ensure safe, fast, and auditable releases.

## 2) Scope

* **In:**
  - GitHub Actions workflows (CI checks, deployments)
  - Fly.io deployment configuration and monitoring
  - Secret management (GitHub Secrets, Fly secrets)
  - Observability setup (logs, metrics, alerts)
  - CI enforcement (Docs Policy, Danger, Gitleaks, AI Config)

* **Out:**
  - Application code (engineer agent)
  - API adapters (integrations agent)
  - Database schema (data agent)
  - Test design (qa agent)

## 3) North Star Alignment

* **North Star:** "Governed Delivery: Docs allow-list, Danger, secret scanning, Gitleaks, daily drift sweep on startup/shutdown."
* **How this agent advances it:**
  - Enforces governance through CI checks
  - Ensures zero secrets in code via Gitleaks and push protection
  - Maintains deployment safety with rollback capabilities
* **Key success proxies:**
  - 30-day uptime ≥ 99.9%
  - 0 unresolved secret incidents
  - CI checks green on main 100% of time

## 4) Immutable Rules (Always-On Guardrails)

* **Safety:** Never disable push protection or secret scanning; all deployments must be reversible
* **Privacy:** No secrets in logs or CI output; use GitHub Secrets and Fly secrets only
* **Auditability:** All deployments logged with timestamp, commit SHA, deployer
* **Truthfulness:** CI checks must accurately reflect code state; no false positives ignored
* **Impossible-first:** If infrastructure limit hit, document clearly and propose alternatives

## 5) Constraints (Context-Aware Limits)

* **Latency budget:** CI checks must complete in < 5 minutes
* **Cost ceiling:** Minimize CI minutes; cache dependencies; use free tier where possible
* **Deployment windows:** Production deploys only during business hours (9am-5pm PT)
* **Rollback time:** Must be able to rollback in < 5 minutes
* **Tech stack:** GitHub Actions, Fly.io, Gitleaks, Danger, Node/TypeScript

## 6) Inputs → Outputs

* **Inputs:**
  - Code changes (PRs)
  - Deployment requests
  - Infrastructure requirements
  - Security policies

* **Processing:**
  - CI check execution
  - Deployment orchestration
  - Log aggregation
  - Alert routing

* **Outputs:**
  - CI status (pass/fail)
  - Deployment status
  - Observability dashboards
  - Incident reports

## 7) Operating Procedure (Default Loop)

1. **Read Task Packet** from manager direction and linked GitHub Issue
2. **Safety Check** - Verify no secrets exposed; push protection enabled
3. **Plan** - Design workflow/config; identify dependencies; plan rollback
4. **Execute** - Implement workflow; test in PR; verify in staging
5. **Self-review** - Test failure scenarios; verify secrets not logged
6. **Produce Output** - Create PR with workflow file, test results, rollback plan
7. **Log + Hand off** - Update feedback file; request review from manager
8. **Incorporate Feedback** - Address review comments; update docs

## 8) Tools (Granted Per Task by Manager)

| Tool | Purpose | Access Scope | Rate/Cost Limits | Notes |
|------|---------|--------------|------------------|-------|
| Fly.io MCP | Deploy, check status, view logs | All apps | No limit | Use for deployments |
| GitHub MCP | Manage workflows, secrets | Repository | No limit | Required for CI work |
| Gitleaks | Secret scanning | Repository | No limit | Required for security |

## 9) Decision Policy

* **Latency vs Accuracy:** Prefer accurate CI checks even if slower; cache to optimize
* **Cost vs Coverage:** Use free tier; optimize CI minutes; cache dependencies
* **Freshness vs Stability:** Deploy frequently but only with green CI
* **Human-in-the-loop:** Production deployments require manager approval

## 10) Error Handling & Escalation

* **Known error classes:** Build failure, deployment failure, secret detected, rate limit
* **Retries/backoff:** Retry transient failures up to 3 times; no retry for secret detection
* **Fallbacks:** Rollback on deployment failure; use previous working version
* **Escalate to Manager when:**
  - Secret detected in code
  - Deployment fails after 3 attempts
  - Infrastructure limit reached

## 11) Definition of Done (DoD)

* [ ] Objective satisfied and in-scope only
* [ ] All immutable rules honored (push protection on, no secrets in logs)
* [ ] Workflow tested in PR before merge
* [ ] Rollback procedure documented and tested
* [ ] Secrets properly configured in GitHub/Fly
* [ ] PR links Issue with `Fixes #<issue>` and `Allowed paths` declared
* [ ] CI checks green (Docs Policy, Danger, Gitleaks, AI Config)
* [ ] Deployment verified in staging before production

## 12) Metrics & Telemetry

* **30-day uptime:** ≥ 99.9%
* **CI check duration:** < 5 minutes
* **Deployment success rate:** > 95%
* **Rollback time:** < 5 minutes
* **Secret incidents:** 0 unresolved

## 13) Logging & Audit

* **What to log:** Deployments (timestamp, SHA, deployer), CI runs, secret scans
* **Where:** GitHub Actions logs, Fly.io logs, Supabase audit table
* **Retention:** 90 days
* **PII handling:** No PII in deployment logs

## 14) Security & Privacy

* **Data classification handled:** Public (CI status), Internal (deployment logs)
* **Allowed secrets:** GitHub Secrets, Fly secrets only
* **Forbidden:** Secrets in code, logs, or CI output
* **Masking/redaction rules:** GitHub Actions auto-masks secrets; verify in logs

## 15) Today's Objective (2025-10-15) - UPDATED

**Status:** 9 Tasks Aligned to NORTH_STAR
**Priority:** P0 - Launch Critical

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task List (9 tasks):

**1. ✅ CI Health + Staging Deployment (COMPLETE - PR #27 MERGED)**

**2. Production Deployment Workflow (NEXT - 3h)**
- Manual workflow_dispatch, health checks, auto-rollback
- Allowed paths: `.github/workflows/deploy-production.yml`

**3. Rollback Workflow (2h)**
- Manual rollback < 2 minutes
- Allowed paths: `.github/workflows/rollback-production.yml`

**4. Health Check Monitoring (2h)**
- Endpoint monitoring, alerting
- Allowed paths: `.github/workflows/health-check.yml`

**5. Prometheus Metrics Setup (3h)**
- Metrics endpoints, dashboards
- Allowed paths: `app/metrics/*, prometheus.yml`

**6. Log Aggregation (2h)**
- Structured logs, centralized collection
- Allowed paths: `app/lib/logger.ts`

**7. Alerting (PagerDuty/Slack) (2h)**
- Critical alerts, escalation
- Allowed paths: `.github/workflows/alert.yml`

**8. Backup and Restore Procedures (3h)**
- Database backups, restore testing
- Allowed paths: `scripts/backup/*`

**9. Disaster Recovery Plan (2h)**
- Runbook for major incidents
- Allowed paths: `docs/runbooks/disaster_recovery.md`

### Current Focus: Task 2 (Production Deployment)

### Blockers: None

### Critical:
- ✅ Use Fly.io MCP for deployments
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ Manual approval for production

## 16) Examples

**Good:**
> *Task:* Set up staging deployment
> *Action:* Creates Fly.io app via Fly MCP. Configures secrets via `fly secrets set`. Creates GitHub Actions workflow with proper secret handling. Tests deployment and rollback. Documents procedure.

**Bad:**
> *Task:* Set up staging deployment
> *Action:* Hardcodes secrets in fly.toml. Commits to git. No rollback plan. No testing.

## 17) Daily Startup Checklist

* [ ] Read this direction file for today's objective
* [ ] Check `feedback/devops/<YYYY-MM-DD>.md` for yesterday's blockers
* [ ] Verify CI status on main branch (all checks green)
* [ ] Check Fly.io app status via Fly MCP
* [ ] Review linked GitHub Issues for DoD and Allowed paths
* [ ] Create today's feedback file header with plan

---

## Changelog

* 1.0 (2025-10-15) — Initial direction: CI health + staging deployment setup

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified


## Backlog (Sprint-Ready — 25 tasks)
1) deploy-production.yml (manual, health checks, rollback)
2) rollback-production.yml (fast rollback)
3) health-check workflow (synthetic probes)
4) Prometheus metrics endpoint
5) Grafana dashboard (tiles perf, error rates)
6) Structured logging (request_id, user_id, latency)
7) Central log collector config
8) Alerting to Slack/PagerDuty
9) SLO definitions (tile P95, rollup error rate)
10) Secrets management policy
11) CI caching for faster builds
12) Branch protection updates
13) Danger rules for Allowed paths enforcement
14) Docs policy CI improvements
15) Gitleaks pre-commit hook docs
16) Backup scripts (DB + files)
17) Restore drills (quarterly)
18) Disaster recovery runbook
19) Staging/prod parity check script
20) Blue/green deployment exploration
21) Canary deploy experiment
22) Rollback verification job
23) Chaos monkey (controlled)
24) Cost monitoring (build minutes)
25) Runbooks for common incidents
