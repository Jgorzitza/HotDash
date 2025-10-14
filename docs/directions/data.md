---
epoch: 2025.10.E1
doc: docs/directions/data.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Data — Direction

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist: docs/runbooks/agent_launch_checklist.md
- Analytics Spec: docs/data/analytics_api_specification.md
- Growth Progress: docs/specs/growth-spec-progress-report.md

> **English Only**: All content, analytics labels, and documentation in English only (CEO directive)

## Current Sprint Focus — Foundation Data Pipelines (2025-10-14)

**Status**: B1-B3 complete (GSC, Shopify, Analytics ✅), B4-B7 pending

**Priority 0: Enable All Recommenders** (This Week - 8-10 hours)

1. **B4: Purchase Pattern Analysis** (2-3 hours)
   - Calculate product affinity (what's bought together)
   - Store in `product_affinity` table
   - Query: Products frequently purchased with Product X
   - Enables: C4 Guided Selling Recommender (~15% AOV increase)
   - Deliverable: Migration + service + API endpoint

2. **B6: Data Quality Validation** (1-2 hours)
   - Automated checks for data freshness
   - Alert if data >48 hours old
   - Monitor: GSC, Shopify sync, Analytics
   - Dashboard: Data status by source (green/yellow/red)
   - Deliverable: `app/services/data/data-quality.server.ts`

3. **B7: Historical Baseline Collection** (3-4 hours)
   - Collect 90 days historical data
   - Calculate baselines for impact measurement
   - Metrics: CTR, traffic, conversion, revenue per page
   - Store in `baseline_metrics` table
   - Deliverable: One-time baseline job + service

**Priority 1: Analytics & Measurement** (Week 2 - 10-12 hours)

4. **F2: Recommender Feedback Database** (2-3 hours)
   - Track approval/rejection by recommender type
   - Schema: `recommender_learnings` table
   - API: GET `/api/data/recommender-performance`

5. **I2: ROI Calculator** (2 hours)
   - Calculate business value by actions
   - Formula: (new_ctr - baseline) × impressions × conv_rate × AOV
   - Store in `action_roi` table

6. **I1: Action Performance Dashboard** (2-3 hours)
   - Approval rates by recommender
   - Outcome success rates
   - Page: `app/routes/app.analytics.performance.tsx`

7. **I5: Revenue Attribution** (2 hours)
   - Track revenue from executed actions
   - Example: "SEO CTR drove +$12K this month"
   - Attribution window: 30 days post-execution

8. **I7: Experiment Tracking** (1 hour)
   - Log experiments with outcomes
   - Schema: `experiments` table
   - Identify winning variations

9. **I3: Recommender Leaderboard** (1 hour)
   - Rank by approval rate & outcome success
   - Component: `app/components/RecommenderLeaderboard.tsx`

**Priority 2: Advanced Analytics** (Week 3 - 8-10 hours)

10. **I8: KPI Dashboard** (2 hours)
11. **I4: Time Savings Tracker** (2 hours)
12. **Advanced Analytics Engine** (2-3 hours) - Cohort, funnel, retention analysis
13. **Data Export System** (1-2 hours) - CSV/JSON exports
14. **Real-Time Metrics** (2 hours) - Websocket updates
15. **Anomaly Detection** (2 hours) - Statistical alerts
16. **Data Backup Automation** (1 hour)

## Database Schema Ownership

**Tables You Own**:
- `product_affinity` (B4)
- `baseline_metrics` (B7)
- `recommender_learnings` (F2)
- `action_roi` (I2)
- `experiments` (I7)
- `data_quality_checks` (B6)

**Migration Pattern**:
```sql
-- supabase/migrations/YYYYMMDD_feature.sql
CREATE TABLE IF NOT EXISTS feature (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- fields
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_feature ON feature(lookup_field);

ALTER TABLE feature ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read" ON feature
  FOR SELECT TO authenticated USING (true);
```

## API Design Standards

Every endpoint requires:
1. Supabase JWT authentication
2. Caching (5-60 min based on freshness)
3. Cursor-based pagination
4. Response format:
```typescript
{
  data: [...],
  meta: {
    total: number,
    cached: boolean,
    cache_expires_at: string
  }
}
```

## Performance Requirements

- Simple queries: <100ms
- Aggregations: <500ms  
- Complex analytics: <2s
- Real-time updates: <5s latency

## Evidence & Compliance

Every task requires:
1. SQL migration committed
2. Service/API implementation
3. Tests ≥80% coverage
4. Performance test (query speed)
5. Evidence in `feedback/data.md`:
   - Migration file path
   - API endpoint created
   - Query performance (Xms)
   - Test results (X/Y passing)

Report every 2 hours:
```
## YYYY-MM-DDTHH:MM:SSZ — Data: [Task] [Status]
**Working On**: [P0 task]
**Progress**: [% or milestone]
**Evidence**: 
- Migration: supabase/migrations/file.sql
- Service: app/services/data/file.server.ts
- Query: 45ms (target <100ms)
- Tests: 8/8 passing
**Blockers**: [None or details]
**Next**: [Next task]
```

## Success Criteria

**P0 Complete** (This Week):
- ✅ B4 Purchase patterns calculated
- ✅ B6 Data quality monitoring
- ✅ B7 Historical baselines collected
- ✅ All pipelines operational
- ✅ Zero data gaps (<48h fresh)

**P1 Complete** (Week 2):
- ✅ Recommender feedback tracked
- ✅ ROI calculator working
- ✅ Revenue attribution accurate

## Coordination

**With Engineer**: Provide data APIs for action system  
**With AI**: Supply metadata for recommenders  
**With Integrations**: Sync on GA/GSC requirements  
**With Product**: Validate ROI calculations

## Blockers & Escalation

**Current**: NONE

If stuck >2 hours escalate with:
```
🚨 BLOCKER: [Task] blocked on [reason]
**Attempted**: [what tried]
**Needed**: [what would unblock]
**Impact**: [recommenders blocked]
```

## Timeline

- Week 1: 8-10 hours (B4, B6, B7)
- Week 2: 10-12 hours (Analytics)
- Week 3: 8-10 hours (Advanced)
- **Total**: 26-32 hours over 3 weeks

---

**Last Updated**: 2025-10-14T21:15:00Z  
**Start**: B4 Purchase Patterns immediately  
**Evidence**: All work in `feedback/data.md`
