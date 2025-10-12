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


## ⚡ START HERE NOW (Updated: 2025-10-13 12:53 UTC by Manager)

**READ THIS FIRST**

**Your immediate priority**: Test build after Engineer fixes import error

**Current blocker**: Build fails (Engineer fixing Task 1)

**When Engineer completes build fix** (est. 14:00 UTC):
```bash
cd ~/HotDash/hot-dash

# 1. Verify build works
npm run build
# Expected: Success (client AND SSR)

# 2. Run full test suite
npm run test:unit
npm run typecheck

# 3. Run E2E tests (were blocked by build)
npm run test:e2e

# Evidence: All test results, build output
# Log to: feedback/qa.md
```

**Expected outcome**: All tests passing, build succeeds, E2E tests run

**Deadline**: TODAY 16:00 UTC (2 hours after Engineer fix)

**After this**: Task 2 - Verify RLS security fix from Data

**Manager checking at**: 16:00 UTC

---

## 🎯 ACTIVE TASKS (3 Tasks)

### P0 - LAUNCH BLOCKERS

**Task 1**: Test build fix - ASSIGNED ABOVE
**Task 2**: Verify RLS security (after Data applies policies)
**Task 3**: Run full E2E integration test suite

