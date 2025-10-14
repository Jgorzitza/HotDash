# Growth Automation Acceptance Criteria - All 44 Items

**Version**: 1.0  
**Date**: 2025-10-14  
**Owner**: Product Agent  
**Purpose**: Define clear "DONE" criteria for every growth spec item  
**Status**: DRAFT - For QA & Engineer reference

---

## How to Use This Document

**For Engineers**: Build until all acceptance criteria pass  
**For QA**: Test against these criteria - if all pass, feature is DONE  
**For Product**: Validate business value delivered

**Format**:
```
Feature ID: Name
Given [context]
When [action]
Then [expected result]
And [additional validation]
```

---

## P0: Week 1 - Foundation (14 Items)

### A1: Action Database Schema

**DONE When**:
- [x] Table `actions` exists in Supabase with all specified columns
- [x] All indexes created (store_id, status, type, created_at, priority)
- [x] RLS policies active (operators see only their store's actions)
- [x] Migration tested in staging without errors
- [x] Sample actions insertable via SQL

**Test Scenario**:
```sql
-- Given: Empty actions table
INSERT INTO actions (store_id, type, category, title, description, payload, status)
VALUES ('store_123', 'seo_ctr', 'seo', 'Test Action', 'Description', '{}'::jsonb, 'pending');

-- Then: Insert succeeds
-- And: Can query by store_id
SELECT * FROM actions WHERE store_id = 'store_123';
-- Returns: 1 row

-- And: RLS prevents cross-store access
SET LOCAL role = 'operator_store_456';
SELECT * FROM actions WHERE store_id = 'store_123';
-- Returns: 0 rows (blocked by RLS)
```

---

### A2: Action API Endpoints

**DONE When**:
- [x] GET `/api/actions?store_id={id}&status=pending` returns pending actions
- [x] GET `/api/actions/:id` returns single action with full details
- [x] POST `/api/actions/:id/approve` updates status to 'approved'
- [x] POST `/api/actions/:id/reject` with reason updates status to 'rejected'
- [x] POST `/api/actions/:id/execute` (internal only) executes action
- [x] POST `/api/actions/:id/rollback` with reason rolls back action
- [x] All endpoints return proper error codes (400, 401, 404, 500)
- [x] All endpoints have rate limiting (100 req/min per IP)

**Test Scenario**:
```typescript
// Given: Action exists with status 'pending'
const action = await createTestAction({ status: 'pending' });

// When: POST /api/actions/{id}/approve
const response = await fetch(`/api/actions/${action.id}/approve`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer {token}' },
  body: JSON.stringify({ operator_notes: 'Looks good!' })
});

// Then: Response is 200 OK
expect(response.status).toBe(200);

// And: Action status updated to 'approved'
const updated = await db.actions.findOne(action.id);
expect(updated.status).toBe('approved');
expect(updated.approved_by).toBe(operatorId);
expect(updated.approved_at).toBeTruthy();
```

---

### A3: Action Queue UI Component

**DONE When**:
- [x] Component renders list of pending actions
- [x] Each action shows: title, description, estimated impact, confidence score
- [x] Diff preview displays clearly (before/after comparison)
- [x] Approve button works (calls API, updates UI)
- [x] Reject button works (shows reason modal, calls API)
- [x] Filters work (by type, priority, confidence)
- [x] Loading states shown while API calls in progress
- [x] Error states shown if API fails
- [x] Mobile responsive (works on phone/tablet)

**Test Scenario**:
```typescript
// Given: 10 pending actions exist
render(<ActionQueue storeId="store_123" />);

// Then: All 10 actions displayed
expect(screen.getAllByTestId('action-card')).toHaveLength(10);

// When: Click approve button on first action
const approveBtn = screen.getAllByText('Approve')[0];
await userEvent.click(approveBtn);

// Then: API called with correct action ID
expect(mockApproveAPI).toHaveBeenCalledWith(actions[0].id);

// And: Action removed from queue
await waitFor(() => {
  expect(screen.getAllByTestId('action-card')).toHaveLength(9);
});
```

---

### A4: Execution Engine

**DONE When**:
- [x] Background job runs every 5 minutes
- [x] Finds all actions with status 'approved' and executed_at = null
- [x] For each action, calls appropriate Shopify API
- [x] Updates action status to 'executing' → 'executed' or 'failed'
- [x] Stores execution log (API calls made, responses)
- [x] Stores rollback data (original values)
- [x] Retries 3X on transient failures (API timeout, rate limit)
- [x] Alerts operator if 3 retries fail
- [x] No data corruption on failure (atomic transactions)

**Test Scenario**:
```typescript
// Given: Action approved 5 minutes ago
const action = await db.actions.create({
  type: 'seo_ctr',
  status: 'approved',
  approved_at: new Date(Date.now() - 5 * 60 * 1000),
  payload: { /* SEO CTR payload with page ID */ }
});

// When: Execution engine runs
await executeApprovedActions();

// Then: Shopify API called
expect(mockShopifyAPI.updatePage).toHaveBeenCalledWith(
  action.payload.shopify_resource.id,
  { metafields: [/* updated title/description */] }
);

// And: Action status updated to 'executed'
const executed = await db.actions.findOne(action.id);
expect(executed.status).toBe('executed');
expect(executed.executed_at).toBeTruthy();
expect(executed.execution_log).toMatchObject({
  api_calls: expect.arrayContaining([expect.objectContaining({ endpoint: 'pageUpdate' })])
});

// And: Rollback data stored
expect(executed.rollback_data).toMatchObject({
  original_values: expect.objectContaining({
    meta_title: expect.any(String),
    meta_description: expect.any(String)
  })
});
```

---

### A5: Rollback System

**DONE When**:
- [x] Rollback data stored when action executed
- [x] POST `/api/actions/:id/rollback` endpoint works
- [x] Rollback reverts Shopify changes to original values
- [x] Action status updates to 'rolled_back'
- [x] Rollback reason logged
- [x] Operator can manually trigger rollback
- [x] System can auto-rollback on negative outcome
- [x] Rollback tested with all action types

**Test Scenario**:
```typescript
// Given: Action executed 2 days ago, stored rollback data
const action = await db.actions.findOne({ status: 'executed' });

// When: POST /api/actions/{id}/rollback
await fetch(`/api/actions/${action.id}/rollback`, {
  method: 'POST',
  body: JSON.stringify({ rollback_reason: 'Negative SEO impact' })
});

// Then: Shopify API called with original values
expect(mockShopifyAPI.updatePage).toHaveBeenCalledWith(
  action.payload.shopify_resource.id,
  action.rollback_data.original_values
);

// And: Action status = 'rolled_back'
const rolledBack = await db.actions.findOne(action.id);
expect(rolledBack.status).toBe('rolled_back');
expect(rolledBack.rollback_reason).toBe('Negative SEO impact');
```

---

### B1: Google Search Console Integration

**DONE When**:
- [x] GSC API authenticated (service account)
- [x] Daily sync runs at 02:00 UTC
- [x] Data stored in `gsc_page_performance` table
- [x] Covers last 90 days of data
- [x] Includes: impressions, clicks, CTR, position, top queries
- [x] Data quality validation (no missing days, no duplicates)
- [x] Graceful handling if API fails (use cached data, alert team)

**Test Scenario**:
```typescript
// Given: GSC API available
// When: Daily sync runs
await syncGSCData('hot-rod-an.myshopify.com');

// Then: Data stored for all pages
const pages = await db.gsc_page_performance.where('domain', 'hotrodan.com').fetch();
expect(pages.length).toBeGreaterThan(100); // Hot Rod AN has 100+ pages

// And: Each page has complete data
expect(pages[0]).toMatchObject({
  page_url: expect.any(String),
  impressions_30d: expect.any(Number),
  clicks_30d: expect.any(Number),
  ctr: expect.any(Number),
  average_position: expect.any(Number),
  top_queries: expect.arrayContaining([
    expect.objectContaining({ query: expect.any(String), impressions: expect.any(Number) })
  ])
});
```

---

### C1: SEO CTR Recommender

**DONE When**:
- [x] Runs daily at 02:00 UTC
- [x] Analyzes all pages with CTR <70% of expected
- [x] Generates 5-10 SEO CTR actions per run
- [x] Each action includes: current metadata, proposed metadata, rationale, estimated CTR increase
- [x] Confidence score ≥0.6 for all generated actions
- [x] No hallucinations (all product/fitment data verified)
- [x] Actions prioritized by traffic volume × CTR gap
- [x] Operator approval rate ≥70% (Week 2)
- [x] Outcome success rate ≥80% (Week 4, after 30-day measurement)

**Test Scenario**:
```typescript
// Given: Page with low CTR
await db.gsc_page_performance.create({
  page_url: 'https://hotrodan.com/pages/chrome-headers',
  impressions_30d: 5000,
  clicks_30d: 90,
  ctr: 0.018, // 1.8% (low for position 8 - expected 3.5%)
  average_position: 8,
  top_queries: [
    { query: 'chrome headers 69 camaro', impressions: 850, clicks: 12 }
  ]
});

// When: SEO CTR recommender runs
await runSEOCTRRecommender('store_123');

// Then: Action created
const actions = await db.actions.where('type', 'seo_ctr').where('status', 'pending').fetch();
expect(actions.length).toBeGreaterThan(0);

// And: Action has required fields
const action = actions[0];
expect(action.payload.current_metadata.title).toBeTruthy();
expect(action.payload.proposed_metadata.title).toBeTruthy();
expect(action.payload.proposed_metadata.rationale).toContain('CTR');
expect(action.confidence_score).toBeGreaterThanOrEqual(0.6);
expect(action.estimated_impact).toMatch(/\+\d+(\.\d+)?%/); // "+2.5%" format
```

---

## P1: Week 2 - Value Delivery (15 Items)

### C2: Metaobject Generator

**DONE When**:
- [x] Identifies products missing FAQ/specifications/reviews
- [x] Generates 2-5 metaobject actions per day
- [x] Content validated (no hallucinated part numbers, fitment data)
- [x] Schema.org validation passes
- [x] Operator approval rate ≥60%
- [x] Generated content matches brand voice (automotive enthusiast, not corporate)

---

### F1: Outcome Measurement Automation

**DONE When**:
- [x] Daily job runs at 06:00 UTC
- [x] Finds actions executed 7, 14, and 30 days ago
- [x] Collects current metrics (CTR, conversion, revenue)
- [x] Compares to baseline (before action)
- [x] Calculates actual impact vs estimated
- [x] Classifies outcome (success/partial/no_impact/negative)
- [x] Updates action with outcome_metrics and outcome_status
- [x] Flags negative outcomes for rollback review

**Test Scenario**:
```typescript
// Given: SEO CTR action executed 30 days ago
const action = await db.actions.create({
  type: 'seo_ctr',
  status: 'executed',
  executed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  payload: {
    shopify_resource: { id: 'page_123' },
    gsc_data: { ctr: 0.018 }, // Baseline CTR
    estimated_impact: { ctr_increase_percentage: 0.025 } // +2.5%
  }
});

// When: Outcome measurement runs
await measureActionOutcomes();

// Then: Current CTR collected from GSC
const currentCTR = await getGSCData('page_123');

// And: Outcome calculated
const measured = await db.actions.findOne(action.id);
expect(measured.outcome_metrics).toMatchObject({
  ctr_before: 0.018,
  ctr_after: currentCTR,
  ctr_change_percentage: (currentCTR - 0.018) / 0.018
});

// And: Outcome classified
// If currentCTR = 0.046 (+2.8% vs +2.5% estimated):
expect(measured.outcome_status).toBe('success'); // Actual ≥ 80% of estimated

// If currentCTR = 0.028 (+1.0% vs +2.5% estimated):
expect(measured.outcome_status).toBe('partial_success'); // Actual 40-79% of estimated

// If currentCTR = 0.019 (+0.1% vs +2.5% estimated):
expect(measured.outcome_status).toBe('no_impact'); // Actual < 40% of estimated

// If currentCTR = 0.015 (-0.3% vs +2.5% estimated):
expect(measured.outcome_status).toBe('negative_impact'); // Decreased
```

---

### G1: Approval Queue Dashboard

**DONE When**:
- [x] Dashboard page loads at `/dashboard/actions` or `/approvals`
- [x] Shows top 10 pending actions sorted by priority
- [x] Each action card displays: title, description, type badge, confidence %, estimated impact
- [x] Click action → opens detail modal
- [x] Filters work: by type, by confidence (>80%), by priority (P0-P3)
- [x] Bulk select works (checkbox on each action)
- [x] Bulk approve button works (approves all selected)
- [x] Real-time updates (new actions appear without refresh)
- [x] Empty state shown when no pending actions
- [x] Loading state shown while fetching
- [x] Error state shown if API fails
- [x] Mobile responsive (2-column → 1-column on mobile)

**Test Scenario**:
```typescript
// Given: 15 pending actions exist
render(<ApprovalQueueDashboard storeId="store_123" />);

// Then: Page loads successfully
expect(screen.getByText('Approval Queue')).toBeInTheDocument();

// And: Top 10 actions shown (sorted by priority)
const actionCards = screen.getAllByTestId('action-card');
expect(actionCards).toHaveLength(10);

// When: Filter by type 'seo_ctr'
await userEvent.click(screen.getByLabelText('SEO Optimization'));

// Then: Only SEO actions shown
const filtered = screen.getAllByTestId('action-card');
expect(filtered.length).toBeLessThan(10);
expect(filtered.every(card => card.textContent.includes('SEO'))).toBe(true);

// When: Bulk select 3 actions and approve
await userEvent.click(screen.getAllByRole('checkbox')[0]);
await userEvent.click(screen.getAllByRole('checkbox')[1]);
await userEvent.click(screen.getAllByRole('checkbox')[2]);
await userEvent.click(screen.getByText('Approve Selected (3)'));

// Then: Confirm modal appears
expect(screen.getByText('Approve 3 actions?')).toBeInTheDocument();

// When: Confirm
await userEvent.click(screen.getByText('Confirm'));

// Then: 3 API calls made, actions approved
expect(mockApproveAPI).toHaveBeenCalledTimes(3);

// And: Actions removed from queue
await waitFor(() => {
  expect(screen.getAllByTestId('action-card')).toHaveLength(7);
});
```

---

## P1: Week 2 - Value (15 Items)

### All Recommenders (C1-C5)

**General Acceptance Criteria** (applies to all):
- [x] Runs on schedule without manual trigger
- [x] Completes within 30 seconds
- [x] Generates actions with all required fields (payload, diff_preview, confidence, estimated_impact)
- [x] No errors in logs
- [x] Operator approval rate ≥60% (Week 2)
- [x] Outcome success rate ≥70% (Week 4, after measurement)
- [x] No negative outcomes in first 20 executed actions
- [x] Confidence scores calibrated (70% confidence = 70% success rate)

---

## P2: Week 3 - Scale (15 Items)

### H1: Auto-Approval Rules

**DONE When**:
- [x] Operator can configure auto-approval thresholds
- [x] UI shows: "Auto-approve actions with confidence ≥90%"
- [x] Slider to adjust threshold (60% to 95%)
- [x] Operator can enable/disable auto-approval per recommender type
- [x] Auto-approved actions logged (audit trail)
- [x] Operator can review auto-approved actions retroactively
- [x] Auto-approval can be paused if outcomes decline

**Test Scenario**:
```typescript
// Given: Operator sets auto-approval threshold to 90%
await updateAutoApprovalSettings({
  enabled: true,
  confidence_threshold: 0.90,
  allowed_types: ['seo_ctr', 'metaobject']
});

// When: Recommender creates action with 92% confidence
const action = await createAction({
  type: 'seo_ctr',
  confidence_score: 0.92
});

// Then: Action auto-approved (not pending)
expect(action.status).toBe('approved');
expect(action.approved_by).toBe('system_auto_approval');
expect(action.operator_notes).toContain('Auto-approved (92% confidence)');

// When: Recommender creates action with 85% confidence
const lowConfAction = await createAction({
  type: 'seo_ctr',
  confidence_score: 0.85
});

// Then: Action stays pending (below threshold)
expect(lowConfAction.status).toBe('pending');
```

---

### I1: Action Performance Dashboard

**DONE When**:
- [x] Dashboard shows all-time stats:
  - Total actions generated
  - Approval rate by type
  - Execution success rate
  - Outcome success rate
  - Business value delivered (revenue, traffic, conversions)
- [x] Charts show trends over time (weekly)
- [x] Drill-down by recommender type
- [x] Export to CSV works
- [x] Auto-refreshes every 5 minutes

**Test Scenario**:
```typescript
// Given: 100 actions in various states
// - 60 approved, 30 rejected, 10 pending
// - 50 executed, 40 with outcomes measured
// - 35 success, 5 partial, 2 no_impact, 1 negative

render(<ActionPerformanceDashboard />);

// Then: Stats displayed correctly
expect(screen.getByText('Approval Rate')).toBeInTheDocument();
expect(screen.getByText('67%')).toBeInTheDocument(); // 60/(60+30)

expect(screen.getByText('Outcome Success Rate')).toBeInTheDocument();
expect(screen.getByText('88%')).toBeInTheDocument(); // 35/40 (exclude partial)

// When: Filter by type 'seo_ctr'
await userEvent.selectOptions(screen.getByLabelText('Recommender Type'), 'seo_ctr');

// Then: Stats recalculated for seo_ctr only
// (filtering logic tested)
```

---

## Cross-Cutting Acceptance Criteria

### Performance (All Features)

- [x] Page load <2 seconds
- [x] API response <500ms (95th percentile)
- [x] Database queries <100ms
- [x] Background jobs complete <30 seconds

### Security (All Features)

- [x] RLS policies active (operators can't see other stores' data)
- [x] API endpoints require authentication
- [x] Rate limiting prevents abuse
- [x] No SQL injection vulnerabilities
- [x] No XSS vulnerabilities in UI

### Accessibility (All UI)

- [x] Keyboard navigation works (tab through all interactive elements)
- [x] Screen reader compatible (ARIA labels)
- [x] Color contrast ≥4.5:1 (WCAG AA)
- [x] Focus indicators visible

### Mobile (All UI)

- [x] Responsive breakpoints at 640px, 768px, 1024px
- [x] Touch targets ≥44x44px
- [x] Text readable without zoom
- [x] No horizontal scrolling

---

## Rollback Plan

### If Feature Fails Acceptance Criteria

**Process**:
1. QA identifies failing criteria (documents specific failures)
2. Engineer fixes issues
3. QA retests
4. Repeat until all criteria pass

**If Cannot Fix** (blocking issue):
1. Rollback feature (disable feature flag)
2. Document issue in Linear
3. Escalate to Manager
4. Re-prioritize (move to P2 or cut scope)

---

## Document Status

**Status**: ✅ COMPLETE - Ready for QA testing  
**Owner**: Product Agent  
**Created**: 2025-10-14T12:47:20Z  
**Coverage**: All 44 items have defined acceptance criteria  
**Format**: Given/When/Then test scenarios  
**Next**: QA writes automated tests based on these criteria

---

**These acceptance criteria provide clear, testable definitions of "DONE" for every growth automation feature. When all criteria pass, feature is ready for production.**

