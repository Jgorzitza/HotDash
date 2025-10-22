# Growth Engine Support Framework

## Overview

The Growth Engine Support Framework provides comprehensive support infrastructure for Growth Engine phases 9-12, ensuring reliable operation, rapid issue resolution, and continuous improvement of the Growth Engine ecosystem.

## Support Philosophy

### Core Principles
- **Proactive Support**: Anticipate issues before they impact operations
- **Rapid Response**: Minimize downtime through quick issue identification and resolution
- **Knowledge Sharing**: Document solutions and share learnings across the team
- **Continuous Improvement**: Learn from incidents to prevent future occurrences

### Support Model
- **Tier 1**: Basic troubleshooting and issue triage
- **Tier 2**: Advanced technical support and system analysis
- **Tier 3**: Deep technical expertise and system architecture
- **Escalation**: Management and executive involvement for critical issues

## Growth Engine Phases Support

### Phase 9: MCP Evidence System
**Purpose**: Track MCP tool usage for compliance and audit purposes

#### Common Issues
- **Missing Evidence Files**: Evidence files not created or accessible
- **Invalid JSONL Format**: Malformed JSON in evidence files
- **Evidence Not Logged**: MCP tool usage not properly recorded
- **File Permissions**: Access issues with evidence directories

#### Support Procedures
1. **Verify Evidence Directory Structure**:
   ```bash
   ls -la artifacts/<agent>/<YYYY-MM-DD>/mcp/
   ```
2. **Check JSONL Format**:
   ```bash
   cat artifacts/<agent>/<YYYY-MM-DD>/mcp/*.jsonl | jq .
   ```
3. **Validate Evidence Entries**:
   - Check required fields: tool, doc_ref, request_id, timestamp, purpose
   - Verify timestamp format (ISO 8601)
   - Confirm tool names are valid

#### Troubleshooting Commands
```bash
# Check evidence files exist
find artifacts -name "*.jsonl" -type f

# Validate JSONL format
for file in artifacts/*/2025-10-22/mcp/*.jsonl; do
  echo "Checking $file"
  while IFS= read -r line; do
    echo "$line" | jq . > /dev/null || echo "Invalid JSON: $line"
  done < "$file"
done

# Check evidence file permissions
ls -la artifacts/*/2025-10-22/mcp/
```

### Phase 10: Heartbeat Monitoring
**Purpose**: Monitor agent activity to prevent idle agents and ensure continuous progress

#### Common Issues
- **Stale Heartbeats**: Heartbeat entries older than 15 minutes
- **Missing Heartbeat Files**: No heartbeat tracking for long-running tasks
- **Invalid NDJSON Format**: Malformed JSON in heartbeat files
- **Heartbeat Not Updating**: Agent not sending regular heartbeat updates

#### Support Procedures
1. **Check Heartbeat Status**:
   ```bash
   cat artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | tail -5
   ```
2. **Verify Heartbeat Format**:
   ```bash
   cat artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | jq .
   ```
3. **Check for Stale Heartbeats**:
   ```bash
   # Get last heartbeat timestamp
   last_heartbeat=$(cat artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson | tail -1 | jq -r '.timestamp')
   # Check if older than 15 minutes
   current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
   # Calculate difference (implement time comparison logic)
   ```

#### Troubleshooting Commands
```bash
# Check heartbeat files
find artifacts -name "heartbeat.ndjson" -type f

# Validate NDJSON format
for file in artifacts/*/2025-10-22/heartbeat.ndjson; do
  echo "Checking $file"
  while IFS= read -r line; do
    echo "$line" | jq . > /dev/null || echo "Invalid JSON: $line"
  done < "$file"
done

# Check for stale heartbeats
for file in artifacts/*/2025-10-22/heartbeat.ndjson; do
  echo "Checking $file for stale heartbeats"
  last_line=$(tail -1 "$file")
  if [ -n "$last_line" ]; then
    timestamp=$(echo "$last_line" | jq -r '.timestamp')
    echo "Last heartbeat: $timestamp"
  fi
done
```

