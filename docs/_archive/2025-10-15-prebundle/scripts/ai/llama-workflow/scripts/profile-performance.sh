#!/usr/bin/env bash
#
# Performance profiling script for LlamaIndex MCP optimization
# Measures P50, P95, P99 latency for query operations
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ARTIFACTS_DIR="$PROJECT_ROOT/artifacts/ai/$(date +%Y%m%d-%H%M%S)"

mkdir -p "$ARTIFACTS_DIR"

echo "🎯 LlamaIndex Query Performance Profiling"
echo "=========================================="
echo ""
echo "Artifacts directory: $ARTIFACTS_DIR"
echo ""

# Test queries from eval dataset
TEST_QUERIES=(
  "How do I integrate with HotDash?"
  "What are the pricing options for HotDash?"
  "How do I configure webhooks in my application?"
  "What telemetry data does HotDash collect?"
  "How do I troubleshoot authentication issues?"
  "What are the system requirements for HotDash?"
  "How do I set up monitoring and alerts?"
  "What data retention policies does HotDash have?"
)

# Number of iterations per query
ITERATIONS=10

# Results file
RESULTS_FILE="$ARTIFACTS_DIR/performance-results.jsonl"
SUMMARY_FILE="$ARTIFACTS_DIR/performance-summary.md"

echo "Running $ITERATIONS iterations per query..."
echo ""

for query in "${TEST_QUERIES[@]}"; do
  echo "Query: $query"
  
  for i in $(seq 1 $ITERATIONS); do
    # Measure execution time
    START_TIME=$(date +%s%3N)
    
    # Run query (capturing both stdout and stderr)
    npm --prefix "$SCRIPT_DIR/.." run query -- -q "$query" --topK 5 > /dev/null 2>&1 || true
    
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    
    # Write result as JSONL
    echo "{\"query\":\"$query\",\"iteration\":$i,\"duration_ms\":$DURATION,\"timestamp\":\"$(date -Iseconds)\"}" >> "$RESULTS_FILE"
    
    printf "."
  done
  
  echo " done"
done

echo ""
echo "✅ Profiling complete. Generating summary..."

# Generate summary statistics using Node.js
node - <<'EOF' "$RESULTS_FILE" "$SUMMARY_FILE"
const fs = require('fs');
const [resultsFile, summaryFile] = process.argv.slice(2);

// Read results
const lines = fs.readFileSync(resultsFile, 'utf-8').trim().split('\n');
const results = lines.map(line => JSON.parse(line));

// Group by query
const byQuery = {};
results.forEach(r => {
  if (!byQuery[r.query]) byQuery[r.query] = [];
  byQuery[r.query].push(r.duration_ms);
});

// Calculate percentiles
function percentile(arr, p) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function min(arr) {
  return Math.min(...arr);
}

function max(arr) {
  return Math.max(...arr);
}

// Generate markdown summary
let summary = '# LlamaIndex Query Performance Baseline\n\n';
summary += `**Generated:** ${new Date().toISOString()}\n\n`;
summary += `**Test Configuration:**\n`;
summary += `- Queries: ${Object.keys(byQuery).length}\n`;
summary += `- Iterations per query: ${Math.max(...Object.values(byQuery).map(v => v.length))}\n`;
summary += `- Total measurements: ${results.length}\n\n`;

summary += '## Overall Statistics\n\n';

const allDurations = results.map(r => r.duration_ms);
summary += `| Metric | Value (ms) |\n`;
summary += `|--------|------------|\n`;
summary += `| **P50** | ${percentile(allDurations, 50).toFixed(2)} |\n`;
summary += `| **P95** | ${percentile(allDurations, 95).toFixed(2)} |\n`;
summary += `| **P99** | ${percentile(allDurations, 99).toFixed(2)} |\n`;
summary += `| Mean | ${avg(allDurations).toFixed(2)} |\n`;
summary += `| Min | ${min(allDurations).toFixed(2)} |\n`;
summary += `| Max | ${max(allDurations).toFixed(2)} |\n\n`;

summary += '## Per-Query Breakdown\n\n';

Object.entries(byQuery).forEach(([query, durations]) => {
  summary += `### "${query}"\n\n`;
  summary += `| Metric | Value (ms) |\n`;
  summary += `|--------|------------|\n`;
  summary += `| P50 | ${percentile(durations, 50).toFixed(2)} |\n`;
  summary += `| P95 | ${percentile(durations, 95).toFixed(2)} |\n`;
  summary += `| P99 | ${percentile(durations, 99).toFixed(2)} |\n`;
  summary += `| Mean | ${avg(durations).toFixed(2)} |\n`;
  summary += `| Min | ${min(durations).toFixed(2)} |\n`;
  summary += `| Max | ${max(durations).toFixed(2)} |\n\n`;
});

summary += '## Target vs Baseline\n\n';
const p95 = percentile(allDurations, 95);
const target = 500;
const improvement = ((p95 - target) / p95 * 100).toFixed(1);

summary += `- **Target P95:** ${target}ms\n`;
summary += `- **Current P95:** ${p95.toFixed(2)}ms\n`;

if (p95 > target) {
  summary += `- **Required Improvement:** ${improvement}% reduction needed\n`;
  summary += `- ❌ **Status:** Not meeting target\n\n`;
} else {
  summary += `- ✅ **Status:** Meeting target!\n\n`;
}

summary += '## Next Steps\n\n';
if (p95 > target) {
  summary += '1. Implement query result caching (5-minute TTL)\n';
  summary += '2. Optimize vector search parameters (topK, similarity threshold)\n';
  summary += '3. Pre-warm index on server startup\n';
  summary += '4. Consider Redis for distributed caching\n';
  summary += '5. Profile LlamaIndex internals for bottlenecks\n';
} else {
  summary += '1. Maintain current performance with regular monitoring\n';
  summary += '2. Implement caching for further improvements\n';
  summary += '3. Set up alerts for P95 > 400ms\n';
}

fs.writeFileSync(summaryFile, summary);

console.log('\n📊 Performance Summary:');
console.log(`   P50: ${percentile(allDurations, 50).toFixed(2)}ms`);
console.log(`   P95: ${percentile(allDurations, 95).toFixed(2)}ms`);
console.log(`   P99: ${percentile(allDurations, 99).toFixed(2)}ms`);
console.log(`\nTarget P95: ${target}ms`);

if (p95 > target) {
  console.log(`⚠️  Current P95 exceeds target by ${(p95 - target).toFixed(2)}ms (${improvement}% slower)`);
} else {
  console.log(`✅ Current P95 meets target!`);
}

console.log(`\n📄 Full report: ${summaryFile}`);
EOF

echo ""
echo "✅ Performance profiling complete!"
echo ""
echo "Results:"
echo "  - Raw data: $RESULTS_FILE"
echo "  - Summary: $SUMMARY_FILE"
echo ""
cat "$SUMMARY_FILE"

