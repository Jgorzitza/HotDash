---
epoch: 2025.10.E1
doc: docs/agent-sdk-llamaindex-integration.md
owner: ai
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Agent SDK + LlamaIndex MCP Integration Guide

**Audience:** Engineer Agent, Agent SDK developers  
**Purpose:** Complete guide for integrating OpenAI Agent SDK with LlamaIndex RAG MCP  
**Status:** Production ready

---

## Overview

This guide demonstrates how OpenAI Agent SDK agents call the LlamaIndex RAG MCP server to answer customer questions using HotDash's knowledge base.

**Architecture:**

```
Customer Question
      ↓
Chatwoot Webhook
      ↓
Agent SDK Service
      ↓
LlamaIndex MCP Server (Fly.io)
      ↓
Vector Search + OpenAI
      ↓
Response with Citations
      ↓
Approval Queue (if needed)
      ↓
Customer Reply
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd apps/agent-service
npm install @openai/agents zod
```

### 2. Configure MCP Connection

**File:** `apps/agent-service/.mcp.json`

```json
{
  "mcpServers": {
    "llamaindex-rag": {
      "type": "http",
      "url": "https://hotdash-llamaindex-mcp.fly.dev/mcp"
    }
  }
}
```

### 3. Create RAG Tool

**File:** `apps/agent-service/src/tools/rag.ts`

```typescript
import { tool } from "@openai/agents";
import { z } from "zod";

export const answerFromDocs = tool({
  name: "answer_from_docs",
  description:
    "Answer questions using internal docs, FAQs, and policies via RAG. Use this for questions about shipping, returns, product info, troubleshooting, or any policy-related questions.",
  parameters: z.object({
    question: z
      .string()
      .describe("The customer or operator question to answer"),
    topK: z
      .number()
      .optional()
      .describe("Number of sources to retrieve (default: 5, max: 20)"),
  }),
  // This tells Agent SDK to route to MCP server
  mcp: {
    server: "llamaindex-rag",
    operation: "query_support",
    // Map parameters
    mapParameters: (params) => ({
      q: params.question,
      topK: params.topK || 5,
    }),
  },
});
```

### 4. Use in Agent Definition

**File:** `apps/agent-service/src/agents/index.ts`

```typescript
import { Agent } from "@openai/agents";
import { answerFromDocs } from "../tools/rag.js";
import { shopifyFindOrders } from "../tools/shopify.js";
import { cwCreatePrivateNote, cwSendPublicReply } from "../tools/chatwoot.js";

export const orderSupportAgent = new Agent({
  name: "Order Support",
  instructions: `You help customers with order status, returns, and exchanges.

WORKFLOW:
1. For policy questions (shipping, returns) → Use answer_from_docs FIRST
2. For order lookups → Use shopify_find_orders
3. Always create private note with your recommendation
4. Never send public reply without approval

TONE: Professional, empathetic, solution-oriented`,

  tools: [
    answerFromDocs,
    shopifyFindOrders,
    cwCreatePrivateNote,
    cwSendPublicReply,
  ],
});
```

---

## MCP Tool Reference

### query_support

**Purpose:** Query knowledge base for support information

**Input:**

```typescript
{
  q: string;        // Search query
  topK?: number;    // Results to return (1-20, default: 5)
}
```

**Output:**

```typescript
{
  ok: boolean;
  query: string;
  response: string;      // AI-generated answer
  sources: Array<{
    id: string;
    score: number;
    preview: string;
    metadata: {
      source: string;    // e.g., "hotrodan.com", "curated", "decision_log"
      table?: string;
      url?: string;
    };
  }>;
  metadata: {
    topK: number;
    timestamp: string;
    processingTime: number;
  };
  _cached?: boolean;       // If result from cache
  _cache_age_ms?: number;  // Age of cached result
}
```

**Example Call:**

```typescript
const result = await agent.call("answer_from_docs", {
  question: "What is the return policy for damaged items?",
});

// Result includes:
// - response: "According to our return policy..."
// - sources: [{ id: '...', score: 0.92, preview: '...', metadata: {...} }]
```

