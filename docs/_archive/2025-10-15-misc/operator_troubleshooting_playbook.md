# Operator Troubleshooting Playbook

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Purpose**: Quick reference for operators when something goes wrong
**Evidence**: Common issues with step-by-step fixes, escalation paths

---

## Common Issues & Solutions

### Issue 1: "The draft has wrong order information"

**What to do**:

1. ❌ **Don't approve** (wrong info will go to customer)
2. ✅ Click "Reject"
3. ✅ Write response manually with correct info
4. ✅ Report in Slack: "Draft had wrong order# for ticket [ID]"

**Why it happens**: API timing issue or order number mismatch

**Fix coming**: Engineering will investigate if happens >3 times/day

---

### Issue 2: "I don't understand the customer's question"

**What to do**:

1. Read customer message carefully
2. Check conversation history (click "View Full Conversation")
3. If still unclear: Click "Edit" and ask clarifying question
4. Example: "Hi! Just to make sure I help you correctly—are you asking about order #12345 or a different order?"

**Remember**: It's okay to ask for clarification!

---

### Issue 3: "The confidence score is low (<70%)"

**What to do**:

1. ⚠️ **Read the draft extra carefully** (AI is uncertain)
2. Check the sources (are they relevant?)
3. If draft looks wrong: Reject and write manually
4. If draft needs heavy editing: Consider rejecting
5. If you're uncertain: Escalate to senior support

**Rule of thumb**:

- High confidence (>90%): Usually safe to approve
- Medium (70-89%): Review carefully
- Low (<70%): Be cautious, verify everything

---

### Issue 4: "Customer is angry/threatening"

**What to do**:

1. 🚨 **Don't approve immediately** (even if draft looks good)
2. Check if AI detected sentiment (should show "angry" indicator)
3. Read draft—does it match the anger level? (needs extra empathy)
4. **Best practice**: Escalate angry customers to senior support
5. If you handle it: Add lots of empathy, apologize, fix the issue

**Example edit**:

- AI: "Your order will arrive Oct 13."
- You: "I'm so sorry for the delay and frustration! I completely understand. Your order will arrive Oct 13 and I've added a 10% discount to your account as an apology."

---

### Issue 5: "The queue is empty but I know there are customers waiting"

**What to do**:

1. Check system status (top-right corner, should be 🟢 green)
2. If red: System issue, switch to manual workflow
3. If green: Refresh page (sometimes takes 30 seconds to load)
4. Still empty? Check with team lead (might be routing issue)

**Emergency**: If system is down, use Chatwoot directly (manual workflow)

---

### Issue 6: "I clicked Approve but nothing happened"

**What to do**:

1. Check for error message at top of screen
2. If error: Screenshot and share in Slack #agent-sdk-pilot
3. Try again (click Approve once more)
4. If still not working: Refresh page and try again
5. If broken after 3 tries: Switch to manual, report bug

**Bug reporting**: Include ticket ID, screenshot, what you clicked

---

### Issue 7: "The draft suggests a policy that changed last week"

**What to do**:

1. Check the "Sources" section—what version does it reference?
2. If old version: Click "Reject", write correct response
3. Report in Slack: "Draft used old policy version - [policy name]"
4. Support Agent will update knowledge base

**Why it happens**: Knowledge base not updated yet (we're fixing this!)

---

### Issue 8: "I want to go back to manual workflow"

**What to do**:

1. Talk to your team lead or Product Agent (that's okay!)
2. Share what's frustrating you (we want honest feedback)
3. During pilot, you can opt out if really uncomfortable
4. Give it 3-5 days first—most operators love it after the learning curve

**Remember**: Your feedback helps us make it better for everyone

---

## Emergency Contacts

**System Down (P0)**:

- Slack: @engineering-oncall (immediate response)
- Fallback: Use Chatwoot manually until fixed

**Wrong Information Sent to Customer (P1)**:

- Notify team lead immediately
- We'll reach out to customer to correct
- Not your fault—system learning

**Bug or UX Issue**:

- Slack: #agent-sdk-pilot
- Or: Email product@hotdash.com

**Questions or Training**:

- Ask in standups (daily 9 AM)
- Slack: #agent-sdk-pilot
- Office hours: 2-3 PM daily (Product Agent)

---

## Quick Reference Card (Print This!)

```
┌─────────────────────────────────────────┐
│ AGENT SDK QUICK REFERENCE               │
├─────────────────────────────────────────┤
│                                         │
│ KEYBOARD SHORTCUTS:                     │
│ • Ctrl+A = Approve                      │
│ • Ctrl+E = Edit                         │
│ • Ctrl+X = Escalate                     │
│ • Ctrl+R = Reject                       │
│                                         │
│ WHEN TO APPROVE:                        │
│ • Draft is accurate                     │
│ • Tone matches customer                 │
│ • Confidence >70%                       │
│                                         │
│ WHEN TO EDIT:                           │
│ • Draft is 80% right                    │
│ • Needs empathy or personal touch       │
│ • Minor details to add                  │
│                                         │
│ WHEN TO ESCALATE:                       │
│ • Angry customer                        │
│ • Refund >$100                          │
│ • Complex issue                         │
│ • You're uncertain                      │
│                                         │
│ WHEN TO REJECT:                         │
│ • Draft is completely wrong             │
│ • Confidence <50%                       │
│ • You prefer to write manually          │
│                                         │
│ HELP:                                   │
│ • Slack: #agent-sdk-pilot               │
│ • Daily standup: 9 AM                   │
│ • Office hours: 2-3 PM                  │
│                                         │
│ REMEMBER: You're in control! 🎯         │
└─────────────────────────────────────────┘
```

---

**Document Path**: `docs/operator_troubleshooting_playbook.md`  
**Status**: Ready for operator reference during pilot  
**North Star**: ✅ **Practical, operator-focused, immediately useful**
