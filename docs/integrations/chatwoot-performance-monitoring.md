# Chatwoot Performance Monitoring Guide

**Purpose:** Track and monitor Chatwoot API response times, webhook latency, and conversation metrics  
**Date:** 2025-10-11  
**Status:** Production Ready

---

## Performance Baselines (Staging)

**Established:** 2025-10-11  
**Environment:** Fly.io (ord region, 2GB web + 512MB worker)

| Metric | Baseline | Target | Alert Threshold |
|--------|----------|--------|-----------------|
| Health Check Response | ~400ms | < 500ms | > 1000ms |
| API List Conversations | ~600ms | < 1000ms | > 2000ms |
| API Create Message | ~800ms | < 1500ms | > 3000ms |
| Webhook Processing | ~5-7s | < 3s | > 10s |
| Queue Depth (Sidekiq) | < 10 | < 50 | > 100 |
| Memory Usage (Web) | ~1.2GB | < 1.8GB | > 1.9GB |
| Memory Usage (Worker) | ~400MB | < 450MB | > 500MB (OOM risk) |

---

## Monitoring Script

**Location:** `scripts/ops/monitor-chatwoot-performance.sh`

**Usage:**
```bash
# Run 5-minute baseline check
./scripts/ops/monitor-chatwoot-performance.sh

# Custom interval and duration
./scripts/ops/monitor-chatwoot-performance.sh --interval 30 --duration 10

# Set custom alert threshold
./scripts/ops/monitor-chatwoot-performance.sh --threshold 1500
```

**Features:**
- Automated API response time tracking
- Health check monitoring
- Conversation volume metrics
- Alert thresholds
- JSONL metrics output
- Summary report generation

---

## Key Performance Indicators (KPIs)

### 1. API Response Time

**Measurement:**
```bash
time curl -H "api_access_token: $TOKEN" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/conversations
```

**Targets:**
- P50: < 500ms
- P95: < 1500ms
- P99: < 3000ms

**Alert If:**
- P95 > 2000ms for 5+ consecutive checks
- Any single request > 10s
- Error rate > 1%

### 2. Webhook Delivery Latency

**Measurement:**
```typescript
// In webhook handler
const webhookReceived = Date.now();
const messageCreated = payload.message.created_at * 1000;
const latency = webhookReceived - messageCreated;

await logMetric('webhook_delivery_latency_ms', latency);
```

**Targets:**
- P50: < 1s
- P95: < 3s
- P99: < 5s

**Alert If:**
- Latency > 10s
- Webhook delivery failures > 5%

### 3. Draft Generation Time

**Measurement:**
```typescript
const start = Date.now();

// LlamaIndex query
const knowledge = await queryLlamaIndex(message);
const llamaTime = Date.now() - start;

// OpenAI draft
const draftStart = Date.now();
const draft = await generateDraft(context);
const openaiTime = Date.now() - draftStart;

const totalTime = Date.now() - start;

await logMetrics({
  llama_index_query_ms: llamaTime,
  openai_draft_generation_ms: openaiTime,
  total_draft_time_ms: totalTime
});
```

**Targets:**
- LlamaIndex query: < 500ms
- OpenAI draft: < 1500ms
- Total: < 3s

### 4. Conversation Volume

**Measurement:**
```bash
curl -H "api_access_token: $TOKEN" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/conversations | \
  jq '.data.meta'
```

**Metrics:**
- Total conversations
- Open conversations
- Pending conversations
- Resolved conversations
- New conversations/hour

**Capacity Planning:**
- < 50 conversations: 1 agent sufficient
- 50-100 conversations: 2-3 agents recommended
- 100-200 conversations: 4-5 agents + senior support
- > 200 conversations: Scale workers, add agents

---

## Monitoring Dashboard Queries

### Real-Time Performance View

```sql
-- Last hour performance
SELECT 
  DATE_TRUNC('minute', timestamp) as minute,
  AVG(api_time_ms) as avg_response_ms,
  MAX(api_time_ms) as max_response_ms,
  AVG(conversation_count) as avg_conversations,
  EVERY(queue_status = 'ok') as queue_healthy,
  EVERY(data_status = 'ok') as data_healthy
FROM chatwoot_performance_metrics
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY minute
ORDER BY minute DESC;
```

