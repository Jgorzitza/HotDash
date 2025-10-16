# Dashboard Launch Readiness

**Document Type:** Launch Readiness Summary
**Owner:** Product Agent
**Version:** 1.0
**Date:** 2025-10-16
**Status:** Ready for Review
**Alignment:** NORTH_STAR M0-M1 Foundation

---

## Executive Summary

This document consolidates launch readiness criteria, user acceptance testing, success metrics, and operational procedures for the Hot Rod AN Control Center dashboard.

---

## 1. Pre-Launch Verification Checklist

### Functional Completeness
- [ ] All 7 dashboard tiles load and display data correctly
- [ ] Approvals queue functional (list view, cards, auto-refresh)
- [ ] Navigation works (all links, badges update)
- [ ] Empty states display when no data
- [ ] Error states display when API unavailable
- [ ] Loading states show during data fetch

### Performance Metrics
- [ ] Dashboard load time P95 <3 seconds
- [ ] Lighthouse performance score ≥90
- [ ] TTI (Time to Interactive) <3 seconds
- [ ] LCP (Largest Contentful Paint) <2.5 seconds
- [ ] FCP (First Contentful Paint) <1.5 seconds

### Data Accuracy
- [ ] Revenue matches Shopify Admin (±1% tolerance)
- [ ] AOV matches Shopify Admin (±1% tolerance)
- [ ] Returns count matches Shopify (exact)
- [ ] Inventory counts match Supabase (exact)
- [ ] CX queue count matches Chatwoot API (exact)
- [ ] Approvals count matches `/approvals` API (exact)

### Responsive Design
- [ ] Mobile (iPhone SE 375px) - all features work
- [ ] Mobile (iPhone 12 390px) - all features work
- [ ] Tablet (iPad 768px) - all features work
- [ ] Tablet (iPad Pro 1024px) - all features work
- [ ] Desktop (1920x1080) - all features work
- [ ] Desktop (2560x1440) - all features work
- [ ] No horizontal scroll on any device
- [ ] Text readable (min 16px on mobile)
- [ ] Buttons touch-friendly (min 44px)

### Accessibility (WCAG 2.1 AA)
- [ ] axe DevTools audit passes (0 violations)
- [ ] Lighthouse accessibility score ≥95
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Screen reader compatible (VoiceOver/NVDA)
- [ ] ARIA labels on interactive elements
- [ ] Color contrast ≥4.5:1 (normal text)
- [ ] Color contrast ≥3:1 (large text, interactive)

### Security & Compliance
- [ ] No secrets in code (Gitleaks clean)
- [ ] HTTPS enforced (production)
- [ ] Authentication required for all routes
- [ ] Authorization checks in place
- [ ] No PII displayed without authorization
- [ ] Data access logged (audit trail)

---

## 2. User Acceptance Criteria

### Dashboard Tiles (7 Tiles)

**Revenue Tile:**
- Displays current revenue with trend indicator
- Matches Shopify Admin data (±1%)
- Loads in <3 seconds (P95)
- Responsive on all devices

**AOV Tile:**
- Displays average order value
- Calculation: Total Revenue / Number of Orders
- Highlights if below target threshold
- Trend vs previous period

**Returns Tile:**
- Displays return rate (returns / total orders)
- Shows pending returns count
- Highlights high return rate (>5%)

**Stock Risk Tile:**
- Status buckets: urgent_reorder, low_stock, out_of_stock
- WOS (Weeks of Stock) calculation
- Matches Supabase inventory snapshots

**SEO Anomalies Tile:**
- Traffic drops >20% detection
- Ranking changes >5 positions
- Critical errors (404s, broken links)

**CX Queue Tile:**
- Pending conversations by channel (Email, Chat, SMS)
- SLA highlighting (>15 min overdue)
- Matches Chatwoot API

**Approvals Queue Tile:**
- Pending approvals count
- Breakdown by type (CX, Inventory, Growth)
- High-risk highlighting
- Badge on navigation

### Approvals Queue Page

**List View:**
- All pending approvals displayed
- Auto-refresh every 5 seconds
- Empty state when no approvals
- Error state if API unavailable

