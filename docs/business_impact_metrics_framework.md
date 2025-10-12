# Business Impact Metrics Framework

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Product Agent  
**Purpose**: Track revenue impact, customer satisfaction, and ROI for Hot Rod AN dashboard

---

## Primary Metric: Revenue Impact

### Definition
**Revenue Impact** = Measurable revenue growth attributable to dashboard usage

**Target**: +20-50% revenue growth in Year 1 (CEO redirects saved time to sales)

---

### Measurement Method

**Data Sources**:
1. **Shopify Sales Data** (via MCP): Track weekly/monthly revenue
2. **CEO Attribution**: CEO logs business decisions made using dashboard
3. **Time Reallocation**: Track CEO time shift from ops to revenue activities

**Tracking Framework**:
```
Week 0 (Baseline): $23,000/week revenue
Week 1: $24,000 (+4%) - CEO had more time for customer calls
Week 2: $25,500 (+6%) - CEO closed wholesale deal using dashboard insights
Week 3: $27,000 (+8%) - Inventory optimization reduced stockouts
Week 4: $28,500 (+10%) - Full month impact
```

**Attribution Method**:
- Ask CEO weekly: "Did dashboard help you make any business decisions this week?"
- Log specific examples: "Used Sales Pulse to identify Chrome Headers trend → increased ad spend → +$2K sales"
- Calculate: Revenue lift - baseline = dashboard-attributed revenue

---

### Revenue Impact Categories

**Direct Impact** (Dashboard-driven decisions):
- Sales opportunities identified (trending products)
- Inventory optimization (prevented stockouts)
- Customer retention (faster support responses)

**Indirect Impact** (Time reallocation):
- CEO time on sales: 10 hrs/week → 20 hrs/week
- More sales calls completed
- Better marketing campaigns (more time to plan)
- New partnerships (time for outreach)

**Target**: $5-10K/month revenue lift by Month 3

---

## Secondary Metric: Customer Satisfaction (CSAT)

### Definition
**CSAT for Agent-Assisted Responses** = Customer ratings for support responses approved via approval queue

**Target**: ≥4.5/5 (maintain or improve from baseline 4.2/5)

---

### Measurement Method

**Via Chatwoot MCP** (if available):
- Query customer satisfaction ratings
- Filter for tickets processed through approval queue
- Compare to baseline (manual responses)

**SQL Query** (via Supabase MCP):
```sql
SELECT 
  DATE_TRUNC('week', resolved_at) as week,
  AVG(csat_rating) as avg_csat,
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN source = 'approval_queue' THEN 1 END) as agent_assisted
FROM tickets
WHERE resolved_at >= '2025-10-15'
  AND csat_rating IS NOT NULL
GROUP BY week
ORDER BY week;
```

**Tracking**:
- Weekly CSAT average (agent-assisted vs manual)
- CSAT trend (improving or declining?)
- Customer comments (qualitative feedback)

**Target**: No degradation in CSAT, ideally +0.1-0.3 points improvement

---

## Tertiary Metric: ROI (Return on Investment)

### Definition
**ROI** = (Value Delivered - Cost) / Cost × 100%

**Components**:
- **Value Delivered**: CEO time saved × hourly rate
- **Cost**: HotDash subscription ($200/month pilot)

---

### Calculation Method

**Weekly ROI**:
```
Time Saved: 11 hours
CEO Hourly Rate: $1,500
Weekly Value: 11 × $1,500 = $16,500
Weekly Cost: $200 / 4 = $50
Weekly ROI: ($16,500 - $50) / $50 = 32,900%
```

**Monthly ROI**:
```
Time Saved: 48 hours/month (12 hrs/week × 4)
Monthly Value: 48 × $1,500 = $72,000
Monthly Cost: $200
Monthly ROI: ($72,000 - $200) / $200 = 35,900%
```

**Annual ROI Projection**:
```
Time Saved: 576 hours/year (12 hrs/week × 48 weeks)
Annual Value: 576 × $1,500 = $864,000
Annual Cost: $2,400
Annual ROI: ($864,000 - $2,400) / $2,400 = 35,900%
```

**Or using realized revenue impact**:
```
Revenue Growth: $500,000/year
Annual Cost: $2,400
Revenue-Based ROI: ($500,000 - $2,400) / $2,400 = 20,733%
```

---

## Metrics Dashboard (Business Impact View)

### Weekly Business Impact Summary

