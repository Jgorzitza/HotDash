#!/bin/bash

# Security cleanup script for sensitive data
# DO NOT COMMIT THIS SCRIPT WITH REAL PATTERNS

set -euo pipefail

# Config
REPO_ROOT="/home/justin/HotDash/hot-dash"
BACKUP_DIR="${REPO_ROOT}/.cleanup-backup-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="${REPO_ROOT}/artifacts/security/cleanup_$(date +%Y%m%d-%H%M%S).log"

# Create backup
mkdir -p "${BACKUP_DIR}"
cp -r "${REPO_ROOT}"/* "${BACKUP_DIR}/"

# Logging
mkdir -p "${REPO_ROOT}/artifacts/security"
exec 1>"${LOG_FILE}" 2>&1

# Patterns to replace (using placeholders)
patterns=(
  "s|postgresql://[^[:space:]@]+:[^[:space:]@]+@[^[:space:]/]+/[^[:space:]]*|postgresql://[REDACTED]:[REDACTED]@[DB-HOST]/[DB-NAME]|g"
  "s|redis://[^[:space:]@]+:[^[:space:]@]+@[^[:space:]/]+/[^[:space:]]*|redis://[REDACTED]@[REDIS-HOST]/[DB-NUM]|g"
  "s|sb_secret_[^[:space:]\"']+|[SUPABASE-SECRET-REDACTED]|g"
  "s|sb_publishable_[^[:space:]\"']+|[SUPABASE-PUBLISHABLE-REDACTED]|g"
  "s|http://127.0.0.1:[0-9]+|[LOCAL-URL-REDACTED]|g"
  "s|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b|[EMAIL-REDACTED]|g"
  "s|TOKEN_[^[:space:]\"']+|[TOKEN-REDACTED]|g"
  "s|KEY_[^[:space:]\"']+|[KEY-REDACTED]|g"
  "s|SECRET_[^[:space:]\"']+|[SECRET-REDACTED]|g"
  "s|PASSWORD_[^[:space:]\"']+|[PASSWORD-REDACTED]|g"
)

echo "Starting security cleanup at $(date)"
echo "Backup created at: ${BACKUP_DIR}"

# Files to exclude from cleanup
exclude_patterns=(
  ".git/"
  "node_modules/"
  ".next/"
  "dist/"
  "build/"
  ".cleanup-backup-"
  "artifacts/security/cleanup_"
)

# Build exclude pattern for find
exclude_args=()
for pattern in "${exclude_patterns[@]}"; do
  exclude_args+=(-not -path "*/${pattern}*")
done

# Find all text files, excluding binaries and specified patterns
find "${REPO_ROOT}" -type f \
  \( -name "*.md" -o -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.sh" -o -name "*.txt" -o -name "*.toml" -o -name "*.env" \) \
  "${exclude_args[@]}" \
  -print0 | while IFS= read -r -d '' file; do

  echo "Processing: ${file}"
  
  # Create temp file
  temp_file="${file}.tmp"
  
  # Apply all patterns
  cp "${file}" "${temp_file}"
  for pattern in "${patterns[@]}"; do
    sed -i "${pattern}" "${temp_file}"
  done
  
  # Check if file changed
  if ! cmp -s "${file}" "${temp_file}"; then
    echo "  Found and redacted sensitive data"
    mv "${temp_file}" "${file}"
  else
    rm "${temp_file}"
  fi
done

echo "Cleanup complete at $(date)"
echo "Log file: ${LOG_FILE}"

# Generate report
echo "
Summary Report
=============" >> "${LOG_FILE}"
echo "Processed files with sensitive data:" >> "${LOG_FILE}"
grep "Found and redacted sensitive data" "${LOG_FILE}" | cut -d':' -f1 | sort | uniq >> "${LOG_FILE}"

echo "Done. Please review ${LOG_FILE} for details."