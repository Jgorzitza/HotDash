#!/bin/bash
# Production Load Test Runner
# Runs k6 load test against production environment
# Target: 1000 concurrent users

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ARTIFACTS_DIR="$PROJECT_ROOT/artifacts/devops/$(date +%Y-%m-%d)"
LOAD_TEST_SCRIPT="$ARTIFACTS_DIR/load-test-script.js"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           Production Load Test Runner                            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

FALLBACK_RUNNER=0

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "⚠️  k6 not found — will use Node fallback runner"
    FALLBACK_RUNNER=1
fi

# Check if load test script exists
if [ ! -f "$LOAD_TEST_SCRIPT" ]; then
    echo "❌ Load test script not found: $LOAD_TEST_SCRIPT"
    exit 1
fi

echo "📋 Test Configuration:"
echo "  Target: https://hotdash-production.fly.dev"
echo "  Max Concurrent Users: 1000"
echo "  Duration: ~19 minutes"
echo "  Script: $LOAD_TEST_SCRIPT"
echo ""

# Confirm before running
read -p "⚠️  This will generate significant load on production. Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Load test cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting load test..."
echo ""

if [ "$FALLBACK_RUNNER" -eq 1 ]; then
    LOAD_TEST_BASE_URL="https://hotdash-production.fly.dev" \
    LOAD_TEST_OUTPUT="$ARTIFACTS_DIR/load-test-results.json" \
    node "$PROJECT_ROOT/scripts/deploy/load-test-runner.mjs"
else
    # Run k6 load test
    k6 run "$LOAD_TEST_SCRIPT"
fi

echo ""
echo "✅ Load test complete!"
echo ""
echo "📊 Results saved to:"
echo "  $ARTIFACTS_DIR/load-test-results.json"
echo ""
echo "📈 View results:"
echo "  cat $ARTIFACTS_DIR/load-test-results.json | jq '.metrics'"
echo ""
