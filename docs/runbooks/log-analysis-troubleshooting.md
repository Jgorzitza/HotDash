# Log Analysis & Troubleshooting Guide

**Version**: 1.0  
**Last Updated**: 2025-10-21  
**Owner**: DevOps  
**Status**: ACTIVE

---

## Overview

Guide for analyzing Fly.io logs, identifying performance issues, and troubleshooting common problems in HotDash applications.

## Quick Reference

| Issue | Log Pattern | Command | Solution |
|-------|-------------|---------|----------|
| App Crash | `exit code: 1` | `flyctl logs -n 200` | Check startup logs, rollback if needed |
| Slow Response | `GET.*>5000 ms` | Performance analysis script | Database query optimization |
| Database Error | `Prisma.*error\|database` | `flyctl logs \| grep -i prisma` | Check connection, verify schema |
| External API Fail | `GA\|Shopify.*error` | `flyctl logs \| grep -i "ga\|shopify"` | Check API status, credentials |

---

## Performance Log Queries

### Extract Response Times

```bash
# Get recent response times
flyctl logs --app hotdash-staging | grep -oE "GET.*[0-9]+\.[0-9]+ ms" | awk '{print $(NF-1)}' | sort -n | tail -20
```

**Output**: List of response times (sorted)

**Analyze**:
```bash
# Calculate average, min, max, P95
./scripts/monitoring/analyze-performance-logs.sh
```

### Find Slow Requests

```bash
# Find requests taking >3 seconds
flyctl logs --app hotdash-staging | grep -E "GET.*[3-9][0-9]{3}\.[0-9]+ ms"
```

**Example Output**:
```
GET /api/analytics/revenue 200 - - 3542.8 ms
GET /app/_index 200 - - 4123.1 ms
```

### Error Rate Calculation

```bash
# Count total requests vs errors
TOTAL=$(flyctl logs --app hotdash-staging | grep -cE "GET|POST")
ERRORS=$(flyctl logs --app hotdash-staging | grep -cE "50[0-9]")
ERROR_RATE=$(echo "scale=2; ($ERRORS / $TOTAL) * 100" | bc)
echo "Error rate: ${ERROR_RATE}%"
```

---

## Common Issues & Solutions

### Issue 1: App Won't Start

**Symptoms**:
- Machine shows "started" but app returns 502
- Logs show `exit code: 1`
- Restart count incrementing

**Log Patterns to Check**:
```bash
flyctl logs --app hotdash-staging | grep -E "exit code|Error|SyntaxError"
```

**Common Causes**:
1. **Module import error**:
   ```
   SyntaxError: Named export 'xyz' not found
   ```
   Solution: Fix import statement, redeploy

2. **Missing environment variable**:
   ```
   Error: Environment variable XYZ is not defined
   ```
   Solution: Set secret via `flyctl secrets set`

3. **Database connection failure**:
   ```
   Prisma.*Can't reach database server
   ```
   Solution: Verify DATABASE_URL, check Supabase status

### Issue 2: Slow Performance

**Symptoms**:
- Response times >3s
- Users report slowness
- Metrics show degradation

**Log Analysis**:
```bash
# Find slow database queries
flyctl logs --app hotdash-staging | grep -E "ActiveRecord.*[0-9]{3,}\.[0-9]+ms"

# Find slow API calls
flyctl logs --app hotdash-staging | grep -E "fetch.*took [0-9]{4,}ms"
```

**Solutions**:
1. **Database slow**: Add indexes (coordinate with Data agent)
2. **External API slow**: Implement caching, increase timeouts
3. **Memory pressure**: Scale up machine
4. **Cold start**: Increase `min_machines_running`

### Issue 3: Intermittent 502 Errors

**Symptoms**:
- Occasional 502 responses
- App works most of the time
- Logs show occasional crashes

**Log Analysis**:
```bash
# Check for crash patterns
flyctl logs --app hotdash-staging | grep -B5 -A5 "exit code"
```

**Common Causes**:
1. **Memory leak**: App crashes when memory exhausted
   Solution: Investigate memory usage, fix leak, increase memory

2. **Unhandled promise rejection**: Async error crashes app
   Solution: Add error handling, redeploy

3. **Database connection timeout**: Connection pool exhausted
   Solution: Tune connection pool settings

### Issue 4: High CPU Usage

**Symptoms**:
- Machine CPU >80%
- Slow response times
- Fly dashboard shows red CPU metrics

**Log Analysis**:
```bash
# Check for CPU-intensive operations
flyctl logs --app hotdash-staging | grep -E "Processing.*took.*ms" | sort -t: -k4 -n | tail -20
```

**Solutions**:
1. **Inefficient queries**: Optimize database queries
2. **Large data processing**: Move to background jobs
3. **Traffic spike**: Scale horizontally (add machines)

### Issue 5: Database Connection Errors

**Symptoms**:
- Logs show Prisma connection errors
- Intermittent failures

**Log Patterns**:
```
Prisma Client could not connect to database
Connection timed out
too many connections
```

**Log Analysis**:
```bash
flyctl logs --app hotdash-staging | grep -i "prisma.*error\|database.*error"
```

**Solutions**:
1. **Connection limit reached**: Use pooler URL (`DIRECT_URL` vs `DATABASE_URL`)
2. **Network issue**: Check Supabase status
3. **Credentials expired**: Rotate database credentials

---

## Structured Log Queries

### By Time Range

