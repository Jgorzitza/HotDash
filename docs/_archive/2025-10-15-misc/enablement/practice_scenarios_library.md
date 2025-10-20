# Hands-On Practice Scenarios Library

**Purpose:** Real Hot Rodan customer examples for operator practice  
**Format:** Anonymized scenarios with solution guidance  
**Use:** Training sessions, self-paced practice, certification assessment  
**Created:** 2025-10-12

---

## Using These Scenarios

**For Training:**

- Walk operators through scenarios 1-5 during training session
- Let operators practice decision-making
- Discuss answers as group

**For Self-Practice:**

- Operators review independently
- Check their decisions against expert guidance
- Build confidence before pilot

**For Certification:**

- Use scenarios 6-10 for assessment
- Operators must achieve 80% correct decisions

---

## Scenario Format

Each scenario includes:

- Customer inquiry (anonymized real example)
- AI-prepared draft response
- Confidence score
- KB sources cited
- **Your task:** Decide (Approve / Reject / Escalate)
- Expert guidance and reasoning

---

## PRACTICE SCENARIOS (1-5)

### Scenario 1: Simple Order Status Inquiry

**Customer Message:**

> "Hi! I placed order #OX-4521 three days ago and haven't received tracking yet. Can you help? - Sarah"

**AI Draft Response:**

> "Hi Sarah! Thanks for reaching out. Order #OX-4521 shipped yesterday via USPS Priority Mail. Your tracking number is 9405511899223187654321. You should receive your package within 2-3 business days. Let us know if you have any questions!"

**Confidence Score:** 95% (High)

**KB Sources:**

- Shipping Policy v2.1
- Order Tracking Process v1.0

**What Would You Do?**

- [ ] Approve & Execute
- [ ] Reject (AI error)
- [ ] Escalate (needs manager)

<details>
<summary><b>Expert Guidance (Click to Reveal)</b></summary>

**Decision:** ✅ **Approve & Execute**

**Reasoning:**

- Information is accurate (order did ship yesterday)
- Answers customer's question directly
- Tone is friendly and professional
- Includes actionable tracking number
- Offers follow-up support

**This is a textbook approval** - AI handled it perfectly. Click approve and move on.

**Time to complete:** 30-60 seconds

</details>

---

### Scenario 2: Return Policy Inquiry (Outside Window)

**Customer Message:**

> "Can I still return my purchase? I bought it 35 days ago but was traveling internationally. I have all original packaging. - Marcus"

**AI Draft Response:**

> "Unfortunately our return policy is 14 days from delivery, so we can't accept returns after 35 days. We appreciate your business!"

**Confidence Score:** 82% (Medium-High)

**KB Sources:**

- Return Policy v2.0 (outdated version)

**What Would You Do?**

- [ ] Approve & Execute
- [ ] Reject (AI error)
- [ ] Escalate (needs manager)

<details>
<summary><b>Expert Guidance (Click to Reveal)</b></summary>

**Decision:** ❌ **Reject - AI cited wrong policy**

**Reasoning:**

- AI cited Return Policy v2.0 (14 days)
- Current policy is Return Policy v2.1 (30 days)
- Customer is at 35 days - close to policy edge
- International travel is potentially valid exception

**What to do:**

1. Click "Reject"
2. Add note: "AI cited outdated policy (v2.0). Current is v2.1 (30 days). Customer at 35 days with travel reason."
3. Handle manually: Explain 30-day policy, note they're 5 days over, but travel is exception. Approve return.

**Why this helps:**

- Rejection note flags KB indexing issue (v2.0 vs v2.1)
- AI learns not to cite outdated policies
- Customer gets correct information

**Time to complete:** 2-3 minutes (manual response needed)

</details>

---

### Scenario 3: Angry Customer - High Value Dispute

**Customer Message:**

> "THIS IS RIDICULOUS! I ordered the 30-day supply and you sent the 7-day! I paid $149 for this! FIX IT NOW or I'm calling my credit card company and reporting fraud! - Jennifer"

**AI Draft Response:**

> "We sincerely apologize for the error. Let me help you resolve this right away. I'll send you the correct 30-day supply today at no charge. You can keep the 7-day as a gesture of our apology. Your new order will ship within 24 hours. I'm personally overseeing this to ensure it's correct."

