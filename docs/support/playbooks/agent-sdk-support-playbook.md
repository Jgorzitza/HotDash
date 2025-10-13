---
epoch: 2025.10.E1
doc: docs/support/playbooks/agent-sdk-support-playbook.md
owner: support
category: agent-sdk-support
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [agent-sdk, troubleshooting, escalation, operator-support]
---

# Agent SDK Support Playbook

**Purpose**: Troubleshoot AI agent issues and provide operator support for approval queue system  
**Target Audience**: Support operators, support managers  
**System**: HotDash Agent SDK + LlamaIndex + Chatwoot integration  
**Created**: October 12, 2025

---

## 🎯 What Is This Playbook For?

**Operators Using Approval Queue**: When you encounter technical issues or AI problems  
**Support Managers**: When customers report issues with AI-assisted support  
**Troubleshooting**: Step-by-step fixes for common problems

**This Playbook Covers**:
- ✅ Common technical issues (approval queue not loading, etc.)
- ✅ AI response quality issues (wrong answers, hallucinations)
- ✅ Escalation matrix (when to involve engineer vs manager)
- ✅ Known limitations of the system
- ✅ Support ticket templates

---

## 🔧 Common Technical Issues & Fixes

### Issue #1: Approval Queue Not Loading

**Symptoms**:
- Dashboard shows blank screen
- "Loading..." message never finishes
- Error message: "Failed to load approval queue"

**Quick Fixes** (Try These First):

**Fix 1: Refresh the Page**
```
1. Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. This forces a hard refresh, clears cache
3. Wait 10 seconds for load
```
**Success Rate**: 60% - Fixes temporary connection issues

**Fix 2: Clear Browser Cache**
```
1. Open browser settings
2. Clear browsing data (last hour)
3. Check: Cached images and files
4. Close and reopen browser
5. Log back into approval queue
```
**Success Rate**: 25% - Fixes cached data corruption

**Fix 3: Try Different Browser**
```
1. If using Chrome, try Firefox or Edge
2. Log into approval queue
3. If works: Original browser has extension conflict
```
**Success Rate**: 10% - Identifies browser-specific issues

**Fix 4: Check Internet Connection**
```
1. Test: Can you load other websites?
2. Run speed test: fast.com
3. If slow/offline: Internet issue, not approval queue
```
**Success Rate**: 5% - Identifies network problems

**If None Work** → **Escalate to Technical Support** (see escalation section)

---

### Issue #2: Cannot Approve/Reject (Buttons Disabled)

**Symptoms**:
- APPROVE, MODIFY, REJECT buttons are grayed out
- Clicking buttons does nothing
- Error message: "Action not allowed"

**Quick Fixes**:

**Fix 1: Check Your Permissions**
```
1. Are you logged in as an authorized operator?
2. Verify: Settings > User Role shows "Operator" or "Manager"
3. If "Guest" or "Read-Only": Contact manager for permissions
```
**Cause**: User account doesn't have approval queue access

**Fix 2: Session Expired**
```
1. Log out completely
2. Close all browser tabs
3. Log back in
4. Try again
```
**Cause**: Authentication token expired (happens after 8 hours idle)

**Fix 3: Conflicting Draft**
```
1. Check if another operator is reviewing same ticket
2. Ask in #support-team channel: "Anyone working on ticket #[ID]?"
3. If yes: Only one operator can review at a time
```
**Cause**: System locks ticket to one operator at a time

**If None Work** → **Escalate to Technical Support**

---

### Issue #3: AI Response Not Generating

**Symptoms**:
- Customer message arrives in Chatwoot
- No draft appears in approval queue
- Message stuck in "Processing..." status

**Quick Fixes**:

**Fix 1: Wait 30 Seconds**
```
AI takes 10-30 seconds to generate response
If <30 seconds elapsed: Be patient, it's processing
```

**Fix 2: Check Message Type**
```
AI generates responses for:
✅ Text messages
✅ Email inquiries
✅ Product questions

AI does NOT generate for:
❌ Order status requests (handled by Shopify automation)
❌ Shipping tracking (handled by carrier automation)
❌ Payment issues (escalate to manager)
```
**Cause**: Message type not supported by AI agent

**Fix 3: Check Customer History**
```
Is this customer's FIRST message?
• First message: AI may take 60-90 seconds (building customer context)
• Subsequent messages: Usually 10-30 seconds
```

