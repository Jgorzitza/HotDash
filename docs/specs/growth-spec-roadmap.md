# Growth Automation Roadmap - Prioritized Specification

**Version**: 1.0  
**Date**: 2025-10-14  
**Owner**: Product Agent  
**Purpose**: Prioritize 44 growth spec items into executable P0/P1/P2 roadmap  
**Status**: DRAFT - Pending CEO & Engineer approval

---

## Executive Summary

### Total Scope

**44 Growth Spec Items** broken into:
- **P0 (Week 1)**: 14 items - Foundation & blockers
- **P1 (Week 2)**: 15 items - Value delivery
- **P2 (Week 3)**: 15 items - Scale & optimization

**Timeline**: 3 weeks to full growth automation deployment  
**Dependencies**: P0 must complete before P1, P1 before P2

---

## Priority 0: Week 1 - Foundation (14 Items)

**Goal**: Build infrastructure that everything else depends on

### Block A: Action System Foundation (7 items) - 11-15 hours

**A1: Action Database Schema** ✅ (2 hours)
- Spec: `docs/specs/action-schema-specification.md`
- Deliverable: Supabase migration for `actions` table
- Blocker: Nothing else works without this

**A2: Action API Endpoints** (4-5 hours)
- GET/POST endpoints for action CRUD
- Approval/rejection endpoints
- Execution trigger endpoint
- Deliverable: 7 API routes with tests

**A3: Action Queue UI Component** (3-4 hours)
- React component showing pending actions
- Diff preview rendering
- Approve/reject buttons
- Deliverable: `app/components/ActionQueue.tsx`

**A4: Execution Engine** (3-4 hours)
- Background job to execute approved actions
- Shopify API integration
- Error handling & retry logic
- Deliverable: `app/services/action-executor.server.ts`

**A5: Rollback System** (2-3 hours)
- Store original values before execution
- Rollback API endpoint
- Rollback UI (operator can manually rollback)
- Deliverable: Rollback mechanism functional

