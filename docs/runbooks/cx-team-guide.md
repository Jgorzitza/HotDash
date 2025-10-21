# CX Team Guide — Hot Rod AN Customer Support

**Version**: 1.0  
**Last Updated**: 2025-10-21  
**Owner**: Support Agent  

---

## Overview

Hot Rod AN uses an AI-assisted customer support system with **Human-In-The-Loop (HITL)** approval. Every AI-drafted response requires human review and approval before being sent to customers.

### System Architecture

```
Customer Message → Chatwoot → Webhook → Agent SDK → AI Draft (Private Note) → Human Review → Approved Reply
```

### Key Principles

1. **HITL by Default**: No message sent without human approval
2. **AI Assistance**: AI drafts responses as Private Notes
3. **Human Judgment**: CX team reviews, edits, and grades all responses
4. **Continuous Learning**: Grading data improves AI over time

---

## Approval Workflow (HITL)

### Step 1: AI Drafts Response
- AI analyzes conversation context
- AI drafts response as Chatwoot Private Note
- Private Note appears with gray background

### Step 2: Human Reviews
View AI draft in Chatwoot conversation thread

### Step 3: Human Decision
- **Approve (80%)**: Copy draft, minor edits, send
- **Edit (15%)**: Copy draft, substantial edits, send
- **Reject (5%)**: Write completely new response

### Step 4: Grade AI Response (MANDATORY)
Navigate to Hot Dash App → Settings → Integrations → Chatwoot

Grade on 3 dimensions (1-5 scale):
- **Tone**: Empathy, professionalism, appropriate for situation
- **Accuracy**: Facts correct, complete answer, no misinformation
- **Policy**: Follows return/refund/warranty policies correctly

---

## Grading Guidelines

### 5/5 = Perfect
- **Tone 5**: Matches customer emotion, empathetic, professional
- **Accuracy 5**: All facts correct, complete answer
- **Policy 5**: Follows all policies perfectly

### 1/5 = Unusable
- **Tone 1**: Robotic, dismissive, inappropriate
- **Accuracy 1**: Wrong information, misunderstood problem
- **Policy 1**: Violated policy, unauthorized promise

### Example High Grade (5/5/5)
Customer: "My oil filter leaked and damaged my engine!"

AI Draft apologizes, offers full refund, replacement, and engine repair assessment. Empathetic, accurate about warranty, follows defect policy.

### Example Low Grade (2/2/1)
Customer: "My order is 3 days late!"

AI Draft: "Please be patient. Shipping takes time."
- No tracking info, dismissive tone, violates service standards

---

## Escalation Procedures

### Automatic Escalation Triggers
1. Legal keywords (chargeback, lawyer, sue, fraud)
2. SLA breach >30 minutes
3. VIP customer (bulk order, dealer)
4. Product defect causing damage
5. Refund request >$500
6. Abusive/threatening language

### How to Escalate
1. **Tag in Chatwoot**: Add tags `escalated`, `needs_ceo`, `urgent`
2. **Create Private Note**: 
   ```
   ESCALATION REQUIRED
   Customer: [Name]
   Issue: [Description]
   Reason: [Why escalating]
   What I've tried: [Actions taken]
   Recommended resolution: [Your suggestion]
   ```
3. **Notify Manager**: Log in feedback/support/YYYY-MM-DD.md
4. **Follow Up**: Check every 2 hours, update customer

---

## Response Templates

### Order Status
```
Hi [Customer],

I've checked on order #[ID].

Status: [STATUS]
Tracking: [TRACKING_NUMBER]
Expected: [DATE]

Is there anything else I can help with?

Best regards,
[Your Name]
```

### Refund Request
```
Hi [Customer],

I've approved your refund on order #[ID].

Return label: Attached
Refund: $[AMOUNT] within 5-7 business days

Thanks for your understanding!
```

### Apology
```
Hi [Customer],

I sincerely apologize for [ISSUE].

Here's what I'm doing:
1. [ACTION 1]
2. [ACTION 2]
3. [COMPENSATION]

Again, my apologies.
```

---

## SLA Compliance

### Targets
- **Email**: <2 hours (business hours)
- **Live Chat**: <5 minutes
- **Resolution**: <4 hours (simple), <48 hours (complex)
- **Compliance Rate**: >95%

### SLA Breach Protocol
1. Acknowledge immediately
2. Investigate why it breached
3. Respond with full solution
4. Consider compensation (10% discount)
5. Document breach reason

---

## Channel Management

**Email (customer.support@hotrodan.com)**:
- Response time: 2-4 hours
- Use full signatures, professional formatting
- Include order numbers, attach files

**Live Chat (Website Widget)**:
- Response time: <5 minutes  
- Quick acknowledgment, shorter sentences
- Use emojis sparingly, keep friendly

**SMS (Future)**:
- Response time: <10 minutes
- Ultra-brief, use short URLs
- Consider 160 character limits

---

## Common Scenarios

### Wrong Item Shipped
1. Apologize
2. Verify order vs shipped
3. Ship correct item (expedited)
4. Provide return label for wrong item
5. 15-20% refund for inconvenience

### Delayed Shipment
1. Empathize
2. Check tracking
3. Contact carrier if needed
4. Refund shipping + 15% discount
5. Follow up until delivered

### Angry Customer
1. Don't take personally
2. Acknowledge emotion: "I can hear how frustrated you are"
3. Don't argue or say "calm down"
4. Focus on solution
5. Expedite, compensate, escalate if needed

### VIP/Bulk Order
1. Recognize business customer
2. Gather info (business name, volume)
3. Tag as "vip" and "bulk_order"
4. Connect to sales team
5. Mention volume discounts, dealer pricing

---

## Daily Workflow

### Morning (15 min)
- Login to Chatwoot
- Check unread count (target: <10)
- Review SLA breaches
- Set status to "Available"

### During Day (Every 30 min)
- Monitor Chatwoot for new conversations
- Review AI-drafted Private Notes
- Approve/edit/reject responses
- Grade all AI suggestions

### Evening (10 min)
- Close resolved conversations
- Document open issues
- Update feedback file
- Report blockers to Manager

---

## Troubleshooting

### AI Draft Not Appearing
- Check Agent SDK status
- Manually respond (don't wait)
- Report in feedback

### Chatwoot Login Failed
- Verify credentials: vault/occ/chatwoot/super_admin_staging.env
- Clear browser cache
- Try incognito mode
- Escalate to Manager

### SLA Already Breached
- Respond immediately (even if late)
- Acknowledge: "Thanks for your patience..."
- Provide full solution
- Consider 10% discount
- Document breach reason

---

## Quick Reference

**Escalation Triggers**: Legal keywords, SLA breach >30min, VIP, damage claims, refund >$500

**Grading Scale**: 1=Unusable, 2=Poor, 3=Acceptable, 4=Good, 5=Perfect

**Response Times**: Email <2h, Chat <5min, Compliance >95%

**Resources**:
- Chatwoot: https://hotdash-chatwoot.fly.dev
- Credentials: vault/occ/chatwoot/
- Feedback: feedback/support/YYYY-MM-DD.md

---

**Remember**: You are the human in the loop. Your judgment, empathy, and expertise make the difference. Grade honestly, escalate freely, prioritize customer satisfaction.
