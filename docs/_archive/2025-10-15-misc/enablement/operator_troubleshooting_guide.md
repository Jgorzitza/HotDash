# Operator Troubleshooting Guide

**Purpose:** Quick solutions for common approval queue issues  
**Format:** Problem → Solution (fast reference)  
**Created:** 2025-10-12

---

## How to Use This Guide

**When something goes wrong:**
1. Find your issue in the list below
2. Try the "Quick Fix" first
3. If that doesn't work, try "If Still Broken"
4. If nothing works, escalate to #incidents (Slack)

**Remember:** This is a pilot - issues are expected. Report them!

---

## Common Issues & Solutions

### 1. "Dashboard is slow to load"

**Symptoms:**
- Approval queue takes >10 seconds to load
- Spinning wheel won't stop
- Page freezes

**Quick Fix:**
```
1. Refresh the page (Cmd/Ctrl + R)
2. Clear browser cache (Cmd/Ctrl + Shift + Delete)
3. Try in incognito/private window
```

**If Still Broken:**
- Check internet connection
- Try different browser (Chrome → Firefox or vice versa)
- Report in #incidents: "Approval queue slow to load - [your browser] [your location]"

**Escalate If:** Issue persists >15 minutes

---

###

 2. "AI suggestion seems wrong"

**Symptoms:**
- AI cites wrong policy
- Information doesn't match order details
- Response doesn't answer customer question

**Quick Fix:**
```
1. Click "Reject"
2. Add note explaining what's wrong:
   - "AI cited Return Policy v2.0 but current is v2.1"
   - "AI says order shipped but system shows pending"
   - "AI didn't address customer's actual question"
3. Handle manually in Chatwoot
```

**If Pattern Emerges:**
- Same error happens 3+ times → Report in #occ-enablement
- Include examples: "AI keeps citing old return policy (v2.0)"

**Don't:** Approve if you're unsure - always reject or escalate

---

### 3. "Approval doesn't send after I click"

**Symptoms:**
- Clicked "Approve & Execute"
- No confirmation message
- Customer didn't receive response

**Quick Fix:**
```
1. Check if there's an error message (red banner)
2. Check Chatwoot - did message actually send?
3. If not sent: Click "Approve & Execute" again
4. If duplicate send: Delete duplicate in Chatwoot
```

**If Still Broken:**
- Screenshot the error message
- Note the conversation ID
- Send manually in Chatwoot
- Report in #incidents with screenshot

**Escalate If:** Multiple approvals failing (not just one)

---

### 4. "Can't find a conversation in the queue"

**Symptoms:**
- You know there are pending approvals
- Queue shows empty or wrong count
- Specific conversation missing

**Quick Fix:**
```
1. Refresh page
2. Check filters - make sure "Show All" is selected
3. Try search function (conversation ID or customer name)
4. Check if someone else already handled it
```

**If Still Broken:**
- Verify in Chatwoot - is conversation actually pending?
- Report discrepancy in #occ-enablement
- Continue working in Chatwoot if urgent

**Not a Blocker:** You can still handle conversations manually in Chatwoot

---

### 5. "Confidence score doesn't make sense"

**Symptoms:**
- AI very confident (95%) but response is clearly wrong
- AI uncertain (65%) but response looks perfect
- Confidence seems random

**Quick Fix:**
```
This is expected in pilot! Confidence scores will improve as AI learns.

Your job: Trust your judgment, not just the score.

- Low confidence (<70%) = Review extra carefully
- High confidence (>90%) = Usually trustworthy, but still check
- Always verify accuracy regardless of score
```

**Report Patterns:**
- If AI is consistently overconfident about errors
- If scores seem totally random
- Include examples in #occ-enablement

**Remember:** You're the quality gate, not the confidence score

---

### 6. "KB sources link is broken"

**Symptoms:**
- Click "View Source" but get 404 error
- KB article won't open
- Link goes to wrong article

**Quick Fix:**
```
1. Try opening KB source in new tab
2. Search for article manually in knowledge base
3. If you find it: Use that to verify
4. If you can't find it: Be extra careful with approval
```

