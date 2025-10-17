# Dashboard Usage Analytics Framework

**Version**: 1.0
**Date**: October 12, 2025
**Customer**: Hot Rodan (Pilot)
**Owner**: Product Agent
**Purpose**: Define metrics to track dashboard usage, create measurement plan, set up tracking requirements

---

## Overview

**Goal**: Understand how Hot Rodan uses HotDash to prove value and identify improvements

**Why Analytics Matter**:

- Prove ROI (time saved, faster decisions)
- Identify which features are valuable (double down)
- Spot friction points (fix quickly)
- Make data-driven product decisions

---

## Core Metrics to Track

### Category 1: Engagement Metrics

#### 1.1 Login Frequency

**Definition**: Days per week CEO/team logs into dashboard

**Why**: Indicates habit formation and product stickiness

**How to Track**:

```sql
SELECT
  user_id,
  user_name,
  COUNT(DISTINCT DATE(login_at)) as login_days,
  COUNT(DISTINCT WEEK(login_at)) as weeks_active
FROM user_logins
WHERE customer_id = 'hot-rodan'
  AND login_at >= '2025-10-15'
GROUP BY user_id, user_name;
```

**Target**: CEO ≥5 days/week by Week 2

**Dashboard Viz**:

```
CEO Login Pattern (Week 3)
Mon Tue Wed Thu Fri Sat Sun
 ✅  ✅  ✅  ❌  ✅  ✅  ✅  (6/7 days)

Target: ≥5 days/week ✅
```

---

#### 1.2 Session Duration

**Definition**: Time spent per session

**Why**: Indicates efficiency (too short = not using, too long = struggling)

**How to Track**:

```sql
SELECT
  user_id,
  AVG(TIMESTAMPDIFF(MINUTE, login_at, logout_at)) as avg_minutes,
  MIN(TIMESTAMPDIFF(MINUTE, login_at, logout_at)) as min_minutes,
  MAX(TIMESTAMPDIFF(MINUTE, login_at, logout_at)) as max_minutes
FROM user_sessions
WHERE customer_id = 'hot-rodan'
  AND login_at >= '2025-10-15'
GROUP BY user_id;
```

**Target**: 2-10 minutes (efficient quick checks)

**Red Flags**:

- <1 min: Not actually using it
- > 15 min: Dashboard too complex or has issues

---

#### 1.3 Session Frequency

**Definition**: Number of sessions per day

**Why**: Multiple sessions = checking throughout day (mobile usage)

**How to Track**:

```sql
SELECT
  DATE(login_at) as date,
  user_id,
  COUNT(*) as sessions_per_day
FROM user_sessions
WHERE customer_id = 'hot-rodan'
GROUP BY DATE(login_at), user_id;
```

**Target**: 1-3 sessions/day (morning check + periodic checks)

---

### Category 2: Feature Usage Metrics

#### 2.1 Tile Click Patterns

**Definition**: Which tiles are used most

**Why**: Tells us what's valuable, what's ignored

**How to Track**:

```sql
SELECT
  tile_name,
  COUNT(*) as total_clicks,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT DATE(clicked_at)) as days_used
FROM tile_clicks
WHERE customer_id = 'hot-rodan'
  AND clicked_at >= '2025-10-15'
GROUP BY tile_name
ORDER BY total_clicks DESC;
```

**Dashboard Viz**:

```
Most-Used Tiles (Month 1)
1. Sales Pulse       ████████████ 245 clicks
2. Inventory Alerts  ████████ 178 clicks
3. Ops Pulse         ██████ 134 clicks
4. Top Products      ████ 89 clicks
5. Customer Mood     ██ 45 clicks
```

**Insight**: Tiles with <10 clicks in 2 weeks → Not valuable, consider removing

---

#### 2.2 Approval Queue Usage

**Definition**: Approvals processed, turnaround time

**Why**: Core workflow, measures CEO efficiency gains

**How to Track**:

```sql
SELECT
  COUNT(*) as total_approvals,
  COUNT(DISTINCT DATE(created_at)) as days_used,
  AVG(TIMESTAMPDIFF(MINUTE, created_at, approved_at)) as avg_minutes,
  SUM(CASE WHEN decision = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN decision = 'denied' THEN 1 ELSE 0 END) as denied_count
FROM approval_queue
WHERE customer_id = 'hot-rodan'
  AND created_at >= '2025-10-15'
  AND approved_at IS NOT NULL;
```

