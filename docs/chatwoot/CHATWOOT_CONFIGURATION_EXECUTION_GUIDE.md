---
epoch: 2025.10.E1
doc: docs/chatwoot/CHATWOOT_CONFIGURATION_EXECUTION_GUIDE.md
owner: chatwoot
created: 2025-10-13T14:20:00Z
purpose: Complete step-by-step execution guide for Chatwoot configuration
category: configuration
priority: P1
---

# 🚀 Chatwoot Configuration Execution Guide - Hot Rod AN

**Executor**: Chatwoot agent or designee with Chatwoot dashboard access  
**Timeline**: 5-10 hours  
**Deadline**: 2025-10-14T20:00:00Z  
**Prerequisites**: Chatwoot dashboard login, vault access

---

## 📋 Quick Start Checklist

**Before Starting**:
- [ ] Access to https://hotdash-chatwoot.fly.dev
- [ ] Chatwoot admin credentials
- [ ] Vault credentials sourced: `source vault/occ/zoho/customer_support_staging.env`
- [ ] External email for testing
- [ ] Screenshot capability

**After Completion**:
- [ ] Email inbox functional (IMAP + SMTP)
- [ ] Live chat widget configured
- [ ] 10 canned responses created
- [ ] Email signature configured
- [ ] All tests passed
- [ ] Evidence logged to feedback/chatwoot.md

---

## 🔧 TASK 1: Zoho Mail IMAP Configuration (3 hours)

### Credentials (from vault)
```
IMAP Server: imap.zohocloud.ca
IMAP Port: 993
Security: SSL/TLS
Username: customer.support@hotrodan.com
Password: [from $ZOHO_IMAP_PASS - NEVER log this]
```

### Step-by-Step Execution

**1. Access Chatwoot Dashboard**
- URL: https://hotdash-chatwoot.fly.dev
- Login with Chatwoot admin credentials
- Navigate to: Settings (gear icon in sidebar)

**2. Create Email Inbox**
- Click: Inboxes
- Click: "Add Inbox" button
- Select: "Email" channel type

**3. Configure Email Inbox**
- Inbox Name: `Hot Rod AN Customer Support`
- Email Address: `customer.support@hotrodan.com`
- Click: "Create Email Channel"

**4. Configure IMAP Settings**
- IMAP Address: `imap.zohocloud.ca`
- IMAP Port: `993`
- IMAP Email: `customer.support@hotrodan.com`
- IMAP Password: [paste from $ZOHO_IMAP_PASS]
- Enable SSL: ✅ CHECKED
- IMAP Folder: `INBOX` (default)
- Enable IMAP: ✅ CHECKED

**5. Set Polling Interval**
- Check for emails every: `3 minutes` (recommended balance)

**6. Test IMAP Connection**
- Click: "Test IMAP Settings" or "Validate"
- Expected: "✅ Connection successful"
- If fails: See troubleshooting section below

**7. Send Test Email**
- From external email → customer.support@hotrodan.com
- Subject: "Test IMAP Integration - Chatwoot"
- Body: "Testing email sync from Zoho to Chatwoot"
- Wait 3-5 minutes for polling

**8. Verify in Chatwoot**
- Check: Conversations list
- Expected: New conversation appears
- Verify: Email content displays correctly
- Verify: Contact created with sender's email

**9. Capture Evidence**
- Screenshot: IMAP configuration (REDACT password!)
- Screenshot: Test email in Chatwoot
- Save to: `artifacts/chatwoot/imap_config_2025-10-13.png`

**10. Log Completion**
```markdown
## 2025-10-13T[TIME]Z — Task 1 Complete: IMAP

**Status**: ✅ Complete
**Evidence**: artifacts/chatwoot/imap_config_2025-10-13.png
**Test**: Email received in Chatwoot within 3 minutes
**Issues**: [None or describe any]
```

---

## 📤 TASK 2: Zoho Mail SMTP Configuration (2 hours)