```bash
# Last hour
flyctl logs --app hotdash-staging --since 1h

# Specific time range (not supported directly - use grep)
flyctl logs --app hotdash-staging | grep "2025-10-21T06:"
```

### By Log Level

```bash
# Errors only
flyctl logs --app hotdash-staging | grep -E "\[error\]|ERROR"

# Warnings
flyctl logs --app hotdash-staging | grep -E "\[warn\]|WARN"

# Info
flyctl logs --app hotdash-staging | grep -E "\[info\]|INFO"
```

### By Component

```bash
# Prisma/Database
flyctl logs --app hotdash-staging | grep -i prisma

# Shopify API
flyctl logs --app hotdash-staging | grep -i shopify

# Google Analytics
flyctl logs --app hotdash-staging | grep -i "ga\|analytics"

# React Router
flyctl logs --app hotdash-staging | grep -i "react-router"
```

### By Request Path

```bash
# Specific endpoint
flyctl logs --app hotdash-staging | grep "GET /api/analytics/revenue"

# All API calls
flyctl logs --app hotdash-staging | grep -E "GET /api|POST /api"

# All tile endpoints
flyctl logs --app hotdash-staging | grep -E "/api/(analytics|seo|inventory|ads)"
```

---

## Performance Benchmarks

### Expected Response Times (Staging v74)

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| Health check | <100ms | <200ms | <500ms |
| Login page | <500ms | <1s | <2s |
| Dashboard (/app) | <1s | <3s | <5s |
| Tile API calls | <500ms | <2s | <3s |
| SSE connection | <100ms | <200ms | <500ms |

### Database Query Benchmarks

| Query Type | Expected Time | Warning | Critical |
|------------|---------------|---------|----------|
| Single row fetch | <10ms | >50ms | >100ms |
| List query (20 rows) | <50ms | >200ms | >500ms |
| Aggregation | <200ms | >1s | >3s |
| Full-text search | <500ms | >2s | >5s |

---

## Log Export & Analysis

### Export Logs for Analysis

```bash
# Export last 1000 lines
flyctl logs --app hotdash-staging -n 1000 > logs/staging-$(date +%Y%m%d-%H%M%S).log

# Export since specific time
flyctl logs --app hotdash-staging --since 24h > logs/staging-24h.log
```

### Analyze Exported Logs

```bash
# Count requests by endpoint
cat logs/staging-*.log | grep -oE "GET /[^ ]+" | sort | uniq -c | sort -rn | head -10

# Find all errors with context
cat logs/staging-*.log | grep -B3 -A3 -iE "error|fail"

# Response time histogram
cat logs/staging-*.log | grep -oE "[0-9]+\.[0-9]+ ms" | awk '{gsub(/ms/,""); print int($1/100)*100}' | sort -n | uniq -c
```

---

## Troubleshooting Flowcharts

### Deployment Failed

1. Check build logs → Fix build error → Redeploy
2. Check release command → Fix prisma/setup → Redeploy
3. Check health checks → Fix app code → Redeploy
4. If all fail → Rollback to previous version

### App Returning 502

1. Check machine status → Restart if stopped
2. Check app logs → Fix startup error → Redeploy
3. Check health endpoint → Fix health check logic
4. Check database → Verify connection
5. If persistent → Rollback

### Slow Performance

1. Check logs for slow queries → Add indexes
2. Check external API calls → Add caching
3. Check machine resources → Scale up
4. Check recent deployments → Rollback if regression
5. Run EXPLAIN ANALYZE → Optimize queries

### Database Errors

1. Check connection string → Verify credentials
2. Check connection pool → Use pooler URL
3. Check schema → Run migrations
4. Check Supabase status → Wait or escalate
5. Check RLS policies → Verify permissions

---

## Monitoring Script Usage

### Health Check Script

```bash
# Run staging health check
./scripts/monitoring/check-staging-health.sh

# Sample output:
# === HotDash Staging Health Check ===
# 1. Health Endpoint: ✅ HEALTHY (HTTP 200)
# 2. Response Time: 1234ms ✅ GOOD (<3s)
# 3. Machine Status: started, host_status: ok
# 4. Recent Errors: 0 ✅ NO ERRORS
```

### Performance Analysis Script

```bash
# Analyze staging logs
./scripts/monitoring/analyze-performance-logs.sh

# Sample output:
# === Performance Log Analysis ===
# 1. Response Times:
#    Avg: 1234.56 ms
#    Min: 234.12 ms
#    Max: 4567.89 ms
#    P95: 3456.78 ms
# 2. Error Summary: 0 errors
# 3. Common Issues: None detected
```

---

## Alert Response Checklists

### Critical Alert Received

- [ ] Acknowledge alert (respond to email/Slack)
- [ ] Check Fly dashboard for machine status
- [ ] Pull recent logs (last 200 lines)
- [ ] Identify root cause
- [ ] Take corrective action (restart, rollback, fix)
- [ ] Verify resolution
- [ ] Document in feedback file
- [ ] Post-mortem if major incident

### Warning Alert Received

- [ ] Note alert timestamp
- [ ] Check if issue is persistent or transient
- [ ] Pull logs for analysis
- [ ] Create bug ticket if persistent
- [ ] Monitor for escalation
- [ ] Document in feedback if needs attention

---

## Emergency Contacts

**DevOps Agent**: Primary responder for infrastructure issues  
**Manager**: Escalation for deployment/rollback decisions  
**CEO**: Escalation for critical customer-impacting incidents

**Feedback File**: `feedback/devops/YYYY-MM-DD.md`

---

**🔍 End of Runbook**


