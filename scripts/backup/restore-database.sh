#!/bin/bash
#
# Database Restore Script
#
# Restores the Supabase database from a backup file.
#
# Usage:
#   ./scripts/backup/restore-database.sh [staging|production] <backup-file>
#

set -euo pipefail

# Configuration
ENVIRONMENT="${1:-}"
BACKUP_FILE="${2:-}"
BACKUP_DIR="/data/backups/database"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate arguments
if [[ -z "$ENVIRONMENT" || -z "$BACKUP_FILE" ]]; then
    log_error "Missing required arguments"
    echo "Usage: $0 [staging|production] <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production] <backup-file>"
    exit 1
fi

# Production safety check
if [[ "$ENVIRONMENT" == "production" ]]; then
    log_warn "⚠️  WARNING: You are about to restore the PRODUCTION database!"
    log_warn "This will OVERWRITE all current data."
    echo ""
    read -p "Type 'RESTORE PRODUCTION' to continue: " confirmation
    if [[ "$confirmation" != "RESTORE PRODUCTION" ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
fi

# Validate backup file exists
FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
if [[ ! -f "$FULL_BACKUP_PATH" ]]; then
    log_error "Backup file not found: $FULL_BACKUP_PATH"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

log_info "Starting database restore for $ENVIRONMENT environment"
log_info "Backup file: $BACKUP_FILE"

# Get database URL from Fly.io secrets
log_info "Retrieving database credentials..."
DATABASE_URL=$(fly secrets list -a hotdash-$ENVIRONMENT | grep DATABASE_URL | awk '{print $2}')

if [[ -z "$DATABASE_URL" ]]; then
    log_error "DATABASE_URL not found in Fly.io secrets"
    exit 1
fi

# Create pre-restore backup
log_info "Creating pre-restore backup..."
PRE_RESTORE_BACKUP="hotdash_${ENVIRONMENT}_pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$PRE_RESTORE_BACKUP"
log_info "Pre-restore backup created: $PRE_RESTORE_BACKUP"

# Perform restore
log_info "Restoring database from backup..."
gunzip -c "$FULL_BACKUP_PATH" | psql "$DATABASE_URL"

if [[ $? -eq 0 ]]; then
    log_info "Database restored successfully"
    log_info "Pre-restore backup available at: $BACKUP_DIR/$PRE_RESTORE_BACKUP"
else
    log_error "Database restore failed"
    log_warn "You can restore the pre-restore backup if needed:"
    log_warn "  ./scripts/backup/restore-database.sh $ENVIRONMENT $PRE_RESTORE_BACKUP"
    exit 1
fi

# Verify restore
log_info "Verifying restore..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
log_info "Tables in database: $TABLE_COUNT"

log_info "Restore completed successfully"

exit 0

