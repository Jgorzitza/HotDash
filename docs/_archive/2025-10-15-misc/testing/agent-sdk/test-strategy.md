# Agent SDK Test Strategy

**Version**: 1.0  
**Date**: 2025-10-11  
**Owner**: QA Team  
**Status**: Ready for Implementation

---

## Executive Summary

This document defines the comprehensive test strategy for the Agent SDK approval queue integration with Chatwoot. The strategy covers three test layers:

1. **Integration Tests**: Webhook flow (Chatwoot → LlamaIndex → Agent SDK → Approval Queue)
2. **E2E Tests**: Operator approval queue UI and workflows (Playwright)
3. **Security Tests**: CSRF, authentication, input validation, rate limiting

**Test Coverage Target**: >80% code coverage, 100% critical path coverage

---

## Architecture Overview

```
Customer Email
      ↓
  Chatwoot (Fly.io)
      ↓ [webhook: message_created]
  Edge Function (supabase/functions/chatwoot-webhook)
      ├→ LlamaIndex RAG (port 8005) [Knowledge Retrieval]
      ├→ Agent SDK (port 8006) [Draft Generation]
      ├→ Chatwoot API [Create Private Note]
      └→ Supabase DB [Insert Approval Queue]
            ↓ [postgres_changes realtime]
  Approval Queue UI (React Router 7)
      ↓ [operator action]
  Action Processor (approve/edit/escalate/reject)
      ├→ Chatwoot API [Send Reply / Assign Agent]
      ├→ Supabase DB [Update Queue Status]
      └→ Learning Data [Track Outcome]
```

---

## Test Layer 1: Integration Tests (Webhook Flow)

### File: `tests/integration/agent-sdk-webhook.spec.ts`

### Test Scenarios

#### 1.1 Webhook Signature Verification

**Purpose**: Ensure only authentic Chatwoot webhooks are processed

```typescript
describe("Webhook Signature Verification", () => {
  it("should accept valid HMAC-SHA256 signature", async () => {
    const payload = mockChatwootMessageCreated();
    const secret = "test-webhook-secret";
    const signature = generateHmacSignature(payload, secret);

    const response = await POST("/functions/v1/chatwoot-webhook", {
      body: payload,
      headers: {
        "X-Chatwoot-Signature": signature,
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ processed: true });
  });

  it("should reject invalid signature", async () => {
    const payload = mockChatwootMessageCreated();
    const invalidSignature = "invalid-signature-12345";

    const response = await POST("/functions/v1/chatwoot-webhook", {
      body: payload,
      headers: { "X-Chatwoot-Signature": invalidSignature },
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: "Invalid signature" });
  });

  it("should reject missing signature header", async () => {
    const payload = mockChatwootMessageCreated();

    const response = await POST("/functions/v1/chatwoot-webhook", {
      body: payload,
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: "Missing signature" });
  });
});
```

#### 1.2 Event Filtering

**Purpose**: Process only customer messages in open conversations

```typescript
describe("Event Filtering", () => {
  it("should process customer message in open conversation", async () => {
    const payload = mockChatwootMessageCreated({
      event: "message_created",
      message_type: "incoming",
      sender: { type: "contact" },
      conversation: { status: "open" },
    });

    const { processed } = await processWebhook(payload);
    expect(processed).toBe(true);
  });

  it("should skip agent messages", async () => {
    const payload = mockChatwootMessageCreated({
      sender: { type: "agent_bot" },
    });

    const { processed, reason } = await processWebhook(payload);
    expect(processed).toBe(false);
    expect(reason).toBe("skip_agent_message");
  });

  it("should skip resolved conversations", async () => {
    const payload = mockChatwootMessageCreated({
      conversation: { status: "resolved" },
    });

    const { processed, reason } = await processWebhook(payload);
    expect(processed).toBe(false);
    expect(reason).toBe("skip_resolved_conversation");
  });

  it("should skip duplicate processing", async () => {
    const payload = mockChatwootMessageCreated({ id: 12345 });

    // First call
    await processWebhook(payload);

    // Duplicate call
    const { processed, reason } = await processWebhook(payload);
    expect(processed).toBe(false);
    expect(reason).toBe("already_processed");
  });
});
```

#### 1.3 LlamaIndex Knowledge Retrieval

**Purpose**: Query knowledge base and handle responses

