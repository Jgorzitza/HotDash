# Training Data Quality Analysis Plan

**Created**: 2025-10-14T12:40:00Z  
**Owner**: AI Agent  
**Purpose**: Establish framework for ongoing training data quality analysis

## Current State

### Data Collection Infrastructure
✅ **Tables Operational**:
- `AgentQuery` - Query logs with approval status and latency
- `AgentFeedback` - Annotated responses for model improvement
- `agent_approvals` - Approval queue with operator edits
- `agent_sdk_learning_data` - Training data with edit distance

✅ **Schema Supports**:
- Query text and response tracking
- Human approval/rejection status
- Operator edit capture
- Performance metrics (latency, confidence)
- Knowledge source attribution

### Current Data Volume
- AgentQuery: 1 entry (limited)
- AgentFeedback: 1 entry (limited)
- agent_approvals: 1 entry (limited)

**Status**: System deployed but awaiting production usage

## Analysis Framework

### When to Run Analysis
1. **Weekly**: Once >50 queries accumulated
2. **Monthly**: Comprehensive review when >200 queries
3. **Trigger-based**: When approval rate drops below 80%

### Key Metrics to Track

#### Query Patterns
- Most frequent query types
- Common customer questions
- Query complexity distribution
- Topic categories

#### Response Quality
- Approval rate (target: >85%)
- Edit rate (target: <30%)
- Average edit distance
- Common edit patterns

#### Performance
- Query latency distribution
- Cache hit rate
- Knowledge source diversity
- Response times by query type

### Analysis Queries

```sql
-- Top query topics (run weekly)
SELECT 
  LEFT(query, 50) as query_preview,
  COUNT(*) as frequency,
  AVG(latencyMs) as avg_latency,
  SUM(CASE WHEN approved THEN 1 ELSE 0 END)::float / COUNT(*) as approval_rate
FROM "AgentQuery"
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY query_preview
ORDER BY frequency DESC
LIMIT 20;

-- Approval patterns by time of day
SELECT 
  EXTRACT(HOUR FROM "createdAt") as hour,
  COUNT(*) as total_queries,
  AVG(CASE WHEN approved THEN 1.0 ELSE 0.0 END) as approval_rate
FROM "AgentQuery"
WHERE "createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY hour
ORDER BY hour;

-- Edit distance distribution
SELECT 
  CASE 
    WHEN edit_distance = 0 THEN 'No edits'
    WHEN edit_distance < 50 THEN 'Minor edits'
    WHEN edit_distance < 200 THEN 'Moderate edits'
    ELSE 'Major rewrite'
  END as edit_category,
  COUNT(*) as count,
  AVG(edit_distance) as avg_distance
FROM agent_sdk_learning_data
GROUP BY edit_category
ORDER BY count DESC;
```

## Recommendations for Improvement

### Phase 1: Data Accumulation (Weeks 1-4)
- Let system collect natural usage data
- No interventions - establish baseline
- Monitor for critical failures only

### Phase 2: Pattern Identification (Weeks 5-8)
- Run weekly analysis queries
- Identify common query patterns
- Document frequent edit types
- Find knowledge gaps

### Phase 3: Optimization (Weeks 9-12)
- Update prompts based on edit patterns
- Fill knowledge base gaps
- Improve response templates
- A/B test improvements

### Phase 4: Continuous Improvement (Ongoing)
- Weekly analysis reports
- Monthly quality reviews
- Quarterly model fine-tuning candidates
- Ongoing knowledge base updates

## Quality Thresholds

### Green (Healthy)
- Approval rate: >85%
- Edit rate: <20%
- Avg latency: <500ms
- Knowledge coverage: >90%

### Yellow (Needs Attention)
- Approval rate: 70-85%
- Edit rate: 20-40%
- Avg latency: 500-1000ms
- Knowledge coverage: 70-90%

### Red (Requires Action)
- Approval rate: <70%
- Edit rate: >40%
- Avg latency: >1000ms
- Knowledge coverage: <70%

## Next Steps

1. **Immediate**: Complete this analysis plan (done)
2. **Week 1**: Monitor data collection (automated)
3. **Week 2**: First analysis when >50 queries
4. **Week 4**: Comprehensive review when >200 queries
5. **Monthly**: Report to manager on quality trends

**Status**: Framework established, awaiting production data

