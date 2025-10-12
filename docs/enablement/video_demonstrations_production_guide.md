# Video Demonstrations Production Guide

**Purpose:** 5-minute video demos for each approval queue feature  
**Format:** Screen recording + voiceover  
**Status:** Scripts ready, record when UI is live  
**Created:** 2025-10-12

---

## Video Library Overview

**Total Videos:** 6 core videos + 2 bonus  
**Total Runtime:** ~40 minutes  
**Production Time:** 8-12 hours (recording + editing)  
**Platform:** Loom (or company video platform)

---

## Production Standards

### Recording Setup
- **Resolution:** 1080p minimum
- **Frame Rate:** 30fps
- **Audio:** Clear microphone, -18dB level
- **Cursor:** Large cursor with click highlights enabled
- **Browser:** Chrome, clean window (no extra tabs)
- **Speed:** Moderate pace (not too fast)

### Editing Guidelines
- Add captions (auto-generate, then edit)
- Add arrows/highlights for key UI elements
- Add text overlays for important points
- Keep videos under 6 minutes each
- Test on mobile (should be viewable)

### Quality Check
- Audio clear throughout
- All UI elements visible and readable
- No sensitive/real customer data shown
- Information accurate
- Pacing appropriate

---

## VIDEO 1: Approval Queue Overview (5 min)

**Purpose:** Introduction to the approval queue interface  
**Target Audience:** New operators (first video to watch)

### Script

**[00:00-00:30] Welcome**
```
Hi! I'm [Name] and I'm going to show you the Agent SDK approval queue. 
This is where you'll review AI-prepared customer responses before they're 
sent. By the end of this 5-minute video, you'll know exactly how to navigate 
the queue and what each part of the interface does. Let's dive in!

[Show: Approval queue home screen]
```

**[00:30-01:30] Queue Overview**
```
When you open the approval queue, here's what you see:

[Point to each element]

At the top: Your pending approvals count. Right now I have 5 pending.

Below that: Quick stats - approvals today, average review time, your approval rate.

And here's the main queue - each card is one customer conversation waiting 
for review.

[Show scrolling through queue]

You can filter by confidence level - show me only high confidence, or only 
low confidence that need extra attention.

You can search by conversation ID or customer name.

And you can sort - newest first, oldest first, or by confidence score.

Simple interface - everything you need right here.
```

**[01:30-02:30] Approval Card Anatomy**
```
Let's open one approval and see what information we get.

[Click on an approval card]

Here's the approval card. At the top: conversation ID, customer name, 
timestamp.

[Scroll through card, pointing to sections]

Customer's original message - always read this first to understand what they're 
asking.

AI's prepared draft - this is what will be sent if you approve it.

Confidence score - 92% in this case, which is high. AI is pretty confident 
this is a good response.

KB sources - these are the knowledge base articles AI used. Click to verify 
if you want.

And at the bottom: your action buttons - Approve, Reject, or Escalate.

That's all the information you need to make a decision.
```

**[02:30-03:30] Taking Action**
```
So how do you actually decide? Let me show you the quick check I do:

[Point to customer message]
1. What did the customer ask? "Where is my order?"

[Point to AI draft]
2. Did AI answer it? Yes - provided tracking number and delivery estimate.

[Point to confidence/KB sources]
3. Is it accurate? I can verify - confidence is high, KB source is Shipping 
Policy v2.1 which I know is current.

[Point to tone]
4. Is the tone good? Yes - friendly, professional, helpful.

[Point to decision]
No red flags, information is accurate, answers the question. This is an 
approval.

[Click "Approve & Execute"]

Click approve, and... done! Response sent to customer. That took about 
a minute.

Most approvals are this straightforward.
```

**[03:30-04:30] Navigation Tips**
```
A few quick navigation tips:

[Show keyboard shortcut if applicable]
You can use Tab to move to the next approval. Shift+Tab to go back.

[Show filter menu]
If you want to focus on challenging ones, filter for "Low Confidence" - 
these need extra attention.

[Show search]
Looking for a specific conversation? Search by ID or customer name here.

[Show Chatwoot link]
Need more context? Click here to open the full conversation in Chatwoot.

[Show help button]
And if you ever forget something, click the help icon for quick reference.

Everything is designed to be intuitive - you'll get the hang of it quickly.
```