```typescript
describe("LlamaIndex Integration", () => {
  it("should retrieve relevant knowledge sources", async () => {
    const customerMessage = "What's your return policy?";

    const knowledge = await queryLlamaIndex(customerMessage);

    expect(knowledge).toBeDefined();
    expect(knowledge.sources).toHaveLength(greaterThan(0));
    expect(knowledge.sources[0]).toMatchObject({
      title: expect.any(String),
      content: expect.any(String),
      relevance: expect.any(Number),
      version: expect.any(String),
    });
  });

  it("should handle empty knowledge results gracefully", async () => {
    const customerMessage = "asdfghjkl random nonsense";

    const knowledge = await queryLlamaIndex(customerMessage);

    expect(knowledge).toBeDefined();
    expect(knowledge.sources).toHaveLength(0);
    expect(knowledge.fallback).toBe(true);
  });

  it("should timeout after 2 seconds", async () => {
    mockLlamaIndexDelay(5000); // 5 second delay

    const result = await queryLlamaIndex("test", { timeout: 2000 });

    expect(result.error).toBe("timeout");
    expect(result.fallback).toBe(true);
  });

  it("should handle LlamaIndex service unavailable", async () => {
    mockLlamaIndexOffline();

    const result = await queryLlamaIndex("test");

    expect(result.error).toBe("service_unavailable");
    expect(result.fallback).toBe(true);
  });
});
```

#### 1.4 Agent SDK Draft Generation

**Purpose**: Generate draft responses with confidence scores

```typescript
describe("Agent SDK Draft Generation", () => {
  it("should generate high-confidence draft (>80%)", async () => {
    const context = {
      customer_message: "What's your return policy?",
      knowledge: mockKnowledgeSources(["return_policy"]),
      customer: { name: "John Doe", email: "john@example.com" },
    };

    const draft = await generateDraft(context);

    expect(draft).toMatchObject({
      draft_response: expect.stringContaining("return"),
      confidence_score: expect.toBeGreaterThan(80),
      recommended_action: "approve",
      sources: expect.any(Array),
      sentiment: expect.objectContaining({
        customer_sentiment: expect.any(String),
        urgency: expect.any(String),
      }),
    });
  });

  it("should generate low-confidence draft (<70%) with escalation recommendation", async () => {
    const context = {
      customer_message: "I'm extremely upset and want a refund NOW!",
      knowledge: mockKnowledgeSources([]),
      customer: { complaint_history: 3 },
    };

    const draft = await generateDraft(context);

    expect(draft.confidence_score).toBeLessThan(70);
    expect(draft.recommended_action).toBe("escalate");
    expect(draft.sentiment.customer_sentiment).toBe("angry");
    expect(draft.sentiment.urgency).toBe("high");
  });

  it("should handle Agent SDK service timeout", async () => {
    mockAgentSDKDelay(10000);

    const result = await generateDraft(mockContext(), { timeout: 3000 });

    expect(result.error).toBe("timeout");
    expect(result.fallback_draft).toBeDefined();
  });

  it("should handle OpenAI rate limit", async () => {
    mockAgentSDKError({ status: 429, message: "Rate limit exceeded" });

    const result = await generateDraft(mockContext());

    expect(result.error).toBe("rate_limit");
    expect(result.retry_after).toBeGreaterThan(0);
  });
});
```

#### 1.5 Chatwoot Private Note Creation

**Purpose**: Create draft as private note visible to agents only

```typescript
describe("Chatwoot Private Note Creation", () => {
  it("should create formatted private note with draft", async () => {
    const draft = mockAgentSDKDraft({
      confidence_score: 85,
      draft_response: "Test draft response",
      sources: [{ title: "Return Policy", relevance: 0.92 }],
    });

    const note = await createPrivateNote(12345, draft);

    expect(note).toMatchObject({
      id: expect.any(Number),
      content: expect.stringContaining("AGENT SDK DRAFT"),
      content: expect.stringContaining("Confidence: 85%"),
      content: expect.stringContaining("Test draft response"),
      content: expect.stringContaining("Return Policy"),
      private: true,
      message_type: 0,
    });
  });

  it("should handle Chatwoot API error", async () => {
    mockChatwootAPIError(500);

    const result = await createPrivateNote(12345, mockDraft());

    expect(result.error).toBe("chatwoot_api_error");
    expect(result.retry).toBe(true);
  });

  it("should format low-confidence warning in note", async () => {
    const draft = mockAgentSDKDraft({ confidence_score: 45 });

    const note = await createPrivateNote(12345, draft);

    expect(note.content).toContain("⚠️ **LOW CONFIDENCE**");
    expect(note.content).toContain("Review carefully or escalate");
  });
});
```

