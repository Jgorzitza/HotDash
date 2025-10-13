# Feature Priority Matrix

**Purpose**: Prioritize features based on CEO requests vs technical debt vs user value  
**Owner**: Product Agent  
**Framework**: ICE Score (Impact × Confidence × Ease)  
**Update Frequency**: Weekly (after CEO feedback)

---

## 🎯 Prioritization Framework: ICE Score

**Formula**: `ICE = (Impact × Confidence × Ease) / 10`

**Impact** (1-10): How much does this improve CEO experience?
- 10 = Transformative (saves hours/week)
- 7-9 = Significant improvement
- 4-6 = Moderate improvement
- 1-3 = Minor improvement

**Confidence** (1-10): How sure are we this will work?
- 10 = Validated by CEO request
- 7-9 = Strong evidence/research
- 4-6 = Hypothesis/assumption
- 1-3 = Speculative

**Ease** (1-10): How easy to implement?
- 10 = < 1 day
- 7-9 = 1-3 days
- 4-6 = 1-2 weeks
- 1-3 = > 2 weeks

**ICE Score**:
- ≥7.0 = P0 (Do immediately)
- 5.0-6.9 = P1 (Do in Week 2-3)
- 3.0-4.9 = P2 (Do in Month 2)
- <3.0 = Backlog (Do later)

---

## 📋 Current Feature Backlog (Week 1)

| # | Feature | Impact | Conf | Ease | ICE | Priority | Owner |
|---|---------|--------|------|------|-----|----------|-------|
| 1 | Fix P0 bugs (blocking) | 10 | 10 | 8 | 8.0 | P0 | Engineer |
| 2 | Performance optimization | 9 | 9 | 7 | 7.6 | P0 | Engineer |
| 3 | Mobile view polish | 8 | 9 | 8 | 7.2 | P0 | Designer |
| 4 | Tile load speed | 9 | 10 | 6 | 7.5 | P0 | Engineer |
| 5 | Error messages clarity | 7 | 10 | 9 | 7.8 | P0 | Designer |
| 6 | Tile customization | 8 | 8 | 7 | 6.1 | P1 | Engineer |
| 7 | Approval queue UI | 7 | 7 | 6 | 4.9 | P1 | Engineer |
| 8 | Weekly email summary | 6 | 9 | 9 | 7.2 | P1 | Engineer |
| 9 | Smart reorder alerts | 9 | 6 | 4 | 5.4 | P1 | Data |
| 10 | CX response templates | 7 | 6 | 5 | 4.2 | P2 | AI |

**P0 Total**: 5 features (Fix bugs, Optimize performance, Polish mobile, Speed, Errors)  
**P1 Total**: 5 features (Customization, Approvals, Email, Alerts, Templates)

---

## 🚨 CEO Requests (Priority Override)

**If CEO explicitly requests a feature**:
- Automatic P0 priority (regardless of ICE score)
- Impact = 10, Confidence = 10 (CEO validated)
- Re-calculate ICE with CEO request multiplier

**Example**:
> CEO: "I need to see profit margin, not just revenue"

Priority: **P0** (CEO request)
- Impact: 10 (CEO needs it)
- Confidence: 10 (CEO validated)
- Ease: 7 (2-3 days to add)
- **ICE: 9.0** (Do immediately)

**CEO Request Log**: (To be populated after launch)
- [ ] Request 1: TBD
- [ ] Request 2: TBD

---

## 🔧 Technical Debt Priority

**Technical debt competes with features**. Use these criteria:

**When to prioritize technical debt**:
- ✅ Blocks future features (refactor needed first)
- ✅ Causes frequent bugs (stability issue)
- ✅ Impacts performance (CEO notices slowness)
- ✅ Security vulnerability (compliance risk)

**When to defer technical debt**:
- ❌ Doesn't impact CEO experience
- ❌ Can be worked around
- ❌ Low risk of breaking
- ❌ Purely "nice to have" internally

