# Chatwoot Zoho Email Configuration Guide
**Date**: 2025-10-13  
**Operator**: Chatwoot Agent  
**Target Completion**: 2025-10-14T20:00:00Z

## Prerequisites
✅ Chatwoot deployed at: https://hotdash-chatwoot.fly.dev  
✅ Zoho credentials sourced from: `vault/occ/zoho/customer_support_staging.env`  
✅ Chatwoot admin credentials sourced from: `vault/occ/chatwoot/super_admin_staging.env`

## Configuration Values (from vault)
- **IMAP Server**: imap.zohocloud.ca
- **IMAP Port**: 993
- **IMAP Security**: SSL/TLS
- **SMTP Server**: smtp.zohocloud.ca
- **SMTP Port**: 465
- **SMTP Security**: SSL
- **Email Address**: customer.support@hotrodan.com
- **Username**: customer.support@hotrodan.com
- **Password**: (from vault - do not document in plain text)

---

## Task 1: Zoho Mail IMAP Configuration (3 hours)
**Deadline**: 2025-10-14T12:00:00Z

### Steps:
1. **Access Chatwoot Dashboard**
   - Navigate to: https://hotdash-chatwoot.fly.dev
   - Log in with super admin credentials

2. **Navigate to Inbox Creation**
   - Click **Settings** (gear icon in sidebar)
   - Select **Inboxes** from the settings menu
   - Click **Add Inbox** button

3. **Select Email Channel**
   - Choose **Email** as the channel type
   - Click **Continue** or **Next**

4. **Configure IMAP Settings**
   - **Inbox Name**: `Hot Rod AN Customer Support`
   - **Email Address**: `customer.support@hotrodan.com`
   - **IMAP Settings**:
     - **IMAP Address**: `imap.zohocloud.ca`
     - **IMAP Port**: `993`
     - **IMAP Login**: `customer.support@hotrodan.com`
     - **IMAP Password**: (paste from vault)
     - **Enable SSL**: ✅ YES
   - **IMAP Polling Interval**: `3 minutes` (recommended)

5. **Test Connection**
   - Click **Test Connection** or **Validate** button
   - Wait for success confirmation
   - If error, verify credentials and try again

6. **Save Configuration**
   - Click **Create Inbox** or **Save**
   - Note the Inbox ID for reference

### Verification:
- [ ] IMAP connection test successful
- [ ] Inbox appears in inbox list
- [ ] No error messages displayed

### Evidence Required:
- Screenshot of IMAP configuration page (REDACT password field)
- Screenshot of successful connection test
- Note timestamp in feedback/chatwoot.md

---

## Task 2: Zoho Mail SMTP Configuration (2 hours)
**Deadline**: 2025-10-14T14:00:00Z

### Steps:
1. **Access Inbox Settings**
   - Navigate to **Settings → Inboxes**
   - Select the **Hot Rod AN Customer Support** inbox created in Task 1
   - Click **Settings** or **Edit**

2. **Configure SMTP Settings**
   - Look for **Outgoing Email** or **SMTP Configuration** section
   - **SMTP Settings**:
     - **SMTP Address**: `smtp.zohocloud.ca`
     - **SMTP Port**: `465`
     - **SMTP Login**: `customer.support@hotrodan.com`
     - **SMTP Password**: (paste from vault - same as IMAP)
     - **SMTP Authentication**: ✅ YES
     - **Enable SSL/TLS**: ✅ YES (SSL)
     - **SMTP Domain**: `zohocloud.ca` (if required)

3. **Configure Email Settings**
   - **From Name**: `Hot Rod AN Customer Support`
   - **From Email**: `customer.support@hotrodan.com`
   - **Reply-To Email**: `customer.support@hotrodan.com`

4. **Test Outbound Email**
   - Look for **Send Test Email** button
   - Enter a test recipient email (your own email)
   - Click **Send Test Email**
   - Check recipient inbox for test email

