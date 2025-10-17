# Hot Rodan Success Metrics & Dashboard Specification

**Version**: 1.0
**Date**: October 12, 2025
**Customer**: Hot Rodan
**Owner**: Product Agent
**Purpose**: Define key metrics to track pilot success and dashboard visualization specs

---

## Overview

**Goal**: Track metrics that prove HotDash delivers value to Hot Rodan

**Primary Success Metric**: **CEO saves ≥5 hours/week**

**Supporting Metrics**: Usage, satisfaction, impact

---

## Key Metrics to Track

### Category 1: Usage Metrics 📊

**Why**: Usage indicates product adoption and habit formation

---

#### Metric 1.1: Login Frequency

**Definition**: Number of days per week CEO logs into dashboard

**Target**:

- Week 1: ≥3 days (building habit)
- Week 2-4: ≥5 days (habit formed)

**How to measure**:

```sql
-- Query user login events
SELECT
  DATE(logged_in_at) as login_date,
  COUNT(DISTINCT session_id) as sessions
FROM user_sessions
WHERE user_id = 'hot-rodan-ceo'
  AND logged_in_at >= 'pilot_start_date'
GROUP BY DATE(logged_in_at)
ORDER BY login_date;
```

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ 📊 Login Frequency                 │
├────────────────────────────────────┤
│ This Week: 6/7 days ✅              │
│                                    │
│ Mon Tue Wed Thu Fri Sat Sun        │
│  ✅  ✅  ✅  ✅  ✅  ❌  ✅         │
│                                    │
│ Target: ≥5 days/week               │
│ Trend: On track! 📈                │
└────────────────────────────────────┘
```

**Red Flag**: <3 days/week (CEO not using it)

---

#### Metric 1.2: Session Duration

**Definition**: Average time CEO spends per session

**Target**:

- 2-10 minutes per session (quick check-ins)
- If <1 minute: Not using it properly
- If >15 minutes: Dashboard too complex or has issues

**How to measure**:

```sql
SELECT
  AVG(TIMESTAMPDIFF(MINUTE, logged_in_at, logged_out_at)) as avg_minutes
FROM user_sessions
WHERE user_id = 'hot-rodan-ceo'
  AND logged_in_at >= 'pilot_start_date';
```

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ ⏱️ Avg Session Duration            │
├────────────────────────────────────┤
│ This Week: 4.2 minutes ✅           │
│ Last Week: 5.1 minutes             │
│                                    │
│ ▂▃▅▄▃▄▂  (Daily trend)             │
│                                    │
│ Target: 2-10 minutes               │
│ Trend: Efficient usage! ✅          │
└────────────────────────────────────┘
```

**Red Flag**: Consistently <1 min or >15 min

---

#### Metric 1.3: Tile Usage

**Definition**: Which tiles CEO uses most

**Target**: CEO uses ≥3 core tiles regularly

**How to measure**:

```sql
SELECT
  tile_name,
  COUNT(*) as clicks,
  COUNT(DISTINCT DATE(clicked_at)) as days_used
FROM tile_clicks
WHERE user_id = 'hot-rodan-ceo'
  AND clicked_at >= 'pilot_start_date'
GROUP BY tile_name
ORDER BY clicks DESC;
```

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ 📦 Most-Used Tiles                 │
├────────────────────────────────────┤
│ 1. Sales Pulse       47 clicks ⭐  │
│ 2. Inventory Alerts  32 clicks     │
│ 3. Ops Pulse        28 clicks     │
│ 4. Top Products      19 clicks     │
│ 5. Customer Mood     12 clicks     │
│                                    │
│ Insight: CEO loves Sales Pulse!    │
└────────────────────────────────────┘
```

**Insight**: If tile has <3 clicks in 2 weeks → Not useful, consider removing

---

#### Metric 1.4: Mobile Usage

**Definition**: Percentage of sessions from mobile

**Target**: ≥20% mobile usage (on-the-go value)

**How to measure**:

```sql
SELECT
  device_type,
  COUNT(*) as sessions,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM user_sessions
WHERE user_id = 'hot-rodan-ceo'
  AND logged_in_at >= 'pilot_start_date'
GROUP BY device_type;
```

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ 📱 Device Usage                    │
├────────────────────────────────────┤
│ Desktop: 73% (44 sessions)         │
│ Mobile:  27% (16 sessions) ✅       │
│                                    │
│ 🎯 Target: ≥20% mobile             │
│ Trend: Great mobile adoption!      │
└────────────────────────────────────┘
```

