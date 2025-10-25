#\!/bin/bash
set -e

echo "🚀 HotDash Production Deployment"
echo "================================"
echo ""

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Verify production app exists
echo "🔍 Verifying production app..."
flyctl apps list | grep hotdash-production || {
  echo "❌ Production app not found. Creating..."
  flyctl apps create hotdash-production --org personal
}
echo "✅ Production app exists"
echo ""

# Set production secrets for IPv6 direct connection
echo "🔐 Setting production secrets..."
echo "Note: Using IPv6-compatible direct connection to Supabase"

# Get current DATABASE_URL from local env (we'll use direct connection for production)
if [ -f .env ]; then
  source .env
fi

# For production, use env-provided direct connection (no hardcoded secrets)
# Provide via: export PROD_DATABASE_URL=postgres://user:pass@host:5432/postgres
if [ -z "$PROD_DATABASE_URL" ]; then
  echo "❌ Missing PROD_DATABASE_URL (postgres connection string). Set this from the secure vault before running."
  echo "   Hint: see vault/occ/supabase/ for environment-specific values"
  exit 1
fi

echo "Setting DATABASE_URL (IPv6 direct connection from env)..."
flyctl secrets set DATABASE_URL="$PROD_DATABASE_URL" --app hotdash-production --stage

# Set other required secrets
if [ -n "$SHOPIFY_API_KEY" ]; then
  echo "Setting SHOPIFY_API_KEY..."
  flyctl secrets set SHOPIFY_API_KEY="$SHOPIFY_API_KEY" --app hotdash-production --stage
fi

if [ -n "$SHOPIFY_API_SECRET" ]; then
  echo "Setting SHOPIFY_API_SECRET..."
  flyctl secrets set SHOPIFY_API_SECRET="$SHOPIFY_API_SECRET" --app hotdash-production --stage
fi

if [ -n "$SUPABASE_URL" ]; then
  echo "Setting SUPABASE_URL..."
  flyctl secrets set SUPABASE_URL="$SUPABASE_URL" --app hotdash-production --stage
fi

if [ -n "$SUPABASE_ANON_KEY" ]; then
  echo "Setting SUPABASE_ANON_KEY..."
  flyctl secrets set SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" --app hotdash-production --stage
fi

if [ -n "$SESSION_SECRET" ]; then
  echo "Setting SESSION_SECRET..."
  flyctl secrets set SESSION_SECRET="$SESSION_SECRET" --app hotdash-production --stage
fi

# Set SHOPIFY_APP_URL for production
echo "Setting SHOPIFY_APP_URL..."
flyctl secrets set SHOPIFY_APP_URL="https://hotdash-production.fly.dev" --app hotdash-production --stage

# Set SCOPES
echo "Setting SCOPES..."
flyctl secrets set SCOPES="read_products,write_products,read_orders,write_orders,read_customers,read_inventory,write_inventory" --app hotdash-production --stage

echo "✅ Secrets configured"
echo ""

# Build and deploy
echo "🏗️  Building and deploying to production..."
flyctl deploy --config fly.production.toml --app hotdash-production --strategy rolling

echo ""
echo "✅ Deployment complete\!"
echo ""
echo "🔍 Verifying deployment..."
sleep 5

# Check health
echo "Checking health endpoint..."
curl -f https://hotdash-production.fly.dev/health || echo "⚠️  Health check failed"

echo ""
echo "📊 Deployment status:"
flyctl status --app hotdash-production

echo ""
echo "🎉 Production deployment complete\!"
echo "🌐 URL: https://hotdash-production.fly.dev"
echo ""
echo "📝 Next steps:"
echo "  1. Test Shopify OAuth flow"
echo "  2. Verify dashboard loads"
echo "  3. Test browser notifications"
echo "  4. Notify CEO for testing"
echo ""
