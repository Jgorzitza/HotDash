#!/bin/bash
# MCP Health Check - Cron-Optimized Version
# Purpose: Monitor MCP servers and alert on failures
# Usage: Add to crontab for automated monitoring
# Cron Example: 0 */6 * * * /path/to/mcp-health-check-cron.sh

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/artifacts/integrations/mcp-health-checks"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
LOG_FILE="${LOG_DIR}/cron-health-${TIMESTAMP}.log"
JSON_FILE="${LOG_DIR}/cron-health-${TIMESTAMP}.json"

# Email alert configuration (customize as needed)
ALERT_EMAIL="${MCP_ALERT_EMAIL:-devops@hotrodan.com}"
ALERT_THRESHOLD=2  # Alert if 2 or more critical MCPs fail

# Create log directory
mkdir -p "${LOG_DIR}"

# Redirect all output to log file
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "=== MCP Health Check (Cron) ==="
echo "Timestamp: $(date -u)"
echo "Host: $(hostname)"
echo ""

# Track results
TOTAL=6  # Only count configured MCPs (not LlamaIndex in dev)
HEALTHY=0
FAILED=0

# Test each critical MCP (simple pass/fail)
test_critical_mcp() {
    local name=$1
    local test_cmd=$2
    
    echo "Testing ${name}..."
    if eval "$test_cmd" &>/dev/null; then
        echo "✅ ${name}: HEALTHY"
        ((HEALTHY++))
    else
        echo "❌ ${name}: FAILED"
        ((FAILED++))
    fi
}

# Test critical MCPs only (skip LlamaIndex - in development)
test_critical_mcp "shopify-dev-mcp" "command -v npx >/dev/null"
test_critical_mcp "context7" "curl -s -m 3 http://localhost:3001/mcp >/dev/null 2>&1"
test_critical_mcp "github-official" "docker ps --filter 'ancestor=ghcr.io/github/github-mcp-server' -q | grep -q ."
test_critical_mcp "supabase" "command -v npx >/dev/null"
test_critical_mcp "fly" "curl -s -m 3 http://127.0.0.1:8080/mcp >/dev/null 2>&1"
test_critical_mcp "google-analytics" "pipx list 2>/dev/null | grep -q analytics-mcp"

echo ""
echo "--- Summary ---"
echo "Total: ${TOTAL}"
echo "Healthy: ${HEALTHY}"
echo "Failed: ${FAILED}"

# Generate JSON
cat > "${JSON_FILE}" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "hostname": "$(hostname)",
  "total_mcps": ${TOTAL},
  "healthy": ${HEALTHY},
  "failed": ${FAILED},
  "alert_sent": false
}
EOF

# Alert logic
if [ "${FAILED}" -ge "${ALERT_THRESHOLD}" ]; then
    echo ""
    echo "🚨 ALERT: ${FAILED} MCPs failed (threshold: ${ALERT_THRESHOLD})"
    
    # Send email alert (requires mail/sendmail configured)
    if command -v mail >/dev/null 2>&1; then
        {
            echo "Subject: MCP Health Alert - ${FAILED} Servers Failed"
            echo ""
            echo "MCP Health Check failed on $(hostname) at $(date -u)"
            echo ""
            echo "Failed: ${FAILED} of ${TOTAL} servers"
            echo "Healthy: ${HEALTHY}"
            echo ""
            echo "Log file: ${LOG_FILE}"
            echo ""
            tail -20 "${LOG_FILE}"
        } | mail -s "MCP Health Alert" "${ALERT_EMAIL}"
        
        # Update JSON
        sed -i 's/"alert_sent": false/"alert_sent": true/' "${JSON_FILE}"
        echo "Alert email sent to ${ALERT_EMAIL}"
    else
        echo "⚠️  mail command not available - alert not sent"
    fi
    
    exit 1
elif [ "${FAILED}" -gt 0 ]; then
    echo "⚠️  Warning: ${FAILED} MCP(s) failed but below alert threshold"
    exit 2
else
    echo "✅ All MCPs healthy"
    exit 0
fi