**Fix 4: Trigger Manual Generation**
```
1. Click "Request AI Draft" button (if available)
2. Wait 30 seconds
3. If still no draft: Handle manually using playbooks
```

**If Still No Draft After 2 Minutes** → **Handle Manually + Report Issue**

---

### Issue #4: Approval Queue Shows Wrong Customer Message

**Symptoms**:
- Draft response doesn't match customer's question
- Response references different customer or order
- Customer names don't match

**Immediate Action** → **DO NOT APPROVE - REJECT IMMEDIATELY**

**Root Cause Investigation**:

**Scenario A: Database Sync Issue**
```
1. Check Chatwoot: What did customer ACTUALLY ask?
2. Compare to approval queue: What does it show?
3. If mismatch: Database sync problem
4. REJECT draft, handle manually
5. Report to technical support with ticket IDs
```

**Scenario B: AI Context Confusion**
```
1. Customer sent multiple messages quickly
2. AI generated response for message #1
3. Customer sent message #2 before you approved #1
4. System shows #2 but draft is for #1
5. Solution: Approve #1 draft (if good), then handle #2 separately
```

**Scenario C: Multiple Browser Tabs**
```
1. Do you have multiple approval queue tabs open?
2. You clicked "Review" in one tab
3. System opened ticket in other tab
4. Now showing mismatched data
5. Solution: Close all tabs except one, refresh
```

**Critical**: Never approve a response that doesn't match the customer's question!

---

## 🤖 AI Response Quality Issues

### Issue #5: AI Gives Wrong Product Information

**Example**: Customer asks "What size for 3/8 inch hose?" AI says "AN-8" (should be AN-6)

**Immediate Action** → **REJECT**

**Root Cause**:
- AI hallucinated (made up answer)
- Knowledge base has outdated info
- Training data has error

**What to Do**:
```
1. Click REJECT
2. Note reason: "Incorrect product size - should be AN-6 for 3/8 inch"
3. Handle manually using playbooks
4. Report error pattern to manager
```

**Report to Manager**:
```
Subject: AI Knowledge Gap - Product Sizing

Pattern: AI consistently gives wrong sizing for [specific scenario]

Example Ticket: #[ID]
Customer Question: [paste question]
AI Response: [paste wrong answer]
Correct Answer: [paste correct answer per playbook]

Recommendation: Update training data for [topic]
```

---

### Issue #6: AI Gives Unsafe Advice

**Example**: AI suggests "use thread sealant on AN flare fittings" (WRONG - damages seal!)

**Immediate Action** → **REJECT + ESCALATE**

**Critical Safety Issues**:
- ❌ Wrong fuel system advice (fire risk)
- ❌ Wrong brake advice (safety critical)
- ❌ Recommends temporary fixes for safety-critical parts

**What to Do**:
```
1. REJECT immediately (do NOT send to customer)
2. Handle manually with correct advice
3. ESCALATE to manager with [SAFETY] tag
4. Document exact AI response for training correction
```

**Escalation Message**:
```
Subject: [SAFETY] AI Gave Unsafe Advice - Ticket #[ID]

AI recommended: [paste unsafe advice]

Why unsafe: [explain risk]

Correct advice per playbook: [paste correct guidance]

This MUST be fixed in training data immediately.
```

**Manager Response Time**: <2 hours for safety escalations

---

### Issue #7: AI Response Is Too Generic/Unhelpful

**Example**: Customer: "Will AN-6 work for my setup?" AI: "AN-6 is a common size for many applications."

**Immediate Action** → **MODIFY** (add specificity)

**Why This Happens**:
- Customer didn't provide enough context
- AI can't find specific answer in knowledge base
- AI defaults to safe/generic response

**How to Fix**:
```
1. Click MODIFY
2. Review customer's message for context clues
3. Add specific detail from playbooks
4. Make it actionable

Example Fix:
BEFORE: "AN-6 is a common size for many applications."
AFTER: "For your 350 HP small block with 3/8" hose, yes, AN-6 is perfect."
```

**Pattern to Report**:
If AI consistently gives generic responses for specific question types, report to manager for training improvement.

---

### Issue #8: AI "Hallucinates" Product Names or Part Numbers

