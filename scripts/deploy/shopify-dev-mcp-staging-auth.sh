#!/usr/bin/env bash
set -euo pipefail

# Shopify Dev MCP helper for staging authentication.
# Loads staging secrets, validates prerequisites, and launches the MCP server
# with the correct Shopify CLI environment so tools can operate non-interactively.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage: scripts/deploy/shopify-dev-mcp-staging-auth.sh [options]

Options:
  --env-file <path>   Load environment variables from the given .env-style file before running.
  --check             Validate required environment variables and exit without starting the server.
  -h, --help          Show this help message.

Required variables (can be provided via environment or env file):
  SHOPIFY_API_KEY_STAGING
  SHOPIFY_API_SECRET_STAGING
  SHOPIFY_CLI_AUTH_TOKEN_STAGING
  STAGING_APP_URL
  STAGING_SHOP_DOMAIN

Optional variables:
  SHOPIFY_APP_NAME            (defaults to "HotDash Staging")
  SHOPIFY_FLAG_ENVIRONMENT    (defaults to "staging")
  POLARIS_UNIFIED             (defaults to "true")
  LIQUID                      (defaults to "true")

The script exports staging values into the general Shopify CLI variables expected
by @shopify/dev-mcp and starts the server on stdio. Use --check in CI to ensure
secrets are present without launching the server.
EOF
}

ENV_FILE=""
CHECK_ONLY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env-file)
      if [[ $# -lt 2 ]]; then
        echo "[mcp] Missing value for --env-file" >&2
        exit 1
      fi
      ENV_FILE="$2"
      shift 2
      ;;
    --check)
      CHECK_ONLY=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[mcp] Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -n "$ENV_FILE" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "[mcp] Env file not found: $ENV_FILE" >&2
    exit 1
  fi
  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE"
  set +a
fi

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "[mcp] Missing required environment variable: $name" >&2
    exit 1
  fi
}

require_command() {
  local binary="$1"
  if ! command -v "$binary" >/dev/null 2>&1; then
    echo "[mcp] Required command not found on PATH: $binary" >&2
    exit 1
  fi
}

require_env "SHOPIFY_API_KEY_STAGING"
require_env "SHOPIFY_API_SECRET_STAGING"
require_env "SHOPIFY_CLI_AUTH_TOKEN_STAGING"
require_env "STAGING_APP_URL"
require_env "STAGING_SHOP_DOMAIN"

require_command "npx"

export SHOPIFY_FLAG_ENVIRONMENT="${SHOPIFY_FLAG_ENVIRONMENT:-staging}"
export SHOPIFY_API_KEY="${SHOPIFY_API_KEY_STAGING}"
export SHOPIFY_API_SECRET="${SHOPIFY_API_SECRET_STAGING}"
export SHOPIFY_CLI_AUTH_TOKEN="${SHOPIFY_CLI_AUTH_TOKEN_STAGING}"
export SHOPIFY_APP_URL="${STAGING_APP_URL}"
export SHOPIFY_APP_NAME="${SHOPIFY_APP_NAME:-HotDash Staging}"
export POLARIS_UNIFIED="${POLARIS_UNIFIED:-true}"
export LIQUID="${LIQUID:-true}"

echo "[mcp] Shopify Dev MCP staging environment configured:"
echo "       SHOPIFY_FLAG_ENVIRONMENT=$SHOPIFY_FLAG_ENVIRONMENT"
echo "       STAGING_SHOP_DOMAIN=$STAGING_SHOP_DOMAIN"

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  echo "[mcp] Environment validation complete. (--check)"
  exit 0
fi

echo "[mcp] Launching Shopify Dev MCP server with staging credentials…"
exec npx --yes @shopify/dev-mcp@latest
