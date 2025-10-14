---
epoch: 2025.10.E1
doc: docs/directions/qa.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# QA — Direction

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist: docs/runbooks/agent_launch_checklist.md

> **English Only**: All test descriptions and documentation in English (CEO directive)

## Current Sprint Focus — Growth System Testing (2025-10-14)

**Status**: TDD tests complete (40+ tests for Action system ✅)  
**Next**: Validate Engineer implementation, expand test coverage

**Priority 0: Action System Validation** (This Week - 10-12 hours)

1. **Run TDD Test Suite** (1 hour)
   - Verify Engineer's implementation against QA's 40+ tests
   - Target: 90%+ pass rate
   - Report failures to Engineer
   
2. **Integration Test Suite** (3-4 hours)
   - End-to-end action flow (create → approve → execute)
   - Rollback scenarios
   - Error handling paths
   - Deliverable: `tests/integration/action-system.spec.ts`

3. **API Contract Tests** (2 hours)
   - Validate all `/api/actions/*` endpoints
   - Schema validation (Zod)
   - Error response formats

4. **UI Component Tests** (2-3 hours)
   - Action Queue interactions
   - Detail Modal behavior
   - Batch operations
   - Deliverable: `app/__tests__/components/` test files

5. **Performance Testing** (2 hours)
   - Action execution latency <2s
   - Queue load time <500ms
   - Database query performance

**Priority 1: Recommender Testing** (Week 2 - 12-14 hours)

6. **Recommender Output Validation** (3-4 hours)
   - Test each recommender's action generation
   - Validate confidence scores (0-100%)
   - Check AI rationale quality

7. **Data Pipeline Tests** (2-3 hours)
   - Purchase patterns accuracy
   - Baseline calculations
   - Data quality validation

8. **Learning Loop Tests** (2 hours)
   - Outcome measurement accuracy
   - Confidence adjustment logic
   - Feedback storage

9. **Scheduler Tests** (2 hours)
   - Cron job execution
   - Action prioritization
   - Deduplication logic

10. **Security Testing** (3 hours)
    - Action approval auth
    - Rollback permissions
    - Data access controls

**Priority 2: Advanced Testing** (Week 3 - 10-12 hours)

11. **A/B Test Framework Validation** (2 hours)
12. **Auto-Approval Rule Testing** (2 hours)
13. **Mobile Experience Tests** (2 hours)
14. **Accessibility Testing** (2 hours - WCAG 2.1 AA)
15. **Load Testing** (2 hours - 100+ concurrent actions)
16. **Chaos Engineering** (2-3 hours - API failures, DB errors)

## Evidence & Compliance

Report every 2 hours:
```
## YYYY-MM-DDTHH:MM:SSZ — QA: [Test Suite] [Status]
**Working On**: [P0 task]
**Progress**: [X/Y tests passing]
**Evidence**: 
- Test file: tests/path/file.spec.ts
- Results: 45/50 passing (90%)
- Failures: [brief summary]
**Blockers**: [None or details]
**Next**: [Next suite]
```

## Success Criteria

**P0 Complete**: 90%+ TDD pass rate, E2E tests green, Performance SLAs met  
**P1 Complete**: All recommenders validated, Security tests pass  
**P2 Complete**: Load tests pass, Accessibility AAcompliant

## Timeline

- Week 1: 10-12 hours (Action system)
- Week 2: 12-14 hours (Recommenders)
- Week 3: 10-12 hours (Advanced)
- **Total**: 32-38 hours

---

**Last Updated**: 2025-10-14T21:20:00Z  
**Start**: Run TDD suite immediately  
**Evidence**: All work in `feedback/qa.md`
