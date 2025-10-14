---
epoch: 2025.10.E1
doc: docs/directions/engineer.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Engineer — Direction

## Canon
- North Star: docs/NORTH_STAR.md (MCP-First Development)
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Agent Workflow Rules: .cursor/rules/04-agent-workflow.mdc (alwaysApply: true)
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist: docs/runbooks/agent_launch_checklist.md
- Growth Roadmap: docs/specs/growth-spec-roadmap.md
- Growth Progress: docs/specs/growth-spec-progress-report.md

> **MCP-First Development (CRITICAL)**: We are in 2025. Agent training data is SEVERELY OUTDATED:
> - React Router 7: Training has v6/Remix patterns (2+ years old)
> - Shopify APIs: Training from 2023 (2 YEARS OLD - multiple API versions behind)
> 
> **NEVER trust training data. ALWAYS verify with MCP**:
> - React Router 7: Use Context7 MCP to verify ALL loaders/actions/route modules  
> - Shopify GraphQL: Use Shopify MCP to validate ALL queries (2023→2025 = major changes)
> - Shopify API: Validate App Bridge, Admin API calls with Shopify MCP
> - Workflow: Search HotDash codebase FIRST (grep/Context7), then verify with MCP (token limits: 800-1500)
> - See: `.cursor/rules/04-agent-workflow.mdc` for complete enforcement rules

## Current Sprint Focus — Growth Engine Execution (2025-10-14)

**Priority 0: Critical Blockers** (Complete ASAP - 18-22 hours)
1. **A4: Execution Engine** ⚠️ BLOCKS ALL GROWTH (4-5 hours)
   - Background job to execute approved actions
   - Shopify Admin API mutations
   - Error handling with retry logic (3 attempts, exponential backoff)
   - Status updates (executing → executed/failed)
   - Deliverable: `app/services/action-executor.server.ts`
   
2. **A5: Rollback System** (3-4 hours)
   - Store original values before execution
   - Rollback API: POST `/api/actions/:id/rollback`
   - Rollback UI in Action Detail modal
   - Deliverable: `app/services/action-rollback.server.ts` + UI

3. **A3: Complete Action Queue UI** (2-3 hours)
   - List pending actions with diff preview
   - Approve/reject buttons
   - Filter by type, confidence, priority
   - Deliverable: Complete `app/routes/app.approval-queue.tsx`

4. **A7: Logging & Monitoring** (1-2 hours)
   - Log all action lifecycle events to Supabase
   - Alert on execution failures (>3 in 1 hour)
   - Deliverable: `app/services/action-logger.server.ts`

5. **A6: Action Status Tracking** (1 hour)
   - State machine validation (prevent invalid transitions)
   - Valid: pending → approved → executing → executed
   - Invalid: pending → executed (must go through approved)

6. **G1: Approval Queue Dashboard** (1-2 hours)
   - Top 10 actions by priority score
   - Bulk actions (approve multiple)
   - Keyboard shortcuts (A=approve, R=reject)

7. **G2: Action Detail Modal** (2 hours)
   - Full diff visualization (before/after)
   - AI rationale display
   - Estimated impact metrics
   - Deliverable: `app/components/ActionDetailModal.tsx`

**Priority 1: Week 2 Features** (After P0 - 20-25 hours)

8. **D1: Shopify Storefront API** (3-4 hours)
   - Storefront GraphQL client
   - Metaobject mutations
   - Deliverable: `app/services/shopify-storefront.server.ts`

9. **E1: Recommender Scheduler** (2-3 hours)
   - Daily cron (02:00-06:00 UTC)
   - Run all 5 recommenders
   - Email summary to operator

10. **E2: Action Prioritization** (1-2 hours)
    - Sort by: confidence × impact × urgency
    - Show top 10 daily

11. **E3: Deduplication & Conflict Detection** (2 hours)
    - Prevent duplicate actions on same resource
    - Flag conflicts

12. **F1: Outcome Measurement** (3 hours)
    - Daily job for 30-day-old actions
    - Compare actual vs estimated impact
    - Deliverable: `app/services/outcome-measurement.server.ts`

13. **B5: Performance Monitoring** (2 hours)
    - Lighthouse CI integration
    - Daily CWV measurements

14. **D2: Theme Customization** (2 hours)
    - Inject recommendations into theme
    - Theme JSON updates

**Priority 2: Week 3 Advanced** (16-20 hours)

15. **H1: Auto-Approval Rules** (3-4 hours)
16. **H2: Batch Operations** (2 hours)
17. **I6: A/B Test Framework** (3 hours)
18. **J2: Performance Optimization** (2-3 hours)
19. **J3: Error Handling & Recovery** (2-3 hours)
20. **H3: Action Templates** (2 hours)
21. **H4: Scheduled Actions** (2 hours)

## Evidence & Compliance

Every task requires:
1. Code committed with meaningful message
2. Tests written (≥80% coverage)
3. Evidence in `feedback/engineer.md`:
   - File paths created/modified
   - Test results (X/Y passing)
   - TypeScript build status
   - Demo screenshot for UI work
4. MCP validation: Shopify queries via Shopify MCP, RR7 patterns via Context7 MCP

Report every 2 hours:
```
## YYYY-MM-DDTHH:MM:SSZ — Engineer: [Task] [Status]
**Working On**: [P0 task]
**Progress**: [% or milestone]
**Evidence**: 
- Files: app/services/file.ts
- Tests: 15/15 passing
- Build: ✅ TypeScript passing
**Blockers**: [None or details]
**Next**: [Next task]
```

## Success Criteria

**P0 Complete** (This Week):
- ✅ A4 Execution Engine working
- ✅ A5 Rollback functional
- ✅ A3 Queue UI complete
- ✅ 100% test coverage critical path
- ✅ Zero TypeScript errors
- ✅ 1+ end-to-end action executed

**P1 Complete** (Week 2):
- ✅ Scheduler running daily
- ✅ Outcome measurement working
- ✅ Performance monitoring live

## Coordination

**With AI**: AI builds recommenders after your A4 complete  
**With Data**: Data provides B4-B7 pipelines  
**With QA**: Run QA's TDD tests, target 90%+ pass rate  
**With Designer**: Implement G2 from Designer's mockups

## Blockers & Escalation

**Current**: NONE (all dependencies resolved)

If blocked >2 hours:
```
🚨 BLOCKER: [Task] blocked on [reason]
**Attempted**: [what tried]
**Error**: [specific error]
**Needed**: [what would unblock]
**Impact**: [tasks blocked]
```

## Timeline

- Week 1: 18-22 hours (P0 critical path)
- Week 2: 20-25 hours (P1 features)
- Week 3: 16-20 hours (P2 advanced)
- **Total**: 54-67 hours over 3 weeks

---

## ⚠️ EXECUTION INSTRUCTION

**DO NOT STOP TO ASK "WHAT'S NEXT"**:
- Your direction file contains ALL your tasks (P0, P1, P2)
- Execute them sequentially until ALL complete
- Report progress every 2 hours (don't ask permission)
- Log blockers and move to next task if stuck
- Only stop when ALL assigned work is done

**See**: .cursor/rules/04-agent-workflow.mdc for complete execution rules

---

**Last Updated**: 2025-10-14T21:15:00Z  
**Start**: Immediately with A4 (Execution Engine)  
**Evidence**: All work logged in `feedback/engineer.md`
