# HotDash Incident Response Runbook

**Version**: 1.0
**Last Updated**: October 12, 2025
**Owner**: Deployment Agent

---

## Incident Severity Levels

### P0 - CRITICAL (Page Immediately)
**Response Time**: < 5 minutes  
**Examples**:
- Production service completely down
- Data breach or security incident
- Database unavailable
- Critical business function broken (payment processing)

**Actions**:
1. Immediate Manager notification
2. Execute emergency rollback if deployment-related
3. Start incident log
4. Begin investigation

---

### P1 - HIGH (Alert Within 15 Minutes)
**Response Time**: < 15 minutes  
**Examples**:
- Service degraded (error rate 10-50%)
- Response time > 2x baseline
- Health checks failing intermittently
- Partial service outage

**Actions**:
1. Notify Manager
2. Assess impact and scope
3. Begin mitigation
4. Log incident details

---

### P2 - MEDIUM (Review During Business Hours)
**Response Time**: < 2 hours (business hours)  
**Examples**:
- Error rate 5-10%
- Response time 1.5-2x baseline
- Non-critical feature broken
- Performance degradation

**Actions**:
1. Log incident
2. Investigate during business hours
3. Plan fix for next deployment

---

### P3 - LOW (Log for Review)
**Response Time**: Daily review  
**Examples**:
- Error rate 1-5%
- Minor warnings in logs
- Non-critical monitoring alerts

**Actions**:
1. Log for tracking
2. Address in normal development cycle

---

## Incident Response Procedures

### Step 1: Detection
- Automated alerts (Fly.io health checks)
- Manual monitoring
- User reports
- Health check scripts

### Step 2: Assessment
- Determine severity (P0-P3)
- Identify affected services
- Estimate user impact
- Check recent deployments

### Step 3: Notification
- **P0**: Immediate Manager notification
- **P1**: Manager notification within 15 min
- **P2/P3**: Log in feedback file

### Step 4: Mitigation
- Execute rollback if deployment-related
- Scale resources if capacity issue
- Restart services if transient failure
- Isolate affected components

### Step 5: Resolution
- Verify fix applied
- Confirm services healthy
- Monitor for recurrence
- Document resolution

### Step 6: Post-Mortem
- Document timeline
- Identify root cause
- Create prevention plan
- Update runbooks

---

## Emergency Contacts

- **Manager**: See feedback/manager.md
- **On-Call**: TBD
- **Fly.io Support**: https://fly.io/docs/about/support/

---

## Quick Commands

### Health Checks
```bash
cd /home/justin/HotDash/hot-dash
./scripts/monitoring/health-check.sh
```

### Service Status
```bash
fly status -a hotdash-agent-service
fly status -a hotdash-llamaindex-mcp
```

### Logs
```bash
fly logs -a hotdash-agent-service
fly logs -a hotdash-llamaindex-mcp
```

### Emergency Rollback
```bash
fly releases -a hotdash-agent-service
fly releases rollback v[LAST_GOOD] -a hotdash-agent-service
```

---

## Escalation Paths

1. **Deployment Agent** detects issue → Log in feedback/deployment.md
2. **P0/P1** → Immediate Manager notification
3. **Cannot resolve** → Escalate to Engineer
4. **Infrastructure issue** → Contact Fly.io support

---

**Document Status**: ✅ COMPLETE
**Tested**: Runbook documented
**Next Review**: Post-launch


