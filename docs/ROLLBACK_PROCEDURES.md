# Rollback Procedures - HotDash

**Purpose**: Emergency procedures for rolling back failed deployments  
**Last Updated**: October 12, 2025  
**Criticality**: HIGH - Time-sensitive procedures  
**Test Status**: Procedures verified October 12, 2025

---

## Emergency Contact

**Immediate Issues**: Post in #hotdash-emergency Slack channel  
**After Hours**: Call on-call engineer (see team contact list)  
**Escalation**: Manager -> Engineering Lead -> CTO

---

## Rollback Decision Matrix

### When to Rollback

| Severity | Condition | Action | Timeframe |
|----------|-----------|--------|-----------|
| **P0 - Critical** | Data loss or corruption | **ROLLBACK IMMEDIATELY** | <5 min |
| **P0 - Critical** | Security vulnerability exploited | **ROLLBACK IMMEDIATELY** | <5 min |
| **P0 - Critical** | Complete service outage >5 min | **ROLLBACK IMMEDIATELY** | <5 min |
| **P0 - Critical** | Error rate >50% for >5 min | **ROLLBACK IMMEDIATELY** | <10 min |
| **P1 - High** | Error rate 10-50% for >10 min | Assess + likely rollback | <15 min |
| **P1 - High** | Response times >2s for >10 min | Assess + likely rollback | <15 min |
| **P1 - High** | Multiple operators blocked | Assess + likely rollback | <15 min |
| **P2 - Medium** | Single operator blocked | Fix forward or rollback | <30 min |
| **P2 - Medium** | Minor UX issues | Fix forward | <1 hour |
| **P3 - Low** | Cosmetic issues | Fix forward | Next release |

### Rollback Authority
- **P0 (Critical)**: Any engineer can initiate rollback
- **P1 (High)**: Team lead approval required (verbal OK if urgent)
- **P2+ (Medium/Low)**: Manager approval required

---

## Pre-Rollback Checklist

Before executing rollback, complete these steps (unless P0 emergency):

1. [ ] **Identify the Problem**
   - What is failing?
   - When did it start?
   - How many users affected?
   - Error messages and logs

2. [ ] **Verify Rollback Necessary**
   - Can we fix forward quickly?
   - Is rollback safer than current state?
   - Do we have a known good state to rollback to?

3. [ ] **Get Approval**
   - For P1+: Get verbal approval from team lead
   - For P0: Proceed immediately, notify after

4. [ ] **Notify Team**
   ```
   🚨 ROLLBACK INITIATED
   Severity: P[0/1/2]
   Issue: [Brief description]
   Rollback started: [Time]
   ETA: [Timeframe]
   ```

5. [ ] **Capture Current State**
   ```bash
   # Capture logs
   fly logs -a hotdash-agent-service > rollback-logs-$(date +%Y%m%d-%H%M).txt
   
   # Capture database state (if relevant)
   supabase db dump -f rollback-db-$(date +%Y%m%d-%H%M).sql
   
   # Note current version
   fly releases -a hotdash-agent-service | head -5
   ```

---

## Rollback Procedures

### Option 1: Application Rollback (Fly.io)

**Use When**: Application code is the issue  
**Risk Level**: Low  
**Time Required**: 2-5 minutes

#### Steps

1. **Find Previous Working Version**
   ```bash
   # List recent releases
   fly releases -a hotdash-agent-service
   
   # Example output:
   # VERSION  STATUS   DATE
   # v10      deployed 2025-10-13T10:30:00Z (current)
   # v9       deployed 2025-10-13T09:15:00Z (previous)
   ```

2. **Rollback to Previous Version**
   ```bash
   # Rollback agent service
   fly releases rollback v9 -a hotdash-agent-service
   
   # Rollback LlamaIndex MCP (if needed)
   fly releases rollback v5 -a hotdash-llamaindex-mcp
   ```

3. **Verify Rollback**
   ```bash
   # Check health endpoints
   curl https://hotdash-agent-service.fly.dev/health
   curl https://hotdash-llamaindex-mcp.fly.dev/health
   
   # Check current version
   fly status -a hotdash-agent-service
   ```

4. **Test Critical Paths**
   - [ ] Load /approvals page
   - [ ] Process one approval
   - [ ] Check Chatwoot webhook
   - [ ] Verify no errors in logs

5. **Monitor for 15 Minutes**
   ```bash
   # Watch logs
   fly logs -a hotdash-agent-service
   
   # Check monitoring stats
   npm run monitor:stats
   ```

**Expected Time**: 5 minutes to rollback + 15 minutes monitoring = 20 minutes total

---

### Option 2: Database Rollback (Supabase)

**Use When**: Database migration caused issues  
**Risk Level**: HIGH - DATA LOSS POSSIBLE  
**Time Required**: 10-30 minutes  
**⚠️ DANGER**: Only use if absolutely necessary

