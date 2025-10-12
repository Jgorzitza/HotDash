# Chatwoot Admin Configuration Guide

**Purpose:** Document super admin setup, API token generation, and account configuration best practices  
**Date:** 2025-10-11  
**Status:** Production Ready

---

## Super Admin Setup Process

### Initial Super Admin Creation

**Method:** Rails console via Fly.io SSH

```bash
# SSH into Chatwoot app
fly ssh console --app hotdash-chatwoot

# Create super admin
bundle exec rails runner "
  user = User.create!(
    email: 'superadmin+staging@hotrodan.com',
    password: 'SECURE_PASSWORD_HERE',
    name: 'HotDash Admin',
    confirmed_at: Time.now,
    password_confirmation: 'SECURE_PASSWORD_HERE'
  )
  
  AccountUser.create!(
    account_id: 1,
    user_id: user.id,
    role: :administrator
  )
  
  puts \"Super Admin Created: #{user.email}\"
"
```

**Credentials Storage:**
- **Location:** `vault/occ/chatwoot/super_admin_staging.env`
- **Format:**
  ```bash
  CHATWOOT_SUPER_ADMIN_EMAIL=superadmin+staging@hotrodan.com
  CHATWOOT_SUPER_ADMIN_PASSWORD=SECURE_PASSWORD
  ```

**Security Notes:**
- Use strong password (16+ characters, mixed case, numbers, symbols)
- Rotate password every 90 days
- Enable 2FA once Chatwoot supports it
- Never commit credentials to git

---

## API Token Generation (Correct Scopes)

### Step 1: Access Token Settings

1. Log in to Chatwoot as super admin
2. Navigate to: **Settings** (gear icon) → **Integrations** → **API**
3. Click **"+ Add Access Token"**

### Step 2: Configure Token Scopes

**For Agent SDK Integration:**

| Scope | Required | Purpose |
|-------|----------|---------|
| **Conversations** | ✅ Yes | Read conversations, create messages |
| **Messages** | ✅ Yes | Create private notes and public replies |
| **Contacts** | ✅ Yes | Access customer information |
| **Inbox** | ✅ Yes | List and manage inboxes |
| **Teams** | ⚠️ Optional | If using team-based routing |
| **Agent** | ✅ Yes | Assign agents to conversations |
| **Labels** | ✅ Yes | Add tags for categorization |
| **Webhooks** | ❌ No | Not needed (configured separately) |
| **Reports** | ⚠️ Optional | If generating analytics |

**Recommended Configuration:**
```
Token Name: Agent SDK Integration - Staging
Scopes: conversations, messages, contacts, inbox, agent, labels
Description: API token for Agent SDK approval queue integration
Expiration: Never (or 1 year with calendar reminder)
```

### Step 3: Store Token Securely

**After Generation:**

1. Copy token immediately (shown only once)
2. Store in vault:
   ```bash
   echo "CHATWOOT_API_TOKEN_STAGING=<token_here>" > vault/occ/chatwoot/api_token_staging.env
   echo "CHATWOOT_ACCOUNT_ID_STAGING=1" >> vault/occ/chatwoot/api_token_staging.env
   chmod 600 vault/occ/chatwoot/api_token_staging.env
   ```
3. Test token:
   ```bash
   source vault/occ/chatwoot/api_token_staging.env
   curl -H "api_access_token: $CHATWOOT_API_TOKEN_STAGING" \
     https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/conversations
   ```

### Step 4: Mirror to GitHub Secrets (Production)

```bash
# For GitHub Actions
gh secret set CHATWOOT_API_TOKEN_STAGING --body "$CHATWOOT_API_TOKEN_STAGING"
gh secret set CHATWOOT_ACCOUNT_ID_STAGING --body "1"
```

---

## Account Configuration Best Practices

### Account Settings

**Navigation:** Settings → Account Settings

**Recommended Configuration:**

