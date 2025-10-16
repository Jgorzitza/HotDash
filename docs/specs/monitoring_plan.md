# Post-Launch Monitoring Plan

**Document Type:** Operational Monitoring  
**Owner:** Product Agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Scope:** Dashboard and Approvals Workflow

---

## Monitoring Objectives

1. **Ensure Performance:** Dashboard loads <3s (P95), uptime ≥99.9%
2. **Ensure Accuracy:** Data matches source systems 100%
3. **Ensure Usability:** CEO can complete workflows without errors
4. **Detect Issues Early:** Alert before user impact
5. **Track Success Metrics:** Measure against NORTH_STAR goals

---

## Metrics to Monitor

### 1. Performance Metrics

**Dashboard Load Time:**
- **Metric:** Time from request to fully interactive (TTI)
- **Target:** P95 <3 seconds
- **Measurement:** Browser Performance API, Lighthouse CI
- **Alert Threshold:** P95 >5 seconds for >5 minutes
- **Collection Frequency:** Every page load
- **Retention:** 90 days

**API Response Time:**
- **Metric:** Time for `/approvals`, `/dashboard`, `/tiles/*` endpoints
- **Target:** P95 <500ms
- **Measurement:** Server-side timing logs
- **Alert Threshold:** P95 >1 second for >5 minutes
- **Collection Frequency:** Every request
- **Retention:** 30 days

**Uptime:**
- **Metric:** Percentage of time dashboard is accessible
- **Target:** ≥99.9% (30-day rolling window)
- **Measurement:** External uptime monitor (UptimeRobot, Pingdom)
- **Alert Threshold:** <99.5% in 24-hour window
- **Collection Frequency:** Every 1 minute
- **Retention:** 365 days

---

### 2. Data Accuracy Metrics

**Revenue Accuracy:**
- **Metric:** Dashboard revenue vs Shopify Admin revenue
- **Target:** ±1% tolerance
- **Measurement:** Automated comparison script (hourly)
- **Alert Threshold:** >5% mismatch
- **Collection Frequency:** Hourly
- **Retention:** 90 days

**Inventory Accuracy:**
- **Metric:** Dashboard inventory counts vs Supabase snapshots
- **Target:** 100% exact match
- **Measurement:** Automated comparison script (every 15 min)
- **Alert Threshold:** >10 items mismatch
- **Collection Frequency:** Every 15 minutes
- **Retention:** 30 days

**CX Queue Accuracy:**
- **Metric:** Dashboard pending count vs Chatwoot API
- **Target:** 100% exact match
- **Measurement:** Automated comparison script (every 5 min)
- **Alert Threshold:** Any mismatch
- **Collection Frequency:** Every 5 minutes
- **Retention:** 7 days

**Approvals Count Accuracy:**
- **Metric:** Dashboard badge count vs `/approvals` API
- **Target:** 100% exact match
- **Measurement:** Frontend validation on load
- **Alert Threshold:** Any mismatch
- **Collection Frequency:** Every page load
- **Retention:** 7 days

---

### 3. Workflow Completion Metrics

**Approval Processing Success Rate:**
- **Metric:** Successful approvals / Total approval attempts
- **Target:** 100%
- **Measurement:** Server-side logs
- **Alert Threshold:** <95% in 1-hour window
- **Collection Frequency:** Every approval attempt
- **Retention:** 90 days

**Approval Latency:**
- **Metric:** Time from approval created to approved/rejected
- **Target:** Median ≤15 minutes (CX), ≤30 minutes (other)
- **Measurement:** Timestamp diff in Supabase
- **Alert Threshold:** Median >30 minutes (CX)
- **Collection Frequency:** Every approval
- **Retention:** 90 days

**Error Rate:**
- **Metric:** 4xx/5xx errors / Total requests
- **Target:** <0.5%
- **Measurement:** Server access logs
- **Alert Threshold:** >5% in 5-minute window
- **Collection Frequency:** Every request
- **Retention:** 30 days

---

### 4. Usage Metrics

**Dashboard Sessions:**
- **Metric:** Number of dashboard sessions per day
- **Target:** ≥5 sessions/day (CEO usage)
- **Measurement:** Google Analytics or custom events
- **Alert Threshold:** 0 sessions in 24 hours
- **Collection Frequency:** Every session
- **Retention:** 365 days

**Page Views per Session:**
- **Metric:** Average page views per session
- **Target:** ≥3 (indicates engagement)
- **Measurement:** Google Analytics
- **Alert Threshold:** <1 (indicates bounce)
- **Collection Frequency:** Every session
- **Retention:** 90 days

