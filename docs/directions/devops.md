# Devops Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Option A Deployment Support

---

## Objective

**Support Option A deployments and infrastructure** (Phases 2-13)

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Your Role**: Infrastructure, deployment, monitoring for each phase

---

## P0 URGENT: Fix Chatwoot Gem Dependencies (START NOW)

**Escalated From**: Data agent (2025-10-20T17:52Z)

**Issue**: Chatwoot database migrations fail due to missing gem
- Error: `NameError: uninitialized constant ActsAsTaggableOn::Taggable::Cache`
- Impact: Cannot run `rails db:migrate`, 89 pending migrations blocked
- Blocks: Support SUPPORT-001, AI-Customer testing

**Root Cause**: Chatwoot Docker image missing `acts-as-taggable-on` gem

**Your Task**: Fix Chatwoot application dependencies

### Solution: Update Chatwoot Gemfile & Rebuild

**NO CEO APPROVAL NEEDED** - This is a technical gem dependency fix

**Steps**:
1. Check Chatwoot Gemfile for acts-as-taggable-on gem
2. If missing: Add to Gemfile and rebuild Docker image
3. Redeploy hotdash-chatwoot app
4. Test migrations: `fly ssh console -a hotdash-chatwoot -C "bundle exec rails db:migrate"`
5. Verify: Check logs for "column settings does not exist" (should be gone)
6. Confirm in manager feedback when complete

**Time**: 30-45 minutes
**Priority**: P0 - Blocks Support & AI-Customer
**Chatwoot Repo**: Check if we have Chatwoot Dockerfile/config

**After Fix**: Data agent can complete migrations, Support can proceed with testing

---

## Immediate Tasks

### DEVOPS-001: Monitor Current Deployment Health (Ongoing)

**App**: hotdash-staging.fly.dev

**Daily Health Checks**:
```bash
fly status -a hotdash-staging
fly logs -a hotdash-staging | tail -100
```

**Report**:
- Machine status
- Latest deployment version
- Error rate
- GA API health (should see success logs every minute)

---

### DEVOPS-002: Database Migration Coordination (Phase 2)

**When Data Agent Creates Migrations**:

**Process**:
1. Data creates migration files
2. **You verify** migration is safe (additive only)
3. **Manager applies** via Supabase console or psql
4. **You verify** tables exist in database
5. **Confirm** to Engineer (unblock Phase 2 work)

**Verification Commands** (after Manager applies):
```sql
-- Check tables exist:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sales_pulse_actions', 'inventory_actions', 'notifications', 'user_preferences');

-- Verify RLS enabled:
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%_actions';
```

**CRITICAL**: Do NOT add migration commands to fly.toml or package.json (database safety policy)

---

## Phase-Specific Tasks

### PHASE 5: SSE Infrastructure — QUEUED

**DEVOPS-003**: Server-Sent Events Setup

**What to Build**:
- SSE endpoint: `/api/realtime/approvals`
- Heartbeat every 30 seconds
- Send events when approval queue changes
- Connection management (handle disconnects)
- Redis pub/sub (if needed for multi-instance)

**Coordinate with Engineer**:
- They build client-side SSE consumer
- You build server-side SSE producer
- Test connection stability

**Monitoring**:
- Track connection count
- Monitor event delivery latency
- Alert if > 50% connections fail

---

### PHASE 11: CEO Agent Service Deployment — QUEUED

**DEVOPS-004**: Deploy CEO Agent Service

**If agent-service needs update**:
- Build: `apps/agent-service/`
- Deploy: `fly deploy -a hotdash-agent-service`
- Verify: Health endpoint responding
- Monitor: Check for errors in logs

**Secrets** (if new):
- OpenAI API key
- Supabase connection
- Chatwoot API token
- Google Analytics credentials

---

### PHASE 13: Production Deployment Preparation — QUEUED

**DEVOPS-005**: Production Readiness

**Tasks**:
- Create production Fly app (if not exists): hotdash-production
- Set production secrets (coordinate with Manager for vault access)
- Configure custom domain
- SSL certificates
- Health check monitoring
- Backup verification

---

## Deployment Protocol (Each Phase)

**After CEO Approves Phase**:

1. **Verify Build**:
   ```bash
   npm run build
   npm run test:ci
   ```

2. **Deploy to Staging**:
   ```bash
   fly deploy -a hotdash-staging --strategy immediate
   ```

3. **Verify Health**:
   ```bash
   fly status -a hotdash-staging
   fly logs -a hotdash-staging | grep -E "error|Error|ERROR" | tail -20
   ```

4. **Smoke Test**:
   - Visit https://hotdash-staging.fly.dev
   - Check tiles loading
   - Test new phase features
   - Verify no console errors

5. **Report**:
   ```md
   ## Phase N Deployment

   **Version**: [deployment ID]
   **Status**: ✅ HEALTHY / ❌ ISSUES
   **Health**: [status from fly status]
   **Errors**: [None OR error summary]
   **Smoke Test**: [Pass/Fail with evidence]
   ```

---

## Monitoring & Alerts

**Daily**:
- App uptime
- Error rate
- Response times
- Database connection health
- GA API health
- Chatwoot service health

**Alert Thresholds**:
- Error rate > 5% → Escalate to Manager
- Response time > 5s → Investigate
- Database connection fails → IMMEDIATE escalation
- Any service 500 errors → Immediate investigation

---

## Work Protocol

**1. MCP Tools**:
```bash
# Fly.io operations - use Fly MCP tools
mcp_fly_fly-status
mcp_fly_fly-logs
mcp_fly_fly-machine-status

# Documentation when needed:
mcp_context7_get-library-docs("/fly/flyctl", "deployment")
```

**2. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — DevOps: Infrastructure Status

**Working On**: Phase N deployment support
**Progress**: Deployed + verified healthy

**Evidence**:
- Deployment: Fly v[version] deployed successfully
- Health: Machine d8dd9eea046d08 state=started, host_status=ok
- Logs: No errors in last 100 lines
- Smoke test: ✅ PASS (tiles loading, new features functional)

**Blockers**: None
**Next**: Monitor for 1 hour, prepare for next phase deployment
```

---

## Definition of Done (Each Deployment)

**Pre-Deployment**:
- [ ] Build passing locally
- [ ] All tests passing (npm run test:ci)
- [ ] No secrets in code (npm run scan)

**Deployment**:
- [ ] Fly deploy successful
- [ ] Release command passed (npx prisma generate only)
- [ ] Machine status: started, host_status: ok

**Post-Deployment**:
- [ ] Health endpoint responding (200)
- [ ] No errors in logs (first 100 lines)
- [ ] Smoke test passed
- [ ] All tiles loading < 3s
- [ ] New phase features functional

**Monitoring**:
- [ ] Set up alerts for new endpoints (if applicable)
- [ ] Verify metrics collecting
- [ ] Error rate < 1%

---

## Critical Reminders

**DO**:
- ✅ Use Fly MCP tools for deployments
- ✅ Verify health after EVERY deployment
- ✅ Monitor logs for 1 hour after deploy
- ✅ Coordinate with Data for migration application

**DO NOT**:
- ❌ Deploy without running tests first
- ❌ Add migration commands to deployment files
- ❌ Skip smoke tests after deployment
- ❌ Deploy during high-traffic periods (unless emergency)

---

## Phase Schedule

**Immediate**: Monitor current deployment (Fly v70)
**Phase 2-4**: Deploy after each CEO approval
**Phase 5**: SSE infrastructure setup
**Phase 11**: CEO agent service deployment
**Phase 13**: Production deployment preparation

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan)
**Current App**: hotdash-staging.fly.dev
**Fly Dashboard**: https://fly.io/apps/hotdash-staging
**Feedback**: `feedback/devops/2025-10-20.md`
**Startup**: `docs/runbooks/agent_startup_checklist.md`

---

**START WITH**: Monitor current deployment health, standby for Phase 2 completion

---

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Google credentials: `vault/occ/google/`
- Bing credentials: `vault/occ/bing/`
- Publer credentials: `vault/occ/publer/`
- Other services: `vault/occ/<service-name>/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name]
**For**: [what task/feature]
**Checked**: vault/occ/<path>/ (not found)
**Status**: Moving to next task, awaiting CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking CEO**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - CEO will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.