#### 1.6 Approval Queue Insertion

**Purpose**: Insert queue entry with all metadata

```typescript
describe("Approval Queue Database Insertion", () => {
  it("should insert complete queue entry", async () => {
    const queueData = {
      conversation_id: 12345,
      chatwoot_message_id: 67890,
      customer_name: "John Doe",
      customer_email: "john@example.com",
      customer_message: "What is your return policy?",
      draft_response: "Our return policy allows...",
      confidence_score: 85,
      knowledge_sources: [{ title: "Return Policy" }],
      recommended_action: "approve",
      priority: "normal",
    };

    const inserted = await insertApprovalQueue(queueData);

    expect(inserted).toMatchObject({
      id: expect.any(String),
      status: "pending",
      created_at: expect.any(String),
      ...queueData,
    });
  });

  it("should set priority to urgent for high-urgency cases", async () => {
    const queueData = mockQueueData({
      sentiment: { urgency: "high", customer_sentiment: "angry" },
    });

    const inserted = await insertApprovalQueue(queueData);

    expect(inserted.priority).toBe("urgent");
  });

  it("should handle duplicate conversation_id gracefully", async () => {
    await insertApprovalQueue({ conversation_id: 99999 });

    const result = await insertApprovalQueue({ conversation_id: 99999 });

    expect(result.error).toBe("duplicate_conversation");
  });

  it("should trigger realtime notification on insert", async () => {
    const realtimeListener = jest.fn();
    subscribeToApprovalQueue(realtimeListener);

    await insertApprovalQueue(mockQueueData());

    await waitFor(() => {
      expect(realtimeListener).toHaveBeenCalledWith(
        expect.objectContaining({ event: "INSERT" }),
      );
    });
  });
});
```

#### 1.7 End-to-End Webhook Flow

**Purpose**: Test complete pipeline from webhook to queue

```typescript
describe("End-to-End Webhook Flow", () => {
  it("should process webhook from start to finish", async () => {
    const payload = mockChatwootMessageCreated({
      conversation: { id: 12345 },
      message: { content: "What's your return policy?" },
    });

    const response = await POST("/functions/v1/chatwoot-webhook", {
      body: payload,
      headers: { "X-Chatwoot-Signature": validSignature(payload) },
    });

    expect(response.status).toBe(200);

    // Verify knowledge was queried
    expect(mockLlamaIndex).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.stringContaining("return") }),
    );

    // Verify draft was generated
    expect(mockAgentSDK).toHaveBeenCalledWith(
      expect.objectContaining({ customer_message: expect.any(String) }),
    );

    // Verify private note was created
    expect(mockChatwootAPI.createPrivateNote).toHaveBeenCalledWith(
      12345,
      expect.stringContaining("AGENT SDK DRAFT"),
    );

    // Verify queue entry was created
    const queueItems = await supabase
      .from("agent_sdk_approval_queue")
      .select("*")
      .eq("conversation_id", 12345);

    expect(queueItems.data).toHaveLength(1);
    expect(queueItems.data[0]).toMatchObject({
      status: "pending",
      confidence_score: expect.any(Number),
    });
  });

  it("should complete flow in <3 seconds (performance)", async () => {
    const start = Date.now();

    const payload = mockChatwootMessageCreated();
    await POST("/functions/v1/chatwoot-webhook", {
      body: payload,
      headers: { "X-Chatwoot-Signature": validSignature(payload) },
    });

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });
});
```

---

## Test Layer 2: E2E Tests (Approval Queue UI)

### File: `tests/e2e/approval-queue.spec.ts`

### Test Scenarios

#### 2.1 Queue Display & Navigation

**Purpose**: Operator can view and navigate the approval queue

