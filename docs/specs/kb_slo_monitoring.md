# Knowledge Base SLO Monitoring

## Service Level Objectives

### Search Performance

**Latency Targets:**
- P50: ≤ 100ms
- P95: ≤ 300ms
- P99: ≤ 500ms

**Availability:**
- Monthly: ≥ 99.9%
- Weekly: ≥ 99.5%

**Error Rate:**
- Search errors: ≤ 0.1%
- Embedding errors: ≤ 0.5%
- Update errors: ≤ 1.0%

### Quality Metrics

**Coverage:**
- Target: ≥ 70% of customer questions matched to KB articles
- Measurement: (queries with results / total queries) * 100

**Draft Quality:**
- Target: ≥ 60% of AI drafts approved with minimal edits (edit_ratio < 0.1)
- Measurement: (approvals with edit_ratio < 0.1 / total approvals) * 100

**Learning Velocity:**
- Target: ≥ 5 new KB articles created per week
- Measurement: Count of new articles with source='extracted' per week

**Average Confidence:**
- Target: ≥ 0.70 across all active articles
- Measurement: AVG(confidence_score) WHERE archived_at IS NULL

**Average Grades:**
- Tone: ≥ 4.5 / 5.0
- Accuracy: ≥ 4.7 / 5.0
- Policy: ≥ 4.8 / 5.0

## Monitoring Queries

### Search Latency (P95)

```sql
-- Calculate P95 search latency from telemetry
SELECT 
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency_ms
FROM kb_telemetry_events
WHERE event_type = 'kb_search'
  AND timestamp >= NOW() - INTERVAL '1 hour';
```

### Coverage Rate

```sql
-- Calculate coverage: queries with results / total queries
SELECT 
  COUNT(CASE WHEN results_count > 0 THEN 1 END)::float / COUNT(*)::float * 100 as coverage_pct
FROM kb_telemetry_events
WHERE event_type = 'kb_search'
  AND timestamp >= NOW() - INTERVAL '24 hours';
```

### Draft Quality Rate

```sql
-- Calculate draft quality: minimal edits / total approvals
SELECT 
  COUNT(CASE WHEN edit_ratio < 0.1 THEN 1 END)::float / COUNT(*)::float * 100 as quality_pct
FROM kb_learning_edits
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Learning Velocity

```sql
-- Count new articles created per week
SELECT 
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as articles_created
FROM kb_articles
WHERE source = 'extracted'
  AND created_at >= NOW() - INTERVAL '4 weeks'
GROUP BY week
ORDER BY week DESC;
```

### Average Confidence

```sql
-- Calculate average confidence across active articles
SELECT 
  AVG(confidence_score) as avg_confidence,
  MIN(confidence_score) as min_confidence,
  MAX(confidence_score) as max_confidence,
  STDDEV(confidence_score) as stddev_confidence
FROM kb_articles
WHERE archived_at IS NULL;
```

### Average Grades

```sql
-- Calculate average grades
SELECT 
  AVG(avg_tone_grade) as avg_tone,
  AVG(avg_accuracy_grade) as avg_accuracy,
  AVG(avg_policy_grade) as avg_policy
FROM kb_articles
WHERE archived_at IS NULL
  AND avg_tone_grade IS NOT NULL
  AND avg_accuracy_grade IS NOT NULL
  AND avg_policy_grade IS NOT NULL;
```

### Quality Distribution

```sql
-- Count articles by quality tier
WITH quality_tiers AS (
  SELECT 
    id,
    confidence_score,
    CASE 
      WHEN usage_count > 0 THEN success_count::float / usage_count::float
      ELSE 0
    END as success_rate,
    (COALESCE(avg_tone_grade, 0) + COALESCE(avg_accuracy_grade, 0) + COALESCE(avg_policy_grade, 0)) / 3 as avg_grade,
    CASE
      WHEN confidence_score >= 0.80 
        AND (CASE WHEN usage_count > 0 THEN success_count::float / usage_count::float ELSE 0 END) >= 0.80
        AND (COALESCE(avg_tone_grade, 0) + COALESCE(avg_accuracy_grade, 0) + COALESCE(avg_policy_grade, 0)) / 3 >= 4.5
      THEN 'excellent'
      WHEN confidence_score >= 0.70 
        AND (CASE WHEN usage_count > 0 THEN success_count::float / usage_count::float ELSE 0 END) >= 0.70
        AND (COALESCE(avg_tone_grade, 0) + COALESCE(avg_accuracy_grade, 0) + COALESCE(avg_policy_grade, 0)) / 3 >= 4.0
      THEN 'good'
      WHEN confidence_score >= 0.60 
        AND (CASE WHEN usage_count > 0 THEN success_count::float / usage_count::float ELSE 0 END) >= 0.60
        AND (COALESCE(avg_tone_grade, 0) + COALESCE(avg_accuracy_grade, 0) + COALESCE(avg_policy_grade, 0)) / 3 >= 3.5
      THEN 'fair'
      ELSE 'poor'
    END as tier
  FROM kb_articles
  WHERE archived_at IS NULL
)
SELECT 
  tier,
  COUNT(*) as count,
  COUNT(*)::float / SUM(COUNT(*)) OVER () * 100 as percentage
