# Pilot Week 1 Monitoring Plan (Oct 28 - Nov 1)

**Version**: 1.0
**Date**: October 12, 2025
**Owner**: Product Agent
**Purpose**: Daily monitoring checklist for pilot Week 1 success
**Evidence Path**: `docs/pilot_week1_monitoring_plan.md` (Daily checks, metrics targets, escalation triggers)

---

## Overview

**Pilot Week 1**: October 28 - November 1, 2025 (5 days)
**Goal**: Validate Agent SDK with 5 operators, prove value, identify issues
**Primary Metric**: **Operator satisfaction >6.5/10**

---

## Daily Monitoring Checklist

### Every Morning (8:00 AM)

**Run System Health Check**:

```bash
cd /home/justin/HotDash/hot-dash

# Check all services
npm run pilot:health-check

# Expected output:
# ✅ API: healthy
# ✅ Approval Queue: healthy
# ✅ Knowledge Base: healthy (42 docs indexed)
# ✅ Database: healthy
```

**Review Overnight Activity**:

- [ ] Check error logs from previous day
- [ ] Verify zero critical errors
- [ ] Check for any system alerts

**Prepare for Daily Standup** (9:00 AM):

- [ ] Review yesterday's metrics
- [ ] Prepare key insights to share
- [ ] List any issues to discuss

---

### Daily Standup (9:00 AM - 9:15 AM)

**Agenda** (15 minutes max):

1. **Quick Wins** (3 min)
   - Share positive feedback from yesterday
   - Celebrate milestones

2. **Metrics Snapshot** (3 min)
   - Yesterday's numbers (drafts reviewed, approval rate)
   - Trend vs target

3. **Issues & Questions** (5 min)
   - Any blockers?
   - Questions from operators

4. **Today's Focus** (2 min)
   - What to pay attention to today
   - Any experiments or changes

5. **Open Floor** (2 min)
   - Operator concerns or suggestions

**Post Standup**:

- [ ] Share summary in Slack #agent-sdk-pilot
- [ ] Log standup notes in `feedback/product.md`

---

### Every 2 Hours (Monitoring Loop)

**10:00 AM, 12:00 PM, 2:00 PM, 4:00 PM**:

**Check Real-Time Metrics**:

```bash
# Run real-time dashboard query
npm run pilot:metrics:realtime

# Expected metrics:
# - Queue depth: <10 (target)
# - Avg review time: <2 min (target)
# - System response time: <500ms (target)
# - Active operators: 5 (all pilots logged in)
```

**Slack Health Check**:

- [ ] Any operator questions unanswered >5 min?
- [ ] Any concerning feedback or complaints?
- [ ] Any celebration opportunities?

**Quick Actions**:

- Respond to questions immediately
- Log any new bugs reported
- Share encouraging updates

---

### Office Hours (2:00 PM - 3:00 PM Daily)

**Open Zoom Room**:

- Product Agent available for drop-in questions
- Screen share for troubleshooting
- Collect detailed feedback

**Document Feedback**:

- [ ] Log all questions asked
- [ ] Note patterns (recurring issues)
- [ ] Capture exact quotes for learnings

**Example Log Format** (`feedback/product.md`):

```markdown
## Office Hours - 2025-10-28 (Day 1)

**Attendees**: Sarah, Marcus (2/5 operators)

**Questions Asked**:

- Sarah: "How do I know if a draft is good?" → Showed confidence score interpretation
- Marcus: "Can I save custom templates?" → Feature request noted for Phase 2

**Feedback**:

- Sarah: "I love the bulk approve for simple questions" (positive!)
- Marcus: "KB missing info on price matching" → Escalated to Support Agent

**Action Items**:

- [ ] Add price matching article to KB (Support Agent)
- [ ] Consider custom templates for Phase 2 (Product backlog)
```

---

### End of Day Review (5:00 PM - 5:30 PM)

**Run Daily Metrics Summary**:

```bash
# Generate end-of-day report
npm run pilot:metrics:daily-summary

# Expected output:
# Day 1 (Oct 28, 2025)
# ==================
# Drafts reviewed: 87
# Approval rate: 48% (target: >35%) ✅
# Avg review time: 1.2 min (target: <2 min) ✅
# System uptime: 100% (target: >95%) ✅
# Operator satisfaction: 7.2/10 (target: >6.5) ✅
```

**Post Daily Update in Slack**:

```
📊 Day [X] Pilot Summary

Great work today, team! Here's our progress:

**Metrics**:
- ✅ [X] drafts reviewed
- ✅ [X]% approval rate
- ✅ System uptime: [X]%
- ✅ Team satisfaction: [X]/10

**Highlights**:
- 🎉 [Operator achievement]
- 🎉 [Positive feedback quote]

**Improvements Deployed**:
- 🔧 [Bug fix or enhancement]

**Tomorrow's Focus**:
- [What to pay attention to]

[Link to quick survey]

Questions? Drop them here! See you tomorrow at 9 AM standup.
```

**Send Daily Quick Survey**:

- [ ] Post Google Form link in Slack
- [ ] 2 questions max (satisfaction rating + quick thought)
- [ ] Track response rate (aim for 100%)

---

### Weekly Deep Dive (Fridays at 4:00 PM)

**Week 1: November 1, 2025**

**Run Weekly Metrics Analysis**:

```bash
# Generate Week 1 comprehensive report
npm run pilot:metrics:weekly-report --week=1

# Expected output:
# Week 1 Summary (Oct 28 - Nov 1, 2025)
# =====================================
# Total drafts reviewed: 387
# Avg approval rate: 46% (trending up!)
# Avg review time: 1.3 min (trending down!)
# System uptime: 99.8%
# Operator satisfaction: 7.4/10
```

**Week 1 Debrief Meeting** (Product, Engineer, Manager):

**Agenda**:

1. Review metrics vs targets
2. Operator feedback themes
3. Bugs and fixes deployed
4. KB gaps filled
5. Week 2 adjustments

**Deliverable**:

- [ ] Week 1 Learnings Document
- [ ] Week 2 Action Plan
- [ ] Share with operators: "Here's what we learned and what we're changing"

---

## Metrics Targets (Week 1)

| Metric                    | Target    | Red Flag (<) | Green Flag (>) |
| ------------------------- | --------- | ------------ | -------------- |
| **Operator Satisfaction** | >6.5/10   | <6.0         | >7.5           |
| **Approval Rate**         | >35%      | <25%         | >50%           |
| **Avg Review Time**       | <2 min    | >3 min       | <1 min         |
| **System Uptime**         | >95%      | <90%         | >99%           |
| **Active Operators**      | 5/5 daily | <4/5         | 5/5            |
| **Survey Response Rate**  | >80%      | <50%         | 100%           |

---

## Escalation Triggers

### 🟢 Green (All Good - Continue)

- Metrics at or above targets
- Positive operator feedback
- Operators actively using system
- Few bugs, quick fixes

**Action**: Continue pilot, celebrate wins

---

### 🟡 Yellow (Needs Attention)

- Metrics slightly below target (but trending up)
- Mixed operator feedback (some love, some frustration)
- Non-critical bugs accumulating
- 1 operator considering quitting

**Action**:

- Daily team huddle to address issues
- Prioritize top 3 pain points
- Extra office hours
- Weekly survey to deep-dive concerns

---

### 🔴 Red (Pause Pilot)

- Metrics significantly below targets
- Multiple operators want to quit
- Critical bugs affecting all operators
- System uptime <90%
- Security or data issue

**Action**:

- Immediate team meeting (Product, Engineer, Manager)
- Pause pilot temporarily
- Fix critical issues
- Go/no-go decision before resuming

**Criteria to Resume**:

- All critical bugs fixed
- Operators willing to try again
- Clear plan to address top concerns

---

## Daily Metrics Tracking Spreadsheet

**Create Google Sheet**: `HotDash Pilot Week 1 Metrics`

