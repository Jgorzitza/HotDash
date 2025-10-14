---
epoch: 2025.10.E1
doc: docs/directions/data.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Data — Direction

## Canon
- North Star: docs/NORTH_STAR.md (MCP-First Development)
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md

> **Training Data WARNING**: We are in 2025. Shopify APIs in training from 2023 (2 YEARS OLD). React Router 7 training has v6/Remix (2+ years old). ALWAYS verify with appropriate MCP tools.
- Agent Launch Checklist: docs/runbooks/agent_launch_checklist.md
- Agent Workflow Rules: .cursor/rules/04-agent-workflow.mdc (alwaysApply: true)
- Analytics Spec: docs/data/analytics_api_specification.md
- Growth Progress: docs/specs/growth-spec-progress-report.md

> **English Only**: All content, analytics labels, and documentation in English only (CEO directive)

## Current Sprint Focus — Foundation Data Pipelines (2025-10-14)

**Status**: B1-B3 complete (GSC, Shopify, Analytics ✅), B4-B7 pending

**Priority 0: Enable All Recommenders** (This Week - 10-13 hours)

1. **Chatwoot Historical Data ETL** ⚠️ CRITICAL FOR AI (2-3 hours)
   - **Goal**: Support AI agent RAG training with historical customer data
   - ETL pipeline for Chatwoot conversation export
   - Transform conversations → LlamaIndex-compatible format
   - Handle image attachments (customer screenshots, photos)
   - Data validation (complete conversations, no corruption)
   - **Coordinate with**: Chatwoot agent (export), AI agent (RAG ingestion)
   - Deliverable: `scripts/ai/ingest-chatwoot-history.ts`
   
   **Acceptance**:
   - ✅ Process Chatwoot JSON export
   - ✅ Extract customer questions + agent answers
   - ✅ Download and index image attachments
   - ✅ Output LlamaIndex format
   - ✅ Privacy compliant (no PII leaks)
   - ✅ Minimum 100+ conversations processed

2. **B4: Purchase Pattern Analysis** (2-3 hours)
   - Calculate product affinity (what's bought together)
   - Store in `product_affinity` table
   - Query: Products frequently purchased with Product X
   - Enables: C4 Guided Selling Recommender (~15% AOV increase)
   - Deliverable: Migration + service + API endpoint

3. **B6: Data Quality Validation** (1-2 hours)
   - Automated checks for data freshness
   - Alert if data >48 hours old
   - Monitor: GSC, Shopify sync, Analytics, **Chatwoot RAG**
   - Dashboard: Data status by source (green/yellow/red)
   - Deliverable: `app/services/data/data-quality.server.ts`

4. **B7: Historical Baseline Collection** (3-4 hours)
   - Collect 90 days historical data
   - Calculate baselines for impact measurement
   - Metrics: CTR, traffic, conversion, revenue per page
   - Store in `baseline_metrics` table
   - Deliverable: One-time baseline job + service

**Priority 1: Analytics & Measurement** (Week 2 - 10-12 hours)

5. **F2: Recommender Feedback Database** (2-3 hours)
   - Track approval/rejection by recommender type
   - Schema: `recommender_learnings` table
   - API: GET `/api/data/recommender-performance`

6. **I2: ROI Calculator** (2 hours)
   - Calculate business value by actions
   - Formula: (new_ctr - baseline) × impressions × conv_rate × AOV
   - Store in `action_roi` table

7. **I1: Action Performance Dashboard** (2-3 hours)
   - Approval rates by recommender
   - Outcome success rates
   - **Include**: Multimodal action success rates (image vs text-only)
   - Page: `app/routes/app.analytics.performance.tsx`

8. **I5: Revenue Attribution** (2 hours)
   - Track revenue from executed actions
   - Example: "SEO CTR drove +$12K this month"
   - Attribution window: 30 days post-execution

9. **I7: Experiment Tracking** (1 hour)
   - Log experiments with outcomes
   - Schema: `experiments` table
   - Identify winning variations

10. **I3: Recommender Leaderboard** (1 hour)
    - Rank by approval rate & outcome success
    - Component: `app/components/RecommenderLeaderboard.tsx`

**Priority 2: Advanced Analytics** (Week 3 - 8-10 hours)

11. **I8: KPI Dashboard** (2 hours)
12. **I4: Time Savings Tracker** (2 hours)
13. **Advanced Analytics Engine** (2-3 hours) - Cohort, funnel, retention analysis
14. **Data Export System** (1-2 hours) - CSV/JSON exports
15. **Real-Time Metrics** (2 hours) - Websocket updates
16. **Anomaly Detection** (2 hours) - Statistical alerts
17. **Data Backup Automation** (1 hour)

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

- Week 1: 10-13 hours (Chatwoot ETL + B4, B6, B7)
- Week 2: 10-12 hours (Analytics)
- Week 3: 8-10 hours (Advanced)
- **Total**: 28-35 hours over 3 weeks

---

## ⚠️ EXECUTION INSTRUCTION

**DO NOT STOP TO ASK "WHAT'S NEXT"**:
- Your direction file contains ALL your tasks (P0, P1, P2)
- Execute them sequentially until ALL complete
- Report progress every 2 hours (don't ask permission)
- Log blockers and move to next task if stuck
- Only stop when ALL assigned work is done

**See**: .cursor/rules/04-agent-workflow.mdc for complete execution rules

---

**Last Updated**: 2025-10-14T21:30:00Z  
**Start**: Chatwoot Historical ETL (P0 Task 1) - AI agent needs this for RAG  
**Evidence**: All work in `feedback/data.md`

**CRITICAL**: Task 1 (Chatwoot ETL) unblocks AI agent training. Complete this FIRST to enable CEO voice learning from past interactions.
