# Production Launch Readiness Checklist

**Document**: `docs/launch/production-launch-readiness-checklist.md`  
**Created**: 2025-10-23  
**Owner**: Support Agent  
**Purpose**: Comprehensive go/no-go checklist for HotDash production deployment  
**Status**: ACTIVE

---

## Overview

This checklist ensures HotDash is production-ready before deployment. All P0 items must pass for GO decision.

**Quick Reference**:
- **Pre-Launch Validation**: Section 1 (CI/CD, Security, Performance, Accessibility, Database, Integrations, Testing, Documentation)
- **Go-Live Procedures**: Section 2 (Pre-deployment, Deployment, Post-deployment, Stakeholder communication)
- **Rollback Plan**: Section 3 (Triggers, Procedures, Post-rollback actions)
- **Post-Launch Monitoring**: Section 4 (Dashboards, Health checks, Alerts, Log monitoring)
- **Incident Response**: Section 5 (Classification, Procedures, Escalation, Communication)
- **Success Criteria**: Section 6 (Launch metrics, Go/No-Go decision)

---

## Section 1: Pre-Launch Validation

### 1.1 CI/CD Pipeline (P0)

**All checks MUST pass before deployment**:

- [ ] **Docs Policy** - All markdown files in allowed paths
- [ ] **Danger** - PR has Issue linkage and allowed paths enforced
- [ ] **Gitleaks** - No secrets detected in code (SARIF upload clean)
- [ ] **AI Config** - Agent configuration validated
- [ ] **Health Check** - Health check workflow functional
- [ ] **MCP Evidence** - All code changes have MCP Evidence JSONL files
- [ ] **Dev MCP Ban** - No Dev MCP imports in production runtime code
- [ ] **Idle Guard** - Heartbeat files present for tasks >2 hours

**Verification**: All CI checks green on main branch

---

### 1.2 Security Validation (P0)

**Security requirements from NORTH_STAR.md**:

- [ ] **PII Broker** - Redaction layer enforced
- [ ] **ABAC** - Attribute-Based Access Control roles configured
- [ ] **Store Switch Safety** - No hardcoded store literals
- [ ] **Secrets Management** - All secrets in GitHub Environments/Secrets
- [ ] **RLS Policies** - Supabase Row Level Security policies active
- [ ] **HITL Enforcement** - All customer-facing messages require human approval
- [ ] **Gitleaks Baseline** - security/gitleaks-baseline.json up to date

---

### 1.3 Performance Benchmarks (P0)

**Core Web Vitals**:

| Metric | Target | Status |
|--------|--------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s (P75) | ⬜ |
| **FID** (First Input Delay) | < 100ms (P75) | ⬜ |
| **CLS** (Cumulative Layout Shift) | < 0.1 (P75) | ⬜ |
| **TTFB** (Time to First Byte) | < 600ms | ⬜ |
| **INP** (Interaction to Next Paint) | < 200ms (P75) | ⬜ |

**HotDash-Specific Targets**:

| Metric | Target | Status |
|--------|--------|--------|
| **Dashboard Load** (P95) | < 3s | ⬜ |
| **Settings Page Load** | < 2s | ⬜ |
| **Tile Reorder Response** | < 200ms | ⬜ |
| **Theme Switch Time** | < 100ms | ⬜ |
| **Preference Save Time** | < 500ms | ⬜ |

---

### 1.4 Accessibility Compliance (P0)

**WCAG 2.2 Level AA compliance**:

- [ ] **axe DevTools** - 0 critical violations
- [ ] **WAVE Extension** - 0 errors
- [ ] **Lighthouse Accessibility** - Score ≥ 95
- [ ] **Keyboard Navigation** - All features accessible
- [ ] **Focus Indicators** - Visible focus (4.5:1 contrast)
- [ ] **Screen Reader (NVDA)** - All content announced

---

### 1.5 Database & Infrastructure (P0)

**Database Safety**:

- [ ] **Migration Status** - All migrations applied
- [ ] **Backup Verified** - Recent backup exists and tested
- [ ] **Connection Pooling** - Supabase pooler configured
- [ ] **Schema Validation** - `npx prisma validate` passes
- [ ] **RLS Policies** - Row Level Security active
- [ ] **No Migration Commands** - fly.toml release_command = `npx prisma generate` ONLY

**Infrastructure**:

- [ ] **Fly.io Apps** - All apps healthy
- [ ] **Environment Variables** - All required env vars set
- [ ] **Health Endpoints** - /health returns 200 on all apps

---

### 1.6 Integration Health (P0)

**Required Integrations**:

- [ ] **Shopify Admin API** - GraphQL queries working
- [ ] **Chatwoot** - Email + Live Chat + SMS operational
- [ ] **Supabase** - Database + Auth + Storage accessible
- [ ] **Google Analytics** - GA4 property 339826228 tracking
- [ ] **Search Console API** - Direct queries working
- [ ] **Publer** - Social posting adapter health checks passing

---

### 1.7 Testing Coverage (P0)

**Test Requirements**:

- [ ] **Unit Tests** - ≥ 80% coverage, all passing
- [ ] **Integration Tests** - All critical paths covered
- [ ] **E2E Tests** - Smoke tests for core workflows
- [ ] **Contract Tests** - Pacts verified for external APIs
- [ ] **Security Tests** - No critical vulnerabilities

---

### 1.8 Documentation (P1)

**Required Documentation**:

- [ ] **README.md** - Up to date
- [ ] **NORTH_STAR.md** - Vision and architecture current
- [ ] **OPERATING_MODEL.md** - Pipeline and guardrails documented
- [ ] **RULES.md** - MCP tools, file ownership, database safety rules
- [ ] **Runbooks** - All runbooks tested and verified

---

## Section 2: Go-Live Procedures

### 2.1 Pre-Deployment Steps (T-30 Minutes)

**Stakeholder Communication**:

1. [ ] **Notify CEO** - Deployment window confirmed
2. [ ] **Team Alert** - Post in Slack/Discord
3. [ ] **Status Page** - Update status page

**Final Checks**:

4. [ ] **Staging Verification** - Staging deployment successful
5. [ ] **Manager Approval** - Deployment approved
6. [ ] **Backup Verification** - Database backup completed
7. [ ] **Rollback Plan** - Rollback procedures reviewed

---

### 2.2 Deployment Execution (15-20 Minutes)

**Automated Deployment via GitHub Actions**:

1. [ ] **Navigate to Workflow**: https://github.com/Jgorzitza/HotDash/actions/workflows/deploy-production.yml
2. [ ] **Click "Run workflow"**: Branch: `main`, Reason: "Production launch - HotDash v1.0.0"
3. [ ] **Monitor Deployment**: Watch workflow progress
4. [ ] **Deployment Time**: Record deployment start/end times

---

### 2.3 Post-Deployment Verification (10 Minutes)

**Immediate Checks**:

1. [ ] **Health Endpoint**: `curl https://hotdash-production.fly.dev/health`
2. [ ] **Fly.io Status**: `fly status -a hotdash-production`
3. [ ] **Application Access**: Navigate to https://hotdash-production.fly.dev
4. [ ] **Email Notification**: Verify deployment success email

**Detailed Verification**:

5. [ ] **Database Connection**: Verify app can query database
6. [ ] **Shopify Integration**: Test Shopify Admin API queries
7. [ ] **Chatwoot Integration**: Verify CX channels operational
8. [ ] **Analytics Tracking**: Confirm GA4 events firing
9. [ ] **Error Monitoring**: Check logs for errors

---

### 2.4 Stakeholder Communication (Post-Deployment)

**Immediate Notifications**:

1. [ ] **CEO Notification**: "Production deployment successful"
2. [ ] **Team Update**: Post in Slack/Discord
3. [ ] **Status Page**: Update status page

**Deployment Summary Email**:

4. [ ] **Send to**: justin@hotrodan.com
5. [ ] **Include**: Deployment time, version, features, verification results

---

## Section 3: Rollback Plan

### 3.1 Rollback Triggers

**Automatic Rollback** (Staging only):
- Health check endpoint returns non-200/302 status
- Deployment fails during release
- Machine status check fails

**Manual Rollback Required** (Production):
- Critical bug discovered post-deployment
- Performance degradation >50%
- Security vulnerability detected
- Data integrity issues
- Integration failures affecting core functionality

---

### 3.2 Rollback Procedures

**Production Rollback** (Manual - 5-10 minutes):

1. [ ] **Initiate Rollback**: Navigate to rollback workflow
2. [ ] **Click "Run workflow"**: Enter rollback reason
3. [ ] **Monitor Rollback**: Watch workflow progress
4. [ ] **Verify Rollback**: Check health endpoint
5. [ ] **Notify Stakeholders**: CEO and team

---

### 3.3 Post-Rollback Actions

**Immediate**:

1. [ ] **Root Cause Analysis**: Identify what caused rollback
2. [ ] **Create Incident Report**: Document issue, impact, resolution
3. [ ] **Bug Ticket**: Create GitHub issue with P0 priority
4. [ ] **Team Debrief**: Schedule post-mortem meeting

**Follow-up**:

5. [ ] **Fix Development**: Develop and test fix
6. [ ] **Staging Deployment**: Deploy fix to staging
7. [ ] **Verification**: Verify fix resolves issue
8. [ ] **Plan Re-deployment**: Schedule new production deployment

---

## Section 4: Post-Launch Monitoring

### 4.1 Monitoring Dashboards

**Fly.io Native Dashboards**:
- **Production**: https://fly.io/apps/hotdash-production/monitoring
- **Chatwoot**: https://fly.io/apps/hotdash-chatwoot/monitoring

**Key Metrics**:

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| **Response Time (P95)** | < 3s | > 5s | > 10s |
| **Error Rate** | < 0.1% | > 1% | > 5% |
| **CPU Usage** | < 50% | > 80% | > 90% |
| **Memory Usage** | < 70% | > 85% | > 90% |

---

### 4.2 Health Check Schedule

**Automated Health Checks** (every 5 minutes):

