---
epoch: 2025.10.E1
doc: docs/directions/deployment.md
owner: manager
last_reviewed: 2025-10-12
---

# Deployment — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

### 1️⃣ **North Star Obsession**
Every task must help operators see actionable tiles TODAY for Hot Rod AN.
**Memory Lock**: "North Star = Operator value TODAY"

### 2️⃣ **MCP Tools Mandatory**
Use MCPs for ALL validation. NEVER rely on memory.
**Memory Lock**: "MCPs always, memory never"

### 3️⃣ **Feedback Process Sacred**
ALL work logged in `feedback/deployment.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"

### 4️⃣ **No New Files Ever**
Never create new .md files without Manager approval.
**Memory Lock**: "Update existing, never create new"

### 5️⃣ **Immediate Blocker Escalation**
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/deployment.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.

**Memory Lock**: "Blocker found = immediate flag"

### 6️⃣ **Manager-Only Direction**
Only Manager assigns tasks.
**Memory Lock**: "Manager directs, I execute"

---

## Canon

- North Star: docs/NORTH_STAR.md
- Fly Deployment: Use Fly MCP for all operations

## Mission

You deploy Hot Rod AN dashboard to production. Ensure zero downtime, monitor health, enable launch.

## Current Sprint Focus — Production Deployment (Oct 13-15, 2025)

**Primary Goal**: Deploy Agent SDK and services to production for Hot Rod AN launch

## ⚡ START HERE NOW (Updated: 2025-10-13 12:58 UTC by Manager)

**READ THIS FIRST**

**Your immediate priority**: Prepare production environment, standby for deployment after P0 blockers cleared

**Current blocker**: Build failure (Engineer fixing), RLS security (Data fixing)

**Cannot deploy until**: Both P0 blockers resolved

**Your action NOW**:
```bash
cd ~/HotDash/hot-dash

# 1. Verify production environment ready using Fly MCP
# mcp_fly_fly-apps-list(org: "hot-dash")
# Expected: hotdash-production app exists

# 2. Verify production secrets configured
# Check: vault/occ/*/prod.env exists for all services

# 3. Prepare deployment checklist (10 min)
# Create: docs/runbooks/production_deployment_checklist.md

# 4. Monitor Engineer and Data progress
# When both clear, deploy immediately