### Credentials (same vault file)
```
SMTP Server: smtp.zohocloud.ca
SMTP Port: 465 (try 587 if 465 doesn't work)
Security: SSL/TLS
Username: customer.support@hotrodan.com
Password: [from $ZOHO_SMTP_PASS]
```

### Step-by-Step Execution

**1. Configure SMTP in Same Inbox**
- Navigate to: Settings → Inboxes
- Select: "Hot Rod AN Customer Support" inbox
- Click: "Settings" tab

**2. Enter SMTP Settings**
- SMTP Address: `smtp.zohocloud.ca`
- SMTP Port: `465`
- SMTP Email: `customer.support@hotrodan.com`
- SMTP Password: [paste from $ZOHO_SMTP_PASS]
- Enable SSL: ✅ CHECKED
- SMTP Authentication: `login` or `plain`
- Enable SMTP: ✅ CHECKED

**3. Configure Sender Settings**
- Sender Name: `Hot Rod AN Customer Support`
- Sender Email: `customer.support@hotrodan.com`
- Reply-To Email: `customer.support@hotrodan.com`

**4. Test SMTP Connection**
- Click: "Test SMTP Settings"
- Expected: "✅ SMTP connection successful"
- If fails: Try port 587 with STARTTLS

**5. Send Test Reply**
- Open test conversation (from Task 1)
- Type reply: "Testing SMTP outbound from Chatwoot to Zoho"
- Click: "Send"
- Expected: Message sends successfully

**6. Verify Email Received**
- Check your external email inbox
- Expected: Reply received within 1 minute
- Verify FROM: customer.support@hotrodan.com
- Verify: Not showing Chatwoot server email

**7. Check Email Headers**
- View email source/headers
- Verify: `From: customer.support@hotrodan.com`
- Verify: `Return-Path: customer.support@hotrodan.com`
- Verify: `Received: from smtp.zohocloud.ca`

**8. Capture Evidence**
- Screenshot: SMTP configuration (REDACT password!)
- Screenshot: Test email sent confirmation
- Screenshot: Received email showing FROM address
- Save to: `artifacts/chatwoot/smtp_config_2025-10-13.png`

**9. Log Completion**
```markdown
## 2025-10-13T[TIME]Z — Task 2 Complete: SMTP

**Status**: ✅ Complete
**Evidence**: artifacts/chatwoot/smtp_config_2025-10-13.png
**Test**: Reply sent and received with correct FROM
**Issues**: [None or describe any]
```

---

## ✉️ TASK 3: Email Inbox Full Setup (2 hours)

### Step-by-Step Execution

**1. Configure Inbox Name & Settings**
- Inbox Name: `Hot Rod AN Customer Support`
- Email Address Display: `customer.support@hotrodan.com`
- Greeting Enabled: ✅ (optional)
- Greeting Message: "Thanks for contacting Hot Rod AN! We'll respond within 24 hours."

**2. Configure Agent Assignment**
- Auto-assignment: ✅ Enabled (if multiple agents)
- Assignment Method: Round-robin OR Manual
- If manual: Operators claim conversations themselves
- If round-robin: Distributes evenly among available agents

**3. Add Agents to Inbox** (if applicable)
- Navigate to: Inbox Settings → Collaborators
- Add agents who should handle customer.support emails
- Set permissions: Agent or Administrator

**4. Configure Working Hours** (optional)
- Enable working hours: ✅ if desired
- Set hours: Monday-Friday, 8:00 AM - 6:00 PM EST
- Timezone: America/New_York

**5. Configure Away Message** (optional)
- Enable: ✅ for outside business hours
- Message: "Thanks for contacting Hot Rod AN. Our support team is currently offline. We'll respond within 24 hours during business hours (Mon-Fri 8am-6pm EST)."

**6. Configure CSAT Survey** (optional)
- Enable: ✅ to collect customer satisfaction
- Send after: Conversation resolved
- Survey type: Emoji rating (1-5 stars)