### refresh_index

**Purpose:** Rebuild knowledge base index

**⚠️ Note:** Rarely needed, automated via nightly job

**Input:**

```typescript
{
  sources?: string;  // 'all' | 'web' | 'supabase' | 'curated'
  full?: boolean;    // Full rebuild vs incremental
}
```

**Output:**

```typescript
{
  ok: boolean;
  runDir: string;
  count: number;
  sources: string[];
  duration: number;
  timestamp: string;
}
```

**When to Use:**

- After major documentation updates
- When index appears stale
- For testing new content

**Example:**

```typescript
// Rarely needed - automated
await mcpClient.call("refresh_index", {
  sources: "curated",
  full: false,
});
```

### insight_report

**Purpose:** Generate AI insights from telemetry

**⚠️ Note:** Internal use only, not for customer-facing agents

**Input:**

```typescript
{
  window?: string;   // '1d' | '7d' | '30d'
  format?: string;   // 'md' | 'json' | 'txt'
}
```

**Output:**
Markdown/JSON report with insights from decision log and telemetry

---

## Usage Patterns

### Pattern 1: Simple FAQ Answer

**Scenario:** Customer asks "What is your return policy?"

**Agent Flow:**

```typescript
// 1. Agent receives question
const customerQuestion = "What is your return policy?";

// 2. Agent calls answer_from_docs
const kbResult = await agent.call("answer_from_docs", {
  question: customerQuestion,
});

// 3. Agent composes response using KB answer
const response = `Based on our return policy: ${kbResult.response}`;

// 4. Create private note for approval
await agent.call("chatwoot_create_private_note", {
  conversationId: ctx.conversationId,
  content: response,
});

// 5. If approved, send to customer
// (approval handled by Agent SDK interruptions)
```

### Pattern 2: Multi-Source Answer

**Scenario:** Customer asks complex question requiring multiple sources

**Agent Flow:**

```typescript
// 1. Agent receives complex question
const question =
  "Can I return an international order and how long does the refund take?";

// 2. Agent calls answer_from_docs with higher topK
const kbResult = await agent.call("answer_from_docs", {
  question: question,
  topK: 10, // More sources for comprehensive answer
});

// 3. Agent synthesizes multi-part answer
// SDK automatically combines sources
const response = kbResult.response;

// 4. Agent verifies all parts answered
if (
  !response.includes("international") ||
  !response.includes("refund timeline")
) {
  // Make additional targeted queries
  const intl = await agent.call("answer_from_docs", {
    question: "international return policy",
  });
  const timeline = await agent.call("answer_from_docs", {
    question: "refund processing time",
  });
}
```

### Pattern 3: Fallback Strategy

**Scenario:** RAG query fails or returns low-confidence results

**Agent Flow:**

```typescript
// 1. Attempt RAG query
try {
  const result = await agent.call("answer_from_docs", {
    question: customerQuestion,
  });

  // 2. Check confidence/quality
  if (result.sources[0]?.score < 0.7) {
    // Low confidence - use fallback
    return await useFallbackResponse(customerQuestion);
  }

  return result;
} catch (error) {
  // 3. MCP call failed - use hardcoded fallback
  return {
    response:
      "I'm researching your question and will respond shortly. Thank you for your patience!",
    fallback: true,
  };
}

async function useFallbackResponse(question: string) {
  // Check if we have a template for this
  const template = findRelevantTemplate(question);
  if (template) {
    return { response: renderTemplate(template), source: "template" };
  }

  // Ultimate fallback: escalate
  return {
    response:
      "This is a great question that I want to make sure I answer correctly. Let me escalate this to a specialist who can provide the most accurate information.",
    escalate: true,
  };
}
```

### Pattern 4: Citation Attribution

**Scenario:** Include sources in response to customer

**Agent Flow:**

```typescript
const result = await agent.call("answer_from_docs", {
  question: "What is your warranty policy?",
});

// Compose response with citations
const response = `${result.response}

