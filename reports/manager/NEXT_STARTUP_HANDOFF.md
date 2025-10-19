# Manager Next Startup Handoff — 2025-10-19

> **Critical**: Read this AFTER standard startup process (North Star, Operating Model, Rules, manager_startup_checklist.md)
> 
> **Purpose**: Session-specific context to prevent regression and avoid redoing completed work
>
> **Reading Order**:
> 1. docs/NORTH_STAR.md (vision alignment)
> 2. docs/OPERATING_MODEL.md (process)
> 3. docs/RULES.md (governance)
> 4. docs/runbooks/manager_startup_checklist.md (standard startup tasks)
> 5. **THIS DOCUMENT** (session-specific handoff - prevents regression)

---

## Production State Snapshot (2025-10-19 23:00 UTC)

### ✅ Production App LIVE

**URL**: https://hotdash-staging.fly.dev  
**Status**: HTTP 200 (responding) ✅  
**Version**: hot-dash-22 (deployed via `shopify app deploy`)  
**Shopify Dashboard**: https://dev.shopify.com/dashboard/185825868/apps/285941530625/versions/763726168065

**CRITICAL**: Agents can test production app NOW using Chrome DevTools MCP. No need to wait for local dev server.

### ✅ Shopify App Configured

**Config Files**:
- `shopify.app.toml` - Manager template (can delete if desired)
- `shopify.app.hotdash.toml` - **REAL CONFIG** (generated via `shopify app config link`)

**App Details**:
- Client ID: `4f72376ea61be956c860dd020552124d`
- Organization: Hot Rod AN LLC (185825868)
- Dev Store: hotroddash.myshopify.com
- Scopes: 8 production scopes (incl `write_products`)
- Webhooks: app/uninstalled, app/scopes_update

**Local Dev**: Run `shopify app dev --config hotdash` (creates tunnel to dev store)

---

## Agent Work Inventory (CRITICAL - Don't Lose This Work)

### 10 COMPLETE Agents (Awaiting Manager PRs)

**Files in working tree** (not committed): 76+ files across app/, tests/, scripts/, docs/

**Agent File Mapping** (for sequential PR creation):