**Columns**:
| Date | Drafts Reviewed | Approval Rate | Avg Review Time | System Uptime | Operator Satisfaction | Notes |
|------|----------------|---------------|-----------------|---------------|----------------------|-------|
| Oct 28 | 87 | 48% | 1.2 min | 100% | 7.2/10 | Strong start! |
| Oct 29 | [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | |
| Oct 30 | [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | |
| Oct 31 | [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | |
| Nov 1 | [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | Week 1 ends |

**Update Daily**: After end-of-day review (5:00 PM)

**Share Access**: Product, Engineer, Manager, QA

---

## Operator Feedback Tracking

**Feedback Categories**:

- 🎉 **Wins**: What operators love
- 😕 **Friction**: What frustrates operators
- 🐛 **Bugs**: Technical issues reported
- 💡 **Ideas**: Feature requests or suggestions
- ❓ **Questions**: Recurring questions (indicates training gap)

**Example Log**:

```markdown
## Feedback Log - Week 1

### 2025-10-28 (Day 1)

- 🎉 Sarah: "This saved me 2 hours today" (positive!)
- 😕 Marcus: "Bulk approve button is hard to find" (UX issue)
- 🐛 David: "Draft had wrong order number for ticket #12345" (bug)
- 💡 Emily: "Can we add a 'add apology' button?" (feature request)
- ❓ Aisha: "When should I escalate?" (3rd time asked - training gap)

**Action Items**:

- [ ] Move bulk approve button to top (Designer + Engineer)
- [ ] Investigate order number mismatch (Engineer)
- [ ] Add "add apology" to Phase 2 backlog
- [ ] Update training materials on escalation criteria
```

---

## Knowledge Base Gap Tracking

**Monitor Daily**: Top queries with no KB results

**Process**:

1. Run `npm run pilot:kb-gaps` daily
2. Review top 10 queries that failed to retrieve relevant articles
3. Create missing articles within 24 hours (Support Agent)
4. Track KB coverage improvement: 75% → 90% by Week 2

**Example**:

```markdown
## KB Gaps - Week 1

### Day 1 (Oct 28)

- "Do you price match?" → No article found → CREATED (Oct 28)
- "Can I use Apple Pay?" → No article found → CREATED (Oct 29)
- "What's your BBB rating?" → Edge case, not creating article

### Day 2 (Oct 29)

- "Do you ship to APO addresses?" → No article found → CREATED (Oct 29)

**KB Coverage**:

- Oct 27: 75%
- Oct 28: 78%
- Oct 29: 82%
- Target: 90% by Nov 1
```

---

## Bug Triage Process

**Bug Priority Levels**:

**P0 (Critical - Fix Immediately)**:

- System down
- Data loss or corruption
- Security vulnerability
- All operators blocked

**Action**: Escalate to Engineer immediately, pause pilot if needed

---

**P1 (High - Fix Today)**:

- Major feature broken (e.g., can't approve drafts)
- Affects all operators
- Significantly impacts usability

**Action**: Engineer prioritizes, aim to fix same day

---

**P2 (Medium - Fix This Week)**:

- Minor feature broken (e.g., dashboard doesn't update)
- Affects some operators
- Workaround available

**Action**: Add to sprint backlog, fix within 3-5 days

---

**P3 (Low - Post-Pilot)**:

- UI polish (e.g., button alignment)
- Feature request (e.g., custom templates)
- Edge case

**Action**: Add to post-pilot backlog

---

## Communication Cadence

**Daily**:

- [ ] Standup (9:00 AM)
- [ ] Slack monitoring (all day)
- [ ] Office hours (2-3 PM)
- [ ] End-of-day update (5:00 PM)
- [ ] Quick survey (5:00 PM)

**Weekly**:

- [ ] Deep-dive survey (Friday)
- [ ] Week review meeting (Friday 4 PM)
- [ ] Week ahead plan (Friday 5 PM)

**As Needed**:

- [ ] Emergency huddles (if red flag triggered)
- [ ] 1:1 calls with operators (if concerns arise)

---

**Document Path**: `docs/pilot_week1_monitoring_plan.md`  
**Purpose**: Daily monitoring checklist for pilot success  
**Status**: Ready for Week 1 execution  
**North Star**: ✅ **Daily monitoring ensures operator success, catches issues fast**
