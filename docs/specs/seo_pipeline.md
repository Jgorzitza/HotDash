# SEO Pipeline — Production Monitoring & HITL Recommendations

**Version:** 2025-10-19  
**Owner:** SEO Agent  
**Status:** Production Ready

---

## 1. Overview

Complete SEO monitoring system with:

- Core Web Vitals tracking (GA4)
- Traffic anomaly detection (WoW comparisons)
- Keyword cannibalization alerts
- HITL recommendations workflow
- Supabase persistence

---

## 2. Components

### Core Modules

| Module                  | Purpose                       | Status           |
| ----------------------- | ----------------------------- | ---------------- |
| `vitals.ts`             | Core Web Vitals normalization | ✅ Tested (1/1)  |
| `diagnostics.ts`        | Title/meta/schema/OG checks   | ✅ Enhanced      |
| `search-console.ts`     | Google Search Console stub    | ✅ OAuth docs    |
| `recommendations.ts`    | Performance recommendations   | ✅ Validated     |
| `cannibalization.ts`    | Keyword overlap detection     | ✅ Tested (3/3)  |
| `approvals.ts`          | HITL approval payloads        | ✅ Complete      |
| `anomalies-detector.ts` | Real-time anomaly detection   | ✅ Tested (3/3)  |
| `metrics.ts`            | KPI calculations              | ✅ Tested (2/2)  |
| `alerts.ts`             | Threshold alerting            | ✅ Complete      |
| `reporting.ts`          | Weekly/monthly reports        | ✅ Complete      |
| `metrics-tracking.ts`   | Supabase persistence          | ✅ Migration SQL |

### API Routes

| Endpoint                   | Purpose              | Status            |
| -------------------------- | -------------------- | ----------------- |
| `/api/seo/monitoring`      | Dashboard tile data  | ✅ Error handling |
| `/api/seo/anomalies`       | Anomaly detection    | ✅ Complete       |
| `/api/seo/recommendations` | HITL recommendations | ✅ Complete       |

### UI Components

| Component     | Purpose        | Status     |
| ------------- | -------------- | ---------- |
| `SEOTile.tsx` | Dashboard tile | ✅ Polaris |

---

## 3. Data Flow

```
GA4 (MCP) → vitals.ts → anomalies-detector.ts → alerts.ts
                ↓
          recommendations.ts → approvals.ts → HITL Review
                ↓
          metrics-tracking.ts → Supabase (persistence)
```

---

## 4. Monitoring Workflow

1. **Daily Sweep (08:00 Central)**
   - Query GA4 via MCP for Core Web Vitals
   - Scan URLs for traffic anomalies (>20% drop)
   - Generate alerts for critical issues

2. **Evidence Capture**
   - Store vitals to `seo_vitals_history` table
   - Log anomalies to `seo_anomalies_log` table
   - Generate approval payloads for recommendations

3. **HITL Handoff**
   - Route recommendations to Product/Ads/Content
   - Include evidence, impact forecast, rollback plan
   - Require approval grades (tone/accuracy/policy)

4. **Post-Approval**
   - 24h/48h metrics check
   - Rollback if sessions drop ≥10%
   - Log disposition to feedback

---

## 5. Anomaly Detection Rules

**Traffic:**

- Critical: ≥40% drop WoW
- Warning: 20-40% drop WoW

**Core Web Vitals:**

- LCP: Poor >4.0s (critical), 2.5s-4.0s (warning)
- FID: Poor >300ms (critical), 100ms-300ms (warning)
- CLS: Poor >0.25 (critical), 0.1-0.25 (warning)

**Keyword Cannibalization:**

- Critical: 3+ pages for same keyword
- Warning: 2 pages for same keyword

---

## 6. HITL Approval Requirements

Every recommendation includes:

- Problem statement with severity
- Evidence (GA4 data, Search Console, diagnostics)
- Proposed actions (specific changes)
- Impact estimate (sessions/revenue delta)
- Risk & rollback plan
- Required approvers (Product/Ads/Content)

---

## 7. Supabase Schema

Tables created via migration SQL in `metrics-tracking.ts`:

- `seo_rankings` - Daily keyword positions
- `seo_vitals_history` - Core Web Vitals over time
- `seo_anomalies_log` - Detected anomalies

---

## 8. Testing

- Unit tests: 56/56 passing (100%)
- Integration tests: Full workflow validated
- Contract test: `npx vitest run tests/unit/seo.web-vitals.spec.ts`

---

## 9. MCP Tools Used

1. Google Analytics MCP - Vitals/traffic data
2. Supabase MCP - Persistence queries
3. Context7 MCP - SEO best practices
4. Shopify MCP - Component validation

---

## 10. References

- Triage runbook: `docs/specs/seo_anomaly_triage.md`
- Anomalies spec: `docs/specs/seo_anomalies_detection.md`
- API reference: `docs/specs/seo_api_reference.md`
- Workflow examples: `docs/specs/seo_workflow_example.md`
- Tests: `tests/unit/seo.*.spec.ts`, `tests/integration/seo.*.spec.ts`