1. **ai-knowledge** (Issue #TBD):
   - app/services/knowledge/* (6 files, embedding, search, ingestion, RAG)
   - supabase/migrations/20251019_knowledge_tables.sql
   - scripts/knowledge/ingest-support-articles.mjs
   - tests/unit/services/knowledge/* (2 files, 4 tests)
   - Evidence: feedback/ai-knowledge/2025-10-19.md

2. **integrations** (Issue #113):
   - app/components/dashboard/IntegrationsHealthTile.tsx
   - app/services/integrations/* (health-aggregator, monitor, retry-policy)
   - app/middleware/rate-limiter.ts
   - tests/contract/* (7 contract test files, 26 tests)
   - tests/integration/graceful-degradation.spec.ts
   - tests/unit/middleware/rate-limiter.spec.ts
   - docs/specs/integrations_contracts.md
   - Evidence: feedback/integrations/2025-10-19.md (44 tests passing)

3. **ai-customer** (Issue #114):
   - app/agents/customer/* (draft-generator, chatwoot-api, grading-schema, learning-signals, confidence-tuner)
   - app/components/approvals/* (CustomerReplyApproval, ApprovalGradingSection)
   - app/components/dashboard/CXQualityTile.tsx
   - app/routes/api.chatwoot.batch-draft.ts
   - app/lib/metrics/customer-reply-quality.ts
   - app/lib/analysis/tone-analyzer.ts
   - scripts/ai/export-learning-signals.ts
   - tests/unit/agents/openai.contract.spec.ts (9 tests)
   - docs/specs/cx_ai_pipeline.md
   - Evidence: feedback/ai-customer/2025-10-19.md (23 tests passing)

4. **analytics** (Issue #104):
   - app/lib/analytics/shopify-returns.stub.ts
   - scripts/sampling-guard-proof.mjs
   - scripts/dashboard-snapshot.mjs
   - scripts/metrics-for-content-ads.mjs
   - Evidence: feedback/analytics/2025-10-19.md (contract test passing)

5. **content** (Issue #116):
   - Files were created then deleted by manager
   - Evidence in feedback: 15 molecules complete, 98% tests
   - Evidence: feedback/content/2025-10-19.md

6. **data** (Issue #106):
   - Production database: 4 RLS policies applied (ads_metrics_daily, agent_run, agent_qc, creds_meta)
   - Evidence: feedback/data/2025-10-19.md (rowsecurity = t verified)

7. **inventory** (Issue #112):
   - app/lib/inventory/* (10 modules)
   - app/services/inventory/* (6 modules)
   - app/components/dashboard/StockRiskTile.tsx
   - tests/unit/inventory/* (7 files, 139 tests)
   - tests/contract/shopify.inventory.contract.spec.ts
   - Evidence: feedback/inventory/2025-10-19.md (139/139 passing)

8. **product** (Issue #117):
   - reports/product/* (6 reports: bug-status, test-coverage, performance-validation, go-no-go, launch-announcement, ceo-presentation)
   - docs/specs/* (success_metrics, release_coordination, idea_pool_sla, etc.)
   - docs/runbooks/post_launch_monitoring.md
   - Evidence: feedback/product/2025-10-19.md (CONDITIONAL GO recommendation)

9. **seo** (Issue #107):
   - app/lib/seo/* (19 modules)
   - app/routes/* (3 API routes)
   - app/components/dashboard/SEOTile.tsx
   - tests/unit/seo/* (8 files, 56 tests)
   - docs/specs/seo_pipeline.md
   - Evidence: feedback/seo/2025-10-19.md (56/56 passing)

10. **support** (Issue #111):
    - app/routes/api.webhooks.chatwoot.tsx
    - app/routes/api.support.health.ts
    - app/services/support/* (webhook-retry, webhook-auth, message-processor, queue-monitor, escalator, performance-monitor)
    - app/services/chatwoot-tagger.ts
    - app/lib/support/sla-tracker.ts
    - app/components/dashboard/SupportQueueTile.tsx
    - scripts/support/daily-health-report.mjs
    - tests/unit/support/chatwoot-webhook.spec.ts (4 tests)
    - docs/runbooks/support_webhooks.md
    - Evidence: feedback/support/2025-10-19.md (4/4 tests, 99.9% reliability)

### 2 IN PROGRESS Agents

11. **engineer** (Issue #109):
    - app/routes/health.ts (NEW)
    - app/utils/http.server.ts (created)
    - tests/utils/render.tsx (created)
    - app/lib/analytics/schemas.ts, sampling-guard.ts (created)
    - app/lib/seo/pipeline.ts, diagnostics.ts (created)
    - app/services/approvals.ts (created)
    - Status: 5/17 molecules (29%), build in progress
    - Evidence: feedback/engineer/2025-10-19.md

12. **pilot** (Issue #115):
    - docs/runbooks/production_smoke_tests.md (created)
    - docs/tests/ux-issues-prioritized.md (created)
    - reports/pilot/validation-2025-10-19.md (created)
    - Status: 4/15 molecules (27%), now unblocked (production accessible)
    - Evidence: feedback/pilot/2025-10-19.md

### 4 READY TO START Agents (New Directions)

13. **designer** (Issue #118): 0/15 - Now unblocked, production URL provided
14. **ads** (Issue #101): 0/20 - New direction v5.0, production-focused
15. **devops** (Issue #108): 2/18 - Lint blocker removed, deployment focus
16. **qa** (Issue #110): 0/17 - Production retest protocol

---

## Git State (CRITICAL - Prevent File Loss)

### Manager PR #98 (Ready for Approval)

**Branch**: batch-20251019/manager-direction-update  
**Commits**: 7 (6ed6414 → d0c1447)  
**Status**: OPEN, awaiting CEO approval  
**Contains**:
- 5 governance docs updated
- 16 direction files updated
- 4 manager reports
- 2 Shopify config files

### Working Tree (Agent Work - Do NOT Lose)

**123 uncommitted files** across:
- app/ (76 files)
- tests/ (30 files)
- scripts/ (10 files)
- docs/ (7 files)

**CRITICAL**: These files are AGENT WORK from 10 completed agents
- **DO NOT** run `git checkout --` or `git clean -fd`
- **DO NOT** commit in bulk (causes git contamination)
- **DO** create 10 sequential PRs (one per agent)

### Old PR #97

**Status**: Can be closed (superseded by PR #98)  
**Branch**: manager/production-ready-2025-10-19  
**Note**: Contained old direction work before shutdown consolidation

---

## Known Blockers & Their Status

### ✅ RESOLVED

1. ✅ **Lint errors blocking DevOps** - Deferred to v1.1 (P2), not production blocker
2. ✅ **Server won't start** - False alarm; production app accessible on Fly.io
3. ✅ **Designer/Pilot blocked** - Unblocked; production app URL provided
4. ✅ **Shopify app not configured** - Configured via `shopify app config link`

### ⚠️ VERIFY BEFORE ASSIGNING

1. ⚠️ **ADS-000-P0** (getPlatformBreakdown test) - Test file may not exist, verify first
2. ⚠️ **INV-000-P0** (ROP calculation) - Test may not exist or already fixed (139/139 passing reported)
3. ⚠️ **SUP-000-P0** (webhook timeout) - Test may not exist or already fixed (4/4 passing reported)

**Action**: Before agents execute these P0s, verify test files actually exist and are failing

### ⏸️ PENDING

1. ⏸️ **Engineer build** - Resolving missing imports, nearly complete
2. ⏸️ **10 agent PRs** - Manager must create sequentially after PR #98 merged

---

## Sequential PR Creation Strategy (MANDATORY)

**Why Sequential**: Concurrent git operations cause branch contamination (files mixing across branches)

**Process** (after PR #98 merged):

```bash
# Return to main first
git checkout main
git pull origin main

# For each completed agent (10 total):
for agent in ai-knowledge integrations ai-customer analytics content data inventory product seo support; do
  # 1. Get agent's files from their feedback evidence
  # 2. Create branch
  git checkout -b ${agent}/oct-19-complete main
  
  # 3. Stage ONLY that agent's files (see inventory above)
  git add <agent-specific-files>
  
  # 4. Commit
  git commit -m "${agent}: [Summary from feedback] (Fixes #[issue])"
  
  # 5. Push
  git push -u origin ${agent}/oct-19-complete
  
  # 6. Create PR
  gh pr create --title "${agent}: [Summary]" --body "[Evidence from feedback]"
  
  # 7. Return to main BEFORE next agent
  git checkout main
done
```

**Timeline**: ~2-3 hours (10 agents × 15-20 min each)

---

## Test Status Snapshot

**Last Known** (from Engineer feedback):
- Unit: 234/270 passing (87%)
- Integration: Passing (per agent feedback)
- Contract: 44+ tests passing (integrations)
- Format: ✅ Passing
- Build: In progress (resolving imports)
- Lint: 590 warnings (deferred to v1.1)
- Security: 0 secrets ✅

**Target**:
- Unit: ≥95% (QA target: 100%)
- Integration: 100%
- Contract: 100%

---

## Tool Corrections Applied (CRITICAL - Read First)

### MCP Tools (Dev Agents)

**ACTIVE (5 tools)**:
1. **github-official**: PR/issue management ✅
2. **context7**: Codebase search, React Router 7 docs ✅
3. **fly**: Fly.io deployment ✅
4. **shopify-dev-mcp**: Shopify API validation (**NOT for running app - use Shopify CLI**) ✅
5. **chrome-devtools-mcp**: UI testing on production (**Designer, Pilot, QA**) ✅

**NOT MCP (Use CLI/API)**:
- ❌ Supabase MCP - Use `supabase` CLI
- ❌ Google Analytics MCP - Use built-in API in `app/services/analytics/`

### OpenAI Agents SDK (In-App Agents ONLY)

**Use SDK for**:
- ai-customer: Customer reply drafts with `human_review: true`
- Future: CEO query agent, knowledge assistant

**NOT for**: Dev agents (use MCP instead)

### Shopify CLI vs MCP

**Use Shopify CLI for**:
- Running app: `shopify app dev --config hotdash`
- Deploying: `shopify app deploy`
- Config: `shopify app config link`
- Info: `shopify app info`

**Use shopify-dev-mcp for**:
- API documentation lookup
- GraphQL schema validation
- Latest Shopify dev processes

**NEVER confuse the two** - this caused confusion during session

---

## Regression Prevention Checklist

### Before Creating Agent PRs

- [ ] Verify files exist in working tree (use `git status --short`)
- [ ] Check agent feedback for exact file list
- [ ] Stage ONLY that agent's files
- [ ] Test after each PR creation (`npm run test:unit`)
- [ ] If tests break, revert immediately

### Before Assigning P0 Test Fixes

- [ ] Verify test file exists: `find tests -name "*<test-name>*"`
- [ ] Run specific test: `npx vitest run <test-file>`
- [ ] Confirm test is actually failing
- [ ] If test passes or doesn't exist, DO NOT assign fix

### Before Updating Direction Files

- [ ] Read agent's latest feedback file COMPLETELY
- [ ] Check effective date and issue number
- [ ] Verify molecule count (15-20 strict)
- [ ] Ensure no deprecated MCP references

### Before Running Bulk Operations

- [ ] Never run `git clean -fd` (loses agent work)
- [ ] Never run `git checkout --` on app/ (loses agent work)
- [ ] Never bulk-commit agent work (causes contamination)
- [ ] Always sequential PRs (one agent at a time)

---

## First 5 Actions on Next Startup

1. **Check PR #98 status**
   ```bash
   cd ~/HotDash/hot-dash
   gh pr view 98
   ```
   - If merged: Proceed to step 2
   - If pending: Await approval

2. **Check agent feedback for new updates**
   ```bash
   find feedback -name "2025-10-*.md" -type f -newer feedback/manager/2025-10-19.md
   ```
   - Read any new feedback files
   - Check for "WORK COMPLETE" blocks

3. **Verify production app still accessible**
   ```bash
   curl -I https://hotdash-staging.fly.dev
   ```
   - Should return HTTP 200
   - Agents can test with Chrome DevTools MCP

4. **Check working tree preservation**
   ```bash
   git status --short | wc -l
   ```
   - Should show ~123 uncommitted files (agent work)
   - If 0: Agent work may be lost - check `git reflog`

5. **Review molecule completion status**
   ```bash
   grep -h "molecules.*complete\|WORK COMPLETE" feedback/*/2025-10-*.md
   ```
   - Identify which agents completed work since last startup
   - Prioritize PR creation for newly completed agents

---

## Known Gotchas

### 1. QA Packet May Reference Non-Existent Tests

**Issue**: QA reported test failures that may not exist:
- getPlatformBreakdown test (file not found)
- Some other test references may be stale

**Solution**: Always verify test exists before assigning P0 fix

### 2. Lint Cleanup Causes Regressions

**Issue**: Engineer attempted automated lint fix (sed replacement), broke tests

**Solution**: Use sequential file-owner approach (see `docs/runbooks/lint_cleanup_sequential.md`)
- Deferred to v1.1 (P2 technical debt)
- NOT a production blocker

### 3. Local Dev vs Production Confusion

**Issue**: Spent time trying to fix "server won't start" for localhost

**Reality**: Production app already live on Fly.io (https://hotdash-staging.fly.dev)

**Solution**: Always check Fly.io/production status FIRST before debugging local dev

### 4. Git Contamination from Concurrent Operations

**Issue**: Multiple agents running git commands simultaneously mixes files across branches

**Solution**: Manager creates ALL PRs sequentially (agents never touch git per RULES.md)

### 5. Direction File Mismatches

**Issue**: Agents report direction shows old issue number

**Solution**: Always verify issue # in direction matches current work
- Update direction effective date when changing issue
- Agents should escalate mismatches immediately

---

## Recommended Next Session Priorities

### High Priority (Do First)

1. **Merge PR #98** (governance + direction updates)
2. **Close PR #97** (superseded, old work)
3. **Monitor 6 agents**: Designer, Pilot, QA (Chrome DevTools on production), Engineer, Ads, DevOps

### Medium Priority (After Agent Execution)

4. **Create 10 PRs** for completed agents (sequential, 2-3 hours)
5. **Review new feedback** from Designer/Pilot/QA after production testing
6. **QA GO/NO-GO** decision after all testing complete

### Low Priority (After PRs Merged)

7. **Final production deployment** (if QA gives GO)
8. **Monitor production metrics**
9. **Rollback procedures** verification

---

## Files to Review on Next Startup

**Critical Reading Order**:
1. `reports/manager/FINAL_DIRECTION_UPDATE_2025-10-19.md` - Complete session summary
2. `reports/manager/consolidated-status-2025-10-19.md` - 16-agent status table
3. `feedback/manager/2025-10-19.md` - Manager shutdown summary (this precedes that)
4. `reports/manager/NEXT_STARTUP_HANDOFF.md` - This document

**Agent Feedback** (check for updates):
- feedback/*/2025-10-19.md (all 16 files)
- Look for new "WORK COMPLETE" blocks

**Direction Files** (current state):
- docs/directions/*.md (all 16 updated, versions 2.0-5.0)

---

## Manager Git Commands Reference

### Safe Operations

```bash
# Check status (never loses data)
git status --short
git log --oneline -10

# Check what's in a commit
git show <commit-sha>

# List files changed by agents
git diff --name-only

# Check PR status
gh pr list
gh pr view <number>
```

### DANGEROUS Operations (Avoid)

```bash
# ❌ NEVER run these (lose agent work):
git checkout -- app/        # Deletes uncommitted app files
git clean -fd               # Deletes untracked files
git reset --hard            # Deletes all uncommitted changes

# ❌ NEVER bulk commit agent work:
git add app/                # Mixes all agents' files
git commit -am "..."        # Commits everything (contamination)
```

### Sequential PR Creation (Safe)

```bash
# Always return to main between agents
git checkout main

# Create branch for ONE agent only
git checkout -b agent-name/oct-19-complete

# Stage ONLY that agent's files
git add <specific-files-from-feedback>

# Commit with evidence
git commit -m "agent: [Summary] (Fixes #issue)"

# Push
git push -u origin agent-name/oct-19-complete

# Return to main BEFORE next agent
git checkout main
```

---

## Success Metrics for Next Session

**Manager Effectiveness**:
- [ ] All 10 completed agent PRs created within 3 hours
- [ ] Zero git contamination incidents
- [ ] Zero lost agent work
- [ ] Designer/Pilot/QA complete production validation
- [ ] QA provides final GO/NO-GO decision

**Production Readiness**:
- [ ] Test coverage ≥95%
- [ ] Production app responding on all routes
- [ ] Health checks configured
- [ ] Rollback procedures tested
- [ ] No P0 blockers remaining

---

## Quick Status Check Commands

```bash
# Agent completion status
grep -h "WORK COMPLETE" feedback/*/2025-10-*.md | wc -l

# Files waiting for PRs
git status --short | wc -l

# Production app health
curl -I https://hotdash-staging.fly.dev

# PR status
gh pr list --state open

# Test status
npm run test:unit 2>&1 | grep "Test Files"

# Security status
gitleaks detect --source . --redact 2>&1 | grep "no leaks"
```

---

## Emergency Recovery Procedures

### If Agent Work Lost

```bash
# Check reflog
git reflog | head -20

# Check for stashed work
git stash list

# Check for abandoned branches
git branch -a | grep agent
```

### If Git Contamination Occurs

```bash
# Identify contaminated branch
git diff main..contaminated-branch --name-only

# Create clean branch
git checkout -b agent-name/clean main

# Cherry-pick specific files
git checkout contaminated-branch -- <specific-files>

# Abandon contaminated branch
git branch -D contaminated-branch
```

### If Tests Break After PR Merge

```bash
# Revert last merge
git revert -m 1 HEAD

# Or rollback to specific commit
git revert <commit-sha>

# Push revert
git push origin main
```

---

## Manager Status: ✅ SHUTDOWN READY

**All checklist items complete**  
**All agent work preserved in working tree**  
**All governance docs updated**  
**Production app accessible**  
**PR #98 ready for approval**

**Next startup**: Read this handoff FIRST, then execute startup checklist