1. [ ] **Application Health**: `/health` endpoint
2. [ ] **Database Health**: Connection pool status
3. [ ] **Chatwoot Health**: `/rails/health` endpoint
4. [ ] **Integration Health**: Shopify API, GA4, Search Console

**Manual Health Checks**:

| Timeframe | Checks Required |
|-----------|----------------|
| **First Hour** | Every 15 minutes |
| **First 4 Hours** | Every 30 minutes |
| **First 24 Hours** | Every 2 hours |
| **First Week** | Daily |

---

### 4.3 Alert Configuration

**Critical Alerts** (Immediate Action):

1. [ ] **App Down**: Health check fails for >2 minutes
2. [ ] **High Error Rate**: >5% of requests return 5xx errors
3. [ ] **Database Connection Failure**: Connection errors in logs
4. [ ] **Memory Exhaustion**: Memory >90% for >5 minutes
5. [ ] **Response Time Degradation**: P95 response time >10s

**Warning Alerts** (Monitor Closely):

6. [ ] **Elevated Error Rate**: >1% error rate
7. [ ] **Slow Response Times**: P95 >5s
8. [ ] **CPU Usage High**: >80% CPU for >15 minutes
9. [ ] **Disk Space**: >80% disk usage

---

### 4.4 Log Monitoring

**Log Sources**:
- Fly.io logs: `fly logs -a hotdash-production`
- Supabase logs: Supabase dashboard
- Chatwoot logs: `fly logs -a hotdash-chatwoot`

**What to Monitor**:

1. [ ] **Error Logs**: 5xx errors, exceptions, stack traces
2. [ ] **Performance Logs**: Slow queries, long response times
3. [ ] **Security Logs**: Failed auth attempts, suspicious activity
4. [ ] **Integration Logs**: API failures, rate limit warnings

---

## Section 5: Incident Response

### 5.1 Incident Classification

**P0 - Critical** (Response: 15 minutes, Resolution: 1 hour):
- Production completely down
- Data loss or corruption
- Security breach
- Payment processing failure

**P1 - High** (Response: 1 hour, Resolution: 4 hours):
- Partial functionality unavailable
- Performance degradation >50%
- Integration failures

**P2 - Medium** (Response: 4 hours, Resolution: 24 hours):
- Minor functionality issues
- Performance degradation <50%

**P3 - Low** (Response: 24 hours, Resolution: 1 week):
- Cosmetic issues
- Documentation errors

---

### 5.2 Incident Response Procedures

**P0 Critical Incident**:

1. [ ] **Immediate Actions** (within 5 minutes):
   - Assess impact and severity
   - Notify CEO and Manager immediately
   - Post in team channel
   - Begin incident log

2. [ ] **Investigation** (within 15 minutes):
   - Review logs and metrics
   - Identify root cause
   - Determine if rollback needed

3. [ ] **Resolution** (within 30 minutes):
   - Execute rollback if needed
   - OR apply hotfix if safe
   - Verify resolution

4. [ ] **Communication**:
   - Update CEO and Manager every 15 minutes
   - Post status updates in team channel
   - Send resolution notification

5. [ ] **Post-Incident** (within 24 hours):
   - Complete incident report
   - Schedule post-mortem meeting
   - Create action items

---

### 5.3 Escalation Paths

**Level 1 - On-Call Engineer**:
- Initial response and investigation
- Attempt resolution within 30 minutes

**Level 2 - Manager**:
- Escalate if unresolved after 30 minutes
- Coordinate additional resources
- Make rollback decision

**Level 3 - CEO**:
- Escalate if critical impact >1 hour
- Business continuity decisions
- External communication if needed

---

## Section 6: Success Criteria

### 6.1 Launch Success Metrics

**Deployment Success**:
- [ ] Deployment completed without errors
- [ ] All health checks passing
- [ ] No rollback required
- [ ] All integrations operational

**Performance Success** (First 24 hours):
- [ ] P95 response time < 3s
- [ ] Error rate < 0.5%
- [ ] Uptime > 99.9%
- [ ] No critical incidents

**User Success** (First Week):
- [ ] User login success rate > 95%
- [ ] Dashboard load success rate > 99%
- [ ] No user-reported critical bugs
- [ ] Positive user feedback

---

### 6.2 Go/No-Go Decision

**GO Criteria** (All must be YES):
- [ ] All P0 pre-launch validation items complete
- [ ] All CI/CD checks passing
- [ ] Security validation complete
- [ ] Performance benchmarks met
- [ ] Accessibility compliance verified
- [ ] Database and infrastructure ready
- [ ] Integration health checks passing
- [ ] Testing coverage requirements met
- [ ] Manager approval obtained
- [ ] Rollback plan tested and ready
- [ ] Monitoring and alerts configured
- [ ] Incident response team ready

**NO-GO Criteria** (Any ONE triggers NO-GO):
- [ ] Any P0 validation item failing
- [ ] Critical security vulnerability
- [ ] Performance benchmarks not met
- [ ] Database migration issues
- [ ] Integration failures
- [ ] Test coverage < 80%
- [ ] Rollback plan not tested
- [ ] Monitoring not configured

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-23 | Support Agent | Initial creation - comprehensive production launch checklist |

---

**END OF CHECKLIST**


