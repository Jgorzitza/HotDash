---
epoch: 2025.10.E1
doc: docs/chatwoot/zoho_mail_imap_smtp_configuration.md
owner: chatwoot
created: 2025-10-13T14:10:00Z
purpose: Zoho Mail IMAP/SMTP configuration for Chatwoot email inbox
category: configuration
status: Ready for execution
---

# Zoho Mail IMAP/SMTP Configuration for Chatwoot

**Purpose**: Configure customer.support@hotrodan.com for bidirectional email support  
**Chatwoot Instance**: https://hotdash-chatwoot.fly.dev  
**Timeline**: 5 hours (IMAP 3h + SMTP 2h)  
**Deadline**: 2025-10-14T14:00:00Z

---

## 📋 Prerequisites

**Credentials**:
```bash
cd ~/HotDash/hot-dash
source vault/occ/zoho/customer_support_staging.env
```

**Loaded Variables**:
- `ZOHO_IMAP_HOST`: imap.zohocloud.ca
- `ZOHO_IMAP_PORT`: 993
- `ZOHO_IMAP_USER`: customer.support@hotrodan.com
- `ZOHO_IMAP_PASS`: [from vault]
- `ZOHO_SMTP_HOST`: smtp.zohocloud.ca
- `ZOHO_SMTP_PORT`: 465
- `ZOHO_SMTP_USER`: customer.support@hotrodan.com
- `ZOHO_SMTP_PASS`: [from vault]

**Chatwoot Access**:
- URL: https://hotdash-chatwoot.fly.dev
- Login: [Use existing Chatwoot admin credentials]

---

## 🔧 Task 1: IMAP Configuration (3 hours)

### Step 1: Access Chatwoot Dashboard

**URL**: https://hotdash-chatwoot.fly.dev  
**Login**: Use Chatwoot admin credentials

**Expected**: Chatwoot dashboard loads successfully

---

### Step 2: Create New Email Inbox

**Navigation**: Settings → Inboxes → Add Inbox

**Select Channel**: Email

**Expected**: Email inbox configuration form appears

---

### Step 3: Configure IMAP Settings

**Form Fields**:

| Field | Value | Notes |
|-------|-------|-------|
| **Inbox Name** | Hot Rod AN Customer Support | Display name in Chatwoot |
| **Email Address** | customer.support@hotrodan.com | Customer-facing email |
| **IMAP Server** | imap.zohocloud.ca | Canadian Zoho server |
| **IMAP Port** | 993 | SSL/TLS port |
| **IMAP Login** | customer.support@hotrodan.com | Full email address |
| **IMAP Password** | [from $ZOHO_IMAP_PASS] | NEVER log password |
| **Enable SSL/TLS** | ✅ Enabled | Required for port 993 |
| **IMAP Folder** | INBOX | Default folder to monitor |

**Polling Interval**: 3 minutes (recommended)
- Too frequent (1 min) = excessive server load
- Too slow (10 min) = delayed customer responses
- 3 minutes = Good balance

---

### Step 4: Test IMAP Connection

**Test Method**: Click "Test IMAP Settings" or "Validate" button

**Expected Success Response**:
```
✅ Connection successful
✅ Mailbox accessible
✅ Inbox folder found
```

**If Connection Fails**:

**Error: "Authentication failed"**
- Check username is full email (customer.support@hotrodan.com)
- Verify password from vault is correct
- Ensure Zoho IMAP is enabled for this account

**Error: "Connection timeout"**
- Verify server: imap.zohocloud.ca (NOT imap.zoho.com)
- Verify port: 993
- Check SSL/TLS is enabled

**Error: "Certificate error"**
- Enable "Allow invalid certificates" (if necessary)
- Verify SSL/TLS setting matches port 993

---

### Step 5: Configure Email Sync Settings

**Settings to Configure**:

**Auto-assignment**:
- ✅ Enable auto-assignment (recommended)
- Assignment method: Round-robin OR Manual (choose based on team size)

**Working Hours**:
- Configure if Hot Rod AN has specific support hours
- Example: Mon-Fri 8am-6pm EST
- Outside hours: Queue emails, respond next business day

**Away Message**:
- Optional auto-reply when outside working hours
- Example: "Thanks for contacting Hot Rod AN. We'll respond within 24 hours."

---

