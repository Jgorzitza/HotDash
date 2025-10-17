#!/usr/bin/env bash
set -euo pipefail

MAX_FILES=30

if [[ -n "${CI:-}" ]]; then
  BASE=${CI_BASE_REF:-origin/main}
  git fetch origin "$BASE" >/dev/null 2>&1 || true
  changed_files=$(git diff --name-only "$BASE"...HEAD)
else
  changed_files=$(git diff --cached --name-only)
fi

count=$(printf "%s\n" "$changed_files" | sed '/^$/d' | wc -l | tr -d ' ')

if (( count <= MAX_FILES )); then
  exit 0
fi

if [[ ":${ALLOW_WIDE_CHANGE:-}:" == *":1:"* ]]; then
  echo "⚠ Wide change allowed (ALLOW_WIDE_CHANGE=1)"
  exit 0
fi

echo "✖ Diff touches $count files (max $MAX_FILES). Export ALLOW_WIDE_CHANGE=1 if intentional." >&2
exit 1
