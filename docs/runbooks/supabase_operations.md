# Supabase Operations Guide

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Common Supabase database operations

## Database Connection

### Connection String Format

```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### Connect via psql

```bash
# Using DATABASE_URL
psql $DATABASE_URL

# Direct connection
psql "postgresql://user:pass@db.supabase.co:5432/postgres"
```

### Connect via Supabase CLI

```bash
# Link to project (one-time)
supabase link --project-ref <project-id>

# Connect
supabase db remote --db-url $DATABASE_URL
```

## Migrations

### List Migrations

```bash
supabase db list-migrations
```

### Create New Migration

```bash
supabase migration new <migration_name>

# Example
supabase migration new add_user_preferences
```

### Apply Migrations

**To local**:

```bash
supabase db push
```

**To remote** (staging/production):

```bash
# Staging
supabase db push --db-url $STAGING_DB_URL

# Production (use with caution)
supabase db push --db-url $PRODUCTION_DB_URL
```

### Generate Migration from Schema Diff

```bash
# Compare local with remote
supabase db diff

# Generate migration file
supabase db diff --schema public > supabase/migrations/new_changes.sql
```

## Table Operations

### List Tables

```bash
psql $DATABASE_URL -c "\dt"

# Or via MCP (once credentials provisioned)
mcp_supabase_list_tables(schemas=["public"])
```

### Describe Table

```bash
psql $DATABASE_URL -c "\d+ users"
```

### Query Table

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

## RLS (Row Level Security)

### View RLS Policies

```bash
psql $DATABASE_URL -c "SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';"
```

### Test RLS Policy

```bash
# Set role
psql $DATABASE_URL -c "SET ROLE authenticated;"

# Run query as that role
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 5;"

# Reset role
psql $DATABASE_URL -c "RESET ROLE;"
```

### Run RLS Test Suite

```bash
# If RLS test file exists
psql $DATABASE_URL < supabase/rls_tests.sql
```

## Backups

### Manual Backup

```bash
# Full database
pg_dump $DATABASE_URL > backups/db-$(date +%Y%m%d).sql

# Specific table
pg_dump -t users $DATABASE_URL > backups/users-$(date +%Y%m%d).sql

# Compressed
pg_dump $DATABASE_URL | gzip > backups/db-$(date +%Y%m%d).sql.gz
```

### Restore Backup

```bash
# Full restore (caution: drops existing data)
psql $DATABASE_URL < backups/db-20251019.sql

# Table restore
psql $DATABASE_URL < backups/users-20251019.sql
```

### Point-in-Time Recovery (PITR)

**Available**: Supabase Pro tier only  
**Method**: Via Supabase Dashboard

1. Settings → Database → Restore
2. Select timestamp
3. Confirm restore

## Performance

### View Slow Queries

```bash
psql $DATABASE_URL -c "SELECT
  calls,
  mean_exec_time,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;"
```

### View Active Connections

```bash
psql $DATABASE_URL -c "SELECT
  COUNT(*) as connections,
  state,
  wait_event_type
FROM pg_stat_activity
GROUP BY state, wait_event_type;"
```

### Kill Long-Running Query

```bash
# Find query PID
psql $DATABASE_URL -c "SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;"

# Kill query
psql $DATABASE_URL -c "SELECT pg_terminate_backend(<pid>);"
```

## Extensions

### List Installed Extensions

```bash
psql $DATABASE_URL -c "SELECT extname, extversion FROM pg_extension;"

# Or via MCP
mcp_supabase_list_extensions()
```

### Enable Extension

```bash
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS <extension_name>;"

# Example: Enable pg_stat_statements
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
```

## Storage

### List Buckets

```bash
# Via Supabase Dashboard
# Storage → Buckets

# Or via SQL
psql $DATABASE_URL -c "SELECT * FROM storage.buckets;"
```

### Set Bucket Policy

```sql
-- Allow public read
INSERT INTO storage.objects (bucket_id, name, owner)
SELECT 'public-bucket', 'example.jpg', auth.uid();
```

## Edge Functions

### List Functions

```bash
# Via MCP (once credentials provisioned)
mcp_supabase_list_edge_functions()

# Via Dashboard
# Edge Functions → View all
```

### Deploy Function

```bash
supabase functions deploy <function-name>

# Example
supabase functions deploy send-welcome-email
```

### View Function Logs

```bash
supabase functions logs <function-name>
```

## Troubleshooting

### Connection Issues

**Error**: `connection refused`  
**Cause**: Database paused (free tier) or network issue  
**Fix**:

```bash
# Wake up database (make any query)
psql $DATABASE_URL -c "SELECT 1;"
```

### Migration Failures

**Error**: Migration fails to apply  
**Cause**: Conflicting changes, syntax error  
**Fix**:

```bash
# View migration status
supabase db list-migrations

# Manually rollback
psql $DATABASE_URL -c "DELETE FROM supabase_migrations.schema_migrations WHERE version = '<version>';"

# Fix migration file, re-apply
supabase db push
```

### RLS Policy Blocking Queries

**Error**: `new row violates row-level security policy`  
**Cause**: RLS policy too restrictive  
**Debug**:

```bash
# Disable RLS temporarily (testing only!)
psql $DATABASE_URL -c "ALTER TABLE users DISABLE ROW LEVEL SECURITY;"

# Test query
# ... run query ...

# Re-enable RLS
psql $DATABASE_URL -c "ALTER TABLE users ENABLE ROW LEVEL SECURITY;"
```

## Best Practices

### DO ✅

- Test migrations in staging first
- Create backups before major changes
- Use RLS policies for all tables
- Monitor connection pool usage
- Use indexes for frequently queried columns
- Batch large data operations

### DON'T ❌

- Apply untested migrations to production
- Disable RLS in production
- Store secrets in database (use environment variables)
- Run large queries during business hours
- Delete data without backup

## Monitoring

### Key Metrics

```bash
# Database size
psql $DATABASE_URL -c "SELECT
  pg_size_pretty(pg_database_size(current_database())) as db_size;"

# Table sizes
psql $DATABASE_URL -c "SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Connection count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_stat_activity;"
```

## Related Documentation

- Backup/Recovery: `docs/runbooks/backup_recovery.md`
- MCP Setup: `docs/runbooks/mcp_setup.md`
- Production Deploy: `docs/runbooks/production_deploy.md`
- Supabase Docs: https://supabase.com/docs