**References:**
${result.sources
  .slice(0, 3)
  .map(
    (s, i) =>
      `${i + 1}. ${s.metadata.source}${s.metadata.url ? ` - ${s.metadata.url}` : ""}`,
  )
  .join("\n")}`;

// Now customer can verify information
```

---

## Response Quality Guidelines

### When to Use RAG

✅ **Use answer_from_docs for:**

- Policy questions (shipping, returns, warranty)
- FAQ-style questions
- Troubleshooting procedures
- Product information
- Process explanations
- Best practice guidance

❌ **Don't use answer_from_docs for:**

- Order-specific data (use Shopify tools)
- Real-time system status (check directly)
- Customer-specific account info
- Dynamic pricing/inventory

### Response Enhancement

**Always:**

1. Personalize with customer name
2. Format for readability (bullet points, bold)
3. Include next steps or call-to-action
4. Offer additional help

**Never:** 5. Copy RAG response verbatim without personalization 6. Include raw source IDs or technical metadata 7. Make promises not in the policy 8. Skip approval for public replies

---

## Error Handling

### MCP Server Down

```typescript
try {
  const result = await agent.call("answer_from_docs", { question });
} catch (error) {
  if (error.message.includes("MCP server unreachable")) {
    // Use template library fallback
    return useTemplateLibrary(question);
  }

  // Create escalation note
  await agent.call("chatwoot_create_private_note", {
    conversationId: ctx.conversationId,
    content: `⚠️ RAG system unavailable - escalating to human operator. Error: ${error.message}`,
  });

  throw error; // Let Agent SDK handle interruption
}
```

### Low-Quality Response

```typescript
const result = await agent.call("answer_from_docs", { question });

// Check source scores
const avgScore =
  result.sources.reduce((sum, s) => sum + s.score, 0) / result.sources.length;

if (avgScore < 0.7) {
  // Low confidence - request human review
  await agent.call("chatwoot_create_private_note", {
    conversationId: ctx.conversationId,
    content: `⚠️ RAG confidence low (${avgScore.toFixed(2)}). Please review: ${result.response}`,
  });

  // Don't send to customer without approval
  return { needsReview: true, draft: result.response };
}
```

### Timeout Handling

```typescript
// MCP query has 10-second timeout
// If approaching Agent SDK timeout, abort early

const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Timeout")), 8000),
);

try {
  const result = await Promise.race([
    agent.call("answer_from_docs", { question }),
    timeoutPromise,
  ]);
} catch (error) {
  // Use acknowledgment template
  return useTemplate("ack_delay", {
    customer_name: ctx.customerName,
    estimated_response_time: "2-3 hours",
  });
}
```

---

## Testing Guide

### Unit Tests

**File:** `apps/agent-service/tests/tools/rag.test.ts`

```typescript
import { answerFromDocs } from "../src/tools/rag";

describe("answerFromDocs", () => {
  it("should return answer with citations", async () => {
    const result = await answerFromDocs.execute({
      question: "What is the shipping policy?",
    });

    expect(result).toHaveProperty("response");
    expect(result).toHaveProperty("sources");
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it("should handle MCP server errors gracefully", async () => {
    // Mock MCP server down
    mockMCPServer.down();

    const result = await answerFromDocs.execute({
      question: "test",
    });

    expect(result.fallback).toBe(true);
  });
});
```

### Integration Tests

**File:** `apps/agent-service/tests/integration/agent-rag.test.ts`

```typescript
import { orderSupportAgent } from "../src/agents";
import { run } from "@openai/agents";

describe("Agent + RAG Integration", () => {
  it("should answer policy question using RAG", async () => {
    const result = await run(orderSupportAgent, "What is your return policy?");

    expect(result.finalOutput).toContain("30 days");
    expect(result.toolCalls).toContainEqual(
      expect.objectContaining({ name: "answer_from_docs" }),
    );
  });

  it("should create private note before public reply", async () => {
    const result = await run(orderSupportAgent, "Can I return this item?");

    // Should create private note first
    expect(result.interruptions).toHaveLength(1);
    expect(result.interruptions[0].rawItem.name).toBe(
      "chatwoot_send_public_reply",
    );
  });
});
```

