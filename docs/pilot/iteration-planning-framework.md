# Iteration Planning Framework: Hot Rodan Pilot

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Product Agent  
**Purpose**: Rapid iteration process for weekly releases during Hot Rodan pilot

---

## Executive Summary

This framework enables **weekly iteration cycles** during the Hot Rodan pilot (Oct 15 - Nov 12, 2025) to quickly incorporate feedback and improve the dashboard based on real operator usage.

**Key Principles**:
- **Speed**: Weekly releases (not monthly)
- **Feedback-Driven**: Operators and Hot Rodan CEO drive priorities
- **Low-Risk**: Feature flags enable safe testing
- **Evidence-Based**: Data + quotes guide decisions

**Timeline**: 4-week pilot = 4 iteration cycles

---

## Rapid Iteration Cycle (7-Day Loop)

###  Weekly Cycle Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    MONDAY (Planning Day)                    │
├─────────────────────────────────────────────────────────────┤
│ 9:00 AM  - Review Week N-1 Metrics & Feedback             │
│ 10:00 AM - Prioritize Top 3 Improvements for Week N        │
│ 11:00 AM - Create Sprint Plan (Design + Eng + Product)     │
│ 12:00 PM - Kick off development                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              TUESDAY-THURSDAY (Build & Test)                │
├─────────────────────────────────────────────────────────────┤
│ Tuesday   - Engineer builds features                        │
│ Wednesday - QA tests + Designer reviews UX                 │
│ Thursday  - Product validates + Final testing             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  FRIDAY (Release Day)                       │
├─────────────────────────────────────────────────────────────┤
│ 9:00 AM  - Deploy to staging                               │
│ 10:00 AM - Smoke test with Hot Rodan (optional)            │
│ 11:00 AM - Deploy to production (feature flagged)          │
│ 12:00 PM - Enable for Hot Rodan                            │
│ 2:00 PM  - Monitor for issues                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              WEEKEND (Customer Uses New Features)           │
├─────────────────────────────────────────────────────────────┤
│ Hot Rodan team uses new features in real workflows         │
│ Monitor metrics for anomalies                               │
│ Respond to critical bugs within 2 hours                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
                   REPEAT MONDAY
```

---

## Feedback → Prioritization → Implementation Cycle

### Phase 1: Feedback Collection (Continuous)

**Daily Collection**:
- **Slack Messages**: Hot Rodan team shares thoughts in `#hot-rodan-pilot`
- **Support Tickets**: Operators report bugs or issues
- **Usage Analytics**: Track tile interactions, approval rates, time spent
- **Bug Reports**: Automated error tracking (Sentry)

**Weekly Structured Feedback** (Fridays 4:00 PM):
- 30-minute check-in call with Hot Rodan CEO + Ops Manager + Support Lead
- Structured questions:
  1. What worked well this week?
  2. What frustrated you this week?
  3. What would you change if you could?
  4. What's missing that you need?
  5. How would you rate this week vs last week? (1-10)

**Evidence Capture**:
- Record call notes in `docs/pilot/weekly-check-ins/week-N.md`
- Log verbatim quotes (for testimonials + priorities)
- Screenshot issues reported
- Document feature requests with customer context

---

### Phase 2: Prioritization (Monday Morning)

**Inputs to Prioritization**:
1. **Customer Feedback**: What Hot Rodan explicitly requested
2. **Usage Data**: Which tiles are used most/least
3. **Errors/Bugs**: What's breaking or confusing
4. **Strategic Value**: What moves us toward $1MM → $10MM goal

**Prioritization Framework: RICE Score**

| Factor | Weight | Definition |
|--------|--------|------------|
| **Reach** | How many operators affected? | All 3 operators = 10, CEO only = 5, 1 operator = 3 |
| **Impact** | How much does it improve experience? | Game-changer = 3, Big improvement = 2, Nice-to-have = 1 |
| **Confidence** | How sure are we this will work? | High = 100%, Medium = 80%, Low = 50% |
| **Effort** | How long to build (in days)? | 1 day = 1, 2 days = 2, 3+ days = 3 |