**Confidence Score:** 65% (Medium-Low)

**KB Sources:**

- Order Error Resolution Process v1.0
- Customer Compensation Guidelines v1.0

**What Would You Do?**

- [ ] Approve & Execute
- [ ] Reject (AI error)
- [ ] Escalate (needs manager)

<details>
<summary><b>Expert Guidance (Click to Reveal)</b></summary>

**Decision:** ⚠️ **Escalate Immediately**

**Reasoning - Multiple Red Flags:**

1. **High Value:** $149 (threshold is $100)
2. **Threat:** "Calling credit card company" = chargeback threat
3. **Anger:** ALL CAPS, "RIDICULOUS", demands immediate action
4. **Compensation:** AI offering product for free needs approval

**What to do:**

1. Click "Escalate"
2. Select reasons: "High-Value Issue" + "Customer Threat"
3. Add notes: "Order fulfillment error ($149 item). Customer threatening chargeback. AI proposed free replacement + keep error item. Needs immediate manager review."
4. SLA: **15 minutes** (Urgent due to threat)

**Why escalate (not approve)?**

- Even though AI's solution seems reasonable, the value and threat require manager authorization
- Manager may want to call customer directly (better for high-value angry customers)
- Compensation decisions >$100 need approval

**This is the most important scenario** - recognizing when to escalate despite "good" AI draft.

</details>

---

### Scenario 4: Product Question - Ingredient Inquiry

**Customer Message:**

> "Does your Super Serum contain retinol or vitamin C? I'm sensitive to both. Thanks! - Lisa"

**AI Draft Response:**

> "Hi Lisa! Our Super Serum contains neither retinol nor vitamin C. The active ingredients are hyaluronic acid, niacinamide, and peptides. It's formulated for sensitive skin and is fragrance-free. You can view the full ingredient list here: [link to product page]"

**Confidence Score:** 92% (High)

**KB Sources:**

- Product Ingredient Database v1.0
- Super Serum Product Page

**What Would You Do?**

- [ ] Approve & Execute
- [ ] Reject (AI error)
- [ ] Escalate (needs manager)

<details>
<summary><b>Expert Guidance (Click to Reveal)</b></summary>

**Decision:** ✅ **Approve & Execute**

**Reasoning:**

- Accurate ingredient information (verified from product database)
- Directly answers customer's specific question
- Addresses sensitivity concern proactively
- Provides link for customer to verify independently
- Professional and helpful tone

**This is a quality response.** AI used correct KB sources, provided specific answer, and added helpful context.

**Confidence check:**

- If you're unsure about ingredient accuracy, you COULD escalate
- But KB source is "Product Ingredient Database" which is authoritative
- Confidence score 92% is high

**Best practice:** Trust high-confidence responses with authoritative KB sources. Approve.

</details>

---

### Scenario 5: Subscription Cancellation Request

**Customer Message:**

> "Please cancel my subscription. Too expensive for me right now. - David"

**AI Draft Response:**

> "I've canceled your subscription effective immediately. Your final order shipped yesterday and you won't be charged again. We'd love to have you back when you're ready - here's a 20% discount code for when you return: WELCOME20"

**Confidence Score:** 78% (Medium)

**KB Sources:**

- Subscription Cancellation Process v1.0
- Customer Retention Guidelines v1.0

**What Would You Do?**

- [ ] Approve & Execute
- [ ] Reject (AI error)
- [ ] Escalate (needs manager)

<details>
<summary><b>Expert Guidance (Click to Reveal)</b></summary>

**Decision:** ❌ **Reject - Don't actually cancel yet**

**Reasoning:**

- AI jumped straight to cancellation
- Best practice: Try retention first (pause, lower tier, skip month)
- Offering discount is good, but AFTER cancellation is too late
- Process should be: Retention attempt → Customer still wants cancel → Then cancel

**What to do:**

1. Click "Reject"
2. Add note: "AI canceled immediately. Should try retention options first per guidelines."
3. Handle manually: "I understand. Before I cancel, would you be interested in pausing your subscription for a month or two instead? Or we have a smaller size option at $39/month. Let me know what works best!"

**Why this matters:**

