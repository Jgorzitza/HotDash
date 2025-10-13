# Launch Day Monitoring Dashboard v2

**Version**: 2.0 (Updated with new analytics schema)  
**Date**: October 13, 2025  
**Owner**: Product Agent  
**Purpose**: Real-time monitoring of CEO usage and app health on launch day  
**Launch Date**: October 15, 2025 (Target)  

---

## Overview

**Goal**: Monitor Hot Rodan CEO's first day using HotDash dashboard

**What We Monitor**:
1. **CEO Activity**: Login frequency, session duration, engagement
2. **Tile Usage**: Which tiles viewed, interaction patterns
3. **Approval Queue**: Approval actions, decision speed
4. **App Health**: Uptime, errors, performance
5. **Feedback**: CEO comments, issues, requests

**Check Frequency**: Every 30 minutes during business hours (9am-6pm ET)

---

## 🎯 Launch Day Success Criteria

### Must-Have (P0 - Launch Blocker)
- ✅ CEO logs in successfully
- ✅ All 5 tiles load without errors
- ✅ CEO can navigate dashboard
- ✅ No P0 bugs (crashes, data loss, auth failures)

### Should-Have (P1 - Fix within 24h)
- ✅ CEO views at least 3 tiles
- ✅ Session duration ≥5 minutes
- ✅ CEO takes at least 1 approval action
- ✅ No P1 bugs (slow loading, visual glitches)

### Nice-to-Have (P2 - Fix within week)
- ✅ CEO logs in 2+ times on Day 1
- ✅ CEO views all 5 tiles
- ✅ CEO provides positive feedback
- ✅ No P2 bugs (minor UX issues)

---

## 📊 Real-Time Monitoring Queries

### Query 1: CEO Activity Summary

**Purpose**: Check if CEO is using the dashboard

**SQL**:
```sql
-- CEO Activity Today
SELECT 
  COUNT(DISTINCT session_id) as total_sessions,
  MIN(login_at) as first_login_time,
  MAX(CASE WHEN logout_at IS NOT NULL THEN logout_at END) as last_logout_time,
  AVG(session_duration_seconds) as avg_session_seconds,
  SUM(session_duration_seconds) as total_time_seconds,
  STRING_AGG(DISTINCT device_type, ', ' ORDER BY device_type) as devices_used,
  COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_sessions,
  COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_sessions
FROM dashboard_sessions
WHERE customer_id = 'hot-rodan'
  AND DATE(login_at) = CURRENT_DATE
  AND user_id LIKE '%ceo%'; -- Adjust to actual CEO user_id
```

**Expected Day 1**:
- `total_sessions`: ≥1 (ideally 2-3)
- `first_login_time`: Within 2 hours of launch email
- `avg_session_seconds`: 300-600 (5-10 minutes)
- `total_time_seconds`: ≥300 (5+ minutes total)

**Red Flags**:
- `total_sessions` = 0 after 2 hours → CEO not logging in
- `avg_session_seconds` < 60 → CEO not engaging
- `total_sessions` = 1 and `avg_session_seconds` < 120 → Quick bounce

---

### Query 2: Tile Engagement

**Purpose**: See which tiles CEO is using

**SQL**:
```sql
-- Tile Usage Today
SELECT 
  tile_name,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT session_id) as sessions_with_tile,
  COUNT(*) FILTER (WHERE interaction_type = 'view') as views,
  COUNT(*) FILTER (WHERE interaction_type = 'click') as clicks,
  COUNT(*) FILTER (WHERE interaction_type = 'expand') as expands,
  COUNT(*) FILTER (WHERE interaction_type = 'refresh') as refreshes,
  MIN(interaction_at) as first_interaction,
  MAX(interaction_at) as last_interaction
FROM tile_interactions
WHERE customer_id = 'hot-rodan'
  AND DATE(interaction_at) = CURRENT_DATE
GROUP BY tile_name
ORDER BY total_interactions DESC;
```

