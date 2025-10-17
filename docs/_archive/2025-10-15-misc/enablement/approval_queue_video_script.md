# Approval Queue Walkthrough - Video Script

**Video Title:** "Agent SDK Approval Queue - Quick Start"  
**Duration:** 5-6 minutes  
**Format:** Screen recording with voiceover  
**Purpose:** Show operators how to use approval queue  
**Status:** Script ready, record when UI is live

---

## Recording Setup

**Before Recording:**

- [ ] Approval queue UI is live
- [ ] Demo environment with 3 sample approvals loaded
- [ ] Screen recording software ready (Loom recommended)
- [ ] Microphone tested
- [ ] Browser window clean (no extra tabs/bookmarks)
- [ ] Mock data only (no real customer info)

**Recording Settings:**

- Resolution: 1080p
- Frame rate: 30fps
- Capture: Application window (not full screen)
- Audio: Clear microphone, -18dB level
- Mouse: Large cursor with highlight enabled

---

## Video Script

### [00:00-00:30] Introduction

**[Show: HotDash logo or blank screen]**

**Say:**
"Hi! I'm [Name] from the HotDash team. In this quick video, I'll show you how to use the Agent SDK approval queue. By the end, you'll know exactly how to review and approve AI-prepared customer responses. Let's get started!"

**[Transition to approval queue screen]**

---

### [00:30-01:15] The Approval Queue Overview

**[Show: Navigate to /app/approvals]**

**Say:**
"Here's the approval queue. This is where AI-prepared customer responses wait for your review.

**[Point to key elements on screen]**

At the top, you can see how many approvals are pending. Right now we have 3.

Below that are stats - how many you've approved today, average review time.

And here are the actual approval cards - each one is a customer inquiry that AI has prepared a response for.

Let's look at one up close."

**[Click on first approval card to expand it]**

---

### [01:15-02:30] Approval Card Walkthrough

**[Show: Expanded approval card]**

**Say:**
"Here's what you see in each approval card.

**[Point to each section as you explain]**

At the top: Customer name and conversation ID.

Here's the customer's original message - always read this first. In this case, customer is asking 'Where is my order #12345?'

Below that is what the AI prepared as a response. Let me read it: 'Hi! Your order #12345 shipped yesterday via FedEx. Tracking number is...'

Over here is the confidence score - 95%, which is high. That means AI is pretty confident this is a good answer.

And down here are the KB sources - the knowledge base articles AI used to prepare this response.

Simple, right? Now let's decide what to do with it."

---

### [02:30-03:15] Making an Approval Decision

**[Still showing the approval card]**

**Say:**
"To decide, I ask myself three quick questions:

1. Is the information accurate? Let me check - yes, order #12345 did ship yesterday.

2. Does it answer the customer's question? Yes, they asked where their order is, and we told them.

3. Is the tone appropriate? Yes, it's friendly and professional.

All three check out, so I'll approve this.

**[Move mouse to 'Approve & Execute' button]**

I click 'Approve & Execute' and...

**[Click button, show response being sent]**

Done! The response is sent to the customer immediately. That took about 30 seconds total.

Most of your approvals will be this straightforward."

---

### [03:15-04:15] When to Reject

**[Show: Open second approval card]**

**Say:**
"Now let me show you when to reject.

**[Read customer message]**

Customer asks: 'Can I return this after 20 days?'

**[Read AI draft]**

AI says: 'Our policy is 14 days, so unfortunately no.'

**[Pause]**

Wait - I know our return policy is actually 30 days, not 14. The AI has wrong information here.

**[Move to Reject button]**

I click 'Reject', add a quick note - 'AI cited wrong policy, actual is 30 days' - and I'll handle this manually in Chatwoot with the correct information.

**[Show rejection confirmation]**

This helps the AI learn not to make this mistake again.

You're the quality check - catch AI errors before they reach customers."

---

### [04:15-05:30] When to Escalate - MOST IMPORTANT

**[Show: Open third approval card]**

**Say:**
"This is the most important part - when to escalate.

**[Read customer message, emphasize alarming parts]**

Customer says: 'You charged me TWICE! $600 total instead of $300! I'm calling my bank RIGHT NOW!'

**[Point to red flags]**

I see two major red flags here:

- First, high value - $600 dispute
- Second, threat - 'calling my bank' means potential chargeback

**[Move to Escalate button]**

I don't approve OR reject this - I escalate it.

**[Click Escalate, fill out form]**

Select reason: 'High-Value Issue + Threat'

Add quick notes about what's happening.

**[Submit]**

Submit, and my manager gets notified within 15 minutes. They'll handle this directly.

**[Show confirmation]**

Here's the rule: **Always escalate when you see threats, high value over $100, technical issues, or if you're unsure.**

When in doubt, escalate. That's good judgment, not weakness."

---

### [05:30-06:00] Wrap-Up

**[Show: Queue overview again or Quick Start Guide]**

**Say:**
"That's it! You now know how to:

- Approve simple ones
- Reject wrong ones
- Escalate risky ones

Most of what you'll see are simple approvals. Review, check accuracy, approve. Takes 1-2 minutes.

During the pilot, you'll probably see 5-15 of these per day. The rest of your work is normal Chatwoot.

**[Show Quick Start Guide on screen]**

You have this Quick Start Guide at your desk - use it anytime you need a reminder.

Questions? Ask in Slack #occ-enablement or talk to your manager.

Now let's try it for real - you've got this!"

**[End screen: Contact info and resources]**

---

## Screen Recording Flow

**Sequence:**

1. Navigate to approval queue
2. Show queue overview (pending, stats)
3. Open Approval #1 (simple order status)
4. Walk through approval decision
5. Click Approve, show result
6. Open Approval #2 (wrong policy)
7. Identify error, reject with notes
8. Open Approval #3 (high-value + threat)
9. Identify red flags, escalate
10. Return to queue overview
11. Show Quick Start Guide
12. End with resources

**Total Recording Time:** 6-7 minutes including intro/outro

---

## Voiceover Notes

**Tone:** Friendly, encouraging, not robotic  
**Pace:** Moderate (not too fast)  
**Energy:** Positive and confident  
**Pauses:** After each major point  
**Emphasis:** RED FLAGS, escalation criteria, "you're in control"

**Key Phrases to Use:**

- "You're in control"
- "AI suggests, you decide"
- "This is simple"
- "When in doubt, escalate"
- "You've got this"

---

## Post-Production

**Add:**

- [ ] Captions (auto-generate, then edit)
- [ ] Arrows highlighting key UI elements
- [ ] Text overlay for "RED FLAGS" moment
- [ ] Intro card (title, your name)
- [ ] Outro card (Resources: Slack #occ-enablement, Quick Start Guide)

**Quality Check:**

- [ ] Audio clear throughout
- [ ] All UI elements visible and readable
- [ ] Pacing appropriate (not too fast)
- [ ] Information accurate
- [ ] Length under 7 minutes

---

## Distribution

**Upload to:** Loom (or company video platform)  
**Access:** Restricted to @hotrodan.com emails  
**Share via:**

- Email to pilot operators
- Link in #occ-enablement Slack
- Embedded in Quick Start Guide (QR code)

**Backup:** Download MP4, store in vault

---

**Status:** Script ready, record when UI is live  
**Estimated Production Time:** 2 hours (recording + editing)  
**Priority:** Complete before pilot launches