**Target**: <60 min turnaround (vs 2-4 hours before)

**Dashboard Viz**:

```
Approval Queue Performance
Total Approvals: 23
Avg Turnaround: 18 minutes ⚡
  Before HotDash: ~3 hours
  Improvement: 10x faster!

Decisions:
  Approved: 21 (91%)
  Denied: 2 (9%)
```

---

#### 2.3 Mobile vs Desktop Usage

**Definition**: Device type breakdown

**Why**: Mobile usage = on-the-go value

**How to Track**:

```sql
SELECT
  device_type,
  COUNT(*) as sessions,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM user_sessions
WHERE customer_id = 'hot-rodan'
  AND login_at >= '2025-10-15'
GROUP BY device_type;
```

**Target**: ≥20% mobile usage

**Dashboard Viz**:

```
Device Usage
Desktop: 68% (41 sessions)
Mobile:  32% (19 sessions) ✅

Mobile Usage Trend:
Week 1: 15%
Week 2: 28%
Week 3: 35% 📈
Week 4: 42% 📈
```

---

### Category 3: Impact Metrics

#### 3.1 Time Savings

**Definition**: Minutes saved per workflow vs manual process

**How to Calculate**:

```
Manual Workflow:
- Daily Shopify check: 30 min
- Weekly reports: 120 min (2 hours)
- Approval delays: 60 min

HotDash Workflow:
- Daily dashboard check: 2 min
- Weekly reports: 0 min (auto-generated)
- Approval delays: 0 min (queue)

Daily savings: 30 - 2 = 28 min
Weekly savings: (28 × 7) + 120 + 60 = 376 min = 6.3 hours
```

**Data Sources**:

- Session duration (actual dashboard time)
- CEO self-reported (weekly check-ins)

**Target**: ≥5 hours/week saved

---

#### 3.2 Inventory Alerts Acted Upon

**Definition**: Alerts that led to action (reorders)

**Why**: Proves inventory alert value, prevents stock-outs

**How to Track**:

```sql
SELECT
  alert_id,
  product_name,
  alert_triggered_at,
  action_taken,
  action_taken_at,
  TIMESTAMPDIFF(MINUTE, alert_triggered_at, action_taken_at) as response_minutes
FROM inventory_alerts
WHERE customer_id = 'hot-rodan'
  AND alert_triggered_at >= '2025-10-15'
  AND action_taken IS NOT NULL;
```

**Dashboard Viz**:

```
Inventory Alerts Impact
Alerts Triggered: 12
Acted Upon: 8 (67%)
  - Reordered: 6
  - Checked manually: 2
Ignored: 4 (33%)

Stock-Outs Prevented: 2
Est. Lost Sales Prevented: $5,200 💰

Avg Response Time: 4.2 hours
  (Before: Days or not noticed)
```

---

#### 3.3 Customer Satisfaction Correlation

**Definition**: Customer sentiment trend during pilot

**Why**: Faster decisions → happier customers

**How to Track**:

```sql
SELECT
  WEEK(created_at) as week_num,
  SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pct_positive,
  AVG(response_time_minutes) as avg_response_time
FROM support_tickets
WHERE customer_id = 'hot-rodan'
  AND created_at >= '2025-10-15'
GROUP BY WEEK(created_at);
```

**Target**: Maintain or improve (≥80% positive)

---

### Category 4: Product Quality Metrics

#### 4.1 Error Rate

**Definition**: Errors per session

**Why**: Too many errors = CEO loses trust

**How to Track**:

```sql
SELECT
  DATE(error_at) as date,
  error_type,
  COUNT(*) as error_count
FROM error_logs
WHERE customer_id = 'hot-rodan'
  AND error_at >= '2025-10-15'
GROUP BY DATE(error_at), error_type
ORDER BY date DESC, error_count DESC;
```

**Target**: <1 error per 100 sessions (0.01 error rate)

**Red Flag**: >5 errors per 100 sessions (0.05 rate)

---

#### 4.2 Load Time

**Definition**: Time for dashboard to fully load

**Why**: Slow dashboard = CEO won't use it

**How to Track**:

```sql
SELECT
  AVG(load_time_ms) as avg_load_time,
  MAX(load_time_ms) as max_load_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY load_time_ms) as p95_load_time
FROM page_load_metrics
WHERE customer_id = 'hot-rodan'
  AND page = 'dashboard'
  AND loaded_at >= '2025-10-15';
```

