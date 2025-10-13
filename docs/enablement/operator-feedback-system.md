---
epoch: 2025.10.E1
doc: docs/enablement/operator-feedback-system.md
owner: support
category: feedback-system
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [operator-feedback, continuous-improvement, agent-sdk, quality-assurance]
---

# Operator Feedback Collection System

**Purpose**: Design systematic feedback collection from operators to improve Agent SDK approval queue  
**Target Audience**: Support managers, operations team  
**System**: Feedback → Analysis → Improvement loop  
**Created**: October 12, 2025

---

## 🎯 System Overview

### Why Collect Operator Feedback?

**Operators are the experts** who use the approval queue daily. Their feedback:
- ✅ Identifies AI training gaps
- ✅ Reveals UI/UX issues
- ✅ Highlights workflow inefficiencies
- ✅ Drives continuous improvement

**Feedback Loop**:
```
Operators use system
    ↓
Encounter issues/patterns
    ↓
Provide feedback
    ↓
Manager analyzes
    ↓
Engineer improves system
    ↓
Operators use improved system
    ↓
(Loop continues)
```

---

## 📊 Feedback Collection Methods

### Method 1: Daily Micro-Feedback (Real-Time)

**Format**: Quick inline feedback after each action  
**Time**: <10 seconds  
**Frequency**: Every REJECT or MODIFY action

**When to Collect**:
- Operator clicks **REJECT** → Micro-survey appears
- Operator clicks **MODIFY** → Optional quick note

**Micro-Survey (After REJECT)**:
```
┌────────────────────────────────────────────────┐
│ Why are you rejecting this response?          │
│                                                 │
│ ☐ Factually incorrect                         │
│ ☐ Unsafe advice                               │
│ ☐ Violates policy                             │
│ ☐ Hallucinated information                    │
│ ☐ Too generic/unhelpful                       │
│ ☐ Wrong customer/order                        │
│ ☐ Other: [________________]                   │
│                                                 │
│ [Optional] Brief note (1 sentence):           │
│ [_________________________________________]    │
│                                                 │
│         [Submit]      [Skip for now]          │
└────────────────────────────────────────────────┘
```

**Benefits**:
- Captures feedback at point of issue
- Low time burden (checkboxes)
- High participation rate (quick)

**Data Collected**:
- Rejection reasons (quantitative)
- Patterns over time (which errors most common?)
- Specific examples (qualitative notes)

---

### Method 2: Weekly Structured Feedback (15 minutes)

**Format**: Short survey sent every Friday  
**Time**: 10-15 minutes  
**Frequency**: Weekly  
**Participation**: Required for all operators using approval queue

**Weekly Feedback Form**:

