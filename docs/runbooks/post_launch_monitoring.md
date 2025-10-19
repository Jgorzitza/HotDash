# Post-Launch Monitoring Checklist

**Version**: 1.0
**Owner**: DevOps + Manager
**Last Updated**: 2025-10-19

## First 24 Hours (Critical Monitoring Period)

### Every Hour - Check These Metrics

**Application Health**:

```bash
# Health endpoints
curl https://app.hotrodan.com/health
curl https://app.hotrodan.com/api/health

# Expected: Both return 200 OK
```

**Error Rate**:

- Target: <0.5%
- Alert if: >2%
- Critical if: >5%

**Performance**:

- P95 tile load time: <3s
- Page load time: <5s
- Alert if: >5s P95
- Critical if: >10s P95

**Database**:

- Connection pool: <80% utilized
- Query P95: <500ms
- Alert if: >1s P95

### Every 2 Hours - Review Logs

**Error Logs**:

- Check for patterns
- Group by error type
- Identify top 5 errors
- Create issues for P0/P1

**Access Logs**:

- User activity patterns
- API endpoint usage
- Unusual access patterns
- Geographic distribution

**Integration Health**:

- Shopify API: Success rate
- Supabase: Connection status
- GA4: Query success rate
- Chatwoot: Webhook delivery
- Publer: Post delivery

---

## First Week (Daily Monitoring)

### Daily Dashboard Review

- [ ] All 8 tiles loading <3s
- [ ] Error rate <0.5%
- [ ] Uptime ≥99.9%
- [ ] No P0 bugs reported
- [ ] All integrations healthy

### Daily Metrics vs Baseline

- [ ] Revenue tracking correctly
- [ ] Conversion rate accurate
- [ ] Traffic numbers match GA4
- [ ] Inventory calculations correct
- [ ] CX queue sizes reasonable

### Daily HITL Quality Review

- [ ] Approval volume: Reasonable
- [ ] Approval latency: <15 min median
- [ ] Grade averages: tone ≥4.5, accuracy ≥4.7, policy ≥4.8
- [ ] AI draft quality: Improving or stable
- [ ] Human edit patterns: Documented

### Daily Feature Flag Status

- [ ] Review which flags enabled
- [ ] Monitor metrics per flag
- [ ] Plan next flag activation
- [ ] Document any issues

---

## Monitoring Dashboards

### Application Dashboard

**Metrics**:

- Request rate
- Error rate
- P50/P95/P99 latency
- Active users
- Session duration

### Database Dashboard

**Metrics**:

- Query count
- Query latency
- Connection pool usage
- Table sizes
- Index usage

### Integration Dashboard

**Metrics**:

- API calls by integration
- Success/failure rates
- Latency by integration
- Rate limit status
- Cost tracking (OpenAI)

### Business Dashboard

**Metrics**:

- Revenue (real-time)
- Conversion rate
- AOV
- Inventory status
- CX queue health
- Approval throughput

---

## Alert Thresholds

### Critical (Page Immediately)

- Error rate >5%
- All tiles failing to load
- Database connection lost
- Security incident detected
- P0 bug reported

### High (Alert Within 15 Min)

- Error rate >2%
- P95 latency >10s
- Integration failure
- P1 bug reported

### Medium (Alert Within 1 Hour)

- Error rate >1%
- P95 latency >5s
- Feature degradation
- P2 bug reported

### Low (Daily Summary)

- Error rate >0.5%
- Performance anomalies
- P3 bugs
- User feedback

---

## Weekly Review (First Month)

### Metrics Analysis

- [ ] Error rate trend
- [ ] Performance trend
- [ ] User growth
- [ ] Feature adoption
- [ ] Cost analysis

### Retrospective

- [ ] What went well
- [ ] What needs improvement
- [ ] Top issues resolved
- [ ] Top issues open
- [ ] Runbook updates needed

### Roadmap Planning

- [ ] Feature requests from operators
- [ ] Performance improvements identified
- [ ] Integration enhancements
- [ ] Automation opportunities

---

## Success Criteria (30 Days)

**Technical**:

- Uptime: ≥99.9%
- Error rate: <0.5%
- P95 latency: <3s
- Test pass rate: 100%
- 0 P0 incidents

**Business**:

- All tiles providing value
- HITL approvals: >90% AI-drafted
- Operator time saved: Measurable
- No customer complaints due to system

**Operational**:

- On-call incidents: <5 per week
- Hotfixes: <2 per week
- Runbooks: All updated
- Team confident in system

---

**Created**: 2025-10-19
**Status**: Ready for post-launch monitoring
**Review**: Update after first week
