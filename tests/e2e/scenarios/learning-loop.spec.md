# E2E Test Scenarios: Learning Loop

**Purpose**: Validate AI learning from operator decisions  
**Created**: 2025-10-14  
**Owner**: QA Helper (supporting QA agent)

---

## Overview

The learning loop ensures the AI agent improves over time based on operator feedback (approvals, edits, rejections).

---

## Scenario 1: Rejection Feedback Loop

**Goal**: Verify rejections inform AI improvement

### Test Steps:
1. **Trigger AI Response**: Customer asks product question
2. **AI Generates Answer**: Low confidence (40%)
3. **Operator Rejects**: Reason = "Missing technical specs"
4. **Verify Logging**:
   ```sql
   SELECT * FROM decision_log 
   WHERE action = 'reject' 
   AND tool = 'query_support'
   ORDER BY created_at DESC LIMIT 1;
   ```
5. **Check Data**:
   - ✅ Rejection reason captured
   - ✅ Original query stored
   - ✅ AI response stored
   - ✅ Conversation context included

### Expected Data Structure:
```json
{
  "scope": "ai_learning",
  "actor": "operator@hotrodan.com",
  "action": "reject",
  "rationale": "Missing technical specs",
  "payload": {
    "tool": "query_support",
    "query": "...",
    "response": "...",
    "confidence": 40
  }
}
```

---

## Scenario 2: Edit Tracking for Improvement

**Goal**: Capture what operators change to improve AI

### Test Steps:
1. **AI Generates**: Draft response
2. **Operator Edits**: Changes tone, adds detail
3. **Operator Approves**: Sends edited version
4. **Verify Diff Logged**:
   ```sql
   SELECT * FROM decision_log 
   WHERE action = 'edit_approve' 
   ORDER BY created_at DESC LIMIT 1;
   ```
5. **Check Diff Data**:
   - ✅ Original text stored
   - ✅ Edited text stored
   - ✅ Diff computed
   - ✅ Edit categories captured

### Diff Analysis:
- Tone changes (formal → friendly)
- Technical detail additions
- Pricing/product corrections
- Policy compliance fixes

---

## Scenario 3: Approval Confidence Correlation

**Goal**: Track relationship between confidence score and approval rate

### Test Steps:
1. **Generate Mixed Confidence**:
   - 5 items: 90-95% confidence
   - 5 items: 70-80% confidence
   - 5 items: 40-50% confidence
   
2. **Operators Review**: Natural approval/rejection
   
3. **Query Metrics**:
   ```sql
   SELECT 
     CASE 
       WHEN confidence >= 90 THEN 'high'
       WHEN confidence >= 70 THEN 'medium'
       ELSE 'low'
     END as confidence_band,
     COUNT(CASE WHEN action = 'approve' THEN 1 END) as approvals,
     COUNT(CASE WHEN action = 'reject' THEN 1 END) as rejections
   FROM decision_log
   GROUP BY confidence_band;
   ```
   
4. **Verify Correlation**:
   - ✅ High confidence → higher approval rate
   - ✅ Low confidence → higher rejection rate
   - ✅ Data informs confidence threshold tuning

---

## Scenario 4: Tool Performance Tracking

**Goal**: Identify which AI tools perform best/worst

### Test Steps:
1. **Diverse Actions**: Mix of all 6 action types
   - product_recommendation
   - order_lookup
   - technical_guidance
   - price_quote
   - inventory_check
   - escalation
   
2. **Operator Reviews**: Approve/reject naturally
   
3. **Query Tool Performance**:
   ```sql
   SELECT 
     tool,
     COUNT(*) as total_uses,
     COUNT(CASE WHEN action = 'approve' THEN 1 END) as approvals,
     COUNT(CASE WHEN action = 'reject' THEN 1 END) as rejections,
     ROUND(100.0 * COUNT(CASE WHEN action = 'approve' THEN 1 END) / COUNT(*), 1) as approval_rate
   FROM decision_log
   WHERE tool IS NOT NULL
   GROUP BY tool
   ORDER BY approval_rate DESC;
   ```
   
4. **Expected Insights**:
   - ✅ Highest performing tools identified
   - ✅ Problematic tools flagged
   - ✅ Data guides AI training focus

---

## Scenario 5: Time-to-Approval Metrics

**Goal**: Measure operator response time and queue health

### Test Steps:
1. **Create Approvals**: 10 items at staggered times
   
2. **Operators Process**: Approve/reject over time
   
3. **Measure Latency**:
   ```sql
   SELECT 
     AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_seconds,
     MIN(EXTRACT(EPOCH FROM (updated_at - created_at))) as min_seconds,
     MAX(EXTRACT(EPOCH FROM (updated_at - created_at))) as max_seconds
   FROM approvals
   WHERE status != 'pending';
   ```
   
4. **Target Metrics**:
   - Average: <5 minutes
   - 95th percentile: <15 minutes
   - Maximum: <30 minutes

---

## Scenario 6: Multi-Operator Coordination

**Goal**: Ensure multiple operators can work concurrently without conflicts

### Test Steps:
1. **Setup**: 20 pending approvals
   
2. **Concurrent Operators**: 3 operators access queue
   
3. **Actions**:
   - Operator A approves item #1
   - Operator B simultaneously views item #1
   - Operator C approves item #2
   
4. **Verify**:
   - ✅ No duplicate approvals
   - ✅ Item #1 disappears from all views
   - ✅ Optimistic locking prevents conflicts
   - ✅ Each operator sees accurate queue state

---

## Scenario 7: Learning Data Export

**Goal**: Verify training data can be extracted for AI improvement

### Test Steps:
1. **Accumulate Data**: 50+ decisions (approve, edit, reject)
   
2. **Export Query**:
   ```sql
   SELECT 
     created_at,
     action,
     tool,
     rationale,
     payload->'confidence' as confidence,
     payload->'query' as original_query,
     payload->'response' as ai_response,
     payload->'edited_response' as operator_version
   FROM decision_log
   WHERE scope = 'ai_learning'
   ORDER BY created_at DESC;
   ```
   
3. **Verify Export**:
   - ✅ All rejections with reasons
   - ✅ All edits with diffs
   - ✅ Confidence scores
   - ✅ Timestamps for temporal analysis
   
4. **Data Quality**:
   - No PII in learning data
   - Structured format for ML ingestion
   - Sufficient context for training

---

## Test Data Generation

```typescript
import { 
  generateConversations,
  generateEscalationScenario,
  generateApprovalQueue 
} from '../../helpers/chatwoot-data-generator';

import { generateAllActionTypes } from '../../helpers/actions-data-generator';

// Generate diverse test data
const conversations = generateConversations(10);
const escalations = [generateEscalationScenario(500), generateEscalationScenario(501)];
const approvals = generateApprovalQueue(20);
const actions = generateAllActionTypes();
```

---

## Implementation Priority

1. **P0**: Scenario 1 (Basic approval) - Required for MVP
2. **P0**: Scenario 2 (Edit & approve) - Core functionality
3. **P1**: Scenario 3 (Rejection) - Learning loop critical
4. **P1**: Scenario 6 (Multi-operator) - Prevents data corruption
5. **P2**: Scenario 4 (Tool performance) - Analytics
6. **P2**: Scenario 5 (Time metrics) - Monitoring
7. **P2**: Scenario 7 (Data export) - Future AI training

---

**QA Agent Action**: Implement these scenarios as Playwright tests  
**Timeline**: 3-4 hours  
**Dependencies**: Test data generators (✅ complete)

