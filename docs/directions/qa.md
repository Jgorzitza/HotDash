# QA Direction v6.0

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
**Version**: 6.0  
**Status**: QA-001 - Code Review Phase 2 (1 hour)

---

## START NOW: QA-001 - Code Review Phase 2 Engineer Commits (1 hour)

**Context**: Engineer completed Phase 2 with 3 fix commits. Review code quality before CEO Checkpoint 2.

**Commits to Review**:
1. `761d30f` - "fix(engineer): core accessibility (focus trap + Escape key)"
2. `7b1b73e` - "fix(engineer): toast notifications for all modals"
3. `08a6c0f` - "fix(engineer): WoW variance + 14-day chart"

### Review Checklist

**Code Quality** (20 min):
- [ ] TypeScript: No `any` types, proper type safety
- [ ] React Router 7: Correct patterns (no `@remix-run` imports)
- [ ] Polaris: Proper component usage
- [ ] Code duplication: Check for repeated logic (should use hooks)
- [ ] File structure: Components in correct directories
- [ ] Naming: Clear, descriptive variable/function names

**Accessibility** (15 min):
- [ ] WCAG 2.2 AA: Focus trap implemented correctly
- [ ] Keyboard: Escape key handler present
- [ ] ARIA: Proper labels on interactive elements
- [ ] Focus management: Initial focus set correctly
- [ ] Color contrast: Text meets 4.5:1, interactive 3:1
- [ ] Screen reader: aria-live regions for dynamic content

**Testing** (10 min):
- [ ] Unit tests: Coverage for new hooks (useModalFocusTrap, useToast)
- [ ] Tests passing: npm run test:ci
- [ ] Edge cases: Null checks, error handling

**Security** (5 min):
- [ ] No secrets: gitleaks scan passing
- [ ] Input validation: User input sanitized
- [ ] SQL injection: Using Prisma ORM only (no raw SQL)
- [ ] XSS protection: React default escaping + validation

**Database Safety** (5 min):
- [ ] No migrations: No ALTER/CREATE TABLE in commits
- [ ] Prisma: @@schema("public") on models
- [ ] RLS: Project-scoped queries

**Performance** (5 min):
- [ ] Bundle size: Check impact on server bundle
- [ ] Re-renders: Proper memo/useCallback usage
- [ ] Memory leaks: Cleanup in useEffect

### MCP Tools Required

**Use Context7 MCP** (minimum 4 calls):
1. React Router 7: Verify correct patterns
2. Polaris: Check accessibility compliance
3. TypeScript: Verify type safety
4. React Hooks: Validate custom hooks implementation

**Evidence Format**:
```md
## 01:30 - Context7: React Router 7
- Topic: useFetcher patterns
- Verified: ENG commits use useFetcher correctly ✅
- Issue found: None

## 01:35 - Context7: Polaris Accessibility
- Topic: Modal focus management
- Verified: useModalFocusTrap follows Polaris patterns ✅
- Recommendation: PASS
```

### Deliverables

**Code Review Report** (in feedback/qa/2025-10-20.md):
1. Summary: PASS/FAIL for each commit
2. Issues found: Severity (P0/P1/P2) + description
3. Recommendations: Improvements for next phase
4. MCP evidence: 4+ tool call logs

**Format**:
```md
## Code Review Results - Phase 2

### Commit 761d30f (Core Accessibility)
- Code Quality: ✅ PASS
- Accessibility: ✅ PASS  
- Testing: ✅ PASS
- Security: ✅ PASS
- Issues: None
- Recommendation: APPROVE

### Commit 7b1b73e (Toast Notifications)
...
```

**Time**: 60 minutes

**After QA-001**: Report findings to Manager, prepare for Phase 3 code review

---

## MCP Tools Compliance

**Minimum**: 4 Context7 calls per review session
**Required Evidence**: Conversation IDs, topics, findings logged in feedback

---

## 🔄 MANAGER UPDATE (2025-10-21T02:35Z)

**Feedback Consolidated**: All 10/20 + 10/21 work reviewed

**Status**: Standby - Monitor for coordination requests

**Time Budget**: See above
**Priority**: Execute until complete or blocked, then move to next task
**Report**: Every 2 hours in feedback/qa/2025-10-21.md

