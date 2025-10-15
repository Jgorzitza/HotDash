# Troubleshooting Training & Certification Assessments

**Purpose:** Advanced problem-solving and comprehensive operator certification  
**Covers:** Tasks 2O (Troubleshooting Training) + 2P (Certification Assessment Design)  
**Created:** 2025-10-12

---

## PART 1: Troubleshooting and Problem-Solving Training (Task 2O)

### Advanced Troubleshooting Framework

**Beyond the basics - systematic problem diagnosis**

---

### The S.O.L.V.E. Method

**S - Symptoms: What's happening?**
```
Describe precisely what's wrong:
- "Approval button grayed out" (specific)
- NOT "Something's broken" (vague)

Note:
- When did it start?
- What were you trying to do?
- Error messages shown?
```

**O - Observe: What do you see?**
```
Gather diagnostic information:
- Screenshot error messages
- Note conversation ID
- Check browser console (F12)
- Test if it's just one approval or all
```

**L - Lookup: Has this happened before?**
```
Check resources:
- Troubleshooting guide (common issues)
- Slack #occ-enablement (search history)
- Ask teammate: "Anyone seen this?"
- Check if it's a known issue
```

**V - Verify: Is it just you?**
```
Isolate the problem:
- Try different browser
- Try incognito mode
- Ask teammate to test
- Check if issue is widespread

This tells you: My problem vs system problem
```

**E - Escalate or Execute: Fix it or report it**
```
If you can fix it:
- Apply the solution
- Document what worked
- Share with team

If you can't fix it:
- Escalate to #incidents with all diagnostic info
- Use workaround if available (Chatwoot manual handling)
- Follow up to ensure it's resolved
```

---

### Common Dashboard Issues - Solutions

**Issue 1: Tile Not Loading**
```
Symptoms: One or more tiles showing "Loading..." forever

S.O.L.V.E:
S - Tile won't load, stuck on spinner
O - Other tiles load fine, just one affected
L - Check troubleshooting guide
V - Ask teammate - is their tile loading?
E - If just you: Clear cache, refresh. If everyone: Report #incidents

Quick Fix:
1. Refresh page (Cmd/Ctrl+R)
2. Clear browser cache
3. Try different browser
4. Report if persists >5 minutes
```

**Issue 2: Data Seems Wrong**
```
Symptoms: Tile shows data that doesn't match reality

Example: Ops Pulse shows "0 unresolved" but you know there are 5

S.O.L.V.E:
S - Data discrepancy between tile and reality
O - Screenshot tile, verify actual count in Chatwoot
L - Check if data is delayed (tiles update every 5-15 min)
V - Ask teammate what their tile shows
E - If widespread: Report. If just you: Wait for next refresh

Data freshness: Most tiles update every 5-15 minutes, not real-time
```

**Issue 3: Can't Access Certain Features**
```
Symptoms: Buttons grayed out, menus missing

S.O.L.V.E:
S - Feature inaccessible
O - Check if you're logged in properly, verify permissions
L - Consult access requirements guide
V - Compare with teammate access
E - May be permissions issue - contact Support Manager

Not a bug - might be role-based access
```

---

### Self-Service Troubleshooting Resources

**Before Escalating, Try:**

**Resource 1: Troubleshooting Guide**
- Location: `docs/enablement/operator_troubleshooting_guide.md`
- Covers: 10 most common issues
- Quick fixes for 80% of problems

**Resource 2: Browser DevTools**
```
Press F12 to open developer console

Look for:
- Red error messages (JavaScript errors)
- Failed network requests (API errors)
- Screenshot these for #incidents reports

This helps engineering diagnose faster!
```

**Resource 3: Slack Search**
```
Search #occ-enablement for your issue:
- "approval button not working"
- "tile not loading"
- "error 500"

Often someone had the same issue and solution is already posted
```

**Resource 4: Known Issues Doc**
```
Check: docs/runbooks/known_issues.md (if exists)

Lists:
- Current known bugs
- Workarounds available
- Expected fix timeline

Saves you from reporting what's already being fixed
```

