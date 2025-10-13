---
epoch: 2025.10.E1
doc: docs/directions/chatwoot.md
owner: manager
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-20
---
# Chatwoot Integrations — Direction (Operator Control Center)

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Credential Map: docs/ops/credential_index.md
- Manager Feedback: feedback/manager.md (check for latest assignments)

## 🚨 P1 PRIORITY: Zoho Mail Integration + Live Chat (2025-10-13)

**Assignment**: Configure Chatwoot for email + live chat on Hot Rod AN
**Timeline**: 10 hours (complete by 2025-10-14T20:00:00Z)
**Evidence**: Log all work in feedback/chatwoot.md

### Task 1: Zoho Mail IMAP Configuration (3 hours)

**Credentials**: Source from vault before starting
```bash
cd ~/HotDash/hot-dash
source vault/occ/zoho/customer_support_staging.env
# Sets: ZOHO_IMAP_HOST, ZOHO_IMAP_PORT, ZOHO_IMAP_USER, ZOHO_IMAP_PASS
```

**Configuration**:
- Server: imap.zohocloud.ca (Canadian Zoho)
- Port: 993
- Security: SSL/TLS
- Username: customer.support@hotrodan.com
- Password: (from vault)

**Steps**:
1. Access Chatwoot dashboard (deployed on Fly.io)
2. Navigate to Settings → Inboxes → Add Inbox
3. Select "Email" channel
4. Enter IMAP configuration from vault
5. Set polling interval: 2-5 minutes (recommend 3 min)
6. Test inbox connection
7. Verify emails sync from Zoho

**Success Criteria**:
- ✅ IMAP connection established
- ✅ Test email received in Chatwoot
- ✅ Email appears as conversation

**Evidence Required**:
- Screenshot of IMAP config (REDACT password)
- Screenshot of test email in Chatwoot
- Connection test log
- Timestamp: 2025-10-14THHMMSSZ

**Deadline**: 2025-10-14T12:00:00Z

---

### Task 2: Zoho Mail SMTP Configuration (2 hours)

**Credentials**: Same vault file as IMAP
```bash
source vault/occ/zoho/customer_support_staging.env
# Sets: ZOHO_SMTP_HOST, ZOHO_SMTP_PORT, ZOHO_SMTP_USER, ZOHO_SMTP_PASS
```

**Configuration**:
- Server: smtp.zohocloud.ca (Canadian Zoho)
- Port: 465 (SSL) or 587 (TLS) - test both, use 465 if works
- Security: SSL/TLS
- Username: customer.support@hotrodan.com
- Password: (from vault)

**Steps**:
1. In same email inbox, configure SMTP settings
2. Enter SMTP configuration from vault
3. Enable SSL/TLS
4. Test outbound email
5. Send test reply from Chatwoot
6. Verify recipient receives email with correct FROM address

**Success Criteria**:
- ✅ SMTP connection established
- ✅ Test reply sent successfully
- ✅ Email received with FROM: customer.support@hotrodan.com
- ✅ Email signature displays correctly

**Evidence Required**:
- Screenshot of SMTP config (REDACT password)
- Screenshot of sent email
- Email headers showing correct FROM/SMTP path
- Timestamp

**Deadline**: 2025-10-14T14:00:00Z

---

### Task 3: Chatwoot Email Inbox Setup (2 hours)

**Steps**:
1. Configure inbox name: "Hot Rod AN Customer Support"
2. Set email address display: customer.support@hotrodan.com
3. Assign agents to inbox (if multiple Chatwoot users)
4. Configure auto-assignment rules (round-robin or manual)
5. Set working hours (if applicable)
6. Configure away message (if applicable)
7. Test bidirectional email flow:
   - Customer sends to customer.support@hotrodan.com
   - Email arrives in Chatwoot as conversation
   - Agent replies from Chatwoot
   - Customer receives reply from customer.support@hotrodan.com

**Success Criteria**:
- ✅ Full bidirectional email working
- ✅ FROM address correct in both directions
- ✅ Conversation threading works
- ✅ Agent assignment functioning

**Evidence Required**:
- Inbox configuration screenshot
- Full email thread test (customer → Chatwoot → customer)
- Screenshot of conversation in Chatwoot
- Timestamp

**Deadline**: 2025-10-14T16:00:00Z

---

### Task 4: Live Chat Widget Configuration (2 hours)

**Important**: No training data for Chatwoot widget - search Chatwoot docs if needed

