# Comprehensive Acceptance Criteria - All Features

**Document Type:** Acceptance Criteria Collection  
**Owner:** Product Agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Scope:** Backlog items 2-7 (Approvals Drawer, Inventory ROP, SEO, CX HITL, Ads, Content)

---

## 2. Approvals Drawer Acceptance Criteria

### Functional Requirements
- [ ] Opens from tile "Review" button or approval card click
- [ ] Supports deep-link: `?approvalId=<id>`
- [ ] Polaris Drawer component (large size)
- [ ] Shows approval details: agent, tool, arguments, created, risk level
- [ ] Evidence section with tabs: Diffs, Samples, Queries/Links, Screenshots
- [ ] Grading interface: Tone, Accuracy, Policy (1-5 sliders)
- [ ] Actions: Approve (primary), Request Changes, Reject
- [ ] Approve disabled until `/validate` endpoint returns OK
- [ ] Loading states during actions
- [ ] Success/error feedback after actions

### Acceptance Criteria
- [ ] Drawer opens smoothly (<300ms animation)
- [ ] Deep-link loads correct approval
- [ ] All evidence fields displayed correctly
- [ ] Tabs switch without lag
- [ ] Diffs formatted with syntax highlighting
- [ ] Grading sliders work smoothly (1-5 scale)
- [ ] Grading required for CX approvals (validation)
- [ ] Approve button disabled until validation passes
- [ ] Actions call correct API endpoints
- [ ] Success banner shows after approval
- [ ] Error banner shows if action fails
- [ ] Drawer closes on backdrop click or X button
- [ ] Focus trapped in drawer (accessibility)
- [ ] Keyboard navigation works (Tab, Enter, Escape)

### Test Cases
1. Open drawer from tile → verify opens
2. Open drawer from card → verify opens
3. Deep-link to approval → verify loads correct one
4. Switch evidence tabs → verify content changes
5. Grade approval → verify sliders work
6. Approve without grading (CX) → verify validation error
7. Approve with grading → verify success
8. Reject approval → verify confirmation dialog
9. Close drawer → verify closes
10. Keyboard navigation → verify all elements reachable

---

## 3. Inventory ROP Acceptance Criteria

### Functional Requirements
- [ ] ROP formula: `avg_daily_sales * lead_time_days + safety_stock`
- [ ] Safety stock: `(max_daily_sales * max_lead_days) - (avg_daily_sales * avg_lead_days)`
- [ ] Sales velocity calculated from last 30/60/90 days
- [ ] Lead time data from Supabase `vendors` table
- [ ] Status buckets: `in_stock`, `low_stock`, `out_of_stock`, `urgent_reorder`
- [ ] WOS (Weeks of Stock): `current_stock / avg_weekly_sales`
- [ ] Kit/bundle detection via Shopify tag `BUNDLE:TRUE`
- [ ] PO CSV export with columns: SKU, Product, Qty, Vendor, Cost, Lead Time
- [ ] Approvals workflow for PO generation

### Acceptance Criteria
- [ ] ROP calculated for 100% of products
- [ ] Safety stock formula accurate (verified manually)
- [ ] Sales velocity uses 30/60/90 day averages
- [ ] Lead time data pulled from Supabase
- [ ] Status buckets assigned correctly
- [ ] WOS calculation accurate
- [ ] Kits detected via `BUNDLE:TRUE` tag
- [ ] Component inventory tracked for kits
- [ ] PO CSV exports with all required columns
- [ ] PO CSV opens correctly in Excel/Google Sheets
- [ ] Approvals show: current stock, WOS, ROP, suggested qty, vendor
- [ ] Evidence includes: sales velocity chart, lead time, stockout risk
- [ ] Rollback: Cancel PO (if not sent), revert inventory adjustments

### Test Cases
1. Calculate ROP for sample product → verify formula
2. Calculate safety stock → verify formula
3. Check status buckets → verify assignment
4. Calculate WOS → verify formula
5. Detect kit → verify `BUNDLE:TRUE` tag
6. Export PO CSV → verify columns and data
7. Review PO approval → verify evidence
8. Approve PO → verify CSV generated
9. Reject PO → verify cancellation

---

## 4. SEO Anomalies Acceptance Criteria

### Functional Requirements
- [ ] Google Analytics integration via MCP
- [ ] Traffic drop detection: >20% decrease vs previous period
- [ ] Ranking change detection: >5 positions change (requires external SEO tool)
- [ ] Critical error detection: 404s, broken links, missing meta tags
- [ ] Anomaly tile shows count of issues
- [ ] Click-through to SEO dashboard with details
- [ ] Evidence-first recommendations with GA queries

### Acceptance Criteria
- [ ] GA MCP operational and documented
- [ ] Traffic drops >20% flagged within 24 hours
- [ ] Ranking changes >5 positions flagged (if SEO tool integrated)
- [ ] Critical errors detected and listed
- [ ] Anomaly count accurate on tile
- [ ] SEO dashboard shows: affected pages, traffic data, recommendations
- [ ] Evidence includes: GA queries, traffic charts, affected URLs
- [ ] Recommendations actionable (e.g., "Fix 404 on /page-name")
- [ ] Rollback: N/A (read-only)