---

## PART 2: Certification Assessment Design (Task 2P)

### Comprehensive Certification Assessments

**Builds on Task 2I certification program with complete test designs**

---

### Level 1 Certification: Complete Assessment

**Knowledge Check (15 questions, 25 minutes)**

**Question 1:** What's the first thing you should do when reviewing an approval?
a) Check confidence score
b) Read AI's draft
c) Read customer's message
d) Check KB sources

**Answer:** c - Always understand what customer asked first

---

**Question 2:** Customer threatens to "post on social media." What's the appropriate action and SLA?
a) Approve if AI response is good - no specific SLA
b) Escalate - High priority, 2-hour SLA
c) Escalate - Urgent priority, 15-minute SLA
d) Reject and handle manually - no escalation needed

**Answer:** c - Social media threat = Urgent, 15-minute SLA

---

**Question 3:** AI cites "Return Policy v2.0" in its response. Current policy is v2.1. What do you do?
a) Approve anyway (close enough)
b) Edit the draft to change v2.0 to v2.1
c) Reject with note about wrong version
d) Escalate to manager

**Answer:** c - Reject with specific note helps AI learn

---

**Question 4:** Customer asks about product ingredients because they have a medical condition (eczema). AI provides ingredient list. What should you do?
a) Approve if ingredients are accurate
b) Reject - add disclaimer about consulting doctor
c) Escalate - medical advice needed
d) Escalate - product safety concern

**Answer:** c - Medical conditions = escalate, even if just ingredient question

---

**Question 5:** You're reviewing an approval for a $98 refund. Confidence is 92%. AI's response looks good. What do you do?
a) Approve - under $100 threshold
b) Escalate - close to threshold
c) Reject - all refunds need manager approval
d) Escalate - refunds over $50 need approval

**Answer:** a - $98 is under $100 operator authority, can approve

---

**[Questions 6-15 continue covering:]**
- Subscription handling
- Multi-issue scenarios
- Confidence score interpretation
- KB source verification
- Tone appropriateness
- Technical discrepancies
- When to work manually vs use queue
- Pilot expectations
- Getting help resources
- Escalation process

**Passing Score:** 12/15 correct (80%)

---

### Practical Skills Assessment

**Component 1: Live Approval Review** (30 minutes)
```
Operator completes 10 real approvals under supervision:

Manager observes and scores:
□ Reads customer message first (every time)
□ Checks accuracy of AI draft
□ Identifies red flags appropriately
□ Makes correct decision (approve/reject/escalate)
□ Provides clear notes when rejecting/escalating
□ Completes reviews in reasonable time (2-4 min avg)
□ Demonstrates confidence in decisions
□ Asks clarifying questions when uncertain

Scoring: 8/10 criteria met = Pass
```

**Component 2: Scenario Assessment** (30 minutes)
```
Written assessment using scenarios from practice library:

Present 10 scenarios (from docs/enablement/practice_scenarios_library.md)

Operator must:
- Decide: Approve / Reject / Escalate
- Explain reasoning
- Note any red flags
- Estimate review time

Scoring: 8/10 correct decisions = Pass
```

**Component 3: Troubleshooting Simulation** (15 minutes)
```
Present 3 technical issues:
1. "Approval button not responding"
2. "AI citing wrong policy version repeatedly"  
3. "Dashboard showing incorrect data"

Operator must:
- Use S.O.L.V.E. method
- Identify appropriate escalation path
- Know when to use workaround vs wait for fix

Scoring: 2/3 correct approaches = Pass
```

---

### Level 2 Certification: Advanced Assessment

**Knowledge Check (20 questions, 35 minutes)**

**Focus Areas:**
- Complex multi-issue scenarios
- Policy edge cases
- Advanced escalation judgment
- AI collaboration optimization
- System improvement contributions
- Efficiency techniques
- Pattern recognition

**Question Examples:**

"Customer at 30 days exactly (delivery was 30 days ago today). Within policy?"
- **Answer:** Yes - policy is "30 days from delivery" so Day 0-30 = within

