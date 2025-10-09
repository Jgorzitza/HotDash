#!/usr/bin/env bash

set -euo pipefail

ENVIRONMENT="production"

if [[ ${1:-} != "" ]]; then
  ENVIRONMENT="$1"
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required to check environment secrets" >&2
  exit 1
fi

REQUIRED_SECRETS=(
  SHOPIFY_API_KEY_PROD
  SHOPIFY_API_SECRET_PROD
  SHOPIFY_CLI_AUTH_TOKEN_PROD
  SUPABASE_URL_PROD
  SUPABASE_SERVICE_KEY_PROD
  CHATWOOT_BASE_URL_PROD
  CHATWOOT_TOKEN_PROD
  CHATWOOT_ACCOUNT_ID_PROD
  ANTHROPIC_API_KEY_PROD
  GA_MCP_HOST_PROD
  GA_PROPERTY_ID_PROD
  PRODUCTION_APP_URL
  PRODUCTION_SMOKE_TEST_URL
)

missing=()

secret_list=$(gh secret list --env "$ENVIRONMENT" 2>/dev/null || true)

for secret in "${REQUIRED_SECRETS[@]}"; do
  if ! grep -q "^$secret" <<<"$secret_list"; then
    missing+=("$secret")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing secrets in environment '$ENVIRONMENT':" >&2
  for secret in "${missing[@]}"; do
    echo "  - $secret" >&2
  done
  exit 1
fi

echo "All required secrets found in environment '$ENVIRONMENT'."
