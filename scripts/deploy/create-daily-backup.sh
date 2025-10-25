#!/bin/bash
# HotDash production backup helper
# Copies critical tables to artifacts for archival (daily automation ready).

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [ -f "$PROJECT_ROOT/.env" ]; then
  # shellcheck disable=SC1090
  source "$PROJECT_ROOT/.env"
fi

DB_URL="${DATABASE_URL_ADMIN:-${DATABASE_URL:-}}"

if [ -z "$DB_URL" ]; then
  echo "❌ DATABASE_URL not configured"
  exit 1
fi

# pg_dump does not accept ?pgbouncer=true; remove optional query parameters.
DB_URL_CLEAN="${DB_URL%%\?*}"

DATE_UTC="$(date -u +%Y-%m-%d)"
TIME_UTC="$(date -u +%H%M%S)"
BACKUP_DIR="$PROJECT_ROOT/artifacts/devops/$DATE_UTC/backups"
mkdir -p "$BACKUP_DIR"

TABLES=("public.\"TaskAssignment\"" "public.\"DecisionLog\"" "public.audit_log")

echo "💾 Creating CSV backups (UTC $DATE_UTC $TIME_UTC)..."

for TABLE in "${TABLES[@]}"; do
  TABLE_LABEL="${TABLE//\"/}"
  TABLE_LABEL="${TABLE_LABEL#public.}"
  LOWER_NAME="$(echo "$TABLE_LABEL" | tr '[:upper:]' '[:lower:]')"
  OUT_FILE="$BACKUP_DIR/${LOWER_NAME}_$TIME_UTC.csv"
  echo "   • $TABLE → $OUT_FILE"
  psql "$DB_URL_CLEAN" -c "\\copy (SELECT * FROM $TABLE) TO STDOUT CSV HEADER" > "$OUT_FILE"
done

echo "✅ Backup complete"
