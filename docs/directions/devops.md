# DevOps Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 5.0

## Objective

**Issue**: #107  
Apply Data migrations + support Option A deployments

## Current Status

Migration verification ✅ complete (5 migrations verified, 352 lines SQL)

## Tasks

### MANAGER WILL HANDLE MIGRATIONS

Manager will apply migrations directly. Your task:

**DEVOPS-001**: Monitor Deployment Health (15 min)
1. After Manager applies migrations:
2. Verify Fly app health: `fly status -a hotdash-staging`
3. Check logs: `fly logs -a hotdash-staging | grep -i error | tail -20`
4. Verify /health endpoint: `curl https://hotdash-staging.fly.dev/health`
5. Report: Any errors or all healthy

### THEN - Support Option A Deployments

**DEVOPS-002**: Monitor Builds as Engineer Completes Phases
- Watch for build failures
- Check deployment success
- Verify health checks passing
- Report issues immediately

**DEVOPS-003**: Infrastructure Monitoring
- Fly machine health
- Postgres database health
- Application logs
- Performance metrics

## Migrations Ready

Data created 5 migrations (all verified):
- 20251020210000_user_preferences.sql (90 lines)
- 20251020211500_notifications.sql (116 lines)
- 20251020213000_approvals_history.sql (46 lines)
- 20251020214500_sales_pulse_actions.sql (48 lines)
- 20251020215000_inventory_actions.sql (52 lines)

**Total**: 6 new tables, all with RLS

## Constraints

**Tools**: fly cli, curl  
**Budget**: ≤ 30 min  
**Paths**: feedback/devops/**, reports/devops/**

## Links

- Previous work: feedback/devops/2025-10-20.md (verification complete)
- Data migrations: supabase/migrations/202510202*

## Definition of Done

- [ ] Deployment health monitored after migrations
- [ ] All checks passing
- [ ] Issues reported immediately
