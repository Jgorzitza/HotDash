#!/usr/bin/env bash
set -euo pipefail
if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required" >&2
  exit 1
fi
ENVIRONMENT=${1:-staging}
VAULT_PATH=${2:-vault/occ/supabase/service_key_staging.env}
KEY_NAME=${3:-SUPABASE_SERVICE_KEY}
if [ ! -f "$VAULT_PATH" ]; then
  echo "Vault file $VAULT_PATH not found" >&2
  exit 1
fi
SECRET_VALUE=$(grep "^${KEY_NAME}=" "$VAULT_PATH" | sed "s/^${KEY_NAME}=//")
if [ -z "$SECRET_VALUE" ]; then
  echo "Secret $KEY_NAME not found in $VAULT_PATH" >&2
  exit 1
fi
# Mirror secret into GitHub environment
if [ "$ENVIRONMENT" = "staging" ]; then
  gh secret set "$KEY_NAME" --env "staging" --body "$SECRET_VALUE"
else
  gh secret set "${KEY_NAME}_${ENVIRONMENT^^}" --env "$ENVIRONMENT" --body "$SECRET_VALUE"
fi
