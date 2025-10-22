# Agent Troubleshooting Runbook

## Overview
This runbook provides systematic troubleshooting procedures for common agent errors and issues, ensuring rapid resolution and minimal disruption to operations.

## Prerequisites
- Access to agent logs and monitoring systems
- Understanding of agent architecture and dependencies
- Escalation procedures and contact information
- Diagnostic tools and utilities

## Common Agent Issues and Solutions

### 1. Agent Startup Failures

#### Symptoms
- Agent fails to initialize
- Error messages during startup
- Agent appears offline
- Service not responding

#### Diagnostic Steps
- [ ] **Check agent logs**:
  ```bash
  tail -f /var/log/agent/agent.log
  grep -i "error\|exception\|failed" /var/log/agent/agent.log
  ```
- [ ] **Verify system resources**:
  ```bash
  free -h  # Check memory
  df -h    # Check disk space
  top      # Check CPU usage
  ```
- [ ] **Check dependencies**:
  ```bash
  systemctl status postgresql
  systemctl status redis
  systemctl status nginx
  ```

#### Common Causes and Solutions
- **Memory issues**: Restart agent, increase memory allocation
- **Database connection**: Check database status, verify credentials
- **Port conflicts**: Check for port conflicts, restart services
- **Configuration errors**: Validate configuration files

### 2. Agent Communication Errors

#### Symptoms
- Agent not receiving tasks
- Communication timeouts
- Message queue errors
- API connection failures

#### Diagnostic Steps
- [ ] **Check network connectivity**:
  ```bash
  ping api.hotdash.com
  telnet api.hotdash.com 443
  curl -I https://api.hotdash.com/health
  ```
- [ ] **Verify message queue**:
  ```bash
  redis-cli ping
  redis-cli llen task_queue
  redis-cli llen result_queue
  ```
- [ ] **Check API credentials**:
  ```bash
  echo $API_KEY
  echo $AGENT_ID
  curl -H "Authorization: Bearer $API_KEY" https://api.hotdash.com/agent/status
  ```

#### Common Causes and Solutions
- **Network issues**: Check firewall, DNS, routing
- **Authentication**: Verify API keys, refresh tokens
- **Message queue**: Restart Redis, clear queues
- **Rate limiting**: Check API limits, implement backoff

### 3. Task Processing Errors

#### Symptoms
- Tasks stuck in processing
- Task failures without completion
- Memory leaks during processing
- Timeout errors

#### Diagnostic Steps
- [ ] **Check task status**:
  ```bash
  curl https://api.hotdash.com/tasks/status
  ps aux | grep agent
  ```
- [ ] **Monitor resource usage**:
  ```bash
  htop
  iotop
  netstat -tulpn
  ```
- [ ] **Check task logs**:
  ```bash
  tail -f /var/log/agent/task.log
  grep -i "task_id" /var/log/agent/task.log
  ```

#### Common Causes and Solutions
- **Resource exhaustion**: Restart agent, optimize memory usage
- **Infinite loops**: Check task logic, implement timeouts
- **External API failures**: Implement retry logic, fallback procedures
- **Database locks**: Check for long-running transactions

### 4. Data Processing Issues

#### Symptoms
- Data corruption errors
- Processing timeouts
- Memory allocation failures
- File system errors

#### Diagnostic Steps
- [ ] **Check data integrity**:
  ```bash
  md5sum /data/input/*
  ls -la /data/input/
  ```
- [ ] **Verify file permissions**:
  ```bash
  ls -la /data/
  chmod -R 755 /data/
  chown -R agent:agent /data/
  ```
- [ ] **Check disk space**:
  ```bash
  df -h
  du -sh /data/*
  ```

#### Common Causes and Solutions
- **File corruption**: Restore from backup, re-download data
- **Permission issues**: Fix file ownership, update permissions
- **Disk space**: Clean up temporary files, expand storage
- **Memory issues**: Optimize processing, increase memory

### 5. Integration Failures

#### Symptoms
- External API timeouts
- Authentication failures
- Data format errors
- Service unavailable errors

#### Diagnostic Steps
- [ ] **Test external connections**:
  ```bash
  curl -v https://external-api.com/health
  telnet external-api.com 443
  ```
- [ ] **Check API credentials**:
  ```bash
  echo $EXTERNAL_API_KEY
  curl -H "Authorization: Bearer $EXTERNAL_API_KEY" https://external-api.com/test
  ```
- [ ] **Validate data formats**:
  ```bash
  python -m json.tool input.json
  jq '.' input.json
  ```

#### Common Causes and Solutions
- **API changes**: Update integration code, verify endpoints
- **Authentication**: Refresh tokens, verify credentials
- **Rate limiting**: Implement backoff, request limits
- **Data format**: Validate schemas, update parsers

## Systematic Troubleshooting Process

### Step 1: Initial Assessment
- [ ] **Identify the problem**:
  - What is not working?
  - When did it start?
  - What changed recently?
  - What is the business impact?
- [ ] **Gather initial information**:
  - Error messages and logs
  - System status
  - Recent changes
  - User reports

### Step 2: Log Analysis
- [ ] **Collect relevant logs**:
  ```bash
  # Agent logs
  tail -n 1000 /var/log/agent/agent.log > agent_issue.log
  
  # System logs
  journalctl -u agent --since "1 hour ago" > system_issue.log
  
  # Application logs
  tail -n 1000 /var/log/application/app.log > app_issue.log
  ```
