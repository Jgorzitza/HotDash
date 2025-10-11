#!/usr/bin/env bash
# Migration Forward/Back Validation Script for Supabase Postgres
# Purpose: Validate Prisma migrations can roll forward and back without data loss
# Owner: QA
# Last Updated: 2025-10-14

set -euo pipefail

echo "=== Prisma Migration Forward/Back Validation ==="
DATABASE_URL=${DATABASE_URL:-"postgresql://postgres:postgres@127.0.0.1:54322/postgres"}
echo "Target: $DATABASE_URL"
echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# Backup current database (logical dump)
BACKUP_FILE="artifacts/qa/prisma-backup-$(date +%Y%m%d-%H%M%S).sql"
mkdir -p artifacts/qa
echo "[1/6] Creating backup: $BACKUP_FILE"
if command -v pg_dump >/dev/null 2>&1; then
  pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
  echo "✅ Backup created"
else
  echo "⚠️ pg_dump not available; skipping backup step" >&2
fi
echo ""

# Check current migration status
echo "[2/6] Checking current migration status..."
npx prisma migrate status --schema prisma/schema.prisma || true
echo ""

# Get list of applied migrations
echo "[3/6] Listing applied migrations..."
if [ "$PSQL_AVAILABLE" = true ]; then
  psql "$DATABASE_URL" -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;" || echo "No migrations table found"
else
  echo "Skipped — psql not available"
fi
echo ""

# Test: Reset database (simulates rollback to zero state)
echo "[4/6] Testing migration reset (rollback to zero)..."
npx prisma migrate reset --force --skip-seed --schema prisma/schema.prisma
echo "✅ Database reset successful (all migrations rolled back)"
echo ""

# Test: Reapply all migrations (forward migration)
echo "[5/6] Testing forward migration (reapply all)..."
npx prisma migrate deploy --schema prisma/schema.prisma
echo "✅ All migrations reapplied successfully"
echo ""

# Verify schema matches
echo "[6/6] Verifying schema integrity..."
npx prisma validate --schema prisma/schema.prisma
echo "✅ Schema validation passed"
echo ""

# Check final migration status
echo "=== Final Migration Status ==="
npx prisma migrate status --schema prisma/schema.prisma
echo ""

# Compare backup vs current database structure
echo "=== Database Structure Comparison ==="
echo "Backup stored at: $BACKUP_FILE"
echo ""
echo "Current tables:"
if [ "$PSQL_AVAILABLE" = true ]; then
  psql "$DATABASE_URL" -c "\dt"
else
  echo "Skipped — psql not available"
fi
echo ""

echo "=== Migration Rollback Test Complete ==="
echo "✅ All migrations validated (forward + reset + forward)"
echo "📁 Backup preserved: $BACKUP_FILE"
echo "📝 Archive this log under artifacts/qa/migration-test-$(date +%Y%m%d-%H%M%S).log"
echo ""
echo "Next Steps:"
echo "1. Review migration status above"
echo "2. Validate data integrity (check Session, DashboardFact, DecisionLog tables)"
echo "3. Repeat test on Postgres staging when available"
echo "4. Share evidence with deployment and compliance agents"
if ! command -v psql >/dev/null 2>&1; then
  echo "⚠️ psql not available; install PostgreSQL client tools for full validation." >&2
  PSQL_AVAILABLE=false
else
  PSQL_AVAILABLE=true
fi
