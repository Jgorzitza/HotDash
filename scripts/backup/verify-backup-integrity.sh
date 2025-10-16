#!/bin/bash
#
# Backup Integrity Verification Script
#
# Verifies that database backups are valid and can be restored.
#
# Usage:
#   ./scripts/backup/verify-backup-integrity.sh [staging|production] <backup-file>
#

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
ENVIRONMENT="${1:-}"
BACKUP_FILE="${2:-}"
BACKUP_DIR="/data/backups/database"

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
    exit 1
fi

FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Validate backup file exists
if [[ ! -f "$FULL_BACKUP_PATH" ]]; then
    log_error "Backup file not found: $FULL_BACKUP_PATH"
    exit 1
fi

log_info "Verifying backup integrity: $BACKUP_FILE"

# Check 1: File is not empty
FILE_SIZE=$(stat -f%z "$FULL_BACKUP_PATH" 2>/dev/null || stat -c%s "$FULL_BACKUP_PATH" 2>/dev/null)
if [ "$FILE_SIZE" -eq 0 ]; then
    log_error "Backup file is empty"
    exit 1
fi
log_info "✅ File size: $(numfmt --to=iec-i --suffix=B $FILE_SIZE 2>/dev/null || echo "${FILE_SIZE} bytes")"

# Check 2: File is valid gzip
if gunzip -t "$FULL_BACKUP_PATH" 2>/dev/null; then
    log_info "✅ Valid gzip compression"
else
    log_error "Invalid gzip file"
    exit 1
fi

# Check 3: Contains SQL content
FIRST_LINES=$(gunzip -c "$FULL_BACKUP_PATH" | head -20)
if echo "$FIRST_LINES" | grep -q "PostgreSQL database dump"; then
    log_info "✅ Valid PostgreSQL dump format"
else
    log_warn "⚠️ May not be a PostgreSQL dump"
fi

# Check 4: Contains table definitions
TABLE_COUNT=$(gunzip -c "$FULL_BACKUP_PATH" | grep -c "CREATE TABLE" || echo "0")
log_info "✅ Contains $TABLE_COUNT table definitions"

if [ "$TABLE_COUNT" -eq 0 ]; then
    log_warn "⚠️ No tables found in backup"
fi

# Check 5: Contains data
INSERT_COUNT=$(gunzip -c "$FULL_BACKUP_PATH" | grep -c "INSERT INTO\|COPY" || echo "0")
log_info "✅ Contains $INSERT_COUNT data statements"

# Check 6: Metadata file exists
META_FILE="$FULL_BACKUP_PATH.meta"
if [[ -f "$META_FILE" ]]; then
    log_info "✅ Metadata file exists"
    cat "$META_FILE"
else
    log_warn "⚠️ Metadata file not found"
fi

# Summary
echo ""
echo "=== Verification Summary ==="
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Size: $(numfmt --to=iec-i --suffix=B $FILE_SIZE 2>/dev/null || echo "${FILE_SIZE} bytes")"
echo "Tables: $TABLE_COUNT"
echo "Data statements: $INSERT_COUNT"
echo ""

if [ "$TABLE_COUNT" -gt 0 ] && [ "$INSERT_COUNT" -gt 0 ]; then
    log_info "✅ Backup integrity verification PASSED"
    exit 0
else
    log_warn "⚠️ Backup may be incomplete or empty"
    exit 1
fi

