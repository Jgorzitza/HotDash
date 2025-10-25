# Agent Service Monitoring Guide

**Service:** Agent SDK Service  
**Purpose:** Monitor handoff performance, agent accuracy, and system health

## Overview

This guide covers monitoring strategies for the Agent SDK Service, including metrics tracking, alerting, and performance analysis.

## Key Metrics

### 1. Handoff Metrics

**Handoff Accuracy**
- **Definition:** % of conversations routed to the correct agent
- **Target:** ≥ 90%
- **Measurement:** Human feedback on routing decisions
- **Query:** `getHandoffAccuracy('7d')`

**Average Confidence**
- **Definition:** Mean confidence score across all handoff decisions
- **Target:** ≥ 0.80
- **Measurement:** Confidence scores from handoff manager
- **Query:** `getAverageConfidence('7d')`

**Fallback Rate**
- **Definition:** % of conversations requiring human review
- **Target:** ≤ 10%
- **Measurement:** Fallback triggers / total conversations
- **Query:** `getFallbackRate('7d')`

**Handoff Latency**
- **Definition:** Time to make handoff decision
- **Target:** < 100ms (avg), < 150ms (p99)
- **Measurement:** Processing time in handoff manager
- **Query:** `getHandoffLatency('7d')`

### 2. Agent Utilization

**Distribution of Work**
- Order Support: ~45%
- Shipping Support: ~25%
- Product Q&A: ~20%
- Technical Support: ~10%

**Query:** `getAgentUtilization('7d')`

### 3. System Health

**Service Uptime**
- **Target:** ≥ 99.9%
- **Measurement:** Health check endpoint
- **Monitoring:** Fly.io health checks

**Response Times**
- Health check: < 100ms
- Webhook processing: < 3s
- Agent response: < 5s

**Resource Usage**
- Memory: < 400MB
- CPU: < 80%
- Disk: < 1GB

### 4. Quality Metrics

**HITL Approval Rate**
- **Definition:** % of AI drafts approved without edits
- **Target:** ≥ 70%
- **Measurement:** Approval queue data

**Human Review Time**
- **Definition:** Time from draft to approval
- **Target:** ≤ 15 minutes
- **Measurement:** Timestamp diff in approval queue

**Customer Satisfaction**
- **Definition:** CSAT score for AI-assisted conversations
- **Target:** ≥ 4.5/5
- **Measurement:** Post-conversation surveys

## Monitoring Tools

### 1. Fly.io Dashboard

**Access:** https://fly.io/dashboard/personal/hotdash-agent-service

**Metrics Available:**
- CPU usage
- Memory usage
- Request rate
- Response times
- Error rates
- Health check status

### 2. Application Logs

**Real-time:**
```bash
fly logs -a hotdash-agent-service
```

**Filtered:**
```bash
# Errors only
fly logs -a hotdash-agent-service | grep ERROR

# Handoff decisions
fly logs -a hotdash-agent-service | grep "\[Handoff\]"

# Fallback triggers
fly logs -a hotdash-agent-service | grep "\[Fallback\]"

# Metrics
fly logs -a hotdash-agent-service | grep "\[Handoff Metrics\]"
```

### 3. Metrics Endpoints (TODO)

**Handoff Summary:**
```bash
curl https://hotdash-agent-service.fly.dev/metrics/handoff
```

**Agent Utilization:**
```bash
curl https://hotdash-agent-service.fly.dev/metrics/agents
```

**System Health:**
```bash
curl https://hotdash-agent-service.fly.dev/health
```

### 4. Database Queries

**Handoff Accuracy (Last 7 Days):**
```sql
SELECT 
  COUNT(*) FILTER (WHERE payload->>'wasCorrect' = 'true') * 100.0 / COUNT(*) as accuracy
FROM decision_log
WHERE scope = 'agent_handoff'
  AND created_at >= NOW() - INTERVAL '7 days'
  AND payload->>'wasCorrect' IS NOT NULL;
```

**Fallback Rate:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE payload->'metadata'->>'fallbackTriggered' = 'true') * 100.0 / COUNT(*) as fallback_rate
FROM decision_log
WHERE scope = 'agent_handoff'
  AND created_at >= NOW() - INTERVAL '7 days';
```

**Average Confidence:**
```sql
SELECT 
  AVG((payload->>'confidence')::float) as avg_confidence
FROM decision_log
WHERE scope = 'agent_handoff'
  AND created_at >= NOW() - INTERVAL '7 days';
```

**Agent Distribution:**
```sql
SELECT 
  payload->>'targetAgent' as agent,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM decision_log