**Approval Card:**
- Agent name, tool name, arguments preview
- Created timestamp, risk level
- Approve/Reject buttons (disabled in dev mode)
- Loading and success/error states

---

## 3. Success Metrics

### Performance (from NORTH_STAR)
- **Dashboard load time:** P95 <3 seconds
- **TTI:** <3 seconds
- **LCP:** <2.5 seconds
- **FCP:** <1.5 seconds
- **Lighthouse performance:** ≥90

### Data Accuracy
- **Revenue:** ±1% vs Shopify
- **Inventory:** 100% exact match vs Supabase
- **CX Queue:** 100% exact match vs Chatwoot
- **Approvals:** 100% exact match vs API

### Workflow Completion
- **Approve/reject success rate:** 100%
- **API error rate:** <0.5%
- **User can complete without errors:** Yes

### User Satisfaction
- **CEO satisfaction:** ≥4.0/5.0
- **Daily usage:** ≥5 sessions/day
- **Post-launch survey:** ≥4.0 average

---

## 4. Go/No-Go Decision Criteria

### GO if:
- ✅ All functional completeness checks pass
- ✅ Performance metrics meet targets (P95 <3s)
- ✅ Data accuracy ≥99%
- ✅ Accessibility audit passes (WCAG 2.1 AA)
- ✅ Responsive design works on all devices
- ✅ Error handling tested and working
- ✅ Security checks pass
- ✅ Rollback plan tested
- ✅ CEO training complete

### NO-GO if:
- ❌ Any critical functionality broken
- ❌ Performance metrics not met
- ❌ Data accuracy <95%
- ❌ Critical accessibility violations
- ❌ Security vulnerabilities present
- ❌ Rollback plan not tested

### CONDITIONAL GO (with caveats):
- ⚠️ Minor usability issues (can fix post-launch)
- ⚠️ Performance slightly below target (can optimize)
- ⚠️ Non-critical features missing (can add later)

---

## 5. Rollback Plan

### Trigger Conditions
- Dashboard load time >5 seconds (P95) sustained >15 min
- Data accuracy <95%
- Critical accessibility violations
- Security vulnerability discovered
- CEO requests rollback

### Rollback Procedure (Estimated Time: <5 minutes)

**Step 1: Disable new dashboard**
```bash
fly secrets set ENABLE_NEW_DASHBOARD=false -a hot-dash
```

**Step 2: Verify rollback**
- [ ] Previous dashboard loads
- [ ] All features functional
- [ ] No console errors

**Step 3: Notify stakeholders**
- [ ] CEO notified (Slack/email)
- [ ] Team notified (Slack)
- [ ] Incident logged

**Step 4: Root cause analysis**
- [ ] Identify trigger
- [ ] Document in incident log
- [ ] Plan fix or alternative

---

## 6. Post-Launch Monitoring (30 Days)

### Metrics to Track

**Performance:**
- Dashboard load time (P50, P95, P99)
- API response times
- Error rate
- Uptime (target: ≥99.9%)

**Usage:**
- Dashboard sessions per day
- Page views per session
- Time on dashboard
- Approvals processed per day

**Data Accuracy:**
- Revenue accuracy (daily check)
- Inventory accuracy (hourly check)
- CX queue accuracy (every 5 min)
- Approvals count accuracy (every load)

**User Satisfaction:**
- CEO satisfaction score (weekly survey)
- Support tickets (target: <2/week)
- Feature requests logged

### 30-Day Success Criteria
- [ ] P95 load time <3s maintained
- [ ] Error rate <0.5%
- [ ] Uptime ≥99.9%
- [ ] CEO uses dashboard daily (≥5 sessions/day)
- [ ] ≥10 approvals processed/week
- [ ] CEO satisfaction ≥4.0/5.0
- [ ] No critical issues reported

---

## 7. User Training Requirements

### Documentation
- [ ] Dashboard Overview Guide created
- [ ] Approvals Workflow Guide created
- [ ] Troubleshooting Guide created
- [ ] Quick Reference Card created

### Training Session
- [ ] CEO training scheduled (30 min)
- [ ] Training materials prepared
- [ ] Demo environment ready
- [ ] Q&A time allocated

