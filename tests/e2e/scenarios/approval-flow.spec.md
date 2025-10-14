# E2E Test Scenarios: Approval Flow

**Purpose**: Comprehensive end-to-end test scenarios for operator approval queue  
**Created**: 2025-10-14  
**Owner**: QA Helper (supporting QA agent)

---

## Scenario 1: Basic Approval Workflow

**User Story**: As an operator, I want to review and approve AI-generated responses

### Test Steps:
1. **Setup**: Seed approval queue with 1 pending item
   - Conversation ID: 101
   - Tool: `shopify_search_products`
   - Confidence: 85%
   
2. **Navigate**: Operator opens `/app/approvals`
   
3. **Verify Display**:
   - ✅ Queue shows 1 pending approval
   - ✅ Conversation preview visible
   - ✅ Confidence score displayed
   - ✅ Approve/Reject buttons enabled
   
4. **Approve Action**:
   - Click "Approve" button
   - Confirmation modal appears
   - Click "Confirm Approve"
   
5. **Expected Result**:
   - ✅ Item removed from queue
   - ✅ Success toast notification
   - ✅ Queue count decrements
   - ✅ Action logged to database

### Performance Target:
- Approval action: <500ms
- UI update: <200ms
- Database write: <300ms

### Test Data:
```typescript
import { generateApprovalQueue } from '../../helpers/chatwoot-data-generator';
const testData = generateApprovalQueue(1);
```

---

## Scenario 2: Edit & Approve Workflow

**User Story**: As an operator, I want to edit AI responses before sending

### Test Steps:
1. **Setup**: Seed with approval containing draft text
   
2. **Open Editor**:
   - Click "Edit" button
   - Editor modal opens with draft content
   
3. **Edit Content**:
   - Modify draft text
   - Character count updates
   - Preview shows changes
   
4. **Send Edited**:
   - Click "Send Edited"
   - Confirmation prompt
   - Confirm send
   
5. **Expected Result**:
   - ✅ Edited version sent (not original)
   - ✅ Diff tracked in database
   - ✅ Item removed from queue
   - ✅ Edit metrics logged

### Edge Cases:
- Empty content (should reject)
- Content too long (>2000 chars)
- Cancel edit (return to queue)

---

## Scenario 3: Reject with Reason

**User Story**: As an operator, I want to reject inappropriate AI responses

### Test Steps:
1. **Setup**: Seed with low-confidence approval (30%)
   
2. **Reject Action**:
   - Click "Reject" button
   - Rejection dialog opens
   
3. **Select Reason**:
   - Choose reason: "Inaccurate information"
   - Add notes (optional)
   
4. **Confirm Reject**:
   - Click "Confirm Reject"
   
5. **Expected Result**:
   - ✅ Item removed from queue
   - ✅ Rejection logged with reason
   - ✅ AI training data updated
   - ✅ No message sent to customer

### Rejection Reasons:
- Inaccurate information
- Inappropriate tone
- Missing context
- Policy violation
- Other (requires notes)

---

## Scenario 4: Escalation Workflow

**User Story**: As an operator, I want to escalate complex issues to senior agents

### Test Steps:
1. **Setup**: Seed with complex customer issue
   
2. **Escalate Action**:
   - Click "Escalate" button
   - Escalation dialog opens
   
3. **Assign & Reason**:
   - Select assignee: "Senior Support"
   - Enter escalation reason
   - Set priority: High
   
4. **Confirm Escalation**:
   - Click "Confirm Escalate"
   
5. **Expected Result**:
   - ✅ Item removed from queue
   - ✅ Assignee notified
   - ✅ Conversation tagged
   - ✅ Escalation logged

---

## Scenario 5: Real-Time Queue Updates

**User Story**: As an operator, I want to see new approvals appear automatically

### Test Steps:
1. **Setup**: Operator viewing empty queue
   
2. **Simulate Webhook**:
   - Trigger webhook: POST /api/webhooks/chatwoot
   - AI generates response requiring approval
   
3. **Expected Result**:
   - ✅ New item appears in queue (within 5s)
   - ✅ Visual notification (badge, toast)
   - ✅ Audio alert (optional)
   - ✅ Queue count updates
   
4. **Concurrent Operator Test**:
   - Operator A and B view same queue
   - Operator A approves item
   - Operator B's view updates (item removed)

### Performance Target:
- Webhook → Queue update: <5 seconds
- SSE/WebSocket latency: <1 second

---

## Scenario 6: Performance Benchmarking

**User Story**: Queue must remain performant under load

### Test Conditions:
- 50 pending approvals in queue
- 3 concurrent operators
- Auto-refresh every 5 seconds

### Performance Targets:
- Initial load: <1 second
- Refresh: <500ms
- Approve action: <500ms
- No UI lag/freezing

### Test Steps:
1. Seed 50 approval items
2. Open queue in 3 browser contexts
3. Measure load times
4. Perform actions (approve, reject)
5. Verify performance metrics

---

## Scenario 7: Learning Loop Validation

**User Story**: System improves based on operator feedback

### Test Steps:
1. **Reject Action**: Reject approval with reason "Inaccurate"
   
2. **Verify Logging**:
   - Check decision_log table
   - Verify rejection reason captured
   - Verify conversation context saved
   
3. **Metrics Check**:
   - Query for rejection rate by tool
   - Query for most common rejection reasons
   - Verify data available for AI training

### Expected Data:
```sql
SELECT tool, COUNT(*) as rejections 
FROM decision_log 
WHERE action = 'reject' 
GROUP BY tool;
```

---

## Test Data Sources

**Use Generators**:
```typescript
import { generateApprovalQueue } from '../../helpers/chatwoot-data-generator';
import { generateAllActionTypes } from '../../helpers/actions-data-generator';

const queue = generateApprovalQueue(10); // For queue tests
const actions = generateAllActionTypes(); // For action type coverage
```

---

## Success Criteria

### Functional:
- ✅ All approval actions work (approve, edit, reject, escalate)
- ✅ Real-time updates functional
- ✅ Data persisted correctly
- ✅ Notifications appear

### Performance:
- ✅ Load time <1s
- ✅ Action response <500ms
- ✅ No memory leaks
- ✅ Handles 50+ items smoothly

### UX:
- ✅ Clear visual feedback
- ✅ Error states handled
- ✅ Accessibility compliant (see accessibility.spec.ts)
- ✅ Mobile responsive

---

**Implementation**: QA agent will use these scenarios to build E2E tests  
**Timeline**: 3-4 hours for full test suite  
**Priority**: High - needed for launch validation

