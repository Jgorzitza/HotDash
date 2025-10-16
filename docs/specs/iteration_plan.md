# Iteration Planning - Post-Launch

**Document Type:** Product Iteration Plan  
**Owner:** Product Agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Scope:** Dashboard and Approvals Workflow iterations based on user feedback

---

## Iteration Philosophy

**Principle:** Ship fast, learn fast, iterate based on evidence

**Cadence:** 2-week sprints (molecules)
**Feedback Loop:** Weekly CEO check-ins → prioritize → build → ship → measure
**Success Criteria:** Each iteration improves at least one NORTH_STAR metric

---

## Feedback Collection Methods

### 1. Weekly CEO Check-In (30 min)
**Schedule:** Every Friday 3 PM
**Agenda:**
- What worked well this week?
- What was frustrating or unclear?
- What features would save you time?
- Any bugs or issues encountered?

**Output:** Prioritized list of improvements for next sprint

---

### 2. Usage Analytics Review
**Frequency:** Weekly
**Metrics:**
- Which tiles are clicked most/least?
- Where do users spend time?
- Where do users drop off?
- Which approvals take longest to review?

**Output:** Data-driven hypotheses for improvements

---

### 3. Support Ticket Analysis
**Frequency:** Weekly
**Review:**
- Common questions or confusion
- Repeated issues
- Feature requests

**Output:** Documentation updates or feature improvements

---

### 4. Approval Grading Analysis
**Frequency:** Weekly
**Review:**
- Average grades (tone, accuracy, policy)
- Common edits made by CEO
- Patterns in rejections

**Output:** AI training improvements or workflow changes

---

## Iteration Prioritization Framework

### Priority 1: Fix Blockers (Immediate)
**Criteria:**
- CEO cannot complete critical workflow
- Data accuracy issues
- Performance degradation
- Security vulnerabilities

**Timeline:** Fix within 24 hours
**Examples:**
- Approve button not working
- Revenue showing incorrect data
- Dashboard not loading

---

### Priority 2: Improve Core Workflows (Next Sprint)
**Criteria:**
- CEO uses feature daily
- Improvement saves >5 min/day
- Reduces friction in critical path

**Timeline:** Next 2-week sprint
**Examples:**
- Faster approval review (keyboard shortcuts)
- Better evidence presentation
- Mobile UX improvements

---

### Priority 3: Add Requested Features (Backlog)
**Criteria:**
- CEO explicitly requested
- Aligns with NORTH_STAR
- Effort ≤2 days (molecule-sized)

**Timeline:** Prioritized in backlog
**Examples:**
- New dashboard tile
- Export approvals to CSV
- Custom date ranges

---

### Priority 4: Optimize Performance (Continuous)
**Criteria:**
- Improves load time or responsiveness
- Reduces error rate
- Enhances data accuracy

**Timeline:** Ongoing, as capacity allows
**Examples:**
- Reduce dashboard load time from 2.5s to 2s
- Cache frequently accessed data
- Optimize database queries

---

## Planned Iterations (Next 3 Months)

### Iteration 1: Post-Launch Fixes (Week 1-2)
**Goal:** Address any launch issues and quick wins

**Planned Work:**
- Fix any bugs discovered in first week
- Improve mobile UX based on CEO feedback
- Add keyboard shortcuts for approvals
- Optimize dashboard load time

**Success Metrics:**
- 0 critical bugs
- CEO satisfaction ≥4.0
- Dashboard load time <2.5s

---

### Iteration 2: Approvals Drawer (Week 3-4)
**Goal:** Implement full Approvals Drawer per spec

**Planned Work:**
- Evidence section (diffs, samples, queries)
- Grading interface (tone, accuracy, policy)
- Request changes workflow
- Deep-linking to specific approval

**Success Metrics:**
- CEO can review evidence before approving
- Grading captured for all CX approvals
- Approval latency ≤15 min maintained

---

### Iteration 3: Inventory ROP (Week 5-6)
**Goal:** Add inventory reorder point calculations

**Planned Work:**
- ROP formula implementation
- Safety stock calculation
- Status buckets (urgent, low, out)
- PO CSV generation

**Success Metrics:**
- 100% products have ROP calculated
- CEO can generate PO in <5 min
- Stockout alerts working

---

### Iteration 4: CX HITL Email (Week 7-8)
**Goal:** Enable AI-drafted email replies with approval

**Planned Work:**
- AI draft generation (OpenAI Agents SDK)
- Chatwoot Private Note integration
- Public reply on approval
- Grading and learning loop

**Success Metrics:**
- ≥90% AI draft rate
- ≤15 min median approval time
- Grades: tone ≥4.5, accuracy ≥4.7, policy ≥4.8

---

### Iteration 5: SEO Anomalies (Week 9-10)
**Goal:** Detect and alert on SEO issues

**Planned Work:**
- Google Analytics integration
- Traffic drop detection (>20%)
- Ranking change detection (>5 positions)
- Critical error detection (404s)

