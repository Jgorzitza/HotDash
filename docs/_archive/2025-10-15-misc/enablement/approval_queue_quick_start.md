# Agent SDK Approval Queue - Quick Start Guide

**📄 One-Page Reference | Print & Keep at Your Desk**  
**Version 1.0 | Last Updated: 2025-10-11**

---

## 🎯 The 5-Question Framework (Use for Every Approval)

| #     | Question                                      | ✅ Pass      | ❌ Fail     |
| ----- | --------------------------------------------- | ------------ | ----------- |
| **1** | **Accuracy:** Is all information correct?     | Approve/Edit | Reject      |
| **2** | **Completeness:** All questions answered?     | Approve/Edit | Edit/Reject |
| **3** | **Tone:** Friendly, professional, empathetic? | Approve      | Edit        |
| **4** | **Clarity:** Will customer understand?        | Approve      | Edit        |
| **5** | **Risk:** Any red flags?                      | Approve      | Escalate    |

**✅ All Pass → APPROVE** | **⚠️ Minor Issues → EDIT** | **❌ Major Issues → REJECT/ESCALATE**

---

## 📊 Confidence Score Guide

| Score       | Level     | Action         | Time    |
| ----------- | --------- | -------------- | ------- |
| **90-100%** | 🟢 High   | Quick review   | 1-2 min |
| **70-89%**  | 🟡 Medium | Careful review | 2-4 min |
| **<70%**    | 🔴 Low    | Extra scrutiny | 5+ min  |

**Remember:** Confidence score is a guide, not a rule. Trust your judgment!

---

## 🚦 Quick Decision Matrix

### APPROVE ✅ (90% of cases)

- All 5 checks pass
- No red flags
- Ready to send as-is

**Action:** Click "Approve & Execute"  
**Time:** 1-2 minutes

---

### EDIT & APPROVE ✏️ (8% of cases)

- **Minor tone issues** ("Your order..." → "Hi Sarah! Your order...")
- **Missing greeting** (Add warmth)
- **Lacks specificity** (Add amounts, dates, names)
- **Could be clearer** (Simplify jargon)

**Common Edits:**

```
Before: "Your order shipped on Oct 8."
After:  "Hi Sarah! Great news - your order shipped on Oct 8."

Before: "See our return policy here: [link]"
After:  "I'd be happy to help with a return! Here's how: [link]"

Before: "Refund takes 5-7 business days."
After:  "Your refund of $45.99 will appear in 5-7 business days."
```

**Action:** Make edits → Click "Approve & Execute"  
**Time:** 2-4 minutes

---

### REJECT ❌ (1-2% of cases)

**When:**

- Factually incorrect information
- Misunderstands customer question
- Contradicts current policy
- Inappropriate tone

**Action:** Click "Reject" → Add detailed notes → Write your response  
**Time:** 5-10 minutes

**Example Notes:**

```
"Draft addressed shipping when customer asked about returns.
Refund policy cited was outdated (14 days vs current 30 days)."
```

---

### ESCALATE ⚠️ (5-8% of cases)

| Situation                                 | Escalate To    | SLA        |
| ----------------------------------------- | -------------- | ---------- |
| Policy exception (return outside window)  | Senior Support | 2 hrs      |
| High-value issue (refund >$100)           | Manager        | 4 hrs      |
| Angry + threats (legal, social media)     | Manager        | **15 min** |
| Technical issue (site bug, payment error) | Engineering    | 1 hr       |
| Unsure / need guidance                    | Senior Support | 2 hrs      |
| Low confidence (<70%) + you agree         | Senior Support | 2 hrs      |

**Escalation Template:**

```
ESCALATION: [Type]

Customer: [Name] ([Email])
Order: [Number]

ISSUE SUMMARY:
[2-3 sentences]

REASON FOR ESCALATION:
[Why this needs senior/manager attention]

CUSTOMER CONTEXT:
- Order History: [X orders, $XX lifetime value]
- Previous Issues: [Any past tickets]
- Sentiment: [Polite/Frustrated/Angry]

SUGGESTED RESOLUTION:
[Your recommendation if you have one]

URGENCY: [Urgent/High/Standard]
```

---

## 🚨 RED FLAGS → Always Escalate

