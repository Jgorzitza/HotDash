# Chatwoot Multi-Channel Testing Guide

**Created**: 2025-10-21  
**Purpose**: Document multi-channel testing procedures for Chatwoot (email, SMS, live chat)  
**For**: Customer agent training and testing

---

## Environment Status

**Chatwoot Service**: ✅ OPERATIONAL

- **URL**: https://hotdash-chatwoot.fly.dev
- **API Version**: v1
- **Database**: Fresh Postgres cluster (hotdash-chatwoot-db.flycast:5432)
- **Account**: ID 1, "HotDash OCC Staging"
- **Credentials**: vault/occ/chatwoot/super_admin_staging.env

---

## Authentication

### Admin Login (API)

```bash
curl -X POST https://hotdash-chatwoot.fly.dev/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{
    "email":"justin@hotrodan.com",
    "password":"[from vault/occ/chatwoot/super_admin_staging.env]"
  }'
```

**Response**:

```json
{
  "data": {
    "access_token": "[from vault/occ/chatwoot/api_token.env]",
    "account_id": 1,
    "email": "justin@hotrodan.com",
    "id": 3,
    "name": "Justin Gorzitza",
    "role": "administrator"
  }
}
```

**Token**: Use `api_access_token: [token]` header for all subsequent requests

---

## Channel 1: Email Inbox

### Configuration Steps (Web UI)

1. **Login**: https://hotdash-chatwoot.fly.dev
   - Email: justin@hotrodan.com
   - Password: (from vault)

2. **Create Email Inbox**:
   - Navigate: Settings → Inboxes → Add Inbox
   - Select: Email
   - Configure:
     - Name: "Support Email"
     - Email: support@hotrodan.com (or test account)
     - Forward address: (Chatwoot provides)
3. **Setup Forwarding**:
   - Method 1: Forward all support@ emails to Chatwoot address
   - Method 2: Configure email provider to route directly

### API Configuration

```bash
# Create email inbox
curl -X POST "https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/inboxes" \
  -H "api_access_token: [from vault]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Email",
    "channel": {
      "type": "email",
      "email": "support@hotrodan.com",
      "imap_enabled": true,
      "imap_address": "imap.gmail.com",
      "imap_port": 993,
      "imap_login": "support@hotrodan.com",
      "imap_password": "[from vault]",
      "smtp_enabled": true,
      "smtp_address": "smtp.gmail.com",
      "smtp_port": 587,
      "smtp_login": "support@hotrodan.com",
      "smtp_password": "[from vault]"
    }
  }'
```

### Testing Email Channel

**Test Scenario 1: Inbound Email**

1. Send test email to support@hotrodan.com
2. Subject: "Test - Order Status Inquiry"
3. Body: "Hi, where is my order #12345?"
4. Expected: Appears in Chatwoot inbox within 60 seconds

**Test Scenario 2: Reply Flow**

1. Open conversation in Chatwoot
2. Draft reply: "We're checking order #12345 now"
3. Send reply
4. Expected: Customer receives email from support@hotrodan.com

**Test Scenario 3: Threading**

1. Customer replies to previous email
2. Expected: Reply appears in same conversation thread

**Metrics to Capture**:

- Time to inbox (send → appears in Chatwoot)
- Reply delivery time
- Threading accuracy (replies in correct conversation)

---

## Channel 2: SMS (Twilio/MessageBird)

### Credential Status

**BLOCKER**: SMS credentials not found in vault

- Checked: vault/occ/ (no twilio/ or messagebird/)
- Required:
  - Twilio Account SID
  - Twilio Auth Token
  - Twilio Phone Number (+1XXXXXXXXXX)
  - OR MessageBird API Key + Phone Number

**Credential Request Filed**: 2025-10-21T06:45:00Z (see feedback/support/2025-10-21.md)

### Configuration Steps (Once Credentials Available)

#### Option A: Twilio

**Web UI**:

1. Settings → Inboxes → Add Inbox
2. Select: Twilio SMS
3. Configure:
   - Name: "SMS Support"
   - Account SID: (from vault)
   - Auth Token: (from vault)
   - Phone Number: (from vault)
   - Callback URL: (Chatwoot provides)

**API**:

```bash
curl -X POST "https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/inboxes" \
  -H "api_access_token: [from vault]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SMS Support",
    "channel": {
      "type": "twilio",
      "phone_number": "+1XXXXXXXXXX",
      "account_sid": "[from vault]",
      "auth_token": "[from vault]"
    }
  }'
```

#### Option B: MessageBird

```bash
curl -X POST "https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/inboxes" \
  -H "api_access_token: [from vault]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SMS Support",
    "channel": {
      "type": "sms",
      "provider": "messagebird",
      "phone_number": "+1XXXXXXXXXX",
      "api_key": "[from vault]"
    }
  }'
```

