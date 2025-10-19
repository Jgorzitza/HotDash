# Service Level Agreement (SLA) Definitions

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Define SLAs for HotDash services and response times

## Application SLAs

### Uptime Availability

| Service                | Target | Measurement | Allowable Downtime |
| ---------------------- | ------ | ----------- | ------------------ |
| Production Application | 99.9%  | Monthly     | 43.2 min/month     |
| API Endpoints          | 99.9%  | Monthly     | 43.2 min/month     |
| Database               | 99.95% | Monthly     | 21.6 min/month     |
| Staging Environment    | 99%    | Monthly     | 7.2 hours/month    |

**Exclusions**:

- Scheduled maintenance (announced 48h advance)
- Third-party service outages (Shopify, Supabase, Fly.io)
- Force majeure events

### Response Time

| Endpoint         | P50 Target | P95 Target | P99 Target |
| ---------------- | ---------- | ---------- | ---------- |
| /health          | <100ms     | <500ms     | <1s        |
| /api/health      | <200ms     | <1s        | <2s        |
| Dashboard tiles  | <1s        | <3s        | <5s        |
| Approvals drawer | <500ms     | <2s        | <3s        |
| API mutations    | <1s        | <3s        | <5s        |

**Measurement**: Via application metrics, Fly.io dashboard

### Error Rate

| Service          | Target | Alert Threshold |
| ---------------- | ------ | --------------- |
| Application      | <0.1%  | >0.5%           |
| API Endpoints    | <0.1%  | >1%             |
| Database Queries | <0.01% | >0.1%           |

**Calculation**: (Errors / Total Requests) × 100

## Customer Support SLAs

### Response Time (HITL Approvals)

| Priority                        | First Response | Resolution Target |
| ------------------------------- | -------------- | ----------------- |
| Customer Reply (Business Hours) | <15 minutes    | <2 hours          |
| Customer Reply (After Hours)    | <2 hours       | <24 hours         |
| Inventory Suggestions           | <1 day         | <3 days           |
| Growth Recommendations          | <1 day         | <7 days           |

**Business Hours**: Monday-Friday, 9AM-5PM EST

### Review Quality Targets

| Metric            | Target |
| ----------------- | ------ |
| Tone Grade        | ≥4.5/5 |
| Accuracy Grade    | ≥4.7/5 |
| Policy Compliance | ≥4.8/5 |

**Measurement**: Human review grades stored in Supabase

## Data Processing SLAs

### Nightly Rollup Jobs

| Job                       | Target Completion | Max Duration | Error Rate |
| ------------------------- | ----------------- | ------------ | ---------- |
| Sales metrics aggregation | 02:00 UTC         | <30 min      | <0.5%      |
| Inventory calculations    | 03:00 UTC         | <60 min      | <0.5%      |
| Analytics export          | 04:00 UTC         | <45 min      | <0.5%      |

**Alerting**: If job exceeds max duration or fails >0.5% over 7 days

### Real-Time Updates

| Metric           | Freshness Target | Max Staleness |
| ---------------- | ---------------- | ------------- |
| Revenue tile     | <5 minutes       | <15 minutes   |
| Inventory levels | <10 minutes      | <30 minutes   |
| CX queue count   | <2 minutes       | <5 minutes    |
| Approval queue   | <1 minute        | <3 minutes    |

## Deployment SLAs

### Deploy Windows

| Type            | Duration Target | Downtime Target   |
| --------------- | --------------- | ----------------- |
| Standard Deploy | <15 minutes     | 0 (zero downtime) |
| With Migration  | <30 minutes     | <2 minutes        |
| Hotfix Deploy   | <10 minutes     | 0 (zero downtime) |
| Rollback        | <5 minutes      | 0 (zero downtime) |

### Deployment Frequency

| Environment | Frequency      | Max Changes per Deploy |
| ----------- | -------------- | ---------------------- |
| Production  | 1-3x per week  | 50 files               |
| Staging     | 5-10x per week | Unlimited              |

## Incident Response SLAs

### Detection & Response

| Severity      | Detection Target | Response Target | Resolution Target |
| ------------- | ---------------- | --------------- | ----------------- |
| P0 (Critical) | <5 minutes       | Immediate       | <1 hour           |
| P1 (High)     | <15 minutes      | <15 minutes     | <4 hours          |
| P2 (Medium)   | <1 hour          | <1 hour         | <24 hours         |
| P3 (Low)      | <24 hours        | <24 hours       | <1 week           |

### Communication

| Severity | Initial Update | Progress Updates | Resolution Notice |
| -------- | -------------- | ---------------- | ----------------- |
| P0       | Immediate      | Every 15 minutes | Immediate         |
| P1       | <15 minutes    | Every 30 minutes | Within 1 hour     |
| P2       | <1 hour        | As needed        | Within 24 hours   |

## Recovery Objectives

### Recovery Time Objective (RTO)

| Scenario            | RTO Target | Definition                  |
| ------------------- | ---------- | --------------------------- |
| Application crash   | 5 minutes  | Time to restart             |
| Bad deployment      | 10 minutes | Time to rollback            |
| Database corruption | 15 minutes | Time to restore from backup |
| Complete outage     | 30 minutes | Time to full recovery       |

### Recovery Point Objective (RPO)

| Data Type          | RPO Target  | Backup Frequency      |
| ------------------ | ----------- | --------------------- |
| Transactional data | <1 hour     | Continuous (Supabase) |
| User data          | <24 hours   | Daily backups         |
| Configuration      | 0 (no loss) | Version controlled    |

## SLA Monitoring

### Metrics Collection

**Automated**:

```bash
# Run daily
./scripts/ops/collect-metrics.sh

# Aggregate weekly
cat artifacts/metrics/*/metrics-*.json | jq -s '
  map(.metrics.health_endpoint.response_time_ms) |
  add / length as $avg |
  {average_response_time_ms: $avg}'
```

### SLA Compliance Reports

**Monthly Report Template**:

```markdown
# SLA Compliance Report - YYYY-MM

**Period**: YYYY-MM-01 to YYYY-MM-30  
**Generated**: <timestamp>

## Uptime

- Target: 99.9%
- Actual: XX.X%
- Status: ✅ Met / ❌ Missed

## Response Time (P95)

- Target: <3s
- Actual: X.Xs
- Status: ✅ Met / ❌ Missed

## Error Rate

- Target: <0.1%
- Actual: X.X%
- Status: ✅ Met / ❌ Missed

## Incidents

- P0: X incidents (target: 0)
- P1: X incidents (target: <2)
- P2: X incidents (target: <5)

## Action Items

- [ ] <improvement>
```

## SLA Breach Procedures

### When SLA is Missed

1. **Document breach**:

   ```bash
   gh issue create --title "SLA Breach: <metric>" \
     --body "Actual: X, Target: Y, Duration: Z" \
     --label "sla-breach,P1"
   ```

2. **Investigate root cause**
3. **Implement corrective actions**
4. **Update monitoring/alerting**
5. **Report to stakeholders**

### Credit/Compensation

**Not applicable**: Internal tool, no customer SLA credits

**Internal accountability**:

- Track breaches in quarterly reviews
- Adjust targets if consistently missed
- Improve infrastructure if systemic issues

## Related Documentation

- Monitoring: `docs/runbooks/monitoring_setup.md`
- Incident Response: `docs/runbooks/incident_response.md`
- CI/CD Pipeline: `docs/runbooks/cicd_pipeline.md`
