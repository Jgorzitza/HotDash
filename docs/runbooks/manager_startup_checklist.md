---
epoch: 2025.10.E1
doc: docs/runbooks/manager_startup_checklist.md
owner: CEO
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# Manager Startup Checklist

**Purpose**: Manager's daily startup procedure - verify agent status, identify blockers, set priorities  
**Time**: 15-30 minutes  
**Frequency**: Every work session start  
**Critical**: You coordinate 18 agents - your prep determines their productivity

---

## ✅ PHASE 1: SITUATION ASSESSMENT (5-10 minutes)

### Step 1: Navigate & Git Status (30 seconds)
```bash
cd ~/HotDash/hot-dash
pwd  # Verify: /home/justin/HotDash/hot-dash
git status -sb  # Note branch and uncommitted changes
git log --oneline -10  # See recent commits
```

**Checkpoint**: ✅ Know current git state

---

### Step 2: Read North Star & Mission (1 minute)
```bash
head -80 docs/NORTH_STAR.md
```

**Focus on**:
- Mission: 10X Hot Rod AN business ($1MM → $10MM)
- Core product: 5 actionable tiles (CX Pulse, Sales Pulse, SEO Pulse, Inventory Watch, Fulfillment Flow)
- Success metric: CEO time reduced from 10-12h/week → <2h/week
- Development principles: MCP-First, Evidence or No Merge

**Checkpoint**: ✅ Mission clear in your mind

---

### Step 3: Review Your Last Manager Session (2 minutes)
```bash
# Read your status summary
head -50 feedback/manager.md | grep -A 30 "CURRENT STATUS"

# Read your last 5 entries
tail -200 feedback/manager.md | grep "^## 2025" | tail -5
```

**Note**:
- What were you working on?
- Any unresolved issues?
- What did you commit to do?

**Checkpoint**: ✅ Know your own status

---

### Step 4: Scan All Agent Feedback for Blockers (3-5 minutes)

**CRITICAL**: This is your primary job - identify blockers before agents waste time.

```bash
# Quick blocker scan across all agents
for agent in engineer qa data ai deployment reliability integrations chatwoot designer enablement support marketing product compliance localization git-cleanup engineer-helper qa-helper; do
  echo "=== $agent ==="
  tail -100 feedback/$agent.md 2>/dev/null | grep -i "blocker\|blocked\|error\|failed\|critical\|urgent\|waiting" | head -5
done | tee /tmp/blocker-scan.txt

# Review the output
cat /tmp/blocker-scan.txt
```

**Look for**:
- "BLOCKER" or "BLOCKED" - agents stuck
- "waiting for" - dependencies
- "CRITICAL" or "URGENT" - high priority issues
- "ERROR" or "FAILED" - things broken

**Checkpoint**: ✅ Blockers identified

---

### Step 5: Verify Current Project State (2-3 minutes)

```bash
# TypeScript status
npm run typecheck 2>&1 | tail -20
# Note: How many errors? Are they blocking?

# Build status
npm run build 2>&1 | tail -30
# Note: Does it build? Any failures?

# Test status
npm run test:unit 2>&1 | tail -20
# Note: Pass rate? Any critical failures?

# Services status (if applicable)
curl -s https://hotdash-agent-service.fly.dev/health 2>/dev/null || echo "Agent SDK offline"
curl -s https://hotdash-llamaindex-mcp.fly.dev/health 2>/dev/null || echo "LlamaIndex MCP offline"
```

**Checkpoint**: ✅ Know what's broken vs working

---

## 🎯 PHASE 2: PRIORITIZATION & PLANNING (5-10 minutes)

### Step 6: Identify P0 Blockers (Launch Blocking) (2 minutes)

**From your scans, categorize issues**:

**P0 - LAUNCH BLOCKING** (must fix today):
- Build failures (cannot deploy)
- TypeScript errors preventing compilation
- Critical service outages
- Security vulnerabilities (RLS missing, exposed secrets)
- Agent SDK bugs preventing E2E workflow

**Write to /tmp/p0-blockers.md**:
```bash
cat > /tmp/p0-blockers.md << 'EOF'
# P0 BLOCKERS - MUST FIX TODAY

## BLOCKER #1: [Title]
- Issue: [Description]
- Impact: [Why it blocks launch]
- Owner: [Which agent must fix]
- Evidence: [Where it's documented]
- Fix time: [Estimate]
- Deadline: [Time today]

## BLOCKER #2: [Title]
...
EOF
```

