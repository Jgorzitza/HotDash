# Approval Queue Test Scenarios

**Owner**: AI-Customer  
**For**: QA Agent (QA-009)  
**Created**: 2025-10-22  
**Version**: 1.0

---

## Purpose

Comprehensive test scenarios for the HITL (Human-In-The-Loop) approval queue and grading system. These scenarios cover:
- CX approval workflow (Customer Agent responses)
- CEO approval workflow (CEO Agent actions)
- Grading system (tone, accuracy, policy 1-5 scale)
- Edge cases and error scenarios
- State transitions and rollback

---

## Architecture Overview

### Customer Agent Approval Flow
```
Customer Query → AI Draft → Pending Review → Operator Grades → Operator Edits (optional) → Approve/Reject → Send to Customer → Log Decision
```

### CEO Agent Approval Flow
```
CEO Query → AI Analysis → Proposed Action → Evidence/Reasoning → Approval Queue → CEO Reviews → Approve/Modify/Reject → Execute (if approved) → Log Decision
```

### Data Storage
- **Table**: `decision_log` (Supabase)
- **Customer Agent**: `action = 'chatwoot.approve_send'`
- **CEO Agent**: `scope = 'ceo_approval'`
- **Grading**: `payload.grades.{tone, accuracy, policy}` (1-5)

---

## Test Scenario Categories

### Category 1: Customer Agent - Happy Path Scenarios

#### SC-001: Approve AI Suggestion Without Edits (Grade 5)
**Objective**: Test perfect AI response approval with excellent grades

**Pre-conditions**:
- Chatwoot conversation ID: 12345
- AI suggestion generated
- Operator reviews response

**Test Steps**:
1. Open CX Escalation modal for conversation 12345
2. Review AI suggested reply: "Thank you for contacting us! Your order #1234 will ship within 24 hours."
3. Set grades: Tone=5, Accuracy=5, Policy=5
4. Click "Approve & Send"

**Expected Results**:
- ✅ Reply sent to Chatwoot conversation 12345
- ✅ Decision logged: `action='chatwoot.approve_send'`
- ✅ Payload contains:
  ```json
  {
    "conversationId": 12345,
    "replyBody": "Thank you for contacting us!...",
    "aiSuggestionUsed": true,
    "grades": { "tone": 5, "accuracy": 5, "policy": 5 }
  }
  ```
- ✅ Edit distance: 0 (no changes)
- ✅ Modal closes
- ✅ Success message displayed

**Pass Criteria**: All decision_log fields populated correctly, grades saved, reply sent

---

#### SC-002: Approve AI Suggestion With Minor Edits (Grade 4)
**Objective**: Test edited AI response with good grades

**Pre-conditions**:
- Chatwoot conversation ID: 12346
- AI suggestion: "We'll process your refund soon."
- Operator edits to: "We'll process your refund within 3-5 business days."

**Test Steps**:
1. Open modal, review AI suggestion
2. Edit reply to be more specific
3. Set grades: Tone=4, Accuracy=4, Policy=5
4. Add internal note: "Added specific timeline per policy"
5. Click "Approve & Send"

**Expected Results**:
- ✅ Edited reply sent (not AI version)
- ✅ `aiSuggestionUsed = true` (draft originated from AI)
- ✅ Grades saved: {tone: 4, accuracy: 4, policy: 5}
- ✅ Edit distance calculated (Levenshtein ~20 chars)
- ✅ Note saved in payload
- ✅ Modal closes

**Pass Criteria**: Edit distance > 0, grades reflect quality issues, edited text sent

---

#### SC-003: Reject AI Suggestion (Grade 2)
**Objective**: Test poor AI response rejection with low grades

**Pre-conditions**:
- AI suggestion contains hallucination or policy violation
- Operator writes manual reply

**Test Steps**:
1. Open modal, review AI suggestion: "We can ship to Mars!"
2. Set grades: Tone=3, Accuracy=1, Policy=2
3. Add note: "AI hallucinated shipping capability"
4. Write manual reply: "We currently ship within the United States only."
5. Click "Approve & Send"

