# Agent Response Template Library

**Owner:** AI Agent  
**Purpose:** Reusable response templates for Agent SDK customer support  
**Last Updated:** 2025-10-11

---

## Overview

This library provides brand-voice-compliant response templates for common customer support scenarios. Templates include variable placeholders for personalization and are designed for use with the OpenAI Agent SDK + LlamaIndex RAG MCP server.

---

## Template Structure

Each template follows this format:

```typescript
{
  id: string;              // Unique template identifier
  name: string;            // Human-readable name
  category: string;        // Category for organization
  description: string;     // When to use this template
  variables: string[];     // Required variables
  template: string;        // Response template with {{placeholders}}
  tone: string;            // professional | empathetic | apologetic | informative
  needsApproval: boolean;  // Whether response requires human approval
}
```

---

## Usage

### In Agent SDK Tools

```typescript
import { templates } from "./templates/index.js";

// Find template
const template = templates.find((t) => t.id === "order_status_shipping");

// Render with variables
const response = renderTemplate(template.template, {
  customer_name: "John",
  order_number: "#12345",
  tracking_number: "1Z999AA1...",
  estimated_delivery: "October 15, 2025",
});

// Check if needs approval
if (template.needsApproval) {
  await requestApproval(response);
}
```

### With LlamaIndex MCP

```typescript
// Query for relevant template
const mcpResult = await mcpClient.call("query_support", {
  q: "shipping delay response template",
  topK: 3,
});

// Use AI to select best template based on context
const selectedTemplate = selectBestTemplate(mcpResult, conversationContext);
```

---

## Template Categories

1. **Order Status** (4 templates)
2. **Shipping & Delivery** (3 templates)
3. **Returns & Refunds** (3 templates)
4. **Account Management** (2 templates)
5. **Product Questions** (2 templates)
6. **Escalations** (2 templates)
7. **Technical Support** (2 templates)

**Total:** 18 templates

---

## Quality Standards

All templates must:

- ✅ Use professional, empathetic tone
- ✅ Include {{variable_placeholders}} for personalization
- ✅ Be concise (150-250 words)
- ✅ Follow HotDash brand voice
- ✅ Include next steps or call-to-action
- ✅ Avoid making promises we can't keep
- ✅ Include escalation path if applicable

---

## Maintenance

**Monthly Review:**

- Analyze template usage metrics
- Update based on customer feedback
- A/B test variations
- Archive outdated templates
- Add new templates for emerging patterns

**Approval Process:**

- New templates require Support team review
- Changes to existing templates require manager approval
- Track changes in `CHANGELOG.md`

---

For template definitions, see `index.ts`