**Steps**:
1. In Chatwoot dashboard, navigate to Settings → Inboxes → Add Inbox
2. Select "Website" channel (live chat widget)
3. Configure widget settings:
   - Website name: "Hot Rod AN"
   - Website domain: hotrodan.com (and any staging domains)
   - Widget color: Match Hot Rod AN branding
   - Welcome message: "Need help with AN fittings? Chat with us!"
   - Pre-chat form: Collect name + email
4. Generate widget embed code
5. Customize widget appearance:
   - Logo: Hot Rod AN logo
   - Agent avatar: Hot Rod AN branding
   - Position: Bottom right
   - Mobile responsive: Enabled
6. Test widget in staging environment first

**Widget Embed Code** (example format):
```javascript
<script>
  (function(d,t) {
    var BASE_URL="https://your-chatwoot-instance.fly.dev";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: 'WEBSITE_TOKEN_HERE',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>
```

**Handoff to Engineer**:
- Provide complete embed code
- Document where to place (likely in Hot Rod AN theme layout)
- Provide installation instructions
- Include screenshot of expected widget appearance

**Success Criteria**:
- ✅ Widget configured and tested in Chatwoot
- ✅ Embed code generated
- ✅ Branding customized for Hot Rod AN
- ✅ Engineer has clear installation instructions

**Evidence Required**:
- Widget configuration screenshot
- Embed code (store in docs/chatwoot/widget_embed_code.txt)
- Widget preview screenshot
- Installation instructions for Engineer
- Timestamp

**Deadline**: 2025-10-14T18:00:00Z

---

### Task 5: Email Signature & Templates (1 hour)

**Email Signature**:
Create professional signature for customer.support@hotrodan.com:
```
Best regards,
Hot Rod AN Customer Support

Hot Rod AN LLC
Premium AN Fittings & Fuel System Components
www.hotrodan.com
Phone: [if available]
Hours: [if applicable]
```

**Canned Responses** (create templates for common questions):
1. **Shipping timeframe**: "Thanks for your order! Most orders ship within 1-2 business days..."
2. **AN sizing help**: "AN fittings use a dash size system. Here's a quick guide..."
3. **Return policy**: "We accept returns within 30 days..."
4. **Technical support**: "For technical fitment questions, we recommend..."
5. **Order status**: "Let me check your order status. Can you provide your order number?"

**Auto-Responder** (optional):
- After hours message
- Weekend message
- Holiday message

**Steps**:
1. Configure signature in Chatwoot inbox settings
2. Create canned responses in Chatwoot
3. Test signature appears in outbound emails
4. Test canned response insertion

**Success Criteria**:
- ✅ Signature configured
- ✅ 5+ canned responses created
- ✅ Signature appears in test emails
- ✅ Canned responses easy to use

**Evidence Required**:
- Screenshot of signature config
- List of canned responses created
- Test email showing signature
- Timestamp

**Deadline**: 2025-10-14T20:00:00Z

---

## MCP Tools NOT Required

Chatwoot configuration is primarily UI-based. No MCP tools needed for this work.

## Evidence Gate

Every task must log in feedback/chatwoot.md:
- Timestamp (YYYY-MM-DDTHH:MM:SSZ format)
- Task completed
- Screenshot/artifact path
- Issues encountered (if any)
- Next steps

Example entry:
```markdown
## 2025-10-14T12:00:00Z — Task 1 Complete: IMAP Configuration

**Task**: Zoho Mail IMAP setup
**Status**: ✅ Complete
**Evidence**: 
- Screenshot: artifacts/chatwoot/imap_config_2025-10-14.png
- Test log: IMAP connection successful, 3min polling interval
**Issues**: None
**Next**: Task 2 - SMTP configuration
```

## Blockers to Escalate

If ANY task blocked >2 hours:
1. Document blocker in feedback/chatwoot.md
2. Note what was tried (2 attempts minimum)
3. Escalate to Manager in feedback/manager.md
4. Include error messages/screenshots

## Post-Completion

After all 5 tasks complete:
1. Comprehensive test of full email + chat flow
2. Create handoff document for Engineer (widget installation)
3. Document any Zoho-specific quirks discovered
4. Update feedback/chatwoot.md with final status
5. Mark complete in Manager daily standup

**Target Completion**: 2025-10-14T20:00:00Z (27 hours from assignment)

## Coordination

- **Engineer**: Will install widget after Task 4 complete
- **Manager**: Monitoring progress in daily standups
- **Support**: May use system after deployment complete

