#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${CI:-}" ]]; then
  BASE=${CI_BASE_REF:-origin/main}
  git fetch origin "$BASE" >/dev/null 2>&1 || true
  changed_files=$(git diff --name-only "$BASE"...HEAD)
else
  changed_files=$(git diff --cached --name-only)
fi

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  case "$file" in
    *.env|*.env.*|.env|.env.*|vault/*|tokens/*)
      echo "✖ Secret file '$file' cannot be committed" >&2
      exit 1
      ;;
  esac
  if [[ -n "${CI:-}" ]]; then
    diff_output=$(git diff "$BASE"...HEAD -- "$file")
  else
    diff_output=$(git diff --cached -- "$file")
  fi
  if [[ -n "$diff_output" ]] && grep -E "(PUBLER_API_KEY|SHOPIFY_API_KEY|SUPABASE_SERVICE_ROLE|SLACK_WEBHOOK_URL|FLY_API_TOKEN)" <<<"$diff_output" >/dev/null 2>&1; then
    echo "✖ Potential secret key detected in '$file'" >&2
    exit 1
  fi
done <<<"$changed_files"
