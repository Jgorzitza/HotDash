# Agent Performance Dashboard Design

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Status**: Design Specification - Ready for Implementation

---

## Executive Summary

This document specifies the operator-facing dashboard for monitoring Agent SDK performance metrics in real-time. The dashboard provides visibility into approval rates, response times, accuracy, and system health to enable data-driven optimization.

**Design Philosophy**: Operator-first, actionable insights, no information overload

---

## Dashboard Overview

### Primary Users

1. **Operators**: Real-time view of their own performance with Agent SDK
2. **Team Leads**: Aggregate team metrics and performance trends
3. **Manager**: Strategic overview and decision-making metrics
4. **Engineering**: System health and technical performance

### Access Levels

- **Operator View**: Personal metrics only, tips for improvement
- **Lead View**: Team aggregates, individual comparisons, coaching insights
- **Manager View**: Full system metrics, ROI tracking, strategic KPIs
- **Engineering View**: Technical metrics, error logs, performance bottlenecks

---

## Dashboard Layout

### Operator Dashboard (Primary View)

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Your Performance Today                    [Last 7 days ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐│
│ │📊 Drafts   │ │✅ Approval │ │⚡ Avg Time│ │😊 Your   ││
│ │ Reviewed   │ │  Rate      │ │ to Review │ │  Rating  ││
│ │            │ │            │ │           │ │          ││
│ │    24      │ │    68%     │ │  1.2 min  │ │  4.5/5   ││
│ │  ↑ +8 (50%)│ │  ↑ +12%    │ │  ↓ -0.3   │ │  ↑ +0.2  ││
│ └────────────┘ └────────────┘ └────────────┘ └───────────┘│
│                                                             │
│ 🎯 Quick Stats                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Approved (no edits):    16 (68%)  [████████████░░] 68% ││
│ │ Edited & Approved:       7 (29%)  [████░░░░░░░░░░]  29% ││
│ │ Escalated:               1 (4%)   [░░░░░░░░░░░░░░]   4% ││
│ │ Rejected:                0 (0%)   [░░░░░░░░░░░░░░]   0% ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ 💡 Tips for You                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🌟 Great job! Your approval rate is above team average  ││
│ │ 💪 Try using quick templates to speed up edits          ││
│ │ 🎓 Check out the new sentiment analysis feature         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ 📈 Trend (Last 7 Days)                                      │
│ [Line chart: Approval rate over time]                      │
│                                                             │
│ 🏆 Leaderboard (Optional - Gamification)                    │
│ 1. Marcus - 95 drafts reviewed (You: #3)                   │
│ 2. Sarah - 87 drafts reviewed                              │
│ 3. You - 78 drafts reviewed                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Performance Indicators (KPIs)

### Primary KPIs (Always Visible)

#### 1. Drafts Reviewed

**What**: Total number of AI drafts reviewed today
**Why Important**: Measures productivity and engagement
**Target**: 15-20 per day (per operator)
**Alert Threshold**: <10 (low engagement) or >30 (possible burnout)
**Visualization**: Large number with trend arrow

#### 2. Approval Rate

**What**: Percentage of drafts approved without edits
**Why Important**: Measures AI accuracy and operator trust
**Target**: 60-75%
**Alert Threshold**: <40% (poor AI quality) or >90% (operators not reviewing carefully)
**Visualization**: Percentage with trend indicator
**Color Coding**:

- Green: >60%
- Yellow: 40-60%
- Red: <40%

#### 3. Average Time to Review

**What**: Average seconds spent reviewing each draft
**Why Important**: Measures efficiency without sacrificing quality
**Target**: 60-90 seconds
**Alert Threshold**: <30s (rushing) or >3 min (struggling)
**Visualization**: Time in minutes/seconds with trend
**Benchmark**: Show team average for comparison

#### 4. Operator Rating

**What**: How operators rate their experience with Agent SDK today
**Why Important**: Job satisfaction and tool effectiveness
**Target**: 4.0-5.0 out of 5
**Alert Threshold**: <3.5 (dissatisfaction)
**Visualization**: Star rating with trend
**Collection**: Quick thumbs up/down or star rating at end of shift

### Secondary KPIs (Expandable Section)

#### 5. Edit Rate

**What**: Percentage of drafts that required editing before approval
**Why Important**: Shows where AI needs improvement
**Target**: 20-30%
**Calculation**: (Edited & Approved) / Total Reviewed

#### 6. Escalation Rate

**What**: Percentage of drafts escalated to senior support
**Why Important**: Identifies complex cases AI can't handle
**Target**: 5-10%
**Alert Threshold**: >15% (too many escalations)

#### 7. Rejection Rate

**What**: Percentage of drafts completely discarded
**Why Important**: Indicates AI is off-target
**Target**: <5%
**Alert Threshold**: >10% (serious quality issues)

#### 8. First Contact Resolution (FCR)

**What**: Percentage of inquiries resolved in first interaction
**Why Important**: Customer experience metric
**Target**: 75-85%
**Comparison**: Show improvement vs manual baseline (64%)

#### 9. Customer Satisfaction (CSAT)

**What**: Average CSAT for inquiries handled with Agent SDK
**Why Important**: Ultimate success metric
**Target**: ≥4.3/5 (maintain or improve baseline)
**Alert Threshold**: <4.0 (degradation)

---

## Dashboard Wireframes

### Tile 1: Drafts Reviewed

```
┌──────────────────────────┐
│ 📊 Drafts Reviewed       │
│                          │
│        24                │
│     ↑ +8 (50%)          │
│                          │
│ [Bar chart: hourly]      │
│ 9am  11am  1pm  3pm     │
│  ▂▄▆█▅▃▂                │
│                          │
│ Team avg: 18 drafts      │
└──────────────────────────┘
```

### Tile 2: Approval Rate

```
┌──────────────────────────┐
│ ✅ Approval Rate         │
│                          │
│        68%               │
│     ↑ +12%              │
│                          │
│ [Donut chart]            │
│    68% Approved          │
│    29% Edited            │
│     3% Other             │
│                          │
│ Target: 60%  [✓ Met]    │
└──────────────────────────┘
```

### Tile 3: Average Review Time

```
┌──────────────────────────┐
│ ⚡ Avg Time to Review    │
│                          │
│      1.2 min             │
│     ↓ -0.3 min          │
│                          │
│ [Histogram]              │
│ <1m  1-2m  2-3m  >3m    │
│  █    ▆    ▃    ▁      │
│                          │
│ Team avg: 1.5 min        │
│ Your best: 0.8 min       │
└──────────────────────────┘
```

### Tile 4: Operator Rating

```
┌──────────────────────────┐
│ 😊 Your Rating           │
│                          │
│     ★★★★½               │
│      4.5/5               │
│                          │
│ This week:               │
│ Mon ★★★★★ 5.0           │
│ Tue ★★★★☆ 4.0           │
│ Wed ★★★★★ 5.0           │
│ Thu ★★★★½ 4.5           │
│                          │
│ [Rate today] ★★★★★      │
└──────────────────────────┘
```

---

## Dashboard Variations

### Team Lead View

**Additional Metrics**:

- Team aggregate approval rate
- Individual operator comparison table
- Outlier detection (operators struggling or excelling)
- Coaching recommendations

**Layout Addition**:

```
┌─────────────────────────────────────────────────────┐
│ 👥 Team Performance Summary                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Operator   | Drafts | Approval | Avg Time | Rating│
│------------|--------|----------|----------|-------│
│ Marcus     |   28   |   72%    |  1.1 min | 4.8   │
│ Sarah      |   26   |   68%    |  1.3 min | 4.5   │
│ You (Lead) |   24   |   68%    |  1.2 min | 4.5   │
│ Emily      |   22   |   65%    |  1.4 min | 4.2   │
│ David      |   18   |   58%    |  1.8 min | 3.9   │← Needs coaching
│                                                     │
│ 💡 Coaching Suggestions:                            │
│ • David: Review time 50% above average             │
│ • Consider pairing with Marcus for tips            │
└─────────────────────────────────────────────────────┘
```

### Manager View

**Additional Metrics**:

- ROI tracking (cost savings vs baseline)
- System health status
- Pilot progress against targets
- Strategic KPIs (FCR, CSAT trends)

**Layout Addition**:

```
┌─────────────────────────────────────────────────────┐
│ 📊 Strategic Overview                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ROI Metrics (Month-to-Date)                        │
│ • Cost per ticket: $5.80 (was $8.20) [-29%]       │
│ • Monthly savings: $4,200                          │
│ • Deferred hiring: 0.8 FTE                         │
│                                                     │
│ Pilot Progress (Week 1 of 2)                       │
│ • Approval rate: 52% [Target: 45% ✓]              │
│ • Operator sat: 7.8/10 [Target: 7.5 ✓]            │
│ • CSAT: 4.3/5 [Target: ≥4.2 ✓]                    │
│ • Status: 🟢 On Track for Full Rollout            │
│                                                     │
│ Go/No-Go Decision Indicators                       │
│ [All green = proceed with full rollout]            │
└─────────────────────────────────────────────────────┘
```

### Engineering View

**Technical Metrics**:

- API response time (p50, p95, p99)
- Error rate and error types
- LlamaIndex query accuracy
- OpenAI token usage and cost
- System uptime

**Layout Addition**:

```
┌─────────────────────────────────────────────────────┐
│ 🔧 Technical Performance                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ API Performance (Last Hour)                        │
│ • Response time (p95): 1.8s [Target: <3s ✓]       │
│ • Error rate: 0.8% [Target: <2% ✓]                │
│ • Uptime: 99.9%                                    │
│                                                     │
│ LlamaIndex Performance                             │
│ • Query accuracy: 87% [Target: >85% ✓]            │
│ • Avg queries per draft: 3.2                       │
│ • KB coverage: 89%                                 │
│                                                     │
│ Cost Tracking                                       │
│ • OpenAI API (today): $42.50                       │
│ • Est. monthly: $1,275 [Budget: $1,500 ✓]         │
│                                                     │
│ Recent Errors (Last 24h)                           │
│ • Knowledge base timeout: 3 occurrences            │
│ • OpenAI rate limit: 1 occurrence                  │
│ [View details →]                                   │
└─────────────────────────────────────────────────────┘
```

---

## Metrics Calculation Details

### Approval Rate Calculation

```
Approval Rate = (Drafts Approved Without Edits) / (Total Drafts Reviewed)

Example:
- Total drafts reviewed: 24
- Approved without edits: 16
- Edited & approved: 7
- Escalated: 1
- Rejected: 0

Approval Rate = 16 / 24 = 66.7%
```

### Average Review Time Calculation

```
Avg Review Time = SUM(Time spent on each draft) / Total drafts reviewed

Time tracking:
- Start: When draft appears in operator's queue
- End: When operator clicks Approve, Edit, Escalate, or Reject

Exclude:
- Time spent in other tabs
- Breaks/lunch (inactive >5 minutes)
```

### First Contact Resolution Calculation

```
FCR = (Tickets resolved without follow-up) / (Total tickets handled)

Tracking window: 7 days after initial response

Example:
- Tickets handled today: 24
- Tickets that needed follow-up (within 7 days): 5
- FCR = (24 - 5) / 24 = 79.2%
```

---

## Data Sources & Integration

### Data Collection Points

1. **Approval Queue Actions**:
   - Timestamp of draft creation
   - Timestamp of operator action
   - Action type (approve, edit, escalate, reject)
   - Operator ID
   - Confidence score of draft

2. **Chatwoot Tickets**:
   - Ticket resolution time
   - Customer satisfaction scores
   - Ticket reopening (for FCR calculation)
   - Inquiry type and tags

3. **Agent SDK Service**:
   - Draft generation time
   - Confidence scores
   - Knowledge base sources used
   - OpenAI token usage

4. **Operator Feedback**:
   - Daily rating (end of shift prompt)
   - Weekly satisfaction survey
   - Inline feedback on drafts

### Technical Architecture

```
┌──────────────────────────────────────────────────┐
│ Data Collection Layer                            │
│ • Approval Queue Events (PostgreSQL)             │
│ • Chatwoot Webhooks (Ticket updates)             │
│ • Agent SDK Logs (API calls, errors)             │
│ • Operator Input (Ratings, surveys)              │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│ Analytics Pipeline                               │
│ • Real-time aggregation (Redis)                  │
│ • Time-series storage (TimescaleDB)              │
│ • Metrics calculation (Python scripts)           │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│ Dashboard API                                    │
│ • REST endpoints for metrics                     │
│ • WebSocket for real-time updates                │
│ • Role-based access control                      │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│ Dashboard Frontend (React)                       │
│ • Operator view (default)                        │
│ • Lead view (aggregate)                          │
│ • Manager view (strategic)                       │
│ • Engineering view (technical)                   │
└──────────────────────────────────────────────────┘
```

---

## Real-Time Updates

### Update Frequency

- **Live Metrics**: Update every 5 seconds (current hour stats)
- **Historical Charts**: Update every 1 minute
- **Leaderboard**: Update every 5 minutes
- **Alerts**: Instant (WebSocket push)

### Alert System

**Low Priority** (Yellow badge):

- Approval rate drops below 50%
- Review time exceeds 2 minutes average
- Error rate 1-2%

**High Priority** (Red badge + notification):

- Approval rate drops below 40%
- CSAT drops below 4.0
- Error rate exceeds 2%
- System downtime

**Success Alerts** (Green celebration):

- Approval rate exceeds 75%
- Personal best review time
- 10 drafts approved in a row
- Team hits daily target

---

## Gamification Elements

### Achievements (Optional)

**Speed Demon**: Review 10 drafts in under 1 minute each (in one day)
**Quality Champion**: 95% approval rate for 5 consecutive days
**Team Player**: Help 3 colleagues with Agent SDK tips
**Early Adopter**: One of first 5 pilots
**Marathon Runner**: 50 drafts reviewed in one day

### Leaderboard

**Categories**:

1. Most drafts reviewed (daily/weekly)
2. Highest approval rate (min 10 drafts)
3. Fastest average review time (with >60% approval rate)
4. Most improved (week-over-week)

**Privacy Considerations**:

- Operators can opt-out of leaderboard
- Only show top 5 (not full rankings)
- Focus on improvement, not competition

---

## Mobile Responsiveness

### Mobile Dashboard (Simplified)

**Single Column Layout**:

```
┌────────────────────────┐
│ 📱 Agent SDK Dashboard │
│                        │
│ Today's Performance:   │
│ • Drafts: 24 ↑        │
│ • Approval: 68% ↑     │
│ • Time: 1.2 min ↓     │
│                        │
│ [Swipe for details →] │
│                        │
│ 💡 Tip:                │
│ Great approval rate!   │
│                        │
│ [Refresh] [Full View]  │
└────────────────────────┘
```

**Simplified for Quick Glance**:

- Top 4 metrics only
- Single chart (trend only)
- Tips/alerts prominently displayed
- "Full View" button links to desktop version

---

## Accessibility

### Design Principles

- **Color blind safe**: Don't rely on color alone (use icons + text)
- **High contrast**: Ensure readable text on all backgrounds
- **Screen reader friendly**: Proper ARIA labels on all metrics
- **Keyboard navigation**: Full keyboard support for all interactions

### Color Palette

**Primary Colors**:

- Success: #10B981 (Green) + ✓ icon
- Warning: #F59E0B (Yellow) + ⚠ icon
- Danger: #EF4444 (Red) + ✗ icon
- Neutral: #6B7280 (Gray)

**Contrast Ratios**: WCAG AA compliant (4.5:1 minimum)

---

## Wireframe Coordination with Designer

### Designer Handoff Package

**Assets Needed**:

1. High-fidelity mockups (Figma/Sketch)
2. Component library (buttons, tiles, charts)
3. Responsive breakpoints (desktop, tablet, mobile)
4. Animation specs (loading states, transitions)
5. Icon set (custom icons for metrics)

**Design System Alignment**:

- Follow existing HotDash design patterns
- Use established color palette
- Match typography and spacing
- Consistent with operator tools (Chatwoot theme)

### Designer Review Points

**Operator View**:

- Is the layout overwhelming or just right?
- Are KPIs prioritized correctly?
- Do tips feel helpful or annoying?
- Is gamification motivating or stressful?

**Data Density**:

- How much information can fit without clutter?
- When should we use expandable sections?
- What's the right balance of text vs visuals?

---

## Implementation Plan

### Phase 1: MVP (Week 1)

- Operator view with top 4 KPIs
- Simple bar charts for trends
- Manual refresh (no real-time)
- Desktop only

### Phase 2: Enhanced (Week 2-3)

- Team lead and manager views
- Real-time WebSocket updates
- Alert system
- Mobile responsive

### Phase 3: Advanced (Month 2)

- Engineering view with technical metrics
- Gamification features
- Advanced analytics (drill-down)
- Export functionality

### Phase 4: Optimization (Month 3+)

- A/B test different layouts
- Personalization (operators choose metrics)
- Predictive insights (AI suggests actions)
- Integration with other tools

---

## Success Criteria for Dashboard

### Usage Metrics

- 90% of operators check dashboard daily
- Average 5+ visits per operator per day
- <10% opt-out of leaderboard

### Impact Metrics

- Operators who check dashboard have 10% higher approval rates
- 20% reduction in time spent checking separate analytics tools
- 85% of operators rate dashboard as "very useful" (4-5/5)

### Technical Metrics

- Page load time <2 seconds
- Real-time updates with <500ms latency
- 99.9% dashboard uptime

---

## Appendix: API Endpoints

### Dashboard API Specification

**GET /api/dashboard/operator/{operator_id}**

- Returns operator-specific metrics for date range
- Query params: start_date, end_date, granularity (hour/day/week)

**GET /api/dashboard/team/{team_id}**

- Returns team aggregate metrics
- Requires team lead or manager role

**GET /api/dashboard/alerts/{operator_id}**

- Returns active alerts for operator
- Supports WebSocket for real-time push

**POST /api/dashboard/rating**

- Operator submits daily rating
- Body: {operator_id, rating, comment (optional)}

---

**Document Owner**: Product Agent  
**Last Updated**: October 11, 2025  
**Status**: Design Complete - Ready for Designer Review  
**Next Action**: Coordinate with @designer for UI mockups

**Related Documents**:

- [Success Metrics Framework](docs/data/success_metrics_slo_framework_2025-10-11.md)
- [Product Roadmap](product_roadmap_agentsdk.md)
