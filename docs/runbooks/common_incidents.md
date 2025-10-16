# Common Incidents Runbook

## Overview

This runbook provides step-by-step procedures for resolving common incidents in the HotDash application.

## Table of Contents

1. [Slow Response Times](#slow-response-times)
2. [High Error Rate](#high-error-rate)
3. [Deployment Failures](#deployment-failures)
4. [Database Connection Issues](#database-connection-issues)
5. [Shopify API Errors](#shopify-api-errors)
6. [Memory/CPU Issues](#memorycpu-issues)
7. [Health Check Failures](#health-check-failures)
8. [Secret Rotation Issues](#secret-rotation-issues)

---

## Slow Response Times

**Symptoms:**
- P95 response time > 3 seconds
- Users reporting slow page loads
- Timeout errors

**Diagnosis:**

```bash
# Check Fly.io metrics
fly status -a hotdash-production

# Check logs for slow queries
fly logs -a hotdash-production | grep "duration"

# Check database performance
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

**Resolution:**

1. **Check for slow database queries**
   ```bash
   # Find slow queries
   psql "$DATABASE_URL" -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
   ```

2. **Add database indexes if needed**
   ```sql
   CREATE INDEX idx_table_column ON table_name(column_name);
   ```

3. **Scale Fly.io resources**
   ```bash
   fly scale vm shared-cpu-2x --app hotdash-production
   fly scale memory 2048 --app hotdash-production
   ```

4. **Enable caching**
   - Review cache hit rates
   - Add caching for frequently accessed data

**Prevention:**
- Monitor P95 response times
- Set up alerts for > 3s response times
- Regular database query optimization

---

## High Error Rate

**Symptoms:**
- Error rate > 5%
- Multiple 500 errors in logs
- Users reporting errors

**Diagnosis:**

```bash
# Check error logs
fly logs -a hotdash-production | grep "ERROR\|500"

# Check error metrics
# Review Prometheus metrics at /metrics endpoint
curl https://hotdash-production.fly.dev/metrics | grep error
```

**Resolution:**

1. **Identify error pattern**
   ```bash
   # Group errors by type
   fly logs -a hotdash-production | grep ERROR | awk '{print $NF}' | sort | uniq -c | sort -rn
   ```

2. **Check recent deployments**
   ```bash
   fly releases -a hotdash-production
   ```

3. **Rollback if needed**
   ```bash
   # If errors started after recent deployment
   fly deploy --app hotdash-production --image <previous-image>
   ```

4. **Fix root cause**
   - Review error stack traces
   - Fix code issues
   - Deploy fix

**Prevention:**
- Comprehensive testing before deployment
- Gradual rollouts
- Error rate monitoring and alerts

---

## Deployment Failures

**Symptoms:**
- Deployment workflow fails
- Health checks fail after deployment
- Application won't start

**Diagnosis:**

```bash
# Check deployment logs
fly logs -a hotdash-production

# Check GitHub Actions logs
gh run view <run-id>

# Check machine status
fly status -a hotdash-production
```

**Resolution:**

1. **Check build errors**
   - Review GitHub Actions build logs
   - Fix compilation/build errors

2. **Check deployment errors**
   ```bash
   # View detailed deployment logs
   fly logs -a hotdash-production --tail
   ```

3. **Verify secrets**
   ```bash
   # List secrets
   fly secrets list -a hotdash-production
   
   # Verify required secrets are set
   ```

4. **Rollback to previous version**
   ```bash
   # Use rollback workflow
   # Or manual rollback
   PREV_IMAGE=$(fly releases --app hotdash-production --image | awk 'NR==2 {print $NF}')
   fly deploy --app hotdash-production --image "$PREV_IMAGE"
   ```

**Prevention:**
- Test deployments in staging first
- Verify all secrets before deployment
- Use automated health checks

---

## Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- "Too many connections" errors
- Database timeout errors

**Diagnosis:**

```bash
# Test database connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Check active connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# Check connection limit
psql "$DATABASE_URL" -c "SHOW max_connections;"
```

**Resolution:**

1. **Too many connections**
   ```bash
   # Kill idle connections
   psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';"
   ```

2. **Connection pool exhausted**
   - Increase connection pool size in application
   - Review connection usage patterns

3. **Database unreachable**
   - Check Supabase status: https://status.supabase.com/
   - Verify DATABASE_URL is correct
   - Check network connectivity

**Prevention:**
- Use connection pooling
- Monitor connection count
- Set up alerts for high connection usage

---

## Shopify API Errors

**Symptoms:**
- Shopify API rate limit errors
- Authentication errors
- API timeout errors

**Diagnosis:**

```bash
# Check Shopify API logs
fly logs -a hotdash-production | grep "shopify"

# Check API call metrics
curl https://hotdash-production.fly.dev/metrics | grep shopify_api
```

**Resolution:**

1. **Rate limit errors (429)**
   - Implement exponential backoff
   - Reduce API call frequency
   - Use GraphQL to batch requests

2. **Authentication errors (401)**
   ```bash
   # Verify Shopify credentials
   fly secrets list -a hotdash-production | grep SHOPIFY
   
   # Rotate if needed
   fly secrets set SHOPIFY_API_KEY=<new-key> -a hotdash-production
   fly secrets set SHOPIFY_API_SECRET=<new-secret> -a hotdash-production
   ```

3. **Timeout errors**
   - Increase timeout settings
   - Optimize API queries
   - Use webhooks instead of polling

**Prevention:**
- Implement rate limiting
- Cache Shopify data
- Use webhooks for real-time updates

---

## Memory/CPU Issues

**Symptoms:**
- Out of memory errors
- High CPU usage
- Application crashes

**Diagnosis:**

```bash
# Check resource usage
fly status -a hotdash-production

# Check metrics
fly metrics -a hotdash-production

# Check for memory leaks
fly logs -a hotdash-production | grep "memory\|heap"
```

**Resolution:**

1. **Scale resources**
   ```bash
   # Increase memory
   fly scale memory 2048 --app hotdash-production
   
   # Increase CPU
   fly scale vm shared-cpu-2x --app hotdash-production
   ```

2. **Restart application**
   ```bash
   fly machine restart <machine-id> -a hotdash-production
   ```

3. **Investigate memory leaks**
   - Review application code
   - Check for unclosed connections
   - Profile memory usage

**Prevention:**
- Monitor resource usage
- Set up alerts for high memory/CPU
- Regular performance profiling

---

## Health Check Failures

**Symptoms:**
- `/health` endpoint returning errors
- Health check workflow failing
- Application marked as unhealthy

**Diagnosis:**

```bash
# Test health endpoint
curl https://hotdash-production.fly.dev/health

# Check application logs
fly logs -a hotdash-production | grep health

# Check machine status
fly status -a hotdash-production
```

**Resolution:**

1. **Application not responding**
   ```bash
   # Restart machine
   fly machine restart <machine-id> -a hotdash-production
   ```

2. **Health endpoint error**
   - Check health endpoint implementation
   - Verify dependencies (database, etc.)
   - Fix health check logic

3. **False positive**
   - Review health check criteria
   - Adjust health check thresholds

**Prevention:**
- Comprehensive health checks
- Monitor health check success rate
- Test health checks in staging

---

## Secret Rotation Issues

**Symptoms:**
- Authentication failures after rotation
- Application won't start after secret update
- API errors after rotation

**Diagnosis:**

```bash
# List current secrets
fly secrets list -a hotdash-production

# Check application logs for auth errors
fly logs -a hotdash-production | grep "auth\|unauthorized"
```

**Resolution:**

1. **Verify secret was set correctly**
   ```bash
   # Secrets are masked, but you can verify they exist
   fly secrets list -a hotdash-production
   ```

2. **Rollback secret if needed**
   ```bash
   # Set back to previous value
   fly secrets set SECRET_NAME=<old-value> -a hotdash-production
   ```

3. **Verify application restarted**
   ```bash
   # Secrets require app restart
   fly status -a hotdash-production
   
   # Restart if needed
   fly machine restart <machine-id> -a hotdash-production
   ```

**Prevention:**
- Test secret rotation in staging first
- Document secret rotation procedures
- Keep backup of old secrets temporarily

---

## Quick Reference

### Common Commands

```bash
# Check status
fly status -a hotdash-production

# View logs
fly logs -a hotdash-production --tail

# Restart application
fly machine restart <machine-id> -a hotdash-production

# Scale resources
fly scale memory 2048 --app hotdash-production
fly scale vm shared-cpu-2x --app hotdash-production

# Rollback deployment
PREV_IMAGE=$(fly releases --app hotdash-production --image | awk 'NR==2 {print $NF}')
fly deploy --app hotdash-production --image "$PREV_IMAGE"

# Check database
psql "$DATABASE_URL" -c "SELECT 1;"

# Rotate secret
fly secrets set SECRET_NAME=value -a hotdash-production
```

### Escalation

1. Try automated resolution (this runbook)
2. Create GitHub Issue with appropriate label
3. Contact manager if P0/P1
4. Contact vendor support if platform issue

### Monitoring

- Health checks: Every 5 minutes
- Metrics: /metrics endpoint
- Logs: `fly logs -a hotdash-production`
- Alerts: GitHub Issues (automated)