```yaml
General:
  Name: "HotDash Support"
  Language: English (en)
  Domain: hotdash-chatwoot.fly.dev (or custom domain)
  Support Email: customer.support@hotrodan.com

Features:
  Auto Resolve Conversations: 7 days of inactivity
  Auto Assignment: Enabled (for load balancing)
  CSAT Survey: Enabled (after resolution)
  Continuous Chat: Disabled (email-based support)

Business Hours:
  Timezone: America/Los_Angeles (PST/PDT)
  Working Hours: 9 AM - 5 PM PST
  Working Days: Monday - Friday
  Out of Office Message: Enabled (with expected response time)

Limits:
  File Upload Size: 40 MB (default)
  Conversation Limit: Unlimited
  Agent Limit: Based on Fly.io resources
```

### Inbox Configuration

**For customer.support@hotrodan.com:**

```yaml
Inbox Type: Email
Name: Customer Support
Email: customer.support@hotrodan.com
Enable IMAP: Yes (for receiving)
Enable SMTP: Yes (for sending)

IMAP Settings:
  - Host: (provider-specific)
  - Port: 993 (SSL)
  - Username: customer.support@hotrodan.com
  - Password: (from vault/occ/email/customer_support.env)

SMTP Settings:
  - Host: (provider-specific)
  - Port: 587 (TLS) or 465 (SSL)
  - Username: customer.support@hotrodan.com
  - Password: (same as IMAP or app-specific password)
  - Enable STARTTLS: Yes

Auto Assignment: Enabled
Greeting Message: 
  "Thank you for contacting HotDash support! 
   We've received your message and will respond within 24 hours."

CSAT: Enabled after resolution
```

### Agent Accounts

**Agent Types:**

1. **Super Admin** (1)
   - Full system access
   - Configure settings, webhooks, integrations
   - Create other admin/agent accounts

2. **Administrator** (2-3)
   - Manage agents and teams
   - View reports and analytics
   - Configure inboxes and workflows

3. **Agent** (5-10)
   - Handle conversations
   - Use approval queue
   - Access knowledge base

**Agent Creation Process:**

```bash
# Via UI: Settings → Agents → Add Agent
Name: [Agent Name]
Email: [agent@hotrodan.com]
Role: Agent (or Administrator)
Team: Support Team
Auto-assign: Yes
```

**Agent Onboarding Checklist:**
- [ ] Account created with correct role
- [ ] Added to appropriate team
- [ ] Auto-assignment enabled
- [ ] Trained on approval queue workflow
- [ ] Tested private note creation
- [ ] Tested public reply sending

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: API Token Not Working

**Symptoms:**
- API calls return 401 Unauthorized
- `Chatwoot::API::UnauthorizedError`

**Solutions:**
1. Verify token hasn't expired
2. Check token has correct scopes
3. Ensure `api_access_token` header (not `Authorization`)
4. Confirm account ID matches token's account

**Debug Command:**
```bash
curl -v -H "api_access_token: $TOKEN" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/profile
```

#### Issue 2: Cannot Create Private Notes

**Symptoms:**
- Private notes appear as public messages
- Customers receive internal comments

**Solution:**
Verify payload includes both flags:
```json
{
  "content": "Internal note",
  "message_type": 0,
  "private": true  ← Must be explicit
}
```

#### Issue 3: Webhook Not Triggering

**Symptoms:**
- Messages arrive but no webhook fired
- Agent SDK not receiving events

**Solutions:**
1. Check webhook configuration:
   - Settings → Integrations → Webhooks
   - Verify URL is correct
   - Ensure `message_created` is subscribed
2. Test webhook:
   - Use "Test Webhook" button
   - Check webhook logs
3. Verify webhook secret matches environment variable

**Debug:**
```bash
# Check Chatwoot logs
fly logs --app hotdash-chatwoot | grep -i webhook

# Test webhook manually
curl -X POST https://your-endpoint/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -H "X-Chatwoot-Signature: <signature>" \
  -d @test-payload.json
```

#### Issue 4: Agent Assignment Fails

**Symptoms:**
- `POST /assignments` returns 404 or 422
- Agent not assigned to conversation

**Solutions:**
1. Verify agent ID exists:
   ```bash
   curl -H "api_access_token: $TOKEN" \
     https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/agents
   ```
