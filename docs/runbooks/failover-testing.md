---
epoch: 2025.10.E1
doc: docs/runbooks/failover-testing.md
owner: deployment
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Failover Testing Procedures

**Owner**: Deployment Agent  
**Last Updated**: 2025-10-14  
**Purpose**: Validate disaster recovery and high availability capabilities

---

## Overview

Failover testing ensures our infrastructure can handle failures gracefully and recover quickly. These procedures should be executed quarterly or after significant infrastructure changes.

### Testing Principles

1. **Test in Staging First**: Never test failover in production without staging validation
2. **Document Everything**: Record all steps, timings, and observations
3. **Have Rollback Ready**: Prepare rollback procedures before starting
4. **Communicate**: Notify team before and after tests
5. **Automate**: Convert manual tests to automated checks where possible

---

## Test Scenarios

### 1. Single Machine Failure (Staging)

**Objective**: Verify application continues serving traffic when one machine fails

**Prerequisites**:
- hotdash-staging must have 2+ machines
- Health checks configured
- Auto-restart enabled

**Procedure**:

```bash
# 1. Verify current state
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
~/.fly/bin/fly machine list -a hotdash-staging

# Note: Record machine IDs
MACHINE_1="<first-machine-id>"
MACHINE_2="<second-machine-id>"

# 2. Test baseline health
curl -f https://hotdash-staging.fly.dev/health
# Expected: HTTP 200

# 3. Stop one machine
~/.fly/bin/fly machine stop $MACHINE_1 -a hotdash-staging

# 4. Verify service still accessible
for i in {1..10}; do
  curl -f https://hotdash-staging.fly.dev/health && echo "✅ Attempt $i: OK" || echo "❌ Attempt $i: FAILED"
  sleep 2
done

# 5. Restart failed machine
~/.fly/bin/fly machine start $MACHINE_1 -a hotdash-staging

# 6. Verify both machines running
~/.fly/bin/fly machine list -a hotdash-staging

# 7. Verify service health
curl -f https://hotdash-staging.fly.dev/health
```

**Expected Results**:
- Service remains accessible during single machine failure
- Requests route to healthy machine
- Failed machine restarts successfully
- No data loss or corruption

**Recovery Time Objective (RTO)**: < 30 seconds
**Recovery Point Objective (RPO)**: Zero (no data loss)

---

### 2. Database Failover (Supabase)

**Objective**: Verify application handles database connection failures

**Prerequisites**:
- Supabase connection configured
- Connection pooling enabled
- Retry logic in application

**Procedure**:

```bash
# 1. Verify baseline database connectivity
curl -f https://hotdash-staging.fly.dev/api/health
# Expected: Database connection OK

# 2. Simulate database unavailability
# Option A: Temporarily remove DATABASE_URL secret
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
~/.fly/bin/fly secrets unset DATABASE_URL -a hotdash-staging

# 3. Monitor application behavior
~/.fly/bin/fly logs -a hotdash-staging | grep -i "database\|error"

# 4. Verify error handling
curl -f https://hotdash-staging.fly.dev/api/health
# Expected: Graceful degradation (503 or error message)

# 5. Restore database connection
source ~/HotDash/hot-dash/vault/occ/supabase/database_url_staging.env
~/.fly/bin/fly secrets set DATABASE_URL="$DATABASE_URL" -a hotdash-staging

# 6. Wait for restart (auto-triggered by secret change)
sleep 30

# 7. Verify recovery
curl -f https://hotdash-staging.fly.dev/api/health
# Expected: HTTP 200, database connected
```

**Expected Results**:
- Application handles database unavailability gracefully
- Error messages are user-friendly
- Automatic reconnection on database restore
- No permanent data loss

**RTO**: < 2 minutes (after database restored)
**RPO**: Potential loss of in-flight transactions only

---

### 3. Region Failure Simulation

**Objective**: Verify multi-region failover (if configured)

**Current Status**: Single region deployment (ord)  
**Future Enhancement**: Multi-region when needed

**Procedure (When Multi-Region)**:

```bash
# 1. Deploy to multiple regions
~/.fly/bin/fly regions add iad -a hotdash-staging
~/.fly/bin/fly scale count 2 -a hotdash-staging

# 2. Verify machines in both regions
~/.fly/bin/fly machine list -a hotdash-staging | grep -E "ord|iad"

# 3. Stop all machines in primary region (ord)
for machine in $(fly machine list -a hotdash-staging | grep "ord" | awk '{print $1}'); do
  ~/.fly/bin/fly machine stop $machine -a hotdash-staging
done

# 4. Verify failover to secondary region
curl -f https://hotdash-staging.fly.dev/health
# Traffic should route to iad machines

# 5. Restore primary region
for machine in $(fly machine list -a hotdash-staging | grep "ord" | awk '{print $1}'); do
  ~/.fly/bin/fly machine start $machine -a hotdash-staging
done
```

**Expected Results**:
- Automatic failover to secondary region
- No user-visible downtime
- Automatic recovery when primary restored

**RTO**: < 1 minute
**RPO**: Zero (no data loss)

---

### 4. Deployment Rollback

**Objective**: Verify auto-rollback on failed deployment

**Prerequisites**:
- Automated health checks configured
- Auto-rollback workflow enabled

**Procedure**:

```bash
# 1. Note current deployment version
~/.fly/bin/fly status -a hotdash-staging | grep "Image"
CURRENT_VERSION="<note version>"

# 2. Deploy intentionally broken version
# Create a test deployment that will fail health checks
cat > test-broken-deployment.sh << 'EOF'
#!/bin/bash
# This would be part of CI/CD pipeline
# For testing: deploy version that fails health check
EOF

# 3. Trigger deployment via GitHub Actions
gh workflow run deploy-staging.yml

# 4. Monitor deployment
gh run watch

# 5. Verify auto-rollback triggered
# Check GitHub Issues for rollback alert
gh issue list --label "rollback,automated"

# 6. Verify service restored to previous version
~/.fly/bin/fly status -a hotdash-staging | grep "Image"
# Should match $CURRENT_VERSION
```

