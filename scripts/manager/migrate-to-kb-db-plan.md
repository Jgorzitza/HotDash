# Migration Plan: Task/Feedback System to KB Database

## Objective
Move all development/agent coordination data to KB database, keeping production database clean.

## Tables to Migrate
1. `DecisionLog` - Agent decisions and task tracking
2. `TaskAssignment` - Task assignments to agents

## Safety Checks
- ✅ Verify KB DB connection works
- ✅ Check existing KB DB schema
- ✅ Backup production data before any changes
- ✅ Create tables in KB DB first
- ✅ Migrate data with verification
- ✅ Update application code to use KB DB for these tables
- ✅ Verify production DB untouched

## Steps

### 1. Verify KB DB Connection
- Load credentials from vault/dev-kb/supabase.env
- Test connection
- Check existing tables

### 2. Create Schema in KB DB
- Add DecisionLog model to KB schema
- Add TaskAssignment model to KB schema
- Generate Prisma client for KB DB

### 3. Migrate Existing Data (READ-ONLY)
- Export data from production DecisionLog
- Export data from production TaskAssignment
- Import to KB DB (verify counts match)

### 4. Update Application Code
- Point decisions.server.ts to KB DB client
- Point tasks.server.ts to KB DB client
- Keep all other services pointing to production DB

### 5. Verification
- Test task assignment works
- Test decision logging works
- Verify production DB unchanged
- Verify KB DB has all data

## Rollback Plan
If anything goes wrong:
1. Revert code changes (git checkout)
2. Data is safe (we only READ from production, never DELETE)
3. KB DB can be dropped and recreated if needed

## What Stays in Production DB
- All Shopify data
- All customer data
- All business logic tables
- Security audit_log table
- Everything except DecisionLog and TaskAssignment