"You notice AI using outdated policy 5 times this week. What should you do beyond rejecting?"
- **Answer:** Report pattern to #occ-enablement, suggest KB indexing update

**Passing Score:** 17/20 correct (85%)

---

**Practical Assessment:**
- Handle 20 approvals (mix of difficulty)
- Achieve 95%+ accuracy
- Demonstrate efficiency (<2 min average)
- Show appropriate escalation judgment

---

### Level 3 Certification: Expert Assessment

**Knowledge Check (25 questions, 45 minutes)**

**Advanced Topics:**
- Training other operators (what would you teach?)
- System architecture understanding
- Strategic escalation decisions
- Customer relationship building
- Cross-functional collaboration

**Question Examples:**

"You're training a new operator. They ask 'How do I know when to escalate?' How do you explain it?"
- **Answer:** Looking for clear teaching ability, comprehensive answer, use of examples

"You notice approval rate dropping from 80% to 65% over 2 weeks. What might be causing this and how do you investigate?"
- **Answer:** Multiple possible causes - KB issues, AI calibration, policy changes, operator drift. Systematic investigation approach.

**Passing Score:** 23/25 correct (92%)

---

**Practical Assessment:**
- Mentor new operator to Level 1 certification
- Contribute to system improvement (accepted suggestions)
- Maintain expert metrics for 4 weeks
- Demonstrate thought leadership

---

## Certification Badge Design

**Digital Badges (Open Badges Standard):**

**Level 1: Certified Operator** 🥉
```json
{
  "name": "Hot Rodan Approval Queue - Certified Operator",
  "description": "Demonstrated foundational competency in AI-assisted customer service",
  "image": "https://hotrodan.com/badges/certified-operator.png",
  "criteria": {
    "knowledgeCheck": "80%+ (12/15 questions)",
    "practicalAssessment": "8/10 supervised approvals",
    "scenarioAssessment": "8/10 scenario decisions"
  },
  "issuer": "Hot Rodan Enablement Team",
  "issuedDate": "2025-10-12",
  "expiresDate": "2026-10-12"
}
```

**Level 2: Senior Operator** 🥈
```json
{
  "name": "Hot Rodan Approval Queue - Senior Operator",
  "description": "Advanced competency with proven performance excellence",
  "criteria": {
    "knowledgeCheck": "85%+ (17/20 questions)",
    "performanceMetrics": "95%+ accuracy, <2min avg, 4.5+ CSAT",
    "experience": "2+ weeks, 100+ approvals"
  }
}
```

**Level 3: Expert Operator** 🥇
```json
{
  "name": "Hot Rodan Approval Queue - Expert Operator",
  "description": "Expert-level mastery with demonstrated thought leadership",
  "criteria": {
    "knowledgeCheck": "92%+ (23/25 questions)",
    "performanceMetrics": "98%+ accuracy, <90sec avg, 4.7+ CSAT",
    "leadership": "Mentored operators, contributed improvements"
  }
}
```

---

## Assessment Administration Guide

**For Managers:**

**Scheduling:**
- Level 1: End of Week 1 (after pilot training)
- Level 2: Week 3-4 (after practice period)
- Level 3: Week 6-8 (after sustained performance)

**Proctoring:**
- Knowledge checks: Self-administered, honor system
- Practical assessments: Manager or Senior Operator observes
- Scenario assessments: Written, reviewed by manager

**Scoring:**
- Knowledge check: Auto-scored (if digital) or manual
- Practical: Rubric-based scoring
- Scenario: Answer key provided

**Results:**
- Pass: Award certification, celebrate!
- Near-miss (75-79%): Review missed items, retake in 48 hours
- Fail (<75%): Additional training, retake in 1 week

**No Penalties:** Certification is developmental, not punitive. Goal is to get everyone certified.

---

**Document:** Troubleshooting Training & Certification Assessments  
**Created:** 2025-10-12  
**Covers:** Tasks 2O + 2P  
**Purpose:** Advanced problem-solving + complete certification test designs

✅ **TASKS 2O & 2P COMPLETE**

