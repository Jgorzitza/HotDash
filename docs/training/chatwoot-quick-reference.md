# Chatwoot AI Assistant - Quick Reference Card

**Version**: 1.0 | **Last Updated**: 2025-10-24 | **Print-Friendly** ✅

---

## 🔄 Workflow (6 Steps)

```
1. Customer Message → 2. AI Draft (Gray Note) → 3. Review → 
4. Approve/Edit/Reject → 5. Send → 6. Grade (1-5 × 3)
```

---

## ⭐ Grading Scale (1-5)

| Score | Tone | Accuracy | Policy |
|:-----:|------|----------|--------|
| **5** | Perfect empathy | All facts correct | Follows all policies |
| **4** | Good, minor tweaks | Mostly correct | Generally compliant |
| **3** | Acceptable | Some gaps | Minor issues |
| **2** | Poor | Significant errors | Policy concerns |
| **1** | Unusable | Wrong information | Violations |

**Remember**: Grade the AI draft, not your edited version!

---

## ⏱️ Response Time Targets

| Channel | Target | Compliance |
|---------|--------|------------|
| **Email** | <2 hours | >95% |
| **Live Chat** | <5 minutes | >95% |
| **SMS** | <10 minutes | >95% |

**SLA Breach**: >30 minutes → Escalate + 10% discount

---

## 🚨 Escalation Triggers (Immediate)

✅ **Legal Keywords**: chargeback, lawyer, sue, fraud  
✅ **VIP Customer**: bulk order, dealer, business  
✅ **Damage Claims**: product defect causing harm  
✅ **High Value**: refund request >$500  
✅ **Threats**: abusive, threatening language  
✅ **Privacy**: GDPR, data deletion requests

**Action**: Tag `escalated` + `needs_ceo` + Private Note + Notify Manager

---

## 📝 Decision Framework

### ✅ Approve (80%)
- Draft is accurate and complete
- Minor edits only (typos, small wording)
- Tone is appropriate
- Follows policies

### ✏️ Edit (15%)
- Core message is good but needs refinement
- Add personalization or empathy
- Clarify technical details
- Adjust tone slightly

### ❌ Reject (5%)
- Draft misunderstands the issue
- Contains factual errors
- Tone is inappropriate
- Violates policies
- Complex case needs human expertise

---

## 🎯 Best Practices

### ✅ Always Do
- Review drafts carefully before approving
- Verify order numbers and customer details
- Check policy compliance
- Grade honestly and consistently
- Escalate when unsure

### ❌ Never Do
- Approve without reading
- Send incorrect information
- Make unauthorized promises
- Skip grading
- Ignore red flags

---

## 🔧 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| **No AI draft** | Wait 30s → Respond manually → Report |
| **Poor draft** | Grade low (1-2) → Edit/Reject → Document |
| **Login fails** | Check credentials → Clear cache → Incognito |
| **Can't approve** | Refresh page → Check requirements → Report |
| **Reply not sent** | Verify in thread → Check customer receipt → Resend |

---

## 📚 Key Resources

### Documentation
- **Training Guide**: docs/training/chatwoot-ai-assistant-guide.md
- **Scenarios**: docs/training/chatwoot-scenarios-examples.md
- **Troubleshooting**: docs/training/chatwoot-troubleshooting.md
- **CX Guide**: docs/runbooks/cx-team-guide.md

### System URLs
- **Chatwoot**: https://hotdash-chatwoot.fly.dev
- **Agent SDK**: https://hotdash-agent-service.fly.dev
- **Hot Dash**: https://hotdash-staging.fly.dev

### Credentials
- **Location**: vault/occ/chatwoot/
- **Files**: super_admin_staging.env, agent_credentials.env

---

## 📞 Contacts

| Need | Contact |
|------|---------|
| **Manager** | manager@hotrodan.com, #support-team |
| **Technical** | #devops-team, #engineering-team |
| **Emergency** | justin@hotrodan.com |
| **Feedback** | feedback/support/YYYY-MM-DD.md |

---

## 🎓 Common Scenarios Cheat Sheet

### Order Status
```
✅ Confirm order number
✅ Provide current status
✅ Share tracking link
✅ Set delivery expectation
✅ Thank for patience
```

### Delayed Order
```
✅ Acknowledge frustration
✅ Apologize sincerely
✅ Explain delay (briefly)
✅ Provide updated timeline
✅ Offer compensation (15-20% discount)
```

### Wrong Item
```
✅ Apologize for error
✅ Confirm correct item
✅ Ship correct item (expedited)
✅ Customer keeps wrong item (<$50)
✅ No return needed
```

### Refund Request
```
✅ Verify order details
✅ Check return window (30 days)
✅ Approve if eligible
✅ Provide return label
✅ Confirm refund timeline (5-7 days)
```

### Angry Customer
```
✅ Don't take personally
✅ Acknowledge emotion
✅ Don't argue or say "calm down"
✅ Focus on solution
✅ Expedite + compensate
```

### VIP/Bulk Order
```
✅ Recognize business customer
✅ Tag "vip" and "bulk_order"
✅ Connect to sales team
✅ Mention volume discounts
✅ Assign dedicated support
```

---

## 🔑 Keyboard Shortcuts (Chatwoot)

| Action | Shortcut |
|--------|----------|
| **Reply** | `R` |
| **Private Note** | `P` |
| **Resolve** | `E` |
| **Next Conversation** | `↓` |
| **Previous Conversation** | `↑` |
| **Search** | `/` |
| **Assign to me** | `A` |

---

## 📊 Daily Workflow Checklist

### Morning (15 min)
- [ ] Login to Chatwoot
- [ ] Check unread count (target: <10)
- [ ] Review SLA breaches
- [ ] Set status to "Available"

### During Day (Every 30 min)
- [ ] Monitor for new conversations
- [ ] Review AI-drafted Private Notes
- [ ] Approve/edit/reject responses
- [ ] Grade all AI suggestions

### Evening (10 min)
- [ ] Close resolved conversations
- [ ] Document open issues
- [ ] Update feedback file
- [ ] Report blockers to Manager

---

## 💡 Pro Tips

1. **Trust but Verify**: AI is good but not perfect - always check facts
2. **Grade Honestly**: Your feedback improves the system
3. **Personalize**: Add customer name and specific details
4. **Escalate Freely**: Better to ask than make a mistake
5. **Document Issues**: Help improve the system for everyone
6. **Stay Consistent**: Use same grading standards every time
7. **Focus on Customer**: Your judgment and empathy matter most

---

## 🎯 Success Metrics

**Your Goals**:
- Response time: <2 hours (email), <5 minutes (chat)
- SLA compliance: >95%
- Customer satisfaction: >4.5/5
- AI draft approval rate: 80-90%
- Average grade given: 3.5-4.5

**Team Goals**:
- First response time: <30 minutes
- Resolution time: <4 hours (simple), <48 hours (complex)
- AI improvement: +0.5 grade points per month
- Escalation rate: <10%

---

## 🚀 Remember

**You are the human in the loop.**

Your judgment, empathy, and expertise make the difference. The AI is your assistant, not your replacement.

- **Grade honestly** → Improves AI
- **Escalate freely** → Protects customers
- **Prioritize satisfaction** → Builds loyalty

**When in doubt, escalate!**

---

**Print this page and keep it at your desk for quick reference.**

**Questions?** See full training guide or contact your manager.

---

**Version**: 1.0 | **Last Updated**: 2025-10-24 | **Owner**: Support Team

