# Rollback Decision Criteria

**Document Type:** Operational Procedures  
**Owner:** Product Agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Scope:** All production deployments

---

## Purpose

Define clear, measurable criteria for when to rollback a deployment, who makes the decision, and how to execute the rollback safely.

---

## Rollback Trigger Conditions

### Automatic Rollback (Immediate)

**These conditions trigger automatic rollback without human approval:**

1. **Security Vulnerability Detected**
   - Secret exposed in code or logs
   - Authentication bypass discovered
   - SQL injection or XSS vulnerability
   - **Action:** Immediate rollback + incident response

2. **Data Corruption**
   - Database writes corrupting existing data
   - Inventory counts becoming negative
   - Order totals calculating incorrectly
   - **Action:** Immediate rollback + data restoration

3. **Complete Service Outage**
   - Dashboard completely inaccessible (>5 min)
   - All API endpoints returning 500 errors
   - Database connection failures
   - **Action:** Immediate rollback + root cause analysis

---

### Manual Rollback (Manager Decision)

**These conditions require manager evaluation and decision:**

1. **Performance Degradation**
   - **Trigger:** Dashboard load time >5 seconds (P95)
   - **Threshold:** Sustained for >10 minutes
   - **Decision Maker:** Manager (with CEO input)
   - **Evaluation Time:** <5 minutes
   - **Rollback if:** Performance doesn't recover within 15 minutes

2. **Data Accuracy Issues**
   - **Trigger:** Data accuracy <95% vs source systems
   - **Threshold:** Affecting >10% of tiles/features
   - **Decision Maker:** Manager (with CEO input)
   - **Evaluation Time:** <10 minutes
   - **Rollback if:** Root cause unclear or fix >30 minutes

3. **High Error Rate**
   - **Trigger:** Error rate >5% of requests
   - **Threshold:** Sustained for >5 minutes
   - **Decision Maker:** Manager
   - **Evaluation Time:** <5 minutes
   - **Rollback if:** Errors affecting critical workflows (approvals, CX)

4. **Critical Accessibility Violations**
   - **Trigger:** WCAG 2.1 AA violations discovered post-launch
   - **Threshold:** Blocking keyboard navigation or screen readers
   - **Decision Maker:** Manager (with CEO input)
   - **Evaluation Time:** <30 minutes
   - **Rollback if:** Fix requires >2 hours

5. **User Unable to Complete Core Workflows**
   - **Trigger:** CEO cannot approve/reject approvals
   - **Threshold:** Blocking business operations
   - **Decision Maker:** Manager (with CEO input)
   - **Evaluation Time:** <10 minutes
   - **Rollback if:** Workaround not available

6. **CEO Requests Rollback**
   - **Trigger:** CEO explicitly requests rollback
   - **Threshold:** Any reason (usability, trust, preference)
   - **Decision Maker:** CEO
   - **Evaluation Time:** Immediate
   - **Rollback if:** CEO confirms after brief discussion

---

### No Rollback (Fix Forward)

**These conditions do NOT trigger rollback - fix forward instead:**

1. **Minor Usability Issues**
   - Button text unclear
   - Color scheme preference
   - Non-critical layout issues
   - **Action:** Create issue, fix in next release

2. **Non-Critical Feature Missing**
   - Nice-to-have feature not implemented
   - P3 feature deferred
   - **Action:** Add to backlog

3. **Performance Slightly Below Target**
   - Dashboard load time 3-5 seconds (target: <3s)
   - Not blocking usage
   - **Action:** Optimize in next release

4. **Low-Severity Bugs**
   - Typos in UI text
   - Minor visual glitches
   - Non-blocking errors
   - **Action:** Fix in next release

---

## Decision Matrix

| Condition | Severity | Auto Rollback? | Decision Maker | Max Evaluation Time | Rollback Threshold |
|-----------|----------|----------------|----------------|---------------------|-------------------|
| Security vulnerability | Critical | Yes | Automatic | 0 min | Immediate |
| Data corruption | Critical | Yes | Automatic | 0 min | Immediate |
| Complete outage | Critical | Yes | Automatic | 0 min | Immediate |
| Performance >5s (P95) | High | No | Manager + CEO | 5 min | >15 min sustained |
| Data accuracy <95% | High | No | Manager + CEO | 10 min | Root cause unclear |
| Error rate >5% | High | No | Manager | 5 min | Affecting critical workflows |
| Accessibility violations | Medium | No | Manager + CEO | 30 min | Fix >2 hours |
| Core workflow blocked | High | No | Manager + CEO | 10 min | No workaround |
| CEO request | Variable | No | CEO | 0 min | CEO confirms |
| Minor usability | Low | No | N/A | N/A | Never (fix forward) |

