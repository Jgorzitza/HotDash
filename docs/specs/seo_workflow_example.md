# SEO Workflow Example

**Version:** 1.0  
**Date:** 2025-10-19

## Complete SEO Recommendation Workflow

This example demonstrates the end-to-end SEO workflow from data collection to HITL approval.

### Step 1: Collect Core Web Vitals Data

```typescript
import { normalizeVitals } from "~/lib/seo/vitals";

// From GA4 or RUM data
const rawVitals = {
  LCP: 4500, // Largest Contentful Paint (ms)
  FID: 150, // First Input Delay (ms)
  CLS: 0.05, // Cumulative Layout Shift
};

const vitals = normalizeVitals(rawVitals, "mobile");
// Returns: [
//   { metric: "LCP", value: 4500, passes: false, severity: "critical" },
//   { metric: "FID", value: 150, passes: false, severity: "warning" },
//   { metric: "CLS", value: 0.05, passes: true, severity: "good" }
// ]
```

### Step 2: Generate Recommendations

```typescript
import { generatePerformanceRecommendations } from "~/lib/seo/recommendations";

const recommendations = generatePerformanceRecommendations(
  vitals,
  "/products/hot-rods",
);

// Returns recommendations for LCP and FID with:
// - Proposed actions (optimize assets, lazy-load)
// - Impact estimates (-30% improvement)
// - Rollback plans
// - Required approvers (engineer, product)
```

### Step 3: Create Approval Payload

```typescript
import { createSEOApprovalPayload } from "~/lib/seo/approvals";

const payload = createSEOApprovalPayload(
  recommendations[0], // First recommendation
  vitals, // Include vitals as evidence
);

// Payload includes:
// - Evidence: SEO Agent analysis + Core Web Vitals data
// - Proposed changes: Specific actions with type
// - Projected impact: Metric + confidence + timeframe
// - Rollback: Steps + monitoring window (48h)
// - Approvers: engineer, product
```

### Step 4: Route to Approvals Drawer

```typescript
// In UI component (e.g., SEOTile.tsx)
import { formatForApprovalsDrawer } from "~/lib/seo/approvals";

const drawerData = formatForApprovalsDrawer(payload);

// Renders Polaris approval drawer with:
// - Header: Title + priority badge (critical/warning/info)
// - Evidence section: All data sources with artifacts
// - Proposed changes: Action list
// - Impact projection: Before/after metrics
// - Risk & rollback: Mitigation steps
// - Approve/Reject actions
```

### Step 5: Post-Approval Monitoring

After approval and execution:

1. **24h Check**: Run Supabase snapshot, record delta
2. **48h Check**: Verify GA4 sessions recovery
3. **Rollback Triggers**:
   - Sessions drop ≥10%
   - Average position drops ≥3 ranks
   - Approval grade < 4

## Keyword Cannibalization Detection Example

```typescript
import { fetchSearchConsoleQueries } from "~/lib/seo/search-console";
import { detectOrganicVsOrganicConflicts } from "~/lib/seo/cannibalization";

// Fetch Search Console data
const queries = await fetchSearchConsoleQueries(
  { siteUrl: "https://hotrodan.com", accessToken: process.env.GSC_TOKEN },
  "2025-10-01",
  "2025-10-19",
);

// Detect conflicts
const issues = detectOrganicVsOrganicConflicts(queries);

// Returns issues where 2+ pages compete for same keyword:
// [
//   {
//     keyword: "hot rods",
//     type: "organic-vs-organic",
//     severity: "warning",
//     affectedPages: ["/products/hot-rods", "/collections/hot-rods"],
//     recommendation: "2 pages compete for 'hot rods'. Consolidate or differentiate."
//   }
// ]
```

## API Integration Example

```typescript
// Dashboard tile fetching SEO monitoring data
const response = await fetch("/api/seo/monitoring?shop=hotrodan.myshopify.com");
const data = await response.json();

if (data.success) {
  console.log("Anomalies:", data.data.anomalyCount);
  console.log("Critical:", data.data.criticalCount);
  console.log("Vitals:", data.data.vitals);
  // { LCP: { value: 2300, passes: true }, ... }
}
```

## Testing Example

```typescript
// Integration test
import { normalizeVitals } from "~/lib/seo/vitals";
import { generatePerformanceRecommendations } from "~/lib/seo/recommendations";
import { createSEOApprovalPayload } from "~/lib/seo/approvals";

// Full workflow test
const vitals = normalizeVitals({ LCP: 4500, FID: 150, CLS: 0.05 }, "mobile");
const recommendations = generatePerformanceRecommendations(vitals, "/test");
const payload = createSEOApprovalPayload(recommendations[0], vitals);

expect(payload.kind).toBe("seo.recommendation");
expect(payload.evidence.length).toBeGreaterThan(0);
expect(payload.rollback.monitoringWindow).toBe("48 hours");
```

## References

- Core modules: `app/lib/seo/`
- API routes: `app/routes/api.seo.*.ts`
- Tests: `tests/unit/seo.*.spec.ts`, `tests/integration/seo.*.spec.ts`
- Triage runbook: `docs/specs/seo_anomaly_triage.md`