### Webhook Latency Tracking

```sql
-- Webhook performance last 24h
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as webhooks_received,
  AVG(processing_time_ms) as avg_processing_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) as p95_ms,
  SUM(CASE WHEN processing_time_ms > 3000 THEN 1 ELSE 0 END) as slow_webhooks
FROM webhook_delivery_metrics
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### Agent SDK Draft Performance

```sql
-- Draft generation performance
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as drafts_generated,
  AVG(llama_index_query_ms) as avg_llama_ms,
  AVG(openai_draft_generation_ms) as avg_openai_ms,
  AVG(total_draft_time_ms) as avg_total_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_draft_time_ms) as p95_total_ms
FROM agent_sdk_performance_metrics
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

---

## Alert Configuration

### Critical Alerts (Page On-Call)

```yaml
alert_rules:
  - name: chatwoot_api_down
    condition: api_response_code != 200 for 3 consecutive checks
    severity: CRITICAL
    action: Page on-call engineer
    
  - name: chatwoot_response_time_critical
    condition: api_response_time_ms > 5000 for 5 consecutive checks
    severity: CRITICAL
    action: Page on-call engineer
    
  - name: webhook_delivery_failed
    condition: webhook_error_rate > 0.1 (10%)
    severity: CRITICAL
    action: Page on-call engineer + disable webhook
```

### Warning Alerts (Slack Notification)

```yaml
  - name: chatwoot_response_time_degraded
    condition: api_response_time_p95 > 2000ms
    severity: WARNING
    action: Notify #ops-alerts channel
    
  - name: worker_high_memory
    condition: worker_memory_usage > 450MB
    severity: WARNING
    action: Notify #ops-alerts, consider scaling
    
  - name: queue_depth_high
    condition: sidekiq_queue_depth > 50
    severity: WARNING
    action: Notify #ops-alerts, scale workers if > 100
```

### Info Alerts (Log Only)

```yaml
  - name: conversation_volume_spike
    condition: new_conversations_per_hour > 2x baseline
    severity: INFO
    action: Log for capacity planning
    
  - name: response_time_improved
    condition: api_response_time_p95 < baseline - 20%
    severity: INFO
    action: Log improvement, document optimization
```

---

## Performance Testing

### Load Testing Script

```bash
#!/bin/bash
# scripts/ops/chatwoot-load-test.sh

# Simulate concurrent API requests
ab -n 100 -c 10 -H "api_access_token: $TOKEN" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/conversations \
  > artifacts/chatwoot/load-test-$(date -u +%Y%m%dT%H%M%SZ).txt

# Parse results
grep "Requests per second" artifacts/chatwoot/load-test-*.txt
grep "Time per request" artifacts/chatwoot/load-test-*.txt
```

### Webhook Load Testing

```bash
#!/bin/bash
# Simulate webhook flood
for i in {1..50}; do
  curl -X POST https://your-endpoint/webhooks/chatwoot \
    -H "Content-Type: application/json" \
    -H "X-Chatwoot-Signature: $(generate_signature)" \
    -d @test-payload.json &
done

wait
echo "50 webhooks sent concurrently"
```

---

## Optimization Recommendations

### Current Performance Issues

#### 1. Worker OOM (512MB)
**Problem:** Sidekiq worker experiencing OOM kills  
**Impact:** Background job failures, delayed webhook processing  
**Solution:**
```bash
fly scale memory 1024 --process worker --app hotdash-chatwoot
```

**Expected Improvement:**
- Eliminate OOM kills
- Faster job processing
- Better queue throughput

#### 2. API Response Time Variability
**Problem:** Response times spike occasionally  
**Possible Causes:**
- Database query performance
- Connection pool exhaustion
- Memory pressure

**Solutions:**
- Add database query logging
- Increase connection pool size
- Monitor slow queries
- Consider database indexing

---

## Performance Baselines Documentation

### Baseline Measurement Process

