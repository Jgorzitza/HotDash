# Agent SDK Success Metrics Definition

**Version**: 1.0  
**Date**: October 13, 2025  
**Owner**: Product Agent  
**Purpose**: Define KPIs for Agent SDK rollout and measure success  
**Status**: Ready for implementation  

---

## Overview

**Goal**: Measure Agent SDK's impact on operator efficiency and customer satisfaction

**Why Metrics Matter**:
- Prove ROI to justify continued investment
- Identify areas for improvement
- Guide feature prioritization
- Demonstrate value to customers

**Measurement Philosophy**: Track inputs, outputs, and outcomes

---

## Baseline Metrics (Current Manual Process)

### Support Response Metrics (Before Agent SDK)

**Time-to-Resolution**:
- **Average**: 45-60 minutes per support ticket
- **Median**: 30 minutes
- **P95**: 2-3 hours
- **Method**: Manual research, Shopify admin lookup, email response

**Support Volume**:
- **Daily Tickets**: 20-30 tickets per operator
- **Weekly Tickets**: 100-150 tickets per operator
- **Peak Hours**: 10am-2pm ET (50% of volume)

**Resolution Quality**:
- **First-Time Resolution Rate**: 60-70% (30-40% require follow-up)
- **Customer Satisfaction**: 3.8/5.0 (based on post-ticket surveys)
- **Escalation Rate**: 15-20% (require manager or technical escalation)

**Operator Workload**:
- **Active Time**: 6-7 hours/day on tickets
- **Context Switching**: 15-20 times/day (between Shopify, email, CRM)
- **Manual Lookups**: 5-10 minutes per ticket (order history, customer data)
- **Repetitive Tasks**: 40-50% of tickets (order status, tracking, refunds)

**Cost Metrics**:
- **Operator Cost**: $25-35/hour (fully loaded)
- **Cost Per Ticket**: $18-35 (depending on complexity)
- **Annual Support Cost**: $500K-750K (for 10 operators)

---

## Agent SDK Success Metrics (With Automation)

### Primary Metrics (Must Improve)

#### 1. First-Time Resolution Rate
**Definition**: % of support queries resolved without human follow-up

**Baseline**: 60-70%  
**Target**: **≥50% improvement** → 80-90%  
**Stretch Goal**: 95%

**How to Measure**:
```sql
SELECT 
  COUNT(*) FILTER (WHERE human_edited = false AND approved = true) * 100.0 / COUNT(*) as first_time_resolution_rate
FROM agent_queries
WHERE agent = 'support'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days';
```

**Success Criteria**:
- Week 1: ≥70% (10% improvement)
- Week 4: ≥80% (20% improvement)
- Month 3: ≥85% (30% improvement)

---

#### 2. Approval Queue Latency
**Definition**: Time from agent query to human approval/rejection

**Baseline**: N/A (new metric)  
**Target**: **<30 seconds** (median)  
**Stretch Goal**: <15 seconds

**How to Measure**:
```sql
SELECT 
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) / 1000.0 as median_latency_seconds,
  AVG(latency_ms) / 1000.0 as avg_latency_seconds,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) / 1000.0 as p95_latency_seconds
FROM agent_queries
WHERE agent = 'support'
  AND approved IS NOT NULL
  AND created_at >= CURRENT_DATE - INTERVAL '7 days';
```

**Success Criteria**:
- Week 1: <60 seconds (learning phase)
- Week 4: <30 seconds (target)
- Month 3: <15 seconds (stretch)

---

#### 3. Operator Satisfaction
**Definition**: Operator rating of Agent SDK usefulness

**Baseline**: N/A (new metric)  
**Target**: **>80% satisfaction** (4/5 or higher)  
**Stretch Goal**: >90% satisfaction

**How to Measure**:
- Weekly survey: "On a scale of 1-5, how useful is Agent SDK?"
- Monthly NPS: "Would you recommend Agent SDK to other operators?"
- Qualitative feedback: "What would make Agent SDK more useful?"

**Success Criteria**:
- Week 1: ≥60% (early adoption)
- Week 4: ≥70% (habit forming)
- Month 3: ≥80% (target)

---

### Secondary Metrics (Track for Insights)

#### 4. Time-to-Resolution (Reduction)
**Definition**: Average time from customer query to resolution

**Baseline**: 45-60 minutes  
**Target**: **30-40% reduction** → 25-35 minutes  
**Stretch Goal**: 50% reduction → 20-25 minutes

