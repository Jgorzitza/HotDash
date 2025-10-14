# Support Agent Direction
**Updated**: 2025-10-14
**Priority**: GROWTH SPEC EXECUTION - CX SYSTEMS
**Focus**: Build CX Automation Systems (NOT Answer Tickets)

## Mission

Build **customer support automation systems**. NOT answering individual tickets - build the SYSTEMS that handle support at scale.

## CRITICAL MINDSET SHIFT

**❌ WRONG** (What you were doing):
- Answering individual customer tickets
- Creating one-off help articles
- Manually responding to FAQs
- Doing human support work

**✅ RIGHT** (What you should build):
- Automated response system (handles tickets automatically)
- Knowledge base automation (generates articles from patterns)
- FAQ detection and auto-response (no human needed)
- CX workflow automation (escalation, routing, resolution)

## Human-in-the-Loop for Customer Responses

**CRITICAL REQUIREMENT**: ALL auto-generated customer responses MUST use CEO approval

**Why**: Train system to match CEO tone, ensure empathy, maintain quality in CX

**Reference**: [OpenAI Agents SDK - Human in the Loop](https://openai.github.io/openai-agents-js/guides/human-in-the-loop/)

**All CX tools MUST have**:
```typescript
import { tool } from '@openai/agents';

const autoResponseTool = tool({
  name: 'sendCustomerResponse',
  parameters: z.object({
    ticketId: z.string(),
    proposedResponse: z.string(),
    intent: z.string(),
  }),
  needsApproval: true,  // CEO approves ALL customer responses
  execute: async ({ ticketId, proposedResponse }) => {
    // Executes only after CEO approval
    return await sendResponse(ticketId, proposedResponse);
  },
});
```

**Learning from CEO Approvals**:
- Track CEO edits to responses (tone, empathy, technical accuracy)
- Learn when to escalate vs auto-respond
- Improve intent classification from approval patterns
- Build response templates from approved examples
- Adjust confidence thresholds based on approval rate


## Priority 0 - Wait for CX Recommender

**BLOCKER**: AI agent building CX automation (6-8 hours)

**While Waiting** (2-3 hours):
- [ ] Analyze ticket patterns (what can be automated)
- [ ] Document auto-response candidates
- [ ] Design CX workflow automation
- [ ] Prepare knowledge base structure

## Priority 1 - Automated Response Systems

### Task 1: Build Auto-Response Engine (6-8 hours)
**Goal**: Automated ticket response system

**NOT**: Answering tickets manually
**YES**: Building the system that answers tickets

**Architecture**:
```typescript
// app/services/cx/auto-responder.server.ts
class AutoResponder {
  async processTicket(ticket: ChatwootMessage) {
    // 1. Classify intent
    const intent = await classifyIntent(ticket.content);
    
    // 2. Check if auto-respondable
    const confidence = await calculateConfidence(intent);
    
    if (confidence > 0.9) {
      // 3. Generate response with LlamaIndex
      const response = await generateResponse(intent, ticket);
      
      // 4. Create Action for operator approval
      createAction({
        type: 'cx_auto_response',
        payload: { ticket, response },
        score: confidence
      });
    } else {
      // Escalate to human
      escalateToOperator(ticket, intent);
    }
  }
}
```

**Deliverables**:
- [ ] Auto-responder service implemented
- [ ] Intent classification (what customer needs)
- [ ] Confidence scoring (when to auto-respond)
- [ ] Actions created for operator review
- [ ] LlamaIndex MCP integration
- [ ] GitHub commit

### Task 2: Build Knowledge Base Auto-Generator (4-6 hours)
**Goal**: Automated help article creation

**NOT**: Writing help articles manually
**YES**: Building the system that generates articles

**Logic**:
- Detect repeated questions (>5 times)
- Generate comprehensive article
- Test with customers
- Publish if effective (>80% resolution)

**Deliverables**:
- [ ] Article generator service
- [ ] Pattern detection (repeated issues)
- [ ] Auto-generation with LlamaIndex
- [ ] Effectiveness testing
- [ ] Auto-publish pipeline
- [ ] GitHub commit

## Priority 2 - CX Workflow Automation

### Task 3: Build Intelligent Routing System (4-6 hours)
**Goal**: Auto-route tickets to right operator/system

**Routing Rules**:
```typescript
interface RoutingRule {
  condition: (ticket) => boolean;
  destination: 'auto_respond' | 'operator_queue' | 'escalation';
  priority: number;
}

const rules: RoutingRule[] = [
  {
    condition: t => t.intent === 'shipping_status' && t.hasTrackingNumber,
    destination: 'auto_respond',
    priority: 1
  },
  {
    condition: t => t.sentiment === 'angry' || t.containsLegalThreat,
    destination: 'escalation',
    priority: 0
  },
  // ... more rules
];
```

**Deliverables**:
- [ ] Routing engine implemented
- [ ] Rule builder UI (for operators to configure)
- [ ] Intent/sentiment detection
- [ ] Queue management
- [ ] GitHub commit

### Task 4: Build Escalation Automation (3-4 hours)
**Goal**: Automated escalation workflows

**Features**:
- Detect escalation triggers (angry customer, legal, VIP)
- Auto-assign to senior operators
- Alert manager for critical issues
- Track escalation outcomes

**Deliverables**:
- [ ] Escalation detection service
- [ ] Auto-assignment logic
- [ ] Alert system
- [ ] Outcome tracking
- [ ] GitHub commit

## Priority 3 - CX Intelligence

### Task 5: Build Sentiment Analysis Pipeline (3-4 hours)
**Goal**: Real-time customer sentiment tracking

**Features**:
- Analyze all incoming messages
- Detect sentiment (happy/neutral/angry)
- Alert on negative sentiment
- Track sentiment trends

**Deliverables**:
- [ ] Sentiment analyzer service
- [ ] Real-time alerts
- [ ] Trend dashboards
- [ ] Proactive outreach triggers
- [ ] GitHub commit

### Task 6: Build Resolution Automation (3-4 hours)
**Goal**: Automated issue resolution

**Common Resolutions to Automate**:
- Order status lookups (Shopify API)
- Tracking number retrieval
- Simple refund processing (with approval)
- FAQ answers
- Product information

**Deliverables**:
- [ ] Resolution automation service
- [ ] Shopify integration for order data
- [ ] Approval workflow for refunds
- [ ] Success tracking
- [ ] GitHub commit

## Build CX SYSTEMS, Not Answer Tickets

**✅ RIGHT**:
- Build auto-responder (handles 80% of tickets)
- Build KB generator (creates articles automatically)
- Build routing system (distributes intelligently)

**❌ WRONG**:
- Answer tickets yourself (not scalable)
- Write articles manually (one at a time)
- Route tickets by hand (human hours wasted)

## Evidence Required

- Git commits for all CX systems
- LlamaIndex MCP validation
- Automation metrics (% tickets auto-handled)
- Response time improvements
- Customer satisfaction scores

## Success Criteria

**Week 1 Complete When**:
- [ ] Auto-responder handling >50% of tickets
- [ ] Knowledge base auto-generating articles
- [ ] Intelligent routing operational
- [ ] Escalation automation working
- [ ] Sentiment analysis tracking all tickets
- [ ] Resolution automation for common issues

**This enables**: CX at scale without proportional human hours

## Report Every 2 Hours

Update `feedback/support.md`:
- Automation systems built
- Tickets auto-handled (%)
- Articles generated
- Performance metrics
- Evidence (commits, metrics)

---

**Remember**: Build CX AUTOMATION SYSTEMS, not answer tickets manually. Automate support at scale.
