#!/usr/bin/env bash
# Load MCP-related environment variables from the local vault
# Usage: source mcp/load-env-from-vault.sh
set -euo pipefail

# Resolve repo root (this script lives in mcp/)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

info() { echo "[mcp-env] $*"; }
warn() { echo "[mcp-env] WARN: $*" >&2; }

# --- Google Analytics ---
GA_CREDS_PATH="$ROOT_DIR/vault/occ/google/analytics-service-account.json"
if [[ -f "$GA_CREDS_PATH" ]]; then
  export GOOGLE_APPLICATION_CREDENTIALS="$GA_CREDS_PATH"
  info "GOOGLE_APPLICATION_CREDENTIALS set to vault path"
else
  warn "Google Analytics service account JSON not found at $GA_CREDS_PATH"
fi

# Project ID is not secret; set default if not already defined
: "${GOOGLE_PROJECT_ID:=hotrodan-seo-reports}"
export GOOGLE_PROJECT_ID
info "GOOGLE_PROJECT_ID is set"

# --- Supabase ---
# Prefer OCC staging service key if present; otherwise fall back to local env
SUPABASE_OCC_SK_ENV="$ROOT_DIR/vault/occ/supabase/service_key_staging.env"
SUPABASE_LOCAL_ENV="$ROOT_DIR/vault/supabase/local.env"

if [[ -f "$SUPABASE_OCC_SK_ENV" ]]; then
  # shellcheck disable=SC1090
  source "$SUPABASE_OCC_SK_ENV" || true
fi
if [[ -f "$SUPABASE_LOCAL_ENV" ]]; then
  # shellcheck disable=SC1090
  source "$SUPABASE_LOCAL_ENV" || true
fi

# If SUPABASE_SERVICE_ROLE_KEY is available, use it for SUPABASE_ACCESS_TOKEN
if [[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  export SUPABASE_ACCESS_TOKEN="$SUPABASE_SERVICE_ROLE_KEY"
  info "SUPABASE_ACCESS_TOKEN loaded from vault (service role key)"
else
  warn "SUPABASE_SERVICE_ROLE_KEY not found in vault; ensure SUPABASE_ACCESS_TOKEN is set in your environment"
fi

# --- GitHub ---
# Optional: if you store your PAT at vault/occ/github/pat.env with GITHUB_PERSONAL_ACCESS_TOKEN=...
GITHUB_PAT_ENV="$ROOT_DIR/vault/occ/github/pat.env"
if [[ -f "$GITHUB_PAT_ENV" ]]; then
  # shellcheck disable=SC1090
  source "$GITHUB_PAT_ENV" || true
  if [[ -n "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ]]; then
    info "GITHUB_PERSONAL_ACCESS_TOKEN loaded from vault"
  else
    warn "GITHUB_PERSONAL_ACCESS_TOKEN not set in $GITHUB_PAT_ENV"
  fi
else
  warn "No GitHub PAT env file found at $GITHUB_PAT_ENV; set GITHUB_PERSONAL_ACCESS_TOKEN manually"
fi

info "Environment loaded from vault (where available)."

