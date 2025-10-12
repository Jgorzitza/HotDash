# End-to-End Integration Testing Plan

**Priority**: HIGH - Pre-Launch Validation  
**Estimated Time**: 1 day  
**Assigned To**: Engineer + AI Agent  
**Coordinated By**: AI Agent

---

## Overview

Comprehensive end-to-end testing to validate the complete Agent SDK workflow from customer message to operator approval to response delivery.

**Goal**: Ensure all components work together seamlessly before launch.

---

## Test Environment Setup

### Prerequisites
```bash
# 1. Start all services locally
cd /home/justin/HotDash/hot-dash

# Agent Service
cd apps/agent-service
npm run dev  # Port 3000

# LlamaIndex MCP Server
cd apps/llamaindex-mcp-server
npm run dev  # Port 8080

# Approval Queue UI (when ready)
cd apps/approval-queue-ui
npm run dev  # Port 5173
```

### Environment Variables
```bash
# .env.test
OPENAI_API_KEY=sk-test-...
SUPABASE_URL=https://test.supabase.co
SUPABASE_KEY=eyJ...
CHATWOOT_URL=https://test.chatwoot.com
SHOPIFY_DOMAIN=test-store.myshopify.com
MCP_SERVER_URL=http://localhost:8080
```

---

## Test Scenarios

### Scenario 1: Product Question Flow (30 min)

**User Story**: Customer asks about product specifications, AI generates response with knowledge base citations, operator reviews and approves.

#### Steps:

1. **Customer Message Arrives**
```bash
# Simulate Chatwoot webhook
curl -X POST http://localhost:3000/api/chatwoot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message_created",
    "conversation_id": 1001,
    "content": "What sizes of PTFE hoses do you sell?",
    "sender": {
      "name": "John Smith",
      "email": "john@example.com"
    }
  }'
```

2. **Triage Agent Classification**
- Verify triage agent receives message
- Check intent classification: `PRODUCT_QA`
- Confirm confidence score: High (>90%)
- Validate handoff to Product Q&A agent

**Expected Output**:
```json
{
  "intent": "PRODUCT_QA",
  "confidence": {
    "score": 95,
    "level": "High",
    "reasoning": "Direct product specification question"
  },
  "keyDetails": "Customer asking about PTFE hose sizes",
  "recommendedAgent": "product-qa"
}
```

3. **Product Q&A Agent Processing**
- Verify agent calls `answer_from_docs` tool
- Check RAG query to MCP server
- Validate response includes citations
- Confirm confidence calculation

**Expected MCP Call**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "query_support",
    "arguments": {
      "q": "What sizes of PTFE hoses do you sell?",
      "topK": 3
    }
  }
}
```

**Expected Response**:
```json
{
  "query": "What sizes of PTFE hoses do you sell?",
  "response": "We offer PTFE hoses in AN-6, AN-8, and AN-10 sizes...",
  "sources": [
    {
      "text": "PTFE-lined hoses available in...",
      "metadata": { "url": "hotrodan.com/products/ptfe-hose" },
      "score": 0.95
    }
  ]
}
```

4. **Draft Response Generation**
- Verify complete response draft created
- Check all required sections present
- Validate citations formatted correctly
- Confirm quality scores calculated

**Expected Draft**:
```
Hi John,

