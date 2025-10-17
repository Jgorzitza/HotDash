# MCP Server Health Monitoring

**Owner:** Integrations + Reliability  
**Created:** 2025-10-11  
**Purpose:** Automated monitoring of all 7 MCP servers

---

## Overview

HotDash relies on 7 Model Context Protocol (MCP) servers for development and operations. This document describes the automated health monitoring system that ensures all MCPs remain operational.

---

## Monitoring Scripts

### 1. Interactive Health Check

**Script:** `scripts/ops/mcp-health-check.sh`  
**Purpose:** Manual health checks with detailed output  
**Usage:**

```bash
./scripts/ops/mcp-health-check.sh
```

**Features:**

- Color-coded console output
- Response time measurements
- Detailed JSON report
- Full test log with timestamps

**Output:**

- `artifacts/integrations/mcp-health-checks/health-check-{timestamp}.json`
- `artifacts/integrations/mcp-health-checks/health-check-{timestamp}.log`

### 2. Cron-Optimized Health Check

**Script:** `scripts/ops/mcp-health-check-cron.sh`  
**Purpose:** Automated scheduled monitoring  
**Usage:**

```bash
# Add to crontab
0 */6 * * * /path/to/HotDash/hot-dash/scripts/ops/mcp-health-check-cron.sh

# Or run manually
./scripts/ops/mcp-health-check-cron.sh
```

**Features:**

- Silent execution (suitable for cron)
- Email alerts on failures
- Lightweight (tests only critical MCPs)
- Configurable alert thresholds

**Configuration:**

```bash
# Set alert email (default: devops@hotrodan.com)
export MCP_ALERT_EMAIL="your-email@domain.com"
```

### 3. GitHub Actions Workflow

**File:** `.github/workflows/mcp-health-check.yml`  
**Schedule:** Every 6 hours  
**Purpose:** CI/CD-integrated monitoring

**Manual Trigger:**

```bash
# Via GitHub CLI
gh workflow run mcp-health-check.yml

# Via GitHub UI
Actions → MCP Server Health Check → Run workflow
```

**Artifacts:**

- Health reports uploaded to GitHub Actions artifacts
- Retained for 30 days
- Downloadable via Actions UI

---

## Monitored MCP Servers

| #   | Server           | Type   | Test Method        | Expected       |
| --- | ---------------- | ------ | ------------------ | -------------- |
| 1   | shopify-dev-mcp  | NPM    | `npx` availability | Command exists |
| 2   | context7         | HTTP   | localhost:3001/mcp | HTTP 406       |
| 3   | github-official  | Docker | Container check    | Running        |
| 4   | supabase         | NPM    | `npx` availability | Command exists |
| 5   | fly              | HTTP   | localhost:8080/mcp | HTTP 200       |
| 6   | google-analytics | pipx   | Package check      | Installed      |
| 7   | llamaindex-rag   | HTTP   | Fly.io endpoint    | HTTP 200\*     |

**Note:** \*LlamaIndex RAG expected to fail until deployed (Week 1-2)

---

## Health Status Definitions

### Healthy ✅

- Server responds as expected
- Response time < 5 seconds
- No errors in logs

### Degraded ⚠️

- Server responds but with unexpected status code
- Response time > 5 seconds
- Non-critical errors

### Failed ❌

- Server doesn't respond
- Connection timeout or refused
- Critical errors

---

## Alert Thresholds

### Critical Alert (Exit 1)

- 2 or more configured MCPs failed
- Context7 or Shopify MCP down (critical for development)
- All HTTP endpoints failing (network issue)

### Warning Alert (Exit 2)

- 1 MCP degraded/failed
- Response times elevated (> 3 seconds)
- LlamaIndex RAG down (expected until deployed)

### Healthy (Exit 0)

- All configured MCPs operational
- Response times normal
- No connectivity issues

---

## Cron Setup Instructions

### For Development Machines

```bash
# Edit crontab
crontab -e

# Add health check every 6 hours
0 */6 * * * cd /home/justin/HotDash/hot-dash && ./scripts/ops/mcp-health-check-cron.sh >> /tmp/mcp-health.log 2>&1

# Set alert email
echo 'export MCP_ALERT_EMAIL="your-email@domain.com"' >> ~/.bashrc
```

### For Server Environments

```bash
# System-wide cron
sudo vi /etc/cron.d/mcp-health

# Add entry
0 */6 * * * www-data cd /var/www/hotdash && ./scripts/ops/mcp-health-check-cron.sh

# Ensure permissions
chmod +x /var/www/hotdash/scripts/ops/mcp-health-check-cron.sh
```

---

## GitHub Actions Integration

### Automatic Execution

The GitHub Actions workflow runs automatically:

- **Schedule:** Every 6 hours (0:00, 6:00, 12:00, 18:00 UTC)
- **Branch:** Runs on default branch (main/originstory)
- **Artifacts:** Health reports saved for 30 days

### Manual Execution

```bash
# Trigger via CLI
gh workflow run mcp-health-check.yml

# Check status
gh run list --workflow=mcp-health-check.yml

# Download artifacts
gh run download <run-id>
```

### Workflow Notifications

- ✅ Success: No notification (quiet success)
- ⚠️ Degraded: Warning annotation
- ❌ Failed: Workflow fails, sends GitHub notification

---

## Troubleshooting Common Issues

### Context7 Returns 406

**Status:** Expected behavior  
**Reason:** Direct HTTP access returns "Not Acceptable"  
**Impact:** None (MCP clients use proper protocol)  
**Action:** No action required

### LlamaIndex RAG Fails

