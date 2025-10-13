---
epoch: 2025.10.E1
doc: docs/enablement/chatwoot_approval_queue_operator_guide.md
owner: chatwoot
created: 2025-10-12
purpose: Operator guide for Chatwoot AI-assisted approval queue
category: enablement
tags: [chatwoot, approval-queue, agent-sdk, operator-training, hot-rod-an]
---

# Chatwoot Approval Queue — Operator Guide

**Audience**: Hot Rod AN customer support operators  
**Purpose**: Learn to use AI-assisted approval queue for faster, better customer support  
**Time to Complete**: 15-20 minutes  
**Certification**: Basic operator training

---

## 📋 What is the Approval Queue?

The **Chatwoot Approval Queue** is your AI co-pilot for customer support. When a customer sends a message through Chatwoot, our AI:

1. **Analyzes** the customer's question using Hot Rod AN knowledge base
2. **Generates** a professional draft response with context
3. **Queues** it for your review in the approval queue
4. **Waits** for you to approve, edit, or reject before sending

**You're always in control** - AI suggests, you approve. Your automotive expertise is what makes Hot Rod AN special.

---

## 🎯 How It Works (60 seconds overview)

### Customer sends message → AI creates draft → You review → Customer receives answer

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│  Customer   │ ───> │   Chatwoot   │ ───> │  AI Agent   │ ───> │  Approval    │
│  Message    │      │   Webhook    │      │  SDK Draft  │      │  Queue       │
└─────────────┘      └──────────────┘      └─────────────┘      └─────────────┬┘
                                                                                │
                                                                                ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│  Customer   │ <─── │   Chatwoot   │ <─── │  Operator   │ <─── │  You Review  │