```typescript
describe("Approval Queue Display", () => {
  test("should display pending queue items", async ({ page }) => {
    await seedApprovalQueue([
      { id: "item-1", conversation_id: 101, confidence_score: 85 },
      { id: "item-2", conversation_id: 102, confidence_score: 45 },
    ]);

    await page.goto("/app/approvals");

    await expect(page.locator('[data-testid="queue-item"]')).toHaveCount(2);
    await expect(page.locator("text=Conversation #101")).toBeVisible();
    await expect(page.locator("text=Confidence: 85%")).toBeVisible();
  });

  test("should show urgent items first", async ({ page }) => {
    await seedApprovalQueue([
      { id: "normal", priority: "normal", created_at: "2025-10-11T10:00:00Z" },
      { id: "urgent", priority: "urgent", created_at: "2025-10-11T10:05:00Z" },
    ]);

    await page.goto("/app/approvals");

    const firstItem = page.locator('[data-testid="queue-item"]').first();
    await expect(firstItem).toContainText("URGENT");
  });

  test("should filter by priority", async ({ page }) => {
    await page.goto("/app/approvals");

    await page.selectOption('[data-testid="priority-filter"]', "urgent");

    await expect(page.locator('[data-testid="queue-item"]')).toHaveCount(2);
    await expect(page.locator("text=🚨 URGENT")).toHaveCount(2);
  });

  test("should show realtime updates when new items arrive", async ({
    page,
  }) => {
    await page.goto("/app/approvals");

    const initialCount = await page
      .locator('[data-testid="queue-item"]')
      .count();

    // Simulate new webhook creating queue item
    await insertApprovalQueue(mockQueueData());

    await page.waitForSelector('[data-testid="notification-toast"]');
    await expect(page.locator("text=New Draft Ready")).toBeVisible();

    const newCount = await page.locator('[data-testid="queue-item"]').count();
    expect(newCount).toBe(initialCount + 1);
  });
});
```

#### 2.2 Approve Action

**Purpose**: Operator can approve drafts and send to customer

```typescript
describe("Approve Action", () => {
  test("should approve draft and send reply", async ({ page }) => {
    const queueItem = await seedApprovalQueue([
      {
        id: "test-item-1",
        conversation_id: 201,
        draft_response: "Test draft response",
        confidence_score: 88,
      },
    ]);

    await page.goto("/app/approvals");

    await page.click('[data-testid="approve-button-test-item-1"]');
    await page.click('[data-testid="confirm-approve"]');

    // Verify UI feedback
    await expect(page.locator("text=Approved successfully")).toBeVisible();

    // Verify queue item removed
    await expect(
      page.locator('[data-testid="queue-item-test-item-1"]'),
    ).not.toBeVisible();

    // Verify database updated
    const updated = await supabase
      .from("agent_sdk_approval_queue")
      .select("status, operator_action")
      .eq("id", "test-item-1")
      .single();

    expect(updated.data).toMatchObject({
      status: "approved",
      operator_action: "approve",
    });

    // Verify Chatwoot API called
    expect(mockChatwootAPI.sendReply).toHaveBeenCalledWith(
      201,
      "Test draft response",
    );
  });

  test("should show confirmation modal before approving", async ({ page }) => {
    await seedApprovalQueue([{ id: "test-confirm" }]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="approve-button-test-confirm"]');

    await expect(
      page.locator('[data-testid="confirmation-modal"]'),
    ).toBeVisible();
    await expect(
      page.locator("text=Send this response to the customer?"),
    ).toBeVisible();
  });

  test("should handle approve API error gracefully", async ({ page }) => {
    mockChatwootAPIError(500);
    await seedApprovalQueue([{ id: "error-test" }]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="approve-button-error-test"]');
    await page.click('[data-testid="confirm-approve"]');

    await expect(page.locator("text=Error sending reply")).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test("should track approve action metrics", async ({ page }) => {
    await seedApprovalQueue([
      { id: "metrics-test", created_at: new Date(Date.now() - 120000) },
    ]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="approve-button-metrics-test"]');
    await page.click('[data-testid="confirm-approve"]');

    const metrics = await getMetrics("agent_sdk_approval");
    expect(metrics).toMatchObject({
      action: "approve",
      time_to_review_seconds: expect.toBeGreaterThan(100),
    });
  });
});
```

#### 2.3 Edit & Approve Action

**Purpose**: Operator can edit draft before sending

