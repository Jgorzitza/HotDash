# Production Load Testing Guide

**Purpose:** Validate production infrastructure can handle 1000 concurrent users
**Tool:** k6 (https://k6.io/)
**Target:** https://hotdash-production.fly.dev

---

## Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```bash
choco install k6
```

**Docker:**
```bash
docker pull grafana/k6
```

---

## Load Test Configuration

### Test Stages

1. **Warm-up (2 min):** Ramp to 100 users
2. **Ramp-up Phase 1 (3 min):** Ramp to 300 users
3. **Ramp-up Phase 2 (3 min):** Ramp to 600 users
4. **Ramp-up Phase 3 (2 min):** Ramp to 1000 users
5. **Sustained Load (5 min):** Hold at 1000 users
6. **Ramp-down Phase 1 (2 min):** Reduce to 500 users
7. **Ramp-down Phase 2 (2 min):** Reduce to 0 users

**Total Duration:** ~19 minutes

### Success Criteria

- ✅ P95 response time < 3s
- ✅ Error rate < 0.5%
- ✅ Health checks remain passing
- ✅ No crashes or restarts
- ✅ Memory usage stable

---

## Running the Load Test

### Option 1: Using the Script (Recommended)

```bash
# Make script executable
chmod +x scripts/deploy/run-load-test.sh

# Run load test
./scripts/deploy/run-load-test.sh
```

### Option 2: Direct k6 Command

```bash
# Run load test
k6 run artifacts/devops/2025-10-24/load-test-script.js

# Run with custom output
k6 run --out json=load-test-results.json artifacts/devops/2025-10-24/load-test-script.js
```

### Option 3: Docker

```bash
docker run --rm -v $(pwd):/app grafana/k6 run /app/artifacts/devops/2025-10-24/load-test-script.js
```

---

## Monitoring During Test

### 1. Fly.io Dashboard

Monitor in real-time:
- URL: https://fly.io/apps/hotdash-production/monitoring
- Watch: CPU, Memory, Request rate, Response times

### 2. Application Health

Check health endpoints:
```bash
# Basic health
watch -n 5 'curl -s https://hotdash-production.fly.dev/health | head -1'

# Detailed health
watch -n 5 'curl -s https://hotdash-production.fly.dev/api/monitoring/health | jq .'
```

### 3. Fly.io CLI

```bash
# Watch status
watch -n 5 'fly status --app hotdash-production'

# Stream logs
fly logs --app hotdash-production
```

---

## Interpreting Results

### Key Metrics

**Response Times:**
- `http_req_duration.avg` - Average response time
- `http_req_duration.p(95)` - 95th percentile (target: < 3000ms)
- `http_req_duration.max` - Maximum response time

**Throughput:**
- `http_reqs.count` - Total requests
- `http_reqs.rate` - Requests per second

**Errors:**
- `http_req_failed.rate` - Error rate (target: < 0.005 = 0.5%)
- `errors.rate` - Custom error rate

**Virtual Users:**
- `vus` - Current virtual users
- `vus_max` - Maximum virtual users reached

### Success Indicators

✅ **PASS:**
- P95 < 3000ms
- Error rate < 0.5%
- All thresholds green
- No application crashes
- Health checks passing throughout

❌ **FAIL:**
- P95 > 3000ms
- Error rate > 0.5%
- Any threshold red
- Application crashes/restarts
- Health checks failing

---

## Example Results

### Successful Test

```
Load Test Summary
================

Duration: 1140.00s
Total Requests: 342000
Request Rate: 300.00 req/s

Response Times:
  Average: 1250.50ms
  P95: 2450.75ms
  Max: 2980.25ms

Error Rate: 0.12%

Thresholds:
  ✓ http_req_duration p(95)<3000
  ✓ http_req_failed rate<0.005
  ✓ errors rate<0.005
  ✓ health_check_duration p(95)<2000
  ✓ api_health_duration p(95)<3000
```

### Failed Test

```
Load Test Summary
================

Duration: 1140.00s
Total Requests: 285000
Request Rate: 250.00 req/s

Response Times:
  Average: 2850.50ms
  P95: 4250.75ms  ❌ EXCEEDS TARGET
  Max: 8980.25ms

Error Rate: 1.25%  ❌ EXCEEDS TARGET

Thresholds:
  ✗ http_req_duration p(95)<3000
  ✗ http_req_failed rate<0.005
  ✓ errors rate<0.005
  ✓ health_check_duration p(95)<2000
  ✓ api_health_duration p(95)<3000
```

---

## Troubleshooting

### High Response Times

**Symptoms:** P95 > 3000ms

**Possible Causes:**
- Database connection pool exhausted
- CPU/Memory limits reached
- Network latency
- Slow queries

**Actions:**
1. Check Fly.io metrics (CPU, Memory)
2. Review application logs
3. Check database connection pool size
4. Analyze slow queries
5. Consider scaling up (more machines or larger instances)

### High Error Rate

**Symptoms:** Error rate > 0.5%

**Possible Causes:**
- Application crashes
- Database connection failures
- Timeout errors
- Rate limiting

**Actions:**
1. Check application logs for errors
2. Verify database connectivity
3. Check health endpoints
4. Review timeout configurations
5. Check for rate limiting

### Application Crashes

**Symptoms:** Health checks failing, machines restarting

**Possible Causes:**
- Memory leaks
- Unhandled exceptions
- Resource exhaustion

**Actions:**
1. Review crash logs
2. Check memory usage trends
3. Analyze error patterns
4. Review recent code changes
5. Consider rollback if needed

---

## Post-Test Actions

### 1. Analyze Results

```bash
# View full results
cat artifacts/devops/2025-10-24/load-test-results.json | jq .

# Extract key metrics
cat artifacts/devops/2025-10-24/load-test-results.json | jq '.metrics | {
  p95: .http_req_duration.values["p(95)"],
  error_rate: .http_req_failed.values.rate,
  total_requests: .http_reqs.values.count,
  request_rate: .http_reqs.values.rate
}'
```

### 2. Document Findings

Create report: `artifacts/devops/2025-10-24/load-test-report.md`

Include:
- Test configuration
- Results summary
- Pass/fail status
- Performance bottlenecks identified
- Recommendations

### 3. Log to Database

```bash
npx tsx --env-file=.env scripts/devops/log-load-test-results.ts
```

### 4. Update Task Status

If test passed:
```bash
npx tsx --env-file=.env scripts/agent/complete-task.ts DEVOPS-LAUNCH-001 "Load test passed: P95 < 3s, error rate < 0.5%, all thresholds met"
```

---

## Scheduling Recommendations

### Best Times to Run

**Recommended:**
- Off-peak hours: 2-4 AM UTC
- Weekends: Saturday/Sunday early morning
- After major deployments (staging first)

**Avoid:**
- Peak business hours
- During active user sessions
- Before major releases
- During maintenance windows

### Frequency

- **Pre-launch:** Once before production launch
- **Post-launch:** Monthly or after major changes
- **Continuous:** Automated weekly tests (lower load)

---

## Automated Load Testing

### GitHub Actions Workflow

Create `.github/workflows/load-test-production.yml`:

```yaml
name: Production Load Test

on:
  schedule:
    - cron: '0 3 * * 0'  # Weekly on Sunday at 3 AM UTC
  workflow_dispatch:
    inputs:
      max_users:
        description: 'Maximum concurrent users'
        required: true
        default: '1000'

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run load test
        run: k6 run artifacts/devops/2025-10-24/load-test-script.js
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results-${{ github.run_id }}
          path: artifacts/devops/2025-10-24/load-test-results.json
          retention-days: 90
```

---

## References

- k6 Documentation: https://k6.io/docs/
- Fly.io Monitoring: https://fly.io/docs/reference/metrics/
- Load Testing Best Practices: https://k6.io/docs/testing-guides/
- Performance Targets: `docs/NORTH_STAR.md`

