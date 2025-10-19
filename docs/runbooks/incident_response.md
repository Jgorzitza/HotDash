# Incident Response Runbook

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Structured incident response procedures

## Incident Severity Levels

### P0 - Critical (All hands)

- **Definition**: Production completely down, data loss, security breach
- **Response Time**: Immediate (<5 minutes)
- **Escalation**: Auto-escalate to CEO
- **Examples**: Database unavailable, application returning 500 errors, secrets exposed

### P1 - High (Urgent)

- **Definition**: Major feature broken, significant user impact, performance degraded
- **Response Time**: <15 minutes
- **Escalation**: DevOps → Manager
- **Examples**: Approvals drawer broken, dashboard tiles not loading, P95 >10s

### P2 - Medium (Important)

- **Definition**: Minor feature broken, limited user impact
- **Response Time**: <1 hour
- **Escalation**: DevOps handles
- **Examples**: Single tile failing, non-critical API endpoint error

### P3 - Low (Tracking)

- **Definition**: Cosmetic issues, no user impact
- **Response Time**: <24 hours
- **Escalation**: Create issue for backlog
- **Examples**: Typos, minor UI glitches, documentation errors

## Incident Response Process

### Phase 1: Detection & Triage (0-5 min)

**1.1 Detect**

- Alert fired (monitoring system)
- User report (support ticket)
- Internal discovery (team member)
- Automated check failure

**1.2 Acknowledge**

```bash
# Create incident tracking issue
gh issue create \
  --title "[INCIDENT P0] Production down" \
  --body "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)\nStatus: Investigating" \
  --label "incident,P0"
```

**1.3 Assess Severity**

- Check health endpoints
- Review error rates
- Estimate user impact
- Assign severity level

**1.4 Notify**

```bash
# Alert team (adapt to your notification system)
echo "🚨 P0 INCIDENT: Production down - All hands" | notify-team

# Update status page if available
```

### Phase 2: Investigation (5-15 min)

**2.1 Gather Data**

```bash
# Check application logs
fly logs -a hotdash-app --since=30m

# Check recent deployments
gh run list --limit 5

# Check database status
psql $DATABASE_URL -c "SELECT 1;" || echo "DB unreachable"

# Check workflow failures
gh run list --limit 10 --json conclusion,name
```

**2.2 Identify Root Cause**

- Recent changes (deploys, migrations, config)
- External dependencies (Supabase, Shopify, Fly.io status)
- Resource exhaustion (CPU, memory, disk, connections)
- Security incident (secrets exposed, DDoS)

**2.3 Document Findings**

```bash
# Update incident issue
gh issue comment <incident-number> --body "
Root cause: <description>
Evidence: <logs, metrics, commits>
Impact: <user count, duration>
Proposed fix: <solution>
"
```

### Phase 3: Mitigation (15-30 min)

**3.1 Apply Immediate Fix**

**Option A: Rollback**

```bash
# Rollback to last known good version
gh workflow run rollback-production

# Verify rollback successful
curl -f https://app.hotrodan.com/health
```

**Option B: Hotfix**

```bash
# Create hotfix branch
git checkout main
git pull
git checkout -b hotfix/incident-<number>

# Apply fix
# ... make changes ...

# Fast-track deploy
git commit -m "hotfix: <description> (Fixes #<incident>)"
git push origin hotfix/incident-<number>

# Create PR and merge immediately
gh pr create --title "HOTFIX: <description>" --body "Fixes #<incident>" --base main
gh pr merge --squash --delete-branch
```

**Option C: Configuration Change**

```bash
# Update environment variable
fly secrets set KEY=value -a hotdash-app

# Restart application
fly apps restart hotdash-app
```

**3.2 Verify Fix**

```bash
# Run smoke tests
npm run test:smoke

# Check health endpoints
curl -f https://app.hotrodan.com/health
curl -f https://app.hotrodan.com/api/health

# Monitor error rates
fly dashboard -a hotdash-app
```

### Phase 4: Recovery Verification (30-60 min)

