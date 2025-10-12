# Operator Value Metrics Framework

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Product Agent  
**Purpose**: Define and track CEO time saved, dashboard usage, and approval queue efficiency for Hot Rod AN

---

## Primary Metric: CEO Time Saved

### Definition
**CEO Time Saved** = (Manual Process Time) - (HotDash-Enabled Time)

**Target**: Save CEO 10-12 hours/week (reduce from ~25 hrs/week ops to ~13 hrs/week)

**Timeline**: 
- Week 1: 4-6 hours saved (learning curve)
- Week 2: 8-10 hours saved (proficiency building)
- Week 3-4: 10-12 hours saved (full adoption)

---

### Measurement Method

**Baseline (Pre-Launch)**:
- CEO completes time diary (1 week): Log every 30-min block
- Categorize: Ops (inventory, support, fulfillment) vs Revenue (sales, marketing)
- Calculate baseline ops time: Expected ~25 hours/week

**During Pilot (Weekly)**:
- Daily Slack log: CEO reports time saved per day
- Weekly survey: Total hours saved this week
- Dashboard analytics: Auto-track time spent in HotDash

**Calculation Example**:
```
Manual inventory tracking: 3 hours/week
HotDash inventory alerts: 15 min/week
Time Saved: 2.75 hours/week on inventory alone
```

---

### Tracking Tool: CEO Time Tracking Dashboard

**Daily Log Format** (Google Sheet):
| Date | Activity | Manual Time | HotDash Time | Saved | Notes |
|------|----------|-------------|--------------|-------|-------|
| Oct 15 | Inventory check | 45 min | 5 min | 40 min | Inventory alerts worked great |
| Oct 15 | Customer support | 90 min | 20 min | 70 min | Approval queue saved time |
| Oct 15 | Sales reporting | 30 min | 2 min | 28 min | Sales Overview tile instant |

**Weekly Total**: Sum all "Saved" column = hours saved this week

---

## Secondary Metric: Dashboard Usage

### Definition
**Daily Active Usage** = CEO logs into dashboard and uses ≥3 tiles per day

**Target**: 
- Week 1: ≥4 days usage
- Week 2: ≥5 days usage
- Week 3-4: 7 days usage (every day)

---

### Measurement Method

**Automatic Tracking** (Mixpanel/Analytics):
- Login events (`dashboard_login`)
- Tile views (`tile_viewed`, properties: tile_name, duration)
- Actions taken (`approval_processed`, `export_csv`, etc.)
- Session duration (total time in dashboard per day)

**Metrics Calculated**:
1. **Login Frequency**: Days/week CEO logs in
2. **Tiles Used**: Average tiles viewed per session
3. **Session Duration**: Minutes per session
4. **Actions per Session**: Number of productive actions taken

**Targets**:
- Login frequency: 7 days/week
- Tiles per session: ≥4 (Sales, Inventory, Ops Pulse, Customer Mood)
- Session duration: ≥5 minutes (engaged, not just glancing)
- Actions per session: ≥3 (approvals, exports, reviews)

---

## Tertiary Metric: Approval Queue Efficiency

### Definition
**Approval Efficiency** = Time per approval (goal: <60 seconds average)

**Components**:
1. **Review Time**: Time from draft displayed to action taken
2. **Decision Quality**: % of approvals that don't require follow-up
3. **Throughput**: Approvals processed per hour

---

### Measurement Method

**Automatic Tracking** (Approval Queue Logs):
```json
{
  "approval_id": "12345",
  "timestamp_displayed": "2025-10-15T09:00:00Z",
  "timestamp_actioned": "2025-10-15T09:00:45Z",
  "review_time_seconds": 45,
  "action": "approve",
  "operator_id": "hot_rod_ceo",
  "confidence_score": 88
}
```

**Metrics Calculated**:
1. **Average Review Time**: Mean of review_time_seconds (target: <60s)
2. **Approval Rate**: % actions = "approve" (vs edit/escalate/reject)
3. **Throughput**: Approvals per hour (target: ≥12)

**Targets**:
- Average review time: <60 seconds
- Approval rate: ≥45% by Week 4
- Throughput: 12-15 approvals/hour

---

