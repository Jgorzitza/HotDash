# Data Subject Request (DSR) Procedures

**Owner:** Compliance  
**Last Updated:** 2025-10-12  
**Version:** 1.0  
**Status:** ACTIVE

---

## 1. Overview

This runbook defines procedures for handling Data Subject Requests (DSRs) under GDPR and CCPA. DSRs allow customers to exercise their privacy rights.

**Supported Rights:**

- Right to Access (GDPR Art. 15, CCPA §1798.100)
- Right to Rectification (GDPR Art. 16)
- Right to Erasure (GDPR Art. 17, CCPA §1798.105)
- Right to Restriction (GDPR Art. 18)
- Right to Data Portability (GDPR Art. 20)
- Right to Object (GDPR Art. 21)
- Right to Opt-Out of AI (Feature-specific)

---

## 2. Request Reception

### 2.1 How Customers Submit Requests

**Email:** support@hotrodan.com  
**Subject Line:** "Privacy Request - [Request Type]"

**Required Information:**

- Full name
- Email address
- Type of request (access, delete, rectify, export, opt-out)
- Details of request

**Example Email:**

```
To: support@hotrodan.com
Subject: Privacy Request - Delete My Data

Hello,

I would like to request deletion of all my personal data held by Hot Rodan in HotDash.

Name: John Doe
Email: john.doe@example.com
Order Number (for verification): #HD12345

Thank you,
John Doe
```

### 2.2 Initial Response

**Respond within:** 48 hours (acknowledge receipt)

**Response Template:**

```
Dear [Customer Name],

Thank you for your privacy request. We have received your request to [access/delete/rectify/export] your data.

We will process your request and respond within [7/14/30] days as required by law.

To verify your identity, please confirm:
- Email address on file: [email@example.com]
- [Order number OR phone number for verification]

If you have questions, reply to this email.

Best regards,
Hot Rodan Support Team
```

---

## 3. Identity Verification

### 3.1 Verification Methods

**Low-Risk Requests (Access, Export):**

- Email match: Request email matches customer email on file
- OR: Provide recent order number

**High-Risk Requests (Delete, Rectify):**

- Email match + Order number
- OR: Phone verification call
- OR: Multi-factor email challenge

### 3.2 Verification Checklist

- [ ] Email address matches customer on file
- [ ] Order number provided (if available)
- [ ] Customer has made purchases recently (validate context)
- [ ] No red flags (suspicious request, impersonation risk)

**If verification fails:**

- Request additional information
- Call customer for phone verification
- Extend timeline if needed (document reason)

---

## 4. Data Subject Rights Procedures

### 4.1 Right to Access (GDPR Art. 15)

**Timeline:** 30 days

**Procedure:**

**Step 1: Gather Data**

```sql
-- Query decision logs
SELECT
  id, created_at, scope, actor, action, rationale,
  shop_domain, external_ref, payload
FROM decision_sync_event_logs
WHERE external_ref LIKE 'chatwoot:%'
  AND (
    payload->>'customerName' ILIKE '%[Customer Name]%'
    OR external_ref LIKE '%[conversation_id]%'
  );

-- Query Chatwoot conversations
-- Via API: GET /api/v1/conversations?contact_email=[email]

-- Query dashboard facts (if contains PII)
SELECT * FROM dashboard_facts
WHERE value::jsonb @> '{"customerName": "[Customer Name]"}';
```

**Step 2: Export Data**

- Format: JSON or structured PDF
- Include: All personal data found
- Redact: Other customers' data if in shared records
- Include: Data categories, purposes, retention periods

**Step 3: Deliver to Customer**

```
To: [customer email]
Subject: Your Data Access Request - Hot Rodan

Dear [Customer Name],

Attached is a complete export of your personal data held by Hot Rodan in HotDash.

The export includes:
- Support conversation data (if any)
- Decision logs related to your inquiries
- Dates of data collection and retention periods

If you have questions about this data, please reply to this email.

Best regards,
Hot Rodan Support Team
```

**Step 4: Document**

