#!/usr/bin/env bash
set -euo pipefail

# Staging deployment orchestrator for HotDash Shopify app.
# Expects Shopify CLI auth token + staging store metadata in environment variables.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "[deploy] Missing required environment variable: $name" >&2
    exit 1
  fi
}

require_env SHOPIFY_CLI_AUTH_TOKEN
require_env SHOPIFY_API_KEY
require_env SHOPIFY_API_SECRET
require_env STAGING_SHOP_DOMAIN
require_env STAGING_APP_URL
require_env STAGING_SMOKE_TEST_URL

export SHOPIFY_CLI_TTY=0
export SHOPIFY_FLAG_ENVIRONMENT="${SHOPIFY_FLAG_ENVIRONMENT:-staging}"
export SHOPIFY_API_KEY
export SHOPIFY_API_SECRET
export SHOPIFY_APP_URL="$STAGING_APP_URL"
export SHOPIFY_CLI_AUTH_TOKEN

APP_NAME="${SHOPIFY_APP_NAME:-HotDash Staging}"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
ARTIFACT_DIR="${ARTIFACT_DIR:-artifacts/deploy}"
mkdir -p "$ARTIFACT_DIR"

DEPLOY_LOG="$ARTIFACT_DIR/staging-deploy-${TIMESTAMP}.json"
SMOKE_LOG="$ARTIFACT_DIR/staging-smoke-${TIMESTAMP}.log"

printf "[deploy] Deploying %s to store %s (environment: %s)\n" "$APP_NAME" "$STAGING_SHOP_DOMAIN" "$SHOPIFY_FLAG_ENVIRONMENT"

npx --yes @shopify/cli@latest app deploy \
  --force \
  --json \
  --environment "$SHOPIFY_FLAG_ENVIRONMENT" \
  --api-key "$SHOPIFY_API_KEY" \
  --store "$STAGING_SHOP_DOMAIN" \
  --path "$ROOT_DIR" \
  --allow-live \
  | tee "$DEPLOY_LOG"

printf "[deploy] Deployment JSON captured at %s\n" "$DEPLOY_LOG"

export SYNTHETIC_CHECK_URL="${SYNTHETIC_CHECK_URL:-$STAGING_SMOKE_TEST_URL}"

printf "[deploy] Running staging smoke verification via %s\n" "$SYNTHETIC_CHECK_URL"
node scripts/ci/synthetic-check.mjs | tee "$SMOKE_LOG"

printf "[deploy] Smoke log captured at %s\n" "$SMOKE_LOG"