**[04:30-05:00] Wrap Up**
```
That's the approval queue interface! 

To recap:
• Queue shows all pending approvals
• Each card has customer message, AI draft, confidence score, sources
• Your job: Verify accuracy and approve or reject
• Most approvals take 1-2 minutes

In the next videos, I'll show you specific scenarios - when to reject, 
when to escalate, and how to handle tricky situations.

Questions? Check your Quick Start Guide or ask in Slack #occ-enablement.

Now let's look at some real examples...
```

---

## VIDEO 2: How to Approve (3 min)

**Purpose:** Walkthrough of standard approval process  
**Scenario:** Simple order status inquiry

### Script

**[00:00-00:20] Intro**
```
In this video, I'll show you how to approve an AI draft - the most common 
action you'll take. This is what a standard approval looks like, start to 
finish.

[Show: Approval card for order status inquiry]
```

**[00:20-01:30] Read and Verify**
```
Here's a typical approval. Let me walk through my thought process:

[Read customer message]
Customer asks: "Hi, I placed order #OX-4521 three days ago. Where is it? 
- Sarah"

Simple question - where's my order?

[Read AI draft]
AI responded: "Hi Sarah! Order #OX-4521 shipped yesterday via USPS Priority 
Mail. Tracking number is [number]. You should receive it in 2-3 business days."

Okay, so AI looked up the order, found shipping info, provided tracking.

[Check confidence]
Confidence: 95%. AI is very confident.

[Check KB source]
Source: Shipping Policy v2.1 and Order Tracking Process. These are current.

[Quick verification]
Let me verify this is actually true...
[Click to Chatwoot or order system]
Yes - order #OX-4521 did ship yesterday. Tracking matches. Information is 
accurate.

[Back to approval card]
Looks good!
```

**[01:30-02:30] Decision and Approval**
```
So my quick checklist:
✓ Information accurate? Yes, verified order shipped
✓ Answers customer question? Yes, provided tracking and timeline
✓ Tone appropriate? Yes, friendly and professional
✓ Any red flags? No

This is a textbook approval.

[Move cursor to Approve button]

I click "Approve & Execute"...

[Click button]

[Show confirmation]

And we get confirmation - "Response sent to customer."

[Show queue updating]

The approval disappears from my queue, conversation marked as handled.

Customer has their answer, I'm on to the next one.

That's it - from start to finish, about a minute.
```

**[02:30-03:00] Wrap Up**
```
Most approvals are this simple:
1. Read customer question
2. Verify AI's answer is accurate
3. Check tone is appropriate
4. Click approve

You'll do dozens of these during the pilot. They become second nature quickly.

In the next video, I'll show you when and how to reject - when AI gets it 
wrong and you need to intervene.
```

---

## VIDEO 3: When to Reject (4 min)

**Purpose:** How to identify and handle incorrect AI drafts  
**Scenario:** AI cites outdated policy

### Script

**[00:00-00:30] Intro**
```
Sometimes AI gets it wrong. In this video, I'll show you how to spot errors 
and what to do when you need to reject an AI draft.

[Show: Approval card with policy error]
```

**[00:30-01:30] Identifying the Error**
```
Here's a situation where I need to reject:

[Read customer message]
Customer asks: "Can I return my purchase? I bought it 20 days ago. - Marcus"

[Read AI draft]
AI says: "Unfortunately our return policy is 14 days from delivery, so we 
can't accept returns after 20 days."

[Pause]

Wait. I know our return policy is 30 days, not 14. Let me check...

[Click KB source]
AI cited "Return Policy v2.0"... but I know the current version is v2.1, 
which extended the window to 30 days.

[Back to card]

So AI gave the wrong answer based on an outdated policy. Customer is actually 
WITHIN our policy at 20 days, not outside it.

This is a clear rejection - factually incorrect information.
```