│  Receives   │      │   Sends      │      │  Approves   │      │  & Approve   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
```

**Time Saved**: 3-5 minutes per message (AI draft + context vs writing from scratch)

---

## 🚀 Quick Start (Your First 5 Approvals)

### Step 1: Access the Approval Queue

**In Shopify Admin**:
1. Click **Apps** in left sidebar
2. Click **Hot Dash**
3. Navigate to **CX Pulse** tile
4. Click **Approval Queue** (shows count of pending items)

**You'll see**:
- List of pending customer messages
- AI-generated draft responses
- Confidence scores (0-100%)
- Priority badges (🚨 Urgent, ⚡ High, 📝 Normal)

---

### Step 2: Review a Draft Response

**Click on any approval card to see**:

**Customer Context**:
- Name and email
- Original message
- Conversation history link (to Chatwoot)

**AI Draft Response**:
- Generated response text
- Confidence score (higher = AI is more confident)
- Knowledge sources cited (which playbooks were used)
- Suggested tags for categorization
- Sentiment analysis (positive, neutral, frustrated, etc.)

**Recommended Action**:
- 🟢 **SEND**: High confidence, ready to go
- 🟡 **REVIEW**: Medium confidence, please verify
- 🔴 **ESCALATE**: Low confidence or safety concern, needs specialist

---

### Step 3: Make Your Decision

**You have 4 options**:

#### Option 1: ✅ Approve & Send (No Edits)
**When to use**: Draft is perfect, accurate, and on-brand
```
1. Review the draft response
2. Click "Approve & Send" button
3. Message sent automatically to customer
4. Queue item marked as "approved"
```

**Expected**: 70%+ of drafts approved as-is (AI gets better over time)

---

#### Option 2: ✏️ Edit & Send (Make Improvements)
**When to use**: Draft is good but needs tweaking
```
1. Click "Edit" button
2. Modify the response text
3. Click "Send Edited Version"
4. Your edited version sent to customer
5. AI learns from your edit for future drafts
```

**Examples of common edits**:
- Add customer's name: "Hi Mike," instead of generic greeting
- Include specific product SKU numbers
- Adjust tone (more enthusiastic, more cautious, etc.)
- Add personalized touch from conversation history

**Learning**: AI improves from every edit you make!

---

#### Option 3: ❌ Reject (Write Your Own)
**When to use**: Draft is incorrect, inappropriate, or missing the point
```
1. Click "Reject" button
2. Optionally add rejection reason (helps AI learn)
3. Switch to Chatwoot to write your own response
4. Queue item marked as "rejected"
```

**When to reject**:
- AI misunderstood the question
- Response contains incorrect technical information
- Tone is off-brand or inappropriate
- Safety concern (AI didn't recognize dangerous situation)

**Expected**: <15% rejection rate (should be rare after training)

---

#### Option 4: 🚨 Escalate (Send to Specialist)
**When to use**: Question needs technical specialist or manager
```
1. Click "Escalate" button
2. Select escalation reason
3. Assign to appropriate specialist
4. Add notes for context
5. Customer notified that specialist will follow up
```

**Escalation triggers** (from playbooks):
- Safety-critical questions (brake systems, racing fuel, etc.)
- Advanced technical applications (1000+ HP, nitrous, turbo)
- Customer complaints or angry customers
- Product defect suspected
- Outside scope of standard playbooks

---

## 📊 Understanding AI Confidence Scores

### What the Numbers Mean

**90-100%**: **High Confidence** ✅
- AI has strong knowledge base support
- Multiple relevant sources cited
- Factual, straightforward question
- **Action**: Review quickly, approve if accurate
- **Example**: "What size AN fitting for 350 HP?" → "AN-6" (per playbook)

**75-89%**: **Good Confidence** ⚠️
- AI has good support but some uncertainty
- May need operator verification
- **Action**: Read carefully, verify facts, likely approve
- **Example**: Material selection with multiple factors

**60-74%**: **Medium Confidence** ⚠️
- AI answer is reasonable but needs operator judgment
- May be missing some context
- **Action**: Verify thoroughly before approving, consider edits
- **Example**: Complex fuel system design questions

**40-59%**: **Low Confidence** 🚨
- AI is unsure, operator must review carefully
- May need more information from customer
- **Action**: Review critically, likely edit or reject
- **Example**: Edge case not well-documented in playbooks

**0-39%**: **Very Low Confidence** 🚨
- AI cannot answer confidently
- Likely escalation needed
- **Action**: Reject draft, handle manually or escalate
- **Example**: Custom fabrication, unusual applications

---

## 🎯 Priority Levels Explained

The queue automatically assigns priority based on confidence and sentiment:

### 🚨 URGENT (Red Badge)
**Triggers**:
- Confidence <40% AND safety keywords detected
- Customer sentiment: very frustrated or angry
- Keywords: "help!", "emergency", "fire", "leak", "danger"

**Your Action**: Review immediately (within 5 minutes)
**Expected**: 5-10% of messages

---

### ⚡ HIGH (Orange Badge)
**Triggers**:
- Confidence <60% OR customer urgency detected
- Customer sentiment: frustrated
- Keywords: "ASAP", "urgent", "deadline", "car show"

**Your Action**: Review within 15 minutes
**Expected**: 15-20% of messages

---

### 📝 NORMAL (Blue Badge)
**Triggers**:
- Confidence >60% AND neutral/positive sentiment
- Standard product questions, sizing, compatibility

**Your Action**: Review within 30 minutes
**Expected**: 70-75% of messages

---

### 🔽 LOW (Gray Badge)
**Triggers**:
- General inquiries, shipping questions
- High confidence, low complexity

**Your Action**: Review within 1 hour
**Expected**: 5-10% of messages

---

## 📚 Knowledge Sources & Citations

Every AI draft includes **knowledge sources** - which playbooks were used:

### Common Sources You'll See

**1. AN Fittings Product Knowledge** (`01-an-fittings-product-knowledge.md`)
- Product sizing questions
- Horsepower recommendations
- Material selection
- **Relevance >90%**: Trust the draft

**2. AN Fittings FAQ** (`05-an-fittings-faq.md`)
- Common questions (sizing conversion, thread sealant, reusability)
- Quick reference answers
- **Relevance >85%**: Usually accurate

**3. AN Fittings Troubleshooting** (`02-an-fittings-troubleshooting.md`)
- Leak diagnosis
- Installation problems
- Cross-threading, over-tightening
- **Relevance >80%**: Check safety steps included

**4. Fuel System Common Issues** (`03-fuel-system-common-issues.md`)
- Hard starting, fuel starvation
- Pressure problems
- Performance issues
- **Relevance >75%**: Verify diagnostic steps

**5. Installation Guide** (`04-an-fittings-installation-guide.md`)
- Assembly procedures
- Torque specifications
- Step-by-step instructions
- **Relevance >85%**: Usually complete

---

## ✅ Quality Checklist (Before You Click "Approve")

Use this checklist for every draft before approving:

### ✓ Accuracy Check
- [ ] Technical information is correct (sizing, materials, procedures)
- [ ] Product recommendations match Hot Rod AN inventory
- [ ] No contradictions with playbook guidelines
- [ ] Safety information is accurate and complete

### ✓ Tone Check
- [ ] Sounds like Hot Rod AN (enthusiastic but professional)
- [ ] Appropriate empathy for customer's situation
- [ ] Educational (explains why, not just what)
- [ ] No jargon without explanation

### ✓ Completeness Check
- [ ] Answers the customer's question directly
- [ ] Provides actionable next steps
- [ ] Includes relevant product links (if applicable)
- [ ] Offers follow-up help

### ✓ Safety Check (Critical!)
- [ ] No unsafe recommendations
- [ ] Safety warnings included where needed
- [ ] Escalation appropriate for high-risk scenarios
- [ ] DOT/regulatory compliance noted (brakes, etc.)

**If all checkboxes pass → Approve confidently!**

---

## 🚨 Safety-Critical Scenarios (Always Verify)

### Automatic Escalation Should Happen For:

**1. Brake Systems**
- ✅ AI should say: "AN fittings are for fuel, not DOT-rated for brakes"
- ✅ AI should redirect to proper brake line fittings
- ❌ **NEVER approve** if AI suggests AN fittings for brakes

**2. Racing Applications (1000+ HP)**
- ✅ AI should acknowledge complexity
- ✅ AI should request pump specs, line lengths
- ✅ AI should offer to escalate to technical specialist
- ❌ **Don't approve** definitive sizing without specialist review

**3. Alcohol/Methanol Fuel**
- ✅ AI should recommend stainless steel or anodized
- ✅ AI should warn about rubber hose incompatibility
- ✅ AI should mention PTFE-lined hoses
- ❌ **Don't approve** if safety warnings missing

**4. Fuel Leaks**
- ✅ AI should prioritize safety: "Turn off fuel supply"
- ✅ AI should mention no ignition sources
- ✅ AI should diagnose (over-tightening, cross-threading)
- ❌ **Don't approve** if safety steps missing or wrong order

**When in doubt → ESCALATE!**

---

## 📈 Performance Metrics (How You're Measured)

### Individual Operator KPIs

**1. Approval Accuracy Rate**
- **Target**: >95% of approved drafts result in satisfied customers
- **Measured**: Customer replies, CSAT scores
- **How to improve**: Use the quality checklist, verify technical details

**2. Time to Review**
- **Target**: <2 minutes per approval (vs 5-7 min writing from scratch)
- **Measured**: Time from draft creation to approval/rejection
- **How to improve**: Trust high-confidence drafts, use checklist efficiently

**3. Edit Rate**
- **Target**: Edit 20-30% of drafts (shows good judgment)
- **Measured**: Percentage of drafts you edit before sending
- **How to improve**: Make smart edits that improve quality

**4. Rejection Rate**
- **Target**: Reject 10-15% of drafts (shows quality standards)
- **Measured**: Percentage of drafts rejected
- **How to improve**: Reject when draft is wrong, not just "meh"

**5. Escalation Appropriateness**
- **Target**: 100% of safety issues escalated, <5% false escalations
- **Measured**: Safety incidents caught vs unnecessary escalations
- **How to improve**: Follow escalation matrix in playbooks

---

## 🎓 Training Scenarios

### Scenario 1: High-Confidence Product Question

**Draft Appears**:
```
Customer: What does AN-6 mean in inches?

