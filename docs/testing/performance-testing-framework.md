# Performance Testing Framework

**Created**: 2025-10-12  
**Owner**: QA  
**Status**: Ready for Implementation

---

## Performance Budgets

### Response Time Targets

| Endpoint/Route | Target | Budget | Alert Threshold |
|----------------|--------|--------|-----------------|
| Dashboard (/) | <2s | <1.5s | >2.5s |
| Approval Queue | <1s | <800ms | >1.5s |
| API /approvals | <500ms | <300ms | >700ms |
| API /webhooks | <1s | <500ms | >1.5s |
| Tile rendering | <500ms | <300ms | >700ms |
| MCP query_support | <500ms | <300ms | >700ms |

### Resource Budgets

| Resource | Target | Budget | Alert Threshold |
|----------|--------|--------|-----------------|
| JavaScript bundle | <300KB | <200KB | >400KB |
| CSS bundle | <100KB | <50KB | >150KB |
| Total page size | <500KB | <400KB | >700KB |
| Memory usage | <50MB | <30MB | >75MB |
| API payload size | <100KB | <50KB | >150KB |

---

## Load Testing Scenarios

### Scenario 1: Normal Load
**Users**: 10 concurrent operators  
**Duration**: 10 minutes  
**Actions**:
- View dashboard (2 min intervals)
- Check approval queue (1 min intervals)
- Approve/reject actions (random)

**Success Criteria**:
- ✅ All requests <2s response time
- ✅ Error rate <1%
- ✅ Memory stable (no leaks)

---

### Scenario 2: Peak Load
**Users**: 25 concurrent operators  
**Duration**: 5 minutes  
**Actions**:
- Rapid dashboard refreshes
- Approval queue polling (30s intervals)
- Concurrent approvals

**Success Criteria**:
- ✅ P95 latency <3s
- ✅ Error rate <5%
- ✅ No service crashes

---

### Scenario 3: Burst Load
**Users**: 50 concurrent (spike)  
**Duration**: 2 minutes  
**Actions**:
- Simultaneous logins
- Dashboard load
- Approval queue access

**Success Criteria**:
- ✅ System handles spike
- ✅ No 503 errors
- ✅ Recovery within 1 minute

---

### Scenario 4: Sustained Load
**Users**: 15 concurrent  
**Duration**: 60 minutes  
**Actions**:
- Continuous dashboard usage
- Real approval processing
- Periodic refreshes

**Success Criteria**:
- ✅ Memory stable (no leaks)
- ✅ Response times consistent
- ✅ No degradation over time

---

## Performance Benchmarking Scripts

### Script 1: Lighthouse CI

```bash
#!/bin/bash
# scripts/performance/lighthouse-ci.sh

# Run Lighthouse on dashboard
npx lighthouse https://hotdash.app/app \
  --output=html \
  --output=json \
  --output-path=./artifacts/performance/lighthouse-$(date +%Y%m%d-%H%M%S) \
  --chrome-flags="--headless" \
  --budget-path=tests/performance/budgets.json

# Check if performance score meets threshold
SCORE=$(cat ./artifacts/performance/lighthouse-*.json | jq '.categories.performance.score')
if (( $(echo "$SCORE < 0.9" | bc -l) )); then
  echo "❌ Performance score below 90%: $SCORE"
  exit 1
fi

echo "✅ Performance score: $SCORE"
```

### Script 2: Load Testing (k6)

```javascript
// scripts/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Sustain 10 users
    { duration: '1m', target: 25 },  // Spike to 25 users
    { duration: '2m', target: 25 },  // Sustain 25 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // P95 <3s
    http_req_failed: ['rate<0.05'],    // <5% errors
  },
};

export default function () {
  // Dashboard load
  const dashboard = http.get('https://hotdash.app/app');
  check(dashboard, {
    'dashboard status 200': (r) => r.status === 200,
    'dashboard load <2s': (r) => r.timings.duration < 2000,
  });
  
  sleep(Math.random() * 5 + 5); // 5-10s between actions
  
  // Approval queue load
  const approvals = http.get('https://hotdash.app/approvals');
  check(approvals, {
    'approvals status 200': (r) => r.status === 200,
    'approvals load <1s': (r) => r.timings.duration < 1000,
  });
  
  sleep(Math.random() * 3 + 2); // 2-5s between actions
}
```

