# Post-Launch Support Plan - HotDash

**Launch Date**: October 13-15, 2025  
**Support Period**: First 30 days critical, ongoing thereafter  
**Document Version**: 1.0  
**Last Updated**: October 12, 2025

---

## Overview

This document outlines the support structure, common issues, troubleshooting procedures, and escalation paths for HotDash post-launch.

### Support Goals
1. **99.9% Uptime**: Maximum 43 minutes downtime per month
2. **< 5 minute** response time for P0 incidents
3. **< 1 hour** resolution time for P0 incidents
4. **> 90% operator satisfaction** in first 30 days
5. **Zero data loss** incidents

---

## Support Team Structure

### On-Call Rotation

| Week | Primary | Backup | Manager Escalation |
|------|---------|--------|-------------------|
| Week 1 (Oct 13-19) | Engineer Helper Agent | Deployment Agent | Manager |
| Week 2 (Oct 20-26) | Deployment Agent | Engineer Helper Agent | Manager |
| Week 3 (Oct 27-Nov 2) | Engineer Helper Agent | Deployment Agent | Manager |
| Week 4 (Nov 3-9) | Deployment Agent | Engineer Helper Agent | Manager |

### Responsibilities

**Primary On-Call**:
- Monitor health dashboard continuously during business hours
- Respond to Slack alerts immediately
- Triage and resolve incidents
- Update team on status every 30 minutes during incidents
- Document all incidents

**Backup On-Call**:
- Available for escalation
- Take over if primary unavailable
- Assist with complex incidents

**Manager**:
- Available for critical decision-making
- Handle customer escalations
- Approve rollbacks for P1+ incidents

---

## Support Channels

### Internal Support

#### Primary Channel: Slack
- **#hotdash-support**: Operator questions and issues
- **#hotdash-alerts**: Automated alerts from monitoring
- **#hotdash-emergency**: P0/P1 incidents only

#### Response Time SLAs

| Channel | Priority | Response Time | Resolution Time |
|---------|----------|---------------|-----------------|
| #hotdash-emergency | P0 | < 5 min | < 1 hour |
| #hotdash-emergency | P1 | < 15 min | < 4 hours |
| #hotdash-support | P2 | < 1 hour | < 24 hours |
| #hotdash-support | P3 | < 4 hours | < 1 week |

### External Support (if applicable)

- **Email**: support@hotdash.com
- **Help Desk**: TBD
- **Phone**: Emergency only (provided to key customers)

---

## Incident Priority Levels

### P0 - Critical

**Definition**: Complete service outage or data loss

**Examples**:
- Application completely down
- Database connection failure
- Agent SDK service offline
- Data corruption or loss
- Security breach

**Response**:
- Immediate response (< 5 minutes)
- All hands on deck
- Update every 15 minutes
- Post-mortem required

### P1 - High

**Definition**: Major functionality broken, multiple users affected

**Examples**:
- Approval queue not loading
- Chatwoot integration broken
- High error rate (>10%)
- Slow performance affecting all users
- Authentication failing

**Response**:
- Response within 15 minutes
- Dedicated engineer assigned
- Update every 30 minutes
- Root cause analysis required

### P2 - Medium

**Definition**: Partial functionality issues, workarounds available

**Examples**:
- Single operator having issues
- UI glitch affecting minor feature
- Integration delay (but working)
- Non-critical error messages

**Response**:
- Response within 1 hour
- Fix within business day
- Document and add to FAQ

### P3 - Low

**Definition**: Minor issues, cosmetic problems

**Examples**:
- Typos in UI
- Minor CSS issues
- Feature requests
- Documentation updates

**Response**:
- Response within 4 hours
- Fix in next release
- Add to backlog

---

## Common Issues & Solutions

### Issue 1: Approval Queue Not Loading

**Symptoms**:
- `/approvals` page shows error or loading forever
- Error: "Failed to load approvals"

**Diagnosis**:
```bash
# Check Agent SDK service
curl https://hotdash-agent-service.fly.dev/health

# Check service logs
fly logs -a hotdash-agent-service | grep error

# Check monitoring
npm run monitor:stats
```

**Likely Causes**:
1. Agent SDK service down
2. Network connectivity issue
3. Certificate/authentication problem

