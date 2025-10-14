# Chatwoot Agent Direction
**Updated**: 2025-10-14
**Priority**: GROWTH SPEC EXECUTION - CX AUTOMATION
**Focus**: Build CX Workflow Automation (NOT Handle Tickets)

## Mission

Build **CX workflow automation systems** that integrate Chatwoot with AI. NOT answering tickets manually - build the SYSTEMS that automate customer interactions.

## Human-in-the-Loop for Customer Interactions

**CRITICAL REQUIREMENT**: ALL AI-generated customer responses MUST use CEO approval

**Why**: Train AI to match CEO voice/tone in customer interactions, ensure quality, build trust

**Reference**: [OpenAI Agents SDK - Human in the Loop](https://openai.github.io/openai-agents-js/guides/human-in-the-loop/)

**All Chatwoot response tools MUST have**:
```typescript
import { tool } from '@openai/agents';

const chatwootResponseTool = tool({
  name: 'sendChatwootResponse',
  description: 'Send response to customer via Chatwoot',
  parameters: z.object({
    conversationId: z.string(),
    proposedMessage: z.string(),
    intent: z.string(),
    confidence: z.number(),
  }),
  // CEO approves ALL customer-facing responses
  needsApproval: true,
  execute: async ({ conversationId, proposedMessage }) => {
    // This executes ONLY after CEO approval
    const result = await chatwoot.sendMessage(conversationId, proposedMessage);
    
    // Track what was approved for learning
    await trackCEOApproval({
      conversationId,
      proposedMessage,
      approvedMessage: proposedMessage, // May be edited by CEO
      approvedAt: new Date(),
    });
    
    return result;
  },
});
```

**Approval Flow**:
1. AI analyzes customer message
2. AI generates response draft
3. System pauses, creates approval interruption
4. CEO reviews response in approval queue
5. CEO approves/edits/rejects
6. System learns from CEO feedback (tone, empathy, accuracy)
7. Approved response sent to customer

**Learning from CEO Approvals**:
- Track CEO tone adjustments (more empathetic, less formal, etc)
- Learn when CEO escalates vs auto-responds
- Identify CEO's preferred phrasing patterns
- Build response templates from approved examples
- Improve confidence scoring from approval history

## Priority 1 - Chatwoot Integration

### Task 1: Build AI Response System with Approval (6-8 hours)
**Goal**: AI-powered responses requiring CEO approval

**NOT**: Answering tickets yourself
**YES**: Building AI system that generates responses for CEO approval

**Architecture**:
```typescript
// app/services/chatwoot/ai-responder.server.ts
import { run, Agent } from '@openai/agents';

const chatwootAgent = new Agent({
  name: 'Chatwoot CX Agent',
  instructions: 'You analyze customer messages and generate helpful responses',
  tools: [chatwootResponseTool], // Has needsApproval: true
});

async function handleChatwootMessage(message: ChatwootMessage) {
  // 1. Run agent to generate response
  let result = await run(
    chatwootAgent,
    `Customer message: "${message.content}". Generate appropriate response.`
  );
  
  // 2. Check for approval interruptions
  while (result.interruptions?.length > 0) {
    // 3. Present to CEO for approval
    const approvalUI = await showApprovalQueue(result.interruptions);
    
    // 4. CEO approves/edits/rejects
    for (const interruption of result.interruptions) {
      if (approvalUI.approved(interruption)) {
        result.state.approve(interruption);
      } else if (approvalUI.edited(interruption)) {
        // CEO edited the response
        const editedResponse = approvalUI.getEditedContent(interruption);
        result.state.approve(interruption, { overrideWith: editedResponse });
        
        // Learn from edit
        await trackCEOEdit({
          original: interruption.rawItem.arguments,
          edited: editedResponse,
          diff: calculateDiff(interruption.rawItem.arguments, editedResponse),
        });
      } else {
        result.state.reject(interruption);
      }
    }
    
    // 5. Resume execution with CEO decisions
    result = await run(chatwootAgent, result.state);
  }
  
  return result.finalOutput;
}
```

**Deliverables**:
- [ ] AI response system with needsApproval
- [ ] CEO approval queue UI
- [ ] Response generation with LlamaIndex
- [ ] Intent classification
- [ ] Confidence scoring
- [ ] Edit tracking for learning
- [ ] GitHub commit

### Task 2: Build Webhook Integration with Queuing (4-6 hours)
**Goal**: Reliable Chatwoot webhook processing

**Requirements** (Growth Spec A4):
- Queue-based processing (not synchronous)
- Replay protection (idempotency)
- HMAC validation
- Persistent storage

**Coordinate with Engineer on**:
- Webhook handler implementation
- Queue infrastructure
- Replay protection
- HMAC validation

**Your Contribution**:
- [ ] Chatwoot API integration
- [ ] Message parsing and normalization
- [ ] Conversation context management
- [ ] Coordinate with Engineer on webhook impl
- [ ] GitHub commit

### Task 3: Build Context Management (3-4 hours)
**Goal**: Maintain conversation context for AI

**Features**:
- Load previous messages from conversation
- Build context window for AI
- Handle multi-turn conversations
- Track conversation state

**Deliverables**:
- [ ] Context loader service
- [ ] Conversation history management
- [ ] Context window optimization
- [ ] State tracking
- [ ] GitHub commit

## Priority 2 - CX Intelligence

### Task 4: Build Sentiment Analysis (3-4 hours)
**Goal**: Real-time customer sentiment detection

**Features**:
- Analyze sentiment of customer messages
- Alert on negative sentiment
- Prioritize angry customers
- Track sentiment trends

**Deliverables**:
- [ ] Sentiment analyzer
- [ ] Real-time alerting
- [ ] Priority routing
- [ ] Trend dashboards
- [ ] GitHub commit

### Task 5: Build Auto-Escalation (3-4 hours)
**Goal**: Intelligent escalation to human agents

**Escalation Triggers**:
- Customer explicitly asks for human
- Sentiment is very negative
- AI confidence is low (<0.5)
- Message contains legal/threat language
- VIP customer

**Deliverables**:
- [ ] Escalation detection
- [ ] Auto-routing to human queue
- [ ] Alert notifications
- [ ] Escalation tracking
- [ ] GitHub commit

## Build CX Automation, Not Do CX Work

**✅ RIGHT**:
- Build AI responder (generates responses for CEO approval)
- Build auto-escalation (routes intelligently)
- Build sentiment analysis (monitors automatically)

**❌ WRONG**:
- Answer Chatwoot tickets yourself (not scalable)
- Manually route conversations (human hours wasted)
- Create one-off responses (doesn't learn)

## Evidence Required

- Git commits for all CX automation
- Human-in-the-loop approval workflow working
- CEO approval tracking proof
- Learning metrics (approval rate, edit frequency)
- Response time improvements

## Success Criteria

**Week 1 Complete When**:
- [ ] AI response system operational with CEO approval
- [ ] Webhook integration reliable (queue + replay protection)
- [ ] Conversation context management working
- [ ] Sentiment analysis monitoring all conversations
- [ ] Auto-escalation routing to humans appropriately
- [ ] CEO learning loop improving AI responses

**This enables**: Scalable CX with CEO oversight, AI learns CEO's voice/tone

## Report Every 2 Hours

Update `feedback/chatwoot.md`:
- Automation systems built
- Approval workflow status
- CEO feedback integration
- Performance metrics
- Evidence (commits, approval stats)

---

**Remember**: Build CX AUTOMATION SYSTEMS with CEO approval, not do CX work manually. Build systems that learn from CEO feedback.
