# Support Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 4.1

## Objective

**Issue**: #74

**P0 URGENT**: Fix CX Pulse Chatwoot error

## CLARIFICATION: Chatwoot vs HotDash Databases

**HotDash Database**: Supabase (aws-1-us-east-1.pooler.supabase.com) ✅ Working
**Chatwoot Database**: Chatwoot's own PostgreSQL (18.213.155.45 - their managed service) ❌ Auth failing

**The error is with Chatwoot's database, NOT HotDash's.**

## Current Status

**Error**: Chatwoot service (hotdash-chatwoot.fly.dev) cannot connect to ITS database
**Impact**: CX Pulse tile shows "Unable to fetch Chatwoot conversations"
**Service Status**: HTTP 503 for 11+ hours

## Tasks

### P0 (30 min) - Fix Chatwoot Fly App

1. **Check Chatwoot Fly Secrets**:
   ```bash
   fly secrets list -a hotdash-chatwoot
   ```
   Look for: DATABASE_URL, POSTGRES_PASSWORD, POSTGRES_URL

2. **Check Vault for Chatwoot DB Credentials**:
   ```bash
   ls vault/occ/chatwoot/
   # OR
   ls vault/
   ```
   Find Chatwoot database credentials if they exist

3. **If credentials found**: Update Fly secrets
   ```bash
   fly secrets set DATABASE_URL="$(cat vault/occ/chatwoot/database_url.env)" -a hotdash-chatwoot
   ```

4. **If credentials NOT in vault**: 
   - Check if Chatwoot was set up with managed database (their cloud service)
   - Check Chatwoot dashboard/admin for database connection string
   - Escalate to CEO if you cannot find credentials

5. **Restart Chatwoot**:
   ```bash
   fly machine restart <machine-id> -a hotdash-chatwoot
   ```

6. **Verify Fixed**:
   ```bash
   curl https://hotdash-chatwoot.fly.dev/rails/health
   # Expected: 200 OK
   ```

7. **Test CX Pulse**: Verify tile loads in production app

8. Write feedback to `feedback/support/2025-10-20.md`

## YOU CAN FIX THIS

**You have**:
- ✅ Fly CLI access (fly secrets, fly machine commands)
- ✅ Vault access (vault/ directory)
- ✅ Ability to restart Chatwoot service

**You do NOT need**:
- ❌ AWS console access (Chatwoot manages their own database)
- ❌ Direct PostgreSQL access (fix via Fly secrets)

**The fix is**: Update DATABASE_URL in Fly secrets for hotdash-chatwoot app, then restart.

## Constraints

- **Allowed Tools:** bash, fly cli, curl
- **Touched Directories:** `vault/**`, `docs/runbooks/**`, `feedback/support/**`
- **Budget:** ≤ 30 min

## Definition of Done

- [ ] Chatwoot service healthy (rails/health → 200 OK)
- [ ] CX Pulse tile loads data
- [ ] Feedback logged

## Links

- Runbook: `docs/runbooks/support_chatwoot_health.md`
- Feedback: `feedback/support/2025-10-19.md`

## Change Log

- 2025-10-20: Version 4.1 – Clarified Chatwoot vs HotDash databases
- 2025-10-20: Version 4.0 – P0 Chatwoot fix
