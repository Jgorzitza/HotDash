# SEO - Web Vitals + Anomaly Triage

> Monitor Search Console. Detect anomalies. Triage <48h. Fix criticals.

**Issue**: #107 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/lib/seo/**, app/routes/api.seo.**, tests/unit/seo/\*\*

## Constraints

- MCP Tools: MANDATORY for all discovery
  - `mcp_google-analytics_*` for Search Console data
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
- Framework: React Router 7 (NOT Remix) - use loaders for server-side data
- CLI Tools: Google Search Console API (service account)
- Anomaly SLA: 100% agent-flagged criticals triaged <48h
- All SEO changes require approval
- Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

## Definition of Done

- [ ] Anomaly detection running on Search Console data
- [ ] Web vitals monitoring active
- [ ] SEO dashboard tile showing top issues
- [ ] Triage workflow documented
- [ ] Tests passing for anomaly detector
- [ ] Evidence: Anomalies detected + triaged

## Production Molecules

### SEO-001: Search Console Data Integration (40 min)

**File**: app/lib/seo/search-console.ts
**Data**: Queries, impressions, clicks, CTR, position
**Auth**: Service account from vault
**Evidence**: Data flowing from Search Console

### SEO-002: Anomaly Detection Algorithm (35 min)

**File**: app/lib/seo/anomalies-detector.ts
**Detect**: Click drop >20%, impression crash, position drop >10
**Algorithm**: 7-day rolling average comparison
**Evidence**: Anomalies flagged correctly

### SEO-003: Web Vitals Monitoring (30 min)

**File**: app/lib/seo/vitals.ts
**Metrics**: LCP, FID, CLS from real user monitoring
**Source**: GA4 or web-vitals library
**Evidence**: Vitals tracked

### SEO-004: SEO Dashboard Tile (30 min)

**File**: app/components/dashboard/SEOTile.tsx
**Display**: Top 3 anomalies, web vitals status, trends
**States**: Loading, error, data
**Evidence**: Tile rendering

### SEO-005: Anomaly Triage Workflow (35 min)

**File**: app/lib/seo/triage.ts
**Classify**: P0 (critical), P1 (high), P2 (medium), P3 (low)
**Assign**: Auto-assign to SEO lane
**SLA**: P0 <48h triage
**Evidence**: Workflow documented

### SEO-006: Keyword Ranking Tracker (30 min)

**File**: app/lib/seo/rankings.ts
**Track**: Top 20 keywords, position changes
**Alert**: If any drop >5 positions
**Evidence**: Rankings tracked

### SEO-007: Content Cannibalization Detector (25 min)

**File**: app/lib/seo/cannibalization.ts
**Detect**: Multiple pages ranking for same keyword
**Report**: Suggest consolidation
**Evidence**: Cannibalization detected

### SEO-008: SEO Recommendations Engine (30 min)

**File**: app/lib/seo/recommendations.ts
**Suggest**: Fix low CTR, improve position, boost impressions
**Prioritize**: By potential impact
**Evidence**: Recommendations generated

### SEO-009: Approvals Integration - SEO Changes (25 min)

**File**: app/lib/seo/approvals.ts
**Require**: Approval for title changes, meta updates, content edits
**HITL**: Human reviews before applying
**Evidence**: Approval flow tested

### SEO-010: Historical Trend Analysis (30 min)

**File**: app/lib/seo/trends.ts
**Analyze**: Click trends, impression trends, position trends
**Period**: Last 90 days
**Evidence**: Trends visualized

### SEO-011: Competitor Position Tracking (25 min)

**File**: app/lib/seo/competitors.ts
**Track**: Top 3 competitors for main keywords
**Alert**: If competitor gains positions
**Evidence**: Competitor data tracked

### SEO-012: Contract Tests - Search Console (20 min)

**File**: tests/unit/seo/search-console.spec.ts
**Verify**: API response shapes
**Evidence**: Contracts passing

### SEO-013: Documentation (20 min)

**File**: docs/specs/seo_pipeline.md
**Update**: Anomaly detection, triage SLA, web vitals
**Evidence**: Docs complete

### SEO-014: Performance Monitoring (20 min)

**Monitor**: Anomaly detection runtime, API latency
**Alert**: If tile load >3s
**Evidence**: Monitoring active

### SEO-015: WORK COMPLETE Block (10 min)

**Update**: feedback/seo/2025-10-19.md
**Include**: Anomalies detected, vitals monitored, <48h SLA ready
**Evidence**: Feedback entry

## Foreground Proof

1. search-console.ts integration
2. anomalies-detector.ts algorithm
3. vitals.ts monitoring
4. SEOTile.tsx component
5. triage.ts workflow
6. rankings.ts tracker
7. cannibalization.ts detector
8. recommendations.ts engine
9. approvals.ts integration
10. trends.ts analysis
11. competitors.ts tracking
12. Contract tests passing
13. seo_pipeline.md docs
14. Performance monitoring
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~6 hours
**SUCCESS**: SEO anomalies detected, triaged <48h, web vitals monitored
