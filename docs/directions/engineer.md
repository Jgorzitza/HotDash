# Engineer Direction

- **Owner:** Engineer Agent
- **Effective:** 2025-10-19
- **Version:** 4.0

## Objective

Current Issue: #109

**PRIORITY SHIFT**: After ENG-000-P0 lint attempt caused regressions, reprioritizing to **server fix FIRST**, then production features. Lint cleanup deferred to v1.1 (P2 technical debt).

## Tasks (15 Molecules - Critical Path First)

### 🔴 P0 CRITICAL (Execute First)

1. **ENG-000-P1: Fix Server Startup Error** (30 min) **TOP PRIORITY**
   - **Impact**: Blocks Pilot (11 molecules), Designer (15 molecules), local dev
   - **Error**: `SyntaxError: The requested module 'react-router' does not provide an export named 'json'`
   - **Location**: `build/server/assets/server-build-*.js:7`
   - **Action**:
     - Search: `grep -r "import.*json.*react-router" app/routes/`
     - Replace deprecated `json` with React Router 7 patterns:
       ```typescript
       // ❌ OLD (React Router v6/Remix)
       import { json } from "react-router";
       return json({ data });
       
       // ✅ NEW (React Router 7)
       import type { Route } from "./+types/route-name";
       return { data }; // Auto-serialized
       ```
     - Rebuild: `npm run build`
     - Start server: `npm run dev`
   - **Evidence**: Server starts successfully, `/health` returns 200, no import errors
   - **ETA**: 30 minutes

### ✅ COMPLETED (4/15)

2. **ENG-001: Create Global Health Route** ✅ COMPLETE
   - Evidence: `app/routes/health.ts` exists

3. **ENG-002: Fix Integration Test Mocks** ✅ COMPLETE
   - Evidence: 210/236 tests passing (89%)

4. **ENG-003: Approvals Drawer Complete** ✅ COMPLETE
   - Evidence: Component functional with Polaris Modal

5. **ENG-010: Production Build Optimization** ✅ COMPLETE
   - Evidence: 57.46 kB gzipped, 4.51s build time

### 🟢 PRODUCTION FEATURES (Execute After ENG-000-P1)

6. **ENG-004: Dashboard Tiles - Wire Real Data** (90 min)
   - Use Shopify Dev MCP for API patterns
   - Use Context7 MCP for React Router 7 loader patterns
   - Wire 8 tiles to Shopify/Supabase data (NOT mocks)
   - Evidence: Tiles show live data

7. **ENG-005: Idea Pool Drawer Implementation** (40 min)
   - Complete drawer CRUD flows
   - Evidence: Drawer functional, all operations work

8. **ENG-006: Loading States - All Components** (25 min)
   - Skeleton loaders for tiles/drawers
   - Evidence: Loading states visible

9. **ENG-007: Error Handling - Global Boundary** (25 min)
   - React Router 7 ErrorBoundary
   - Evidence: Errors caught gracefully

10. **ENG-008: Responsive Grid - Dashboard** (30 min)
    - Mobile/tablet/desktop breakpoints
    - Evidence: Responsive at all sizes

11. **ENG-009: Feature Flags Integration** (20 min)
    - Wire flags to components
    - Evidence: Flags control visibility

12. **ENG-012: Accessibility Audit - WCAG AA** (20 min)
    - Keyboard nav, ARIA labels, contrast
    - Evidence: a11y audit report

13. **ENG-013: Documentation Updates** (20 min)
    - Component/API docs
    - Evidence: Docs in `docs/specs/`

14. **ENG-014: PR Preparation** (15 min)
    - Evidence summary for Manager PR
    - Evidence: Feedback file complete

15. **ENG-015: WORK COMPLETE Block** (10 min)
    - Final feedback entry
    - Evidence: Complete feedback

### 🟡 P2 DEFERRED (v1.1 Technical Debt)

16. **ENG-000-P0: Lint Cleanup** (DEFERRED - caused regressions)
    - **Why Deferred**: Automated `any` → proper types caused test failures
    - **Impact**: Low (build/tests work with lint warnings)
    - **Plan for v1.1**: Systematic type fixes with per-file testing
    - **For Now**: Accept lint warnings, focus on production features

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **MCP Tools:**
  - **shopify-dev-mcp**: Latest Shopify API patterns
  - **context7**: React Router 7 loader/action patterns
- **Allowed Paths:** `app/components/**`, `app/routes/**`, `tests/unit/**`, `tests/playwright/**`, `feedback/engineer/2025-10-19.md`
- **Budget:** ≤60 min per molecule (except ENG-004: 90 min)

## Definition of Done

- [ ] **ENG-000-P1 (server fix) COMPLETE** - highest priority
- [ ] All 15 production molecules executed
- [ ] Components tested and accessible
- [ ] `npm run fmt` passing
- [ ] `npm run test:unit` passing (≥210/236 minimum)
- [ ] `npm run build` successful
- [ ] Server starts with `npm run dev`
- [ ] Docs updated
- [ ] Feedback complete

## Contract Test

- **Server Verification**: `curl http://localhost:5173/health` (200 OK)
- **Build Verification**: `npm run build` (no errors)
- **Final Test**: `npx vitest run tests/unit/routes/ideas.drawer.spec.ts`

## Risk & Rollback

- **Risk Level**: MEDIUM (server fix is targeted, low regression risk)
- **Rollback**: If server fix fails, revert specific files
- **Monitoring**: Server logs, test pass rate

## Links & References

- Feedback: `feedback/engineer/2025-10-19.md`
- QA Report: `feedback/qa/2025-10-19.md`
- North Star: `docs/NORTH_STAR.md`

## Change Log

- 2025-10-19: Version 4.0 – **Reprioritized**: Server fix P0, lint cleanup deferred to v1.1 (P2)
- 2025-10-19: Version 3.0 – Added P0 unblockers (lint + server)
- 2025-10-17: Version 2.0 – Production harness alignment