**[01:30-02:30] Rejecting with Notes**
```
Here's how to reject effectively:

[Click "Reject" button]

A note field appears. This is important - I need to explain WHY I'm rejecting 
so AI can learn.

[Type note]
I write: "AI cited Return Policy v2.0 (14 days) but current policy is v2.1 
(30 days). Customer at 20 days is within policy, not outside."

[Emphasize]
Specific notes like this help engineering fix the root issue - in this case, 
updating the KB index to prioritize v2.1 over v2.0.

[Submit rejection]

Click submit... rejection logged, conversation stays in my queue for manual 
handling.
```

**[02:30-03:30] Handling Manually**
```
After rejection, I handle this manually in Chatwoot:

[Switch to Chatwoot]

I draft the correct response: "Hi Marcus! Good news - our return policy is 
actually 30 days, so you're well within the window. Here's how to initiate 
your return..."

[Send response]

Customer gets the correct information, crisis averted.

[Back to approval queue]

This took a bit longer - maybe 2-3 minutes total - but I caught an error 
before it reached the customer. That's exactly what the approval queue is for.
```

**[03:30-04:00] Wrap Up**
```
Common reasons to reject:
• Wrong policy version (like we just saw)
• Factually incorrect information
• Doesn't answer the customer's actual question
• Inappropriate tone

Always add detailed rejection notes - it helps the whole system improve.

Next video: When to escalate - the most critical skill.
```

---

## VIDEO 4: When to Escalate (5 min)

**Purpose:** How to recognize and escalate red-flag situations  
**Scenario:** Angry customer with high-value dispute

### Script

**[00:00-00:30] Intro**
```
This is the most important video: when to escalate. Some approvals shouldn't 
be handled by you - they need manager attention. I'll show you how to spot 
red flags and escalate safely.

[Show: High-stakes approval card]
```

**[00:30-02:00] Reading Red Flags**
```
Here's an escalation situation:

[Read customer message slowly, emphasizing caps]
Customer says: "THIS IS RIDICULOUS! I ordered the 30-day supply and you sent 
the 7-day! I paid $149 for this! FIX IT NOW or I'm calling my credit card 
company and reporting fraud! - Jennifer"

Okay, let me identify the red flags here:

[Point to specific phrases]
1. "I'm calling my credit card company" - that's a chargeback threat
2. "$149" - that's high value, over our $100 threshold
3. "THIS IS RIDICULOUS", "FIX IT NOW", all caps - extreme anger
4. "reporting fraud" - serious accusation

[Count on fingers]
So we have: threat, high value, extreme anger. Multiple red flags.

[Read AI draft]
Now let's see what AI suggested: "We sincerely apologize... I'll send the 
correct 30-day supply at no charge. You can keep the 7-day as a gesture..."

[Pause]
AI's solution actually sounds reasonable - free replacement, keep the error 
item. But...
```

**[02:00-03:30] Why This Needs Escalation**
```
Even though AI's solution seems good, this MUST be escalated. Here's why:

[Point to red flags again]
1. High value ($149) - compensation decisions over $100 require manager 
approval per our policy

2. Chargeback threat - if customer follows through, we have a 15-day window 
to respond. Manager needs to be aware immediately.

3. Extreme anger - customers this upset often escalate further. Manager may 
want to call personally rather than send an automated response.

[Emphasize]
The rule is: When you see threats, high value, or health/safety concerns, 
always escalate - even if AI's solution looks perfect.

Better safe than sorry. Managers WANT you to escalate these.
```

**[03:30-04:30] How to Escalate**
```
Here's the escalation process:

[Click "Escalate" button]

Escalation form appears.

[Select reason]
I select reasons: "High-Value Issue" and "Customer Threat"

[Type notes]
I add context: "Order fulfillment error ($149 item). Customer threatening 
chargeback ('calling credit card company'). Extremely angry (all caps). 
AI proposed free replacement + keep error item. Recommend manager call 
customer directly rather than written response."

[Show SLA]
SLA shows: "URGENT - 15 minutes". Because of the threat, manager will get 
this fast.

[Submit]

Click submit... escalation sent. Manager gets Slack notification immediately.

[Show confirmation]

I get confirmation: "Escalated to Manager. They'll handle within 15 minutes."

Done! This took about a minute, and now the right person is handling a 
sensitive situation.
```

