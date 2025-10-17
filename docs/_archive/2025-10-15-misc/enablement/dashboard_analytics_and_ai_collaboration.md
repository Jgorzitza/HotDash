# Dashboard Analytics & AI Collaboration Training

**Purpose:** Understanding OCC tiles and optimizing AI partnership  
**Covers:** Tasks 2M (Dashboard Analytics) + 2N (AI Collaboration)  
**Level:** All operators  
**Created:** 2025-10-12

---

## PART 1: Dashboard Analytics Training (Task 2M)

### Understanding OCC Tiles

**Purpose:** Operators need to understand the context tiles provide when reviewing approvals

---

### Tile 1: Sales Pulse

**What It Shows:**

- Revenue trends (daily, weekly, monthly)
- Top-selling products
- Revenue alerts (unusual spikes/drops)
- Order volume

**How It Helps Approvals:**

```
Scenario: Customer asks about product availability

Sales Pulse shows: Super Serum sold 50 units yesterday (high demand)

Context for AI: Product is popular, may be low stock

What to check: Is stock available before AI promises quick shipping?

Action: If AI says "ships today" but Sales Pulse shows high demand, verify
inventory before approving
```

**Reading the Tile:**

- Green trend = revenue up (good)
- Red trend = revenue down (investigate if sustained)
- Alerts = unusual activity (check context)

---

### Tile 2: Ops Pulse

**What It Shows:**

- Unresolved customer inquiries
- Response time performance
- SLA compliance
- Escalation queue status

**How It Helps Approvals:**

```
Scenario: Customer complaining about slow response

Ops Pulse shows: Response time currently 6 hours (high)

Context: We're behind today

AI might say: "Sorry for the delay..."

Check: Is the apology in AI's response adequate for a 6-hour wait? Might
need stronger apology or compensation offer

Action: If customer waited 6+ hours and AI just says "sorry", consider
rejecting and adding compensation (discount code, priority handling)
```

---

### Tile 3: Inventory Pulse

**What It Shows:**

- Stock levels for all products
- Low stock alerts
- Out of stock items
- Restocking timelines

**How It Helps Approvals:**

```
Scenario: Customer orders Night Cream

Inventory Pulse shows: Night Cream - 5 units left (low stock)

AI says: "Order ships today!"

Check: With only 5 units left, will this actually ship today or is there a
delay?

Action: Verify with fulfillment if unsure. Better to set accurate expectations
than promise and disappoint
```

---

### Using Tiles for Better Approvals

**Best Practice: The "Context Check"**

```
Before approving any AI draft:

1. Glance at relevant tiles (takes 5 seconds)
   - Sales Pulse: Product demand/availability context
   - Ops Pulse: Customer wait time context
   - Inventory Pulse: Stock availability context

2. Ask: Does AI's response align with current reality?
   - Promising fast shipping but inventory is low?
   - Minimal apology but customer waited 8 hours?
   - Product recommendation but it's out of stock?

3. Adjust if needed:
   - Reject and add context about current situation
   - OR escalate if significant discrepancy

Result: More accurate, contextual responses to customers
```

---

## PART 2: AI Collaboration Training (Task 2N)

### Working With AI Suggestions

**Mindset:** AI is your research assistant, you're the decision maker

---

### Section 1: When to Trust AI

**High Trust Situations (Usually Approve):**

```
✓ Confidence >90%
✓ Simple factual questions (order status, policy basics)
✓ AI cites current KB sources (v2.1 policies)
✓ Information matches what you see in system
✓ Routine inquiries
✓ No red flags present

Example:
Customer: "What's your return policy?"
AI (95% confidence): "We offer 30-day returns from delivery date..."
KB Source: Return Policy v2.1 (current)

Decision: Trust and approve (30 seconds)
```

---

### Section 2: When to Verify Carefully

**Medium Trust Situations (Verify Before Approving):**

```
⚠️ Confidence 70-89%
⚠️ Complex multi-part questions
⚠️ Policy edge cases (customer at 29 days, etc.)
⚠️ Technical product questions
⚠️ Compensation or refund offers

Example:
Customer: "Can I exchange Night Cream for Day Moisturizer after 25 days?"
AI (78% confidence): "Yes, our exchange policy allows this within 30 days..."
KB Source: Exchange Policy v1.0

Decision: Verify exchange policy details, check if price difference matters,
then approve if accurate (2-3 minutes)
```

---

### Section 3: When to Override AI

**Low Trust Situations (Reject or Escalate):**

```
🔴 Confidence <70%
🔴 AI cites outdated KB sources (v2.0 instead of v2.1)
🔴 Information contradicts what you see in system
🔴 AI missed obvious red flags
🔴 Response doesn't actually answer question
🔴 Tone is off (too formal, not empathetic, etc.)

Example:
Customer: "I'm so frustrated! Order wrong again!"
AI (65% confidence): "We apologize. Here's your tracking number..."
Issue: AI didn't address "wrong again" (repeat issue)

Decision: Reject - AI missed that this is a pattern. Manual response needed
to acknowledge repeated issue and provide better solution (maybe free shipping
on next order)
```

---

### Section 4: Teaching AI Through Your Decisions

**Every Decision is a Teaching Moment:**

**Approvals Teach:** "This approach works"

```
You approve AI draft using specific empathy language
    ↓
AI learns: "This language style works for upset customers"
    ↓
AI uses similar empathy in future drafts
    ↓
Your approval rate increases
```