---

## Example Agent Conversations

### Example 1: Simple Policy Question

**Customer:** "What is your shipping policy?"

**Agent Execution:**

```typescript
// Step 1: Agent calls answer_from_docs
{
  tool: 'answer_from_docs',
  params: { question: 'What is your shipping policy?' }
}

// Step 2: MCP Response
{
  response: "HotDash offers standard shipping (5-7 business days) and expedited shipping (2-3 business days). Orders placed before 2 PM EST ship same day...",
  sources: [
    { id: 'shipping-policy-001', score: 0.94, metadata: { source: 'curated' } },
    { id: 'shipping-timeline-002', score: 0.87, metadata: { source: 'hotrodan.com' } }
  ]
}

// Step 3: Agent composes reply
{
  tool: 'chatwoot_send_public_reply',
  params: {
    conversationId: 12345,
    content: "Hi! HotDash offers standard shipping (5-7 business days) and expedited shipping (2-3 business days). Orders placed before 2 PM EST ship the same day. Would you like to know more about shipping costs or international options?"
  }
}

// Step 4: Approval interruption
// (Agent SDK pauses for human approval)
```

### Example 2: Order Status + Policy

**Customer:** "Where is my order #54321 and can I return it if I don't like it?"

**Agent Execution:**

```typescript
// Step 1: Check order status
{
  tool: 'shopify_find_orders',
  params: { query: 'name:#54321' }
}

// Step 2: Get return policy
{
  tool: 'answer_from_docs',
  params: { question: 'return policy' }
}

// Step 3: Compose combined answer
// Agent synthesizes both results into coherent response

// Step 4: Create private note
{
  tool: 'chatwoot_create_private_note',
  params: {
    conversationId: 12345,
    content: "Order #54321 shipped on Oct 10, tracking: 1Z999... Expected delivery Oct 15. Customer can return within 30 days of delivery if unworn/tagged. Recommend: Send tracking + return policy link."
  }
}

// Step 5: Send public reply (with approval)
{
  tool: 'chatwoot_send_public_reply',
  params: {
    conversationId: 12345,
    content: "Hi! Your order #54321 shipped on October 10th. Tracking number: 1Z999... Expected delivery: October 15th.\n\nRegarding returns: Yes! You have 30 days from delivery to return any item that's unworn with original tags. Return shipping is free with our prepaid label.\n\nAnything else I can help with?"
  }
}
```

---

## Performance Optimization

### Caching Strategy

**MCP Server Caching** (handled automatically):

- 5-minute TTL for query results
- ~75% hit rate expected
- Transparent to Agent SDK

**Agent-Side Caching** (optional enhancement):

```typescript
// Cache common answers at agent level
const responseCache = new Map<string, { answer: string; expires: number }>();

async function cachedAnswerFromDocs(question: string) {
  const cacheKey = normalizeQuestion(question);
  const cached = responseCache.get(cacheKey);

  if (cached && Date.now() < cached.expires) {
    return cached.answer;
  }

  const result = await agent.call("answer_from_docs", { question });

  responseCache.set(cacheKey, {
    answer: result,
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return result;
}
```

### Parallel Queries

**When you need multiple pieces of information:**

```typescript
// ❌ Sequential (slow)
const policy = await agent.call("answer_from_docs", {
  question: "return policy",
});
const shipping = await agent.call("answer_from_docs", {
  question: "shipping time",
});

// ✅ Parallel (fast)
const [policy, shipping] = await Promise.all([
  agent.call("answer_from_docs", { question: "return policy" }),
  agent.call("answer_from_docs", { question: "shipping time" }),
]);
```

---

## Troubleshooting

### "MCP server not responding"

**Symptoms:**

- Tool calls timeout
- Error: "llamaindex-rag server unreachable"

**Solutions:**

1. Check MCP server health: `curl https://hotdash-llamaindex-mcp.fly.dev/health`
2. Verify `.mcp.json` configuration
3. Check network connectivity
4. Use template library fallback

