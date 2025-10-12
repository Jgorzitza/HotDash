# HotDash Launch Day Checklist

**Launch Window**: October 13-15, 2025  
**Status**: Ready for Execution
**Owner**: Engineer Helper Agent + Launch Team  
**Last Updated**: October 12, 2025

---

## 🚀 Launch Overview

**Product**: HotDash - AI-Powered Customer Support Platform  
**Key Features**: Agent SDK Approval Queue, Chatwoot Integration, LlamaIndex Knowledge Base  
**Target Users**: Customer Support Operators

---

## Pre-Launch Checklist (T-24 Hours)

### Infrastructure ✅
- [x] **Agent SDK Deployed**: `hotdash-agent-service.fly.dev` - HEALTHY
- [x] **LlamaIndex MCP Deployed**: `hotdash-llamaindex-mcp.fly.dev` - HEALTHY  
- [x] **Chatwoot Deployed**: `hotdash-chatwoot.fly.dev` - HEALTHY (web + worker)
- [x] **Database Migrations**: All applied successfully
- [x] **Health Checks**: All services passing
- [ ] **Monitoring Dashboard**: Set up and tested
- [ ] **Alert Notifications**: Configured for team
- [ ] **Backup Verification**: Latest backup confirmed

### Configuration ⏳
- [ ] **Chatwoot Webhook**: Configured in Chatwoot admin panel
- [ ] **HMAC Secret**: Set in Supabase secrets
- [ ] **Environment Variables**: All production values confirmed
  - `CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev`
  - `CHATWOOT_API_TOKEN=<validated>`
  - `CHATWOOT_WEBHOOK_SECRET=<generated>`
  - `AGENT_SERVICE_URL=https://hotdash-agent-service.fly.dev`
  - `LLAMAINDEX_SERVICE_URL=https://hotdash-llamaindex-mcp.fly.dev`
- [ ] **API Tokens**: Validated and not expired
- [ ] **SSL Certificates**: Valid and auto-renewing

### Testing ⏳
- [ ] **End-to-End Test**: Complete approval workflow tested
- [ ] **Webhook Delivery**: Verified with test message
- [ ] **Error Handling**: Failure scenarios tested
- [ ] **Performance**: Response times under target
- [ ] **Security**: Signature validation working
- [ ] **UI Functionality**: All approval actions working

### Documentation ✅
- [x] **Operator Quick Start**: Available in `docs/enablement/`
- [x] **API Documentation**: Complete and up-to-date
- [x] **Troubleshooting Guide**: Created with common issues
- [x] **Runbooks**: Incident response procedures ready
- [x] **Architecture Diagrams**: Up-to-date system diagrams

### Team Readiness 📋
- [ ] **Launch Team Assembled**: Engineer, Product, Support leads
- [ ] **Operator Training**: Completed for approval queue
- [ ] **On-Call Schedule**: 24-hour coverage assigned
- [ ] **Communication Plan**: Slack/email channels ready
- [ ] **Rollback Plan**: Documented and rehearsed

---

## Launch Day Checklist (T-0)

### Hour -2: Final Preparation
- [ ] **Team Standup**: Brief all team members on launch plan
- [ ] **System Health Check**: Run all health check scripts
  ```bash
  cd ~/HotDash/hot-dash
  bash scripts/ops/health-check-agent-services.sh
  bash scripts/ops/integration-health-dashboard.sh
  ```
- [ ] **Database Backup**: Manual backup before launch
- [ ] **Monitoring Active**: All dashboards open and monitored
- [ ] **War Room**: Team assembled (virtual or physical)

### Hour -1: Pre-Flight Check
- [ ] **Service Status**: All green
  - Agent SDK: ✅
  - LlamaIndex MCP: ✅
  - Chatwoot: ✅
  - Database: ✅
- [ ] **Webhook Test**: Send test message, verify receipt
- [ ] **Approval Queue**: Verify empty and ready
- [ ] **Team Communication**: All channels active

