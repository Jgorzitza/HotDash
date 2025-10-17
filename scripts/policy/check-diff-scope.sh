#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
CONFIG="$ROOT_DIR/manager.config.json"

MAX_FILES=50
if [[ -f "$CONFIG" ]]; then
  cfg_value=$(jq -r '.diff_scope_cap_files // empty' "$CONFIG" 2>/dev/null || echo "")
  if [[ -n "$cfg_value" && "$cfg_value" =~ ^[0-9]+$ ]]; then
    MAX_FILES=$cfg_value
  fi
fi

if [[ -n "${CI:-}" ]]; then
  BASE=${CI_BASE_REF:-origin/main}
  git fetch origin "$BASE" >/dev/null 2>&1 || true
  changed_files=$(git diff --name-only "$BASE"...HEAD)
  direction_files=$(git diff --name-only "$BASE"...HEAD | grep -E '^reports/runs/.+/direction\.md$' || true)
  show_file() {
    git show "HEAD:$1" 2>/dev/null || true
  }
else
  changed_files=$(git diff --cached --name-only)
  direction_files=$(git diff --cached --name-only | grep -E '^reports/runs/.+/direction\.md$' || true)
  show_file() {
    git show ":$1" 2>/dev/null || true
  }
fi

count=$(printf "%s\n" "$changed_files" | sed '/^$/d' | wc -l | tr -d ' ')

if (( count <= MAX_FILES )); then
  exit 0
fi

wide_change_ok=0
for file in $direction_files; do
  content=$(show_file "$file")
  if [[ -z "$content" ]]; then
    continue
  fi
  if echo "$content" | grep -qi 'wide-change' && echo "$content" | grep -qi 'justification'; then
    wide_change_ok=1
    break
  fi
done

if (( wide_change_ok == 1 )); then
  echo "⚠ Wide change acknowledged via direction label (files touched: $count, cap: $MAX_FILES)"
  exit 0
fi

echo "✖ Diff touches $count files (max $MAX_FILES). Add a 'wide-change' label with justification to the task direction or rescope." >&2
exit 1