**Time on Dashboard:**
- **Metric:** Average session duration
- **Target:** 2-10 minutes (engaged but efficient)
- **Measurement:** Google Analytics
- **Alert Threshold:** <30 seconds (indicates issue)
- **Collection Frequency:** Every session
- **Retention:** 90 days

**Approvals Processed per Day:**
- **Metric:** Number of approvals approved/rejected per day
- **Target:** ≥10/week (varies by business activity)
- **Measurement:** Supabase approvals table
- **Alert Threshold:** 0 in 48 hours (if expected)
- **Collection Frequency:** Daily rollup
- **Retention:** 365 days

**Most Viewed Tiles:**
- **Metric:** Click-through rate on each tile
- **Target:** N/A (informational)
- **Measurement:** Click event tracking
- **Alert Threshold:** None
- **Collection Frequency:** Every click
- **Retention:** 90 days

---

### 5. User Satisfaction Metrics

**CEO Satisfaction Score:**
- **Metric:** 1-5 rating on usability, clarity, usefulness
- **Target:** ≥4.0 average
- **Measurement:** Weekly survey (first month), monthly thereafter
- **Alert Threshold:** <3.0 on any dimension
- **Collection Frequency:** Weekly/monthly
- **Retention:** 365 days

**Support Tickets:**
- **Metric:** Number of dashboard-related support tickets
- **Target:** <2/week
- **Measurement:** Support ticket system tags
- **Alert Threshold:** >5/week
- **Collection Frequency:** Daily
- **Retention:** 365 days

**Feature Requests:**
- **Metric:** Number of feature requests logged
- **Target:** N/A (informational)
- **Measurement:** GitHub Issues with `feature-request` label
- **Alert Threshold:** None
- **Collection Frequency:** Continuous
- **Retention:** Permanent

---

## Monitoring Tools

### 1. Google Analytics (Usage Metrics)
**Setup:**
- GA4 property for dashboard
- Custom events: tile_click, approval_action, error_occurred
- User ID tracking (CEO)

**Dashboards:**
- Daily active users
- Session duration
- Page views per session
- Event funnel (dashboard → approvals → approve/reject)

---

### 2. Prometheus + Grafana (Performance & Errors)
**Setup:**
- Prometheus scrapes `/metrics` endpoint
- Grafana dashboards for visualization
- Alertmanager for threshold alerts

**Metrics Collected:**
- `http_request_duration_seconds` (histogram)
- `http_requests_total` (counter)
- `http_errors_total` (counter by status code)
- `dashboard_load_time_seconds` (histogram)
- `approvals_processed_total` (counter)
- `approvals_latency_seconds` (histogram)

**Dashboards:**
- Performance overview (load time, API latency)
- Error rates (4xx, 5xx by endpoint)
- Approvals workflow (processing rate, latency)

---

### 3. Sentry (Error Tracking)
**Setup:**
- Sentry SDK in frontend and backend
- Source maps uploaded for stack traces
- User context (CEO ID)

**Alerts:**
- New error types
- Error spike (>10 errors/min)
- Unhandled exceptions

**Dashboards:**
- Error frequency by type
- Affected users
- Stack traces and breadcrumbs

---

### 4. Supabase Logs (Data & Audit)
**Setup:**
- Supabase logging enabled
- Custom audit tables: `approvals`, `audit_logs`, `data_validation`

**Queries:**
- Data accuracy validation (hourly cron)
- Approval latency calculation (daily rollup)
- User activity logs

**Dashboards:**
- Data accuracy trends
- Approval workflow metrics
- Audit trail for compliance

---

### 5. UptimeRobot (Uptime Monitoring)
**Setup:**
- HTTP monitor for dashboard URL
- Check interval: 1 minute
- Alert contacts: Manager, CEO

**Alerts:**
- Dashboard down (>2 consecutive failures)
- Response time >5 seconds

---

## Alert Configuration

### Critical Alerts (Immediate Response <5 min)

**Dashboard Down:**
- **Condition:** HTTP status ≠200 for >2 minutes
- **Notification:** Slack #alerts, Email (Manager, CEO)
- **Action:** Check Fly.io status, review logs, consider rollback

**Data Corruption:**
- **Condition:** Revenue mismatch >50% OR inventory negative
- **Notification:** Slack #alerts, Email (Manager, CEO)
- **Action:** Immediate rollback, data restoration

**Security Alert:**
- **Condition:** Gitleaks violation OR failed auth >10/min
- **Notification:** Slack #security, Email (Manager)
- **Action:** Investigate, rotate credentials, rollback if needed

