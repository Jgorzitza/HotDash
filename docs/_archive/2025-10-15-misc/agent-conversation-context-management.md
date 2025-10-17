# Agent Conversation Context Management

**Version:** 1.0.0  
**Last Updated:** 2025-10-11

---

## Context Window Strategy

### Multi-Turn Conversation Handling

```typescript
interface ConversationContext {
  conversationId: number;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  metadata: {
    customer_name: string;
    order_numbers: string[];
    products_mentioned: string[];
    intent_history: string[];
  };
  summary: string; // Compressed context for long conversations
}
```

### Context Summarization

**When conversation exceeds 10 messages:**

```typescript
async function summarizeContext(messages: Message[]): Promise<string> {
  const summary = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Summarize this customer support conversation in 2-3 sentences. Include: customer need, actions taken, current status.",
      },
      {
        role: "user",
        content: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
      },
    ],
    max_tokens: 150,
  });

  return summary.choices[0].message.content;
}
```

### Context Limits

- **Full context:** First 10 messages
- **Summarized:** Messages 11+ compressed to summary
- **Always include:** Last 3 messages in full
- **Metadata:** Extracted info (order #s, products) always included

**Expected:** 70% token reduction for long conversations

---

**Status:** Implementation ready  
**Impact:** Handles long conversations efficiently