**Edits Teach:** "Use this style" (if editing feature exists)

```
You edit AI draft to add: "I'm personally making sure this ships today"
    ↓
AI learns: "Personal accountability statements work well"
    ↓
AI starts including similar phrases
    ↓
Customer responses improve
```

**Rejections Teach:** "Don't do this"

```
You reject with note: "AI cited Return Policy v2.0 but current is v2.1 (30 days not 14)"
    ↓
AI learns: "Always use v2.1, not v2.0"
    ↓
Engineering updates KB indexing priority
    ↓
Future drafts cite correct version
```

**Escalations Teach:** "I can't handle this"

```
You escalate: "Customer injury mentioned - above my authority"
    ↓
AI learns: "Injury = always flag for escalation"
    ↓
Future injury mentions get auto-flagged
    ↓
Safer handling of sensitive situations
```

---

### Section 5: Providing Effective Feedback to AI

**Quality Rejection Notes:**

**Bad Rejection Note:**

> "Wrong"

**AI learns:** Nothing (no context)

**Good Rejection Note:**

> "AI cited Return Policy v2.0 (14 days) but current policy is v2.1 (30 days). Customer at 20 days should be eligible for return."

**AI learns:** Specific error (version), correct version (v2.1), impact (customer eligibility)

**Great Rejection Note:**

> "AI cited outdated Return Policy v2.0 (14-day window). Current policy is v2.1 (30-day window) effective Oct 1, 2025. Customer purchased Oct 1, returning Oct 20 = 20 days = WITHIN policy. AI incorrectly denied. Also, AI tone was abrupt - could have been more apologetic for confusion. Recommend: Update KB indexing to prioritize v2.1, add empathy training for policy corrections."

**AI learns:** Everything + suggestions for improvement

---

### Section 6: AI Confidence Calibration

**Understanding What Confidence Really Means:**

**High Confidence Doesn't Always Mean Correct:**

```
Scenario: AI is 98% confident but wrong

Why? AI might be:
- Very confident in outdated information
- Confident but using wrong KB source
- Confident in interpretation that's technically incorrect

Your job: Trust but verify, always
```

**Low Confidence Doesn't Always Mean Wrong:**

```
Scenario: AI is 68% confident but actually correct

Why? AI might be:
- Uncertain because customer question was ambiguous
- Found conflicting information in KB (needs cleanup)
- Dealing with edge case (unusual scenario)

Your job: Review carefully, might be fine to approve
```

**The Calibration Loop:**

```
Week 1: AI confidence is rough estimate
    ↓
You approve/reject based on accuracy (not confidence)
    ↓
Week 4: AI learns which situations warrant high vs low confidence
    ↓
Week 8: Confidence scores become more reliable
    ↓
Month 6: Confidence is highly calibrated predictor

Your decisions calibrate the AI over time!
```

---

### Section 7: Advanced AI Collaboration

**The Expert Operator's AI Partnership:**

**1. Pattern Recognition Collaboration**

```
You notice: AI consistently struggles with [specific scenario]

Action: Document the pattern, share with team

Example: "AI always suggests immediate cancellation for subscription
cancellation requests. Should try retention first per guidelines.
Suggesting AI training update."

Result: AI gets better at retention for everyone
```

**2. KB Gap Identification**

```
You reject 3 times for similar issue: "No KB source for wholesale inquiries"

Action: Flag KB gap to knowledge team

Example: "Seeing increase in wholesale questions but no KB article.
Recommendation: Create 'Wholesale Inquiry Response Template' article."

Result: AI gets better resources, fewer rejections
```

**3. Quality Improvement Suggestions**

```
You notice: AI often forgets to include order confirmation link

Action: Suggest feature improvement

Example: "For all order confirmations, AI should auto-include link to order
status page. Currently only includes sometimes. Suggest making this automatic."

Result: Consistent quality improvement
```

---

## Practice Scenarios

### Scenario 1: Trust or Verify?

**Customer:** "Is Super Serum safe for rosacea?"  
**AI (72%):** "Super Serum is formulated for sensitive skin and doesn't contain common irritants. However, we recommend patch testing first if you have rosacea."  
**KB Source:** Product Safety Guidelines v1.0

**Your decision:** Trust and approve? OR verify/escalate?

<details>
<summary>Answer</summary>

**Verify then approve.** Medical condition mentioned (rosacea), so verify AI's advice is appropriate. AI's response is good - acknowledges sensitivity, recommends patch test (safe advice), doesn't claim to cure medical condition. This is appropriately cautious. Approve.

</details>

---

### Scenario 2: Teaching Moment

**Customer:** "Your website says free shipping but I was charged $8!"  
**AI (85%):** "You're right, that's an error. I've refunded the $8 shipping charge. It should appear in 3-5 business days."  
**KB Source:** Shipping Policy v2.1

**AI handled well. What does your approval teach AI?**

<details>
<summary>Answer</summary>

**Approval teaches:** "When customer is right about an error, acknowledge immediately, fix it, provide timeline." This reinforces good customer service patterns for error situations.

</details>

---

**Document:** Dashboard Analytics & AI Collaboration Training  
**Created:** 2025-10-12  
**Covers:** Tasks 2M + 2N  
**Purpose:** Tile mastery and AI partnership optimization

✅ **TASKS 2M & 2N COMPLETE**
