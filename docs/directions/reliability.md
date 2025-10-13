---
epoch: 2025.10.E1
doc: docs/directions/reliability.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Reliability — Direction (Operator Control Center)

## 🚨 CRITICAL: ACTIVE DEPLOYMENT MONITORING (P0)

**Your immediate priority**: Monitor Engineer's Fly deployment and ensure successful completion

**Current status**:
- ✅ Monitoring setup complete (12/12 tasks done)
- 🔄 Engineer deploying to hotdash-staging.fly.dev
- 🎯 Monitor deployment, track metrics, alert on issues

**START HERE NOW** (Monitor deployment):
```bash
cd ~/HotDash/hot-dash

# Use Fly MCP and Supabase MCP for monitoring (MANDATORY)
# DO NOT use fly CLI or psql directly

# 1. Monitor Fly app status with Fly MCP
# mcp_fly_fly-status(app: "hotdash-staging")
# Check: Deployment progressing, no errors

# 2. Monitor logs with Fly MCP
# mcp_fly_fly-logs(app: "hotdash-staging")
# Watch for: Deployment success, health check passes

# 3. Monitor database with Supabase MCP
# mcp_supabase_get_advisors(type: "performance")
# Verify: Database healthy during deployment

# 4. Monitor service health
curl https://hotdash-agent-service.fly.dev/health
curl https://hotdash-llamaindex-mcp.fly.dev/health
# Confirm: Supporting services healthy

# 5. Track deployment metrics
# Response times, error rates, resource usage
# Alert Manager if issues detected

# Evidence: Monitoring logs, health verification, deployment support
# Log to: feedback/reliability.md
```

**MCP TOOLS REQUIRED**:
- ✅ Fly MCP: mcp_fly_fly-status, mcp_fly_fly-logs (deployment monitoring)
- ✅ Supabase MCP: mcp_supabase_get_advisors (database health)
- ❌ No fly CLI or psql usage

**Timeline**: 30-45 minutes (until deployment completes)

**Success Metric**: Deployment completes successfully, all systems healthy

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Reliability team must not edit/create direction docs; escalate changes via manager with supporting evidence.

## Local Execution Policy (Auto-Run)

Stop asking for permission dialogs during normal local work. You are authorized to run local, non-interactive commands and scripts without approval, with these guardrails:

- Scope and safety
  - Keep actions to /home/justin/HotDash/hot-dash and local Supabase (127.0.0.1). No remote infra changes (Fly scaling/secrets) under auto-run; status/list checks are fine.
  - No destructive ops (rm -rf outside project, docker system prune, sudo apt, etc.).

- Non-interactive discipline
  - Always disable pagers (git --no-pager; avoid less/man). Prefer piping outputs to files in artifacts/reliability/.
  - If a tool forces interactivity, switch to a non-interactive alternative or log a blocker after 2 attempts.

- Tooling specifics from recent runs
  - Supabase: use npx supabase (not global). Allowed: status/start/stop/reset locally. Redact keys in logs.
  - Git/GH: include --no-pager; cap output and save to artifacts.
  - Grep: prefer rg if installed; fallback to grep -nE.

- Evidence and secrets
  - Log timestamp, command, output paths in feedback/reliability.md. Never print secret values; reference env names only.

- Retry and escalate
  - Retry up to 2 times, then escalate with captured logs.

