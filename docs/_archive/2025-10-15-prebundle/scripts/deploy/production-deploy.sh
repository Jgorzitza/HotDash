#!/usr/bin/env bash
set -euo pipefail

# Production deployment orchestrator for HotDash Shopify app.
# Requires non-interactive Shopify CLI credentials and production smoke target.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "[deploy] Missing required environment variable: $name" >&2
    exit 1
  fi
}

require_env SHOPIFY_CLI_AUTH_TOKEN_PROD
require_env SHOPIFY_API_KEY_PROD
require_env SHOPIFY_API_SECRET_PROD
require_env PRODUCTION_SHOP_DOMAIN
require_env PRODUCTION_APP_URL
require_env PRODUCTION_SMOKE_TEST_URL

export SHOPIFY_CLI_TTY=0
export SHOPIFY_FLAG_ENVIRONMENT="${SHOPIFY_FLAG_ENVIRONMENT:-production}"
export SHOPIFY_API_KEY="$SHOPIFY_API_KEY_PROD"
export SHOPIFY_API_SECRET="$SHOPIFY_API_SECRET_PROD"
export SHOPIFY_APP_URL="$PRODUCTION_APP_URL"
export SHOPIFY_CLI_AUTH_TOKEN="$SHOPIFY_CLI_AUTH_TOKEN_PROD"

APP_NAME="${SHOPIFY_APP_NAME:-HotDash Production}"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
ARTIFACT_DIR="${ARTIFACT_DIR:-artifacts/deploy}"
mkdir -p "$ARTIFACT_DIR"

DEPLOY_LOG="$ARTIFACT_DIR/production-deploy-${TIMESTAMP}.json"
SMOKE_LOG="$ARTIFACT_DIR/production-smoke-${TIMESTAMP}.log"

printf "[deploy] Deploying %s to store %s (environment: %s)\n" "$APP_NAME" "$PRODUCTION_SHOP_DOMAIN" "$SHOPIFY_FLAG_ENVIRONMENT"

npx --yes @shopify/cli@latest app deploy \
  --force \
  --json \
  --environment "$SHOPIFY_FLAG_ENVIRONMENT" \
  --api-key "$SHOPIFY_API_KEY_PROD" \
  --store "$PRODUCTION_SHOP_DOMAIN" \
  --path "$ROOT_DIR" \
  --allow-live \
  | tee "$DEPLOY_LOG"

printf "[deploy] Deployment JSON captured at %s\n" "$DEPLOY_LOG"

export SYNTHETIC_CHECK_URL="${SYNTHETIC_CHECK_URL:-$PRODUCTION_SMOKE_TEST_URL}"

printf "[deploy] Running production smoke verification via %s\n" "$SYNTHETIC_CHECK_URL"
node scripts/ci/synthetic-check.mjs | tee "$SMOKE_LOG"

printf "[deploy] Smoke log captured at %s\n" "$SMOKE_LOG"
