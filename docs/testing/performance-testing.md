# Performance Testing Guide

## Overview

The HotDash performance testing suite provides comprehensive benchmarking and load testing for all dashboard tiles and API endpoints. This guide covers running tests, interpreting results, and establishing performance baselines.

## Test Suites

### 1. Dashboard Performance Tests
**File**: `tests/performance/dashboard-performance.spec.ts`

Tests individual tile render times, full dashboard load performance, memory usage, and API response times.

**What it tests:**
- Page load time
- Time to first tile render
- Individual tile render times (all 6 tiles)
- Total dashboard load time
- API response times
- Memory usage baseline
- Concurrent operator load (5 and 10 concurrent users)
- Performance regression detection

**Run:**
```bash
npm run test:perf:dashboard
```

### 2. Load Testing Suite
**File**: `tests/performance/load-testing.spec.ts`

Tests API and service layer performance under various load conditions.

**What it tests:**
- Sequential request performance (50 requests)
- Concurrent burst load (10 simultaneous requests)
- Sustained load (100 requests over 30 seconds)
- Cache hit performance
- Cache invalidation performance
- Resource loading (JS/CSS bundle sizes)

**Run:**
```bash
npm run test:perf:load
```

### 3. Run All Performance Tests
```bash
npm run test:performance
```

## Performance Thresholds

Current performance thresholds (in milliseconds):

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Page Load | 3000ms | Maximum acceptable page load time |
| Tile Render | 500ms | Maximum acceptable individual tile render time |
| Total Dashboard | 5000ms | Maximum acceptable full dashboard load time |
| API Response | 1000ms | Maximum acceptable API response time |

### Dashboard Tiles Tested

1. **Ops Pulse** - Activation rate and SLA metrics
2. **Sales Pulse** - Revenue and order metrics
3. **Fulfillment Health** - Order fulfillment status
4. **Inventory Heatmap** - Low stock alerts
5. **CX Escalations** - Customer support escalations
6. **SEO & Content Watch** - Landing page anomalies

## Test Results

### Output Locations

All test results are written to:
- `test-results/performance-baseline.json` - Dashboard performance metrics
- `test-results/performance-baseline-snapshot.json` - Regression baseline
- `test-results/load-test-results.json` - Load testing metrics
- `test-results/performance-results.json` - Playwright test results
- `coverage/performance/` - HTML report

### Viewing Results

**Console Output:**
```bash
npm run test:performance
# Prints detailed summary after tests complete
```

**HTML Report:**
```bash
npx playwright show-report coverage/performance
```

**JSON Analysis:**
```bash
cat test-results/performance-baseline.json | jq
```

## Interpreting Results

### Dashboard Performance Metrics

```json
{
  "testName": "Full Dashboard Load (Mock)",
  "pageLoadTime": 1234.56,
  "timeToFirstTile": 234.56,
  "tileMetrics": {
    "tile-ops-metrics": 123.45,
    "tile-sales-pulse": 234.56,
    "tile-fulfillment-health": 345.67,
    "tile-inventory-heatmap": 456.78,
    "tile-cx-escalations": 567.89,
    "tile-seo-content": 678.90
  },
  "totalDashboardTime": 2345.67,
  "apiResponseTime": 567.89,
  "timestamp": "2025-10-12T05:00:00Z"
}
```

**Good Performance:**
- `pageLoadTime` < 3000ms
- `timeToFirstTile` < 500ms
- All `tileMetrics` < 500ms
- `totalDashboardTime` < 5000ms
- `apiResponseTime` < 1000ms

### Load Test Results

```json
{
  "endpoint": "Dashboard API",
  "totalRequests": 50,
  "successfulRequests": 50,
  "failedRequests": 0,
  "avgResponseTime": 1234.56,
  "p95ResponseTime": 1456.78,
  "p99ResponseTime": 1567.89,
  "minResponseTime": 1000.00,
  "maxResponseTime": 2000.00,
  "requestsPerSecond": 10.5,
  "timestamp": "2025-10-12T05:00:00Z"
}
```

**Good Performance:**
- `successfulRequests` / `totalRequests` > 95%
- `avgResponseTime` < 2000ms
- `p95ResponseTime` < 3000ms
- `requestsPerSecond` > 5 req/s

## Performance Baseline

### Establishing Baseline

Run the baseline test to create a snapshot:
```bash
npm run test:perf:dashboard
# Creates: test-results/performance-baseline-snapshot.json
```

### Comparing Against Baseline

After making changes, run tests again and compare:
```bash
npm run test:perf:dashboard
node scripts/ci/compare-performance.js
```

