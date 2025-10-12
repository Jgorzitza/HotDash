# Agent SDK Test Strategy

**Created**: 2025-10-12  
**Owner**: QA  
**Status**: Ready for Implementation

---

## Test Plan Overview

### Scope
End-to-end testing of Agent SDK workflow:
```
Chatwoot Conversation → Webhook → Agent SDK → Approval Queue → Operator Action → Response
```

### Testing Layers
1. **Integration Tests** - Webhook processing, agent invocation
2. **E2E Tests** - Full workflow with UI
3. **Security Tests** - Auth, CSRF, rate limiting
4. **Performance Tests** - Load, latency, concurrency

---

## Integration Test Plan

### Test File: `tests/integration/agent-sdk-webhook.spec.ts`

#### Test 1: Webhook Payload Processing
**Scenario**: Chatwoot sends webhook for new conversation

```typescript
describe('Agent SDK Webhook Integration', () => {
  it('processes Chatwoot webhook and creates approval', async () => {
    // Given: Valid Chatwoot webhook payload
    const payload = {
      event: 'conversation_created',
      conversation: {
        id: 12345,
        messages: [
          {
            content: 'How do I track my order?',
            sender_type: 'contact'
          }
        ],
        contact: {
          name: 'John Doe',
          email: 'john@hotrodan.com'
        }
      }
    };
    
    // When: Webhook received
    const response = await fetch('http://localhost:8002/webhooks/chatwoot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Then: Approval created
    expect(response.status).toBe(200);
    const approvals = await fetch('http://localhost:8002/approvals').then(r => r.json());
    expect(approvals.length).toBeGreaterThan(0);
    expect(approvals[0].conversationId).toBe(12345);
  });
});
```

#### Test 2: Agent Tool Execution
**Scenario**: Agent proposes Shopify order lookup

```typescript
it('agent generates Shopify tool call', async () => {
  // Given: Customer inquiry about order
  const inquiry = 'Where is my order #HRA-1001?';
  
  // When: Agent processes
  const result = await agent.process(inquiry);
  
  // Then: Agent proposes Shopify order lookup
  expect(result.tools).toContainEqual({
    name: 'shopify_get_order',
    args: { order_number: 'HRA-1001' }
  });
  expect(result.requiresApproval).toBe(true);
});
```

#### Test 3: Approval State Persistence
**Scenario**: Approval saved to Supabase

```typescript
it('persists approval to database', async () => {
  // Given: Agent SDK creates approval
  const approval = await createApproval({
    conversationId: 12345,
    tool: 'shopify_get_order',
    args: { order_number: 'HRA-1001' }
  });
  
  // When: Query database
  const saved = await supabase
    .from('agent_approvals')
    .select('*')
    .eq('id', approval.id)
    .single();
  
  // Then: Approval persisted correctly
  expect(saved.data).toBeDefined();
  expect(saved.data.status).toBe('pending');
  expect(saved.data.tool).toBe('shopify_get_order');
});
```

#### Test 4: Approve Flow
**Scenario**: Operator approves tool execution

