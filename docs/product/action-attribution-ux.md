# Action Attribution UX Specification

**Owner**: Product Agent  
**Beneficiary**: Analytics Agent  
**Created**: 2025-10-21  
**Version**: 1.0  
**Status**: Final

---

## Overview

This document defines the user experience for **Action Attribution** - how operators see and understand the performance of approved actions through GA4 tracking and revenue attribution.

**Goal**: Enable operators to make data-driven decisions by showing realized ROI vs expected ROI for approved actions.

---

## User Persona

**Operator (CEO/Manager)**:
- Reviews Action Queue daily
- Approves 3-5 actions per week
- Wants to see: "Did this action actually increase revenue?"
- Needs quick answers: "Should I approve more actions like this?"

---

## UX Principles

1. **Show Impact First**: Revenue numbers are the primary metric
2. **Time-Based Views**: 7d/14d/28d windows for different action types
3. **Comparison is Key**: Expected vs Realized revenue side-by-side
4. **Visual Clarity**: Green = outperforming, Yellow = meeting expectations, Red = underperforming
5. **Drill-Down Available**: Summary → Details → Raw GA4 data

---

## 1. Action Card Attribution Badge

**Location**: Action Queue list view (inline with each action)

**When Shown**: 
- After action is approved AND 7 days have passed
- Updates daily with latest attribution data

### Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│ Add size chart to Powder Snowboard                          │
│ Content · Approved Oct 15 · #123                            │
│                                                              │
│ Expected Revenue: $350 (7 inquiries × $50)                  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📊 Last 7 Days: +$420 revenue (120% of expected) ✅   │  │
│ │ 📈 Trend: ↑ 8% conversions, ↓ 6 support tickets      │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [View Full Attribution] [Mark as Success] [Archive]         │
└─────────────────────────────────────────────────────────────┘
```

### Badge States

**1. Outperforming (Green)**
- Realized > 110% of Expected
- Icon: ✅
- Color: Green badge
- Example: "Last 7 Days: +$420 (120% of expected)"

**2. Meeting Expectations (Yellow)**
- Realized 90-110% of Expected
- Icon: ✓
- Color: Yellow/amber badge
- Example: "Last 7 Days: +$330 (94% of expected)"

**3. Underperforming (Red)**
- Realized < 90% of Expected
- Icon: ⚠️
- Color: Red badge
- Example: "Last 7 Days: +$210 (60% of expected)"

**4. Too Early (Gray)**
- Less than 7 days since approval
- Icon: ⏳
- Color: Gray badge
- Example: "Attribution starts Oct 22 (3 days left)"

---

## 2. Action Performance Dashboard

**Location**: New route `/dashboard/actions/performance`

**Purpose**: Summary view of all approved actions with attribution data

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Action Performance Dashboard                                    │
│                                                                 │
│ Time Window: [7 Days] [14 Days] [28 Days] [All Time]          │
│ Filter: [All Types ▾] [All Status ▾] [All Performance ▾]      │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Summary (Last 7 Days)                                       │ │
│ │                                                             │ │
│ │ Total Actions with Data: 12                                │ │
│ │ Total Realized Revenue: $8,450                             │ │
│ │ Total Expected Revenue: $7,200                             │ │
│ │ Overall Performance: 117% ✅                                │ │
│ │                                                             │ │
│ │ Outperforming: 8 (67%) | Meeting: 3 (25%) | Under: 1 (8%) │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Top Performing Actions                                      │ │
│ │                                                             │ │
│ │ 1. Size chart - Powder Snowboard                           │ │
│ │    Expected: $350 | Realized: $520 | ROI: 149% ✅         │ │
│ │    [View Details]                                          │ │
│ │                                                             │ │
│ │ 2. Warranty info - Carbon Bindings                         │ │
│ │    Expected: $250 | Realized: $340 | ROI: 136% ✅         │ │
│ │    [View Details]                                          │ │
│ │                                                             │ │
│ │ 3. Installation guide - Roof Rack                          │ │
│ │    Expected: $200 | Realized: $245 | ROI: 123% ✅         │ │
│ │    [View Details]                                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Needs Attention (Underperforming)                          │ │
│ │                                                             │ │
│ │ 1. Dimensions - Cargo Box                                  │ │
│ │    Expected: $200 | Realized: $110 | ROI: 55% ⚠️          │ │
│ │    [View Details] [Mark for Review]                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Filters & Sorting

**Time Windows**:
- 7 Days (default for content actions)
- 14 Days (for SEO actions - longer attribution window)
- 28 Days (for product update actions)
- All Time (historical view)

**Performance Filter**:
- All (default)
- Outperforming (>110%)
- Meeting expectations (90-110%)
- Underperforming (<90%)
- Too early (no data yet)

**Action Type Filter**:
- All
- Content
- SEO
- Product Update

**Sort Options**:
- ROI % (highest first) - default
- Realized revenue (highest first)
- Approval date (newest first)
- Name (A-Z)

---

## 3. Detailed Action Attribution View

**Location**: Expand from Action Card or Dashboard

**Trigger**: Click "View Full Attribution" or action name

### Content

```
┌─────────────────────────────────────────────────────────────────┐
│ Action Attribution: Size Chart - Powder Snowboard               │
│ Action #123 · Approved Oct 15, 2025 · Type: Content            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Performance Summary (Last 7 Days)                               │
│                                                                 │
│ Expected Revenue:    $350                                       │
│ Realized Revenue:    $520                                       │
│ Performance:         149% (Outperforming ✅)                    │
│ Variance:            +$170 above expectations                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Attribution Breakdown                                           │
│                                                                 │
│ GA4 Tracked Conversions: 8 purchases                           │
│ Attributed Revenue: $520 (8 × avg $65)                         │
│ Attribution Method: GA4 custom dimension "action_id=123"       │
│                                                                 │
│ Traffic Sources (for attributed conversions):                  │
│ • Organic Search: 5 purchases ($325)                           │
│ • Direct: 2 purchases ($130)                                   │
│ • Social: 1 purchase ($65)                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Daily Trend (Last 7 Days)                                       │
│                                                                 │
│ Oct 15  Oct 16  Oct 17  Oct 18  Oct 19  Oct 20  Oct 21        │
│   $0     $65    $130    $130     $65     $65     $65          │
│                                                                 │
│ [Bar chart showing daily revenue]                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Secondary Metrics                                               │
│                                                                 │
│ Product Page Views: ↑ 15% vs previous 7 days                  │
│ Add to Cart Rate: ↑ 8% vs previous 7 days                     │
│ Bounce Rate: ↓ 3% vs previous 7 days                          │
│ Avg Time on Page: ↑ 12 seconds vs previous 7 days             │
│                                                                 │
│ Customer Support Impact:                                        │
│ • Size chart inquiries: ↓ 6 tickets vs previous 7 days        │
│ • Return rate: No change (not enough time)                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Raw GA4 Data (for debugging)                                   │
│                                                                 │
│ Custom Dimension: action_approved_id                           │
│ Dimension Value: 123                                           │
│ Tracking Period: Oct 15 - Oct 21                              │
│ Total Events: 247 (pageviews, add_to_cart, purchase)          │
│                                                                 │
│ [Export to CSV] [View in GA4]                                  │
└─────────────────────────────────────────────────────────────────┘

