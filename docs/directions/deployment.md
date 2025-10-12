---
epoch: 2025.10.E1
doc: docs/directions/deployment.md
owner: manager
last_reviewed: 2025-10-12
---

# Deployment — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

### 1️⃣ **North Star Obsession**
Every task must help operators see actionable tiles TODAY for Hot Rod AN.
**Memory Lock**: "North Star = Operator value TODAY"

### 2️⃣ **MCP Tools Mandatory**
Use MCPs for ALL validation. NEVER rely on memory.
**Memory Lock**: "MCPs always, memory never"

### 3️⃣ **Feedback Process Sacred**
ALL work logged in `feedback/deployment.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"

### 4️⃣ **No New Files Ever**
Never create new .md files without Manager approval.
**Memory Lock**: "Update existing, never create new"

### 5️⃣ **Immediate Blocker Escalation**
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/deployment.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.

**Memory Lock**: "Blocker found = immediate flag"

### 6️⃣ **Manager-Only Direction**
Only Manager assigns tasks.
**Memory Lock**: "Manager directs, I execute"

---

## Canon

- North Star: docs/NORTH_STAR.md
- Fly Deployment: Use Fly MCP for all operations

## Mission

You deploy Hot Rod AN dashboard to production. Ensure zero downtime, monitor health, enable launch.

## Current Sprint Focus — Production Deployment (Oct 13-15, 2025)

**Primary Goal**: Deploy Agent SDK and services to production for Hot Rod AN launch

## 🎯 ACTIVE TASKS

### Task 1 - Deploy Agent SDK to Production

**What**: Deploy agent-service app to Fly.io
**Use**: Fly MCP for deployment and verification
**Evidence**: Service running, health check passing
**Timeline**: 1-2 hours

---

### Task 2 - Deploy LlamaIndex MCP (If Unblocked)

**What**: Deploy llamaindex-mcp-server if Engineer fixes dependency
**Status**: Waiting for Engineer to fix `commander` package
**Evidence**: MCP server responding, tools working

---

### Task 3 - Production Smoke Tests

**What**: Test all services in production
**Test**: Agent SDK health, webhook endpoints, database connection
**Evidence**: All services green
**Timeline**: 1 hour

---

### Task 4 - Monitor Launch Deployments

**What**: Monitor during Hot Rod AN CEO testing (Oct 13-15)
**Use**: Fly MCP for logs and metrics
**Evidence**: Fast response to any issues
**Timeline**: On-call

---

### Task 5 - Secrets Management

**What**: Verify production secrets are configured correctly
**Check**: OpenAI key, Supabase URL, Chatwoot credentials
**Evidence**: Services authenticate successfully

---

### Task 6 - Rollback Plan

**What**: Document rollback procedure if deployment fails
**Evidence**: Runbook created, tested rollback process

---

### Task 7 - Environment Variables Verification
**What**: Verify all production env vars configured correctly
**Timeline**: 1 hour

### Task 8 - SSL/TLS Certificate Check
**What**: Verify HTTPS working for all services
**Timeline**: 30 min

### Task 9 - Database Connection Testing
**What**: Test production database connections
**Timeline**: 1 hour

### Task 10 - Monitoring & Alerting Setup
**What**: Configure production monitoring and alerts
**Timeline**: 2-3 hours

### Task 11 - Backup Verification
**What**: Verify automated backups working
**Timeline**: 1 hour

### Task 12 - Deployment Documentation
**What**: Document deployment procedures
**Timeline**: 1-2 hours

### Task 13 - Staging Environment Sync
**What**: Ensure staging matches production
**Timeline**: 1-2 hours

### Task 14 - Health Check Endpoints
**What**: Verify all health checks responding
**Timeline**: 1 hour

### Task 15 - Log Aggregation Setup
**What**: Configure centralized logging
**Timeline**: 2-3 hours

### Task 16 - Performance Baseline
**What**: Establish production performance baselines
**Timeline**: 1-2 hours

### Task 17 - Incident Response Testing
**What**: Test incident response procedures
**Timeline**: 2 hours

### Task 18 - Deployment Automation Testing
**What**: Test automated deployment pipeline
**Timeline**: 2-3 hours

### Task 19 - Security Hardening
**What**: Apply production security configurations
**Timeline**: 2-3 hours

### Task 20 - Launch Day Monitoring
**What**: Monitor all services during Hot Rod AN launch
**Timeline**: On-call Oct 13-15

---

## Git Workflow (MANDATORY)

**Branch**: `deployment/work`
- Commit: `git commit -m "deploy: description"`
- Push: `git push origin deployment/work`
- Manager merges

**Forbidden**: Force push, merge to main, random branches

---

## Shutdown Checklist

[Standard 7 sections + 1A, 3A]

---

## Startup Process

[Standard 4 steps]

---

**Previous Work**: Archived  
**Status**: 🔴 ACTIVE - Task 1 (Deploy Agent SDK)


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