5. **Verify Email Headers**
   - Open received test email
   - View email headers (usually in email client settings)
   - Confirm **FROM**: customer.support@hotrodan.com
   - Confirm **SMTP path** shows zohocloud.ca

6. **Save Configuration**
   - Click **Update** or **Save**

### Verification:
- [ ] SMTP connection test successful
- [ ] Test email received
- [ ] FROM address correct: customer.support@hotrodan.com
- [ ] Email headers show correct SMTP path

### Evidence Required:
- Screenshot of SMTP configuration page (REDACT password field)
- Screenshot of sent test email
- Screenshot or text of email headers showing FROM and SMTP path
- Note timestamp in feedback/chatwoot.md

---

## Task 3: Chatwoot Email Inbox Setup (2 hours)
**Deadline**: 2025-10-14T16:00:00Z

### Steps:
1. **Configure Inbox Details**
   - Navigate to **Settings → Inboxes → Hot Rod AN Customer Support**
   - Verify inbox name: `Hot Rod AN Customer Support`
   - Verify email display: `customer.support@hotrodan.com`

2. **Assign Agents** (if applicable)
   - Go to **Collaborators** or **Agents** tab
   - Add any Chatwoot users who should handle emails
   - If only one user, ensure they're assigned

3. **Configure Auto-Assignment Rules**
   - Navigate to **Settings** or **Automation** section
   - Look for **Auto Assignment** settings
   - Options:
     - **Manual**: Emails require manual assignment
     - **Round Robin**: Distribute evenly among agents
     - **Load Balanced**: Assign based on current workload
   - Choose **Manual** for now (can change later)

4. **Set Working Hours** (optional)
   - Navigate to **Business Hours** or **Working Hours**
   - Configure if needed (e.g., Mon-Fri 9am-5pm EST)
   - Leave as 24/7 if not specified

5. **Configure Away Message** (optional)
   - Navigate to **Canned Responses** or **Auto Replies**
   - Create away message if needed
   - Skip for now if not required

6. **Test Bidirectional Email Flow**
   - **Inbound Test**:
     - Send email TO: customer.support@hotrodan.com from external email
     - Wait 3-5 minutes (IMAP polling interval)
     - Verify email appears as conversation in Chatwoot
   
   - **Outbound Test**:
     - Open the conversation in Chatwoot
     - Reply to the email from Chatwoot interface
     - Check external email inbox for reply
     - Verify FROM: customer.support@hotrodan.com
   
   - **Threading Test**:
     - Reply to the Chatwoot email from external inbox
     - Verify reply appears in same conversation thread in Chatwoot

### Verification:
- [ ] Inbound email arrives in Chatwoot as conversation
- [ ] Outbound reply sends successfully
- [ ] FROM address correct in both directions
- [ ] Email threading works (replies stay in same conversation)
- [ ] Agent assignment functioning

### Evidence Required:
- Screenshot of inbox configuration
- Screenshot of inbound email as Chatwoot conversation
- Screenshot of outbound reply in external email client
- Screenshot showing email thread in Chatwoot
- Note timestamp in feedback/chatwoot.md

---

## Task 4: Live Chat Widget Configuration (2 hours)
**Deadline**: 2025-10-14T18:00:00Z

### Steps:
1. **Create Website Inbox**
   - Navigate to **Settings → Inboxes**
   - Click **Add Inbox**
   - Select **Website** channel type
   - Click **Continue**

2. **Configure Widget Settings**
   - **Website Name**: `Hot Rod AN`
   - **Website Domain**: `hotrodan.com` (add staging domains if needed)
   - **Widget Color**: `#DC2626` (red to match Hot Rod AN branding - adjust if needed)
   - **Welcome Heading**: `Need help with AN fittings?`
   - **Welcome Tagline**: `Chat with us!`
   - **Enable Pre-chat Form**: ✅ YES
   - **Pre-chat Form Fields**:
     - Name (required)
     - Email (required)
     - Message (optional)

