# Agent Relaunch Instructions - 2025-10-15

## Critical Process Fix

**ISSUE IDENTIFIED:** Agents not following correct feedback file format

**CORRECT FORMAT:** `feedback/<agent>/YYYY-MM-DD.md`
**INCORRECT FORMAT:** `feedback/<agent>.md`

**ALL AGENTS MUST:**
1. Create feedback directory: `mkdir -p feedback/<agent>`
2. Create dated feedback file: `feedback/<agent>/2025-10-15.md`
3. Log all work in dated file (NOT in `feedback/<agent>.md`)

---

## Supabase Status - RESOLVED ✅

**Status:** Supabase local is RUNNING
- API URL: http://127.0.0.1:54321
- Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- Studio URL: http://127.0.0.1:54323

**Credentials:**
- Publishable key: Available from `supabase status`
- Secret key: Available from `supabase status`

**Action:** Data and Integrations agents can proceed - Supabase is ready

---

## Agent Status & Relaunch Instructions

### ✅ COMPLETED WORK - Ready for Next Tasks

#### 1. QA Agent
**Status:** ✅ Work complete
**Completed:**
- Test plan template created
- Acceptance criteria guide created
**Next Tasks:**
- Review PRs from other agents
- Add acceptance criteria to GitHub Issues #8-#26
**Launch:** `@docs/runbooks/agent_startup_checklist.md Continue with PR reviews and adding acceptance criteria to all foundation Issues`

#### 2. Designer Agent
**Status:** ✅ Work complete
**Completed:**
- Dashboard tiles design spec
- Approvals drawer UX spec
**Next Tasks:**
- Coordinate with engineer for feasibility review
- Refine specs based on feedback
**Launch:** `@docs/runbooks/agent_startup_checklist.md Coordinate with engineer to review design specs for implementation feasibility`

#### 3. Inventory Agent
**Status:** ✅ Work complete
**Completed:**
- Inventory data model spec
- Shopify metafields research
**Next Tasks:**
- Coordinate with data agent for schema design
- Answer manager questions on payout brackets
**Launch:** `@docs/runbooks/agent_startup_checklist.md Coordinate with data agent on inventory schema design based on your specs`

### ⏸️ BLOCKED - Need Unblocking

#### 4. Data Agent
**Status:** ⏸️ Blocked (RESOLVED)
**Blocker:** Thought Supabase wasn't running
**Resolution:** Supabase IS running at http://127.0.0.1:54321
**Next Tasks:**
- Design approvals schema (Issue #17)
- Design audit log schema (Issue #18)
**Launch:** `@docs/runbooks/agent_startup_checklist.md Supabase is running at http://127.0.0.1:54321. Proceed with schema design for Issues #17 and #18`

#### 5. Integrations Agent
**Status:** ⏸️ Blocked (RESOLVED)
**Blocker:** Thought Supabase wasn't running
**Resolution:** Supabase IS running, credentials available
**Next Tasks:**
- Build Shopify Admin read queries (Issue #10)
- Create Supabase RPC functions (Issue #11)
**Launch:** `@docs/runbooks/agent_startup_checklist.md Supabase is running. Load credentials from vault and proceed with Issues #10 and #11`

#### 6. Product Agent
**Status:** ⏸️ Blocked
**Blocker:** Couldn't find Issues #25, #26
**Resolution:** Issues exist - check again
**Next Tasks:**
- Write foundation milestone PRD (Issue #25)
- Create feature prioritization matrix (Issue #26)
**Launch:** `@docs/runbooks/agent_startup_checklist.md Issues #25 and #26 exist. Proceed with foundation PRD and prioritization matrix`

### 🚀 READY TO LAUNCH - No Blockers

#### 7. Engineer Agent
**Status:** 🚀 Ready (needs feedback format fix)
**Issue:** Using old feedback format `feedback/engineer.md`
**Fix Required:** Create `feedback/engineer/2025-10-15.md`
**Next Tasks:**
- Dashboard shell (Issue #8)
- Approvals Drawer (Issue #9)
**Launch:** `@docs/runbooks/agent_startup_checklist.md IMPORTANT: Create feedback/engineer/2025-10-15.md (not feedback/engineer.md). Then proceed with Issues #8 and #9`

#### 8. DevOps Agent
**Status:** 🚀 Ready
**Next Tasks:**
- Fix Feedback Cadence CI (Issue #15)
- Setup Fly.io staging (Issue #16)
**Launch:** `@docs/runbooks/agent_startup_checklist.md Execute your startup checklist. Your tasks: Fix Feedback Cadence CI failures (Issue #15) and setup Fly.io staging environment (Issue #16)`

#### 9. AI Customer Agent
**Status:** 🚀 Ready
**Next Tasks:**
- Initialize OpenAI SDK (Issue #12)
- Build customer support agent (Issue #13)
- Build CEO assistant agent (Issue #14)
**Launch:** `@docs/runbooks/agent_startup_checklist.md Execute your startup checklist. Load OpenAI key from vault/occ/openai/api_key_staging.env. Build OpenAI Agents SDK implementation per Issues #12, #13, #14`

### 📊 NEEDS ACTIVATION - GA4 API Ready

#### 10. Analytics Agent
**Status:** Ready to activate
**Note:** GA4 API is working (not MCP)
**Next Tasks:**
- Build GA4 API integration
- Provide analytics data for dashboard tiles
**Launch:** `@docs/runbooks/agent_startup_checklist.md GA4 API is configured and working. Build GA4 integration service using credentials in vault/occ/google/analytics-service-account.json`

---

## Summary

**Agents with Completed Work (3):**
- QA, Designer, Inventory - Ready for next phase

**Agents Blocked - Now Unblocked (3):**
- Data, Integrations, Product - Supabase running, Issues exist

**Agents Ready to Launch (4):**
- Engineer, DevOps, AI Customer, Analytics

**Total Active Agents:** 10
**Total Idle Agents:** 0

---

## Critical Reminders

### Feedback File Format
```bash
# CORRECT
feedback/<agent>/2025-10-15.md

# INCORRECT
feedback/<agent>.md
```

### Supabase Connection
```bash
# Supabase is RUNNING
API URL: http://127.0.0.1:54321
Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Get credentials
supabase status
# Then export the keys shown in output
```

### GitHub Issues
All Issues #8-#26 exist and are assigned. Check with:
```bash
gh issue list --label task
```

---

## Next Manager Actions

1. ✅ Unblock data & integrations (Supabase confirmed running)
2. ✅ Unblock product (Issues confirmed exist)
3. ⏳ Launch all 10 agents with correct instructions
4. ⏳ Monitor feedback files for correct format
5. ⏳ Review PRs as they come in

---

**Status:** All agents unblocked and ready to work
**Time:** 2025-10-15
**Manager:** Ready to launch all agents

