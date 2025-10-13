# Feature Priority Matrix v2

**Version**: 2.0 (Updated for Hot Rodan pilot)  
**Date**: October 13, 2025  
**Owner**: Product Agent  
**Purpose**: Prioritize features based on CEO requests, technical debt, and user value  
**Framework**: RICE Score (Reach × Impact × Confidence × Ease)  

---

## Overview

**Goal**: Make data-driven decisions about what to build next

**Why Priority Matrix Matters**:
- Limited engineering time (1 engineer)
- CEO has many requests (can't do everything)
- Technical debt competes with features
- Need to maximize CEO value quickly

**Decision Framework**: RICE Score + CEO Request Override

---

## 🎯 Prioritization Framework: RICE Score

**Formula**: `RICE = (Reach × Impact × Confidence) / Effort`

### Reach (How many users affected?)
For Hot Rodan pilot (1 CEO user):
- **10**: CEO uses daily (every session)
- **7**: CEO uses weekly (multiple times)
- **4**: CEO uses monthly (occasionally)
- **1**: CEO uses rarely (edge case)

### Impact (How much does this improve experience?)
- **10**: Transformative (saves hours/week, prevents major issues)
- **7-9**: Significant improvement (saves 30+ min/week)
- **4-6**: Moderate improvement (saves 10-30 min/week)
- **1-3**: Minor improvement (nice to have)

### Confidence (How sure are we this will work?)
- **10**: CEO explicitly requested (validated need)
- **8-9**: Strong evidence from analytics/feedback
- **5-7**: Hypothesis based on assumptions
- **1-4**: Speculative (no validation)

### Effort (How hard to build?)
- **1**: < 4 hours (quick win)
- **2**: 4-8 hours (half day)
- **3**: 1-2 days
- **5**: 3-5 days (week)
- **8**: 1-2 weeks
- **13**: 2-4 weeks (epic)

### RICE Score Interpretation
- **≥50**: P0 - Do immediately (this week)
- **25-49**: P1 - Do soon (Week 2-3)
- **10-24**: P2 - Do later (Month 2)
- **<10**: Backlog - Maybe never

---

## 📋 Feature Backlog (Pre-Launch)

### Category 1: Stability & Performance (P0)

| # | Feature | Reach | Impact | Conf | Effort | RICE | Priority | Owner |
|---|---------|-------|--------|------|--------|------|----------|-------|
| 1 | Fix P0 bugs (crashes, data loss) | 10 | 10 | 10 | 2 | 500 | P0 | Engineer |
| 2 | Optimize tile load speed (<2s) | 10 | 9 | 9 | 3 | 270 | P0 | Engineer |
| 3 | Mobile responsive design | 7 | 8 | 9 | 3 | 168 | P0 | Designer |
| 4 | Clear error messages | 10 | 7 | 10 | 1 | 700 | P0 | Designer |
| 5 | Fix P1 bugs (visual glitches) | 10 | 6 | 10 | 2 | 300 | P0 | Engineer |

**P0 Total**: 5 features, ~11 hours effort

---

### Category 2: Engagement & Habit Formation (P1)

| # | Feature | Reach | Impact | Conf | Effort | RICE | Priority | Owner |
|---|---------|-------|--------|------|--------|------|----------|-------|
| 6 | Weekly email summary | 10 | 7 | 8 | 2 | 280 | P1 | Engineer |
| 7 | Tile customization (reorder, hide) | 10 | 6 | 7 | 3 | 140 | P1 | Engineer |
| 8 | Mobile push notifications | 7 | 8 | 6 | 5 | 67 | P1 | Engineer |
| 9 | Approval queue UI polish | 10 | 5 | 9 | 2 | 225 | P1 | Designer |
| 10 | Dashboard onboarding tour | 4 | 6 | 8 | 2 | 96 | P1 | Designer |

**P1 Total**: 5 features, ~14 hours effort

---

### Category 3: High-Value Automation (P1-P2)

| # | Feature | Reach | Impact | Conf | Effort | RICE | Priority | Owner |
|---|---------|-------|--------|------|--------|------|----------|-------|
| 11 | Smart reorder alerts (predict stockouts) | 10 | 9 | 6 | 8 | 68 | P1 | Data |
| 12 | Anomaly detection (all metrics) | 10 | 8 | 7 | 5 | 112 | P1 | Data |
| 13 | Profit margin tracking | 10 | 8 | 9 | 3 | 240 | P1 | Data |
| 14 | Customer lifetime value (CLV) | 7 | 7 | 6 | 5 | 59 | P2 | Data |
| 15 | Automated CX response templates | 7 | 7 | 5 | 5 | 49 | P2 | AI |

**P1-P2 Total**: 5 features, ~26 hours effort

---

### Category 4: Advanced Features (P2-Backlog)

| # | Feature | Reach | Impact | Conf | Effort | RICE | Priority | Owner |
|---|---------|-------|--------|------|--------|------|----------|-------|
| 16 | Custom report builder | 4 | 6 | 5 | 8 | 15 | P2 | Engineer |
| 17 | Multi-user access (team members) | 4 | 8 | 7 | 5 | 45 | P2 | Engineer |
| 18 | API access for integrations | 1 | 7 | 6 | 13 | 3 | Backlog | Engineer |
| 19 | Advanced analytics (cohorts, funnels) | 4 | 7 | 4 | 13 | 9 | Backlog | Data |
| 20 | White-label branding | 1 | 5 | 5 | 8 | 3 | Backlog | Designer |

**P2-Backlog Total**: 5 features, ~47 hours effort

---

## 🚨 CEO Request Override

**Rule**: If CEO explicitly requests a feature, it becomes P0 regardless of RICE score

**Why**: CEO is the customer, CEO knows their pain, CEO adoption is critical

**Process**:
1. CEO requests feature: "I need X"
2. Product documents request (use template below)
3. Product calculates RICE with CEO multiplier:
   - Confidence = 10 (CEO validated)
   - Impact = CEO's stated impact (usually 8-10)
4. Product prioritizes as P0 or P1 based on effort
5. Product communicates timeline to CEO

**Example**:
> CEO: "I need to see profit margin on the Sales Pulse tile"

**RICE Calculation**:
- Reach: 10 (CEO uses daily)
- Impact: 8 (CEO stated need)
- Confidence: 10 (CEO requested)
- Effort: 3 (1-2 days to add)
- **RICE: (10 × 8 × 10) / 3 = 267** → P0

**Timeline**: 1-2 days → Add to this week's sprint

---

## 🔧 Technical Debt Prioritization

**Technical debt competes with features for engineering time**

### When to Prioritize Tech Debt

**Prioritize tech debt if**:
- ✅ Blocks future features (refactor required first)
- ✅ Causes frequent bugs (stability issue)
- ✅ Impacts CEO-facing performance (slow loading)
- ✅ Security vulnerability (compliance risk)
- ✅ Prevents scaling (will break with more users)

**Defer tech debt if**:
- ❌ Doesn't impact CEO experience
- ❌ Can be worked around easily
- ❌ Low risk of breaking
- ❌ Purely internal "nice to have"
- ❌ Only matters at 100+ users

### Current Technical Debt Items

| # | Tech Debt Item | CEO Impact | Risk | Effort | Priority |
|---|----------------|------------|------|--------|----------|
| 1 | Database query optimization | High (slow tiles) | Medium | 3 | P0 |
| 2 | Error handling improvements | High (crashes) | High | 2 | P0 |
| 3 | Test coverage expansion | Low | Low | 5 | P2 |
| 4 | Code refactoring (clean up) | None | Low | 8 | Backlog |
| 5 | Documentation updates | None | Low | 3 | Backlog |

**Rule**: Tech debt with "High CEO Impact" or "High Risk" = P0/P1

---

## 💎 User Value Categories

### High Value (CEO saves hours/week)
**Characteristics**:
- Automates manual work
- Prevents costly mistakes
- Provides early warnings
- Enables fast decisions

**Examples**:
- Smart reorder alerts (prevents stockouts = $$$)
- Anomaly detection (catches issues early)
- Approval queue (fast decisions)
- Performance optimization (daily use)

**Priority**: P0-P1 (do first)

---

### Medium Value (CEO saves minutes/day)
**Characteristics**:
- Improves convenience
- Reduces friction
- Personalizes experience
- Increases engagement

**Examples**:
- Tile customization (personalization)
- Weekly email summary (re-engagement)
- Mobile polish (convenience)
- Onboarding tour (reduces learning curve)

**Priority**: P1-P2 (do after high value)

---

### Low Value (Nice to have)
**Characteristics**:
- Rarely used
- Not CEO-facing
- Low frequency need
- Speculative benefit

**Examples**:
- Advanced analytics (CEO doesn't need complexity)
- Custom reports (low frequency)
- API access (CEO won't use directly)
- White-label branding (not pilot need)

**Priority**: P2-Backlog (do much later or never)

---

## 🗓️ Week-by-Week Roadmap

### Week 1 (Oct 15-21): Stability & Polish
**Goal**: Make dashboard stable and usable

**Features**:
1. Fix all P0 bugs (Engineer, 8h)
2. Optimize tile load speed (Engineer, 12h)
3. Mobile responsive design (Designer, 12h)
4. Clear error messages (Designer, 4h)

**Total Effort**: ~36 hours (1 engineer + 1 designer)

**Success**: CEO logs in ≥5 days, zero P0 bugs

---

### Week 2 (Oct 22-28): Engagement & Habit
**Goal**: Increase daily usage and engagement

**Features**:
1. Weekly email summary (Engineer, 8h)
2. Tile customization (Engineer, 12h)
3. Approval queue UI polish (Designer, 8h)
4. [CEO request #1] (TBD based on Week 1 feedback)

**Total Effort**: ~28 hours + CEO request

**Success**: CEO logs in daily, uses favorite tiles

---

### Week 3-4 (Oct 29-Nov 11): High-Value Automation
**Goal**: Add features that save CEO hours/week

**Features**:
1. Smart reorder alerts (Data, 32h)
2. Anomaly detection (Data, 20h)
3. Profit margin tracking (Data, 12h)
4. [CEO requests #2-3] (TBD based on Week 2 feedback)

**Total Effort**: ~64 hours + CEO requests

**Success**: CEO reports time savings, willing to pay

---

### Month 2 (Nov 12-Dec 9): Scale & Polish
**Goal**: Prepare for multi-user rollout

**Features**:
1. Multi-user access (Engineer, 20h)
2. Advanced features from CEO feedback
3. Performance optimization for scale
4. Documentation and training materials

**Success**: Ready to invite team members, CEO testimonial

---

## 📊 Decision Framework

### When CEO Requests Feature

```
CEO Request: "I need X"
     ↓
Document request (use template)
     ↓
Calculate RICE with CEO multiplier
     ↓
Is effort < 1 week?
  ├─ YES → P0 (Do this week)
  └─ NO → P1 (Do next week)
     ↓
Communicate timeline to CEO
     ↓
Add to sprint, assign owner
```

---

### When Engineer Finds Bug

```
Bug discovered
     ↓
Does it block CEO usage?
  ├─ YES → P0 (Fix <2 hours)
  └─ NO → Does CEO notice it?
      ├─ YES → P1 (Fix <24 hours)
      └─ NO → P2 (Fix Week 2)
```

---

### When Team Suggests Feature

```
Feature idea
     ↓
Calculate RICE score
     ↓
RICE ≥ 50? → P0
RICE 25-49? → P1
RICE 10-24? → P2
RICE < 10? → Backlog
     ↓
Add to roadmap with priority
```

---

## 🔄 Weekly Review Process

**Every Monday (Start of Week)**:

### 1. Review Last Week
- [ ] What shipped? (list features)
- [ ] What didn't ship? (why? blockers?)
- [ ] CEO feedback received? (document)
- [ ] Analytics insights? (usage patterns)

### 2. Update Feature Scores
- [ ] Re-calculate RICE for all features
- [ ] Adjust based on new data (analytics, feedback)
- [ ] Promote/demote features as needed
- [ ] Add new CEO requests

### 3. Plan This Week
- [ ] Pick top 3-5 P0/P1 features
- [ ] Assign owners (Engineer, Designer, Data, AI)
- [ ] Set deadlines (specific dates)
- [ ] Estimate effort (hours)

### 4. Communicate
- [ ] Share roadmap with team (Slack)
- [ ] Update CEO on what's coming (email)
- [ ] Update Linear tickets (priorities, assignments)
- [ ] Document decisions in feedback/product.md

---

## 📋 Feature Request Template

**Use this template when CEO requests a feature**:

```markdown
## Feature Request: [Name]

**Requested By**: CEO / [Name]  
**Date**: [YYYY-MM-DD]  
**Source**: Slack / Call / Email / Analytics  

### Description
[What CEO wants in their own words]

### Problem Statement
[What pain is CEO trying to solve?]

### Proposed Solution
[How we plan to solve it]

### RICE Score Calculation
- **Reach**: [1-10] - [Justification]
- **Impact**: [1-10] - [Justification]
- **Confidence**: [1-10] - [Justification]
- **Effort**: [1-13] - [Justification]
- **RICE Score**: [Calculated] = (Reach × Impact × Confidence) / Effort

### Priority
- [ ] P0 - Do immediately (this week)
- [ ] P1 - Do soon (Week 2-3)
- [ ] P2 - Do later (Month 2)
- [ ] Backlog - Maybe never

### Assignment
- **Owner**: [Engineer/Designer/Data/AI]
- **Estimated Effort**: [X] hours
- **Target Date**: [YYYY-MM-DD]
- **Linear Ticket**: [LINK]

### Status
- [ ] Backlog
- [ ] In Progress
- [ ] In Review
- [ ] Complete
- [ ] Deployed

### Notes
[Any additional context, constraints, or considerations]
```

---

## 📈 Success Metrics

### Week 1 Success
- [ ] All P0 features shipped (5/5)
- [ ] CEO logs in ≥5 days
- [ ] Zero P0 bugs remaining
- [ ] CEO shares positive feedback

### Week 2-4 Success
- [ ] ≥3 P1 features shipped
- [ ] ≥1 CEO request implemented
- [ ] CEO reports time savings
- [ ] CEO willing to continue pilot

### Month 2 Success
- [ ] ≥5 high-value features shipped
- [ ] CEO invites team member
- [ ] CEO provides testimonial
- [ ] CEO willing to pay for product

---

## 🎯 Prioritization Examples

### Example 1: CEO Request (High Priority)

**Request**: "I need to see profit margin, not just revenue"

**RICE Calculation**:
- Reach: 10 (CEO uses Sales Pulse daily)
- Impact: 9 (CEO needs this for pricing decisions)
- Confidence: 10 (CEO explicitly requested)
- Effort: 3 (1-2 days to add margin calculation)
- **RICE: (10 × 9 × 10) / 3 = 300** → P0

**Decision**: Add to this week's sprint, target 2-day completion

---

### Example 2: Team Suggestion (Medium Priority)

**Suggestion**: "Add sparkline charts to tiles"

**RICE Calculation**:
- Reach: 10 (affects all tiles)
- Impact: 5 (nice visual improvement, not critical)
- Confidence: 6 (hypothesis, not validated)
- Effort: 5 (3-5 days to implement)
- **RICE: (10 × 5 × 6) / 5 = 60** → P1

**Decision**: Add to Week 2-3 roadmap, after CEO requests

---

### Example 3: Technical Debt (High Priority)

**Debt**: "Database queries slow, tiles load >5 seconds"

**Assessment**:
- CEO Impact: High (CEO notices slow loading)
- Risk: Medium (could get worse with more data)
- Effort: 3 (1-2 days to optimize)
- **Priority: P0** (impacts CEO experience)

**Decision**: Fix this week, before adding new features

---

### Example 4: Low-Value Feature (Backlog)

**Suggestion**: "Add API access for third-party integrations"

**RICE Calculation**:
- Reach: 1 (CEO won't use API directly)
- Impact: 7 (could be valuable for integrations)
- Confidence: 4 (speculative, no validation)
- Effort: 13 (2-4 weeks to build API)
- **RICE: (1 × 7 × 4) / 13 = 2** → Backlog

**Decision**: Defer indefinitely, focus on CEO-facing features

---

## 🚀 Next Steps

### Pre-Launch (Now)
- [x] Create feature priority matrix
- [x] Document prioritization framework
- [x] Define Week 1-4 roadmap
- [ ] Share with team for feedback

### Week 1 (After Launch)
- [ ] Collect CEO feedback daily
- [ ] Document all feature requests
- [ ] Calculate RICE scores
- [ ] Update roadmap based on feedback

### Week 2+ (Ongoing)
- [ ] Weekly review and re-prioritization
- [ ] Ship top 3-5 features per week
- [ ] Track CEO satisfaction and usage
- [ ] Iterate based on data

---

**Status**: Ready for pilot launch  
**Owner**: Product Agent  
**Evidence**: docs/product/feature_priority_matrix_v2.md  
**Timestamp**: 2025-10-13T23:05:00Z
