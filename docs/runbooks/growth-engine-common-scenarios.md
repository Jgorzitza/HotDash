# Growth Engine Common Scenarios Runbook

## Overview

This runbook provides step-by-step procedures for common Growth Engine scenarios, covering troubleshooting, maintenance, and operational tasks across all phases (9-12).

## Scenario Categories

### 1. System Startup and Initialization
### 2. Daily Operations
### 3. Troubleshooting
### 4. Maintenance
### 5. Emergency Response
### 6. Performance Optimization

---

## Scenario 1: System Startup and Initialization

### 1.1 Agent Startup Process

#### Symptoms
- Agent needs to start work
- New agent onboarding
- System restart after maintenance

#### Diagnosis Steps
1. **Check Environment**
   ```bash
   # Verify working directory
   pwd
   # Should show: /home/justin/HotDash/hot-dash
   ```

2. **Check Git Status**
   ```bash
   git branch --show-current
   # Should show: agent-launch-20251023
   ```

3. **Verify Dependencies**
   ```bash
   # Check Node.js version
   node --version
   # Check npm packages
   npm list --depth=0
   ```

#### Resolution Steps
1. **Navigate to Repository**
   ```bash
   cd /home/justin/HotDash/hot-dash/
   ```

2. **Update Git Repository**
   ```bash
   git fetch origin
   git checkout agent-launch-20251023
   git pull origin agent-launch-20251023
   ```

3. **Get Agent Tasks**
   ```bash
   npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <agent-name>
   ```

4. **Log Startup**
   ```bash
   npx tsx --env-file=.env scripts/agent/log-startup.ts <agent-name> "Startup complete"
   ```

#### Prevention
- Regular environment validation
- Automated startup scripts
- Dependency monitoring
- Configuration management

### 1.2 MCP Tools Initialization

#### Symptoms
- MCP tools not responding
- Tool connection failures
- Missing tool capabilities

#### Diagnosis Steps
1. **Check MCP Tool Status**
   ```bash
   # Test Shopify Dev MCP
   npx tsx -e "import { mcp_shopify_learn_shopify_api } from './app/services/shopify-mcp.server'; console.log('Shopify MCP available');"
   ```

2. **Verify Environment Variables**
   ```bash
   # Check required environment variables
   echo $SHOPIFY_API_KEY
   echo $SUPABASE_URL
   echo $OPENAI_API_KEY
   ```

3. **Test Tool Connectivity**
   ```bash
   # Test Context7 MCP
   npx tsx -e "import { mcp_context7_resolve-library-id } from './app/services/context7-mcp.server'; console.log('Context7 MCP available');"
   ```

#### Resolution Steps
1. **Initialize MCP Tools**
   ```typescript
   // Initialize Shopify Dev MCP
   const shopifyMCP = await mcp_shopify_learn_shopify_api({
     api: "polaris-app-home"
   });
   
   // Initialize Context7 MCP
   const context7MCP = await mcp_context7_resolve-library-id({
     libraryName: "react-router"
   });
   ```

2. **Verify Tool Functionality**
   ```bash
   # Test tool calls
   npx tsx scripts/test-mcp-tools.ts
   ```

3. **Log Tool Status**
   ```bash
   npx tsx --env-file=.env scripts/agent/log-decision.ts pilot "MCP tools initialized successfully"
   ```

#### Prevention
- Regular tool health checks
- Environment variable validation
- Connection monitoring
- Tool version management

---

## Scenario 2: Daily Operations

### 2.1 Task Execution Process

#### Symptoms
- Agent needs to start new task
- Task assignment received
- Work continuation required

#### Diagnosis Steps
1. **Check Task Status**
   ```bash
   npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <agent-name>
   ```

2. **Review Task Details**
   - Check acceptance criteria
   - Review allowed paths
   - Identify dependencies
   - Assess estimated time

3. **Perform KB Search**
   ```bash
   npx tsx scripts/agent/kb-search.ts <TASK-ID> "<TASK-TITLE>" <agent-name>
   ```

#### Resolution Steps
1. **Start Task**
   ```bash
   npx tsx --env-file=.env scripts/agent/start-task.ts <TASK-ID>
   ```

2. **Set Up Evidence Tracking**
   ```bash
   mkdir -p artifacts/<agent>/2025-10-23/mcp
   mkdir -p artifacts/<agent>/2025-10-23/screenshots
   ```

3. **Begin Implementation**
   - Follow MCP-first approach
   - Log all tool usage
   - Update heartbeat regularly
   - Maintain evidence files