## Metrics Dashboard (Real-Time)

### CEO Personal Dashboard

```
┌─────────────────────────────────────────────┐
│ YOUR VALUE TODAY                            │
├─────────────────────────────────────────────┤
│ Time Saved Today: 2.3 hours                 │
│ Value Generated: $3,450 (at $1,500/hr)     │
│                                             │
│ This Week:                                  │
│ - Days Used: 5/7                           │
│ - Time Saved: 11.2 hours                   │
│ - Approvals: 48                            │
│ - Avg Review Time: 52 seconds              │
│                                             │
│ Month to Date:                              │
│ - Total Time Saved: 42 hours               │
│ - Value: $63,000                           │
│ - ROI: 26,250% (vs $200/mo cost)          │
└─────────────────────────────────────────────┘
```

---

## Data Collection Schedule

### Daily (Automatic)
- Dashboard login events
- Tile usage analytics
- Approval queue timestamps
- Actions taken

### Daily (Manual - 1 min)
**CEO Slack Log**: "Saved X hours today on [activity]"

### Weekly (Manual - 2 min)
**Survey Questions**:
1. Total time saved this week? (hours)
2. Most valuable feature? (dropdown)
3. Biggest time-saver? (open-ended)

### Weekly (Automatic)
**Analytics Report**:
- Login frequency (days)
- Total time saved (sum of daily logs)
- Tiles used (count unique)
- Approvals processed (count)

---

## Success Criteria

### Week 1
- [ ] CEO saves ≥4 hours
- [ ] CEO uses dashboard ≥4 days
- [ ] Average review time <90 seconds
- [ ] ≥20 approvals processed

### Week 2
- [ ] CEO saves ≥8 hours
- [ ] CEO uses dashboard ≥5 days
- [ ] Average review time <75 seconds
- [ ] ≥40 approvals processed

### Week 3-4
- [ ] CEO saves ≥10 hours/week
- [ ] CEO uses dashboard 7 days/week
- [ ] Average review time <60 seconds
- [ ] ≥50 approvals/week

---

## ROI Calculation (Automatic Weekly)

**Formula**:
```
Weekly Value = Hours Saved × CEO Hourly Rate
Weekly Cost = HotDash Subscription / 4
Weekly ROI = (Value - Cost) / Cost × 100%
```

**Example (Week 3)**:
```
Hours Saved: 11 hours
CEO Rate: $1,500/hour
Value: 11 × $1,500 = $16,500
Cost: $200 / 4 = $50
ROI: ($16,500 - $50) / $50 = 32,900%
```

**Report to CEO**: Every Monday morning via email

---

## Baseline Data Collection

### Pre-Launch (Oct 14)
- [ ] CEO completes time diary (7 days)
- [ ] Calculate baseline ops time
- [ ] Identify top 3 time sinks
- [ ] Document current tools used

### Launch (Oct 15)
- [ ] Enable analytics tracking
- [ ] First CEO login recorded
- [ ] First approval processed
- [ ] Baseline comparison starts

---

## MCP Tools Integration

**Using Supabase MCP for metrics storage**:
- Store approval queue logs in Supabase
- Query metrics using SQL
- Real-time dashboard powered by Supabase
- Analytics exported for analysis

**Using Google Analytics MCP** (if available):
- Track dashboard events
- Funnel analysis (login → tile view → action)
- Cohort analysis
- User behavior patterns

---

## Evidence File

**Path**: `feedback/product.md`

**Log Format**:
```markdown
### 2025-10-15 - P0 Task 1: Operator Value Metrics

**Timestamp**: 2025-10-15T09:00:00Z
**Status**: Active Tracking

**Today's Metrics**:
- CEO time saved: 2.3 hours
- Dashboard logins: 3
- Tiles used: 5 (Sales, Inventory, Ops, Customer, Approvals)
- Approvals: 12
- Avg review time: 55 seconds

**Evidence**: Analytics dashboard showing usage patterns
**North Star**: Proving 10X operator value with quantified time savings
```

---

**Document Owner**: Product Agent  
**Created**: October 12, 2025  
**Status**: Active - Track Starting Oct 15

**End of Operator Value Metrics Framework**