---

## Rollback Procedures

### Dashboard Rollback

**Estimated Time:** <5 minutes

**Steps:**
1. **Disable new dashboard** (feature flag)
   ```bash
   # Set environment variable
   fly secrets set ENABLE_NEW_DASHBOARD=false -a hot-dash
   
   # Or revert route in code
   git revert <commit-hash>
   git push
   fly deploy
   ```

2. **Verify rollback**
   - [ ] Previous dashboard loads
   - [ ] All tiles functional
   - [ ] No console errors
   - [ ] CEO can access

3. **Notify stakeholders**
   - [ ] CEO notified (Slack/email)
   - [ ] Team notified (Slack)
   - [ ] Incident logged in Supabase

4. **Root cause analysis**
   - [ ] Identify what triggered rollback
   - [ ] Document in incident log
   - [ ] Plan fix or alternative approach

---

### Approvals Workflow Rollback

**Estimated Time:** <3 minutes

**Steps:**
1. **Disable approvals feature**
   ```bash
   fly secrets set ENABLE_APPROVALS=false -a agent-service
   ```

2. **Fallback to manual workflow**
   - [ ] CEO reviews Chatwoot directly
   - [ ] Manual PO generation
   - [ ] Manual social posting

3. **Verify fallback**
   - [ ] CEO can access Chatwoot
   - [ ] No approvals blocking operations

4. **Notify and document**
   - [ ] CEO notified of manual workflow
   - [ ] Incident logged
   - [ ] Fix planned

---

### Database Schema Rollback

**Estimated Time:** <10 minutes

**Steps:**
1. **Run migration rollback**
   ```bash
   # Supabase migration down
   supabase db reset --db-url <production-url>
   
   # Or manual SQL
   psql <production-url> < migrations/rollback_<version>.sql
   ```

2. **Verify data integrity**
   - [ ] Run data validation queries
   - [ ] Check row counts
   - [ ] Verify no data loss

3. **Restore from backup if needed**
   ```bash
   # Restore from Supabase backup
   supabase db restore --db-url <production-url> --backup-id <id>
   ```

4. **Notify and document**
   - [ ] CEO notified
   - [ ] Data integrity confirmed
   - [ ] Incident logged

---

### Agent Service Rollback

**Estimated Time:** <5 minutes

**Steps:**
1. **Revert to previous version**
   ```bash
   # Checkout previous tag
   git checkout <previous-tag>
   
   # Deploy
   fly deploy -a agent-service
   ```

2. **Verify service health**
   - [ ] Health check endpoint returns 200
   - [ ] Approvals API functional
   - [ ] No errors in logs

3. **Notify and document**
   - [ ] Team notified
   - [ ] Incident logged
   - [ ] Fix planned

---

## Rollback Artifacts

### Pre-Deployment Checklist

**Before every deployment, ensure these artifacts exist:**

1. **Git Tag**
   - [ ] Previous version tagged (e.g., `dashboard-v1.0`)
   - [ ] Tag pushed to remote
   - [ ] Tag includes commit hash

2. **Database Backup**
   - [ ] Supabase backup created
   - [ ] Backup ID documented
   - [ ] Backup verified (test restore)

3. **Environment Variables**
   - [ ] Current env vars documented
   - [ ] Stored in secure location (1Password, Vault)
   - [ ] Rollback values known

4. **Deployment Configuration**
   - [ ] fly.toml backed up
   - [ ] Secrets list documented
   - [ ] Scaling settings documented

5. **Rollback Procedure**
   - [ ] Rollback steps documented
   - [ ] Rollback tested in staging
   - [ ] Estimated rollback time known

---

## Post-Rollback Actions

### Immediate (Within 1 Hour)

1. **Incident Log**
   - [ ] Create incident record in Supabase
   - [ ] Document trigger condition
   - [ ] Document rollback steps taken
   - [ ] Document current state