**Current Technical Debt**:
1. Database query optimization (ICE: 7.0 - impacts performance)
2. Test coverage expansion (ICE: 4.0 - defer to Week 3)
3. Code refactoring (ICE: 3.0 - backlog)

**Rule**: Tech debt with ICE ≥ 6.0 competes with features

---

## 💎 User Value Categories

**High Value** (CEO saves hours/week):
- Automated insights (predict issues before CEO notices)
- Smart reorder (prevent stockouts)
- Approval queue (fast decisions)
- Performance (speed = daily use)

**Medium Value** (CEO saves minutes/day):
- Tile customization (personalization)
- Weekly summary (re-engagement)
- Mobile polish (convenience)

**Low Value** (Nice to have):
- Advanced analytics (CEO doesn't need complexity)
- Custom reports (low frequency need)
- API access (CEO won't use)

**Prioritize**: High Value > CEO Requests > Medium Value > Low Value

---

## 🗓️ Week-by-Week Roadmap

### Week 1 (Day 1-7): Stability & Polish
**Focus**: Fix bugs, optimize performance, make it usable

P0 Features:
1. Fix all P0 bugs (Engineer)
2. Performance optimization < 2s (Engineer)
3. Mobile view polish (Designer)
4. Clear error messages (Designer)

---

### Week 2 (Day 8-14): Habit Formation
**Focus**: Add features that increase daily usage

P1 Features:
1. Tile customization (Engineer)
2. Weekly email summary (Engineer)
3. Approval queue UI improvements (Engineer)

---

### Week 3-4 (Day 15-30): High-Value Features
**Focus**: CEO-requested features + high-value automation

P1 Features (from CEO feedback):
- TBD based on Week 1-2 feedback

---

## 📊 Decision Matrix

**When CEO requests feature**:

```
Is it technically feasible?
  ├─ YES → Is it < 1 week effort?
  │   ├─ YES → P0 (Do immediately)
  │   └─ NO → P1 (Do in Week 2)
  └─ NO → Explain constraint, offer alternative
```

**When Engineer finds bug**:

```
Does it block CEO usage?
  ├─ YES → P0 (Fix < 2 hours)
  └─ NO → Does CEO notice it?
      ├─ YES → P1 (Fix < 24 hours)
      └─ NO → P2 (Fix in Week 2)
```

**When Team suggests feature**:

```
Calculate ICE score
  ├─ ICE ≥ 7.0 → P0
  ├─ ICE 5.0-6.9 → P1
  ├─ ICE 3.0-4.9 → P2
  └─ ICE < 3.0 → Backlog
```

---

## 🔄 Weekly Review Process

**Every Monday (or after Week 1)**:

1. **Review last week**:
   - What shipped?
   - What didn't ship (why)?
   - CEO feedback received?

2. **Update feature scores**:
   - Re-calculate ICE based on new data
   - Promote/demote features as needed

3. **Plan this week**:
   - Pick top 3-5 P0/P1 features
   - Assign owners
   - Set deadlines

4. **Communicate**:
   - Share roadmap with team
   - Update CEO on what's coming

---

## 📋 Feature Request Template

**When CEO requests feature**:

```markdown
## Feature Request: [Name]

**Requested by**: CEO / [Name]
**Date**: [Date]
**Description**: [What CEO wants]

**Impact**: [1-10] - [Why this matters]
**Confidence**: [1-10] - [How sure are we]
**Ease**: [1-10] - [Effort estimate]
**ICE Score**: [Calculated]

**Priority**: P0 / P1 / P2 / Backlog
**Owner**: [Engineer/Designer/Data]
**Timeline**: [Estimated completion date]

**Status**: Backlog / In Progress / Complete
```

---

**Status**: Ready for feature prioritization
**Next**: Update after Week 1 CEO feedback
**Owner**: Product Agent