**Example**: AI references "Hot Rod AN Ultra-Flow AN-6 Swivel Fitting" (product doesn't exist)

**Immediate Action** → **REJECT**

**Why This Happens**:
- AI invents plausible-sounding products
- Training data mixed different product names
- AI tries to be helpful but creates fiction

**What to Do**:
```
1. REJECT immediately
2. Check actual product catalog for correct parts
3. Rewrite response with REAL products
4. Report hallucination pattern
```

**Verification**:
```
Before approving ANY product recommendation:
1. Check Shopify catalog: Does product exist?
2. Verify part number: Exact match?
3. Verify price: Current pricing?
4. Verify stock: Actually available?
```

**If unsure** → Look it up before approving!

---

## 🚨 Escalation Matrix

### When to Escalate vs Handle Yourself

```
┌─────────────────────────────────────────────────────────┐
│             ESCALATION DECISION TREE                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Is it a TECHNICAL issue?                                │
│ (Queue not loading, buttons broken, system error)       │
│   YES → Escalate to TECHNICAL SUPPORT                   │
│   NO  → Continue...                                      │
│                                                          │
│ Is it an AI QUALITY issue?                              │
│ (Wrong answer, hallucination, unsafe advice)            │
│   SAFETY CONCERN? → Escalate to MANAGER (urgent)        │
│   PATTERN (happens often)? → Report to MANAGER          │
│   ONE-OFF ERROR? → REJECT, handle manually, log issue   │
│                                                          │
│ Is it a CUSTOMER complaint?                             │
│ (Customer unhappy with AI response)                     │
│   ANGRY/THREATENING? → Escalate to MANAGER              │
│   REASONABLE FEEDBACK? → Handle, log for improvement    │
│                                                          │
│ Is it an OPERATOR QUESTION?                             │
│ (How do I...? Should I...?)                             │
│   POLICY QUESTION? → Ask MANAGER                        │
│   TECHNICAL QUESTION? → Reference this playbook         │
│   TRAINING QUESTION? → Ask team lead or schedule review │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### Escalate to Technical Support

**When**:
- [ ] Approval queue not loading after troubleshooting
- [ ] Buttons don't work (can't approve/reject/modify)
- [ ] System errors or crashes
- [ ] Performance issues (slow loading, timeouts)
- [ ] Integration broken (Chatwoot not syncing)
- [ ] Data mismatch (wrong customer, wrong order)

**How to Escalate**:
```
Email: tech-support@hotdash.com
Subject: [TECH ISSUE] Brief Description - Ticket #[ID if applicable]
Priority: P1 (Urgent) or P2 (Normal)

Template:
---
Issue: [One-sentence description]

What I was trying to do:
[Step by step]

What happened instead:
[Describe error]

Troubleshooting attempted:
• [Fix 1]: Result
• [Fix 2]: Result

Browser: [Chrome/Firefox/Edge]
OS: [Windows/Mac/Linux]
Time: [When did it start?]

Screenshots attached: [Yes/No]
---
```

**Expected Response Time**:
- P1 (Urgent - system down): <30 minutes
- P2 (Normal - workaround available): <4 hours

---

### Escalate to Manager

**When**:
- [ ] AI gave unsafe advice (safety critical)
- [ ] Pattern of AI errors (same mistake repeatedly)
- [ ] Customer complaint about AI responses
- [ ] Policy question (can I promise...? can I offer...?)
- [ ] Angry or threatening customer
- [ ] Decision needed (approve exception, offer discount)

**How to Escalate**:
```
Email: manager@hotdash.com (or direct Slack message)
Subject: [CATEGORY] Brief Description - Ticket #[ID if applicable]

Categories:
• [SAFETY] - AI gave unsafe advice
• [QUALITY] - AI error pattern
• [CUSTOMER] - Customer complaint or escalation
• [POLICY] - Policy decision needed

Template:
---
Issue: [One-sentence description]

Customer: [Name, Order #]
Ticket: #[ID]

What happened:
[Describe situation]

Why escalating:
[Safety? Pattern? Policy decision?]

Current status:
[Customer waiting? Already handled manually?]

Recommendation (if any):
[Your suggested action]
---
```

**Expected Response Time**:
- [SAFETY]: <2 hours
- [CUSTOMER] (angry): <2 hours
- [QUALITY] or [POLICY]: <4 hours

---

### Do NOT Escalate (Handle Yourself)

**These Are Normal**:
- ✅ Minor tone adjustments (AI too formal/casual)
- ✅ Adding personalization (customer name, specific details)
- ✅ One-off AI error (wrong answer, you caught it, rejected)
- ✅ Formatting fixes (line breaks, bullet points)
- ✅ Customer has general question (handle with playbooks)

**Handle It**:
- Use MODIFY button for minor fixes
- Use REJECT + manual response for bigger issues
- Reference playbooks for correct answers
- Log issue if it's worth noting, but don't escalate

**Tip**: Escalate patterns, not one-offs. If AI makes same mistake 3+ times, that's a pattern → Report to manager.

---

## 📋 Known Limitations

### What the AI CAN Do Well

✅ **Product Sizing Questions**
- "What size AN fitting for X inch hose?"
- "What HP rating for AN-6 vs AN-8?"
- Based on playbook knowledge

✅ **Troubleshooting Common Issues**
- Fuel leaks, installation problems
- Follows troubleshooting playbooks
- Suggests diagnostic steps

✅ **Product Recommendations**
- Suggests appropriate fittings for applications
- References compatibility (NPT, ORB, AN)
- Based on customer's stated needs

✅ **Installation Guidance**
- Step-by-step assembly instructions
- From installation playbooks
- Proper torque, techniques

---

### What the AI CANNOT Do (Yet)

❌ **Complex Custom Designs**
- Racing fuel systems (800+ HP, forced induction)
- Custom fabrication consultation
- Requires human expert → Escalate to Technical

❌ **Policy Decisions**
- Authorize discounts or refunds
- Approve shipping exceptions
- Make promises outside policy → Escalate to Manager

❌ **Order Management**
- Modify existing orders
- Process returns/exchanges
- Check order status → Use Shopify, not AI

❌ **Real-Time Inventory**
- AI doesn't know current stock levels
- Always verify in Shopify before confirming availability

❌ **Pricing**
- AI may have outdated pricing
- Always verify current price in Shopify

❌ **Personal Judgment Calls**
- Angry customer de-escalation (needs human empathy)
- Reading between the lines (customer implications)
- Subjective decisions → Use human judgment

**Key Principle**: AI is great at knowledge retrieval, NOT at decisions, empathy, or real-time data.

---

## 🎫 Support Ticket Templates

### Template 1: Technical Issue Report

```
Subject: [TECH ISSUE] Approval Queue [Specific Problem]

Ticket #: [If applicable]
Operator: [Your Name]
Date/Time: [When issue occurred]
Browser: [Chrome/Firefox/Edge + version]
OS: [Windows/Mac/Linux]

Issue Description:
[What were you trying to do?]

Steps to Reproduce:
1. [First action]
2. [Second action]
3. [Error occurred]

Expected Behavior:
[What should have happened?]

Actual Behavior:
[What actually happened?]

Error Messages:
[Copy exact error text or "None"]

Troubleshooting Attempted:
• [Fix 1]: [Result]
• [Fix 2]: [Result]

Impact:
☐ Blocking (can't work at all)
☐ High (workaround available but slow)
☐ Medium (inconvenient)
☐ Low (cosmetic issue)

Screenshots: [Attached Yes/No]
```

---

### Template 2: AI Quality Issue Report

```
Subject: [AI QUALITY] [Category] - Ticket #[ID]

Categories: Wrong Answer | Unsafe Advice | Hallucination | Too Generic

Customer Ticket: #[ID]
Customer Question: [Paste exact question]

AI Response Draft:
---
[Paste AI's response]
---

Issue:
[What's wrong with AI response?]

Correct Response (Per Playbook):
---
[Paste correct answer]
---

Playbook Reference: [Which playbook has correct info?]

Action Taken:
☐ REJECTED draft, handled manually
☐ MODIFIED draft (minor fix)
☐ Customer not yet contacted (caught in review)

Pattern or One-Off?
☐ First time seeing this error
☐ Seen 2-3 times this week
☐ Frequent pattern (5+ times)

Recommendation:
[How should AI be retrained?]
```

---

### Template 3: Customer Feedback Report

```
Subject: [CUSTOMER FEEDBACK] AI Response - Ticket #[ID]

Customer: [Name]
Order #: [If applicable]
Ticket #: [ID]
Date: [When feedback received]

Customer Feedback:
"[Paste exact customer comment]"

Context:
[What was the AI response they're commenting on?]

Sentiment:
☐ Positive (loved it!)
☐ Neutral (it was okay)
☐ Negative (not helpful)

Specific Issues Mentioned:
• [Issue 1]
• [Issue 2]

Action Taken:
[How did you resolve?]

Recommendation:
[Should anything change based on this feedback?]
```

---

## 📊 Performance Tracking

### Metrics to Track (Weekly)

**Personal Operator Metrics**:
- **Approval Rate**: ___ % APPROVED without modification
- **Modification Rate**: ___ % MODIFIED before sending
- **Rejection Rate**: ___ % REJECTED
- **Average Review Time**: ___ minutes per response
- **Escalations**: ___ issues escalated this week

**Target Benchmarks**:
- Approval Rate: >70% (AI getting better)
- Modification Rate: 20-25% (minor tweaks okay)
- Rejection Rate: <10% (AI mostly accurate)
- Review Time: <5 minutes average
- Escalations: <5 per week per operator

**How to Improve**:
- Low approval rate? Report AI training gaps to manager
- High review time? Reference playbooks faster, improve workflow
- Many escalations? Review escalation criteria (over-escalating?)

---

## ✅ Best Practices

### Do's ✅

**1. Trust the System (With Verification)**
- AI is usually right, but always verify
- Check product specs before approving
- When in doubt, look it up

**2. Report Patterns**
- One AI error → Log it
- Three AI errors (same type) → Report to manager
- Helps improve AI training

**3. Use Playbooks**
- Keep playbooks open while reviewing
- AI references playbooks, you should too
- Playbooks are source of truth

**4. Provide Feedback in Rejections**
- When rejecting, note WHY
- Helps AI learn from mistakes
- Example: "Incorrect sizing - should be AN-6 for 3/8 inch"

**5. Escalate Safety Issues Immediately**
- Never approve unsafe advice
- Always escalate [SAFETY] issues
- Better safe than sorry

### Don'ts ❌

**1. Don't Blindly Approve**
- ❌ "AI knows best, I'll just click approve"
- You're the quality check!

**2. Don't Ignore Patterns**
- ❌ AI makes same mistake 5 times, you just keep fixing it
- Report patterns so AI can be retrained

**3. Don't Escalate Everything**
- ❌ Escalating every minor issue
- Handle what you can, escalate what you can't

**4. Don't Modify Without Understanding**
- ❌ Changing response without knowing why
- Understand the customer's question first

**5. Don't Forget to Document**
- ❌ Fixing issue without logging it
- Documentation helps everyone improve

---

## 📚 Related Documentation

### Required Reading
- `docs/enablement/approval-queue-quick-start.md` - How to use approval queue
- `docs/support/playbooks/hot-rod-an/` - Product knowledge for verification
- `docs/AgentSDKopenAI.md` - How Agent SDK works (technical)

### Reference Materials
- `docs/support/playbooks/hot-rod-an/07-technical-escalation-matrix.md` - When to escalate
- `docs/enablement/pilot-customer-selection-criteria.md` - Pilot program details

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Review Frequency**: Monthly  
**Next Review**: November 12, 2025

**Questions?** Contact tech-support@hotdash.com or post in #support-team Slack channel

---

## 🖨️ Quick Reference: Troubleshooting Decision Tree

```
┌──────────────────────────────────────────────────────┐
│        TROUBLESHOOTING QUICK REFERENCE               │
├──────────────────────────────────────────────────────┤
│ 🔧 TECHNICAL ISSUES                                  │
│   Queue not loading → Refresh, clear cache, try      │
│   different browser → Escalate if still broken       │
│                                                       │
│   Buttons disabled → Check permissions, re-login     │
│   → Check for conflicting draft → Escalate           │
│                                                       │
│   No AI draft → Wait 30s, check message type,        │
│   trigger manual → Handle manually if >2min          │
│                                                       │
│ 🤖 AI QUALITY ISSUES                                 │
│   Wrong answer → REJECT, handle manually, report     │
│   Unsafe advice → REJECT + ESCALATE [SAFETY]         │
│   Too generic → MODIFY, add specificity              │
│   Hallucination → REJECT, verify real products       │
│                                                       │
│ 🚨 ESCALATE IF:                                      │
│   • Safety concern (fuel, brakes)                    │
│   • Pattern (same error 3+ times)                    │
│   • System broken (can't work)                       │
│   • Customer angry/threatening                       │
│   • Policy decision needed                           │
│                                                       │
│ ✅ HANDLE YOURSELF:                                  │
│   • Minor tone/formatting tweaks                     │
│   • One-off AI errors (caught & fixed)               │
│   • Standard customer questions (use playbooks)      │
│   • Product verification (check Shopify)             │
└──────────────────────────────────────────────────────┘
```

**Keep This At Your Desk!** 🛠️