```typescript
describe("Edit & Approve Action", () => {
  test("should open editor with draft content", async ({ page }) => {
    await seedApprovalQueue([
      {
        id: "edit-test",
        draft_response: "Original draft content",
      },
    ]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="edit-button-edit-test"]');

    await expect(page.locator('[data-testid="draft-editor"]')).toBeVisible();
    const editorContent = await page.inputValue('[data-testid="draft-editor"]');
    expect(editorContent).toBe("Original draft content");
  });

  test("should send edited version and track diff", async ({ page }) => {
    await seedApprovalQueue([
      {
        id: "edit-send-test",
        draft_response: "Original draft",
      },
    ]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="edit-button-edit-send-test"]');

    await page.fill(
      '[data-testid="draft-editor"]',
      "Edited draft with changes",
    );
    await page.click('[data-testid="send-edited-button"]');

    // Verify edited version sent
    expect(mockChatwootAPI.sendReply).toHaveBeenCalledWith(
      expect.any(Number),
      "Edited draft with changes",
    );

    // Verify edit diff tracked
    const learningData = await supabase
      .from("agent_sdk_learning_data")
      .select("*")
      .eq("queue_item_id", "edit-send-test")
      .single();

    expect(learningData.data).toMatchObject({
      agent_draft: "Original draft",
      operator_version: "Edited draft with changes",
      operator_action: "edit",
      edit_diff: expect.any(Object),
    });
  });

  test("should validate edited content is not empty", async ({ page }) => {
    await seedApprovalQueue([{ id: "validate-test" }]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="edit-button-validate-test"]');

    await page.fill('[data-testid="draft-editor"]', "");
    await page.click('[data-testid="send-edited-button"]');

    await expect(page.locator("text=Response cannot be empty")).toBeVisible();
  });

  test("should allow canceling edit and return to queue", async ({ page }) => {
    await seedApprovalQueue([{ id: "cancel-test" }]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="edit-button-cancel-test"]');

    await page.fill('[data-testid="draft-editor"]', "Some edits");
    await page.click('[data-testid="cancel-edit-button"]');

    await expect(
      page.locator('[data-testid="draft-editor"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid="queue-item-cancel-test"]'),
    ).toBeVisible();
  });
});
```

#### 2.4 Escalate Action

**Purpose**: Operator can escalate to senior support

```typescript
describe("Escalate Action", () => {
  test("should show escalation dialog with assignee selection", async ({
    page,
  }) => {
    await seedApprovalQueue([{ id: "escalate-test" }]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="escalate-button-escalate-test"]');

    await expect(
      page.locator('[data-testid="escalation-dialog"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="assignee-select"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="escalation-reason-input"]'),
    ).toBeVisible();
  });

  test("should escalate with reason and assign agent", async ({ page }) => {
    await seedApprovalQueue([
      {
        id: "escalate-assign-test",
        conversation_id: 301,
      },
    ]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="escalate-button-escalate-assign-test"]');

    await page.selectOption('[data-testid="assignee-select"]', "42"); // Senior agent ID
    await page.fill(
      '[data-testid="escalation-reason-input"]',
      "Customer extremely upset, needs manager",
    );
    await page.click('[data-testid="confirm-escalate"]');

    // Verify Chatwoot assignment
    expect(mockChatwootAPI.assignAgent).toHaveBeenCalledWith(301, 42);
    expect(mockChatwootAPI.addLabel).toHaveBeenCalledWith(301, "escalated");

    // Verify handoff note created
    expect(mockChatwootAPI.createPrivateNote).toHaveBeenCalledWith(
      301,
      expect.stringContaining("ESCALATED from Agent SDK"),
    );
  });

  test("should create notification for assigned agent", async ({ page }) => {
    await seedApprovalQueue([{ id: "notify-test", conversation_id: 302 }]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="escalate-button-notify-test"]');
    await page.selectOption('[data-testid="assignee-select"]', "99");
    await page.fill('[data-testid="escalation-reason-input"]', "Complex case");
    await page.click('[data-testid="confirm-escalate"]');

    const notifications = await supabase
      .from("agent_sdk_notifications")
      .select("*")
      .eq("conversation_id", 302)
      .eq("type", "escalation");

    expect(notifications.data).toHaveLength(1);
    expect(notifications.data[0]).toMatchObject({
      recipient_user_id: "99",
      priority: "high",
    });
  });
});
```

#### 2.5 Reject Action

**Purpose**: Operator can reject drafts for manual handling