**If Still Broken:**
- Note which KB article is broken
- Report in #occ-enablement: "KB article [name] returns 404"
- This helps fix KB indexing issues

**For the approval:**
- If you know the answer: Use your knowledge
- If unsure without KB source: Escalate with note "KB source unavailable, need verification"

---

### 7. "Customer message not showing"

**Symptoms:**
- Approval card shows AI draft
- But customer's original message is blank or missing
- Can't understand what customer asked

**Quick Fix:**
```
1. Click conversation ID link to open in Chatwoot
2. Read customer message there
3. Come back and decide on approval
```

**If Still Broken:**
- Screenshot the issue
- Report in #incidents: "Customer message missing from approval card"
- Include conversation ID

**Workaround:** Use Chatwoot directly until fixed

---

### 8. "Escalation button not working"

**Symptoms:**
- Need to escalate but button is grayed out
- Click escalate but nothing happens
- Escalation form won't submit

**Quick Fix:**
```
IMMEDIATE WORKAROUND:
1. Screenshot the approval
2. Slack your manager directly: 
   "@manager - Need escalation for conversation #[ID] - [quick reason]"
3. Include screenshot
4. Manager will handle from Chatwoot

Then report in #incidents: "Escalation button not working"
```

**This is Priority 1:** Escalations need to work for safety

---

### 9. "Seeing duplicate approvals"

**Symptoms:**
- Same conversation appears twice in queue
- Approve one, both disappear
- Confused about which to handle

**Quick Fix:**
```
1. Check conversation IDs - are they actually the same?
2. If same ID: Handle once, both should clear
3. If different IDs: Check Chatwoot - are these separate conversations?
```

**Report:**
- Note in #occ-enablement: "Seeing duplicate approvals for conversation #[ID]"
- This helps identify UI bugs

**Not Harmful:** Just handle once, ignore duplicate

---

### 10. "I clicked wrong button by mistake"

**Symptoms:**
- Meant to reject, clicked approve
- Meant to escalate, clicked approve
- Wrong action taken

**Quick Fix:**
```
IF IMMEDIATELY NOTICED (<30 seconds):
1. Open conversation in Chatwoot
2. Delete the sent message if possible
3. Send correct response

IF ALREADY SENT TO CUSTOMER:
1. Send follow-up correction in Chatwoot
2. Document in your daily log
3. Let manager know at end of day

IF ESCALATION WAS NEEDED BUT YOU APPROVED:
1. Immediately Slack manager: "Approved [conversation ID] but should have escalated - [reason]"
2. Manager can intervene quickly
```

**Mistakes Happen:** Especially during pilot. Report honestly, we'll improve the UI.

---

## Technical Issues (Need Engineering)

### Browser Compatibility Issues

**Supported Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**If using unsupported browser:** Switch to supported one

**Report:** "Approval queue not working in [browser name/version]"

---

### Login/Authentication Issues

**Symptoms:**
- Can't access approval queue
- "Not authorized" error
- Kicked out repeatedly

**Fix:**
```
1. Verify you're logged into Shopify Admin
2. Verify HotDash app is installed
3. Navigate to: [Shopify Admin] → Apps → HotDash → Approval Queue
4. Try logging out of Shopify and back in
```

**If Still Broken:** Contact Support Manager - you may need access provisioned

---

### Data Not Loading

**Symptoms:**
- Everything loads except approval data
- Error: "Failed to fetch approvals"

**Fix:**
```
1. Check if Chatwoot is accessible (test in separate tab)
2. Check if Shopify Admin is accessible
3. Refresh approval queue page
4. Wait 2 minutes (might be temporary backend issue)
```

**Report in #incidents:** "Approval data not loading - possible backend issue"

---

## Getting Help

**For Quick Questions:**
- **Slack #occ-enablement** - General approval queue questions
- **Quick Start Guide** - On your desk for common decisions
- **This Troubleshooting Guide** - For technical issues

**For Urgent Issues:**
- **Slack #incidents** - Technical failures, blocking issues
- **Your Manager (DM)** - Escalations, urgent approvals, serious problems
- **Support Lead** - Policy questions, unusual situations

