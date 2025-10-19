# Analytics Cron Jobs Configuration

## Overview

Automated nightly jobs for analytics monitoring and data capture. All jobs run in Pacific Time (PT) to align with business operations.

**Environment**: Production  
**Timezone**: America/Los_Angeles (PT)  
**User**: Application service account  
**Log Location**: `artifacts/analytics/cron-logs/`

---

## Scheduled Jobs

### 1. Sampling Guard Proof (Nightly Anomaly Detection)

**Schedule**: Daily at 2:00 AM PT  
**Script**: `scripts/analytics/sampling-guard-proof.mjs`  
**Duration**: ~30 seconds  
**Output**: `artifacts/analytics/sampling-proofs/sampling-proof-YYYYMMDD.json`

**Crontab Entry**:

```cron
0 2 * * * cd /home/justin/HotDash/hot-dash && node scripts/analytics/sampling-guard-proof.mjs >> artifacts/analytics/cron-logs/sampling-guard.log 2>&1
```

**Purpose**:

- Validates analytics data quality
- Detects anomalies in revenue, conversion, traffic metrics
- Generates proof output for CEO review
- Alerts on sampling issues or data integrity problems

**Success Criteria**:

- Exit code 0 (all checks passed)
- JSON output file generated
- 6/6 checks passing (Revenue Range, Revenue Trend, Conversion Rate Range, Conversion Rate Trend, Sessions Range, Sessions Trend)

**Failure Handling**:

- Exit code 1: Warnings detected (requires review)
- Exit code 2: Critical failures (immediate alert)
- Proof file contains anomalies array with details

**Monitoring**:

```bash
# Check last run status
tail -20 artifacts/analytics/cron-logs/sampling-guard.log

# Verify proof file exists and is valid
cat artifacts/analytics/sampling-proofs/sampling-proof-$(date +%Y%m%d).json | jq '.status'
```

---

### 2. Dashboard Snapshot Generation (Metrics Capture)

**Schedule**: Daily at 3:00 AM PT  
**Script**: `scripts/analytics/generate-snapshot.mjs`  
**Duration**: ~45 seconds  
**Output**: `artifacts/analytics/snapshots/YYYY-MM-DD.json`

**Crontab Entry**:

```cron
0 3 * * * cd /home/justin/HotDash/hot-dash && node scripts/analytics/generate-snapshot.mjs >> artifacts/analytics/cron-logs/snapshot.log 2>&1
```

**Purpose**:

- Captures all dashboard metrics (revenue, conversion, traffic, idea pool)
- Provides historical tracking
- Enables trend analysis and comparisons
- CEO daily review artifact

**Success Criteria**:

- Exit code 0 (snapshot generated)
- JSON output file generated with all 4 metric categories
- Summary section contains valid totals

**Failure Handling**:

- Exit code 1: Partial failure (some metrics missing)
- Errors array in JSON output contains details
- Gracefully degrades (missing data marked in errors)

**Monitoring**:

```bash
# Check last run status
tail -20 artifacts/analytics/cron-logs/snapshot.log

# Verify snapshot exists and has all metrics
cat artifacts/analytics/snapshots/$(date +%Y-%m-%d).json | jq '.metrics | keys'
```

---

### 3. Weekly Metrics Export (CEO Manual Analysis)

**Schedule**: Every Monday at 4:00 AM PT  
**Script**: `scripts/analytics/export-metrics.mjs`  
**Duration**: ~20 seconds  
**Output**: `artifacts/analytics/exports/metrics-weekly-YYYYMMDD.csv`

**Crontab Entry**:

```cron
0 4 * * 1 cd /home/justin/HotDash/hot-dash && node scripts/analytics/export-metrics.mjs --format=csv --output=artifacts/analytics/exports/metrics-weekly-$(date +%Y%m%d).csv >> artifacts/analytics/cron-logs/export.log 2>&1
```

**Purpose**:

- Exports all metrics to CSV for spreadsheet analysis
- Weekly backup of key business metrics
- Enables custom CEO reporting and dashboards

**Success Criteria**:

- Exit code 0 (export successful)
- CSV file generated with header + data rows
- All requested metrics included

**Monitoring**:

```bash
# Check last run status
tail -20 artifacts/analytics/cron-logs/export.log

# Verify CSV exists and has data
wc -l artifacts/analytics/exports/metrics-weekly-*.csv | tail -5
```

---

## Cron Setup Instructions

### Install Cron Jobs

```bash
# Edit crontab
crontab -e

# Add these entries (adjust path as needed):
0 2 * * * cd /home/justin/HotDash/hot-dash && node scripts/analytics/sampling-guard-proof.mjs >> artifacts/analytics/cron-logs/sampling-guard.log 2>&1
0 3 * * * cd /home/justin/HotDash/hot-dash && node scripts/analytics/generate-snapshot.mjs >> artifacts/analytics/cron-logs/snapshot.log 2>&1
0 4 * * 1 cd /home/justin/HotDash/hot-dash && node scripts/analytics/export-metrics.mjs --format=csv --output=artifacts/analytics/exports/metrics-weekly-$(date +%Y%m%d).csv >> artifacts/analytics/cron-logs/export.log 2>&1

# Save and verify
crontab -l | grep analytics
```

### Create Log Directories

