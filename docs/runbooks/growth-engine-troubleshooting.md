# Growth Engine Troubleshooting Procedures

## Overview

This document provides comprehensive troubleshooting procedures for the Growth Engine system, covering all phases (9-12) and common issues that may arise during operations.

## Troubleshooting Framework

### 1. Problem Identification
### 2. Diagnosis Process
### 3. Resolution Steps
### 4. Prevention Strategies
### 5. Documentation and Learning

---

## Phase 9: MCP Evidence System Troubleshooting

### 9.1 MCP Evidence Files Not Found

#### Problem Description
CI fails with error: "MCP Evidence files not found" or "Missing evidence for code changes"

#### Symptoms
- CI build failures
- Missing evidence files
- Invalid JSONL format
- Evidence not logged properly

#### Diagnosis Steps

1. **Check Evidence Directory Structure**
   ```bash
   # Verify directory structure
   ls -la artifacts/
   ls -la artifacts/<agent>/
   ls -la artifacts/<agent>/<YYYY-MM-DD>/
   ls -la artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```

2. **Validate JSONL Format**
   ```bash
   # Check JSONL file format
   cat artifacts/<agent>/<YYYY-MM-DD>/mcp/*.jsonl | jq .
   ```

3. **Check File Permissions**
   ```bash
   # Verify file permissions
   ls -la artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```

4. **Validate Required Fields**
   ```bash
   # Check each entry has required fields
   while IFS= read -r line; do
     echo "$line" | jq -r '.tool, .doc_ref, .request_id, .timestamp, .purpose' | wc -l
   done < artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

#### Resolution Steps

1. **Create Missing Directories**
   ```bash
   # Create evidence directory structure
   mkdir -p artifacts/<agent>/<YYYY-MM-DD>/mcp/
   chmod 755 artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```

2. **Fix Malformed JSON**
   ```bash
   # Remove invalid lines
   grep -v "Invalid JSON" artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl > temp.jsonl
   mv temp.jsonl artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

