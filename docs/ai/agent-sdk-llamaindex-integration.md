# Agent SDK + LlamaIndex MCP Integration Guide

**Version**: 1.0.0  
**Updated**: 2025-10-14T12:45:00Z  
**Owners**: AI Agent + Engineer Agent  
**Status**: Production Ready

## Overview

The Agent SDK uses LlamaIndex MCP to query the Hot Rod AN knowledge base and generate contextual responses for customer inquiries. This guide covers integration patterns, expected formats, and troubleshooting.

## Architecture

```
Customer Message → Agent SDK → LlamaIndex MCP → Knowledge Base
                              ↓
                    Draft Response ← Query Results
                              ↓
                    Approval Queue → Operator Review → Send to Customer
```

## LlamaIndex MCP Endpoints

### 1. Query Support (`query_support`)
**Purpose**: Search knowledge base and return relevant information

**Request**:
```json
{
  "query": "How do I install AN6 fittings?",
  "topK": 5,
  "confidence_threshold": 0.7
}
```

**Response**:
```json
{
  "ok": true,
  "query": "How do I install AN6 fittings?",
  "response": "To install AN6 fittings: 1) Cut hose square...",
  "sources": [
    {
      "id": "doc-123",
      "score": 0.95,
      "text": "Installation procedure for PTFE fittings...",
      "metadata": {
        "source": "data/technical/an-sizing-guide.md",
        "url": "https://hotrodan.com/pages/installation-instructions"
      }
    }
  ],
  "metadata": {
    "latency_ms": 245,
    "cache_hit": false,
    "topK": 5
  }
}
```

### 2. Refresh Index (`refresh_index`)
**Purpose**: Rebuild knowledge base with latest content

**Request**:
```json
{
  "sources": "all",  // or "web", "supabase", "curated"
  "full": false      // true for complete rebuild
}
```

**Response**:
```json
{
  "ok": true,
  "runDir": "/path/to/build/run-20251014T1245Z",
  "count": 259,
  "sources": ["web", "supabase", "curated"],
  "duration": 45000,
  "timestamp": "2025-10-14T12:45:00Z"
}
```

### 3. Insight Report (`insight_report`)
**Purpose**: Generate analytics and insights from knowledge base

**Request**:
```json
{
  "window": "7d",   // 1d, 7d, 24h, etc.
  "format": "json"  // json, md, txt
}
```

**Response**:
```json
{
  "ok": true,
  "period": "7d",
  "top_queries": [...],
  "knowledge_gaps": [...],
  "quality_metrics": {...}
}
```

## Agent SDK Integration Pattern

### Step 1: Receive Customer Message
```typescript
const customerMessage = chatwootWebhook.content;
const conversationId = chatwootWebhook.conversation_id;
```

### Step 2: Query LlamaIndex MCP
```typescript
const mcpResponse = await fetch('https://hotdash-llamaindex-mcp.fly.dev/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: customerMessage,
    topK: 5
  })
});

const { response, sources, metadata } = await mcpResponse.json();
```

### Step 3: Generate Draft Response
```typescript
const draftResponse = await generateResponse({
  customerMessage,
  knowledgeContext: response,
  sources,
  template: selectTemplate(customerMessage)
});
```

### Step 4: Queue for Approval
```typescript
await supabase.from('agent_approvals').insert({
  conversation_id: conversationId,
  customer_message: customerMessage,
  draft_response: draftResponse,
  knowledge_sources: sources,
  confidence_score: calculateConfidence(sources),
  status: 'pending'
});
```

## Response Format Standards

### Draft Response Structure
```json
{
  "message": "Hey! For your {{horsepower}} HP build...",
  "confidence": 85,
  "sources": [
    {
      "title": "Fuel System Sizing Guide",
      "url": "https://hotrodan.com/...",
      "relevance": 0.92
    }
  ],
  "suggested_tags": ["fuel_system", "sizing", "technical_support"],
  "recommended_action": "send" // or "review", "escalate"
}
```

### Confidence Score Calculation
- **High (80-100)**: Direct match in knowledge base, send automatically
- **Medium (50-79)**: Requires operator review
- **Low (<50)**: Escalate to human, don't send draft

## Error Handling

### MCP Service Down
```typescript
try {
  const response = await queryMCP(message);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    // Fallback: Use canned_responses table
    const fallback = await getCannedResponse(detectCategory(message));
    await createApprovalWithFallback(fallback);
  }
}
```

### Low Confidence Response
```typescript
if (confidence < 50) {
  await createApproval({
    draft_response: response,
    recommended_action: 'escalate',
    operator_notes: 'Low confidence - human review required'
  });
}
```

### No Knowledge Found
```typescript
if (sources.length === 0) {
  const fallbackMessage = "Thanks for reaching out! This is a great question - let me get you the most accurate answer. One of our team members will respond shortly with details specific to your build.";
  await createApproval({
    draft_response: fallbackMessage,
    recommended_action: 'escalate',
    priority: 'high'
  });
}
```

