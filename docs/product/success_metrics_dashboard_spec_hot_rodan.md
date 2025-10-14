# Success Metrics Dashboard Specification - Hot Rodan

**Version**: 1.0  
**Date**: October 14, 2025  
**Owner**: Product Agent  
**Purpose**: Track CEO value realization and dashboard success  
**Status**: Ready for implementation  

---

## Executive Summary

**Goal**: Measure Hot Rodan CEO's value from HotDash dashboard

**Metrics Tracked**: 15 metrics across 4 categories (Usage, Performance, Value, Satisfaction)

**Dashboard Location**: `/dashboard/metrics` (admin-only route)

**Update Frequency**: Real-time for usage, daily for aggregates, weekly for satisfaction

---

## Metrics Categories

### Category 1: Usage Metrics (Daily Tracking)

#### Metric 1.1: Login Frequency
**Definition**: Days per week CEO logs into dashboard

**Data Source**:
```sql
SELECT 
  DATE(login_at) as date,
  COUNT(DISTINCT session_id) as sessions
FROM dashboard_sessions
WHERE customer_id = 'hot-rodan'
  AND DATE(login_at) >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(login_at)
ORDER BY date DESC;
```

**Target**: ≥5 days/week (Week 1), ≥6 days/week (Week 2+)

**Visualization**: Calendar heatmap (green = login, gray = no login)

---

#### Metric 1.2: Session Duration
**Definition**: Average time spent per session

**Data Source**:
```sql
SELECT 
  AVG(session_duration_seconds) / 60.0 as avg_minutes,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY session_duration_seconds) / 60.0 as median_minutes
FROM dashboard_sessions
WHERE customer_id = 'hot-rodan'
  AND logout_at IS NOT NULL
  AND DATE(login_at) >= CURRENT_DATE - INTERVAL '7 days';
```

**Target**: 5-10 minutes (efficient, not too short or too long)

**Visualization**: Line chart over time

**Red Flags**:
- <2 min: CEO not engaging
- >15 min: Dashboard too complex or confusing

---

#### Metric 1.3: Tile Usage
**Definition**: Number of tiles viewed per session

**Data Source**:
```sql
SELECT 
  session_id,
  COUNT(DISTINCT tile_name) as tiles_viewed
FROM tile_interactions
WHERE customer_id = 'hot-rodan'
  AND interaction_type = 'view'
  AND DATE(interaction_at) >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY session_id;
```

**Target**: ≥3 tiles per session (exploring dashboard)

**Visualization**: Histogram (distribution of tiles viewed)

---

#### Metric 1.4: Most-Used Tiles
**Definition**: Tile engagement ranking

**Data Source**:
```sql
SELECT 
  tile_name,
  COUNT(*) as total_interactions,
  COUNT(*) FILTER (WHERE interaction_type = 'view') as views,
  COUNT(*) FILTER (WHERE interaction_type = 'click') as clicks
FROM tile_interactions
WHERE customer_id = 'hot-rodan'
  AND DATE(interaction_at) >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY tile_name
ORDER BY total_interactions DESC;
```

**Target**: Top 2-3 tiles identified (CEO favorites)

**Visualization**: Horizontal bar chart

---

### Category 2: Performance Metrics (Daily Tracking)

#### Metric 2.1: Tile Load Time
**Definition**: Average time for tiles to render

**Data Source**: Browser performance API or application logs

**Target**: <2 seconds (P95)

**Visualization**: Line chart over time

**Red Flags**: >3 seconds (slow, needs optimization)

---

#### Metric 2.2: Error Rate
**Definition**: % of sessions with errors

**Data Source**: Error logs

**Target**: <1% of sessions

**Visualization**: Line chart over time

**Red Flags**: >5% (critical quality issue)

---

#### Metric 2.3: Uptime
**Definition**: % of time dashboard is available

**Data Source**: Fly.io monitoring

**Target**: ≥99.5%

**Visualization**: Uptime bar (green = up, red = down)

---

### Category 3: Value Metrics (Weekly Tracking)

#### Metric 3.1: Time Saved
**Definition**: Estimated time saved vs manual Shopify checks

**Calculation**:
```
Time Saved = (Sessions × Avg Session Duration) × Efficiency Factor

Where Efficiency Factor = 3x (dashboard 3x faster than Shopify admin)
```

**Example**:
- CEO has 10 sessions/week × 7 min/session = 70 min/week
- Without dashboard: 70 min × 3 = 210 min/week (3.5 hours)
- Time saved: 210 - 70 = **140 min/week (2.3 hours)**

**Target**: ≥2 hours/week saved

**Visualization**: Bar chart (time saved per week)

---

#### Metric 3.2: Issues Detected Early
**Definition**: Number of issues caught via anomaly detection

**Data Source**: CEO feedback, anomaly tile interactions

