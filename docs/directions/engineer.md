# Engineer - Production App Completion

> Complete Shopify Admin app with all features working. Test 100% green. Ship it.

**Issue**: #109 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/**, tests/**

## Constraints

- **MCP Tools**: MANDATORY use for all discovery/grounding
  - **Shopify**: `mcp_shopify_learn_shopify_api` (load API), `mcp_shopify_introspect_graphql_schema` (schema), `mcp_shopify_validate_graphql_codeblocks` (validation)
  - **React Router 7**: `mcp_context7_get-library-docs` (library ID: `/remix-run/react-router`)
  - **UI Validation**: `mcp_Chrome_DevTools_*` for console errors, performance profiling
- **CLI Tools**: `shopify app dev` for local dev server (requires shopify.app.toml), `gh` for GitHub ops
- No secrets in code
- All features behind feature flags
- WCAG 2.1 AA compliant

## Definition of Done

- [ ] All tests passing (unit + integration + E2E = 100%)
- [ ] Build passing (<10s total)
- [ ] Global /health route responding
- [ ] All 8 dashboard tiles loading <3s
- [ ] Approvals drawer fully functional with HITL
- [ ] Feature flags controlling all external calls
- [ ] Accessibility: 0 critical violations
- [ ] Evidence: PR ready with all checks green

## Production Molecules (Priority Order)

### ENG-001: Create Global Health Route (15 min)

**File**: app/routes/health.ts
**Code**:

```typescript
import type { Route } from "./+types/health";

export async function loader({ request }: Route.LoaderArgs) {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    build: process.env.BUILD_ID || "local",
  };
}
```

**Test**: `curl http://localhost:3000/health` returns 200
**Evidence**: File created, test passing
**Note**: React Router 7 loaders auto-serialize JSON (no `json()` wrapper needed)

### ENG-002: Fix Integration Test Mocks - Social API (20 min)

**File**: tests/integration/social.api.spec.ts or app/routes/api/social.post.ts
**Issue**: Missing `authenticate` export breaking 4 tests
**Fix**: Add export or update mock
**Test**: `npm run test:unit` shows 230/230 passing
**Evidence**: Test output, commit SHA

### ENG-003: Approvals Drawer - Complete Implementation (45 min)

**File**: app/components/approvals/ApprovalsDrawer.tsx
**MCP**: Use `mcp_shopify_introspect_graphql_schema` for Polaris Admin components
**Requirements**:

- Keyboard: Tab, Shift+Tab, Escape to close
- Focus trap when open
- ARIA labels from Designer microcopy (docs/design/approvals_microcopy.md)
- Evidence section with data/queries display
- Grading section with 1-5 scales
- Approve/Reject buttons with loading states
  **Test**: `npm run test:unit -- ApprovalsDraw`, keyboard nav manual test
  **Evidence**: Component file, test passing, screenshot

### ENG-004: Dashboard Tiles - Wire Real Data (90 min)

**Pattern**: React Router 7 loaders (server-side)
**Files**: app/routes/api._.ts (API routes with loaders) + app/components/dashboard/_.tsx
**MCP**:

- `mcp_shopify_introspect_graphql_schema` for Shopify Admin API queries
- `mcp_context7_get-library-docs` for React Router 7 loader patterns (library: `/remix-run/react-router`, topic: "loaders data loading")

**Example Pattern**:

```typescript
// app/routes/api.analytics.revenue.ts
import type { Route } from "./+types/api.analytics.revenue";
import { createClient } from "@supabase/supabase-js";

export async function loader({ request }: Route.LoaderArgs) {
  // Server-side DB access with SERVICE KEY (correct)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!, // ✅ Server-side
  );

  const { data } = await supabase.from("revenue_metrics").select();
  return { revenue: data }; // Auto-serialized
}
```

**Tiles to wire**:

1. Revenue: Shopify orders sum
2. AOV: Revenue / order count
3. Conversion: GA4 API (coordinate with Analytics agent)
4. Inventory: ROP status from calculations
5. CX Queue: Chatwoot pending count
6. SEO: Anomalies list
7. Approvals: Pending count
8. Idea Pool: 5 suggestions (1 wildcard)

**Component Pattern**:

```typescript
// Component fetches from API route (React Router handles caching)
const { data } = useFetcher();
```

**Test**: Each tile <3s load, error states, loading states
**Evidence**: All tiles working, performance log

### ENG-005: Idea Pool Drawer Implementation (40 min)

**File**: app/components/IdeaPoolDrawer.tsx
**MCP**: Query idea_pool table via API route
**Requirements**:

- Opens on idea click from dashboard tile
- Shows 5 ideas with wildcard highlighted
- Approve/Reject actions
- Evidence display section
- Escape/backdrop close
  **Test**: User flow E2E test
  **Evidence**: Component, test, demo video

### ENG-006: Loading States - All Components (25 min)

**Files**: All tiles + drawers
**Requirements**:

- Skeleton loaders during fetch
- Error state with retry button
- Empty state with helpful CTA
  **Test**: Simulate slow network, error responses
  **Evidence**: States implemented, tests passing

### ENG-007: Error Handling - Global Boundary (25 min)