```typescript
describe("Reject Action", () => {
  test("should show rejection reason dialog", async ({ page }) => {
    await seedApprovalQueue([{ id: "reject-test" }]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="reject-button-reject-test"]');

    await expect(
      page.locator('[data-testid="rejection-dialog"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="rejection-reason-select"]'),
    ).toBeVisible();
  });

  test("should reject with reason and log for improvement", async ({
    page,
  }) => {
    await seedApprovalQueue([
      {
        id: "reject-log-test",
        draft_response: "Incorrect draft",
      },
    ]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="reject-button-reject-log-test"]');
    await page.selectOption(
      '[data-testid="rejection-reason-select"]',
      "factually_incorrect",
    );
    await page.fill(
      '[data-testid="rejection-notes"]',
      "Wrong product information",
    );
    await page.click('[data-testid="confirm-reject"]');

    // Verify queue status
    const updated = await supabase
      .from("agent_sdk_approval_queue")
      .select("*")
      .eq("id", "reject-log-test")
      .single();

    expect(updated.data).toMatchObject({
      status: "rejected",
      operator_action: "reject",
      operator_notes: "Wrong product information",
    });

    // Verify learning data logged
    const learningData = await supabase
      .from("agent_sdk_learning_data")
      .select("*")
      .eq("queue_item_id", "reject-log-test")
      .single();

    expect(learningData.data).toMatchObject({
      operator_action: "reject",
      feedback_notes: "factually_incorrect: Wrong product information",
    });
  });

  test("should require rejection reason", async ({ page }) => {
    await seedApprovalQueue([{ id: "require-reason-test" }]);

    await page.goto("/app/approvals");
    await page.click('[data-testid="reject-button-require-reason-test"]');
    await page.click('[data-testid="confirm-reject"]');

    await expect(
      page.locator("text=Please select a rejection reason"),
    ).toBeVisible();
  });
});
```

#### 2.6 Real-Time Updates

**Purpose**: UI updates automatically when queue changes

```typescript
describe("Real-Time Updates", () => {
  test("should receive notification for new queue items", async ({ page }) => {
    await page.goto("/app/approvals");

    // Simulate webhook creating new item
    await insertApprovalQueue({
      conversation_id: 999,
      customer_message: "New urgent message",
      priority: "urgent",
    });

    await page.waitForSelector('[data-testid="notification-toast"]');
    await expect(page.locator("text=New Draft Ready")).toBeVisible();
    await expect(page.locator("text=Conversation #999")).toBeVisible();
  });

  test("should remove item from queue when approved by another operator", async ({
    page,
  }) => {
    const queueItem = await seedApprovalQueue([
      {
        id: "concurrent-test",
        conversation_id: 888,
      },
    ]);

    await page.goto("/app/approvals");
    await expect(
      page.locator('[data-testid="queue-item-concurrent-test"]'),
    ).toBeVisible();

    // Simulate another operator approving
    await supabase
      .from("agent_sdk_approval_queue")
      .update({ status: "approved", operator_id: "other-operator" })
      .eq("id", "concurrent-test");

    await page.waitForTimeout(1000); // Allow realtime to propagate
    await expect(
      page.locator('[data-testid="queue-item-concurrent-test"]'),
    ).not.toBeVisible();
  });

  test("should show urgent alert modal for high-priority items", async ({
    page,
  }) => {
    await page.goto("/app/approvals");

    // Simulate urgent notification
    await supabase.from("agent_sdk_notifications").insert({
      type: "urgent_review_needed",
      conversation_id: 777,
      priority: "urgent",
    });

    await page.waitForSelector('[data-testid="urgent-alert-modal"]');
    await expect(page.locator("text=🚨 URGENT REVIEW NEEDED")).toBeVisible();
    await expect(page.locator("text=Conversation #777")).toBeVisible();
  });
});
```

---

## Test Layer 3: Security Tests

### File: `tests/security/agent-sdk-security.spec.ts`

### Test Scenarios

#### 3.1 CSRF Protection

```typescript
describe("CSRF Protection", () => {
  test("should reject requests without CSRF token", async () => {
    const response = await POST("/api/approvals/approve", {
      body: { queueItemId: "test-123" },
    });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("CSRF token missing");
  });

  test("should accept requests with valid CSRF token", async () => {
    const csrfToken = await getCSRFToken();

    const response = await POST("/api/approvals/approve", {
      body: { queueItemId: "test-123" },
      headers: { "X-CSRF-Token": csrfToken },
    });

    expect(response.status).not.toBe(403);
  });
});
```

#### 3.2 Authentication & Authorization

```typescript
describe("Authentication & Authorization", () => {
  test("should require authentication for approval endpoints", async () => {
    const response = await GET("/api/approvals/queue");

    expect(response.status).toBe(401);
  });

  test("should verify operator can only update items they claim", async () => {
    const queueItem = await seedApprovalQueue([
      {
        id: "auth-test",
        operator_id: "operator-1",
      },
    ]);

    const response = await POST("/api/approvals/approve", {
      body: { queueItemId: "auth-test" },
      authAs: "operator-2",
    });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Not authorized");
  });

  test("should allow operators to view all pending items", async () => {
    await seedApprovalQueue([
      { id: "item-1", status: "pending" },
      { id: "item-2", status: "pending" },
    ]);

    const response = await GET("/api/approvals/queue", {
      authAs: "any-operator",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
  });
});
```