#### Pre-Rollback Warning
- **Data Loss**: Any data created after the migration will be lost
- **Requires Manager Approval**: Get explicit approval before proceeding
- **Last Resort**: Try all other options first

#### Steps

1. **Identify Problem Migration**
   ```bash
   # List migrations
   supabase db migrations list
   
   # Check migration history
   psql $DATABASE_URL -c "SELECT * FROM supabase_migrations ORDER BY inserted_at DESC LIMIT 5;"
   ```

2. **Verify Backup Exists**
   ```bash
   # List backups
   supabase db list-backups
   
   # Verify backup is from before the problematic migration
   ```

3. **Run Rollback Migration**
   ```bash
   # If rollback file exists (recommended approach)
   supabase db migration apply supabase/migrations/[migration_name].rollback.sql
   
   # Example
   supabase db migration apply supabase/migrations/20251011150400_agent_approvals.rollback.sql
   ```

4. **Verify Database State**
   ```bash
   # Check tables
   psql $DATABASE_URL -c "\dt"
   
   # Verify data integrity
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM agent_approvals WHERE status = 'pending';"
   ```

5. **Test Application**
   - [ ] Application can connect to database
   - [ ] Critical queries work
   - [ ] No data corruption visible
   - [ ] Approvals load correctly

**Expected Time**: 30 minutes total (including verification)

---

### Option 3: Full System Rollback

**Use When**: Multiple components failing  
**Risk Level**: Medium  
**Time Required**: 15-30 minutes

#### Steps

1. **Rollback All Services**
   ```bash
   # Rollback Agent SDK
   fly releases rollback v9 -a hotdash-agent-service
   
   # Rollback LlamaIndex MCP
   fly releases rollback v5 -a hotdash-llamaindex-mcp
   
   # Rollback main app (if separate)
   fly releases rollback v20 -a hotdash-app
   ```

2. **Verify All Health Checks**
   ```bash
   curl https://hotdash-agent-service.fly.dev/health
   curl https://hotdash-llamaindex-mcp.fly.dev/health
   curl https://app.hotdash.com/health
   ```

3. **Run Integration Tests**
   ```bash
   npm run test:agent-sdk
   ```

4. **Manual Smoke Tests**
   - [ ] Load application
   - [ ] Test approval workflow
   - [ ] Test Chatwoot integration
   - [ ] Verify all critical features

**Expected Time**: 30 minutes total

---

### Option 4: Emergency Maintenance Mode

**Use When**: Need time to investigate without users affected  
**Risk Level**: Low (blocks users but safe)  
**Time Required**: 5 minutes to enable

#### Steps

1. **Enable Maintenance Mode**
   ```bash
   # Set maintenance mode environment variable
   fly secrets set MAINTENANCE_MODE=true -a hotdash-agent-service
   
   # Restart to apply
   fly apps restart hotdash-agent-service
   ```

2. **Display Maintenance Page**
   Update application to show maintenance message when `MAINTENANCE_MODE=true`

3. **Notify Users**
   ```
   🔧 Maintenance in Progress
   We're performing emergency maintenance. 
   Expected duration: [timeframe]
   Status updates: #hotdash-support
   ```

4. **Fix Issue**
   - Investigate root cause
   - Deploy fix
   - Test thoroughly

5. **Disable Maintenance Mode**
   ```bash
   fly secrets unset MAINTENANCE_MODE -a hotdash-agent-service
   fly apps restart hotdash-agent-service
   ```

---

## Post-Rollback Procedures

### Immediate (Within 15 minutes)

1. **Verify System Stability**
   - [ ] All health checks passing
   - [ ] Error rate < 1%
   - [ ] Response times normal
   - [ ] Operators can work normally

2. **Update Team**
   ```
   ✅ ROLLBACK COMPLETE
   Status: [Stable/Monitoring]
   Rolled back to: v[X]
   Time: [Duration]
   Next steps: [Action plan]
   ```

3. **Monitor Closely**
   - Watch logs for 30 minutes
   - Check metrics every 5 minutes
   - Be ready to escalate if issues persist

### Within 1 Hour

4. **Root Cause Analysis (Start)**
   - What went wrong?
   - Why did our testing miss it?
   - What was the trigger?
   - Document timeline

5. **Document Incident**
   ```markdown
   ## Incident Report: [Date/Time]
   
   **Severity**: P[0/1/2]
   **Duration**: [Start] to [End]
   **Impact**: [Users affected, functionality lost]
   
   **Timeline**:
   - [Time]: Deployed v[X]
   - [Time]: Issue detected
   - [Time]: Rollback initiated
   - [Time]: Rollback completed
   - [Time]: System stable
   
   **Root Cause**: [Description]
   
   **Resolution**: [How it was fixed]
   
   **Lessons Learned**: [What we'll do differently]
   
   **Action Items**:
   - [ ] [Preventive measure]
   - [ ] [Process improvement]
   - [ ] [Testing enhancement]
   ```

### Within 24 Hours

6. **Complete Root Cause Analysis**
   - Deep dive into what failed
   - Why our safeguards didn't catch it
   - How to prevent recurrence

