# Customer Journey Map: AI-Assisted Support

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Status**: Complete - Journey Mapped

---

## Executive Summary

This document maps the complete customer journey when interacting with HotDash's AI-assisted support system, identifying touchpoints for automation, pain points, and opportunities for improvement.

**Key Insight**: Customers don't care if AI is involved—they care about fast, accurate, empathetic support. Our job is to deliver that seamlessly.

---

## Journey Overview

### Customer Perspective

**Before Agent SDK** (Manual Support):

```
Problem → Contact Support → Wait → Get Response → Problem Solved (maybe)
  ↓          ↓              ↓          ↓              ↓
 Stress   Easy/Familiar   Anxious   Relief/More    Satisfied/
                                    Frustrated     Frustrated
```

**With Agent SDK** (AI-Assisted):

```
Problem → Contact Support → Fast Response → Problem Solved
  ↓          ↓                 ↓               ↓
 Stress   Easy/Familiar      Relief         Delighted
```

**Difference**: Faster, more accurate responses with same (or better) empathy.

---

## Detailed Customer Journey

### Stage 1: Pre-Contact (Problem Discovery)

**Customer State**:

- Has a problem or question
- Feeling: Confused, frustrated, or curious
- Goal: Find solution quickly

**Touchpoints**:

1. Order status page (realizes order is delayed)
2. Email notification (payment failed)
3. Product page (has question before buying)
4. Account settings (can't login)

**Pain Points**:

- FAQ doesn't answer specific question
- Can't find phone number or contact info
- Previous bad support experiences create anxiety

**Automation Opportunities**:

- **Proactive Outreach** (Phase 3): Detect delayed order → Send proactive update before customer contacts us
- **Smart FAQ**: Surface most relevant FAQ based on customer's context
- **Pre-contact Form**: Quick yes/no questions to route to right agent type

**Experience Goals**:

- Make it easy to contact support (visible contact buttons)
- Set expectations (response time estimates)
- Reduce anxiety (friendly, approachable language)

---

### Stage 2: Initial Contact (Reaching Out)

**Customer State**:

- Decided to contact support
- Feeling: Hope for quick resolution, slight anxiety
- Goal: Clearly explain problem

**Touchpoints**:

1. **Chatwoot widget** (primary): Chat interface on website
2. **Email**: support@hotdash.com
3. **Social media** (future): Twitter, Facebook DMs

**Customer Actions**:

- Opens chat widget
- Types message: "Where is my order? Order #12345"
- Clicks "Send"
- Waits for response...

**Behind the Scenes (Agent SDK)**:

```
Customer Message
     ↓
Agent SDK Triggered (5-10 seconds)
     ↓
AI understands intent: "Order status inquiry"
     ↓
Fetches order #12345 data (automatic API call)
     ↓
Queries LlamaIndex for shipping policy
     ↓
Generates personalized draft response
     ↓
Draft appears in operator's approval queue (30-60 seconds total)
```

**Pain Points**:

- **Typing on mobile** is tedious
- **Uncertainty** about whether message was received
- **Wait anxiety**: How long until response?

**Automation Opportunities**:

- **Instant Acknowledgment**: "Thanks! An agent will respond in ~2 minutes"
- **Typing Indicators**: Show "Agent is typing..." (even if reviewing AI draft)
- **Voice Input** (future): Let customers speak their question

**Experience Goals**:

- Confirm message received immediately
- Set accurate wait time expectations
- Keep customer informed (typing indicators)

---

### Stage 3: Waiting for Response (The Anxiety Zone)

**Customer State**:

- Waiting for reply
- Feeling: Anxious, impatient, distracted
- Goal: Stay patient but not wait too long

**Current Wait Time**:

- **Manual** (baseline): 4.5 minutes average
- **Agent SDK** (target): 2.0 minutes average

**Customer Behavior**:

- Refreshes page multiple times
- Checks other tabs
- Gets distracted, may miss reply
- Considers calling instead

**Touchpoints**:

- Chat interface (still open)
- Email (if they left the page)
- Mobile notification (if mobile app)

**Pain Points**:

- **No feedback**: Is anyone working on my issue?
- **Context switching**: If they leave page, may not see reply
- **Anxiety builds**: Every minute feels longer

**Automation Opportunities**:

- **Progress Updates**: "Agent is reviewing your order details..." (if taking >1 min)
- **Estimated Time**: "Typical response time: 2 minutes"
- **Engagement**: Show helpful tips while waiting (e.g., "Did you know you can track orders in your account?")

**Agent SDK Impact**:

- Operator reviews AI draft: 60-90 seconds
- Much faster than manual workflow: 8.5 minutes
- **Customer wait time reduced by 55%**

**Experience Goals**:

- Make wait feel shorter (progress indicators)
- Reduce anxiety (accurate time estimates)
- Engage customer productively (helpful tips)

---

### Stage 4: Receiving Response (Moment of Truth)

**Customer State**:

- Gets notification of reply
- Feeling: Relief, anticipation
- Goal: Get clear, helpful answer

**Touchpoints**:

- Chat notification: "New message from Agent"
- Mobile push notification
- Email (if they closed chat)

**Customer Reads Response**:

**Example AI-Assisted Response**:

```
Hi Sarah! 👋

I've looked up your order #12345. Great news—it shipped yesterday
(Oct 10) via USPS Priority Mail!

📦 Tracking #: 9400111899223344556677
📍 Expected delivery: Oct 13-14

Here's the tracking link: [Track Package]

If you don't receive it by Oct 15, let me know and I'll help you
file a claim.

Is there anything else I can help you with?

Best,
Marcus
HotDash Support Team
```

**Customer Evaluation** (subconscious):

1. ✅ **Personalized**: Uses my name
2. ✅ **Specific**: Exact tracking info
3. ✅ **Empathetic**: "Great news!" shows they care
4. ✅ **Actionable**: Clear next steps, link to track
5. ✅ **Professional**: Well-formatted, friendly tone

**Pain Points**:

- **Generic responses** feel robotic and unhelpful
- **Incomplete answers** require follow-up
- **Wrong information** erodes trust
- **Impersonal tone** feels cold

**Agent SDK Impact**:

- AI drafts include: Customer name, order details, tracking info
- Operator adds: Empathy, personality, final check
- **Result**: Fast + Accurate + Human touch

**Automation Opportunities**:

- **Sentiment-Aware Tone** (Phase 2): Adjust language based on customer emotion
- **Multi-Issue Detection** (Phase 2): Address all questions in one response
- **Personalization** (Phase 2): Reference customer history ("Glad we resolved your last issue quickly!")

**Experience Goals**:

- Answer the question completely
- Show empathy and understanding
- Provide clear next steps
- Make customer feel heard

---

### Stage 5: Problem Resolution (Success or Failure)

**Scenario A: Problem Solved (Happy Path)**

**Customer State**:

- Question answered
- Feeling: Relieved, satisfied, maybe delighted
- Goal: Get back to their day

**Customer Actions**:

- Reads response
- Clicks tracking link
- Closes chat
- Maybe rates interaction (CSAT survey)

**Pain Points**:

- **Redundant survey**: If already satisfied, survey feels annoying

**Experience Goals**:

- Make it easy to close/complete interaction
- Quick, non-intrusive survey (thumbs up/down)
- Optional follow-up help: "Need anything else?"

---

**Scenario B: Partial Answer (Needs Follow-Up)**

**Customer State**:

- Original question answered, but has more questions
- Feeling: Mostly satisfied, but still needs help
- Goal: Get complete resolution

**Customer Actions**:

- Replies: "Thanks! Can I change my shipping address?"
- Waits for second response...

**Behind the Scenes**:

- Agent SDK generates draft for second question
- Operator reviews and approves
- Customer gets second response quickly (1-2 min)

**Pain Points**:

- **Starting over**: Having to re-explain context
- **Multiple contacts**: Feels like bouncing around

**Agent SDK Impact**:

- **Context Preserved**: AI includes previous conversation
- **Multi-Issue Handling** (Phase 2): Address multiple questions at once

**Experience Goals**:

- Seamless continuation (no re-explaining)
- Proactive anticipation of follow-up questions
- "One and done" resolution

---

**Scenario C: Problem NOT Solved (Unhappy Path)**

**Customer State**:

- Response didn't help
- Feeling: Frustrated, angry, considering alternatives
- Goal: Escalate or give up

**Customer Actions**:

- Replies: "That doesn't help. I need to speak to a manager."
- OR: Leaves negative CSAT rating
- OR: Closes chat and vents on social media

**Behind the Scenes**:

- **Sentiment Detection** (Phase 2): AI flags angry language
- Operator escalates immediately
- Senior support or manager takes over

**Pain Points**:

- **Wrong answer**: AI draft was inaccurate or off-topic
- **No escalation path**: Customer doesn't know how to get more help
- **Delayed escalation**: Should have escalated sooner

**Agent SDK Safety Nets**:

- Low confidence drafts (<70%) → Flagged for extra review
- Angry customer language → Auto-escalate
- Rejection by operator → Operator writes manual response

**Experience Goals**:

- Escalate quickly when needed
- Apologize sincerely for any mistakes
- Empower customer to request human manager
- Learn from failures (improve AI)

---

### Stage 6: Post-Interaction (Reflection)

**Customer State**:

- Issue resolved (or not)
- Feeling: Ranges from delighted to frustrated
- Goal: Return to normal life, maybe recommend or complain

**Touchpoints**:

- CSAT survey (immediate)
- Follow-up email (optional, 24 hours later)
- Social media (if they share experience)
- Review sites (if very happy or very unhappy)

**Customer Actions**:

- Rates interaction (thumbs up/down or 1-5 stars)
- Optionally leaves comment
- Tells friends about experience (word of mouth)
- Returns to HotDash (or doesn't)

**Pain Points**:

- **Survey fatigue**: Too many or too long surveys
- **No acknowledgment**: Feedback feels like it goes into a void
- **Broken promises**: "We'll follow up" → silence

**Automation Opportunities**:

- **Smart Follow-Up**: Only send follow-up email if issue wasn't fully resolved
- **Proactive Check-In**: "Did your package arrive on time?"
- **Thank You**: Acknowledge positive feedback personally

**Experience Goals**:

- Make feedback easy and valued
- Close the loop on any issues
- Turn satisfied customers into promoters

---

## Customer Journey Metrics

### Current State (Manual Support)

| Stage              | Metric                    | Baseline | Experience                      |
| ------------------ | ------------------------- | -------- | ------------------------------- |
| Pre-Contact        | Time to find contact info | 30-60s   | Neutral                         |
| Initial Contact    | Time to send message      | 60s      | Easy                            |
| Waiting            | Average wait time         | 4.5 min  | Anxious                         |
| Receiving Response | Response relevance        | 72%      | Mixed                           |
| Resolution         | First contact resolution  | 64%      | Frustrated (36% need follow-up) |
| Post-Interaction   | CSAT                      | 4.2/5    | Mostly satisfied                |

### Future State (Agent SDK)

| Stage              | Metric                   | Target        | Experience Improvement      |
| ------------------ | ------------------------ | ------------- | --------------------------- |
| Pre-Contact        | Proactive outreach       | 10% of issues | Delighted (prevented issue) |
| Initial Contact    | Same                     | 60s           | Easy (unchanged)            |
| Waiting            | Average wait time        | 2.0 min       | Less anxious (-55%)         |
| Receiving Response | Response relevance       | 90%           | Confident                   |
| Resolution         | First contact resolution | 78%           | Satisfied (+14pp)           |
| Post-Interaction   | CSAT                     | 4.4/5         | Delighted (+0.2)            |

---

## Touchpoint-Specific Analysis

### Touchpoint 1: Chatwoot Chat Widget

**Current Experience**:

- Opens in bottom-right corner
- Simple text input
- No context about wait times
- Basic formatting

**With Agent SDK**:

- Same interface (no customer-facing changes)
- Behind-the-scenes: AI prepares response
- Customer sees faster reply times

**Improvement Opportunities**:

- Add wait time estimate: "Typical response: 2 minutes"
- Show typing indicator immediately
- Suggest common questions (button clicks vs typing)

---

### Touchpoint 2: Email Support

**Current Experience**:

- Email to support@hotdash.com
- Auto-reply confirms receipt
- Response in 2-8 hours

**With Agent SDK** (Phase 3):

- AI drafts email responses
- Operator reviews before sending
- Response time reduced to <1 hour

**Improvement Opportunities**:

- Prioritize by urgency (angry emails first)
- Thread previous conversation context
- Offer chat link for faster resolution

---

### Touchpoint 3: CSAT Survey

**Current Experience**:

- Pop-up after chat closes: "Rate your experience 1-5"
- Optional comment box
- Submitted anonymously

**With Agent SDK**:

- Same survey mechanism
- Track CSAT specifically for AI-assisted interactions
- Compare to manual support baseline

**Improvement Opportunities**:

- Ask specific question: "Was your issue resolved?" (yes/no)
- If "no" → Auto-escalate to senior support
- Thank operators when CSAT is high

---

## Pain Point Solutions

### Pain Point 1: Long Wait Times

**Current**: 4.5 minutes average, feels like forever
**Customer Impact**: Anxiety, frustration, abandonment

**Solution with Agent SDK**:

- AI prepares draft in 10 seconds (automatic)
- Operator reviews in 60-90 seconds
- **Total**: ~2 minutes (-55% improvement)

**Additional Improvements**:

- Show progress: "Agent is reviewing your order..." (>1 min wait)
- Set expectations: "Typical response: 2 minutes"
- Engage while waiting: Show helpful tips

---

### Pain Point 2: Generic/Unhelpful Responses

**Current**: Template responses feel robotic, don't address specific question
**Customer Impact**: Frustration, need to follow up, lost trust

**Solution with Agent SDK**:

- AI includes specific order details, tracking info
- Operator adds empathy and personal touch
- Sources cited from knowledge base (always accurate)

**Measurement**:

- First Contact Resolution: 64% → 78% (fewer follow-ups)
- CSAT: 4.2 → 4.4 (better experience)

---

### Pain Point 3: Wrong Information

**Current**: 8% of manual responses contain incorrect policy info (outdated KB)
**Customer Impact**: Confusion, anger, escalations

**Solution with Agent SDK**:

- LlamaIndex always retrieves latest policy version
- Sources cited (operator can verify)
- Confidence score alerts operator to uncertainty

**Measurement**:

- Wrong information errors: 8% → <2%
- Escalations due to incorrect info: Reduced by 75%

---

### Pain Point 4: Lost Context in Follow-Ups

**Current**: Customer has to re-explain their issue in follow-up
**Customer Impact**: Frustration, feeling unheard

**Solution with Agent SDK**:

- AI includes full conversation history in context
- Operator sees previous interactions
- Seamless continuation

**Measurement**:

- "I already told you..." complaints: Reduced by 60%

---

## Automation Opportunities Summary

### Quick Wins (Phase 1-2)

1. **Instant Acknowledgment**: "Message received, agent responding soon"
2. **Typing Indicators**: Show activity even while reviewing draft
3. **Progress Updates**: "Agent is looking up your order..."
4. **Sentiment Detection**: Flag angry customers for priority

### Medium-Term (Phase 3-4)

5. **Proactive Outreach**: Delayed orders → Proactive "Sorry for delay" message
6. **Smart Escalation**: Predict when to escalate before customer gets frustrated
7. **Multi-Issue Handling**: Address all questions in one response
8. **Personalization**: Reference customer history and preferences

### Long-Term (Phase 5+)

9. **Predictive Support**: "Customers who ordered this also asked..." (preemptive FAQ)
10. **Voice Interface**: Speak questions instead of typing
11. **Visual AI**: Upload product photo, AI identifies issue
12. **Self-Service Portal**: AI-powered search for immediate answers

---

## Journey Visualization

### Customer Emotion Timeline

```
Customer Emotion (Manual Support)

Anxiety
   |     ╱╲              ╱
   |    ╱  ╲            ╱
   |   ╱    ╲          ╱
   |  ╱      ╲        ╱
   | ╱        ╲      ╱
   |╱          ╲    ╱
Neutral         ╲  ╱
   |             ╲╱
   |
Relief
   └──────────────────────────────→ Time
     Problem  Contact  Wait  Response  Resolution
     Occurs   Support  4.5min         (maybe)
```

```
Customer Emotion (Agent SDK)

Anxiety
   |     ╱╲     ╲
   |    ╱  ╲    ╲╲
   |   ╱    ╲    ╲╲
   |  ╱      ╲    ╲╲
   | ╱        ╲    ╲╲
   |╱          ╲    ╲╲
Neutral         ╲    ╲╲
   |             ╲    ╲╲___
   |              ╲         ╲
Relief             ╲         ╲
   |                ╲         ╲____
Delight            ╲              ╲
   └──────────────────────────────────→ Time
     Problem  Contact  Wait Response  Resolution
     Occurs   Support  2min  Fast &    Success!
                              Accurate
```

**Key Differences**:

- Shorter anxiety period (2 min vs 4.5 min wait)
- Faster relief (accurate response first time)
- Higher peak satisfaction (delighted vs just relieved)

---

## Success Metrics by Journey Stage

### Stage 1: Pre-Contact

- **Metric**: % of customers who find contact info easily
- **Target**: >95%
- **Measurement**: Analytics on click-to-contact time

### Stage 2: Initial Contact

- **Metric**: Message send success rate
- **Target**: >99%
- **Measurement**: Chat widget errors

### Stage 3: Waiting

- **Metric**: Average wait time
- **Baseline**: 4.5 minutes
- **Target**: 2.0 minutes (-55%)

### Stage 4: Receiving Response

- **Metric**: Response relevance (operator approval rate)
- **Baseline**: 72% (manual keyword search)
- **Target**: 90% (AI semantic search)

### Stage 5: Resolution

- **Metric**: First Contact Resolution rate
- **Baseline**: 64%
- **Target**: 78% (+14pp)

### Stage 6: Post-Interaction

- **Metric**: Customer Satisfaction (CSAT)
- **Baseline**: 4.2/5
- **Target**: 4.4/5 (+0.2)

---

## Customer Personas & Journey Variations

### Persona 1: Busy Parent (Time-Sensitive)

**Context**: Ordered birthday gift, needs it by Saturday
**Priority**: Speed, reliability
**Pain Point**: Can't waste time on slow support

**Journey with Agent SDK**:

- Contacts support: "Where is order #12345? Need by Saturday!"
- AI detects urgency (Saturday mentioned)
- Fast response: 1.5 minutes
- Clear tracking info + delivery estimate
- **Outcome**: Relieved, confident it will arrive

---

### Persona 2: First-Time Customer (Anxious)

**Context**: First order from HotDash, unsure about legitimacy
**Priority**: Trust, reassurance
**Pain Point**: Fear of scams, needs hand-holding

**Journey with Agent SDK**:

- Contacts support: "Is this a real company? How do I know?"
- AI retrieves trust signals (reviews, guarantees)
- Operator adds extra empathy: "Totally understand! Let me reassure you..."
- **Outcome**: Feels heard, gains confidence

---

### Persona 3: Power User (Efficiency-Focused)

**Context**: Frequent shopper, knows what they want
**Priority**: Self-service, no fuss
**Pain Point**: Doesn't want to wait for obvious answers

**Journey with Agent SDK**:

- Contacts support: "Order #12345 tracking?"
- AI generates instant response (high confidence)
- Operator approves quickly (<30 seconds)
- Fast resolution: <1.5 minutes total
- **Outcome**: Impressed by speed, will order again

---

## Recommendations

### Priority 1: Reduce Wait Time (Agent SDK Core)

- **Impact**: High (biggest pain point)
- **Effort**: Already in progress
- **Target**: 2 minutes average wait time

### Priority 2: Improve Response Accuracy (LlamaIndex)

- **Impact**: High (reduces follow-ups)
- **Effort**: KB maintenance + semantic search
- **Target**: 90% relevance, <2% wrong info

### Priority 3: Add Progress Indicators

- **Impact**: Medium (reduces perceived wait)
- **Effort**: Low (UI changes only)
- **Target**: Show "Agent typing" and progress updates

### Priority 4: Proactive Outreach (Phase 3)

- **Impact**: High (prevents issues before they escalate)
- **Effort**: Medium (requires predictive logic)
- **Target**: 10% of issues resolved proactively

---

**Document Owner**: Product Agent  
**Last Updated**: October 11, 2025  
**Status**: Journey Mapped - Ready for Optimization  
**Next Action**: Use journey insights to prioritize feature roadmap

**Related Documents**:

- [Product Roadmap](product_roadmap_agentsdk.md)
- [Dashboard Design](agent_performance_dashboard_design.md)
- [Success Metrics](docs/data/success_metrics_slo_framework_2025-10-11.md)