### Hour 0: LAUNCH 🚀
- [ ] **Announce Launch**: Notify team via Slack
- [ ] **Enable Webhooks**: Activate Chatwoot → Agent SDK webhook
- [ ] **Monitor Logs**: Watch for incoming webhooks
  ```bash
  fly logs -a hotdash-agent-service
  fly logs -a hotdash-llamaindex-mcp
  fly logs -a hotdash-chatwoot
  ```
- [ ] **First Test Message**: Send test customer inquiry
- [ ] **Verify Draft Generation**: Check approval queue for draft
- [ ] **Test Approval Flow**: Approve test draft, verify reply sent

### Hour +1: Initial Monitoring
- [ ] **Error Rate**: Check for any errors (target: <0.1%)
- [ ] **Response Times**: Verify under target (<500ms)
- [ ] **Approval Queue Length**: Monitor queue depth
- [ ] **Operator Feedback**: Check with first operators
- [ ] **Customer Feedback**: Monitor for any issues

### Hour +2-24: Active Monitoring
- [ ] **Continuous Monitoring**: Every 30 minutes
- [ ] **Performance Metrics**: Track and log
  - Webhook delivery rate
  - Draft generation time
  - Approval rate
  - Customer satisfaction
- [ ] **Issue Triage**: Address any problems immediately
- [ ] **Team Updates**: Hourly status updates to Slack

---

## Launch Day Monitoring Commands

### Health Checks
```bash
# Quick health check
curl https://hotdash-agent-service.fly.dev/health
curl https://hotdash-llamaindex-mcp.fly.dev/health

# Comprehensive check
cd ~/HotDash/hot-dash
bash scripts/ops/health-check-agent-services.sh
```

### Log Monitoring
```bash
# Real-time logs
fly logs -a hotdash-agent-service
fly logs -a hotdash-llamaindex-mcp
fly logs -a hotdash-chatwoot

# Filter for errors
fly logs -a hotdash-agent-service | grep -i error
```

### Service Status
```bash
# Check Fly.io status
fly status -a hotdash-agent-service
fly status -a hotdash-llamaindex-mcp
fly status -a hotdash-chatwoot

# Check health checks
fly checks list -a hotdash-agent-service
```

### Database Monitoring
```bash
# Check pending approvals
psql $DATABASE_URL -c "SELECT COUNT(*) FROM agent_approvals WHERE status='pending';"

# Check recent approvals
psql $DATABASE_URL -c "SELECT id, status, created_at FROM agent_approvals ORDER BY created_at DESC LIMIT 10;"
```

---

## Success Metrics

### Technical Metrics (First 24 Hours)
- ✅ **Uptime**: > 99.5%
- ✅ **Error Rate**: < 0.1%
- ✅ **Response Time**: < 500ms (p95)
- ✅ **Webhook Delivery**: > 99%
- ✅ **Draft Generation**: < 3 seconds

### Product Metrics (First 24 Hours)
- 🎯 **Approvals Processed**: > 10
- 🎯 **Approval Rate**: > 60%
- 🎯 **Edit Rate**: < 30%
- 🎯 **Escalation Rate**: < 10%
- 🎯 **Rejection Rate**: < 5%

### Operator Metrics (First 24 Hours)
- 🎯 **Operators Trained**: 100%
- 🎯 **Operator Satisfaction**: > 7/10
- 🎯 **Time to Review**: < 2 minutes average
- 🎯 **Issues Reported**: Track and resolve

---

## Incident Response

### Severity Levels

**🔴 P0 - Critical (Immediate Response)**
- Total service outage
- Data loss or corruption
- Security breach
- **Response Time**: < 5 minutes
- **Escalation**: All hands on deck

**🟡 P1 - High (Urgent Response)**
- Partial service degradation
- High error rates (>5%)
- Major feature broken
- **Response Time**: < 15 minutes
- **Escalation**: On-call engineer + lead

**🟢 P2 - Medium (Normal Response)**
- Minor bugs affecting some users
- Performance degradation
- Non-critical feature issues
- **Response Time**: < 1 hour
- **Escalation**: On-call engineer

### Incident Response Steps
1. **Detect**: Monitor alerts, user reports
2. **Assess**: Determine severity and impact
3. **Communicate**: Notify team via Slack
4. **Investigate**: Check logs, metrics, health
5. **Mitigate**: Apply fix or rollback
6. **Verify**: Confirm issue resolved
7. **Document**: Post-mortem and lessons learned