4. **Log Progress**
   ```bash
   npx tsx --env-file=.env scripts/agent/log-progress.ts <TASK-ID> "Task started, implementation in progress"
   ```

#### Prevention
- Regular task monitoring
- Proactive dependency management
- Clear task documentation
- Effective communication

### 2.2 Evidence Management

#### Symptoms
- Missing MCP evidence files
- Invalid JSONL format
- Evidence not logged

#### Diagnosis Steps
1. **Check Evidence Directory**
   ```bash
   ls -la artifacts/<agent>/2025-10-23/mcp/
   ```

2. **Validate JSONL Format**
   ```bash
   cat artifacts/<agent>/2025-10-23/mcp/*.jsonl | jq .
   ```

3. **Check Required Fields**
   ```bash
   # Validate evidence entries
   while IFS= read -r line; do
     echo "$line" | jq -r '.tool, .doc_ref, .request_id, .timestamp, .purpose'
   done < artifacts/<agent>/2025-10-23/mcp/general.jsonl
   ```

#### Resolution Steps
1. **Create Missing Directories**
   ```bash
   mkdir -p artifacts/<agent>/2025-10-23/mcp/
   chmod 755 artifacts/<agent>/2025-10-23/mcp/
   ```

2. **Initialize Evidence File**
   ```bash
   touch artifacts/<agent>/2025-10-23/mcp/general.jsonl
   chmod 644 artifacts/<agent>/2025-10-23/mcp/general.jsonl
   ```

3. **Log MCP Usage**
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

4. **Validate Evidence**
   ```bash
   # Check evidence file format
   cat artifacts/<agent>/2025-10-23/mcp/general.jsonl | jq .
   ```

#### Prevention
- Automated evidence tracking
- Regular format validation
- Clear documentation
- Training and education

### 2.3 Heartbeat Monitoring

#### Symptoms
- Stale heartbeat detected
- Agent appears idle
- Heartbeat file missing

#### Diagnosis Steps
1. **Check Last Heartbeat**
   ```bash
   tail -1 artifacts/<agent>/2025-10-23/heartbeat.ndjson | jq .
   ```

2. **Calculate Time Difference**
   ```bash
   last_heartbeat=$(tail -1 artifacts/<agent>/2025-10-23/heartbeat.ndjson | jq -r '.timestamp')
   current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
   echo "Last heartbeat: $last_heartbeat"
   echo "Current time: $current_time"
   ```

3. **Check Heartbeat File**
   ```bash
   ls -la artifacts/<agent>/2025-10-23/heartbeat.ndjson
   ```

#### Resolution Steps
1. **Update Heartbeat**
   ```bash
   echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","task":"'$TASK_ID'","status":"doing","progress":"50%"}' >> artifacts/<agent>/2025-10-23/heartbeat.ndjson
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
   cat artifacts/<agent>/2025-10-23/heartbeat.ndjson | jq .
   ```

#### Prevention
- Automated heartbeat updates
- Regular monitoring
- Clear procedures
- Training and education

---

## Scenario 3: Troubleshooting

### 3.1 MCP Evidence System Issues

#### Symptoms
- CI fails with "MCP Evidence files not found"
- Invalid JSONL format errors
- Evidence not logged properly

#### Diagnosis Steps
1. **Check Directory Structure**
   ```bash
   ls -la artifacts/
   ls -la artifacts/<agent>/
   ls -la artifacts/<agent>/<YYYY-MM-DD>/
   ls -la artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```

2. **Validate JSONL Format**
   ```bash
   cat artifacts/<agent>/<YYYY-MM-DD>/mcp/*.jsonl | jq .
   ```

3. **Check File Permissions**
   ```bash
   ls -la artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```

#### Resolution Steps
1. **Create Missing Directories**
   ```bash
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

#### Prevention
- Automated directory creation
- Format validation
- Clear documentation
- Regular training

### 3.2 Heartbeat System Issues

#### Symptoms
- CI fails with "Heartbeat is stale"
- Missing heartbeat files
- Invalid NDJSON format

#### Diagnosis Steps
1. **Check Heartbeat Directory**
   ```bash
   ls -la artifacts/<agent>/<YYYY-MM-DD>/
   ```

2. **Validate NDJSON Format**
   ```bash
   cat artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | jq .
   ```

3. **Check Task Duration**
   ```bash
   echo "Task estimated hours: $ESTIMATED_HOURS"
   ```

#### Resolution Steps
1. **Create Heartbeat File**
   ```bash
   mkdir -p artifacts/<agent>/<YYYY-MM-DD>/
   touch artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   chmod 644 artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

