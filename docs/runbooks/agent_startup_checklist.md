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
**Time**: 5-10 minutes (2 minutes with health script)  
**Frequency**: Every work session start

---

## ✅ STARTUP PROCEDURE

### Step 1: Navigate & Verify (30 seconds)
```bash
cd ~/HotDash/hot-dash
pwd  # Must show: /home/justin/HotDash/hot-dash
```

**Checkpoint**: ✅ You are in the correct directory

---

### Step 2: Quick Health Check (30 seconds)

**RECOMMENDED**: Run automated health check script:
```bash
./scripts/ops/agent-startup-health.sh <your-agent>
# Output: "✅ All systems ready" or "⚠️ Issues detected: [list]"
```

**If script doesn't exist yet**, manual checks:
```bash
git status -sb  # Verify branch and state
ls docs/NORTH_STAR.md docs/directions/<your-agent>.md feedback/<your-agent>.md
# Verify core files exist
```

**Checkpoint**: ✅ Core files accessible, git state known

---

### Step 3: Read Current Status Summary (1 minute)

```bash
# Read YOUR status summary (should be at top of feedback file)
head -30 feedback/<your-agent>.md | grep -A 20 "CURRENT STATUS"
```

**You should see**:
- Working on: [Task]
- Progress: [Status]
- Blockers: [None/List]
- Next session: [Action]
- Last updated: [Date]

**If no summary exists**: Read last 100 lines to understand where you stopped

**Checkpoint**: ✅ You know where you left off

---

### Step 4: Read Canon & Direction (2 minutes)

**Quick review**:
```bash
# North Star (focus on mission, 5 tiles, operator value)
head -50 docs/NORTH_STAR.md

# Your direction (focus on ACTIVE TASKS, P0/P1 priorities)
grep -A 50 "ACTIVE TASKS\|P0\|CRITICAL" docs/directions/<your-agent>.md | head -60

# Recent direction changes
ls -l docs/directions/<your-agent>.md
# Note if modified today - read full file if so
```

**Checkpoint**: ✅ Mission understood, current tasks identified

---

### Step 5: Check for Manager Updates (1 minute)

```bash
# Check if manager addressed you specifically
grep -i "<your-agent>" feedback/manager.md | tail -30

# Check for urgent updates
grep "URGENT\|CRITICAL\|BLOCKER.*<your-agent>" feedback/manager.md | tail -10

# Check manager's last update time
tail -5 feedback/manager.md
```

**Checkpoint**: ✅ Aware of manager direction/corrections

---

### Step 6: Verify Dependencies & Blockers (1-2 minutes)

**Check if you're blocked**:
```bash
# If blocked waiting on Engineer:
tail -30 feedback/engineer.md | grep "Complete\|Task.*done\|BLOCKER.*resolved"

# If blocked waiting on QA:
tail -30 feedback/qa.md | grep "Testing.*complete\|Approved\|BLOCKER"

# If blocked waiting on Data:
tail -30 feedback/data.md | grep "Migration.*applied\|Schema.*ready"
```

**Check required services** (if needed):
```bash
# Supabase (if you need database):
supabase status 2>/dev/null | grep "API URL" || echo "⚠️ Start: supabase start"

# MCP tools (if you write code):
curl -s http://localhost:3001/health || echo "⚠️ Start Context7 MCP if needed"
```

**Checkpoint**: ✅ Know what's blocking you, services ready

---

### Step 7: Log Session Start (1 minute)

```bash
# Log your session start
cat >> feedback/<your-agent>.md << EOF

---

## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Session Started

**Startup checklist**: ✅ Complete
**Status summary reviewed**: ✅ 
**Manager updates checked**: ✅
**Dependencies verified**: ✅

**Current status**: [Starting fresh / Resuming Task X / Blocked waiting for Y]
**First action**: [Specific command or task to start with]
**Goal this session**: [What you plan to complete]

EOF
```

**Checkpoint**: ✅ Audit trail started

---

### Step 8: Update Status Summary (1 minute)

**Update the summary at top of your feedback file**:
```bash
# Manually edit the CURRENT STATUS section at top of feedback/<your-agent>.md
# Update:
# - Last updated: [TODAY's date]
# - Working on: [Current task]
# - Status: [Current state]
```

**OR** use sed:
```bash
# Update "Last updated" line
sed -i "s/Last updated:.*/Last updated: $(date -u +%Y-%m-%d\ %H:%M\ UTC)/" feedback/<your-agent>.md
```

**Checkpoint**: ✅ Status is current

---

## 🎯 NOW BEGIN WORK

You're ready! Execute tasks from your direction file. Remember:
- ✅ Log every significant command with timestamp and output
- ✅ Use MCP tools to validate patterns (never rely on training data)
- ✅ Escalate blockers immediately (don't wait)
- ✅ Provide evidence for all work (screenshots, logs, test results)
- ✅ Update feedback file regularly (not just at end)

---

## ⚡ QUICK START (Experienced Agents)

**If you've done this before and just need reminders**:
```bash
cd ~/HotDash/hot-dash
head -30 feedback/<your-agent>.md  # Status summary
tail -100 feedback/<your-agent>.md  # Recent work
grep -A 20 "ACTIVE TASKS" docs/directions/<your-agent>.md  # Current tasks
grep "<your-agent>" feedback/manager.md | tail -10  # Manager updates
# START WORK - log as you go
```

**Time**: 2 minutes

---

**Created**: 2025-10-13  
**Owner**: Manager  
**Purpose**: Ensure consistent, efficient agent startup across all 18 agents  
**Location**: docs/runbooks/agent_startup_checklist.md