### Step 6: Send Test Email

**Test Process**:
1. Send email FROM external address (e.g., your personal email)
2. TO: customer.support@hotrodan.com
3. Subject: "Test IMAP Integration"
4. Body: "Testing Chatwoot email sync from Zoho Mail"
5. Wait 3-5 minutes (polling interval + processing)
6. Check Chatwoot dashboard for new conversation

**Expected**:
- ✅ Email appears in Chatwoot as new conversation
- ✅ Contact created automatically (name, email extracted)
- ✅ Conversation marked as "open"
- ✅ Email content displays correctly
- ✅ Attachments (if any) are accessible

---

### Step 7: Document IMAP Configuration

**Screenshot Checklist**:
- [ ] IMAP configuration form (WITH password redacted)
- [ ] Connection test success message
- [ ] Test email in Chatwoot conversation list
- [ ] Test email conversation detail view

**Save Screenshots**:
```bash
# Save to artifacts directory
cp [screenshot] ~/HotDash/hot-dash/artifacts/chatwoot/imap_config_2025-10-13.png
cp [screenshot] ~/HotDash/hot-dash/artifacts/chatwoot/imap_test_email_2025-10-13.png
```

---

## 📤 Task 2: SMTP Configuration (2 hours)

### Step 1: Configure SMTP in Email Inbox

**Navigation**: Same inbox created above → SMTP Settings

**Form Fields**:

| Field | Value | Notes |
|-------|-------|-------|
| **SMTP Server** | smtp.zohocloud.ca | Canadian Zoho SMTP |
| **SMTP Port** | 465 | SSL port (preferred) |
| **SMTP Login** | customer.support@hotrodan.com | Same as IMAP |
| **SMTP Password** | [from $ZOHO_SMTP_PASS] | NEVER log password |
| **Enable SSL/TLS** | ✅ Enabled | Required for port 465 |
| **Authentication** | Login | Standard auth method |

**Alternative Port**: If 465 doesn't work, try:
- Port 587 with STARTTLS
- Port 25 (not recommended, usually blocked)

---

### Step 2: Test SMTP Connection

**Test Method**: Click "Test SMTP Settings" or "Send Test Email"

**Expected Success Response**:
```
✅ Connection successful
✅ Test email sent
✅ Authentication verified
```

**If Connection Fails**:

**Error: "SMTP authentication failed"**
- Verify password matches IMAP password
- Check username is full email address
- Ensure Zoho SMTP is enabled

**Error: "Port 465 blocked"**
- Try port 587 instead
- Enable STARTTLS instead of SSL
- Check Fly.io outbound port restrictions

---

### Step 3: Send Test Reply from Chatwoot

**Test Process**:
1. Open the test conversation (from IMAP test email)
2. Click "Reply" in Chatwoot
3. Type test message: "Testing SMTP outbound from Chatwoot"
4. Click "Send"
5. Check your external email for received reply

**Expected**:
- ✅ Reply sent successfully from Chatwoot
- ✅ Email received at original sender address
- ✅ FROM address: customer.support@hotrodan.com
- ✅ Email headers show Zoho SMTP path
- ✅ No authentication or delivery errors

---

### Step 4: Verify Email Headers

**Check Email Headers** (in received test email):
```
From: customer.support@hotrodan.com
To: [your test email]
Reply-To: customer.support@hotrodan.com
Return-Path: customer.support@hotrodan.com
X-Originating-IP: [Fly.io IP]
Received: from smtp.zohocloud.ca
```

**Important Checks**:
- ✅ FROM matches customer.support@hotrodan.com
- ✅ Not showing Chatwoot server email
- ✅ Reply-To is correct (customer can reply directly)
- ✅ No SPF/DKIM failures (check spam folder if missing)

---

### Step 5: Document SMTP Configuration

**Screenshot Checklist**:
- [ ] SMTP configuration form (password redacted)
- [ ] Test email send confirmation
- [ ] Received email in inbox
- [ ] Email headers showing FROM address

**Save Screenshots**:
```bash
cp [screenshot] ~/HotDash/hot-dash/artifacts/chatwoot/smtp_config_2025-10-13.png
cp [screenshot] ~/HotDash/hot-dash/artifacts/chatwoot/smtp_test_email_2025-10-13.png
```

---

## ✅ Success Criteria