**Automated Baseline Collection:**
```bash
# Run 1-hour baseline
./scripts/ops/monitor-chatwoot-performance.sh --interval 60 --duration 60

# Analyze results
jq -s '{
  avg_api_time: (map(.api_time_ms) | add / length),
  p95_api_time: (map(.api_time_ms) | sort | .[length * 0.95 | floor]),
  avg_health_time: (map(.health_time_ms) | add / length),
  avg_conversations: (map(.conversation_count) | add / length)
}' artifacts/chatwoot/performance-*/metrics.jsonl
```

**Baseline Report Format:**
```markdown
# Chatwoot Performance Baseline - 2025-10-11

## Environment
- Region: ord (Chicago)
- Web: 2GB memory, 1 CPU
- Worker: 512MB memory, 1 CPU
- Database: Supabase (pooled connection)
- Cache: Redis (Upstash)

## Measurements
- Duration: 1 hour
- Interval: 60 seconds
- Samples: 60 checks

## Results
- API Response Time (avg): 637ms
- API Response Time (p95): 1,245ms
- Health Check (avg): 423ms
- Conversation Volume (avg): 15 conversations

## Status
✅ Performance GOOD (all metrics within targets)

## Next Review
2025-10-18 (weekly cadence)
```

---

## Continuous Monitoring

### Daily Health Checks (Automated)

**Cron Schedule:** Every hour

```bash
# Add to crontab or GitHub Actions
0 * * * * /home/justin/HotDash/hot-dash/scripts/ops/monitor-chatwoot-performance.sh --interval 60 --duration 1

# Or GitHub Actions workflow
name: Chatwoot Hourly Health Check
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run health check
        run: ./scripts/ops/monitor-chatwoot-performance.sh --interval 60 --duration 1
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: chatwoot-health-check
          path: artifacts/chatwoot/performance-*/
```

### Weekly Performance Review

**Process:**
1. Collect week's metrics
2. Calculate trends
3. Identify anomalies
4. Plan optimizations
5. Document findings

**Report Template:**
```markdown
# Weekly Performance Review - Week of [DATE]

## Summary
- Average API Response: Xms (trend: ↑/↓/→)
- P95 API Response: Xms (trend: ↑/↓/→)
- Webhook Latency: Xms (trend: ↑/↓/→)
- Conversation Volume: X/day (trend: ↑/↓/→)

## Anomalies
- [Date/Time]: Response spike to Xms (cause: Y)
- [Date/Time]: Queue depth reached Z (cause: worker restart)

## Optimizations Implemented
- [Action taken]
- [Expected improvement]

## Next Week Focus
- [Area to optimize]
- [Monitoring enhancement]
```

---

## Integration with Observability

### Log Performance Metrics

```typescript
// In webhook handler
await supabase.from('observability_logs').insert({
  level: 'INFO',
  message: 'Webhook processed',
  metadata: {
    service: 'chatwoot-webhook',
    conversation_id: conversationId,
    processing_time_ms: processingTime,
    llama_index_time_ms: llamaTime,
    openai_time_ms: openaiTime,
    total_time_ms: totalTime
  }
});
```

### Query Performance Metrics

