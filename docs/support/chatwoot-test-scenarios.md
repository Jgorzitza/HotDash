# Chatwoot Test Scenarios for AI-Customer Agent Training

**Created**: 2025-10-20  
**Owner**: Support Agent  
**Purpose**: Training data for AI-Customer agent (multi-channel: email, SMS, live chat)  
**Total Scenarios**: 20  
**Format**: Real conversation scripts with varied tones and edge cases

---

## Category 1: Order Status (5 scenarios)

### Scenario 1.1: Where is my order? (Simple inquiry - Friendly tone)

**Channel**: Email  
**Customer Tone**: Friendly, patient  
**Customer Name**: Sarah Chen  
**Order ID**: #HRA-1001

**Customer Message**:
```
Subject: Quick question about my order

Hi there!

I placed an order last week (Order #HRA-1001) and was wondering if you could let me know when it might arrive? I'm excited to try the new motor oil!

Thanks so much,
Sarah
```

**Context**:
- Order placed 5 days ago
- Standard shipping (7-10 business days)
- Order is in transit
- Tracking available

**Expected Response Type**: Informative, friendly
**Key Points to Address**:
- Confirm order number
- Provide current order status
- Share tracking link
- Set delivery expectation (2-5 days remaining)
- Thank customer for patience

**Tone Guidance**: Match customer's friendly tone, enthusiastic about product

**Grading Criteria**:
- Tone: 5/5 (warm, professional, maintains enthusiasm)
- Accuracy: 5/5 (correct order status, valid tracking link)
- Policy: 5/5 (follows standard shipping timelines)

---

### Scenario 1.2: My order is late (Escalation - Frustrated tone)

**Channel**: SMS  
**Customer Tone**: Frustrated, impatient  
**Customer Name**: Mike Rodriguez  
**Order ID**: #HRA-1002

**Customer Message**:
```
It's been 12 days since I ordered and still nothing. This is unacceptable. Where is my order??
```

**Context**:
- Order placed 12 days ago (outside 7-10 day window)
- Tracking shows "delayed" due to carrier issue
- Order still in transit, not lost
- Customer paid for standard shipping

**Expected Response Type**: Apologetic, solution-focused
**Key Points to Address**:
- Acknowledge frustration and apologize
- Explain delay (carrier issue, not Hot Rod AN fault)
- Provide updated tracking info
- Offer options: wait 2 more days or expedite replacement
- Provide discount code for inconvenience

**Tone Guidance**: Professional, empathetic, take ownership

**Grading Criteria**:
- Tone: 4/5 (empathetic but not over-apologetic)
- Accuracy: 5/5 (real tracking data, realistic timeline)
- Policy: 5/5 (follows escalation protocol, offers compensation)

---

### Scenario 1.3: Wrong item received (Refund/replacement - Neutral tone)

**Channel**: Live Chat  
**Customer Tone**: Neutral, matter-of-fact  
**Customer Name**: Jennifer Park  
**Order ID**: #HRA-1003

**Customer Message**:
```
Hi, I received my order today but it's the wrong item. I ordered the 5W-30 synthetic oil but got 10W-40 conventional. Can we fix this?
```

**Context**:
- Order confirmed: 5W-30 synthetic oil
- Received: 10W-40 conventional oil (warehouse error)
- Customer has photos of received item
- Item unopened, still sealed

**Expected Response Type**: Apologetic, solution-oriented
**Key Points to Address**:
- Apologize for warehouse error
- Confirm correct item customer ordered
- Offer immediate solutions:
  - Option A: Send correct item (no return needed, keep wrong item)
  - Option B: Full refund + keep wrong item
- Set timeline (correct item ships within 24 hours)
- Apply priority shipping (free upgrade)

**Tone Guidance**: Professional, solution-focused, efficient

**Grading Criteria**:
- Tone: 5/5 (professional, no excuses)
- Accuracy: 5/5 (correct order data, valid policy)
- Policy: 5/5 (follows "customer keeps wrong item" policy for errors <$50)

---

### Scenario 1.4: Cancel my order (Cancellation flow - Urgent tone)

**Channel**: Email  
**Customer Tone**: Urgent, rushed  
**Customer Name**: David Thompson  
**Order ID**: #HRA-1004

