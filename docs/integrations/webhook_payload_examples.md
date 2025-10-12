# Chatwoot Webhook Payload Examples

## Purpose

This document provides real-world examples of Chatwoot webhook payloads for testing and validation of the Agent SDK integration.

## Test Payload 1: New Customer Message

**Event:** `message_created`  
**Use Case:** Customer asks about order status

```json
{
  "event": "message_created",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "inbox": {
    "id": 1,
    "name": "customer.support@hotrodan.com",
    "channel_type": "Channel::Email"
  },
  "conversation": {
    "id": 101,
    "inbox_id": 1,
    "status": "open",
    "created_at": 1728676800,
    "timestamp": 1728676800,
    "contact_last_seen_at": 1728676800,
    "agent_last_seen_at": null,
    "unread_count": 1,
    "meta": {
      "sender": {
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    },
    "contact": {
      "id": 50,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": null,
      "avatar": null,
      "custom_attributes": {}
    },
    "messages": [
      {
        "id": 201,
        "content": "Hi, I placed an order last week (Order #12345) and I haven't received any tracking information yet. Can you help me with this?",
        "message_type": 0,
        "content_type": "text",
        "content_attributes": {},
        "created_at": 1728676800,
        "private": false,
        "sender": {
          "id": 50,
          "name": "John Doe",
          "type": "contact",
          "email": "john.doe@example.com"
        }
      }
    ]
  },
  "message": {
    "id": 201,
    "content": "Hi, I placed an order last week (Order #12345) and I haven't received any tracking information yet. Can you help me with this?",
    "message_type": 0,
    "content_type": "text",
    "content_attributes": {},
    "created_at": 1728676800,
    "private": false,
    "sender": {
      "id": 50,
      "name": "John Doe",
      "type": "contact",
      "email": "john.doe@example.com"
    }
  }
}
```

## Test Payload 2: New Conversation Created

**Event:** `conversation_created`  
**Use Case:** First message from new customer

```json
{
  "event": "conversation_created",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "inbox": {
    "id": 1,
    "name": "customer.support@hotrodan.com",
    "channel_type": "Channel::Email"
  },
  "conversation": {
    "id": 102,
    "inbox_id": 1,
    "status": "open",
    "created_at": 1728680400,
    "timestamp": 1728680400,
    "contact_last_seen_at": 1728680400,
    "agent_last_seen_at": null,
    "unread_count": 1,
    "contact": {
      "id": 51,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1234567890",
      "custom_attributes": {
        "customer_segment": "VIP",
        "lifetime_value": 1500
      }
    }
  }
}
```

## Test Payload 3: Agent Reply (Should be Filtered)

**Event:** `message_created`  
**Use Case:** Agent sends reply (should NOT trigger Agent SDK)

```json
{
  "event": "message_created",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "inbox": {
    "id": 1,
    "name": "customer.support@hotrodan.com"
  },
  "conversation": {
    "id": 101,
    "inbox_id": 1,
    "status": "open",
    "created_at": 1728676800,
    "contact": {
      "id": 50,
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  },
  "message": {
    "id": 202,
    "content": "Hi John! I've looked up your order #12345. It shipped yesterday via USPS. Here's the tracking number: 9400111899562539876543",
    "message_type": 1,
    "content_type": "text",
    "created_at": 1728677000,
    "private": false,
    "sender": {
      "id": 10,
      "name": "Support Agent",
      "type": "user",
      "email": "support@hotrodan.com"
    }
  }
}
```

**Expected Behavior:** Webhook should filter this out because `sender.type === "user"` (not "contact")

## Test Payload 4: Private Note (Should be Filtered)

**Event:** `message_created`  
**Use Case:** Agent adds internal note

```json
{
  "event": "message_created",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "inbox": {
    "id": 1,
    "name": "customer.support@hotrodan.com"
  },
  "conversation": {
    "id": 101,
    "inbox_id": 1,
    "status": "open",
    "created_at": 1728676800,
    "contact": {
      "id": 50,
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  },
  "message": {
    "id": 203,
    "content": "Customer has history of shipping delays. Be proactive with updates.",
    "message_type": 0,
    "content_type": "text",
    "created_at": 1728677100,
    "private": true,
    "sender": {
      "id": 10,
      "name": "Support Agent",
      "type": "user",
      "email": "support@hotrodan.com"
    }
  }
}
```

**Expected Behavior:** Webhook should filter this out because `sender.type === "user"` (not "contact")

## Test Payload 5: Resolved Conversation

**Event:** `conversation_status_changed`  
**Use Case:** Agent marks conversation as resolved

