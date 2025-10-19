# Deployment Windows Guide

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Optimal deployment timing based on traffic patterns

## Recommended Windows

### Best Times for Production Deploys

**Tuesday-Thursday, 10:00-14:00 EST**

**Why**:

- Mid-week (avoid Monday rush, Friday coverage gap)
- Business hours (team available)
- Allows 4+ hours monitoring before EOD
- Can rollback same day if needed

**Traffic Pattern**: Moderate, predictable

### Secondary Windows

**Monday 14:00-16:00 EST** (if necessary)

- After morning peak traffic
- Still allows same-day rollback
- Full team available

**Friday 09:00-11:00 AM EST** (emergency only)

- Early enough to monitor and fix
- Avoid after noon (weekend coverage limited)

## Windows to Avoid

### High Risk Times

**❌ Friday PM** (after 14:00 EST)

- Limited weekend coverage
- Harder to rollback
- Team may be unavailable

**❌ Monday AM** (before 10:00 EST)

- Highest traffic period
- Max user impact if issues
- Team ramping up

**❌ Major Holidays**

- Black Friday / Cyber Monday (absolute no-deploy)
- Thanksgiving week
- Christmas/New Year week
- Other major retail holidays

**❌ After Hours** (outside 09:00-17:00 EST)

- Unless emergency hotfix
- Requires explicit approval
- On-call engineer must be available

### Seasonal Considerations

**Q4 (Oct-Dec)**: High season

- Deploy only critical fixes
- Prefer Tuesday-Wednesday 10:00-12:00
- Freeze deployments week of major sales

**Q1 (Jan-Mar)**: Lower traffic

- Good time for major updates
- Can extend deploy windows
- Ideal for infrastructure upgrades

**Q2-Q3 (Apr-Sep)**: Normal season

- Standard deploy schedule
- Regular feature releases
- Normal windows apply

## Traffic Pattern Analysis

### Typical Weekly Pattern (EST)

**Monday**:

- 08:00-10:00: High traffic (weekend orders processing)
- 10:00-17:00: Moderate (steady business)
- 17:00-23:00: Low (evening shoppers)

**Tuesday-Thursday**:

- 09:00-17:00: Moderate, predictable
- Best deploy window: 10:00-14:00
- Lowest risk periods

**Friday**:

- 09:00-14:00: Moderate (weekend prep)
- 14:00-23:00: High (weekend shopping starts)
- Avoid deploys after 14:00

**Saturday-Sunday**:

- High traffic (peak shopping days)
- Emergency hotfixes only
- Requires CEO approval

### Daily Pattern

**Peak Hours** (avoid deploys):

- 08:00-10:00 EST (morning)
- 12:00-13:00 EST (lunch)
- 19:00-21:00 EST (evening)

**Low Traffic** (safe for deploys):

- 10:00-12:00 EST
- 14:00-16:00 EST
- 02:00-06:00 EST (off-hours, requires on-call)

## Deploy Schedule

### Standard Release Cadence

**Frequency**: 2-3x per week  
**Days**: Tuesday, Wednesday, Thursday  
**Time**: 11:00 EST

**Example Schedule**:

- Tuesday 11:00: Hotfixes + small features
- Wednesday 11:00: Major features (if tested in staging)
- Thursday 11:00: Final fixes before weekend

### Emergency Deploys

**Criteria**:

- P0 security vulnerability
- Critical bug affecting >10% users
- Data integrity issue
- Service outage fix

**Process**:

- Get manager/CEO approval
- Deploy regardless of window
- Extended monitoring (2-4 hours)
- Document in incident report

## Pre-Deploy Communication

### 48 Hours Before (Major Releases)

**Send to**:

- Team (Slack/email)
- Stakeholders

**Template**:

```
📢 Upcoming Production Deploy

Date: Tuesday, Oct 22, 2025
Time: 11:00 EST (16:00 UTC)
Duration: ~20 minutes
Downtime: None expected

Changes:
- Feature: <description>
- Fix: <description>

Changelog: <link>
Pre-deploy checklist: <link>
```

### 1 Hour Before

**Send to**: Team

**Template**:

```
⏰ Deploy starting in 1 hour

Time: 11:00 EST
Status: Pre-checks in progress
Ready: Yes / No

Monitor: <dashboard link>
Rollback plan: <runbook link>
```

### During Deploy

**Status updates every 15 minutes**:

```
🚀 Deploy in progress (15/30 min)

Current step: Running database migrations
Status: On track
Issues: None

Next: Deploy application
ETA: 11:15 EST
```

### Post-Deploy

**Immediately after**:

```
✅ Deploy complete

Completed: 11:22 EST
Duration: 22 minutes
Status: Successful
Monitoring: Active (next 2 hours)

All systems normal
No action required
```

## Deployment Blackout Periods

### Absolute No-Deploy

| Period                  | Reason                    | Alternatives      |
| ----------------------- | ------------------------- | ----------------- |
| Black Friday (24 hours) | Peak traffic              | Freeze 72h before |
| Cyber Monday (24 hours) | Peak traffic              | Freeze 48h before |
| Dec 20 - Jan 2          | Holiday season + coverage | Emergency only    |

### Restricted Deploys (Approval Required)

| Period                   | Restrictions              |
| ------------------------ | ------------------------- |
| Any Friday after 14:00   | Manager approval required |
| Weekends                 | CEO approval required     |
| After 17:00 EST weekdays | On-call engineer required |
| Within 24h of major sale | Hotfixes only             |

## Post-Deploy Monitoring Windows

### Monitoring Duration by Type

| Deploy Type           | Monitoring Duration         |
| --------------------- | --------------------------- |
| Standard feature      | 1 hour active monitoring    |
| Database migration    | 2 hours active monitoring   |
| Infrastructure change | 4 hours active monitoring   |
| Major release         | 24 hours passive monitoring |
| Hotfix                | 2 hours active monitoring   |

**Active monitoring**: DevOps watching dashboards  
**Passive monitoring**: Automated alerts only

## Rollback Decision Matrix

| Condition                  | Action                       | Timeframe   |
| -------------------------- | ---------------------------- | ----------- |
| Error rate >5%             | Immediate rollback           | <5 minutes  |
| P95 latency >10s           | Immediate rollback           | <5 minutes  |
| Database errors >1%        | Immediate rollback           | <10 minutes |
| Feature bug (non-critical) | Fix forward or rollback      | <30 minutes |
| Performance degradation    | Monitor, rollback if worsens | <1 hour     |

## Related Documentation

- Production Deploy: `docs/runbooks/production_deploy.md`
- Incident Response: `docs/runbooks/incident_response.md`
- SLA Definitions: `docs/runbooks/sla_definitions.md`
