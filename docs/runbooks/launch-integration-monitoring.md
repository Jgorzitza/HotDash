# Launch Integration Monitoring - On-Call Runbook
**Period**: October 13-15, 2025  
**Owner**: Integrations Agent  
**Status**: Ready for Launch

---

## Mission

Monitor all integrations during the Hot Rod AN production launch to ensure:
1. Shopify API calls succeed
2. Chatwoot conversations flow correctly
3. Google Analytics data appears in dashboard
4. No integration failures impact user experience

---

## Pre-Launch Checklist

### Before Launch (Oct 12)
- [x] All integration tests passing
- [x] MCP servers healthy (5/7 core operational)
- [x] Webhook endpoints verified
- [x] Rate limiting tested
- [x] Error recovery tested
- [x] Documentation complete
- [ ] Production secrets deployed (blocked: pending infrastructure)
- [ ] Alert channels configured (PagerDuty/Slack)

### Launch Day (Oct 13)
- [ ] Run comprehensive health check at 00:00 UTC
- [ ] Monitor MCP servers every 15 minutes
- [ ] Watch for Shopify rate limit breaches
- [ ] Check Chatwoot webhook delivery rate
- [ ] Verify GA data appearing in dashboard
- [ ] Monitor error logs in real-time

---

## Monitoring Schedule

### Day 1 (Oct 13): Launch Day
**00:00 UTC** - Pre-launch health check  
**08:00 UTC** - Morning status report  
**12:00 UTC** - Midday check  
**16:00 UTC** - Afternoon check  
**20:00 UTC** - Evening check  
**23:00 UTC** - End of day summary  

### Day 2 (Oct 14): Post-Launch
**00:00 UTC** - Midnight health check  
**08:00 UTC** - Morning status  
**20:00 UTC** - Evening status  

### Day 3 (Oct 15): Stabilization
**00:00 UTC** - Final health check  
**12:00 UTC** - Launch retrospective  

---

## Monitoring Commands

### Quick Health Check (Run every hour)
```bash
cd /home/justin/HotDash/hot-dash

# Check all MCPs
./scripts/ops/mcp-health-check.sh

# Check integrations
./scripts/ops/test-all-integrations.sh

# Check Fly.io apps
./scripts/ops/agent-sdk-health-check.sh
```

### Deep Diagnostics (Run on alert)
```bash
# Shopify API health
curl -I https://hotroddash.myshopify.com/admin/api/2024-10/shop.json

# Chatwoot health
curl https://hotdash-chatwoot.fly.dev/api

# GA credentials
test -f vault/occ/google/analytics-service-account.json && echo "✅ GA creds present"

# Supabase connection
npx supabase db remote ls --no-pager
```

### Real-Time Logs
```bash
# Agent SDK logs
fly logs -a hotdash-agent-service

# LlamaIndex MCP logs
fly logs -a hotdash-llamaindex-mcp

# Chatwoot logs
fly logs -a hotdash-chatwoot
```

---

## Critical Thresholds

| Metric | Green | Yellow | Red | Action |
|--------|-------|--------|-----|--------|
| Shopify Success Rate | > 95% | 90-95% | < 90% | Page engineer |
| Chatwoot Response Time | < 800ms | 800ms-2s | > 2s | Check service |
| GA Query Success | > 95% | 90-95% | < 90% | Check credentials |
| MCP Server Health | 6/7 up | 5/7 up | < 5/7 | Restart services |
| Webhook Verification | > 95% | 90-95% | < 90% | Check secrets |

---

## Incident Response

### Level 1: Minor Degradation (Yellow)
**Examples**: Slow responses, elevated error rates (5-10%)

**Actions**:
1. Document issue in feedback/integrations.md
2. Monitor for 15 minutes
3. If persists, escalate to Level 2

### Level 2: Service Degraded (Orange)
**Examples**: Error rate 10-20%, intermittent failures

**Actions**:
1. Run diagnostics (health checks, logs)
2. Notify engineering team in Slack
3. Prepare rollback plan
4. If persists > 30 minutes, escalate to Level 3

### Level 3: Service Down (Red)
**Examples**: Error rate > 20%, complete service outage

**Actions**:
1. **IMMEDIATE**: Page on-call engineer via PagerDuty
2. Execute emergency runbook (docs/runbooks/integration-error-recovery.md)
3. Consider service degradation mode (disable affected features)
4. Notify stakeholders (CEO, Product, Support)

---

## Communication Protocol

### Slack Channels
- **#integrations-alerts** - Automated alerts
- **#engineering** - Technical coordination  
- **#launch-war-room** - Executive updates

### Status Update Template
```
🔍 Integration Status Update - [TIME]

Shopify: [✅/⚠️/❌] - [Success Rate]% - [Notes]
Chatwoot: [✅/⚠️/❌] - [Response Time]ms - [Notes]
Google Analytics: [✅/⚠️/❌] - [Query Success]% - [Notes]
MCPs: [X/7] operational - [Notes]

Issues: [None / List any issues]
Actions: [None / Actions taken]

Next check: [TIME]
```

---

## Success Criteria

### Launch Success Metrics
- ✅ Shopify API success rate > 95%
- ✅ Chatwoot response time < 1 second P95
- ✅ GA queries succeed > 95%
- ✅ Zero critical incidents
- ✅ < 3 warning-level incidents
- ✅ All incidents resolved within SLA

### Post-Launch Review
- Integration performance report (Oct 16)
- Lessons learned documentation
- Runbook improvements
- Alert threshold tuning

---

## Emergency Contacts

**On-Call Engineer**: Check PagerDuty schedule  
**Engineering Lead**: Escalation path  
**Infrastructure**: Fly.io support (if platform issues)

---

## Monitoring Tools

- **Fly.io Dashboard**: https://fly.io/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Shopify Admin**: https://partners.shopify.com
- **Chatwoot Admin**: https://hotdash-chatwoot.fly.dev
- **MCP Health**: `./scripts/ops/mcp-health-check.sh`

---

**Runbook Version**: 1.0  
**Created**: 2025-10-12  
**On-Call Period**: Oct 13-15, 2025  
**Owner**: Integrations Agent

