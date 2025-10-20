# Analytics Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 4.0

## Objective

**Issue**: #104 ✅ COMPLETE  
All tasks complete - ready to build analytics APIs

## Current Status

All v3.0 tasks ✅, contract tests ✅ (6/6), ready for API work

## Tasks

### SUPPORTIVE WORK (1-2h) - Analytics API Endpoints

**ANALYTICS-API-001**: Agent Performance Metrics API (45 min)
1. Create `app/routes/api.analytics.agent-metrics.ts`
2. Return agent performance data:
   - Approval rates by agent
   - Response times
   - Tool usage stats
   - Queue health
3. Reference: docs/design/agent-performance-metrics-ui.md
4. Contract test: 8 tests minimum
5. Use React Router 7 patterns

**ANALYTICS-API-002**: Real-Time Metrics Stream (30 min)
1. Create `app/routes/api.analytics.stream.ts`
2. Implement SSE (Server-Sent Events)
3. Stream live updates: queue depth, metric changes
4. Update every 5 seconds
5. Reference design specs for real-time indicators

**ANALYTICS-API-003**: Approvals Count Endpoint (15 min)
1. Create quick endpoint: `/api/analytics/approvals/count`
2. Return: pending, approved, rejected counts
3. Used by navigation badge
4. < 100ms response time

### STANDBY - Ready When Engineer Requests

- Answer questions about analytics data
- Provide sample queries
- Support dashboard data visualization
- Validate analytics accuracy

## Work Complete

✅ Shopify returns stub (181 lines)  
✅ Sampling guard proof (223 lines)  
✅ Metrics for Ads/Content (183 lines)  
✅ Analytics pipeline doc (343 lines)  
✅ Contract tests 6/6 passing

## Constraints

**Tools**: npm, psql  
**MCP REQUIRED**: Context7 for React Router 7 patterns  
**Budget**: ≤ 2.5 hours  
**Paths**: app/routes/api.analytics.**, tests/**, feedback/analytics/**

## Links

- Previous work: feedback/analytics/2025-10-20.md (all complete)
- Design specs: docs/design/agent-performance-metrics-ui.md

## Definition of Done

- [ ] 3 analytics API endpoints created
- [ ] Contract tests passing
- [ ] React Router 7 compliant
- [ ] Ready for Engineer dashboard integration
