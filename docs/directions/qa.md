# QA Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:07Z  
**Version**: 5.2  
**Status**: ACTIVE — Phase 6 Testing + E2E Expansion

---

## Objective

**Build comprehensive test suite for Phase 6 + Accessibility automation**

---

## MANDATORY MCP USAGE

```bash
# Playwright for E2E testing
mcp_context7_get-library-docs("/microsoft/playwright", "testing drag drop accessibility")

# Vitest for unit testing
mcp_context7_get-library-docs("/vitest-dev/vitest", "async testing mocking")

# TypeScript test patterns
mcp_context7_get-library-docs("/microsoft/TypeScript", "testing types mocking")
```

---

## ACTIVE TASKS (9h total)

### QA-002: Phase 6 Test Plan (2h) - START NOW

**Requirements**:
- Test scenarios for all Phase 6 features
- Drag/drop tile reorder tests
- Settings page form validation
- Theme switching tests

**MCP Required**: Pull Playwright docs for drag/drop testing

**Deliverables**:
**File**: `docs/specs/phase-6-test-plan.md` (new)
- Test scenarios (30+)
- Acceptance criteria
- Edge cases

**Time**: 2 hours

---

### QA-003: Accessibility Testing Suite (3h)

**Requirements**:
- Automated WCAG 2.2 AA testing
- Screen reader compatibility tests
- Keyboard navigation tests
- Color contrast validation

**MCP Required**: Playwright accessibility testing docs

**Implementation**:
**File**: `tests/e2e/accessibility/settings-page.spec.ts` (new)
**File**: `tests/e2e/accessibility/dashboard.spec.ts` (new)

**Time**: 3 hours

---

### QA-004: Performance Regression Tests (2h)

**Requirements**:
- Benchmark tile load times
- Drag/drop performance tests
- Settings save performance
- Alert on regressions

**File**: `tests/performance/tile-load-benchmarks.spec.ts` (new)

**Time**: 2 hours

---

### QA-005: E2E Settings Flow (2h)

**Requirements**:
- Complete settings flow test
- Drag tile, change theme, toggle visibility
- Verify persistence across sessions

**File**: `tests/e2e/settings-flow.spec.ts` (new)

**Time**: 2 hours

---

## Work Protocol

**MCP Tools**: Playwright, Vitest, TypeScript docs

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — QA: Phase 6 Test Plan

**Working On**: QA-002 (Test plan creation)
**Progress**: 80% - 28 scenarios documented, edge cases pending

**Evidence**:
- File: docs/specs/phase-6-test-plan.md (234 lines)
- Test scenarios: 28 (drag/drop: 8, settings: 12, theme: 5, misc: 3)
- MCP: Playwright drag/drop testing patterns verified
- Edge cases: Identified 12 edge cases for testing

**Blockers**: None
**Next**: Complete edge cases, begin QA-003 (accessibility suite)
```

---

**START WITH**: QA-002 (Test plan) - Pull Playwright docs NOW

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
