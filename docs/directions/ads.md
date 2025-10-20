# Ads Direction

- **Owner:** Ads Agent
- **Effective:** 2025-10-19
- **Version:** 5.0

## Objective

Current Issue: #101

Build production-ready ads intelligence system with campaign metrics, ROAS/CPC/CPA tracking, HITL approvals for campaign changes, and Publer integration for social ads.

## Tasks (20 Molecules - Production Ads System)

### Phase 1: Foundation & Schema (4 molecules)

1. **ADS-001: Ads Domain Audit** (20 min)
   - Search codebase for existing ads infrastructure
   - Commands: `find app -name "*ads*" -o -name "*campaign*"`
   - Document what exists vs what's needed
   - Evidence: Ads infrastructure inventory report

2. **ADS-002: Ads Metrics Schema** (40 min)
   - Create Supabase migration for `ads_campaigns` and `ads_daily_metrics`
   - Tables: campaign_id, platform (meta/google/organic), spend, impressions, clicks, conversions
   - Use Supabase CLI: `supabase migration new ads_tracking`
   - Evidence: Migration file created

3. **ADS-003: Shopify Orders GraphQL** (45 min)
   - Use shopify-dev-mcp to validate orders query for attribution
   - Query: orders with UTM parameters for ad attribution
   - Conversation ID from learn_shopify_api
   - Evidence: GraphQL query validated with MCP

4. **ADS-004: Meta/Google API Stubs** (35 min)
   - Create feature-flagged stubs: `app/services/ads/meta-stub.ts`, `google-stub.ts`
   - Feature flag: `ADS_REAL_DATA` (default: false)
   - Mock: Realistic campaign data (CTR 2-5%, ROAS 2-4x)
   - Evidence: Stub files created, feature flag documented

### Phase 2: Core Metrics (5 molecules)

5. **ADS-005: ROAS/CPC/CPA Calculations** (40 min)
   - Create `app/lib/ads/metrics.ts`
   - Functions: `calculateROAS`, `calculateCPC`, `calculateCPA` with zero-guards
   - Handle division by zero: return null or 0
   - Evidence: Functions created with JSDoc, zero-guards tested

6. **ADS-006: Campaign Metrics API Route** (40 min)
   - Create `app/routes/api.ads.campaigns.ts`
   - React Router 7 loader pattern (use context7 MCP for examples)
   - Return: campaigns with calculated metrics
   - Evidence: Route created, returns JSON

7. **ADS-007: Platform Breakdown** (35 min)
   - Create `app/lib/ads/platform-breakdown.ts`
   - Function: `getPlatformBreakdown(campaigns)` - group by platform
   - Handle empty arrays: return `[]`
   - Evidence: Function created with empty array guard

8. **ADS-008: Daily Aggregation** (40 min)
   - Create `app/lib/ads/daily-rollup.ts`
   - Aggregate campaign metrics by day
   - Store in `ads_daily_metrics` table
   - Evidence: Aggregation function, Supabase insert working

9. **ADS-009: Ads Dashboard Tile** (45 min)
   - Create `app/components/dashboard/AdsTile.tsx`
   - Polaris Card with key metrics (spend, ROAS, clicks, conversions)
   - Use React Router 7 loader to fetch data
   - Evidence: Tile component created, displays metrics

### Phase 3: HITL & Automation (5 molecules)

10. **ADS-010: Campaign Approval Drawer** (50 min)
    - Create `app/components/ads/CampaignApprovalDrawer.tsx`
    - HITL workflow: Draft → Review → Approve/Reject
    - Evidence: projected spend, target ROAS, risk assessment
    - Evidence: Drawer component with HITL workflow

11. **ADS-011: Publer Campaign Integration** (45 min)
    - Create `app/services/ads/publer-campaigns.ts`
    - Schedule social ads via Publer API
    - Feature flag: `PUBLER_LIVE` (default: false)
    - Evidence: Publer integration, mock mode working

12. **ADS-012: Budget Alerts** (35 min)
    - Create `app/lib/ads/budget-alerts.ts`
    - Alert when campaign spend exceeds threshold (>110% of budget)
    - Store alerts in Supabase
    - Evidence: Alert logic, threshold tests

