# Agent Performance Dashboard Design

**Version**: 1.0  
**Date**: October 14, 2025  
**Owner**: Product Agent  
**Purpose**: Design operator dashboard for Agent SDK metrics visualization  
**Status**: Ready for Designer implementation  

---

## Executive Summary

**Goal**: Give operators real-time visibility into Agent SDK performance

**Users**: Support operators (10), Support manager (1), Product team (1)

**Key Metrics**: Approval rate, response time, accuracy, time saved

**Dashboard Location**: `/dashboard/agent-metrics` (operator-accessible)

---

## KPIs to Visualize

### Primary KPIs (Most Important)

**1. First-Time Resolution Rate** (%)
- Definition: % of AI responses sent without human edits
- Target: ≥80%
- Formula: (Approved without edits / Total approved) × 100%
- Update: Real-time

**2. Average Approval Latency** (seconds)
- Definition: Time from AI draft to operator approval
- Target: <30 seconds
- Formula: AVG(approval_time - draft_time)
- Update: Real-time

**3. Tickets Handled Per Hour** (count)
- Definition: Productivity with Agent SDK assistance
- Target: ≥20 tickets/hour (vs 8-10 manual)
- Formula: Tickets handled / Hours worked
- Update: Hourly rollup

**4. Human Edit Rate** (%)
- Definition: % of AI responses edited before sending
- Target: <20%
- Formula: (Edited before approval / Total approved) × 100%
- Update: Real-time

---

### Secondary KPIs (Track for Insights)

**5. Query Types Handled** (breakdown)
- Definition: Distribution of query types (order status, refunds, technical, etc.)
- Visual: Pie chart or stacked bar
- Update: Daily rollup

**6. Confidence Score Distribution** (histogram)
- Definition: Distribution of AI confidence scores (0-100%)
- Visual: Histogram (bins: 0-50%, 50-70%, 70-90%, 90-100%)
- Update: Daily rollup

**7. Operator Performance Comparison** (leaderboard)
- Definition: Operator rankings by approval speed, accuracy
- Visual: Sortable table
- Update: Daily rollup
- Privacy: Anonymous display or operator-only view

**8. Time Saved** (hours/week)
- Definition: Estimated time saved vs manual process
- Target: ≥2 hours/operator/day
- Formula: (Manual time - Agent SDK time) × Tickets handled
- Update: Daily rollup

---

### Tertiary KPIs (Nice to Have)

**9. Customer Satisfaction Impact** (CSAT)
- Definition: CSAT for Agent SDK-assisted vs manual tickets
- Target: No regression (maintain ≥3.8/5.0)
- Update: Weekly

**10. Escalation Rate** (%)
- Definition: % of Agent SDK tickets escalated to manager
- Target: ≤10% (vs 15-20% baseline)
- Update: Daily rollup

**11. Knowledge Base Coverage** (%)
- Definition: % of queries answered using KB sources
- Target: ≥70%
- Update: Daily rollup

**12. Learning Loop Effectiveness** (%)
- Definition: % improvement in AI accuracy from operator feedback
- Target: 5-10% improvement/month
- Update: Monthly

---

## Dashboard Wireframes

### Tab 1: Overview (Default)

```
+-------------------------------------------+
| Agent Performance Dashboard               |
+-------------------------------------------+
| Summary Cards (Top Row)                   |
| [Resolution: 85%] [Latency: 28s]         |
| [Tickets/Hr: 22]  [Edit Rate: 18%]      |
+-------------------------------------------+
| Chart 1: Resolution Rate Trend            |
| (Line chart, last 30 days)                |
|                         85% ────╱         |
|                    ╱───╱                  |
|               ────╱                       |
|          ────╱                            |
|     ────╱                                 |
|  70%                                      |
+-------------------------------------------+
| Chart 2: Approval Latency Trend           |
| (Line chart, last 30 days)                |
|     ╲                                     |
|      ╲____                    28s         |
|           ╲___╱───────                    |
|                                           |
|  60s                                      |
+-------------------------------------------+
| Chart 3: Tickets Handled Per Hour         |
| (Bar chart, today)                        |
|  9am [████████████] 24                    |
| 10am [██████████  ] 20                    |
| 11am [███████████ ] 22                    |
+-------------------------------------------+
```