**Expected Results**:
- Failed health check detected
- Auto-rollback workflow triggered automatically
- Service restored to previous working version
- GitHub issue created with failure details

**RTO**: 2-3 minutes (auto-rollback)
**RPO**: Zero (code rollback only)

---

### 5. Secret Rotation Failover

**Objective**: Verify application handles secret rotation without downtime

**Prerequisites**:
- Secrets stored in vault
- Fly secrets configured
- Zero-downtime secret update procedure

**Procedure**:

```bash
# 1. Verify current secret works
curl -f https://hotdash-staging.fly.dev/health

# 2. Generate new secret (example: DATABASE_URL)
# Note: This should use actual Supabase rotation in prod
NEW_SECRET="<new-database-url>"

# 3. Update Fly secret
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
~/.fly/bin/fly secrets set DATABASE_URL="$NEW_SECRET" -a hotdash-staging

# 4. Monitor restart (auto-triggered)
~/.fly/bin/fly status -a hotdash-staging --watch

# 5. Verify no downtime during rotation
while ~/.fly/bin/fly status -a hotdash-staging | grep -q "starting\|restarting"; do
  curl -f https://hotdash-staging.fly.dev/health && echo "✅ Still accessible" || echo "❌ Service down"
  sleep 2
done

# 6. Verify new secret works
curl -f https://hotdash-staging.fly.dev/health
```

**Expected Results**:
- Service accessible during secret rotation
- Rolling restart maintains availability
- New secret works correctly
- No authentication errors

**RTO**: N/A (zero downtime)
**RPO**: N/A (no data impact)

---

## Chaos Engineering (Advanced)

### Random Pod Killer (Future)

**Tool**: Chaos Mesh or custom script  
**Frequency**: Weekly in staging  
**Objective**: Build confidence in auto-healing

```bash
# Random machine killer script
#!/bin/bash
MACHINES=$(fly machine list -a hotdash-staging | grep "started" | awk '{print $1}')
RANDOM_MACHINE=$(echo "$MACHINES" | shuf | head -1)

echo "Killing random machine: $RANDOM_MACHINE"
fly machine stop $RANDOM_MACHINE -a hotdash-staging

# Auto-restart should happen
sleep 30
fly machine start $RANDOM_MACHINE -a hotdash-staging
```

---

## Test Schedule

### Quarterly Tests (Full Suite)

- [ ] Q1: All 5 test scenarios
- [ ] Q2: All 5 test scenarios
- [ ] Q3: All 5 test scenarios
- [ ] Q4: All 5 test scenarios + chaos engineering

### Monthly Tests (Critical Path)

- [ ] Single machine failure
- [ ] Deployment rollback

### Weekly Tests (Automated)

- [ ] Health check validation
- [ ] Auto-restart verification
- [ ] Monitoring alert test

---

## Documentation Requirements

### For Each Test:

1. **Pre-Test State**:
   - Current version/configuration
   - Number of machines
   - Resource utilization

2. **Test Execution**:
   - All commands with timestamps
   - Observed behavior
   - Any errors or warnings

3. **Results**:
   - RTO achieved (vs target)
   - RPO achieved (vs target)
   - Service availability %
   - Issues discovered

4. **Post-Test Actions**:
   - Changes implemented
   - Runbook updates
   - Lessons learned

### Storage:

- Test reports: `artifacts/failover-tests/YYYY-MM-DD-<test-name>.md`
- Logs: `artifacts/failover-tests/logs/`
- Screenshots: `artifacts/failover-tests/screenshots/`

---

## Rollback Procedures

### If Test Causes Issues:

```bash
# 1. Stop test immediately
# Press Ctrl+C or kill test process

# 2. Restore all machines to running state
for machine in $(fly machine list -a hotdash-staging | grep "stopped" | awk '{print $1}'); do
  fly machine start $machine -a hotdash-staging
done

# 3. Verify all secrets present
fly secrets list -a hotdash-staging
# If any missing, restore from vault

# 4. Trigger redeploy if needed
gh workflow run deploy-staging.yml

# 5. Verify service health
curl -f https://hotdash-staging.fly.dev/health
bash scripts/deploy/automated-smoke-test.sh
```

---

## Success Criteria

### Test Passes If:

- ✅ Service meets RTO target
- ✅ Service meets RPO target
- ✅ No manual intervention required
- ✅ Alerts triggered correctly
- ✅ Documentation complete

### Test Fails If:

- ❌ RTO exceeded by > 20%
- ❌ Data loss beyond RPO
- ❌ Manual intervention required
- ❌ Alerts not triggered
- ❌ Unexpected errors

---

## Continuous Improvement

After each test:

1. **Update Runbooks**: Incorporate lessons learned
2. **Automate**: Convert manual steps to scripts/CI
3. **Tune RTO/RPO**: Adjust targets based on findings
4. **Improve Monitoring**: Add alerts for gaps discovered
5. **Train Team**: Share results in team meetings

---

## References

- Infrastructure Operations: `docs/runbooks/infrastructure_operations.md`
- Backup & Restore: `docs/runbooks/backup-restore-week3.md`
- Incident Response: `docs/runbooks/incident_response_security.md`
- Deployment Direction: `docs/directions/deployment.md`

---

**Next Review**: 2025-10-21  
**Test Frequency**: Quarterly (full suite), Monthly (critical path), Weekly (automated)