**Insight**: High mobile usage = CEO values checking dashboard anywhere

---

### Category 2: Satisfaction Metrics 😊

**Why**: Satisfaction predicts long-term retention and conversion

---

#### Metric 2.1: Weekly Rating

**Definition**: CEO's weekly satisfaction rating (1-10)

**Target**: ≥7/10 average across 4 weeks

**How to measure**:

- Ask during weekly check-in call
- Record in tracking spreadsheet

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ ⭐ Weekly Satisfaction Rating      │
├────────────────────────────────────┤
│ Week 4:  8/10 ⭐⭐⭐⭐⭐⭐⭐⭐     │
│ Week 3:  7/10 ⭐⭐⭐⭐⭐⭐⭐       │
│ Week 2:  7/10 ⭐⭐⭐⭐⭐⭐⭐       │
│ Week 1:  6/10 ⭐⭐⭐⭐⭐⭐         │
│                                    │
│ Average: 7.0/10 ✅                  │
│ Trend: Improving! 📈               │
└────────────────────────────────────┘
```

**Red Flag**: ≤5/10 for 2 consecutive weeks

---

#### Metric 2.2: Net Promoter Score (NPS)

**Definition**: "How likely are you to recommend HotDash to another business owner?" (0-10)

**Target**: ≥7 (Promoter)

**How to measure**:

- Ask in Week 4 final survey
- 9-10 = Promoter
- 7-8 = Passive
- 0-6 = Detractor

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ 🎯 Net Promoter Score              │
├────────────────────────────────────┤
│ Final Score: 9/10 ⭐                │
│ Category: Promoter ✅               │
│                                    │
│ CEO Quote:                         │
│ "I'd absolutely recommend this to  │
│  other business owners. Saves me   │
│  so much time every week."         │
│                                    │
│ Target: ≥7 (Passive or Promoter)   │
└────────────────────────────────────┘
```

**Insight**: Promoters (9-10) become advocates and referral sources

---

#### Metric 2.3: Feature Satisfaction

**Definition**: Which features CEO loves vs dislikes

**Target**: ≥3 features rated "love it"

**How to measure**:

- Ask in weekly check-ins: "Which tile/feature was most useful?"
- Track themes over 4 weeks

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ 💚 Feature Satisfaction            │
├────────────────────────────────────┤
│ LOVE IT:                           │
│ • Sales Pulse (4 mentions)         │
│ • Inventory Alerts (3 mentions)    │
│ • Approval Queue (2 mentions)      │
│                                    │
│ FRUSTRATING:                       │
│ • Mobile dashboard layout (1 time) │
│                                    │
│ Insight: Core tiles are crushing! │
└────────────────────────────────────┘
```

**Insight**: Double down on "love it" features, fix "frustrating" ones

---

### Category 3: Impact Metrics 🚀

**Why**: Impact proves ROI and justifies pricing

---

#### Metric 3.1: Time Savings

**Definition**: Hours saved per week vs manual workflow

**Target**: ≥5 hours/week

**How to measure**:

- CEO self-reported (weekly check-ins)
- Calculate: (Manual time - HotDash time) × frequency

**Calculation Example**:

```
Before HotDash:
- Daily Shopify check: 30 min × 7 days = 210 min/week (3.5 hours)
- Weekly reports: 2 hours
- Decision delays: 1 hour
- Total: 6.5 hours/week

With HotDash:
- Daily dashboard check: 2 min × 7 days = 14 min/week (0.25 hours)
- Weekly reports: Auto-generated (0 hours)
- Decision delays: Approval queue (0.5 hours)
- Total: 0.75 hours/week

Time Saved: 6.5 - 0.75 = 5.75 hours/week ✅
```

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ ⏰ Time Savings                    │
├────────────────────────────────────┤
│ This Week: 5.8 hours ✅             │
│                                    │
│ Before:  ████████████ 6.5 hr/week │
│ After:   ██ 0.75 hr/week           │
│                                    │
│ Saved:   5.75 hours/week           │
│                                    │
│ ROI: $144/week (@ $25/hr rate)     │
│ Annual: $7,488 saved               │
│                                    │
│ Target: ≥5 hours/week ✅            │
└────────────────────────────────────┘
```

**Red Flag**: <3 hours/week (not enough value to justify cost)

---

#### Metric 3.2: Decision Turnaround Time

**Definition**: Time from approval request → CEO decision

**Target**: <1 hour during business hours

**How to measure**:

```sql
SELECT
  AVG(TIMESTAMPDIFF(MINUTE,
    created_at,
    approved_at
  )) as avg_minutes
FROM approval_queue
WHERE user_id = 'hot-rodan-ceo'
  AND approved_at IS NOT NULL
  AND created_at >= 'pilot_start_date';
```

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ ⚡ Decision Speed                  │
├────────────────────────────────────┤
│ Avg Turnaround: 18 minutes ✅       │
│ (Target: <1 hour)                  │
│                                    │
│ This Week's Approvals:             │
│ • Refund $245: 12 min ✅            │
│ • Shipping upgrade: 8 min ✅        │
│ • Discount request: 32 min ✅       │
│                                    │
│ Before HotDash: ~3 hours avg       │
│ Improvement: 10x faster! 🚀         │
└────────────────────────────────────┘
```

**Impact**: Faster decisions = happier customers, faster operations

---

#### Metric 3.3: Inventory Stock-Out Prevention

**Definition**: Number of stock-outs prevented by inventory alerts

**Target**: ≥1 stock-out prevented in 4 weeks

**How to measure**:

- Track when CEO acts on inventory alerts
- Ask CEO: "Did you reorder because of dashboard alert?"
- Calculate lost sales prevented

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ 📦 Inventory Impact                │
├────────────────────────────────────┤
│ Alerts Caught: 4 this month        │
│ Stock-Outs Prevented: 2 ✅          │
│                                    │
│ Example:                           │
│ • Chrome Headers: Alerted at 3 left│
│ • CEO reordered before running out │
│ • Est. lost sales prevented: $2K   │
│                                    │
│ Total Value: $5,200 saved 💰        │
└────────────────────────────────────┘
```

**Impact**: One prevented stock-out can pay for months of HotDash

---

#### Metric 3.4: Customer Satisfaction Trend

**Definition**: Customer sentiment trend during pilot

**Target**: Maintain or improve (≥80% positive)

**How to measure**:

```sql
SELECT
  WEEK(created_at) as week_num,
  SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pct_positive
FROM support_tickets
WHERE store_id = 'hot-rodan'
  AND created_at >= 'pilot_start_date'
GROUP BY WEEK(created_at);
```

**Dashboard Visualization**:

```
┌────────────────────────────────────┐
│ 😊 Customer Satisfaction Trend     │
├────────────────────────────────────┤
│ This Month: 84% positive ✅         │
│ Last Month: 80% positive           │
│                                    │
│ Week 1: 78% ⬆️                     │
│ Week 2: 82% ⬆️                     │
│ Week 3: 86% ⬆️                     │
│ Week 4: 88% ⬆️                     │
│                                    │
│ Trend: Improving with faster       │
│ decisions and proactive support! ✅ │
└────────────────────────────────────┘
```

**Impact**: Faster approvals → happier customers → more revenue

---

## Success Dashboard Layout

### View 1: Pilot Overview (For CEO)

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Hot Rodan Pilot - Week 3 Overview                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ USAGE                    SATISFACTION    IMPACT         │
│ ┌────────────────┐      ┌────────────┐  ┌────────────┐│
│ │ Login Days     │      │ Rating     │  │ Time Saved ││
│ │ 6/7 days ✅     │      │ 7/10 ✅     │  │ 5.8 hrs ✅  ││
│ └────────────────┘      └────────────┘  └────────────┘│
│                                                         │
│ ┌────────────────┐      ┌────────────┐  ┌────────────┐│
│ │ Avg Session    │      │ Most Loved │  │ Decision   ││
│ │ 4.2 min ✅      │      │ Sales Pulse│  │ 18 min ⚡   ││
│ └────────────────┘      └────────────┘  └────────────┘│
│                                                         │
│ KEY INSIGHT: You're crushing it! On track for success. │
│ TOP ACHIEVEMENT: Prevented 2 stock-outs worth $5K! 💰   │
│                                                         │
│ NEXT: Keep using dashboard daily, Week 4 final review  │
└─────────────────────────────────────────────────────────┘
```

---

### View 2: Detailed Metrics (For Product Team)

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Hot Rodan Pilot - Detailed Analytics                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ USAGE METRICS                                           │
│ • Login frequency: 23/28 days (82%) ✅                   │
│ • Avg session: 4.2 min                                  │
│ • Total sessions: 67                                    │
│ • Mobile usage: 27%                                     │
│ • Most-used tile: Sales Pulse (47 clicks)               │
│                                                         │
│ SATISFACTION METRICS                                    │
│ • Week 1 rating: 6/10                                   │
│ • Week 2 rating: 7/10                                   │
│ • Week 3 rating: 7/10                                   │
│ • Average: 6.7/10 (Target: ≥7/10) ⚠️                    │
│ • Features loved: Sales Pulse, Inventory, Approvals     │
│                                                         │
│ IMPACT METRICS                                          │
│ • Time saved: 5.8 hours/week ✅                          │
│ • Decision speed: 18 min avg (vs 3 hours before) ✅      │
│ • Stock-outs prevented: 2 ($5,200 value) ✅              │
│ • Customer satisfaction: 84% (up from 80%) ✅            │
│                                                         │
│ OVERALL STATUS: ✅ ON TRACK FOR SUCCESS                 │
│ • 3/3 must-have metrics hit targets                     │
│ • 2/3 nice-to-have metrics hit targets                  │
│ • CEO quote: "This saves me so much time every week"    │
│                                                         │
│ RECOMMENDATION: Continue to Week 4, prepare pricing     │
└─────────────────────────────────────────────────────────┘
```