---

### Tab 2: Performance

```
+-------------------------------------------+
| Performance Metrics                       |
+-------------------------------------------+
| Chart 1: Query Type Breakdown             |
| (Pie chart)                               |
|   Order Status: 40%                       |
|   Refunds: 25%                            |
|   Product Info: 20%                       |
|   Shipping: 15%                           |
+-------------------------------------------+
| Chart 2: Confidence Score Distribution    |
| (Histogram)                               |
|  90-100%: ████████ (35%)                  |
|  70-90%:  ██████   (25%)                  |
|  50-70%:  ████     (20%)                  |
|  0-50%:   ██       (20%)                  |
+-------------------------------------------+
| Chart 3: Operator Leaderboard             |
| (Table)                                   |
| Rank | Operator | Tickets | Latency | Edits |
|  1   | Sarah    | 145     | 22s     | 12%   |
|  2   | Mike     | 138     | 25s     | 15%   |
|  3   | Lisa     | 132     | 28s     | 18%   |
+-------------------------------------------+
```

---

### Tab 3: Value

```
+-------------------------------------------+
| Value Delivered                           |
+-------------------------------------------+
| Chart 1: Time Saved Per Operator          |
| (Bar chart, this week)                    |
| Sarah  [████████████] 12 hours            |
| Mike   [███████████ ] 11 hours            |
| Lisa   [██████████  ] 10 hours            |
| Tom    [█████████   ]  9 hours            |
| Jessica[████████    ]  8 hours            |
+-------------------------------------------+
| Chart 2: Cumulative Time Saved            |
| (Line chart, since pilot start)           |
|                               250 hours   |
|                          ╱────             |
|                    ╱────╱                  |
|              ╱────╱                        |
|        ╱────╱                              |
|   0 hours                                  |
+-------------------------------------------+
| ROI Calculation                           |
| Time Saved: 250 hours                     |
| Operator Cost: $32/hour                   |
| Value: $8,000                             |
| Agent SDK Cost: $600/month                |
| ROI: 1,233%                               |
+-------------------------------------------+
```

---

## Design Requirements

### Visual Style

**Colors**:
- Success/Good: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error/Bad: Red (#EF4444)
- Neutral: Gray (#6B7280)
- Primary: Blue (#3B82F6)

**Charts**: Use consistent Recharts components from main dashboard

**Responsiveness**: Desktop-first, mobile-accessible

**Theming**: Match existing Shopify app theme

---

### Interaction Design

**Hover States**:
- Chart tooltips show exact values
- Card hover shows additional context
- Table row hover highlights

**Drill-Down**:
- Click on chart → Filter data (e.g., click "Order Status" in pie chart → Show order status tickets only)
- Click on operator → Show operator-specific metrics

**Filters**:
- Date range: Today, Last 7 days, Last 30 days, Custom
- Operator: All operators, Specific operator, Team
- Query type: All, Order status, Refunds, etc.

---

## Coordination with Designer

**Deliverables from Designer**:
1. High-fidelity mockups (Figma) for 3 tabs
2. Component specifications (spacing, colors, fonts)
3. Responsive breakpoints (desktop, tablet, mobile)
4. Interaction states (hover, click, loading, error)

**Timeline**: 6-8 hours (Designer)

**Handoff to Engineer**:
- Figma link with specs
- Component library references
- Asset exports (icons, images)

---

## Implementation Steps

**Step 1: Designer** (6-8 hours):
- Create Figma mockups for 3 tabs
- Design charts and cards
- Specify interactions and states

**Step 2: Data Team** (4 hours):
- Create database views for metrics
- Write SQL queries for aggregations
- Test query performance

**Step 3: Engineer** (12-16 hours):
- Build `/dashboard/agent-metrics` route
- Implement 3 tabs with charts
- Connect to Supabase data sources
- Add filters and interactions

**Step 4: QA** (2-4 hours):
- Test dashboard functionality
- Verify metrics accuracy
- Test filters and drill-downs

**Total**: 24-32 hours (~4-5 days for team)

---

**Confidence**: HIGH - Clear KPIs, detailed wireframes, designer coordination plan

**Evidence**: Agent performance dashboard design (6.8KB)
**Timestamp**: 2025-10-14T01:30:00Z