**Files**: app/root.tsx (error boundary), app/components/Toast.tsx
**Requirements**:

- Catch network errors
- Catch API errors
- Catch validation errors
- Toast notifications for user
  **Test**: Trigger errors, verify user sees friendly message
  **Evidence**: Error boundary working, tests

### ENG-008: Responsive Grid - Dashboard (30 min)

**File**: app/components/dashboard/DashboardGrid.tsx
**Requirements**:

- Desktop ≥1280px: 3-column grid
- Tablet 768-1279px: 2-column grid
- Mobile <768px: 1-column stack
  **Test**: Resize browser, verify layout shifts
  **Evidence**: CSS, responsive test

### ENG-009: Feature Flags Integration (20 min)

**Files**: All API-calling components
**Flags**: ANALYTICS_REAL_DATA, IDEA_POOL_LIVE, SHOPIFY_REAL_DATA
**UI**: Show toggle in dev mode (env.DEV)
**Test**: Toggle flags, verify mock vs real data
**Evidence**: Flags working, no production data in dev

### ENG-010: Production Build Optimization (25 min)

**Verification**:

- Bundle size <500kb gzipped
- No dev dependencies in production bundle
- Code splitting working (check build output)
- Tree shaking removing unused code
  **Test**: `npm run build`, analyze output
  **Evidence**: Build report, bundle analysis

### ENG-011: All Tests Green - CI Pass (30 min)

**Commands**:

```bash
npm run fmt
npm run lint -- --max-warnings 0
npm run test:ci
npm run scan
```

**Fix**: Any failures
**Evidence**: All passing, CI green screenshot

### ENG-012: Accessibility Audit - WCAG AA (20 min)

**Tool**: Axe DevTools or Pa11y
**Targets**: All routes, drawers, tiles
**Requirement**: 0 critical, <5 moderate violations
**Fix**: Any criticals immediately
**Evidence**: Audit report, fixes committed

### ENG-013: Documentation Updates (20 min)

**Files**:

- docs/specs/dashboard_queries.md (update with real implementations)
- docs/specs/rollback_procedures.md (add component rollback)
  **Evidence**: Docs updated, accurate

### ENG-014: PR Preparation (15 min)

**Actions**:

- Create PR: `gh pr create --title "feat: Complete Shopify Admin app" --body "Closes #109"`
- Link evidence: Tests, build, accessibility
- Request review
  **Evidence**: PR URL

### ENG-015: WORK COMPLETE Block (10 min)

**Update**: feedback/engineer/2025-10-19.md
**Include**:

- All 15 molecules complete
- All tests passing
- Build green
- PR ready
- Next: Awaiting review

## Foreground Proof (Required Evidence)

1. health.ts file created
2. Test output: 230/230 unit tests passing
3. ApprovalsDrawer.tsx with full HITL flow
4. All 8 tiles loading <3s (performance log)
5. IdeaPoolDrawer.tsx component
6. Error boundary catching errors (test)
7. Responsive CSS working (screenshots)
8. Feature flags toggling data sources
9. Build output <500kb gzipped
10. CI passing (screenshot)
11. Accessibility audit: 0 critical
12. PR created with #109 link
13. WORK COMPLETE block in feedback

## React Router 7 Loader Pattern (CRITICAL)

**IMPORTANT**: We use **React Router 7** (NOT Remix). All data loading uses React Router loaders.

**Server-Side Loader Pattern** (for API routes):

```typescript
// app/routes/api.analytics.revenue.ts
import type { Route } from "./+types/api.analytics.revenue";

export async function loader({ request }: Route.LoaderArgs) {
  // This runs SERVER-SIDE
  // Use SERVICE KEY for Supabase (correct for server)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!, // ✅ Server-side only
  );

  const { data } = await supabase.from("table").select();
  return { result: data }; // Auto-serialized to client
}
```

**Component Pattern** (fetches from loader):

```typescript
import { useFetcher } from "react-router";

function RevenueTable() {
  const fetcher = useFetcher<typeof loader>();

  useEffect(() => {
    fetcher.load('/api/analytics/revenue');
  }, []);

  return <div>{fetcher.data?.result}</div>;
}
```

**Refactoring Task**: Move standalone functions like `getIdeaPoolAnalytics()` INTO loaders

**MCP Tool Usage**:

- **React Router 7**: `mcp_context7_get-library-docs` with library ID `/remix-run/react-router`
  - Topics: "loaders", "data loading", "server-side", "useFetcher"
  - Use for: Correct loader syntax, type imports, best practices
- **Shopify**: `mcp_shopify_introspect_graphql_schema` for API structure
- **Validation**: `mcp_shopify_validate_graphql_codeblocks` before committing
- **GraphQL Example**:

```graphql
query GetOrders($first: Int!) {
  orders(first: $first, sortKey: CREATED_AT) {
    edges {
      node {
        id
        totalPriceSet {
          shopMoney {
            amount
          }
        }
      }
    }
  }
}
```

## Rollback

If any module breaks:

1. Feature flag to false
2. Revert component commit
3. Restore from git: `git revert <sha>`
4. Redeploy

**TOTAL ESTIMATE**: ~7 hours
**SUCCESS**: Production-ready Shopify Admin app, all tests green, PR approved