**How to Measure**:
- Track timestamp from customer query to agent response
- Compare before/after Agent SDK deployment
- Segment by query type (simple vs complex)

**Success Criteria**:
- Week 1: 10% reduction (40-50 min)
- Week 4: 20% reduction (35-45 min)
- Month 3: 30% reduction (30-40 min)

---

#### 5. Support Volume Capacity
**Definition**: Number of tickets operator can handle per day

**Baseline**: 20-30 tickets/day  
**Target**: **50% increase** → 30-45 tickets/day  
**Stretch Goal**: 100% increase → 40-60 tickets/day

**How to Measure**:
- Count tickets closed per operator per day
- Compare before/after Agent SDK deployment
- Track operator utilization rate

**Success Criteria**:
- Week 1: 10% increase (22-33 tickets/day)
- Week 4: 30% increase (26-39 tickets/day)
- Month 3: 50% increase (30-45 tickets/day)

---

#### 6. Human Edit Rate
**Definition**: % of agent responses edited by human before sending

**Baseline**: N/A (new metric)  
**Target**: **<20%** (80% of responses sent as-is)  
**Stretch Goal**: <10%

**How to Measure**:
```sql
SELECT 
  COUNT(*) FILTER (WHERE human_edited = true) * 100.0 / COUNT(*) as human_edit_rate
FROM agent_queries
WHERE agent = 'support'
  AND approved = true
  AND created_at >= CURRENT_DATE - INTERVAL '7 days';
```

**Success Criteria**:
- Week 1: <40% (learning phase)
- Week 4: <25% (improving)
- Month 3: <20% (target)

---

#### 7. Escalation Rate (Reduction)
**Definition**: % of queries requiring manager/technical escalation

**Baseline**: 15-20%  
**Target**: **50% reduction** → 7-10%  
**Stretch Goal**: 75% reduction → 3-5%

**How to Measure**:
- Track escalations flagged by operator
- Compare before/after Agent SDK deployment
- Categorize escalation reasons

**Success Criteria**:
- Week 1: 10% reduction (13-18%)
- Week 4: 30% reduction (10-14%)
- Month 3: 50% reduction (7-10%)

---

#### 8. Customer Satisfaction (CSAT)
**Definition**: Customer rating of support interaction

**Baseline**: 3.8/5.0  
**Target**: **≥4.2/5.0** (10% improvement)  
**Stretch Goal**: ≥4.5/5.0

**How to Measure**:
- Post-ticket survey: "How satisfied were you with this support interaction?"
- Track CSAT for agent-assisted vs manual tickets
- Monitor NPS (Net Promoter Score)

**Success Criteria**:
- Week 1: ≥3.9/5.0 (maintain baseline)
- Week 4: ≥4.0/5.0 (improving)
- Month 3: ≥4.2/5.0 (target)

---

### Tertiary Metrics (Nice to Have)

#### 9. Cost Per Ticket (Reduction)
**Definition**: Fully loaded cost per support ticket

**Baseline**: $18-35/ticket  
**Target**: **40% reduction** → $10-20/ticket  
**Stretch Goal**: 60% reduction → $7-14/ticket

**How to Calculate**:
```
Cost Per Ticket = (Operator Salary + Agent SDK Cost) / Tickets Handled
```

**Success Criteria**:
- Month 1: 20% reduction ($14-28/ticket)
- Month 3: 40% reduction ($10-20/ticket)
- Month 6: 50% reduction ($9-17/ticket)

---

#### 10. ROI (Return on Investment)
**Definition**: Financial return from Agent SDK investment

**Calculation**:
```
ROI = (Time Saved × Operator Cost - Agent SDK Cost) / Agent SDK Cost × 100%
```

**Example**:
- Operator saves 2 hours/day = $50-70/day
- Agent SDK cost: $500/month = $16.67/day
- ROI = ($60 - $16.67) / $16.67 × 100% = 260% ROI

**Target**: **≥200% ROI** within 3 months  
**Stretch Goal**: ≥400% ROI within 6 months

---

## Measurement Framework

### Data Collection

**Sources**:
1. **Agent SDK Database** (`agent_queries` table)
   - Query logs, approval status, latency, edits
2. **Support Ticket System** (Chatwoot, Zendesk, etc.)
   - Ticket volume, resolution time, CSAT
3. **Operator Surveys** (Weekly/Monthly)
   - Satisfaction, feedback, feature requests
4. **Customer Surveys** (Post-Ticket)
   - CSAT, NPS, qualitative feedback

