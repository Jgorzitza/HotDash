# Agent SDK Prompt Library

**Version:** 1.0.0  
**Last Updated:** 2025-10-11  
**Owner:** AI Agent

---

## Overview

This library contains system prompts for OpenAI Agent SDK agents used in HotDash customer support automation.

**Agents:** 3  
**Total Prompts:** 3 system prompts + templates  
**Review Schedule:** Weekly (first month), then monthly

---

## Agent Prompts

### 1. Triage Agent

**File:** `triage-agent.md`  
**Purpose:** Classify customer intent and route to specialists  
**Tools:** set_intent, cwCreatePrivateNote  
**Handoffs:** Order Support, Product Q&A

**Key Behaviors:**

- Quick classification (<30 seconds)
- Minimal clarification (1 question max)
- Create informative private notes
- Route accurately (>95% accuracy target)

---

### 2. Order Support Agent

**File:** `order-support-agent.md`  
**Purpose:** Handle orders, shipping, returns, refunds, exchanges  
**Tools:** shopify_find_orders, answer_from_docs, cwCreatePrivateNote, cwSendPublicReply, shopifyCancelOrder

**Key Behaviors:**

- Always lookup order data first
- Use answer_from_docs for policy questions
- Create drafts in private notes
- Never send public replies without approval
- Escalate refunds >$500

---

### 3. Product Q&A Agent

**File:** `product-qa-agent.md`  
**Purpose:** Answer product questions, recommendations, availability  
**Tools:** answer_from_docs, product catalog (future), cwCreatePrivateNote, cwSendPublicReply

**Key Behaviors:**

- Rely on answer_from_docs for factual info
- Never guess specifications
- Provide personalized recommendations
- Escalate technical questions beyond scope
- Include product links in responses

---

## Prompt Engineering Principles

### 1. Specificity

✅ **Good:**

```
You help customers with order status, returns, and exchanges.
When customer provides order number, ALWAYS look it up first.
Use answer_from_docs for policy questions.
```

❌ **Bad:**

```
You help with customer questions.
Use tools as needed.
```

### 2. Workflow Clarity

**Define Clear Steps:**

1. Understand request
2. Gather information
3. Draft response
4. Seek approval
5. Send to customer

### 3. Tool Usage Guidance

**Be Explicit:**

- When to use each tool
- Example queries for answer_from_docs
- Required vs optional parameters
- Approval requirements

### 4. Tone & Voice

**Define Brand Voice:**

- Professional but friendly
- Empathetic to customer frustration
- Solution-oriented
- Clear and concise

---

## Prompt Variables

### Dynamic Variables (Injected at Runtime)

```typescript
{
  customer_name: string;
  customer_email: string;
  vip_status: boolean;
  conversation_history: string[];
  current_context: string;
}
```

**Usage in Prompts:**

```
When addressing customer, use {{customer_name}}.
If {{vip_status}} is true, add "As a valued customer..." to your response.
```

---

## Testing Prompts

### Test Scenarios

**Each Prompt Tested With:**

1. **Happy Path** - Clear, simple requests
2. **Edge Cases** - Unusual scenarios
3. **Ambiguous Input** - Unclear customer intent
4. **Multiple Intents** - Customer asks 2+ things
5. **Angry Customer** - All caps, frustrated language
6. **Missing Information** - No order number, vague question

### Quality Metrics

**Measure:**

- Classification accuracy (Triage)
- Tool selection accuracy
- Response quality scores
- Approval rate
- Edit rate
- Customer satisfaction

**Targets:**

- Triage accuracy: >95%
- Tool selection: >90%
- Approval rate: >85%
- Edit rate: <15%
- CSAT: >4.5/5

---

## Version Control

### Changelog Format

```markdown
## [Version] - YYYY-MM-DD

### Added

- New instructions for [scenario]

### Changed

- Updated [section] to improve [metric]

### Removed

- Deprecated [old instruction]

### Fixed

- Corrected [issue] that caused [problem]
```

### Versioning Scheme

**Format:** MAJOR.MINOR.PATCH

- **MAJOR:** Complete prompt rewrite
- **MINOR:** New scenarios or tools added
- **PATCH:** Minor wording improvements

**Current Version:** 1.0.0 (initial release)

---

## Prompt Optimization Process

### Weekly Review (First Month)

**Review Metrics:**

1. Approval rate by agent
2. Edit rate by agent
3. Common failure patterns
4. Tool usage accuracy

**Actions:**

- Identify low-performing scenarios
- Update prompts with better examples
- Add edge case handling
- Refine tone guidance

### Monthly Review (Ongoing)

**Analyze:**

- Customer satisfaction trends
- Resolution rate by agent
- Escalation patterns
- New scenario types

**Update:**

- Add new scenarios
- Refine existing instructions
- Update tool usage examples
- Adjust tone guidelines

---

## A/B Testing

### Testing New Prompt Versions

**Process:**

1. Create variant prompt (1.1.0-test)
2. Route 20% of traffic to variant
3. Compare metrics over 7 days
4. Promote winner to production

**Metrics to Compare:**

- Approval rate
- Edit rate
- CSAT scores
- Resolution time
- Tool selection accuracy

---

## Prompt Library Files

**Location:** `app/prompts/agent-sdk/`

**Files:**

- `README.md` - This file
- `triage-agent.md` - Triage agent system prompt
- `order-support-agent.md` - Order support system prompt
- `product-qa-agent.md` - Product Q&A system prompt
- `CHANGELOG.md` - Version history
- `test-scenarios/` - Test cases for each agent

---

## Integration with Agent SDK

### Loading Prompts

```typescript
// Load prompt from file
import fs from 'fs';
import path from 'path';

function loadPrompt(agentType: 'triage' | 'order-support' | 'product-qa'): string {
  const filename = `${agentType}-agent.md`;
  const promptPath = path.join(__dirname, 'prompts', 'agent-sdk', filename);
  return fs.readFileSync(promptPath, 'utf-8');
}

// Use in Agent definition
export const orderSupportAgent = new Agent({
  name: 'Order Support',
  instructions: loadPrompt('order-support'),
  tools: [...],
});
```

### Variable Injection

```typescript
function injectVariables(
  prompt: string,
  variables: Record<string, any>,
): string {
  let processed = prompt;
  for (const [key, value] of Object.entries(variables)) {
    processed = processed.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      String(value),
    );
  }
  return processed;
}
```

---

## Compliance & Safety

### Prompts Must Include:

- ✅ Privacy protection instructions
- ✅ No promises beyond policy
- ✅ Approval requirements for sensitive actions
- ✅ Escalation criteria
- ✅ Prohibited topics/actions

### Restricted Actions

**Prompts explicitly prohibit:**

- Sharing personal contact information
- Making policy exceptions without approval
- Accessing systems beyond authorized tools
- Providing medical/legal advice
- Discriminatory language or bias

---

## Contact

**Questions About Prompts?**

- Owner: AI Agent (@ai)
- Review feedback in weekly sprint
- Suggest improvements via feedback/ai.md

---

**Library Version:** 1.0.0  
**Last Review:** 2025-10-11  
**Next Review:** 2025-10-18
