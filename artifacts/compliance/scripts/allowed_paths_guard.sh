#!/usr/bin/env bash
set -euo pipefail
# Fail if any staged path is outside allowed prefixes
BAD="$(git diff --name-only --cached | grep -Ev '^(docs/compliance/|feedback/|artifacts/compliance/)' || true)"
# Allow single runbook file explicitly per directions
BAD="$(echo "$BAD" | grep -Ev '^docs/runbooks/incident_response_supabase\.md$' || true)"
if [ -n "$BAD" ]; then
  echo "Blocked staged paths outside allowed scope:"
  echo "$BAD"
  exit 2
fi