**7. Test Complete Email Flow**
```
Test Sequence:
1. External email → customer.support@hotrodan.com (inbound)
2. Email arrives in Chatwoot as conversation
3. Agent assigned (auto or manual)
4. Agent replies from Chatwoot (outbound)
5. Customer receives reply from customer.support@hotrodan.com
6. Customer replies again (threading test)
7. Reply appears in same Chatwoot conversation
```

**8. Verify Conversation Threading**
- Multiple emails in same thread should appear as single conversation
- Subject line threading should work
- In-Reply-To headers should be preserved

**9. Capture Evidence**
- Screenshot: Inbox configuration
- Screenshot: Full email thread in Chatwoot
- Screenshot: Received emails showing threading
- Save to: `artifacts/chatwoot/email_inbox_setup_2025-10-13.png`

**10. Log Completion**
```markdown
## 2025-10-13T[TIME]Z — Task 3 Complete: Email Inbox

**Status**: ✅ Complete
**Evidence**: artifacts/chatwoot/email_inbox_setup_2025-10-13.png
**Test**: Bidirectional email + threading working
**Issues**: [None or describe any]
```

---

## 💬 TASK 4: Live Chat Widget Configuration (2 hours)

### Step-by-Step Execution

**1. Create Website Inbox**
- Navigate to: Settings → Inboxes → Add Inbox
- Select: "Website" channel
- Name: `Hot Rod AN Live Chat`

**2. Configure Website Settings**
- Website Name: `Hot Rod AN`
- Website Domain: `hotrodan.com` (add staging domains too)
- Widget Color: `#D32F2F` (Hot Rod AN red) or brand color
- Welcome Heading: `Hey! 👋`
- Welcome Tagline: `Need help with AN fittings? Chat with us!`

**3. Configure Widget Appearance**
- Position: Bottom right
- Widget Launcher Title: `Chat with us`
- Avatar: Upload Hot Rod AN logo (if available)
- Agent names visible: ✅ Yes
- Agent away message: "We'll respond within 24 hours"

**4. Configure Pre-Chat Form**
- Enable pre-chat form: ✅ Yes
- Collect Name: ✅ Required
- Collect Email: ✅ Required
- Collect Phone: ⬜ Optional
- Pre-chat message: "Leave your details and we'll get back to you!"

**5. Configure Business Hours** (optional)
- Enable business hours: ✅ if desired
- Hours: Monday-Friday, 8:00 AM - 6:00 PM EST
- Offline message: "Our team is offline. Leave a message and we'll respond within 24 hours!"

**6. Configure CSAT** (optional)
- Enable: ✅ Yes
- Trigger: After conversation resolved
- Message: "How was your experience with Hot Rod AN support?"

**7. Generate Widget Code**
- Click: "Configuration" tab
- Copy: Widget embed script
- Should look like:
```html
<script>
  (function(d,t) {
    var BASE_URL="https://hotdash-chatwoot.fly.dev";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: '[ACTUAL_TOKEN_HERE]',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>
```

**8. Save Widget Code**
- Copy complete embed code
- Save to: `docs/chatwoot/widget_embed_code.txt`
- **Replace** placeholder WEBSITE_TOKEN with actual token

**9. Test Widget** (in staging if possible)
- Add widget code to test HTML page
- Open in browser
- Verify: Widget appears bottom right
- Click widget, verify: Opens chat interface
- Submit test message
- Verify: Message appears in Chatwoot dashboard

**10. Create Installation Instructions for Engineer**
```markdown
## Widget Installation - For Engineer

**File**: docs/chatwoot/widget_embed_code.txt

**Installation Steps**:
1. Access Hot Rod AN Shopify theme
2. Edit theme.liquid or layout/theme.liquid
3. Add widget code before closing </body> tag
4. Save and publish theme
5. Test on hotrodan.com

**Expected**: Chat widget appears on all pages

**Mobile**: Widget should be responsive and work on mobile devices
```