**Checkpoint**: ✅ P0 blockers identified and prioritized

---

### Step 7: Identify Active Work vs Idle Agents (2 minutes)

```bash
# Check which agents logged work recently
for agent in engineer qa data ai deployment reliability integrations chatwoot designer enablement support marketing product compliance localization git-cleanup engineer-helper qa-helper; do
  last_entry=$(tail -100 feedback/$agent.md 2>/dev/null | grep "^## 2025" | tail -1)
  echo "$agent: $last_entry"
done | tee /tmp/agent-activity.txt

# Review
cat /tmp/agent-activity.txt
```

**Identify**:
- Active agents (logged work in last 24 hours)
- Idle agents (no recent entries or "standing by")
- Blocked agents (waiting on dependencies)

**Checkpoint**: ✅ Know who's working and who needs direction

---

### Step 8: Verify North Star Alignment (2-3 minutes)

**Review recent work for drift**:
```bash
# Check what agents worked on yesterday
git log --oneline --since="24 hours ago" --author="." | head -20

# For each commit, ask:
# - Does this support the 5 tiles?
# - Does this remove blockers?
# - Does this deliver operator value?
# - Or is it future work / nice-to-have?
```

**Red flags**:
- Agents working on future features while blockers exist
- Documentation when code needs fixing
- Strategic planning when tactical work pending
- Scope creep away from 5 core tiles

**Checkpoint**: ✅ Drift identified (if any)

---

## 📋 PHASE 3: DIRECTION UPDATES (5-10 minutes)

### Step 9: Review All Direction Files for Cleanup Needs (3-5 minutes)

```bash
# Check direction file sizes
wc -l docs/directions/*.md | sort -n | tail -20

# STRICT LIMIT: Flag any >400 lines (MUST clean)
echo "=== STRICT LIMIT VIOLATIONS (>400 lines) ==="
wc -l docs/directions/*.md | awk '$1 > 400 {print "🚨 "$2, "("$1" lines) EXCEEDS STRICT LIMIT"}'

# RECOMMENDED: Flag any >200 lines (clean unless CEO approved)
echo "=== RECOMMENDED CLEANUP (>200 lines) ==="
wc -l docs/directions/*.md | awk '$1 > 200 && $1 <= 400 {print "⚠️  "$2, "("$1" lines) - CLEANUP RECOMMENDED"}' | tee /tmp/bloated-directions.txt

# Check for stale directions (not cleaned recently)
for agent in engineer qa data ai deployment reliability integrations chatwoot; do
  last_cleaned=$(grep "last_cleaned:" docs/directions/$agent.md 2>/dev/null | cut -d: -f2 | tr -d ' ')
  
  if [ -z "$last_cleaned" ]; then
    echo "⚠️  $agent.md: Never cleaned - CLEANUP TODAY"
  else
    days_old=$(( ( $(date +%s) - $(date -d "$last_cleaned" +%s) ) / 86400 ))
    if [ $days_old -gt 7 ]; then
      echo "⚠️  $agent.md: Last cleaned $days_old days ago - CLEANUP RECOMMENDED"
    fi
  fi
done | tee -a /tmp/bloated-directions.txt

# Check for missing "START HERE NOW" sections
for file in docs/directions/*.md; do
  agent=$(basename "$file" .md)
  if ! grep -q "START HERE NOW" "$file"; then
    echo "❌ $agent.md: Missing 'START HERE NOW' section - ADD IN SHUTDOWN"
  fi
done | tee -a /tmp/bloated-directions.txt

cat /tmp/bloated-directions.txt
```

**For each bloated file, note**:
- Completed tasks still listed?
- 10X expansion tasks burying P0 work?
- Outdated priorities?
- Missing "START HERE NOW" section?
- Stale (not cleaned in 7+ days)?

**⚠️ CRITICAL**:  
- Files >400 lines: MUST clean immediately (strict limit)
- Files >200 lines: Should clean unless CEO approved long task list
- Completed tasks: Remove every shutdown

**Checkpoint**: ✅ Know which directions need cleanup (and why)

---

### Step 10: Prepare Agent Priorities Using Priority Matrix (3-5 minutes)

**Use the Priority Decision Matrix** (docs/runbooks/manager_priority_matrix.md):

**For each potential task, ask 5 questions**:
1. Does it fix a blocker? → YES = P0
2. Does it enable another agent's P0? → YES = P0  
3. Is it needed for launch? → YES = P1
4. Does it support one of 5 tiles? → YES = P1
5. Does product work without it? → YES = P2 or ARCHIVE