**Target**: <2 seconds (2000ms) p95

**Red Flag**: >5 seconds (CEO will complain)

---

#### 4.3 Data Freshness

**Definition**: How often data syncs

**Why**: Stale data = CEO loses trust

**How to Track**:

```sql
SELECT
  data_source,
  MAX(last_synced_at) as most_recent_sync,
  TIMESTAMPDIFF(MINUTE, MAX(last_synced_at), NOW()) as minutes_since_sync
FROM data_sync_log
WHERE customer_id = 'hot-rodan'
GROUP BY data_source;
```

**Target**: Sync every 5-15 minutes

**Red Flag**: >1 hour since last sync

---

## Measurement Plan

### Phase 1: Data Collection Setup (Pre-Pilot)

**Week of Oct 7-11**:

- [ ] Instrument dashboard with tracking events
- [ ] Set up database tables for analytics
- [ ] Create data pipeline (events → database)
- [ ] Build initial analytics queries
- [ ] Test tracking with dev account

**Events to Track**:

```javascript
// User events
trackEvent("user_login", { user_id, device_type });
trackEvent("user_logout", { user_id, session_duration });

// Tile events
trackEvent("tile_click", { user_id, tile_name });
trackEvent("tile_view", { user_id, tile_name, duration });

// Approval events
trackEvent("approval_opened", { approval_id, user_id });
trackEvent("approval_decided", { approval_id, decision, turnaround_time });

// Navigation events
trackEvent("page_view", { page, load_time });

// Error events
trackEvent("error", { error_type, error_message, context });
```

---

### Phase 2: Daily Monitoring (During Pilot)

**Every Day (9 AM)**:

```bash
# Run daily analytics report
npm run pilot:analytics:daily --customer=hot-rodan

# Output includes:
# - Yesterday's login count
# - Session durations
# - Most-used tiles
# - Errors logged
# - Load time p95
```

**Dashboard to Monitor**:

```
Hot Rodan - Daily Usage (Oct 15)
================================
Logins: 3 (CEO: 2, Ops: 1)
Avg Session: 4.2 min
Most-Used Tile: Sales Pulse (12 clicks)
Errors: 0 ✅
Load Time: 1.8s ✅
```

**Alert Conditions**:

- Zero logins for 2 consecutive days → Slack alert
- Error rate >5% → Investigate immediately
- Load time >5s → Performance issue

---

### Phase 3: Weekly Analysis (Fridays)

**Friday Before Check-In Call**:

```bash
# Run weekly analytics report
npm run pilot:analytics:weekly --customer=hot-rodan --week=1

# Output includes:
# - Week's engagement summary
# - Tile usage breakdown
# - Approval queue stats
# - Time savings calculation
# - Week-over-week trends
```

**Use in Weekly Check-In**:

- Share metrics with CEO
- Validate with CEO's perception
- Discuss patterns (which tiles most useful?)
- Identify areas for improvement

---

### Phase 4: Monthly Review (End of Pilot)

**After Week 4**:

```bash
# Run final pilot report
npm run pilot:analytics:final --customer=hot-rodan

# Comprehensive report:
# - 4-week summary
# - Engagement trends
# - Feature usage analysis
# - Impact metrics (time saved, stock-outs prevented)
# - ROI calculation
# - Go/no-go recommendation
```

**Deliverable**: `Hot Rodan Pilot Results Report`

---

## Tracking Implementation Requirements

### Frontend Instrumentation

**React Component Example**:

```typescript
import { trackEvent } from '@/lib/analytics';

export function SalesPulseTile() {
  const handleClick = () => {
    trackEvent('tile_click', {
      tile_name: 'sales_pulse',
      user_id: currentUser.id,
      timestamp: new Date()
    });
    // Navigate to detail view
  };

  return (
    <Tile onClick={handleClick}>
      <h2>Sales Pulse</h2>
      {/* ... */}
    </Tile>
  );
}
```

---

### Backend API

**Analytics Endpoint**:

```typescript
// POST /api/analytics/track
interface TrackEventRequest {
  event_name: string;
  user_id: string;
  customer_id: string;
  properties: Record<string, any>;
  timestamp: Date;
}

// Store in database
await db.events.create({
  event_name: req.event_name,
  user_id: req.user_id,
  customer_id: req.customer_id,
  properties: JSON.stringify(req.properties),
  tracked_at: req.timestamp,
});
```