---

## Metrics Collection Schedule

### Daily (Automated)

- [ ] Login frequency
- [ ] Session duration
- [ ] Tile clicks
- [ ] Approval queue activity
- [ ] Error logs

**Script**: `npm run pilot:metrics:daily --customer=hot-rodan`

---

### Weekly (Manual + Automated)

- [ ] Weekly rating (from check-in call)
- [ ] Time saved (CEO self-reported)
- [ ] Feature feedback (from check-in call)
- [ ] Quick wins (CEO stories)

**Script**: `npm run pilot:metrics:weekly --customer=hot-rodan`

**Plus**: Log qualitative feedback from check-in call

---

### Monthly (End of Pilot)

- [ ] Net Promoter Score
- [ ] Total time saved (4-week sum)
- [ ] ROI calculation
- [ ] Go/no-go decision
- [ ] Testimonial (if success)

**Script**: `npm run pilot:metrics:final --customer=hot-rodan`

---

## Data Sources

### Application Logs

```sql
-- User sessions
user_sessions (user_id, logged_in_at, logged_out_at, device_type)

-- Tile interactions
tile_clicks (user_id, tile_name, clicked_at)

-- Approval queue
approval_queue (id, user_id, created_at, approved_at, decision)
```

### Survey Data

- Weekly check-in ratings (manual entry)
- Feature satisfaction (manual entry)
- Time savings (manual entry)

### External Data

- Shopify inventory levels (API)
- Chatwoot customer sentiment (API)
- Support response times (API)

---

## Success Criteria Summary

### Must-Have (Required for Pilot Success)

| Metric              | Target       | Week 1 | Week 2 | Week 3 | Week 4 | Status |
| ------------------- | ------------ | ------ | ------ | ------ | ------ | ------ |
| **Login Frequency** | ≥5 days/week | [TBD]  | [TBD]  | [TBD]  | [TBD]  | [TBD]  |
| **Weekly Rating**   | ≥7/10        | [TBD]  | [TBD]  | [TBD]  | [TBD]  | [TBD]  |
| **Time Savings**    | ≥5 hrs/week  | [TBD]  | [TBD]  | [TBD]  | [TBD]  | [TBD]  |

**Pass**: 3/3 metrics hit targets → **PILOT SUCCESS**

---

### Nice-to-Have (Bonus Value)

| Metric                    | Target           | Result | Status |
| ------------------------- | ---------------- | ------ | ------ |
| **Decision Speed**        | <1 hour          | [TBD]  | [TBD]  |
| **Stock-Outs Prevented**  | ≥1               | [TBD]  | [TBD]  |
| **Customer Satisfaction** | Maintain/improve | [TBD]  | [TBD]  |

**Bonus**: 2+/3 metrics hit → **STRONG PILOT SUCCESS**

---

## ROI Calculation

**CEO Time Value**: $25/hour (conservative)
**Time Saved**: 5.8 hours/week
**Weekly Value**: $145
**Monthly Value**: $580
**Annual Value**: $6,960

**HotDash Pricing** (TBD): $200-500/month
**Annual Cost**: $2,400-6,000
**Net Annual Value**: $960-4,560

**Payback Period**: 3-6 months

**Additional Value**:

- Stock-out prevention: $5,200 (one-time)
- Customer satisfaction improvement: Hard to quantify but valuable

**Total ROI**: Strong positive return

---

**Document Path**: `docs/pilot/success-metrics.md`  
**Owner**: Product Agent  
**Status**: ✅ Ready for Hot Rodan pilot tracking  
**Next**: Set up metrics collection scripts and weekly tracking spreadsheet