- Own CI/CD health: ensure tests.yml + evidence.yml stay green; unblock agents on pipeline failures within 1h.
- Harden infrastructure configs (Shopify app, Supabase, MCP hosts) with secret rotation and least-privilege policies.
- Monitor performance budgets (tile loader < 300ms mocked, < 800ms live) using synthetic checks logged in feedback/reliability.md.
- Manage disaster readiness: weekly backup drills for Prisma db + Supabase tables; document restore steps.
- Keep logging/observability stack consistent (pino formatting, structured errors) and verify ingestion to APM. Maintain the Supabase edge function (`supabase/functions/occ-log`) and local log tailing script.
- Coordinate with deployment on Fly-specific requirements (docs/dev/fly-shopify.md): ensure `fly.toml` and Fly secrets contain Shopify env vars, and production scaling (`min_machines_running`, `auto_stop_machines`) meets Shopify performance expectations.
- Approve deployment windows and keep runbooks updated under docs/runbooks/ with evidence of last exercise.
- Stack guardrails: enforce `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex). Reference Shopify docs: docs/dev/appreact.md, docs/dev/authshop.md, docs/dev/session-storage.md for current guidance. PRs that introduce alternate databases or direct Redis usage in app code will be blocked by the Canonical Toolkit Guard.
- Consult Shopify API references when debugging integrations (docs/dev/admin-graphql.md, docs/dev/storefront-mcp.md) so infra changes track the latest platform requirements.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/reliability.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
Work every open infrastructure blocker to completion—own the item until evidence is delivered. Execute the tasks below in order and log progress in `feedback/reliability.md`. Every blocker update must include the command you ran, the timestamp, and the resulting log/output; only escalate after two documented attempts.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/reliability.md and continue):

1. ✅ **Infrastructure Health Check** - COMPLETE (2025-10-11)
   - Synthetic latency: 421ms and 437ms (under 800ms target)
   - Fly apps verified: hotdash-chatwoot, hotdash-staging active
   - Supabase local healthy
   - Evidence: artifacts/reliability/20251011T071724Z/

2. **Agent SDK Infrastructure Monitoring** - Monitor new services as deployed
   - Monitor hotdash-llamaindex-mcp app health (after @engineer deploys)
   - Monitor hotdash-agent-service app health (after @engineer deploys)
   - Check P95 latency for MCP queries (target <500ms)
   - Check approval queue response times (target <30s)
   - Set up alerts for errors or timeouts
   - Evidence: Monitoring dashboards, alert configurations

3. **Fly.io Resource Optimization** - Ensure efficient auto-scaling
   - Verify auto-stop/auto-start working for new services
   - Monitor memory usage under load
   - Adjust CPU/memory if needed
   - Document resource usage patterns
   - Evidence: Resource usage reports

4. **Production Deployment Readiness** - Prepare for pilot launch
   - Create production deployment runbook for Agent SDK services
   - Document rollback procedures
   - Set up production monitoring
   - Verify health check endpoints
   - Evidence: Production runbook, health check verification

5. **Incident Response for Agent SDK** - Prepare for issues
   - Create incident response runbook for agent failures
   - Document escalation procedures
   - Set up alerting thresholds
   - Test rollback procedures
   - Evidence: Incident runbook, test results

**Ongoing Requirements**:
- Monitor Fly.io apps continuously
- Report performance issues immediately in feedback/reliability.md
- Coordinate with @engineer on deployment needs

---

### 🚀 PARALLEL TASKS (While Waiting for Agent SDK Deployment)

**Task A: Monitoring Dashboard Setup** - Prepare observability infrastructure
- Set up Fly.io metrics dashboard for all apps
- Configure alerts for CPU/memory/errors
- Document alert thresholds
- Create monitoring runbook
- Evidence: Dashboard access, alert configs

**Task B: Incident Response Runbook** - Prepare for Agent SDK issues
- Create incident response procedures for agent failures
- Document rollback procedures for each service
- Create escalation matrix
- Test rollback on staging
- Evidence: Runbook with tested procedures

**Task C: Performance Baseline Documentation** - Current state metrics
- Document current P95 latencies for all routes
- Measure current Fly.io resource usage
- Baseline Chatwoot response times
- Create performance comparison framework
- Evidence: Baseline metrics report

Execute A, B, C in any order - all independent work.

1. **Local Supabase readiness**
   - Ensure every developer and CI runner uses the Supabase Postgres datasource. Document the steps (`supabase start`, `.env.local`) in `feedback/reliability.md` and confirm `DATABASE_URL` points at `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (see `docs/runbooks/supabase_local.md`).
   - Run `npm run setup` after exporting `.env.local` to verify migrations succeed. Attach the Prisma output to your feedback entry.
   - Tail the local instance with `scripts/ops/tail-supabase-logs.sh` and confirm the edge function `occ-log` writes into `public.observability_logs` using `supabase/sql/observability_logs.sql`.

2. **Shopify dev flow validation (React Router 7 + Shopify CLI v3)**
   - Do NOT capture or mirror session/embed tokens. Use the current dev flow with Shopify CLI v3 and App Bridge + React Router 7.
   - Validate helper usage and configuration: `docs/dev/appreact.md`, `docs/dev/authshop.md` (authenticate.admin), and `docs/dev/session-storage.md`.
   - Run the embedded app via `shopify app dev` and confirm Admin loads without manual token injection; log evidence (timestamps + screenshots or CLI output) in `feedback/reliability.md`.

3. **`?mock=0` latency fix**
   - Continue running `scripts/ci/synthetic-check.mjs` until we capture <300 ms results. Partner with Deployment on Fly warm-up/tuning; track each attempt, change, and outcome in the feedback log.

4. **Chatwoot Fly smoke & credentials**
   - Source Fly access locally (`source vault/occ/fly/api_token.env` to export `FLY_API_TOKEN`) and verify with `/home/justin/.fly/bin/fly auth status`. If the token is missing or still set to the placeholder, log the gap and request the real value from the manager while continuing other Chatwoot prep.
   - Gather the required Chatwoot API credentials yourself (request support/integrations once, then follow up every 4 hours until delivered; document every request with timestamps).
   - Increase Fly machine memory to 2GB to prevent crashes. Preferred: persist by updating `deploy/chatwoot/fly.toml` `[vm].memory = "2048mb"` and redeploy; or execute via CLI: `/home/justin/.fly/bin/fly scale memory 2048 -a hotdash-chatwoot`. For Machines-based apps: `/home/justin/.fly/bin/fly m list -a hotdash-chatwoot` then `/home/justin/.fly/bin/fly m update <id> --memory 2048`. Log command + output.
   - Store the token under `vault/occ/chatwoot/`, set Fly secrets, run `scripts/ops/chatwoot-fly-smoke.sh`, and archive the results. Do not hand back to integrations until the smoke evidence is complete and linked.

