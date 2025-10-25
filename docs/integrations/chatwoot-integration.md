# Chatwoot Integration Reference

**Last Updated:** 2025-10-24
**Status:** Active

---

## Overview

Chatwoot is our customer communication platform for Email, Live Chat, and SMS support. This document provides essential information for agents building integrations with Chatwoot.

---

## Connection Details

### Base URL
```
https://hotdash-chatwoot.fly.dev
```

### Account ID
```
3
```

**⚠️ IMPORTANT:** This Account ID is required for all API-based integrations.

### API Documentation
- **Official Docs:** https://www.chatwoot.com/developers/api
- **API Base Path:** `/api/v1`
- **Full API URL:** `https://hotdash-chatwoot.fly.dev/api/v1`

---

## Authentication

### API Access Token

API tokens are required for programmatic access. To generate:

1. Login to Chatwoot: https://hotdash-chatwoot.fly.dev
2. Navigate to: Profile Settings → Access Token
3. Click "Create new token"
4. Copy and store securely in vault

**Storage Location:** `vault/occ/chatwoot/api-token.txt` (gitignored)

### Authentication Header

```bash
Authorization: Bearer YOUR_API_TOKEN
```

---

## Production Verification (Supabase DB)

Use this checklist to verify the production Chatwoot installation is fully connected to the correct database and available to the HotDash app.

Prerequisites:
- Production Chatwoot base URL: `https://hotdash-chatwoot.fly.dev`
- Account ID: `3` (verify in Chatwoot UI if uncertain)
- Valid API token (Profile → Access Token) stored securely (vault)
- HotDash production app on Fly: `hotdash-production`

1) Set Fly secrets on production (staged)

```
fly secrets set \
  CHATWOOT_BASE_URL="https://hotdash-chatwoot.fly.dev" \
  CHATWOOT_API_TOKEN="<api-token>" \
  CHATWOOT_TOKEN="<api-token>" \
  CHATWOOT_ACCOUNT_ID="3" \
  -a hotdash-production --stage
```

Note: Secrets are staged until the next deploy/restart. Apply during a safe window.

2) Quick service health (Chatwoot)

```
curl -sS -o /dev/null -w "API: %{http_code}\n" https://hotdash-chatwoot.fly.dev/api
```

Expect `API: 200` with JSON like `{ "version": "..." }`.

3) Authenticated API probe (requires token)

```
export CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev
export CHATWOOT_API_TOKEN=<api-token>
curl -sS -o /dev/null -w "Auth: %{http_code}\n" \
  -H "api_access_token: $CHATWOOT_API_TOKEN" \
  "$CHATWOOT_BASE_URL/api/v1/accounts/3/conversations?per_page=1"
```

Expect `Auth: 200`.

4) Database connectivity and schema (Chatwoot app)

Confirm the Chatwoot app is connected to the intended production database (Supabase). If schema-related errors appear in logs, run migrations/prepare within the Chatwoot app:

```
fly logs -a hotdash-chatwoot -n 200
fly ssh console -a hotdash-chatwoot -C "sh -lc 'bundle exec rails db:migrate:status'"
# If initial bootstrap is needed:
fly ssh console -a hotdash-chatwoot -C "sh -lc 'DISABLE_DATABASE_ENVIRONMENT_CHECK=1 bundle exec rails db:schema:load'"
```

Record evidence under `artifacts/ops/chatwoot-health/` and link it from the task or DecisionLog entry.

5) App-side integration check (HotDash)

Run the scripted health check from the repo to confirm both service and authenticated probes pass:

```
CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev \
CHATWOOT_API_TOKEN=<api-token> \
CHATWOOT_ACCOUNT_ID=3 \
npm run -s ops:check-chatwoot-health
```

Both checks should pass (200). The script writes an artifact in `artifacts/ops/chatwoot-health`.

6) Do not touch staging

All verification should be performed against production resources only (per current direction). Do not modify staging apps or secrets while production is being validated.


---

## Common API Endpoints