FROM quality_tiers
GROUP BY tier
ORDER BY 
  CASE tier
    WHEN 'excellent' THEN 1
    WHEN 'good' THEN 2
    WHEN 'fair' THEN 3
    WHEN 'poor' THEN 4
  END;
```

## Alerting Rules

### Critical Alerts

**Search Latency P95 > 500ms**
- Severity: Critical
- Action: Investigate database performance, check embedding service
- Escalation: 15 minutes

**Availability < 99%**
- Severity: Critical
- Action: Check service health, database connectivity
- Escalation: Immediate

**Error Rate > 5%**
- Severity: Critical
- Action: Check logs, investigate failures
- Escalation: 30 minutes

### Warning Alerts

**Search Latency P95 > 300ms**
- Severity: Warning
- Action: Monitor, prepare to scale
- Escalation: 1 hour

**Coverage < 60%**
- Severity: Warning
- Action: Review KB content, identify gaps
- Escalation: 24 hours

**Draft Quality < 50%**
- Severity: Warning
- Action: Review learning pipeline, check article quality
- Escalation: 24 hours

**Average Confidence < 0.65**
- Severity: Warning
- Action: Review low-confidence articles, improve quality
- Escalation: 48 hours

### Info Alerts

**Learning Velocity < 3 articles/week**
- Severity: Info
- Action: Review learning extraction, check for recurring issues
- Escalation: 1 week

**Stale Articles > 20%**
- Severity: Info
- Action: Run archival process, review old content
- Escalation: 1 week

## Dashboards

### Real-Time Dashboard

**Metrics:**
- Current search latency (P50, P95, P99)
- Searches per minute
- Error rate (last hour)
- Active articles count
- Average confidence

**Refresh:** Every 30 seconds

### Quality Dashboard

**Metrics:**
- Coverage rate (24h, 7d, 30d)
- Draft quality rate (7d, 30d)
- Learning velocity (weekly trend)
- Quality distribution (pie chart)
- Average grades (bar chart)

**Refresh:** Every 5 minutes

### Trends Dashboard

**Metrics:**
- Search volume over time
- Article creation over time
- Confidence trends over time
- Grade trends over time
- Usage patterns by category

**Refresh:** Every hour

## Reporting

### Daily Report

- Search volume and latency
- New articles created
- Articles archived
- Quality metrics snapshot
- SLO compliance status

### Weekly Report

- Coverage trends
- Draft quality trends
- Learning velocity
- Top performing articles
- Low performing articles
- Recurring issues summary

### Monthly Report

- SLO compliance summary
- Quality distribution changes
- System growth metrics
- Recommendations for improvement
- Capacity planning

## SLO Review Process

### Weekly Review

1. Check all SLO metrics
2. Identify violations
3. Create action items
4. Update runbooks if needed

### Monthly Review

1. Analyze trends
2. Adjust targets if needed
3. Review alerting rules
4. Update monitoring queries
5. Document learnings

### Quarterly Review

1. Comprehensive SLO assessment
2. Capacity planning
3. Architecture review
4. Tool evaluation
5. Budget review

## Incident Response

### Search Latency Incident

1. Check database performance
2. Review query plans
3. Check embedding service
4. Scale if needed
5. Document root cause

### Quality Degradation Incident

1. Review recent changes
2. Check learning pipeline
3. Audit article quality
4. Rollback if needed
5. Improve validation

### Availability Incident

1. Check service health
2. Review error logs
3. Restart services if needed
4. Failover if needed
5. Post-mortem analysis

## Continuous Improvement

### Optimization Targets

- Reduce P95 latency to < 200ms
- Increase coverage to > 80%
- Increase draft quality to > 70%
- Maintain average confidence > 0.75
- Achieve 99.95% availability

### Monitoring Enhancements

- Add user satisfaction metrics
- Track article helpfulness
- Monitor search relevance
- Track learning effectiveness
- Add cost metrics