**4.1 Monitor Metrics**

- Error rate returning to baseline (<0.1%)
- Response time P95 <3s
- No new errors in logs
- User reports decreasing

**4.2 Extended Monitoring**

- P0: Monitor for 2 hours post-fix
- P1: Monitor for 1 hour post-fix
- P2: Monitor for 30 min post-fix

**4.3 All Clear**

```bash
# Update incident issue
gh issue close <incident-number> --reason "completed" --comment "
Resolved: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Duration: XX minutes
Fix: <description>
Verified: All metrics normal
"
```

### Phase 5: Post-Incident Review (1-3 days)

**5.1 Create Post-Mortem** (`reports/incidents/YYYY-MM-DD-<title>.md`)

**Template**:

```markdown
# Incident Post-Mortem: <Title>

**Date**: YYYY-MM-DD  
**Severity**: P0/P1/P2  
**Duration**: XX minutes  
**User Impact**: <description>

## Timeline

- HH:MM: Incident detected
- HH:MM: Team notified
- HH:MM: Root cause identified
- HH:MM: Fix applied
- HH:MM: Verified resolved

## Root Cause

<Deep dive into what caused the incident>

## Contributing Factors

1. <Factor>
2. <Factor>

## Resolution

<How it was fixed>

## Prevention

- [ ] Action item 1
- [ ] Action item 2

## Lessons Learned

1. <Lesson>
2. <Lesson>
```

**5.2 Update Runbooks**

- Fix procedure gaps
- Add troubleshooting steps
- Update monitoring thresholds
- Improve alerts

**5.3 Implement Prevention**

- Add monitoring
- Improve tests
- Automate detection
- Update procedures

## Communication Templates

### Initial Alert (P0/P1)

```
🚨 INCIDENT: <Brief description>

Severity: P0/P1
Started: <timestamp>
Status: Investigating
Impact: <user impact>
ETA: <when fixed>

Updates: <link to status page/issue>
```

### Progress Update (Every 15 min for P0)

```
📢 UPDATE: <Brief status>

Time: <timestamp>
Progress: <what's been done>
Current status: <investigating/fixing/verifying>
Next: <next steps>
ETA: <updated estimate>
```

### Resolution (All clear)

```
✅ RESOLVED: <Brief description>

Resolved: <timestamp>
Duration: <total time>
Fix: <what was done>
Monitoring: <ongoing for X hours>

Post-mortem: <link>
```

## Escalation Matrix

| Severity | First Responder | Escalate To | Escalate If          |
| -------- | --------------- | ----------- | -------------------- |
| P0       | DevOps          | CEO         | Immediately          |
| P1       | DevOps          | Manager     | >15 min unresolved   |
| P2       | DevOps          | Manager     | >1 hour unresolved   |
| P3       | DevOps          | None        | Create backlog issue |

## Incident Checklist

**During Incident**:

- [ ] Severity assigned
- [ ] Incident issue created
- [ ] Team notified
- [ ] Status page updated (if available)
- [ ] Investigation started
- [ ] Root cause identified
- [ ] Fix applied
- [ ] Verification completed
- [ ] All-clear communicated

**Post-Incident**:

- [ ] Post-mortem created
- [ ] Action items assigned
- [ ] Runbooks updated
- [ ] Prevention implemented
- [ ] Team debriefed

## Tools & Access

**Required Access**:

- Fly.io dashboard (deploy, logs, metrics)
- Supabase dashboard (database, backups)
- GitHub (code, issues, workflows)
- Monitoring dashboard (when set up)

**Quick Links**:

- Fly.io: https://fly.io/dashboard
- Supabase: https://app.supabase.com
- GitHub: https://github.com/Jgorzitza/HotDash

## Related Documentation

- Production Deploy: `docs/runbooks/production_deploy.md`
- Backup/Recovery: `docs/runbooks/backup_recovery.md`
- Monitoring: `docs/runbooks/monitoring_setup.md`
- CI/CD Pipeline: `docs/runbooks/cicd_pipeline.md`