### Account Information

```bash
GET /api/v1/accounts/3
```

### Conversations

```bash
# List conversations
GET /api/v1/accounts/3/conversations

# Get specific conversation
GET /api/v1/accounts/3/conversations/{conversation_id}

# Create conversation
POST /api/v1/accounts/3/conversations
```

### Messages

```bash
# List messages in conversation
GET /api/v1/accounts/3/conversations/{conversation_id}/messages

# Send message
POST /api/v1/accounts/3/conversations/{conversation_id}/messages
```

### Contacts

```bash
# List contacts
GET /api/v1/accounts/3/contacts

# Get specific contact
GET /api/v1/accounts/3/contacts/{contact_id}

# Create contact
POST /api/v1/accounts/3/contacts
```

### Inboxes

```bash
# List inboxes
GET /api/v1/accounts/3/inboxes

# Get specific inbox
GET /api/v1/accounts/3/inboxes/{inbox_id}
```

---

## Integration Patterns

### AI Customer Agent Integration

The AI Customer agent uses Chatwoot for:
- Drafting replies to customer messages
- Reading conversation history
- Accessing customer contact information

**Key Endpoints:**
- `GET /api/v1/accounts/3/conversations?status=open` - Get open conversations
- `GET /api/v1/accounts/3/conversations/{id}/messages` - Get conversation history
- `POST /api/v1/accounts/3/conversations/{id}/messages` - Send reply (after HITL approval)

**HITL Workflow:**
1. AI drafts reply as Private Note
2. Human reviews and approves
3. System sends as Public Reply

### Webhook Integration

Chatwoot can send webhooks for events:
- New conversation created
- New message received
- Conversation status changed
- Contact created/updated

**Webhook URL Pattern:**
```
https://your-app.fly.dev/api/webhooks/chatwoot
```

**Webhook Payload:**
```json
{
  "event": "message_created",
  "account": {
    "id": 3,
    "name": "HotRodan"
  },
  "conversation": {
    "id": 123,
    "inbox_id": 1,
    "status": "open"
  },
  "message": {
    "id": 456,
    "content": "Customer message here",
    "message_type": "incoming"
  }
}
```

---

## Channel Configuration

### Email Inbox

**Purpose:** Customer support via email
**Email:** support@hotrodan.com (configure in Chatwoot)

### Website Live Chat

**Purpose:** Real-time chat on website
**Widget Code:** Available in Chatwoot → Settings → Inboxes → Website

### SMS (Twilio)

**Purpose:** SMS support
**Provider:** Twilio
**Configuration:** Chatwoot → Settings → Inboxes → SMS

---

## Database Schema

Chatwoot uses PostgreSQL. Key tables:

- `accounts` - Account information (ID: 3)
- `users` - User accounts
- `account_users` - User-account relationships
- `inboxes` - Communication channels
- `conversations` - Customer conversations
- `messages` - Individual messages
- `contacts` - Customer contact information

---

## Environment Variables

Required environment variables for Chatwoot integration:

```bash
# Chatwoot API
CHATWOOT_API_URL=https://hotdash-chatwoot.fly.dev/api/v1
CHATWOOT_ACCOUNT_ID=3
CHATWOOT_API_TOKEN=<your-api-token>

# Webhook verification (if using webhooks)
CHATWOOT_WEBHOOK_SECRET=<your-webhook-secret>
```

**Storage:** GitHub Secrets or `.env.local` (gitignored)

---

## Code Examples

### Node.js/TypeScript