**[04:30-05:00] Wrap Up**
```
Always escalate:
• Threats (legal, social media, chargeback, regulatory)
• High value (>$100)
• Customer injury or health concerns
• You're unsure

Never worry about over-escalating. Managers prefer too many escalations 
over too few. When in doubt, escalate.

That's the safety mechanism of the system - you're empowered to route 
complex issues to the right people.
```

---

## VIDEO 5: Confidence Scores Explained (3 min)

**Purpose:** How to interpret and use AI confidence scores  
**No specific scenario - educational**

### Script

**[00:00-00:30] Intro**
```
You'll see a "confidence score" on every approval. What does it mean and how 
should you use it? Let's break it down.

[Show: Multiple approval cards with different confidence scores]
```

**[00:30-01:30] What Confidence Means**
```
The confidence score is AI's self-assessment: "How sure am I that this 
response is good?"

[Show high confidence example - 95%]
95% confidence means: "I found clear answers in the knowledge base, order 
information was straightforward, I'm very confident this is correct."

[Show medium confidence - 75%]
75% means: "I found answers but there's some ambiguity, or the customer 
question was complex, or information was from multiple sources."

[Show low confidence - 60%]
60% means: "I'm not very confident. Maybe the question was unclear, maybe I 
couldn't find good KB sources, maybe there are conflicting pieces of 
information."

Important: Confidence is AI's self-assessment. It's useful context, but not 
a substitute for your judgment.
```

**[01:30-02:30] How to Use Confidence**
```
Here's how I use confidence scores:

[Show high confidence approval]
High confidence (90%+): I still check everything, but I can move quickly. 
Usually these are accurate. Takes 1-2 minutes.

[Show medium confidence]
Medium confidence (70-89%): I review more carefully. Check KB sources, verify 
facts, make sure tone is right. Takes 2-3 minutes.

[Show low confidence]
Low confidence (<70%): Red flag - review very carefully. AI is telling me 
"I'm not sure about this." Often these need rejection or escalation. Takes 
3-5 minutes, sometimes escalate if I'm also unsure.

[Emphasize]
The pattern: Lower confidence = spend more time reviewing.

But remember: High confidence doesn't mean always right. Low confidence 
doesn't mean always wrong. You're the final judge.
```

**[02:30-03:00] Wrap Up**
```
Confidence scores are a helpful signal:
• High = usually reliable, but still verify
• Medium = review carefully
• Low = extra scrutiny, consider escalation

During the pilot, confidence scores will improve as AI learns from your 
decisions. After a few weeks, they'll be even more reliable.

Use them as one input, not the only input. Your judgment is what matters.
```

---

## VIDEO 6: End-to-End Workflow (4 min)

**Purpose:** Complete workflow from logging in to finishing a session  
**Scenario:** Multiple approvals in sequence

### Script

**[00:00-00:30] Intro**
```
Let's put it all together - a complete approval queue session, start to 
finish. I'll show you a realistic 15-minute session where I handle multiple 
approvals.

[Show: Approval queue home screen]
```

**[00:30-01:30] Starting Your Session**
```
I log into Shopify Admin, navigate to HotDash app, click Approval Queue.

[Show navigation]

My dashboard shows: 8 pending approvals. Not too bad.

I check the priority indicator - 1 urgent (low confidence, flagged for 
review). I'll start with that.

[Filter to urgent]

Here it is - 62% confidence, customer angry. Let me review...

[Quick review]

Yep, this needs escalation - customer threatening social media post.

[Escalate with notes]

Escalated. Done. Manager will handle that one.

Now let's move to the regular queue...

[Show queue filtered back to "all"]

7 remaining. Let's go through these efficiently.
```