**Resolution**:
```bash
# Option 1: Restart Agent SDK service
fly apps restart hotdash-agent-service

# Option 2: Rollback to previous version
fly releases rollback v[previous] -a hotdash-agent-service

# Option 3: Check environment variables
fly secrets list -a hotdash-agent-service
```

**Workaround**: Use Chatwoot approvals directly at `/chatwoot-approvals`

---

### Issue 2: Chatwoot Webhook Not Working

**Symptoms**:
- New Chatwoot messages not appearing in approval queue
- No new approvals being created
- Chatwoot shows webhook delivery failures

**Diagnosis**:
```bash
# Check webhook endpoint
curl -X POST https://app.hotdash.com/api/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -d '{"event":"test"}'

# Check database for recent approvals
psql $DATABASE_URL -c "SELECT COUNT(*) FROM agent_approvals WHERE created_at > NOW() - INTERVAL '1 hour';"

# Check application logs
fly logs | grep chatwoot
```

**Likely Causes**:
1. Webhook secret mismatch
2. Application not receiving webhooks
3. Database connection issue
4. Agent SDK not processing messages

**Resolution**:
```bash
# Verify webhook secret
fly secrets list | grep CHATWOOT_WEBHOOK_SECRET

# Test webhook manually
curl -X POST https://app.hotdash.com/api/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -H "X-Chatwoot-Signature: [test-signature]" \
  -d @test-webhook-payload.json

# Check Chatwoot webhook configuration
# Go to Chatwoot Settings > Integrations > Webhooks
```

**Workaround**: Manually create approvals via database (short-term only)

---

### Issue 3: Slow Performance

**Symptoms**:
- Pages loading slowly (>2 seconds)
- API responses taking >1 second
- Operators complaining about lag

**Diagnosis**:
```bash
# Check response times
npm run monitor:stats

# Check database performance
psql $DATABASE_URL -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check Fly.io metrics
fly metrics -a hotdash-agent-service

# Check database connections
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_stat_activity;"
```

**Likely Causes**:
1. Slow database queries
2. Too many concurrent requests
3. Memory leak in application
4. External API slowness (Chatwoot, Shopify)

**Resolution**:
```bash
# Add database indexes if needed
psql $DATABASE_URL -c "CREATE INDEX CONCURRENTLY IF NOT EXISTS [index_name] ON [table]([column]);"

# Scale up if needed
fly scale vm shared-cpu-2x -a hotdash-agent-service

# Restart to clear memory
fly apps restart hotdash-agent-service
```

**Workaround**: Advise operators to refresh page, reduce concurrent tabs

---

### Issue 4: Agent SDK Giving Poor Suggestions

**Symptoms**:
- Operators rejecting most agent suggestions
- Low confidence scores (<50%)
- Irrelevant responses

**Diagnosis**:
```bash
# Check approval/rejection rates
psql $DATABASE_URL -c "SELECT status, COUNT(*) FROM agent_approvals WHERE created_at > NOW() - INTERVAL '1 day' GROUP BY status;"

# Check LlamaIndex service
curl https://hotdash-llamaindex-mcp.fly.dev/health

# Review agent logs for errors
fly logs -a hotdash-agent-service | grep -i error
```

**Likely Causes**:
1. Knowledge base needs update
2. LlamaIndex not retrieving relevant docs
3. Agent prompts need tuning
4. OpenAI API issues

**Resolution**:
```bash
# Refresh knowledge base
npm run ai:refresh

# Check LlamaIndex metrics
curl https://hotdash-llamaindex-mcp.fly.dev/health

# Review agent prompts
cat app/prompts/agent-sdk/*.md
```

**Workaround**: Operators can edit responses before approving

---

### Issue 5: Database Connection Errors

**Symptoms**:
- Error: "Could not connect to database"
- Error: "Connection pool exhausted"
- Intermittent failures

**Diagnosis**:
```bash
# Check database status
supabase db status

# Check connection pool
psql $DATABASE_URL -c "SELECT * FROM pg_stat_database WHERE datname = 'postgres';"

# Check active connections
psql $DATABASE_URL -c "SELECT COUNT(*) as connections, state FROM pg_stat_activity GROUP BY state;"
```

**Likely Causes**:
1. Connection pool exhausted
2. Database maintenance
3. Network issues
4. Too many long-running queries