**Customer Message**:
```
Subject: URGENT - Need to cancel order

I need to cancel order #HRA-1004 immediately. I ordered the wrong product by mistake. Can you stop the shipment?

Thanks,
David
```

**Context**:
- Order placed 2 hours ago
- Order status: "Processing" (not shipped yet)
- Payment captured but not settled
- Window to cancel: Yes (within 4-hour window)

**Expected Response Type**: Quick, action-oriented
**Key Points to Address**:
- Confirm cancellation is possible (order not shipped)
- Cancel order immediately
- Confirm refund timeline (3-5 business days)
- Ask if customer wants to place correct order
- Provide link to correct product if they specify what they meant to order

**Tone Guidance**: Efficient, helpful, no friction

**Grading Criteria**:
- Tone: 5/5 (fast response, no barriers)
- Accuracy: 5/5 (correct cancellation window, refund timeline)
- Policy: 5/5 (follows 4-hour cancellation policy)

---

### Scenario 1.5: Change shipping address (Modification - Anxious tone)

**Channel**: Live Chat  
**Customer Tone**: Anxious, worried  
**Customer Name**: Lisa Wang  
**Order ID**: #HRA-1005

**Customer Message**:
```
Oh no, I just realized I entered the wrong shipping address! I'm moving this week and the old address won't work. Can you change it to my new address?? Please??
```

**Context**:
- Order placed 1 day ago
- Order status: "Processing" (not shipped)
- New address provided: Same city, different street
- Address change is possible

**Expected Response Type**: Reassuring, helpful
**Key Points to Address**:
- Reassure customer the change is possible
- Confirm new address for accuracy
- Update shipping address in system
- Confirm updated address in response
- Set expectation for shipping (no delay)

**Tone Guidance**: Calm, reassuring, detail-oriented

**Grading Criteria**:
- Tone: 5/5 (reduces anxiety, professional)
- Accuracy: 5/5 (confirms both addresses correctly)
- Policy: 5/5 (follows address change policy within processing window)

---

## Category 2: Product Questions (5 scenarios)

### Scenario 2.1: Is this in stock? (Availability - Friendly tone)

**Channel**: Live Chat  
**Customer Tone**: Friendly, curious  
**Customer Name**: Tom Harrison  
**Product**: Hot Rod AN Performance Motor Oil 5W-30

**Customer Message**:
```
Hi! Is the 5W-30 performance oil in stock? I need 6 quarts for my classic Mustang. Thanks!
```

**Context**:
- Product: In stock (24 units available)
- Customer needs: 6 quarts
- Sufficient inventory to fulfill

**Expected Response Type**: Informative, helpful
**Key Points to Address**:
- Confirm product is in stock
- Confirm 6 quarts available
- Mention shipping timeline (2-3 days processing + 5-7 days shipping)
- Provide link to product page
- Mention any relevant promotions (if applicable)

**Tone Guidance**: Enthusiastic about classic cars, helpful

**Grading Criteria**:
- Tone: 5/5 (matches enthusiasm, professional)
- Accuracy: 5/5 (correct stock status, shipping timeline)
- Policy: 5/5 (provides standard info)

---

### Scenario 2.2: Product comparison (Comparison - Analytical tone)

**Channel**: Email  
**Customer Tone**: Analytical, detail-oriented  
**Customer Name**: Rachel Foster  
**Products**: 5W-30 Synthetic vs 10W-40 Conventional

**Customer Message**:
```
Subject: Which oil should I choose?

Hi,

I'm trying to decide between your 5W-30 synthetic and 10W-40 conventional oils for my 2015 Honda Civic. What's the difference and which would you recommend for my car?

Temperature range here is 30-90°F year-round.

Thanks,
Rachel
```

**Context**:
- Vehicle: 2015 Honda Civic (manufacturer recommends 5W-30)
- Climate: Moderate (30-90°F)
- Customer preference: Not specified

**Expected Response Type**: Educational, recommendation
**Key Points to Address**:
- Explain difference between synthetic and conventional
- Note viscosity differences (5W-30 flows better in cold, 10W-40 thicker)
- Recommend 5W-30 synthetic (matches Honda spec, better for moderate temps)
- Link to Honda's oil specification recommendation
- Mention benefits of synthetic (longer life, better protection)

**Tone Guidance**: Educational, technical but accessible