- Log DSR in compliance records
- Store export copy (encrypted) for 90 days
- Update metrics

### 4.2 Right to Erasure (GDPR Art. 17)

**Timeline:** 14 days

**Procedure:**

**Step 1: Verify Request**

- Customer identity verified (Section 3)
- No legal hold applies
- No overriding legitimate interest

**Step 2: Delete Data**

```sql
-- Delete from decision logs
DELETE FROM decision_sync_event_logs
WHERE external_ref LIKE 'chatwoot:[conversation_id]'
  OR payload->>'customerName' = '[Customer Name]';

-- Delete from Chatwoot (via API)
DELETE /api/v1/conversations/[conversation_id]

-- Delete from dashboard facts (if PII present)
DELETE FROM dashboard_facts
WHERE value::jsonb->>'customerName' = '[Customer Name]';

-- Verify deletion
SELECT COUNT(*) FROM decision_sync_event_logs
WHERE payload->>'customerName' = '[Customer Name]';
-- Expected: 0
```

**Step 3: Confirm to Customer**

```
To: [customer email]
Subject: Your Data Deletion Request - Complete

Dear [Customer Name],

Your data deletion request has been processed. All personal data has been permanently deleted from our systems.

Deleted:
- Support conversation history
- Decision logs
- Any personal information in our database

Retained (anonymized, no PII):
- Aggregated analytics (e.g., "10 support tickets this month")
- This is permitted under GDPR for statistical purposes

If you have questions, please reply to this email.

Best regards,
Hot Rodan Support Team
```

**Step 4: Document**

- Log deletion in compliance records
- Store confirmation (no PII) for 3 years
- Update metrics

**Exceptions to Deletion:**

- Legal hold (litigation)
- Regulatory requirement
- Customer's other active account (explain separately)

### 4.3 Right to Rectification (GDPR Art. 16)

**Timeline:** 7 days

**Procedure:**

**Step 1: Identify Inaccurate Data**

- Customer specifies what needs correction
- Verify the correction is accurate

**Step 2: Update Records**

```sql
-- Update decision logs (if name incorrect)
UPDATE decision_sync_event_logs
SET payload = jsonb_set(
  payload,
  '{customerName}',
  '"[Corrected Name]"'
)
WHERE external_ref LIKE 'chatwoot:[conversation_id]';

-- Update Chatwoot contact (via API)
PATCH /api/v1/contacts/[contact_id]
{
  "name": "[Corrected Name]",
  "email": "[Corrected Email]"
}
```

**Step 3: Confirm to Customer**

```
Your data has been corrected as requested. The updated information is now reflected in our systems.
```

**Step 4: Document**

- Log rectification in compliance records

### 4.4 Right to Restriction (GDPR Art. 18)

**Timeline:** Immediate

**Procedure:**

**Step 1: Add Restriction Flag**

```sql
-- Add restriction note to conversation
-- Via Chatwoot API: add tag "restricted"
POST /api/v1/conversations/[id]/labels
{
  "labels": ["data-restricted"]
}
```

**Step 2: Notify Team**

- Alert support operators
- Do not process further without customer approval

**Step 3: Confirm to Customer**

```
Processing of your data has been restricted as requested. We will not process your data further until you authorize us to do so.
```

### 4.5 Right to Data Portability (GDPR Art. 20)

**Timeline:** 30 days

**Procedure:**

**Step 1: Export Data**

```json
{
  "customer": {
    "name": "[Customer Name]",
    "email": "[Email]"
  },
  "conversations": [
    {
      "id": 123,
      "created_at": "2025-10-01T10:00:00Z",
      "status": "resolved",
      "messages": [
        {
          "author": "contact",
          "content": "Hello, I need help",
          "created_at": "2025-10-01T10:00:00Z"
        },
        {
          "author": "agent",
          "content": "Hi! How can I help?",
          "created_at": "2025-10-01T10:05:00Z"
        }
      ]
    }
  ],
  "decisions": [
    {
      "action": "chatwoot.approve_send",
      "timestamp": "2025-10-01T10:05:00Z",
      "operator": "support@hotrodan.com"
    }
  ]
}
```