**11. Capture Evidence**
- Screenshot: Widget configuration settings
- Screenshot: Widget embed code (with token)
- Screenshot: Widget preview/appearance
- Save to: `artifacts/chatwoot/widget_config_2025-10-13.png`

**12. Log Completion**
```markdown
## 2025-10-13T[TIME]Z — Task 4 Complete: Live Chat Widget

**Status**: ✅ Complete
**Evidence**: 
- artifacts/chatwoot/widget_config_2025-10-13.png
- docs/chatwoot/widget_embed_code.txt
**Test**: Widget configured, embed code generated
**Handoff**: Engineer to install on hotrodan.com
**Issues**: [None or describe any]
```

---

## ✍️ TASK 5: Email Signature & Templates (1 hour)

### Part A: Email Signature Configuration (30 min)

**Steps**:
1. Navigate to: Settings → Inboxes
2. Select: "Hot Rod AN Customer Support" inbox
3. Click: "Settings" tab
4. Find: "Email Signature" field
5. Paste signature (from `docs/chatwoot/email_templates_and_signatures.md`)
6. Save changes

**Test**:
- Send test email from Chatwoot
- Verify signature appears at bottom
- Check: Links work, formatting correct

**Evidence**: Screenshot of signature in test email

---

### Part B: Canned Responses Configuration (30 min)

**Create 10 Templates** (from `docs/chatwoot/email_templates_and_signatures.md`):

1. `/shipping` - Shipping timeframe
2. `/sizing` - AN sizing help
3. `/returns` - Return policy
4. `/technical` - Technical support escalation
5. `/orderstatus` - Order status inquiry
6. `/installation` - Installation help
7. `/warranty` - Warranty information
8. `/compat` - Compatibility question
9. `/afterhours` - After hours message
10. `/welcome` - First contact welcome

**For Each Template**:
1. Navigate to: Settings → Canned Responses
2. Click: "Add Canned Response"
3. Short Code: `/shipping` (etc.)
4. Content: [paste from templates doc]
5. Save
6. Test by typing `/` in a conversation

**Evidence**: Screenshot of canned responses list

---

## 🧪 Complete Integration Test

**After All 5 Tasks Complete**:

### End-to-End Email Test
```
1. Send email: External → customer.support@hotrodan.com
2. Wait 3-5 min: Email appears in Chatwoot
3. Reply from Chatwoot: Use canned response + edit
4. Verify: Customer receives reply with signature
5. Customer replies again
6. Verify: Appears in same conversation thread
```

**Success**: ✅ Complete bidirectional email with threading

### End-to-End Chat Test
```
1. Add widget to test page
2. Open widget, send test message
3. Verify: Message in Chatwoot dashboard
4. Reply from Chatwoot
5. Verify: Reply appears in widget
6. Continue conversation
7. Verify: Multi-message threading works
```

**Success**: ✅ Live chat widget functional

---

## 📊 Evidence Requirements

**Required Artifacts** (save all to `artifacts/chatwoot/`):
1. `imap_config_2025-10-13.png` - IMAP settings (password redacted)
2. `smtp_config_2025-10-13.png` - SMTP settings (password redacted)
3. `email_inbox_setup_2025-10-13.png` - Complete inbox configuration
4. `widget_config_2025-10-13.png` - Widget settings
5. `widget_appearance_2025-10-13.png` - How widget looks on site
6. `canned_responses_list_2025-10-13.png` - All 10 templates
7. `email_signature_test_2025-10-13.png` - Signature in sent email
8. `bidirectional_email_test_2025-10-13.png` - Full email thread
9. `live_chat_test_2025-10-13.png` - Chat conversation

**Required Documentation** (save to `docs/chatwoot/`):
1. `widget_embed_code.txt` - Complete widget code for Engineer
2. `zoho_config_notes.md` - Any Zoho-specific quirks discovered
3. `chatwoot_access_credentials.md` - How to access (NOT passwords)

