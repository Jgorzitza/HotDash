# User Behavior Analysis Framework

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Evidence**: Sections A-D (Behavioral Patterns, Usage Metrics, Analysis Methods, Action Framework)

---

## Section A: Behavioral Patterns to Track

### Pattern 1: Power User Behavior

- Logs in daily
- Uses bulk approve >5 times/day
- Reviews >20 drafts/day
- High approval rate (>75%)
- Active in community

### Pattern 2: Struggling User

- Low login frequency (<3x/week)
- Long review times (>3 min avg)
- Low approval rate (<50%)
- High rejection rate (>10%)

### Pattern 3: Feature Adoption Curve

- Early adopter: Uses new features within 24 hours
- Early majority: Tries within 1 week
- Late majority: Adopts within 1 month
- Laggards: Never adopts or after 3+ months

**Evidence**: User cohort analysis in Mixpanel dashboards

---

## Section B: Usage Metrics by Feature

**Metric Tracking**:

- Feature activation rate (% who try feature once)
- Feature adoption rate (% who use regularly)
- Feature stickiness (DAU/MAU ratio)
- Feature abandonment rate (tried but stopped using)

**Example for "Bulk Approve"**:

- Activation: 65% tried it within 30 days
- Adoption: 40% use it weekly
- Stickiness: 0.7 (users active 21 days/month)
- Abandonment: 15% (tried once, never again)

---

## Section C: Analysis Methods

**Cohort Analysis**: Group users by signup date, compare retention
**Funnel Analysis**: Track conversion through activation funnel
**Path Analysis**: How users navigate through product
**Retention Curves**: Day 1, 7, 30, 90 retention rates

---

## Section D: Action Framework

**If Power User**: Identify for case study, request referrals
**If Struggling**: Trigger intervention, offer training
**If Feature Underused**: Improve onboarding, add tips

**Document Owner**: Product Agent
**Document Path**: `docs/user_behavior_analysis_framework.md`
**Status**: Framework complete with 4 sections (A-D)