### Testing SMS Channel

**Test Scenario 1: Inbound SMS**

1. Send SMS to Chatwoot number: "Hi, my order hasn't arrived"
2. Expected: Appears in Chatwoot inbox within 10 seconds

**Test Scenario 2: Reply Flow**

1. Open conversation
2. Draft reply: "Let me check your order status"
3. Send
4. Expected: Customer receives SMS within 5 seconds

**Test Scenario 3: Character Limits**

1. Send message >160 characters
2. Expected: SMS split into multiple messages OR truncated

**Test Scenario 4: Media Messages (MMS)**

1. Customer sends image (if supported)
2. Expected: Image appears in conversation

**Metrics to Capture**:

- Delivery time (send → inbox)
- Reply delivery time
- Character handling (long messages)
- Media support (yes/no, file types)

---

## Channel 3: Live Chat Widget

### Configuration Steps

**Web UI**:

1. Settings → Inboxes → Add Inbox
2. Select: Website
3. Configure:
   - Name: "Live Chat Widget"
   - Website URL: https://hotrodan.com (or staging)
   - Widget Color: #FF6B00 (Hot Rodan brand)
   - Welcome Message: "Rev up your questions! How can we help?"

**API**:

```bash
curl -X POST "https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/inboxes" \
  -H "api_access_token: [from vault]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Live Chat Widget",
    "channel": {
      "type": "web_widget",
      "website_url": "https://hotrodan.com",
      "welcome_title": "Welcome to Hot Rodan!",
      "welcome_tagline": "Rev up your questions! How can we help?",
      "widget_color": "#FF6B00"
    }
  }'
```

**Installation**:
Chatwoot provides widget code after creation. Add to site:

```html
<script>
  (function (d, t) {
    var BASE_URL = "https://hotdash-chatwoot.fly.dev";
    var g = d.createElement(t),
      s = d.getElementsByTagName(t)[0];
    g.src = BASE_URL + "/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g, s);
    g.onload = function () {
      window.chatwootSDK.run({
        websiteToken: "WIDGET_TOKEN_HERE",
        baseUrl: BASE_URL,
      });
    };
  })(document, "script");
</script>
```

### Testing Live Chat

**Test Scenario 1: Widget Load**

1. Open https://hotrodan.com (or staging with widget installed)
2. Expected: Chat bubble appears in bottom-right
3. Click bubble
4. Expected: Chat window opens with welcome message

**Test Scenario 2: Inbound Message**

1. Type in widget: "Is this product in stock?"
2. Send
3. Expected: Message appears in Chatwoot inbox within 2 seconds

**Test Scenario 3: Real-Time Reply**

1. Agent replies in Chatwoot: "Let me check for you"
2. Expected: Customer sees reply in widget within 1 second

**Test Scenario 4: File Upload**

1. Click attachment icon (if available)
2. Upload test image
3. Expected: Image appears in Chatwoot conversation

**Test Scenario 5: Typing Indicators**