**Resolution**:
```bash
# Kill idle connections
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';"

# Increase connection pool (if needed)
# Update DATABASE_URL with ?pool_size=20

# Check Supabase dashboard for issues
open https://supabase.com/dashboard/project/[project-id]
```

**Workaround**: Restart application to reset connections

---

## Operator Quick Reference Guide

### Getting Started

1. **Access HotDash**:
   - URL: https://app.hotdash.com
   - Embedded in Shopify Admin

2. **Main Features**:
   - **Approval Queue**: `/approvals` - Review agent actions
   - **Chatwoot Approvals**: `/chatwoot-approvals` - Review customer responses
   - **Dashboard**: `/` - Key metrics and alerts

3. **Common Actions**:
   - **Approve**: Click green "Approve" button
   - **Edit & Approve**: Click "Edit", modify response, then "Approve"
   - **Reject**: Click red "Reject" button, provide reason
   - **Escalate**: Click "Escalate", provide context

### Best Practices

1. **Review All Suggestions**: Never blindly approve
2. **Edit When Needed**: Improve agent responses
3. **Provide Feedback**: Use reject/escalate reasons to train system
4. **Check Confidence**: Low confidence (<70%) = review carefully
5. **Watch for Patterns**: Report recurring issues

### FAQ

**Q: How do I know if an agent suggestion is good?**
A: Check the confidence score, review knowledge sources, and use your judgment. When in doubt, edit or escalate.

**Q: What if I approve something wrong?**
A: Contact #hotdash-support immediately. We can track approvals and help fix mistakes.

**Q: Can I use HotDash on mobile?**
A: Currently desktop only. Mobile support coming in Q1 2026.

**Q: What if the system is slow?**
A: Report in #hotdash-support. Refresh the page as a first step. Check status page if available.

**Q: How do I report a bug?**
A: Post in #hotdash-support with:
- What you were trying to do
- What happened
- Screenshot (if applicable)
- Your browser and version

---

## Monitoring & Alerts

### Health Dashboard

**Location**: `npm run monitor:stats` or logs/monitoring/health-stats.json

**Key Metrics**:
```json
{
  "services": [
    {
      "name": "Agent SDK",
      "checks": 100,
      "healthy": 98,
      "uptime": "98.00%",
      "avgResponseTime": 150
    },
    {
      "name": "LlamaIndex MCP",
      "checks": 100,
      "healthy": 100,
      "uptime": "100.00%",
      "avgResponseTime": 180
    }
  ]
}
```

### Alert Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| Service Down | 3 consecutive failures | Post in #hotdash-emergency |
| High Error Rate | >10% errors for 5 min | Post in #hotdash-alerts |
| Slow Response | >2s average for 5 min | Post in #hotdash-alerts |
| Database Issues | Connection failures | Post in #hotdash-emergency |
| Queue Backup | >50 pending approvals | Post in #hotdash-alerts |

### Monitoring Commands

```bash
# Start monitoring daemon
npm run monitor:start

# View real-time logs
npm run monitor:logs

# View current statistics
npm run monitor:stats

# Stop monitoring
npm run monitor:stop

# Run integration tests
npm run test:agent-sdk
```

---

## Escalation Procedures

### Level 1: On-Call Engineer

**Contact**: Via #hotdash-emergency  
**When**: All P0, P1 incidents  
**Response**: < 5 minutes for P0, < 15 minutes for P1

**Responsibilities**:
- Acknowledge incident
- Begin triage and diagnosis
- Provide status updates
- Escalate if needed

### Level 2: Engineering Lead

**Contact**: Via phone or #hotdash-emergency with @mention  
**When**: 
- P0 incident not resolved in 30 minutes
- Need architecture/design decisions
- Multiple systems affected

**Responsibilities**:
- Deep technical guidance
- Architecture decisions
- Coordinate with multiple engineers

### Level 3: Manager

**Contact**: Via phone (emergency contact list)  
**When**:
- P0 incident not resolved in 1 hour
- Need business decisions
- Customer escalation
- Potential rollback

**Responsibilities**:
- Business impact decisions
- Customer communication
- Rollback approval
- Executive updates

---

## Documentation & Knowledge Base

### Critical Documents