# Evidence: Deployment readiness report, checklist
```

**Expected outcome**: Ready to deploy within 30min of P0 clear

**Estimated P0 clear time**: 16:00 UTC (when build + RLS fixed)

**Your deploy window**: 16:00-17:00 UTC TODAY

**Manager checking at**: 16:00 UTC

---

## 🎯 ACTIVE TASKS

### Task 1 - Prepare Production Deployment (ASSIGNED ABOVE)

---

### Task 2 - Deploy LlamaIndex MCP (If Unblocked)

**What**: Deploy llamaindex-mcp-server if Engineer fixes dependency
**Status**: Waiting for Engineer to fix `commander` package
**Evidence**: MCP server responding, tools working

---

### Task 3 - Production Smoke Tests

**What**: Test all services in production
**Test**: Agent SDK health, webhook endpoints, database connection
**Evidence**: All services green
**Timeline**: 1 hour

---

### Task 4 - Monitor Launch Deployments

**What**: Monitor during Hot Rod AN CEO testing (Oct 13-15)
**Use**: Fly MCP for logs and metrics
**Evidence**: Fast response to any issues
**Timeline**: On-call

---

### Task 5 - Secrets Management

**What**: Verify production secrets are configured correctly
**Check**: OpenAI key, Supabase URL, Chatwoot credentials
**Evidence**: Services authenticate successfully

---

### Task 6 - Rollback Plan

**What**: Document rollback procedure if deployment fails
**Evidence**: Runbook created, tested rollback process

---

### Task 7 - Environment Variables Verification
**What**: Verify all production env vars configured correctly
**Timeline**: 1 hour

### Task 8 - SSL/TLS Certificate Check
**What**: Verify HTTPS working for all services
**Timeline**: 30 min

### Task 9 - Database Connection Testing
**What**: Test production database connections
**Timeline**: 1 hour

### Task 10 - Monitoring & Alerting Setup
**What**: Configure production monitoring and alerts
**Timeline**: 2-3 hours

### Task 11 - Backup Verification
**What**: Verify automated backups working
**Timeline**: 1 hour

### Task 12 - Deployment Documentation
**What**: Document deployment procedures
**Timeline**: 1-2 hours

### Task 13 - Staging Environment Sync
**What**: Ensure staging matches production
**Timeline**: 1-2 hours

### Task 14 - Health Check Endpoints
**What**: Verify all health checks responding
**Timeline**: 1 hour

### Task 15 - Log Aggregation Setup
**What**: Configure centralized logging
**Timeline**: 2-3 hours

### Task 16 - Performance Baseline
**What**: Establish production performance baselines
**Timeline**: 1-2 hours

### Task 17 - Incident Response Testing
**What**: Test incident response procedures
**Timeline**: 2 hours

### Task 18 - Deployment Automation Testing
**What**: Test automated deployment pipeline
**Timeline**: 2-3 hours

### Task 19 - Security Hardening
**What**: Apply production security configurations
**Timeline**: 2-3 hours

### Task 20 - Launch Day Monitoring
**What**: Monitor all services during Hot Rod AN launch
**Timeline**: On-call Oct 13-15

---

## Git Workflow (MANDATORY)

**Branch**: `deployment/work`
- Commit: `git commit -m "deploy: description"`
- Push: `git push origin deployment/work`
- Manager merges

**Forbidden**: Force push, merge to main, random branches

---

## Shutdown Checklist

[Standard 7 sections + 1A, 3A]

---

## Startup Process

[Standard 4 steps]

---

**Previous Work**: Archived  
**Status**: 🔴 ACTIVE - Task 1 (Deploy Agent SDK)


---

## 🚀 DEEP PRODUCTION TASK LIST (Aligned to North Star - Oct 12 Update)

**North Star Goal**: Ensure reliable, scalable infrastructure that supports Hot Rod AN scaling from $1MM to $10MM with zero downtime.

**Deployment Mission**: Own production infrastructure, deployments, and operational excellence.

### 🎯 P0 - PRODUCTION LAUNCH (Oct 12-13)

**Task 1: Production Secrets Configuration** (2 hours)
- Create production secrets in `vault/occ/*/prod.env`:
  - Supabase (DATABASE_URL, SERVICE_KEY)
  - OpenAI (API_KEY_PROD)
  - Shopify (all production credentials)
  - Chatwoot (API_TOKEN, REDIS_URL)
- Mirror to GitHub Actions `production` environment
- Verify all secrets present and valid
- **Evidence**: Production secrets configured, verified
- **North Star**: Secure production environment ready
- **Deadline**: Oct 12 14:00 UTC

**Task 2: Production Fly.io Apps** (2 hours)
- Verify production apps configured:
  - hotdash-production (main app)
  - hotdash-agent-service (production)
  - hotdash-llamaindex-mcp (production)
- Configure auto-scaling (min 1, max 3 machines)
- Set production health checks
- **Evidence**: Production apps ready, health checks passing
- **North Star**: Scalable infrastructure for growth
- **Deadline**: Oct 12 16:00 UTC

**Task 3: Production Deployment Runbook** (2 hours)
- Document step-by-step deploy procedure
- Document rollback procedure (test on staging)
- Create deployment checklist
- **Evidence**: Runbook tested on staging
- **North Star**: Reliable, repeatable deployments
- **Deadline**: Oct 12 18:00 UTC

**Task 4: Production Smoke Tests** (1 hour)
- Deploy to production
- Run smoke test suite
- Verify all critical paths working
- **Evidence**: Production smoke tests passing
- **North Star**: Validated production deployment
- **Deadline**: Oct 13 00:00 UTC

---

### 🔧 P1 - PRODUCTION OPERATIONS (Week 1-2)

**Task 5: Production Monitoring Setup** (4 hours)
- Configure Fly.io metrics for all production apps
- Set up alerts (CPU >80%, memory >80%, errors >1%)
- Create ops dashboard (all services health)
- Integrate with Slack for alerts
- **Evidence**: Monitoring active, alerts tested
- **North Star**: Proactive ops, catch issues before operators see them

**Task 6: Incident Response Procedures** (3 hours)
- Create incident response runbook
- Define severity levels (P0-P4)
- Document escalation paths
- Test incident procedures
- **Evidence**: Incident runbook tested
- **North Star**: Fast recovery from any issues

**Task 7: Backup & Recovery** (3 hours)
- Implement automated Supabase backups (daily)
- Test database recovery procedure
- Document recovery time objectives
- **Evidence**: Backup/recovery tested, RTO documented
- **North Star**: Operator data always protected

**Task 8: Performance Optimization** (3 hours)
- Optimize Fly.io machine sizes for cost/performance
- Configure caching strategies
- Tune auto-scaling thresholds
- **Evidence**: Performance optimized, costs minimized
- **North Star**: Fast dashboard within budget

---

### 📊 P2 - OPERATIONAL EXCELLENCE (Week 2-3)

**Task 9: Zero-Downtime Deployments** (4 hours)
- Implement blue-green deployment strategy
- Test deployment with zero downtime
- Automate deployment process
- **Evidence**: Zero-downtime deployment working
- **North Star**: Operators never experience outages

**Task 10: Auto-Scaling Validation** (3 hours)
- Test auto-scaling under load
- Verify scales appropriately (1-3 machines)
- Optimize scaling thresholds
- **Evidence**: Auto-scaling tested, tuned
- **North Star**: Handles traffic spikes as business grows

**Task 11: Cost Optimization** (3 hours)
- Analyze Fly.io costs per service
- Optimize machine sizes for usage patterns
- Implement auto-stop for low-traffic periods
- **Evidence**: Cost optimization report
- **North Star**: Sustainable costs as we scale

**Task 12: Security Hardening** (3 hours)
- Configure Fly.io network policies
- Implement SSL/TLS for all services
- Harden production environment
- **Evidence**: Security audit passing
- **North Star**: Secure platform operators can trust

---

### 🚀 P3 - SCALING INFRASTRUCTURE (Week 3-4)

**Task 13: Multi-Region Strategy** (4 hours)
- Plan multi-region deployment (US-East, US-West)
- Design failover strategy
- Test region failover
- **Evidence**: Multi-region plan documented
- **North Star**: Geographic redundancy for reliability

**Task 14: Database Scaling** (3 hours)
- Plan Supabase scaling strategy
- Test read replicas for analytics queries
- Optimize connection pooling
- **Evidence**: Database scaling plan tested
- **North Star**: Database handles 10X growth

**Task 15: CDN & Asset Optimization** (3 hours)
- Configure CDN for static assets
- Optimize image delivery
- Implement asset caching
- **Evidence**: CDN configured, assets optimized
- **North Star**: Fast load times globally

---

### 🔐 P4 - COMPLIANCE & GOVERNANCE (Week 4-5)

**Task 16: Secret Rotation Automation** (3 hours)
- Automate quarterly secret rotation
- Test rotation procedures
- Document rotation runbook
- **Evidence**: Secret rotation automated
- **North Star**: Proactive security maintenance

**Task 17: Compliance Evidence Collection** (2 hours)
- Automate SOC 2 evidence collection
- Track deployment logs, access logs
- Generate compliance reports
- **Evidence**: Evidence collection automated
- **North Star**: Audit-ready at all times

**Task 18: Disaster Recovery Drills** (3 hours)
- Quarterly DR drill procedures
- Test full system recovery
- Document recovery procedures
- **Evidence**: DR drill successful
- **North Star**: Can recover from any disaster

---

**Total Deployment Tasks**: 18 production-aligned tasks (6-8 weeks work)  
**Every task supports**: Production reliability, scalability, security for Hot Rod AN growth  
**Prioritization**: Production launch → Operations → Scaling → Governance  
**Evidence Required**: Every task logged in `feedback/deployment.md` with commands, outputs, runbooks

**Infrastructure Stack**: Fly.io (only), Supabase (managed), No self-hosted infrastructure