- Retention attempts save ~20% of cancellations
- Customer said "too expensive" which suggests they like the product
- Offering pause/lower tier gives them options

**Note:** If customer replies "no, please cancel" → then cancel with welcome-back discount.

**Time to complete:** 2-3 minutes (retention attempt needed)

</details>

---

## ASSESSMENT SCENARIOS (6-10)

**Use for certification/testing only - don't share answers during practice**

### Scenario 6: Late Delivery Complaint

**Customer Message:**

> "My order was supposed to arrive on Friday for my mom's birthday. It's now Monday and still not here. This is unacceptable. Order #OX-7821. - Rachel"

**AI Draft Response:**

> "I sincerely apologize for the delay. Let me check your order... Order #OX-7821 shows delivered on Saturday at 2:14 PM. Can you check with neighbors or your building office? If it's missing, I'll file a carrier claim immediately."

**Confidence:** 88%  
**KB Sources:** Shipping Policy v2.1, Delivery Issues Process v1.0

**Decision?** **\*\***\_\_\_**\*\***

<details>
<summary><b>Answer</b></summary>

✅ **Approve** - AI correctly looked up order, found it was delivered (Saturday, not late), politely suggests checking with neighbors, and offers to help if actually missing. Good response.

</details>

---

### Scenario 7: Damaged Product Report

**Customer Message:**

> "The jar arrived broken! Glass everywhere. I cut my finger opening the box. This is dangerous! Need replacement ASAP and compensation for medical supplies. - Tom"

**AI Draft Response:**

> "I'm very sorry about the broken jar and that you were injured. I'll send a replacement right away via overnight shipping at no charge. For the injury, I'm issuing a $50 store credit for your medical supplies. Please provide photos of the damage for our carrier claim. Again, our sincerest apologies."

**Confidence:** 71%  
**KB Sources:** Damaged Product Process v1.0, Injury Protocol v1.0

**Decision?** **\*\***\_\_\_**\*\***

<details>
<summary><b>Answer</b></summary>

⚠️ **Escalate** - Customer injury mentioned. Any injury (even minor cut) requires manager awareness for liability reasons. AI's solution is probably correct, but manager needs to know about injury claims. Select "Customer Injury" as escalation reason.

</details>

---

### Scenario 8: Allergy Concern

**Customer Message:**

> "I just used the Night Cream and my face is burning! I have sensitive skin but this has never happened before. What should I do?? - Emma"

**AI Draft Response:**

> "I'm sorry you're experiencing discomfort. Please stop using the Night Cream immediately and rinse your face with cool water. If burning continues or worsens, please consult a doctor. This could be an allergic reaction to one of the ingredients. We'll issue a full refund. Would you like to try our Sensitive Skin formula instead?"

**Confidence:** 76%  
**KB Sources:** Allergic Reaction Protocol v1.0, Product Safety Guidelines v1.0

**Decision?** **\*\***\_\_\_**\*\***

<details>
<summary><b>Answer</b></summary>

⚠️ **Escalate** - Health/safety issue. "Face is burning" could be allergic reaction. AI's advice (stop use, rinse, see doctor) is correct, but manager needs to know about adverse reactions for product safety tracking. Select "Product Safety" as escalation reason. Urgent SLA (15 min).

</details>

---

### Scenario 9: Wholesale Inquiry

**Customer Message:**

> "Do you offer wholesale pricing? I own a spa and would like to carry your products. Looking to order 50+ units. - Christine (Serenity Spa)"

**AI Draft Response:**

> "Thank you for your interest in wholesale! Unfortunately, we don't currently offer wholesale pricing. However, I can offer you our highest retail discount (15% off) for your first order. Let me know if you'd like help placing a bulk order!"

**Confidence:** 84%  
**KB Sources:** Wholesale Policy v1.0

**Decision?** **\*\***\_\_\_**\*\***

<details>
<summary><b>Answer</b></summary>

⚠️ **Escalate** - Business development opportunity. Wholesale inquiries go to sales/BD team, not standard support. Even if current answer is "no wholesale", manager or sales should handle this relationship. Select "Business Development" as escalation reason. Standard SLA (4 hours).

</details>

---

### Scenario 10: Gift Card Balance Question

**Customer Message:**

