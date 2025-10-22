# Growth Engine Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting procedures for Growth Engine phases 9-12, with step-by-step solutions for common issues and advanced diagnostic techniques.

## Phase 9: MCP Evidence System Troubleshooting

### Issue: Missing Evidence Files

#### Symptoms
- CI fails with "MCP Evidence files not found"
- PR template shows "No MCP usage - non-code change" when evidence should exist
- Evidence directory structure missing

#### Diagnosis Steps
1. **Check Directory Structure**:
   ```bash
   ls -la artifacts/
   ls -la artifacts/<agent>/
   ls -la artifacts/<agent>/<YYYY-MM-DD>/
   ls -la artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```

2. **Verify Agent Configuration**:
   ```bash
   echo $AGENT_NAME
   echo $CURRENT_DATE
   ```

3. **Check File Permissions**:
   ```bash
   ls -la artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```

#### Resolution
1. **Create Missing Directories**:
   ```bash
   mkdir -p artifacts/<agent>/<YYYY-MM-DD>/mcp/
   chmod 755 artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```

2. **Initialize Evidence File**:
   ```bash
   touch artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   chmod 644 artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

3. **Verify Creation**:
   ```bash
   ls -la artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```

### Issue: Invalid JSONL Format

#### Symptoms
- CI fails with "Invalid JSON in evidence file"
- JSONL file contains malformed JSON
- Evidence entries not properly formatted

#### Diagnosis Steps
1. **Check JSONL Format**:
   ```bash
   cat artifacts/<agent>/<YYYY-MM-DD>/mcp/*.jsonl | jq .
   ```

2. **Validate Each Line**:
   ```bash
   while IFS= read -r line; do
     echo "$line" | jq . > /dev/null || echo "Invalid JSON: $line"
   done < artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

#### Resolution
1. **Fix Malformed JSON**:
   ```bash
   # Remove invalid lines
   grep -v "Invalid JSON" artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl > temp.jsonl
   mv temp.jsonl artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

2. **Validate Required Fields**:
   ```bash
   # Check each entry has required fields
   while IFS= read -r line; do
     echo "$line" | jq -r '.tool, .doc_ref, .request_id, .timestamp, .purpose' | wc -l
   done < artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

### Issue: Evidence Not Logged

#### Symptoms
- MCP tool calls not recorded in evidence files
- Evidence service not working
- Missing evidence entries for MCP usage

#### Diagnosis Steps
1. **Check Evidence Service**:
   ```bash
   node -e "const { mcpEvidenceService } = require('./app/services/mcp-evidence.server.ts'); console.log('Service loaded');"
   ```

2. **Verify MCP Tool Calls**:
   ```bash
   # Check if MCP tools are being called
   grep -r "mcpEvidenceService" app/ --include="*.ts" --include="*.tsx"
   ```

#### Resolution
1. **Initialize Evidence Service**:
   ```typescript
   import { mcpEvidenceService } from '~/services/mcp-evidence.server';
   
   // Initialize evidence file
   await mcpEvidenceService.initializeEvidenceFile(agent, date, topic);
   ```

2. **Log MCP Usage**:
   ```typescript
   await mcpEvidenceService.appendEvidence(agent, date, topic, {
     tool: 'shopify-dev',
     doc_ref: 'https://shopify.dev/docs/api/admin-rest',
     request_id: 'req_123',
     timestamp: new Date().toISOString(),
     purpose: 'Get product data'
   });
   ```

## Phase 10: Heartbeat Monitoring Troubleshooting

### Issue: Stale Heartbeats

#### Symptoms
- CI fails with "Heartbeat is stale"
- Last heartbeat entry older than 15 minutes
- Agent appears idle

#### Diagnosis Steps
1. **Check Last Heartbeat**:
   ```bash
   tail -1 artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | jq .
   ```

2. **Calculate Time Difference**:
   ```bash
   last_heartbeat=$(tail -1 artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | jq -r '.timestamp')
   current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
   echo "Last heartbeat: $last_heartbeat"
   echo "Current time: $current_time"
   ```

#### Resolution
1. **Update Heartbeat**:
   ```bash
   echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","task":"'$TASK_ID'","status":"doing","progress":"50%"}' >> artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

2. **Start Heartbeat Monitoring**:
   ```typescript
   import { heartbeatService } from '~/services/heartbeat.server';
   
   // Start monitoring
   const interval = await heartbeatService.startHeartbeatMonitoring(
     agent, date, task, 15 // 15 minutes
   );
   ```

### Issue: Missing Heartbeat Files

#### Symptoms
- CI fails with "Heartbeat files not found"
- No heartbeat tracking for long-running tasks
- Heartbeat directory missing

#### Diagnosis Steps
1. **Check Heartbeat Directory**:
   ```bash
   ls -la artifacts/<agent>/<YYYY-MM-DD>/
   ```

2. **Verify Task Duration**:
   ```bash
   # Check if task is >2 hours
   echo "Task estimated hours: $ESTIMATED_HOURS"
   ```

#### Resolution
1. **Create Heartbeat File**:
   ```bash
   mkdir -p artifacts/<agent>/<YYYY-MM-DD>/
   touch artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   chmod 644 artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

2. **Initialize Heartbeat Service**:
   ```typescript
   import { heartbeatService } from '~/services/heartbeat.server';
   
   // Initialize heartbeat file
   await heartbeatService.initializeHeartbeatFile(agent, date);
   ```

### Issue: Invalid NDJSON Format

#### Symptoms
- CI fails with "Invalid JSON in heartbeat file"
- NDJSON file contains malformed JSON
- Heartbeat entries not properly formatted

#### Diagnosis Steps
1. **Check NDJSON Format**:
   ```bash
   cat artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | jq .
   ```

2. **Validate Each Line**:
   ```bash
   while IFS= read -r line; do
     echo "$line" | jq . > /dev/null || echo "Invalid JSON: $line"
   done < artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

#### Resolution
1. **Fix Malformed JSON**:
   ```bash
   # Remove invalid lines
   grep -v "Invalid JSON" artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson > temp.ndjson
   mv temp.ndjson artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

2. **Validate Required Fields**:
   ```bash
   # Check each entry has required fields
   while IFS= read -r line; do
     echo "$line" | jq -r '.timestamp, .task, .status' | wc -l
   done < artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

## Phase 11: Dev MCP Ban Troubleshooting

### Issue: Dev MCP Imports in Production

#### Symptoms
- CI fails with "Dev MCP imports detected in production code"
- Build fails due to Dev MCP violations
- Production code contains banned imports

#### Diagnosis Steps
1. **Scan for Dev MCP Imports**:
   ```bash
   grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i -n
   ```

2. **Check Specific Files**:
   ```bash
   grep -r "@shopify/mcp-server-dev" app/ --include="*.ts" --include="*.tsx"
   grep -r "context7-mcp" app/ --include="*.ts" --include="*.tsx"
   grep -r "chrome-devtools-mcp" app/ --include="*.ts" --include="*.tsx"
   ```

#### Resolution
1. **Remove Dev MCP Imports**:
   ```bash
   # Remove banned imports from app directory
   find app/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '/@shopify\/mcp-server-dev/d'
   find app/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '/context7-mcp/d'
   find app/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '/chrome-devtools-mcp/d'
   ```

2. **Move to Allowed Directories**:
   ```bash
   # Move Dev MCP code to allowed directories
   mv app/dev-mcp-code/ scripts/
   mv app/test-mcp-code/ tests/
   ```

### Issue: False Positive Violations

#### Symptoms
- Legitimate imports flagged as Dev MCP violations
- CI fails for non-Dev MCP imports
- False positive detection

#### Diagnosis Steps
1. **Check Import Context**:
   ```bash
   grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i -A 2 -B 2
   ```

2. **Verify Import Purpose**:
   ```bash
   # Check if imports are actually Dev MCP
   grep -r "import.*mcp" app/ --include="*.ts" --include="*.tsx"
   ```

#### Resolution
1. **Update CI Configuration**:
   ```yaml
   # Update .github/workflows/dev-mcp-ban.yml
   - name: Check for Dev MCP imports in production code
     run: |
       # More specific pattern matching
       if grep -r "import.*@shopify/mcp-server-dev" app/ --include="*.ts" --include="*.tsx"; then
         echo "❌ Dev MCP imports detected"
         exit 1
       fi
   ```

2. **Whitelist Legitimate Imports**:
   ```bash
   # Add legitimate imports to whitelist
   echo "legitimate-mcp-import" >> .dev-mcp-whitelist
   ```

### Issue: Missing CI Checks

#### Symptoms
- Dev MCP Ban checks not running
- CI workflow not executing
- No validation of Dev MCP imports

#### Diagnosis Steps
1. **Check Workflow Configuration**:
   ```bash
   cat .github/workflows/dev-mcp-ban.yml
   ```

2. **Verify Workflow Triggers**:
   ```bash
   gh workflow list
   gh workflow view dev-mcp-ban.yml
   ```

#### Resolution
1. **Enable Workflow**:
   ```bash
   # Ensure workflow is enabled
   gh workflow enable dev-mcp-ban.yml
   ```

2. **Fix Workflow Configuration**:
   ```yaml
   name: Dev MCP Ban - Production Safety
   on:
     pull_request:
       branches: [main]
     push:
       branches: [main]
   ```

## Phase 12: CI Guards Troubleshooting

### Issue: Guard MCP Failures

#### Symptoms
- CI fails with "MCP Evidence validation failed"
- PR body missing MCP Evidence section
- Evidence files not found

#### Diagnosis Steps
1. **Check PR Body**:
   ```bash
   gh pr view <pr-number> --json body
   ```

2. **Verify Evidence Files**:
   ```bash
   find artifacts -name "*.jsonl" -type f
   ```

#### Resolution
1. **Add MCP Evidence Section**:
   ```markdown
   ## MCP Evidence (required for code changes)
   - artifacts/<agent>/<date>/mcp/<topic>.jsonl
   ```

2. **Create Missing Evidence Files**:
   ```bash
   mkdir -p artifacts/<agent>/<YYYY-MM-DD>/mcp/
   touch artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

### Issue: Idle Guard Failures

#### Symptoms
- CI fails with "Heartbeat validation failed"
- Heartbeat files missing or stale
- PR body missing Heartbeat section

#### Diagnosis Steps
1. **Check Heartbeat Files**:
   ```bash
   find artifacts -name "heartbeat.ndjson" -type f
   ```

2. **Verify Heartbeat Status**:
   ```bash
   cat artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | tail -1 | jq .
   ```

#### Resolution
1. **Add Heartbeat Section**:
   ```markdown
   ## Heartbeat (if task >2 hours)
   - [ ] Heartbeat files present: artifacts/<agent>/<date>/heartbeat.ndjson
   ```

2. **Update Heartbeat**:
   ```bash
   echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","task":"'$TASK_ID'","status":"doing"}' >> artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

### Issue: Workflow Not Running

#### Symptoms
- CI Guards not executing
- Workflow not triggered
- No CI checks running

#### Diagnosis Steps
1. **Check Workflow Status**:
   ```bash
   gh run list --workflow=guard-mcp.yml
   gh run list --workflow=idle-guard.yml
   gh run list --workflow=dev-mcp-ban.yml
   ```

2. **Verify Workflow Configuration**:
   ```bash
   ls -la .github/workflows/
   ```

#### Resolution
1. **Enable Workflows**:
   ```bash
   gh workflow enable guard-mcp.yml
   gh workflow enable idle-guard.yml
   gh workflow enable dev-mcp-ban.yml
   ```

2. **Fix Workflow Triggers**:
   ```yaml
   on:
     pull_request:
       branches: [main]
     push:
       branches: [main]
   ```

## Advanced Diagnostic Techniques

### System Health Check
```bash
#!/bin/bash
# Growth Engine Health Check Script

echo "=== Growth Engine Health Check ==="

# Check MCP Evidence
echo "1. Checking MCP Evidence..."
find artifacts -name "*.jsonl" -type f | wc -l

# Check Heartbeat
echo "2. Checking Heartbeat..."
find artifacts -name "heartbeat.ndjson" -type f | wc -l

# Check Dev MCP Ban
echo "3. Checking Dev MCP Ban..."
grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i | wc -l

# Check CI Workflows
echo "4. Checking CI Workflows..."
ls -la .github/workflows/ | grep -E "(guard-mcp|idle-guard|dev-mcp-ban)"

echo "=== Health Check Complete ==="
```

### Performance Monitoring
```bash
#!/bin/bash
# Growth Engine Performance Monitor

echo "=== Growth Engine Performance Monitor ==="

# Monitor evidence file growth
echo "Evidence file sizes:"
find artifacts -name "*.jsonl" -type f -exec ls -lh {} \;

# Monitor heartbeat frequency
echo "Heartbeat frequency:"
for file in artifacts/*/2025-10-22/heartbeat.ndjson; do
  if [ -f "$file" ]; then
    echo "File: $file"
    wc -l "$file"
  fi