1. **Launch Day Checklist**: `docs/LAUNCH_DAY_CHECKLIST.md`
2. **Rollback Procedures**: `docs/ROLLBACK_PROCEDURES.md`
3. **Agent SDK Integration**: `docs/AGENT_SDK_INTEGRATION_STATUS.md`
4. **Monitoring Guide**: `docs/MONITORING_AND_ALERTING.md`
5. **API Documentation**: `docs/API_DOCUMENTATION.md`

### Runbooks

Location: `docs/runbooks/`

- `chatwoot-webhook-debug.md`
- `database-performance-tuning.md`
- `agent-sdk-troubleshooting.md`
- `common-operator-issues.md`

### Creating New Runbooks

When you encounter a new issue:
1. Document the issue
2. Document the resolution
3. Create a runbook in `docs/runbooks/`
4. Update this support plan with a link

---

## Post-Incident Review Process

### Within 24 Hours of Incident

1. **Create Incident Report**:
   ```markdown
   # Incident Report: [Brief Title]
   
   **Date**: [Date/Time]
   **Severity**: P[0/1/2/3]
   **Duration**: [Start] to [End]
   **Impact**: [Description]
   
   ## Timeline
   - [Time]: [Event]
   - [Time]: [Event]
   
   ## Root Cause
   [Detailed explanation]
   
   ## Resolution
   [How it was fixed]
   
   ## Lessons Learned
   [What we learned]
   
   ## Action Items
   - [ ] [Preventive measure]
   - [ ] [Process improvement]
   ```

2. **Save Report**: `docs/incidents/YYYY-MM-DD-[title].md`

3. **Update Runbooks**: Add new procedures if needed

### Weekly Review (First Month)

Every Monday at 10 AM:
- Review all incidents from previous week
- Check trends and patterns
- Update procedures if needed
- Celebrate wins

### Monthly Review

- Analyze metrics:
  - Uptime percentage
  - MTTR (Mean Time To Resolution)
  - Incident count by severity
  - Operator satisfaction
- Identify improvement opportunities
- Update support plan

---

## Metrics & KPIs

### Track Daily (First Month)

```
□ Uptime percentage
□ Number of incidents (by severity)
□ Average response time
□ Average resolution time
□ Operator satisfaction (daily survey)
□ Approval queue length
□ Agent SDK accuracy (approval rate)
□ Number of escalations
```

### Weekly Report Template

```markdown
# Week [N] Status Report

**Period**: [Start Date] - [End Date]

## Key Metrics
- Uptime: XX.XX%
- Incidents: P0: X, P1: X, P2: X, P3: X
- Avg Response Time: XX min
- Avg Resolution Time: XX min
- Operator Satisfaction: XX%

## Highlights
- ✅ [Achievement]
- ⚠️  [Issue]
- 🎯 [Goal met]

## Action Items for Next Week
- [ ] [Item]
- [ ] [Item]
```

---

## Continuous Improvement

### Feedback Collection

**Daily** (First Week):
- Short survey to operators
- 3 questions: What went well? What issues? Suggestions?

**Weekly** (First Month):
- Detailed feedback session
- Review metrics with team
- Identify improvements

**Monthly** (Ongoing):
- Comprehensive review
- Update procedures
- Plan enhancements

### Training & Onboarding

**New Operators**:
1. Watch walkthrough video (5 min)
2. Read quick reference guide (5 min)
3. Shadow experienced operator (30 min)
4. Practice with test approvals (15 min)

**New Engineers**:
1. Read all documentation
2. Run integration tests locally
3. Practice rollback procedures (test environment)
4. Shadow on-call engineer for one shift

---

## Related Documents

- Launch Day Checklist: `docs/LAUNCH_DAY_CHECKLIST.md`
- Rollback Procedures: `docs/ROLLBACK_PROCEDURES.md`
- Agent SDK Status: `docs/AGENT_SDK_INTEGRATION_STATUS.md`
- Monitoring Guide: `docs/MONITORING_AND_ALERTING.md`

---

## Contact Information

### Emergency Contacts
- **Slack**: #hotdash-emergency
- **Phone**: [On-call phone number]
- **Email**: emergency@hotdash.com

### Regular Support
- **Slack**: #hotdash-support
- **Email**: support@hotdash.com
- **Documentation**: [URL]

---

**Document Owner**: Engineer Helper Agent  
**Review Frequency**: Weekly for first month, then monthly  
**Last Review**: October 12, 2025  
**Next Review**: October 19, 2025

