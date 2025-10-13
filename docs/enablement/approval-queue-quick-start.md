---
epoch: 2025.10.E1
doc: docs/enablement/approval-queue-quick-start.md
owner: support
category: operator-training
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [approval-queue, operator-training, agent-sdk, decision-criteria]
---

# Approval Queue Quick Start Guide

**Purpose**: Train operators to approve/reject AI agent actions in the HotDash approval queue  
**Target Audience**: Customer support operators using Agent SDK  
**Reading Time**: 5-10 minutes  
**Created**: October 12, 2025

---

## 🎯 What Is the Approval Queue?

The **Approval Queue** is where AI-generated customer responses wait for human operator review before being sent.

**Why Human Approval?**
- ✅ Ensures accuracy before sending
- ✅ Catches AI mistakes or hallucinations
- ✅ Maintains brand voice and quality
- ✅ Handles edge cases the AI can't
- ✅ Builds trust with customers

**Your Role**: You're the final quality check. The AI drafts responses, you approve or modify before sending.

---

## 📋 How It Works (3 Steps)

### Step 1: AI Agent Generates Response

**What Happens**:
- Customer sends message via Chatwoot (email, chat, etc.)
- AI agent (powered by LlamaIndex + Agent SDK) reads the message
- AI searches knowledge base (playbooks, docs, FAQs)
- AI generates a draft response
- Draft goes to **Approval Queue** (doesn't send yet!)

**You Don't See**: The AI's research process  
**You Do See**: The final draft response ready for review

---

### Step 2: You Review & Decide

**What You See**:
```
┌─────────────────────────────────────────────────┐
│ APPROVAL QUEUE                                  │
├─────────────────────────────────────────────────┤
│ Customer: John Smith                            │
│ Subject: Fuel line fitting size question        │
│ Received: 10:23 AM                              │
│                                                  │
│ [Customer's Original Message]                   │
│ "What size AN fitting do I need for my 3/8"    │
│  fuel hose on a 350 HP small block?"           │
│                                                  │
│ [AI-Generated Response Draft]                   │
│ "Hi John,                                       │
│                                                  │
│  For a 3/8" fuel hose, you need AN-6 fittings. │
│  For your 350 HP small block, AN-6 (3/8")      │
│  feed line is perfect for street performance.  │
│                                                  │
│  Here's what you'll need:                       │
│  • AN-6 hose ends (qty based on your setup)    │
│  • AN-6 adapters for your carburetor/pump      │
│  • AN-4 (1/4") for your return line            │
│                                                  │
│  Can I help you identify specific parts?        │
│                                                  │
│  [Your Name]"                                   │
│                                                  │
│ ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│ │   APPROVE   │  │   MODIFY    │  │  REJECT  │ │
│ └─────────────┘  └─────────────┘  └──────────┘ │
└─────────────────────────────────────────────────┘
```

**Your Job**: Decide APPROVE, MODIFY, or REJECT

---

### Step 3: Take Action

**Option 1: APPROVE** ✅
- Response is accurate and helpful
- Tone is appropriate
- All information is correct
- Click **APPROVE** → Sends to customer immediately

**Option 2: MODIFY** ✏️
- Response is mostly good but needs tweaks
- Click **MODIFY** → Edit response → Save & Send
- Common modifications:
  - Add personalization
  - Adjust tone
  - Add or remove details
  - Fix minor errors

**Option 3: REJECT** ❌
- Response is wrong, unhelpful, or inappropriate
- Click **REJECT** → Provide reason → AI learns
- Response goes back to draft, doesn't send
- You handle manually or request new draft

---

## ✅ Decision Criteria: When to APPROVE

### Green Light Indicators (Safe to Approve)

**1. Factually Accurate**
- ✅ Product information is correct (AN-6 = 3/8", not AN-8)
- ✅ Prices are accurate (if mentioned)
- ✅ Links go to correct products
- ✅ Technical specs match our documentation

**2. Helpful & Complete**
- ✅ Answers the customer's question fully
- ✅ Provides actionable next steps
- ✅ Offers additional help if needed
- ✅ Not too brief, not too long

**3. Professional Tone**
- ✅ Friendly but professional
- ✅ Uses customer's name appropriately
- ✅ No slang or overly casual language
- ✅ No emojis (unless customer used them first)
- ✅ Matches Hot Rod AN brand voice

**4. Safe & Compliant**
- ✅ Doesn't promise what we can't deliver
- ✅ Follows return/warranty policies
- ✅ No unsafe advice (e.g., temporary fixes for brakes)
- ✅ Appropriate escalation if needed

**Example of APPROVE-Ready Response**:
```
Hi John,

For a 3/8" fuel hose, you'll need AN-6 fittings. That's the correct 
size for your 350 HP small block street setup.

Here's what you'll need:
• AN-6 hose ends (qty depends on your fuel line routing)
• AN-6 to NPT adapters (for carburetor and fuel pump connections)
• AN-4 (1/4") fittings for your return line

I can help you identify the specific adapters once you know what 
carburetor and fuel pump you're using. Just let me know!

Best,
[Operator Name]
```

**Why This Is APPROVE-Ready**:
- ✅ Correct sizing (AN-6 = 3/8")
- ✅ Appropriate for HP level
- ✅ Helpful detail without overwhelming
- ✅ Offers follow-up help
- ✅ Professional tone

---

## ✏️ Decision Criteria: When to MODIFY

### Yellow Light Indicators (Needs Minor Tweaks)

**1. Tone Adjustment Needed**
- ⚠️ Too formal: "We hereby inform you that..."
  - **Fix**: "Hi John, here's what you need..."
- ⚠️ Too casual: "Yo, you'll need AN-6 bro"
  - **Fix**: "Hi John, you'll need AN-6 fittings..."

**2. Missing Personalization**
- ⚠️ Generic: "Hello, here is your answer..."
  - **Fix**: "Hi John, for your 350 HP small block..."

**3. Small Factual Errors**
- ⚠️ Wrong name: "Hi James," (customer is John)
  - **Fix**: "Hi John,"
- ⚠️ Minor inaccuracy: "AN-6 is 5/16 inch"
  - **Fix**: "AN-6 is 3/8 inch"

**4. Needs Expansion or Reduction**
- ⚠️ Too brief: "You need AN-6. Thanks."
  - **Fix**: Add context about why AN-6 is correct
- ⚠️ Too long: 5 paragraphs of technical detail
  - **Fix**: Condense to key points

**5. Formatting Issues**
- ⚠️ Wall of text (no line breaks)
  - **Fix**: Add line breaks, bullet points
- ⚠️ Broken links or formatting
  - **Fix**: Correct links, clean up formatting

**Example of MODIFY-Needed Response**:
```
BEFORE (Needs Modification):
"Dear Customer,

Pursuant to your inquiry regarding AN fitting sizing for 3/8 inch 
fuel hose applications, please be advised that the appropriate 
size designation is AN-6. This sizing is derived from the nominal 
dash number system wherein AN-6 correlates to 3/8 inch inner 
diameter specifications per military standard MS33514.

Respectfully,
Support Team"

AFTER (Modified):
"Hi John,

For a 3/8" fuel hose, you'll need AN-6 fittings. That's perfect 
for your 350 HP small block.

I can help you select the right adapters for your carburetor and 
fuel pump. What brand are you using?

Best,
[Operator Name]"
```

**What Changed**:
- ✏️ Changed overly formal tone to friendly professional
- ✏️ Added customer's name
- ✏️ Referenced their specific engine
- ✏️ Removed unnecessary technical jargon
- ✏️ Added helpful follow-up question

---

## ❌ Decision Criteria: When to REJECT

### Red Light Indicators (Do NOT Send)

**1. Factually Incorrect** 🚫
- ❌ Wrong product size: "AN-8 for 3/8 inch hose" (should be AN-6)
- ❌ Wrong HP recommendation: "AN-4 is fine for 500 HP" (too small)
- ❌ Incorrect pricing or availability
- ❌ Links to wrong products

**2. Unsafe Advice** 🚫
- ❌ "Just use duct tape to stop the fuel leak temporarily"
- ❌ "Thread sealant works great on AN flare fittings" (NO! Metal-to-metal seal)
- ❌ "You can skip the fuel pressure regulator"
- ❌ Any advice that could cause injury, fire, or damage

**3. Violates Policy** 🚫
- ❌ Promises free shipping (not our policy)
- ❌ Offers unauthorized discounts
- ❌ Commits to delivery dates we can't guarantee
- ❌ Accepts return outside policy window (without manager approval)

**4. Completely Unhelpful** 🚫
- ❌ Doesn't answer the question at all
- ❌ "I don't know, contact us"
- ❌ Gibberish or incomplete sentences
- ❌ Repeats customer's question back without answering

**5. Inappropriate Tone** 🚫
- ❌ Rude or dismissive
- ❌ Overly sales-y or pushy
- ❌ Makes assumptions about customer skill level
- ❌ Uses offensive or inappropriate language

**6. Hallucinated Information** 🚫
- ❌ Makes up product names or part numbers that don't exist
- ❌ Invents features our products don't have
- ❌ Creates fake customer testimonials
- ❌ Fabricates technical specifications

**Example of REJECT-Worthy Response**:
```
REJECT THIS:
"Hi John,

For your 3/8" hose, you'll need AN-8 fittings. AN-8 is the standard 
for all 3/8" applications.

For your 350 HP engine, AN-4 feed line is plenty. You can also use 
thread sealant on the flare fittings to prevent leaks.

If you order today, I can give you 50% off and free overnight 
shipping!

Best,
Support"
```

**Why REJECT**:
- ❌ WRONG: AN-8 is NOT for 3/8" (should be AN-6)
- ❌ WRONG: AN-4 is too small for 350 HP feed line
- ❌ UNSAFE: Thread sealant on AN flares is incorrect (damages seal)
- ❌ POLICY VIOLATION: Unauthorized discount and shipping promise

**What to Do After REJECT**:
1. Click **REJECT**
2. Note reason: "Incorrect sizing, unsafe advice, policy violation"
3. Handle customer inquiry manually using playbooks
4. Report issue so AI can learn from mistake

---

## 🚨 Escalation Criteria

### When to Escalate (Don't Approve OR Reject)

**Escalate to Manager if**:
- 🚨 Customer is angry or threatening
- 🚨 Request for policy exception (refund outside window, special discount)
- 🚨 High-value order (>$5,000)
- 🚨 Legal threat or liability concern
- 🚨 Media or competitor inquiry

**Escalate to Technical Support if**:
- 🚨 Complex technical question beyond playbooks
- 🚨 Safety concern (fuel fire, brake failure)
- 🚨 Product defect suspected
- 🚨 Racing application (800+ HP, forced induction)

**How to Escalate**:
1. Click **REJECT** (don't send draft)
2. Tag ticket: `[ESCALATION]`
3. Forward to appropriate team with context
4. Notify customer: "I'm getting our [manager/technical team] involved to give you the best answer"

---

## 📊 Decision Flow Chart

```
┌─────────────────────────────────────┐
│ AI Draft Response Ready for Review │
└──────────────┬──────────────────────┘
               │
               ▼
     ┌─────────────────────┐
     │ Is it FACTUALLY     │
     │ CORRECT?            │
     └─────┬───────────┬───┘
           │           │
          NO          YES
           │           │
           │           ▼
           │  ┌─────────────────────┐
           │  │ Is it SAFE &        │
           │  │ POLICY-COMPLIANT?   │
           │  └─────┬───────────┬───┘
           │        │           │
           │       NO          YES
           │        │           │
           │        │           ▼
           │        │  ┌─────────────────────┐
           │        │  │ Is TONE appropriate?│
           │        │  └─────┬───────────┬───┘
           │        │        │           │
           │        │   Needs Minor    Perfect
           │        │    Tweaks         │
           │        │        │           │
           ▼        ▼        ▼           ▼
       ┌─────┐  ┌─────┐  ┌────────┐  ┌─────────┐
       │REJECT│  │REJECT│  │ MODIFY │  │ APPROVE │
       └─────┘  └─────┘  └────────┘  └─────────┘
```

---

## 🎯 Performance Expectations

### Quality Metrics

**Accuracy Rate**:
- Target: >95% of approved responses should be error-free
- Track: Customer follow-ups due to incorrect information
- Goal: Minimize need for correction emails

**Response Time**:
- Target: Review and approve within 5 minutes of draft arrival
- Rush orders: <2 minutes
- Complex reviews: Up to 15 minutes (with modifications)

**Approval Ratios** (Expected for New Operators):
- **APPROVE**: 60-70% (AI is usually good!)
- **MODIFY**: 20-30% (minor tweaks needed)
- **REJECT**: 5-10% (AI made mistake)

**Approval Ratios** (Expected for Experienced Operators):
- **APPROVE**: 70-80% (AI learns from your feedback)
- **MODIFY**: 15-25%
- **REJECT**: <5%

---

## 💡 Tips for Success

### Do's ✅

**1. Trust But Verify**
- AI is usually right, but always read carefully
- Check product specs against playbooks if unsure
- When in doubt, verify before approving

**2. Think Like the Customer**
- Would this response help YOU if you were the customer?
- Is it clear, friendly, and actionable?
- Does it solve their problem?

**3. Maintain Brand Voice**
- Hot Rod AN is friendly but professional
- We're car enthusiasts helping car enthusiasts
- Knowledgeable without being condescending

**4. Use Playbooks**
- Keep playbooks open in another tab
- Reference when reviewing technical responses
- Playbooks are your source of truth

**5. Provide Feedback**
- When rejecting, note WHY (helps AI learn)
- Suggest improvements in rejection notes
- Report patterns (AI consistently makes same mistake)

### Don'ts ❌

**1. Don't Blindly Approve**
- ❌ "AI is smart, I'll just approve everything"
- Risk: Sends wrong/unsafe information to customers

**2. Don't Over-Modify**
- ❌ Rewriting entire response when 1-2 tweaks needed
- Efficiency: Modify only what's necessary

**3. Don't Forget Customer Context**
- ❌ Ignoring customer's specific situation
- Example: Customer said "race car" but response is for street car

**4. Don't Make Promises**
- ❌ Adding "I'll get this out today!" without verifying
- Stick to what AI drafted (if accurate) or verify before adding

**5. Don't Skip Escalation**
- ❌ Approving complex technical question you're not sure about
- Escalate when appropriate—safety first!

---

## 🔄 Feedback Loop: AI Learns From You

### How Your Actions Improve the AI

**When You APPROVE**:
- AI learns: "This response was good!"
- Future: AI generates similar responses
- Impact: Approval rate increases over time

**When You MODIFY**:
- AI learns: "This approach works, but needs these adjustments"
- Future: AI incorporates your modifications
- Impact: Fewer modifications needed

**When You REJECT**:
- AI learns: "This approach doesn't work"
- Future: AI avoids similar mistakes
- Impact: Rejection rate decreases

**Your Role**: You're training the AI to be better. Every decision you make teaches it!

---

## 📞 Getting Help

### When You Need Support

**Technical Issues** (Approval queue not loading, buttons not working):
- Contact: tech-support@hotdash.com
- Slack: #support-tech-help
- Expected Response: <30 minutes

**Decision Uncertainty** (Not sure whether to approve/reject):
- Contact: Your team lead or manager
- Slack: #support-team
- Playbooks: Reference technical escalation matrix

**Training Questions** (How do I...?):
- Documentation: This guide + operator playbooks
- Training: Schedule refresher with manager
- Peer Support: Ask experienced operators

---

## 📚 Related Documentation

### Required Reading
- `docs/support/playbooks/hot-rod-an/README.md` - Master playbook index
- `docs/support/playbooks/hot-rod-an/01-an-fittings-product-knowledge.md` - Product basics
- `docs/support/playbooks/hot-rod-an/07-technical-escalation-matrix.md` - When to escalate

### Reference Materials
- `docs/AgentSDKopenAI.md` - How Agent SDK works (technical)
- `docs/support/playbooks/hot-rod-an/` - All Hot Rod AN playbooks
- Hot Rod AN Product Catalog (www.hotrodan.com)

---

## ✅ Quick Reference Checklist

### Before You APPROVE, Check:

- [ ] **Accurate**: All facts are correct (sizing, HP, pricing)
- [ ] **Safe**: No unsafe advice or instructions
- [ ] **Helpful**: Answers customer's question fully
- [ ] **Professional**: Tone is friendly but professional
- [ ] **Complete**: Includes next steps or offers help
- [ ] **Policy-Compliant**: Doesn't violate return/warranty/shipping policies
- [ ] **Brand Voice**: Matches Hot Rod AN communication style

**If all checked ✅ → APPROVE**  
**If 1-2 minor issues → MODIFY**  
**If major issues → REJECT**

---

## 🎓 Certification Quiz (Coming Soon)

To be certified for approval queue operations, you'll complete a quiz:
- 10 sample AI responses to review
- Make APPROVE/MODIFY/REJECT decisions
- Passing score: 8/10 correct
- Retake available after training review

**Training Timeline**:
- Week 1: Read this guide + shadow experienced operator
- Week 2: Supervised approval queue work
- Week 3: Certification quiz + independent work

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Review Frequency**: Monthly  
**Next Review**: November 12, 2025

**Questions?** Contact support-training@hotdash.com or post in #support-team Slack channel

---

## 🖨️ Printable Quick Reference Card

```
┌──────────────────────────────────────────────────────┐
│     APPROVAL QUEUE QUICK REFERENCE                   │
├──────────────────────────────────────────────────────┤
│ ✅ APPROVE IF:                                       │
│   • Factually accurate                               │
│   • Safe & policy-compliant                          │
│   • Helpful & complete                               │
│   • Professional tone                                │
│                                                       │
│ ✏️ MODIFY IF:                                        │
│   • Minor tone adjustments needed                    │
│   • Small factual errors                             │
│   • Needs personalization                            │
│   • Formatting issues                                │
│                                                       │
│ ❌ REJECT IF:                                        │
│   • Factually wrong (wrong sizes, specs)             │
│   • Unsafe advice (could cause injury/damage)        │
│   • Policy violation (unauthorized promises)         │
│   • Unhelpful or incomplete                          │
│   • Hallucinated information                         │
│                                                       │
│ 🚨 ESCALATE IF:                                      │
│   • Angry customer or legal threat                   │
│   • Policy exception request                         │
│   • High-value order (>$5K)                          │
│   • Complex technical beyond playbooks               │
│   • Safety concern                                   │
├──────────────────────────────────────────────────────┤
│ TARGET: 70%+ Approve | 20-30% Modify | <10% Reject   │
│ TIME: <5 min review | <2 min rush orders             │
└──────────────────────────────────────────────────────┘
```

**Keep This At Your Desk!** 📌

---

**Welcome to the HotDash Approval Queue! You're the final quality check that keeps our customers happy. 🚗💨**