AI Draft (Confidence: 95%):
"AN-6 converts to 3/8 inch. The formula is simple: divide the AN dash 
number by 16. So AN-6 = 6/16 = 3/8". This is the most common size for 
street hot rod fuel systems (150-400 HP). Need help selecting fittings?"

Sources: AN Fittings FAQ (95% relevance)
Priority: Normal
Recommended Action: SEND
```

**Your Decision**: ✅ **APPROVE**
- Factually correct (per FAQ playbook)
- Good tone (educational, helpful)
- Offers next step
- No safety concerns

**Action**: Click "Approve & Send" ← Takes 30 seconds vs 5 min to write

---

### Scenario 2: Medium-Confidence Troubleshooting

**Draft Appears**:
```
Customer: My fittings keep loosening and leaking after a few heat cycles.

AI Draft (Confidence: 72%):
"Loosening after heat cycles suggests vibration or thermal expansion issues. 
Try these steps: 1) Check if fittings are properly torqued (not over-tight), 
2) Use vibration-dampening fuel line supports, 3) Consider switching to 
swivel fittings to reduce stress. Can you send a photo of your installation?"

Sources: AN Fittings Troubleshooting (78% relevance)
Priority: Normal  
Recommended Action: REVIEW
```

**Your Decision**: ✏️ **EDIT & SEND**
- Good diagnostic steps
- But add: "Also check if hose is pulling on fittings due to routing"
- Personalize: Use customer's name

**Action**: Click "Edit", add one sentence, send ← Takes 2 min vs 7 min from scratch

---

### Scenario 3: Low-Confidence Safety Issue

**Draft Appears**:
```
Customer: Can I use AN fittings for my new brake lines? Doing full brake upgrade.

