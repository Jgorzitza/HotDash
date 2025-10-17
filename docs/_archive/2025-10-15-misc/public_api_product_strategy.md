# Public API Product Strategy

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Status**: Planned for Phase 3 (Q2 2026)

---

## Executive Summary

Expose HotDash Agent SDK capabilities via public API, enabling customers to build custom integrations, automate workflows, and extend the platform.

**Value Proposition**: "Agent SDK as a Platform"—customers can integrate AI support into their existing systems

**Timeline**: Beta API in Month 6 (Apr 2026), GA in Month 9 (Jul 2026)

---

## API Vision

### What Customers Can Do with Public API

1. **Trigger Draft Generation**: Send customer inquiry → Get AI draft
2. **Query Knowledge Base**: Search KB programmatically
3. **Submit Feedback**: Training data for learning loop
4. **Retrieve Metrics**: Pull approval rates, performance data
5. **Automate Workflows**: Build custom approval processes
6. **Integrate Systems**: Connect HotDash to CRM, help desk, etc.

---

## API Capabilities

### Core Endpoints

**POST /api/v1/drafts/generate**

```json
Request:
{
  "customer_message": "Where is my order #12345?",
  "context": {
    "customer_id": "cust_789",
    "conversation_history": [...]
  }
}

Response:
{
  "draft_id": "draft_abc123",
  "draft_response": "Hi John, your order shipped...",
  "confidence_score": 0.87,
  "sources": [...],
  "suggested_action": "approve"
}
```

**POST /api/v1/drafts/{draft_id}/approve**

```json
Request:
{
  "action": "approve" | "edit" | "escalate" | "reject",
  "edited_response": "..." (if edited)
}

Response:
{
  "status": "approved",
  "sent_to_customer": true
}
```

**GET /api/v1/knowledge-base/search**

```json
Request:
{
  "query": "What is your return policy?",
  "top_k": 5
}

Response:
{
  "results": [
    {
      "title": "Return Policy",
      "content": "...",
      "relevance": 0.95
    }
  ]
}
```

---

## Pricing for API Access

### API Pricing Tiers

**Included in Plans**:

- Managed Basic: 1,000 API calls/month
- Enterprise: 10,000 API calls/month

**Overage Pricing**:

- $0.01 per API call beyond included amount

**Rationale**: Align with value (API enables automation, customers willing to pay)

---

**Document Owner**: Product Agent  
**Status**: Strategy Defined - Implementation in Month 6