3. **Customize Widget Appearance**
   - **Widget Position**: Bottom right
   - **Widget Bubble Icon**: Default chat icon (or upload Hot Rod AN logo if option available)
   - **Agent Avatar**: Upload Hot Rod AN logo or use default
   - **Enable Mobile Responsive**: ✅ YES (should be default)

4. **Generate Widget Embed Code**
   - After saving, look for **Installation** or **Embed Code** section
   - Copy the complete JavaScript embed code
   - It should look similar to:
     ```javascript
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
             websiteToken: 'WEBSITE_TOKEN_HERE',
             baseUrl: BASE_URL
           })
         }
       })(document,"script");
     </script>
     ```

5. **Save Embed Code**
   - Copy the complete embed code
   - Save to: `docs/chatwoot/widget_embed_code.txt`
   - Note the `websiteToken` value for reference

6. **Test Widget (if preview available)**
   - Look for **Preview** or **Test Widget** option in Chatwoot
   - Test the widget appearance
   - Verify colors, text, and form fields

7. **Create Engineer Handoff Document**
   - Create installation instructions (see below)

### Verification:
- [ ] Widget configured in Chatwoot
- [ ] Embed code generated and saved
- [ ] Widget color matches Hot Rod AN branding
- [ ] Pre-chat form configured
- [ ] Engineer handoff document created

### Evidence Required:
- Screenshot of widget configuration page
- Saved embed code in `docs/chatwoot/widget_embed_code.txt`
- Screenshot of widget preview (if available)
- Engineer handoff document created
- Note timestamp in feedback/chatwoot.md

---

## Task 5: Email Signature & Templates (1 hour)
**Deadline**: 2025-10-14T20:00:00Z

### Steps:
1. **Configure Email Signature**
   - Navigate to **Settings → Inboxes → Hot Rod AN Customer Support**
   - Look for **Email Signature** or **Signature** section
   - Enter signature:
     ```
     Best regards,
     Hot Rod AN Customer Support

     Hot Rod AN LLC
     Premium AN Fittings & Fuel System Components
     www.hotrodan.com
     ```
   - Save signature

2. **Create Canned Responses**
   - Navigate to **Settings → Canned Responses**
   - Click **Add Canned Response**
   - Create the following templates:

   **Template 1: Shipping Timeframe**
   - **Short Code**: `shipping`
   - **Content**:
     ```
     Thanks for your order! Most orders ship within 1-2 business days. 
     You'll receive a tracking number via email once your order ships.
     
     If you have any questions about your order, please provide your order number.
     ```

   **Template 2: AN Sizing Help**
   - **Short Code**: `sizing`
   - **Content**:
     ```
     AN fittings use a dash size system. Here's a quick guide:
     
     -4 AN = 1/4" hose
     -6 AN = 3/8" hose
     -8 AN = 1/2" hose
     -10 AN = 5/8" hose
     -12 AN = 3/4" hose
     
     Need help determining the right size for your application? Let us know what you're working on!
     ```

   **Template 3: Return Policy**
   - **Short Code**: `returns`
   - **Content**:
     ```
     We accept returns within 30 days of purchase for unused items in original packaging.
     
     To initiate a return:
     1. Reply with your order number
     2. Let us know which items you'd like to return
     3. We'll provide a return authorization and instructions
     
     Refunds are processed within 5-7 business days of receiving the return.
     ```

   **Template 4: Technical Support**
   - **Short Code**: `technical`
   - **Content**:
     ```
     For technical fitment questions, we recommend:
     
     1. Check our installation guides at www.hotrodan.com/guides
     2. Verify your vehicle/application specifications
     3. Contact us with your specific setup details
     
     What vehicle or application are you working on? The more details you provide, the better we can assist!
     ```

   **Template 5: Order Status**
   - **Short Code**: `orderstatus`
   - **Content**:
     ```
     I'd be happy to check your order status!
     
     Can you please provide your order number? It should be in your order confirmation email.
     
     Once I have that, I can give you the current status and tracking information if available.
     ```

