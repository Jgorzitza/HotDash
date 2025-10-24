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

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed"
    echo ""
    echo "Install k6:"
    echo "  macOS:   brew install k6"
    echo "  Linux:   sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69 && echo 'deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main' | sudo tee /etc/apt/sources.list.d/k6.list && sudo apt-get update && sudo apt-get install k6"
    echo "  Windows: choco install k6"
    echo ""
    exit 1
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

# Run k6 load test
k6 run "$LOAD_TEST_SCRIPT"

echo ""
echo "✅ Load test complete!"
echo ""
echo "📊 Results saved to:"
echo "  $ARTIFACTS_DIR/load-test-results.json"
echo ""
echo "📈 View results:"
echo "  cat $ARTIFACTS_DIR/load-test-results.json | jq '.metrics'"
echo ""

