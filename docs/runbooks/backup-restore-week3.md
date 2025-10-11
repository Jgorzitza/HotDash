# Week 3 Backup/Restore Runbook

## Overview
This runbook covers backup and restore procedures for HotDash infrastructure during Week 3 operations.

## Prerequisites
- Access to vault credentials: `vault/occ/supabase/`, `vault/occ/fly/`
- Local Supabase CLI installed and configured
- psql client available
- Database credentials exported

## Backup Procedures

### 1. Supabase Database Backup
```bash
# Set connection variables
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Create backup directory
mkdir -p backups/$(date +%Y-%m-%d)

# Generate backup
pg_dump "$DATABASE_URL" > "backups/$(date +%Y-%m-%d)/hotdash-backup-$(date +%H%M%S).sql"

# Verify backup file size and contents
ls -lh "backups/$(date +%Y-%m-%d)/"
head -n 20 "backups/$(date +%Y-%m-%d)/hotdash-backup-$(date +%H%M%S).sql"
```

### 2. Configuration Backup
```bash
# Backup critical config files
tar -czf "backups/$(date +%Y-%m-%d)/config-backup-$(date +%H%M%S).tar.gz" \
  fly.toml \
  supabase/config.toml \
  .env.example \
  .env.staging.example \
  package.json \
  prisma/schema.prisma
```

## Restore Procedures

### 1. Database Restore to Local Supabase
```bash
# Ensure Supabase is running
supabase start

# Set connection variables  
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Verify connection
psql "$DATABASE_URL" -c "SELECT current_database(), current_user;"

# Restore from backup (adjust path as needed)
# For SQL dump:
psql "$DATABASE_URL" < backups/YYYY-MM-DD/hotdash-backup-HHMMSS.sql

# For pg_dump format:
# pg_restore --no-owner --no-privileges --clean --if-exists -d "$DATABASE_URL" backups/YYYY-MM-DD/backup.dump
```

### 2. Post-Restore Verification
```bash
# Check database connectivity and basic tables
psql "$DATABASE_URL" -c "SELECT now(), version();"

# Verify key tables exist
psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1 LIMIT 25;"

# Check decision_sync_events view
psql "$DATABASE_URL" -c "SELECT count(*) FROM public.decision_sync_events;"

# Test application connectivity
npm run setup
```

### 3. Service Health Verification
```bash
# Check Supabase services
supabase status

# Verify edge functions
curl -sS "http://127.0.0.1:54321/functions/v1/occ-log" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Content-Type: application/json" \
  -d '{"ping":"restore-test"}'

# Check REST API access
curl -sS "http://127.0.0.1:54321/rest/v1/decision_sync_events?limit=1" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
```

## Recovery Time Objectives (RTO)
- Database restore: < 15 minutes for local environment
- Configuration restore: < 5 minutes
- Full service verification: < 10 minutes
- Total RTO: < 30 minutes

## Recovery Point Objectives (RPO)
- Database: 1 hour (hourly backups)
- Configuration: 24 hours (daily backups)

## Escalation
If restore fails after 2 attempts:
1. Document exact error messages and commands used
2. Escalate to manager with evidence
3. Consider alternative restore methods or rollback procedures

## Evidence Requirements
- Capture all command outputs with timestamps
- Document any deviations from procedure
- Log restore times and verification results
- Redact sensitive values in documentation

## Last Tested
- Date: TBD
- Operator: TBD  
- Results: TBD
- Issues Found: TBD
- Resolution Time: TBD