---

## 🚨 Troubleshooting Guide

### IMAP Connection Failures

**Error: "Cannot connect to IMAP server"**
```
Checks:
1. Server name: imap.zohocloud.ca (Canadian server)
2. Port: 993
3. SSL enabled
4. Try: telnet imap.zohocloud.ca 993
5. Check Fly.io egress isn't blocking port
```

**Error: "Authentication failed"**
```
Checks:
1. Username is FULL email (customer.support@hotrodan.com)
2. Password from vault is correct (no trailing spaces)
3. Zoho IMAP enabled in account settings
4. 2FA: May need app-specific password
5. Account not locked/suspended
```

**Error: "Folder INBOX not found"**
```
Checks:
1. Try folder: "Inbox" (capital I)
2. Try folder: "" (empty = default)
3. List available folders via IMAP test
```

---

### SMTP Connection Failures

**Error: "SMTP connection refused"**
```
Checks:
1. Server: smtp.zohocloud.ca
2. Try port 465 first (SSL)
3. If fails, try port 587 (STARTTLS)
4. Verify outbound SMTP not blocked by Fly.io
```

**Error: "FROM address rejected"**
```
Checks:
1. FROM must match authenticated user
2. Verify customer.support@hotrodan.com is authorized sender
3. Check Zoho aliases/identities configuration
4. Verify domain ownership in Zoho
```

---

### Widget Issues

**Widget doesn't appear on site**
```
Checks:
1. Widget code added before </body>
2. JavaScript not blocked
3. Base URL correct: https://hotdash-chatwoot.fly.dev
4. Website token correct
5. Domain whitelisted in Chatwoot
```

**Widget appears but won't connect**
```
Checks:
1. Base URL matches Chatwoot instance
2. Website token is valid and not expired
3. CORS headers allow domain
4. No JavaScript errors in browser console
```

---

## ⏱️ Timeline & Deadlines

| Task | Description | Hours | Deadline |
|------|-------------|-------|----------|
| 1 | IMAP Config | 3h | 2025-10-14T12:00Z |
| 2 | SMTP Config | 2h | 2025-10-14T14:00Z |
| 3 | Email Inbox Setup | 2h | 2025-10-14T16:00Z |
| 4 | Widget Config | 2h | 2025-10-14T18:00Z |
| 5 | Signatures & Templates | 1h | 2025-10-14T20:00Z |
| **Total** | **All Tasks** | **10h** | **2025-10-14T20:00Z** |

---

## ✅ Final Checklist

**Email System**:
- [ ] IMAP connected and polling
- [ ] SMTP sending successfully
- [ ] Bidirectional email working
- [ ] Threading/conversation continuity working
- [ ] Email signature configured
- [ ] FROM address correct (customer.support@hotrodan.com)

**Live Chat**:
- [ ] Widget configured in Chatwoot
- [ ] Embed code generated and saved
- [ ] Widget tested (if staging available)
- [ ] Pre-chat form collecting name + email
- [ ] Mobile responsive

**Templates**:
- [ ] 10 canned responses created
- [ ] Short codes working (/shipping, etc.)
- [ ] Templates tested in conversations
- [ ] Email signature appears in outbound emails

**Documentation**:
- [ ] 9 screenshots captured (passwords redacted)
- [ ] Widget code saved for Engineer
- [ ] Evidence logged to feedback/chatwoot.md
- [ ] All issues/quirks documented

**Handoff**:
- [ ] Engineer has widget installation instructions
- [ ] Support has canned response list
- [ ] All credentials remain in vault (never logged)
- [ ] System ready for production use

---

**Created**: 2025-10-13T14:20:00Z  
**Owner**: Chatwoot Agent  
**Executor**: [Name] on [Date]  
**Status**: Ready for execution  
**Completion**: [Date] at [Time]