### Script 3: API Performance Monitor

```typescript
// scripts/performance/api-monitor.ts
/**
 * Continuous API performance monitoring
 * Measures response times and logs degradation
 */

const endpoints = [
  { url: 'https://hotdash-agent-service.fly.dev/health', target: 200 },
  { url: 'https://hotdash-llamaindex-mcp.fly.dev/health', target: 200 },
  { url: 'https://hotdash.app/api/health', target: 200 },
];

async function measureEndpoint(url: string, targetMs: number) {
  const startTime = Date.now();
  try {
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    return {
      url,
      status: response.status,
      responseTime,
      healthy: response.status === 200 && responseTime < targetMs,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      url,
      status: 0,
      responseTime: -1,
      healthy: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
}

async function monitorPerformance() {
  console.log('Starting performance monitoring...\n');
  
  for (const endpoint of endpoints) {
    const result = await measureEndpoint(endpoint.url, endpoint.target);
    
    const status = result.healthy ? '✅' : '❌';
    console.log(`${status} ${result.url}`);
    console.log(`   Response time: ${result.responseTime}ms (target: ${endpoint.target}ms)`);
    console.log(`   Status: ${result.status}`);
    
    if (!result.healthy) {
      console.warn(`   ⚠️ Performance degradation detected!`);
    }
    
    console.log('');
  }
}

// Run monitoring
if (require.main === module) {
  monitorPerformance().catch(console.error);
}
```

---

## Lighthouse Configuration

### File: `tests/performance/budgets.json`

```json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 300
    },
    {
      "resourceType": "stylesheet",
      "budget": 100
    },
    {
      "resourceType": "total",
      "budget": 500
    }
  ],
  "resourceCounts": [
    {
      "resourceType": "third-party",
      "budget": 10
    }
  ],
  "timings": [
    {
      "metric": "first-contentful-paint",
      "budget": 1000
    },
    {
      "metric": "interactive",
      "budget": 2000
    },
    {
      "metric": "largest-contentful-paint",
      "budget": 2500
    },
    {
      "metric": "total-blocking-time",
      "budget": 300
    },
    {
      "metric": "cumulative-layout-shift",
      "budget": 0.1
    }
  ]
}
```

---

## Performance Monitoring Dashboard

### Metrics to Track (Continuous)

1. **Response Times**
   - Dashboard load time
   - API endpoints (P50, P95, P99)
   - Tile rendering time

2. **Resource Usage**
   - CPU utilization (Fly.io metrics)
   - Memory consumption
   - Network bandwidth

3. **User Experience**
   - Time to Interactive (TTI)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

4. **Error Rates**
   - API 5xx errors
   - API 4xx errors
   - JavaScript errors

---

## Implementation Plan

### Phase 1: Setup (1-2 hours)
1. Install k6 for load testing
2. Configure Lighthouse CI
3. Set up performance monitoring scripts
4. Create budgets.json

### Phase 2: Baseline (1 hour)
1. Run Lighthouse on dashboard
2. Measure all API endpoints
3. Document baseline metrics
4. Set alert thresholds

### Phase 3: Load Testing (2-3 hours)
1. Execute normal load scenario
2. Execute peak load scenario
3. Execute burst load scenario
4. Execute sustained load scenario
5. Document results

### Phase 4: Continuous Monitoring (Ongoing)
1. Schedule hourly performance checks
2. Alert on threshold breaches
3. Weekly performance reports
4. Trend analysis

---

## Test Execution Commands

```bash
# Lighthouse audit
npm run performance:lighthouse

# Load testing
npm run performance:load

# API monitoring
npm run performance:monitor

# Full performance suite
npm run performance:all
```

---

## Evidence Requirements

For each test run, capture:
- [ ] Lighthouse report (HTML + JSON)
- [ ] k6 test results (summary + metrics)
- [ ] Screenshots of performance dashboards
- [ ] Response time P95 measurements
- [ ] Memory usage graphs
- [ ] Error rate logs

Store in: `artifacts/performance/YYYY-MM-DD-HHmmss/`

---

**Status**: ✅ Framework documented  
**Evidence**: This document + test scripts  
**Ready for**: Implementation when dashboard build fixed