---

### Database Schema

```sql
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(100),
  user_id VARCHAR(100),
  customer_id VARCHAR(100),
  properties JSONB,
  tracked_at TIMESTAMP,
  INDEX idx_customer_event (customer_id, event_name),
  INDEX idx_tracked_at (tracked_at)
);

CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  customer_id VARCHAR(100),
  login_at TIMESTAMP,
  logout_at TIMESTAMP,
  device_type VARCHAR(50),
  session_duration_minutes INTEGER,
  INDEX idx_customer_user (customer_id, user_id)
);

CREATE TABLE tile_clicks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  customer_id VARCHAR(100),
  tile_name VARCHAR(100),
  clicked_at TIMESTAMP,
  INDEX idx_customer_tile (customer_id, tile_name)
);

CREATE TABLE approval_queue_analytics (
  approval_id VARCHAR(100) PRIMARY KEY,
  customer_id VARCHAR(100),
  created_at TIMESTAMP,
  approved_at TIMESTAMP,
  decision VARCHAR(50),
  turnaround_minutes INTEGER
);
```

---

## Analytics Dashboard Design

### View 1: Engagement Overview

```
┌──────────────────────────────────────────────┐
│ Hot Rodan - Engagement (Week 3)              │
├──────────────────────────────────────────────┤
│ Login Frequency:  6/7 days ✅                 │
│ Avg Session:      4.2 min                    │
│ Sessions/Day:     1.8 avg                    │
│ Mobile Usage:     35%                        │
│                                              │
│ Week-over-Week Trend:                        │
│ Week 1: 3/7 days (43%)                       │
│ Week 2: 5/7 days (71%)                       │
│ Week 3: 6/7 days (86%) ✅                     │
│                                              │
│ Status: Strong engagement, habit formed ✅    │
└──────────────────────────────────────────────┘
```

---

### View 2: Feature Usage

```
┌──────────────────────────────────────────────┐
│ Feature Usage Heatmap (Month 1)             │
├──────────────────────────────────────────────┤
│ Sales Pulse       ████████████ 245 clicks   │
│ Inventory Alerts  ████████ 178 clicks       │
│ Ops Pulse         ██████ 134 clicks         │
│ Top Products      ████ 89 clicks            │
│ Customer Mood     ██ 45 clicks              │
│ Order Status      █ 23 clicks               │
│                                              │
│ Approval Queue:   23 approvals              │
│ Avg Turnaround:   18 minutes ⚡              │
│                                              │
│ Insight: Core 3 tiles are heavily used ✅    │
│ Action: Consider removing Order Status      │
└──────────────────────────────────────────────┘
```

---

### View 3: Impact Metrics

```
┌──────────────────────────────────────────────┐
│ Business Impact (Month 1)                   │
├──────────────────────────────────────────────┤
│ Time Savings:                                │
│ • Per Week: 5.8 hours                       │
│ • Total (4 weeks): 23.2 hours               │
│ • ROI: $580/month ($25/hr × 23.2)           │
│                                              │
│ Inventory Impact:                            │
│ • Alerts Acted On: 8/12 (67%)               │
│ • Stock-Outs Prevented: 2                   │
│ • Lost Sales Prevented: $5,200              │
│                                              │
│ Customer Satisfaction:                       │
│ • Before: 80% positive                      │
│ • After: 84% positive (+4%)                 │
│ • Faster decisions → happier customers ✅    │
│                                              │
│ Total Value: $5,780 in Month 1 💰            │
└──────────────────────────────────────────────┘
```

---

## Reporting Cadence

### Daily (Automated)

- Email digest to Product team
- Key metrics: logins, errors, load time
- Alerts if thresholds breached

### Weekly (Manual + Auto)

- Comprehensive report before Friday check-in
- Share with CEO during call
- Log qualitative feedback alongside quantitative

### Monthly (End of Pilot)

- Final comprehensive report
- ROI calculation
- Go/no-go recommendation
- Presentation to Manager

---

**Document Path**: `docs/pilot/analytics-framework.md`  
**Owner**: Product Agent  
**Status**: ✅ Ready for Hot Rodan pilot tracking implementation  
**Next**: Set up tracking instrumentation before Oct 15 launch
