#!/bin/bash
# Setup KB Database for task/feedback system
# SAFE: Creates tables, does not modify production DB

set -e

echo "🔧 Setting up KB Database for Task/Feedback System..."
echo ""

# Load KB DB credentials from vault
if [ ! -f "vault/dev-kb/supabase.env" ]; then
  echo "❌ KB DB credentials not found in vault/dev-kb/supabase.env"
  exit 1
fi

echo "✅ Loading KB DB credentials from vault..."
export $(grep -v '^#' vault/dev-kb/supabase.env | xargs)

# Verify credentials loaded
if [ -z "$SUPABASE_DEV_KB_DATABASE_URL" ]; then
  echo "❌ SUPABASE_DEV_KB_DATABASE_URL not set"
  exit 1
fi

echo "✅ KB DB credentials loaded"
echo ""

# Generate Prisma client for KB DB
echo "📦 Generating Prisma client for KB DB..."
npx prisma generate --schema=prisma/kb-tasks/schema.prisma

echo ""
echo "🔄 Running migrations on KB DB..."
npx prisma migrate dev --name init_task_system --schema=prisma/kb-tasks/schema.prisma --skip-generate

echo ""
echo "✅ KB Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run migration script to copy existing data"
echo "  2. Update application code to use KB DB client"
echo "  3. Test and verify"