- 💰 Refund >$100
- 📜 Policy exception requests
- 😠 Angry customer with threats
- 🔧 Technical/system issues
- ❓ You're not confident
- 🆘 Customer mentions legal action, BBB, social media

**When in doubt, escalate!** Better safe than sorry.

---

## ✨ Best Practices

### ✅ DO

- **Read entire customer message** before deciding
- **Check KB sources** if confidence <90%
- **Add warmth** to robotic drafts
- **Use customer's name**
- **Show empathy** for frustration
- **Take time you need** (quality > speed)
- **Escalate when unsure**

### ❌ DON'T

- Blindly trust high confidence scores
- Guess on policy questions
- Send responses you wouldn't want to receive
- Handle high-risk items without authority
- Ignore your instincts
- Rush through approvals

---

## 📝 Common Scenarios Cheat Sheet

### ✅ Standard Order Status (Approve)

**Signs:** Tracking info, clear facts, friendly tone  
**Action:** Quick review → Approve

### ✏️ Refund Request (Edit)

**Signs:** Lacks empathy, too transactional  
**Action:** Add apology, warmth → Approve

### ⚠️ Technical Error (Escalate)

**Signs:** Error codes, site issues, multiple failures  
**Action:** Engineering escalation

### ⚠️ Angry + Threat (Escalate - URGENT)

**Signs:** ALL CAPS, legal/social threats, extreme language  
**Action:** Manager escalation (15-min SLA)

### ⚠️ Policy Exception (Escalate)

**Signs:** "Can you make an exception?"  
**Action:** Senior/Manager approval needed

---

## 🎯 Target Metrics

| Metric                       | Target   | What It Means          |
| ---------------------------- | -------- | ---------------------- |
| **Approval Rate**            | 70%+     | AI learning your style |
| **Avg Review Time**          | <3 min   | Efficient workflow     |
| **CSAT Score**               | 4.5+/5.0 | Happy customers!       |
| **First Contact Resolution** | 80%+     | Thorough responses     |
| **Escalation Rate**          | 10-15%   | Appropriate judgment   |

**Most Important:** Customer Satisfaction! Quality always beats speed.

---

## 🆘 Troubleshooting Quick Fixes

| Problem                                    | Solution                              |
| ------------------------------------------ | ------------------------------------- |
| **Draft doesn't match question**           | REJECT + write from scratch           |
| **High confidence but feels wrong**        | Trust instinct → check KB or escalate |
| **KB article not found**                   | ESCALATE (tag as "KB Issue")          |
| **New question type (not in KB)**          | ESCALATE (note "Missing KB Article")  |
| **Queue empty but Chatwoot has customers** | Handle directly in Chatwoot           |
| **Same error repeatedly**                  | Document pattern → report to lead     |

---

## 📞 Quick Contacts

| Need                | Contact            | Channel               |
| ------------------- | ------------------ | --------------------- |
| **Quick question**  | #support-questions | Slack                 |
| **Escalation**      | Senior Support     | Approval Queue button |
| **Technical issue** | @engineering       | Slack                 |
| **Policy question** | @support-lead      | Slack                 |
| **System down**     | #incidents         | Slack                 |

---

## 🧠 Remember

### The North Star Principles:

1. **Operators are heroes** - You serve customers
2. **Humans in the loop, not the loop** - AI augments you
3. **Trust through transparency** - Understand before approving
4. **Quality over speed** - Accuracy > fast response

### Your Role:

- **Judge** - Is this response good enough?
- **Editor** - Make it better when needed
- **Teacher** - Your decisions train the AI
- **Guardian** - Protect customer experience

---

**🎯 The Most Important Rule:**

### **If you're unsure, escalate. No exceptions.**

---

**Questions?**

- Slack: #occ-enablement
- Email: customer.support@hotrodan.com
- Your Mentor: [Assigned during onboarding]

**Keep this guide handy!** Print it, bookmark it, reference it often.

---

_This quick start guide is a companion to the full Agent SDK Operator Training Module.  
For detailed scenarios, examples, and practice exercises, see the complete training guide._

**Document Version:** 1.0 | **Last Updated:** 2025-10-11 | **Maintained by:** Enablement Team