```typescript
it('executes tool after operator approval', async () => {
  // Given: Pending approval
  const approvalId = 'test-approval-001';
  
  // When: Operator approves
  const response = await fetch(`http://localhost:8002/approvals/${approvalId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer operator-token' }
  });
  
  // Then: Tool executed, response sent
  expect(response.status).toBe(200);
  const result = await response.json();
  expect(result.executed).toBe(true);
  expect(result.chatwo ot_message_sent).toBe(true);
});
```

#### Test 5: Reject Flow
**Scenario**: Operator rejects tool execution

```typescript
it('cancels tool after operator rejection', async () => {
  // Given: Pending approval
  const approvalId = 'test-approval-002';
  
  // When: Operator rejects
  const response = await fetch(`http://localhost:8002/approvals/${approvalId}/reject`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer operator-token' },
    body: JSON.stringify({ reason: 'Customer needs escalation' })
  });
  
  // Then: Tool not executed, status updated
  expect(response.status).toBe(200);
  const approval = await getApproval(approvalId);
  expect(approval.status).toBe('rejected');
  expect(approval.executed).toBe(false);
});
```

---

## E2E Test Plan (Playwright)

### Test File: `tests/e2e/approval-queue.spec.ts`

#### Test 1: View Approval Queue
**Scenario**: Operator opens approval queue UI

```typescript
test('operator views pending approvals', async ({ page }) => {
  // Given: Operator logged in
  await page.goto('https://hotdash.app/approvals');
  await page.waitForSelector('[data-testid="approval-queue"]');
  
  // Then: Approvals displayed
  const approvals = await page.locator('[data-testid="approval-card"]').count();
  expect(approvals).toBeGreaterThan(0);
  
  // And: Details visible
  await expect(page.locator('[data-testid="conversation-id"]').first()).toBeVisible();
  await expect(page.locator('[data-testid="tool-name"]').first()).toBeVisible();
});
```

#### Test 2: Approve Action
**Scenario**: Operator clicks approve button

```typescript
test('operator approves agent suggestion', async ({ page }) => {
  // Given: Approval queue with pending item
  await page.goto('https://hotdash.app/approvals');
  const firstApproval = page.locator('[data-testid="approval-card"]').first();
  
  // When: Click approve
  await firstApproval.locator('[data-testid="approve-button"]').click();
  
  // Then: Approval executes
  await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  await expect(page.locator('[data-testid="toast-success"]')).toContainText('Approved');
  
  // And: Approval removed from queue
  await page.waitForTimeout(1000);
  const remainingApprovals = await page.locator('[data-testid="approval-card"]').count();
  expect(remainingApprovals).toBeLessThan(approvals);
});
```

#### Test 3: Reject Action
**Scenario**: Operator clicks reject button

```typescript
test('operator rejects agent suggestion', async ({ page }) => {
  // Given: Approval queue with pending item
  await page.goto('https://hotdash.app/approvals');
  const firstApproval = page.locator('[data-testid="approval-card"]').first();
  
  // When: Click reject
  await firstApproval.locator('[data-testid="reject-button"]').click();
  
  // Then: Rejection confirmed
  await expect(page.locator('[data-testid="toast-warning"]')).toBeVisible();
  await expect(page.locator('[data-testid="toast-warning"]')).toContainText('Rejected');
});
```

#### Test 4: Real-time Updates
**Scenario**: New approval appears without refresh

```typescript
test('real-time approval updates', async ({ page }) => {
  // Given: Approval queue open
  await page.goto('https://hotdash.app/approvals');
  const initialCount = await page.locator('[data-testid="approval-card"]').count();
  
  // When: New webhook received (via API call)
  await fetch('http://localhost:8002/webhooks/chatwoot', {
    method: 'POST',
    body: JSON.stringify(mockWebhookPayload)
  });
  
  // Then: New approval appears without refresh
  await page.waitForTimeout(2000); // Real-time update delay
  const updatedCount = await page.locator('[data-testid="approval-card"]').count();
  expect(updatedCount).toBe(initialCount + 1);
});
```

#### Test 5: Error Handling
**Scenario**: Network error during approval

```typescript
test('handles network errors gracefully', async ({ page }) => {
  // Given: Approval queue open
  await page.goto('https://hotdash.app/approvals');
  
  // When: Approval fails (simulate network error)
  await page.route('**/approvals/*/approve', route => route.abort());
  await page.locator('[data-testid="approve-button"]').first().click();
  
  // Then: Error message displayed
  await expect(page.locator('[data-testid="toast-error"]')).toBeVisible();
  await expect(page.locator('[data-testid="toast-error"]')).toContainText('Failed');
  
  // And: Approval remains in queue
  await expect(page.locator('[data-testid="approval-card"]').first()).toBeVisible();
});
```

---

## Test Data Requirements

### Mock Chatwoot Webhook Payloads

#### Scenario 1: Order Inquiry
```json
{
  "event": "conversation_created",
  "conversation": {
    "id": 10001,
    "status": "open",
    "messages": [{
      "id": 50001,
      "content": "Where is my order #HRA-1234?",
      "sender_type": "contact",
      "created_at": "2025-10-12T10:00:00Z"
    }],
    "contact": {
      "id": 5001,
      "name": "John Doe",
      "email": "john@hotrodan.com"
    }
  }
}
```

#### Scenario 2: Product Question
```json
{
  "event": "conversation_created",
  "conversation": {
    "id": 10002,
    "status": "open",
    "messages": [{
      "id": 50002,
      "content": "Do you have Holley 4-barrel carburetors for 1932 Ford?",
      "sender_type": "contact",
      "created_at": "2025-10-12T10:05:00Z"
    }],
    "contact": {
      "id": 5002,
      "name": "Jane Smith",
      "email": "jane@hotrodan.com"
    }
  }
}
```

#### Scenario 3: Refund Request
```json
{
  "event": "conversation_created",
  "conversation": {
    "id": 10003,
    "status": "open",
    "messages": [{
      "id": 50003,
      "content": "I'd like to return my order and get a refund",
      "sender_type": "contact",
      "created_at": "2025-10-12T10:10:00Z"
    }],
    "contact": {
      "id": 5003,
      "name": "Bob Johnson",
      "email": "bob@hotrodan.com"
    }
  }
}
```

### Mock Agent Responses

#### Tool Call: Shopify Order Lookup
```json
{
  "tool": "shopify_get_order",
  "args": {
    "order_number": "HRA-1234"
  },
  "rationale": "Customer asking about order status",
  "confidence": 0.95
}
```

#### Tool Call: Product Search
```json
{
  "tool": "shopify_search_products",
  "args": {
    "query": "Holley 4-barrel carburetor",
    "filters": {
      "fits_vehicle_years": [1932],
      "fits_makes": ["Ford"]
    }
  },
  "rationale": "Customer looking for specific product",
  "confidence": 0.88
}
```

#### Tool Call: Refund Processing
```json
{
  "tool": "shopify_create_refund",
  "args": {
    "order_id": "gid://shopify/Order/12345",
    "amount": 149.99,
    "reason": "customer_request"
  },
  "rationale": "Customer requested refund",
  "confidence": 0.92,
  "requires_approval": true
}
```

---

## Playwright Test Stubs

### Setup File: `tests/e2e/setup/approval-queue.setup.ts`

```typescript
import { test as setup } from '@playwright/test';