```bash
cd /home/justin/HotDash/hot-dash
mkdir -p artifacts/analytics/cron-logs
mkdir -p artifacts/analytics/sampling-proofs
mkdir -p artifacts/analytics/snapshots
mkdir -p artifacts/analytics/exports
```

### Verify Node.js Path

```bash
# Ensure Node.js is available in cron environment
which node  # Should return /path/to/node

# If cron can't find node, use absolute path in crontab:
/usr/bin/node scripts/analytics/sampling-guard-proof.mjs
```

---

## Log Rotation

Prevent log files from growing indefinitely:

```bash
# Create logrotate config: /etc/logrotate.d/analytics
/home/justin/HotDash/hot-dash/artifacts/analytics/cron-logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 appuser appuser
}

# Test logrotate
sudo logrotate -f /etc/logrotate.d/analytics
```

---

## Monitoring & Alerts

### Health Checks

Create a monitoring script to verify cron jobs ran successfully:

```bash
#!/bin/bash
# scripts/analytics/check-cron-health.sh

TODAY=$(date +%Y-%m-%d)
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)

echo "Analytics Cron Health Check - $TODAY"
echo "======================================="

# Check sampling guard proof (should exist from today or yesterday)
if [ -f "artifacts/analytics/sampling-proofs/sampling-proof-$(date +%Y%m%d).json" ]; then
    echo "✓ Sampling guard proof: EXISTS (today)"
    STATUS=$(cat artifacts/analytics/sampling-proofs/sampling-proof-$(date +%Y%m%d).json | jq -r '.status')
    echo "  Status: $STATUS"
else
    echo "✗ Sampling guard proof: MISSING"
fi

# Check snapshot (should exist from today or yesterday)
if [ -f "artifacts/analytics/snapshots/$TODAY.json" ]; then
    echo "✓ Dashboard snapshot: EXISTS (today)"
else
    echo "✗ Dashboard snapshot: MISSING"
fi

# Check log freshness
LAST_SAMPLING=$(stat -c %Y artifacts/analytics/cron-logs/sampling-guard.log 2>/dev/null || echo 0)
NOW=$(date +%s)
AGE=$((NOW - LAST_SAMPLING))
HOURS=$((AGE / 3600))

if [ $HOURS -lt 30 ]; then
    echo "✓ Sampling guard log: FRESH ($HOURS hours old)"
else
    echo "✗ Sampling guard log: STALE ($HOURS hours old)"
fi

echo "======================================="
```

### Alert Integration

Add to monitoring system (e.g., Prometheus, Datadog, PagerDuty):

1. **File Existence Check**: Alert if proof/snapshot files missing after 3:30 AM PT
2. **Log Monitoring**: Parse logs for "Status: FAILED" or exit codes
3. **Anomaly Alerts**: Parse proof JSON for anomalies array length > 0
4. **Disk Space**: Monitor artifacts directory size (target: < 500MB)

---

## Rollback & Recovery

### Disable Cron Jobs

```bash
# Comment out analytics cron jobs
crontab -e
# Add '#' before each analytics line

# Verify disabled
crontab -l | grep analytics
```

### Re-run Failed Job Manually

```bash
cd /home/justin/HotDash/hot-dash

# Sampling guard
node scripts/analytics/sampling-guard-proof.mjs

# Snapshot
node scripts/analytics/generate-snapshot.mjs

# Export
node scripts/analytics/export-metrics.mjs --format=csv
```

### Clean Up Old Artifacts

```bash
# Keep last 90 days only
find artifacts/analytics/sampling-proofs -name "*.json" -mtime +90 -delete
find artifacts/analytics/snapshots -name "*.json" -mtime +90 -delete
find artifacts/analytics/exports -name "*.csv" -mtime +90 -delete
```

---

## Deployment Checklist

- [ ] Node.js installed and accessible in cron environment
- [ ] Scripts executable (`chmod +x scripts/analytics/*.mjs`)
- [ ] Artifact directories created with proper permissions
- [ ] Cron jobs added to crontab
- [ ] Timezone verified (PT/America/Los_Angeles)
- [ ] Log rotation configured
- [ ] Monitoring/alerts configured
- [ ] Health check script deployed
- [ ] Test run completed for each job
- [ ] Documentation reviewed by DevOps

---

## Troubleshooting

### Job Not Running

```bash
# Check cron service status
sudo service cron status

# View cron logs
grep CRON /var/log/syslog | tail -20

# Test cron environment
* * * * * env > /tmp/cron-env.txt
# Compare with user environment
```

### Script Errors

```bash
# Run manually with full output
cd /home/justin/HotDash/hot-dash
node scripts/analytics/sampling-guard-proof.mjs 2>&1 | tee test-run.log

# Check Node.js version
node --version  # Should be v18+ for ES modules
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R appuser:appuser artifacts/analytics

# Fix permissions
chmod -R 755 artifacts/analytics
chmod +x scripts/analytics/*.mjs
```

---

## Related Documentation

- **Sampling Guard Proof**: `scripts/analytics/sampling-guard-proof.mjs`
- **Snapshot Generation**: `scripts/analytics/generate-snapshot.mjs`
- **Metrics Export**: `scripts/analytics/export-metrics.mjs`
- **Analytics Pipeline**: `docs/specs/analytics_pipeline.md`
- **Health Check**: `app/routes/api.analytics.health.ts`