**[01:30-03:00] Handling Multiple Approvals**
```
[Approval 1]
Order status inquiry, 95% confidence. Quick check - accurate info, good tone. 
Approve. 45 seconds.

[Approval 2]
Product question about ingredients, 91% confidence. KB source looks good. 
Approve. 1 minute.

[Approval 3]
Return request, 80% confidence. Hmm, AI cited old policy. Reject, add note, 
handle manually. 2 minutes 30 seconds.

[Approval 4]
Shipping delay complaint, 88% confidence. AI apologized, provided tracking. 
Good response. Approve. 1 minute.

[Approval 5]
Subscription cancellation, 77% confidence. Wait - AI canceled without trying 
retention first. Reject, offer pause option instead. 2 minutes.

[Approval 6]
Gift card balance check, 96% confidence. Super simple, verified info. 
Approve. 30 seconds.

[Show queue now showing 1 remaining]

Nice progress! One more...
```

**[03:00-03:40] Wrapping Up Session**
```
[Final approval]
Last one - high value refund request ($125). Even though AI's response looks 
good, this is over $100. Escalate per policy. 1 minute.

[Show empty queue]

And... done! Queue clear.

[Show stats]
Session stats:
• Total time: 12 minutes
• Approvals handled: 7 (5 approved, 2 rejected, 2 escalated)
• Average time: ~1 minute 45 seconds per approval

That's a typical session. Some days you'll have more, some less. During 
pilot, expect 5-15 per day.
```

**[03:40-04:00] Wrap Up**
```
Complete workflow:
1. Check queue (every 2-3 hours)
2. Start with urgent/flagged items
3. Work through queue systematically
4. Approve good ones, reject wrong ones, escalate complex ones
5. Clear queue, back to regular work

The approval queue fits into your day - it doesn't replace your regular 
work, it enhances it. Quick, efficient, effective.

That's everything! You're ready to start. Good luck with the pilot!
```

---

## BONUS VIDEO 7: Tips for Efficiency (2 min)

**Purpose:** Advanced tips for experienced operators  
**Optional viewing**

### Script Summary
- Use keyboard shortcuts (if comfortable)
- Batch similar approvals together
- Set aside focused time blocks (vs checking constantly)
- Develop personal rhythm
- Share your own efficiency techniques with team

---

## BONUS VIDEO 8: Real Operator Q&A (3 min)

**Purpose:** Common questions from pilot operators  
**Record after first week of pilot**

### Content
- Compile top 10 questions from first week
- Record answers with screen demonstrations
- Update based on real confusion points
- Personal testimonials from operators

---

## Production Timeline

**Week 1: Scripts & Setup** (Already complete ✅)
- [x] Write scripts for videos 1-6
- [x] Plan bonus videos 7-8
- [x] Set up recording environment

**Week 2: Recording** (When UI is ready)
- [ ] Record videos 1-6 (6 hours)
- [ ] Quality check recordings
- [ ] Re-record any issues

**Week 3: Editing & Publishing** 
- [ ] Edit videos (add captions, highlights) (4 hours)
- [ ] Upload to Loom/platform
- [ ] Create playlist
- [ ] Distribute to operators

**Week 4: Bonus Content** (After pilot week 1)
- [ ] Collect operator questions
- [ ] Record bonus videos 7-8
- [ ] Add to library

---

## Distribution Plan

**Where Videos Live:**
- Loom workspace (or company video platform)
- Playlist: "Approval Queue Training"
- Links shared in Slack #occ-enablement (pinned)
- Embedded in onboarding emails
- Referenced in Quick Start Guide (QR codes)

**Access Control:**
- Restricted to @hotrodan.com emails
- Not public (internal only)
- Downloadable for offline viewing

**Tracking:**
- View counts monitored
- Watch completion rates tracked
- Identify which videos operators skip
- Update least-watched videos

---

## Success Metrics

**After 2 weeks, measure:**
- What % of operators watched each video?
- Which videos have highest/lowest completion rates?
- Do operators who watch videos perform better in pilot?
- What questions still come up (video content gaps)?

**Update videos if:**
- <70% completion rate (too long/boring)
- Same questions keep coming up (content gaps)
- UI changes significantly
- Better examples identified from real queue

---

**Document:** Video Demonstrations Production Guide  
**Created:** 2025-10-12  
**Status:** Scripts complete, ready to record when UI is live  
**Total Videos:** 6 core + 2 bonus = 8 videos (~40 min total)  
**Production Estimate:** 12 hours (recording + editing)

✅ **TASK 2H COMPLETE: Video production guide ready, scripts written**