2. **Fix Malformed JSON**
   ```bash
   # Remove invalid lines
   grep -v "Invalid JSON" artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson > temp.ndjson
   mv temp.ndjson artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson
   ```

3. **Update Heartbeat**
   ```bash
   echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","task":"'$TASK_ID'","status":"doing","progress":"50%"}' >> artifacts/<agent>/2025-10-23/heartbeat.ndjson
   ```

#### Prevention
- Automated heartbeat creation
- Format validation
- Regular monitoring
- Clear procedures

### 3.3 Dev MCP Ban Issues

#### Symptoms
- CI fails with "Dev MCP imports detected"
- Build failures due to violations
- False positive detections

#### Diagnosis Steps
1. **Scan for Dev MCP Imports**
   ```bash
   grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i -n
   ```

2. **Check Specific Files**
   ```bash
   grep -r "@shopify/mcp-server-dev" app/ --include="*.ts" --include="*.tsx"
   grep -r "context7-mcp" app/ --include="*.ts" --include="*.tsx"
   grep -r "chrome-devtools-mcp" app/ --include="*.ts" --include="*.tsx"
   ```

3. **Verify Import Context**
   ```bash
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

#### Prevention
- Code review processes
- Automated scanning
- Clear documentation
- Regular training

---

## Scenario 4: Maintenance

### 4.1 Daily Maintenance

#### Symptoms
- System performance degradation
- Resource usage issues
- Error rate increases

#### Diagnosis Steps
1. **Check System Health**
   ```bash
   # Check MCP Evidence
   find artifacts -name "*.jsonl" -type f | wc -l
   
   # Check Heartbeat
   find artifacts -name "heartbeat.ndjson" -type f | wc -l
   
   # Check Dev MCP Ban
   grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i | wc -l
   ```

2. **Monitor Performance**
   ```bash
   # Check file sizes
   find artifacts -name "*.jsonl" -type f -exec ls -lh {} \;
   
   # Check heartbeat frequency
   for file in artifacts/*/2025-10-23/heartbeat.ndjson; do
     if [ -f "$file" ]; then
       echo "File: $file"
       wc -l "$file"
     fi
   done
   ```

3. **Review CI Performance**
   ```bash
   gh run list --limit 10 --json status,conclusion,createdAt
   ```

#### Resolution Steps
1. **Clean Up Old Files**
   ```bash
   # Remove old evidence files (older than 30 days)
   find artifacts -name "*.jsonl" -type f -mtime +30 -delete
   
   # Remove old heartbeat files (older than 30 days)
   find artifacts -name "heartbeat.ndjson" -type f -mtime +30 -delete
   ```

2. **Optimize Performance**
   ```bash
   # Compress large files
   find artifacts -name "*.jsonl" -type f -size +1M -exec gzip {} \;
   
   # Archive old data
   tar -czf artifacts-archive-$(date +%Y%m%d).tar.gz artifacts/
   ```

3. **Update Monitoring**
   ```bash
   # Update monitoring thresholds
   npx tsx scripts/update-monitoring-thresholds.ts
   ```

#### Prevention
- Automated cleanup
- Regular monitoring
- Performance optimization
- Capacity planning

### 4.2 Weekly Maintenance

#### Symptoms
- System performance trends
- Resource usage patterns
- Quality metrics changes

#### Diagnosis Steps
1. **Analyze Trends**
   ```bash
   # Analyze evidence file growth
   find artifacts -name "*.jsonl" -type f -exec ls -lh {} \; | sort -k5 -h
   
   # Analyze heartbeat patterns
   for file in artifacts/*/2025-10-23/heartbeat.ndjson; do
     if [ -f "$file" ]; then
       echo "File: $file"
       tail -10 "$file" | jq .
     fi
   done
   ```

2. **Review Performance Metrics**
   ```bash
   # Check CI performance
   gh run list --limit 50 --json status,conclusion,createdAt,updatedAt
   ```

3. **Analyze Error Patterns**
   ```bash
   # Check for common errors
   grep -r "ERROR" logs/ --include="*.log" | head -20
   ```

#### Resolution Steps
1. **Optimize System Performance**
   ```bash
   # Optimize database queries
   npx tsx scripts/optimize-database.ts
   
   # Optimize file storage
   npx tsx scripts/optimize-storage.ts
   ```

2. **Update Configuration**
   ```bash
   # Update monitoring configuration
   npx tsx scripts/update-monitoring-config.ts
   
   # Update alert thresholds
   npx tsx scripts/update-alert-thresholds.ts
   ```

3. **Archive Old Data**
   ```bash
   # Archive old evidence files
   npx tsx scripts/archive-old-evidence.ts
   
   # Archive old heartbeat files
   npx tsx scripts/archive-old-heartbeat.ts
   ```

#### Prevention
- Regular performance analysis
- Proactive optimization
- Capacity planning
- Trend monitoring

---

## Scenario 5: Emergency Response

### 5.1 Critical System Failure

#### Symptoms
- System completely down
- Multiple components failing
- Business operations impacted

#### Diagnosis Steps
1. **Assess Impact**
   ```bash
   # Check system status
   curl -f http://localhost:3000/health || echo "System down"
   
   # Check database connectivity
   npx tsx scripts/check-database.ts
   
   # Check MCP tools
   npx tsx scripts/check-mcp-tools.ts
   ```

2. **Identify Root Cause**
   ```bash
   # Check system logs
   tail -100 logs/system.log
   
   # Check error logs
   tail -100 logs/error.log
   
   # Check resource usage
   top -n 1
   ```

#### Resolution Steps
1. **Immediate Response (0-5 minutes)**
   ```bash
   # Notify management
   npx tsx scripts/notify-management.ts "Critical system failure detected"
   
   # Activate emergency procedures
   npx tsx scripts/activate-emergency-procedures.ts
   ```

2. **Containment (5-15 minutes)**
   ```bash
   # Isolate affected systems
   npx tsx scripts/isolate-systems.ts
   
   # Preserve evidence
   npx tsx scripts/preserve-evidence.ts
   ```

3. **Recovery (15-60 minutes)**
   ```bash
   # Restore from backups
   npx tsx scripts/restore-from-backup.ts
   
   # Validate system integrity
   npx tsx scripts/validate-system-integrity.ts
   ```

4. **Post-Incident (1-24 hours)**
   ```bash
   # Conduct root cause analysis
   npx tsx scripts/root-cause-analysis.ts
   
   # Document lessons learned
   npx tsx scripts/document-lessons-learned.ts
   ```

#### Prevention
- Regular system monitoring
- Proactive maintenance
- Disaster recovery planning
- Team training

### 5.2 Data Recovery

#### Symptoms
- Data corruption detected
- Backup restoration needed
- Data integrity issues

#### Diagnosis Steps
1. **Verify Backup Integrity**
   ```bash
   # Check backup completeness
   npx tsx scripts/check-backup-integrity.ts
   
   # Test backup restoration
   npx tsx scripts/test-backup-restoration.ts
   ```

2. **Assess Data Damage**
   ```bash
   # Check data integrity
   npx tsx scripts/check-data-integrity.ts
   
   # Identify corrupted data
   npx tsx scripts/identify-corrupted-data.ts
   ```

#### Resolution Steps
1. **Plan Recovery**
   ```bash
   # Create recovery plan
   npx tsx scripts/create-recovery-plan.ts
   
   # Identify dependencies
   npx tsx scripts/identify-dependencies.ts
   ```

2. **Execute Recovery**
   ```bash
   # Restore from backups
   npx tsx scripts/restore-from-backup.ts
   
   # Validate restored data
   npx tsx scripts/validate-restored-data.ts
   ```

3. **Verify Recovery**
   ```bash
   # Test system functionality
   npx tsx scripts/test-system-functionality.ts
   
   # Monitor system performance
   npx tsx scripts/monitor-system-performance.ts
   ```

#### Prevention
- Regular backup verification
- Data integrity monitoring
- Recovery testing
- Documentation maintenance

---

## Scenario 6: Performance Optimization

### 6.1 System Performance Issues

#### Symptoms
- Slow response times
- High resource usage
- Poor user experience

#### Diagnosis Steps
1. **Monitor Performance Metrics**
   ```bash
   # Check response times
   npx tsx scripts/check-response-times.ts
   
   # Check resource usage
   npx tsx scripts/check-resource-usage.ts
   
   # Check error rates
   npx tsx scripts/check-error-rates.ts
   ```

2. **Identify Bottlenecks**
   ```bash
   # Analyze performance logs
   npx tsx scripts/analyze-performance-logs.ts
   
   # Check database performance
   npx tsx scripts/check-database-performance.ts
   ```

#### Resolution Steps
1. **Optimize Database**
   ```bash
   # Optimize database queries
   npx tsx scripts/optimize-database-queries.ts
   
   # Update database indexes
   npx tsx scripts/update-database-indexes.ts
   ```

2. **Optimize Application**
   ```bash
   # Optimize code performance
   npx tsx scripts/optimize-code-performance.ts
   
   # Update caching strategies
   npx tsx scripts/update-caching-strategies.ts
   ```

3. **Scale Resources**
   ```bash
   # Scale system resources
   npx tsx scripts/scale-system-resources.ts
   
   # Update monitoring thresholds
   npx tsx scripts/update-monitoring-thresholds.ts
   ```

#### Prevention
- Regular performance monitoring
- Proactive optimization
- Capacity planning
- Performance testing

### 6.2 MCP Tools Performance

#### Symptoms
- MCP tools slow to respond
- Tool connection timeouts
- Poor tool performance

#### Diagnosis Steps
1. **Check Tool Performance**
   ```bash
   # Test MCP tool response times
   npx tsx scripts/test-mcp-tool-performance.ts
   
   # Check tool connectivity
   npx tsx scripts/check-tool-connectivity.ts
   ```

2. **Analyze Tool Usage**
   ```bash
   # Analyze tool usage patterns
   npx tsx scripts/analyze-tool-usage.ts
   
   # Check tool error rates
   npx tsx scripts/check-tool-error-rates.ts
   ```

#### Resolution Steps
1. **Optimize Tool Configuration**
   ```bash
   # Update tool configuration
   npx tsx scripts/update-tool-configuration.ts
   
   # Optimize tool connections
   npx tsx scripts/optimize-tool-connections.ts
   ```

2. **Implement Caching**
   ```bash
   # Implement tool response caching
   npx tsx scripts/implement-tool-caching.ts
   
   # Update caching strategies
   npx tsx scripts/update-caching-strategies.ts
   ```

3. **Monitor Tool Performance**
   ```bash
   # Set up tool performance monitoring
   npx tsx scripts/setup-tool-monitoring.ts
   
   # Update performance thresholds
   npx tsx scripts/update-performance-thresholds.ts
   ```

#### Prevention
- Regular tool performance monitoring
- Proactive optimization
- Tool usage analysis
- Performance testing

---

## Best Practices

### 1. Documentation Standards

#### Process Documentation
- **Clear Purpose**: State the purpose of each process
- **Step-by-Step**: Provide detailed step-by-step instructions
- **Examples**: Include practical examples
- **Troubleshooting**: Include common issues and solutions
- **Updates**: Keep documentation current

#### Runbook Standards
- **Scenario-Based**: Organize by common scenarios
- **Symptom-Driven**: Start with observable symptoms
- **Diagnosis-First**: Provide diagnostic steps
- **Resolution-Focused**: Focus on solutions
- **Prevention-Oriented**: Include prevention strategies

### 2. Quality Assurance

#### Process Validation
- **Regular Reviews**: Review processes regularly
- **Testing**: Test procedures regularly
- **Feedback**: Collect and incorporate feedback
- **Improvement**: Continuously improve processes
- **Training**: Train team members on procedures

#### Documentation Quality
- **Accuracy**: Ensure information is accurate
- **Completeness**: Include all necessary information
- **Clarity**: Use clear and concise language
- **Accessibility**: Make documentation easy to find and use
- **Maintenance**: Keep documentation current

### 3. Continuous Improvement

#### Process Enhancement
- **Identify Opportunities**: Regularly identify improvement opportunities
- **Implement Changes**: Implement process improvements
- **Monitor Results**: Monitor the results of changes
- **Document Lessons**: Document lessons learned
- **Share Knowledge**: Share best practices

#### Documentation Improvement
- **Regular Updates**: Update documentation regularly
- **User Feedback**: Incorporate user feedback
- **Best Practices**: Adopt best practices
- **Innovation**: Encourage innovation
- **Knowledge Sharing**: Share knowledge effectively

## Conclusion

This runbook provides comprehensive procedures for common Growth Engine scenarios, ensuring consistent and effective operations across all phases. Regular review, testing, and improvement of these procedures are essential for maintaining optimal system performance and reliability.

---

**Last Updated**: 2025-10-23  
**Next Review**: 2025-11-23  
**Owner**: Pilot Team  
**Version**: 1.0.0
