# Production Deployment Log - YYYY-MM-DD

**Date**: YYYY-MM-DD  
**Time**: HH:MM UTC  
**Duration**: X minutes  
**Deployed by**: <Name>  
**Commit**: <sha>  
**PR**: #XXX

## Pre-Deploy Checklist

- [ ] All CI checks passing
- [ ] Tests passing (unit + integration)
- [ ] Staging deployment successful
- [ ] Database backup taken
- [ ] Rollback plan documented
- [ ] Team notified

## Changes Deployed

### Features
- Feature: <description>
- Feature: <description>

### Bug Fixes
- Fix: <description>
- Fix: <description>

### Infrastructure
- Infra: <description>

### Dependencies
- Updated: <package> from vX.Y.Z to vA.B.C

## Database Migrations

- Migration file: `supabase/migrations/YYYYMMDD_description.sql`
- Estimated time: X minutes
- Actual time: X minutes
- Status: Success / Failed / Rolled back
- Impact: <description of schema changes>

## Deployment Timeline

| Time | Event | Status |
|------|-------|--------|
| HH:MM | Pre-deploy backup | ✅ |
| HH:MM | Database migration started | ✅ |
| HH:MM | Database migration completed | ✅ |
| HH:MM | Application deploy started | ✅ |
| HH:MM | Health checks passing | ✅ |
| HH:MM | Smoke tests completed | ✅ |

## Rollback

**Required**: Yes / No  
**Reason**: <if yes, why>  
**Time**: <if yes, when>  
**Method**: <if yes, how>

## Verification Results

### Health Endpoints
- `/health`: ✅ 200 OK
- `/api/health`: ✅ 200 OK

### Smoke Tests
- Dashboard loads: ✅ Pass
- Approvals drawer: ✅ Pass
- API endpoints: ✅ Pass

### Metrics (T+30min)

| Metric | Baseline | Post-Deploy | Delta |
|--------|----------|-------------|-------|
| Error rate | 0.05% | 0.06% | +0.01% |
| P95 latency | 2.1s | 2.3s | +0.2s |
| Database connections | 45% | 47% | +2% |
| CPU usage | 35% | 38% | +3% |

## Issues Encountered

**None** / <List any issues>

### Issue 1: <Title>
- **Time**: HH:MM
- **Description**: <What happened>
- **Impact**: <User/system impact>
- **Resolution**: <How fixed>
- **Duration**: X minutes

## Post-Deploy Actions

- [ ] Monitoring for 1 hour completed
- [ ] No error spikes detected
- [ ] Performance metrics within targets
- [ ] Backup verified
- [ ] Deployment issue closed (#XXX)
- [ ] Team notified of completion

## Notes

<Any additional notes, learnings, or follow-up items>

## Sign-off

**Deployed by**: <Name>  
**Verified by**: <Name>  
**Approved by**: <Manager/CEO>  
**Completion time**: YYYY-MM-DD HH:MM UTC