- [ ] **Search for error patterns**:
  ```bash
  grep -i "error\|exception\|failed\|timeout" /var/log/agent/agent.log
  grep -A 5 -B 5 "specific_error" /var/log/agent/agent.log
  ```

### Step 3: System Health Check
- [ ] **Verify system resources**:
  ```bash
  # CPU and Memory
  top -bn1 | head -20
  
  # Disk usage
  df -h
  
  # Network connectivity
  ping -c 4 8.8.8.8
  ```
- [ ] **Check service status**:
  ```bash
  systemctl status agent
  systemctl status postgresql
  systemctl status redis
  ```

### Step 4: Dependency Verification
- [ ] **Check external dependencies**:
  - Database connectivity
  - Message queue status
  - API endpoints
  - File system access
- [ ] **Verify configuration**:
  - Configuration file syntax
  - Environment variables
  - Network settings
  - Security settings

### Step 5: Isolation and Testing
- [ ] **Isolate the problem**:
  - Test individual components
  - Verify specific functions
  - Check data flow
  - Validate inputs/outputs
- [ ] **Create test scenarios**:
  - Minimal reproduction case
  - Known good test
  - Edge case testing
  - Performance testing

## Advanced Troubleshooting Techniques

### Performance Issues
- [ ] **Profile resource usage**:
  ```bash
  # CPU profiling
  perf top -p $(pgrep agent)
  
  # Memory profiling
  valgrind --tool=massif ./agent
  
  # Network monitoring
  netstat -i
  ss -tuln
  ```
- [ ] **Identify bottlenecks**:
  - Database query performance
  - Network latency
  - Memory allocation
  - CPU utilization

### Memory Issues
- [ ] **Monitor memory usage**:
  ```bash
  # Real-time memory monitoring
  watch -n 1 'free -h'
  
  # Process memory usage
  ps aux --sort=-%mem | head -10
  
  # Memory leaks detection
  valgrind --leak-check=full ./agent
  ```
- [ ] **Memory optimization**:
  - Garbage collection tuning
  - Memory pool optimization
  - Cache management
  - Resource cleanup

### Network Issues
- [ ] **Network diagnostics**:
  ```bash
  # Connectivity tests
  traceroute api.hotdash.com
  mtr api.hotdash.com
  
  # Port scanning
  nmap -p 443,80 api.hotdash.com
  
  # DNS resolution
  nslookup api.hotdash.com
  dig api.hotdash.com
  ```
- [ ] **Network optimization**:
  - Connection pooling
  - Timeout configuration
  - Retry mechanisms
  - Load balancing

## Escalation Procedures

### Level 1: Basic Troubleshooting
- **Scope**: Common issues, standard procedures
- **Tools**: Logs, basic diagnostics, restart procedures
- **Timeline**: 15-30 minutes
- **Escalation**: If not resolved in 30 minutes

### Level 2: Advanced Troubleshooting
- **Scope**: Complex issues, system-level problems
- **Tools**: Advanced diagnostics, system analysis, configuration changes
- **Timeline**: 1-2 hours
- **Escalation**: If not resolved in 2 hours

### Level 3: Expert Intervention
- **Scope**: Critical issues, architectural problems
- **Tools**: Deep system analysis, code review, infrastructure changes
- **Timeline**: 2-4 hours
- **Escalation**: If not resolved in 4 hours

### Level 4: Emergency Response
- **Scope**: Business-critical issues, system-wide failures
- **Tools**: All available resources, emergency procedures
- **Timeline**: Immediate response
- **Escalation**: Executive notification

## Prevention and Monitoring

### Proactive Monitoring
- [ ] **Set up alerts**:
  - CPU usage > 80%
  - Memory usage > 90%
  - Disk space < 10%
  - Error rate > 5%
- [ ] **Regular health checks**:
  - Daily system status
  - Weekly performance review
  - Monthly capacity planning
  - Quarterly architecture review

### Maintenance Procedures
- [ ] **Regular maintenance**:
  - Log rotation and cleanup
  - Database optimization
  - Cache management
  - Security updates
- [ ] **Preventive measures**:
  - Resource monitoring
  - Performance tuning
  - Capacity planning
  - Disaster recovery testing

## Documentation and Reporting

### Issue Documentation
- [ ] **Record all issues**:
  - Problem description
  - Root cause analysis
  - Resolution steps
  - Prevention measures
- [ ] **Update procedures**:
  - Add new troubleshooting steps
  - Update escalation procedures
  - Improve monitoring
  - Enhance documentation

### Performance Reporting
- [ ] **Track metrics**:
  - Issue frequency
  - Resolution time
  - System uptime
  - Performance trends
- [ ] **Generate reports**:
  - Weekly status reports
  - Monthly performance reviews
  - Quarterly capacity planning
  - Annual system assessment

## Success Criteria
- [ ] 95%+ of issues resolved within SLA
- [ ] Mean time to resolution < 2 hours
- [ ] System uptime > 99.5%
- [ ] Zero critical issues unresolved
- [ ] Proactive issue prevention > 80%

## Related Documentation
- System Architecture Guide
- Monitoring and Alerting Procedures
- Disaster Recovery Plan
- Performance Optimization Guide

---
**Last Updated**: 2025-10-22  
**Next Review**: 2025-11-22  
**Owner**: Support Team
