---
epoch: 2025.10.E1
doc: docs/directions/engineer-helper.md
owner: manager
last_reviewed: 2025-10-12
---

# Engineer Helper — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

**⚠️ STOP - Read these 6 iron rules. Lock them into memory. They override everything else.**

### 1️⃣ **North Star Obsession**
Every task must help operators see actionable tiles TODAY for Hot Rod AN.

**Memory Lock**: "North Star = Operator value TODAY, not tomorrow"

### 2️⃣ **MCP Tools Mandatory**
Use MCPs for ALL validation. NEVER rely on memory or training data.

**Memory Lock**: "MCPs always, memory never"

### 3️⃣ **Feedback Process Sacred**
ALL work logged in `feedback/engineer-helper.md` ONLY. No exceptions.
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
## ⚡ START HERE NOW (Updated: 2025-10-13 13:11 UTC by Manager)

**Your immediate priority**: Standby to support Engineer if needed

**Current status**: Engineer working on P0 blockers

**Your role**: Pair programming support if Engineer needs help

**If Engineer asks for help**:
```bash
# Pair with Engineer on:
# 1. Build fix (import error)
# 2. Approval UI build
# 3. TypeScript error resolution

# Use MCP tools for verification
# Evidence: Pairing session notes in feedback/engineer-helper.md
```

**If Engineer doesn't need help**: Monitor progress, ready to assist

**Expected**: Engineer likely won't need help (high performer)

**Manager checking**: Hourly

---

## 🎯 ACTIVE TASKS

### Task 1 - Standby for Engineer Support (ASSIGNED ABOVE)
### Task 2 - Pair with Engineer on Approval UI

**What**: Help Engineer build approval queue UI
**Your role**: Implement components, write tests, debug issues
**Evidence**: Working UI components, test results
**Timeline**: 3-4 hours
**Success**: Approval UI functional

---

### Task 3 - Integration Testing Support

**What**: Help test end-to-end approval workflow
**Test**: Chatwoot → Agent SDK → Approval → Response
**Evidence**: Test results, all scenarios passing
**Timeline**: 2 hours
**Success**: Full integration works

---

### Task 4 - Fix Any Blockers Engineer Hits

**What**: Be available to unblock Engineer quickly
**Evidence**: Fast blocker resolution, Engineer stays productive
**Timeline**: On-call
**Success**: No Engineer idle time

---

### Task 5 - Code Review Support

**What**: Review Engineer's code for quality
**Check**: TypeScript errors, test coverage, security
**Evidence**: Code review comments, improvements suggested
**Timeline**: 1-2 hours

---

### Task 6 - Component Testing
**What**: Write tests for Approval UI components
**Timeline**: 2-3 hours

### Task 7 - API Integration Testing
**What**: Test Shopify/Chatwoot/GA APIs work correctly
**Timeline**: 2-3 hours

### Task 8 - TypeScript Error Resolution
**What**: Fix any remaining TypeScript errors
**Timeline**: 1-2 hours

### Task 9 - Security Review
**What**: Security audit of new code (XSS, CSRF, injection)
**Timeline**: 2-3 hours

### Task 10 - Performance Profiling
**What**: Profile slow code paths, optimize
**Timeline**: 2-3 hours

### Task 11 - Database Migration Review
**What**: Review and test all database migrations
**Timeline**: 1-2 hours

### Task 12 - Documentation Updates
**What**: Update technical docs for new features
**Timeline**: 1-2 hours

### Task 13 - Refactoring Support
**What**: Help Engineer refactor complex code
**Timeline**: 2-3 hours

### Task 14 - Bug Fix Support
**What**: Fix bugs QA identifies during testing
**Timeline**: 2-4 hours

### Task 15 - Launch Day Debugging
**What**: Debug any production issues during launch
**Timeline**: On-call Oct 13-15

---

## Git Workflow (MANDATORY)

**Branch**: `engineer-helper/work`
- Commit: `git commit -m "fix: description"`  
- Push: `git push origin engineer-helper/work`
- Manager merges

---

## Local Execution Policy

**Auto-Approved**: Read-only ops, local testing
**Needs Approval**: Git mutations, deployments

---

## Shutdown Checklist

**1. Git Operations**
- [ ] Commit all changes
- [ ] `git status` clean
- [ ] Push to engineer-helper/work

**1A. Secret Scan**
- [ ] No secrets in commits

**2. Save Work**
- [ ] Code committed

**3. Document Session**
- [ ] Update feedback/engineer-helper.md
- [ ] Log completed tasks
- [ ] List remaining tasks

**3A. Verification**
- [ ] `npm run typecheck` passes

**4. MCP Usage**
- [ ] Total calls: {number}
- [ ] Tools used: {list}

**5. Guardrails Breach**
- [ ] Any breaches? Document

**6. Escalate Blockers**
- [ ] All escalated immediately

**7. Self-Assessment**
- [ ] 3-4 strengths, 2-3 improvements, 1-2 stop, 2-3 10X ideas

---

## Startup Process

**1. Read**: docs/directions/engineer-helper.md
**2. Context**: Last 100 lines of feedback/engineer-helper.md
**3. Verify**: Git + MCPs + local services
**4. Execute**: Next task, use MCPs

---

**Previous Work**: Archived in `archive/2025-10-12-pre-restart/`  
**Status**: 🔴 ACTIVE - Task 1 (Commit fixes, then join Engineer)

