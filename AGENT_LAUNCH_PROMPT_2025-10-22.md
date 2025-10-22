# 🚀 AGENT LAUNCH PROMPT - 2025-10-22

## 🎯 MISSION: Database-Driven Growth Engine Development

**Branch**: `agent-launch-20251022` ⚠️ **CRITICAL: Work on this branch only**  
**System**: Database-driven task management (NO markdown files)  
**Status**: 144 tasks assigned, 26% complete, 8 phases active  

---

## 📋 AGENT STARTUP CHECKLIST

### 0. **Verify Branch** (10 seconds)
```bash
# Confirm you're on the correct branch
git branch --show-current
# Should show: agent-launch-20251022

# If not on correct branch:
git checkout agent-launch-20251022
```

### 1. **Get Your Tasks** (30 seconds)
```bash
# Query your assigned tasks from database
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <your-agent-name>

# Examples:
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts engineer
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts designer
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts data
```

### 2. **Start Your Next Task** (15 seconds)
```bash
# Start highest priority unblocked task
npx tsx --env-file=.env scripts/agent/start-task.ts <TASK-ID>

# Example:
npx tsx --env-file=.env scripts/agent/start-task.ts ENG-100
```

### 3. **Log Progress** (MANDATORY - IMMEDIATE)
```bash
# Log completion, blockers, or questions
npx tsx --env-file=.env scripts/agent/complete-task.ts <TASK-ID> "completion notes"

# Or use logDecision() directly in your code:
await logDecision({
  scope: 'build',
  actor: '<your-agent>',
  taskId: 'TASK-ID',
  status: 'completed', // or 'blocked', 'in_progress'
  progressPct: 100,
  action: 'task_completed',
  rationale: 'Completed task description',
  evidenceUrl: 'path/to/evidence'
});
```

---

## 🎯 CURRENT PRIORITIES (P0 Tasks)

### **DATA Agent** - Critical Path
- `DATA-100`: Apply All Phase 7-13 Migrations (33 tables) - **START HERE**

### **ENGINEER Agent** - Core Features  
- `ENG-100`: Approvals Drawer Backend Integration
- `ENG-008`: Idea Pool Tile
- `ENG-009`: Approvals Queue Tile

### **DESIGNER Agent** - UX Refinement
- `DESIGNER-100`: Approvals Drawer UX Refinement

---

## 📊 PROJECT STATUS

- **Total Tasks**: 144 across 8 phases
- **Completed**: 38 (26%)
- **Active**: 106 tasks assigned
- **Phases**: Foundation (38% complete) → Growth Engine (0% complete)

---

## 🚨 CRITICAL RULES

### ✅ **MUST DO**
1. **Query tasks from database** (not markdown files)
2. **Log progress IMMEDIATELY** on status changes
3. **Use `logDecision()`** for all progress reporting
4. **Include `taskId`, `status`, `progressPct`** in every log
5. **Report blockers** with `status: 'blocked'` + `blockerDetails`

### ❌ **MUST NOT**
1. **Read markdown direction files** (archived - use database)
2. **Self-assign tasks** (all from Manager via database)
3. **Skip `logDecision()` calls** (database logging MANDATORY)
4. **Wait to report status changes** (IMMEDIATE logging required)

---

## 🔧 QUICK COMMANDS

```bash
# Get your tasks
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <agent>

# Start a task
npx tsx --env-file=.env scripts/agent/start-task.ts <TASK-ID>

# Complete a task  
npx tsx --env-file=.env scripts/agent/complete-task.ts <TASK-ID> "notes"

# Manager queries (for reference)
npx tsx --env-file=.env scripts/manager/query-agent-status.ts
npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts
npx tsx --env-file=.env scripts/manager/query-all-tasks.ts
```

---

## 🎯 SUCCESS CRITERIA

- **Database-driven**: All task management via database
- **Real-time**: Manager sees progress instantly
- **No idle time**: Agents switch to next available task when blocked
- **Complete context**: Rich metadata in `payload` field
- **Growth Engine**: Phases 9-13 production-ready

---

## 🚀 LAUNCH SEQUENCE

1. **Verify branch** (10 seconds) - `git branch --show-current`
2. **Read this prompt** (2 minutes)
3. **Query your tasks** (30 seconds)
4. **Start highest priority task** (15 seconds)
5. **Log startup** via `logDecision()` (30 seconds)
6. **Begin work** and log progress immediately

---

**Ready to launch? Execute your startup checklist and begin Growth Engine development!**

**Manager Status**: All systems operational, database ready, 144 tasks assigned  
**Next Check-in**: Every 2 hours via `logDecision()`  
**Support**: Database queries provide instant visibility