We offer PTFE hoses in three sizes:
- AN-6 (3/8" ID): Suitable for most applications
- AN-8 (1/2" ID): Higher flow applications
- AN-10 (5/8" ID): Performance and racing

All feature PTFE liner compatible with fuel, E85, and methanol.

View our complete selection: [link]

Best regards,
[Operator Name]

Sources:
1. PTFE Hose Product Page - hotrodan.com/products/ptfe-hose
```

5. **Approval Queue Submission**
- Verify item appears in approval queue
- Check priority level: Medium
- Confirm all metadata present
- Validate estimated review time

6. **Operator Review & Approval**
- Load item in approval queue UI
- Review draft response
- Verify sources clickable
- Approve without edits

7. **Response Delivery**
- Verify Chatwoot API called
- Check response sent to customer
- Confirm feedback record created
- Validate metrics updated

#### Acceptance Criteria:
- ✅ Message processed in <5 seconds
- ✅ RAG query returns relevant results
- ✅ Draft includes 2+ citations
- ✅ Confidence score matches expectations
- ✅ Approval queue receives item
- ✅ Response delivered to Chatwoot

---

### Scenario 2: Order Status Flow (30 min)

**User Story**: Customer asks about order status, AI looks up order in Shopify, generates status update, operator reviews and approves.

#### Steps:

1. **Customer Message**
```json
{
  "conversation_id": 1002,
  "content": "Where is my order #1234?",
  "sender": {
    "email": "sarah@example.com"
  }
}
```

2. **Triage Classification**
- Intent: `ORDER_SUPPORT`
- Confidence: High
- Handoff to Order Support agent

3. **Order Support Processing**
- Call `shopify_find_orders` tool
- Retrieve order details
- Check tracking status
- Generate status update

**Expected Shopify API Call**:
```graphql
query {
  orders(first: 1, query: "name:1234") {
    edges {
      node {
        id
        name
        displayFinancialStatus
        displayFulfillmentStatus
        tracking {
          number
          url
          company
        }
      }
    }
  }
}
```

4. **Draft Response with Order Info**
```
Hi Sarah,

I found your order #1234! Here's the current status:

Order Status: Fulfilled
Tracking: USPS 9400...
Expected Delivery: Oct 14, 2025

Your package is currently in transit and should arrive within 2 days.
Track your shipment: [tracking link]

Let me know if you have any other questions!
```

5. **Approval & Delivery**

#### Acceptance Criteria:
- ✅ Shopify API queried correctly
- ✅ Order information accurate
- ✅ Tracking details included
- ✅ Response professional and complete

---

### Scenario 3: Low Confidence Escalation (20 min)

**User Story**: Customer asks complex question, AI generates draft with low confidence, operator escalates to specialist.

#### Steps:

1. **Complex Question**
```
"I need a fuel system for a turbocharged LS swap in a 1967 Camaro 
with methanol injection. What do I need and will it work with my 
existing fuel cell?"
```

2. **Processing**
- Multiple RAG queries
- Partial information found
- Confidence: Low (65%)

3. **Draft with Uncertainty Flags**
```
Hi [Customer],

Based on your turbocharged LS swap setup, you'll likely need:
- AN-8 fuel lines for adequate flow
- High-flow fuel pump (recommend 340+ LPH)
- Fuel pressure regulator

However, I need to verify compatibility with your existing fuel cell
and methanol injection setup. Let me connect you with our technical
specialist who can provide a complete recommendation.

[REQUIRES VERIFICATION]
```

4. **Operator Escalates**
- Reviews low confidence score
- Sees verification flag
- Clicks "Escalate to Senior"
- Adds note about complexity

#### Acceptance Criteria:
- ✅ Low confidence detected correctly
- ✅ Verification flags present
- ✅ Escalation workflow works
- ✅ Specialist notified

---

### Scenario 4: Operator Edit & Learn (20 min)

**User Story**: Operator edits AI draft, system learns from modifications.

#### Steps:

1. **AI Draft**
```
We offer three PTFE hose sizes: AN-6, AN-8, and AN-10.
```

2. **Operator Edits**
```
We offer PTFE braided hoses in three popular sizes:
- AN-6 (3/8" ID) - Great for most street applications
- AN-8 (1/2" ID) - Perfect for high-performance builds
- AN-10 (5/8" ID) - Ideal for racing applications

All our PTFE hoses feature stainless steel or nylon braided 
outer covering for durability.
```

3. **Edit Analysis**
- Calculate edit distance
- Identify additions (application examples, feature benefits)
- Classify edit type: "enhancement"
- Store in training data

4. **Feedback Collection**
```json
{
  "item_id": "abc123",
  "original_draft": "...",
  "edited_draft": "...",
  "edit_type": "enhancement",
  "edit_distance": 0.45,
  "operator_note": "Added application examples and features",
  "approved": true
}
```

#### Acceptance Criteria:
- ✅ Edits tracked accurately
- ✅ Edit distance calculated
- ✅ Training data stored
- ✅ Pattern identified for learning

---

### Scenario 5: High Volume Stress Test (45 min)

**User Story**: System handles multiple concurrent approval requests efficiently.

#### Steps:

1. **Generate 20 Test Messages**
```bash
# Use test script
node scripts/generate-test-messages.js --count 20 --types all
```

2. **Monitor Processing**
- All messages classified
- All drafts generated
- All items in queue
- No errors or timeouts

3. **Operator Processes Queue**
- Review priority ordering
- Approve high-confidence items quickly
- Review medium items carefully
- Escalate low-confidence items

4. **Metrics Validation**
- Average processing time <5s
- Queue updates real-time
- No UI lag with 20 items
- All responses delivered

#### Acceptance Criteria:
- ✅ Processes 20 messages without errors
- ✅ Queue remains responsive
- ✅ Priority ordering correct
- ✅ All responses delivered successfully

---

## Performance Benchmarks

### Response Generation
- **Target**: <3 seconds average
- **Method**: Measure from message receipt to draft ready
- **Tools**: Performance monitoring, timestamps

### RAG Query Performance
- **Target**: <2 seconds per query
- **Method**: Measure MCP server response time
- **Tools**: MCP server metrics endpoint

### Approval Queue Load Time
- **Target**: <1 second with 50 items
- **Method**: Measure React render time
- **Tools**: React DevTools Profiler

### End-to-End Latency
- **Target**: <10 seconds from message to approval
- **Method**: Full workflow timing
- **Tools**: Custom telemetry

---

## Error Scenarios

### Test Error Handling

1. **OpenAI API Timeout**
```bash
# Simulate by setting invalid API key temporarily
# Expected: Graceful degradation, manual mode
```

2. **MCP Server Down**
```bash
# Stop MCP server
# Expected: Fallback to manual drafting
```

3. **Shopify API Error**
```bash
# Simulate with invalid credentials
# Expected: Clear error message, escalation option
```

4. **Invalid Customer Message**
```bash
# Send empty or malformed message
# Expected: Validation error, operator notified
```

---

## Integration Tests (Automated)

### File: `tests/e2e/agent-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Agent SDK E2E Workflow', () => {
  test('Product Q&A flow completes successfully', async ({ page }) => {
    // 1. Navigate to approval queue
    await page.goto('http://localhost:5173');
    
    // 2. Simulate incoming message
    await simulateChatwootMessage({
      content: 'What PTFE hoses do you sell?'
    });
    
    // 3. Wait for item to appear in queue
    await page.waitForSelector('[data-testid="queue-item"]');
    
    // 4. Verify item details
    const item = page.locator('[data-testid="queue-item"]').first();
    await expect(item).toContainText('PRODUCT_QA');
    await expect(item).toContainText('High');
    
    // 5. Click to open review panel
    await item.click();
    
    // 6. Verify draft response present
    await expect(page.locator('[data-testid="draft-response"]'))
      .toContainText('AN-6');
    
    // 7. Verify sources listed
    await expect(page.locator('[data-testid="sources"]'))
      .toContainText('hotrodan.com');
    
    // 8. Approve
    await page.click('[data-testid="approve-button"]');
    
    // 9. Verify item removed from queue
    await expect(item).not.toBeVisible();
    
    // 10. Verify response sent
    // Check Chatwoot API was called
  });
  
  test('Low confidence item shows warning', async ({ page }) => {
    // Similar flow but with low confidence message
    // Verify warning indicators present
  });
  
  test('Keyboard shortcuts work', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    
    // Approve with Ctrl+Enter
    await page.keyboard.press('Control+Enter');
    
    // Verify action completed
  });
});
```

---

## Test Execution Plan

### Day 1 Morning (4 hours)
- [ ] Set up test environment
- [ ] Run Scenario 1: Product Question Flow
- [ ] Run Scenario 2: Order Status Flow
- [ ] Document any issues found

### Day 1 Afternoon (4 hours)
- [ ] Run Scenario 3: Low Confidence Escalation
- [ ] Run Scenario 4: Operator Edit & Learn
- [ ] Run Scenario 5: Stress Test
- [ ] Run Error Scenarios

### Day 1 Evening (1 hour)
- [ ] Execute automated test suite
- [ ] Review performance benchmarks
- [ ] Compile test results report
- [ ] Identify any blocking issues

---

## Test Results Template

```markdown
# Agent SDK E2E Test Results
Date: [Date]
Tester: [Name]
Environment: [Local/Staging/Production]

## Test Scenarios

### Scenario 1: Product Question Flow
Status: ✅ PASS / ❌ FAIL
Duration: X seconds
Issues: None / [Description]
Notes: [Any observations]

### Scenario 2: Order Status Flow
Status: ✅ PASS / ❌ FAIL
...

## Performance Benchmarks

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Response Generation | <3s | 2.1s | ✅ |
| RAG Query | <2s | 1.8s | ✅ |
| Queue Load (50 items) | <1s | 0.9s | ✅ |
| End-to-End | <10s | 8.5s | ✅ |

## Blocking Issues

1. [None / List issues]

## Recommendations

1. [List any recommendations]

## Sign-off

Ready for Launch: YES / NO
Tester Signature: [Name]
Date: [Date]
```

---

## Success Criteria

✅ All 5 scenarios pass without errors  
✅ All performance benchmarks met  
✅ Error scenarios handled gracefully  
✅ Automated tests pass (>95% coverage)  
✅ No blocking issues identified  
✅ Documentation updated with findings

---

**Estimated Completion**: 1 full day with 2 engineers (AI Agent + Engineer)  
**Coordination**: Daily standups during testing  
**Blockers**: Escalate to Manager immediately