**A6: Action Status Tracking** (1 hour)
- Status update logic
- Lifecycle validation (can't skip states)
- Deliverable: State machine implementation

**A7: Basic Logging & Monitoring** (1 hour)
- Log all action lifecycle events
- Alert on execution failures
- Deliverable: Action logs in Supabase

---

### Block B: Data Pipeline Foundation (7 items) - 8-10 hours

**B1: Google Search Console Integration** (2-3 hours)
- GSC API client
- Daily data sync (impressions, clicks, CTR, position)
- Store in `gsc_page_performance` table
- Deliverable: GSC data available for recommenders

**B2: Shopify Product Data Sync** (2 hours)
- Sync product metadata (titles, descriptions, tags)
- Track changes (detect manual edits vs automated)
- Deliverable: `shopify_products_metadata` table

**B3: Analytics Integration** (2 hours)
- Page performance metrics (views, conversion, revenue)
- Store in `page_analytics` table
- Deliverable: Analytics data for impact estimation

**B4: Purchase Pattern Analysis** (1-2 hours)
- Calculate product affinity (what's bought together)
- Store in `product_affinity` table
- Deliverable: Data for guided selling recommender

**B5: Performance Monitoring Setup** (1 hour)
- Lighthouse CI integration
- Daily CWV measurements
- Store in `page_performance` table
- Deliverable: CWV data for performance recommender

**B6: Data Quality Validation** (30 min)
- Automated checks for data freshness
- Alert if data >48 hours old
- Deliverable: Data quality monitoring

**B7: Historical Baseline Collection** (30 min)
- Collect 90 days of historical data
- Calculate baselines for impact measurement
- Deliverable: Baseline metrics stored

---

### Total Week 1 Estimate: **19-25 hours** (Engineer + Data work)

**Success Criteria**:
- ✅ Action system functional (can create, approve, execute, measure actions)
- ✅ All data pipelines operational (GSC, Shopify, Analytics, Performance)
- ✅ Manual action creation works (operator can test system)
- ✅ At least 1 action type fully working end-to-end

---

## Priority 1: Week 2 - Value Delivery (15 Items)

**Goal**: Ship recommenders that generate business value

### Block C: Recommender Implementation (5 items) - 12-15 hours

**C1: SEO CTR Optimizer** ✅ (3-4 hours)
- Spec: `docs/specs/recommender-requirements.md` (C1 section)
- Logic: Identify low-CTR pages, generate improved metadata
- Input: GSC data + Shopify page metadata
- Output: 5-10 SEO CTR actions/week
- Deliverable: `app/services/recommenders/seo-ctr.server.ts`

**C2: Metaobject Generator** (3-4 hours)
- Generate FAQs, specifications, reviews
- Input: Product data + competitor analysis
- Output: 2-5 metaobject actions/week
- Deliverable: `app/services/recommenders/metaobject.server.ts`

**C3: Merch Playbook** (2-3 hours)
- Optimize collection sort order, featured products
- Input: Collection performance + product analytics
- Output: 1-3 merchandising actions/week
- Deliverable: `app/services/recommenders/merch-playbook.server.ts`

**C4: Guided Selling** (2-3 hours)
- Generate cross-sell/upsell recommendations
- Input: Purchase patterns + inventory data
- Output: 5-10 recommendation rules/month
- Deliverable: `app/services/recommenders/guided-selling.server.ts`

**C5: Core Web Vitals** (2-3 hours)
- Identify performance issues, recommend fixes
- Input: Lighthouse data + page elements
- Output: 3-5 CWV actions/month
- Deliverable: `app/services/recommenders/cwv.server.ts`

---

### Block D: Storefront Automation (2 items) - 4-5 hours

**D1: Shopify Storefront API Integration** (2-3 hours)
- Execute actions on storefront (not just admin)
- Update metaobjects, page metadata
- Deliverable: Storefront mutation client

**D2: Theme Customization API** (2 hours)
- Apply guided selling logic to theme
- Inject product recommendations
- Deliverable: Theme extension or API integration

---

### Block E: Recommender Orchestration (3 items) - 3-4 hours

**E1: Recommender Scheduler** (1-2 hours)
- Daily cron jobs (02:00-06:00 UTC)
- Run all 5 recommenders sequentially
- Deliverable: Scheduled background jobs

**E2: Action Prioritization Logic** (1 hour)
- Sort actions by priority × confidence × impact
- Show operator top 10 daily
- Deliverable: Prioritization algorithm

**E3: Deduplication & Conflict Detection** (1 hour)
- Prevent duplicate actions on same resource
- Flag conflicting recommendations
- Deliverable: Conflict resolution logic

---

### Block F: Learning Loop Foundation (3 items) - 4-5 hours

**F1: Outcome Measurement Automation** (2 hours)
- Daily job to measure 30-day-old actions
- Compare actual vs estimated impact
- Deliverable: Outcome measurement service

**F2: Recommender Feedback Database** (1-2 hours)
- Store approval/rejection patterns
- Track accuracy by recommender type
- Deliverable: `recommender_learnings` table

**F3: Confidence Score Adjustment** (1-2 hours)
- Auto-adjust recommender weights based on accuracy
- Increase confidence for successful recommenders
- Decrease for inaccurate ones
- Deliverable: Learning loop algorithm

---

### Block G: Operator Experience (2 items) - 3-4 hours

**G1: Approval Queue Dashboard** (2-3 hours)
- Main UI for reviewing actions
- Filters (by type, priority, confidence)
- Bulk actions (approve multiple)
- Deliverable: Dashboard page

**G2: Action Detail Modal** (1 hour)
- Deep-dive view for each action
- Full diff, rationale, estimated impact
- Approve/reject/edit interface
- Deliverable: Modal component

---

### Total Week 2 Estimate: **26-33 hours**

**Success Criteria**:
- ✅ All 5 recommenders generating actions daily
- ✅ Operator reviewing and approving ≥5 actions/week
- ✅ At least 10 actions executed successfully
- ✅ Outcome measurement working for Week 1 actions

---

## Priority 2: Week 3 - Scale & Optimization (15 Items)

**Goal**: Refine system based on Week 1-2 learnings, add advanced features

### Block H: Advanced Features (4 items) - 6-8 hours

**H1: Auto-Approval Rules** (2-3 hours)
- Operator sets confidence thresholds for auto-approve
- Example: Auto-approve SEO CTR actions with >90% confidence
- Deliverable: Auto-approval configuration UI

**H2: Batch Operations** (2 hours)
- Approve/reject multiple actions at once
- Bulk execute approved actions
- Deliverable: Batch action endpoints

**H3: Action Templates** (1-2 hours)
- Operator can create reusable action templates
- Example: "Standard FAQ for fuel line products"
- Deliverable: Template system

**H4: Scheduled Actions** (1-2 hours)
- Operator can schedule actions for future execution
- Example: "Apply this price change next Monday"
- Deliverable: Scheduling system

---

### Block I: Analytics & KPIs (8 items) - 8-10 hours

**I1: Action Performance Dashboard** (2 hours)
- Show approval rates by recommender type
- Show outcome success rates
- Deliverable: Analytics dashboard

**I2: ROI Calculator** (1 hour)
- Calculate business value delivered by actions
- Track: CTR improvements → additional traffic → revenue
- Deliverable: ROI tracking system

**I3: Recommender Leaderboard** (1 hour)
- Rank recommenders by approval rate & outcome success
- Identify which recommenders work best
- Deliverable: Leaderboard UI

**I4: Time Savings Tracker** (1 hour)
- Measure operator time spent vs manual optimization
- Show: "Growth automation saved you X hours this month"
- Deliverable: Time tracking

**I5: Revenue Attribution** (1-2 hours)
- Track revenue increases from executed actions
- Example: "SEO CTR actions drove +$12K revenue this month"
- Deliverable: Revenue attribution model

**I6: A/B Test Framework** (2 hours)
- Test action variations
- Example: Test 3 different meta title formats
- Deliverable: A/B testing infrastructure

**I7: Experiment Tracking** (30 min)
- Log all experiments with outcomes
- Identify winning variations
- Deliverable: Experiment database

**I8: KPI Dashboard** (30 min)
- Show all growth automation KPIs in one view
- Deliverable: Executive KPI dashboard

---

### Block J: Optimization & Polish (3 items) - 4-5 hours

**J1: Recommender Tuning** (2 hours)
- Adjust prompts based on Week 1-2 feedback
- Improve confidence scoring accuracy
- Deliverable: Tuned recommender parameters

**J2: Performance Optimization** (1-2 hours)
- Cache recommender outputs
- Optimize database queries
- Reduce API calls
- Deliverable: System 2X faster

**J3: Error Handling & Recovery** (1-2 hours)
- Graceful degradation (if GSC API fails)
- Retry logic for transient failures
- Operator notifications for persistent errors
- Deliverable: Robust error handling

---

### Total Week 3 Estimate: **18-23 hours**

**Success Criteria**:
- ✅ 100+ actions generated and executed across all recommenders
- ✅ 70%+ approval rate sustained
- ✅ 80%+ outcome success rate
- ✅ ROI proven ($10K+ revenue attributed to actions)
- ✅ Auto-approval working (30-50% of actions auto-approved)

---

## Cumulative Timeline

### Week 1 Summary
- **Hours**: 19-25 hours (Engineer + Data)
- **Deliverables**: Action system + data pipelines
- **Milestone**: Manual actions working end-to-end

### Week 2 Summary
- **Hours**: 26-33 hours (Engineer + AI)
- **Deliverables**: All 5 recommenders + learning loop
- **Milestone**: 10+ actions executed with outcomes

### Week 3 Summary
- **Hours**: 18-23 hours (Engineer + Product)
- **Deliverables**: Auto-approval + analytics + optimization
- **Milestone**: 100+ actions, proven ROI

### **Total: 63-81 hours over 3 weeks**

---

## Dependency Map

```
Week 1 (Foundation):
┌────────────────────────────────────────┐
│ A1-A7: Action System                   │  ← BLOCKS EVERYTHING
│ B1-B7: Data Pipelines                  │  ← ENABLES RECOMMENDERS
└────────────────────────────────────────┘
                  │
                  ▼
Week 2 (Value):
┌────────────────────────────────────────┐
│ C1-C5: Recommenders                    │  ← GENERATES ACTIONS
│ D1-D2: Storefront Automation           │  ← EXECUTES ACTIONS
│ E1-E3: Orchestration                   │  ← COORDINATES FLOW
│ F1-F3: Learning Loop                   │  ← IMPROVES ACCURACY
│ G1-G2: Operator UX                     │  ← ENABLES REVIEW
└────────────────────────────────────────┘
                  │
                  ▼
Week 3 (Scale):
┌────────────────────────────────────────┐
│ H1-H4: Advanced Features               │  ← INCREASES EFFICIENCY
│ I1-I8: Analytics & KPIs                │  ← PROVES VALUE
│ J1-J3: Optimization                    │  ← IMPROVES PERFORMANCE
└────────────────────────────────────────┘
```

**Critical Path**: A1 → A2 → A3 → A4 (Action system) must complete before recommenders can generate actions

---

## Risk-Adjusted Timeline

### Conservative (Everything Takes Longer)

- Week 1: 25 hours → **2 weeks** (if blocked or complex)
- Week 2: 33 hours → **2.5 weeks**
- Week 3: 23 hours → **2 weeks**
- **Total: 6.5 weeks**

### Aggressive (Everything Goes Smoothly)

- Week 1: 19 hours → **4 days** (if no blockers)
- Week 2: 26 hours → **5 days**
- Week 3: 18 hours → **4 days**
- **Total: 13 days (under 3 weeks)**

### Recommended (Realistic)

- Week 1: 22 hours → **1.5 weeks**
- Week 2: 30 hours → **2 weeks**
- Week 3: 21 hours → **1.5 weeks**
- **Total: 5 weeks (1 month)**

---

## Feature-by-Feature Prioritization

### P0 (Must-Have - Week 1)

| ID | Feature | Hours | Blocks | Value |
|----|---------|-------|--------|-------|
| A1 | Action DB Schema | 2 | ALL | Foundation |
| A2 | Action API | 4-5 | C1-C5, G1 | Foundation |
| A3 | Queue UI | 3-4 | Operator review | Critical |
| A4 | Execution Engine | 3-4 | D1-D2 | Critical |
| A5 | Rollback System | 2-3 | Safety | Critical |
| A6 | Status Tracking | 1 | A4 | Critical |
| A7 | Logging | 1 | Monitoring | Important |
| B1 | GSC Integration | 2-3 | C1 | Enables SEO |
| B2 | Shopify Sync | 2 | C1, C2 | Enables all |
| B3 | Analytics | 2 | All recommenders | Enables impact |
| B4 | Purchase Patterns | 1-2 | C4 | Enables guided selling |
| B5 | Performance Data | 1 | C5 | Enables CWV |
| B6 | Data Quality | 0.5 | Data trust | Important |
| B7 | Baseline Collection | 0.5 | Measurement | Important |

---

### P1 (High-Value - Week 2)

| ID | Feature | Hours | Depends On | Value |
|----|---------|-------|------------|-------|
| C1 | SEO CTR Recommender | 3-4 | A1-A7, B1-B2 | HIGHEST ROI |
| C2 | Metaobject Generator | 3-4 | A1-A7, B2 | High SEO value |
| C3 | Merch Playbook | 2-3 | A1-A7, B2-B3 | Conversion lift |
| C4 | Guided Selling | 2-3 | A1-A7, B4 | AOV increase |
| C5 | CWV Recommender | 2-3 | A1-A7, B5 | SEO rankings |
| D1 | Storefront API | 2-3 | A4 | Execution |
| D2 | Theme Customization | 2 | D1 | UX improvements |
| E1 | Scheduler | 1-2 | C1-C5 | Automation |
| E2 | Prioritization | 1 | C1-C5 | Operator efficiency |
| E3 | Deduplication | 1 | C1-C5 | Data quality |
| F1 | Outcome Measurement | 2 | A4 | Learning |
| F2 | Feedback DB | 1-2 | A1 | Learning |
| F3 | Confidence Adjustment | 1-2 | F1-F2 | Accuracy |
| G1 | Approval Queue UI | 2-3 | A2-A3 | Operator UX |
| G2 | Detail Modal | 1 | G1 | Operator UX |

---

### P2 (Nice-to-Have - Week 3)

| ID | Feature | Hours | Depends On | Value |
|----|---------|-------|------------|-------|
| H1 | Auto-Approval Rules | 2-3 | F3 | Efficiency |
| H2 | Batch Operations | 2 | G1 | Operator time |
| H3 | Action Templates | 1-2 | A1-A2 | Reusability |
| H4 | Scheduled Actions | 1-2 | A4 | Flexibility |
| I1 | Performance Dashboard | 2 | F1 | Visibility |
| I2 | ROI Calculator | 1 | F1 | Proof of value |
| I3 | Recommender Leaderboard | 1 | F1-F2 | Optimization |
| I4 | Time Savings Tracker | 1 | G1 | Operator satisfaction |
| I5 | Revenue Attribution | 1-2 | F1 | Business case |
| I6 | A/B Test Framework | 2 | A1-A4 | Experimentation |
| I7 | Experiment Tracking | 0.5 | I6 | Learning |
| I8 | KPI Dashboard | 0.5 | I1-I5 | Executive view |
| J1 | Recommender Tuning | 2 | C1-C5, F1 | Accuracy |
| J2 | Performance Optimization | 1-2 | ALL | Speed |
| J3 | Error Handling | 1-2 | A4, C1-C5 | Reliability |

---

## Implementation Strategy

### Minimum Viable Product (MVP)

**Ship Week 1 Only**:
- Action system + SEO CTR recommender only
- Operator can review and approve SEO improvements
- System executes changes and measures outcomes
- **Value**: Prove concept with highest-ROI recommender

**Timeline**: 2 weeks (conservative)

---

### Full Feature Set

**Ship All 3 Weeks**:
- Complete action system
- All 5 recommenders operational
- Learning loop improving accuracy
- Analytics proving ROI

**Timeline**: 5 weeks (realistic)

---

### Phased Rollout (Recommended)

**Phase 1** (Week 1-2): Foundation + SEO CTR
- 19-25 hours Week 1 + 10 hours Week 2 (C1 + D1 + F1 only)
- **Output**: 5-10 SEO actions/week, 70%+ approval rate
- **Validate**: Does SEO recommender deliver value?

**Phase 2** (Week 3-4): Add Remaining Recommenders
- 15 hours (C2-C5)
- **Output**: All recommenders generating actions
- **Validate**: Which recommenders get highest approval?

**Phase 3** (Week 5): Analytics & Optimization
- 18-23 hours (H, I, J blocks)
- **Output**: Auto-approval, ROI dashboards, tuning
- **Validate**: System running autonomously

**Total: 5 weeks phased rollout**

---

## Decision Framework

### Which Items Can Be Deferred?

**Can Skip in V1**:
- H1-H4 (Advanced features) - Nice to have, not critical
- I6-I7 (A/B testing) - Can add later
- J1-J3 (Optimization) - Do after proving value

**Cannot Skip**:
- A1-A7 (Action system) - Foundation
- B1-B7 (Data pipelines) - No data = no recommendations
- C1 (SEO CTR) - Highest ROI, prove value fast
- F1 (Outcome measurement) - Need to prove ROI

**MVP Scope** (Ship fastest):
- A1-A7, B1-B3, C1, D1, F1, G1
- **Estimate: 35-40 hours = 1 month**

---

## Coordination Requirements

### With Engineer Team

**Handoff Points**:
1. Week 1 Start: Review action schema spec, confirm database approach
2. Week 1 Mid: Review API endpoint designs, confirm patterns
3. Week 2 Start: Review recommender specs, confirm AI integration approach
4. Week 2 End: Demo working system, gather feedback
5. Week 3: Iterate based on performance data

**Communication Cadence**:
- Daily standup: Progress, blockers, questions
- Wednesday mid-week: Technical review
- Friday: Demo and week planning

---

### With AI Team

**Handoff Points**:
1. Week 2 Start: Review recommender requirements, confirm AI approach
2. Week 2 Mid: Review initial AI outputs, tune prompts
3. Week 2 End: Validate accuracy (>60% approval rate?)
4. Week 3: Implement learning loop, continuous improvement

**Deliverables from AI Team**:
- Recommender prompt engineering
- Knowledge base preparation (automotive fitment data)
- Validation logic (prevent hallucinations)
- Learning loop implementation

---

### With CEO

**Approval Gates**:
1. Week 0: Approve overall roadmap and priorities (this doc)
2. Week 1 End: Approve action system UX (before Week 2 build)
3. Week 2 End: Approve recommender outputs (are they valuable?)
4. Week 3 End: Approve for production rollout

---

## Success Metrics

### Week 1 Success
- ✅ Action system deployed to staging
- ✅ Manual action creation works
- ✅ Operator can approve, system executes
- ✅ Data pipelines operational (GSC, Shopify, Analytics)

### Week 2 Success
- ✅ SEO CTR recommender generating 5-10 actions/week
- ✅ Operator approval rate ≥60%
- ✅ 5+ actions executed successfully
- ✅ Zero execution errors

### Week 3 Success
- ✅ All 5 recommenders operational
- ✅ 50+ actions executed total
- ✅ Outcome measurement showing positive ROI
- ✅ CEO approves for production launch

---

## Document Status

**Status**: ✅ COMPLETE - Ready for team review  
**Owner**: Product Agent  
**Created**: 2025-10-14T12:47:20Z  
**Total Items Prioritized**: 44 items across 3 weeks  
**Next**: CEO approves priorities, Engineer begins Week 1 work

---

**This roadmap provides clear prioritization of all 44 growth spec items with dependencies mapped, timelines estimated, and success criteria defined for each week.**