---

### High Alerts (Urgent Response <15 min)

**Performance Degradation:**
- **Condition:** P95 load time >5s for >5 minutes
- **Notification:** Slack #alerts
- **Action:** Check server resources, review recent deploys, consider rollback

**High Error Rate:**
- **Condition:** Error rate >5% for >5 minutes
- **Notification:** Slack #alerts
- **Action:** Review Sentry, check API dependencies, consider rollback

**Data Accuracy Issue:**
- **Condition:** Revenue mismatch >5% OR inventory mismatch >10 items
- **Notification:** Slack #alerts
- **Action:** Investigate sync jobs, verify API connections

---

### Medium Alerts (Standard Response <30 min)

**Approval Latency High:**
- **Condition:** Median CX approval latency >30 min
- **Notification:** Slack #product
- **Action:** Review CEO workflow, check for blockers

**Low Usage:**
- **Condition:** 0 dashboard sessions in 24 hours
- **Notification:** Slack #product
- **Action:** Check with CEO, verify dashboard accessible

---

### Low Alerts (Informational)

**Feature Request:**
- **Condition:** New GitHub Issue with `feature-request` label
- **Notification:** Slack #product
- **Action:** Review and prioritize

**Support Ticket:**
- **Condition:** New support ticket tagged `dashboard`
- **Notification:** Slack #support
- **Action:** Respond and resolve

---

## Monitoring Schedule

### Real-Time (Continuous)
- Dashboard uptime (UptimeRobot, 1-min interval)
- Error tracking (Sentry, real-time)
- Performance metrics (Prometheus, 15-sec scrape)

### Hourly
- Revenue accuracy validation
- API health checks
- Log aggregation

### Daily
- Approval latency rollup
- Usage metrics summary
- Data accuracy report
- Support ticket review

### Weekly
- CEO satisfaction survey (first month)
- Performance trend analysis
- Feature request review
- Incident log review

### Monthly
- CEO satisfaction survey (after first month)
- Success metrics review vs NORTH_STAR
- Monitoring tool health check
- Alert threshold tuning

---

## 30-Day Success Criteria

**Performance:**
- [ ] P95 load time <3s maintained
- [ ] Uptime ≥99.9%
- [ ] Error rate <0.5%

**Usage:**
- [ ] CEO uses dashboard daily (≥5 sessions/day)
- [ ] ≥10 approvals processed/week
- [ ] Average session duration 2-10 minutes

**Satisfaction:**
- [ ] CEO satisfaction ≥4.0/5.0
- [ ] <2 support tickets/week
- [ ] No critical issues reported

**Data Accuracy:**
- [ ] Revenue accuracy ≥99%
- [ ] Inventory accuracy 100%
- [ ] CX queue accuracy 100%
- [ ] Approvals count accuracy 100%

---

## Monitoring Runbook

### Daily Monitoring Checklist (Manager)

**Morning (9 AM):**
- [ ] Check uptime status (should be 100% last 24h)
- [ ] Review error rate (should be <0.5%)
- [ ] Check data accuracy report (should be 100%)
- [ ] Review overnight alerts (should be 0 critical)

**Afternoon (3 PM):**
- [ ] Check dashboard usage (CEO sessions today)
- [ ] Review approval latency (median <15 min for CX)
- [ ] Check support tickets (any new dashboard issues?)

**Evening (6 PM):**
- [ ] Review daily metrics summary
- [ ] Update incident log if any issues
- [ ] Plan next day priorities

---

### Weekly Monitoring Review (Manager + CEO)

**Metrics Review:**
- [ ] Performance trends (load time, uptime, errors)
- [ ] Usage trends (sessions, approvals, time on dashboard)
- [ ] Satisfaction score (CEO survey)
- [ ] Data accuracy trends

**Issue Review:**
- [ ] Open support tickets
- [ ] Feature requests
- [ ] Incidents this week
- [ ] Planned improvements

**Action Items:**
- [ ] Prioritize fixes
- [ ] Schedule improvements
- [ ] Update monitoring if needed

---

## Document Control

**Version History:**
- 1.0 (2025-10-15): Initial monitoring plan by Product Agent

**Review Schedule:**
- Manager: Approve monitoring approach and alert thresholds
- Engineer: Validate technical implementation
- CEO: Approve satisfaction metrics and survey questions

**Related Documents:**
- `docs/specs/dashboard_launch_readiness.md` - Launch checklist
- `docs/specs/rollback_criteria.md` - Rollback triggers
- `docs/NORTH_STAR.md` - Success metrics

