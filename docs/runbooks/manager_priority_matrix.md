---
epoch: 2025.10.E1
doc: docs/runbooks/manager_priority_matrix.md
owner: manager
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# Manager Priority Decision Matrix

**Purpose**: Objective framework for prioritizing every task agents might work on  
**Use**: Every time you assign work, update direction, or evaluate agent requests  
**Goal**: Ensure blockers fixed first, then North Star work, then nice-to-haves

---

## 🎯 THE 5-QUESTION FRAMEWORK

**For EVERY task, ask these 5 questions IN ORDER**:

```
Q1: Does it fix a blocker? 
    → YES: P0 (do immediately)
    → NO: Continue to Q2

Q2: Does it enable another agent's P0 work?
    → YES: P0 (dependency blocker) 
    → NO: Continue to Q3

Q3: Is it needed for production launch?
    → YES: P1 (launch-critical)
    → NO: Continue to Q4

Q4: Does it directly support one of the 5 tiles?
    → YES: P1 (North Star aligned)
    → NO: Continue to Q5

Q5: Is the product currently working without it?
    → YES (working): P2 or ARCHIVE
    → NO (broken): Back to Q1 (it's a blocker!)
```

---

## 📊 DETAILED EXAMPLES (Real Tasks)

### Example 1: "Fix build failure - SSR bundle won't compile"

**Q1: Does it fix a blocker?**
- Issue: `npm run build` fails
- Impact: Cannot deploy to production
- Blocks: All deployment, QA E2E testing, launch
- **Answer**: ✅ YES → **P0 IMMEDIATE**

**Decision**: P0, assign to Engineer, deadline: 2 hours  
**Reasoning**: Product cannot ship without building

---

### Example 2: "Fix 51 tables missing RLS policies"

**Q1: Does it fix a blocker?**
- Issue: Database security vulnerability
- Impact: Multi-tenant data exposed
- Risk: ANY user can access ALL data
- **Answer**: ✅ YES → **P0 IMMEDIATE**

**Decision**: P0, assign to Data/Engineer, deadline: 4 hours  
**Reasoning**: Security blocker, cannot launch with exposed data

---

### Example 3: "Deploy Agent SDK to Fly"

**Q1: Does it fix a blocker?**
- Not broken, just not deployed
- **Answer**: ❌ NO

**Q2: Does it enable another agent's P0 work?**
- QA cannot test E2E without Agent SDK
- Engineer cannot build Approval UI without Agent SDK
- AI cannot test with approval queue
- **Answer**: ✅ YES → **P0 DEPENDENCY**

**Decision**: P0, assign to Engineer, deadline: immediate  
**Reasoning**: Multiple agents blocked waiting for this

---

### Example 4: "Build Approval Queue UI"

**Q1: Does it fix a blocker?**
- Nothing broken, just not built yet
- **Answer**: ❌ NO

**Q2: Does it enable another agent's P0 work?**
- No other agents blocked on this
- **Answer**: ❌ NO

**Q3: Is it needed for production launch?**
- Core feature - operators approve agent actions
- Part of product definition
- Cannot launch without it
- **Answer**: ✅ YES → **P1 LAUNCH-CRITICAL**

**Decision**: P1, assign to Engineer, deadline: This week  
**Reasoning**: Needed for launch but not blocking other work right now

---

### Example 5: "Build CX Pulse data pipeline"

**Q1: Does it fix a blocker?**
- Not broken, new feature
- **Answer**: ❌ NO

**Q2: Does it enable another agent's P0 work?**
- No dependencies
- **Answer**: ❌ NO

**Q3: Is it needed for production launch?**
- CX Pulse is one of 5 core tiles
- Operators need this for CX management
- **Answer**: ✅ YES → **P1 LAUNCH-CRITICAL**

**Q4: Does it directly support one of the 5 tiles?**
- CX Pulse is literally one of the 5 tiles
- **Answer**: ✅ YES → **P1 NORTH STAR**

**Decision**: P1, assign to Engineer, deadline: After P0 complete  
**Reasoning**: Core product feature, North Star aligned

