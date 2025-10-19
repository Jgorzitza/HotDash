# Engineer Direction

- **Owner:** Engineer Agent
- **Effective:** 2025-10-19
- **Version:** 3.0

## Objective

Current Issue: #109

**P0 PRIORITY:** Fix critical blockers (lint errors + server startup) FIRST, then ship production-ready UI/application code with full HITL governance and test coverage.

## Tasks (17 Molecules - Unblockers First)

### P0 CRITICAL UNBLOCKERS (Execute First)

1. **ENG-000-P0:** Fix All 590 Lint Errors (120 min) **PRIORITY 1**
   - **Blocker Impact:** Blocks DevOps CI, Engineer ENG-011, 37 files
   - **Allowed Paths:** **TEMPORARILY EXPANDED** to `app/**` for this molecule only
   - **Root Cause:** 578 `@typescript-eslint/no-explicit-any` violations, 10 missing return types
   - **Action:**
     - Run `npm run lint` to get full error list
     - Fix `any` types with proper TypeScript types
     - Add explicit return types where missing
     - Focus on: `app/routes/**`, `app/components/**`, `app/services/**`
   - **Evidence:** `npm run lint` returns 0 errors, 0 warnings
   - **After Completion:** Revert allowed paths to standard Engineer scope
   - **ETA:** 2 hours

2. **ENG-000-P1:** Fix Server Startup Error (30 min) **PRIORITY 2**
   - **Blocker Impact:** Blocks Pilot (11 molecules), Designer (15 molecules), local dev server
   - **Error:** `SyntaxError: The requested module 'react-router' does not provide an export named 'json'`
   - **Location:** `build/server/assets/server-build-*.js:7`
   - **Root Cause:** React Router 7 deprecated `json` export in favor of `Response.json()`
   - **Action:**
     - Search codebase for `import { json }` from react-router
     - Replace with `import type { Route }` and use `Response.json()` or `return { data }`
     - Check `app/routes/**/*.ts` files for deprecated imports
     - Rebuild: `npm run build`
   - **Evidence:** `npm run dev` starts successfully, server responds on port, `/health` returns 200
   - **ETA:** 30 minutes

### Completed Molecules (4/15)

3. **ENG-001:** Create Global Health Route (15 min) ✅ COMPLETE
   - Evidence: `/home/justin/HotDash/hot-dash/app/routes/health.ts`

4. **ENG-002:** Fix Integration Test Mocks (20 min) ✅ COMPLETE
   - Evidence: 210/236 tests passing

5. **ENG-003:** Approvals Drawer Complete (45 min) ✅ COMPLETE
   - Evidence: Component functional with Polaris Modal

6. **ENG-010:** Production Build Optimization (25 min) ✅ COMPLETE
   - Evidence: 57.46 kB gzipped, 4.51s build time

### Remaining Production Molecules (11)

7. **ENG-004:** Dashboard Tiles - Wire Real Data (90 min)
   - Use Shopify Dev MCP for latest API patterns
   - Use Context7 MCP for React Router 7 loader patterns
   - Wire 8 tiles to real Shopify/Supabase data
   - Evidence: Tiles show real data, no mock fallbacks

8. **ENG-005:** Idea Pool Drawer Implementation (40 min)
   - Complete drawer with create/edit/delete flows
   - Evidence: Drawer opens/closes, CRUD operations work

9. **ENG-006:** Loading States - All Components (25 min)
   - Skeleton loaders for all tiles and drawers
   - Evidence: Loading states visible during data fetch

10. **ENG-007:** Error Handling - Global Boundary (25 min)
    - React Router 7 ErrorBoundary pattern
    - Evidence: Errors caught and displayed gracefully

11. **ENG-008:** Responsive Grid - Dashboard (30 min)
    - Mobile, tablet, desktop breakpoints
    - Evidence: Dashboard responsive at all sizes

12. **ENG-009:** Feature Flags Integration (20 min)
    - Wire feature flags to components
    - Evidence: Flags control feature visibility

13. **ENG-011:** All Tests Green - CI Pass (30 min) **UNBLOCKED AFTER ENG-000-P0**
    - Fix remaining test failures after lint cleanup
    - Evidence: `npm run test:ci` passes 100%

14. **ENG-012:** Accessibility Audit - WCAG AA (20 min)
    - Keyboard navigation, ARIA labels, color contrast
    - Evidence: a11y audit report

15. **ENG-013:** Documentation Updates (20 min)
    - Update component docs, API docs
    - Evidence: Docs updated in `docs/specs/`

16. **ENG-014:** PR Preparation (15 min)
    - Prepare evidence for Manager PR creation
    - Evidence: Summary in feedback file

17. **ENG-015:** WORK COMPLETE Block (10 min)
    - Final feedback entry
    - Evidence: Complete feedback file

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **MCP Tools (Mandatory):**
  - **shopify-dev-mcp:** For latest Shopify API patterns and GraphQL validation
  - **context7:** For React Router 7 loader/action patterns (NOT Remix!)
- **Process:** Follow OPERATING_MODEL.md, log daily feedback per RULES.md
- **Allowed Paths:**
  - **STANDARD:** `app/components/**`, `app/routes/**`, `tests/unit/**`, `tests/playwright/**`, `feedback/engineer/2025-10-19.md`
  - **TEMPORARY (ENG-000-P0 only):** `app/**` (reverts after lint cleanup complete)
- **Budget:** Time ≤ 60 minutes per molecule (except ENG-000-P0: 120 min)

## Definition of Done

- [ ] **P0 blockers resolved FIRST** (lint errors, server startup)
- [ ] All 17 molecules executed with evidence
- [ ] Components tested and accessible
- [ ] `npm run fmt` passing
- [ ] `npm run lint` passing (0 errors)
- [ ] `npm run test:ci` green (100% pass rate)
- [ ] `npm run scan` clean
- [ ] Docs updated
- [ ] Feedback entry complete

## Contract Test

- **P0 Verification:** `npm run lint` (must return 0 errors)
- **Server Verification:** `curl http://localhost:5173/health` (must return 200)
- **Final Test:** `npx vitest run tests/unit/routes/ideas.drawer.spec.ts`

## Risk & Rollback

- **Risk Level:** HIGH (P0 blockers affecting multiple agents)
- **Rollback Plan:** If lint fixes break tests, revert specific files and iterate
- **Monitoring:** CI status, test pass rate, server startup logs

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/engineer/2025-10-19.md`
- QA Report: `feedback/qa/2025-10-19.md` (lists P0 defects)

## Change Log

- 2025-10-19: Version 3.0 – Added P0 unblockers (lint + server), expanded paths temporarily
- 2025-10-17: Version 2.0 – Production harness alignment + accessibility focus
- 2025-10-16: Version 1.0 – Router harness refactor + idea pool wiring