1. Customer types (don't send)
2. Expected: Agent sees "typing..." indicator
3. Agent types
4. Expected: Customer sees "Agent is typing..."

**Metrics to Capture**:

- Widget load time
- Message delivery latency (customer → Chatwoot)
- Reply delivery latency (Chatwoot → customer)
- Typing indicator delay
- File upload support (yes/no, max size)

---

## Multi-Channel Test Scenarios

### Scenario 1: Channel Switching

1. Customer emails support@hotrodan.com
2. Agent replies via email
3. Customer switches to live chat with same question
4. **Test**: Can agent see previous email conversation?
5. **Expected**: No automatic linking (separate conversations)

### Scenario 2: Concurrent Channels

1. Customer sends email
2. Before agent replies, customer sends SMS
3. **Test**: Do both appear as separate conversations?
4. **Expected**: Yes, separate inbox entries

### Scenario 3: Agent Assignment

1. 3 conversations arrive (1 email, 1 SMS, 1 chat)
2. **Test**: How are they assigned to agents?
3. **Expected**: Round-robin OR manual assignment

### Scenario 4: Conversation Resolution

1. Resolve conversation in one channel
2. Customer messages in different channel
3. **Test**: Does new channel create new conversation?
4. **Expected**: Yes (channels are independent)

---

## Agent Reply Flow (HITL Workflow)

### Current Flow (Basic Chatwoot)

1. Message arrives → Inbox
2. Agent reads → Types reply
3. Agent sends → Customer receives

### Target Flow (AI-Customer Integration)

1. Message arrives → Inbox
2. **AI drafts reply** → Stored as Private Note
3. **Agent reviews draft** → Approves/Edits
4. **Agent sends** → Customer receives
5. **Agent grades** → Tone/Accuracy/Policy (1-5)
6. **System learns** → decision_log table

### Testing HITL Flow

**When AI-Customer Integration Complete**:

1. Send test message: "Where is my order?"
2. Expected: AI draft appears as Private Note
3. Agent reviews, grades (tone: 5, accuracy: 4, policy: 5)
4. Agent approves
5. Expected: Message sent + grades stored in database

**Grading Criteria**:

- **Tone** (1-5): Friendly, professional, brand-consistent
- **Accuracy** (1-5): Correct information, no hallucinations
- **Policy** (1-5): Follows support policies, escalation rules

---

## Performance Benchmarks

### Target Metrics (from NORTH_STAR.md)

| Metric         | Target | Channel        |
| -------------- | ------ | -------------- |
| Inbox latency  | <60s   | Email          |
| Inbox latency  | <10s   | SMS            |
| Inbox latency  | <2s    | Live Chat      |
| Reply latency  | <5s    | All channels   |
| Uptime         | 99.9%  | Service        |
| AI draft rate  | ≥90%   | CX automation  |
| Approval grade | ≥4.5   | Tone           |
| Approval grade | ≥4.7   | Accuracy       |
| Approval grade | ≥4.8   | Policy         |
| SLA (review)   | ≤15min | Business hours |

### Actual Performance (To Be Measured)

| Metric             | Email | SMS     | Chat |
| ------------------ | ----- | ------- | ---- |
| Inbox latency      | TBD   | BLOCKED | TBD  |
| Reply latency      | TBD   | BLOCKED | TBD  |
| Threading accuracy | TBD   | BLOCKED | TBD  |
| File upload        | TBD   | BLOCKED | TBD  |
| Typing indicators  | N/A   | N/A     | TBD  |

---

## Health Monitoring

### Service Health Check

**Script**: scripts/ops/check-chatwoot-health.mjs

```bash
node scripts/ops/check-chatwoot-health.mjs
```

**Checks**:

- Service uptime (HTTP 200)
- API responsiveness
- Database connectivity
- Conversation count

**Output**:

- Health status (UP/DOWN)
- Response time
- Active conversations
- Agent count

### Dashboard Integration

**Route**: app/routes/admin.chatwoot-health.tsx (SUPPORT-003 spec)

**Displays**:

- Service uptime (current: ✅)
- Response time (median, P90)
- Conversation count (open, pending, resolved)
- SLA compliance (% under 2h target)
- Channel breakdown (email vs SMS vs chat %)
- Agent availability

---

## Issue Tracking

### Known Issues

1. **SMS Credentials Missing** (P1 BLOCKER)
   - Status: Credential request filed 2025-10-21T06:45:00Z
   - Impact: Cannot test SMS channel
   - Resolution: Awaiting Manager/CEO
   - Workaround: Test email + chat (2 of 3 channels)

2. **Browser Network Errors** (P2)
   - Status: Chrome DevTools navigation failing with net::ERR_NETWORK_CHANGED
   - Impact: Cannot test via web UI interactively
   - Resolution: Use API-based testing (documented above)
   - Workaround: API configuration + monitoring

### Resolved Issues

1. **Chatwoot Service Down** (P0) - RESOLVED 2025-10-21T01:21Z
   - Manager migrated database to Supabase
   - Service operational: https://hotdash-chatwoot.fly.dev
   - Health checks passing

---

## Next Steps

### Immediate (Today):

1. ✅ Document multi-channel testing procedures (this guide)
2. ⏸️ Test email channel (pending browser access OR API setup)
3. ⏸️ Test live chat channel (pending browser access OR API setup)
4. ⏸️ Test SMS channel (blocked on credentials)

### Short-Term (Week 1):

1. Configure all 3 channels (when SMS credentials available)
2. Execute 20 test scenarios (from SUPPORT-002)
3. Measure performance benchmarks
4. Document findings in feedback

### Medium-Term (Week 2-3):

1. Integrate with AI-Customer agent (HITL workflow)
2. Test grading system (tone/accuracy/policy)
3. Train customer agent with test conversations
4. Deploy to production (pending CEO approval)

---

## References

- **Direction File**: docs/directions/support.md (v5.1)
- **Test Scenarios**: docs/support/chatwoot-test-scenarios.md (SUPPORT-002, 20 scenarios)
- **Health Dashboard**: docs/support/chatwoot-health-dashboard-spec.md (SUPPORT-003)
- **Integration Doc**: docs/integrations/chatwoot.md
- **NORTH STAR**: docs/NORTH_STAR.md (CX metrics, SLA targets)
- **Credentials**: vault/occ/chatwoot/ (6 files)

---

**Document Status**: COMPLETE
**Next Update**: After channel testing execution
**Owner**: Support Agent
**Created**: 2025-10-21T07:00:00Z
