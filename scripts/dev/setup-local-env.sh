#!/bin/bash
# Local Development Environment Setup Automation
# Run this script to set up your complete development environment

set -e  # Exit on error

echo "🚀 Hot Dash - Local Development Environment Setup"
echo "=================================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi
echo "✅ npm $(npm --version)"

# Check Supabase CLI
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found"
    exit 1
fi
echo "✅ Supabase CLI available via npx"

# Check Shopify CLI
if ! command -v shopify &> /dev/null; then
    echo "⚠️  Shopify CLI not found (optional for theme development)"
else
    echo "✅ Shopify CLI $(shopify version)"
fi

echo ""
echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🗄️  Setting up local Supabase..."
npx supabase start

echo ""
echo "📝 Creating .env.local file..."

# Get Supabase connection details
SUPABASE_URL=$(npx supabase status | grep "API URL" | awk '{print $3}')
SUPABASE_ANON_KEY=$(npx supabase status | grep "anon key" | awk '{print $3}')
SUPABASE_SERVICE_KEY=$(npx supabase status | grep "service_role key" | awk '{print $3}')
DB_URL=$(npx supabase status | grep "DB URL" | awk '{print $3}')

cat > .env.local << EOF
# Supabase (Local)
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
DATABASE_URL=$DB_URL

# Shopify (use .env for your values or mock mode)
SHOPIFY_API_KEY=your-api-key-here
SHOPIFY_API_SECRET=your-api-secret-here
SCOPES=read_products,write_products,read_orders,write_orders,read_inventory,write_inventory,read_customers

# App Config
NODE_ENV=development
DASHBOARD_USE_MOCK=1
PORT=3000

# Session Secret
SESSION_SECRET=$(openssl rand -base64 32)
EOF

echo "✅ .env.local created"

echo ""
echo "🔄 Running database migrations..."
npm run setup

echo ""
echo "🏗️  Building application..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Update .env.local with your Shopify credentials (or use mock mode)"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Visit http://localhost:3000"
echo ""
echo "🔧 Useful commands:"
echo "  - npm run dev          Start development server"
echo "  - npm run typecheck    Check TypeScript types"
echo "  - npm run lint         Run linter"
echo "  - npm test             Run tests"
echo "  - npx supabase status  Check Supabase status"
echo "  - npx supabase stop    Stop Supabase"
echo ""
echo "📖 Documentation: docs/dev/"
echo "🆘 Need help? Check feedback/engineer.md for examples"
echo ""

