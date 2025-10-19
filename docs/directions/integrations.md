# Integrations - API Contracts + Health Checks

> All integrations tested. Contracts verified. Health monitored. Graceful degradation.

**Issue**: #113 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/services/**, tests/integration/**, tests/contract/\*\*

## Constraints

- MCP Tools: MANDATORY for all API discovery
  - `mcp_shopify_validate_graphql_codeblocks` for contract validation
  - `mcp_google-analytics_run_report` for GA4 testing
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
- Framework: React Router 7 (NOT Remix) - all API routes use loaders
- All external APIs must have contract tests
- Feature flags control all external calls
- Graceful degradation: App works with mocks if API down
- Health checks: Every integration monitored
- Rate limiting: Respect all API limits

## Definition of Done

- [ ] All 6 integrations have contract tests
- [ ] Health checks for all integrations
- [ ] Feature flags enforced
- [ ] Graceful degradation tested
- [ ] Integration health tile working
- [ ] Evidence: All contracts passing

## Production Molecules

### INT-001: Integration Health Dashboard Tile (35 min)

**File**: app/components/dashboard/IntegrationsHealthTile.tsx
**Display**: All 6 integrations (Shopify, Supabase, GA4, Chatwoot, Publer, OpenAI)
**Status**: Green/yellow/red indicators
**Evidence**: Tile showing all statuses

### INT-002: Shopify Contract Tests (30 min)

**Files**: tests/contract/shopify.\*.contract.test.ts
**MCP**: `mcp_shopify_validate_graphql_codeblocks`
**Verify**: Orders, Products, Inventory API shapes
**Evidence**: All Shopify contracts passing

### INT-003: Supabase Contract Tests (30 min)

**Files**: tests/contract/supabase.\*.contract.test.ts
**Verify**: Table schemas, RPC function signatures, RLS behavior
**Evidence**: All Supabase contracts passing

### INT-004: GA4 Contract Tests (25 min)

**Files**: tests/contract/ga4.\*.contract.test.ts
**MCP**: `mcp_google-analytics_run_report` (test mode)
**Verify**: Metrics response shapes
**Evidence**: GA4 contracts passing

### INT-005: Chatwoot Contract Tests (25 min)

**Files**: tests/contract/chatwoot.\*.contract.test.ts
**Verify**: Conversations, messages, webhook payloads
**Evidence**: Chatwoot contracts passing

### INT-006: Publer Contract Tests (25 min)

**Files**: tests/contract/publer.\*.contract.test.ts
**Verify**: Account info, social accounts, post status
**Evidence**: Publer contracts passing

### INT-007: OpenAI Contract Tests (25 min)

**Files**: tests/contract/openai.\*.contract.test.ts
**Verify**: Chat completions, embeddings responses
**Evidence**: OpenAI contracts passing

### INT-008: Health Check Aggregator (35 min)

**File**: app/services/integrations/health-aggregator.ts
**Poll**: All integration health endpoints (5 min interval)
**Cache**: Health statuses
**Evidence**: Aggregator working

### INT-009: Feature Flag Enforcement Audit (30 min)

**Action**: Scan codebase for external API calls
**Verify**: All wrapped in feature flag checks
**Script**: scripts/audit/check-feature-flags.mjs
**Evidence**: No unguarded external calls

### INT-010: Graceful Degradation Testing (40 min)

**Test**: Disable each integration, verify app still works
**Fallback**: Mocks used when integration down
**Evidence**: All degradation scenarios passing

### INT-011: Rate Limiting Implementation (30 min)

**File**: app/middleware/rate-limiter.ts
**Limits**: GA4 (10 req/s), Shopify (4 req/s), Chatwoot (60 req/min)
**Queue**: Requests if limit approached
**Evidence**: Rate limits respected

### INT-012: Integration Monitoring Setup (25 min)

**File**: app/services/integrations/monitor.ts
**Track**: Success rate, latency, error types per integration
**Alert**: If success rate <95%
**Evidence**: Monitoring active

### INT-013: Retry Policies - All Integrations (30 min)

**File**: app/services/integrations/retry-policy.ts
**Strategy**: Exponential backoff, 3 attempts
**Idempotency**: Ensure safe to retry
**Evidence**: Retries working

### INT-014: Documentation (25 min)

**File**: docs/specs/integrations_architecture.md (verify completeness)
**Update**: Contract test locations, health check endpoints
**Evidence**: Docs complete and accurate

### INT-015: WORK COMPLETE Block (10 min)

**Update**: feedback/integrations/2025-10-19.md
**Include**: All contracts passing, health monitored, degradation tested
**Evidence**: Feedback entry

## Foreground Proof

1. IntegrationsHealthTile.tsx component
2. Shopify contract tests passing
3. Supabase contract tests passing
4. GA4 contract tests passing
5. Chatwoot contract tests passing
6. Publer contract tests passing
7. OpenAI contract tests passing
8. health-aggregator.ts implementation
9. Feature flag audit results
10. Degradation test results
11. rate-limiter.ts implementation
12. Integration monitoring active
13. retry-policy.ts implementation
14. integrations_architecture.md updated
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~6 hours
**SUCCESS**: All integrations tested, monitored, gracefully degrading