**For Feedback/Suggestions:**
- **Slack #occ-enablement** - "This would be better if..."
- **Weekly feedback session** - Structured feedback time
- **Daily check-ins** (first week) - Quick issues and improvements

---

## What to Include When Reporting Issues

**Always Provide:**
1. **What you were trying to do**: "I was trying to approve a customer response"
2. **What happened**: "Clicked approve but got error message"
3. **Error message** (if any): Screenshot or exact text
4. **Conversation ID** (if relevant): "#12345"
5. **When**: "2025-10-12 at 2:30 PM"
6. **Browser**: "Chrome version 118"

**Example Good Report:**
> "🚨 #incidents - Approval button not working. Tried to approve conversation #OX-4521 at 2:30 PM. Clicked 'Approve & Execute' but got red error 'Failed to send'. Using Chrome 118. Customer still waiting. [screenshot attached]"

**Example Weak Report:**
> "Something's broken"

**Why Good Reports Help:**
- Engineering can reproduce and fix faster
- We can identify patterns (widespread vs one-off)
- You get unblocked sooner

---

## Preventing Issues

**Best Practices:**

1. **Keep Browser Updated**
   - Check for updates weekly
   - Restart browser daily

2. **Clear Cache Regularly**
   - Once per week minimum
   - After any major updates

3. **Use Supported Browsers**
   - Chrome or Firefox recommended
   - Safari and Edge also work

4. **Report Early**
   - See something weird? Say something
   - Pattern of 2-3 similar issues? Report it
   - Don't wait for it to become a big problem

5. **Document Workarounds**
   - Found a way around an issue? Share it!
   - Post in #occ-enablement
   - Help your teammates

---

## Known Issues (Pilot Phase)

**As of 2025-10-12, these are expected:**

1. **Occasional slow loading** - We're optimizing performance
2. **Confidence scores need calibration** - AI is learning
3. **Some KB links may be outdated** - Updating KB index
4. **UI may change** - Based on your feedback

**These are NOT blockers** - pilot continues, we're fixing as we go

**What IS a Blocker:**
- Can't access approval queue at all
- Can't escalate urgent issues
- Mass approval failures (>50% failing)

---

## Emergency Fallback

**If Approval Queue is Completely Down:**

```
FALLBACK TO MANUAL PROCESS:
1. Work directly in Chatwoot (you still have access)
2. Respond to customers manually
3. Use your Quick Start Guide for decision support
4. Escalate via Slack (same criteria)
5. Note in your daily log: "Approval queue down, worked manually [time period]"

NO IMPACT TO CUSTOMERS - they're still supported
```

**Approval queue is assistance, not requirement** - you can always work manually

---

## Feedback Helps Improve the System

**Every issue you report:**
- Helps us fix bugs faster
- Improves the experience for all operators
- Makes you a contributor to the product

**Thank you for being a pilot operator!** Your troubleshooting and feedback are invaluable.

---

## Quick Reference Summary

| Issue | Quick Fix |
|-------|-----------|
| **Slow loading** | Refresh, clear cache |
| **AI wrong** | Reject with note, handle manually |
| **Approval won't send** | Try again, check Chatwoot, report |
| **Can't find conversation** | Refresh, check filters |
| **Confidence weird** | Trust your judgment, not score |
| **KB link broken** | Open in Chatwoot, report |
| **Customer message missing** | Check in Chatwoot |
| **Escalation broken** | Slack manager immediately |
| **Duplicates** | Handle once, report |
| **Wrong button clicked** | Correct in Chatwoot ASAP |

**General Rule:** When in doubt, work in Chatwoot manually and report the issue.

---

**Document:** Operator Troubleshooting Guide  
**Created:** 2025-10-12  
**Purpose:** Quick solutions for common approval queue technical issues  
**Covers:** 10 common issues + technical problems + how to report  
**Emergency Fallback:** Work manually in Chatwoot (always available)

✅ **TASK 2F COMPLETE: Troubleshooting guide ready for operators**

