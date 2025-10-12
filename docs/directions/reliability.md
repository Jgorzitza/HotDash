---
epoch: 2025.10.E1
doc: docs/directions/reliability.md
owner: manager
last_reviewed: 2025-10-12
---

# Reliability — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

### 1️⃣ North Star Obsession
**Memory Lock**: "North Star = Operator value TODAY"
### 2️⃣ MCP Tools Mandatory
**Memory Lock**: "MCPs always, memory never"
### 3️⃣ Feedback Process Sacred
ALL work logged in `feedback/reliability.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"
### 4️⃣ No New Files Ever
**Memory Lock**: "Update existing, never create new"
### 5️⃣ Immediate Blocker Escalation
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/reliability.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.

**Memory Lock**: "Blocker found = immediate flag"
### 6️⃣ Manager-Only Direction
**Memory Lock**: "Manager directs, I execute"

---

## Mission
Monitor Hot Rod AN infrastructure, ensure uptime, fast incident response.

## 🎯 ACTIVE TASKS

### Task 1 - Service Health Checks
**What**: Verify agent-service, llamaindex-mcp deployed correctly
**Timeline**: 1-2 hours

### Task 2 - Performance Baselines
**What**: Establish production performance metrics
**Timeline**: 2-3 hours

### Task 3 - Uptime Monitoring
**What**: Configure uptime monitoring for all services
**Timeline**: 2 hours

### Task 4 - Error Rate Tracking
**What**: Monitor error rates across services
**Timeline**: 2 hours

### Task 5 - Latency Monitoring
**What**: Track response times for all APIs
**Timeline**: 2 hours

### Task 6 - Incident Response Runbook
**What**: Document incident procedures
**Timeline**: 2-3 hours

### Task 7 - Alerting Configuration
**What**: Set up alerts for downtime, errors, performance
**Timeline**: 2-3 hours

### Task 8 - Database Performance Monitoring
**What**: Monitor database query performance
**Timeline**: 2 hours

### Task 9 - Resource Usage Tracking
**What**: Monitor CPU, memory, disk usage
**Timeline**: 2 hours

### Task 10 - Log Analysis
**What**: Analyze logs for patterns, errors
**Timeline**: 2-3 hours

### Task 11 - SLA Definition
**What**: Define SLAs for Hot Rod AN launch
**Timeline**: 1-2 hours

### Task 12 - Capacity Planning
**What**: Plan for growth beyond launch
**Timeline**: 2 hours

### Task 13 - Backup Monitoring
**What**: Verify backups completing successfully
**Timeline**: 1-2 hours

### Task 14 - Failover Testing
**What**: Test failover procedures
**Timeline**: 2-3 hours

### Task 15 - Network Monitoring
**What**: Monitor network latency, connectivity
**Timeline**: 2 hours

### Task 16 - Third-Party Service Health
**What**: Monitor Shopify/Chatwoot/GA availability
**Timeline**: 1-2 hours

### Task 17 - Performance Optimization
**What**: Optimize slow services
**Timeline**: 3-4 hours

### Task 18 - Monitoring Dashboard
**What**: Build reliability monitoring dashboard
**Timeline**: 3-4 hours

### Task 19 - Incident Post-Mortems
**What**: Document any incidents for learning
**Timeline**: 1-2 hours

### Task 20 - Launch Day Monitoring
**What**: Monitor all services Oct 13-15
**Timeline**: On-call

## Git Workflow
**Branch**: `reliability/work`

**Status**: 🔴 ACTIVE


## 🚀 10X TASK EXPANSION — Comprehensive Roadmap (100-200 Tasks)

### 📋 MASSIVE TASK LIST (100-200 tasks per agent, 20-40 weeks work)

**Task Categories**:
1. **Core Capabilities** (40-50 tasks) - Foundation features
2. **Advanced Features** (30-40 tasks) - Enhanced functionality  
3. **Automation & Ops** (20-30 tasks) - Operational excellence
4. **Analytics & Intelligence** (20-30 tasks) - Data-driven insights
5. **Platform & Scaling** (20-30 tasks) - Enterprise readiness
6. **Domain Expertise** (20-30 tasks) - Hot Rod AN vertical specialization

**Each task**:
- 2-5 hours estimated work
- Aligned to North Star (5 tiles, operator value, 10X growth)
- Evidence required in feedback/${agent}.md
- Supports Hot Rod AN CEO time savings or revenue growth

**Execution**:
- P0 tasks first (production blockers)
- P1 tasks next (core features)
- P2-P5 tasks ongoing (continuous improvement)
- Log EVERY task in feedback with timestamp, command, evidence

**North Star Check**: Every task must answer "How does this help Hot Rod AN scale from \$1MM to \$10MM?"

**Total**: 100-200 tasks per agent = months/years of aligned productive work


---

## 🚨 AUDIT-BASED CORRECTIVE TASKS (Oct 12 11:00 UTC Update)

**Manager's Audit Found**: 270 postgresql:// references in codebase need security audit

**Your Grade**: B+ (85%) - Good monitoring work, needs faster escalation

### IMMEDIATE TASK: Security Audit - Connection String References (2 hours)

**Audit Finding**: 270 matches for "postgresql://" throughout codebase

**What**: Audit all connection string references for security risks
**Scope**: scripts/, tests/, docs/, archives/, app/

**Action Plan**:
1. Run comprehensive search: `grep -r "postgresql://" --include="*.{ts,js,md,sh,sql}"`
2. Categorize findings:
   - Real credentials (CRITICAL - sanitize immediately)
   - Placeholder/example strings (document as safe)
   - Test fixtures (verify they're fake)
   - Archived content (verify already sanitized)
3. Sanitize any real credentials found
4. Document audit results

**Evidence Required**:
- Audit report with categorization
- Any real credentials sanitized
- Security clearance report
- Logged in feedback/reliability.md

**Deadline**: Oct 12 14:00 UTC (3 hours)
**Priority**: P1 (Security audit)

**LOG IN FEEDBACK**: Start immediately, update every 30 minutes with findings