**Based on blockers and matrix results, decide**:

```bash
cat > /tmp/today-priorities.md << 'EOF'
# AGENT PRIORITIES - TODAY

## P0 - LAUNCH BLOCKERS (Do First):
- Engineer: Fix build failure (30 min)
- QA: Verify build after fix (30 min)
- Data: Fix RLS on critical tables (1 hour)

## P1 - IMPORTANT (After P0):
- Compliance: Clean GA MCP drift (1 hour)
- Marketing: Update messaging (30 min)

## P2 - NICE TO HAVE (If time):
- [Other work]

## PAUSED (Do NOT work on):
- Future features (wait until launch complete)
- Strategic planning (wait until blockers cleared)
- Documentation polish (focus on code)
EOF

cat /tmp/today-priorities.md
```

**Checkpoint**: ✅ Clear priorities for agents

---

### Step 11: Log Session Start (1 minute)

```bash
cat >> feedback/manager.md << EOF

---

## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Manager Session Started

**Startup checklist**: ✅ Complete
**Blockers identified**: [count] P0, [count] P1
**Idle agents**: [list if any]
**Drift detected**: [None / Yes - details below]
**Today's priority**: [Main focus for the day]

### Blocker Summary
[Copy from /tmp/p0-blockers.md]

### Agent Assignments
[Will be sent to each agent after reviewing their current direction]

**Status**: Ready to coordinate agents

EOF
```

**Checkpoint**: ✅ Session started, priorities documented

---

## 🎯 PHASE 4: AGENT COORDINATION (Variable time)

### Step 12: Now Review Individual Agent Directions

For each agent with work to do (especially those with blockers or idle):

1. Read their direction file
2. Read their feedback (current status)
3. Determine what they should work on TODAY
4. Update their direction if needed (or note in feedback/manager.md)

**This becomes your daily work - coordinating agents, removing blockers, maintaining focus.**

---

## ⚡ QUICK STARTUP (Experienced Manager)

**If you've done this many times**:
```bash
cd ~/HotDash/hot-dash

# Quick checks
head -50 docs/NORTH_STAR.md  # Mission
head -30 feedback/manager.md  # Your status

# Blocker scan
for agent in engineer qa data ai deployment reliability; do
  echo "=== $agent ===" 
  tail -50 feedback/$agent.md | grep -i "blocker\|critical" | head -3
done

# Build/test status
npm run typecheck 2>&1 | tail -5
npm run build 2>&1 | tail -10

# Log start
echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ) — Manager session started, [X] blockers found" >> feedback/manager.md

# Begin coordination
```

**Time**: 5-7 minutes

---

## 🚨 CRITICAL REMINDERS

**Your Job**:
- ✅ **Find blockers** before agents hit them
- ✅ **Verify claims** (agent says "complete" → you verify)
- ✅ **Maintain focus** (blockers first, then features)
- ✅ **Clean directions** (remove outdated tasks in shutdown)
- ✅ **Prevent drift** (align all work to North Star)

**You Are NOT**:
- ❌ Doing the work yourself
- ❌ Accepting "standing by" without assigning work
- ❌ Letting task lists bloat with future work
- ❌ Allowing agents to work on nice-to-haves while blockers exist

---

---

## 📚 RELATED MANAGER DOCUMENTS

**Your process toolkit**:
- 🧹 **Shutdown Checklist**: `docs/runbooks/manager_shutdown_checklist.md` - End of session cleanup
- 🎯 **Priority Matrix**: `docs/runbooks/manager_priority_matrix.md` - How to prioritize every task
- 📊 **Recommendations**: `docs/runbooks/MANAGER_RECOMMENDATIONS.md` - Process improvements
- 🚀 **Agent Launch**: `docs/runbooks/agent_launch_checklist.md` - Before activating agents
- 📝 **Standup Template**: `docs/directions/manager_standup_template.md` - Daily updates

**Agent checklists**:
- `docs/runbooks/agent_startup_checklist.md` - How agents start
- `docs/runbooks/agent_shutdown_checklist.md` - How agents cleanup

**Your direction**: `docs/directions/manager.md`

---

**Created**: 2025-10-13  
**Owner**: CEO  
**Protected**: CODEOWNERS (cannot be deleted without CEO approval)  
**Purpose**: Ensure manager starts each session with full situation awareness  
**Location**: docs/runbooks/manager_startup_checklist.md