### Test Cases
1. Simulate traffic drop >20% → verify detection
2. Check anomaly count → verify accuracy
3. Click tile → verify SEO dashboard loads
4. Review evidence → verify GA queries present
5. Review recommendations → verify actionable

---

## 5. CX HITL Acceptance Criteria

### Functional Requirements
- [ ] AI drafts email replies as Chatwoot Private Notes
- [ ] Approvals Drawer shows: customer history, order details, policy links
- [ ] Grading system: Tone, Accuracy, Policy (1-5 scale)
- [ ] `/validate` endpoint checks evidence + rollback
- [ ] Public reply sent only after approval via Chatwoot API
- [ ] Audit log records: actor, timestamp, draft, final, grades
- [ ] HITL config: `ai-customer` agent has `human_review: true`
- [ ] SLA dashboard shows approval latency distribution

### Acceptance Criteria
- [ ] AI drafts created as Private Notes (not public)
- [ ] Evidence section shows customer history from Shopify
- [ ] Evidence shows order details (order #, items, total)
- [ ] Evidence shows policy links (return policy, shipping policy)
- [ ] Grading UI captures tone/accuracy/policy (1-5)
- [ ] Grading required for approval (validation)
- [ ] `/validate` returns OK before enabling Approve
- [ ] Public reply sent after approval
- [ ] Audit log complete (actor, timestamps, diffs, grades)
- [ ] `ai-customer` config has `human_review: true` (Danger enforced)
- [ ] SLA dashboard shows latency distribution
- [ ] Median approval time ≤15 min
- [ ] AI draft rate ≥90%
- [ ] Grade averages: tone ≥4.5, accuracy ≥4.7, policy ≥4.8

### Test Cases
1. AI creates draft → verify Private Note in Chatwoot
2. Review evidence → verify customer history, orders, policies
3. Grade draft → verify sliders work
4. Approve without grading → verify validation error
5. Approve with grading → verify public reply sent
6. Check audit log → verify complete record
7. Check SLA dashboard → verify latency shown
8. Measure AI draft rate → verify ≥90%
9. Measure grade averages → verify targets met

---

## 6. Ads Metrics Acceptance Criteria

### Functional Requirements
- [ ] Google Analytics integration for ad performance
- [ ] Metrics: CTR (Click-Through Rate), ROAS (Return on Ad Spend), Spend by Campaign
- [ ] Ad performance dashboard with charts
- [ ] Evidence-first recommendations (e.g., "Pause low-ROAS campaign")
- [ ] Read-only mode (no ad changes, recommendations only)

### Acceptance Criteria
- [ ] GA integration pulls ad performance data
- [ ] CTR calculated: Clicks / Impressions
- [ ] ROAS calculated: Revenue / Ad Spend
- [ ] Spend by campaign shown
- [ ] Dashboard shows charts (line, bar, pie)
- [ ] Recommendations based on data (e.g., ROAS <2.0 = pause)
- [ ] Evidence includes: GA queries, campaign data, projected impact
- [ ] Read-only: No ad changes made automatically
- [ ] Rollback: N/A (read-only)

### Test Cases
1. Pull ad data from GA → verify metrics
2. Calculate CTR → verify formula
3. Calculate ROAS → verify formula
4. View dashboard → verify charts load
5. Review recommendations → verify evidence-based
6. Verify read-only → no ad changes made

---

## 7. Content Planner Acceptance Criteria

### Functional Requirements
- [ ] Google Analytics integration for content performance
- [ ] Top pages by traffic, engagement, conversions
- [ ] Search queries driving traffic
- [ ] Content recommendations based on analytics
- [ ] Evidence-first suggestions (e.g., "Write blog post on X topic")
- [ ] Read-only mode (recommendations only)

### Acceptance Criteria
- [ ] GA integration pulls content performance data
- [ ] Top pages ranked by traffic
- [ ] Engagement metrics: time on page, bounce rate
- [ ] Conversion metrics: goal completions
- [ ] Search queries shown with traffic volume
- [ ] Recommendations actionable (e.g., "Optimize page X for keyword Y")
- [ ] Evidence includes: GA queries, traffic data, keyword data
- [ ] Read-only: No content changes made automatically
- [ ] Rollback: N/A (read-only)

### Test Cases
1. Pull content data from GA → verify metrics
2. View top pages → verify ranking
3. View search queries → verify traffic volume
4. Review recommendations → verify actionable
5. Verify read-only → no content changes made

---

## Document Control

**Version History:**
- 1.0 (2025-10-15): Initial comprehensive acceptance criteria by Product Agent

**Review Schedule:**
- QA: Validate test cases and acceptance criteria
- Engineer: Confirm technical feasibility
- Manager: Approve scope and priorities

**Related Documents:**
- `docs/specs/dashboard_launch_readiness.md` - Launch criteria
- `docs/specs/approvals_drawer_spec.md` - Approvals Drawer detailed spec
- `docs/specs/inventory_spec.md` - Inventory functional spec
- `docs/NORTH_STAR.md` - Success metrics