**Target**: ≥1 issue detected per week (early warning value)

**Visualization**: Count per week

**Examples**:
- SEO traffic drops detected before major revenue impact
- Inventory stockouts prevented
- Fulfillment delays caught early

---

#### Metric 3.3: Decision Velocity
**Definition**: Time from data insight to business decision

**Measurement**: CEO feedback + approval queue latency (when implemented)

**Target**: <10 minutes (dashboard → decision)

**Visualization**: Timeline chart

**Examples**:
- See SEO drop → Contact marketing team (5 min)
- See low inventory → Place reorder (8 min)
- Approve refund via queue (30 seconds)

---

### Category 4: Satisfaction Metrics (Weekly/Monthly Tracking)

#### Metric 4.1: CEO Satisfaction Score
**Definition**: CEO rating of dashboard usefulness

**Data Source**: Weekly survey

**Question**: "On a scale of 1-10, how useful is HotDash this week?"

**Target**: ≥8/10 (Week 1-2), ≥9/10 (Week 3+)

**Visualization**: Line chart over time

---

#### Metric 4.2: Net Promoter Score (NPS)
**Definition**: Would CEO recommend to other business owners?

**Data Source**: Monthly survey (Day 14, Day 30)

**Question**: "On a scale of 0-10, how likely are you to recommend HotDash to another business owner?"

**Target**: ≥8/10 (Promoter)

**Visualization**: NPS gauge

---

#### Metric 4.3: Feature Request Rate
**Definition**: Number of feature requests per week

**Data Source**: CEO feedback, Slack messages, calls

**Target**: 2-3 per week (high engagement, not overwhelming)

**Visualization**: Bar chart

**Interpretation**:
- 0 requests: CEO not engaged or satisfied
- 1-3 requests: Healthy engagement
- 5+ requests: Missing critical features or dissatisfaction

---

## Dashboard Layout

### Overview Tab (Default View)

**Top Row** (Summary Cards):
1. Login Streak: "5 days in a row ✅"
2. Time Saved This Week: "2.3 hours"
3. Satisfaction Score: "8/10"
4. Issues Detected: "3 this week"

**Charts**:
1. Login Frequency (Calendar heatmap)
2. Session Duration (Line chart, last 30 days)
3. Most-Used Tiles (Bar chart)
4. Time Saved per Week (Bar chart, last 4 weeks)

---

### Usage Tab

**Charts**:
1. Daily Logins (Line chart)
2. Session Duration Distribution (Histogram)
3. Tiles Viewed per Session (Histogram)
4. Tile Engagement Ranking (Bar chart)
5. Device Breakdown (Pie chart: Desktop vs Mobile)
6. Peak Usage Times (Heatmap: Day of week × Hour of day)

**Filters**:
- Date range: Last 7 days, 30 days, All time
- Device: All, Desktop, Mobile
- User: CEO (later: All users, specific user)

---

### Performance Tab

**Charts**:
1. Tile Load Time (Line chart, P95)
2. Error Rate (Line chart, % of sessions)
3. Uptime (Uptime bar, 99.9% target line)
4. API Response Time (Line chart, P95)

**Alerts**:
- Red alert: Uptime <99%, Error rate >5%, Load time >3s
- Yellow alert: Load time >2s, Error rate >1%

---

### Value Tab

**Charts**:
1. Time Saved (Bar chart, weekly)
2. Issues Detected (Count per week)
3. Decision Velocity (Average time to decision)
4. Feature Adoption (% adoption per feature)

**ROI Calculation**:
```
ROI = (Time Saved × CEO Hourly Value - Dashboard Cost) / Dashboard Cost × 100%
```

**Example**:
- Time saved: 2.3 hours/week = 10 hours/month
- CEO hourly value: $150/hour
- Value: $1,500/month
- Dashboard cost: $100/month
- ROI: ($1,500 - $100) / $100 = 1,400% ROI

---

### Satisfaction Tab

**Charts**:
1. Satisfaction Score Trend (Line chart)
2. NPS Score (Gauge + Trend)
3. Feature Request Rate (Bar chart, per week)
4. Sentiment Analysis (Positive, Neutral, Negative feedback counts)

**Feedback Log**:
- Recent feedback quotes (last 10)
- Feedback categorized (positive, constructive, feature request)
- Action taken on each feedback item

---

## Data Sources

### Analytics Tables (Supabase)

**dashboard_sessions**:
- Login/logout timestamps
- Session duration
- Device type
- User ID

**tile_interactions**:
- Tile name
- Interaction type (view, click, refresh, export)
- Timestamp
- Session ID

**approval_actions** (Future):
- Approval type
- Action (approve, reject, defer, edit)
- Decision time
- Timestamp

---

### External Data Sources

**Fly.io Monitoring**:
- Uptime percentage
- Response time
- Error logs

