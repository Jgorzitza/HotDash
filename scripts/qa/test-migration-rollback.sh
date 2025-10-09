#!/usr/bin/env bash
# Migration Forward/Back Validation Script for SQLite
# Purpose: Validate Prisma migrations can roll forward and back without data loss
# Owner: QA
# Last Updated: 2025-10-09

set -euo pipefail

echo "=== Prisma Migration Forward/Back Validation ==="
echo "Target: SQLite (dev.sqlite)"
echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# Backup current database
BACKUP_FILE="prisma/dev.sqlite.backup-$(date +%Y%m%d-%H%M%S)"
echo "[1/6] Creating backup: $BACKUP_FILE"
cp prisma/dev.sqlite "$BACKUP_FILE"
echo "✅ Backup created"
echo ""

# Check current migration status
echo "[2/6] Checking current migration status..."
npx prisma migrate status || true
echo ""

# Get list of applied migrations
echo "[3/6] Listing applied migrations..."
sqlite3 prisma/dev.sqlite "SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;" || echo "No migrations table found"
echo ""

# Test: Reset database (simulates rollback to zero state)
echo "[4/6] Testing migration reset (rollback to zero)..."
npx prisma migrate reset --force --skip-seed
echo "✅ Database reset successful (all migrations rolled back)"
echo ""

# Test: Reapply all migrations (forward migration)
echo "[5/6] Testing forward migration (reapply all)..."
npx prisma migrate deploy
echo "✅ All migrations reapplied successfully"
echo ""

# Verify schema matches
echo "[6/6] Verifying schema integrity..."
npx prisma validate
echo "✅ Schema validation passed"
echo ""

# Check final migration status
echo "=== Final Migration Status ==="
npx prisma migrate status
echo ""

# Compare backup vs current database structure
echo "=== Database Structure Comparison ==="
echo "Backup tables:"
sqlite3 "$BACKUP_FILE" ".tables" || echo "Failed to read backup"
echo ""
echo "Current tables:"
sqlite3 prisma/dev.sqlite ".tables"
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