13. **ADS-013: Performance Alerts** (35 min)
    - Create `app/lib/ads/performance-alerts.ts`
    - Alert when ROAS < 1.5x (unprofitable)
    - Recommend pause/optimize actions
    - Evidence: Performance monitoring, alert triggers

14. **ADS-014: UTM Tracking** (30 min)
    - Create `app/lib/ads/utm-parser.ts`
    - Parse UTM parameters from Shopify orders
    - Attribution: order → campaign → platform
    - Evidence: UTM parser, attribution logic

### Phase 4: Testing & Production (6 molecules)

15. **ADS-015: Contract Tests** (40 min)
    - Create `tests/contract/ads.metrics.contract.test.ts`
    - Test API response shapes (campaigns, metrics, platform breakdown)
    - Min 3 fixtures, exactly 1 wildcard
    - Evidence: Contract tests passing

16. **ADS-016: Unit Tests - Calculations** (45 min)
    - Create `tests/unit/ads/metrics.spec.ts`
    - Test ROAS/CPC/CPA calculations, zero-guards
    - Coverage: edge cases (zero spend, zero clicks, null values)
    - Evidence: Unit tests passing

17. **ADS-017: Integration Tests** (40 min)
    - Create `tests/integration/ads-workflow.spec.ts`
    - Test full campaign workflow: create → track → alert → approve
    - Evidence: Integration tests passing

18. **ADS-018: Feature Flags** (25 min)
    - Document feature flags: `ADS_REAL_DATA`, `PUBLER_LIVE`
    - Add to `docs/specs/feature_flags.md`
    - Evidence: Flags documented, toggle behavior verified

19. **ADS-019: Documentation** (30 min)
    - Create/update `docs/specs/ads_pipeline.md`
    - Include: architecture, metrics formulas, HITL workflow, Publer integration
    - Evidence: Complete ads pipeline documentation

20. **ADS-020: WORK COMPLETE** (15 min)
    - Final feedback entry with all evidence
    - Ready for Manager PR
    - Evidence: Complete feedback file

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `supabase`, `rg`, `jq`
- **MCP Tools (Mandatory):**
  - **shopify-dev-mcp**: Validate Shopify orders GraphQL for UTM attribution
  - **context7**: React Router 7 loader/action patterns
- **Allowed Paths:** `app/lib/ads/**`, `app/services/ads/**`, `app/routes/api.ads.*`, `app/components/dashboard/AdsTile.tsx`, `app/components/ads/**`, `tests/unit/ads/**`, `tests/contract/**`, `tests/integration/ads*`, `supabase/migrations/*ads*`, `docs/specs/ads_pipeline.md`, `feedback/ads/2025-10-19.md`
- **Budget:** ≤60 min per molecule (except ADS-010, ADS-016, ADS-017)

## Definition of Done

- [ ] All 20 molecules executed with evidence
- [ ] Ads metrics flowing to dashboard tile
- [ ] ROAS/CPC/CPA calculations accurate with zero-guards
- [ ] HITL approval workflow functional
- [ ] Publer integration ready (mock mode)
- [ ] Contract tests passing (≥3 fixtures, 1 wildcard)
- [ ] Unit tests passing (calculations, edge cases)
- [ ] Integration tests passing (full workflow)
- [ ] Documentation complete
- [ ] Feedback entry with all evidence

## Contract Test

- **Command:** `npx vitest run tests/contract/ads.metrics.contract.test.ts`
- **Expectations:** API shape validation, ≥3 fixtures, exactly 1 wildcard
- **Evidence:** Contract tests passing

## Risk & Rollback

- **Risk Level:** MEDIUM (incorrect metrics mislead decision-making)
- **Rollback Plan:** Feature flags disable new metrics, revert to previous version
- **Monitoring:** Ads tile load time, ROAS accuracy, budget alert triggers

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Feedback: `feedback/ads/2025-10-19.md`
- Production App: https://hotdash-staging.fly.dev

## Change Log

- 2025-10-19: Version 5.0 – Complete production rewrite with 20 molecules (was 6, below threshold)
- 2025-10-19: Version 4.0 – Paused (P0 test didn't exist)
- 2025-10-19: Version 3.0 – Incorrect P0 assignment
- 2025-10-17: Version 2.0 – Original production direction
