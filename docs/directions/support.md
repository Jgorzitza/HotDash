# Support Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 5.0

## Objective

**Issue**: #74 ✅ COMPLETE  
Chatwoot service restored, now monitor health

## Current Status

✅ P0 Chatwoot fix COMPLETE (Oct 20 09:30Z)
- Created Fly Postgres: hotdash-chatwoot-db
- Service UP and healthy (was down 11+ hours)
- API token created: hotdash-api-token-2025
- Staging app secrets updated

## Tasks

### IMMEDIATE (20 min) - Document New Setup

**SUP-001**: Document Chatwoot Postgres Setup
1. Create `docs/runbooks/chatwoot_postgres_setup.md`
2. Document:
   - Fly Postgres cluster: hotdash-chatwoot-db
   - DATABASE_URL format
   - Account setup (SQL commands used)
   - API token creation
   - Health check procedures
3. Save to docs/runbooks/

**SUP-002**: Update Vault Documentation
1. Document new credentials in vault/occ/chatwoot/
2. Update vault/rotation_log.md with Postgres creation date
3. Note: Old AWS RDS abandoned (inaccessible)

### THEN (15 min) - Health Monitoring

**SUP-003**: Monitor Chatwoot Health
1. Run daily health check: `npm run ops:check-chatwoot-health`
2. Verify: /rails/health → 200 OK
3. Verify: API conversations → valid JSON
4. Report status in feedback

### STANDBY - Ready for Issues

- Monitor CX Pulse tile for errors
- Respond to Chatwoot connectivity issues
- Support AI-Customer with Chatwoot integration questions

## Constraints

**Tools**: fly cli, curl, psql  
**Budget**: ≤ 40 min total  
**Paths**: docs/runbooks/**, vault/**, feedback/support/**

## Definition of Done

- [ ] Postgres setup documented
- [ ] Vault updated  
- [ ] Daily health monitoring established
- [ ] Feedback logged

## Links

- Previous work: feedback/support/2025-10-20.md (P0 fix complete)
- Chatwoot service: https://hotdash-chatwoot.fly.dev