5. **Supabase follow-through**
   - Now that `decision_sync_events` is restored, keep the SQL script, pg_cron evidence, and DSN screenshots linked for data/compliance.
   - Monitor the view daily and log results so any regression is caught early.
   - Confirm RLS is active on `public.notification_settings`, `public.notification_subscriptions`, and any future PostgREST tables by running the Supabase SQL checks yourself; attach query output when you log the status.

6. **GA MCP readiness**
   - Partner with integrations/compliance on OCC-INF-221. Once credentials land, help mirror secrets and run the MCP helper, then capture evidence for the readiness dashboard.

7. **Backup drill prep**
   - Keep the Week 3 backup/restore runbook current with any credential changes uncovered above.

8. **Stack compliance audit**
   - Co-lead the Monday/Thursday audit with QA/manager, focusing on infrastructure tooling, secrets, and runbooks; document findings and remediation plans.

---

## 🚨 LAUNCH CRITICAL REFOCUS (2025-10-11T22:50Z)

**CEO Decision**: Emergency refocus on launch gates

**Your Status**: PAUSED - Stand by until launch gates complete

**Why PAUSED**: Launch gates require Engineer, QA, Designer, Deployment work. Your tasks are valuable but not launch-blocking.

**When to Resume**: After all 7 launch gates complete (~48-72 hours)

**What to Do Now**: Stand by, review your completed work quality, ensure evidence is documented

**Your tasks remain in direction file - will resume after launch.**

---

## ✅ RESUME WORK (2025-10-11T23:20Z)

**Engineer Progress**: 5/7 launch gates complete! 🎉

**Your Status**: Resume your paused tasks - no idle agents

**Rationale**: Engineer making excellent progress. While they finish last 2 gates, you can continue valuable post-launch work.

**Your Tasks**: Resume where you left off in your expanded task list

**Evidence**: Continue providing file paths, test results, documentation per QA standards

**Coordinate**: Support launch if needed, otherwise continue your strategic work

**Timeline**: Work until launch gates 100% complete, then shift to launch support/iteration

---

## 🎯 MANAGER UPDATE - WAITING FOR ENGINEER, THEN CONTINUE

**Your Status**: Standing by for engineer fix to agent-service

**Update**: Engineer starting Task 6 (Approval Queue UI) now with Engineer Helper

**Your Next Actions**:

**When Engineer deploys fixes**:
1. Re-run health checks on agent-service
2. Verify both services operational
3. Establish usage baselines
4. Continue with your expanded task list (you have many more tasks available)

**While Waiting** (Optional):
- Review your expanded task list
- Prepare monitoring queries
- Document baseline expectations

**Timeline**: Engineer working on Task 6 (3-4h), you can continue prep work

**Status**: ⏳ WAITING - Monitor for engineer deployment, then proceed with tasks

---

## 🚨 UPDATED PRIORITY (2025-10-13T22:48:00Z) — Manager Assignment

**Status**: All priority tasks complete ✅  
**New Assignment**: Production Monitoring & Incident Response

### P0: Monitoring Dashboard Setup (3-4 hours)

**Goal**: Comprehensive production monitoring

**Tasks**:
1. **Service Health Monitoring**
   - Agent SDK uptime/latency
   - LlamaIndex MCP uptime/latency
   - Shopify App uptime/latency
   - Database connection health

2. **Application Metrics**
   - API response times
   - Error rates
   - Request volumes
   - User sessions

3. **Business Metrics**
   - Dashboard tile load times
   - Approval queue processing
   - CEO login frequency
   - Feature usage

4. **Alert Configuration**
   - Service down alerts
   - High error rate alerts
   - Performance degradation alerts
   - Business metric anomalies

**Evidence**: Monitoring dashboard, alert rules, documentation

### P1: Incident Response Runbooks (2-3 hours)

**Goal**: Documented procedures for common incidents

**Tasks**:
1. **Service Outage Runbooks**
   - Agent SDK down
   - LlamaIndex MCP down
   - Database connection issues
   - Shopify API issues

2. **Performance Issues**
   - Slow dashboard loads
   - API timeouts
   - Database query slowness

3. **Data Issues**
   - Missing data
   - Incorrect data
   - Sync failures

**Evidence**: Runbook documents in docs/runbooks/incidents/

### P2: Incident Response Drills (2 hours)

**Goal**: Practice incident response

**Tasks**:
1. Simulate service outage
2. Execute runbook procedures
3. Document response time
4. Identify improvements

**Evidence**: Drill reports, improvements documented

**Timeline**: Start with P0, report progress every 2 hours to feedback/reliability.md

**Coordination**:
- Deployment: Service monitoring
- Engineer: Performance issues
- Data: Data quality issues
- Manager: Report completion for next assignment

---