[Close] [Mark as Success Story] [Share with Team]
```

---

## 4. Action Ranking UI

**Location**: Action Queue filters and sorting

**Purpose**: Help operators prioritize future approvals based on historical performance

### Ranking Logic

**High-Performing Action Types** (shown at top):
- Action types with >120% average ROI across past actions
- Example: "Content - Size Chart" has 4 past actions, avg 135% ROI
- Badge: 🏆 "High Performer"

**Medium-Performing Action Types**:
- 90-120% average ROI
- Badge: ✓ "Proven"

**Low-Performing Action Types**:
- <90% average ROI
- Badge: ⚠️ "Needs Review"

**Unproven Action Types**:
- No historical data (new action type)
- Badge: 🆕 "New"

### Visual Example

```
┌─────────────────────────────────────────────────────────────────┐
│ Pending Actions (Sorted by Expected Performance)               │
│                                                                 │
│ 🏆 Add size chart to Carbon Skis                               │
│    Type: Content - Size Chart (Avg ROI: 135% from 4 actions)  │
│    Expected Revenue: $300                                       │
│    [Approve] [Review]                                          │
│                                                                 │
│ ✓ Add warranty info to Helmets                                 │
│    Type: Content - Warranty (Avg ROI: 105% from 2 actions)    │
│    Expected Revenue: $150                                       │
│    [Approve] [Review]                                          │
│                                                                 │
│ 🆕 Add video tutorial to Wax Kit                               │
│    Type: Content - Video (No historical data)                  │
│    Expected Revenue: $180                                       │
│    [Approve] [Review]                                          │
│                                                                 │
│ ⚠️ Add FAQ to Boots                                            │
│    Type: Content - FAQ (Avg ROI: 75% from 3 actions)          │
│    Expected Revenue: $120                                       │
│    [Approve] [Review]                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. GA4 Custom Dimension Visualization

**Location**: Integrated into Action Attribution views

**GA4 Custom Dimension**: `action_approved_id`

### How It Works

1. **Action Approved**: Operator approves Action #123
2. **Content Implemented**: Content agent adds size chart with tracking
3. **Page Tag Updated**: Product page includes:
   ```javascript
   gtag('event', 'page_view', {
     'action_approved_id': '123'
   });
   ```
4. **Conversions Tracked**: All events (pageview, add_to_cart, purchase) on that page include `action_approved_id: 123`
5. **GA4 Queries**: Analytics service queries GA4 for all purchases with `action_approved_id=123` in last 7/14/28 days
6. **Revenue Attribution**: Sum of purchase values = Realized Revenue

### Operator-Facing Visualization

**In Attribution View**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Attribution Method: GA4 Custom Dimension                        │
│                                                                 │
│ Tracking Code: action_approved_id = 123                        │
│ Tracking Status: ✅ Active (verified Oct 15)                   │
│                                                                 │
│ GA4 Query:                                                      │
│ • Event: purchase                                              │
│ • Dimension: action_approved_id = 123                          │
│ • Date Range: Oct 15 - Oct 21 (7 days)                        │
│ • Result: 8 purchases, $520 revenue                            │
│                                                                 │
│ [Refresh Data] [View in GA4 Dashboard]                         │
└─────────────────────────────────────────────────────────────────┘
```

**Data Freshness Indicator**:
```
Last Updated: Oct 21, 2025 at 11:45 PM (GA4 sync)
Next Update: Oct 22, 2025 at 12:00 AM (daily refresh)

