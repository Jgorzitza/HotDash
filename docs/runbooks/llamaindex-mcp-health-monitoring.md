---
epoch: 2025.10.E1
doc: docs/runbooks/llamaindex-mcp-health-monitoring.md
owner: ai
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# LlamaIndex MCP Server - Health Monitoring & Incident Response

## Health Check Endpoint

**URL**: `https://hotdash-llamaindex-mcp.fly.dev/health`

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T13:20:00Z",
  "index_age_hours": 12,
  "last_query_at": "2025-10-14T13:15:00Z",
  "cache_hit_rate": 0.78,
  "avg_latency_ms": 245
}
```

**Unhealthy Indicators**:
- Status not "healthy"
- Index age >24 hours
- Avg latency >1000ms
- No response (timeout/connection error)

## Monitoring Metrics

### 1. Query Latency
**Target**: P95 <500ms

**Check Command**:
```bash
curl -s https://hotdash-llamaindex-mcp.fly.dev/health | jq '.avg_latency_ms'
```

**Alert If**: P95 >500ms for 15 minutes

**Investigation Steps**:
1. Check Fly.io machine status
2. Review recent query volume (spike?)
3. Check index size (too large?)
4. Review error logs for slow queries

### 2. Error Rate
**Target**: <5% of queries

**Check**: Monitor application logs for error count

**Alert If**: >5% errors for 10 minutes

**Investigation Steps**:
1. Check error types (timeout, 500, connection)
2. Review recent deployments
3. Check dependency health (Supabase, OpenAI)
4. Verify index integrity

### 3. Index Staleness
**Target**: Refreshed within 24 hours

**Check Command**:
```bash
curl -s https://hotdash-llamaindex-mcp.fly.dev/health | jq '.index_age_hours'
```

**Alert If**: >24 hours old

**Investigation Steps**:
1. Check nightly refresh job status
2. Review refresh job logs
3. Manually trigger refresh if needed
4. Verify data sources accessible

### 4. Service Availability
**Target**: 99.9% uptime

**Check**: HTTP GET /health returns 200

**Alert If**: Down for >5 minutes

**Investigation Steps**:
1. Check Fly.io status page
2. Restart machine if crashed
3. Review application logs
4. Scale if resource constrained

## Common Issues & Solutions

### Issue 1: High Latency (>1s P95)

**Symptoms**:
- Slow query responses
- Timeout errors
- Poor user experience

**Diagnosis**:
```bash
# Check MCP server logs
fly logs -a hotdash-llamaindex-mcp --region ord

# Check query distribution
# Look for complex queries or large result sets
```

**Solutions**:
1. **Optimize topK**: Reduce from 10 to 5 if returning too many results
2. **Implement caching**: Add 5-minute TTL cache for common queries
3. **Scale machine**: Increase Fly.io machine size if CPU-bound
4. **Index optimization**: Reduce chunk size or optimize embeddings

### Issue 2: Index Stale (>24 hours)

**Symptoms**:
- Health check shows old index_age_hours
- Queries return outdated information
- Missing recent content

**Diagnosis**:
```bash
# Check nightly job status
fly logs -a hotdash-llamaindex-mcp --region ord | grep "refresh"

# Verify schedule configuration
```

**Solutions**:
1. **Manual refresh**: Trigger refresh via API or CLI
2. **Fix schedule**: Verify cron job configuration
3. **Check data sources**: Ensure Supabase/web sources accessible
4. **Review errors**: Check refresh job logs for failures

**Manual Refresh**:
```bash
curl -X POST https://hotdash-llamaindex-mcp.fly.dev/refresh \
  -H "Content-Type: application/json" \
  -d '{"sources": "all", "full": false}'
```

### Issue 3: Service Down

**Symptoms**:
- Health endpoint not responding
- 502/503 errors
- Connection timeouts

**Diagnosis**:
```bash
# Check machine status
fly status -a hotdash-llamaindex-mcp

# Check recent deployments
fly releases -a hotdash-llamaindex-mcp

