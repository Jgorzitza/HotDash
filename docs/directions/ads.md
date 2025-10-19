# Ads - Campaign Metrics + Publer Integration

> ROAS/CPC live. Publer posts. Campaign intelligence. Approvals HITL.

**Issue**: #105 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/lib/ads/**, app/routes/api.ads.**, tests/unit/ads/\*\*

## Constraints

- MCP Tools: MANDATORY for all discovery
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
  - Context7 for Publer API docs (if available)
- Framework: React Router 7 (NOT Remix) - use loaders for server-side data
- CLI Tools: Publer API via direct HTTP (token in vault)
- Feature flag: PUBLER_LIVE controls mock vs real posting
- All posts require HITL approval
- ROAS calculations must handle zero-division

## Definition of Done

- [ ] ROAS/CPC/CPA calculations working (tests passing)
- [ ] Publer API integrated (read-only initially)
- [ ] Campaign metrics tile loading data
- [ ] Approvals integration for social posts
- [ ] Tests: 100% coverage on calculations
- [ ] Evidence: Ads tile + approval flow working

## Production Molecules

### ADS-001: ROAS/CPC/CPA Calculations - Verify (20 min)

**Files**: app/lib/ads/index.ts, tests/unit/ads/metrics.spec.ts
**Formulas**:

- ROAS = revenue / spend
- CPC = spend / clicks
- CPA = spend / conversions
  **Test**: Zero-guards, edge cases
  **Evidence**: 9/9 tests passing (Manager confirmed already done)

### ADS-002: Publer API Client (40 min)

**File**: app/adapters/publer/client.real.ts
**MCP**: Use Context7 to get Publer API docs
**Endpoints**: /account_info, /social_accounts, /post_status
**Auth**: Bearer token from vault
**Evidence**: Client connecting, account info retrieved

### ADS-003: Campaign Metrics Data Source (35 min)

**File**: app/lib/ads/metrics.ts
**Sources**: Google Ads (stub for now), Meta Ads (stub)
**Aggregate**: ROAS, CPC, impressions, clicks
**Test**: Mock data flows through correctly
**Evidence**: Metrics calculated

### ADS-004: Ads Dashboard Tile (30 min)

**File**: app/components/dashboard/CampaignMetricsTile.tsx
**Display**: Top 3 campaigns, ROAS, CPC, trend indicators
**State**: Loading, error, data
**Evidence**: Tile rendering with mock data

### ADS-005: Publer Post Drafter (40 min)

**File**: app/lib/ads/post-drafter.ts
**Input**: Campaign data, target platform
**Output**: Platform-optimized post content
**Coordinate**: Content agent's tone validator
**Evidence**: Posts generated, tone validated

### ADS-006: Approvals Integration - Social Posts (35 min)

**File**: app/lib/ads/approvals.ts
**Flow**: Draft → Approval record → HITL review → Grade → Post
**Validation**: No posting without approval
**Evidence**: Approval flow tested

### ADS-007: Publer Health Check (25 min)

**File**: app/routes/api.ads.health.ts
**Check**: Publer API accessible, account valid, rate limits OK
**Cache**: Health status (5 min TTL)
**Evidence**: Health endpoint returning status

### ADS-008: Attribution Tracking (30 min)

**File**: app/lib/ads/attribution.ts
**Track**: UTM parameters, campaign source, conversion attribution
**Store**: In analytics_metrics_daily
**Evidence**: Attribution data captured

### ADS-009: Budget Optimizer Logic (35 min)

**File**: app/lib/ads/budget-optimizer.ts
**Algorithm**: Allocate budget to highest ROAS campaigns
**Constraints**: Min/max per campaign
**Output**: Suggested budget adjustments
**Evidence**: Optimizer suggestions reasonable

### ADS-010: Anomaly Detection - Ad Performance (30 min)

**File**: app/lib/ads/anomaly-detection.ts
**Detect**: CPC spike, ROAS drop, impression crash
**Alert**: Flag for human review
**Evidence**: Anomalies detected in test data

### ADS-011: Contract Tests - Publer API (25 min)

**File**: tests/unit/ads/publer-adapter.spec.ts
**Verify**: API response shapes match expectations
**Mock**: Use known good responses
**Evidence**: Contracts passing

### ADS-012: Feature Flag Enforcement (20 min)

**Check**: PUBLER_LIVE flag in all posting code
**Test**: Flag=false → No external calls
**Evidence**: Flag respected, no leaks

### ADS-013: Documentation (20 min)

**Files**: docs/specs/ads_pipeline.md, docs/integrations/publer-oauth-setup.md
**Update**: Current state, real Publer integration notes
**Evidence**: Docs accurate

### ADS-014: Performance Monitoring (25 min)

**Setup**: Log ROAS calculation time, API latency
**Alert**: If tile load >3s
**Evidence**: Monitoring active

### ADS-015: WORK COMPLETE Block (10 min)

**Update**: feedback/ads/2025-10-19.md
**Include**: Calculations verified, Publer integrated, approvals wired
**Evidence**: Feedback entry

## Foreground Proof

1. metrics.spec.ts 9/9 passing
2. publer/client.real.ts implementation
3. Campaign metrics aggregation
4. CampaignMetricsTile.tsx component
5. post-drafter.ts logic
6. Approvals integration tested
7. api.ads.health.ts endpoint
8. attribution.ts tracking
9. budget-optimizer.ts algorithm
10. anomaly-detection.ts logic
11. Publer contract tests
12. Feature flag checks
13. Documentation updated
14. Performance monitoring
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~6 hours
**SUCCESS**: Live ad metrics, Publer ready, HITL approvals, <3s tile load
