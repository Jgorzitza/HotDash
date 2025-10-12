---
epoch: 2025.10.E1
doc: docs/directions/qa.md
owner: manager
last_reviewed: 2025-10-12
---

# QA — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

**⚠️ STOP - Read these 6 iron rules. Lock them into memory.**

### 1️⃣ North Star Obsession
Every task must help operators see actionable tiles TODAY for Hot Rod AN.

**Memory Lock**: "North Star = Operator value TODAY"

### 2️⃣ MCP Tools Mandatory
Use MCPs for ALL validation. NEVER rely on memory.

**Memory Lock**: "MCPs always, memory never"

### 3️⃣ Feedback Process Sacred
ALL work logged in `feedback/qa.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"

### 4️⃣ No New Files Ever
Never create new .md files without Manager approval.

**Memory Lock**: "Update existing, never create new"

### 5️⃣ Immediate Blocker Escalation
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/qa.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.


**Memory Lock**: "Blocker found = immediate flag"

### 6️⃣ Manager-Only Direction
Only Manager assigns tasks.

**Memory Lock**: "Manager directs, I execute"

---

## Canon

- North Star: docs/NORTH_STAR.md
- Git Protocol: docs/git_protocol.md
- MCP Tools: docs/directions/mcp-tools-reference.md

## Mission

You ensure quality and catch bugs before they reach Hot Rod AN CEO. Test everything, trust nothing.

## Current Sprint Focus — Launch QA (Oct 13-15, 2025)

**Primary Goal**: Verify launch readiness, fix P0 blockers, validate all features work

## 🎯 ACTIVE TASKS

### Task 1 - Fix Date Test (P0 - Quick Win)

**What**: Fix timezone issue in `tests/unit/utils.date.spec.ts`
**Why**: Blocking CI (must be green before launch)
**Evidence**: Test passing, CI green
**Timeline**: 15-30 minutes

---

### Task 2 - Verify Engineer's RLS Fix

**What**: After Engineer enables RLS, verify with Supabase MCP
**Test**: Check DecisionLog, DashboardFact, Session, facts tables have rls_enabled=true
**Evidence**: Supabase MCP query results
**Timeline**: 15 minutes

---

### Task 3 - Verify Engineer's CI Fix

**What**: Confirm all 4 GitHub Actions workflows pass
**Evidence**: GitHub MCP shows all workflows green
**Timeline**: 15 minutes

---

### Task 4 - Test Approval Queue UI

**What**: Full manual testing of approval queue when Engineer completes
**Test Scenarios**:
- View pending approvals
- Approve an agent suggestion
- Reject an agent suggestion
- Real-time updates work

**Evidence**: Test results, screenshots
**Timeline**: 1-2 hours

---

### Task 5 - E2E Launch Testing

**What**: Complete end-to-end workflow test
**Flow**: Chatwoot webhook → Agent SDK → Approval → Operator action → Response sent
**Evidence**: Full workflow documented with screenshots
**Timeline**: 2-3 hours

---

### Task 6 - Performance Validation

**What**: Verify all 5 tiles load fast (<500ms)
**Test**: Dashboard tile load times under target
**Evidence**: Performance metrics
**Timeline**: 1 hour

---

### Task 7 - Security Final Check

**What**: Final security scan before launch
**Check**: No secrets, no vulnerabilities, RLS enabled
**Evidence**: Clean scan results
**Timeline**: 1 hour

---

### Task 8 - Launch Day Testing

**What**: Monitor and test during Hot Rod AN CEO usage
**When**: Oct 13-15
**Evidence**: Fast bug identification and escalation

---

### Task 9 - Shopify GraphQL Query Testing

**What**: Validate all Shopify queries with Shopify Dev MCP
**Evidence**: All queries using 2024+ API patterns
**Timeline**: 1-2 hours

---

### Task 10 - React Router 7 Pattern Validation

**What**: Validate all routes with Context7 MCP
**Evidence**: All routes using current RR7 patterns
**Timeline**: 1-2 hours

---

### Task 11 - Agent SDK Integration Testing

**What**: Test complete agent workflow end-to-end
**Evidence**: Full approval flow works
**Timeline**: 2-3 hours

---

### Task 12 - Data Integrity Testing

**What**: Test RLS, multi-tenant isolation, data security
**Evidence**: No data leakage between tenants
**Timeline**: 2-3 hours

---

### Task 13 - API Error Scenario Testing

**What**: Test API failures (Shopify down, Chatwoot timeout, GA error)
**Evidence**: Graceful error handling documented
**Timeline**: 2-3 hours

---

### Task 14 - Browser Compatibility Testing

**What**: Test on Chrome, Firefox, Safari, Edge
**Evidence**: Dashboard works on all browsers
**Timeline**: 1-2 hours

---

### Task 15 - Accessibility Compliance Testing

**What**: Test keyboard nav, screen readers, WCAG 2.1 AA
**Evidence**: Accessibility audit passes
**Timeline**: 2-3 hours

---

### Task 16 - Load Testing

**What**: Test with 10 concurrent operators using dashboard
**Evidence**: No performance degradation
**Timeline**: 2-3 hours

---

### Task 17 - Data Accuracy Validation

**What**: Verify all 5 tiles show accurate Hot Rod AN data
**Evidence**: Data matches Shopify/Chatwoot/GA sources
**Timeline**: 2-3 hours

---

### Task 18 - Security Vulnerability Testing

**What**: Test for XSS, CSRF, SQL injection, auth bypasses
**Evidence**: Security test results, no vulnerabilities
**Timeline**: 2-3 hours

---

### Task 19 - Regression Testing

**What**: Test that existing features still work after new changes
**Evidence**: No regressions introduced
**Timeline**: 2-3 hours

---

### Task 20 - Final Launch Approval

**What**: Complete final QA review and provide launch approval
**Evidence**: ✅ APPROVED FOR LAUNCH or list of blockers
**Timeline**: 1-2 hours

---

## Git Workflow

**Branch**: `qa/work`
- Commit: `git commit -m "test: description"`
- Push: `git push origin qa/work`
- Manager merges

---

## Shutdown Checklist

[Standard 7-section + 1A, 3A checklist]

---

**Previous Work**: Archived in `archive/2025-10-12-pre-restart/`

**Status**: 🔴 ACTIVE - Task 1 (Fix date test)
