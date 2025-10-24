# Chatwoot AI Assistant Training Guide

**Version**: 1.0  
**Last Updated**: 2025-10-24  
**Owner**: Support Team  
**Purpose**: Train customer support agents on AI-assisted reply system

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Getting Started](#getting-started)
4. [AI Draft Review Process](#ai-draft-review-process)
5. [Grading System](#grading-system)
6. [Approval Workflow](#approval-workflow)
7. [Best Practices](#best-practices)
8. [Quick Reference](#quick-reference)

---

## Introduction

### What is AI-Assisted Customer Support?

Hot Rod AN uses an AI-powered system to help you respond to customer inquiries faster and more consistently. The AI analyzes customer messages and drafts suggested responses, which you review, edit if needed, and approve before sending.

**Key Point**: You are always in control. No message is sent without your approval.

### Benefits

✅ **Faster Response Times**: AI drafts responses in seconds  
✅ **Consistent Quality**: AI follows company policies and tone guidelines  
✅ **Learning System**: AI improves based on your feedback  
✅ **Reduced Workload**: Handle more conversations efficiently  
✅ **Better Coverage**: Maintain quality during high-volume periods

### Limitations

⚠️ **AI is not perfect**: Always review drafts carefully  
⚠️ **Context matters**: AI may miss nuances you catch  
⚠️ **Your judgment is essential**: You make the final decision  
⚠️ **Complex cases need human touch**: Some situations require escalation

### Human-In-The-Loop (HITL) Philosophy

**Core Principle**: Agents propose actions; humans approve or correct; the system learns.

- **AI drafts** → **You review** → **You approve/edit** → **Customer receives**
- Your edits and grades teach the AI to improve
- You maintain quality standards and customer relationships

---

## System Architecture

### Workflow Overview

```
Customer Message
    ↓
Chatwoot Inbox (Email/Chat/SMS)
    ↓
Webhook → Hot Dash API
    ↓
Agent SDK (AI Analysis)
    ↓
Private Note (AI Draft)
    ↓
Human Review & Grade
    ↓
Approved Reply → Customer
```

### Components

1. **Chatwoot**: Customer communication platform
   - Receives messages from all channels
   - Displays conversations and drafts
   - Sends approved replies

2. **Agent SDK**: AI analysis engine
   - Analyzes customer intent
   - Queries knowledge base
   - Generates draft responses

3. **Hot Dash**: Approval and grading system
   - Captures your decisions
   - Records grades for learning
   - Tracks performance metrics

### Channels Supported

- **Email**: customer.support@hotrodan.com
- **Live Chat**: Website widget
- **SMS**: Coming soon (Twilio integration)

---

## Getting Started

### Accessing Chatwoot

1. **URL**: https://hotdash-chatwoot.fly.dev
2. **Credentials**: Located in vault/occ/chatwoot/super_admin_staging.env
3. **Login**: Use your assigned email and password

### Understanding the Interface

**Inbox View**:
- Left sidebar: Conversation list
- Center: Selected conversation thread
- Right sidebar: Customer details and tags

**Conversation Thread**:
- Customer messages: White background
- Your replies: Blue background
- Private Notes (AI drafts): Gray background with lock icon

**Key Features**:
- Search conversations
- Filter by status (open, resolved)
- Assign to team members
- Add tags for categorization

### Private Notes vs Public Replies

**Private Notes** (Gray background):
- Only visible to your team
- AI drafts appear as Private Notes
- Use for internal communication
- Not sent to customers

**Public Replies** (Blue background):
- Visible to customers
- Sent via email/chat/SMS
- Require your approval
- Represent your company

---

## AI Draft Review Process

### How AI Drafts Appear

1. Customer sends message
2. Within 5-10 seconds, AI draft appears as Private Note
3. Gray background with "AI Draft" label
4. Includes suggested response text

### Reading and Evaluating Drafts

**Check for**:
- ✅ Correct understanding of customer issue
- ✅ Accurate information (order details, policies)
- ✅ Appropriate tone (empathetic, professional)
- ✅ Complete answer (addresses all questions)
- ✅ Follows company policies

**Red Flags**:
- ❌ Wrong order number or customer details
- ❌ Incorrect policy information
- ❌ Inappropriate tone (too casual or too formal)
- ❌ Missing key information
- ❌ Promises we can't keep

### Decision Framework

**Approve (80% of cases)**:
- Draft is accurate and complete
- Minor edits only (typos, small wording changes)
- Tone is appropriate
- Follows policies

**Edit (15% of cases)**:
- Core message is good but needs refinement
- Add personalization or empathy
- Clarify technical details
- Adjust tone slightly

**Reject (5% of cases)**:
- Draft misunderstands the issue
- Contains factual errors
- Tone is inappropriate
- Violates policies
- Complex case needs human expertise

---

## Grading System

### Why Grading Matters

Your grades teach the AI to improve. Higher grades mean "do more like this." Lower grades mean "avoid this approach."

**Impact**:
- Improves future draft quality
- Helps AI learn your preferences
- Identifies training needs
- Tracks system performance

### Three Dimensions

Every approved response must be graded on:

1. **Tone**: Empathy, professionalism, appropriateness
2. **Accuracy**: Facts correct, complete answer, no misinformation
3. **Policy**: Follows return/refund/warranty policies correctly

### 1-5 Scale Explained

**5 = Perfect**
- Exactly what you would write
- No changes needed
- Exemplary quality

**4 = Good**
- Minor improvements possible
- Acceptable as-is
- Small edits enhance it

**3 = Acceptable**
- Needs some work
- Core message is okay
- Noticeable issues

**2 = Poor**
- Significant problems
- Major edits required
- Below standards

**1 = Unusable**
- Completely wrong
- Must rewrite entirely
- Unacceptable quality

### Grading Guidelines

#### Tone Grading

**5/5 - Perfect Tone**:
- Matches customer emotion perfectly
- Empathetic and understanding
- Professional yet warm
- Appropriate formality level

**3/5 - Acceptable Tone**:
- Generally appropriate
- Could be more empathetic
- Slightly too formal or casual
- Misses emotional nuance

**1/5 - Unusable Tone**:
- Robotic or cold
- Dismissive of concerns
- Inappropriate for situation
- Offensive or unprofessional

#### Accuracy Grading

**5/5 - Perfect Accuracy**:
- All facts correct
- Complete answer provided
- No missing information
- Verified details

**3/5 - Acceptable Accuracy**:
- Mostly correct
- Minor details missing
- Some clarification needed
- Generally reliable

**1/5 - Unusable Accuracy**:
- Wrong information
- Misunderstood problem
- Dangerous misinformation
- Completely incorrect

#### Policy Grading

**5/5 - Perfect Policy**:
- Follows all policies exactly
- Correct return window
- Accurate warranty terms
- Proper escalation

**3/5 - Acceptable Policy**:
- Generally compliant
- Minor policy details missed
- Could be more precise
- No major violations

**1/5 - Unusable Policy**:
- Violates policies
- Unauthorized promises
- Incorrect terms
- Legal/compliance issues

### Grading Examples

**Example 1: High Grade (5/5/5)**

Customer: "My oil filter leaked and damaged my engine!"

AI Draft:
```
Hi [Customer],

I'm so sorry to hear about the oil filter leak and the damage to your engine. 
This is absolutely not the quality we stand for, and I want to make this right 
immediately.

Here's what I'm doing:
1. Full refund for the oil filter ($24.99)
2. Replacement filter shipped today (expedited, no charge)
3. Engine repair assessment - please send photos and repair estimate

Our warranty covers defects that cause damage. I'll personally review your case 
and ensure you're fully taken care of.

Again, my sincere apologies. I'll follow up within 24 hours.

Best regards,
[Your Name]
```

**Grades**:
- Tone: 5/5 (Empathetic, takes ownership, reassuring)
- Accuracy: 5/5 (Correct warranty info, clear next steps)
- Policy: 5/5 (Follows defect damage policy perfectly)

**Example 2: Low Grade (2/2/1)**

Customer: "My order is 3 days late!"

AI Draft:
```
Please be patient. Shipping takes time.
```

**Grades**:
- Tone: 2/5 (Dismissive, no empathy, too brief)
- Accuracy: 2/5 (No tracking info, no investigation)
- Policy: 1/5 (Violates service standards, no resolution offered)

---

## Approval Workflow

### Step-by-Step Process

**Step 1: Receive Notification**
- New conversation appears in Chatwoot
- AI draft appears as Private Note (gray background)

**Step 2: Review Draft**
- Read customer message carefully
- Review AI draft response
- Check tone, accuracy, policy compliance

**Step 3: Make Decision**
- Approve: Copy draft, send as-is or with minor edits
- Edit: Copy draft, make substantial changes, send
- Reject: Write completely new response

**Step 4: Send Reply**
- Click "Reply" button
- Paste approved text (if using draft)
- Add any final touches
- Click "Send"

**Step 5: Grade Response**
- Navigate to Hot Dash App → Settings → Integrations → Chatwoot
- Find the conversation
- Grade on Tone, Accuracy, Policy (1-5 scale)
- Submit grades

**Step 6: Close or Continue**
- If issue resolved: Mark conversation as "Resolved"
- If waiting for customer: Leave open
- If escalated: Tag appropriately and notify manager

### Editing AI Drafts

**Minor Edits** (Approve with edits):
- Fix typos or grammar
- Add customer name
- Adjust one or two words
- Personalize slightly

**Substantial Edits** (Edit category):
- Rewrite paragraphs
- Add significant information
- Change tone substantially
- Restructure response

**Complete Rewrite** (Reject):
- Draft misses the point
- Factual errors throughout
- Inappropriate approach
- Complex case needs expertise

### Logging Decisions

All your decisions are automatically logged:
- Which option you chose (approve/edit/reject)
- Your grades (tone/accuracy/policy)
- Time to decision
- Any edits you made

This data helps:
- Improve AI performance
- Track your productivity
- Identify training needs
- Measure system effectiveness

---

## Best Practices

### Response Time Targets

- **Email**: <2 hours (business hours)
- **Live Chat**: <5 minutes
- **Resolution**: <4 hours (simple), <48 hours (complex)
- **Compliance Rate**: >95%

### Quality Standards

✅ **Always**:
- Review drafts carefully before approving
- Verify order numbers and customer details
- Check policy compliance
- Grade honestly and consistently
- Escalate when unsure

❌ **Never**:
- Approve without reading
- Send incorrect information
- Make unauthorized promises
- Skip grading
- Ignore red flags

### Escalation Procedures

**Automatic Escalation Triggers**:
1. Legal keywords (chargeback, lawyer, sue, fraud)
2. SLA breach >30 minutes
3. VIP customer (bulk order, dealer)
4. Product defect causing damage
5. Refund request >$500
6. Abusive/threatening language

**How to Escalate**:
1. Tag in Chatwoot: `escalated`, `needs_ceo`, `urgent`
2. Create Private Note with details
3. Notify manager in feedback file
4. Follow up every 2 hours

### Common Pitfalls to Avoid

❌ **Blind Approval**: Always read the draft  
❌ **Inconsistent Grading**: Use the same standards  
❌ **Skipping Verification**: Check order details  
❌ **Ignoring Tone**: Match customer emotion  
❌ **Missing Escalations**: When in doubt, escalate

---

## Quick Reference

### Workflow Summary

1. Customer message arrives
2. AI draft appears (gray Private Note)
3. Review draft (tone, accuracy, policy)
4. Decide: Approve / Edit / Reject
5. Send reply to customer
6. Grade response (1-5 scale × 3 dimensions)
7. Close or continue conversation

### Grading Scale

| Score | Tone | Accuracy | Policy |
|-------|------|----------|--------|
| 5 | Perfect empathy | All facts correct | Follows all policies |
| 4 | Good, minor tweaks | Mostly correct | Generally compliant |
| 3 | Acceptable | Some gaps | Minor issues |
| 2 | Poor | Significant errors | Policy concerns |
| 1 | Unusable | Wrong information | Violations |

### Response Times

- Email: <2 hours
- Chat: <5 minutes
- Compliance: >95%

### Escalation Triggers

Legal keywords, SLA breach, VIP, damage claims, refund >$500, threats

### Resources

- **Chatwoot**: https://hotdash-chatwoot.fly.dev
- **Credentials**: vault/occ/chatwoot/
- **Feedback**: feedback/support/YYYY-MM-DD.md
- **Integration Guide**: docs/support/chatwoot-integration-guide.md
- **CX Team Guide**: docs/runbooks/cx-team-guide.md

---

## Next Steps

1. **Complete onboarding**: Review this guide thoroughly
2. **Practice**: Review sample scenarios (see chatwoot-scenarios-examples.md)
3. **Shadow**: Observe experienced agent for 1-2 hours
4. **Start**: Begin with simple inquiries, escalate complex cases
5. **Improve**: Use grading feedback to refine your approach

---

**Remember**: You are the human in the loop. Your judgment, empathy, and expertise make the difference. The AI is your assistant, not your replacement. Grade honestly, escalate freely, and prioritize customer satisfaction.

**Questions?** Contact your manager or refer to the troubleshooting guide (chatwoot-troubleshooting.md).