WHERE scope = 'agent_handoff'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY payload->>'targetAgent'
ORDER BY count DESC;
```

## Alerting

### Critical Alerts

**Service Down**
- **Condition:** Health check fails for > 2 minutes
- **Action:** Page on-call engineer
- **Channel:** PagerDuty / SMS

**High Error Rate**
- **Condition:** Error rate > 5% for > 5 minutes
- **Action:** Alert engineering team
- **Channel:** Slack #alerts

**Memory Exhaustion**
- **Condition:** Memory usage > 90% for > 5 minutes
- **Action:** Auto-scale or restart
- **Channel:** Slack #ops

### Warning Alerts

**Low Handoff Accuracy**
- **Condition:** Accuracy < 85% over 24 hours
- **Action:** Review routing rules
- **Channel:** Slack #ai-customer

**High Fallback Rate**
- **Condition:** Fallback rate > 15% over 24 hours
- **Action:** Review confidence thresholds
- **Channel:** Slack #ai-customer

**Slow Response Times**
- **Condition:** P95 latency > 200ms for > 10 minutes
- **Action:** Investigate performance
- **Channel:** Slack #ops

### Info Alerts

**New Agent Deployed**
- **Condition:** Deployment completed
- **Action:** Monitor for issues
- **Channel:** Slack #deployments

**Daily Metrics Summary**
- **Condition:** Daily at 9 AM
- **Action:** Review metrics
- **Channel:** Slack #ai-customer

## Dashboards

### 1. Handoff Performance Dashboard

**Metrics:**
- Handoff accuracy (7d trend)
- Average confidence (7d trend)
- Fallback rate (7d trend)
- Latency distribution (p50, p95, p99)

**Visualizations:**
- Line chart: Accuracy over time
- Gauge: Current confidence score
- Bar chart: Fallback reasons
- Histogram: Latency distribution

### 2. Agent Utilization Dashboard

**Metrics:**
- Conversations per agent
- Average handling time per agent
- Success rate per agent
- Handoff patterns (agent → agent)

**Visualizations:**
- Pie chart: Agent distribution
- Bar chart: Conversations per agent
- Heatmap: Handoff patterns
- Line chart: Utilization over time

### 3. System Health Dashboard

**Metrics:**
- Service uptime
- Request rate
- Error rate
- Response times
- Resource usage (CPU, memory)

**Visualizations:**
- Status indicator: Uptime
- Line chart: Request rate
- Line chart: Error rate
- Line chart: Response times
- Gauge: CPU/Memory usage

## Daily Monitoring Checklist

### Morning (9 AM)

- [ ] Check service status (Fly.io dashboard)
- [ ] Review overnight logs for errors
- [ ] Check handoff accuracy (last 24h)
- [ ] Review fallback rate (last 24h)
- [ ] Check resource usage trends

### Afternoon (2 PM)

- [ ] Review human feedback on AI drafts
- [ ] Check approval queue backlog
- [ ] Monitor response times
- [ ] Review any alerts

### Evening (6 PM)

- [ ] Check daily metrics summary
- [ ] Review any incidents
- [ ] Plan improvements based on data

## Weekly Review

### Metrics Analysis

- [ ] Handoff accuracy trend (7d vs previous 7d)
- [ ] Confidence score distribution
- [ ] Fallback reasons breakdown
- [ ] Agent utilization balance
- [ ] Response time trends

### Quality Review

- [ ] Review human edits to AI drafts
- [ ] Analyze misrouted conversations
- [ ] Identify common fallback triggers
- [ ] Assess customer satisfaction scores

### Action Items

- [ ] Adjust confidence thresholds if needed
- [ ] Update agent instructions based on feedback
- [ ] Add new intents if patterns emerge
- [ ] Optimize handoff rules

## Performance Optimization

### If Handoff Accuracy < 90%

1. Review misrouted conversations
2. Identify common misclassification patterns
3. Adjust handoff rules or confidence thresholds
4. Add more specific intents if needed
5. Update agent instructions

### If Fallback Rate > 10%

1. Analyze fallback reasons
2. Identify low-confidence patterns
3. Improve intent classification
4. Adjust confidence thresholds
5. Add training data for edge cases

### If Response Times > Target

1. Check resource usage (CPU, memory)
2. Review slow queries or API calls
3. Optimize handoff decision logic
4. Consider caching frequently accessed data
5. Scale resources if needed

## Incident Response

### Service Outage

1. Check Fly.io status page
2. Review recent deployments
3. Check logs for errors
4. Rollback if recent deployment
5. Scale resources if needed
6. Notify stakeholders

### High Error Rate

1. Identify error patterns in logs
2. Check external service status (OpenAI, Chatwoot, Shopify)
3. Review recent code changes
4. Rollback if needed
5. Fix and redeploy

### Performance Degradation

1. Check resource usage
2. Review slow queries
3. Check external service latency
4. Scale resources if needed
5. Optimize code if needed

## Continuous Improvement

### Data Collection

- Capture all handoff decisions
- Log confidence scores
- Record fallback triggers
- Track human feedback
- Measure response times

### Analysis

- Weekly metrics review
- Monthly trend analysis
- Quarterly performance assessment
- Annual strategy review

### Optimization

- Tune confidence thresholds
- Refine handoff rules
- Expand intent taxonomy
- Improve agent instructions
- Enhance fallback logic

---

**Last Updated:** 2025-10-24  
**Maintained by:** ai-customer agent