done

# Monitor CI performance
echo "CI performance:"
gh run list --limit 10 --json status,conclusion,createdAt

echo "=== Performance Monitor Complete ==="
```

### Automated Testing
```bash
#!/bin/bash
# Growth Engine Automated Tests

echo "=== Growth Engine Automated Tests ==="

# Test MCP Evidence
echo "Testing MCP Evidence..."
node -e "
const { mcpEvidenceService } = require('./app/services/mcp-evidence.server.ts');
console.log('MCP Evidence Service: OK');
"

# Test Heartbeat
echo "Testing Heartbeat..."
node -e "
const { heartbeatService } = require('./app/services/heartbeat.server.ts');
console.log('Heartbeat Service: OK');
"

# Test Dev MCP Ban
echo "Testing Dev MCP Ban..."
node -e "
const { devMCPBanService } = require('./app/services/dev-mcp-ban.server.ts');
console.log('Dev MCP Ban Service: OK');
"

echo "=== Automated Tests Complete ==="
```

## Emergency Procedures

### Critical System Failure
1. **Immediate Assessment**: Evaluate impact and severity
2. **Team Activation**: Activate emergency response team
3. **Communication**: Notify stakeholders and management
4. **Resolution**: Execute emergency procedures
5. **Recovery**: Restore normal operations
6. **Review**: Conduct post-incident review

### Data Recovery
1. **Backup Verification**: Check backup integrity
2. **Recovery Planning**: Plan recovery procedures
3. **Data Restoration**: Restore from backups
4. **Validation**: Verify data integrity
5. **Monitoring**: Monitor system stability

### Security Incident
1. **Incident Assessment**: Evaluate security impact
2. **Containment**: Isolate affected systems
3. **Investigation**: Conduct security investigation
4. **Remediation**: Implement security fixes
5. **Recovery**: Restore secure operations
6. **Documentation**: Document incident and lessons learned

---

**Last Updated**: 2025-10-22  
**Next Review**: 2025-11-22  
**Owner**: Support Team  
**Version**: 1.0.0