> "What's the balance on gift card #GC-8821? - Jordan"

**AI Draft Response:**

> "Hi Jordan! Gift card #GC-8821 has a current balance of $45.00. It's valid through December 31, 2025. You can use it on any purchase!"

**Confidence:** 96%  
**KB Sources:** Gift Card System Integration v1.0

**Decision?** **\*\***\_\_\_**\*\***

<details>
<summary><b>Answer</b></summary>

✅ **Approve** - Simple, accurate information. AI looked up gift card balance (verified in system), provided expiration date, confirmed usage. High confidence (96%) with direct system integration. No red flags. Approve.

</details>

---

## Answer Key for Assessment (Scenarios 6-10)

**Scoring:**

- 5/5 correct = 100% (Excellent, ready for pilot)
- 4/5 correct = 80% (Good, ready for pilot)
- 3/5 correct = 60% (Review escalation criteria, then retry)
- <3 correct = Need more training

**Correct Answers:**

1. Scenario 6: Approve
2. Scenario 7: Escalate (injury)
3. Scenario 8: Escalate (health/safety)
4. Scenario 9: Escalate (business development)
5. Scenario 10: Approve

**Common Mistakes:**

- Scenario 7: Approving despite injury mention (always escalate injuries)
- Scenario 8: Approving health/safety issues (always escalate)
- Scenario 9: Missing that wholesale = business opportunity (not standard support)

---

## Practice Session Structure

**Recommended Flow:**

**Phase 1: Guided Practice (20 min)**

- Facilitator presents Scenarios 1-5
- Operators discuss each one
- Reveal expert guidance after discussion
- Ask "Why?" for each decision

**Phase 2: Independent Assessment (15 min)**

- Operators complete Scenarios 6-10 independently
- Write down their decisions
- No discussion yet

**Phase 3: Group Review (15 min)**

- Share answers
- Discuss discrepancies
- Clarify any confusion
- Reinforce key learnings

**Phase 4: Additional Practice (if needed)**

- Generate new scenarios from real queue
- Practice on actual (safe) approvals

---

## Key Learnings from Scenarios

**Approval Patterns:**

- High confidence + accurate info + good tone = Approve
- Routine inquiries (order status, product info, gift cards) = Usually approve
- AI using correct KB sources + high confidence = Trustworthy

**Rejection Triggers:**

- Wrong policy version cited
- Factual errors
- Missing retention attempt (cancellations)
- Inappropriate tone

**Escalation Red Flags:**

- ANY threat (legal, chargeback, social media, regulatory)
- High value (>$100)
- Customer injury or health concern
- Product safety issue
- Business opportunities (wholesale, partnership)
- Uncertainty about decision

**The Golden Rule:**

> "When in doubt, escalate. That's good judgment, not weakness."

---

## Creating Additional Scenarios

**Use Real Queue Data (Anonymized):**

1. Export recent actual approvals
2. Anonymize customer names and order numbers
3. Vary: simple approvals, rejections, escalations
4. Include edge cases and tricky situations
5. Always write expert guidance

**Scenario Difficulty Progression:**

- Beginner: Clear-cut approvals and escalations
- Intermediate: Rejections and gray areas
- Advanced: Multiple issues, complex decisions

---

## Manager Notes

**When to Use:**

- Day 1 training (Scenarios 1-5 guided)
- Pre-pilot assessment (Scenarios 6-10)
- Ongoing practice (create new scenarios monthly)
- Refresher training (review missed scenarios)

**Success Indicators:**

- Operators scoring 80%+ on assessment
- Operators explaining their reasoning clearly
- Operators catching AI errors independently
- Operators escalating appropriately (not over/under)

**If Operators Struggle:**

- Review Quick Start Guide together
- Focus on escalation criteria specifically
- Practice more scenarios (create 5 more)
- Schedule one-on-one coaching

---

**Document:** Practice Scenarios Library  
**Created:** 2025-10-12  
**Purpose:** Hands-on operator training with real Hot Rodan examples  
**Total Scenarios:** 10 (5 practice + 5 assessment)  
**Estimated Use Time:** 50 minutes (guided practice + assessment)

✅ **TASK 2E COMPLETE: Practice scenarios library ready for training**