---

## Rollback Plan

### When to Rollback
- **P0 Incident**: Cannot be resolved in 30 minutes
- **Data Corruption**: Any indication of data loss
- **Security Issue**: Critical vulnerability discovered
- **High Error Rates**: > 10% errors for > 5 minutes

### Rollback Procedure
```bash
# 1. Disable webhooks in Chatwoot admin
#    (Prevents new drafts from being generated)

# 2. Rollback database migrations if needed
cd ~/HotDash/hot-dash
supabase db push --rollback

# 3. Redeploy previous version (if code issue)
fly deploy -a hotdash-agent-service --image <previous-image>

# 4. Verify services healthy
bash scripts/ops/health-check-agent-services.sh

# 5. Communicate to team
#    "Rollback complete. Investigating issue."
```

---

## Post-Launch Checklist (First 7 Days)

### Day 1
- [ ] **Full System Review**: Check all metrics
- [ ] **Operator Feedback**: Collect initial impressions
- [ ] **Bug Triage**: Prioritize any issues found
- [ ] **Performance Tuning**: Optimize based on real data
- [ ] **Launch Retrospective**: Team debrief

### Day 2-3
- [ ] **Stability Monitoring**: Watch for patterns
- [ ] **User Training**: Additional operator training if needed
- [ ] **Documentation Updates**: Fix any inaccuracies
- [ ] **Minor Bug Fixes**: Address P2 issues

### Day 4-7
- [ ] **Performance Optimization**: Based on week 1 data
- [ ] **Feature Refinement**: Small UX improvements
- [ ] **Success Metrics Review**: Analyze against targets
- [ ] **Plan Next Iteration**: Based on feedback

---

## Communication Plan

### Channels
- **#launch-war-room**: Real-time launch coordination
- **#engineering**: Technical updates
- **#support-ops**: Operator communication
- **Email**: Executive updates

### Update Cadence
- **T-24 hours**: Pre-launch briefing
- **T-1 hour**: Go/no-go decision
- **T-0**: Launch announcement
- **T+1, 2, 4, 8, 24 hours**: Status updates
- **Daily**: First week summary

### Update Template
```
🚀 HotDash Launch Update [T+X hours]

Status: 🟢 Green / 🟡 Yellow / 🔴 Red

Metrics:
- Uptime: XX%
- Error Rate: XX%
- Approvals Processed: XX
- Operator Feedback: X/10

Issues:
- [None] or [List issues]

Next Check: [Time]
```

---

## Contact List

### Launch Team
- **Launch Commander**: [Name]
- **Engineering Lead**: Engineer Helper Agent
- **Product Lead**: [Name]
- **Support Lead**: [Name]
- **On-Call Engineer**: [Name]

### Escalation Path
1. On-Call Engineer
2. Engineering Lead
3. CTO/VP Engineering
4. CEO (P0 only)

---

## Quick Links

- **Health Dashboard**: `https://hotdash-agent-service.fly.dev/health`
- **Approval Queue**: `http://localhost:5173/chatwoot-approvals`
- **Fly.io Dashboard**: `https://fly.io/dashboard`
- **Supabase Dashboard**: `https://supabase.com/dashboard`
- **Chatwoot Admin**: `https://hotdash-chatwoot.fly.dev`

---

## Final Go/No-Go Decision

### Go Criteria ✅
- [x] All critical services healthy
- [ ] All pre-launch tests passed
- [ ] Team ready and briefed
- [ ] Rollback plan validated
- [ ] Monitoring active

### Launch Decision
**Date**: _____________  
**Time**: _____________  
**Decision**: ⬜ GO ⬜ NO-GO  
**Authorized By**: _____________

**If GO**: Proceed with launch  
**If NO-GO**: Document reason, reschedule, address blockers

---

## Launch Day Notes

_Space for real-time notes during launch_

---

**Document Version**: 1.0  
**Status**: Ready for Execution  
**Next Review**: Launch Day T-24 hours

---

**Remember**: We can always rollback. Safety first, launch second. 🚀