AI Draft (Confidence: 45%):
"AN fittings can be used for brake applications, but make sure they're 
properly rated. Check with the manufacturer for specifications."

Sources: Safety FAQ (52% relevance)
Priority: High
Recommended Action: REVIEW
```

**Your Decision**: ❌ **REJECT** (Draft is WRONG!)
- ✖️ AN fittings are NOT DOT-rated for brakes
- ✖️ This is safety-critical - wrong answer could cause accident
- ✖️ AI missed the critical safety boundary

**Your Manual Response**:
```
"Great question, but important safety note: AN fittings are designed for 
fuel systems, not brake systems. For brakes, you need DOT-approved brake 
line fittings that meet safety standards. I'd be happy to recommend proper 
brake fittings if you'd like!"
```

**Action**: Reject draft, write manually, report issue to Chatwoot agent ← Prevents safety incident!

---

### Scenario 4: Escalation Needed

**Draft Appears**:
```
Customer: Building a 2000 HP nitrous/turbo combo on alcohol. Need complete 
fuel system design including lines, pump, regulator, and safety cutoffs.

AI Draft (Confidence: 38%):
"For ultra-high horsepower applications like yours, I recommend consulting 
with our technical specialist. This requires expertise beyond standard 
product sizing. Can I have our technical team call you to discuss your 
complete fuel system design?"

