#!/usr/bin/env bash
set -euo pipefail

# Cost Optimization Report
# Analyzes Fly.io infrastructure for cost optimization opportunities

echo "=================================================="
echo "Fly.io Cost Optimization Report"
echo "=================================================="
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================="

COST_REPORT="artifacts/monitoring/cost-optimization-$(date +%Y%m%d-%H%M%S).md"
mkdir -p artifacts/monitoring

cat > "$COST_REPORT" <<EOF
# Fly.io Cost Optimization Report
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Current Infrastructure

EOF

# Analyze each app
APPS=(
  "hotdash-staging"
  "hotdash-agent-service"
  "hotdash-llamaindex-mcp"
  "hotdash-chatwoot"
)

TOTAL_MACHINES=0
TOTAL_STOPPED=0

for app in "${APPS[@]}"; do
  echo "### $app" >> "$COST_REPORT"
  echo "" >> "$COST_REPORT"
  
  if fly status --app "$app" > /tmp/cost-status-$app.txt 2>&1; then
    # Count machines
    MACHINES=$(grep -c "started\|stopped" /tmp/cost-status-$app.txt || echo "0")
    STOPPED=$(grep -c "stopped" /tmp/cost-status-$app.txt || echo "0")
    RUNNING=$((MACHINES - STOPPED))
    
    echo "- **Total Machines**: $MACHINES" >> "$COST_REPORT"
    echo "- **Running**: $RUNNING" >> "$COST_REPORT"
    echo "- **Stopped**: $STOPPED" >> "$COST_REPORT"
    
    TOTAL_MACHINES=$((TOTAL_MACHINES + MACHINES))
    TOTAL_STOPPED=$((TOTAL_STOPPED + STOPPED))
    
    # Check auto-stop/auto-start
    if grep -q "auto" /tmp/cost-status-$app.txt 2>/dev/null; then
      echo "- **Auto-scaling**: ✅ Enabled" >> "$COST_REPORT"
    else
      echo "- **Auto-scaling**: ⚠️ Not detected (consider enabling)" >> "$COST_REPORT"
    fi
  else
    echo "- **Status**: ERROR fetching data" >> "$COST_REPORT"
  fi
  
  echo "" >> "$COST_REPORT"
done

# Cost optimization recommendations
cat >> "$COST_REPORT" <<'EOF'

## Cost Optimization Opportunities

### 1. Auto-Stop/Auto-Start Configuration
**Recommended for**: Background services (agent-service, llamaindex-mcp)

**Current State**:
- Agent Service: Check auto-stop settings
- LlamaIndex MCP: Check auto-stop settings

**Action**:
```bash
# Enable auto-stop for background services
fly scale count 1 --max-per-region 1 --app hotdash-agent-service
fly autoscale set min=0 max=1 --app hotdash-agent-service

fly scale count 1 --max-per-region 1 --app hotdash-llamaindex-mcp
fly autoscale set min=0 max=1 --app hotdash-llamaindex-mcp
```

**Estimated Savings**: $20-40/month per service

### 2. Machine Size Optimization
**Review**: Are machines right-sized for workload?

**Actions**:
1. Monitor CPU/memory usage over 1 week
2. Identify under-utilized machines (CPU <30%, Memory <50%)
3. Consider smaller VM sizes for low-traffic apps

**Command to check**:
```bash
fly status --app <app>  # Check current VM size
fly scale vm shared-cpu-1x --app <app>  # Downsize if appropriate
```

**Estimated Savings**: $10-20/month per downsized machine

### 3. Region Consolidation
**Current**: Check if apps are deployed in optimal regions

**Actions**:
1. Review user traffic patterns
2. Consolidate to primary region if global distribution not needed
3. Keep staging in single region

**Estimated Savings**: $5-15/month (reduced data transfer)

### 4. Volume Optimization
**Review**: Persistent volumes usage and sizing

**Actions**:
```bash
# List all volumes
fly volumes list --app <app>

# Check for unused volumes
# Delete unused: fly volumes delete <volume-id>
```

**Estimated Savings**: $1-5/month per unused volume

### 5. Monitoring & Alerts Efficiency
**Current**: Every 15-minute monitoring via GitHub Actions

**Actions**:
1. Use Fly.io native metrics (free)
2. Reduce monitoring frequency to 30 min for non-critical apps
3. Use webhooks for real-time alerts (no polling)

**Estimated Savings**: Reduce GitHub Actions minutes

### 6. Database Connection Pooling
**Review**: Supabase connection pooling configuration

**Actions**:
1. Verify Prisma connection pool size
2. Use transaction pooling for read-heavy workloads
3. Enable PgBouncer in Supabase

**Estimated Savings**: Better performance, potential DB tier reduction

## Cost Summary

EOF

echo "### Current Metrics" >> "$COST_REPORT"
echo "- **Total Machines**: $TOTAL_MACHINES" >> "$COST_REPORT"
echo "- **Running Machines**: $((TOTAL_MACHINES - TOTAL_STOPPED))" >> "$COST_REPORT"
echo "- **Stopped Machines**: $TOTAL_STOPPED" >> "$COST_REPORT"
echo "" >> "$COST_REPORT"

# Calculate potential savings
POTENTIAL_SAVINGS=$((TOTAL_MACHINES * 15))  # Rough estimate $15/month per machine optimization

cat >> "$COST_REPORT" <<EOF

### Potential Monthly Savings
- **Estimated**: \$${POTENTIAL_SAVINGS}-\$${POTENTIAL_SAVINGS}+/month
- **Quick Wins**: Auto-stop background services
- **Medium Term**: Right-size VMs based on usage data
- **Long Term**: Optimize database and storage

## Recommended Actions (Priority Order)

1. **Immediate** (This Week):
   - ✅ Enable auto-stop for agent-service and llamaindex-mcp
   - ✅ Review and delete unused volumes
   - ✅ Document current VM sizes for all apps

2. **Short Term** (This Month):
   - Monitor CPU/memory for 1 week
   - Right-size VMs based on actual usage
   - Consolidate regions if appropriate

3. **Medium Term** (Next Quarter):
   - Implement connection pooling optimization
   - Review data transfer costs
   - Consider reserved capacity (if available)

## Cost Tracking

**Next Review**: $(date -u -d '+1 month' +"%Y-%m-%d" 2>/dev/null || date -u +"%Y-%m-%d")

**Baseline Costs** (Document current):
- Fly.io: \$___ /month
- Supabase: \$___ /month
- GitHub Actions: \$___ /month (if paid)
- Total: \$___ /month

EOF

echo "" >> "$COST_REPORT"
echo "---" >> "$COST_REPORT"
echo "Report generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$COST_REPORT"

# Clean up
rm -f /tmp/cost-status-*.txt

echo "=================================================="
echo "Cost Optimization Report Complete"
echo "=================================================="
echo "Potential Savings: \$${POTENTIAL_SAVINGS}+/month"
echo "Report: $COST_REPORT"
echo ""
echo "Quick Wins:"
echo "1. Enable auto-stop for background services"
echo "2. Review and delete unused volumes"
echo "3. Monitor usage before right-sizing"
echo "=================================================="

exit 0