---

### Example 6: "Remove 270 GA MCP references from docs"

**Q1: Does it fix a blocker?**
- Docs have wrong info, but product works
- **Answer**: ❌ NO

**Q2: Does it enable another agent's P0 work?**
- No one blocked by this
- **Answer**: ❌ NO

**Q3: Is it needed for production launch?**
- Incorrect documentation
- Confusing but not breaking
- **Answer**: ❌ NO (product works)

**Q4: Does it directly support one of the 5 tiles?**
- Documentation cleanup, not tile work
- **Answer**: ❌ NO

**Q5: Is the product currently working without it?**
- Product works fine with incorrect docs
- **Answer**: ✅ YES (working) → **P2 or ARCHIVE**

**Decision**: P2 (cleanup if time) or Archive  
**Reasoning**: Nice to have, but product works without it

---

### Example 7: "Add dark mode to dashboard"

**Q1-Q4**: All NO (not blocker, not dependency, not launch-critical, not core tile)

**Q5: Is product working without it?**
- Product fully functional
- Nice-to-have feature
- **Answer**: ✅ YES → **ARCHIVE**

**Decision**: ARCHIVE, move to artifacts/manager/future-work/ui-enhancements.md  
**Reasoning**: Can add after launch, not urgent

---

### Example 8: "Fix TypeScript errors in approval components"

**Q1: Does it fix a blocker?**
- Code won't compile
- Cannot deploy to production
- **Answer**: ✅ YES → **P0 IMMEDIATE**

**Decision**: P0, assign to Engineer, deadline: 2 hours  
**Reasoning**: Build blocker

---

### Example 9: "Build 400 future tasks for tile enhancements"

**Q1-Q4**: All NO

**Q5: Is product working without these?**
- These are future enhancements
- Product works fine without them
- **Answer**: ✅ YES → **ARCHIVE**

**Decision**: ARCHIVE to artifacts/manager/future-work/engineer-backlog.md  
**Reasoning**: Future work, not current priorities

---

### Example 10: "Create operator training materials"

**Q1: Does it fix a blocker?**
- Nothing broken
- **Answer**: ❌ NO

**Q2: Does it enable another agent's P0 work?**
- No technical dependencies
- **Answer**: ❌ NO

**Q3: Is it needed for production launch?**
- Operators need training before we launch
- Cannot do pilot without training
- **Answer**: ✅ YES → **P1 LAUNCH-CRITICAL**

**Decision**: P1, assign to Enablement, deadline: Before pilot launch  
**Reasoning**: Required for launch but not blocking development

---

## 📊 PRIORITY DEFINITIONS

### P0 - IMMEDIATE (Do First)
**Criteria**: Answers YES to Q1 or Q2
**Characteristics**:
- Blocker: Product broken/cannot deploy
- Dependency: Other agents cannot do their P0 work
- Timeline: Hours (same day)
- Deadline: Specific time TODAY

**Examples**:
- Build failures
- TypeScript compilation errors
- Security vulnerabilities
- Service outages
- Agent SDK bugs
- Database schema blockers

