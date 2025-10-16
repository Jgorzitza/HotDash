#!/bin/bash
#
# Database Backup Script
#
# Backs up the Supabase database to a timestamped file.
# Uploads to Fly.io volumes for persistence.
#
# Usage:
#   ./scripts/backup/backup-database.sh [staging|production]
#

set -euo pipefail

# Configuration
ENVIRONMENT="${1:-staging}"
BACKUP_DIR="/data/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="hotdash_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

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

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production]"
    exit 1
fi

log_info "Starting database backup for $ENVIRONMENT environment"

# Get database URL from Fly.io secrets
log_info "Retrieving database credentials..."
DATABASE_URL=$(fly secrets list -a hotdash-$ENVIRONMENT | grep DATABASE_URL | awk '{print $2}')

if [[ -z "$DATABASE_URL" ]]; then
    log_error "DATABASE_URL not found in Fly.io secrets"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
log_info "Creating backup: $BACKUP_FILE"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup was created
if [[ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]]; then
    log_error "Backup file was not created"
    exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
log_info "Backup created successfully: $BACKUP_SIZE"

# Clean up old backups
log_info "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "hotdash_${ENVIRONMENT}_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "hotdash_${ENVIRONMENT}_*.sql.gz" | wc -l)
log_info "Total backups for $ENVIRONMENT: $BACKUP_COUNT"

# Create backup metadata
cat > "$BACKUP_DIR/$BACKUP_FILE.meta" <<EOF
{
  "environment": "$ENVIRONMENT",
  "timestamp": "$TIMESTAMP",
  "size": "$BACKUP_SIZE",
  "retention_days": $RETENTION_DAYS,
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

log_info "Backup completed successfully"
log_info "Backup location: $BACKUP_DIR/$BACKUP_FILE"

# Optional: Upload to external storage (S3, etc.)
# Uncomment and configure if needed
# log_info "Uploading to S3..."
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://hotdash-backups/$ENVIRONMENT/"

exit 0