**RICE Score Formula**: `(Reach × Impact × Confidence) / Effort`

**Example**:
- **Feature**: "Add sales trend graph to Sales Overview tile"
- **Reach**: 10 (all 3 operators + CEO use it)
- **Impact**: 3 (game-changer for weekly business review)
- **Confidence**: 80% (medium - need to validate data accuracy)
- **Effort**: 2 days
- **RICE Score**: `(10 × 3 × 0.8) / 2 = 12`

**Prioritization Meeting Agenda** (Monday 10:00 AM, 60 minutes):
1. **Review feedback** (Product Agent presents): 15 min
   - Top 5 customer requests
   - Top 3 bugs
   - Key usage metrics
2. **Score features** (Team collaborates): 30 min
   - Discuss reach, impact, confidence, effort
   - Calculate RICE scores
3. **Select Top 3 for this week**: 10 min
   - Highest RICE scores = prioritized
   - Balance quick wins (low effort) + strategic (high impact)
4. **Assign owners** (Eng, Design, Product): 5 min

**Output**: Sprint plan document (`docs/sprints/sprint-week-N.md`)

---

### Phase 3: Implementation (Tuesday-Thursday)

**Development Process**:
- **Tuesday**: Engineer builds features, Designer creates assets
- **Wednesday**: QA tests, Product validates against customer request
- **Thursday**: Final polish, staging deployment, smoke tests

**Feature Flag Strategy** (see below for details):
- All new features deployed behind feature flags
- Enables safe testing + rollback
- Product Agent controls who sees what

**Daily Standup** (Tuesday-Thursday, 9:00 AM, 15 min):
- What shipped yesterday?
- What's shipping today?
- Any blockers?

---

### Phase 4: Release (Friday)

**Release Checklist**:
- [ ] Code reviewed and merged
- [ ] QA smoke tests passing
- [ ] Staging deployment successful
- [ ] Product Agent validates feature matches customer request
- [ ] Release notes drafted
- [ ] Feature flag configured

**Deployment Timeline**:
- **9:00 AM**: Deploy to staging
- **10:00 AM**: (Optional) Preview with Hot Rodan CEO via Zoom screenshare
- **11:00 AM**: Deploy to production with feature flag OFF
- **12:00 PM**: Enable feature flag for Hot Rodan only
- **2:00 PM**: Monitor for errors, check usage in first 2 hours

**Communication to Hot Rodan** (Slack message template):
```
🚀 New Feature Released: [Feature Name]

What's New:
- [Bullet 1: What changed]
- [Bullet 2: Why this matters]
- [Bullet 3: How to use it]

This was based on your feedback: "[Quote from customer]"

Questions or issues? Reply here or call [phone number]
```

---

## Feature Flag Strategy

### Why Feature Flags?

**Benefits**:
1. **Safe Deployment**: Deploy code to production without exposing to users
2. **Progressive Rollout**: Enable for Hot Rodan first, then others
3. **Quick Rollback**: Turn off flag if issues detected (no code deployment needed)
4. **A/B Testing**: Test variants with different users

### Feature Flag Implementation

**Tool**: LaunchDarkly (or similar)

**Flag Naming Convention**: `pilot_[feature_name]_[date]`
- Example: `pilot_sales_trend_graph_20251015`

**Flag States**:
- `OFF`: Feature not visible to anyone
- `PILOT_ONLY`: Enabled for Hot Rodan only
- `ALL_CUSTOMERS`: Enabled for everyone

**Control Process**:
1. **Engineer** creates flag in code
2. **Product Agent** controls flag state via LaunchDarkly dashboard
3. **QA** verifies flag works as expected in staging
4. **Product Agent** enables flag for Hot Rodan on release day

**Rollback Protocol**:
- If critical bug detected: Turn flag OFF immediately (< 5 min)
- If minor issue: Log for next sprint, keep flag ON
- If customer confused: Schedule 10-min call to explain feature

---

## Pilot Iteration Schedule (4 Weeks)

### Week 1 (Oct 15-21, 2025): Foundation

**Focus**: Stabilize core dashboard, fix critical bugs

