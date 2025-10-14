# Deployment Agent Direction
**Updated**: 2025-10-14
**Priority**: GROWTH SPEC EXECUTION + SECURITY
**Focus**: Fix Secrets + Deploy Growth Features

## Mission

**IMMEDIATE**: Remove secrets from repo (CRITICAL SECURITY ISSUE)
**ONGOING**: Deploy growth automation infrastructure

## Priority 0 - Security Fix (IMMEDIATE - 1-2 hours)

### Task 1: Remove Secrets from Repository
**Goal**: No credentials in version control

**Issues** (Growth Spec A7, H2):
- 10+ secret files in vault/ directory
- API keys, service keys committed to repo
- No rotation automation

**Steps**:
1. [ ] Add vault/ to .gitignore
2. [ ] Move secrets to Fly.io secrets (fly secrets set)
3. [ ] Update app to read from env vars
4. [ ] Test in staging
5. [ ] Document secret rotation procedure
6. [ ] Coordinate git history cleanup with Git Cleanup agent (optional)

**Deliverables**:
- [ ] No secrets in repo (verified with grep)
- [ ] Secrets in Fly.io environment
- [ ] App working with env vars
- [ ] Rotation procedure documented
- [ ] GitHub commit

## Priority 1 - Growth Infrastructure Deployment

### Task 2: Deploy Action System
**Goal**: Action API + executors in production

**Requirements**:
- Deploy updated Prisma schema
- Deploy Action API routes
- Deploy executor services
- Configure auto-scaling

**Deliverables**:
- [ ] Supabase migrations deployed
- [ ] Action API endpoints live
- [ ] Executors operational
- [ ] Health checks passing
- [ ] Fly MCP verification

### Task 3: Deploy Data Pipelines
**Goal**: GA, GSC, webhook infrastructure live

**Requirements**:
- BigQuery credentials configured
- Webhook endpoints deployed
- Queue infrastructure (if needed)
- Monitoring enabled

**Deliverables**:
- [ ] GA pipeline deployed
- [ ] GSC pipeline deployed
- [ ] Webhooks operational
- [ ] Data flowing correctly
- [ ] Fly MCP verification

### Task 4: Deploy Recommender Services
**Goal**: AI recommenders running on schedule

**Requirements**:
- LlamaIndex MCP accessible
- Cron jobs or queue workers
- Resource limits configured
- Error alerting enabled

**Deliverables**:
- [ ] Recommenders deployed
- [ ] Scheduling operational
- [ ] Actions being generated
- [ ] Monitoring dashboards
- [ ] Fly MCP verification

## Priority 2 - Monitoring & Ops

### Task 5: Build Monitoring Dashboards (Growth Spec H3)
**Goal**: Real-time visibility into growth automation

**Dashboards Needed**:
- Action throughput (actions/hour)
- Recommender performance (actions generated, confidence)
- Executor success rate
- Data pipeline health
- Error rates and types

**Deliverables**:
- [ ] Grafana/monitoring dashboards
- [ ] Alerting rules configured
- [ ] SLOs defined
- [ ] On-call runbooks

### Task 6: Backup & Rollback Automation (Growth Spec H4)
**Goal**: Disaster recovery capabilities

**Requirements**:
- Database backup automation
- Config rollback procedures
- Blue-green deployment capability
- Rollback drill documentation

**Deliverables**:
- [ ] Automated backups configured
- [ ] Rollback procedures tested
- [ ] Recovery time objectives (RTO) met
- [ ] Drill results documented

## Build Deployment Automation, Not Manual Deploys

**✅ RIGHT**:
- Build CI/CD pipelines (automated deployment)
- Build monitoring dashboards (automated visibility)
- Build rollback automation (automated recovery)

**❌ WRONG**:
- Manually deploy each service
- Manually check logs
- Manual backup procedures

## Evidence Required

- Fly.io MCP verification
- Deployment logs
- Health check results
- Monitoring screenshots

## Success Criteria

**Week 1 Complete When**:
- [ ] Secrets removed from repo (CRITICAL)
- [ ] Action system deployed to production
- [ ] Data pipelines operational
- [ ] Recommenders running on schedule
- [ ] Monitoring dashboards live
- [ ] Backup/rollback tested

## Report Every 2 Hours

Update `feedback/deployment.md`:
- Deployment progress
- Services deployed
- Health status
- Security fixes completed
- Evidence (Fly MCP, health checks)

---

**Remember**: Build DEPLOYMENT AUTOMATION, not manual deployment procedures. Automate everything.
