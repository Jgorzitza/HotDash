# Agent SDK Pilot Rollout Plan

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Status**: Active - Ready for Execution

---

## Executive Summary

This document defines the pilot scope, participant selection criteria, success metrics, communication plan, and phased rollout approach for the HotDash Agent SDK approval queue system.

**Pilot Timeline**: 2 weeks (October 28 - November 8, 2025)
**Pilot Size**: 5 operators (50% of team), 20% of customer inquiries
**Success Criteria**: >45% approval rate, no CSAT degradation, >7.0/10 operator satisfaction

---

## Pilot Scope

### What's Included in Pilot

**Technical Components**:

- ✅ LlamaIndex knowledge base integration (Port 8005)
- ✅ OpenAI GPT-4 draft generation (Port 8006)
- ✅ Approval queue UI (React interface)
- ✅ Four operator actions: Approve, Edit, Escalate, Reject
- ✅ Confidence scoring and source citations
- ✅ Basic learning loop (track operator actions)

**Inquiry Types Included**:

- Order status inquiries ("Where is my order?")
- Shipping/tracking questions
- Product information requests
- Account/login assistance
- General FAQs

**Inquiry Types EXCLUDED from Pilot**:

- Refund requests (>$100 require manager approval)
- Complex escalations
- Angry/threatening customer messages
- Legal or compliance inquiries
- First-time customers (keep manual for white-glove experience)

### Traffic Routing

**Week 1 (Oct 28 - Nov 1)**:

- 10% of eligible inquiries → Approval queue
- 90% of inquiries → Manual workflow
- All pilot operators work both queues

**Week 2 (Nov 4 - Nov 8)**:

- 30% of eligible inquiries → Approval queue
- 70% of inquiries → Manual workflow
- Increase based on Week 1 success

**Routing Logic**:

```
IF inquiry_type IN ["order_status", "shipping", "product", "account", "faq"]
AND customer_sentiment NOT IN ["angry", "threatening"]
AND operator IN pilot_group
THEN route_to_approval_queue()
ELSE route_to_manual_workflow()
```

---

## Pilot Participant Selection

### Operator Selection Criteria

**Target**: 5 operators (50% of 10-person team)

**Selection Criteria**:

1. **Experience Mix**:
   - 2 experienced operators (12+ months) - provide credibility
   - 2 intermediate operators (3-12 months) - represent core team
   - 1 newer operator (0-3 months) - test onboarding acceleration

2. **Performance**:
   - Current FCR rate >60%
   - Customer CSAT >4.0/5
   - Positive attitude toward new tools

3. **Availability**:
   - Full-time during pilot period
   - No planned vacation or PTO
   - Available for daily 15-minute check-ins

4. **Tech Comfort**:
   - Comfortable with new tools
   - Willing to provide honest feedback
   - Not resistant to AI/automation

**Selected Pilot Operators**:

1. **Sarah** (8 months) - Strong performer, vocal about pain points
2. **Marcus** (2 years) - Experienced, respected by team
3. **Emily** (1 year) - Solid performer, detail-oriented
4. **David** (4 months) - Newer, eager to learn
5. **Lisa** (18 months) - Senior, can mentor others

### Customer Selection (Implicit)

**Target**: First 20% of eligible inquiries per day

**Customer Criteria** (automated routing):

- Not first-time customers (exclude for manual white-glove)
- No open escalations or disputes
- Inquiry type is in pilot scope
- Customer sentiment is neutral or positive

---

## Communication Plan

### Internal Communication

#### Week Before Pilot (Oct 21-25)

**Monday, Oct 21**:

- **All-hands announcement**: Manager introduces Agent SDK pilot
- **Pilot invitations sent**: Personal emails to 5 selected operators
- **FAQ document shared**: "What is the Agent SDK?" guide

**Wednesday, Oct 23**:

- **Training session 1** (90 minutes): Agent SDK overview, demo, Q&A
- **Hands-on practice**: Sandbox environment with mock tickets
- **Success stories shared**: Benefits from beta testing

**Friday, Oct 25**:

- **Training session 2** (60 minutes): Advanced features, edge cases
- **Office hours**: Open Q&A with Product and Engineering
- **Pilot kickoff prep**: Review go-live checklist

#### During Pilot (Oct 28 - Nov 8)

**Daily (9:00 AM)**:

- **15-minute standup**: What went well? What was confusing? Blockers?
- **Quick wins shared**: Examples of successful drafts
- **Issue resolution**: Address bugs or UX friction immediately

**Mid-Week (Wednesday)**:

- **Week 1 Checkpoint** (Nov 1): Review metrics, adjust routing % if needed
- **Week 2 Checkpoint** (Nov 8): Final metrics review, rollout decision

**Slack Channel**: `#agent-sdk-pilot`

- Real-time questions and answers
- Celebrate wins (screenshots of great drafts)
- Surface issues quickly

#### Post-Pilot (Nov 11-15)

**Monday, Nov 11**:

- **Pilot debrief** (60 minutes): Share metrics, gather feedback
- **Operator testimonials recorded**: Video or written quotes
- **Go/No-Go decision**: Based on success criteria

**Wednesday, Nov 13**:

- **Lessons learned doc published**: What worked, what didn't
- **Full team training scheduled**: If go-ahead approved

### External Communication (None During Pilot)

**Customer-Facing**: No external announcements during pilot. Customers will not know if their response was AI-drafted vs manual.

**Post-Pilot**: If successful, consider:

- Blog post: "How we use AI to improve customer support"
- Case study: "50% faster support with human oversight"

---

## Success Criteria

### Go/No-Go Thresholds (Week 2 Checkpoint)

#### Technical Performance

| Metric                  | Threshold                 | Go/No-Go    |
| ----------------------- | ------------------------- | ----------- |
| System uptime           | >98%                      | MUST PASS   |
| API response time (p95) | <3 seconds                | MUST PASS   |
| Error rate              | <2%                       | MUST PASS   |
| Knowledge base coverage | >75% queries with results | SHOULD PASS |

#### Agent Performance

| Metric                    | Week 1 Target | Week 2 Target | Go/No-Go         |
| ------------------------- | ------------- | ------------- | ---------------- |
| Approval rate (no edits)  | >35%          | >45%          | MUST PASS Week 2 |
| Edit rate (minor changes) | <50%          | <40%          | SHOULD PASS      |
| Escalation rate           | <15%          | <10%          | SHOULD PASS      |
| Rejection rate            | <10%          | <5%           | MUST PASS Week 2 |

#### Operator Experience

| Metric                   | Week 1 Target  | Week 2 Target  | Go/No-Go         |
| ------------------------ | -------------- | -------------- | ---------------- |
| Operator satisfaction    | >6.5/10        | >7.5/10        | MUST PASS Week 2 |
| Time to review draft     | <3 minutes avg | <2 minutes avg | SHOULD PASS      |
| Drafts reviewed per hour | >12            | >15            | SHOULD PASS      |
| Would recommend to team  | >60%           | >80%           | MUST PASS Week 2 |

#### Customer Experience

| Metric                   | Week 1 Target         | Week 2 Target          | Go/No-Go    |
| ------------------------ | --------------------- | ---------------------- | ----------- |
| CSAT (pilot inquiries)   | No degradation (≥4.2) | Maintained or improved | MUST PASS   |
| Time to resolution       | ≤15 minutes           | ≤12 minutes            | SHOULD PASS |
| First contact resolution | ≥64% (baseline)       | ≥70%                   | SHOULD PASS |

### Go/No-Go Decision Matrix

**GO** if:

- All "MUST PASS" criteria met
- At least 3 of 5 "SHOULD PASS" criteria met
- No P0/P1 incidents during pilot
- Operators enthusiastic about rollout

**NO-GO** if:

- Any "MUST PASS" criteria failed
- Customer CSAT degraded by >0.2 points
- Operators request to stop the pilot
- System instability or data quality issues

**CONDITIONAL GO** (iterate and re-pilot):

- "MUST PASS" criteria met but "SHOULD PASS" weak
- Operator satisfaction 6.0-7.0 (lukewarm)
- Approval rate 40-45% (borderline)

---

## Phased Rollout Plan

### Phase 0: Pre-Pilot (Oct 14-25)

**Week 1 (Oct 14-18)**: Development

- Engineering completes MVP
- Internal testing in staging
- QA smoke tests
- Bug fixes

**Week 2 (Oct 21-25)**: Training & Prep

- Operator training sessions
- Documentation finalized
- Support runbook created
- Monitoring dashboards configured

### Phase 1: Pilot (Oct 28 - Nov 8)

