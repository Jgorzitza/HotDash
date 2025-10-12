---
epoch: 2025.10.E1
doc: docs/runbooks/agent_startup_checklist.md
owner: manager
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# Agent Startup Checklist

**Purpose**: Standardized startup procedure for all agents at beginning of work session  
**Applies To**: All 18 agents  
**Time**: 5-10 minutes (2 minutes with quick start)  
**Frequency**: Every work session start

---

## 🎯 HOW TO USE THIS CHECKLIST

**When CEO says**: "You are `<agent>`, read this startup document and execute as `<agent>`"

**You do**:
1. Replace `<your-agent>` in all commands below with your actual agent name (e.g., `engineer`, `qa`, `data`)
2. Execute each step in order
3. Begin work when checklist complete

**When CEO says**: "Manager has provided updated direction, execute"

**You do**:
1. Skip to Step 3 (Read "START HERE NOW" from your direction file)
2. Check manager's feedback for any additional context
3. Execute the task specified in "START HERE NOW"

**When CEO says**: "Provide manager feedback"

**You do**:
1. Follow shutdown checklist Step 5 (Log Session End) and Step 6 (Performance Review)
2. Write to `feedback/<your-agent>.md` ONLY (never `feedback/manager.md`)

**Examples**:
- "You are `engineer`" → Replace `<your-agent>` with `engineer` in all commands
- "You are `qa`" → Replace `<your-agent>` with `qa` in all commands
- "You are `data`" → Replace `<your-agent>` with `data` in all commands

---

## ✅ STARTUP PROCEDURE

### Step 1: Navigate & Verify (30 seconds)
```bash
cd ~/HotDash/hot-dash
pwd  # Must show: /home/justin/HotDash/hot-dash
```

**Checkpoint**: ✅ In correct directory

---

### Step 2: Read Your Status Summary (1 minute)

```bash
# Read YOUR status summary (at top of feedback file)
head -30 feedback/<your-agent>.md | grep -A 20 "CURRENT STATUS"
```

**You should see**:
- Working on: [Task]
- Progress: [Status]
- Blockers: [None/List]
- Next session starts with: [Action]

**Checkpoint**: ✅ Know where you left off

---

### Step 3: Read "START HERE NOW" from Direction (1 minute)

```bash
# Read your START HERE NOW section
grep -A 30 "START HERE NOW" docs/directions/<your-agent>.md | head -35
```

**You will see**:
- Specific task to do first
- Exact command to run
- Expected outcome
- Deadline

**Checkpoint**: ✅ Know exactly what to do first

---

### Step 4: Check for Manager Updates (1 minute)

```bash
# Check if manager addressed you
grep -i "<your-agent>" feedback/manager.md | tail -20

# Check for urgent items
grep "URGENT.*<your-agent>\|CRITICAL.*<your-agent>" feedback/manager.md | tail -5
```

**Checkpoint**: ✅ Aware of manager direction

---

### Step 5: Verify Dependencies (1 minute)

```bash
# If blocked waiting on someone, check their status
# Example: Waiting on Engineer?
tail -30 feedback/engineer.md | grep "Complete\|Task.*done"

# Services needed?
supabase status 2>/dev/null | grep "API URL" || echo "⚠️ Start if needed: supabase start"
```

**Checkpoint**: ✅ Know what's blocking you (if anything)

---

### Step 6: Log Session Start (30 seconds)

```bash
cat >> feedback/<your-agent>.md << EOF

---

## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Session Started

**Startup checklist**: ✅ Complete
**Starting with**: [Task from START HERE NOW section]
**First action**: [Exact command you'll run]

EOF
```

**Checkpoint**: ✅ Session started, logged

---

## 🎯 NOW BEGIN WORK

Execute the task from "START HERE NOW" section. Remember:
- ✅ Use MCP tools to validate patterns (examples in your direction file)
- ✅ Log commands with timestamps and outputs
- ✅ Provide evidence for completed work

---

## ⚡ QUICK START (Experienced Agents)

```bash
cd ~/HotDash/hot-dash
head -30 feedback/<your-agent>.md  # Your status
grep -A 20 "START HERE NOW" docs/directions/<your-agent>.md  # What to do
grep "<your-agent>" feedback/manager.md | tail -10  # Manager updates
# BEGIN WORK
```

**Time**: 2 minutes

---

---

## 📚 RELATED PROCESS DOCUMENTS

**Before starting work, familiarize yourself with**:
- 📍 **North Star**: `docs/NORTH_STAR.md` - Mission and 5 tiles
- 📋 **Git Protocol**: `docs/git_protocol.md` - How to commit/PR
- 🎯 **Direction Governance**: `docs/directions/README.md` - How directions work
- 📝 **Feedback Process**: `docs/policies/feedback_controls.md` - How to log work
- 🚀 **Launch Checklist**: `docs/runbooks/agent_launch_checklist.md` - Manager runs before activating you
- 🧹 **Shutdown Checklist**: `docs/runbooks/agent_shutdown_checklist.md` - Run at end of session

**Your specific direction**: `docs/directions/<your-agent>.md`

---

**Created**: 2025-10-13  
**Owner**: Manager  
**Protected**: CODEOWNERS (cannot be deleted without CEO approval)  
**Location**: docs/runbooks/agent_startup_checklist.md