**Shopify API** (for context):
- Revenue data (to calculate value)
- Order volume (to show business impact)

**CEO Surveys**:
- Weekly satisfaction survey
- Monthly NPS survey
- Ad-hoc feedback (Slack, calls)

---

## Weekly Reporting

### Weekly Metrics Email (Every Monday)

**To**: CEO, Manager, Product
**Subject**: "HotDash Dashboard - Week X Summary"

**Content**:
```
## Week X Summary (Oct 14-20, 2025)

### Usage
- Login Days: 6/7 ✅ (Target: ≥5)
- Total Sessions: 12
- Avg Session: 7 minutes ✅ (Target: 5-10 min)
- Device: 70% Desktop, 30% Mobile

### Most-Used Tiles
1. Sales Pulse (24 interactions)
2. SEO Pulse (18 interactions)
3. Inventory Watch (12 interactions)

### Performance
- Tile Load Time: 1.8s ✅ (Target: <2s)
- Uptime: 99.9% ✅ (Target: ≥99.5%)
- Errors: 0 ✅ (Target: <1%)

### Value Delivered
- Time Saved: 2.5 hours ✅ (Target: ≥2 hours)
- Issues Detected: 2 (SEO drop, low inventory)
- Satisfaction: 8/10 ✅ (Target: ≥8)

### Week X+1 Plan
- Ship: Tile reordering, mobile optimization
- Focus: Performance improvements
- Goal: Maintain 8/10 satisfaction

Questions? Reply to this email or ping @product in Slack.
```

---

## Implementation Steps

### Step 1: Data Team - Analytics Views (4 hours)

Create Supabase views for metrics:
```sql
-- Weekly usage summary
CREATE VIEW v_weekly_usage AS
SELECT 
  DATE_TRUNC('week', login_at) as week,
  COUNT(DISTINCT DATE(login_at)) as login_days,
  COUNT(DISTINCT session_id) as sessions,
  AVG(session_duration_seconds) / 60.0 as avg_minutes
FROM dashboard_sessions
WHERE customer_id = 'hot-rodan'
GROUP BY DATE_TRUNC('week', login_at);

-- Tile engagement summary  
CREATE VIEW v_tile_engagement AS
SELECT 
  tile_name,
  COUNT(*) as interactions,
  COUNT(DISTINCT session_id) as sessions
FROM tile_interactions
WHERE customer_id = 'hot-rodan'
GROUP BY tile_name
ORDER BY interactions DESC;
```

---

### Step 2: Engineer - Dashboard UI (8 hours)

Build `/dashboard/metrics` route:
- Overview tab (summary cards + 4 charts)
- Usage tab (6 charts + filters)
- Performance tab (4 charts + alerts)
- Value tab (4 charts + ROI calculation)
- Satisfaction tab (4 charts + feedback log)

**Tech Stack**: React, Recharts (charts), Supabase (data)

---

### Step 3: Product - Weekly Reporting (2 hours)

Set up automated weekly email:
- Query data from Supabase views
- Generate email template
- Send via SendGrid or similar
- Schedule: Every Monday 9am ET

---

## Success Criteria

### Dashboard Quality

- [ ] All 15 metrics tracked and displayed
- [ ] Charts render correctly (desktop + mobile)
- [ ] Data updates in real-time or near-real-time
- [ ] Filters work correctly
- [ ] No performance issues (<2s load)

### Weekly Reporting

- [ ] Email sent automatically every Monday
- [ ] Data accurate (matches dashboard)
- [ ] Format readable and actionable
- [ ] CEO finds it useful (satisfaction feedback)

### Actionability

- [ ] CEO can identify trends from charts
- [ ] CEO can spot issues (red alerts)
- [ ] CEO can track progress week-over-week
- [ ] CEO uses metrics to make decisions

---

## Next Steps

**Immediate** (Week 2):
1. Data Team: Create analytics views (4 hours)
2. Engineer: Build metrics dashboard UI (8 hours)
3. Product: Set up weekly email reporting (2 hours)
4. QA: Test dashboard functionality (2 hours)

**Ongoing** (Week 3+):
1. Product: Monitor metrics weekly
2. Product: Send weekly email to CEO
3. Product: Review metrics in Friday team meeting
4. Product: Iterate based on CEO feedback

---

**Confidence**: HIGH - Comprehensive metrics dashboard ready for implementation

---

**Evidence**:
- Success metrics dashboard spec: `docs/product/success_metrics_dashboard_spec_hot_rodan.md`
- Metrics defined: 15 metrics across 4 categories
- Data sources: Analytics tables, Fly.io, CEO surveys
- Dashboard layout: 5 tabs with charts and cards
- Weekly reporting: Automated email template
- Implementation steps: Data (4h), Engineer (8h), Product (2h)
- Success criteria: Quality, reporting, actionability

**Timestamp**: 2025-10-14T01:15:00Z
