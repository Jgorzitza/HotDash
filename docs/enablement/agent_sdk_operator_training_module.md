# AI Collaboration Training - Working with Agent SDK

**Updated**: October 12, 2025 (Task 19 Enhancement)  
**Purpose**: Training operators to effectively work with AI-assisted features

# Agent SDK Operator Training Module: Approval Queue Workflow

**Document Type:** Operator Training Guide  
**Owner:** Enablement Team  
**Last Updated:** 2025-10-11  
**Version:** 1.0  
**Target Audience:** HotDash Support Operators  
**Training Duration:** 20-25 minutes  
**Prerequisites:** Completion of 4 Loom training modules (18m 25s total)

---

## Table of Contents

1. [Learning Objectives](#learning-objectives)
2. [What is the Agent SDK Approval Queue?](#what-is-the-agent-sdk-approval-queue)
3. [Understanding Agent Proposals](#understanding-agent-proposals)
4. [The Approval Queue Interface](#the-approval-queue-interface)
5. [Decision-Making Framework: Approve vs Reject](#decision-making-framework)
6. [Step-by-Step Approval Workflow](#step-by-step-approval-workflow)
7. [Common Scenarios & Examples](#common-scenarios--examples)
8. [Best Practices & Tips](#best-practices--tips)
9. [Troubleshooting & Escalation](#troubleshooting--escalation)
10. [Practice Exercises](#practice-exercises)
11. [Quick Reference Checklist](#quick-reference-checklist)

---

## Learning Objectives

By the end of this training module, you will be able to:

- ✅ Understand what the Agent SDK approval queue is and why it exists
- ✅ Navigate the approval queue interface confidently
- ✅ Interpret agent confidence scores and knowledge base sources
- ✅ Make informed approve/reject decisions using our decision framework
- ✅ Edit agent-prepared responses when necessary
- ✅ Escalate complex cases appropriately
- ✅ Contribute to the AI learning loop through your decisions

---

## What is the Agent SDK Approval Queue?

### Overview

The Agent SDK approval queue is a **human-in-the-loop** system where AI agents prepare work (like customer responses) and operators review and approve that work before it's sent.

**Key Principle from our North Star:**  
> "Automation should augment human capability, not replace human judgment. Operators should spend their time on high-value interactions, not repetitive tasks."

### How It Works

```
Customer Inquiry → AI Agent Analysis → Knowledge Base Retrieval → Draft Response
                                                                      ↓
                                 Operator Approval ← Approval Queue ←
                                        ↓
                           Customer Response + System Learning
```

###Why We Use This Approach

**Benefits for Operators:**
- ⚡ **Faster Response Times** - AI does the initial research and drafting
- 🎯 **Higher Quality** - You focus on judgment, not information hunting
- 📚 **Consistent Knowledge** - AI uses verified knowledge base articles
- 🧠 **Continuous Learning** - System improves based on your decisions
- 💪 **Operator Control** - You always have final say

**Benefits for Customers:**
- Faster, more accurate responses
- Consistent quality across all interactions
- Access to complete knowledge base through AI-powered search

---

## Understanding Agent Proposals

### Anatomy of an Agent Proposal

Every item in the approval queue contains:

1. **Customer Context**
   - Customer name and conversation ID
   - Original message from customer
   - Previous interaction history (if available)
   - Order or account information

2. **Agent Analysis**
   - Agent name (e.g., "Order Support Agent")
   - Proposed action (e.g., "chatwoot_send_public_reply")
   - Confidence score (0-100%)
   - Timestamp (how long it's been pending)

3. **Draft Response**
   - AI-prepared response to customer
   - Preview of what would be sent
   - Tool parameters (technical details)

4. **Knowledge Base Sources**
   - List of KB articles the agent used
   - Version numbers and relevance scores
   - Links to full articles for verification

5. **Risk Assessment**
   - Risk level: Low, Medium, or High
   - Explanation of risk factors

### Understanding Confidence Scores

Confidence scores help you prioritize your review effort:

| Score Range | Level | What It Means | Your Action |
|-------------|-------|---------------|-------------|
| **90-100%** | **High** | Strong KB match, clear question, complete context | Quick review, usually safe to approve |
| **70-89%** | **Medium** | Good KB match, may need refinement | Careful review, likely needs minor edits |
| **50-69%** | **Low** | Uncertain match, gaps in knowledge | Extra scrutiny, often requires editing |
| **<50%** | **Very Low** | Poor match or unclear question | Often better to write from scratch |

**Important:** Confidence scores are a guide, not a rule. Always use your judgment!

---

## The Approval Queue Interface

### Queue Overview Screen

```
┌───────────────────────────────────────────────────────────────┐
│ Approval Queue                                   🔔 3 Pending │
├───────────────────────────────────────────────────────────────┤
│ [All Agents ▾]  [All Tools ▾]  [Risk: All ▾]  [🔍 Search]   │
├───────────────────────────────────────────────────────────────┤
│ Pending: 3    Approved (24h): 12    Rejected (24h): 2        │
│ Avg Response Time: 3.2 min    Oldest Pending: 5 min ago      │
└───────────────────────────────────────────────────────────────┘
```

### Individual Approval Card

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Agent Proposal · Pending                        [×] │
├─────────────────────────────────────────────────────────┤
│ Conversation: #101 — Jamie Lee                         │
│ Proposed Action: chatwoot_send_public_reply            │
│ Agent: Order Support Agent                             │
│ Timestamp: 2 minutes ago                               │
│ Confidence: 85% (Medium)                               │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ "Hi Jamie, thanks for your patience. We're     │   │
│ │  expediting your order update now."            │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Knowledge Base Sources:                                │
│ • Shipping Policy (v2.1) - 92% relevance              │
│ • Order Tracking Guide - 87% relevance                │
│                                                         │
│ Risk Assessment: Low (read-only approved)              │
│                                                         │
│ [✓ Approve & Execute]  [✏️ Edit]  [✕ Reject]          │
└─────────────────────────────────────────────────────────┘
```

### Navigation Tips

- **Queue automatically refreshes** every 5 seconds
- **Oldest items appear first** (based on customer wait time)
- **High-risk items flagged** with red badge
- **Filter by agent, tool, or risk level** to focus your work
- **Search by conversation ID** to find specific items

---

## Decision-Making Framework: Approve vs Reject

### The 5-Question Review Framework

Ask yourself these 5 questions for every approval:

#### 1. **Accuracy Check** ✅
> "Is all information correct and up-to-date?"

- Verify facts against KB sources
- Check order numbers, dates, amounts
- Confirm policy details are current

**Red Flags:**
- Information contradicts KB articles
- Outdated policy referenced
- Wrong customer or order details

#### 2. **Completeness Check** ✅
> "Does this answer all of the customer's questions?"

- Review original customer message
- Ensure all questions addressed
- Check for implied questions

**Red Flags:**
- Customer asked multiple questions, only one answered
- Missing context that customer needs
- No clear next steps provided

#### 3. **Tone Check** ✅
> "Is the tone friendly, professional, and empathetic?"

- Should sound like a human, not a robot
- Appropriate level of empathy for situation
- Matches HotDash brand voice

**Red Flags:**
- Too formal ("Dear Sir/Madam")
- Too casual or unprofessional
- Lacks empathy for customer frustration
- Robotic or generic phrasing

#### 4. **Clarity Check** ✅
> "Will the customer understand this response?"

- Simple language, no jargon
- Clear action items
- Easy to follow instructions

**Red Flags:**
- Technical terms not explained
- Confusing sentence structure
- Unclear next steps

#### 5. **Risk Check** ⚠️
> "Are there any risks to sending this as-is?"

- External communication risk
- Policy exception needs
- High-value issues
- Angry customer handling

**Red Flags:**
- High-value refund without approval
- Policy exception not flagged
- Threatening customer not escalated
- Irreversible action without verification

### Decision Matrix

| Assessment | Decision | Action |
|-----------|----------|---------|
| ✅✅✅✅✅ All checks pass | **APPROVE** | Click "Approve & Execute" |
| ✅✅✅✅⚠️ Minor tone/clarity issues | **EDIT & APPROVE** | Make quick edits, then approve |
| ✅❌ Missing information | **EDIT & APPROVE** | Add missing details, then approve |
| ❌ Factual errors | **REJECT** | Discard and write from scratch |
| ⚠️⚠️ Multiple risk flags | **ESCALATE** | Send to senior support/manager |
| ❓ You're unsure | **ESCALATE** | Better safe than sorry |

---

## Step-by-Step Approval Workflow

### Workflow 1: Standard Approval (90% of cases)

**Time Target:** 1-2 minutes

1. **Open the approval card** from the queue
2. **Read customer's original message** carefully
3. **Review agent's confidence score**
   - High (90-100%): Quick review mode
   - Medium (70-89%): Careful review mode
   - Low (<70%): Extra scrutiny mode
4. **Read the draft response** completely
5. **Check knowledge base sources**
   - Click to verify information if needed
   - Confirm versions are current
6. **Apply the 5-Question Framework**
   - Accuracy ✅
   - Completeness ✅
   - Tone ✅
   - Clarity ✅
   - Risk ✅
7. **Click "Approve & Execute"**
8. **Response sent automatically** + you move to next item

**What Happens Next:**
- Customer receives response immediately
- Agent learns that this approach was correct
- Your approval is logged for quality tracking

### Workflow 2: Edit Before Approval (8% of cases)

**Time Target:** 2-4 minutes

1. **Follow steps 1-6** from Workflow 1
2. **Identify specific issues** that need fixing
3. **Click "Edit"** button
4. **Make your changes** in the text area
   - Add greeting if missing
   - Adjust tone for empathy
   - Add specific details (amounts, dates)
   - Clarify confusing sections
5. **Review your edits** for accuracy
6. **Click "Approve & Execute"**

**What Happens Next:**
- Customer receives your edited version
- Agent learns from your improvements
- System adjusts future responses accordingly

**Common Edit Types:**

| Issue | Before (Agent Draft) | After (Your Edit) |
|-------|---------------------|-------------------|
| Missing greeting | "Your order shipped on Oct 8." | "Hi Sarah! Great news - your order shipped on Oct 8." |
| Too generic | "See our return policy here: [link]" | "I'd be happy to help with a return! Here's our simple process: [link]" |
| Lacks specificity | "The refund takes 5-7 business days." | "Your refund of $45.99 will appear in 5-7 business days." |
| Too formal | "We have received your inquiry." | "Thanks for reaching out! I've looked into this for you." |

### Workflow 3: Rejection (1-2% of cases)

**Time Target:** 5-10 minutes (includes writing your response)

**When to Reject:**
- Draft completely misunderstands customer question
- Information is factually incorrect
- Tone is inappropriate or offensive
- Draft contradicts current policy
- You can write better response faster than editing

**Steps:**
1. **Click "Reject"** button
2. **Add rejection notes** (required for learning)
   ```
   Example: "Draft addressed shipping question but customer 
   asked about returns. Refund policy cited was outdated 
   (referenced 14 days, current policy is 30 days)."
   ```
3. **Write your own response** using KB resources
4. **Send through Chatwoot** directly
5. **Move to next approval**

**What Happens Next:**
- Agent learns this approach didn't work
- Your notes help improve future performance
- Quality team may review for KB gaps

### Workflow 4: Escalation (5-8% of cases)

**Time Target:** 3-5 minutes

**When to Escalate:**

| Scenario | Escalate To | SLA |
|----------|-------------|-----|
| Policy exception needed (return outside 30-day window) | Senior Support | 2 hours |
| High-value issue (refund >$100) | Manager | 4 hours |
| Angry customer with threats (legal, social media) | Manager | 15 min (urgent) |
| Technical issue (website bug, payment error) | Engineering | 1 hour |
| You're not confident in the right answer | Senior Support | 2 hours |
| Agent confidence <70% and you agree it's unclear | Senior Support | 2 hours |

**Escalation Steps:**
1. **Click "Escalate"** button
2. **Select escalation reason** from dropdown
3. **Add detailed notes**:
   ```
   ESCALATION: Policy Exception

   Customer: Jane Smith (jane@example.com)
   Order: #12345

   ISSUE SUMMARY:
   Customer wants to return dress purchased 45 days ago. 
   Our policy is 30 days. She was traveling, item still has tags.

   REASON FOR ESCALATION:
   Requires manager approval for outside-window return.

   CUSTOMER CONTEXT:
   - Order History: 12 orders, $1,450 lifetime value
   - First time contacting support
   - Polite and understanding

   SUGGESTED RESOLUTION:
   Recommend approving given loyalty and valid reason.

   URGENCY: Standard
   ```
4. **Click "Submit Escalation"**
5. **System notifies** appropriate person automatically

**What Happens Next:**
- Senior support/manager receives notification
- They'll respond within SLA timeframe
- You can move to next approval
- Original customer inquiry stays in Chatwoot

---

## Common Scenarios & Examples

### Scenario 1: Order Status Inquiry (High Confidence)

**Customer Message:**
> "Hi, I ordered last week and haven't received tracking info. Order #12345"

**Agent Draft (Confidence: 92%):**
> "Hi John, I've looked up your order #12345. It shipped on Oct 8 via USPS. Tracking: 1234567890123. Expected delivery: Oct 13. Here's the tracking link: [link]. Let me know if you need anything else!"

**KB Sources:**
- Shipping Policy (v2.1) - 95% relevance
- Order Tracking Guide - 90% relevance

**Risk Level:** Low

**Your Decision:** **APPROVE** ✅
- ✅ Accurate: Order info verified
- ✅ Complete: All questions answered
- ✅ Tone: Friendly and helpful
- ✅ Clarity: Clear information
- ✅ Risk: Low, standard response

**Action:** Click "Approve & Execute"

---

### Scenario 2: Refund Request (Medium Confidence - Needs Edit)

**Customer Message:**
> "I received the wrong item and I want a refund immediately!"

**Agent Draft (Confidence: 78%):**
> "Your order #67890 can be returned per our return policy. Here's the return label: [link]. Refund will be processed in 5-7 business days after we receive the item."

**KB Sources:**
- Return Policy (v2.1) - 85% relevance
- Refund Process - 80% relevance

**Risk Level:** Medium (customer frustrated)

**Your Assessment:**
- ✅ Accurate: Info is correct
- ⚠️ Complete: Missing acknowledgment of error
- ❌ Tone: Too transactional, lacks empathy
- ✅ Clarity: Instructions clear
- ⚠️ Risk: Frustrated customer needs empathy

**Your Decision:** **EDIT & APPROVE** ✏️

**Your Edit:**
> "Hi Sarah, I'm so sorry we sent the wrong item! That's frustrating and we want to make it right immediately.
> 
> I've generated a free return label here: [link]. As soon as we receive the wrong item, we'll process your full refund of $45.99 within 1-2 business days (not the standard 5-7).
>
> Would you also like us to send the correct item, or would you prefer just the refund?
>
> Again, my apologies for this mixup. We'll get this sorted out right away!"

**What You Changed:**
- Added empathy and acknowledgment of error
- Expedited refund timeline to show urgency
- Offered proactive solution (correct item)
- Used customer's name
- Apologized explicitly

**Action:** Click "Approve & Execute" after editing

---

### Scenario 3: Complex Technical Issue (Low Confidence - Escalate)

**Customer Message:**
> "I've been trying to checkout for 2 hours and keep getting error code 500. I've tried 3 different cards and 2 browsers. This is ridiculous! Fix your site or I'm taking my business elsewhere and posting about this on Twitter."

**Agent Draft (Confidence: 45%):**
> "Please try clearing your browser cache and cookies. If the problem persists, contact our technical support team."

**KB Sources:**
- Payment Troubleshooting - 60% relevance
- Error Codes Guide - 55% relevance

**Risk Level:** High (technical issue + angry customer + social media threat)

**Your Assessment:**
- ❌ Accuracy: Generic troubleshooting, doesn't address error 500
- ❌ Complete: Doesn't acknowledge frustration or urgency
- ❌ Tone: Dismissive, unhelpful
- ✅ Clarity: Clear but inadequate
- ⚠️⚠️ Risk: Multiple risk factors (technical, angry, threat)

**Your Decision:** **ESCALATE** ⚠️

**Escalation Notes:**
```
ESCALATION: Technical Issue + Legal/Social Threat

Customer: Mike Jones (mike@example.com)
Cart: [items totaling $450]

ISSUE SUMMARY:
Customer experiencing persistent error 500 during checkout for 2 hours. 
Tried 3 cards, 2 browsers. Threatening to leave and post on Twitter.

REASON FOR ESCALATION:
1. Technical issue (error 500 = server error, not user error)
2. Social media threat requires manager awareness
3. High cart value ($450)
4. Agent's suggested response inadequate

CUSTOMER CONTEXT:
- New customer (first purchase attempt)
- Extremely frustrated (understandable given 2-hour effort)
- High-value cart

IMMEDIATE ACTIONS NEEDED:
1. Engineering: Investigate error 500 checkout issues
2. Manager: Personal outreach + store credit for hassle
3. Check logs for cart ID to preserve items

URGENCY: URGENT (15-minute SLA due to social media threat)
```

**Action:** Click "Escalate" → Select "Technical Issue + Angry Customer"

---

### Scenario 4: Policy Exception Request (Escalate)

**Customer Message:**
> "I bought this 6 weeks ago but was out of the country. Just got back and want to return it. Still has tags! Can you make an exception?"

**Agent Draft (Confidence: 82%):**
> "Our return policy is 30 days from purchase. Unfortunately, your order from 6 weeks ago is outside our return window. We're unable to accept returns after 30 days."

**KB Sources:**
- Return Policy (v2.1) - 95% relevance

**Risk Level:** Medium

**Your Assessment:**
- ✅ Accurate: Policy correctly stated
- ✅ Complete: Addresses question
- ⚠️ Tone: A bit rigid, could be more empathetic
- ✅ Clarity: Clear explanation
- ⚠️ Risk: Policy exception requires manager approval

**Your Decision:** **ESCALATE** ⚠️

**Why:** Even though the draft is accurate, policy exceptions require manager approval per our North Star principle of empowering operators while maintaining appropriate controls.

**Escalation Notes:**
```
ESCALATION: Return Outside Window

Customer: Lisa Chen (lisa@example.com)
Order: #45678 (purchased 42 days ago)

ISSUE SUMMARY:
Customer requests return exception. Item purchased 6 weeks ago, 
but customer was traveling. Item still has tags (unused).

REASON FOR ESCALATION:
Requires manager approval to accept return outside 30-day policy window.

CUSTOMER CONTEXT:
- Order History: 8 orders, $980 lifetime value
- No previous support issues
- Polite tone, reasonable explanation

SUGGESTED RESOLUTION:
Recommend approving exception given:
1. Customer loyalty (8 orders)
2. Valid explanation (travel)
3. Item unused (still has tags)
4. Goodwill opportunity

URGENCY: Standard
```

**Action:** Click "Escalate" → Select "Policy Exception Needed"

---

## Best Practices & Tips

### 🎯 Do's

#### 1. **Trust the AI, But Verify**
- AI is a tool to help you, not replace your judgment
- Always read the full draft before approving
- Check KB sources when something feels off

#### 2. **Focus on the Customer Experience**
- Ask: "If I received this response, would I be satisfied?"
- Ensure empathy for frustrated customers
- Verify all questions are answered

#### 3. **Maintain Quality Over Speed**
- Our North Star: "Response Quality Over Speed"
- Target times are goals, not hard rules
- Better to take an extra minute than send a bad response

#### 4. **Edit Freely**
- Small edits help the system learn your preferences
- Don't be afraid to add warmth or specificity
- Your writing style teaches the AI

#### 5. **Escalate When Unsure**
- Better to escalate than guess
- No penalty for appropriate escalations
- Asking for help is a strength, not a weakness

#### 6. **Use Keyboard Shortcuts** (coming soon)
- Tab through approvals
- Ctrl+A to approve (in development)
- Ctrl+E to edit (in development)

#### 7. **Provide Detailed Rejection Notes**
- Helps AI improve for next time
- Identifies KB gaps
- Supports quality improvement

### ❌ Don'ts

#### 1. **Don't Blindly Approve High Confidence Scores**
- Confidence isn't a guarantee
- Always apply the 5-Question Framework
- Your judgment > AI confidence

#### 2. **Don't Guess on Policy Questions**
- If unsure, check KB or escalate
- Policies change, verify current version
- Better safe than wrong

#### 3. **Don't Send Responses You Wouldn't Want to Receive**
- If tone feels off, fix it
- If information seems incomplete, add to it
- If you'd be confused, the customer will be too

#### 4. **Don't Handle High-Risk Items Without Proper Authority**
- Large refunds require manager approval
- Policy exceptions need senior support
- Threats (legal, social) need manager attention

#### 5. **Don't Ignore Red Flags**
- Trust your instincts
- Multiple small issues = big problem
- When in doubt, escalate or reject

#### 6. **Don't Forget the Human Behind the Message**
- Every approval represents a real person
- Show empathy, especially for frustrated customers
- Treat customers how you'd want to be treated

---

## Troubleshooting & Escalation

### Common Issues & Solutions

#### Issue 1: "The draft doesn't match the customer's question"

**Symptoms:**
- Customer asks about returns, draft talks about shipping
- Customer wants refund, draft offers exchange
- Clear disconnect between question and answer

**Solution:** **REJECT**
- Write your own response from scratch
- Note the mismatch in rejection comments
- Example: "Draft addressed shipping when customer asked about returns"

---

#### Issue 2: "The confidence score is high but the response feels off"

**Symptoms:**
- 90%+ confidence but something doesn't seem right
- Information looks correct but tone is wrong
- Gut feeling that this isn't right

**Solution:** **TRUST YOUR INSTINCT**
- Re-read customer message carefully
- Check KB sources manually
- If still unsure, escalate with notes
- Example: "High confidence but customer tone suggests urgency not reflected in draft"

---

#### Issue 3: "I can't find the KB article referenced"

**Symptoms:**
- KB source link is broken
- Article version doesn't exist
- Can't verify information

**Solution:** **ESCALATE**
- Tag as "KB Issue" in escalation
- Include which article/version is problematic
- Someone will update the KB
- Write manual response or get guidance from senior support

---

#### Issue 4: "Customer is asking for something not in our KB"

**Symptoms:**
- New type of question we haven't seen
- Policy gap or ambiguity
- No relevant KB articles found

**Solution:** **ESCALATE**
- Note "Missing KB Article" in escalation
- Describe what information is needed
- Senior support will guide you
- New KB article will be created

---

#### Issue 5: "The queue is empty but customers are waiting in Chatwoot"

**Symptoms:**
- Nothing in approval queue
- Active conversations in Chatwoot
- Agents not generating proposals

**Solution:** **HANDLE DIRECTLY IN CHATWOOT**
- Switch to manual mode
- Respond using KB resources
- Use standard templates
- Report issue to technical team via Slack #support-questions

---

#### Issue 6: "Agent keeps sending similar bad drafts"

**Symptoms:**
- Same type of error repeatedly
- Pattern of poor responses
- Consistent tone or accuracy issues

**Solution:** **DOCUMENT & REPORT**
- Continue rejecting with detailed notes
- Track pattern over 3-5 instances
- Report to support lead via Slack
- System may need training adjustment

---

###When to Escalate: Quick Decision Tree

```
┌─────────────────────────────────────┐
│ Can I answer this with confidence? │
└─────────┬───────────────────────────┘
          │
    NO ──→│ ESCALATE TO SENIOR SUPPORT
          │
    YES ──→ ┌───────────────────────────────────┐
            │ Does it require special approval? │
            └───────┬───────────────────────────┘
                    │
              YES ──→│ ESCALATE TO MANAGER/SENIOR
                    │
              NO ───→ ┌─────────────────────────────┐
                      │ Is the customer threatening │
                      │ or extremely angry?         │
                      └──────┬──────────────────────┘
                             │
                       YES ──→│ ESCALATE TO MANAGER
                             │
                       NO ───→ ┌──────────────────────────────┐
                               │ Is this a technical issue?   │
                               └──────┬───────────────────────┘
                                      │
                                YES ──→│ ESCALATE TO ENGINEERING
                                      │
                                NO ───→ APPROVE / EDIT & APPROVE
```

---

## Practice Exercises

### Exercise 1: Standard Approval Decision

**Scenario:**
```
Customer Message:
"Where is my order? #12345"

Agent Draft (Confidence: 95%):
"Hi Susan! Your order #12345 shipped yesterday via FedEx. 
Tracking: 123456789. Should arrive by Oct 15. Track here: [link]"

KB Sources:
- Shipping Policy (v2.1) - 98% relevance

Risk Level: Low
```

**Your Task:**
1. Apply the 5-Question Framework
2. Decide: Approve, Edit, Reject, or Escalate?
3. If Edit, what changes would you make?

**Answer:**
<details>
<summary>Click to reveal answer</summary>

**Decision:** APPROVE ✅

**Reasoning:**
- ✅ Accurate: Order info, tracking, delivery date
- ✅ Complete: Answers the question fully
- ✅ Tone: Friendly greeting, helpful
- ✅ Clarity: Simple, clear information
- ✅ Risk: Low, standard order status

**Action:** Click "Approve & Execute"

**Note:** Could add "Let me know if you need anything else!" but current version is sufficient for a straightforward query.
</details>

---

### Exercise 2: Needs Editing

**Scenario:**
```
Customer Message:
"I got the wrong color! Ordered blue, got red. Need this fixed ASAP for my event this Saturday!"

Agent Draft (Confidence: 75%):
"You can return the item using our return policy. Return label: [link]. 
Refund processed in 5-7 business days after receipt."

KB Sources:
- Return Policy (v2.1) - 85% relevance
- Exchange Process - 72% relevance

Risk Level: Medium
```

**Your Task:**
1. Apply the 5-Question Framework
2. Identify what's missing or wrong
3. Write your edited version

**Answer:**
<details>
<summary>Click to reveal answer</summary>

**Decision:** EDIT & APPROVE ✏️

**Issues Identified:**
- ❌ Tone: No empathy or acknowledgment of error
- ❌ Complete: Doesn't address urgency (Saturday event)
- ❌ Complete: Doesn't offer exchange option
- ⚠️ Risk: Frustrated customer needs special handling

**Edited Version:**
```
Hi Alex,

I'm so sorry we sent the wrong color! I completely understand you need this 
for your event on Saturday, so let's get this fixed right away.

Here's what we can do:

OPTION 1 - EXCHANGE (FASTEST):
I'll ship the blue one TODAY with expedited shipping (arrives Thursday). 
Return the red one with this prepaid label: [link]. No charge for expedited shipping.

OPTION 2 - REFUND:
Full refund processed within 24 hours of our receipt. Return label: [link]

Which works best for you? I'll make it happen immediately!

Again, my apologies for this mixup.

Best,
[Your Name]
```

**Why This Is Better:**
- Acknowledges error and urgency
- Offers proactive solution (expedited exchange)
- Gives customer control (2 options)
- Commits to timeline that meets event deadline
- Shows empathy and ownership
</details>

---

### Exercise 3: Escalation Decision

**Scenario:**
```
Customer Message:
"Your app charged me 3 times for the same order! $450 × 3 = $1,350 on my credit card! 
I need this fixed NOW or I'm disputing with my bank and reporting you to the BBB!"

Agent Draft (Confidence: 68%):
"Please contact our billing department at billing@example.com. 
They can review charges and process refunds."

KB Sources:
- Billing Issues (v1.8) - 70% relevance
- Refund Policy (v2.1) - 65% relevance

Risk Level: High
```

**Your Task:**
1. Should you Approve, Edit, Reject, or Escalate?
2. If Escalate, write your escalation notes
3. What urgency level?

**Answer:**
<details>
<summary>Click to reveal answer</summary>

**Decision:** ESCALATE ⚠️⚠️⚠️

**Why:**
- ⚠️ High-value issue ($900 overcharge)
- ⚠️ Threatened actions (bank dispute, BBB report)
- ⚠️ Technical issue (duplicate charging)
- ⚠️ Extremely frustrated customer
- ❌ Agent's response inadequate (passes buck to billing)

**Escalation Notes:**
```
ESCALATION: HIGH-VALUE BILLING ERROR + MULTIPLE THREATS

Customer: Tom Richards (tom@example.com)
Order: #78901

ISSUE SUMMARY:
Customer charged 3× for same $450 order = $1,350 total. Should be $450.
Threatening:
1. Credit card dispute
2. BBB report
Needs immediate resolution.

REASON FOR ESCALATION:
1. High-value refund ($900) requires manager approval
2. Multiple threats require manager awareness
3. Technical billing issue needs engineering investigation
4. Customer extremely angry (justified)

CUSTOMER CONTEXT:
- Order History: 15 orders, $2,100 lifetime value
- Good customer, first major issue
- High urgency

IMMEDIATE ACTIONS NEEDED:
1. Manager: Personal call to customer + expedited full refund ($900)
2. Engineering: Investigate duplicate charging bug
3. Offer: Apology + store credit for inconvenience ($50-100)
4. Timeline: Same-day refund processing (not 5-7 days)

URGENCY: **URGENT** (15-minute SLA)
```

**Action:** Click "Escalate" → Select "High-Value Issue + Legal Threat"
</details>

---

### Exercise 4: Complex Policy Question

**Scenario:**
```
Customer Message:
"I'm a wholesale buyer. Can I return 50 units if they don't sell? 
I see your return policy says 30 days, but does that apply to bulk orders?"

Agent Draft (Confidence: 55%):
"Our standard return policy is 30 days for all purchases. 
See full policy here: [link]"

KB Sources:
- Return Policy (v2.1) - 80% relevance
- (No wholesale policy article found)

Risk Level: Medium
```

**Your Task:**
1. What should you do?
2. Why is this a special case?
3. Write your response/notes

**Answer:**
<details>
<summary>Click to reveal answer</summary>

**Decision:** ESCALATE ⚠️

**Why:**
- This is a B2B inquiry (wholesale), not standard retail
- KB lacks wholesale policy information
- 50 units = high value, likely needs special terms
- Agent draft is inadequate (treats as retail)
- You're not authorized to negotiate bulk terms

**Escalation Notes:**
```
ESCALATION: B2B/Wholesale Inquiry

Customer: Jennifer Martinez (jennifer@example.com)
Inquiry: Bulk order of 50 units with return terms

ISSUE SUMMARY:
Customer is wholesale buyer asking about return policy for 50-unit order.
Specifically asking if standard 30-day policy applies to bulk orders.

REASON FOR ESCALATION:
1. B2B inquiry requires sales team involvement
2. No wholesale return policy in KB
3. Bulk order terms need special negotiation
4. Outside standard operator authority

CUSTOMER CONTEXT:
- Identified as wholesale buyer
- Potential high-value customer
- Professional inquiry

SUGGESTED ROUTING:
Route to Sales Team (B2B specialist)

URGENCY: Standard (but don't delay - sales opportunity)
```

**Action:** Click "Escalate" → Select "B2B Inquiry" → Route to Sales Team

**What NOT To Do:**
- Don't approve agent's generic response
- Don't guess at wholesale policies
- Don't promise return terms you can't authorize
</details>

---

## Quick Reference Checklist

### Before Approving Any Response

```
□ I've read the customer's full original message
□ I've read the entire draft response
□ I've checked the confidence score
□ I've reviewed KB sources if confidence < 90%
□ I've applied the 5-Question Framework:
   □ Accuracy: Information is correct
   □ Completeness: All questions answered
   □ Tone: Friendly, professional, empathetic
   □ Clarity: Customer will understand
   □ Risk: No red flags or special approvals needed
□ If editing: My changes improve customer experience
□ If rejecting: I've written clear notes for AI learning
□ If escalating: I've included detailed notes and context
```

### Decision Quick Reference

| If... | Then... |
|-------|---------|
| All 5 checks pass | **APPROVE** ✅ |
| Minor tone/clarity issues | **EDIT & APPROVE** ✏️ |
| Missing information, easy to add | **EDIT & APPROVE** ✏️ |
| Factual errors | **REJECT** ❌ |
| Complete misunderstanding | **REJECT** ❌ |
| Policy exception needed | **ESCALATE** ⚠️ |
| High-value issue | **ESCALATE** ⚠️ |
| Angry customer with threats | **ESCALATE** ⚠️ |
| Technical issue | **ESCALATE** ⚠️ |
| You're unsure | **ESCALATE** ⚠️ |

### Escalation SLAs

| Type | Who | Response Time |
|------|-----|---------------|
| Policy exception | Senior Support | 2 hours |
| High value ($100+) | Manager | 4 hours |
| Legal/social threat | Manager | 15 minutes |
| Technical issue | Engineering | 1 hour |
| Need guidance | Senior Support | 2 hours |

---

## Next Steps

### After Completing This Training

1. ✅ **Complete Practice Exercises** (above)
2. ✅ **Shadow experienced operator** for 1-2 hours
3. ✅ **Review real approval queue** with supervisor
4. ✅ **Handle 5 supervised approvals**
5. ✅ **Get feedback** on your decisions
6. ✅ **Begin independent operation** (with support available)

### Ongoing Development

- **Weekly Team Knowledge Sharing** - Friday, 30 minutes
  - Review interesting/complex approvals
  - Share learnings and best practices
  - Q&A with senior support

- **Monthly QA Reviews** - Your responses audited for quality
  - Feedback on approval decisions
  - Coaching opportunities
  - Celebrate excellent work

- **KB Updates** - Read updates within 24 hours
  - New policies
  - Product changes
  - Common issues documented

### Support Resources

**Questions During Your Shift:**
- **#support-questions** (Slack) - Quick questions
- **Senior Support** - Escalations and guidance
- **Your mentor** - Training support

**Reference Materials:**
- **Knowledge Base** - [Internal Link]
- **Approval Queue** - [Internal Link]
- **This training guide** - Bookmark for quick reference

---

## Success Metrics

You're doing well when:

- ✅ **Approval Rate 70%+** - Means AI is learning your preferences
- ✅ **Avg Review Time <3 min** - Balancing speed with quality
- ✅ **Customer Satisfaction 4.5+/5.0** - Most important metric!
- ✅ **First Contact Resolution 80%+** - Thorough responses
- ✅ **Escalation Rate 10-15%** - Appropriate use of escalations

Remember: **Quality > Speed**. Take the time you need to make the right decision!

---

## Training Complete! 🎉

You now have the knowledge and framework to confidently review agent proposals in the approval queue. Remember:

1. **Trust your judgment** - You're the human in the loop
2. **Focus on customer experience** - Every approval matters
3. **Use the 5-Question Framework** - Your decision-making guide
4. **Escalate when unsure** - Better safe than sorry
5. **Your decisions teach the AI** - You're making the system better

Welcome to the future of operator-empowered support!

---

**Questions or Feedback?**
- Contact: Support Team Lead
- Slack: #occ-enablement
- Email: customer.support@hotrodan.com
- This document version: 1.0 (2025-10-11)

**Document maintained by:** Enablement Team
**Next review:** 2025-11-11