**Expected Results**:
- ✅ Manual reply sent (not AI suggestion)
- ✅ `aiSuggestionUsed = false`
- ✅ Low grades saved: {tone: 3, accuracy: 1, policy: 2}
- ✅ Note explains issue
- ✅ AI learning: Low accuracy grade triggers review

**Pass Criteria**: Low grades logged, manual text used, note explains rejection reason

---

### Category 2: Customer Agent - Grading Scenarios

#### SC-004: Excellent Response - All 5s
**Test Case**: AI generates perfect response

**Example Reply**:
```
Hi [Customer Name],

Thank you for reaching out! I've reviewed your order #5678 and can confirm it shipped yesterday via USPS Priority Mail.

Your tracking number is: 1234567890

You can expect delivery within 2-3 business days. If you have any questions, please don't hesitate to ask!

Best regards,
HotDash Support
```

**Expected Grades**:
- Tone: 5 (Friendly, professional, warm)
- Accuracy: 5 (Correct order info, real tracking number)
- Policy: 5 (Follows communication guidelines, includes tracking)

**Indicators of Excellent Response**:
- Personalized greeting
- Specific order details
- Actionable information (tracking number)
- Clear timeline
- Professional sign-off
- No jargon or technical terms

---

#### SC-005: Poor Tone - Grade 2
**Test Case**: Correct information but wrong tone

**Example Reply**:
```
Your order shipped. Track it yourself: 1234567890
```

**Expected Grades**:
- Tone: 2 (Curt, unfriendly, no warmth)
- Accuracy: 5 (Information is correct)
- Policy: 3 (Missing greeting/sign-off)

**Issues**:
- No greeting
- Imperative tone ("Track it yourself")
- No empathy or customer service language
- Missing professional formatting

**Operator Action**: Edit to add warmth, keep accuracy

---

#### SC-006: Inaccurate Information - Grade 1
**Test Case**: Friendly tone but wrong facts

**Example Reply**:
```
Hi there!

Great news - your order #5678 shipped last week and should arrive today! We used FedEx overnight shipping at no extra charge.

Let me know if you have questions!
```