3. **Validate Required Fields**
   ```bash
   # Check each entry has required fields
   while IFS= read -r line; do
     echo "$line" | jq -r '.tool, .doc_ref, .request_id, .timestamp, .purpose' | wc -l
   done < artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

4. **Log Evidence Properly**
   ```typescript
   // Log MCP tool usage
   await mcpEvidenceService.appendEvidence(agent, date, topic, {
     tool: 'shopify-dev',
     doc_ref: 'https://shopify.dev/docs/api/admin-rest',
     request_id: 'req_123',
     timestamp: new Date().toISOString(),
     purpose: 'Get product data for component'
   });
   ```

#### Prevention Strategies
- Automated directory creation
- Format validation scripts
- Clear documentation
- Regular training
- Monitoring and alerting

### 9.2 Invalid JSONL Format

#### Problem Description
Evidence files contain invalid JSON format causing CI failures

#### Symptoms
- JSON parsing errors
- CI build failures
- Evidence not processed
- Invalid data format

#### Diagnosis Steps

1. **Check JSONL File Format**
   ```bash
   # Validate JSONL format
   cat artifacts/<agent>/<YYYY-MM-DD>/mcp/*.jsonl | jq .
   ```

2. **Identify Invalid Lines**
   ```bash
   # Find invalid JSON lines
   while IFS= read -r line; do
     echo "$line" | jq . > /dev/null 2>&1 || echo "Invalid: $line"
   done < artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

3. **Check File Encoding**
   ```bash
   # Check file encoding
   file artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

#### Resolution Steps

1. **Fix Invalid JSON**
   ```bash
   # Remove invalid lines
   grep -v "Invalid JSON" artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl > temp.jsonl
   mv temp.jsonl artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

2. **Validate JSON Format**
   ```bash
   # Validate each line
   while IFS= read -r line; do
     echo "$line" | jq . > /dev/null 2>&1 || echo "Invalid: $line"
   done < artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

3. **Recreate Evidence File**
   ```bash
   # Backup and recreate
   cp artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl.backup
   rm artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   touch artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

#### Prevention Strategies
- Automated format validation
- Clear documentation
- Regular training
- Monitoring and alerting

### 9.3 Evidence Not Logged

#### Problem Description
MCP tool usage not being logged to evidence files

#### Symptoms
- Missing evidence entries
- CI failures
- Evidence not tracked
- Tool usage not recorded

#### Diagnosis Steps

1. **Check Evidence File**
   ```bash
   # Check if evidence file exists
   ls -la artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

2. **Check File Content**
   ```bash
   # Check file content
   cat artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

3. **Check Logging Service**
   ```bash
   # Check if logging service is working
   npx tsx scripts/test-evidence-logging.ts
   ```

#### Resolution Steps

1. **Initialize Evidence File**
   ```bash
   # Create evidence file
   touch artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   chmod 644 artifacts/<agent>/<YYYY-MM-DD>/mcp/general.jsonl
   ```

2. **Test Logging Service**
   ```bash
   # Test logging service
   npx tsx scripts/test-evidence-logging.ts
   ```

3. **Log Evidence Manually**
   ```typescript
   // Log evidence manually
   await mcpEvidenceService.appendEvidence(agent, date, topic, {
     tool: 'shopify-dev',
     doc_ref: 'https://shopify.dev/docs/api/admin-rest',
     request_id: 'req_123',
     timestamp: new Date().toISOString(),
     purpose: 'Get product data for component'
   });
   ```

#### Prevention Strategies
- Automated evidence tracking
- Regular monitoring
- Clear documentation
- Training and education

---

## Phase 10: Heartbeat Monitoring Troubleshooting

### 10.1 Stale Heartbeat Detected

#### Problem Description
CI fails with error: "Heartbeat is stale" or "Agent appears idle"

#### Symptoms
- CI build failures
- Missing heartbeat files
- Stale heartbeat timestamps
- Agent appears idle

#### Diagnosis Steps

1. **Check Last Heartbeat**
   ```bash
   # Check last heartbeat timestamp
   tail -1 artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | jq .
   ```

2. **Calculate Time Difference**
   ```bash
   # Calculate time difference
   last_heartbeat=$(tail -1 artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | jq -r '.timestamp')
   current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
   echo "Last heartbeat: $last_heartbeat"
   echo "Current time: $current_time"
   ```

3. **Check Heartbeat File**
   ```bash
   # Check heartbeat file
   ls -la artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

#### Resolution Steps

1. **Update Heartbeat**
   ```bash
   # Update heartbeat
   echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","task":"'$TASK_ID'","status":"doing","progress":"50%"}' >> artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

2. **Start Heartbeat Monitoring**
   ```typescript
   // Start heartbeat monitoring
   const interval = await heartbeatService.startHeartbeatMonitoring(
     agent, date, task, 15 // 15 minutes
   );
   ```

3. **Validate Heartbeat**
   ```bash
   # Validate heartbeat format
   cat artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | jq .
   ```

#### Prevention Strategies
- Automated heartbeat updates
- Regular monitoring
- Clear procedures
- Training and education

### 10.2 Missing Heartbeat Files

#### Problem Description
Heartbeat files are missing or not created

#### Symptoms
- Missing heartbeat files
- CI failures
- Agent appears idle
- No heartbeat tracking

#### Diagnosis Steps

1. **Check Heartbeat Directory**
   ```bash
   # Check heartbeat directory
   ls -la artifacts/<agent>/<YYYY-MM-DD>/
   ```

2. **Check File Creation**
   ```bash
   # Check if file creation is working
   npx tsx scripts/test-heartbeat-creation.ts
   ```

3. **Check Permissions**
   ```bash
   # Check directory permissions
   ls -la artifacts/<agent>/<YYYY-MM-DD>/
   ```

#### Resolution Steps

1. **Create Heartbeat File**
   ```bash
   # Create heartbeat file
   mkdir -p artifacts/<agent>/<YYYY-MM-DD>/
   touch artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   chmod 644 artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

2. **Initialize Heartbeat**
   ```bash
   # Initialize heartbeat
   echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","task":"'$TASK_ID'","status":"doing","progress":"0%"}' > artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

3. **Test Heartbeat Creation**
   ```bash
   # Test heartbeat creation
   npx tsx scripts/test-heartbeat-creation.ts
   ```

#### Prevention Strategies
- Automated heartbeat creation
- Regular monitoring
- Clear procedures
- Training and education

### 10.3 Invalid NDJSON Format

#### Problem Description
Heartbeat files contain invalid NDJSON format

#### Symptoms
- JSON parsing errors
- CI failures
- Heartbeat not processed
- Invalid data format

#### Diagnosis Steps

1. **Check NDJSON Format**
   ```bash
   # Validate NDJSON format
   cat artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | jq .
   ```

2. **Identify Invalid Lines**
   ```bash
   # Find invalid JSON lines
   while IFS= read -r line; do
     echo "$line" | jq . > /dev/null 2>&1 || echo "Invalid: $line"
   done < artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

3. **Check File Encoding**
   ```bash
   # Check file encoding
   file artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

#### Resolution Steps

1. **Fix Invalid JSON**
   ```bash
   # Remove invalid lines
   grep -v "Invalid JSON" artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson > temp.ndjson
   mv temp.ndjson artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

2. **Validate NDJSON Format**
   ```bash
   # Validate each line
   while IFS= read -r line; do
     echo "$line" | jq . > /dev/null 2>&1 || echo "Invalid: $line"
   done < artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

3. **Recreate Heartbeat File**
   ```bash
   # Backup and recreate
   cp artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson.backup
   rm artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   touch artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

#### Prevention Strategies
- Automated format validation
- Clear documentation
- Regular training
- Monitoring and alerting

---

## Phase 11: Dev MCP Ban Troubleshooting

### 11.1 Dev MCP Imports Detected

#### Problem Description
CI fails with error: "Dev MCP imports detected" or "Banned imports found"

#### Symptoms
- CI build failures
- Banned imports detected
- Production safety violations
- Build process blocked

#### Diagnosis Steps

1. **Scan for Dev MCP Imports**
   ```bash
   # Check for Dev MCP imports
   grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i -n
   ```

2. **Check Specific Files**
   ```bash
   # Check specific banned imports
   grep -r "@shopify/mcp-server-dev" app/ --include="*.ts" --include="*.tsx"
   grep -r "context7-mcp" app/ --include="*.ts" --include="*.tsx"
   grep -r "chrome-devtools-mcp" app/ --include="*.ts" --include="*.tsx"
   ```

3. **Verify Import Context**
   ```bash
   # Check import context
   grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i -A 2 -B 2
   ```

#### Resolution Steps

1. **Remove Dev MCP Imports**
   ```bash
   # Remove banned imports from app directory
   find app/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '/@shopify\/mcp-server-dev/d'
   find app/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '/context7-mcp/d'
   find app/ -name "*.ts" -o -name "*.tsx" | xargs sed -i '/chrome-devtools-mcp/d'
   ```

2. **Move to Allowed Directories**
   ```bash
   # Move Dev MCP code to allowed directories
   mv app/dev-mcp-code/ scripts/
   mv app/test-mcp-code/ tests/
   ```

3. **Update CI Configuration**
   ```yaml
   # Update .github/workflows/dev-mcp-ban.yml
   - name: Check for Dev MCP imports in production code
     run: |
       if grep -r "import.*@shopify/mcp-server-dev" app/ --include="*.ts" --include="*.tsx"; then
         echo "❌ Dev MCP imports detected"
         exit 1
       fi
   ```

#### Prevention Strategies
- Code review processes
- Automated scanning
- Clear documentation
- Regular training

### 11.2 False Positive Detections

#### Problem Description
CI incorrectly flags legitimate code as Dev MCP violations

#### Symptoms
- False positive CI failures
- Legitimate code blocked
- Incorrect ban detection
- Build process blocked

#### Diagnosis Steps

1. **Check Detection Logic**
   ```bash
   # Check CI detection logic
   cat .github/workflows/dev-mcp-ban.yml
   ```

2. **Verify Code Context**
   ```bash
   # Check code context
   grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i -A 5 -B 5
   ```

3. **Test Detection Rules**
   ```bash
   # Test detection rules
   npx tsx scripts/test-dev-mcp-detection.ts
   ```

#### Resolution Steps

1. **Update Detection Rules**
   ```yaml
   # Update CI detection rules
   - name: Check for Dev MCP imports in production code
     run: |
       if grep -r "import.*@shopify/mcp-server-dev" app/ --include="*.ts" --include="*.tsx"; then
         echo "❌ Dev MCP imports detected"
         exit 1
       fi
   ```

2. **Whitelist Legitimate Code**
   ```bash
   # Add whitelist for legitimate code
   echo "legitimate-mcp-code" >> .dev-mcp-whitelist.txt
   ```

3. **Update CI Configuration**
   ```yaml
   # Update CI configuration
   - name: Check for Dev MCP imports in production code
     run: |
       if grep -r "import.*@shopify/mcp-server-dev" app/ --include="*.ts" --include="*.tsx" | grep -v -f .dev-mcp-whitelist.txt; then
         echo "❌ Dev MCP imports detected"
         exit 1
       fi
   ```

#### Prevention Strategies
- Regular rule review
- Clear documentation
- Regular training
- Monitoring and alerting

### 11.3 CI Guard Failures

#### Problem Description
CI guards fail to detect Dev MCP violations

#### Symptoms
- CI guards not working
- Violations not detected
- Production safety compromised
- Build process bypassed

#### Diagnosis Steps

1. **Check CI Guard Status**
   ```bash
   # Check CI guard status
   npx tsx scripts/check-ci-guard-status.ts
   ```

2. **Test Detection**
   ```bash
   # Test detection
   npx tsx scripts/test-dev-mcp-detection.ts
   ```

3. **Check CI Configuration**
   ```bash
   # Check CI configuration
   cat .github/workflows/dev-mcp-ban.yml
   ```

#### Resolution Steps

1. **Fix CI Guard Configuration**
   ```yaml
   # Fix CI guard configuration
   - name: Check for Dev MCP imports in production code
     run: |
       if grep -r "import.*@shopify/mcp-server-dev" app/ --include="*.ts" --include="*.tsx"; then
         echo "❌ Dev MCP imports detected"
         exit 1
       fi
   ```

2. **Test CI Guards**
   ```bash
   # Test CI guards
   npx tsx scripts/test-ci-guards.ts
   ```

3. **Update Monitoring**
   ```bash
   # Update monitoring
   npx tsx scripts/update-ci-guard-monitoring.ts
   ```

#### Prevention Strategies
- Regular CI guard testing
- Clear documentation
- Regular training
- Monitoring and alerting

---

## Phase 12: CI Guards Troubleshooting

### 12.1 Guard-MCP Failures

#### Problem Description
Guard-MCP fails to enforce MCP Evidence requirements

#### Symptoms
- CI failures
- Missing evidence not detected
- Guard not working
- Build process bypassed

#### Diagnosis Steps

1. **Check Guard-MCP Status**
   ```bash
   # Check guard-MCP status
   npx tsx scripts/check-guard-mcp-status.ts
   ```

2. **Test Evidence Detection**
   ```bash
   # Test evidence detection
   npx tsx scripts/test-evidence-detection.ts
   ```

3. **Check CI Configuration**
   ```bash
   # Check CI configuration
   cat .github/workflows/guard-mcp.yml
   ```

#### Resolution Steps

1. **Fix Guard-MCP Configuration**
   ```yaml
   # Fix guard-MCP configuration
   - name: Check for MCP Evidence files
     run: |
       if [ ! -f "artifacts/${{ github.actor }}/$(date +%Y-%m-%d)/mcp/general.jsonl" ]; then
         echo "❌ MCP Evidence files not found"
         exit 1
       fi
   ```

2. **Test Guard-MCP**
   ```bash
   # Test guard-MCP
   npx tsx scripts/test-guard-mcp.ts
   ```

3. **Update Monitoring**
   ```bash
   # Update monitoring
   npx tsx scripts/update-guard-mcp-monitoring.ts
   ```

#### Prevention Strategies
- Regular guard-MCP testing
- Clear documentation
- Regular training
- Monitoring and alerting

### 12.2 Idle-Guard Failures

#### Problem Description
Idle-Guard fails to detect idle agents

#### Symptoms
- CI failures
- Idle agents not detected
- Guard not working
- Build process bypassed

#### Diagnosis Steps

1. **Check Idle-Guard Status**
   ```bash
   # Check idle-guard status
   npx tsx scripts/check-idle-guard-status.ts
   ```

2. **Test Idle Detection**
   ```bash
   # Test idle detection
   npx tsx scripts/test-idle-detection.ts
   ```

3. **Check CI Configuration**
   ```bash
   # Check CI configuration
   cat .github/workflows/idle-guard.yml
   ```

#### Resolution Steps

1. **Fix Idle-Guard Configuration**
   ```yaml
   # Fix idle-guard configuration
   - name: Check for stale heartbeats
     run: |
       if [ -f "artifacts/${{ github.actor }}/$(date +%Y-%m-%d)/heartbeat.ndjson" ]; then
         last_heartbeat=$(tail -1 "artifacts/${{ github.actor }}/$(date +%Y-%m-%d)/heartbeat.ndjson" | jq -r '.timestamp')
         current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
         if [ "$last_heartbeat" != "$current_time" ]; then
           echo "❌ Heartbeat is stale"
           exit 1
         fi
       fi
   ```

2. **Test Idle-Guard**
   ```bash
   # Test idle-guard
   npx tsx scripts/test-idle-guard.ts
   ```

3. **Update Monitoring**
   ```bash
   # Update monitoring
   npx tsx scripts/update-idle-guard-monitoring.ts
   ```

#### Prevention Strategies
- Regular idle-guard testing
- Clear documentation
- Regular training
- Monitoring and alerting

### 12.3 Dev-MCP-Ban Failures

#### Problem Description
Dev-MCP-Ban fails to detect banned imports

#### Symptoms
- CI failures
- Banned imports not detected
- Guard not working
- Build process bypassed

#### Diagnosis Steps

1. **Check Dev-MCP-Ban Status**
   ```bash
   # Check dev-MCP-ban status
   npx tsx scripts/check-dev-mcp-ban-status.ts
   ```

2. **Test Ban Detection**
   ```bash
   # Test ban detection
   npx tsx scripts/test-ban-detection.ts
   ```

3. **Check CI Configuration**
   ```bash
   # Check CI configuration
   cat .github/workflows/dev-mcp-ban.yml
   ```

#### Resolution Steps

1. **Fix Dev-MCP-Ban Configuration**
   ```yaml
   # Fix dev-MCP-ban configuration
   - name: Check for Dev MCP imports in production code
     run: |
       if grep -r "import.*@shopify/mcp-server-dev" app/ --include="*.ts" --include="*.tsx"; then
         echo "❌ Dev MCP imports detected"
         exit 1
       fi
   ```

2. **Test Dev-MCP-Ban**
   ```bash
   # Test dev-MCP-ban
   npx tsx scripts/test-dev-mcp-ban.ts
   ```

3. **Update Monitoring**
   ```bash
   # Update monitoring
   npx tsx scripts/update-dev-mcp-ban-monitoring.ts
   ```

#### Prevention Strategies
- Regular dev-MCP-ban testing
- Clear documentation
- Regular training
- Monitoring and alerting

---

## General Troubleshooting Procedures

### 1. System Health Checks

#### Daily Health Check
```bash
# Check system health
npx tsx scripts/check-system-health.ts

# Check MCP Evidence
find artifacts -name "*.jsonl" -type f | wc -l

# Check Heartbeat
find artifacts -name "heartbeat.ndjson" -type f | wc -l

# Check Dev MCP Ban
grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i | wc -l
```

#### Weekly Health Check
```bash
# Check system performance
npx tsx scripts/check-system-performance.ts

# Check CI performance
gh run list --limit 10 --json status,conclusion,createdAt

# Check error rates
grep -r "ERROR" logs/ --include="*.log" | wc -l
```

### 2. Performance Monitoring

#### Response Time Monitoring
```bash
# Check response times
npx tsx scripts/check-response-times.ts

# Check resource usage
npx tsx scripts/check-resource-usage.ts

# Check error rates
npx tsx scripts/check-error-rates.ts
```

#### Resource Usage Monitoring
```bash
# Check CPU usage
top -n 1

# Check memory usage
free -h

# Check disk usage
df -h
```

### 3. Error Analysis

#### Log Analysis
```bash
# Check system logs
tail -100 logs/system.log

# Check error logs
tail -100 logs/error.log

# Check CI logs
gh run view <run-id> --log
```

#### Pattern Analysis
```bash
# Analyze error patterns
grep -r "ERROR" logs/ --include="*.log" | head -20

# Analyze performance patterns
npx tsx scripts/analyze-performance-patterns.ts
```

### 4. Recovery Procedures

#### System Recovery
```bash
# Restore from backups
npx tsx scripts/restore-from-backup.ts

# Validate system integrity
npx tsx scripts/validate-system-integrity.ts

# Test system functionality
npx tsx scripts/test-system-functionality.ts
```

#### Data Recovery
```bash
# Check backup integrity
npx tsx scripts/check-backup-integrity.ts

# Restore data
npx tsx scripts/restore-data.ts

# Validate restored data
npx tsx scripts/validate-restored-data.ts
```

## Best Practices

### 1. Prevention Strategies

#### Proactive Monitoring
- Regular system health checks
- Automated monitoring and alerting
- Performance trend analysis
- Capacity planning

#### Process Improvement
- Regular process review
- Continuous improvement
- Best practice adoption
- Knowledge sharing

### 2. Documentation Standards

#### Troubleshooting Documentation
- Clear problem descriptions
- Step-by-step diagnosis
- Detailed resolution steps
- Prevention strategies

#### Process Documentation
- Comprehensive procedures
- Clear instructions
- Practical examples
- Regular updates

### 3. Training and Education

#### Team Training
- Regular training sessions
- Process education
- Tool training
- Best practice sharing

#### Knowledge Management
- Documentation maintenance
- Knowledge sharing
- Experience capture
- Lesson learned documentation

## Conclusion

This troubleshooting guide provides comprehensive procedures for resolving common Growth Engine issues across all phases. Regular review, testing, and improvement of these procedures are essential for maintaining optimal system performance and reliability.

---

**Last Updated**: 2025-10-23  
**Next Review**: 2025-11-23  
**Owner**: Pilot Team  
**Version**: 1.0.0