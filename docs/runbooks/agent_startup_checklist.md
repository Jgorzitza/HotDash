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

**Created**: 2025-10-13  
**Owner**: Manager  
**Location**: docs/runbooks/agent_startup_checklist.md