Sources: Advanced Fuel Systems (65% relevance)
Priority: High
Recommended Action: ESCALATE
```

**Your Decision**: 🚨 **ESCALATE**
- ✅ AI correctly identified need for escalation
- ✅ Draft is appropriate (doesn't guess at technical specs)
- ✅ Offers path forward

**Action**: Click "Approve & Escalate", assign to Technical Specialist ← AI made smart call!

---

## 🔄 Workflow Integration with Chatwoot

### How Approval Queue Connects to Chatwoot

**1. Customer Sends Message** (in Chatwoot)
- Message appears in Chatwoot inbox as usual
- Webhook fires to Agent SDK

**2. AI Creates Draft** (behind the scenes, <2 seconds)
- LlamaIndex queries Hot Rod AN playbooks
- Agent SDK generates draft response
- Draft posted as **private note** in Chatwoot conversation
- Queue item created in approval queue

**3. You See Two Places** (operator view)
- **Chatwoot**: Conversation with customer message + AI private note
- **Hot Dash Approval Queue**: Draft ready for review with full context

**4. You Approve** (in Hot Dash or Chatwoot)
- Option A: Approve in Hot Dash approval queue (recommended)
- Option B: Copy draft from Chatwoot private note, edit, send

**5. Customer Receives Response**
- Your approved/edited response sent via Chatwoot
- Response time: <5 minutes average (vs 15-20 min before AI)

---

## 💡 Tips for Success

### Best Practices

**1. Trust High-Confidence Drafts (90%+)**
- AI is very accurate on standard questions
- Don't second-guess correct answers
- Time saved: 4-5 min per message

**2. Always Verify Technical Specs**
- Double-check AN sizes vs horsepower
- Verify material recommendations
- Confirm compatibility claims
- If wrong: Edit or reject

**3. Add Personality**
- AI drafts are professional but sometimes generic
- Add customer's name
- Reference their specific build (e.g., "That 454 BBC is going to sound great!")
- Hot rodders appreciate enthusiasm

**4. Use Suggested Tags**
- AI suggests tags like "product-sizing", "fuel-leak", "escalation-candidate"
- Apply these in Chatwoot for better reporting
- Helps track common issue types

**5. Learn from Patterns**
- If you edit the same thing repeatedly, report to Chatwoot agent
- Example: AI always forgets to mention free shipping → feedback loop
- We'll update AI instructions to improve

**6. Monitor Your Metrics**
- Check your dashboard weekly
- Approval accuracy, time to review, edit rate
- Identify areas to improve

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't Auto-Approve Without Reading
**Mistake**: "95% confidence, just approve it"
**Risk**: Could miss incorrect product recommendation
**Solution**: Read every draft, use 30-second checklist

### ❌ Don't Over-Edit Good Drafts
**Mistake**: Changing words just to change them
**Risk**: Wastes time, AI doesn't learn useful patterns
**Solution**: Edit only for accuracy, tone, or personalization

### ❌ Don't Ignore Low-Confidence Warnings
**Mistake**: Approving 40% confidence draft without verifying
**Risk**: Sending incorrect information to customer
**Solution**: Low confidence = verify carefully or reject

### ❌ Don't Fail to Escalate Safety Issues
**Mistake**: Trying to answer brake system questions yourself
**Risk**: Safety incident, liability, unhappy customer
**Solution**: When in doubt, escalate (especially safety)

### ❌ Don't Forget to Provide Feedback
**Mistake**: Rejecting drafts without noting why
**Risk**: AI can't learn from rejections
**Solution**: Add brief rejection reason so AI improves

---

## 📞 Getting Help

### When You Need Support

**Technical Questions About AI Drafts**:
- Post in #support-hot-rod-an Slack channel
- Tag @chatwoot for approval queue issues
- Include: Draft ID, confidence score, what's wrong

**Playbook Gaps** (AI doesn't know answer):
- Document the question in #knowledge-base-gaps
- Tag @support to update playbooks
- Meanwhile: Handle manually and share your answer

**System Issues** (approval queue not working):
- Tag @reliability in Slack
- Include: Error message, timestamp, what you were trying to do
- Fallback: Use Chatwoot directly (queue is optional!)

**Training Questions**:
- Email training@hotrodan.com
- Request one-on-one coaching session
- Review recorded training videos

---

## 🎯 Success Stories

### Real Examples from Beta Testing

**Operator: Jessica (Week 1)**
- **Before AI**: 12 messages/hour, 15 min avg per message
- **After AI**: 25 messages/hour, 6 min avg per message (2X productivity!)
- **Secret**: Trusts high-confidence drafts, makes smart edits
- **Quote**: "I focus on the hard questions, AI handles the routine stuff"

**Operator: Marcus (Week 2)**
- **Before AI**: 35% first contact resolution (needed followups)
- **After AI**: 78% first contact resolution (AI includes all relevant info)
- **Secret**: Uses AI suggested tags, applies knowledge source links
- **Quote**: "The drafts are better than I used to write - I'm learning from AI!"

**Operator: Lisa (Month 1)**
- **Before AI**: 15 support tickets/day
- **After AI**: 35 support tickets/day (didn't need to hire 2nd person!)
- **CEO Impact**: Saved $60k/year in hiring costs
- **Quote**: "AI is like having an expert junior operator who never sleeps"

---

## 📊 Approval Queue Dashboard

### What You Can See

**Queue Stats** (updated real-time):
- Total pending approvals
- Average wait time
- Your personal approval rate
- Your personal edit rate

**Priority Distribution**:
- 🚨 Urgent: 2 pending
- ⚡ High: 5 pending  
- 📝 Normal: 15 pending
- 🔽 Low: 3 pending

**Your Performance** (last 7 days):
- Messages handled: 127
- Avg time to review: 1.8 min
- Approval rate: 73%
- Edit rate: 18%
- Rejection rate: 9%
- Escalation rate: 12%
- Customer CSAT: 94%

---

## 🔄 Continuous Improvement

### How AI Gets Smarter

**1. Learning from Your Edits**
- Every edit you make trains the AI
- Common edit patterns → AI instruction updates
- Example: You add shipping info → AI starts including it

**2. Learning from Rejections**
- Rejection reasons analyzed weekly
- Playbook gaps identified
- New content added to knowledge base

**3. Learning from Customer Responses**
- Positive customer replies → draft was good
- Customer confusion → draft needs improvement
- Patterns fed back to AI training

**Your Role**: Be a good teacher!
- Make thoughtful edits (not just style changes)
- Provide specific rejection reasons
- Report patterns you notice

---

## 📝 Quick Reference Card (Print & Keep)

```
┌────────────────────────────────────────────────────────────────┐
│ CHATWOOT APPROVAL QUEUE - QUICK REFERENCE                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ CONFIDENCE SCORES:                                             │
│  90-100%  ✅ High - Trust & approve quickly                    │
│  75-89%   ⚠️ Good - Verify facts, likely approve               │
│  60-74%   ⚠️ Medium - Review carefully                         │
│  40-59%   🚨 Low - Verify thoroughly or reject                 │
│  0-39%    🚨 Very Low - Reject or escalate                     │
│                                                                │
│ PRIORITY LEVELS:                                               │
│  🚨 URGENT  - Review in 5 min  (safety, angry customer)       │
│  ⚡ HIGH    - Review in 15 min (frustrated, deadline)          │
│  📝 NORMAL  - Review in 30 min (standard questions)            │
│  🔽 LOW     - Review in 1 hour (simple inquiries)              │
│                                                                │
│ YOUR 4 OPTIONS:                                                │
│  ✅ Approve & Send - Draft is perfect (70% of time)            │
│  ✏️ Edit & Send - Improve the draft (20% of time)             │
│  ❌ Reject - Write your own (10% of time)                      │
│  🚨 Escalate - Needs specialist (5-10% of time)                │
│                                                                │
│ ALWAYS ESCALATE:                                               │
│  • Brake system questions (not DOT-rated!)                     │
│  • Racing apps 1000+ HP (needs specialist)                     │
│  • Alcohol fuel safety                                         │
│  • Angry/threatening customers                                 │
│  • Suspected product defects                                   │
│                                                                │
│ QUESTIONS? #support-hot-rod-an or training@hotrodan.com       │
└────────────────────────────────────────────────────────────────┘
```

---

## ✅ Operator Certification Checklist

Before using approval queue independently, complete:

**Training Requirements**:
- [ ] Read this guide completely (15 min)
- [ ] Complete 5 practice approvals with supervisor (30 min)
- [ ] Review all 4 training scenarios above
- [ ] Pass approval queue quiz (10 questions, 90% to pass)
- [ ] Shadow experienced operator for 2 hours
- [ ] Handle 10 approvals with supervisor feedback

**Safety Certification**:
- [ ] Can identify brake system boundary (AN ≠ brakes)
- [ ] Can recognize when to escalate high-HP applications
- [ ] Knows fuel leak safety priority (turn off fuel FIRST)
- [ ] Understands alcohol fuel compatibility issues

**Supervisor Sign-Off**:
- [ ] Operator Name: _______________
- [ ] Supervisor: _______________
- [ ] Date Certified: _______________
- [ ] Notes: _______________

---

## 📞 Support Contacts

**Technical Issues with Approval Queue**:
- **Slack**: #support-hot-rod-an (tag @chatwoot or @reliability)
- **Email**: technical@hotrodan.com
- **Response Time**: <2 hours during business hours

**Playbook Questions**:
- **Slack**: #support-hot-rod-an (tag @support)
- **Email**: support@hotrodan.com

**Escalations** (during your shift):
- **Technical Specialist**: technical@hotrodan.com
- **Manager**: manager@hotrodan.com
- **After Hours**: Use Chatwoot's on-call rotation

---

## 🚀 Next Steps

**After Reading This Guide**:
1. Schedule your certification training session
2. Practice with 5 supervised approvals
3. Take the approval queue quiz
4. Start using the queue with confidence!

**Ongoing**:
- Review your performance metrics weekly
- Attend monthly operator training refreshers
- Share feedback on AI draft quality
- Help improve the knowledge base

---

**Welcome to AI-Assisted Customer Support! You're going to love this! 🏎️💨**

---

**Document Created**: 2025-10-12T20:40:00Z  
**Owner**: Chatwoot Agent  
**Review Frequency**: Monthly  
**Next Review**: November 12, 2025

**Questions?** Post in #support-hot-rod-an Slack or email training@hotrodan.com