**Expected Day 1**:
- All 5 tiles have ≥1 view
- Top 2-3 tiles have clicks/expands (CEO exploring)
- At least 1 refresh (CEO checking for updates)

**Red Flags**:
- 0 tile interactions → Dashboard not loading or CEO not exploring
- Only 1 tile viewed → CEO stuck or confused
- No clicks/expands → CEO just glancing, not engaging

**Tiles to Track**:
1. `sales-pulse` - Daily sales metrics
2. `inventory-watch` - Low stock alerts
3. `fulfillment-flow` - Order processing
4. `cx-pulse` - Customer support metrics
5. `seo-pulse` - SEO traffic anomalies

---

### Query 3: Approval Queue Activity

**Purpose**: Check if CEO is using approval queue

**SQL**:
```sql
-- Approval Actions Today
SELECT 
  approval_type,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE action = 'approve') as approved,
  COUNT(*) FILTER (WHERE action = 'reject') as rejected,
  COUNT(*) FILTER (WHERE action = 'defer') as deferred,
  COUNT(*) FILTER (WHERE action = 'edit') as edited,
  AVG(time_to_decision_seconds) as avg_decision_seconds,
  MIN(time_to_decision_seconds) as fastest_decision_seconds,
  MAX(time_to_decision_seconds) as slowest_decision_seconds
FROM approval_actions
WHERE customer_id = 'hot-rodan'
  AND DATE(approved_at) = CURRENT_DATE
GROUP BY approval_type
ORDER BY total_actions DESC;
```

**Expected Day 1**:
- ≥1 approval action (CEO trying feature)
- `avg_decision_seconds`: 10-60 (quick decisions)
- Mix of approve/reject (CEO exploring options)

**Red Flags**:
- 0 approvals → Approval queue empty or CEO not finding it
- `avg_decision_seconds` > 300 → CEO confused or hesitant
- All deferred → CEO not confident to take action

---

### Query 4: Error Tracking

**Purpose**: Catch bugs immediately

**SQL**:
```sql
-- Check application logs for errors
-- (This depends on your logging setup - adjust as needed)

-- If using Supabase Edge Functions logs:
SELECT 
  created_at,
  level,
  message,
  metadata
FROM edge_function_logs
WHERE level IN ('error', 'fatal')
  AND created_at > CURRENT_DATE
ORDER BY created_at DESC
LIMIT 20;

-- If using custom error tracking table:
SELECT 
  error_type,
  error_message,
  stack_trace,
  user_id,
  created_at
FROM error_logs
WHERE created_at > CURRENT_DATE
  AND customer_id = 'hot-rodan'
ORDER BY created_at DESC;
```

**Expected Day 1**: 0 errors

**Red Flags**:
- Any error with `level = 'fatal'` → P0 bug
- Repeated errors (>3 same error) → Systematic issue
- Errors during CEO session → CEO experiencing bugs

---

## 🕐 Monitoring Schedule

### Hour 0-1 (Launch Window)
**Actions**:
- [ ] Send launch email to CEO: "Dashboard is ready! Login at [URL]"
- [ ] Monitor for first login (Query 1 every 15 minutes)
- [ ] Watch error logs (Query 4 continuously)

**Success**: CEO logs in within 1 hour

**If No Login After 1 Hour**:
1. Send Slack reminder: "Hey! Dashboard is live. Need help getting started?"
2. If no response in 30 min: Call CEO directly

---

### Hour 1-2 (First Session)
**Actions**:
- [ ] Monitor tile engagement (Query 2 every 15 minutes)
- [ ] Check session duration (Query 1)
- [ ] Watch for errors (Query 4)
- [ ] Prepare to respond to feedback

**Success**: CEO views ≥3 tiles, session ≥5 minutes

**If Issues**:
- CEO bounces quickly (<2 min) → Call immediately: "What happened?"
- CEO stuck on one tile → Slack: "Need help navigating?"
- Errors appear → Engineer escalation (P0 fix within 2 hours)

---

