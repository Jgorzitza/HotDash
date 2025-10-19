# SEO Agent Feedback - 2025-10-15

## Startup Checklist

- [x] Read direction file: `docs/directions/seo.md` - Status ACTIVE
- [x] Created feedback file
- [ ] Review NORTH_STAR, OPERATING_MODEL, RULES alignment
- [ ] Create branch `agent/seo/anomalies-detection`
- [ ] Verify MCP tools (Google Analytics, Search Console)
- [ ] Build anomaly detection logic
- [ ] Create API route
- [ ] Write spec document
- [ ] Create PR

## Today's Objective

Build SEO Anomalies Detection for dashboard tile

**Allowed paths:** `app/lib/seo/*, app/routes/api/seo.*, docs/specs/seo_anomalies_detection.md, feedback/seo/*`

## Plan

1. Align with governance docs (NORTH_STAR, OPERATING_MODEL, RULES)
2. Create working branch
3. Research existing codebase structure for similar tiles
4. Build anomaly detection logic in `app/lib/seo/anomalies.ts`
5. Create API route `app/routes/api/seo.anomalies.ts`
6. Define severity levels (critical, warning, info)
7. Test with GA4 and Search Console data
8. Document in spec file
9. Create PR with evidence

## Progress Log

### 10:00 - Starting up

- Created feedback file
- Reviewed NORTH_STAR.md - Aligned with vision and principles
- Reviewed existing codebase patterns

### 10:15 - Codebase Analysis Complete

**Existing SEO Infrastructure Found:**

- ✅ `app/services/ga/ingest.ts` - getLandingPageAnomalies() already exists
- ✅ `app/components/tiles/SEOContentTile.tsx` - Tile component exists
- ✅ `app/services/anomalies.server.ts` - Generic anomaly detection utilities
- ✅ GA4 clients: direct, MCP, and mock implementations
- ✅ Supabase function: `get_seo_anomalies_tile()` in migrations

**Current Implementation:**

- Traffic anomaly detection: WoW delta <= -20% (hardcoded in ingest.ts line 58)
- Only handles GA sessions data
- Missing: Keyword rankings, Core Web Vitals, Search Console crawl errors
- Missing: Severity levels (critical/warning/info)
- Missing: Dedicated SEO library structure

**Task Clarification Needed:**
The direction asks me to build `app/lib/seo/anomalies.ts` but much of this already exists in `app/services/ga/ingest.ts`.

**Options:**

1. Enhance existing `app/services/ga/ingest.ts` with severity levels and additional metrics
2. Create new `app/lib/seo/` structure and refactor existing code
3. Build complementary SEO detection alongside existing GA anomalies

**Recommendation:** Option 3 - Build comprehensive SEO anomaly detection in `app/lib/seo/` that:

- Extends existing GA traffic anomalies
- Adds Search Console integration (rankings, crawl errors, Core Web Vitals)
- Implements severity classification
- Provides unified API route for dashboard

Next: Create branch and start implementation

### 10:30 - Implementation Complete

**Created Files:**

1. ✅ `app/lib/seo/anomalies.ts` (270 lines)
   - Traffic anomaly detection with -20%/-40% thresholds
   - Ranking anomaly detection (5/10 position drops)
   - Core Web Vitals detection (LCP/FID/CLS)
   - Crawl error detection (3/10 error thresholds)
   - Severity classification (critical/warning/info)
   - Aggregation utilities

2. ✅ `app/routes/api.seo.anomalies.ts` (120 lines)
   - GET /api/seo/anomalies endpoint
   - Integrates with existing getLandingPageAnomalies()
   - Mock placeholders for Search Console/Vitals
   - Comprehensive response format with metadata

3. ✅ `docs/specs/seo_anomalies_detection.md` (full spec)
   - All 4 anomaly types documented
   - Thresholds and severity levels
   - API specification with examples
   - Implementation status and future work
   - Testing strategy and rollback plan

**Design Decisions:**

- Extended existing GA traffic detection (not replaced)
- Used TypeScript interfaces for type safety
- Mock functions for Search Console/Vitals (clearly marked TODO)
- Severity-based sorting for dashboard prioritization
- Metadata includes source tracking (fresh/cache/mock)

Next: Test the implementation