**Format Options:** JSON (default) or CSV

**Step 2: Deliver**

- Secure download link (encrypted, expires in 7 days)
- Or: Encrypted email attachment

**Step 3: Document**

- Log export in compliance records

### 4.6 Right to Object (GDPR Art. 21)

**Timeline:** Immediate

**Procedure:**

**Step 1: Disable AI for Customer**

```sql
-- Add opt-out flag to customer record
-- Implementation: via Chatwoot metadata or separate table
INSERT INTO customer_preferences (email, ai_enabled)
VALUES ('[email]', false)
ON CONFLICT (email) DO UPDATE SET ai_enabled = false;
```

**Step 2: Confirm to Customer**

```
AI assistance has been disabled for your support conversations. All responses will be written by human operators.

This does not affect the quality or speed of support.
```

**Step 3: Notify Team**

- Alert operators that AI is disabled for this customer
- Display notice in HotDash UI

### 4.7 Right to Opt-Out of AI (Feature-Specific)

**Timeline:** Immediate

**Procedure:**

**Quick Opt-Out (Customer Says "No AI"):**

1. Operator adds "no-ai" tag to conversation
2. AI disabled immediately for that customer
3. Confirm to customer in same conversation

**Formal Opt-Out (Email Request):**

1. Customer emails support@hotrodan.com
2. Process as "Right to Object" (Section 4.6)
3. Confirm within 24 hours

---

## 5. DSR Tracking

### 5.1 DSR Log

**Create log in:** `artifacts/compliance/dsr_log_[YYYY].md`

**Log Template:**

```markdown
# Data Subject Requests - [Year]

| Date Received | Customer   | Request Type | Timeline | Status     | Completed  |
| ------------- | ---------- | ------------ | -------- | ---------- | ---------- |
| 2025-10-15    | John Doe   | Delete       | 14 days  | Processing | -          |
| 2025-10-16    | Jane Smith | Access       | 30 days  | Completed  | 2025-10-20 |
```

### 5.2 Metrics to Track

**Monthly:**

- Total DSRs received
- DSRs by type
- Average response time
- On-time completion rate

**KPIs:**

- Response time < legal deadline (100%)
- Customer satisfaction with DSR process
- Escalations (should be 0)

---

## 6. Testing & Validation

### 6.1 Test Deletion Workflow

**Test Scenario:** Delete test customer data

**Test Steps:**

**Step 1: Create Test Data**

```sql
-- Create test conversation in Chatwoot (via UI)
-- Create test decision log
INSERT INTO decision_sync_event_logs (
  scope, actor, action, shop_domain, external_ref, payload, created_at
) VALUES (
  'ops', 'test@example.com', 'test.action', 'hotrodan.myshopify.com',
  'chatwoot:test-123', '{"customerName": "Test Customer", "test": true}',
  NOW()
);
```

**Step 2: Execute Deletion**

```sql
-- Delete test data
DELETE FROM decision_sync_event_logs
WHERE payload->>'test' = 'true';

-- Verify deletion
SELECT COUNT(*) FROM decision_sync_event_logs
WHERE payload->>'customerName' = 'Test Customer';
-- Expected: 0
```

**Step 3: Verify No Remnants**

- Check all tables
- Search logs for customer name
- Verify complete removal

**Step 4: Document**

- Test date, time
- Steps executed
- Results (success/failure)
- Any issues found

**Test Schedule:** Before production launch, then quarterly

---

## 7. Exceptions & Edge Cases

### 7.1 Deletion Exceptions

**Cannot Delete If:**

1. **Legal Hold:** Litigation or investigation in progress
2. **Regulatory Requirement:** Law requires retention
3. **Contract Obligation:** Active subscription or account

**Customer Response:**

```
We cannot fully delete your data at this time because [reason]. However, we can restrict processing and anonymize your data.

[Explain specific legal requirement]

Your data will be deleted once [condition] is met.
```

### 7.2 Complex Requests

**Multiple Rights in One Request:**

- Process each right separately
- Respond with combined result
- Use longest timeline