**Top 3 Priorities**:
1. Fix any launch day issues
2. Ensure all tiles load data correctly
3. Improve Sales Overview tile based on first-use feedback

**Success Criteria**:
- Zero critical bugs by Friday
- Hot Rodan CEO can complete morning routine without errors
- Approval queue processes 10+ tickets successfully

---

### Week 2 (Oct 22-28, 2025): Quick Wins

**Focus**: Add small features that delight operators

**Top 3 Priorities** (TBD based on Week 1 feedback):
- Example: Add "Export to CSV" to Sales Overview
- Example: Improve approval queue sorting
- Example: Add keyboard shortcuts for approvals

**Success Criteria**:
- At least 1 "wow moment" feature shipped
- Hot Rodan CEO mentions feature to another business owner
- Operator satisfaction ≥ 7.5/10

---

### Week 3 (Oct 29-Nov 4, 2025): Strategic Features

**Focus**: Add features that drive $1MM → $10MM goal

**Top 3 Priorities** (TBD based on Week 1-2 feedback):
- Example: Weekly Business Review tile (strategic insights)
- Example: Custom part tracker (hot rod-specific)
- Example: Predictive inventory alerts

**Success Criteria**:
- Hot Rodan CEO uses new feature in weekly planning
- Measurable time savings (e.g., 2 hours saved this week)
- Revenue insights lead to business decision

---

### Week 4 (Nov 5-12, 2025): Polish & Prepare for Scale

**Focus**: Final improvements, prepare for expansion

**Top 3 Priorities**:
1. Fix remaining UX issues
2. Document learnings for future customers
3. Prepare case study draft

**Success Criteria**:
- Hot Rodan CEO rating ≥ 8/10
- Documented ROI (hours saved, revenue impact)
- CEO willing to provide testimonial

---

## Learnings Capture Process

### During Pilot (Continuous)

**What to Capture**:
1. **Feature requests**: What customers ask for (verbatim)
2. **Usage patterns**: How they actually use the dashboard (vs how we thought)
3. **Friction points**: Where they get stuck or confused
4. **Aha moments**: When they say "this is amazing" (quote + context)
5. **Business outcomes**: Revenue decisions made using dashboard

**Where to Log**:
- `feedback/product.md` - All product learnings
- `docs/pilot/weekly-check-ins/week-N.md` - Weekly call notes
- `docs/pilot/learnings.md` - Synthesized insights

**Format**:
```markdown
### Learning [N]: [Title]

**Date**: 2025-10-XX
**Source**: Hot Rodan CEO / Ops Manager / Usage Data
**Quote**: "[Verbatim customer quote]"

**What We Learned**:
[Key insight]

**Action Taken**:
[What we changed as a result]

**Outcome**:
[Impact of the change]
```

---

### Post-Pilot (Nov 12, 2025)

**Pilot Debrief Session** (2 hours):
1. **Review metrics**: Approval rate, time saved, satisfaction
2. **Synthesize feedback**: Top 5 wins, top 5 improvements
3. **Identify patterns**: What worked across all 4 weeks?
4. **Create playbook**: "How to Launch Next Customer" guide
5. **Plan scale-up**: What needs to change to onboard 10 more customers?

**Deliverables**:
- `docs/pilot/hot-rodan-final-report.md` - Comprehensive pilot results
- `docs/pilot/scale-up-playbook.md` - Process for next customers
- `docs/pilot/case-study-draft.md` - Hot Rodan success story

---

## Metrics to Track (Weekly)

### Customer Satisfaction
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Weekly CEO Rating** | ≥ 7/10 | Friday check-in call |
| **Operator Satisfaction** | ≥ 7.5/10 | Weekly survey (3 operators) |
| **Net Promoter Score (NPS)** | ≥ 8 (promoter) | "Would you recommend HotDash?" |

### Product Usage
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Daily Active Users** | 3/3 operators | Analytics |
| **Tiles Used per Session** | ≥ 4 | Analytics |
| **Time Saved per Week** | ≥ 5 hours | Self-reported + time tracking |
| **Approval Queue Throughput** | ≥ 10 approvals/day | Approval queue logs |