## Troubleshooting Guide

### Problem: MCP Returns Empty Results
**Symptoms**: `sources: []`, no knowledge found

**Troubleshooting**:
1. Check if knowledge base is empty (refresh_index)
2. Verify query isn't too specific/niche
3. Try broader search terms
4. Check MCP server logs for errors

**Solution**: Expand knowledge base or use fallback responses

### Problem: High Latency (>1s)
**Symptoms**: Slow response times, timeout errors

**Troubleshooting**:
1. Check MCP server health endpoint
2. Monitor index size (too large?)
3. Verify network connection
4. Check if index needs optimization

**Solution**: Implement caching, optimize topK parameter

### Problem: Low Quality Responses
**Symptoms**: Irrelevant answers, low operator approval rate

**Troubleshooting**:
1. Review knowledge sources returned
2. Check if query matches knowledge
3. Analyze operator edits for patterns
4. Verify prompt engineering

**Solution**: Update prompts, fill knowledge gaps, adjust confidence thresholds

### Problem: Inconsistent Brand Voice
**Symptoms**: Responses don't match Hot Rod AN tone

**Troubleshooting**:
1. Review response templates used
2. Check if brand voice guide being referenced
3. Analyze approved vs rejected responses

**Solution**: Update templates, refine prompts, train on approved responses

## Testing & Validation

### Test Queries (Pre-Deployment)
1. "What size AN hose for 500 HP?"
2. "How do I install PTFE fittings?"
3. "When will my order ship?"
4. "I need to return wrong size fittings"
5. "What's your warranty policy?"

**Expected**: All should return relevant, accurate responses with confidence >70%

### Validation Checklist
- [ ] All test queries return results
- [ ] Sources are relevant and accurate
- [ ] Response time <500ms P95
- [ ] Brand voice maintained
- [ ] Confidence scores calibrated
- [ ] Error handling tested
- [ ] Fallback system works

## Example Queries & Responses

### Technical Query
**Customer**: "I'm building a 600 HP LS3, what fuel line size?"

**MCP Query**: "fuel line sizing 600 horsepower LS"

**Expected Sources**:
- fuel-system-basics.md (sizing table)
- ls-swap-fuel-system.md (LS-specific guidance)

**Expected Response**: "For 600 HP on your LS3, you'll want AN8 fuel lines. They flow enough for 450-800 HP, so you've got headroom. AN6 would be too small and restrict flow. I'd recommend our black nylon braided PTFE - durable and looks great. Need the complete fuel system kit?"

### Product Query
**Customer**: "Do you have stainless braided hose in AN6?"

**MCP Query**: "stainless braided hose AN6 available"

**Expected Sources**:
- Product pages (from hotrodan.com crawl)
- an-sizing-guide.md (specifications)

**Expected Response**: "Yes! We've got PTFE lined stainless braided hose in AN6. It's perfect for fuel systems, super durable, and handles all fuels including E85. Comes in 10-foot spools or we can cut custom lengths. How many feet do you need for your build?"

### Support Query
**Customer**: "Where's my tracking number?"

**MCP Query**: "tracking number order status"

**Expected Sources**:
- order-tracking.md (tracking procedures)
- shipping-policy.md (processing times)

**Expected Response**: "I'll grab that for you! Can you give me your order number? Tracking info gets emailed when your order ships (usually within 1-2 business days). If you placed your order recently, it might be getting ready to ship. Let me check status for you."

## Integration Checklist

### Agent SDK Requirements
- [ ] LlamaIndex MCP URL configured
- [ ] Authentication setup (if required)
- [ ] Timeout configured (5s recommended)
- [ ] Retry logic implemented
- [ ] Fallback system ready
- [ ] Logging/monitoring active

### Knowledge Base Requirements
- [ ] Index built and deployed
- [ ] Content comprehensive (10+ docs minimum)
- [ ] Regular refresh schedule (daily/weekly)
- [ ] Brand voice validated
- [ ] Test queries validated

### Approval Queue Requirements
- [ ] Supabase tables created
- [ ] UI for operator review
- [ ] Notification system working
- [ ] Edit capture functional
- [ ] Training data collection active

## Monitoring

### Key Metrics
- Query volume (queries/hour)
- Response latency (P50, P95, P99)
- Approval rate (%)
- Edit rate (%)
- Knowledge coverage (%)
- MCP uptime (%)

### Alerts
- MCP down >5 minutes → Page engineer
- Approval rate <70% for 24h → Review knowledge/prompts
- Latency >1s P95 → Optimize or scale

## Support & Escalation

**For Integration Questions**: Tag @engineer in feedback
**For Knowledge Gaps**: Tag @support in feedback
**For Quality Issues**: Tag @ai in feedback
**For Outages**: Follow incident response runbook

**Primary Reference**: docs/runbooks/llamaindex_workflow.md