```
┌─────────────────────────────────────────────┐
│ BUSINESS IMPACT - WEEK 3                    │
├─────────────────────────────────────────────┤
│ Revenue This Week: $27,000                  │
│ vs Baseline: +$4,000 (+17%)                │
│                                             │
│ CEO Time Reallocation:                      │
│ - Ops: 13 hrs (was 25 hrs) -48%           │
│ - Sales: 22 hrs (was 10 hrs) +120%        │
│                                             │
│ Dashboard-Driven Decisions:                 │
│ 1. Increased Chrome Headers ad spend       │
│ 2. Reordered Brake Kits (prevented stockout)│
│ 3. Responded to wholesale inquiry (new $5K deal)│
│                                             │
│ Customer Satisfaction:                      │
│ - CSAT: 4.4/5 (up from 4.2 baseline)       │
│ - Agent-assisted tickets: 4.6/5 ⭐         │
│                                             │
│ ROI This Week:                              │
│ - Time Value: $16,500                      │
│ - Cost: $50                                │
│ - ROI: 32,900%                             │
└─────────────────────────────────────────────┘
```

---

## Data Collection Using MCP Tools

### Supabase MCP Integration

**Tables to Query**:
- `approval_queue_actions` - Approval timestamps and decisions
- `dashboard_sessions` - Login events and duration
- `business_metrics` - Revenue, CSAT, time tracking

**Key Queries**:

**Query 1: Weekly Time Saved**
```sql
SELECT 
  SUM(time_saved_minutes) / 60.0 as hours_saved,
  COUNT(DISTINCT date) as days_used,
  COUNT(*) as total_logs
FROM ceo_time_logs
WHERE week = CURRENT_WEEK
  AND operator_id = 'hot_rod_ceo';
```

**Query 2: Approval Efficiency**
```sql
SELECT 
  AVG(review_time_seconds) as avg_review_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY review_time_seconds) as p95_review_time,
  COUNT(*) as total_approvals
FROM approval_queue_actions
WHERE DATE(timestamp) = CURRENT_DATE
  AND operator_id = 'hot_rod_ceo';
```

**Query 3: Revenue Trend**
```sql
SELECT 
  DATE_TRUNC('week', order_date) as week,
  SUM(total_revenue) as weekly_revenue,
  COUNT(*) as orders
FROM shopify_orders
WHERE order_date >= '2025-10-01'
GROUP BY week
ORDER BY week;
```

---

### Shopify MCP Integration (Future)

**If Shopify MCP available**:
- Query real-time sales data
- Track product performance
- Monitor conversion rates
- Analyze customer behavior

**Queries to Run**:
- Weekly revenue totals
- Best-selling products
- Customer acquisition cost
- Order value trends

---

## Evidence Logging

**Path**: `feedback/product.md`

**Daily Log Format**:
```markdown
### 2025-10-15 - Business Impact Tracking

**Revenue**:
- Today: $3,200
- Week to date: $16,400
- vs Baseline week: +$1,200 (+7.9%)

**CEO Time Allocation**:
- Ops: 2.5 hours
- Sales: 5 hours (closed 1 wholesale inquiry)
- Dashboard enabled: Both activities

**Customer Satisfaction**:
- Agent-assisted tickets: 8 today
- CSAT: 4.5/5 average

**ROI**:
- Time saved: 2.3 hours = $3,450 value
- Cost: $7 (daily)
- Daily ROI: 49,186%

**North Star**: Dashboard directly contributed to wholesale deal ($5K)
```

---

## Alerts & Thresholds

### Critical Alerts
- 🚨 Revenue down >10% week-over-week (investigate)
- 🚨 CSAT drops below 4.0 (quality issue)
- 🚨 Time saved <4 hours in Week 2 (value not realized)

### Warning Alerts
- ⚠️ Revenue flat or declining for 2 consecutive weeks
- ⚠️ CSAT <4.3 for agent-assisted tickets
- ⚠️ CEO not logging time saved (measurement gap)

**Response**: Immediate investigation, CEO call within 24 hours

---

## Success Targets

### Week 4 (Pilot Completion)
- Revenue: +10-15% vs baseline
- CSAT: ≥4.4/5 (improvement over 4.2)
- ROI: >20,000%
- CEO attribution: ≥3 business decisions made using dashboard

**Go/No-Go**: If 3/4 targets met → Full rollout

---

**Document Owner**: Product Agent  
**Created**: October 12, 2025  
**Status**: Active - Track Starting Oct 15

**End of Business Impact Metrics Framework**

