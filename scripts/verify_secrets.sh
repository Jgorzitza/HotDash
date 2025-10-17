#!/usr/bin/env bash
# Verify required secrets for HotDash deployment
# Used in CI to ensure all required environment variables are set
set -euo pipefail

echo "🔍 Verifying required secrets..."
echo ""

missing=0

# Supabase secrets
for key in SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY SUPABASE_PRODUCTION_DB_URL SUPABASE_STAGING_DB_URL; do
  if [ -z "${!key:-}" ]; then
    echo "❌ Missing $key"
    missing=1
  else
    echo "✅ $key set"
  fi
done

# Publer/Social secrets
for key in PUBLER_API_KEY PUBLER_WORKSPACE_ID; do
  if [ -z "${!key:-}" ]; then
    echo "❌ Missing $key"
    missing=1
  else
    echo "✅ $key set"
  fi
done

# Shopify secrets
for key in SHOPIFY_API_KEY SHOPIFY_API_SECRET SHOPIFY_APP_URL SHOPIFY_SHOP_DOMAIN; do
  if [ -z "${!key:-}" ]; then
    echo "❌ Missing $key"
    missing=1
  else
    echo "✅ $key set"
  fi
done

# Notification secrets
for key in SLACK_WEBHOOK_URL NOTIFICATION_EMAIL_USERNAME NOTIFICATION_EMAIL_PASSWORD; do
  if [ -z "${!key:-}" ]; then
    echo "❌ Missing $key"
    missing=1
  else
    echo "✅ $key set"
  fi
done

# Fly.io secrets
for key in FLY_API_TOKEN; do
  if [ -z "${!key:-}" ]; then
    echo "❌ Missing $key"
    missing=1
  else
    echo "✅ $key set"
  fi
done

echo ""
if [ "$missing" -eq 1 ]; then
  echo "❌ One or more required secrets are not set."
  echo ""
  echo "Required secrets:"
  echo "  Supabase: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PRODUCTION_DB_URL, SUPABASE_STAGING_DB_URL"
  echo "  Publer: PUBLER_API_KEY, PUBLER_WORKSPACE_ID"
  echo "  Shopify: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL, SHOPIFY_SHOP_DOMAIN"
  echo "  Notifications: SLACK_WEBHOOK_URL, NOTIFICATION_EMAIL_USERNAME, NOTIFICATION_EMAIL_PASSWORD"
  echo "  Fly.io: FLY_API_TOKEN"
  echo ""
  exit 1
fi

echo "✅ All required secrets present."
exit 0