3. **Test Signature**
   - Create a test conversation or use existing one
   - Send a reply
   - Verify signature appears at bottom of email

4. **Test Canned Responses**
   - Open a conversation
   - Type `/` or look for canned response button
   - Verify all 5 templates appear
   - Test inserting one template
   - Verify content appears correctly

5. **Optional: Configure Auto-Responder**
   - Navigate to **Settings → Automation**
   - Create rules for:
     - After hours message (if applicable)
     - Weekend message (if applicable)
   - Skip if not required for now

### Verification:
- [ ] Email signature configured
- [ ] 5 canned responses created
- [ ] Signature appears in test emails
- [ ] Canned responses easy to insert and use

### Evidence Required:
- Screenshot of signature configuration
- Screenshot of canned responses list
- Screenshot of test email showing signature
- Note timestamp in feedback/chatwoot.md

---

## Engineer Handoff Document

Create this file: `docs/chatwoot/engineer_widget_installation_instructions.md`

```markdown
# Chatwoot Live Chat Widget Installation Instructions

**For**: Engineer  
**From**: Chatwoot Agent  
**Date**: 2025-10-14  
**Status**: Ready for Installation

## Widget Details
- **Chatwoot Instance**: https://hotdash-chatwoot.fly.dev
- **Widget Token**: [from embed code]
- **Configured For**: Hot Rod AN (hotrodan.com)

## Installation Steps

1. **Locate Embed Code**
   - File: `docs/chatwoot/widget_embed_code.txt`
   - Copy the complete `<script>` block

2. **Installation Location**
   - **Recommended**: Add to Hot Rod AN theme layout file
   - **Likely files**:
     - `theme.liquid` (Shopify theme)
     - `layout/theme.liquid`
     - Before closing `</body>` tag

3. **Installation Method**
   - Paste the embed code just before `</body>` tag
   - No modifications needed to the code
   - Widget will load automatically on all pages

4. **Testing Checklist**
   - [ ] Widget appears in bottom right corner
   - [ ] Widget color matches Hot Rod AN branding
   - [ ] Pre-chat form collects name and email
   - [ ] Test message sends successfully
   - [ ] Message appears in Chatwoot dashboard
   - [ ] Mobile responsive (test on phone)

5. **Troubleshooting**
   - If widget doesn't appear: Check browser console for errors
   - If widget doesn't connect: Verify BASE_URL is correct
   - If messages don't send: Check websiteToken value

## Expected Appearance
[Screenshot of widget preview will be attached]

## Questions?
Contact Chatwoot agent or check feedback/chatwoot.md for updates.
```

---

## Post-Completion Checklist

After all 5 tasks complete:
- [ ] Comprehensive test of full email + chat flow
- [ ] Engineer handoff document created
- [ ] All evidence logged in feedback/chatwoot.md
- [ ] Update feedback/manager.md with completion status
- [ ] Document any Zoho-specific quirks discovered

---

## Evidence Logging Template

Use this template for each task in `feedback/chatwoot.md`:

```markdown
## YYYY-MM-DDTHH:MM:SSZ — Task N Complete: [Task Name]

**Task**: [Brief description]
**Status**: ✅ Complete / ⚠️ Partial / ❌ Blocked
**Evidence**: 
- Screenshot: artifacts/chatwoot/[filename].png
- Configuration: [key settings]
- Test results: [outcomes]
**Issues**: [Any problems encountered]
**Next**: [Next task or action]
```

---

## Escalation Criteria

Escalate to Manager if:
- Any task blocked >2 hours
- IMAP/SMTP connection fails after 2 attempts
- Zoho credentials invalid
- Chatwoot dashboard inaccessible
- Email delivery fails consistently

Document in feedback/chatwoot.md with:
- What was tried (minimum 2 attempts)
- Error messages/screenshots
- Timestamp of escalation