2. Check agent is part of the account
3. Verify conversation is in `open` status (can't assign to resolved)

#### Issue 5: Health Check Failing

**Symptoms:**
- `/hc` returns 404
- Fly health checks failing

**Solution:**
Chatwoot doesn't have `/hc` endpoint by default. Use `/api` or `/rails/health`:

```bash
# Update fly.toml
[[services.http_checks]]
  path = "/api"  # or "/rails/health"
```

---

## Configuration Best Practices

### 1. Security

- ✅ Disable account signup (`ENABLE_ACCOUNT_SIGNUP=false`)
- ✅ Use strong super admin password
- ✅ Rotate API tokens every 6-12 months
- ✅ Limit API token scopes to minimum required
- ✅ Enable webhook signature verification
- ✅ Use HTTPS for all endpoints
- ❌ Never expose API tokens in logs or commits

### 2. Performance

- ✅ Monitor Sidekiq queue depth (< 100 jobs ideal)
- ✅ Scale workers based on conversation volume
- ✅ Use Redis for caching (configured via REDIS_URL)
- ✅ Monitor database connection pool usage
- ⚠️ Alert on worker OOM kills (current issue: 512MB)

### 3. Reliability

- ✅ Set up health check monitoring
- ✅ Configure Fly auto-restart on failure
- ✅ Monitor webhook delivery success rate
- ✅ Set up database backup strategy
- ✅ Test disaster recovery procedures

### 4. Observability

- ✅ Log all webhook events to observability_logs
- ✅ Track API response times
- ✅ Monitor conversation volume metrics
- ✅ Alert on error rate increases
- ✅ Dashboard for operator performance

---

## API Token Rotation Procedure

### When to Rotate
- Every 12 months (scheduled)
- Immediately if token exposed
- After employee departure
- Before major releases

### Rotation Process

```bash
# 1. Generate new token in Chatwoot UI
#    (Keep old token active during transition)

# 2. Update vault
echo "CHATWOOT_API_TOKEN_STAGING=<new_token>" > vault/occ/chatwoot/api_token_staging.env.new
echo "CHATWOOT_ACCOUNT_ID_STAGING=1" >> vault/occ/chatwoot/api_token_staging.env.new

# 3. Test new token
source vault/occ/chatwoot/api_token_staging.env.new
curl -H "api_access_token: $CHATWOOT_API_TOKEN_STAGING" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/conversations

# 4. If successful, replace old token
mv vault/occ/chatwoot/api_token_staging.env vault/occ/chatwoot/api_token_staging.env.old
mv vault/occ/chatwoot/api_token_staging.env.new vault/occ/chatwoot/api_token_staging.env

# 5. Update GitHub secrets
gh secret set CHATWOOT_API_TOKEN_STAGING --body "<new_token>"

# 6. Restart services using old token
#    (Agent SDK, webhook handler, etc.)

# 7. Revoke old token in Chatwoot UI
#    (Settings → Integrations → API → Delete old token)

# 8. Delete old token file
rm vault/occ/chatwoot/api_token_staging.env.old

# 9. Document rotation in feedback/chatwoot.md
```

---

## Webhook Configuration Checklist

### Prerequisites
- [ ] Webhook endpoint deployed and healthy
- [ ] Webhook secret generated and stored
- [ ] Super admin access to Chatwoot
- [ ] Test payloads prepared

### Configuration Steps

1. **Navigate to Webhooks**
   - Log in to Chatwoot: https://hotdash-chatwoot.fly.dev
   - Go to: Settings → Integrations → Webhooks

2. **Add New Webhook**
   - Click "Add Webhook"
   - Endpoint URL: `https://hotdash-agent-service.fly.dev/webhooks/chatwoot`
   - Description: "Agent SDK Integration - Message Processing"

3. **Select Events**
   - ✅ `message_created` - Primary event for Agent SDK
   - ⚠️ `conversation_created` - Optional for initialization
   - ⚠️ `conversation_status_changed` - Optional for cleanup

4. **Configure Secret (Optional but Recommended)**
   - Generate webhook secret: `openssl rand -hex 32`
   - Store in vault: `vault/occ/chatwoot/webhook_secret.env`
   - Configure in Chatwoot webhook settings
   - Share with @engineer for signature verification

5. **Test Webhook**
   - Click "Test Webhook" button
   - Verify endpoint receives payload
   - Check logs for successful processing
   - Confirm signature verification (if configured)

6. **Monitor Initial Traffic**
   - Watch webhook logs for first few messages
   - Verify no errors in processing
   - Check approval queue entries created
   - Monitor performance (<3s processing time)

---

## Account Configuration Matrix

### Staging Environment

```yaml
Account Settings:
  Name: HotDash Support (Staging)
  Domain: hotdash-chatwoot.fly.dev
  Email: customer.support@hotrodan.com
  Auto Assignment: Enabled
  Auto Resolve: 7 days

Integrations:
  Webhooks: Enabled (Agent SDK)
  API Access: Enabled (staging token)
  Email: Configured (IMAP/SMTP)

Security:
  Account Signup: Disabled
  API Token Scopes: Conversations, Messages, Contacts, Agent, Labels
  Webhook Signature: Enabled (HMAC-SHA256)

Performance:
  Workers: 1 (Sidekiq)
  Memory: 512MB → 1024MB (recommended)
  Database: Supabase (pooled)
  Cache: Redis (Upstash)
```

### Production Environment (Future)

```yaml
Account Settings:
  Name: HotDash Support
  Domain: support.hotrodan.com (custom domain)
  Email: customer.support@hotrodan.com
  Auto Assignment: Enabled
  Auto Resolve: 7 days

Integrations:
  Webhooks: Enabled (Agent SDK)
  API Access: Enabled (production token)
  Email: Configured (SendGrid/SES)
  SSO: Enabled (Google Workspace)

Security:
  Account Signup: Disabled
  2FA: Enforced for all admins
  API Token Scopes: Minimal required
  Webhook Signature: Required
  IP Allowlist: Fly.io + Office IPs

Performance:
  Workers: 2+ (auto-scaled)
  Memory: 2048MB minimum
  Database: Supabase (dedicated)
  Cache: Redis (Premium)
  CDN: Enabled for assets
```

---

## Monitoring & Alerting

### Health Check Configuration

**Fly.io Health Check:**
```toml
[[services.http_checks]]
  interval = "15s"
  timeout = "10s"
  grace_period = "30s"
  method = "get"
  path = "/api"  # Returns {"version":"4.6.0","queue_services":"ok","data_services":"ok"}
```

**Custom Health Checks:**

```bash
#!/bin/bash
# scripts/ops/chatwoot-health-check.sh

source vault/occ/chatwoot/api_token_staging.env

# Check API availability
response=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "api_access_token: $CHATWOOT_API_TOKEN_STAGING" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/conversations)

if [ "$response" != "200" ]; then
  echo "CRITICAL: Chatwoot API unhealthy (HTTP $response)"
  exit 1
fi

# Check queue health
queue_response=$(curl -s https://hotdash-chatwoot.fly.dev/api | jq -r '.queue_services')

if [ "$queue_response" != "ok" ]; then
  echo "WARNING: Chatwoot queue services degraded"
  exit 1
fi

echo "OK: Chatwoot healthy"
exit 0
```

### Alert Conditions

| Condition | Severity | Action |
|-----------|----------|--------|
| API returns 5xx errors | CRITICAL | Page on-call engineer |
| Worker OOM kills | HIGH | Scale memory, investigate |
| Webhook delivery failures > 5% | HIGH | Check endpoint health |
| Queue depth > 100 jobs | MEDIUM | Scale workers |
| Database connection errors | CRITICAL | Check Supabase health |
| Response time > 5s | MEDIUM | Investigate performance |

---

## Agent SDK-Specific Configuration

### Conversation Tags/Labels

**Create Labels for Agent SDK:**

```bash
# Via API
curl -X POST https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/labels \
  -H "api_access_token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "agent_sdk_approved",
    "description": "Response approved without edits",
    "color": "#00C853",
    "show_on_sidebar": true
  }'

curl -X POST https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/labels \
  -H "api_access_token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "agent_sdk_edited",
    "description": "Response edited before approval",
    "color": "#FF9800",
    "show_on_sidebar": true
  }'

curl -X POST https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/labels \
  -H "api_access_token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "escalated",
    "description": "Escalated to senior support",
    "color": "#F44336",
    "show_on_sidebar": true
  }'
```

### Canned Responses (Templates)

**For Common Scenarios:**

1. **Order Tracking**
   ```
   Hi {{contact.name}},
   
   I've looked up your order {{custom_attribute.order_number}}.
   It shipped on {{custom_attribute.ship_date}} via {{custom_attribute.carrier}}.
   
   Tracking: {{custom_attribute.tracking_number}}
   Expected delivery: {{custom_attribute.delivery_date}}
   
   Track here: {{custom_attribute.tracking_url}}
   
   Let me know if you need anything else!
   ```

2. **Return Policy**
   ```
   Our return policy allows 30-day returns for unworn items with tags attached.
   
   To initiate a return:
   1. Log in to your account at hotrodan.com
   2. Go to Orders → Select order → Request Return
   3. Print the prepaid return label
   4. Ship via USPS
   
   Refunds process within 5-7 business days after we receive the item.
   
   Questions? Just ask!
   ```

3. **Escalation Handoff**
   ```
   Hi {{contact.name}},
   
   I'm escalating your case to our specialist team for personalized assistance.
   
   {{assignee.name}} will reach out within {{custom_attribute.response_time}} hours.
   
   Case reference: {{conversation.id}}
   
   Thank you for your patience!
   ```

---

## Configuration Validation Checklist

### Pre-Production Validation

- [ ] Super admin account created and tested
- [ ] API token generated with correct scopes
- [ ] API token stored in vault and GitHub secrets
- [ ] Token rotation procedure documented
- [ ] Inbox configured for customer.support@hotrodan.com
- [ ] IMAP/SMTP tested (inbound and outbound)
- [ ] Webhooks configured and tested
- [ ] Agent SDK labels created
- [ ] Canned responses created and tested
- [ ] Auto-assignment rules configured
- [ ] Health checks passing
- [ ] Alerts configured
- [ ] Operator accounts created and trained

### Post-Production Checklist

- [ ] Monitor for 24 hours after launch
- [ ] Verify webhook delivery rate > 95%
- [ ] Check conversation volume vs capacity
- [ ] Validate agent SDK approval rate
- [ ] Audit API token usage patterns
- [ ] Review and tune auto-assignment rules
- [ ] Collect operator feedback
- [ ] Optimize based on metrics

---

## Reference Commands

### Quick Status Check
```bash
# Source credentials
source vault/occ/chatwoot/api_token_staging.env

# Check API health
curl -H "api_access_token: $CHATWOOT_API_TOKEN_STAGING" \
  https://hotdash-chatwoot.fly.dev/api | jq .

# List conversations
curl -H "api_access_token: $CHATWOOT_API_TOKEN_STAGING" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/conversations | jq '.data.meta'

# List agents
curl -H "api_access_token: $CHATWOOT_API_TOKEN_STAGING" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/agents | jq '.[] | {id, name, email, role}'
```

### Emergency Procedures

**If Chatwoot is Down:**
```bash
# Check Fly.io status
fly status --app hotdash-chatwoot

# Check logs
fly logs --app hotdash-chatwoot --since 30m

# Restart app
fly apps restart hotdash-chatwoot

# Scale up if needed
fly scale count 2 --process web --app hotdash-chatwoot
```

**If Database Connection Fails:**
```bash
# Check Supabase health
# (Supabase dashboard → Database → Health)

# Verify connection secrets
fly secrets list --app hotdash-chatwoot | grep POSTGRES

# Update if rotated
source vault/occ/supabase/database_url_staging.env
# Parse and set POSTGRES_* secrets
```

---

## Next Steps for Production

1. **Custom Domain:**
   ```bash
   fly certs create support.hotrodan.com --app hotdash-chatwoot
   ```

2. **SSO Integration:**
   - Configure Google Workspace SSO
   - Map email domains to auto-create agents
   - Document SSO troubleshooting

3. **Advanced Analytics:**
   - Set up Grafana dashboard
   - Configure Prometheus metrics
   - Create custom reports

4. **Backup & DR:**
   - Schedule daily Supabase snapshots
   - Test restore procedures
   - Document DR runbook

---

**Document Status:** Production Ready  
**Last Updated:** 2025-10-11  
**Maintained By:** Chatwoot Agent  
**Next Review:** After production deployment

