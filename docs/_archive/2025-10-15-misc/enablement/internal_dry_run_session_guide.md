# Internal Dry-Run Session Guide: Agent SDK Approval Queue

**Session Type:** Internal Team Training / Dry-Run  
**Owner:** Enablement Team  
**Created:** 2025-10-11  
**Version:** 1.0  
**Duration:** 90 minutes  
**Target Audience:** Support Operators + Support Leadership + Product Team

---

## Table of Contents

1. [Session Overview](#session-overview)
2. [Pre-Session Preparation](#pre-session-preparation)
3. [Session Agenda](#session-agenda)
4. [Demo Scenarios](#demo-scenarios)
5. [Hands-On Practice Exercises](#hands-on-practice-exercises)
6. [Q&A Facilitation Guide](#qa-facilitation-guide)
7. [Success Metrics](#success-metrics)
8. [Post-Session Actions](#post-session-actions)

---

## Session Overview

### Purpose

This internal dry-run session serves multiple goals:

1. **Validate Training Materials** - Test if operators understand the approval queue workflow
2. **Identify Knowledge Gaps** - Discover what's unclear or missing from training
3. **Build Operator Confidence** - Hands-on practice in safe environment
4. **Gather Feedback** - Collect operator concerns and suggestions
5. **Team Alignment** - Ensure everyone understands the system before live rollout

### Target Outcomes

By the end of this session, operators should:

- ✅ Understand the purpose and benefits of the approval queue
- ✅ Navigate the approval queue interface confidently
- ✅ Apply the 5-Question Framework to make decisions
- ✅ Know when to approve, edit, reject, or escalate
- ✅ Feel comfortable asking questions and escalating when needed
- ✅ Identify any remaining training needs

### Session Format

**Blended Approach:**

- **30% Presentation** - Overview and demonstration
- **50% Hands-On Practice** - Guided exercises with sample approvals
- **20% Discussion** - Q&A, concerns, feedback

**Interactive Elements:**

- Live demonstrations
- Pair programming exercises
- Group discussion
- Real-time Q&A
- Feedback collection

---

## Pre-Session Preparation

### 1 Week Before Session

**Enablement Team:**

- [ ] Schedule 90-minute session (all operators + leadership)
- [ ] Book conference room or set up virtual meeting
- [ ] Send calendar invites with pre-work
- [ ] Prepare demo environment with sample data
- [ ] Create sample approval scenarios (10-15)
- [ ] Test all demo scenarios for smooth flow
- [ ] Prepare presentation slides
- [ ] Set up feedback collection method (survey, forms)

**Pre-Work for Attendees:**

- [ ] Watch 4 Loom training modules (18m 25s total)
- [ ] Read Quick Start Guide
- [ ] Review FAQ (at least top 10 questions)
- [ ] Write down 3 questions to ask during session
- [ ] Complete pre-session survey (confidence baseline)

**Required Materials:**

- [ ] Laptops for all attendees (access to demo environment)
- [ ] Printed Quick Start Guides (1 per person)
- [ ] Presentation slides
- [ ] Demo scenarios packet
- [ ] Feedback forms
- [ ] Sticky notes for questions
- [ ] Whiteboard or flip chart

**Technical Setup:**

- [ ] Demo approval queue environment ready
- [ ] Sample conversations loaded in Chatwoot
- [ ] Test accounts created for each attendee
- [ ] Network/projector tested
- [ ] Backup plan if technology fails

---

### 3 Days Before Session

**Send Reminder Email:**

```
Subject: Reminder: Agent SDK Dry-Run Session - [Date/Time]

Hi Team,

Quick reminder about our Agent SDK Approval Queue dry-run session on [Date] at [Time].

Pre-Work (if you haven't already):
✅ Watch the 4 Loom training modules: [links]
✅ Read the Quick Start Guide: [link]
✅ Review the FAQ: [link]
✅ Complete the pre-session survey: [link]
✅ Write down 3 questions you'd like answered

What to Bring:
- Your laptop (we'll practice in the demo environment)
- Your questions and curiosity!
- An open mind - this is a safe space to learn

Session Format:
- 30 min: Demo and overview
- 45 min: Hands-on practice with sample approvals
- 15 min: Q&A and feedback

Location: [Room/Zoom Link]

See you there!

[Your Name]
Enablement Team
```

---

### Day Before Session

**Final Checklist:**

- [ ] All attendees confirmed attendance
- [ ] Demo environment tested and working
- [ ] All sample scenarios load correctly
- [ ] Backup facilitator identified (if primary unavailable)
- [ ] Printed materials ready
- [ ] Technology backup plan ready
- [ ] Post-session survey prepared
- [ ] Note-taker assigned (for capturing feedback)

---

## Session Agenda

### Total Time: 90 Minutes

---

### **Part 1: Welcome & Context (10 minutes)**

**Facilitator:** Enablement Lead or Support Manager

**Content:**

1. **Welcome** (2 min)
   - Thank everyone for attending
   - Emphasize: This is a safe learning space
   - No wrong questions or mistakes

2. **Session Goals** (3 min)
   - What we're here to accomplish
   - What success looks like
   - How this fits into broader rollout plan

3. **Agenda Overview** (2 min)
   - What we'll cover
   - Time allocations
   - When Q&A happens (ongoing + dedicated time at end)

4. **Ground Rules** (3 min)
   - Ask questions anytime
   - Share concerns openly
   - Practice without fear of "mistakes"
   - Respect everyone's learning pace
   - Feedback welcome and encouraged

**Key Message:**

> "This approval queue is designed to make YOUR job easier and more rewarding. We're here to learn together and make sure this works for YOU."

---

### **Part 2: System Overview & Demo (20 minutes)**

**Facilitator:** Product Team or Technical Lead

**Content:**

**2.1 The "Why" Behind Approval Queue (5 min)**

- Operator-first design philosophy
- Benefits: More time for complex issues, less time on repetitive tasks
- How your decisions teach the AI
- Human-in-the-loop model

**Visual:** North Star diagram showing operator empowerment

**2.2 Live Demo: Complete Approval Flow (10 min)**

**Demo Scenario 1: Standard Approval (High Confidence)**

```
Customer: "Where is my order #12345?"

AI Draft (95% confidence):
"Hi Susan! Your order #12345 shipped yesterday via FedEx.
Tracking: 123456789. Should arrive by Oct 15. Track here: [link]"
```

**Walk Through:**

1. Show approval card in queue
2. Point out confidence score
3. Review KB sources
4. Apply 5-Question Framework aloud
5. Click "Approve & Execute"
6. Show result in Chatwoot

**Demo Scenario 2: Edit & Approve (Medium Confidence)**

```
Customer: "I got the wrong item! Ordered blue, got red."

AI Draft (75% confidence):
"You can return the item using our return policy.
Return label: [link]"
```

**Walk Through:**

1. Identify missing empathy
2. Show edit interface
3. Make improvements live
4. Explain why edits matter
5. Approve edited version
6. Show how AI learns from edits

**Demo Scenario 3: Escalation (High Risk)**

```
Customer: "Charged me 3 times! $1,350 instead of $450!
Disputing with my bank!"

AI Draft (68% confidence):
"Please contact billing at billing@example.com"
```

**Walk Through:**

1. Identify red flags (high-value, threats)
2. Show escalation interface
3. Fill out escalation notes
4. Submit escalation
5. Show manager notification
6. Explain follow-up process

**2.3 Interface Tour (5 min)**

- Queue filters and search
- Confidence scores
- KB source links
- Risk indicators
- Stats dashboard
- Where to find help

---

### **Part 3: Hands-On Practice (45 minutes)**

**Facilitator:** Enablement Team + Senior Support (floating to help)

**Setup:**

- Attendees pair up (experienced + newer operator if possible)
- Each pair gets access to demo environment
- 8 practice scenarios provided
- Pairs work through scenarios together
- Facilitators circulate to answer questions

**Practice Scenarios Packet:**

**Scenario 1: Easy Approval** (5 min)

```
Customer: "What's your return policy?"
AI Draft (98% confidence): [Accurate policy explanation]
Task: Review and approve
Goal: Build confidence with straightforward case
```

**Scenario 2: Minor Edit Needed** (5 min)

```
Customer: "My package arrived damaged!"
AI Draft (82% confidence): [Correct info but lacks empathy]
Task: Edit to add empathy, then approve
Goal: Practice improving tone
```

**Scenario 3: Factual Error** (7 min)

```
Customer: "Can I return this after 20 days?"
AI Draft (85% confidence): [Cites 14-day policy, but policy is 30 days]
Task: Identify error, reject with notes
Goal: Practice catching inaccuracies
```

**Scenario 4: Unclear Customer Message** (7 min)

```
Customer: "What about my thing?"
AI Draft (45% confidence): [Vague attempt at answer]
Task: Discuss whether to escalate or handle manually
Goal: Practice dealing with ambiguity
```

**Scenario 5: Policy Exception** (7 min)

```
Customer: "Can I return after 45 days? I was traveling."
AI Draft (80% confidence): [Correctly denies per policy]
Task: Escalate for manager approval
Goal: Practice escalation procedure
```

**Scenario 6: High-Value + Angry** (7 min)

```
Customer: "THIRD TIME asking! $500 refund NOW or I'm posting everywhere!"
AI Draft (65% confidence): [Generic apology]
Task: Urgent escalation with detailed notes
Goal: Practice urgent escalation
```

**Scenario 7: Technical Issue** (7 min)

```
Customer: "Error 500 during checkout for 2 hours. Can't complete purchase."
AI Draft (55% confidence): [Suggests cache clearing]
Task: Escalate to engineering with context
Goal: Practice technical escalations
```

**Scenario 8: Complex Multi-Part** (Bonus if time allows)

```
Customer: "Order late, wrong color, want refund and expedited replacement, also have a question about your warranty policy."
AI Draft (72% confidence): [Attempts to address everything]
Task: Decide how to handle (edit, escalate, combination)
Goal: Practice complex decision-making
```

**Facilitation Tips:**

- Circulate among pairs
- Encourage discussion between partners
- Don't give answers immediately - ask guiding questions
- Note common questions for FAQ updates
- Celebrate good decisions
- Normalize different approaches (there's often more than one right answer)

**Mid-Practice Check-In (after Scenario 4, ~20 min mark):**

- Pause for group questions
- Address any common confusions
- Adjust pacing if needed

---

### **Part 4: Q&A & Discussion (15 minutes)**

**Facilitator:** Support Manager + Product Team

**Structure:**

**4.1 Facilitated Q&A (10 min)**

**Collect Questions:**

- Use sticky notes or digital tool
- Group similar questions
- Prioritize most common/important

**Sample Anticipated Questions:**
(See FAQ document for full answers, prepare these in advance)

1. "What if I approve something wrong?"
2. "How much will the AI improve over time?"
3. "Can I still write responses manually?"
4. "What happens to my metrics?"
5. "When should I escalate vs. figure it out myself?"

**Facilitation Approach:**

- Validate the question ("Great question!")
- Provide clear, honest answer
- Connect back to training materials
- Give specific examples
- Ask if answer was clear

**4.2 Open Discussion (5 min)**

**Prompting Questions:**

- "What concerns do you still have?"
- "What would make you more confident?"
- "What's missing from the training?"
- "What would you change about the system?"

**Capture All Feedback:**

- Note-taker records everything
- No feedback is dismissed
- Thank people for sharing
- Commit to addressing concerns

---

## Demo Scenarios

### Detailed Demo Scenarios for Facilitator

**Note:** These should be loaded in the demo environment before the session.

---

### **Demo Scenario 1: Standard Order Status (High Confidence)**

**Purpose:** Show the happy path - straightforward approval

**Customer Context:**

- Name: Susan Martinez
- Conversation ID: #101
- Order: #12345 placed 3 days ago

**Customer Message:**

> "Hi, I ordered 3 days ago and haven't received tracking info yet. Can you check on order #12345?"

**AI Draft Response:**

> "Hi Susan! I've looked up your order #12345. Great news - it shipped yesterday via FedEx. Your tracking number is 9876543210 and you can track it here: [link]. Expected delivery is Tuesday, October 15. Let me know if you need anything else!"

**AI Metadata:**

- Confidence: 95% (High)
- Agent: Order Support Agent
- Timestamp: 2 minutes ago
- Risk Level: Low

**Knowledge Base Sources:**

- Shipping Policy (v2.1) - 98% relevance
- Order Tracking Guide (v1.5) - 94% relevance

**Facilitator Script:**

"Let's look at our first approval together. Here's what I see:

**Customer Question:** Pretty straightforward - where's my order?

**Confidence Score:** 95% - that's high. AI is confident it has the right answer.

**Draft Response:** Let me read this aloud... [read draft]

Now let's apply our 5-Question Framework:

1. **Accuracy:** Is the information correct?
   - I can verify order #12345 did ship yesterday ✅
   - FedEx tracking number is valid ✅
   - Delivery date matches carrier estimate ✅

2. **Completeness:** All questions answered?
   - Customer asked where order is ✅
   - We provided tracking ✅
   - Gave expected delivery date ✅

3. **Tone:** Friendly and professional?
   - Uses customer's name ✅
   - Enthusiastic ("Great news") ✅
   - Offers continued help ✅

4. **Clarity:** Will customer understand?
   - Simple language ✅
   - Clear next steps ✅
   - Link provided for tracking ✅

5. **Risk:** Any red flags?
   - Standard order status ✅
   - No exceptions needed ✅
   - Customer tone is neutral ✅

**Decision:** All 5 checks pass! This is a great example of an AI draft we can approve as-is.

[Click "Approve & Execute" button]

See how fast that was? Now let's look at what happens next..."

[Show response appearing in Chatwoot, customer receives it immediately]

---

### **Demo Scenario 2: Edit Before Approval (Medium Confidence)**

**Purpose:** Show when and how to edit AI drafts

**Customer Context:**

- Name: Alex Thompson
- Conversation ID: #102
- Order: #67890 (wrong item sent)

**Customer Message:**

> "Seriously?! I ordered a BLUE sweater and you sent me RED. This is for an event on Saturday and now I'm scrambling. This is so frustrating!"

**AI Draft Response:**

> "Your order #67890 can be returned per our return policy. Here's your return label: [link]. Refunds are processed in 5-7 business days after we receive the returned item."

**AI Metadata:**

- Confidence: 78% (Medium)
- Agent: Order Support Agent
- Timestamp: 3 minutes ago
- Risk Level: Medium (frustrated customer)

**Knowledge Base Sources:**

- Return Policy (v2.1) - 85% relevance
- Exchange Process (v1.3) - 72% relevance

**Facilitator Script:**

"This one's different. Notice the medium confidence score and the 'frustrated customer' risk flag.

Let me read the customer's message first... [read]

**Customer Emotion:** Frustrated, time-sensitive (Saturday event), inconvenienced

Now the AI's draft... [read]

Let's apply the 5-Question Framework:

1. **Accuracy:** Info correct?
   - Return process is accurate ✅
   - Timeline is correct ✅

2. **Completeness:** All questions addressed?
   - Explains how to return ✅
   - BUT doesn't address Saturday deadline ❌
   - Doesn't offer exchange option ❌

3. **Tone:** Appropriate?
   - Very transactional ❌
   - No acknowledgment of error ❌
   - No empathy for frustration ❌
   - Doesn't match customer's urgent tone ❌

4. **Clarity:** Easy to understand?
   - Yes, but that's not enough ⚠️

5. **Risk:** Any concerns?
   - Frustrated customer needs special care ⚠️
   - Event deadline adds urgency ⚠️

**Decision:** This needs editing. The info is right, but the approach is wrong for this situation.

[Click "Edit" button]

Let me show you how I'd improve this:

[Edit live on screen]

**New Version:**

> Hi Alex,
>
> I'm so sorry we sent the wrong color! That's incredibly frustrating, especially with your event on Saturday. Let's get this fixed right away.
>
> Here's what I can do:
>
> **OPTION 1 - EXPEDITED EXCHANGE (FASTEST):**
> I'll ship the blue sweater TODAY with overnight shipping - arrives Friday. Return the red one with this prepaid label: [link]. No charge for overnight shipping.
>
> **OPTION 2 - REFUND:**
> Full refund of $45.99 processed within 24 hours. Return label: [link]
>
> Which works best for you? I'll make it happen immediately!
>
> Again, my apologies for this mixup.
>
> Best,
> [Your Name]

**What Changed:**

- Added empathy and acknowledgment ✅
- Addressed urgency with expedited solution ✅
- Offered exchange (AI missed this) ✅
- Gave customer control with 2 options ✅
- Personal accountability ✅
- Committed to fast action ✅

[Click "Approve & Execute" after editing]

This is what we mean by 'Edit & Approve' - taking a good foundation and making it great. The AI did the research, you added the human touch."

---

### **Demo Scenario 3: Escalation (High Risk)**

**Purpose:** Show when and how to escalate

**Customer Context:**

- Name: Michael Richards
- Conversation ID: #103
- Transaction issue: Triple charged

**Customer Message:**

> "ARE YOU KIDDING ME?! I just checked my bank and you charged me THREE TIMES for the same $450 order! That's $1,350 on my credit card! I need this fixed NOW or I'm disputing with my bank AND reporting you to the Better Business Bureau. This is completely unacceptable!"

**AI Draft Response:**

> "I apologize for the inconvenience. Please contact our billing department at billing@hotrodan.com and they can review the charges and process any necessary refunds."

**AI Metadata:**

- Confidence: 68% (Medium-Low)
- Agent: Order Support Agent
- Timestamp: 1 minute ago
- Risk Level: **HIGH** (multiple red flags)

**Knowledge Base Sources:**

- Billing Issues (v1.8) - 70% relevance
- Refund Policy (v2.1) - 65% relevance

**Facilitator Script:**

"Okay, this is a completely different situation. Look at those red flags lighting up!

**Customer State:** ALL CAPS, multiple exclamation points, THREATENING actions (bank dispute, BBB report)

**The Issue:** $900 overcharge - this is SERIOUS

**AI's Draft:** Basically passing the buck to billing department

Let's be real - we can't send this response. Here's why:

**5-Question Framework:**

1. **Accuracy:** Response is technically correct but...❌
2. **Completeness:** Doesn't actually solve the problem ❌
3. **Tone:** Way too casual for this emergency ❌
4. **Clarity:** Clear but unhelpful ❌
5. **Risk:** 🚨🚨🚨 MULTIPLE RED FLAGS! 🚨🚨🚨
   - High-value issue ($900 refund) → Requires manager approval
   - Threats (bank dispute, BBB) → Requires manager awareness
   - Customer extremely angry → Needs immediate escalation
   - Technical issue (duplicate charging) → Engineering needs to investigate

**Decision:** This MUST be escalated. Not optional.

[Click "Escalate" button]

Let me show you how to write good escalation notes:

[Fill out escalation form live]

```
ESCALATION TYPE: High-Value Issue + Legal/Regulatory Threat

URGENCY: **URGENT** (15-minute SLA)

CUSTOMER: Michael Richards (michael@example.com)
CONVERSATION ID: #103
ORDER: #78901

ISSUE SUMMARY:
Customer charged 3× for same $450 order ($1,350 total instead of $450).
Triple charge confirmed in our system. Customer threatening:
1. Credit card dispute/chargeback
2. BBB report

Extremely angry (understandably so).

REASON FOR ESCALATION:
1. High-value refund ($900) requires manager approval
2. Multiple threats require manager awareness and personal outreach
3. Technical billing issue needs engineering investigation (why triple charge?)
4. Customer relationship at risk - good customer (15 orders, $2.1K lifetime value)

IMMEDIATE ACTIONS NEEDED:
1. MANAGER: Personal phone call to customer + expedited same-day refund
2. ENGINEERING: Investigate duplicate charging bug in checkout
3. COMPENSATION: Offer apology + store credit ($50-100) for hassle
4. TIMELINE: Same-day refund processing (not standard 5-7 days)

CUSTOMER CONTEXT:
- Order History: 15 orders, $2,100 lifetime value
- First major issue (good customer having bad experience)
- High urgency - needs immediate attention

SUGGESTED RESOLUTION:
Manager calls customer within 15 minutes, commits to same-day full refund,
offers $100 store credit, and personally apologizes. Engineering investigates
technical cause to prevent future occurrences.
```

[Click "Submit Escalation"]

**What Happens Next:**

- Manager gets immediate notification
- They see all my notes and context
- They'll call customer within 15 minutes
- I can move on to the next approval
- I'll get a follow-up on resolution for learning

**Key Point:** This is exactly what escalation is for. You're not expected to handle this alone. In fact, you SHOULDN'T handle this alone - it's outside your authority and needs special attention.

**Remember:** Escalating is good judgment, not weakness!"

---

## Hands-On Practice Exercises

### Exercise Packet for Attendees

**Instructions:**

- Work with your partner
- Take turns being "lead operator"
- Discuss your reasoning before deciding
- Ask facilitators questions anytime
- There's no time pressure - focus on learning

---

**Exercise 1: Build Confidence (EASY)**

**Scenario:**

```
Customer: Jen Walsh
Message: "Do you ship internationally? I want to send a gift to my friend in Canada."

AI Draft (97% confidence):
"Yes! We ship to Canada and 45+ other countries. Standard international shipping
is $15 flat rate and takes 7-14 business days. Express shipping available for $35
(3-5 business days). Add items to cart and select your country at checkout to see
exact shipping costs. Let me know if you have other questions!"

KB Sources:
- International Shipping Policy (v3.1) - 99% relevance
- Shipping FAQ (v2.0) - 94% relevance

Risk Level: Low
```

**Your Task:**

1. Apply the 5-Question Framework
2. Decide: Approve, Edit, Reject, or Escalate?
3. If editing, what would you change?

**Discussion Points:**

- Is the information accurate and complete?
- Is the tone appropriate?
- Would you send this as-is?

---

**Exercise 2: Add Warmth (MEDIUM)**

**Scenario:**

```
Customer: David Kim
Message: "Hi! I'm so excited about my order! When will it arrive? Order #55555"

AI Draft (88% confidence):
"Order #55555 shipped October 9 via USPS. Tracking number: 9400100000000000000000.
Expected delivery: October 13. Track at: [link]"

KB Sources:
- Shipping Policy (v2.1) - 95% relevance

Risk Level: Low
```

**Your Task:**

1. What's accurate but missing from this response?
2. How would you edit it to match the customer's enthusiastic tone?
3. Rewrite the response to be warmer and more engaging

**Discussion Points:**

- Does the AI's tone match the customer's excitement?
- What small changes make a big difference?
- How do you balance efficiency with personality?

---

**Exercise 3: Catch the Error (MEDIUM-HARD)**

**Scenario:**

```
Customer: Lisa Anderson
Message: "I bought this 3 weeks ago. Can I still return it if I changed my mind?"

AI Draft (82% confidence):
"Our return policy allows returns within 14 days of purchase for a full refund.
Since you purchased 3 weeks ago (21 days), this is outside our return window.
We're unable to accept returns after 14 days. See our full policy here: [link]"

KB Sources:
- Return Policy (v2.1) - 90% relevance

Risk Level: Low
```

**Your Task:**

1. Verify the information against the Return Policy
2. Is something wrong here?
3. What should you do if you find an error?

**HINT:** Check the actual Return Policy (v2.1) - it states 30 days, not 14 days!

**Discussion Points:**

- How do you verify information when confidence is high?
- What if you don't catch the error?
- How does your rejection help the system?

---

**Exercise 4: Ambiguous Question (HARD)**

**Scenario:**

```
Customer: Pat Johnson (no order history, new customer)
Message: "What about my thing?"

AI Draft (42% confidence):
"Thank you for contacting us. To better assist you, could you please provide
more details about your inquiry? For example, your order number, the product
you're asking about, or the specific issue you're experiencing? I'm here to help!"

KB Sources:
- (No relevant KB articles found)

Risk Level: Low
```

**Your Task:**

1. Is the AI's response appropriate?
2. Should you approve, edit, reject, or handle manually?
3. What's the best way to handle unclear customer messages?

**Discussion Points:**

- When is it okay to ask customers for clarification?
- Should every unclear message go through the approval queue?
- What's the right balance between AI handling and manual handling?

---

**Exercise 5: Policy Exception Request (MEDIUM-HARD)**

**Scenario:**

```
Customer: Emily Rodriguez
Message: "I bought this dress 6 weeks ago but was traveling internationally and
just got back. It still has all the tags on it and I haven't worn it. Can I please
return it even though it's been more than 30 days? I'm a long-time customer!"

AI Draft (79% confidence):
"Our return policy allows returns within 30 days of purchase. Your order was
placed 42 days ago, which is outside our standard return window. Unfortunately,
we're unable to accept returns after 30 days. We appreciate your understanding."

KB Sources:
- Return Policy (v2.1) - 95% relevance

Risk Level: Medium (policy exception request)

Customer Context:
- 12 previous orders
- $1,450 lifetime value
- No previous support issues
```

**Your Task:**

1. Is the AI's response accurate according to policy?
2. Should you approve this response?
3. What factors might influence your decision?
4. If escalating, what notes would you include?

**Discussion Points:**

- When do exceptions make business sense?
- Who has authority to approve exceptions?
- How do you balance policy consistency with customer loyalty?
- What information helps managers make exception decisions?

---

**Exercise 6: Angry Customer + High Value (HARD - URGENT)**

**Scenario:**

```
Customer: Robert Chen
Message: "THIS IS THE THIRD TIME I'VE CONTACTED YOU! My $500 order was supposed to
arrive last week for my presentation and it NEVER SHOWED UP. I've gotten zero help
from your team. This is completely unprofessional and I'm posting about this
experience on social media if I don't get an immediate refund and compensation!"

AI Draft (64% confidence):
"I apologize for the delay with your order. Let me look into the tracking
information and get back to you with an update."

KB Sources:
- Lost Package Policy (v1.5) - 70% relevance
- Refund Policy (v2.1) - 65% relevance

Risk Level: **HIGH** (angry customer, high value, threats, third contact)

Order Info:
- Order #99999, $500 value
- Shipped 10 days ago, tracking shows "in transit" but no updates for 5 days
- Customer has contacted twice before (tickets auto-closed without resolution!)
```

**Your Task:**

1. Why is the AI's response inadequate?
2. Should you approve, edit, or escalate?
3. If escalating, what urgency level and why?
4. Write comprehensive escalation notes

**Discussion Points:**

- What makes this urgent vs. standard?
- What should happen in the next 15 minutes?
- How could this situation have been prevented?
- What's at stake if we don't handle this correctly?

---

**Exercise 7: Technical Issue (HARD)**

**Scenario:**

```
Customer: Sarah Martinez
Message: "I've been trying to checkout for 2 hours and keep getting 'Error 500'
every time I click 'Place Order.' I've tried 3 different credit cards and 2 different
browsers (Chrome and Safari). My cart has 6 items worth about $350. What's going on?"

AI Draft (56% confidence):
"Please try clearing your browser cache and cookies, then attempt checkout again.
If the issue persists, try using an incognito/private browsing window. You can
also try a different device or contact your bank to ensure they're not blocking
the transaction."

KB Sources:
- Checkout Troubleshooting (v1.2) - 65% relevance
- Payment Issues FAQ (v1.0) - 58% relevance

Risk Level: High (technical issue, high cart value, customer frustration)
```

**Your Task:**

1. Is the AI's suggested troubleshooting appropriate?
2. What does "Error 500" typically indicate?
3. Who should handle this and why?
4. If escalating, what team needs this and what info do they need?

**Discussion Points:**

- When are technical issues operator-level vs. engineering-level?
- What's the urgency here?
- How do you balance helping the customer now vs. fixing the root cause?
- What information would engineering need to diagnose this?

---

**Exercise 8: Complex Multi-Part Question (VERY HARD - BONUS)**

**Scenario:**

```
Customer: James Wilson
Message: "Hi, I have several questions: 1) My order #44444 is showing as delivered
but I never received it - my apartment building has package theft issues. 2) I also
ordered the wrong size (Large instead of XL) on a different order #55555 that I did
receive. 3) Do you offer any protection against package theft? 4) Also, what's your
warranty policy on electronics? I'm thinking about buying your new wireless headphones
but want to make sure they're covered if they break."

AI Draft (71% confidence):
"I can help with your delivery and sizing concerns! For order #44444 that shows
delivered but you didn't receive, we'll need to file a claim with the carrier and
issue a replacement or refund. For order #55555 where you received the wrong size,
you can exchange it using our free exchange process here: [link]. We do offer
insurance for high-value items at checkout. Our electronics come with a 1-year
manufacturer warranty. Let me know if you'd like me to start processing the claim
for #44444!"

KB Sources:
- Lost Package Policy (v1.5) - 85% relevance
- Exchange Process (v1.3) - 88% relevance
- Insurance Options (v2.0) - 70% relevance
- Warranty Policy (v1.1) - 75% relevance

Risk Level: Medium (multiple issues, some high-value)

Customer Context:
- 8 previous orders, $750 lifetime value
- Lives in high-theft area (noted in account)
- No previous issues
```

**Your Task:**

1. Did the AI address all 4 questions?
2. Is the order of addressing issues logical?
3. Are there any policy considerations or approvals needed?
4. Would you approve, edit, escalate, or some combination?
5. What's your reasoning for your decision?

**Discussion Points:**

- How do you prioritize multiple customer issues?
- When do multiple small issues require escalation?
- How do you ensure nothing gets missed?
- Is one comprehensive response better, or should issues be handled separately?

---

## Q&A Facilitation Guide

### Anticipated Questions & Talking Points

**For Facilitators:** Prepare these answers in advance. Reference the full FAQ document for comprehensive answers.

---

**Q: "What if I approve something wrong?"**

**A:** First, everyone makes mistakes - especially when learning something new. Here's what happens:

- **Immediate:** If you catch it quickly, you can send a correction through Chatwoot
- **Quality Review:** Your approvals are reviewed weekly, but this is for coaching, not punishment
- **Learning Opportunity:** Mistakes help us improve training and documentation
- **System Learning:** Even mistakes teach the AI (what NOT to do)
- **Support Available:** Your manager and mentor are here to help you learn

**Key Message:** We're focused on continuous improvement, not perfection. Mistakes with good intent are learning opportunities.

---

**Q: "How accurate is the AI really?"**

**A:** Based on our pilot data:

- **High confidence (90-100%):** ~95% approved as-is or with minor edits
- **Medium confidence (70-89%):** ~75% approved after editing
- **Low confidence (<70%):** ~40% approved, often need major work or rejection

**But here's the important part:** YOU are the quality gate. The AI is a tool to help you, not a replacement for your judgment.

**Over Time:** The system gets better as it learns from your decisions. Accuracy improves week over week.

---

**Q: "Will this replace my job?"**

**A:** Absolutely not. This is about making your job better, not eliminating it. Here's how:

**Before Approval Queue:**

- 80% of time: Searching KB, copying policies, writing routine responses
- 20% of time: Complex problems, customer relationships, problem-solving

**With Approval Queue:**

- 20% of time: Reviewing AI drafts for routine issues
- 80% of time: Complex problems, relationship building, high-value work

**The Future:** Your role evolves from data entry to decision-making. That's a more rewarding, higher-value job.

**From Leadership:** We're investing in this to empower operators, not reduce headcount.

---

**Q: "How long will it take me to get comfortable with this?"**

**A:** Based on pilot data, here's the typical learning curve:

- **Week 1:** Supervised practice, slower than manual, lots of questions (normal!)
- **Week 2:** Starting to feel comfortable, speed increasing
- **Week 3:** Approaching or matching manual speed on routine items
- **Week 4+:** Faster than manual for routine items, more time for complex issues

**Individual Variation:** Everyone learns at their own pace. Some operators are comfortable in days, others take a few weeks. Both are okay!

**Support Available:** You'll have mentorship and support for as long as you need it.

---

**Q: "Can I still write responses manually?"**

**A:** Yes! You have flexibility:

- **Use approval queue** for straightforward items (order status, policy questions)
- **Handle manually in Chatwoot** for complex or emotionally sensitive situations
- **Hybrid approach** is totally fine, especially while learning

**Over Time:** Most operators naturally start preferring the approval queue for routine items because it frees up energy for cases where they add the most value.

**Choice:** We're not forcing a specific workflow - use the tools that help you provide the best customer experience.

---

**Q: "What happens to my performance metrics?"**

**A:** Your metrics evolve to reflect your new role:

**New Focus:**

- Decision quality (accuracy of approve/reject/escalate choices)
- Customer satisfaction (still #1!)
- First contact resolution
- Appropriate use of escalations

**Less Emphasis:**

- Raw response volume (less relevant with AI assistance)
- Time to first response (AI makes this instant)

**The Shift:** From "how fast can you type" to "how well can you make decisions."

**Evaluation:** You'll be measured on judgment quality, not typing speed.

---

**Q: "When should I escalate vs. try to figure it out myself?"**

**A:** Great question! Here's the clear guidance:

**ALWAYS Escalate (No Exceptions):**

- High-value issues (>$100 refunds/credits)
- Policy exception requests
- Angry customers with threats (legal, social media, BBB)
- Technical/system issues
- B2B/wholesale inquiries
- When you're unsure or uncomfortable

**Why Escalate:**

- Some things require special authority
- Better to ask than guess
- Protects you AND the customer
- Helps leadership identify patterns

**Target Rate:** 10-15% of your approvals should be escalations. If you're escalating 5%, you might be handling things you shouldn't. If you're escalating 30%, you might need more training (and that's okay!).

**Remember:** Escalating is good judgment, not a sign of weakness.

---

**Q: "How much time will I spend on the approval queue each day?"**

**A:** Based on early projections:

**Initial Rollout:**

- 15-20 approvals per day
- 1-3 minutes each
- 30 minutes to 1 hour total

**Steady State:**

- 30-50 approvals per day
- <2 minutes each as you get faster
- 1-2 hours total

**Rest of Shift:**

- Complex cases that require deep work
- Escalations and follow-ups
- Building customer relationships
- Special projects

**The Goal:** Approval queue handles the repetitive stuff so you can focus on the work that really matters.

---

**Q: "What if I disagree with a company policy the AI is correctly citing?"**

**A:** Important question with a clear process:

**In the Moment:**

1. Approve the response (apply current policy)
2. Send it (don't make customer wait)

**After:** 3. Document your concern 4. Bring feedback to weekly team meeting 5. Discuss with your manager in 1:1 6. Provide specific examples

**Why This Order:**

- Customers need consistent policy application
- Your feedback DOES matter and will be reviewed
- Policies are regularly revised based on operator insights
- But individual operators can't change policy mid-conversation

**From Our North Star:** "We regularly review policies based on operator insights." Your voice matters!

---

### How to Handle Difficult Questions

**If you don't know the answer:**

- "That's a great question and I want to give you an accurate answer. Let me check and get back to you."
- Take note, research after session, follow up via email/Slack

**If the question is about something broken or problematic:**

- "Thank you for raising that. We want this to work well for you."
- Acknowledge the concern
- Commit to addressing it
- Don't get defensive

**If someone is expressing fear or anxiety:**

- Validate their feelings ("That's totally understandable")
- Provide reassurance
- Connect them with additional support
- Follow up personally after the session

**If multiple people have the same question:**

- "I'm hearing this concern from several people - that's valuable feedback."
- Address it thoroughly
- Add it to the FAQ
- May indicate gap in training materials

---

## Success Metrics

### How to Evaluate the Dry-Run Session

**Immediate Metrics (During Session):**

✅ **Engagement:**

- All attendees actively participating
- Questions being asked freely
- Pairs working well together
- Body language shows interest (not confusion or frustration)

✅ **Comprehension:**

- Attendees successfully completing practice exercises
- Making appropriate approve/edit/escalate decisions
- Applying 5-Question Framework correctly
- Asking smart, specific questions

✅ **Confidence:**

- Attendees expressing readiness to try independently
- Less hesitation as session progresses
- Willingness to make mistakes and learn

**Post-Session Metrics:**

✅ **Survey Results (Target Scores):**

- Confidence using approval queue: **4+/5**
- Understanding of when to escalate: **4.5+/5**
- Clarity of training materials: **4+/5**
- Feeling of preparedness: **3.5+/5** (realistic to still have some nervousness)

✅ **Knowledge Assessment:**

- **80%+** correctly identify approve vs. escalate scenarios
- **75%+** can articulate the 5-Question Framework
- **85%+** understand confidence score meanings
- **90%+** know how to access help resources

✅ **Feedback Quality:**

- Constructive suggestions for improvement
- Specific examples of what helped learning
- Identification of remaining concerns
- Ideas for additional training needs

**4-Week Follow-Up Metrics:**

✅ **Adoption:**

- **70%+** operators using approval queue regularly
- **<20%** operators requesting to opt-out
- **15%+** escalation rate (appropriate judgment)

✅ **Performance:**

- **80%+** approval decisions deemed correct by QA
- **CSAT scores maintained or improved** (4.5+/5.0)
- **Avg approval time <3 minutes**

---

## Post-Session Actions

### Immediate Actions (Within 24 Hours)

**Facilitators:**

1. **Send Thank You & Survey**

   ```
   Subject: Thank You + Quick Feedback on Dry-Run Session

   Hi Team,

   Thank you for participating in today's Agent SDK dry-run session! Your
   engagement and questions were fantastic.

   Please take 5 minutes to complete this feedback survey: [link]
   Your input is crucial for improving the training.

   Key Takeaways from Today:
   - [Highlight 2-3 main points]

   Next Steps:
   - [What happens next]
   - [When they'll use this for real]
   - [Where to get help]

   Questions? Reply to this email or message me on Slack.

   Thanks again!
   ```

2. **Debrief with Facilitation Team**
   - What went well?
   - What was confusing?
   - What questions came up repeatedly?
   - What should we change for next time?

3. **Document Key Feedback**
   - Create summary of main concerns/questions
   - Identify training material gaps
   - Note any system issues discovered
   - List action items with owners

4. **Begin FAQ Updates**
   - Add new questions that came up
   - Clarify areas of confusion
   - Update examples if needed

---

### Week 1 After Session

**Enablement Team:**

1. **Analyze Survey Results**
   - Calculate confidence scores
   - Identify common themes
   - Spot outliers (very high or low confidence)
   - Compare pre/post confidence levels

2. **Update Training Materials**
   - Incorporate feedback into modules
   - Add clarifying examples
   - Expand sections that were confusing
   - Update FAQ with new questions

3. **Individual Follow-Ups**
   - Reach out to operators who expressed low confidence
   - Offer additional support or one-on-one coaching
   - Address specific concerns raised

4. **Share Results with Leadership**
   - Summary of session success
   - Key takeaways and feedback
   - Recommendations for next steps
   - Any concerns that need addressing

**Support Managers:**

1. **Check In with Your Team**
   - One-on-one conversations
   - Address individual concerns
   - Identify who needs extra support
   - Gather informal feedback

2. **Plan Ongoing Support**
   - Assign mentors/buddies
   - Schedule check-in cadence
   - Prepare for supervised practice period
   - Coordinate with senior support for escalation help

---

### Ongoing (Next 4 Weeks)

**Week 2: Supervised Practice**

- Operators handle approvals with supervision
- Daily check-ins
- Quick feedback loops
- Build confidence

**Week 3: Independent with Support**

- Operators work independently
- Support available on-demand
- Weekly team review sessions
- Celebrate wins

**Week 4: Fully Independent**

- Normal operations
- Standard escalation procedures
- Monthly training updates
- Continuous improvement

**Monthly:**

- Review metrics and feedback
- Update training materials
- Celebrate successes
- Address new concerns

---

## Appendix: Sample Slide Deck Outline

### Dry-Run Session Presentation (20-30 slides)

**Slide 1: Welcome**

- Title: "Agent SDK Approval Queue Dry-Run"
- Date, facilitators, session goals

**Slide 2: Agenda**

- Timeline overview
- What we'll cover
- How to participate

**Slide 3: Ground Rules**

- Safe learning space
- Ask questions anytime
- Practice without fear
- Feedback welcomed

**Slide 4: The "Why"**

- Operator-first design
- North Star principles
- Benefits for operators
- Benefits for customers

**Slide 5: System Overview**

- What is the approval queue?
- How does it work?
- Where does it fit in your workflow?

**Slide 6: The Human-in-the-Loop Model**

- AI suggests, you decide
- Your role is critical
- Quality gate
- Teaching the AI

**Slides 7-10: Live Demo Setup**

- Interface tour
- Confidence scores
- KB sources
- Risk indicators

**Slides 11-13: Demo Scenarios**

- One slide per demo scenario
- Screenshots of actual interface
- Walk-through notes

**Slide 14: The 5-Question Framework**

- Accuracy
- Completeness
- Tone
- Clarity
- Risk

**Slide 15: Decision Matrix**

- When to approve
- When to edit
- When to reject
- When to escalate

**Slides 16-18: Escalation Guide**

- Always escalate list
- SLA times
- How to write good escalation notes

**Slide 19: Practice Time!**

- Instructions for exercises
- Facilitators available to help
- No rush, focus on learning

**Slides 20-27: Practice Scenarios**

- One slide per scenario
- Include customer message
- AI draft
- Metadata

**Slide 28: Key Takeaways**

- You're always in control
- Trust but verify
- Escalate when unsure
- System learns from you

**Slide 29: Support Resources**

- Training materials links
- Who to contact
- Slack channels
- FAQ document

**Slide 30: Next Steps**

- What happens next
- Timeline to go live
- How to get help
- Thank you!

---

## Facilitator Checklist

### Day-Of Session Checklist

**2 Hours Before:**

- [ ] Room setup complete (or Zoom tested)
- [ ] All materials printed and organized
- [ ] Demo environment tested and working
- [ ] Presentation slides loaded and ready
- [ ] Backup laptop available (in case of tech issues)
- [ ] Attendee list confirmed
- [ ] Facilitator roles clear (primary, support, note-taker)

**30 Minutes Before:**

- [ ] Arrive early / join Zoom early
- [ ] Welcome early arrivals
- [ ] Final tech check
- [ ] Hand out materials
- [ ] Small talk to build comfort

**During Session:**

- [ ] Follow agenda timing
- [ ] Engage all attendees
- [ ] Encourage questions
- [ ] Note common confusions
- [ ] Adjust pacing as needed
- [ ] Capture feedback
- [ ] Stay positive and encouraging

**After Session:**

- [ ] Thank attendees
- [ ] Share survey link
- [ ] Capture hot-off-the-press feedback
- [ ] Facilitator debrief meeting
- [ ] Document lessons learned

---

**Session Guide Version:** 1.0  
**Last Updated:** 2025-10-11  
**Owner:** Enablement Team  
**Reviewed By:** Support Leadership, Product Team  
**Next Review:** After first dry-run session (feedback-based updates)

---

**Related Documents:**

- [Agent SDK Operator Training Module](./agent_sdk_operator_training_module.md)
- [Approval Queue Quick Start Guide](./approval_queue_quick_start.md)
- [Approval Queue FAQ](./approval_queue_faq.md)
- [Operator Training QA Template](../runbooks/operator_training_qa_template.md)

**Success Depends On:** Preparation, enthusiasm, flexibility, and genuine care for operator success!
