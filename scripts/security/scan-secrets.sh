#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
BASELINE="$ROOT_DIR/security/gitleaks-baseline.json"
CONFIG="$ROOT_DIR/.gitleaks.toml"
REPORT_DIR="$ROOT_DIR/artifacts/security"
REPORT_FILE="$REPORT_DIR/gitleaks-report.json"

mkdir -p "$REPORT_DIR"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks not found on PATH" >&2
  exit 1
fi

echo "Running gitleaks with baseline: $BASELINE" >&2
gitleaks detect \
  --source "$ROOT_DIR" \
  --config "$CONFIG" \
  --baseline-path "$BASELINE" \
  --redact \
  --report-format json \
  --report-path "$REPORT_FILE"