**Success Metrics:**
- 100% traffic anomalies detected
- SEO critical resolution <48h
- ≥60% recommendation acceptance

---

### Iteration 6: Live Chat + SMS (Week 11-12)
**Goal:** Extend HITL to Live Chat and SMS

**Planned Work:**
- Chatwoot Live Chat integration
- Twilio SMS integration
- AI drafts for Chat/SMS
- Unified approvals drawer

**Success Metrics:**
- Chat FRT <2 min
- SMS FRT <5 min
- ≥85% AI draft rate (Chat)

---

## Iteration Process

### Week 1: Plan
**Monday:**
- Review feedback from previous iteration
- Analyze usage data and support tickets
- CEO check-in (if scheduled)
- Prioritize work for this iteration

**Tuesday:**
- Create GitHub Issues for planned work
- Define acceptance criteria
- Estimate effort (molecule-sized ≤2 days)
- Assign to engineer

---

### Week 2: Build & Ship
**Wednesday-Thursday:**
- Engineer builds features
- Product reviews progress
- QA tests features

**Friday:**
- Ship to production
- Monitor metrics closely
- CEO check-in and feedback
- Plan next iteration

---

## Feedback-Driven Improvements

### Example: CEO Feedback → Iteration

**Feedback:** "Approvals take too long to review because I have to scroll through all the details"

**Analysis:**
- Current: All approval details shown by default
- Pain: Too much information, hard to scan
- Opportunity: Collapsible sections, summary view

**Iteration:**
- Add summary view (agent, action, risk level only)
- Click to expand full details
- Keyboard shortcut to expand/collapse

**Measure:**
- Approval latency before/after
- CEO satisfaction score
- Time spent per approval

**Result:**
- If latency decreases, keep feature
- If no change, revert or iterate further

---

### Example: Usage Data → Iteration

**Data:** Stock Risk tile has 80% click-through rate (highest)

**Analysis:**
- CEO checks inventory frequently
- Opportunity: Add more inventory features

**Iteration:**
- Add WOS (Weeks of Stock) to tile
- Add "Urgent Reorder" count
- Link to full inventory dashboard

**Measure:**
- Click-through rate change
- Time spent on inventory features
- Stockout reduction

**Result:**
- If engagement increases, add more inventory features
- If no change, focus on other tiles

---

### Example: Grading Data → Iteration

**Data:** Average tone grade = 4.2 (below 4.5 target)

**Analysis:**
- AI tone not meeting expectations
- Common edits: "Too formal" or "Not empathetic enough"

**Iteration:**
- Update AI prompt with tone guidelines
- Add examples of good tone
- Fine-tune on CEO edits

**Measure:**
- Tone grade before/after
- Edit distance (CEO changes)
- Rejection rate

**Result:**
- If grades improve, continue fine-tuning
- If no change, review prompt or training data

---

## Iteration Success Metrics

### Per-Iteration Metrics
- **Velocity:** Features shipped per 2-week sprint
- **Quality:** Bugs introduced per iteration
- **Impact:** NORTH_STAR metrics improved
- **Satisfaction:** CEO feedback score

### Cumulative Metrics (3 Months)
- **Feature Adoption:** % of features used weekly
- **Performance:** Dashboard load time trend
- **Accuracy:** Data accuracy trend
- **Engagement:** Sessions per day trend
- **Efficiency:** CEO time saved vs baseline

---

## Iteration Retrospective

### After Each Iteration (30 min)
**What went well?**
- Features that worked as expected
- Positive CEO feedback
- Metrics that improved

**What didn't go well?**
- Features that didn't work as expected
- Negative CEO feedback
- Metrics that degraded

**What to improve?**
- Process improvements
- Communication improvements
- Technical improvements

**Action items:**
- Specific changes for next iteration
- Assigned owners
- Due dates

---

## Long-Term Roadmap (6-12 Months)

### M2: HITL Customer Agent (Email) - Months 2-3
- AI-drafted email replies
- Approvals workflow
- Grading and learning loop

### M3: Inventory Actions - Months 3-4
- ROP calculations
- PO generation
- Picker payouts

### M4: Live Chat + SMS - Months 4-5
- Multi-channel CX
- Unified approvals
- SLA dashboards

### M5: Growth v1 (Read-Only) - Months 5-6
- SEO anomalies
- Content recommendations
- Ad performance insights

### M6: HITL Posting - Months 6-7
- Social media posting
- Approve-to-post workflow
- Impact tracking

### M7+: Future Enhancements - Months 8-12
- Advanced analytics
- Predictive inventory
- Automated workflows (with HITL)
- Multi-user support

---

## Document Control

**Version History:**
- 1.0 (2025-10-15): Initial iteration plan by Product Agent

**Review Schedule:**
- CEO: Approve iteration cadence and feedback methods
- Manager: Approve prioritization framework
- Engineer: Validate iteration timeline

**Related Documents:**
- `docs/specs/feature_prioritization.md` - Feature prioritization matrix
- `docs/specs/monitoring_plan.md` - Metrics to track
- `docs/NORTH_STAR.md` - Long-term vision