**Max P0 tasks per agent**: 3-5 (if more, something's very wrong)

---

### P1 - IMPORTANT (After P0)
**Criteria**: Answers YES to Q3 or Q4
**Characteristics**:
- Launch-critical: Needed before production
- North Star: Directly supports 5 tiles
- Timeline: Days/weeks (this sprint)
- Deadline: Before launch date

**Examples**:
- Build the 5 core tiles
- Approval Queue UI
- Operator training materials
- Production runbooks
- E2E testing

**Max P1 tasks per agent**: 10-15

---

### P2 - NICE TO HAVE (If Time)
**Criteria**: Answers YES to Q5 (product works without it)
**Characteristics**:
- Optional: Improvements, not requirements
- Working: Product functions without this
- Timeline: Weeks/months (post-launch)
- Deadline: Flexible or none

**Examples**:
- Documentation cleanup
- Code refactoring
- Performance optimizations (non-critical)
- UI polish
- Nice-to-have features

**Max P2 tasks per agent**: 0-5 (only if P0/P1 done)

---

### ARCHIVE - Future Work
**Criteria**: Answers NO to Q1-Q4, and YES to Q5
**Characteristics**:
- Future: Not current priorities
- Strategic: Good ideas for later
- Timeline: Months (post-launch stabilization)
- Deadline: None

**Examples**:
- 10X expansion tasks (400 future features)
- Advanced AI capabilities
- Multi-region support
- White-label features
- Ecosystem integrations

**Location**: artifacts/manager/future-work/<agent>.md  
**NOT in direction files**

---

## 🚨 SPECIAL CASES & EDGE CASES

### Case 1: "Agent finishes P0/P1 and asks for more work"

**Options**:
1. Promote P2 task to P1 (if valuable)
2. Assign them to help another agent with P0 work
3. Give them 5-10 tasks from archive (if launch is progressing well)
4. Have them stand by (if launch imminent)

**DO NOT**: Give them 100 archived tasks. Give 5-10 max.

---

### Case 2: "CEO requests specific feature for overnight work"

**Process**:
1. CEO says: "Give Engineer 50 tasks for overnight"
2. You select 50 tasks from archive
3. Add to engineer.md (may exceed 200 lines - that's OK, CEO approved)
4. Mark in direction: "CEO Approved: Long task list for overnight work"
5. Next morning: Review what was completed, remove completed tasks
6. Bring file back under 200 lines

**Exception**: CEO-directed long task lists are OK temporarily

---

### Case 3: "Agent requests clarification on priority"

**Agent asks**: "Should I work on X or Y?"

**Your process**:
1. Run both tasks through 5-question matrix
2. Compare results
3. Assign higher priority first
4. Update direction with clear "START HERE NOW"

**Example**:
- Task X: Answers YES to Q1 (blocker) → P0
- Task Y: Answers YES to Q4 (tile work) → P1
- **Decision**: X first, then Y

---

### Case 4: "Everything is P0!"

**If you have >10 P0 tasks, something's wrong**:

**Triage**:
1. True blockers (cannot deploy): Keep P0
2. Important but not blocking: Downgrade to P1
3. Can wait 24 hours: Downgrade to P1 with later deadline

**Principle**: P0 = "Cannot launch without this TODAY"

---

## 🎯 HOW TO USE IN YOUR WORKFLOW

### During Shutdown (Assigning Tomorrow's Work):

```bash
# For each agent, decide what they should work on

# Engineer has 3 potential tasks:
# A) Fix build failure
# B) Build CX Pulse tile
# C) Add dark mode

# Run through matrix:
Task A: Q1=YES → P0 (build blocker)
Task B: Q1=NO, Q2=NO, Q3=YES → P1 (launch needed)
Task C: Q1-Q4=NO, Q5=YES → ARCHIVE (product works)

# Assign in "START HERE NOW":
First: Task A (P0)
After that: Task B (P1)
Don't assign: Task C (archived)
```

### During Active Session (Agent Asks for Direction):

```bash
# Agent: "I finished Task 5, what's next?"

# Check their direction file for next P0/P1 task
# If none exist, run matrix on potential work
# Assign highest priority task
# Update direction file with "START HERE NOW"
```

### When CEO Gives You Direction:

```bash
# CEO: "Have Engineer work on X"

# Run X through matrix to determine urgency
# Place in appropriate priority section
# If P0, add to "START HERE NOW"
# If P1/P2, add to active tasks
```

---

## 📋 MATRIX OUTPUTS TO DIRECTION FILES

**How matrix results appear in direction files**:

```markdown
## ⚡ START HERE NOW (Updated: 2025-10-13 14:00 UTC by Manager)

**Your immediate priority**: Fix build failure (P0 - BLOCKER)
**Why P0**: npm run build fails, cannot deploy to production
**Matrix result**: Q1=YES (fixes blocker) → P0 immediate
**First command**: 
\`\`\`bash
# Fix import path in app/routes/chatwoot-approvals.$id.approve/route.tsx
# Change: ~/../../packages/integrations/chatwoot  
# To: ~/packages/integrations/chatwoot
npm run build  # Verify fix
\`\`\`
**Deadline**: TODAY 14:00 UTC
**After this**: Task 2 (Fix RLS - P0)

---

## 🎯 ACTIVE TASKS

### 🚨 P0 - LAUNCH BLOCKERS (Do First)

**Task 1: Fix Build Failure** (30 min) - ASSIGNED ABOVE ⬆️
**Matrix**: Q1=YES (blocker)

**Task 2: Fix RLS Security** (1 hour)
**Matrix**: Q1=YES (security blocker)
- 51 tables exposed
- Use Supabase MCP to verify
- Deadline: TODAY 16:00 UTC

### 📋 P1 - LAUNCH-CRITICAL (After P0)

**Task 3: Build Approval Queue UI** (3 hours)
**Matrix**: Q3=YES (needed for launch)
- Core operator feature
- Prerequisites: Tasks 1-2 complete
- Deadline: THIS WEEK

**Task 4: Build CX Pulse Tile** (4 hours)
**Matrix**: Q4=YES (one of 5 tiles)
- North Star aligned
- Operator value delivery
- Deadline: THIS WEEK
```

**Benefits**:
- Agents see WHY each task is prioritized
- Clear dependencies ("after Tasks 1-2")
- Objective reasoning ("Matrix: Q1=YES")

---

## 🚨 COMMON MISTAKES TO AVOID

### Mistake 1: "Everything feels urgent"

**Wrong**: Mark everything P0  
**Right**: Only TRUE blockers are P0

**Test**: "Can we launch without this TODAY?"
- YES we can launch: NOT P0
- NO we cannot: P0

---

### Mistake 2: "Future work creeps in"

**Wrong**: "While we're at it, let's also add..."  
**Right**: Stick to the matrix

**Test**: Run the new work through Q1-Q5
- Usually ends up ARCHIVE
- Do NOT add to current direction

---

### Mistake 3: "Agent wants to work on interesting feature"

**Agent**: "Can I build the analytics dashboard?"

**Wrong**: "Sure!"  
**Right**: Run through matrix first

**Matrix check**:
- Q1-Q3: NO (not blocker, not dependency, not launch-critical)
- Q4: NO (not one of 5 tiles)
- Q5: YES (product works without it)
- **Result**: ARCHIVE

**Response**: "No, that's archived. Work on Task X (P0) first."

---

### Mistake 4: "Letting 10X expansion tasks stay in direction"

**Wrong**: Leave 400 tasks in engineer.md  
**Right**: Archive 390, keep 10 current ones

**Process**:
- Run each of 400 tasks through matrix
- Maybe 5-10 are P1 (tile work)
- Rest are P2/ARCHIVE
- Move P2/ARCHIVE to artifacts/manager/future-work/
- Keep only P0/P1 in direction

---

## 📊 DECISION TREE (Visual)

```
New Task
    │
    ▼
┌─────────────────────┐
│ Q1: Fixes blocker?  │───YES──▶ P0 IMMEDIATE
└─────────────────────┘
    │ NO
    ▼
┌─────────────────────┐
│ Q2: Enables P0?     │───YES──▶ P0 DEPENDENCY
└─────────────────────┘
    │ NO
    ▼
┌─────────────────────┐
│ Q3: Launch needed?  │───YES──▶ P1 LAUNCH-CRITICAL
└─────────────────────┘
    │ NO
    ▼
┌─────────────────────┐
│ Q4: Supports tiles? │───YES──▶ P1 NORTH STAR
└─────────────────────┘
    │ NO
    ▼
┌─────────────────────┐
│ Q5: Works without?  │───YES──▶ P2 or ARCHIVE
└─────────────────────┘         NO──▶ Back to Q1!
```

---

## 🎯 INTEGRATION WITH DIRECTION CLEANUP

### How Matrix Drives Your Shutdown Process:

**Step A: Review agent's current tasks**
```bash
# Example: engineer.md has 400 tasks

# Run each task through matrix:
for task in Task_1 to Task_400; do
  # Q1-Q5 evaluation
  # Result: P0, P1, P2, or ARCHIVE
done

# Count results:
# - 3 tasks → P0
# - 12 tasks → P1  
# - 15 tasks → P2
# - 370 tasks → ARCHIVE
```

**Step B: Restructure direction file**
```markdown
## ACTIVE TASKS (15 tasks)

### P0 (3 tasks) - from matrix Q1/Q2
### P1 (12 tasks) - from matrix Q3/Q4
### P2 (0 tasks) - skipped because P0/P1 exist

Total: 15 tasks, ~180 lines
```

**Step C: Archive the rest**
```bash
# Move 370 tasks to archive
cat > artifacts/manager/future-work/engineer-backlog.md << 'EOF'
# Engineer Future Work (370 tasks)

These were evaluated with priority matrix and determined to be:
- Not blocking launch
- Not supporting 5 core tiles
- Product works without them

## When to Resume
After launch is stable and operator feedback collected.
Manager will re-evaluate and bring back 10-20 at a time based on:
- Operator pain points
- Usage data
- Strategic priorities

## Archived Tasks
[All 370 tasks listed here for reference]
EOF
```

**Result**: engineer.md goes from 900 lines → 180 lines

---

## 📊 REAL-WORLD APPLICATION

### Yesterday's Cleanup Example:

**Engineer.md (900+ lines)**:

**Before Matrix**:
- Task 1-6: P0 blockers (keep)
- Task 7-40: CX Pulse, Sales Pulse, etc. (5 tile work - keep as P1)
- Task 41-400: 10X expansion (future work)

**After Matrix**:
- Kept: 6 P0 + 12 P1 = 18 tasks (~220 lines with MCP examples)
- Archived: 382 tasks to artifacts/manager/future-work/

**Result**:
- engineer.md: 900 → 220 lines
- Clear priorities
- Agent knows what to do

---

## 🎯 MATRIX BECOMES YOUR DIRECTION PHILOSOPHY

**Every decision you make**:
1. ✅ "Should Engineer work on X?" → Run through matrix
2. ✅ "Which task is more urgent?" → Compare matrix results
3. ✅ "Is this direction file too long?" → Re-run tasks through matrix, archive lower priorities
4. ✅ "Agent asks for more work" → Pull from archive, run through matrix, assign highest priority

**Benefits**:
- **Objective**: Not opinion, just Q1-Q5 answers
- **Consistent**: Same logic every time
- **Explainable**: "This is P0 because Q1=YES (it's a blocker)"
- **Prevents drift**: Q4 asks "supports 5 tiles?" - catches non-aligned work

---

## 📋 TEMPLATE FOR DIRECTION FILE TASKS

**When you add task to direction, include matrix reasoning**:

```markdown
**Task X: [Title]** ([time estimate])
**Priority Matrix**: Q[1-5]=[YES/NO] → [P0/P1/P2]
**Why this priority**: [One sentence explaining Q answer]
**Prerequisites**: [None / Task Y complete]
**MCP Tools**: [Which tools to use]
**Validation**: [How to verify it works]
**Evidence**: [What to capture]
**Deadline**: [Specific time]

**MCP Example** (if applicable):
\`\`\`bash
# Exact commands to validate this work
mcp_shopify_validate_graphql_codeblocks(...)
\`\`\`
```

**Benefit**: Agents understand reasoning, know which MCP tools to use, have validation examples

---

## ✅ SUMMARY

**Priority Decision Matrix**:
- 5 questions, objective evaluation
- P0: Blockers or dependencies (Q1/Q2)
- P1: Launch-critical or tile work (Q3/Q4)
- P2/ARCHIVE: Product works without it (Q5)

**Drives everything**:
- Which tasks go in direction files
- Which tasks get archived
- How you clean up bloat
- How you assign new work
- How you keep agents focused

**Result**: Blockers fixed first, then features, then nice-to-haves

---

**Created**: 2025-10-13  
**Owner**: Manager  
**Purpose**: Objective framework for all task prioritization decisions  
**Location**: docs/runbooks/manager_priority_matrix.md