```
APPROVAL QUEUE WEEKLY FEEDBACK — Week of [Date]

Operator: [Name]
Date: [Auto-filled]

═══════════════════════════════════════════════════

SECTION 1: USAGE METRICS (Auto-populated when possible)
───────────────────────────────────────────────────

1. How many responses did you review this week?
   [Auto: ___] (Verify: ☐ Correct  ☐ Edit: ___)

2. How many did you APPROVE?
   [Auto: ___] (Verify: ☐ Correct  ☐ Edit: ___)

3. How many did you MODIFY?
   [Auto: ___] (Verify: ☐ Correct  ☐ Edit: ___)

4. How many did you REJECT?
   [Auto: ___] (Verify: ☐ Correct  ☐ Edit: ___)

═══════════════════════════════════════════════════

SECTION 2: AI QUALITY (5 questions)
───────────────────────────────────────────────────

5. Overall AI accuracy this week:
   ☐ Excellent (90%+ correct)
   ☐ Good (70-89% correct)
   ☐ Fair (50-69% correct)
   ☐ Poor (<50% correct)

6. Most common AI mistakes this week:
   ☐ Wrong product sizing
   ☐ Incorrect technical information
   ☐ Hallucinated products
   ☐ Too generic/vague
   ☐ Wrong tone
   ☐ No major issues
   ☐ Other: [_______________]

7. Did you encounter any unsafe advice from AI?
   ☐ No
   ☐ Yes → Ticket #s: [___________]

8. Did AI improve compared to last week?
   ☐ Yes, noticeably better
   ☐ About the same
   ☐ No, seems worse
   ☐ First week using system

9. One specific AI response that impressed you:
   Ticket #: [_______]
   Why: [____________________________________]

═══════════════════════════════════════════════════

SECTION 3: SYSTEM USABILITY (5 questions)
───────────────────────────────────────────────────

10. System performance this week:
    ☐ Fast and responsive
    ☐ Mostly fine, occasional slowness
    ☐ Often slow
    ☐ Frequently crashed/errors

11. Any technical issues encountered?
    ☐ No issues
    ☐ Yes → Describe: [_____________________]

12. Hardest part of using approval queue:
    ☐ Finding the right playbook reference
    ☐ Deciding approve vs modify vs reject
    ☐ Editing responses (MODIFY interface)
    ☐ System is slow/unresponsive
    ☐ Nothing particularly hard
    ☐ Other: [_______________]

13. Feature you wish existed:
    [_____________________________________________]

14. On a scale of 1-10, how easy is the approval
    queue to use?
    [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ] [ 8 ] [ 9 ] [ 10 ]
    Very Hard ←─────────────────────────────→ Very Easy

═══════════════════════════════════════════════════

SECTION 4: EFFICIENCY & WORKLOAD (3 questions)
───────────────────────────────────────────────────

15. Compared to manual responses (without AI):
    ☐ Much faster with AI (2X+)
    ☐ Somewhat faster
    ☐ About the same
    ☐ Actually slower
    ☐ N/A (didn't do manual before)

16. Average time per response review:
    ☐ <2 minutes
    ☐ 2-5 minutes
    ☐ 5-10 minutes
    ☐ >10 minutes

17. Can you handle more tickets with AI assistance?
    ☐ Yes, significantly more
    ☐ Yes, somewhat more
    ☐ About the same workload
    ☐ No, actually harder to keep up

═══════════════════════════════════════════════════

SECTION 5: TRAINING & SUPPORT (3 questions)
───────────────────────────────────────────────────

18. Do you feel confident using the approval queue?
    ☐ Very confident
    ☐ Mostly confident
    ☐ Somewhat uncertain
    ☐ Need more training

19. Which documentation is most helpful?
    ☐ Quick Start Guide
    ☐ Support Playbook
    ☐ Hot Rod AN product playbooks
    ☐ None, I wing it
    ☐ Need better docs for: [___________]

20. What training would help you most?
    ☐ More practice scenarios
    ☐ Deeper product knowledge
    ☐ AI decision-making strategies
    ☐ System technical training
    ☐ I'm good, no additional training needed
    ☐ Other: [_______________]

═══════════════════════════════════════════════════

SECTION 6: OPEN FEEDBACK (2 questions)
───────────────────────────────────────────────────

21. One thing to improve for next week:
    [____________________________________________]
    [____________________________________________]

22. Any other feedback, suggestions, or concerns:
    [____________________________________________]
    [____________________________________________]

═══════════════════════════════════════════════════

[Submit Feedback]

Thank you! Your feedback drives improvement.
```

**Distribution**:
- Sent: Every Friday at 3:00 PM
- Reminder: Monday at 9:00 AM if not submitted
- Deadline: Monday at 5:00 PM

**Participation Tracking**:
- Target: 100% completion rate
- Logged: Who submitted, who didn't
- Follow-up: Manager reaches out to non-responders

---

### Method 3: Monthly Deep-Dive (45 minutes)

**Format**: One-on-one conversation with manager  
**Time**: 30-45 minutes  
**Frequency**: Monthly  
**Participation**: All operators using approval queue

**Monthly Feedback Session**:

**Agenda**:
```
1. Review metrics (10 min)
   - Your approval/modify/reject rates
   - Trends over the month
   - Compare to team average

2. Discuss challenges (15 min)
   - What's hardest about using the system?
   - Any recurring frustrations?
   - Patterns you've noticed?

3. Share successes (10 min)
   - AI responses that were perfect
   - Time saved vs manual responses
   - Customer feedback you received

4. Training needs (5 min)
   - Topics you want more training on
   - Playbook gaps you've identified

5. Ideas for improvement (10 min)
   - Feature requests
   - Process changes
   - Training enhancements
```

**Documentation**:
- Manager takes notes during session
- Action items identified
- Follow-up scheduled if needed

---

### Method 4: Ad-Hoc Issue Reports (As Needed)

**Format**: Submit anytime an issue occurs  
**Time**: 2-5 minutes  
**Frequency**: As needed

**Quick Issue Report Form**:
```
Subject: [ISSUE] Brief Description

Operator: [Auto-filled]
Date/Time: [Auto-filled]

Issue Type:
☐ Technical problem
☐ AI quality issue
☐ Process/workflow issue
☐ Training gap
☐ Other

Description:
[What happened?]

Impact:
☐ Blocking my work
☐ Major inconvenience
☐ Minor annoyance
☐ Just FYI

Ticket # (if applicable): [____]

[Submit]
```

**Response Time**:
- Blocking: Manager responds <30 minutes
- Major: Manager responds <2 hours
- Minor: Manager reviews by end of day

---

## 📈 Feedback Analysis Process

### Weekly Analysis (Manager)

**Every Monday Morning (30 minutes)**:

**Step 1: Review Weekly Feedback Forms** (15 min)
```
1. Pull all submitted weekly feedback
2. Calculate aggregate metrics:
   - Average approval rate across all operators
   - Most common AI mistakes (tally checkboxes)
   - System usability score (average 1-10)
   - Efficiency rating (% saying "faster with AI")
3. Identify patterns:
   - Same issue mentioned by 3+ operators?
   - Decline in approval rate?
   - New problems emerging?
```

**Step 2: Review Micro-Feedback (REJECT reasons)** (10 min)
```
1. Query database: REJECT reasons from past week
2. Count by category:
   - Factually incorrect: ___ %
   - Unsafe advice: ___ %
   - Hallucinated: ___ %
   - Too generic: ___ %
3. Identify top 3 categories
4. Pull example tickets for each
```

**Step 3: Create Action Items** (5 min)
```
Based on analysis, create action items:
• AI Training: "Retrain AI on [topic] - rejection rate 15%"
• System Fix: "Fix slow loading issue - reported by 5 operators"
• Documentation: "Add playbook section on [gap identified]"
• Training: "Schedule refresher on [topic] - 3 operators uncertain"
```

**Step 4: Share Summary with Team** (Email/Slack)
```
To: #support-team
Subject: Weekly Approval Queue Feedback Summary

This Week's Highlights:
• Approval Rate: [X]% (↑/↓ from last week)
• Top AI Issue: [Issue] ([X] reports)
• System Usability: [X]/10 average
• Efficiency: [X]% say faster with AI

Action Items:
1. [Action] - Owner: [Name] - Due: [Date]
2. [Action] - Owner: [Name] - Due: [Date]

Great work this week! Keep the feedback coming!
```

---

### Monthly Analysis (Manager + Engineer)

**First Monday of Each Month (60 minutes)**:

**Step 1: Review Monthly Trends** (20 min)
```
1. Chart approval rates over 4 weeks:
   Week 1: [X]%
   Week 2: [X]%
   Week 3: [X]%
   Week 4: [X]%
   Trend: ↑ Improving / → Stable / ↓ Declining

2. Most common AI errors (last 30 days):
   #1: [Error type] - [X]% of rejections
   #2: [Error type] - [X]% of rejections
   #3: [Error type] - [X]% of rejections

3. System usability trend:
   Week 1: [X]/10
   Week 2: [X]/10
   Week 3: [X]/10
   Week 4: [X]/10
   Trend: ↑ Improving / → Stable / ↓ Declining

4. Efficiency metrics:
   Tickets per hour: [X] (vs [Y] baseline)
   Review time: [X] min average
   Operator satisfaction: [X]%
```

