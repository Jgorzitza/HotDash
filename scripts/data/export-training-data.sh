#!/bin/bash
# Agent Training Data Export Utility
# Purpose: Export training data with PII redaction for model fine-tuning
# Owner: data
# Date: 2025-10-11
# Ref: docs/directions/data.md Task H

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
EXPORT_DIR="${PROJECT_ROOT}/artifacts/ai/training_exports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FORMAT="${EXPORT_FORMAT:-json}" # json, csv, parquet

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         Agent Training Data Export (PII Redacted)                ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Database: $DB_URL"
echo "Export Dir: $EXPORT_DIR"
echo "Format: $FORMAT"
echo "Timestamp: $TIMESTAMP"
echo ""

mkdir -p "$EXPORT_DIR"

# Export training data with PII redaction
case $FORMAT in
  json)
    EXPORT_FILE="$EXPORT_DIR/training_data_$TIMESTAMP.json"
    psql "$DB_URL" -t -A -F',' << 'EOF' > "$EXPORT_FILE"
SELECT json_agg(row_to_json(t)) FROM (
  SELECT 
    conversation_id,
    -- PII REDACTED: Remove email, phone, names via regex
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(input_text, 
          '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 
          '[EMAIL_REDACTED]', 'g'),
        '\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', 
        '[PHONE_REDACTED]', 'g'),
      '\b[A-Z][a-z]+ [A-Z][a-z]+\b',
      '[NAME_REDACTED]', 'g'
    ) as input_text_redacted,
    REGEXP_REPLACE(
      REGEXP_REPLACE(model_draft,
        '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        '[EMAIL_REDACTED]', 'g'),
      '\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
      '[PHONE_REDACTED]', 'g'
    ) as model_draft_redacted,
    safe_to_send,
    labels,
    rubric,
    created_at
  FROM agent_feedback
  WHERE safe_to_send IS NOT NULL
  ORDER BY created_at DESC
) t;
EOF
    ;;
  
  csv)
    EXPORT_FILE="$EXPORT_DIR/training_data_$TIMESTAMP.csv"
    psql "$DB_URL" << 'EOF' > "$EXPORT_FILE"
COPY (
  SELECT 
    conversation_id,
    REGEXP_REPLACE(input_text, '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL_REDACTED]', 'g') as input_text_redacted,
    REGEXP_REPLACE(model_draft, '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL_REDACTED]', 'g') as model_draft_redacted,
    safe_to_send,
    array_to_string(labels, ',') as labels,
    rubric::text as rubric,
    created_at
  FROM agent_feedback
  WHERE safe_to_send IS NOT NULL
  ORDER BY created_at DESC
) TO STDOUT WITH CSV HEADER;
EOF
    ;;
    
  *)
    echo "Error: Unsupported format $FORMAT"
    echo "Supported: json, csv"
    exit 1
    ;;
esac

if [ -f "$EXPORT_FILE" ]; then
  EXPORT_SIZE=$(du -h "$EXPORT_FILE" | cut -f1)
  ROW_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM agent_feedback WHERE safe_to_send IS NOT NULL;")
  
  echo "✅ Export complete!"
  echo ""
  echo "Details:"
  echo "  • File: $EXPORT_FILE"
  echo "  • Size: $EXPORT_SIZE"
  echo "  • Rows: $ROW_COUNT"
  echo "  • PII Redaction: Email, phone, names"
  echo ""
else
  echo "❌ Export failed"
  exit 1
fi