### Hour 2-4 (Continued Usage)
**Actions**:
- [ ] Monitor for second login (Query 1)
- [ ] Check approval queue usage (Query 3)
- [ ] Review tile usage patterns (Query 2)
- [ ] Document feedback

**Success**: CEO logs in again OR provides positive feedback

**If Issues**:
- No second login and no feedback → Slack: "How's it going? Any issues?"
- CEO reports bugs → Triage and escalate to Engineer

---

### Hour 4-8 (End of Day)
**Actions**:
- [ ] Run end-of-day summary queries
- [ ] Compile feedback and issues
- [ ] Create Linear tickets for bugs/features
- [ ] Send end-of-day report to Manager

**Success**: CEO used dashboard ≥2 times, no P0 bugs

---

## 📋 Launch Day Checklist

### Pre-Launch (T-1 Hour)
- [ ] Verify app deployed to production
  - Command: `fly status -a hotdash-production`
  - Expected: Status = running, Health = passing
- [ ] Verify all 5 tiles loading
  - Manual test: Open dashboard, check each tile renders
- [ ] Verify Shopify data syncing
  - Query: `SELECT MAX(updated_at) FROM shopify_orders;`
  - Expected: Recent timestamp (within 1 hour)
- [ ] Verify analytics tracking working
  - Test: Login, view tile, check `dashboard_sessions` and `tile_interactions`
- [ ] Send launch email to CEO
  - Subject: "Your HotDash Dashboard is Ready!"
  - Body: Login URL, quick start guide link, support contact

---

### First Hour (T+0 to T+1)
- [ ] Monitor for CEO first login (Query 1)
- [ ] Watch error logs (Query 4)
- [ ] Stand by for immediate support

**Milestone**: CEO first login ✅

---

### First Session (T+1 to T+2)
- [ ] Monitor tile engagement (Query 2)
- [ ] Check session duration (Query 1)
- [ ] Watch for errors (Query 4)
- [ ] Respond to feedback immediately

**Milestone**: CEO views ≥3 tiles, session ≥5 minutes ✅

---

### Rest of Day (T+2 to T+8)
- [ ] Monitor for additional logins (Query 1)
- [ ] Check approval queue usage (Query 3)
- [ ] Document all feedback
- [ ] Triage and escalate bugs

**Milestone**: CEO logs in ≥2 times, no P0 bugs ✅

---

### End of Day (T+8)
- [ ] Run summary queries (all 4 queries)
- [ ] Compile end-of-day report
- [ ] Create Linear tickets
- [ ] Send report to Manager
- [ ] Plan Day 2 priorities

**Milestone**: Day 1 summary complete ✅

---

## 🚨 Escalation Protocol