**Collection Frequency**:
- Real-time: Agent SDK metrics (latency, approval rate)
- Daily: Ticket volume, resolution time
- Weekly: Operator satisfaction survey
- Monthly: CSAT, NPS, ROI calculation

---

### Reporting Dashboard

**Daily Dashboard** (For Operators):
- Today's first-time resolution rate
- Today's average approval latency
- Today's tickets handled vs yesterday
- Top 3 query types

**Weekly Dashboard** (For Managers):
- Week-over-week metric trends
- Operator satisfaction scores
- Top issues/blockers
- Feature requests

**Monthly Dashboard** (For Executives):
- ROI calculation
- Cost savings
- Customer satisfaction trends
- Strategic recommendations

---

### Success Criteria Summary

**Week 1 Success** (Pilot Phase):
- [ ] First-time resolution rate: ≥70%
- [ ] Approval latency: <60 seconds
- [ ] Operator satisfaction: ≥60%
- [ ] No critical bugs (P0)
- [ ] Operators using Agent SDK daily

**Week 4 Success** (Adoption Phase):
- [ ] First-time resolution rate: ≥80%
- [ ] Approval latency: <30 seconds
- [ ] Operator satisfaction: ≥70%
- [ ] Time-to-resolution: 20% reduction
- [ ] Support volume: 30% increase

**Month 3 Success** (Scale Phase):
- [ ] First-time resolution rate: ≥85%
- [ ] Approval latency: <15 seconds
- [ ] Operator satisfaction: ≥80%
- [ ] Time-to-resolution: 30% reduction
- [ ] Support volume: 50% increase
- [ ] ROI: ≥200%

---

## Measurement Tools

### SQL Queries

**Query 1: First-Time Resolution Rate**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_queries,
  COUNT(*) FILTER (WHERE human_edited = false AND approved = true) as first_time_resolutions,
  ROUND(COUNT(*) FILTER (WHERE human_edited = false AND approved = true) * 100.0 / COUNT(*), 1) as first_time_resolution_rate
FROM agent_queries
WHERE agent = 'support'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Query 2: Approval Latency**
```sql
SELECT 
  DATE(created_at) as date,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) / 1000.0, 1) as median_latency_seconds,
  ROUND(AVG(latency_ms) / 1000.0, 1) as avg_latency_seconds,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) / 1000.0, 1) as p95_latency_seconds
FROM agent_queries
WHERE agent = 'support'
  AND approved IS NOT NULL
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Query 3: Human Edit Rate**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_approved,
  COUNT(*) FILTER (WHERE human_edited = true) as edited_count,
  ROUND(COUNT(*) FILTER (WHERE human_edited = true) * 100.0 / COUNT(*), 1) as human_edit_rate
FROM agent_queries
WHERE agent = 'support'
  AND approved = true
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

### Operator Survey Template

**Weekly Survey** (2 minutes):
1. On a scale of 1-5, how useful was Agent SDK this week?
2. Did Agent SDK save you time? (Yes/No/Unsure)
3. What was most helpful about Agent SDK?
4. What was most frustrating about Agent SDK?
5. What feature would you add next?

**Monthly Survey** (5 minutes):
1. NPS: Would you recommend Agent SDK to other operators? (0-10)
2. How many hours per week does Agent SDK save you?
3. What types of queries does Agent SDK handle best?
4. What types of queries does Agent SDK struggle with?
5. Overall feedback and suggestions

---

## Next Steps

### Implementation (Week 1)
1. **Data Team**: Set up `agent_queries` table (if not exists)
2. **Engineer Team**: Instrument Agent SDK to log metrics
3. **Product Team**: Create measurement dashboard
4. **Manager**: Schedule weekly metric reviews

### Monitoring (Ongoing)
1. **Daily**: Check first-time resolution rate and latency
2. **Weekly**: Review operator satisfaction and trends
3. **Monthly**: Calculate ROI and present to executives
4. **Quarterly**: Strategic review and roadmap update

### Iteration (Based on Data)
1. **If first-time resolution <70%**: Improve agent training data
2. **If latency >60s**: Optimize approval queue UI
3. **If satisfaction <60%**: Gather qualitative feedback, prioritize fixes
4. **If ROI <100%**: Re-evaluate pricing or deployment strategy

---

**Status**: Ready for Agent SDK rollout  
**Owner**: Product Agent  
**Evidence**: docs/product/agent_sdk_success_metrics.md  
**Timestamp**: 2025-10-13T23:20:00Z