### Post-Training
- [ ] CEO completes first approval
- [ ] CEO grades first AI response
- [ ] CEO uses dashboard on mobile
- [ ] Feedback collected

---

## 8. Launch Day Checklist

### Morning of Launch
- [ ] Verify all systems operational
- [ ] Run final performance test
- [ ] Verify data accuracy
- [ ] Check error logs (should be clean)
- [ ] Notify CEO of launch
- [ ] Enable new dashboard

### During Launch
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor user activity
- [ ] Be ready to rollback if needed

### End of Day
- [ ] Review metrics (usage, performance, errors)
- [ ] Collect initial feedback from CEO
- [ ] Log any issues discovered
- [ ] Plan next day's priorities


### Evidence Artifacts to Attach on Launch Day
- Final Lighthouse report (JSON or screenshot) showing Performance ≥90, LCP <2.5s, TTI <3s
- axe DevTools export (0 violations)
- Screenshots: all 7 tiles loaded, approvals card with Approve/Reject disabled (dev mode)
- Data validation screenshots: Shopify vs Revenue tile (±1%), Supabase vs Inventory (exact), Chatwoot vs CX queue (exact)
- Logs excerpt: error logs empty at launch (timestamped)
- Monitoring dashboard screenshot: initial P50/P95, error rate, uptime baselines
- Rollback dry run evidence (non‑prod): before/after screenshots + logs
- Docs policy and secrets scans: outputs of `node scripts/policy/check-docs.mjs` and `gitleaks detect --redact`

Cross‑links for reviewers:
- See monitoring details in `docs/specs/monitoring_plan.md`
- See rollback steps in `docs/specs/rollback_criteria.md`
- See comms templates in `docs/specs/stakeholder_comms.md`

---

## 9. Receipts & Verification Commands

Use these to capture evidence before Go/No-Go and attach outputs to the PR/feedback.

- Docs policy check (allowed Markdown paths):
  ```bash
  node scripts/policy/check-docs.mjs
  ```
- Secret scanning (local preflight):
  ```bash
  gitleaks detect --source . --redact
  ```
- Accessibility quick scan:
  - Run axe DevTools in browser; export report (expect 0 violations)
- Performance quick check (staging/local):
  - Use Lighthouse in Chrome (Performance ≥90, LCP <2.5s, TTI <3s)
- Data accuracy spot checks (read-only):
  - Shopify Admin vs dashboard revenue (±1%)
  - Supabase snapshots vs inventory tile (exact)
  - Chatwoot queue vs CX tile (exact)
- Approvals dev-mode safety:
  - Confirm Approve/Reject disabled in dev; evidence via UI screenshot
- Rollback dry run (non-prod):
  - Toggle feature flag off/on; verify before/after states and logs


## 10. Reviewer Sign-off

Use this block to record formal approvals pre-launch. Link to evidence above or PR attachments.

- [ ] QA Reviewer: __________  Date: __________  Evidence: [axe report], [test run], [screenshots]
- [ ] Engineer Reviewer: __________  Date: __________  Evidence: [perf report], [logs], [rollback dry run]
- [ ] Manager: __________  Date: __________  Evidence: [metrics screenshots], [policy checks], [risk review]
- [ ] CEO: __________  Date: __________  Evidence: [training complete], [first approval], [mobile usage]

## Document Control

**Version History:**
- 1.0 (2025-10-16): Initial launch readiness document by Product Agent

**Review Schedule:**
- QA Agent: Validate test procedures and acceptance criteria
- Engineer Agent: Confirm technical readiness and rollback procedures
- Manager: Approve go/no-go criteria and launch plan
- CEO: Approve training materials and user acceptance criteria

**Related Documents:**
- `docs/specs/user_training.md` - Training materials
- `docs/specs/feature_prioritization.md` - Feature prioritization
- `docs/specs/rollback_criteria.md` - Detailed rollback procedures
- `docs/specs/monitoring_plan.md` - Detailed monitoring plan
- `docs/specs/stakeholder_comms.md` - Communication templates
- `docs/NORTH_STAR.md` - Success metrics source

