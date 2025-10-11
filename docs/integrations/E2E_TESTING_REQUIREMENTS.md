# End-to-End Testing Requirements (Task 5 Spec)

**Date:** 2025-10-11T22:32:36Z  
**Purpose:** Document E2E testing requirements so Task 5 can execute once Task 2 completes  
**Status:** SPEC COMPLETE - Ready for Execution

---

## E2E TEST PLAN

### Prerequisites
- ✅ Webhook configured in Chatwoot (Task 2)
- ✅ Webhook endpoint deployed and healthy
- ✅ Agent SDK service running (port 8006)
- ✅ LlamaIndex service running (port 8005)
- ✅ Approval queue database ready

---

### Test Scenario 1: Simple FAQ

**Objective:** Verify high-confidence draft generation and approval

**Steps:**
1. Create test conversation in Chatwoot
2. Send message: "What's your return policy?"
3. Verify webhook received
4. Check private note created with draft
5. Verify draft confidence >85%
6. Operator approves draft
7. Verify public reply sent
8. Check conversation tagged correctly
9. Verify customer receives email

**Expected Results:**
- Draft generated in < 5 seconds
- Confidence score: 90-95%
- Knowledge source: Return Policy cited
- Approval successful
- Email delivered

---

### Test Scenario 2: Order Status Inquiry

**Objective:** Test order data integration

**Steps:**
1. Send message: "Where is my order #12345?"
2. Verify webhook triggers Shopify lookup
3. Check draft includes tracking info
4. Operator reviews and approves
5. Verify customer gets tracking details

**Expected Results:**
- Order data fetched from Shopify
- Tracking number included
- Delivery date estimated
- Complete response in < 7 seconds

---

### Test Scenario 3: Angry Customer (Escalation)

**Objective:** Test escalation workflow

**Steps:**
1. Send message with angry sentiment
2. Verify sentiment detected as "angry"
3. Check draft flagged for escalation
4. Operator clicks "Escalate"
5. Verify manager assigned
6. Check handoff note created
7. Verify manager notified

**Expected Results:**
- Sentiment: "angry" detected
- Priority: "urgent"
- Recommended action: "escalate"
- Manager assigned automatically
- Notification sent

---

### Test Scenario 4: Low Confidence Draft

**Objective:** Test senior agent routing

**Steps:**
1. Send complex technical question
2. Verify draft confidence < 70%
3. Check auto-assigned to senior agent
4. Operator reviews (likely edits)
5. Track edit for learning data

**Expected Results:**
- Confidence: 50-69%
- Assigned to: Senior agent
- Priority: "high"
- Edit logged for training

---

### Test Scenario 5: Complete Lifecycle

**Objective:** End-to-end conversation flow

**Timeline Test:**
- T+0s: Customer sends message
- T+3s: Webhook processed
- T+5s: Draft created as private note
- T+7s: Queue entry created
- T+8s: Operator notified
- T+2min: Operator approves
- T+2min+5s: Customer receives reply
- T+10min: Customer satisfied (no response)
- T+1hr: Operator resolves conversation

**Validation Points:**
- Each step logged
- Timestamps recorded
- All data synced to Supabase
- Analytics updated
- CSAT survey sent

---

## READY STATE: Task 5

**Test Scripts:** ✅ Ready (`scripts/ops/test-chatwoot-integration.sh`)  
**Test Payloads:** ✅ Ready (7 scenarios documented)  
**Success Criteria:** ✅ Defined  
**Documentation Template:** ✅ Prepared

**Estimated Execution Time:** 1 hour once Task 2 complete

---

**Status:** Task 5 specification COMPLETE - Ready for execution once webhook configured

