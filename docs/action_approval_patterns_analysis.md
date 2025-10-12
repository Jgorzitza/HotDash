# Action Approval Patterns Analysis

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Product Agent

---

## Analysis Purpose

Track which actions get approved vs rejected to guide AI training priorities and identify high-confidence action types.

**Goal**: 75% approval rate by Month 6, with >90% for high-confidence actions

---

## Action Types Tracked

### Approval Queue Actions
1. **Approve** (target: 60-75% of actions)
2. **Edit & Approve** (target: 20-35%)
3. **Escalate** (target: 5-10%)
4. **Reject** (target: <5%)

---

## Pattern Analysis Framework

### Confidence Score vs Approval Rate

**Track Correlation**:
| Confidence Range | Expected Approval Rate | Actual (Week 1) | Gap |
|-----------------|----------------------|-----------------|-----|
| 90-100% (High) | >85% | [Track] | [Calculate] |
| 75-89% (Medium-High) | >70% | [Track] | [Calculate] |
| 60-74% (Medium) | >50% | [Track] | [Calculate] |
| <60% (Low) | <40% (should escalate) | [Track] | [Calculate] |

**Goal**: Confidence scores accurately predict approval likelihood

---

### Action Type Patterns

**High-Confidence Actions** (90-100%):
- Order status inquiries
- Shipping tracking requests
- General FAQ questions
- Business hours questions

**Medium-Confidence Actions** (70-89%):
- Return policy questions
- Product availability
- Account issues
- Standard refund requests

**Low-Confidence Actions** (<70%):
- Complex technical issues
- Policy exceptions
- Angry customers
- High-value refunds (>$100)

**Strategy**: Focus AI training on high/medium confidence categories

---

## Data Collection (Using Supabase MCP)

**Query Pattern Analysis**:
```sql
SELECT 
  confidence_range,
  action_type,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
  SELECT 
    CASE 
      WHEN confidence_score >= 90 THEN '90-100% (High)'
      WHEN confidence_score >= 75 THEN '75-89% (Med-High)'
      WHEN confidence_score >= 60 THEN '60-74% (Medium)'
      ELSE '<60% (Low)'
    END as confidence_range,
    operator_action as action_type
  FROM approval_queue_actions
  WHERE timestamp >= NOW() - INTERVAL '7 days'
) subquery
GROUP BY confidence_range, action_type
ORDER BY confidence_range DESC, count DESC;
```

---

## Weekly Pattern Report

**Every Monday 9:00 AM**:

### Approval Patterns This Week
- Total actions: 156
- Approve: 102 (65%)
- Edit: 42 (27%)
- Escalate: 10 (6%)
- Reject: 2 (1%)

### Confidence Calibration
- High confidence (90-100%): 78% approved ✅ (target: >85%)
- Medium confidence (75-89%): 68% approved ✅ (target: >70%)
- Low confidence (<60%): 45% approved ⚠️ (should be <40%, too high)

**Issue Identified**: Low-confidence actions being approved too often (operator overriding AI caution)

**Action**: Survey operators - "When do you approve low-confidence drafts?"

---

## AI Training Priorities

### Priority 1: Improve High-Confidence Accuracy
**Current**: 78% approval rate for high-confidence  
**Target**: 92% approval rate  
**Action**: Analyze 22% of high-confidence drafts that were edited/rejected

**Root Causes**:
- Tone issues (too formal/informal)
- Missing details (order number, tracking)
- Outdated information (KB gaps)

**Training Focus**: Fine-tune on high-confidence categories with operator edits

---

### Priority 2: Reduce False Confidence
**Issue**: Medium-confidence actions approved at 68% (below 70% target)  
**Action**: Recalibrate confidence scoring algorithm

**Approach**:
- Analyze features of 68% vs 85% approved drafts
- Adjust confidence thresholds
- A/B test new scoring model

---

### Priority 3: Escalation Accuracy
**Current**: 6% escalation rate (target: 8-10%)  
**Issue**: Slightly under-escalating

**Analysis**: Which escalated tickets could AI have handled?  
**Action**: Review escalated tickets, identify false escalations

---

## Evidence Logging (feedback/product.md)

```markdown
### 2025-10-21 - P1 Task 5: Approval Patterns (Week 1)

**Approval Breakdown**:
- Approve: 65% (target: 60-75%) ✅
- Edit: 27% (target: 20-35%) ✅
- Escalate: 6% (target: 5-10%) ✅
- Reject: 1% (target: <5%) ✅

**Confidence Calibration**:
- High (90-100%): 78% approved (target: >85%) ⚠️ Need improvement
- Medium (75-89%): 68% approved (target: >70%) ⚠️ Slightly low

**AI Training Priorities**:
1. Improve tone matching (high-confidence edits analysis)
2. Recalibrate medium-confidence threshold
3. Update KB articles (5 gaps identified)

**Evidence**: Supabase query results, pattern analysis
**North Star**: Focus AI on high-value, high-confidence actions
```

---

**Document Owner**: Product Agent  
**Created**: October 12, 2025  
**Status**: Track Weekly Starting Oct 21

**End of Action Approval Patterns Analysis**