### "Low-quality responses"

**Symptoms:**

- Responses don't match customer question
- Sources have low scores (<0.70)
- Citations are irrelevant

**Solutions:**

1. Increase topK (try 10-15 instead of 5)
2. Rephrase question more specifically
3. Check if content exists in knowledge base
4. Request human review via private note

### "Response latency too high"

**Symptoms:**

- Queries take >1 second
- Agent SDK timeout

**Solutions:**

1. Check MCP server metrics (P95 latency)
2. Reduce topK to 3 for faster results
3. Use caching at agent level
4. Consider pre-computing common answers

---

## Best Practices

### 1. Always Provide Context

```typescript
// ❌ Vague query
await agent.call("answer_from_docs", {
  question: "policy",
});

// ✅ Specific query
await agent.call("answer_from_docs", {
  question: "return policy for damaged items received during shipping",
});
```

### 2. Validate Before Sending

```typescript
const result = await agent.call("answer_from_docs", { question });

// Check quality indicators
if (result.sources.length === 0) {
  // No sources found - don't send to customer
  escalate();
}

if (result.sources[0].score < 0.75) {
  // Low confidence - request review
  requestApproval();
}
```

### 3. Combine with Other Tools

```typescript
// Order-related: Get order data + policy info
const [orderData, returnPolicy] = await Promise.all([
  agent.call("shopify_find_orders", { query: `name:${orderNumber}` }),
  agent.call("answer_from_docs", { question: "return policy" }),
]);

// Compose response with both
const response = composeResponse(orderData, returnPolicy);
```

### 4. Log for Training

```typescript
import { trainingCollector } from "../../../scripts/ai/llama-workflow/src/training/collector.js";

const result = await agent.call("answer_from_docs", { question });

// Log for training
await trainingCollector.logQuery({
  conversationId: ctx.conversationId,
  agentName: "Order Support",
  query: question,
  response: result.response,
  sources: result.sources,
  processingTimeMs: result.metadata.processingTime,
});
```

---

## Monitoring & Metrics

### Agent-Side Metrics to Track

```typescript
// Track RAG tool usage
metrics.increment("rag_tool_calls", { agent: agentName });
metrics.histogram("rag_latency_ms", latencyMs);
metrics.increment("rag_cache_hit", { hit: result._cached });

// Track quality
if (result.sources[0]?.score) {
  metrics.histogram("rag_top_source_score", result.sources[0].score);
}

// Track outcomes
metrics.increment("rag_approved", { approved: wasApproved });
metrics.increment("rag_edited", { edited: wasEdited });
```

### Expected Metrics

| Metric         | Target | Alert Threshold       |
| -------------- | ------ | --------------------- |
| RAG calls/hour | 50-200 | >500 (scaling needed) |
| Avg latency    | <400ms | >600ms                |
| Cache hit rate | >70%   | <60%                  |
| Approval rate  | >85%   | <70%                  |
| Edit rate      | <15%   | >30%                  |

---

## Production Checklist

Before deploying agents with RAG:

- [ ] MCP server deployed and healthy
- [ ] Knowledge base indexed (>100 documents)
- [ ] Evaluation suite passing (BLEU >0.3, ROUGE >0.4)
- [ ] Template library available as fallback
- [ ] Monitoring configured
- [ ] Agent SDK interruptions tested
- [ ] Approval queue UI functional
- [ ] Training data collection enabled
- [ ] Error handling tested
- [ ] Load testing completed (>500 req/s)

---

## Support Contacts

**MCP Server Issues:**

- Primary: @ai (LlamaIndex expert)
- Backup: @engineer (MCP server owner)

**Agent SDK Issues:**

- Primary: @engineer (Agent SDK implementation)
- Integration: @ai (RAG integration)

**Content Gaps:**

- Primary: @support (curated replies)
- Policies: @manager (approval)

---

**Integration Status:** ✅ Ready for implementation  
**Prerequisites:** MCP server deployed, knowledge base indexed  
**Next:** Engineer implements Agent SDK service