**Status:** Expected until deployed  
**Reason:** Service not yet deployed to Fly.io  
**Timeline:** Week 1-2 implementation  
**Action:** Monitor Engineer progress

### Multiple Container Warnings

**Status:** Needs investigation  
**Possible Causes:**

- Container startup script not cleaning up
- Multiple agent sessions creating containers
- Container restart loops

**Action:** Run container cleanup:

```bash
# See running containers
docker ps --filter "ancestor=mcp/context7"

# Clean up orphaned containers
docker ps -q --filter "ancestor=mcp/context7" --filter "status=exited" | xargs docker rm
```

### NPM Package Failures

**Status:** Needs investigation  
**Possible Causes:**

- npm/npx not in PATH
- Package cache corrupted
- Network issues

**Action:** Verify npm:

```bash
which npx
npm --version
npx @shopify/dev-mcp@latest --version
```

---

## Health Report Format

### JSON Structure

```json
{
  "timestamp": "2025-10-11T21:10:39Z",
  "hostname": "machine-name",
  "total_mcps": 6,
  "healthy": 5,
  "failed": 1,
  "alert_sent": false,
  "results": [
    {
      "name": "shopify-dev-mcp",
      "status": "HEALTHY",
      "response_time_ms": 150
    }
  ]
}
```

### Log Format

```
=== MCP Server Health Check ===
Timestamp: Sat Oct 11 21:10:39 UTC 2025
Host: hostname

--- MCP Server Tests ---
✅ shopify-dev-mcp: HEALTHY [150ms]
❌ llamaindex-rag: FAILED [timeout]

--- Summary ---
Total: 6
Healthy: 5
Failed: 1
```

---

## Alert Email Template

```
Subject: MCP Health Alert - {failed_count} Servers Failed

MCP Health Check failed on {hostname} at {timestamp}

Failed: {failed_count} of {total} servers
Healthy: {healthy_count}

Failed Servers:
- {server_name_1}
- {server_name_2}

Log file: {log_path}

[Log tail - last 20 lines]
```

---

## Integration with Monitoring Systems

### Prometheus Metrics (Future)

```bash
# Export metrics for Prometheus scraping
# Create /metrics endpoint with MCP health status
mcp_server_up{server="shopify-dev-mcp"} 1
mcp_server_up{server="context7"} 1
mcp_server_response_time_ms{server="shopify-dev-mcp"} 150
```

### Slack/Discord Webhooks (Future)

```bash
# Send health status to Slack
curl -X POST ${SLACK_WEBHOOK_URL} \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "MCP Health Alert",
    "attachments": [{
      "color": "danger",
      "text": "2 MCPs failed health check"
    }]
  }'
```

---

## Maintenance

### Log Rotation

Health check logs accumulate over time. Rotate periodically:

```bash
# Keep last 30 days of logs
find artifacts/integrations/mcp-health-checks/ \
  -name "*.log" -mtime +30 -delete

# Keep last 90 days of JSON reports
find artifacts/integrations/mcp-health-checks/ \
  -name "*.json" -mtime +90 -delete
```

### Script Updates

When adding new MCP servers:

1. Update both health check scripts
2. Update GitHub Actions workflow (if dependencies needed)
3. Update this documentation
4. Update `docs/directions/mcp-tools-reference.md`

---

## Performance Baselines

**Expected Response Times:**

- NPM package checks: < 100ms
- HTTP localhost: < 100ms
- Docker checks: < 300ms
- pipx checks: < 500ms
- External HTTP (Fly.io): < 2000ms

**Alert if:**

- Any local MCP > 1000ms
- Any remote MCP > 5000ms
- Consistent failures over 3 checks

---

## Runbook: Responding to Alerts

### Step 1: Check Alert Details

```bash
# Read latest health log
cat artifacts/integrations/mcp-health-checks/cron-health-*.log | tail -50

# Check JSON summary
cat artifacts/integrations/mcp-health-checks/cron-health-*.json | jq .
```

### Step 2: Identify Failed Server(s)

- Context7: Check Docker containers
- HTTP MCPs: Check network/firewall
- NPM MCPs: Check npm installation
- pipx MCPs: Check pipx installation

### Step 3: Attempt Remediation

```bash
# Restart Context7
docker restart context7-mcp

# Check Fly MCP server
curl -v http://127.0.0.1:8080/mcp

# Reinstall analytics-mcp
pipx reinstall analytics-mcp
```

### Step 4: Escalate if Needed

If 2 attempts fail:

1. Log in feedback/integrations.md with evidence
2. Tag appropriate owner (Engineer, Reliability, Deployment)
3. Include: Failure details, attempted fixes, timestamps

---

## Testing the Monitoring System

### Manual Test

```bash
# Run health check
./scripts/ops/mcp-health-check.sh

# Expected: Exit 0 or 2 (degraded acceptable)
echo "Exit code: $?"
```

### Simulate Failure

```bash
# Stop Context7
docker stop context7-mcp

# Run health check (should fail)
./scripts/ops/mcp-health-check-cron.sh

# Expected: Exit 1, alert triggered

# Restart Context7
docker start context7-mcp
```

### Test GitHub Actions

```bash
# Trigger workflow
gh workflow run mcp-health-check.yml

# Monitor progress
gh run watch

# Check artifacts
gh run list --workflow=mcp-health-check.yml
```

---

## Related Documentation

- `docs/directions/mcp-tools-reference.md` - All 7 MCP servers
- `docs/ops/credential_index.md` - MCP authentication
- `feedback/integrations.md` - Health check history

---

**Documentation Created:** 2025-10-11 21:26 UTC  
**Next Review:** When new MCPs added or monitoring issues arise
