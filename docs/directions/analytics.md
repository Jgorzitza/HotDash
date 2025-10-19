# Analytics - Real GA4 + Shopify Metrics

> Wire real analytics. Dashboard tiles with live data. Cache strategy. Ship it.

**Issue**: #104 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/lib/analytics/**, app/routes/api.analytics.**, tests/unit/analytics/\*\*

## Constraints

- MCP Tools: MANDATORY for all discovery/grounding
  - `mcp_google-analytics_*` for GA4 operations
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
- CLI Tools: Direct GA4 Data API with service account from vault
- Framework: React Router 7 (NOT Remix) - use loaders for server-side data
- Feature flags: ANALYTICS_REAL_DATA controls mock vs real
- Cache: 5 min TTL for expensive queries
- No secrets in code

## Definition of Done

- [ ] GA4 Data API integrated with real property (339826228)
- [ ] Shopify revenue queries working
- [ ] All analytics tiles <3s load time
- [ ] Cache strategy implemented
- [ ] Tests passing with mock + real scenarios
- [ ] Evidence: Dashboard showing real data

## Production Molecules

### ANA-001: GA4 Real Data Integration (40 min)

**Pattern**: React Router 7 loader (server-side)
**File**: app/routes/api.analytics.traffic.ts (refactor to use loader)
**MCP**:

- `mcp_google-analytics_run_report` for GA4 data
- `mcp_context7_get-library-docs` (library: `/remix-run/react-router`, topic: "loaders server-side")
  **Property**: 339826228 (Hot Rod AN)
  **Metrics**: sessions, users, pageviews, conversions

**Loader Pattern**:

```typescript
import type { Route } from "./+types/api.analytics.traffic";

export async function loader({ request }: Route.LoaderArgs) {
  // Server-side GA4 call
  const data = await fetchGA4Metrics();
  return { metrics: data };
}
```

**Test**: Feature flag toggles mock/real
**Evidence**: Real data in dashboard tile

### ANA-002: Shopify Revenue Queries (35 min)

**File**: app/routes/api.analytics.revenue.ts (refactor to use loader)
**MCP**:

- `mcp_shopify_introspect_graphql_schema` + `mcp_shopify_validate_graphql_codeblocks`
- `mcp_context7_get-library-docs` (library: `/remix-run/react-router`, topic: "loaders")

**React Router 7 Loader Pattern**:

```typescript
import type { Route } from "./+types/api.analytics.revenue";

export async function loader({ request }: Route.LoaderArgs) {
  // Server-side Shopify query
  const revenue = await queryShopifyOrders();
  return { revenue }; // Auto-serialized
}
```

**GraphQL Query**: Orders with totalPriceSet, created_at filter
**Test**: Calculate revenue by period
**Evidence**: Revenue tile showing correct totals

### ANA-003: Conversion Rate Calculation (30 min)

**File**: app/lib/analytics/conversion.ts
**Formula**: (GA4 transactions / GA4 sessions) \* 100
**Handle**: Division by zero
**Test**: Unit test with various scenarios
**Evidence**: Conversion tile accurate

### ANA-004: Traffic Metrics Integration (30 min)

**File**: app/lib/analytics/traffic.ts
**GA4 Metrics**: sessions, users, pageviews, bounce rate, avg session duration
**Include**: Period comparison (this week vs last week)
**Evidence**: Traffic tile with trends

### ANA-005: Dashboard Tiles Wiring (45 min)

**Files**: app/components/dashboard/{Revenue,Conversion,Traffic}Tile.tsx
**Connect**: Real API routes with feature flags
**Loading states**: Skeleton during fetch
**Error handling**: Retry button on failure
**Evidence**: All tiles <3s, graceful errors

### ANA-006: Caching Strategy Implementation (35 min)

**File**: app/services/cache.server.ts
**TTL**: 5 minutes for GA4/Shopify queries
**Storage**: In-memory cache (simple Map)
**Invalidation**: Time-based
**Evidence**: Cache hits logged, performance improved

### ANA-007: Sampling Guard Proof (25 min)

**File**: app/lib/analytics/sampling-guard.ts
**Check**: GA4 response for (ga:)samplingLevel
**Alert**: If sampled data detected
**Log**: Warning to console
**Evidence**: Sampling detection working

### ANA-008: Analytics Tables Integration (30 min)

**Coordinate with Data agent**: analytics_metrics_daily table
**Query**: Historical metrics from Supabase
**Fallback**: If table empty, use real-time only
**Evidence**: Historical data displayed

### ANA-009: Nightly Rollup Script (40 min)

**File**: scripts/analytics/nightly-rollup.mjs
**Action**: Aggregate daily metrics from GA4 → Supabase
**Schedule**: Via cron or GitHub Actions
**Evidence**: Script created, test run successful

### ANA-010: Error Logging + Retry (25 min)

**File**: app/lib/analytics/error-logger.ts
**Handle**: GA4 timeouts, Shopify rate limits, network errors
**Retry**: Exponential backoff (3 attempts)
**Evidence**: Errors logged, retries working

### ANA-011: Performance Optimization (30 min)

**Actions**:

- Batch GA4 queries where possible
- Parallel Shopify + GA4 fetches
- Preload data on dashboard mount
  **Evidence**: Reduced total load time

### ANA-012: Contract Tests (25 min)

**Files**: tests/unit/contracts/ga.\*.contract.test.ts
**Verify**: GA4 response shape matches schemas
**MCP**: Use actual GA4 API in test mode
**Evidence**: Contracts passing

### ANA-013: Documentation (20 min)

**File**: docs/specs/analytics_pipeline.md
**Include**: Data sources, calculations, caching, feature flags
**Evidence**: Doc complete and accurate

### ANA-014: Feature Flag Testing (20 min)

**Scenarios**:

- ANALYTICS_REAL_DATA=false → Mocks only
- ANALYTICS_REAL_DATA=true → Real GA4/Shopify
  **Test**: Toggle, verify data source changes
  **Evidence**: Both modes working

### ANA-015: WORK COMPLETE Block (10 min)

**Update**: feedback/analytics/2025-10-19.md
**Include**: Real analytics live, all tiles working, tests passing
**Evidence**: Feedback entry

## Foreground Proof

1. ga4.ts with real API integration
2. shopify-revenue.ts with GraphQL
3. conversion.ts calculations
4. traffic.ts metrics
5. Dashboard tiles wired
6. cache.server.ts implementation
7. sampling-guard.ts detection
8. Supabase analytics table queries
9. nightly-rollup.mjs script
10. error-logger.ts with retry
11. Performance metrics
12. Contract tests passing
13. analytics_pipeline.md docs
14. Feature flag toggle demo
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~6 hours
**SUCCESS**: Real analytics in production, <3s load, cached, monitored