2. **Stakeholder Communication**
   - [ ] CEO notified with status update
   - [ ] Team notified in Slack
   - [ ] Timeline for fix communicated

3. **Root Cause Analysis (Initial)**
   - [ ] Identify immediate cause
   - [ ] Determine if preventable
   - [ ] Document in incident log

---

### Follow-Up (Within 24 Hours)

1. **Root Cause Analysis (Deep Dive)**
   - [ ] Full investigation of trigger
   - [ ] Identify contributing factors
   - [ ] Document lessons learned

2. **Prevention Plan**
   - [ ] Identify what could have prevented rollback
   - [ ] Add to pre-deployment checklist
   - [ ] Update monitoring/alerts

3. **Fix Plan**
   - [ ] Determine fix approach
   - [ ] Estimate fix timeline
   - [ ] Plan testing strategy

4. **Incident Review**
   - [ ] Team review of incident
   - [ ] Update rollback procedures if needed
   - [ ] Update decision criteria if needed

---

### Long-Term (Within 1 Week)

1. **Fix Implementation**
   - [ ] Fix developed and tested
   - [ ] Tested in staging
   - [ ] Rollback plan for fix ready

2. **Re-Deployment**
   - [ ] Deploy fix to production
   - [ ] Monitor closely for 24 hours
   - [ ] Verify issue resolved

3. **Documentation Update**
   - [ ] Update runbooks
   - [ ] Update rollback procedures
   - [ ] Share learnings with team

---

## Monitoring & Alerts

### Real-Time Monitoring

**Dashboard Performance:**
- Alert if P95 load time >5s for >5 minutes
- Alert if error rate >5% for >3 minutes
- Alert if uptime <99.9% in 24-hour window

**Data Accuracy:**
- Alert if revenue mismatch >5% vs Shopify
- Alert if inventory count mismatch >10 items
- Alert if approvals count mismatch

**Security:**
- Alert on any Gitleaks violation
- Alert on failed authentication attempts >10/min
- Alert on suspicious API activity

**Approvals Workflow:**
- Alert if approval processing fails >3 times
- Alert if approval latency >30 seconds
- Alert if CEO unable to approve/reject

---

### Alert Response

**Critical Alerts (Immediate Response):**
- Security vulnerabilities
- Data corruption
- Complete outages
- **Response Time:** <5 minutes
- **Action:** Evaluate for automatic rollback

**High Alerts (Urgent Response):**
- Performance degradation
- High error rates
- Data accuracy issues
- **Response Time:** <15 minutes
- **Action:** Evaluate for manual rollback

**Medium Alerts (Standard Response):**
- Accessibility issues
- Workflow blockers
- **Response Time:** <30 minutes
- **Action:** Evaluate for fix forward vs rollback

---

## Rollback Testing

### Pre-Launch Rollback Test

**Before production launch, test rollback procedures:**

1. **Deploy to Staging**
   - [ ] Deploy new version to staging
   - [ ] Verify functionality

2. **Execute Rollback**
   - [ ] Follow rollback procedure
   - [ ] Time the rollback
   - [ ] Verify previous version restored

3. **Document Results**
   - [ ] Actual rollback time
   - [ ] Any issues encountered
   - [ ] Updates to procedure

4. **Repeat if Needed**
   - [ ] If rollback >5 minutes, optimize
   - [ ] If issues found, fix procedure
   - [ ] Re-test until smooth

---

### Quarterly Rollback Drills

**Every 3 months, conduct rollback drill:**

1. **Simulate Incident**
   - Choose a trigger condition
   - Announce drill to team

2. **Execute Rollback**
   - Follow procedure
   - Time the rollback
   - Document any issues

3. **Review and Improve**
   - Team debrief
   - Update procedures
   - Update decision criteria

---

## Document Control

**Version History:**
- 1.0 (2025-10-15): Initial rollback criteria by Product Agent

**Review Schedule:**
- Manager: Approve decision criteria and procedures
- Engineer: Validate technical rollback steps
- CEO: Approve CEO-involved decision thresholds

**Related Documents:**
- `docs/specs/dashboard_launch_readiness.md` - Launch checklist
- `docs/specs/monitoring_plan.md` - Monitoring and alerts
- `docs/NORTH_STAR.md` - Success metrics

