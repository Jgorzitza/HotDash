# Engineer Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-21T01:25:00Z  
**Version**: 5.3  
**Status**: ✅ Phase 2 COMPLETE & PASSED - Start Phase 3 NOW

---

## ✅ PHASE 2: COMPLETE & PASSED (3rd Validation)

**Your Work**: ✅ ALL 10 P0 FIXES APPLIED (commits: 761d30f, 7b1b73e, 08a6c0f)
**Designer Validation**: ✅ PASSED (3rd validation, all issues resolved)
**Evidence**: feedback/engineer/2025-10-20.md (19:15 UTC), feedback/designer/2025-10-20.md (18:05 UTC)

**Phase 2 Status**: ✅ READY FOR CEO CHECKPOINT 2

---

## START NOW: Phase 3 - Missing Dashboard Tiles (4 hours)

**Tasks** (PROJECT_PLAN.md Phase 3):
- ENG-008: Idea Pool Tile (1.5h)
- ENG-009: CEO Agent Tile (1.5h)
- ENG-010: Unread Messages Tile (1h)

**Integrations Needed**:
- Integrations agent: Idea Pool API ready (13/13 tests passing)
- AI-Customer agent: CEO agent backend ready
- Content agent: Microcopy for all 3 tiles

**Start with**: ENG-008 (Idea Pool Tile first)
## ✅ PHASE 2: COMPLETE & PASSED

**Your Work**: ✅ ALL 10 P0 FIXES APPLIED
- Commits: 761d30f (core accessibility), 7b1b73e (toasts), 08a6c0f (WoW + chart)
- Designer Validation: ✅ PASSED (3rd validation, 18:05 UTC)
- Status: Ready for CEO Checkpoint 2

---

## 🚀 START NOW: Phase 3 - Missing Dashboard Tiles (4 hours)

**Priority**: P0 - Complete these 3 tiles to unlock CEO Checkpoint 3

### ENG-008: Idea Pool Tile (1.5 hours)

**What**: Dashboard tile showing pending feature ideas from customers

**Backend Ready**: ✅ Integrations agent (API route complete, 13/13 tests passing)
- Route: `app/routes/api.analytics.idea-pool.ts`
- Returns: `{ ideas: number, topSource: string, thisWeek: number }`

**Your Task**:
1. Create `app/components/dashboard/IdeaPoolTile.tsx`
2. Use `useFetcher()` to load data from `/api/analytics/idea-pool`
3. Display metrics: Total ideas, top source, weekly trend
4. Action button: "Review Ideas" → Navigate to idea pool page
5. Polaris Card component, accessibility compliant
6. Tests: Unit test for component rendering + data display

**Microcopy**: Ask Content agent for tile copy
**Time**: 90 minutes

---

### ENG-009: CEO Agent Tile (1.5 hours)

**What**: Dashboard tile showing AI CEO agent status and recent actions

**Backend Ready**: ✅ AI-Customer agent (CEO agent service complete)
- Service: `packages/agents/src/ai-ceo.ts` (5 tools, HITL workflow)
- Stats API: Need to create `app/routes/api.ceo-agent.stats.ts`

**Your Task**:
1. Create `/api/ceo-agent/stats` API route
   - Returns: `{ actionsToday: number, pendingApprovals: number, lastAction: string }`
   - Use mock data for now (Phase 11 will wire real backend)
2. Create `app/components/dashboard/CEOAgentTile.tsx`
3. Display: Actions today, pending approvals, last action timestamp
4. Action button: "View Activity" → Navigate to CEO agent page
5. Polaris Card, accessibility compliant
6. Tests: Route test + component test

**Coordination**: Ask AI-Customer for recommended stats to display
**Time**: 90 minutes

---

### ENG-010: Unread Messages Tile (1 hour)

**What**: Dashboard tile showing unread Chatwoot messages

**Backend**: Chatwoot API integration
- Chatwoot: ✅ ON SUPABASE, migrations complete, API functional
- Credentials: vault/occ/chatwoot/api_token.env

**Your Task**:
1. Create `app/services/chatwoot/client.ts`
   - Function: `getUnreadCount()` using Chatwoot REST API
   - Endpoint: `GET /api/v1/accounts/{account_id}/conversations?status=open`
   - Count unread messages from response
2. Create `/api/chatwoot/unread` API route (calls client)
3. Create `app/components/dashboard/UnreadMessagesTile.tsx`
4. Display: Unread count, top conversation snippet
5. Action button: "View Messages" → Opens Chatwoot inbox
6. Polaris Card, accessibility compliant
7. Tests: Client test, route test, component test

**Chatwoot Docs**: Ask Support agent for API documentation
**Time**: 60 minutes

---

## Phase 3 Success Criteria

**Deliverables**:
- ✅ 3 new dashboard tiles (Idea Pool, CEO Agent, Unread Messages)
- ✅ 2 new API routes (ceo-agent/stats, chatwoot/unread)
- ✅ 1 new service (chatwoot client)
- ✅ All components accessibility compliant (WCAG 2.2 AA)
- ✅ Unit tests for all new code
- ✅ Build passing (TypeScript, lint, tests)

**After Completion**:
→ Designer validates Phase 3
→ If PASS → CEO Checkpoint 3
→ Then proceed to Phase 4 (Navigation & Settings)

**Estimated Time**: 4 hours total

---

## Coordination

**Ask Integrations**: Idea Pool API endpoint documentation
**Ask AI-Customer**: CEO Agent stats to display
**Ask Support**: Chatwoot API documentation and token setup
**Ask Content**: Microcopy for all 3 tiles (titles, descriptions, button text)
**Ask Designer**: Any tile layout/styling requirements

---

## Reminder: Phase 2 COMPLETE

Don't worry about Phase 2 - ALL 10 issues are fixed and Designer validation PASSED. Focus on Phase 3 now.