**Expected Grades**:
- Tone: 5 (Friendly, enthusiastic)
- Accuracy: 1 (Wrong ship date, wrong carrier, wrong service level)
- Policy: 3 (Format okay, but promises we can't keep)

**Issues**:
- Hallucinated ship date
- Wrong carrier
- False promise (overnight shipping not offered)

**Operator Action**: Reject AI suggestion, verify real data, write manual response

---

#### SC-007: Policy Violation - Grade 1
**Test Case**: Violates company policy

**Example Reply**:
```
I can issue you a full refund right now! I'll also send you a replacement for free and give you 50% off your next order.
```

**Expected Grades**:
- Tone: 5 (Very friendly, over-eager)
- Accuracy: 3 (Technically possible but not approved)
- Policy: 1 (Major policy violations - unauthorized discounts/refunds)

**Issues**:
- Unauthorized refund
- Unauthorized free replacement
- Unauthorized discount
- No manager approval for financial actions

**Operator Action**: Reject, escalate to manager, follow refund policy

---

#### SC-008: Middle Ground - Grade 3
**Test Case**: Acceptable but needs improvement

**Example Reply**:
```
Hello,

Your order has been processed and will ship soon. You will receive tracking information when it ships.

Thank you.
```

**Expected Grades**:
- Tone: 3 (Professional but cold)
- Accuracy: 4 (Accurate but vague - "soon" not specific)
- Policy: 4 (Follows format, but could be better)

**Issues**:
- No personalization
- Vague timeline ("soon")
- Could be warmer
- Could provide order number

**Operator Action**: Minor edits to add specificity and warmth

---

### Category 3: CEO Agent - Approval Scenarios

#### SC-009: CEO Action Approval - Inventory Reorder
**Objective**: Test CEO approving inventory action with evidence

**CEO Query**: "Should I reorder Powder Board XL?"

**AI Analysis**:
```json
{
  "actionId": "action_001",
  "actionType": "inventory",
  "description": "Reorder 50 units of Powder Board XL (SKU-789)",
  "reasoning": "Inventory at 8 units. 14-day velocity: 3.2 units/day. Days of cover: 2.5 days. Reorder point: 15 units (ROP breach).",
  "evidence": {
    "sources": ["shopify.products", "supabase.analytics"],
    "metrics": {
      "currentInventory": 8,
      "dailyVelocity": 3.2,
      "daysOfCover": 2.5,
      "reorderPoint": 15
    }
  },
  "projectedImpact": {
    "revenue": 15000,
    "efficiency": "Prevent stockout for next 15 days"
  },
  "risks": ["Overstock if demand decreases"],
  "rollback": "Return excess inventory to supplier within 30 days"
}
```

**Test Steps**:
1. CEO Agent generates recommendation
2. Approval record created in decision_log (scope='ceo_approval', status='pending')
3. CEO reviews in approval drawer
4. CEO clicks "Approve"
5. Status updated to 'approved'
6. Action executes (creates purchase order)
7. Result logged in decision_log

**Expected Results**:
- ✅ Approval URL generated: `/app/approvals?id=123&type=inventory`
- ✅ Evidence displayed to CEO
- ✅ Approval logged with CEO user ID
- ✅ Action executes only after approval
- ✅ Execution result logged

**Pass Criteria**: Full audit trail, no execution before approval, evidence preserved

---

#### SC-010: CEO Action Rejection
**Objective**: Test CEO rejecting action

**CEO Query**: "Cancel all open orders"

**AI Analysis**: Proposes bulk cancellation

**Test Steps**:
1. AI generates dangerous action (cancel all orders)
2. Approval queue entry created
3. CEO reviews and sees risks
4. CEO clicks "Reject"
5. Status updated to 'rejected'
6. Action NOT executed

**Expected Results**:
- ✅ Status = 'rejected'
- ✅ Action never executes
- ✅ Rejection reason logged
- ✅ CEO notified

**Pass Criteria**: No execution, clear rejection log, CEO confirmation

---

#### SC-011: CEO Action Modification
**Objective**: Test CEO modifying AI proposal before approval

**AI Proposes**: Reorder 100 units  
**CEO Modifies**: Reorder 30 units (more conservative)

**Test Steps**:
1. AI suggests 100 units
2. CEO changes quantity to 30
3. CEO clicks "Approve Modified"
4. Modified action executes (30 units, not 100)
5. Both original and modified logged

**Expected Results**:
- ✅ Original proposal: 100 units
- ✅ Modified payload: 30 units
- ✅ Execution uses modified version
- ✅ Audit trail shows both

**Pass Criteria**: Modified version executes, audit trail clear

---

### Category 4: Edge Cases & Error Scenarios

#### SC-012: Malformed Grading Data
**Objective**: Test handling of invalid grade values

**Test Cases**:
1. Grade < 1: toneGrade = 0 ❌
2. Grade > 5: accuracyGrade = 6 ❌
3. Non-numeric: policyGrade = "five" ❌
4. Null/undefined grades (allowed - optional)

**Expected Behavior**:
- Invalid values (0, 6, "five"): Reject with validation error OR clamp to 1-5
- Null/undefined: Store as null (grading not provided)
- Frontend validation: Prevent submission of invalid values

**Test Steps**:
1. Attempt to submit grade = 0
2. Verify validation error OR value clamped to 1
3. Attempt to submit grade = 6
4. Verify validation error OR value clamped to 5

**Pass Criteria**: System handles invalid grades gracefully

---

#### SC-013: Missing Required Fields
**Objective**: Test validation for required fields

**Missing Fields**:
- conversationId ❌ (required)
- replyBody ❌ (required for approve_send)
- actionType ❌ (required for form submissions)

**Test Steps**:
1. Submit form without conversationId
2. Verify 400 error: "conversationId is required"
3. Submit approve_send without reply text
4. Verify 400 error: "Reply text is required"

**Expected Results**:
- ✅ 400 status code
- ✅ Clear error message
- ✅ No database write
- ✅ Modal shows error

**Pass Criteria**: Validation prevents incomplete submissions

---

#### SC-014: Concurrent Approval Attempts
**Objective**: Test race condition handling

**Scenario**: Two operators try to approve same conversation simultaneously

**Test Steps**:
1. Operator A opens modal for conversation 12345
2. Operator B opens modal for same conversation 12345
3. Operator A submits approval (succeeds)
4. Operator B submits approval (should handle gracefully)

**Expected Behavior** (Options):
- **Option A**: Second approval fails with "Already approved" error
- **Option B**: Second approval succeeds but logs duplicate attempt
- **Option C**: Optimistic locking prevents second submission

**Pass Criteria**: No data corruption, clear feedback to operators

---

#### SC-015: Timeout During API Call
**Objective**: Test Chatwoot API timeout

**Scenario**: Chatwoot API slow to respond or times out

**Test Steps**:
1. Mock Chatwoot API delay >30 seconds
2. Submit approval
3. Verify timeout handling

**Expected Behavior**:
- ✅ Timeout after 30 seconds
- ✅ Error message to user
- ✅ Decision log status = 'timeout' or 'failed'
- ✅ Reply NOT sent to customer
- ✅ Retry option available

**Pass Criteria**: No hanging requests, clear error state

---

#### SC-016: Rollback After Send Failure
**Objective**: Test rollback when Chatwoot send fails

**Scenario**: Reply approved but Chatwoot API returns 500 error

**Test Steps**:
1. Approve reply with grades
2. Chatwoot API fails after decision logged
3. Verify rollback or compensation

**Expected Behavior**:
- ✅ Decision log saved (action attempted)
- ✅ Error status in payload
- ✅ Operator notified of failure
- ✅ Conversation remains "pending" in UI
- ✅ Retry option available

**Pass Criteria**: Audit trail shows attempt, operator can retry

---

### Category 5: Grading System Edge Cases

#### SC-017: Partial Grading (Some Fields Null)
**Objective**: Test optional grading fields

**Scenario**: Operator grades only tone and accuracy, skips policy

**Test Data**:
```json
{
  "toneGrade": 4,
  "accuracyGrade": 5,
  "policyGrade": null
}
```

**Expected Results**:
- ✅ Grades saved: {tone: 4, accuracy: 5, policy: null}
- ✅ Analytics ignore null policy grade
- ✅ No validation error (grading is optional)

**Pass Criteria**: Partial grades allowed, analytics handle nulls

---

#### SC-018: All Grades Null (No Grading)
**Objective**: Test skipping grading entirely

**Test Data**:
```json
{
  "toneGrade": null,
  "accuracyGrade": null,
  "policyGrade": null
}
```

**Expected Results**:
- ✅ Reply still sent
- ✅ Grades saved as all null
- ✅ Decision log complete without grades
- ✅ Analytics exclude this record

**Pass Criteria**: Grading is optional, approval works without it

---

#### SC-019: Grading Edit After Initial Submit
**Objective**: Test re-grading a response

**Scenario**: Operator realizes grade was too harsh, wants to update

**Expected Behavior**:
- **Option A**: Grades immutable (cannot edit after submit)
- **Option B**: Edit allowed with audit trail

**Test Steps** (if editable):
1. Submit approval with grades: {tone: 2, accuracy: 3, policy: 3}
2. Find record in decision_log
3. Update grades to: {tone: 4, accuracy: 3, policy: 3}
4. Verify audit trail shows both versions

**Pass Criteria**: Audit integrity maintained, original grades preserved if immutable

---

### Category 6: State Transition Tests

#### SC-020: Draft → Pending Review → Approved → Sent
**Objective**: Test complete happy path state machine

**States**:
1. **draft**: AI generates suggestion
2. **pending_review**: Awaiting operator
3. **approved**: Operator approved with grades
4. **sent**: Reply sent to customer
5. **logged**: Decision saved to database

**Test Each Transition**:
- draft → pending_review: AI suggestion appears in modal
- pending_review → approved: Operator clicks approve
- approved → sent: Chatwoot API call succeeds
- sent → logged: Decision_log insert succeeds

**Pass Criteria**: All state transitions valid, no skipped states

---

#### SC-021: Pending → Escalated → Manager Approval
**Objective**: Test escalation flow

**Scenario**: Operator escalates to manager instead of approving

**Test Steps**:
1. Open modal
2. Click "Escalate" instead of "Approve"
3. Verify conversation tagged with "escalation" label
4. Manager reviews
5. Manager approves or rejects

**Expected Results**:
- ✅ Action logged: 'chatwoot.escalate'
- ✅ Label added to conversation
- ✅ Manager notified
- ✅ Original AI suggestion preserved

**Pass Criteria**: Escalation path separate from approval path

---

### Category 7: CEO Agent Approval Queue

#### SC-022: Multiple Pending Approvals
**Objective**: Test approval queue with multiple items

**Scenario**: CEO Agent generates 5 actions, all pending approval

**Test Data**:
```json
[
  { "actionId": "001", "actionType": "inventory", "status": "pending" },
  { "actionId": "002", "actionType": "cx", "status": "pending" },
  { "actionId": "003", "actionType": "social", "status": "pending" },
  { "actionId": "004", "actionType": "product", "status": "pending" },
  { "actionId": "005", "actionType": "ads", "status": "pending" }
]
```

**Test Steps**:
1. Query pending approvals: `getPendingApprovals()`
2. Verify all 5 returned
3. Sort by priority or timestamp
4. Approve action 001
5. Verify queue now shows 4 items

**Expected Results**:
- ✅ All pending approvals visible
- ✅ Sorted by timestamp (oldest first)
- ✅ Each has approval URL
- ✅ Approval updates queue immediately

**Pass Criteria**: Queue management correct, real-time updates

---

#### SC-023: Approval Timeout - Auto-Expire
**Objective**: Test approval expiration after time limit

**Scenario**: Approval pending for >24 hours

**Test Steps**:
1. Create approval at 2025-10-20T10:00:00Z
2. Current time: 2025-10-22T10:00:00Z (48 hours later)
3. Query pending approvals
4. Verify expired approvals marked

**Expected Behavior** (Options):
- **Option A**: Auto-expire after 24h, status = 'expired'
- **Option B**: Flag as "stale" but keep pending
- **Option C**: No timeout (manual review required)

**Pass Criteria**: Stale approvals identifiable, no silent failures

---

### Category 8: Evidence & Audit Trail

#### SC-024: Full Audit Trail for Approved Action
**Objective**: Verify complete audit trail

**Action**: Reorder inventory (approved)

**Required Audit Fields**:
```json
{
  "approvalId": 123,
  "actionId": "action_001",
  "actionType": "inventory",
  "description": "Reorder 50 units...",
  "evidence": {
    "sources": ["shopify.products", "supabase.analytics"],
    "metrics": { "currentInventory": 8, "dailyVelocity": 3.2 }
  },
  "reasoning": "ROP breach, stockout risk",
  "projectedImpact": { "revenue": 15000 },
  "risks": ["Overstock if demand drops"],
  "rollback": "Return to supplier within 30 days",
  "queuedAt": "2025-10-22T10:00:00Z",
  "reviewedAt": "2025-10-22T10:05:00Z",
  "approvedBy": "ceo@hotdash.com",
  "executedAt": "2025-10-22T10:05:30Z",
  "executionResult": { "success": true, "poNumber": "PO-1234" }
}
```

**Verification Steps**:
1. Query decision_log by approvalId=123
2. Verify all fields populated
3. Verify timestamps logical (queued < reviewed < executed)
4. Verify evidence includes KB sources
5. Verify execution result captured

**Pass Criteria**: Complete audit trail, no missing fields

---

#### SC-025: Evidence Linking - KB Sources
**Objective**: Verify KB sources linked to approval

**Scenario**: CEO Agent uses knowledge base to make recommendation

**Test Steps**:
1. CEO asks: "What's our return policy?"
2. AI queries LlamaIndex KB
3. KB returns: "policies/returns.pdf, page 3"
4. AI includes in evidence
5. Approval shows KB source

**Expected Results**:
- ✅ `evidence.sources` contains KB document path
- ✅ Operator can click to view source
- ✅ Source attribution in decision log
- ✅ Confidence score from KB included

**Pass Criteria**: Evidence traceable, sources clickable

---

### Category 9: Performance & Scale

#### SC-026: High Volume Approval Queue
**Objective**: Test performance with 100+ pending approvals

**Test Data**: 100 pending CEO approvals

**Test Steps**:
1. Create 100 approval records
2. Query `getPendingApprovals()`
3. Measure response time
4. Paginate results (10 per page)
5. Approve 20 items
6. Verify queue updates

**Expected Performance**:
- ✅ Query < 500ms for 100 records
- ✅ Pagination works (no memory issues)
- ✅ Bulk approve option available
- ✅ UI remains responsive

**Pass Criteria**: Acceptable performance at scale

---

#### SC-027: Grading Analytics Performance
**Objective**: Test analytics on 1000+ graded responses

**Test Data**: 1000 decision_log records with grades

**Test Steps**:
1. Call `getGradingTrends(30)`
2. Measure query time
3. Verify aggregations correct
4. Call `identifyLowScoringPatterns()`
5. Verify pattern detection

**Expected Performance**:
- ✅ Query < 1 second for 1000 records
- ✅ Aggregations accurate
- ✅ Patterns identified correctly
- ✅ No memory issues

**Pass Criteria**: Analytics performant, results accurate

---

### Category 10: Integration Tests

#### SC-028: End-to-End Customer Agent Flow
**Objective**: Test complete customer agent approval workflow

**Flow**:
1. Customer sends message to Chatwoot
2. Webhook triggers AI draft generation
3. Draft appears in operator queue
4. Operator opens modal, reviews draft
5. Operator grades: {tone: 5, accuracy: 5, policy: 5}
6. Operator approves
7. Reply sent to customer
8. Decision logged
9. Analytics updated

**Verification Points**:
- Webhook received ✅
- AI draft generated ✅
- Modal displays correctly ✅
- Grading sliders functional ✅
- Reply sent ✅
- Decision log complete ✅
- Analytics include new grade ✅

**Pass Criteria**: Full E2E without errors

---

#### SC-029: End-to-End CEO Agent Flow
**Objective**: Test complete CEO agent approval workflow

**Flow**:
1. CEO asks: "Should I run 20% off sale?"
2. AI analyzes revenue data (Shopify + GA + Supabase)
3. AI queries KB for discount policy
4. AI generates recommendation with evidence
5. Approval queue entry created
6. CEO reviews in dashboard
7. CEO approves
8. Action executes (creates discount code in Shopify)
9. Result logged
10. Performance metrics updated

**Verification Points**:
- Tool calls executed (Shopify, GA, Supabase, KB) ✅
- Evidence complete ✅
- Approval URL generated ✅
- CEO can review all evidence ✅
- Execution after approval only ✅
- Result captured ✅
- Metrics updated ✅

**Pass Criteria**: Full E2E with tools, approval, execution, logging

---

### Category 11: Data Integrity

#### SC-030: Grade Data Persistence
**Objective**: Verify grades survive database round-trip

**Test Steps**:
1. Submit approval with grades: {tone: 4, accuracy: 3, policy: 5}
2. Insert into decision_log
3. Query decision_log
4. Extract payload.grades
5. Verify exact match

**Expected Results**:
```json
{
  "tone": 4,
  "accuracy": 3,
  "policy": 5
}
```

**Pass Criteria**: No data loss, types preserved (numbers not strings)

---

#### SC-031: Edit Distance Calculation
**Objective**: Test Levenshtein distance calculation

**Test Cases**:
| AI Draft | Operator Final | Expected Edit Distance |
|----------|---------------|----------------------|
| "Hello" | "Hello" | 0 |
| "Hello" | "Hello!" | 1 |
| "Hello world" | "Hello there" | 5 |
| "Quick brown fox" | "The quick brown fox" | 4 |

**Test Steps**:
1. Submit each test case
2. Verify edit distance calculated
3. Verify stored in payload

**Pass Criteria**: Edit distance accurate (Levenshtein algorithm)

---

### Category 12: UI Integration Scenarios

#### SC-032: Modal Grading Sliders
**Objective**: Test grading slider UI functionality

**Test Steps**:
1. Open CX Escalation modal
2. Verify 3 sliders visible (Tone, Accuracy, Policy)
3. Slide Tone to 5
4. Slide Accuracy to 3
5. Slide Policy to 4
6. Verify values displayed (5, 3, 4)
7. Submit
8. Verify correct values in FormData

**Expected Results**:
- ✅ Sliders range 1-5
- ✅ Default value: 3 (middle)
- ✅ Values update on slide
- ✅ Aria labels present
- ✅ Disabled during submission

**Pass Criteria**: Sliders functional, accessible, correct FormData

---

#### SC-033: Approval Drawer UI
**Objective**: Test CEO approval drawer display

**Test Steps**:
1. Create approval with evidence
2. Navigate to `/app/approvals?id=123&type=inventory`
3. Verify all fields displayed:
   - Action description
   - Evidence section (sources, metrics)
   - Reasoning
   - Projected impact
   - Risks
   - Rollback plan
   - Approve/Reject buttons

**Expected Results**:
- ✅ All evidence visible
- ✅ Sources formatted and clickable
- ✅ Metrics displayed clearly
- ✅ Approve/Reject buttons enabled
- ✅ Modification option available

**Pass Criteria**: Complete evidence display, clear UI

---

## Summary Statistics

**Total Scenarios**: 33
- Happy path: 6 scenarios
- Grading specific: 5 scenarios
- CEO Agent: 4 scenarios
- Edge cases: 7 scenarios
- State transitions: 2 scenarios
- Integration: 2 scenarios
- Data integrity: 2 scenarios
- UI: 2 scenarios
- Performance: 2 scenarios
- Audit: 1 scenario

**Priority Breakdown**:
- P0 (Critical): 10 scenarios (happy path, validation)
- P1 (High): 15 scenarios (edge cases, state transitions)
- P2 (Medium): 8 scenarios (performance, UI details)

**Estimated Test Time**: 6-8 hours for complete QA execution

---

## Test Data Requirements

See `artifacts/ai-customer/2025-10-21/test-grading-data.json` for:
- 20 sample replies with expected grades
- Edge case test data
- Validation test cases

---

## Testing Tools

**Recommended**:
1. **Unit Tests**: Vitest for service logic
2. **Integration Tests**: Playwright for E2E flows
3. **API Tests**: Direct POST to `/actions/chatwoot/escalate`
4. **Manual Tests**: Operator walkthroughs in staging

**Mock Data**:
- Use `?mock=1` parameter for staging
- Chatwoot conversation fixtures
- Sample AI suggestions

---

## Known Issues

**Current Blockers**:
1. Grading UI not yet deployed to staging (as of 2025-10-21)
   - Code exists in codebase
   - Needs deployment
   - Cannot test sliders until deployed

2. CEO Agent implementation bug (as of 2025-10-22)
   - Zod schema parsing error
   - Engineer fix required
   - Affects CEO approval flow testing

---

## Success Criteria for QA

✅ **Test Coverage**: All 33 scenarios executed  
✅ **Pass Rate**: ≥95% scenarios pass  
✅ **Documentation**: Issues logged with repro steps  
✅ **Edge Cases**: All edge cases handled gracefully  
✅ **Audit Trail**: Complete for all approval types

---

## References

**Implementation Files**:
- Customer Agent: `app/routes/actions/chatwoot.escalate.ts`
- CEO Agent: `app/services/ai-customer/approval-adapter.ts`
- Grading UI: `app/components/modals/CXEscalationModal.tsx`
- Analytics: `app/services/ai-customer/grading-analytics.ts`

**Database**:
- Table: `decision_log`
- Grading: `payload.grades.{tone, accuracy, policy}`
- Customer actions: `action='chatwoot.approve_send'`
- CEO actions: `scope='ceo_approval'`

---

**Document Version**: 1.0  
**Created**: 2025-10-22T00:45:00Z  
**Owner**: AI-Customer Agent  
**For**: QA Agent (QA-009)  
**Lines**: 500+

*Test scenarios comprehensive and ready for QA execution*