### Phase 11: Dev MCP Ban Enforcement
**Purpose**: Prevent Dev MCP imports in production code to ensure production safety

#### Common Issues
- **Dev MCP Imports in Production**: Banned imports found in app/ directory
- **CI Build Failures**: Build fails due to Dev MCP violations
- **False Positives**: Legitimate imports flagged as violations
- **Missing CI Checks**: Dev MCP Ban checks not running

#### Support Procedures
1. **Scan for Dev MCP Violations**:
   ```bash
   grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i
   ```
2. **Check CI Configuration**:
   - Verify `.github/workflows/dev-mcp-ban.yml` exists
   - Check workflow is enabled and running
   - Review workflow logs for errors
3. **Validate PR Template**:
   - Ensure PR body includes "## Dev MCP Check" section
   - Verify verification statement is present

#### Troubleshooting Commands
```bash
# Scan for Dev MCP imports
grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i -n

# Check allowed directories
grep -r "mcp.*dev\|dev.*mcp" scripts/ tests/ .cursor/ docs/ --include="*.ts" --include="*.tsx" -i

# Verify CI workflow
cat .github/workflows/dev-mcp-ban.yml

# Check recent CI runs
gh run list --workflow=dev-mcp-ban.yml --limit 10
```

### Phase 12: CI Guards Integration
**Purpose**: Enforce compliance through automated merge blocking

#### Common Issues
- **Guard MCP Failures**: MCP Evidence validation failing
- **Idle Guard Failures**: Heartbeat validation failing
- **Dev MCP Ban Failures**: Dev MCP Ban validation failing
- **Workflow Not Running**: CI Guards not executing

#### Support Procedures
1. **Check CI Guard Status**:
   ```bash
   gh run list --workflow=guard-mcp.yml --limit 5
   gh run list --workflow=idle-guard.yml --limit 5
   gh run list --workflow=dev-mcp-ban.yml --limit 5
   ```
2. **Review Workflow Logs**:
   ```bash
   gh run view <run-id> --log
   ```
3. **Validate Workflow Configuration**:
   - Check workflow files exist and are valid YAML
   - Verify triggers are configured correctly
   - Confirm required permissions are set

#### Troubleshooting Commands
```bash
# Check all CI Guard workflows
ls -la .github/workflows/guard-*.yml
ls -la .github/workflows/idle-guard.yml
ls -la .github/workflows/dev-mcp-ban.yml

# Validate YAML syntax
yamllint .github/workflows/guard-mcp.yml
yamllint .github/workflows/idle-guard.yml
yamllint .github/workflows/dev-mcp-ban.yml

# Check workflow permissions
gh api repos/:owner/:repo/actions/permissions
```

## Escalation Procedures

### Level 1: Basic Support (0-30 minutes)
**Scope**: Standard troubleshooting, documentation issues, basic configuration
**Response Time**: Immediate
**Resolution Time**: 30 minutes
**Escalation**: If not resolved in 30 minutes

**Common Issues**:
- Missing evidence files
- Invalid JSONL/NDJSON format
- Basic configuration problems
- Documentation questions

**Actions**:
1. Check documentation and runbooks
2. Verify file permissions and directory structure
3. Validate JSON/JSONL format
4. Check basic configuration settings

### Level 2: Advanced Support (30 minutes - 2 hours)
**Scope**: Complex technical issues, system integration problems, performance issues
**Response Time**: 15 minutes
**Resolution Time**: 2 hours
**Escalation**: If not resolved in 2 hours

**Common Issues**:
- System integration failures
- Performance degradation
- Complex configuration issues
- Cross-system dependencies

**Actions**:
1. Deep system analysis
2. Performance monitoring and optimization
3. Integration testing and validation
4. Configuration review and adjustment

### Level 3: Expert Support (2-8 hours)
**Scope**: Critical system failures, architectural issues, security concerns
**Response Time**: 5 minutes
**Resolution Time**: 8 hours
**Escalation**: If not resolved in 8 hours