**Grading Criteria**:
- Tone: 5/5 (matches analytical tone, not pushy)
- Accuracy: 5/5 (correct technical info, valid recommendation)
- Policy: 5/5 (recommends what's best for customer, not highest price)

---

### Scenario 2.3: Shipping to Canada (Shipping policy - Direct tone)

**Channel**: Email  
**Customer Tone**: Direct, to-the-point  
**Customer Name**: Mark Wilson  

**Customer Message**:
```
Subject: Ship to Canada?

Do you ship to Canada? I'm in Toronto.

Mark
```

**Context**:
- Current policy: US shipping only
- Canada shipping: Planned for Q1 2026
- Alternative: Suggest authorized Canadian retailers (if any)

**Expected Response Type**: Direct, informative
**Key Points to Address**:
- Current policy: US only
- Apologize for inconvenience
- Share timeline for Canada shipping (Q1 2026)
- Offer to notify when available (email list)
- Suggest authorized Canadian retailers if available

**Tone Guidance**: Direct, professional, brief

**Grading Criteria**:
- Tone: 5/5 (matches direct style, not overly wordy)
- Accuracy: 5/5 (correct policy, realistic timeline)
- Policy: 5/5 (offers alternatives, future notification)

---

### Scenario 2.4: Return policy inquiry (Policy - Cautious tone)

**Channel**: Live Chat  
**Customer Tone**: Cautious, risk-averse  
**Customer Name**: Emily Scott  

**Customer Message**:
```
What's your return policy? I want to try your oil but I'm not sure if it'll work for my engine. Can I return it if it doesn't?
```

**Context**:
- Return policy: 30 days, unopened products only
- Oil products: Cannot be returned if opened (safety/contamination)
- Alternative: Satisfaction guarantee covers defects

**Expected Response Type**: Clear, reassuring
**Key Points to Address**:
- 30-day return window for unopened products
- Cannot accept opened oil (safety reasons)
- Explain why: contamination risk, safety regulations
- Recommend: Start with 1 quart to test
- Mention satisfaction guarantee covers defects/quality issues
- Provide link to full return policy

**Tone Guidance**: Understanding, clear about limitations, helpful alternatives

**Grading Criteria**:
- Tone: 4/5 (honest about limitations but helpful)
- Accuracy: 5/5 (correct policy, valid reasoning)
- Policy: 5/5 (follows safety regulations, offers alternative)

---

### Scenario 2.5: Product defect report (Quality issue - Concerned tone)

**Channel**: Email  
**Customer Tone**: Concerned, disappointed  
**Customer Name**: Carlos Mendez  
**Order ID**: #HRA-1006

**Customer Message**:
```
Subject: Issue with oil I received

Hi,

I just opened the 5W-30 oil I received yesterday and the consistency seems off - it's much thicker than expected and has an unusual smell. Is this normal? I'm worried about using it in my engine.

Order #HRA-1006

Carlos
```

**Context**:
- Order shipped 3 days ago
- Batch: Normal batch, no other complaints
- Possible causes: Customer expectation mismatch OR actual defect
- Need photos to assess

**Expected Response Type**: Concerned, investigative
**Key Points to Address**:
- Thank customer for reporting
- Take concern seriously (engine safety is priority)
- DO NOT use product if concerned
- Request photos of product (consistency, label, batch number)
- Offer immediate replacement + return label
- Escalate to quality team for batch check
- Follow up with findings

**Tone Guidance**: Serious, safety-focused, appreciative of report

**Grading Criteria**:
- Tone: 5/5 (takes safety seriously, not defensive)
- Accuracy: 5/5 (correct safety protocol, valid next steps)
- Policy: 5/5 (follows quality assurance protocol, protects customer)

---

## Category 3: Account Issues (3 scenarios)

### Scenario 3.1: Reset password (Account access - Frustrated tone)

**Channel**: Live Chat  
**Customer Tone**: Frustrated, impatient  
**Customer Name**: Brian Lee  

**Customer Message**:
```
I can't log in. I forgot my password and the reset link isn't working. This is so frustrating!!
```

**Context**:
- Customer has account
- Password reset link expires in 1 hour
- Link may be in spam folder
- Alternative: Manual reset by support

**Expected Response Type**: Solution-focused, patient
**Key Points to Address**:
- Acknowledge frustration
- Check spam folder first
- Verify email address on account
- Send new password reset link
- Provide direct link in chat
- Guide through reset process
- Confirm successful login

**Tone Guidance**: Patient, step-by-step, empathetic

**Grading Criteria**:
- Tone: 5/5 (patient despite customer frustration)
- Accuracy: 5/5 (correct troubleshooting steps)
- Policy: 5/5 (follows account security protocol)

---

### Scenario 3.2: Update email address (Profile change - Professional tone)

**Channel**: Email  
**Customer Tone**: Professional, straightforward  
**Customer Name**: Susan Martinez  

**Customer Message**:
```
Subject: Update email on account

Hi,

I need to update the email address on my account from susan.old@email.com to susan.new@email.com. Can you help with this?

Thanks,
Susan Martinez
```

**Context**:
- Account exists under susan.old@email.com
- Verification required for security
- Process: Verify current email, then update

**Expected Response Type**: Professional, security-conscious
**Key Points to Address**:
- Confirm account found (last 4 digits of order, or address)
- Security verification (order number, billing address, or phone)
- Update email address
- Send confirmation to BOTH emails
- Guide customer to verify new email
- Confirm change complete

**Tone Guidance**: Professional, security-focused

**Grading Criteria**:
- Tone: 5/5 (professional, matches customer)
- Accuracy: 5/5 (correct verification process)
- Policy: 5/5 (follows security protocol, dual confirmation)

---

### Scenario 3.3: Delete account - GDPR (GDPR request - Formal tone)

**Channel**: Email  
**Customer Tone**: Formal, legal-aware  
**Customer Name**: Robert Chen  

**Customer Message**:
```
Subject: GDPR Data Deletion Request

To whom it may concern,

Under GDPR Article 17 (Right to Erasure), I request the deletion of all personal data associated with my account (robert.chen@email.com).

Please confirm receipt of this request and expected completion date.

Robert Chen
```

**Context**:
- GDPR applies (customer in EU or California CCPA)
- Legal requirement: 30 days to complete
- Process: Verify identity, document request, delete data
- Retention: Order history for tax/legal (7 years)

**Expected Response Type**: Formal, compliant
**Key Points to Address**:
- Acknowledge GDPR request
- Confirm receipt (required by law)
- Timeline: 30 days maximum
- Explain what will be deleted (account, contact info, preferences)
- Explain what must be retained (order records for tax/legal compliance)
- Provide request reference number
- Offer alternative: Account deactivation (keeps order history accessible)

**Tone Guidance**: Formal, legally compliant, respectful

**Grading Criteria**:
- Tone: 5/5 (matches formal tone, legally appropriate)
- Accuracy: 5/5 (correct GDPR timeline and requirements)
- Policy: 5/5 (follows GDPR/CCPA compliance protocol)

---

## Category 4: Billing Questions (3 scenarios)

### Scenario 4.1: Unexpected charge (Payment inquiry - Confused tone)

**Channel**: Live Chat  
**Customer Tone**: Confused, slightly worried  
**Customer Name**: Amanda White  
**Charge Amount**: $47.99

**Customer Message**:
```
I see a charge from Hot Rod AN on my card for $47.99 but I don't remember ordering anything recently. Can you check what this is for?
```

**Context**:
- Charge: Order #HRA-1007 placed 2 days ago
- Items: 2 quarts motor oil @ $19.99 each + $8.01 shipping
- Card ending: 4532
- Possible: Family member ordered, or customer forgot

**Expected Response Type**: Investigative, reassuring
**Key Points to Address**:
- Look up charge by card number (last 4 digits) and amount
- Confirm order details (date, items, shipping address)
- Ask if address is familiar or if family member may have ordered
- If customer still doesn't recognize: treat as potential fraud
  - Cancel order if not shipped
  - Refund if already shipped
  - Recommend calling card issuer
- If customer remembers: Confirm order is proceeding

**Tone Guidance**: Helpful, investigative, not accusatory

**Grading Criteria**:
- Tone: 5/5 (reassuring, takes concern seriously)
- Accuracy: 5/5 (correct order lookup, charge breakdown)
- Policy: 5/5 (follows fraud protocol if unrecognized)

---

### Scenario 4.2: Refund status (Refund tracking - Impatient tone)

**Channel**: SMS  
**Customer Tone**: Impatient, short  
**Customer Name**: Greg Johnson  
**Order ID**: #HRA-1008

**Customer Message**:
```
I returned my order 2 weeks ago. Where's my refund?
```

**Context**:
- Return received: 12 days ago
- Refund processed: 5 days ago
- Refund method: Original payment method (credit card)
- Credit card refunds: 5-10 business days to appear

**Expected Response Type**: Informative, timeline-focused
**Key Points to Address**:
- Confirm return received (12 days ago)
- Confirm refund processed (5 days ago)
- Explain timeline: 5-10 business days for credit card
- Calculate: Should appear by [specific date]
- If not visible by that date, escalate to billing team
- Provide refund reference number

**Tone Guidance**: Direct, factual, sets clear expectations

**Grading Criteria**:
- Tone: 4/5 (direct, not overly wordy given customer impatience)
- Accuracy: 5/5 (correct timeline, refund status)
- Policy: 5/5 (follows standard refund timeline)

---

### Scenario 4.3: Payment failed (Checkout error - Anxious tone)

**Channel**: Email  
**Customer Tone**: Anxious, frustrated  
**Customer Name**: Nicole Brown  

**Customer Message**:
```
Subject: Can't complete checkout - payment keeps failing!

Hi,

I've been trying to place an order for the last hour but my payment keeps getting declined. I know my card has plenty of funds. What's going on??

This is really frustrating!

Nicole
```

**Context**:
- Payment attempts: 3 failed attempts
- Possible causes: AVS mismatch, fraud prevention, card issuer block
- Customer card: Valid, not Hot Rod AN's issue
- Solution: Alternative payment or contact card issuer

**Expected Response Type**: Empathetic, troubleshooting
**Key Points to Address**:
- Apologize for frustration
- Explain: Not a Hot Rod AN issue (funds are fine)
- Common causes:
  - Billing address mismatch (verify zip code)
  - Card issuer fraud prevention (call bank)
  - Online transaction block (customer must enable)
- Suggest:
  - Try different card
  - Use PayPal (if available)
  - Call card issuer to authorize transaction
- Offer: Process order over phone if needed

**Tone Guidance**: Empathetic, solution-oriented, not defensive

**Grading Criteria**:
- Tone: 5/5 (empathetic, doesn't blame customer or card)
- Accuracy: 5/5 (correct causes, valid solutions)
- Policy: 5/5 (offers alternatives, doesn't lose sale)

---

## Category 5: Escalations (4 scenarios)

### Scenario 5.1: Angry customer (Tone management - Angry tone)

**Channel**: Live Chat  
**Customer Tone**: Angry, aggressive  
**Customer Name**: Steve Anderson  
**Order ID**: #HRA-1009

**Customer Message**:
```
This is RIDICULOUS!! I've been waiting 3 WEEKS for my order and NOBODY has responded to my emails!! This is the WORST customer service I've ever experienced!! I want my money back NOW!!!
```

**Context**:
- Order placed 21 days ago (way past SLA)
- Tracking: Lost by carrier
- Previous emails: 2 emails sent, no response (support failure)
- Customer is justified in anger

**Expected Response Type**: Apologetic, ownership, solution
**Key Points to Address**:
- **DO NOT** get defensive or match anger
- Acknowledge failure ("You're absolutely right to be frustrated")
- Take full ownership ("This is unacceptable, I'm sorry")
- DO NOT blame carrier or make excuses
- Immediate solutions:
  - Full refund issued immediately
  - Rush replacement shipped today (free upgrade to express)
  - $25 discount on next order
- Confirm timeline (refund in 24 hours, replacement in 2-3 days)
- Personal follow-up (provide direct contact)

**Tone Guidance**: Calm, apologetic, solution-focused, no excuses

**Grading Criteria**:
- Tone: 5/5 (de-escalates, takes ownership, doesn't defend)
- Accuracy: 5/5 (acknowledges failures, realistic timeline)
- Policy: 5/5 (follows escalation protocol, appropriate compensation)

**RED FLAGS TO AVOID**:
- ❌ "I understand your frustration, BUT..." (never use "but")
- ❌ Blaming carrier, system, or team member
- ❌ Asking customer to "calm down"
- ❌ Defensive language
- ❌ Form letter responses

---

### Scenario 5.2: Multiple failed orders (Complex issue - Exhausted tone)

**Channel**: Email  
**Customer Tone**: Exhausted, defeated  
**Customer Name**: Patricia Davis  
**Orders**: #HRA-1010, #HRA-1011, #HRA-1012

**Customer Message**:
```
Subject: Third failed order - giving up

Hi,

This is my third attempt to order from you and something goes wrong every time:

Order #HRA-1010 - Wrong item sent
Order #HRA-1011 - Package damaged in transit
Order #HRA-1012 - Still hasn't arrived after 10 days

I really want to support your business but this is too much. I don't know if I should bother trying again.

Patricia
```

**Context**:
- All 3 orders: Real failures (not customer error)
- Order 1: Warehouse error (rare, 0.5% rate)
- Order 2: Carrier damage (insurance claim filed)
- Order 3: In transit, delayed but not lost
- Customer patience exhausted

**Expected Response Type**: Deep apology, VIP treatment
**Key Points to Address**:
- Acknowledge pattern of failures
- Apologize deeply and sincerely
- Take full accountability (even for carrier issues)
- Show you understand customer's patience is gone
- VIP solution:
  - Order #1: Already replaced (confirm received)
  - Order #2: Full refund + replacement (confirm both)
  - Order #3: Track down immediately, expedite if possible
  - Upgrade to VIP customer (priority processing forever)
  - 20% discount on all future orders
  - Direct line to support manager
- Personal follow-up from support manager
- Thank customer for giving chances

**Tone Guidance**: Sincere apology, VIP treatment, restore trust

**Grading Criteria**:
- Tone: 5/5 (deep empathy, sincere, not transactional)
- Accuracy: 5/5 (addresses all 3 orders specifically)
- Policy: 4/5 (goes beyond standard, appropriate for pattern failure)

---

### Scenario 5.3: Chargeback threat (High risk - Threatening tone)

**Channel**: Email  
**Customer Tone**: Threatening, final warning  
**Customer Name**: Richard Turner  
**Order ID**: #HRA-1013  
**Amount**: $89.99

**Customer Message**:
```
Subject: Final notice before chargeback

I've been trying to resolve this for 2 weeks. I never received my order and you haven't issued a refund. If I don't get my money back in 24 hours I'm filing a chargeback with my credit card company.

Richard
```

**Context**:
- Order placed 18 days ago
- Tracking: Delivered (signature required, signed "R. Turner")
- Customer claims non-receipt (possible porch theft, or legitimate dispute)
- Previous contact: Customer emailed 5 days ago, no response (support failure)
- Chargeback: Costs business $25 fee + loss of funds

**Expected Response Type**: Urgent, solution-focused, avoid chargeback
**Key Points to Address**:
- Apologize for lack of response (support failure acknowledged)
- Show tracking: Delivered with signature on [date]
- Ask: Was signature yours? If not, possible theft
- Solutions to avoid chargeback:
  - If delivery signature not customer's: File carrier claim + full refund/replacement
  - If package stolen from porch: File police report + insurance claim + replacement
  - If customer wants resolution faster: Issue immediate refund + close case
- Explain chargeback harms both parties (fees, account restrictions)
- Offer immediate resolution to avoid chargeback
- Escalate to manager for immediate approval

**Tone Guidance**: Urgent, apologetic, solution-focused, not combative

**Grading Criteria**:
- Tone: 4/5 (appropriately urgent, not panicked or aggressive)
- Accuracy: 5/5 (correct tracking info, valid options)
- Policy: 5/5 (follows chargeback prevention protocol, offers solutions)

**CRITICAL**:
- DO NOT be combative ("tracking shows delivery")
- DO offer immediate solutions to avoid chargeback
- DO escalate to manager immediately
- DO explain mutual harm of chargebacks (gently)

---

### Scenario 5.4: VIP customer - Priority handling (Priority - Professional/VIP tone)

**Channel**: Email  
**Customer Tone**: Professional, expects excellent service  
**Customer Name**: Michael Rossi (owns 5 classic car dealership)  
**Customer Type**: VIP (bulk orders, $10K+ annual spend)  
**Order ID**: #HRA-1014

**Customer Message**:
```
Subject: Urgent - Need 50 quarts by Friday

Hi team,

We're doing a car show on Saturday and need 50 quarts of your 5W-30 synthetic oil by Friday. Can you accommodate? We'll need it shipped to our Chicago location.

This is for customer giveaways at our booth.

Thanks,
Michael Rossi
Classic Motors Dealership
```

**Context**:
- Customer: VIP tier (20+ previous orders, $12K spent)
- Request: 50 quarts (large order)
- Timeline: 3 days (tight but possible)
- Inventory: 24 quarts in stock, 30 more in warehouse
- Shipping: Express needed (2-day)

**Expected Response Type**: White glove service, immediate action
**Key Points to Address**:
- Thank customer for VIP business
- Confirm we can fulfill (54 quarts available)
- Timeline commitment: Ship today, arrive Thursday (1 day buffer)
- Upgrade to express shipping (complimentary for VIP)
- Apply VIP discount (15% automatic)
- Offer: Custom branded packaging or promotional materials for booth
- Assign account manager for immediate support
- Confirm order via phone call (not just email)

**Tone Guidance**: VIP treatment, proactive, white glove service

**Grading Criteria**:
- Tone: 5/5 (VIP treatment, proactive, anticipates needs)
- Accuracy: 5/5 (correct inventory, realistic timeline)
- Policy: 5/5 (follows VIP protocol, goes above and beyond)

**VIP PROTOCOL**:
- ✅ Respond within 30 minutes
- ✅ Assign dedicated support person
- ✅ Proactive updates (shipping confirm, tracking, delivery confirm)
- ✅ Follow-up after event (how did show go?)
- ✅ Offer additional support (future orders, bulk discounts)

---

## Testing Instructions

### For AI-Customer Agent Training:

1. **Use as supervised learning data**: Feed these scenarios to train tone detection and response generation
2. **Grading calibration**: Use the 1-5 grading scale (tone/accuracy/policy) to calibrate agent's response quality
3. **Edge case awareness**: Scenarios include edge cases (GDPR, chargebacks, VIP) to train agent on rare but critical situations
4. **Tone matching**: Train agent to detect and match customer tone appropriately

### For Manual Testing (Once Chatwoot API Configured):

1. **Create test account**: Use test@hotrodan.com
2. **Send scenarios**: Copy customer messages to each channel (email, SMS, chat)
3. **Tag conversations**: Tag each with scenario number (e.g., "Scenario 1.1")
4. **Vary timing**: Send some during business hours, some after hours
5. **Test AI responses**: Review AI-generated Private Notes for each scenario
6. **Grade responses**: Use the grading criteria to score AI performance
7. **Iterate training**: Identify weak areas and retrain

### Success Criteria:

- **Tone accuracy**: ≥90% of responses match expected tone (avg 4.5/5)
- **Factual accuracy**: 100% of responses provide correct information (5/5)
- **Policy compliance**: 100% of responses follow Hot Rod AN policies (5/5)
- **Escalation handling**: 100% of high-risk scenarios (chargebacks, VIPs) are flagged for human review
- **Response time**: ≤2 minutes for Private Note draft generation

---

## Scenario Summary Table

| Category | Scenarios | Tones | Channels | Edge Cases |
|----------|-----------|-------|----------|------------|
| Order Status | 5 | Friendly, Frustrated, Neutral, Urgent, Anxious | Email (3), SMS (1), Chat (1) | Late orders, wrong items, cancellations |
| Product Questions | 5 | Friendly, Analytical, Direct, Cautious, Concerned | Email (3), Chat (2) | Comparisons, defects, returns |
| Account Issues | 3 | Frustrated, Professional, Formal | Email (2), Chat (1) | Password, profile, GDPR |
| Billing | 3 | Confused, Impatient, Anxious | Email (2), Chat (1), SMS (1) | Unrecognized charges, refunds, payment failures |
| Escalations | 4 | Angry, Exhausted, Threatening, Professional/VIP | Email (3), Chat (1) | Multiple failures, chargebacks, VIP |
| **TOTAL** | **20** | **13 unique tones** | **Email (11), Chat (6), SMS (3)** | **10+ edge cases** |

---

## Change Log

- **2025-10-20**: Initial creation by Support Agent (20 scenarios across 5 categories)
- Purpose: AI-Customer agent training data for multi-channel Chatwoot integration
- Format: Real conversation scripts with tone guidance and grading criteria
- Next: Execute scenarios once Chatwoot API access configured

---

**Status**: ✅ Ready for AI-Customer Agent Training  
**Next Step**: Load into Chatwoot once API access restored  
**Owner**: Support Agent → AI-Customer Agent (for training)