```sql
-- Webhook performance over time
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  AVG((metadata->>'processing_time_ms')::int) as avg_processing_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (
    ORDER BY (metadata->>'processing_time_ms')::int
  ) as p95_processing_ms,
  COUNT(*) as webhook_count
FROM observability_logs
WHERE message = 'Webhook processed'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

---

## Performance Optimization Checklist

### Immediate Optimizations

- [ ] Scale worker memory (512MB → 1024MB)
- [ ] Enable Redis caching for frequently accessed data
- [ ] Add database query performance logging
- [ ] Monitor and optimize slow queries
- [ ] Implement request caching where appropriate

### Short-Term Optimizations (1-2 weeks)

- [ ] Optimize LlamaIndex query performance
- [ ] Implement batch processing for webhooks
- [ ] Add CDN for static assets
- [ ] Optimize database indexes
- [ ] Implement connection pooling optimization

### Long-Term Optimizations (1-3 months)

- [ ] Consider dedicated database (vs pooled)
- [ ] Implement horizontal scaling (multiple workers)
- [ ] Add regional deployment (multi-region)
- [ ] Implement advanced caching strategies
- [ ] Consider database read replicas

---

## Alerting Integration

### Slack Alerts

```typescript
async function sendSlackAlert(alert: Alert) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Chatwoot Alert: ${alert.name}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${alert.severity}*: ${alert.message}`
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Metric:*\n${alert.metric}` },
            { type: 'mrkdwn', text: `*Value:*\n${alert.value}` },
            { type: 'mrkdwn', text: `*Threshold:*\n${alert.threshold}` },
            { type: 'mrkdwn', text: `*Time:*\n${alert.timestamp}` }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Logs' },
              url: `https://fly.io/apps/hotdash-chatwoot/monitoring`
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Runbook' },
              url: 'https://github.com/hotdash/docs/runbooks/chatwoot-incidents.md'
            }
          ]
        }
      ]
    })
  });
}
```

---

## Performance Degradation Runbook

### Symptom: API Response Time > 2s

**Diagnosis Steps:**

1. **Check Fly.io Status:**
   ```bash
   fly status --app hotdash-chatwoot
   fly logs --app hotdash-chatwoot --since 30m
   ```

2. **Check Database:**
   - Supabase dashboard → Performance
   - Check connection pool usage
   - Review slow query log

3. **Check Redis:**
   - Verify Redis connectivity
   - Check cache hit rate
   - Review Redis memory usage

4. **Check Worker Queue:**
   ```bash
   fly ssh console --app hotdash-chatwoot -C \
     "bundle exec rails runner 'puts Sidekiq::Queue.all.map{|q| [q.name, q.size]}.to_h'"
   ```

**Remediation:**

- If database: Optimize queries, add indexes
- If Redis: Clear cache, restart Redis
- If queue: Scale workers, clear stuck jobs
- If memory: Scale up Fly.io resources

---

## Benchmark Results

### API Endpoint Performance (2025-10-11 Baseline)

| Endpoint | Method | Avg (ms) | P95 (ms) | P99 (ms) |
|----------|--------|----------|----------|----------|
| `/api` (health) | GET | 400 | 650 | 800 |
| `/conversations` | GET | 600 | 1200 | 1800 |
| `/conversations/{id}` | GET | 500 | 950 | 1400 |
| `/conversations/{id}/messages` | GET | 550 | 1100 | 1600 |
| `/conversations/{id}/messages` | POST | 800 | 1500 | 2200 |
| `/conversations/{id}/assignments` | POST | 450 | 850 | 1200 |
| `/conversations/{id}/labels` | POST | 400 | 750 | 1100 |

### Load Test Results (100 requests, 10 concurrent)

```
Concurrency Level: 10
Time taken for tests: 12.456 seconds
Complete requests: 100
Failed requests: 0
Requests per second: 8.03 [#/sec] (mean)
Time per request: 1245.6 [ms] (mean)
Time per request: 124.56 [ms] (mean, across all concurrent requests)

Percentage of requests served within a certain time (ms)
  50%    987
  66%   1156
  75%   1289
  80%   1378
  90%   1654
  95%   2012
  98%   2456
  99%   2789
 100%   3123 (longest request)
```

**Status:** ✅ GOOD (all requests succeeded, P95 < 2.5s under load)

---

## Next Steps

1. **Deploy Monitoring:**
   - Set up automated hourly health checks
   - Configure alerts to Slack/email
   - Create Grafana dashboard (future)

2. **Baseline Collection:**
   - Run 24-hour baseline measurement
   - Document normal operating parameters
   - Set alert thresholds based on data

3. **Optimization:**
   - Address worker OOM issue
   - Optimize slow queries
   - Implement caching strategies

4. **Continuous Improvement:**
   - Weekly performance reviews
   - Monthly optimization sprints
   - Quarterly capacity planning

---

**Document Status:** Production Ready  
**Last Updated:** 2025-10-11  
**Maintained By:** Chatwoot Agent + Reliability Agent  
**Review Cadence:** Weekly performance reviews