### IMAP Success Checklist
- [ ] Connection test passes
- [ ] Test email received in Chatwoot within 5 minutes
- [ ] Conversation created automatically
- [ ] Contact details extracted correctly
- [ ] Email content displays properly

### SMTP Success Checklist
- [ ] Connection test passes
- [ ] Test reply sent from Chatwoot
- [ ] Email received with correct FROM address
- [ ] Email headers valid (SPF, DKIM if configured)
- [ ] Reply threading works (conversation continuity)

---

## 🚨 Troubleshooting Guide

### IMAP Issues

**Problem: "Cannot connect to server"**
```
Solution:
1. Verify server: imap.zohocloud.ca (Canadian server, NOT imap.zoho.com)
2. Ping test: ping imap.zohocloud.ca
3. Check Fly.io doesn't block outbound port 993
4. Try telnet test: telnet imap.zohocloud.ca 993
```

**Problem: "Authentication failed"**
```
Solution:
1. Verify password exactly matches vault (no extra spaces)
2. Check username is full email address
3. Verify Zoho IMAP access is enabled in Zoho admin
4. Check for 2FA requirements (may need app-specific password)
```

**Problem: "SSL/TLS error"**
```
Solution:
1. Ensure SSL/TLS is enabled
2. Try "Accept all certificates" option
3. Verify port 993 (SSL) not 143 (unencrypted)
```

---

### SMTP Issues

**Problem: "Cannot send email"**
```
Solution:
1. Verify SMTP server: smtp.zohocloud.ca
2. Try port 587 if 465 doesn't work
3. Check authentication credentials match IMAP
4. Verify FROM address is authorized in Zoho
```

**Problem: "Email goes to spam"**
```
Solution:
1. Check SPF record for hotrodan.com includes Zoho
2. Verify DKIM is configured in Zoho
3. Check DMARC policy
4. Ensure FROM domain matches sending domain
```

**Problem: "FROM address shows wrong email"**
```
Solution:
1. Configure "Sender Email" in Chatwoot inbox settings
2. Ensure SMTP username matches desired FROM address
3. Check Zoho aliases/identities configuration
```

---

## 📝 Configuration Checklist

### Pre-Configuration
- [ ] Chatwoot dashboard accessible
- [ ] Vault credentials sourced
- [ ] IMAP/SMTP details confirmed
- [ ] Test email accounts ready

### IMAP Configuration
- [ ] Inbox created in Chatwoot
- [ ] IMAP server: imap.zohocloud.ca
- [ ] IMAP port: 993
- [ ] SSL/TLS enabled
- [ ] Credentials entered
- [ ] Connection tested successfully
- [ ] Polling interval set (3 minutes)
- [ ] Test email received in Chatwoot

### SMTP Configuration
- [ ] SMTP server: smtp.zohocloud.ca
- [ ] SMTP port: 465 (or 587 if needed)
- [ ] SSL/TLS enabled
- [ ] Credentials entered
- [ ] Connection tested successfully
- [ ] Test reply sent from Chatwoot
- [ ] Email headers verified (correct FROM)

### Verification
- [ ] Bidirectional email working
- [ ] FROM address correct both ways
- [ ] Conversation threading works
- [ ] Screenshots captured (passwords redacted)
- [ ] Evidence logged to feedback/chatwoot.md

---

## 📊 Expected Timeline

**IMAP Configuration** (3 hours):
- Setup: 30 minutes
- Testing: 30 minutes
- Troubleshooting buffer: 1.5 hours
- Documentation: 30 minutes

**SMTP Configuration** (2 hours):
- Setup: 30 minutes
- Testing: 30 minutes
- Troubleshooting buffer: 30 minutes
- Documentation: 30 minutes

**Total**: 5 hours for complete email integration

---

## 🎯 Handoff Requirements

**For Engineer** (after completion):
- Email inbox fully configured and tested
- Bidirectional email flow verified
- Configuration documented
- No action required from Engineer for email

**For Support** (after completion):
- Email inbox ready to use
- Canned responses will be added in Task 5
- Training on email vs chat workflows needed

---

**Created**: 2025-10-13T14:10:00Z  
**Owner**: Chatwoot Agent  
**Status**: Configuration guide complete, ready for execution  
**Next**: Execute configuration in Chatwoot dashboard