```json
{
  "event": "conversation_status_changed",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "conversation": {
    "id": 101,
    "inbox_id": 1,
    "status": "resolved",
    "created_at": 1728676800,
    "updated_at": 1728677500,
    "contact": {
      "id": 50,
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

**Agent SDK Action:** Remove from approval queue if present

## Test Payload 6: Urgent Customer Issue

**Event:** `message_created`  
**Use Case:** High-priority customer complaint

```json
{
  "event": "message_created",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "inbox": {
    "id": 1,
    "name": "customer.support@hotrodan.com"
  },
  "conversation": {
    "id": 103,
    "inbox_id": 1,
    "status": "open",
    "created_at": 1728684000,
    "priority": "urgent",
    "contact": {
      "id": 52,
      "name": "Angry Customer",
      "email": "angry@example.com",
      "custom_attributes": {
        "previous_complaints": 3,
        "vip_status": true
      }
    }
  },
  "message": {
    "id": 204,
    "content": "This is the third time I'm reaching out about my missing order! I want a FULL REFUND immediately. I'm extremely disappointed and considering legal action if this isn't resolved TODAY.",
    "message_type": 0,
    "content_type": "text",
    "created_at": 1728684000,
    "sender": {
      "id": 52,
      "name": "Angry Customer",
      "type": "contact",
      "email": "angry@example.com"
    }
  }
}
```

**Expected Agent SDK Behavior:**
- Sentiment analysis: "angry", urgency: "high"
- Confidence score: Likely LOW (< 70%)
- Recommended action: "escalate" to senior support
- Create draft but flag for immediate operator review

## Test Payload 7: Simple FAQ Question

**Event:** `message_created`  
**Use Case:** Common question with high-confidence answer

```json
{
  "event": "message_created",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "inbox": {
    "id": 1,
    "name": "customer.support@hotrodan.com"
  },
  "conversation": {
    "id": 104,
    "inbox_id": 1,
    "status": "open",
    "created_at": 1728687600,
    "contact": {
      "id": 53,
      "name": "New Customer",
      "email": "newbie@example.com"
    }
  },
  "message": {
    "id": 205,
    "content": "What's your return policy?",
    "message_type": 0,
    "content_type": "text",
    "created_at": 1728687600,
    "sender": {
      "id": 53,
      "name": "New Customer",
      "type": "contact",
      "email": "newbie@example.com"
    }
  }
}
```

**Expected Agent SDK Behavior:**
- LlamaIndex retrieves: "Return Policy" knowledge base article
- Confidence score: HIGH (> 90%)
- Recommended action: "approve"
- Draft response with clear return policy details

## Webhook Signature Example

For testing signature verification:

```typescript
const crypto = require('crypto');

const payload = JSON.stringify(testPayload);
const secret = 'your_webhook_secret';

const hmac = crypto.createHmac('sha256', secret);
hmac.update(payload);
const signature = hmac.digest('hex');

console.log('X-Chatwoot-Signature:', signature);
```

## Testing Checklist

- [ ] Customer message in open conversation → Triggers Agent SDK
- [ ] Agent message → Filtered out
- [ ] Private note → Filtered out
- [ ] Message in resolved conversation → Filtered out
- [ ] High-urgency message → Escalation recommended
- [ ] Simple FAQ → High confidence draft
- [ ] Invalid signature → Rejected with 401
- [ ] Missing required fields → Rejected with 400

## Integration Testing Script

```bash
#!/bin/bash

# Test webhook endpoint
WEBHOOK_URL="http://localhost:54321/functions/v1/chatwoot-webhook"
SECRET="test_webhook_secret"

# Generate signature
generate_signature() {
  echo -n "$1" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/.* //'
}

# Test 1: Valid customer message
PAYLOAD=$(cat test-payload-1.json)
SIGNATURE=$(generate_signature "$PAYLOAD")

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Chatwoot-Signature: $SIGNATURE" \
  -d "$PAYLOAD"

# Expected: 200 OK, draft created

# Test 2: Invalid signature
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Chatwoot-Signature: invalid_signature" \
  -d "$PAYLOAD"

# Expected: 401 Unauthorized

# Test 3: Agent message (should be filtered)
PAYLOAD=$(cat test-payload-3.json)
SIGNATURE=$(generate_signature "$PAYLOAD")

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Chatwoot-Signature: $SIGNATURE" \
  -d "$PAYLOAD"

# Expected: 200 OK, filtered: true
```

## References

- [Chatwoot Webhook Documentation](https://www.chatwoot.com/docs/product/channels/api/webhooks)
- [Agent SDK Integration Spec](../AgentSDKopenAI.md)
- [Webhook Handler Implementation](../../supabase/functions/chatwoot-webhook/index.ts)