setup('seed approval queue', async ({ request }) => {
  // Create test approvals
  await request.post('http://localhost:8002/test/seed-approvals', {
    data: [
      {
        conversationId: 10001,
        tool: 'shopify_get_order',
        args: { order_number: 'HRA-1234' }
      },
      {
        conversationId: 10002,
        tool: 'shopify_search_products',
        args: { query: 'carburetor' }
      }
    ]
  });
});
```

### Helper Functions: `tests/e2e/helpers/approval-queue.helpers.ts`

```typescript
export async function createMockApproval(page, data) {
  return await page.request.post('http://localhost:8002/test/create-approval', {
    data
  });
}

export async function waitForApprovalCount(page, expectedCount) {
  await page.waitForFunction(
    count => document.querySelectorAll('[data-testid="approval-card"]').length === count,
    expectedCount
  );
}

export async function getApprovalText(page, index = 0) {
  return await page
    .locator('[data-testid="approval-card"]')
    .nth(index)
    .textContent();
}
```

---

## Test Execution Strategy

### Development Phase
1. Run integration tests on every code change
2. Use mock Chatwoot webhooks (no live dependencies)
3. Use in-memory approval queue for speed

### Pre-Merge
1. Full integration test suite (all scenarios)
2. E2E tests with Playwright (critical paths)
3. Performance baseline tests

### Pre-Launch
1. Full test suite (integration + E2E + security)
2. Load testing with concurrent operators
3. Real Chatwoot webhook simulation

---

## Success Criteria

✅ **Integration Tests**: 100% pass rate
✅ **E2E Tests**: All critical workflows automated
✅ **Coverage**: >80% code coverage for Agent SDK
✅ **Performance**: Approval flow <500ms end-to-end
✅ **Security**: All auth/CSRF tests passing

---

## Next Steps

1. **Implement Integration Tests** (Task QV-4)
   - Create test file with all scenarios
   - Run tests, verify passing

2. **Implement E2E Tests** (Task QV-5)
   - Create Playwright tests
   - Add to CI/CD pipeline

3. **Security Testing** (Task QV-6)
   - CSRF protection tests
   - Auth/authorization tests
   - Rate limiting tests

4. **Performance Baseline** (Task QV-7)
   - Measure latencies
   - Document baselines
   - Set up monitoring

---

**Status**: ✅ Test Strategy Complete  
**Evidence**: This document  
**Ready for**: Implementation (Tasks QV-4 and QV-5)


