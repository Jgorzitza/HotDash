# Analytics Incident Response Playbook

## Incident Types

### 1. High Error Rate (>5%)

**Detection**: Monitoring alerts, health check failures

**Response**:

1. Check health endpoint: `curl https://app/api/analytics/health`
2. Review recent errors: Check error logs in Supabase
3. Verify GA4 connectivity: Test direct API call
4. Check rate limiting: Review request counts
5. Rollback if needed: `node scripts/analytics/rollback.mjs`

**Escalation**: If unresolved in 15 minutes, notify Manager

### 2. Slow Response Times (P95 >3s)

**Detection**: Performance monitoring, SLA tracker

**Response**:

1. Check cache hit rate: Should be >80%
2. Review expensive queries: Run optimization audit
3. Verify database connections: Check pool status
4. Consider temporary rate limits
5. Scale if needed: Increase cache TTL temporarily

**Escalation**: If P95 >5s for 30 minutes

### 3. Data Discrepancy

**Detection**: Reconciliation reports, anomaly detection

**Response**:

1. Run reconciliation: `node scripts/analytics/data-reconciliation.mjs`
2. Check sampling: Review sampling guard proof
3. Verify data sources: Test GA4 and Shopify connections
4. Review recent changes: Check git log
5. Document in feedback with evidence

**Escalation**: If discrepancy >10%, notify CEO immediately

### 4. Complete Outage

**Detection**: All endpoints returning errors

**Response**:

1. Check dependencies: GA4 API, Supabase, network
2. Review recent deployments: Rollback if needed
3. Check feature flags: Disable if causing issues
4. Enable maintenance mode if needed
5. Communicate status to stakeholders

**Escalation**: Immediate - notify Manager and DevOps

## Contact Information

- **Manager**: @manager (GitHub)
- **DevOps**: @devops-agent
- **CEO**: Issue #104

## Post-Incident

1. Document incident in feedback
2. Update runbooks with learnings
3. Add monitoring for early detection
4. Schedule post-mortem if severe