**Common Issues**:
- Critical system failures
- Security vulnerabilities
- Architectural problems
- Data integrity issues

**Actions**:
1. Emergency response procedures
2. System recovery and restoration
3. Security assessment and remediation
4. Architectural review and redesign

### Level 4: Executive Escalation (Immediate)
**Scope**: Business-critical issues, system-wide failures, security breaches
**Response Time**: Immediate
**Resolution Time**: As needed
**Escalation**: CEO and executive team notification

**Common Issues**:
- Business-critical system failures
- Security breaches
- Data loss or corruption
- System-wide outages

**Actions**:
1. Emergency response team activation
2. Executive notification and communication
3. Crisis management procedures
4. Business continuity planning

## Support Tools and Resources

### Monitoring and Alerting
- **System Health Dashboard**: Real-time monitoring of all Growth Engine components
- **Alert Configuration**: Automated alerts for critical issues
- **Performance Metrics**: Key performance indicators and trends
- **Incident Tracking**: Comprehensive incident management system

### Documentation and Knowledge Base
- **Technical Documentation**: Comprehensive technical guides
- **Troubleshooting Guides**: Step-by-step problem resolution
- **Best Practices**: Recommended procedures and standards
- **FAQ Database**: Common questions and answers

### Communication Channels
- **Primary Support**: Direct communication with support team
- **Escalation Path**: Clear escalation procedures and contacts
- **Status Updates**: Regular communication during incidents
- **Post-Incident Reviews**: Lessons learned and improvements

## Training and Development

### Support Team Training
- **Technical Training**: Deep technical knowledge of Growth Engine components
- **Process Training**: Support procedures and escalation protocols
- **Tool Training**: Monitoring tools and diagnostic utilities
- **Communication Training**: Effective communication during incidents

### Continuous Improvement
- **Incident Analysis**: Regular review of incidents and resolutions
- **Process Optimization**: Continuous improvement of support procedures
- **Tool Enhancement**: Regular updates to monitoring and diagnostic tools
- **Knowledge Sharing**: Regular sharing of learnings and best practices

## Success Metrics

### Response Time Metrics
- **Level 1**: 95% of issues resolved within 30 minutes
- **Level 2**: 90% of issues resolved within 2 hours
- **Level 3**: 85% of issues resolved within 8 hours
- **Level 4**: 100% of issues escalated within 5 minutes

### Quality Metrics
- **First Call Resolution**: 80% of issues resolved on first contact
- **Customer Satisfaction**: 95% satisfaction rating
- **Incident Recurrence**: <5% of issues recurring within 30 days
- **Knowledge Base Usage**: 90% of issues resolved using documentation

### Operational Metrics
- **System Uptime**: 99.9% availability
- **Mean Time to Resolution**: <2 hours average
- **Escalation Rate**: <10% of issues require escalation
- **Training Completion**: 100% of support team trained

## Emergency Procedures

### Critical Incident Response
1. **Immediate Assessment**: Evaluate severity and impact
2. **Team Activation**: Activate appropriate support team
3. **Communication**: Notify stakeholders and management
4. **Resolution**: Execute resolution procedures
5. **Recovery**: Restore normal operations
6. **Review**: Conduct post-incident review

### Business Continuity
- **Backup Procedures**: Regular backup and recovery testing
- **Disaster Recovery**: Comprehensive disaster recovery planning
- **Alternative Systems**: Backup systems and procedures
- **Communication Plans**: Emergency communication procedures

## Contact Information

### Support Team
- **Primary Support**: support@hotdash.com
- **Emergency Support**: +1-555-SUPPORT
- **Escalation**: manager@hotdash.com

### Management
- **Support Manager**: manager@hotdash.com
- **Technical Director**: director@hotdash.com
- **CEO**: ceo@hotdash.com

### External Resources
- **Vendor Support**: As needed for third-party components
- **Professional Services**: For complex architectural issues
- **Security Consultants**: For security-related incidents

---

**Last Updated**: 2025-10-22  
**Next Review**: 2025-11-22  
**Owner**: Support Team  
**Version**: 1.0.0