### Expected Baseline Values (Mock Mode)

Based on initial testing:
- **Page Load**: ~1500-2000ms
- **Time to First Tile**: ~200-300ms
- **Individual Tiles**: ~100-200ms each
- **Total Dashboard**: ~2500-3500ms
- **API Response**: ~500-800ms
- **Memory Usage**: < 50MB

## Concurrent Load Testing

### Scenarios Tested

1. **5 Concurrent Operators**: Simulates normal office hours load
2. **10 Concurrent Operators**: Stress test scenario

### Expected Behavior

- Under 5 concurrent: Load times should increase < 2x
- Under 10 concurrent: Load times should increase < 3x
- Success rate should remain > 90% in all scenarios

## Continuous Integration

### Adding to CI Pipeline

Update `.github/workflows/test.yml`:
```yaml
- name: Run Performance Tests
  run: npm run test:performance
  
- name: Upload Performance Results
  uses: actions/upload-artifact@v3
  with:
    name: performance-results
    path: test-results/performance-*.json
```

### Performance Regression Gates

Fail CI if:
- Average page load > 3000ms
- Any tile render > 500ms
- Total dashboard > 5000ms
- Success rate < 95% under load

## Optimization Tips

### If Dashboard is Slow

1. **Check tile metrics** - Identify slowest tile
2. **Review API calls** - Check for unnecessary queries
3. **Check cache** - Verify cache is being used
4. **Review bundle size** - Check for large dependencies

### If API is Slow

1. **Check database queries** - Use Prisma logging
2. **Review external APIs** - Check Shopify/GA response times
3. **Check cache TTL** - Verify caching strategy
4. **Review error rates** - High error rates slow retries

### If Memory is High

1. **Check for memory leaks** - Run extended tests
2. **Review component lifecycle** - Check useEffect cleanup
3. **Check cache size** - May need cache limits
4. **Review data structures** - Large objects in state?

## Mock vs Live Performance

### Mock Mode (Default)
- Consistent, repeatable measurements
- Fast execution
- No external dependencies
- Ideal for baseline comparison

### Live Mode
```bash
PLAYWRIGHT_MOCK_MODE=0 npm run test:performance
```
- Real-world performance
- Tests actual API latency
- Tests real cache behavior
- Requires valid credentials

**Note**: Live mode tests are slower and may have variable results due to external API latency.

## Performance Monitoring

### Tracking Over Time

1. **Establish baseline** (first run)
2. **Run regularly** (weekly or per PR)
3. **Track trends** (compare JSON files)
4. **Alert on regressions** (> 20% slower)

### Creating a Performance Dashboard

Example using the JSON results:
```javascript
// scripts/ci/performance-dashboard.js
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('test-results/performance-baseline.json'));

// Generate HTML dashboard
// Plot trends over time
// Alert if thresholds exceeded
```

## Troubleshooting

### Tests Failing

**"Page load time exceeded threshold"**
- Check network conditions
- Verify server is running
- Check for console errors
- Review bundle size

**"Concurrent load test failed"**
- May need more resources
- Check for connection limits
- Review server capacity
- Check for memory leaks

**"Tile render timeout"**
- Check tile component code
- Review data loading
- Check for infinite loops
- Verify mock data

### Tests Timing Out

- Increase timeout in `playwright.performance.config.ts`
- Check for network issues
- Verify server is responding
- Review browser console

## Best Practices

1. ✅ **Run in CI/CD** - Catch regressions early
2. ✅ **Use mock mode** - For consistent baselines
3. ✅ **Track over time** - Maintain historical data
4. ✅ **Set alerts** - For significant regressions
5. ✅ **Test locally** - Before committing changes
6. ✅ **Document changes** - Note why performance changed

## Next Steps

After establishing baseline:
1. Add performance tests to CI/CD
2. Create performance monitoring dashboard
3. Set up alerting for regressions
4. Run live mode tests weekly
5. Profile slow components with React DevTools
6. Optimize slowest tiles first

## Resources

- [Playwright Performance Testing](https://playwright.dev/docs/test-timeouts)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Performance Best Practices](https://web.dev/vitals/)
- [Lighthouse Performance Guide](https://developer.chrome.com/docs/lighthouse/performance/)

## Support

For questions about performance testing:
- Review test output in `test-results/`
- Check browser console for errors
- Review component render times
- Profile with Chrome DevTools

---

**Last Updated**: 2025-10-12  
**Test Coverage**: 6 dashboard tiles, 13 performance scenarios

