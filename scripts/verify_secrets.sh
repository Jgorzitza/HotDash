#!/usr/bin/env bash
set -euo pipefail

missing=0
for key in SUPABASE_URL SUPABASE_ANON_KEY PUBLER_API_KEY SUPABASE_SERVICE_ROLE SHOPIFY_API_KEY SHOPIFY_API_SECRET SHOPIFY_APP_URL; do
  if [ -z "${!key:-}" ]; then
    echo "❌ Missing $key"
    missing=1
  else
    echo "✅ $key set"
  fi
done

if [ "$missing" -eq 1 ]; then
  echo "One or more required secrets are not set."
  exit 1
fi

echo "All required secrets present."