**Ambiguous Requests:**

- Email customer for clarification
- Timeline starts from clarification date
- Document all communication

**Third-Party Data:**

- Cannot delete data held by Shopify/Chatwoot directly
- Provide instructions for customer to contact them
- Delete our copies

---

## 8. Automation Roadmap

### 8.1 Current State (Manual)

**Pilot:** Manual DSR processing acceptable

- Low volume (10 customers)
- 30-day pilot duration
- Compliance team handles requests

### 8.2 Production State (Automated)

**Before Production, Implement:**

1. **DSR Portal**
   - Self-service request submission
   - Identity verification
   - Status tracking
   - Automated exports

2. **Automated Deletion**
   - SQL scripts for each request type
   - Verification queries
   - Audit logging
   - Customer confirmation

3. **DSR Dashboard**
   - Pending requests
   - Timeline tracking
   - Compliance metrics
   - Alert for overdue

**Tools:**

- Supabase Functions for automation
- Email integration for notifications
- Dashboard for tracking

---

## 9. Compliance Evidence

### 9.1 Documentation

**For Each DSR:**

- Customer request (email)
- Identity verification record
- Actions taken (SQL queries, API calls)
- Customer confirmation
- Completion date

**Retention:** 3 years (compliance requirement)

**Location:** `artifacts/compliance/dsr/[YYYY]/`

### 9.2 Annual Report

**Include:**

- Total DSRs processed
- DSRs by type
- Average response time
- On-time completion rate
- Escalations and issues
- Process improvements

**Submit to:** Manager, Legal (if required)

---

## 10. Training

### 10.1 Support Team Training

**Topics:**

- What is a DSR?
- How to identify DSR emails
- Initial response templates
- Escalation to compliance
- Timeline requirements

**Duration:** 30 minutes  
**Schedule:** Before pilot, then annually  
**Training Materials:** This runbook + FAQ

### 10.2 Compliance Team Training

**Topics:**

- Identity verification procedures
- SQL queries for data extraction
- Deletion procedures
- Edge cases and exceptions
- Regulatory timelines

**Duration:** 2 hours  
**Schedule:** Before pilot, then quarterly

---

## 11. Quick Reference

### 11.1 DSR Timeline Summary

| Right            | GDPR Timeline       | CCPA Timeline | Our Timeline |
| ---------------- | ------------------- | ------------- | ------------ |
| Access           | 1 month             | N/A           | 30 days      |
| Delete           | Without undue delay | 45 days       | 14 days      |
| Rectify          | 1 month             | N/A           | 7 days       |
| Restrict         | Without undue delay | N/A           | Immediate    |
| Export           | 1 month             | N/A           | 30 days      |
| Object / Opt-Out | Without undue delay | N/A           | Immediate    |

### 11.2 SQL Quick Reference

**Find Customer Data:**

```sql
SELECT * FROM decision_sync_event_logs
WHERE external_ref LIKE 'chatwoot:%'
  AND payload->>'customerName' ILIKE '%[Name]%';
```

**Delete Customer Data:**

```sql
DELETE FROM decision_sync_event_logs
WHERE external_ref = 'chatwoot:[conversation_id]';
```

**Export Customer Data:**

```sql
SELECT jsonb_pretty(jsonb_agg(row_to_json(t)))
FROM (
  SELECT * FROM decision_sync_event_logs
  WHERE external_ref LIKE 'chatwoot:%'
    AND payload->>'customerName' = '[Name]'
) t;
```

---

## 12. Contact & Escalation

**DSR Email:** support@hotrodan.com  
**Compliance Lead:** compliance@hotrodan.com (or this agent)  
**Legal (if complex):** [To be added]

**Escalate If:**

- Identity verification fails
- Legal exception applies
- Timeline cannot be met
- Complex multi-party request
- Customer threatens legal action

---

**Runbook Version:** 1.0  
**Last Updated:** 2025-10-12  
**Next Review:** Quarterly  
**Owner:** Compliance Agent

**Task BZ-G contribution: ✅ DSR Runbook Created**