### Business Impact
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Business Decisions Made Using Dashboard** | ≥ 1/week | Self-reported in check-in call |
| **Revenue Impact** | Track (no target yet) | Sales data + CEO attribution |
| **Operator Efficiency Gain** | ≥ 20% | Time tracking |

### Technical Quality
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Uptime** | ≥ 99% | Fly.io monitoring |
| **Error Rate** | < 1% | Sentry |
| **Page Load Time** | < 2 seconds | Analytics |
| **Critical Bugs** | 0 | Bug tracker |

**Review Cadence**:
- **Daily**: Check error rate and uptime
- **Weekly**: Review all metrics in Monday planning session
- **Post-Pilot**: Comprehensive analysis for final report

---

## Decision-Making Framework

### When to Prioritize a Feature

**Yes, Prioritize If**:
- ✅ Hot Rodan CEO explicitly requested it
- ✅ Solves a daily pain point (not occasional)
- ✅ Aligns with $1MM → $10MM growth goal
- ✅ Can ship in 1-3 days
- ✅ High RICE score (≥ 10)

**No, Defer If**:
- ❌ Nice-to-have but not critical
- ❌ Only 1 operator would use it (vs CEO or all operators)
- ❌ Would take >5 days to build
- ❌ Not aligned with core value prop (operator control center)
- ❌ Low RICE score (< 5)

**Escalate to Manager If**:
- ⚠️ Requires significant architectural change
- ⚠️ Impacts other customers
- ⚠️ Pricing or contract implications
- ⚠️ Security or compliance concerns

---

### When to Roll Back a Feature

**Immediate Rollback (< 5 min)**:
- 🚨 Critical bug (data loss, system crash)
- 🚨 Security vulnerability
- 🚨 Hot Rodan CEO says "turn it off now"