### P0 - Critical (Fix Immediately, <2 Hour SLA)
**Examples**:
- App won't load (white screen, 500 error)
- Authentication failure (CEO can't login)
- Data loss (orders/customers missing)
- Tile crashes (JavaScript error, infinite loop)

**Actions**:
1. Product triages immediately (<15 min)
2. Escalate to Engineer for emergency fix
3. Engineer deploys hotfix (<2 hours)
4. Product verifies fix with CEO
5. Document incident in Linear

---

### P1 - High (Fix Within 24 Hours)
**Examples**:
- Slow loading (>5 seconds)
- Visual glitches (layout broken, images missing)
- Incorrect data (numbers don't match Shopify)
- Feature not working (approval queue empty)

**Actions**:
1. Product triages within 1 hour
2. Create Linear ticket with details
3. Engineer fixes next business day
4. Product verifies fix
5. Notify CEO when fixed

---

### P2 - Medium (Fix Within Week)
**Examples**:
- Minor UX issues (button placement, color)
- Feature requests (new tile, new metric)
- Performance improvements (faster loading)
- Mobile responsiveness tweaks

**Actions**:
1. Product logs in Linear
2. Prioritize in weekly planning
3. Engineer fixes in next sprint
4. Product verifies and notifies CEO

---

## 📊 End-of-Day Report Template

```markdown
# Launch Day 1 Report - October 15, 2025

## CEO Activity
- **First Login**: 9:47am ET ✅
- **Total Sessions**: 3
- **Total Time**: 18 minutes
- **Devices**: Desktop (2 sessions), Mobile (1 session)
- **Engagement**: HIGH ✅

## Tile Engagement
| Tile | Views | Clicks | Refreshes |
|------|-------|--------|-----------|
| Sales Pulse | 5 | 2 | 1 |
| SEO Pulse | 4 | 3 | 2 |
| Inventory Watch | 3 | 1 | 0 |
| CX Pulse | 2 | 0 | 0 |
| Fulfillment Flow | 2 | 1 | 0 |

**Top Tiles**: Sales Pulse, SEO Pulse (CEO favorites)

## Approval Queue
- **Total Actions**: 2
- **Approved**: 1 (order refund)
- **Rejected**: 1 (discount code)
- **Avg Decision Time**: 25 seconds ✅

## App Health
- **Uptime**: 100% ✅
- **Errors**: 0 ✅
- **Avg Response Time**: 1.2s ✅
- **Performance**: EXCELLENT ✅

## Feedback Received
1. "Love the SEO Pulse tile! Caught a ranking drop immediately." ✅
2. "Sales Pulse numbers match Shopify perfectly." ✅
3. "Would love to see inventory alerts on mobile." (P2 feature request)

## Bugs Identified
- **P0**: None ✅
- **P1**: None ✅
- **P2**: Mobile inventory tile needs better formatting (Linear #123)

## Next Steps
1. Monitor Day 2 usage (target: 2+ logins)
2. Implement mobile inventory improvements (P2)
3. Weekly check-in call scheduled for Friday
4. Continue monitoring analytics

## Overall Assessment
✅ **SUCCESS** - CEO actively using dashboard, no critical issues, positive feedback

**Confidence**: HIGH - Pilot off to strong start
```

---

## 📈 Week 1 Monitoring Plan

**Day 1**: Intensive monitoring (every 30 min)  
**Day 2-3**: Regular monitoring (every 2 hours)  
**Day 4-5**: Daily check-ins (morning + evening)  
**Day 6-7**: Daily summary only  

**Week 1 Goal**: CEO logs in ≥5 days, uses ≥3 tiles daily, provides feedback

---

## Tools & Access

### Required Access
- **Supabase**: Production database read access
- **Fly.io**: Production app logs and status
- **Linear**: Bug tracking and feature requests
- **Slack**: Direct CEO communication channel

### Monitoring Commands
```bash
# Check app status
fly status -a hotdash-production

# View recent logs
fly logs -a hotdash-production --recent

# Check database connection
psql $DATABASE_URL -c "SELECT NOW();"

# Run analytics query
psql $DATABASE_URL -f queries/ceo_activity_summary.sql
```

### Analytics Queries Location
- Saved in: `docs/product/analytics_queries/`
- Files:
  - `ceo_activity_summary.sql`
  - `tile_engagement.sql`
  - `approval_queue_metrics.sql`
  - `error_tracking.sql`

---

## Success Metrics

### Day 1 Success
- ✅ CEO logs in within 2 hours
- ✅ CEO views ≥3 tiles
- ✅ Session duration ≥5 minutes
- ✅ No P0 bugs
- ✅ CEO provides feedback

### Week 1 Success
- ✅ CEO logs in ≥5 days
- ✅ CEO uses ≥3 tiles daily
- ✅ CEO takes ≥5 approval actions
- ✅ No P0/P1 bugs
- ✅ CEO satisfaction: "This is helpful"

### Month 1 Success
- ✅ CEO logs in ≥20 days
- ✅ CEO has 2-3 favorite tiles
- ✅ CEO takes ≥20 approval actions
- ✅ CEO reports time savings
- ✅ CEO willing to pay for product

---

**Status**: Ready for launch day monitoring  
**Next**: Execute on October 15, 2025  
**Owner**: Product Agent  
**Evidence**: docs/product/launch_day_monitoring_v2.md  
**Timestamp**: 2025-10-13T22:40:00Z