[Refresh Now]
```

---

## 6. Mobile Experience

**Simplified views for mobile operators**:

### Action Card Badge (Mobile)

```
┌─────────────────────────────────┐
│ Size chart - Powder Snowboard  │
│ Content · Oct 15 · #123         │
│                                 │
│ 📊 7d: +$420 (120%) ✅         │
│                                 │
│ [Details]                       │
└─────────────────────────────────┘
```

### Performance Dashboard (Mobile)

```
┌─────────────────────────────────┐
│ Performance (7 Days)            │
│                                 │
│ 12 Actions                      │
│ $8,450 Realized                 │
│ 117% of Expected ✅             │
│                                 │
│ [Top Performers ▾]              │
│ [Needs Attention ▾]             │
└─────────────────────────────────┘
```

---

## 7. Notification Strategy

**When to Notify Operator**:

1. **7 Days After Approval** (first attribution data available):
   - Email: "Action #123 has 7-day performance data: +$420 (120% of expected) ✅"

2. **Underperforming Actions** (after 7 days, if <90% expected):
   - Dashboard notification: "Action #125 is underperforming (60% of expected). Review?"

3. **Weekly Summary** (every Monday):
   - Email: "Last week's approved actions: 3 outperforming, 1 underperforming"

---

## 8. Data Requirements (for Analytics Agent)

**API Endpoints Needed**:

1. `GET /api/actions/:id/attribution`
   - Returns: realized revenue, expected revenue, performance %, time period
   
2. `GET /api/actions/performance-summary`
   - Returns: aggregate stats for all actions (by time period)
   
3. `GET /api/actions/ranked`
   - Returns: actions sorted by performance (for ranking UI)
   
4. `POST /api/actions/:id/refresh-attribution`
   - Triggers immediate GA4 data refresh for action

**Data Freshness**:
- Attribution data refreshes: Daily at midnight (via nightly job)
- On-demand refresh: Available via "Refresh Now" button (rate limited to 1/hour)

**GA4 Integration**:
- Custom dimension: `action_approved_id` (dimension index: to be configured)
- Query frequency: Daily batch job + on-demand
- Data retention: 90 days (GA4 default)

---

## 9. Edge Cases & Error States

**No Attribution Data Yet**:
```
┌─────────────────────────────────────────┐
│ ⏳ Attribution data not available yet   │
│                                         │
│ This action was approved Oct 21.        │
│ Attribution tracking starts Oct 22.     │
│                                         │
│ Check back in 7 days for first data.   │
└─────────────────────────────────────────┘
```

**GA4 Connection Error**:
```
┌─────────────────────────────────────────┐
│ ⚠️ Unable to fetch attribution data     │
│                                         │
│ GA4 connection error. Last successful   │
│ sync: Oct 20, 2025 at 11:45 PM         │
│                                         │
│ [Retry] [Contact Support]              │
└─────────────────────────────────────────┘
```

**No Conversions Tracked**:
```
┌─────────────────────────────────────────┐
│ 📊 Last 7 Days: $0 revenue (0%)        │
│                                         │
│ No purchases tracked with this action. │
│ This could mean:                        │
│ • Not enough time has passed            │
│ • Product has low traffic               │
│ • Action needs more visibility          │
│                                         │
│ [View Product Analytics]                │
└─────────────────────────────────────────┘
```

---

## 10. Success Metrics (for Product)

**UX Quality Metrics**:
- Operator uses attribution data to make approval decisions (measured by clicks on "View Full Attribution")
- Operator confidence in approving actions increases (survey)
- Operator can answer "Did this work?" in <30 seconds

**Business Metrics** (Analytics team):
- Attribution tracking accuracy: >95% of approved actions have GA4 data
- Data freshness: <24 hours from event to dashboard
- Performance insights lead to 20% increase in high-ROI action approvals

---

## 11. Implementation Priority

**Phase 1 (MVP)** - Week 1:
1. Action Card Attribution Badge (basic)
2. 7-day attribution data only
3. Simple performance summary

**Phase 2** - Week 2:
4. Performance Dashboard
5. 14-day and 28-day windows
6. Ranking UI

**Phase 3** - Week 3:
7. Detailed attribution view
8. GA4 data export
9. Mobile optimization

---

## Analytics Agent Implementation Notes

**What Analytics Needs to Build**:
1. GA4 custom dimension setup (coordinate with DevOps for GA4 property)
2. Nightly attribution job (query GA4, update DashboardFact)
3. API endpoints for attribution data
4. Attribution calculation logic (realized vs expected)

**What Engineer Needs to Build**:
1. UI components for attribution badges
2. Performance dashboard page
3. Detailed attribution modal
4. Filters and sorting

**What Content Needs to Do**:
1. Add GA4 tracking code to content updates (include `action_approved_id`)
2. Verify tracking is working after content implementation

---

## Change Log

**v1.0 - 2025-10-21**:
- Initial UX specification
- Defined all major views (Action Card, Dashboard, Detail)
- Specified GA4 custom dimension visualization
- Defined ranking UI and notification strategy

---

**Status**: Ready for Analytics Agent implementation  
**Next Step**: Analytics agent implements API endpoints and GA4 integration