**Step 2: Deep-Dive Analysis** (20 min)
```
Engineer joins to discuss:

AI Training Needs:
• What topics need more training data?
• Which playbooks need expansion?
• Are there knowledge gaps in LlamaIndex?

System Improvements:
• What technical issues are recurring?
• What features would improve workflow?
• Performance bottlenecks identified?

Process Changes:
• Is approval workflow efficient?
• Are escalation paths clear?
• Documentation gaps?
```

**Step 3: Prioritize Improvements** (10 min)
```
Create prioritized improvement backlog:

P0 (This Week):
• [Critical fix/improvement]

P1 (This Month):
• [Important enhancement]
• [AI training update]

P2 (Next Quarter):
• [Nice-to-have feature]
• [Process optimization]
```

**Step 4: Schedule Follow-Ups** (10 min)
```
• Engineer: Commits to P0/P1 implementation timeline
• Manager: Schedules monthly 1-on-1s with operators
• Both: Agree on success metrics for next month
```

---

## 🔄 Feedback → Improvement Loop

### How Feedback Drives Change

**Stage 1: Collection** (Operators)
```
Operators provide feedback through:
• Micro-feedback (daily, real-time)
• Weekly surveys
• Monthly 1-on-1s
• Ad-hoc issue reports
```

**Stage 2: Analysis** (Manager)
```
Manager analyzes weekly and monthly:
• Identifies patterns
• Prioritizes issues
• Creates action items
```

**Stage 3: Implementation** (Engineer/Manager)
```
Engineer:
• AI retraining (knowledge gaps)
• System fixes (bugs, performance)
• New features (workflow improvements)

Manager:
• Documentation updates
• Training sessions
• Process changes
```

**Stage 4: Communication** (Manager → Operators)
```
Manager notifies operators of improvements:
• "Based on your feedback, we fixed [X]"
• "AI has been retrained on [topic]"
• "New feature: [Feature] - requested by 5 of you!"
```

**Stage 5: Validation** (Operators)
```
Operators verify improvements:
• Is AI better on [topic]?
• Is system faster now?
• Is workflow smoother?
• Feedback loop continues...
```

---

### Example: Feedback → Improvement Cycle

**Week 1**: 3 operators report "AI gives wrong AN sizing for 3/8 inch hose (says AN-8, should be AN-6)"

**Week 2**: Manager analyzes → Confirms pattern (15% of rejections are sizing errors)

**Week 3**: Engineer retrains AI with corrected sizing examples from playbooks

**Week 4**: Manager notifies operators: "AI has been retrained on AN sizing. Please watch for improvements and report if still seeing errors."

**Week 5**: Operators report "Sizing errors decreased! Now <5% rejection for sizing"

**Result**: Feedback → Pattern identified → AI improved → Operators validated → Success

---

## 📊 Feedback Metrics Dashboard

### Manager Dashboard (Track Weekly)

**AI Quality Metrics**:
```
┌─────────────────────────────────────────────────┐
│ APPROVAL RATE TREND                             │
├─────────────────────────────────────────────────┤
│ Week 1: ████████████████░░░░░░░ 65%             │
│ Week 2: █████████████████░░░░░░ 70%             │
│ Week 3: ██████████████████░░░░░ 73%             │
│ Week 4: ████████████████████░░░ 78%  ↑ Improving│
│                                                  │
│ Target: >70%                                     │
│ Status: ✅ ON TARGET                             │
└─────────────────────────────────────────────────┘

REJECTION REASONS (Last 30 Days):
• Factually incorrect: 35%  ← #1 Issue
• Too generic: 25%
• Hallucinated: 20%
• Unsafe advice: 10%
• Other: 10%

Action: Retrain AI on fact accuracy
```

**Operator Efficiency Metrics**:
```
┌─────────────────────────────────────────────────┐
│ TICKETS PER HOUR                                │
├─────────────────────────────────────────────────┤
│ Baseline (Manual): 3.2 tickets/hour             │
│ With AI: 5.8 tickets/hour                       │
│ Improvement: +81% ✅                             │
│                                                  │
│ REVIEW TIME                                     │
│ Average: 4.2 minutes/response                   │
│ Target: <5 minutes                              │
│ Status: ✅ ON TARGET                             │
└─────────────────────────────────────────────────┘
```

