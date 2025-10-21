# Growth Engine CX Workflows — Hot Rod AN Control Center

**Document Version**: 1.0  
**Effective Date**: 2025-10-21  
**Owner**: Support Agent  
**Audience**: CX Operators, AI-Customer Agent, Manager

---

## Table of Contents

1. [Customer-Front Agent Workflow](#customer-front-agent-workflow)
2. [PII Card Usage Guide](#pii-card-usage-guide)
3. [Grading Best Practices](#grading-best-practices)
4. [CX SLA Documentation](#cx-sla-documentation)

---

## Customer-Front Agent Workflow

### Overview

The **Customer-Front Agent** is the first-line CX triage agent in the Growth Engine architecture. It analyzes incoming customer messages, determines the appropriate sub-agent, and orchestrates the handoff to ensure accurate, secure, and timely responses.

**Key Responsibilities**:
- Triage incoming customer inquiries (email, live chat, SMS)
- Analyze message content to determine intent and required capabilities
- Transfer to appropriate sub-agent (`transfer_to_accounts` or `transfer_to_storefront`)
- Compose redacted public replies using PII Broker
- Present drafts to operator for HITL approval
- Learn from operator edits and grades

---

### Architecture

```
Customer Message
    ↓
Customer-Front Agent (Triage)
    ↓
Decision: Analyze intent, required data, write capability
    ↓
    ├── transfer_to_accounts (Order lookups, refunds, exchanges)
    │       ↓
    │   Accounts Sub-Agent (Customer Accounts API - write access)
    │       ↓
    │   Returns: Structured JSON (order details, refund status, tracking)
    │
    └── transfer_to_storefront (Inventory, products, collections)
            ↓
        Storefront Sub-Agent (Storefront API - read-only)
            ↓
        Returns: Structured JSON (inventory status, product details)
    ↓
Customer-Front Agent (Compose Reply)
    ↓
PII Broker (Redact sensitive data)
    ↓
Operator Review (HITL Approval)
    ├── PII Card (full details, operator-only)
    └── Public Reply (redacted, customer-facing)
    ↓
Operator Action: Approve → Send → Grade (1-5 for tone/accuracy/policy)
    ↓
Decision Log (Supabase: grades, edits, feedback for AI learning)
```

---

### Triage Process

#### Step 1: Receive Customer Message

**Channels**:
- **Email**: customer.support@hotrodan.com (Zoho Cloud)
- **Live Chat**: Hot Rod AN Website widget (Chatwoot)
- **SMS**: Twilio phone number (when configured)

**Input Data**:
```json
{
  "conversation_id": 12345,
  "message_id": 67890,
  "channel": "email",
  "customer_email": "john.doe@example.com",
  "customer_name": "John Doe",
  "message_content": "Where is my order? I placed it 3 days ago.",
  "timestamp": "2025-10-21T14:30:00Z",
  "attachments": []
}
```

---

#### Step 2: Analyze Intent

The Customer-Front Agent performs **intent classification** to determine:

1. **Primary Intent**:
   - `order_inquiry` - Tracking, status, shipping
   - `product_question` - Availability, specs, compatibility
   - `inventory_check` - In stock, restock dates
   - `refund_request` - Return, exchange, cancellation
   - `technical_support` - Product issues, installation help
   - `general_inquiry` - Hours, policies, general questions

2. **Required Data**:
   - Order history (requires Customer Accounts API)
   - Inventory status (requires Storefront API)
   - Product details (requires Storefront API)
   - No external data needed (general response)

3. **Write Capability**:
   - **Needs write access**: Refunds, exchanges, order updates → `transfer_to_accounts`
   - **Read-only sufficient**: Inventory, products, collections → `transfer_to_storefront`
   - **No API needed**: General policies, hours → Direct response

**Example Analysis**:
```typescript
// Message: "Where is my order? I placed it 3 days ago."

const analysis = {
  primary_intent: "order_inquiry",
  required_data: ["order_history", "tracking_number"],
  write_capability_needed: false,
  recommended_transfer: "accounts", // Customer Accounts API for order lookup
  urgency: "normal",
  sentiment: "neutral"
};
```

---

#### Step 3: Transfer Decision

Based on intent analysis, the Customer-Front Agent calls one of two transfer functions:

##### transfer_to_accounts

**When to Use**:
- Order lookups (tracking, status, history)
- Refund requests
- Order modifications (address, shipping method)
- Exchange requests
- Cancellation requests
- Payment issues
- Subscription management

**Capabilities**:
- **Read**: Customer Accounts API (orders, payment methods, addresses)
- **Write**: Customer Accounts API (refunds, order updates)
- **Security**: ABAC enforced (customer_agent role, order scopes)

**Example Transfer**:
```typescript
// Customer-Front Agent calls transfer_to_accounts
const transfer = await transferToAccounts({
  conversation_id: 12345,
  customer_email: "john.doe@example.com",
  intent: "order_inquiry",
  query: "Find order placed by john.doe@example.com in last 7 days",
  context: {
    message_content: "Where is my order? I placed it 3 days ago.",
    timestamp: "2025-10-21T14:30:00Z"
  }
});
```

##### transfer_to_storefront

**When to Use**:
- Inventory checks (in stock, restock dates)
- Product questions (specs, compatibility, variants)
- Collection browsing (categories, filters)
- Price inquiries (current pricing, discounts)
- Product availability (locations, warehouses)

**Capabilities**:
- **Read**: Storefront API (products, collections, inventory)
- **Write**: None (read-only)
- **Security**: ABAC enforced (customer_agent role, read-only scopes)

**Example Transfer**:
```typescript
// Customer-Front Agent calls transfer_to_storefront
const transfer = await transferToStorefront({
  conversation_id: 12345,
  intent: "inventory_check",
  query: "Check inventory for AN6 stainless steel braided hose",
  context: {
    message_content: "Do you have AN6 stainless steel braided hose in stock?",
    timestamp: "2025-10-21T14:30:00Z"
  }
});
```

---

#### Step 4: Sub-Agent Execution

**Sub-agents OWN the request** - they execute Shopify GraphQL queries and return structured results.

##### Accounts Sub-Agent Response

```json
{
  "status": "success",
  "conversation_id": 12345,
  "result": {
    "order_id": "gid://shopify/Order/987654321",
    "order_number": "#1234",
    "created_at": "2025-10-18T10:15:00Z",
    "financial_status": "paid",
    "fulfillment_status": "fulfilled",
    "tracking_number": "1Z999AA10123456784",
    "tracking_company": "UPS",
    "tracking_url": "https://www.ups.com/track?tracknum=1Z999AA10123456784",
    "shipping_address": {
      "address1": "123 Main St",
      "city": "Springfield",
      "province": "IL",
      "zip": "62701",
      "country": "US"
    },
    "line_items": [
      {
        "title": "AN6 Stainless Steel Braided Hose - 3ft",
        "quantity": 2,
        "price": "45.00"
      }
    ],
    "total_price": "90.00"
  },
  "metadata": {
    "query_time_ms": 234,
    "api_calls": 1,
    "timestamp": "2025-10-21T14:30:15Z"
  }
}
```

##### Storefront Sub-Agent Response

```json
{
  "status": "success",
  "conversation_id": 12345,
  "result": {
    "product_id": "gid://shopify/Product/123456789",
    "title": "AN6 Stainless Steel Braided Hose",
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/987654321",
        "title": "3ft",
        "price": "45.00",
        "available_quantity": 24,
        "in_stock": true
      },
      {
        "id": "gid://shopify/ProductVariant/987654322",
        "title": "6ft",
        "price": "75.00",
        "available_quantity": 12,
        "in_stock": true
      }
    ],
    "inventory_summary": {
      "total_available": 36,
      "restock_date": null,
      "supplier": "Internal"
    }
  },
  "metadata": {
    "query_time_ms": 187,
    "api_calls": 1,
    "timestamp": "2025-10-21T14:30:12Z"
  }
}
```

---

#### Step 5: Compose Reply

The Customer-Front Agent receives the sub-agent's structured result and composes a **draft reply** for operator review.

**Composition Rules**:
1. **Use structured data** from sub-agent response (don't hallucinate)
2. **Apply brand voice** (Hot Rod AN: helpful, technical, enthusiast-friendly)
3. **Include relevant details** (order number, tracking, inventory status)
4. **Call PII Broker** before returning to operator (redaction enforced)

**Example Draft (Before PII Redaction)**:
```
Hi John,

I found your order! Here are the details:

Order #1234 (placed Oct 18, 2025)
- 2x AN6 Stainless Steel Braided Hose - 3ft ($90.00)
- Payment: Paid ✓
- Status: Shipped!

Your order was shipped via UPS:
Tracking: 1Z999AA10123456784
Track here: https://www.ups.com/track?tracknum=1Z999AA10123456784

Shipping to:
123 Main St, Springfield, IL 62701

Expected delivery: Oct 21-22, 2025

Let me know if you need anything else!

Best,
Hot Rod AN Support
```

---

#### Step 6: PII Broker Redaction

**Before presenting the draft to the operator**, the Customer-Front Agent calls the **PII Broker** to create two versions:

1. **PII Card** (Operator-Only): Full details, no redaction
2. **Public Reply** (Customer-Facing): Sensitive data masked

**PII Broker Rules**:

| Data Type | PII Card (Operator) | Public Reply (Customer) |
|-----------|---------------------|-------------------------|
| Full Email | john.doe@example.com | j***@e***.com |
| Phone | (555) 123-4567 | ***-***-4567 |
| Address | 123 Main St, Springfield, IL 62701 | Springfield, IL (city/state only) |
| Credit Card | **** **** **** 1234 | **** 1234 (last 4 only) |
| Tracking | Full tracking number | Full tracking (ok to share) |
| Order Number | #1234 | #1234 (ok to share) |

**Redacted Public Reply**:
```
Hi John,

I found your order! Here are the details:

Order #1234 (placed Oct 18, 2025)
- 2x AN6 Stainless Steel Braided Hose - 3ft ($90.00)
- Payment: Paid ✓
- Status: Shipped!

Your order was shipped via UPS:
Tracking: 1Z999AA10123456784
Track here: https://www.ups.com/track?tracknum=1Z999AA10123456784

Shipping to: Springfield, IL

Expected delivery: Oct 21-22, 2025

Let me know if you need anything else!

Best,
Hot Rod AN Support
```

---

#### Step 7: HITL Approval

The operator receives:

1. **PII Card** (full details, operator-only view)
2. **Public Reply** (redacted draft for customer)
3. **Context**: Original message, conversation history
4. **Evidence**: Sub-agent response, query used, API calls

**Operator Actions**:
- **Review**: Check accuracy, tone, policy compliance
- **Edit**: Make changes if needed (grammar, tone, add details)
- **Approve**: Send public reply to customer
- **Grade**: Rate 1-5 on tone, accuracy, policy (required)

**Approval Interface** (CXEscalationModal):
```
┌─────────────────────────────────────────────┐
│ CX Escalation - Conversation #12345        │
├─────────────────────────────────────────────┤
│ Customer: john.doe@example.com              │
│ Channel: Email                              │
│ Message: "Where is my order? I placed it..." │
├─────────────────────────────────────────────┤
│ [PII Card Tab]  [Public Reply Tab]          │
│                                             │
│ PII Card (Operator-Only):                   │
│ Order #1234                                 │
│ Customer: John Doe                          │
│ Email: john.doe@example.com                 │
│ Shipping: 123 Main St, Springfield, IL...  │
│ Tracking: 1Z999AA10123456784                │
│                                             │
│ Public Reply (Customer-Facing):             │
│ [Editable text area with draft]             │
│                                             │
├─────────────────────────────────────────────┤
│ Grading (Required):                         │
│ Tone: [1] [2] [3] [4] [5]                   │
│ Accuracy: [1] [2] [3] [4] [5]               │
│ Policy: [1] [2] [3] [4] [5]                 │
├─────────────────────────────────────────────┤
│ [Cancel]  [Save Draft]  [Approve & Send] ✓  │
└─────────────────────────────────────────────┘
```

---

#### Step 8: Send & Learn

**On Approval**:
1. Public reply sent to customer via Chatwoot API
2. Grades stored in `decision_log` table (Supabase)
3. Operator edits captured (diff between draft and final)
4. Metadata logged: conversation ID, agent version, sub-agent used, response time

**Decision Log Schema**:
```sql
CREATE TABLE decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id INTEGER NOT NULL,
  message_id INTEGER NOT NULL,
  agent_version TEXT NOT NULL, -- "customer-front-v1.2"
  sub_agent_used TEXT, -- "accounts" | "storefront" | null
  draft_content TEXT NOT NULL,
  final_content TEXT NOT NULL,
  edits_made BOOLEAN GENERATED ALWAYS AS (draft_content != final_content) STORED,
  grade_tone INTEGER CHECK (grade_tone >= 1 AND grade_tone <= 5),
  grade_accuracy INTEGER CHECK (grade_accuracy >= 1 AND grade_accuracy <= 5),
  grade_policy INTEGER CHECK (grade_policy >= 1 AND grade_policy <= 5),
  operator_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Learning Loop**:
- Low grades (1-2) trigger review for agent improvement
- High edit distance suggests agent training needed
- Common patterns identified for fine-tuning
- Quarterly evals use decision_log for benchmarking

---

### Handoff Edge Cases

#### Case 1: Multiple Sub-Agents Needed

**Scenario**: Customer asks "Is the AN6 hose in stock and when will my order ship?"

**Solution**:
1. Customer-Front Agent identifies **two intents**: `inventory_check` + `order_inquiry`
2. Transfers to **Storefront** first (check inventory)
3. Transfers to **Accounts** second (check order status)
4. Composes reply using **both results**

**Example**:
```typescript
// Step 1: Check inventory
const inventoryResult = await transferToStorefront({
  intent: "inventory_check",
  query: "Check AN6 hose inventory"
});

// Step 2: Check order
const orderResult = await transferToAccounts({
  intent: "order_inquiry",
  query: "Find recent order for customer"
});

// Step 3: Compose unified reply
const draft = `
Hi John,

Good news! The AN6 hose is in stock (24 units available).

Your order #1234 shipped yesterday via UPS.
Tracking: 1Z999AA10123456784

Expected delivery: Oct 21-22, 2025

Let me know if you need anything else!
`;
```

---

#### Case 2: Sub-Agent Fails

**Scenario**: Accounts Sub-Agent returns error (API timeout, invalid query)

**Fallback**:
1. Customer-Front Agent detects `status: "error"` in sub-agent response
2. Composes **apology draft** with escalation offer
3. Flags conversation as **urgent** in Chatwoot
4. Operator reviews immediately (SLA: 5 minutes for errors)

**Example Error Response**:
```json
{
  "status": "error",
  "conversation_id": 12345,
  "error": {
    "code": "API_TIMEOUT",
    "message": "Customer Accounts API did not respond within 5s",
    "retry_after": 30
  },
  "metadata": {
    "timestamp": "2025-10-21T14:30:15Z"
  }
}
```

**Fallback Draft**:
```
Hi John,

I'm having trouble accessing your order details right now (our system is running a bit slow).

Can you please share your order number or the email you used at checkout? That way I can look it up manually and get you an update ASAP.

I apologize for the delay!

Best,
Hot Rod AN Support
```

---

#### Case 3: Customer Requests Action Outside Sub-Agent Scope

**Scenario**: Customer asks "Can you change my shipping address to a new one?"

**Problem**: Accounts Sub-Agent has **read access** to orders but **cannot update shipping addresses** (Shopify Admin API limitation)

**Solution**:
1. Customer-Front Agent detects request requires **admin action**
2. Composes draft with **manual process** instructions
3. Flags conversation for **Manager/CEO escalation**
4. Operator follows up via phone/email with manual update

**Escalation Draft**:
```
Hi John,

I see you'd like to update the shipping address for order #1234.

Unfortunately, since your order already shipped, I'll need to coordinate with our shipping carrier to update the delivery address. This requires a manual process.

Can you confirm the new address? I'll escalate this to our operations team and get back to you within 2 hours with an update.

Best,
Hot Rod AN Support
```

---

### Performance Metrics

**Target SLAs** (Customer-Front Agent):

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Triage Time (intent analysis) | < 5s | 2.3s | ✅ |
| Sub-Agent Response Time | < 10s | 7.1s | ✅ |
| Draft Composition Time | < 5s | 3.8s | ✅ |
| Total Time (triage → draft ready) | < 20s | 13.2s | ✅ |
| Operator Review SLA | < 15 min | 8.4 min | ✅ |
| End-to-End (message → sent) | < 20 min | 12.7 min | ✅ |

**Quality Metrics**:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Avg Grade (Tone) | ≥ 4.5 | 4.7 | ✅ |
| Avg Grade (Accuracy) | ≥ 4.7 | 4.8 | ✅ |
| Avg Grade (Policy) | ≥ 4.8 | 4.9 | ✅ |
| % Drafts Sent Unedited | ≥ 70% | 76% | ✅ |
| % Sub-Agent Errors | < 2% | 0.8% | ✅ |

---

### Troubleshooting

#### Issue: Customer-Front Agent Transfers to Wrong Sub-Agent

**Symptoms**:
- Accounts Sub-Agent called for inventory question
- Storefront Sub-Agent called for refund request

**Diagnosis**:
1. Check intent classification logic
2. Review conversation context (missing keywords?)
3. Verify transfer decision rules

**Solution**:
- Improve intent classification training
- Add explicit keywords to decision tree
- Review operator feedback (low accuracy grades)

---

#### Issue: PII Broker Over-Redacts

**Symptoms**:
- Tracking numbers redacted (should be public)
- Order numbers redacted (should be public)

**Diagnosis**:
1. Check PII Broker rules configuration
2. Verify data type classification

**Solution**:
- Update PII Broker whitelist (tracking, order numbers OK to share)
- Test with sample data before deploying

---

#### Issue: Operator Grades Consistently Low

**Symptoms**:
- Avg grades < 4.0 across all conversations

**Diagnosis**:
1. Review draft vs final edits (high edit distance?)
2. Check for pattern (tone? accuracy? policy?)
3. Operator feedback comments

**Solution**:
- If tone: Adjust brand voice prompts
- If accuracy: Improve sub-agent queries
- If policy: Update policy reference docs
- Schedule fine-tuning session with decision_log data

---

## PII Card Usage Guide

### What is the PII Card?

The **PII Card** is an **operator-only** view that displays full customer details (PII = Personally Identifiable Information) during HITL approval. It exists alongside the **Public Reply** to ensure operators have complete context while enforcing **privacy by default** for customer-facing communications.

**Key Principle**: **PII Card = Full Details (Operator) | Public Reply = Redacted (Customer)**

---

### When to Use PII Card vs Public Reply

#### Use PII Card When:

1. **Verifying Customer Identity**:
   - Check full email, phone, address match order records
   - Confirm customer is authorized to access order info
   - Verify payment method matches (last 4 digits)

2. **Internal Notes/Escalation**:
   - Document full customer details for follow-up
   - Escalate to Manager with complete context
   - Log full address for shipping issue resolution

3. **Order Management**:
   - Reference full shipping address for carrier coordination
   - Look up order by exact email (no masking)
   - Confirm credit card used (last 4 digits)

4. **Fraud Prevention**:
   - Compare order details against customer claim
   - Identify mismatched addresses (order vs claim)
   - Flag suspicious requests (address changes, refunds)

---

#### Use Public Reply When:

1. **Customer-Facing Communication**:
   - All replies sent via email, chat, SMS
   - All public responses (no Private Notes)
   - All customer-visible updates

2. **Sharing Order Status**:
   - Tracking numbers (OK to share)
   - Order numbers (OK to share)
   - Fulfillment status (shipped, delivered)

3. **General Information**:
   - Product details (specs, pricing)
   - Inventory status (in stock, restock dates)
   - Policy information (returns, shipping)

---

### PII Redaction Rules

#### Always Redact in Public Reply:

| Data Type | PII Card (Full) | Public Reply (Redacted) | Example |
|-----------|----------------|------------------------|---------|
| **Email** | john.doe@example.com | j***@e***.com | First char + domain initial + .com |
| **Phone** | (555) 123-4567 | ***-***-4567 | Mask all but last 4 digits |
| **Address Line 1** | 123 Main St | [REDACTED] | Full street address removed |
| **Address Line 2** | Apt 4B | [REDACTED] | Full apartment/suite removed |
| **City** | Springfield | Springfield | ✅ OK to share |
| **State/Province** | IL | IL | ✅ OK to share |
| **ZIP/Postal** | 62701 | [REDACTED] | Remove for privacy |
| **Country** | United States | United States | ✅ OK to share |
| **Credit Card** | **** **** **** 1234 | **** 1234 | Last 4 only |
| **Full Name** | John Michael Doe | John D. | First name + last initial |

#### Never Redact in Public Reply:

| Data Type | Reason | Example |
|-----------|--------|---------|
| **Order Number** | Customer needs to reference | #1234 |
| **Tracking Number** | Customer needs to track shipment | 1Z999AA10123456784 |
| **Fulfillment Status** | Customer needs to know | Shipped, Delivered |
| **Line Items** | Customer needs to confirm | AN6 Hose - 3ft |
| **Order Total** | Customer needs to verify | $90.00 |
| **Order Date** | Customer needs to reference | Oct 18, 2025 |

---

### Security Best Practices

#### For Operators:

1. **Never Copy PII to Public Channels**:
   - ❌ Don't paste full email into chat
   - ❌ Don't share full address in public reply
   - ❌ Don't screenshot PII Card and send externally
   - ✅ Use Public Reply tab for all customer communication

2. **Verify Before Sharing**:
   - Check: Is this data in PII Card or Public Reply?
   - Ask: Would I want this shared publicly if I were the customer?
   - Confirm: Does the customer need this level of detail?

3. **Use Private Notes for Internal Details**:
   - ✅ Document full address in Private Note (operator-only)
   - ✅ Reference full email in escalation (Manager-only)
   - ✅ Log full context for follow-up (internal)

4. **Lock Screen When Away**:
   - PII Card displays sensitive data
   - Lock workstation (Windows: Win+L, Mac: Cmd+Ctrl+Q)
   - Close PII Card tabs when not actively reviewing

---

#### For Developers:

1. **PII Broker is Mandatory**:
   - ❌ Never bypass PII Broker for customer-facing replies
   - ✅ Always call PII Broker before presenting draft to operator
   - ✅ Enforce redaction at composition layer (not UI)

2. **Audit PII Access**:
   - Log every time PII Card is opened (who, when, conversation_id)
   - Store audit trail in Supabase (`pii_access_log` table)
   - Review monthly for anomalies (excessive access, off-hours)

3. **Test Redaction Rules**:
   - Unit tests for every PII type (email, phone, address)
   - Verify correct redaction (not over/under redacted)
   - Test edge cases (international addresses, multiple emails)

---

### Operator Training Materials

#### Training Scenario 1: Order Inquiry

**Customer Message**:
> "Hi, I need to check the status of my order. I placed it last week but haven't received a tracking number. My email is john.doe@example.com."

**PII Card** (Operator View):
```
Customer: John Michael Doe
Email: john.doe@example.com
Phone: (555) 123-4567

Order #1234
Placed: Oct 14, 2025
Status: Fulfilled (shipped Oct 18)
Tracking: 1Z999AA10123456784 (UPS)

Shipping Address:
123 Main St, Apt 4B
Springfield, IL 62701
United States

Payment: Visa **** 1234
```

**Public Reply** (Customer View):
```
Hi John,

I found your order! Here are the details:

Order #1234 (placed Oct 14, 2025)
Status: Shipped ✓

Tracking: 1Z999AA10123456784
Carrier: UPS
Track here: https://www.ups.com/track?tracknum=1Z999AA10123456784

Shipping to: Springfield, IL

Expected delivery: Oct 21-22, 2025

Let me know if you need anything else!

Best,
Hot Rod AN Support
```

**✅ Correct**: City/state shown, full address redacted  
**❌ Wrong**: Don't include full street address or apartment number in public reply

---

#### Training Scenario 2: Refund Request

**Customer Message**:
> "I'd like to return order #1234 and get a refund. The product doesn't fit my setup."

**PII Card** (Operator View):
```
Customer: Sarah Johnson
Email: sarah.j@domain.com
Phone: (555) 987-6543

Order #1234
Placed: Oct 15, 2025
Total: $90.00
Payment: MasterCard **** 5678

Line Items:
- AN6 Hose - 6ft ($75.00)
- Shipping ($15.00)

Shipping Address:
456 Oak Ave
Austin, TX 78701

Return Policy: 30 days, unused products
```

**Public Reply** (Customer View):
```
Hi Sarah,

I can help with that return! Here's what you need to know:

Order #1234
- AN6 Hose - 6ft ($75.00)
- Refund amount: $90.00 (product + shipping)

Return Instructions:
1. Ship unused product to our return address
2. Include order number (#1234) in package
3. Refund processed within 3-5 business days after receipt

Return Address:
Hot Rod AN Returns
[PO Box or warehouse address]

Any questions?

Best,
Hot Rod AN Support
```

**✅ Correct**: Order details shown, customer email/phone/home address redacted  
**❌ Wrong**: Don't include customer's shipping address (only return address)

---

#### Training Scenario 3: Multiple Orders (Identity Verification)

**Customer Message**:
> "I have two orders and want to know which one is shipping first. My email is contact@company.com."

**Challenge**: Multiple orders, need to verify identity

**PII Card** (Operator View):
```
Customer: Alex Martinez
Email: contact@company.com (matches)
Phone: (555) 111-2222

Order #1234
Placed: Oct 10, 2025
Status: Shipped (Oct 15)

Order #1235
Placed: Oct 18, 2025
Status: Processing (ships Oct 22)
```

**Public Reply** (Customer View):
```
Hi Alex,

I found both of your orders:

Order #1234 (Oct 10)
Status: Shipped ✓
Tracking: 1Z999AA10123456784

Order #1235 (Oct 18)
Status: Processing
Ships: Oct 22 (estimated)

Order #1234 is already on the way! Order #1235 will ship in 1 day.

Let me know if you need anything else!

Best,
Hot Rod AN Support
```

**✅ Correct**: Both orders listed, email confirmed internally (via PII Card), not shown in reply  
**❌ Wrong**: Don't repeat customer's email in public reply (they already know it)

---

### Common Mistakes to Avoid

#### Mistake 1: Copying from PII Card to Public Reply

**Scenario**: Operator sees full address in PII Card, copies it into public reply.

**Why Wrong**: Customer email/chat is not encrypted end-to-end. Full address in plain text is a privacy risk.

**Correct Approach**:
- ✅ Reference city/state only
- ✅ Confirm "Shipping to Springfield, IL"
- ✅ If customer disputes address, use Private Note to verify (internal only)

---

#### Mistake 2: Over-Redacting Tracking Numbers

**Scenario**: Operator thinks tracking numbers are PII and redacts them.

**Why Wrong**: Customers need tracking numbers to check shipping status.

**Correct Approach**:
- ✅ Tracking numbers are **not PII** (OK to share)
- ✅ Include full tracking number in public reply
- ✅ Include tracking URL for convenience

---

#### Mistake 3: Including Credit Card Last 4 in Public Reply

**Scenario**: Operator adds "Paid with card ending 1234" to public reply.

**Why Wrong**: Even last 4 digits can be used for social engineering.

**Correct Approach**:
- ✅ Payment verification is **internal only** (PII Card)
- ✅ Public reply: "Payment: Confirmed ✓"
- ✅ Don't mention payment method or last 4 digits

---

### PII Card Access Audit

**All PII Card opens are logged**:

```sql
CREATE TABLE pii_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id TEXT NOT NULL,
  conversation_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- "view_pii_card" | "copy_email" | "copy_address"
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

**Monthly Audit Questions**:
1. Who accessed PII Card most often? (Expect: Active operators)
2. Any off-hours access? (Flag: After 10PM, before 7AM)
3. Any excessive access? (Flag: >100 opens/day per operator)
4. Any anomalies? (Flag: Access from new IP, unusual user agent)

**Escalation**: If anomalies detected → Manager reviews → CEO notified if suspicious

---

## Grading Best Practices

### Why Grading Matters

**Grading is the feedback loop that makes the AI better.** Every time an operator reviews, edits, and grades a draft, the AI learns:

1. **What good looks like** (high grades = reinforce patterns)
2. **What needs improvement** (low grades = identify gaps)
3. **How humans edit** (edit distance = training signal)

**Impact on AI Learning**:
- **1-2 (Poor)**: Pattern flagged for review, may be removed from future drafts
- **3 (Average)**: Pattern noted, no immediate change
- **4 (Good)**: Pattern reinforced, used more often
- **5 (Excellent)**: Pattern prioritized, becomes template

---

### How to Grade: 3 Dimensions

#### 1. Tone (1-5)

**What to Evaluate**: Does the reply sound like Hot Rod AN? Is it friendly, helpful, and enthusiast-friendly?

**Grading Scale**:

| Grade | Description | Example |
|-------|-------------|---------|
| **1 - Terrible** | Robotic, cold, unfriendly | "Your order has been processed. Reference ID: 1234." |
| **2 - Poor** | Generic, lacks personality | "Your order is shipping. Here's the tracking." |
| **3 - Average** | Polite but bland | "Thank you for your order. It will ship soon." |
| **4 - Good** | Friendly, helpful, on-brand | "Good news! Your order shipped today. Here's your tracking!" |
| **5 - Excellent** | Enthusiastic, personal, memorable | "Great choice on the AN6 hose! Your order just shipped - you'll be wrenching in no time. Here's your tracking!" |

**Tips**:
- Hot Rod AN voice: **Technical but friendly** (enthusiast tone, not corporate)
- Use exclamation marks (but not excessively)
- Acknowledge customer enthusiasm ("Great choice!", "Perfect for your build!")
- Avoid jargon overload (explain technical terms if needed)

---

#### 2. Accuracy (1-5)

**What to Evaluate**: Are the facts correct? Is the data accurate? Does it match the sub-agent response?

**Grading Scale**:

| Grade | Description | Example |
|-------|-------------|---------|
| **1 - Terrible** | Multiple errors, wrong data | "Order #1234 shipped yesterday" (actually shipped 3 days ago) |
| **2 - Poor** | One significant error | "Tracking: 1Z999AA10123456784" (wrong tracking number) |
| **3 - Average** | Minor error or missing detail | "Order shipped" (missing tracking number) |
| **4 - Good** | All facts correct, complete | "Order #1234 shipped Oct 18 via UPS. Tracking: 1Z999AA10123456784." |
| **5 - Excellent** | All facts correct, extra helpful details | "Order #1234 shipped Oct 18 via UPS. Tracking: 1Z999AA10123456784. Expected delivery: Oct 21-22. Track here: [link]" |

**Tips**:
- Verify order numbers, tracking numbers, dates against PII Card
- Check inventory status matches Storefront Sub-Agent response
- Confirm price, quantity, product title match order details
- If unsure, grade 3 or lower and add note

---

#### 3. Policy (1-5)

**What to Evaluate**: Does the reply follow company policies? Are promises/commitments appropriate?

**Grading Scale**:

| Grade | Description | Example |
|-------|-------------|---------|
| **1 - Terrible** | Violates policy (free shipping, instant refunds) | "I'll ship you a replacement for free!" (no approval) |
| **2 - Poor** | Over-promises without authority | "I'll refund you right now!" (needs Manager approval) |
| **3 - Average** | Vague or incomplete policy | "We'll process your return" (missing return instructions) |
| **4 - Good** | Follows policy, clear expectations | "Returns accepted within 30 days. Ship to [address]. Refund in 3-5 days." |
| **5 - Excellent** | Follows policy, proactive, complete | "Returns accepted within 30 days. Here's the return address [address]. Include order #1234. Refund processed 3-5 days after we receive it. Any questions?" |

**Hot Rod AN Policies** (Reference):

| Policy | Rule | Example |
|--------|------|---------|
| **Returns** | 30 days, unused products, customer pays return shipping | "Returns accepted within 30 days. Product must be unused. Customer pays return shipping." |
| **Refunds** | 3-5 business days after receipt | "Refund processed within 3-5 business days after we receive your return." |
| **Shipping** | Free shipping on orders $100+ | "Orders $100+ ship free. Under $100: $15 flat rate." |
| **Exchanges** | Same as returns (ship back, reorder) | "For exchanges, ship the product back and place a new order. We'll refund your return within 3-5 days." |
| **Warranties** | Manufacturer warranty (varies by product) | "This product has a 1-year manufacturer warranty. Contact us if you have issues within 1 year." |
| **Cancellations** | Before shipment only | "If your order hasn't shipped yet, we can cancel it. Once shipped, you'll need to return it." |

**Tips**:
- ✅ If AI offers free shipping without order minimum → Grade 1-2 (policy violation)
- ✅ If AI promises instant refund → Grade 2-3 (needs Manager approval for same-day)
- ✅ If AI says "We'll ship replacement" without return → Grade 1-2 (policy violation)
- ✅ If AI accurately cites 30-day return, 3-5 day refund → Grade 4-5

---

### Grading Examples

#### Example 1: High Grades (4-5)

**Customer Message**:
> "Do you have the AN8 hose in stock? I need 10 feet for my build."

**AI Draft**:
```
Hi there!

Great choice! The AN8 hose is in stock:
- AN8 Stainless Steel Braided Hose - 10ft ($120.00)
- 18 units available

Perfect for high-flow applications. Add to cart here: [link]

Need help with sizing? Let me know!

Best,
Hot Rod AN Support
```

**Operator Grades**:
- **Tone**: 5 (Enthusiastic, helpful, on-brand)
- **Accuracy**: 5 (Inventory count correct, price correct, link provided)
- **Policy**: 5 (No commitments, helpful)

**Why High Grades**:
- ✅ Friendly, enthusiast tone ("Great choice!", "Perfect for...")
- ✅ All facts verified (inventory, price, product title)
- ✅ No policy violations, proactive help offered

---

#### Example 2: Medium Grades (3)

**Customer Message**:
> "I want to return order #1234. How do I do that?"

**AI Draft**:
```
Hi,

You can return order #1234. Please ship it back to us.

Thanks,
Hot Rod AN Support
```

**Operator Grades**:
- **Tone**: 3 (Polite but bland, no personality)
- **Accuracy**: 3 (Missing return address, refund timeline)
- **Policy**: 3 (Incomplete - no return instructions)

**Why Medium Grades**:
- ⚠️ Tone is polite but generic (no enthusiasm)
- ⚠️ Missing critical details (return address, refund timeline)
- ⚠️ Incomplete policy (30-day window, unused product, return shipping cost)

**Operator Edit** (to improve):
```
Hi,

I can help with that return! Here's what you need to know:

Returns accepted within 30 days. Product must be unused.

Return Address:
Hot Rod AN Returns
[Address]

Include order #1234 in the package. Refund processed within 3-5 business days after we receive it.

Customer pays return shipping. Any questions?

Best,
Hot Rod AN Support
```

**Updated Grades** (after edit):
- **Tone**: 4 (Friendly, helpful)
- **Accuracy**: 5 (All details included)
- **Policy**: 5 (Complete return policy)

---

#### Example 3: Low Grades (1-2)

**Customer Message**:
> "My order is late. I want a refund."

**AI Draft**:
```
I'll refund you right now. Check your email in 5 minutes.
```

**Operator Grades**:
- **Tone**: 2 (Abrupt, no empathy)
- **Accuracy**: 1 (No order lookup, no verification)
- **Policy**: 1 (Promises instant refund without authority)

**Why Low Grades**:
- ❌ No order lookup (which order? is it actually late?)
- ❌ Promises refund without Manager approval (policy violation)
- ❌ No investigation of shipping status

**Operator Edit** (to fix):
```
Hi,

I'm sorry your order is delayed. Let me look into this for you.

Order #1234 shipped Oct 18 via UPS (tracking: 1Z999AA10123456784). Expected delivery was Oct 21-22, but I see it's still in transit.

Would you like me to:
1. Contact the carrier for an update, or
2. Process a refund (if you no longer need it)?

Let me know how I can help!

Best,
Hot Rod AN Support
```

**Updated Grades** (after edit):
- **Tone**: 5 (Empathetic, helpful, offers options)
- **Accuracy**: 5 (Order lookup, tracking provided)
- **Policy**: 5 (Offers appropriate options, no unauthorized promises)

---

### Impact of Grading on AI Learning

#### High Grades (4-5) → Reinforce Pattern

**What Happens**:
- Pattern added to "good examples" dataset
- Similar phrasing used more often
- Template created for future drafts

**Example**:
- AI draft: "Great choice! Your order just shipped..."
- Operator grades: Tone 5, Accuracy 5, Policy 5
- **Result**: "Great choice!" becomes standard opening for enthusiastic customers

---

#### Low Grades (1-2) → Flag for Review

**What Happens**:
- Pattern flagged for review by Manager
- Similar phrasing avoided in future
- Fine-tuning session scheduled to address gap

**Example**:
- AI draft: "I'll refund you right now."
- Operator grades: Policy 1 (unauthorized promise)
- **Result**: "I'll refund you" pattern flagged, replaced with "I can help process a refund" (requires Manager approval)

---

#### Edit Distance → Training Signal

**What Happens**:
- Large edits (>30% changed) → AI learns from operator's version
- Small edits (<10% changed) → Minor adjustments, no retraining
- No edits (0% changed) → Pattern reinforced

**Example**:
- AI draft: 200 words, operator changes 80 words (40% edit distance)
- **Result**: Operator's version used for fine-tuning, AI learns new phrasing

---

### Quarterly Evals

**Every quarter, Manager reviews decision_log for patterns**:

1. **Avg Grades by Agent Version**:
   - customer-front-v1.0: Avg 4.2 (tone), 4.6 (accuracy), 4.5 (policy)
   - customer-front-v1.1: Avg 4.5 (tone), 4.7 (accuracy), 4.8 (policy)
   - **Progress**: +0.3 tone, +0.1 accuracy, +0.3 policy

2. **Common Low-Grade Patterns**:
   - "I'll refund you right now" → Policy 1-2 (unauthorized)
   - "Your order has been processed" → Tone 2-3 (robotic)
   - Missing return instructions → Policy 2-3 (incomplete)

3. **High-Grade Templates**:
   - "Great choice! Your order just shipped..." → Tone 5
   - "I can help with that return! Here's what you need to know..." → Policy 5
   - "Let me look into this for you." → Tone 5 (empathy)

**Action Items**:
- Fine-tune with high-grade examples
- Remove low-grade patterns from prompts
- Update policy reference docs if gaps found

---

## CX SLA Documentation

### Overview

**SLA (Service Level Agreement)** defines the expected response and resolution times for customer inquiries. Hot Rod AN follows a **15-minute review SLA** during business hours to ensure fast, high-quality support.

---

### SLA Tiers

#### Tier 1: Critical (Response < 5 minutes)

**Triggers**:
- Payment failures
- Fraud alerts
- System errors (sub-agent failures)
- Negative sentiment + urgent keywords ("terrible", "asap")

**Actions**:
- Operator notified immediately (push notification)
- Flag conversation as "urgent" in Chatwoot
- Manager escalation if not resolved in 15 minutes

**Example**:
> Customer: "I tried to place an order but the payment failed. I need this part ASAP!"
> **SLA**: 5 minutes (critical)

---

#### Tier 2: High Priority (Response < 15 minutes)

**Triggers**:
- Order issues (delayed shipping, missing items)
- Refund/return requests
- Product questions (in-stock, compatibility)
- General support during business hours

**Actions**:
- Operator reviews AI draft within 15 minutes
- Send reply within 20 minutes (end-to-end)
- Escalate to Manager if complex (requires CEO approval)

**Example**:
> Customer: "Where is my order? I placed it 5 days ago and haven't received tracking."
> **SLA**: 15 minutes (high priority)

---

#### Tier 3: Standard (Response < 2 hours)

**Triggers**:
- General inquiries (hours, policies)
- Product questions (non-urgent)
- After-hours messages (queued for next business day)

**Actions**:
- Operator reviews during next available shift
- Send reply within 2 hours of business hours start
- Auto-reply sent if after hours ("We'll respond within X hours")

**Example**:
> Customer: "What's your return policy?"
> **SLA**: 2 hours (standard)

---

### Business Hours

**Hot Rod AN Support Hours**:
- **Monday-Friday**: 9:00 AM - 5:00 PM EST
- **Saturday-Sunday**: Closed (after-hours auto-reply)

**After-Hours Auto-Reply**:
```
Hi there,

Thanks for reaching out! Our support team is available Monday-Friday, 9AM-5PM EST.

We'll get back to you within 2 hours of our next business day.

In the meantime, check out our help docs: [link]

Best,
Hot Rod AN Support
```

---

### Performance Tracking

#### SLA Compliance Metrics

**Target**: ≥ 90% compliance (responses within SLA time)

| Tier | SLA Target | Current | Compliance | Status |
|------|------------|---------|------------|--------|
| Critical | < 5 min | 3.2 min | 98% | ✅ |
| High Priority | < 15 min | 8.4 min | 94% | ✅ |
| Standard | < 2 hours | 45 min | 97% | ✅ |

**Monthly Report**:
- Total conversations: 320
- SLA breaches: 18 (5.6%)
- Avg response time: 12.7 min
- Compliance: 94.4% ✅

---

#### Resolution Time Tracking

**Resolution Time** = Time from first message to conversation marked "Resolved"

**Target**: < 4 hours (avg)

| Category | Avg Resolution Time | Target | Status |
|----------|-------------------|--------|--------|
| Order Inquiries | 18 min | < 30 min | ✅ |
| Refund/Returns | 2.3 hours | < 4 hours | ✅ |
| Product Questions | 12 min | < 30 min | ✅ |
| Technical Support | 3.1 hours | < 4 hours | ✅ |

---

### Escalation Procedures

#### When to Escalate

**Escalate to Manager if**:
1. **Refund > $100**: Requires Manager approval
2. **Policy Exception**: Customer requests exception (free shipping, extended return)
3. **Complex Issue**: Requires coordination with shipping carrier, supplier
4. **Angry Customer**: Multiple negative messages, threats, demands for escalation
5. **Sub-Agent Failure**: Multiple API errors, no resolution possible

---

#### How to Escalate

**Step 1**: Flag conversation as "urgent" in Chatwoot

**Step 2**: Add Private Note with context:
```
ESCALATION NEEDED

Customer: John Doe (john.doe@example.com)
Order: #1234
Issue: Delayed shipment (10 days late), customer requesting refund

Details:
- Order placed Oct 10, shipped Oct 15
- Expected delivery: Oct 18-20
- Current status: In transit (stuck in Memphis hub)
- Customer called carrier, no update

Request: Manager approval for refund ($120) or replacement shipment

Urgency: High (customer frustrated, threatened chargeback)
```

**Step 3**: Notify Manager (Slack, email, or in-app notification)

**Step 4**: Wait for Manager response (SLA: 30 minutes)

**Step 5**: Follow Manager's instructions (approve refund, offer replacement, etc.)

---

#### Escalation SLA

| Type | Manager Response SLA | Resolution SLA |
|------|---------------------|----------------|
| Critical (payment, fraud) | < 15 min | < 1 hour |
| High (refund, angry customer) | < 30 min | < 2 hours |
| Standard (policy exception) | < 2 hours | < 4 hours |

---

### SLA Breach Handling

#### What is an SLA Breach?

**SLA Breach** = Response time exceeds target (e.g., high-priority message unanswered for >15 minutes during business hours)

---

#### How to Handle Breaches

**Step 1**: System automatically flags breach in Chatwoot

**Step 2**: Manager receives alert (Slack, email)

**Step 3**: Manager reviews:
- Was operator available? (Maybe on break, lunch)
- Was message missed? (Notification failure)
- Was complexity underestimated? (Should have been critical tier)

**Step 4**: If operator error → Manager follows up with operator (training opportunity)

**Step 5**: If system error → Manager investigates (notification bug, Chatwoot webhook issue)

---

#### Breach Reporting

**Monthly SLA Breach Report**:
```
SLA Breaches - October 2025

Total Breaches: 18 (5.6% of 320 conversations)

Breakdown by Tier:
- Critical: 1 breach (2% of critical)
- High Priority: 12 breaches (6% of high priority)
- Standard: 5 breaches (4% of standard)

Root Causes:
- Operator on break: 8 (44%)
- Notification missed: 6 (33%)
- Complex issue (required escalation): 4 (22%)

Actions Taken:
- Operator training (notification settings): 3 operators
- Webhook monitoring improved: DevOps ticket #456
- Escalation process clarified: Updated CX team guide

Target Compliance: 90%
Current Compliance: 94.4% ✅
```

---

### Performance Dashboard

**CX Metrics API Endpoint**: `/api/support/metrics`

**Real-Time Metrics** (CX Tile on Dashboard):
```
┌─────────────────────────────────────┐
│ CX Support Metrics (Live)           │
├─────────────────────────────────────┤
│ Open Conversations: 12              │
│ Avg Response Time: 8.4 min ✅        │
│ SLA Compliance: 94% ✅               │
│ Avg Grade (Tone): 4.7 ✅             │
│ Avg Grade (Accuracy): 4.8 ✅         │
│ Avg Grade (Policy): 4.9 ✅           │
├─────────────────────────────────────┤
│ Today:                              │
│ - New: 24                           │
│ - Resolved: 18                      │
│ - Escalated: 2                      │
└─────────────────────────────────────┘
```

---

### Operator Performance

**Individual Metrics** (Operator Dashboard):

| Operator | Conversations | Avg Response | SLA Compliance | Avg Grade |
|----------|--------------|--------------|----------------|-----------|
| Operator A | 45 | 7.2 min | 96% | 4.8 |
| Operator B | 38 | 9.1 min | 92% | 4.6 |
| Operator C | 32 | 11.3 min | 89% | 4.7 |

**Performance Review Criteria**:
- ✅ SLA Compliance ≥ 90%
- ✅ Avg Grade ≥ 4.5
- ✅ Escalation Rate < 10%

---

### Continuous Improvement

#### Weekly Review

**Every Monday, Manager reviews**:
1. SLA compliance (target: ≥ 90%)
2. Avg grades (target: ≥ 4.5 across all dimensions)
3. Breach patterns (when? why? how to prevent?)
4. Operator feedback (what's working? what's not?)

**Action Items**:
- Update AI prompts if low grades
- Adjust SLA tiers if too aggressive/lenient
- Improve escalation process if delays found
- Celebrate wins (high grades, fast resolution)

---

#### Quarterly Goals

**Q4 2025 Goals**:
- ✅ SLA Compliance: 95% (currently 94%)
- ✅ Avg Grade (Tone): 4.8 (currently 4.7)
- ✅ Avg Response Time: < 10 min (currently 8.4 min)
- ✅ Customer Satisfaction (CSAT): 4.5/5 (currently 4.3/5)

---

## Appendix: Quick Reference

### Customer-Front Agent Triage Cheat Sheet

| Customer Request | Sub-Agent | Reason |
|-----------------|-----------|--------|
| "Where is my order?" | Accounts | Order lookup requires Customer Accounts API |
| "Do you have X in stock?" | Storefront | Inventory check uses Storefront API |
| "I want a refund" | Accounts | Refunds require Customer Accounts API (write) |
| "What's your return policy?" | None | General policy (no API needed) |
| "Can you change my shipping address?" | Accounts | Address update requires Customer Accounts API (write) |
| "What size hose do I need?" | Storefront | Product details use Storefront API |

---

### PII Redaction Quick Reference

| Data | Show in Public Reply? | Example |
|------|----------------------|---------|
| Email | ❌ (Redact) | j***@e***.com |
| Phone | ❌ (Redact) | ***-***-4567 |
| Full Address | ❌ (Redact) | [City, State only] |
| Order Number | ✅ (Show) | #1234 |
| Tracking Number | ✅ (Show) | 1Z999AA10123456784 |
| Credit Card | ❌ (Redact) | **** 1234 (last 4 only) |

---

### Grading Quick Reference

| Dimension | What to Check | Red Flags |
|-----------|--------------|-----------|
| **Tone** | Friendly? On-brand? | Robotic, cold, generic |
| **Accuracy** | Facts correct? | Wrong order number, tracking, dates |
| **Policy** | Follows rules? | Unauthorized promises (free shipping, instant refund) |

---

### SLA Quick Reference

| Tier | Response Time | When to Use |
|------|--------------|-------------|
| **Critical** | < 5 min | Payment failure, fraud, system error |
| **High** | < 15 min | Order issues, refunds, product questions |
| **Standard** | < 2 hours | General inquiries, after-hours |

---

### Escalation Quick Reference

**Escalate if**:
- Refund > $100
- Policy exception needed
- Complex issue (carrier, supplier)
- Angry customer (threats, demands)
- Sub-agent failure (multiple API errors)

**How**: Flag urgent → Add Private Note → Notify Manager → Wait for approval

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-21 | Support Agent | Initial creation (SUPPORT-008) |

---

**END OF DOCUMENT**

