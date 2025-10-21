# Integrations Direction v5.1

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
**Status**: ACTIVE — Option A Integration Support

---

## Objective

**Support Idea Pool (Phase 3) and Publer Integration (Phase 12)**

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Current Status**: Idea Pool API complete (Issue #113, 15/15 molecules, Manager score 5/5)

---

## Phase 3: Idea Pool Backend Support (COMPLETE ✅)

### Current State:

**Already Built**:
- ✅ `app/routes/api.analytics.idea-pool.ts` (139 lines)
- ✅ Contract test: 13/13 passing
- ✅ Feature flag support
- ✅ Fixture data (app/fixtures/content/idea-pool.json)
- ✅ Documentation: `docs/runbooks/idea-pool-feature-flag-activation.md`

**Status**: Ready for Engineer to integrate into Idea Pool Tile (ENG-008)

**Your Task**: Standby for Engineer questions, verify API working when tile implemented

---

## Phase 12: Publer UI Integration — QUEUED

### INTEGRATIONS-001: Publer Backend Verification

**Current State**:
- ✅ Publer adapter: `packages/integrations/publer.ts`
- ✅ API routes: `app/routes/api/social.post.ts`, `app/routes/api/social.status.$postId.ts`
- ✅ Tests: 7/7 passing (`tests/integration/social.api.spec.ts`)

**Your Tasks**:

**1. Verify Publer Adapter Ready** (20 min):
```bash
# Test adapter still functional:
npx ts-node scripts/proof/test-publer-adapter.ts

# Expected: Health check passes, account info retrieved
```

**2. Add Social Post to Approval Queue** (40 min):
- Create approval queue type: "social_post"
- Schema: `{ platform, content, media_urls[], scheduled_at }`
- Integration: Connect Publer adapter to approval workflow
- When approved → POST to `/api/social/post` → Publer publishes

**Files to Modify**:
- `app/services/approvals.ts` - Add social_post type
- `packages/integrations/publer.ts` - Add approval workflow integration
- May need: `app/routes/api/social/approve.$id.ts`

**Coordinate with**:
- **Engineer**: They build UI modal (ENG-036)
- **Content**: They provide post templates/microcopy

---

### INTEGRATIONS-002: Social Post Receipt Storage (30 min)

**After Post Published**:

**Store in Supabase** (social_posts table - Data creates):
- Platform
- Content
- Publer post ID
- Published timestamp
- Performance metrics (if Publer provides)

**Create**: `app/services/social/receipt-storage.ts`
**Tests**: Add to social.api.spec.ts

---

### INTEGRATIONS-003: Publer Health Monitoring (30 min)

**Add Health Check**:
- Endpoint: `/api/social/health`
- Checks: Publer API reachable, account active
- Display in Settings → Integrations tab (Engineer builds UI)

---

## Ongoing: API Contract Maintenance

**Maintain Fixtures**:
- `app/fixtures/content/idea-pool.json` (keep updated)
- `app/fixtures/content/social-posts.json` (if needed for Phase 12)

**Contract Tests**:
- Keep passing (13/13 idea pool tests)
- Add social post contract tests (Phase 12)

---

## Work Protocol

**1. MCP Tools**:
```bash
# Publer documentation (if available):
# Check Context7 or web search

# TypeScript for integration patterns:
mcp_context7_get-library-docs("/microsoft/TypeScript", "async-functions")
```

**2. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Integrations: Phase N Work

**Working On**: INTEGRATIONS-001 (Publer backend verification)
**Progress**: Adapter tested, approval integration in progress

**Evidence**:
- Test: scripts/proof/test-publer-adapter.ts → ✅ PASS
- Files: app/services/approvals.ts (+25 lines for social_post type)
- Tests: 10/10 passing (+3 new tests)

**Blockers**: None
**Next**: Complete receipt storage integration
```

---

## Definition of Done

### Phase 3 (Idea Pool):
- [ ] API responding correctly when Engineer integrates
- [ ] Contract tests still passing (13/13)
- [ ] Support Engineer if issues arise

### Phase 12 (Publer):
- [ ] Social post type added to approval queue
- [ ] Publer adapter integrated with approval workflow
- [ ] Receipt storage functional
- [ ] Health check endpoint operational
- [ ] Tests passing (10+ tests)
- [ ] Coordinate with Engineer/Content successful

---

## Critical Reminders

**DO**:
- ✅ Test integrations end-to-end
- ✅ Maintain contract tests (keep passing)
- ✅ Coordinate with Engineer for UI integration
- ✅ Document all API patterns

**DO NOT**:
- ❌ Break existing idea pool API (Engineer depends on it)
- ❌ Skip testing Publer adapter before integration
- ❌ Commit Publer API keys (use Fly secrets)

---

## Phase Schedule

**Immediate**: Standby for Phase 3 (Engineer integrating Idea Pool tile)
**Day 5**: Phase 12 work (Publer UI integration - 4h)

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan)
**Current Work**: Issue #113 complete, standby for Option A
**API Routes**: `app/routes/api/social/`, `app/routes/api.analytics.idea-pool.ts`
**Feedback**: `feedback/integrations/2025-10-20.md`

---

**START WITH**: Standby mode, monitor idea pool API health

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

---

## ✅ MANAGER UPDATE (2025-10-21T00:00Z)

---

## ✅ ALL TASKS COMPLETE - STANDBY MODE

**Manager Update** (2025-10-21T01:25Z): All feedback reviewed, work verified complete

**Your Status**: ✅ STANDBY
- All assigned tasks completed successfully
- Evidence documented in feedback file
- Ready for Phase 3+ coordination or new assignments

**Current Focus**: Monitor feedback and await direction for:
- Phase 12: Publer UI Integration (Day 5)
- Idea Pool health monitoring
- Engineer coordination for ENG-008

**No Action Required**: Stay in standby until Manager assigns next task

**If Contacted By Other Agents**: Respond to coordination requests and document in feedback

**Status**: ALL TASKS COMPLETE ✅

**Evidence**: See feedback/integrations/2025-10-20.md

**Your Work**:
Work verified complete by Manager

**Next Assignment**: STANDBY - Await Phase 3-13 coordination requests

**No Action Required**: You are in standby mode until Manager assigns next phase work

