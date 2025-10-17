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

**⚠️ IMPORTANT**: Use Supabase CLI for backups (not pg_dump directly) to avoid version mismatch issues.

```bash
# Set connection variables (for reference)
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Create backup directory
mkdir -p backups/$(date +%Y-%m-%d)

# Generate backup using Supabase CLI (RECOMMENDED)
npx supabase db dump -f "backups/$(date +%Y-%m-%d)/hotdash-backup-$(date +%H%M%S).sql" --local

# Verify backup file size and contents
ls -lh "backups/$(date +%Y-%m-%d)/"
head -n 30 "backups/$(date +%Y-%m-%d)/hotdash-backup-"*.sql

# Typical backup size: ~68KB (schema only, as of 2025-10-11)
```

**Note**: pg_dump has version compatibility issues (local v16 vs Supabase v17). Always use `npx supabase db dump --local` for consistency.

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
  -H "apikey: YOUR_SUPABASE_ANON_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"ping":"restore-test"}'

# Check REST API access
curl -sS "http://127.0.0.1:54321/rest/v1/decision_sync_events?limit=1" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY_HERE"
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

- **Date**: 2025-10-11 / 2025-10-12
- **Operator**: Reliability Agent
- **Results**: ✅ SUCCESS (backup procedure validated)
- **Issues Found**:
  - pg_dump version mismatch (v16 local vs v17 Supabase)
  - Resolution: Use `npx supabase db dump --local` instead
- **Backup Size**: 68KB (schema dump)
- **Backup Time**: < 5 seconds
- **Resolution Time**: < 5 minutes total (meets <15 min RTO)
- **Evidence**: feedback/reliability.md (2025-10-11 and 2025-10-12 entries)

## Current Credentials

**Local Supabase** (for development):

- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- API: http://127.0.0.1:54321
- Studio: http://127.0.0.1:54323
- Status: Verified operational 2025-10-12

**Vault Locations**:

- Supabase: vault/occ/supabase/ (production credentials)
- Fly: vault/occ/fly/ (deployment credentials)

**Note**: Credentials in vault are canonical. Never commit real credentials to git.