**Disable by End of Day**:
- ⚠️ High error rate (> 10% of users affected)
- ⚠️ Customer very confused (can't figure out how to use it)
- ⚠️ Performance degradation (page load > 5 seconds)

**Monitor and Iterate**:
- ✅ Minor UI issue (cosmetic)
- ✅ Customer has feedback but still uses it
- ✅ Feature works but needs polish

**Rollback Process**:
1. Product Agent turns feature flag OFF via LaunchDarkly
2. Slack message to Hot Rodan: "We're investigating an issue with [feature], temporarily disabled"
3. Engineer investigates + fixes
4. Re-enable flag once fix deployed

---

## Communication Templates

### Weekly Release Announcement (Slack)

```
🚀 **Weekly Release: Week [N]**

**What's New This Week**:
1. [Feature 1] - [One sentence description]
2. [Feature 2] - [One sentence description]
3. [Feature 3] - [One sentence description]

**Based on Your Feedback**:
- "[[Quote from customer]]" → We built [Feature X]

**Try It Out**:
[Link to dashboard] or [Quick instructions]

**Questions?** Reply here or call [phone number] anytime.

Thanks for being our pilot customer! 🙏
```

---

### Bug Report Template (Internal)

```
**Bug ID**: BUG-[date]-[number]
**Severity**: Critical / High / Medium / Low
**Reported By**: Hot Rodan [CEO/Ops/Support]
**Date**: 2025-10-XX
**Affected Feature**: [Feature name]

**Description**:
[What went wrong]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Impact**:
[How this affects Hot Rodan]

**Priority**: Immediate / This Week / Next Week

**Assigned To**: [Engineer name]
**Status**: Open / In Progress / Fixed / Verified
```

---

### Feature Request Template (Internal)

```
**Feature Request ID**: FR-[date]-[number]
**Requested By**: Hot Rodan [CEO/Ops/Support]
**Date**: 2025-10-XX
**Quote**: "[[Verbatim customer request]]"

**What They Want**:
[Feature description]

**Why They Want It**:
[Business problem it solves]

**RICE Score**:
- Reach: [score]
- Impact: [score]
- Confidence: [%]
- Effort: [days]
- **Total**: [RICE score]

**Priority**: High / Medium / Low
**Status**: Backlog / This Week / Next Week / Deferred
**Assigned To**: [Team member]
```

---

## Iteration Retrospective (End of Each Week)

**Friday 3:00 PM (30 minutes)**

**Attendees**: Product Agent, Engineer, Designer, QA

**Agenda**:
1. **What went well this week?** (5 min)
   - Celebrate wins
   - Note what to continue doing

2. **What could be improved?** (10 min)
   - Process issues
   - Communication gaps
   - Technical challenges

3. **What will we change next week?** (10 min)
   - Concrete actions (not vague "communicate better")
   - Assign owners
   - Set deadlines

4. **Shoutouts** (5 min)
   - Recognize team members who went above and beyond

**Output**: Retrospective notes in `docs/sprints/retro-week-N.md`

---

## Success Criteria for Iteration Framework

**Framework is Working If**:
- ✅ We ship improvements every Friday (4/4 weeks)
- ✅ Hot Rodan sees week-over-week improvement (rating increases)
- ✅ Features shipped match customer requests (not our assumptions)
- ✅ Team feels energized, not burned out
- ✅ Zero weeks where "nothing shipped"

**Framework Needs Adjustment If**:
- ❌ Missing deadlines (can't ship by Friday)
- ❌ Shipping features customers don't use
- ❌ Team working weekends to hit deadlines
- ❌ Customer frustrated with pace of improvement
- ❌ Bugs increasing week-over-week

**Adjustment Process**:
- Discuss in weekly retrospective
- Make small changes (don't overhaul entire process)
- Test for 1 week, then evaluate
- Document what worked/didn't work

---

## Appendix: Example Sprint Plan (Week 2)

### Sprint Plan: Week 2 (Oct 22-28, 2025)

**Priority 1: Add "Export to CSV" to Sales Overview**
- **Requester**: Hot Rodan CEO
- **Quote**: "I need to share sales data with my accountant weekly"
- **RICE Score**: 15 (Reach: 10, Impact: 2, Confidence: 100%, Effort: 1.5)
- **Owner**: Engineer
- **Timeline**: Tuesday-Wednesday
- **Feature Flag**: `pilot_sales_export_csv_20251022`

**Priority 2: Improve Approval Queue Sorting**
- **Requester**: Support Lead
- **Quote**: "I want to see urgent tickets first, not oldest first"
- **RICE Score**: 12 (Reach: 10, Impact: 2, Confidence: 80%, Effort: 1.5)
- **Owner**: Engineer + Designer
- **Timeline**: Wednesday-Thursday
- **Feature Flag**: `pilot_approval_queue_sort_20251022`

**Priority 3: Add Keyboard Shortcuts for Approvals**
- **Requester**: Ops Manager
- **Quote**: "I'm clicking approve 50 times a day, keyboard shortcut would save time"
- **RICE Score**: 10 (Reach: 8, Impact: 1, Confidence: 100%, Effort: 1)
- **Owner**: Engineer
- **Timeline**: Thursday
- **Feature Flag**: `pilot_approval_keyboard_shortcuts_20251022`

**Release**: Friday Oct 25, 12:00 PM

---

**Document Owner**: Product Agent  
**Last Updated**: October 12, 2025  
**Next Review**: End of Week 1 (Oct 21, 2025)  
**Status**: Active - Ready for Pilot Execution

---

## Quick Reference Checklist

**Monday Morning (Planning)**:
- [ ] Review last week's metrics
- [ ] Review customer feedback
- [ ] Calculate RICE scores
- [ ] Select Top 3 priorities
- [ ] Create sprint plan
- [ ] Assign owners

**Friday Afternoon (Release)**:
- [ ] Deploy to staging
- [ ] Smoke test
- [ ] Deploy to production
- [ ] Enable feature flags for Hot Rodan
- [ ] Send release announcement
- [ ] Monitor for 2 hours
- [ ] Log any issues

**Continuous**:
- [ ] Collect feedback daily
- [ ] Log learnings in feedback/product.md
- [ ] Monitor metrics
- [ ] Respond to bugs within 2 hours
- [ ] Update sprint plan if priorities shift

---

**End of Iteration Planning Framework**