```typescript
// Chatwoot API client
const CHATWOOT_API_URL = 'https://hotdash-chatwoot.fly.dev/api/v1';
const CHATWOOT_ACCOUNT_ID = 3;
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN;

async function getOpenConversations() {
  const response = await fetch(
    `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations?status=open`,
    {
      headers: {
        'Authorization': `Bearer ${CHATWOOT_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Chatwoot API error: ${response.statusText}`);
  }
  
  return response.json();
}

async function sendMessage(conversationId: number, content: string) {
  const response = await fetch(
    `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHATWOOT_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        message_type: 'outgoing',
        private: false,
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Chatwoot API error: ${response.statusText}`);
  }
  
  return response.json();
}
```

### cURL Examples

```bash
# Get open conversations
curl -X GET "https://hotdash-chatwoot.fly.dev/api/v1/accounts/3/conversations?status=open" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"

# Send message
curl -X POST "https://hotdash-chatwoot.fly.dev/api/v1/accounts/3/conversations/123/messages" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Thank you for contacting us!",
    "message_type": "outgoing",
    "private": false
  }'
```

---

## Rate Limits

Chatwoot API rate limits (default):
- **Per IP:** 100 requests per minute
- **Per User:** 60 requests per minute

**Best Practices:**
- Implement exponential backoff
- Cache responses when possible
- Use webhooks instead of polling

---

## Error Handling

Common HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Invalid or missing API token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "error": "Error message here",
  "message": "Detailed error description"
}
```

---

## Testing

### Test API Connection

```bash
# Test authentication
curl -X GET "https://hotdash-chatwoot.fly.dev/api/v1/accounts/3" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Expected response:
{
  "id": 3,
  "name": "HotRodan",
  "status": "active",
  ...
}
```

### Test Environments

- **Production:** https://hotdash-chatwoot.fly.dev
- **Staging:** (if configured)

---

## Monitoring

### Health Check

```bash
curl https://hotdash-chatwoot.fly.dev/api
```

Expected response: `200 OK` with API version info

### Fly.io Status

```bash
fly status -a hotdash-chatwoot
```

### Logs

```bash
fly logs -a hotdash-chatwoot
```

---

## Security Considerations

1. **API Tokens:**
   - Never commit to version control
   - Store in vault or GitHub Secrets
   - Rotate regularly (every 90 days)

2. **Webhook Verification:**
   - Verify webhook signatures
   - Use HTTPS only
   - Validate payload structure

3. **Data Privacy:**
   - Customer messages contain PII
   - Follow GDPR/privacy regulations
   - Implement data retention policies

---

## Troubleshooting

### API Token Invalid

**Symptom:** 401 Unauthorized
**Solution:** 
1. Verify token in Chatwoot UI
2. Check token hasn't expired
3. Regenerate if necessary

### Rate Limit Exceeded

**Symptom:** 429 Too Many Requests
**Solution:**
1. Implement exponential backoff
2. Reduce request frequency
3. Use webhooks instead of polling

### Connection Timeout

**Symptom:** Request timeout
**Solution:**
1. Check Fly.io app status
2. Verify network connectivity
3. Check Chatwoot logs for errors

---

## Support

### Documentation
- **Chatwoot Docs:** https://www.chatwoot.com/docs
- **API Reference:** https://www.chatwoot.com/developers/api
- **Community:** https://github.com/chatwoot/chatwoot/discussions

### Internal Resources
- **Deployment Runbook:** `docs/_archive/2025-10-15-misc/deployment/chatwoot_fly_runbook.md`
- **Setup Instructions:** `artifacts/devops/2025-10-24/chatwoot-admin-setup-instructions.md`
- **Investigation Evidence:** `artifacts/devops/2025-10-24/mcp/chatwoot-investigation.jsonl`

---

## Changelog

### 2025-10-24
- Initial setup completed
- Account ID: 3
- Super admin created: justin@hotrodan.com
- Database schema loaded
- Service restored and operational

---

## Quick Reference

| Item | Value |
|------|-------|
| **Base URL** | https://hotdash-chatwoot.fly.dev |
| **API Base** | https://hotdash-chatwoot.fly.dev/api/v1 |
| **Account ID** | 3 |
| **Admin Email** | justin@hotrodan.com |
| **Fly.io App** | hotdash-chatwoot |
| **Database App** | hotdash-chatwoot-db |
| **Status** | Active |

---

**For API-based integrations, always use Account ID: 3**