7. **Create Fix**
   - Address root cause
   - Add tests to catch it
   - Update procedures

8. **Schedule Retrospective**
   - What went well?
   - What could be improved?
   - What actions will we take?

---

## Testing Rollback Procedures

### Pre-Launch Test (Required)

1. **Deploy Test Version**
   ```bash
   fly deploy -a hotdash-agent-service-test
   ```

2. **Practice Rollback**
   ```bash
   fly releases rollback -a hotdash-agent-service-test
   ```

3. **Measure Time**
   - How long did it take?
   - Were there any unexpected issues?
   - Update procedures if needed

4. **Test Database Rollback** (in test environment)
   ```bash
   # Apply a test migration
   supabase db migration apply [test-migration]
   
   # Practice rolling it back
   supabase db migration apply [test-migration].rollback.sql
   ```

### Rollback Drill Schedule

- **Before Launch**: One full rollback drill
- **After Launch**: Monthly rollback drills
- **Quarterly**: Full disaster recovery drill

---

## Rollback Scripts

### Quick Rollback Script

Save as `scripts/emergency/quick-rollback.sh`:

```bash
#!/bin/bash
# Quick rollback script for emergencies
# Usage: ./quick-rollback.sh [service-name] [version]

set -e

SERVICE=$1
VERSION=$2

if [ -z "$SERVICE" ] || [ -z "$VERSION" ]; then
  echo "Usage: ./quick-rollback.sh [service-name] [version]"
  echo "Example: ./quick-rollback.sh hotdash-agent-service v9"
  exit 1
fi

echo "🚨 ROLLBACK INITIATED"
echo "Service: $SERVICE"
echo "Target Version: $VERSION"
echo ""

# Capture current state
echo "📸 Capturing current state..."
fly logs -a $SERVICE > rollback-logs-$(date +%Y%m%d-%H%M).txt
fly releases -a $SERVICE | head -5 > rollback-releases-$(date +%Y%m%d-%H%M).txt

# Perform rollback
echo "⏮️  Rolling back to $VERSION..."
fly releases rollback $VERSION -a $SERVICE

# Verify health
echo "🏥 Checking health..."
sleep 5
curl -f https://$SERVICE.fly.dev/health || echo "⚠️  Health check failed!"

echo ""
echo "✅ Rollback complete!"
echo "📝 Logs saved to: rollback-logs-$(date +%Y%m%d-%H%M).txt"
echo "🔍 Monitor closely for next 15 minutes"
```

Make it executable:
```bash
chmod +x scripts/emergency/quick-rollback.sh
```

---

## Common Issues & Solutions

### Issue: Rollback Fails

**Symptoms**: `fly releases rollback` command fails  
**Solution**:
```bash
# Try deploying previous image directly
fly deploy --image hotdash-agent-service:[previous-version-tag]

# Or deploy from git tag
git checkout [previous-tag]
fly deploy
```

### Issue: Database Won't Rollback

**Symptoms**: Migration rollback fails  
**Solution**:
```bash
# Restore from backup instead
supabase db restore [backup-id]

# Or manually fix with SQL
psql $DATABASE_URL -f manual-fix.sql
```

### Issue: Services Healthy But App Still Broken

**Symptoms**: Health checks pass but functionality fails  
**Solution**:
- Check environment variables: `fly secrets list`
- Check for dependency issues (external APIs)
- Review application logs for clues
- May need to rollback to earlier version

### Issue: Can't Access Fly.io

**Symptoms**: `fly` commands failing  
**Solution**:
```bash
# Re-authenticate
fly auth login

# Check status
fly status -a hotdash-agent-service

# Use web dashboard if CLI unavailable
# https://fly.io/dashboard
```

---

## Prevention Checklist

To avoid needing rollbacks:

- [ ] **Comprehensive testing before deploy**
  - Unit tests
  - Integration tests
  - E2E tests
  - Manual smoke tests

- [ ] **Gradual rollout**
  - Deploy to staging first
  - Test in staging for 24 hours
  - Deploy to production during low-traffic hours

- [ ] **Feature flags**
  - New features behind flags
  - Can disable without rollback
  - Gradual rollout to users

- [ ] **Monitoring**
  - Health checks in place
  - Alerts configured
  - Team monitoring during deploy

- [ ] **Rollback prep**
  - Rollback scripts ready
  - Team knows procedures
  - Regular rollback drills

---

## Related Documents

- **Launch Day Checklist**: `docs/LAUNCH_DAY_CHECKLIST.md`
- **Post-Launch Support**: `docs/POST_LAUNCH_SUPPORT_PLAN.md`
- **Monitoring Guide**: `docs/MONITORING_AND_ALERTING.md`
- **Incident Response**: `docs/INCIDENT_RESPONSE.md` (if exists)

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-12 | Initial version | Engineer Helper |

---

**IMPORTANT**: Keep this document updated after each incident and rollback. Review procedures quarterly.

