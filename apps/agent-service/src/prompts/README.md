# Agent Prompts System

Comprehensive system prompts and utilities for HotDash Agent SDK specialized agents.

## Overview

This directory contains carefully crafted system prompts for each agent type, along with utilities for confidence scoring, citation formatting, and response quality assessment.

## Agent Types

### 1. Triage Agent (`triage.ts`)
**Purpose**: First point of contact - classifies customer intent and routes to specialists

**Intent Categories**:
- `ORDER_SUPPORT`: Order status, returns, cancellations, shipping
- `PRODUCT_QA`: Product specs, compatibility, recommendations
- `GENERAL_INQUIRY`: Policies, general questions, account issues

**Confidence Thresholds**:
- High: 90-100% (clear, single intent)
- Medium: 70-89% (mostly clear, minor ambiguity)
- Low: <70% (unclear, multiple intents, needs clarification)

**Output**: TriageResult with intent, confidence, key details, and routing recommendation

### 2. Order Support Agent (`order-support.ts`)
**Purpose**: Handles all order-related customer issues

**Capabilities**:
- Order status lookups
- Returns and exchanges
- Cancellation processing
- Shipping issue resolution
- Refund coordination

**Key Features**:
- Always verifies before responding
- Cites order numbers and tracking
- Follows return/refund policies
- Requires approval for order modifications
- Empathetic, action-oriented tone

**Output**: OrderDraft with structured response and approval flags

### 3. Product Q&A Agent (`product-qa.ts`)
**Purpose**: Answers product questions using RAG knowledge base

**Capabilities**:
- Product specifications
- Compatibility verification
- Installation guidance
- Product recommendations
- Technical support

**Key Features**:
- Always cites knowledge base sources
- Never makes up information
- Requests operator input if uncertain
- Educational, knowledgeable tone
- Safety-conscious

**Output**: ProductDraft with answer, citations, and confidence score

## Utilities (`utils.ts`)

### Confidence Scoring
```typescript
calculateConfidence({
  knowledgeBaseHits: 3,
  sourceRelevance: [0.95, 0.87, 0.92],
  questionComplexity: 2,  // 1-5 scale
  informationCompleteness: 0.9  // 0-1 scale
});
// Returns: { score: 92, level: 'High', reasoning: '...' }
```

### Citation Formatting
```typescript
formatCitations([
  {
    title: 'PTFE Hose Product Page',
    url: 'https://hotrodan.com/products/ptfe-hose',
    relevance: 0.95
  }
]);
// Returns formatted citation block for response
```

### Response Quality Assessment
```typescript
assessResponseQuality({
  hasSourceCitations: true,
  addressesAllQuestions: true,
  usesCustomerName: true,
  providesNextSteps: true,
  tone: 'professional'
});
// Returns quality scores for each dimension (1-5)
```

### Approval Metadata Generation
```typescript
generateApprovalMetadata({
  agentType: 'product-qa',
  confidence: confidenceScore,
  citations: citationArray,
  hasUrgencyFlags: false,
  requiresVerification: false
});
// Returns complete metadata for approval queue
```

## Usage Example

```typescript
import { 
  PRODUCT_QA_SYSTEM_PROMPT,
  calculateConfidence,
  formatCitations,
  generateApprovalMetadata
} from './prompts/index.js';

// 1. Use system prompt with OpenAI
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: PRODUCT_QA_SYSTEM_PROMPT },
    { role: 'user', content: customerQuestion }
  ]
});

// 2. Calculate confidence from RAG results
const confidence = calculateConfidence({
  knowledgeBaseHits: ragResults.length,
  sourceRelevance: ragResults.map(r => r.score),
  questionComplexity: 2,
  informationCompleteness: 0.9
});

// 3. Format citations
const citationText = formatCitations(ragResults.map(r => ({
  title: r.metadata.title,
  url: r.metadata.url,
  relevance: r.score
})));

// 4. Generate approval metadata
const metadata = generateApprovalMetadata({
  agentType: 'product-qa',
  confidence,
  citations: ragResults,
  hasUrgencyFlags: false,
  requiresVerification: confidence.level === 'Low'
});

// 5. Submit to approval queue
await approvalQueue.submit({
  draftResponse: response.choices[0].message.content + citationText,
  metadata,
  requiresApproval: metadata.priorityLevel !== 'low'
});
```

## Design Principles

### 1. Operator-First
- Prompts help operators work faster, not replace them
- Clear confidence levels guide review priority
- All actions require operator approval

### 2. Accuracy Over Speed
- Never guess or make up information
- Always cite sources for technical details
- Flag uncertainties for operator verification

### 3. Learning Loop
- Structured output enables feedback collection
- Quality scores track improvement over time
- Operator edits train better prompts

### 4. Safety & Compliance
- Policy-aligned responses
- Safety-critical information flagged
- Escalation paths for edge cases

## Metrics & Monitoring

Each prompt is designed to output structured data for metrics:

- **Approval Rate**: % of drafts sent without edits
- **Confidence Calibration**: Actual vs predicted accuracy
- **Response Time**: Draft generation speed
- **Edit Distance**: How much operators modify
- **Quality Scores**: Factuality, helpfulness, tone

## Testing

Test prompts with:
```bash
npm run test:prompts
```

## Version History

- **v1.0** (2025-10-12): Initial agent-specific prompts for launch
  - Triage agent with 3-way classification
  - Order support with Shopify integration
  - Product Q&A with RAG citations
  - Confidence scoring and quality assessment

## Future Enhancements

1. Multi-language support
2. Dynamic prompt optimization based on feedback
3. Context-aware prompt selection
4. A/B testing framework for prompt variants
5. Automated quality benchmarking

---

**Last Updated**: October 12, 2025  
**Maintained By**: AI Agent Team  
**Launch Target**: October 13-15, 2025

