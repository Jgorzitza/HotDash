# Escalation & Manager Approval Workflow

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Purpose**: Clear process for when operators need manager approval or escalation
**Evidence**: Escalation criteria, approval workflow, response time SLAs

---

## When Operators Need Manager Approval

### Scenario 1: High-Value Refunds (>$100)

**Process**:

1. Operator clicks "Escalate"
2. Selects reason: "Refund approval needed"
3. Enters refund amount and reason
4. Request goes to Manager queue
5. Manager reviews within 2 hours
6. Manager approves or denies
7. Operator gets notification
8. Operator sends response to customer

**SLA**: Manager response within 2 hours during business hours

---

### Scenario 2: Policy Exceptions

**Examples**:

- Customer wants to return after 30-day window
- Customer wants refund on final-sale item
- Customer requests expedited shipping at standard price

**Process**:

1. Operator explains standard policy in draft
2. Customer pushes back or asks for exception
3. Operator escalates to Manager: "Policy exception request"
4. Manager decides (approve exception or hold firm)
5. Operator completes interaction based on decision

---

### Scenario 3: Angry/Threatening Customers

**Triggers**:

- Customer uses legal language ("lawsuit", "BBB", "lawyer")
- Customer is abusive to operator
- Customer threatens to cancel/churn (high-value customer)
- Situation is escalating

**Process**:

1. Operator does NOT respond immediately
2. Escalates to Manager or Senior Support
3. Includes context: "Customer threatening legal action"
4. Manager/Senior takes over conversation directly
5. Operator is off the hook (no stress)

**SLA**: Manager/Senior response within 30 minutes for angry customers

---

## Escalation Queue (For Managers/Seniors)

**Similar to operator approval queue, but for escalations**:

```
┌─────────────────────────────────────────────────┐
│ ESCALATION QUEUE - Manager View                │
├─────────────────────────────────────────────────┤
│                                                 │
│ Priority: 🔴 High (Angry Customer)              │
│ From: Sarah (Operator)                          │
│ Customer: John Doe                              │
│ Issue: Demanding refund on final-sale item      │
│                                                 │
│ Customer's Message:                             │
│ "This is ridiculous! I want my money back NOW  │
│  or I'm calling my lawyer!"                     │
│                                                 │
│ Operator's Note:                                │
│ "Customer purchased final-sale item ($150),    │
│  wants full refund. Item is against policy     │
│  but customer is very angry. Recommend         │
│  exception to preserve relationship?"          │
│                                                 │
│ Suggested Action (AI):                          │
│ "Approve $150 refund as goodwill exception.    │
│  Customer LTV: $1,200. Worth preserving."      │
│                                                 │
│ [Approve Exception] [Deny] [Custom Response]   │
└─────────────────────────────────────────────────┘
```

**Manager's job**: Provide judgment on edge cases, high-value decisions

---

## Escalation Best Practices (For Operators)

### What to Include in Escalation Notes

**Good escalation note**:

> "Customer ordered $250 item, received damaged. Wants refund. I verified photos show damage. Refund amount >$100 so needs your approval. Customer is polite but needs quick response. Recommend: Full refund + 10% discount on next order."

**What it has**:

- ✅ Context (order value, issue)
- ✅ Evidence (photos verified)
- ✅ Why escalating (>$100 threshold)
- ✅ Customer sentiment (polite)
- ✅ Recommendation (what you think should happen)

**Bad escalation note**:

> "Customer wants refund, need approval"

**What's missing**: Context, amount, why, recommendation

---

### When NOT to Escalate

**Don't escalate if**:

- ❌ You're just uncertain (reject and write manually instead)
- ❌ Draft needs editing (just edit it yourself)
- ❌ Standard inquiry within your authority (order status, tracking)

**DO escalate if**:

- ✅ Requires manager approval (>$100, policy exception)
- ✅ Customer is angry/threatening
- ✅ Complex issue beyond your expertise
- ✅ You've tried to resolve but stuck

**Remember**: Escalate when needed, not as default. Managers trust your judgment!

---

## Manager Approval Workflow (Technical Spec)

**For Engineering**: How to build the escalation queue

**Database**:

```sql
CREATE TABLE escalations (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER,
  operator_id INTEGER,
  escalation_reason VARCHAR(50), -- 'refund_approval', 'policy_exception', 'angry_customer', 'complex'
  escalation_note TEXT,
  priority VARCHAR(10), -- 'low', 'medium', 'high', 'urgent'
  created_at TIMESTAMP,
  assigned_to INTEGER, -- manager_id
  status VARCHAR(20) -- 'pending', 'approved', 'denied', 'resolved'
);
```

**API**:

- POST /api/escalations/create (operator creates escalation)
- GET /api/escalations/queue (manager sees all pending)
- POST /api/escalations/{id}/approve (manager approves)
- POST /api/escalations/{id}/deny (manager denies with reason)

**Notifications**:

- Operator → Escalates → Manager gets Slack notification
- Manager → Approves → Operator gets Slack notification
- SLA tracking: Alert if manager hasn't responded in 2 hours

---

## Escalation Metrics (To Track)

**For Product Agent to Monitor**:

- Escalation rate: <10% of inquiries (target)
- Manager response time: <2 hours (target)
- Escalation accuracy: >90% (appropriate escalations)
- Operator satisfaction with escalation process: >8/10

**Red flag**: If escalation rate >15%, operators aren't confident—need more training or better AI

---

**Document Path**: `docs/escalation_approval_workflow.md`  
**Owner**: Product Agent (Supporting Operations)  
**Status**: Ready for manager queue implementation  
**North Star**: ✅ **Clear escalation paths protect operators from stress and ensure quality**