#### 3.3 Input Validation

```typescript
describe("Input Validation & Sanitization", () => {
  test("should sanitize XSS in edited response", async () => {
    const xssPayload = '<script>alert("xss")</script>Hello';

    const response = await POST("/api/approvals/edit-approve", {
      body: {
        queueItemId: "xss-test",
        editedResponse: xssPayload,
      },
      authAs: "operator-1",
    });

    expect(mockChatwootAPI.sendReply).toHaveBeenCalledWith(
      expect.any(Number),
      expect.not.stringContaining("<script>"),
    );
  });

  test("should reject SQL injection in queue filters", async () => {
    const sqlInjection = "'; DROP TABLE agent_sdk_approval_queue; --";

    const response = await GET(
      `/api/approvals/queue?priority=${encodeURIComponent(sqlInjection)}`,
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid filter value");
  });

  test("should validate conversation_id format", async () => {
    const response = await POST("/functions/v1/chatwoot-webhook", {
      body: { conversation: { id: "not-a-number" } },
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Invalid conversation_id");
  });
});
```

#### 3.4 Rate Limiting

```typescript
describe("Rate Limiting", () => {
  test("should rate limit webhook endpoint", async () => {
    const payload = mockChatwootMessageCreated();

    // Send 100 requests in quick succession
    const promises = Array.from({ length: 100 }, () =>
      POST("/functions/v1/chatwoot-webhook", {
        body: payload,
        headers: { "X-Chatwoot-Signature": validSignature(payload) },
      }),
    );

    const responses = await Promise.all(promises);
    const tooManyRequests = responses.filter((r) => r.status === 429);

    expect(tooManyRequests.length).toBeGreaterThan(0);
  });

  test("should rate limit approval actions per operator", async () => {
    await seedApprovalQueue(
      Array.from({ length: 50 }, (_, i) => ({
        id: `rate-limit-${i}`,
      })),
    );

    // Attempt to approve 50 items rapidly
    const promises = Array.from({ length: 50 }, (_, i) =>
      POST("/api/approvals/approve", {
        body: { queueItemId: `rate-limit-${i}` },
        authAs: "operator-1",
      }),
    );

    const responses = await Promise.all(promises);
    const rateLimited = responses.filter((r) => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

---

## Test Data Requirements

### Mock Data Fixtures

#### Chatwoot Webhook Payload

```typescript
export function mockChatwootMessageCreated(overrides = {}): ChatwootWebhook {
  return {
    event: "message_created",
    id: Math.floor(Math.random() * 100000),
    message_type: "incoming",
    content: "What is your return policy?",
    created_at: new Date().toISOString(),
    inbox: {
      id: 1,
      name: "Support Inbox",
    },
    conversation: {
      id: Math.floor(Math.random() * 1000),
      status: "open",
      messages: [],
      ...overrides.conversation,
    },
    sender: {
      id: 123,
      name: "John Doe",
      email: "john@example.com",
      type: "contact",
      ...overrides.sender,
    },
    account: {
      id: 1,
      name: "HotDash",
    },
    ...overrides,
  };
}
```

#### Agent SDK Draft Response

```typescript
export function mockAgentSDKDraft(overrides = {}): AgentSDKDraft {
  return {
    draft_response: "Our return policy allows returns within 30 days...",
    confidence_score: 85,
    recommended_action: "approve",
    sources: [
      {
        title: "Return Policy",
        version: "v2.1",
        relevance: 0.92,
        content: "Full return policy text...",
      },
    ],
    suggested_tags: ["return_policy", "customer_inquiry"],
    sentiment: {
      customer_sentiment: "neutral",
      urgency: "medium",
    },
    ...overrides,
  };
}
```

#### Approval Queue Item

```typescript
export function mockQueueData(overrides = {}): QueueItem {
  return {
    id: `queue-${Date.now()}`,
    conversation_id: Math.floor(Math.random() * 10000),
    customer_name: "Test Customer",
    customer_email: "test@example.com",
    customer_message: "Test customer message",
    draft_response: "Test draft response",
    confidence_score: 80,
    knowledge_sources: [],
    recommended_action: "approve",
    priority: "normal",
    status: "pending",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
```

### Database Seed Scripts

#### `scripts/testing/seed-approval-queue.ts`

```typescript
export async function seedApprovalQueue(
  items: Partial<QueueItem>[],
): Promise<QueueItem[]> {
  const { data, error } = await supabase
    .from("agent_sdk_approval_queue")
    .insert(
      items.map((item) => ({
        ...mockQueueData(),
        ...item,
      })),
    )
    .select();

  if (error) throw error;
  return data;
}

export async function clearApprovalQueue(): Promise<void> {
  await supabase
    .from("agent_sdk_approval_queue")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
}
```

---

## Test Execution Plan

### Phase 1: Integration Tests (Week 1)

- **Day 1**: Set up test infrastructure, mock services
- **Day 2-3**: Implement webhook flow tests (1.1-1.6)
- **Day 4**: Implement end-to-end flow tests (1.7)
- **Day 5**: Run full suite, fix failures

### Phase 2: E2E Tests (Week 2)

- **Day 6-7**: Implement queue display and approve tests (2.1-2.2)
- **Day 8**: Implement edit and escalate tests (2.3-2.4)
- **Day 9**: Implement reject and realtime tests (2.5-2.6)
- **Day 10**: Run full suite, capture screenshots

### Phase 3: Security Tests (Week 3)

- **Day 11-12**: Implement security test suite (3.1-3.4)
- **Day 13**: Penetration testing
- **Day 14**: Security audit report
- **Day 15**: Fix vulnerabilities, re-test

---

## Success Criteria

### Code Coverage

- **Target**: >80% overall
- **Critical Paths**: 100% coverage
  - Webhook signature verification
  - Approval actions (approve, edit, escalate, reject)
  - Database insertions/updates

### Test Performance

- **Integration Tests**: < 30 seconds total
- **E2E Tests**: < 5 minutes total
- **Security Tests**: < 10 minutes total

### Reliability

- **Flakiness**: < 1% failure rate
- **CI/CD**: All tests pass on every PR
- **Mock Data**: Deterministic, no external dependencies

---

## Coordination with Engineering

### Test Implementation Checklist

- [ ] QA creates test stubs (this document)
- [ ] Engineer implements Agent SDK endpoints
- [ ] QA fills in test implementations
- [ ] Engineer fixes failing tests
- [ ] QA runs full suite and documents results
- [ ] Both sign off on test coverage

### Communication Protocol

- **Daily Standup**: Share test progress and blockers
- **Slack Channel**: #agent-sdk-testing
- **Test Failures**: Tag @engineer immediately
- **Coverage Reports**: Posted daily to #qa-metrics

---

## Appendix: Test Utilities

### Mock Service Generators

```typescript
// LlamaIndex Mock
export function mockLlamaIndexService() {
  return {
    query: jest.fn().mockResolvedValue({
      sources: [mockKnowledgeSource()],
      relevance: 0.9,
    }),
  };
}

// Agent SDK Mock
export function mockAgentSDKService() {
  return {
    generateDraft: jest.fn().mockResolvedValue(mockAgentSDKDraft()),
  };
}

// Chatwoot API Mock
export function mockChatwootClient() {
  return {
    sendReply: jest.fn().mockResolvedValue({ id: 123 }),
    createPrivateNote: jest.fn().mockResolvedValue({ id: 456 }),
    assignAgent: jest.fn().mockResolvedValue({ success: true }),
    addLabel: jest.fn().mockResolvedValue({ success: true }),
  };
}
```

### Assertion Helpers

```typescript
// Wait for database update
export async function waitForQueueStatus(
  id: string,
  status: string,
  timeout = 5000,
) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const { data } = await supabase
      .from("agent_sdk_approval_queue")
      .select("status")
      .eq("id", id)
      .single();

    if (data?.status === status) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timeout waiting for status ${status}`);
}

// Verify Chatwoot API called correctly
export function expectChatwootReply(conversationId: number, content: string) {
  expect(mockChatwootAPI.sendReply).toHaveBeenCalledWith(
    conversationId,
    expect.stringContaining(content),
  );
}
```

---

**End of Test Strategy Document**

**Next Steps**:

1. Review with @engineer for technical feasibility
2. Create test stub files (tests/integration/, tests/e2e/, tests/security/)
3. Set up mock services and fixtures
4. Begin implementation in parallel with Agent SDK development

**Questions/Blockers**: Log in feedback/qa.md with tag @engineer