**Week 1 (Oct 28 - Nov 1)**: Conservative Start

- 5 operators, 10% traffic
- Daily check-ins
- Rapid iteration on UX issues
- Monitor metrics closely

**Week 2 (Nov 4 - Nov 8)**: Ramp Up

- Same 5 operators, 30% traffic
- Continue daily check-ins
- Finalize metrics for go/no-go
- Document learnings

### Phase 2: Gradual Rollout (Nov 11 - Nov 22)

**Week 1 (Nov 11-15)**: Expand to 50% of Team

- Train remaining 5 operators
- 50% of inquiries to approval queue
- Weekly check-ins (less frequent than pilot)
- Monitor for regression

**Week 2 (Nov 18-22)**: Full Team Rollout

- All 10 operators enabled
- 80% of inquiries to approval queue
- Transition to normal monitoring cadence
- Celebrate wins with team

### Phase 3: Optimization (Nov 25 - Dec 31)

**Continuous Improvement**:

- Weekly metric reviews
- Monthly operator feedback sessions
- Quarterly model fine-tuning
- Knowledge base expansion

**Feature Additions** (based on Phase 2 roadmap):

- Advanced sentiment analysis
- Proactive outreach capabilities
- Multi-issue handling
- Enhanced personalization

---

## Learnings Capture Process

### Daily Learnings

**Format**: Quick Slack messages in `#agent-sdk-pilot`

**Capture**:

- Bugs or UX friction: Tag @engineering immediately
- Great draft examples: Screenshot and share
- Operator tips/tricks: Document in runbook
- Customer feedback: Note any mentions of response quality

### Weekly Learnings

**Format**: Structured feedback form (15 minutes to complete)

**Questions**:

1. What drafts did the AI get right? (provide examples)
2. What drafts required heavy editing? (provide examples)
3. What knowledge base gaps did you notice?
4. What UI improvements would help you most?
5. On a scale of 1-10, how useful was the Agent SDK this week?
6. Would you recommend this tool to other operators?

### Post-Pilot Learnings

**Format**: 60-minute debrief session + written report

**Discussion Topics**:

- Overall pilot experience (highs and lows)
- Confidence in drafts over time (did it improve?)
- Impact on job satisfaction
- Recommendations for full rollout
- Must-have features before rollout
- Nice-to-have features for later

**Deliverable**: "Pilot Learnings Report" published to team

---

## Risk Management

### Identified Risks

#### Risk 1: System Instability

**Probability**: Low  
**Impact**: Critical  
**Mitigation**:

- Comprehensive pre-pilot testing
- Kill switch to revert to manual mode
- On-call engineering support during pilot
- Rollback plan (1-hour maximum)

#### Risk 2: Low Approval Rate

**Probability**: Medium  
**Impact**: High  
**Mitigation**:

- Start with 10% traffic to learn quickly
- Daily prompt tuning based on rejections
- Knowledge base rapid expansion
- Accept 35-45% as success in Week 1

#### Risk 3: Operator Resistance

**Probability**: Low  
**Impact**: Medium  
**Mitigation**:

- Careful operator selection (positive attitudes)
- Clear "this augments you, doesn't replace you" messaging
- Daily feedback loops to address concerns
- Operators can opt out if uncomfortable

#### Risk 4: Customer Experience Degradation

**Probability**: Low  
**Impact**: Critical  
**Mitigation**:

- Human approval required for every response
- Exclude high-risk inquiries from pilot
- Monitor CSAT daily, not weekly
- Immediate rollback if CSAT drops >0.2

#### Risk 5: Knowledge Base Gaps

**Probability**: High  
**Impact**: Medium  
**Mitigation**:

- Dedicate Support Agent to daily KB updates
- Log every "no relevant result" query
- Priority queue for KB article creation
- Accept some gaps in Week 1

---

## Resource Requirements

### Team Time Commitment

**Product Agent** (Me):

- 15 min daily check-ins: 2.5 hours over pilot
- Weekly metrics review: 2 hours × 2 weeks = 4 hours
- Pilot debrief and report: 4 hours
- **Total**: ~10 hours

**Engineering Agent**:

- On-call support: 1 hour/day × 10 days = 10 hours
- Bug fixes and UX improvements: 20 hours
- **Total**: ~30 hours

**Support Agent**:

- Knowledge base updates: 2 hours/day × 10 days = 20 hours
- Operator training support: 4 hours
- **Total**: ~24 hours

**Manager Agent**:

- Training session attendance: 2 hours
- Weekly reviews: 1 hour × 2 = 2 hours
- Go/no-go decision meeting: 1 hour
- **Total**: ~5 hours

**Pilot Operators**:

- Training: 2.5 hours each
- Daily check-ins: 15 min × 10 = 2.5 hours each
- Weekly feedback forms: 30 min × 2 = 1 hour each
- **Total per operator**: ~6 hours
- **Total all pilots**: ~30 hours

### Infrastructure

**Costs**:

- OpenAI API: ~$200-300 during pilot (10-30% of full traffic)
- AWS infrastructure: ~$100 (already allocated)
- Monitoring tools: $0 (using existing Grafana/Mixpanel)
- **Total**: ~$300-400

### Tools & Access

- ✅ Chatwoot (already in use)
- ✅ LlamaIndex service (to be deployed)
- ✅ Approval queue UI (to be deployed)
- ✅ Grafana dashboards (to be configured)
- ✅ Slack channel `#agent-sdk-pilot` (to be created)
- ✅ Feedback forms (to be created)

---

## Success Announcement Plan

### If Pilot Succeeds

**Internal Announcement** (Nov 11):

- Email to all operators: "Pilot Success! Next Steps"
- Slack announcement with metrics highlights
- Operator testimonials shared
- Full team training scheduled for Nov 13-15

**Stakeholder Update** (Nov 12):

- Email to executive team with metrics
- ROI projection based on pilot data
- Rollout timeline for remaining operators
- Request for full rollout approval

**Team Celebration** (Nov 15):

- Virtual team lunch or happy hour
- Recognize pilot operators publicly
- Share success stories
- Preview Phase 2 features

### If Pilot Needs Iteration

**Internal Communication** (Nov 11):

- Transparent email: "What we learned, what's next"
- Metrics shared (even if below target)
- Specific improvements identified
- Re-pilot timeline (2-4 weeks later)

**Stakeholder Update** (Nov 12):

- Honest assessment of results
- Root cause analysis
- Improvement plan
- Revised timeline and expectations

---

## Appendix: Pilot Checklist

### Week Before Pilot

- [ ] Pilot operators selected and invited
- [ ] Training sessions scheduled (Oct 23, 25)
- [ ] FAQ document published
- [ ] Slack channel `#agent-sdk-pilot` created
- [ ] Feedback forms created
- [ ] Monitoring dashboards configured

### Day Before Pilot (Oct 27)

- [ ] Engineering confirms MVP is deployed to production
- [ ] QA smoke tests passed
- [ ] Knowledge base fully indexed
- [ ] Routing logic configured (10% traffic)
- [ ] Kill switch tested and documented
- [ ] On-call rotation scheduled
- [ ] Pilot kickoff email sent to operators

### During Pilot (Daily)

- [ ] Morning standup completed (9:00 AM)
- [ ] Metrics reviewed (approval rate, errors, CSAT)
- [ ] Bugs triaged and prioritized
- [ ] Knowledge base gaps addressed
- [ ] Learnings logged in Slack

### Week 1 Checkpoint (Nov 1)

- [ ] Metrics reviewed against targets
- [ ] Operator feedback collected
- [ ] Decision: Proceed to Week 2 at 30% traffic or adjust?
- [ ] Adjustments communicated to team

### Week 2 Checkpoint (Nov 8)

- [ ] Final metrics compiled
- [ ] Operator satisfaction survey completed
- [ ] Go/no-go decision made
- [ ] Pilot learnings report drafted

### Post-Pilot (Nov 11-15)

- [ ] Pilot debrief session held
- [ ] Learnings report published
- [ ] If GO: Full team training scheduled
- [ ] If NO-GO: Improvement plan documented

---

**Document Owner**: Product Agent
**Last Updated**: October 11, 2025
**Status**: Ready for Manager Review
**Next Action**: Present to Manager for approval, then schedule pilot kickoff

**Related Documents**:

- [Success Metrics Framework](docs/success_metrics_framework.md)
- [Product Roadmap](docs/product_roadmap.md)
- [Operator Workflow Analysis](docs/operator_workflow_analysis.md)
- [Manager Decision Log](feedback/manager-2025-10-11-agentsdk-decision.md)