# Review logs
fly logs -a hotdash-llamaindex-mcp --region ord
```

**Solutions**:
1. **Restart machine**:
   ```bash
   source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
   fly machine restart <machine-id> -a hotdash-llamaindex-mcp
   ```

2. **Check resources**: May be OOM or CPU throttled
   ```bash
   fly machine status <machine-id> -a hotdash-llamaindex-mcp
   ```

3. **Rollback if needed**:
   ```bash
   fly releases -a hotdash-llamaindex-mcp
   # Note previous version and rollback if recent deploy caused issue
   ```

4. **Scale up**: If resource constrained
   ```bash
   fly scale vm shared-cpu-2x -a hotdash-llamaindex-mcp
   ```

### Issue 4: Poor Query Results

**Symptoms**:
- Low confidence scores
- Irrelevant results returned
- Knowledge not found

**Diagnosis**:
- Review query logs for patterns
- Check if knowledge exists in index
- Verify embedding quality

**Solutions**:
1. **Refresh index**: May have stale or corrupted data
2. **Expand knowledge base**: Add missing content
3. **Tune similarity threshold**: Adjust for better precision/recall
4. **Review source documents**: Ensure content quality

### Issue 5: High Error Rate

**Symptoms**:
- Multiple queries failing
- 500 errors in logs
- Agent SDK timeouts

**Diagnosis**:
```bash
# Check error logs
fly logs -a hotdash-llamaindex-mcp --region ord | grep "ERROR"

# Check OpenAI API status
curl https://status.openai.com/api/v2/status.json
```

**Solutions**:
1. **Dependency failure**: Check OpenAI, Supabase status
2. **Code bug**: Review recent deployments, rollback if needed
3. **Resource limits**: Check memory/CPU usage
4. **Rate limiting**: Verify not hitting OpenAI rate limits

## Alert Configuration

### Critical (Page Immediately)
```yaml
alerts:
  - name: MCP Service Down
    condition: health_check_fails_for_5min
    action: page_engineer
    
  - name: High Error Rate
    condition: error_rate >10% for_10min
    action: page_engineer_and_ai
    
  - name: Complete Failure
    condition: no_successful_queries_for_15min
    action: page_engineer_manager
```

### Warning (4-Hour SLA)
```yaml
alerts:
  - name: Degraded Performance
    condition: p95_latency >1s for_30min
    action: notify_ai_engineer
    
  - name: Stale Index
    condition: index_age >24h
    action: notify_ai
    
  - name: Elevated Errors
    condition: error_rate >5% for_30min
    action: notify_ai_engineer
```

### Info (Daily Review)
```yaml
alerts:
  - name: Usage Spike
    condition: query_volume >2x_normal
    action: log_for_review
    
  - name: Cache Performance
    condition: cache_hit_rate <50%
    action: review_caching_strategy
```

## Monitoring Dashboard

### Key Metrics Display
1. **Uptime**: 99.9% SLA target
2. **Latency**: P50, P95, P99 response times
3. **Error Rate**: % of failed queries
4. **Index Freshness**: Hours since last refresh
5. **Query Volume**: Queries per hour
6. **Cache Performance**: Hit rate %

### Graphs
- Response time trend (24h, 7d)
- Error rate over time
- Query volume histogram
- Cache hit rate trend

## Escalation Path

### L1: AI Agent (Monitor & Optimize)
- Review metrics daily
- Optimize query performance
- Update knowledge base
- Tune parameters

### L2: Engineer (Infrastructure & Code)
- Resolve service outages
- Deploy code fixes
- Scale resources
- Update dependencies

### L3: Manager (Strategic Decisions)
- Approve major changes
- Budget for scaling
- Prioritize feature work

## Runbook for Common Scenarios

### Scenario 1: Slow Queries During Peak Hours

**Detection**: Latency spikes 2x-3x normal during business hours

**Action**:
1. Verify not a temporary spike (wait 15 min)
2. Check query complexity (log recent queries)
3. Scale machine if CPU >80%
4. Implement caching if not present
5. Reduce topK if returning too many results

**Timeline**: Resolve within 2 hours

### Scenario 2: Index Refresh Failing Nightly

**Detection**: index_age_hours increasing daily

**Action**:
1. Check refresh job logs for errors
2. Verify data sources accessible (Supabase, hotrodan.com)
3. Test manual refresh
4. Fix source access if needed
5. Re-enable automated job

**Timeline**: Resolve within 4 hours

### Scenario 3: Complete Service Outage

**Detection**: Health endpoint not responding

**Action**:
1. Check Fly.io status page
2. Restart machine via Fly CLI
3. If restart fails, check logs for crash reason
4. Deploy previous version if recent deploy caused it
5. Notify manager if extended outage

**Timeline**: Resolve within 30 minutes

## Success Metrics

**Week 1**:
- Health monitoring operational
- Alerts configured and tested
- Response to first incident <1 hour

**Month 1**:
- Uptime >99%
- P95 latency <500ms
- Index refresh 100% success rate

**Quarter 1**:
- Uptime >99.9%
- Zero critical outages
- Automated remediation for common issues

**Coordination with @engineer**: Health endpoint implementation, alert integration

**Task 5 Status**: ✅ COMPLETE (monitoring runbook ready)

EOF
echo "Task 5 complete"