**System Health Metrics**:
```
┌─────────────────────────────────────────────────┐
│ SYSTEM USABILITY                                │
├─────────────────────────────────────────────────┤
│ Ease of Use: 8.2/10 (↑ from 7.5 last month)     │
│ Performance: 85% say "fast and responsive"      │
│ Technical Issues: 3 reported this week           │
│                                                  │
│ OPERATOR SATISFACTION                           │
│ Would recommend AI: 92% ✅                       │
│ Prefer AI over manual: 88% ✅                    │
│ Feel confident using: 85% ✅                     │
└─────────────────────────────────────────────────┘
```

---

## ✅ System Implementation Checklist

### Before Launch

**Technology Setup**:
- [ ] Micro-feedback form embedded in approval queue (after REJECT)
- [ ] Weekly survey form created (Google Forms or internal)
- [ ] Ad-hoc issue report form created
- [ ] Database to store feedback responses
- [ ] Dashboard to visualize metrics

**Process Setup**:
- [ ] Weekly analysis schedule on manager's calendar
- [ ] Monthly deep-dive meeting scheduled (Manager + Engineer)
- [ ] Feedback summary template created
- [ ] Action item tracking system (Asana, Jira, or spreadsheet)

**Team Setup**:
- [ ] Operators trained on how to provide feedback
- [ ] Expectation set: Weekly survey is required
- [ ] Manager committed to weekly analysis
- [ ] Engineer committed to monthly review

**Communication Setup**:
- [ ] #feedback-improvements Slack channel created
- [ ] Weekly summary email template
- [ ] Process for notifying operators of improvements

---

## 📚 Related Documentation

### Required Reading
- `docs/enablement/approval-queue-quick-start.md` - Operator training
- `docs/support/playbooks/agent-sdk-support-playbook.md` - Troubleshooting guide
- `docs/enablement/pilot-customer-selection-criteria.md` - Pilot feedback collection

### Reference Materials
- `docs/AgentSDKopenAI.md` - Section 13: Training loop and feedback collection
- `docs/runbooks/operator_training_qa_template.md` - Training framework

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Review Frequency**: Quarterly  
**Next Review**: January 12, 2026

**Questions?** Contact feedback-system@hotdash.com or post in #feedback-improvements Slack channel

---

## 🎯 Quick Reference: Feedback Collection Schedule

```
┌──────────────────────────────────────────────────────┐
│     OPERATOR FEEDBACK COLLECTION SCHEDULE            │
├──────────────────────────────────────────────────────┤
│ DAILY (Real-time):                                   │
│   • Micro-feedback after REJECT action               │
│   • <10 seconds per submission                       │
│                                                       │
│ WEEKLY (Friday 3pm):                                 │
│   • Structured survey (10-15 min)                    │
│   • Required for all operators                       │
│   • Due: Monday 5pm                                  │
│                                                       │
│ MONTHLY (First week):                                │
│   • One-on-one with manager (30-45 min)              │
│   • Review metrics, discuss challenges               │
│   • Scheduled individually                           │
│                                                       │
│ AD-HOC (As needed):                                  │
│   • Issue report form (2-5 min)                      │
│   • Submit anytime issue occurs                      │
│   • Manager responds based on urgency                │
├──────────────────────────────────────────────────────┤
│ MANAGER ANALYSIS:                                    │
│   • Weekly: Every Monday morning (30 min)            │
│   • Monthly: First Monday + Engineer (60 min)        │
│   • Share summary with team                          │
│                                                       │
│ FEEDBACK → IMPROVEMENT CYCLE:                        │
│   Collect → Analyze → Implement → Communicate        │
│   → Validate → Repeat                                │
└──────────────────────────────────────────────────────┘
```

**Your feedback makes the system better for everyone! 🚀**

