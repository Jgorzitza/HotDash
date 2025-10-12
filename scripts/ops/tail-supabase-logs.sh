#!/usr/bin/env bash

set -euo pipefail

SUPABASE_BIN=${SUPABASE_BIN:-supabase}

if ! command -v "$SUPABASE_BIN" >/dev/null 2>&1; then
  echo "Supabase CLI not found. Install it with 'npm install -g supabase' or visit https://supabase.com/docs/guides/cli" >&2
  exit 1
fi

PROJECT_ID=${1:-}

if [[ -z "$PROJECT_ID" ]]; then
  echo "Tailing local Supabase logs (run from repo root)." >&2
  echo "Hint: pass a remote project ref to tail cloud logs: tail-supabase-logs.sh <project-ref>" >&2
  exec "$SUPABASE_BIN" logs --follow
else
  exec "$SUPABASE_BIN" logs --project-ref "$PROJECT_ID" --follow
fi
