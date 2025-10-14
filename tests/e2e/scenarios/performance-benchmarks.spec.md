# E2E Test Scenarios: Performance Benchmarking

**Purpose**: Performance testing for growth features  
**Created**: 2025-10-14  
**Owner**: QA Helper (supporting QA agent)

---

## Dashboard Tile Performance

### Tile: SEO Pulse

**Target**: <300ms load time

**Test Steps**:
1. Navigate to `/app` (dashboard)
2. Measure SEO Pulse tile render time
3. Verify data loaded from cache or API

**Metrics**:
- Initial load: <300ms
- Data fetch: <200ms
- Render: <100ms
- Re-fetch (refresh): <250ms

**Test Data**:
```typescript
import { generateGSCPagePerformance } from '../../helpers/gsc-data-generator';
const seoData = generateGSCPagePerformance(5);
```

**Test Code**:
```typescript
test('SEO Pulse tile loads within 300ms', async ({ page }) => {
  await page.goto('/app');
  
  const start = Date.now();
  await page.waitForSelector('[data-testid="seo-pulse-tile"]');
  const loadTime = Date.now() - start;
  
  expect(loadTime).toBeLessThan(300);
});
```

---

### Tile: Sales Pulse

**Target**: <300ms load time

**Test Steps**:
1. Navigate to dashboard
2. Measure Sales Pulse tile render
3. Verify Shopify API call cached

**Metrics**:
- Initial load: <300ms
- Shopify API call: <200ms (cached)
- Fresh fetch: <500ms (when cache expired)

---

### Tile: CX Escalation

**Target**: <200ms load time (database query)

**Test Steps**:
1. Navigate to dashboard
2. Measure CX Escalation tile render
3. Verify Supabase query optimized

**Metrics**:
- Database query: <100ms
- Tile render: <200ms total

---

### Tile: Inventory Alerts

**Target**: <400ms load time

**Test Steps**:
1. Navigate to dashboard
2. Measure Inventory tile render
3. Verify Shopify inventory API call

**Metrics**:
- Shopify API: <300ms
- Tile render: <400ms total

---

## API Response Time Benchmarks

### Shopify GraphQL Queries

**Target**: <500ms per query

**Queries to Test**:
1. Sales Pulse query (orders)
2. Inventory query (product variants)
3. Product search (for AI recommendations)

**Test Code**:
```typescript
test('Shopify queries respond within 500ms', async () => {
  const start = Date.now();
  const response = await fetch('/api/shopify/sales-pulse');
  const duration = Date.now() - start;
  
  expect(response.ok).toBe(true);
  expect(duration).toBeLessThan(500);
});
```

---

### Agent SDK Endpoints

**Target**: <200ms per endpoint

**Endpoints to Test**:
1. GET /approvals (fetch queue)
2. POST /approvals/:id/approve
3. POST /approvals/:id/reject

**Load Test**:
- 10 concurrent requests
- All must complete <500ms
- No 429 (rate limit) errors

---

## Concurrent Operator Load Testing

### Scenario: 5 Operators Simultaneously

**Test Steps**:
1. Seed 25 approvals
2. Open 5 browser contexts
3. Each operator approves 5 items
4. Measure total time and individual action times

**Performance Targets**:
- No race conditions
- All approvals processed successfully
- Individual actions: <500ms each
- Total workflow: <5 minutes

**Test Code**:
```typescript
test('handles 5 concurrent operators', async ({ browser }) => {
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);
  
  const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));
  
  // All navigate to approvals
  await Promise.all(pages.map(p => p.goto('/app/approvals')));
  
  // Each approves different items concurrently
  const results = await Promise.all(
    pages.map((page, idx) => 
      page.click(`[data-testid="approve-button-item-${idx}"]`)
    )
  );
  
  // Verify no conflicts, all succeeded
  expect(results).toHaveLength(5);
});
```

---

## Database Performance

### Query Performance Targets

**DashboardFact queries**:
- SELECT by shopDomain + factType: <50ms
- SELECT recent facts (created_at index): <50ms

**DecisionLog queries**:
- SELECT by scope: <50ms
- SELECT recent decisions: <50ms

**Test Query**:
```typescript
test('dashboard queries execute under 50ms', async () => {
  const start = Date.now();
  
  const facts = await prisma.dashboardFact.findMany({
    where: {
      shopDomain: 'hotrodan.myshopify.com',
      factType: 'shopify.sales.summary',
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(50);
  expect(facts.length).toBeGreaterThan(0);
});
```

---

## Memory & Resource Usage

### Browser Memory

**Target**: <150MB per tab

**Test**:
1. Open dashboard
2. Measure memory usage
3. Interact with modals/tiles
4. Measure after 5 minutes
5. Verify no memory leaks

**Tool**: Playwright performance API
```typescript
const metrics = await page.metrics();
expect(metrics.JSHeapUsedSize).toBeLessThan(150 * 1024 * 1024);
```

---

### API Memory Leaks

**Target**: Stable memory over time

**Test**:
1. Repeatedly call API endpoints
2. Monitor server memory
3. Verify no leaks after 100 requests

---

## Network Performance

### Page Weight

**Target**: <500KB initial load

**Test**:
- Measure HTML size
- Measure JS bundle size
- Measure CSS size
- Total < 500KB (before caching)

---

### API Payload Size

**Target**: <100KB per API response

**Test**:
- Sales Pulse API: <50KB
- Inventory API: <75KB
- Approval Queue API: <100KB

---

## Real-World Simulation

### Typical Operator Workflow

**Scenario**: Operator reviews 10 approvals in 30 minutes

**Test Steps**:
1. Seed 10 approvals
2. Operator reviews each (15s per review)
3. Mix of: 6 approve, 2 edit, 2 reject
4. Measure end-to-end performance

**Performance Profile**:
- Dashboard load: 1 time (<1s)
- Approval queue load: 1 time (<1s)
- 10 approval actions: <500ms each
- Total time: <30 minutes (mostly human review time)

---

## Monitoring & Alerts

### Performance Degradation Detection

**Test**: Simulate slow conditions
- Add network throttling (3G)
- Add server latency (+200ms)
- Verify graceful degradation

**Expected**:
- Loading spinners shown
- Timeout errors handled
- Retry logic activates
- User informed of delays

---

## Test Implementation Checklist

For QA agent to implement:

- [ ] Dashboard tile load time tests (4 tiles)
- [ ] API endpoint response time tests (Shopify, Agent SDK)
- [ ] Concurrent operator load test (5 operators)
- [ ] Database query performance tests
- [ ] Memory usage monitoring
- [ ] Page weight measurements
- [ ] Real-world workflow simulation
- [ ] Performance degradation handling

---

## Success Criteria

### Functional Performance:
- ✅ All tiles load <300ms
- ✅ All API calls <500ms
- ✅ Database queries <50ms
- ✅ No memory leaks
- ✅ Concurrent operators supported

### User Experience:
- ✅ No UI lag
- ✅ Smooth transitions
- ✅ Responsive interactions
- ✅ Graceful error handling

---

**Timeline**: 3-4 hours to implement all performance tests  
**Priority**: High - needed for launch quality assurance  
**Dependencies**: Test data generators (✅ complete)

