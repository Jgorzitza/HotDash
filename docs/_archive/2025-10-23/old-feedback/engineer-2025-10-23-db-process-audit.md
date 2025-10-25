# Database Feedback Process Audit
## Date: 2025-10-23
## Agent: Engineer

## Executive Summary

Audited the database feedback and direction process for the data/database agent. Found that the core process is correctly configured, but there are unauthorized markdown files in `artifacts/data/2025-10-23/` that violate the documentation policy.

## Findings

### ✅ CORRECT: Core Process Configuration

**1. Feedback Process (feedback/data.md)**
- ✅ File exists at `feedback/data.md`
- ✅ Clearly states: "This file is for reference only"
- ✅ All actual feedback goes to database via `logDecision()`
- ✅ No `feedback/data/` directory with daily MD files
- ✅ Follows database-driven process

**2. Direction Process (docs/directions/)**
- ✅ No `docs/directions/data.md` file (correctly removed)
- ✅ `docs/directions/README.md` states directions are DEPRECATED
- ✅ Directions now managed via DATABASE
- ✅ Agents use `get-my-tasks.ts` to get tasks from database
- ✅ Old direction files archived to `docs/_archive/2025-10-23/old-directions/`

**3. Database-Driven Workflow**
- ✅ Tasks: `TaskAssignment` table (query via `get-my-tasks.ts`)
- ✅ Progress: `decision_log` table (log via `logDecision()`)
- ✅ Blockers: `TaskAssignment.status='blocked'` (log via `log-blocked.ts`)
- ✅ Manager monitors via query scripts

### ❌ VIOLATION: Unauthorized Markdown Files

**Location:** `artifacts/data/2025-10-23/`

**Unauthorized MD files found:**
1. `console-logging-security-report.md` (6.7K)
2. `data-018-completion-report.md` (4.4K)
3. `data-021-completion-report.md` (3.9K)
4. `data-agent-final-summary.md` (7.8K)
5. `data-agent-work-summary.md` (4.0K)
6. `data-telemetry-001-completion-report.md` (6.2K)
7. `security-audit-report.md` (5.5K)

**Total:** 7 unauthorized markdown files (~38K total)

### Policy Violation Analysis

**According to docs/RULES.md:**

**Allowed Markdown Paths (CI-enforced):**
```
README.md
APPLY.md
docs/NORTH_STAR.md
docs/RULES.md
docs/OPERATING_MODEL.md
docs/ARCHIVE_INDEX.md
docs/README.md
docs/roadmap.md
docs/runbooks/{manager_*,agent_*,ai_agent_review_checklist.md,drift_checklist.md}
docs/directions/<agent|role>.md
docs/directions/agenttemplate.md
docs/manager/{PROJECT_PLAN.md,IMPLEMENTATION_PLAYBOOK.md}
docs/planning/<agent>-<task>-<YYYYMMDD>.md  # TTL 2 days
docs/specs/**
docs/integrations/**
feedback/<agent>/<YYYY-MM-DD>.md
docs/_archive/**
mcp/**  # MCP tools documentation (critical infrastructure - DO NOT REMOVE)
```

**Note:** `artifacts/` is NOT in the allowed list.

**Allowed artifacts/ content:**
- ✅ `artifacts/<agent>/<YYYY-MM-DD>/mcp/<topic_or_tool>.jsonl` (MCP Evidence)
- ✅ `artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson` (Heartbeat)
- ❌ NOT markdown files

**The 3-Question Test:**

Before creating ANY new .md file:

1. **Can this go in my feedback/database?**
   - YES → Use `logDecision()` or `feedback/{agent}.md` and STOP
   - NO → Continue to Q2

2. **Is this in DOCS_INDEX.md Tier 1-3?**
   - YES → Proceed (only if CEO approved)
   - NO → Continue to Q3

3. **Did CEO explicitly request this file?**
   - YES → Get written approval, update DOCS_INDEX.md first
   - NO → **DO NOT CREATE** (use feedback file)

**Verdict:** All 7 markdown files in `artifacts/data/2025-10-23/` fail the 3-Question Test.

## Recommendations

### Immediate Actions Required

**1. Remove Unauthorized Markdown Files**

Move content to database via `logDecision()` or archive:

```bash
# Option A: Archive to docs/_archive/
mkdir -p docs/_archive/2025-10-23/artifacts-data
mv artifacts/data/2025-10-23/*.md docs/_archive/2025-10-23/artifacts-data/

# Option B: Delete (if content already in database)
rm artifacts/data/2025-10-23/*.md
```

**2. Verify Content is in Database**

Check if completion reports and summaries are logged in `decision_log` table:

```bash
npx tsx --env-file=.env scripts/manager/query-agent-status.ts data
npx tsx --env-file=.env scripts/manager/query-completed-today.ts data
```

**3. Update Data Agent Process**

Ensure data agent knows to:
- ✅ Use `logDecision()` for all progress/completion reports
- ✅ Use `feedback/data.md` for reference notes only
- ❌ NOT create markdown files in `artifacts/`
- ✅ Only create JSONL (MCP evidence) and NDJSON (heartbeat) in `artifacts/`

### Long-term Process Improvements

**1. CI Enforcement**

Add check to `scripts/policy/check-docs.mjs` to block markdown files in `artifacts/`:

```javascript
// Check for unauthorized markdown in artifacts/
const artifactsMd = glob.sync('artifacts/**/*.md');
if (artifactsMd.length > 0) {
  console.log('❌ Unauthorized markdown files in artifacts/:');
  artifactsMd.forEach(f => console.log(`   ${f}`));
  process.exit(1);
}
```

**2. Agent Training**

Update all agent direction files to clarify:
- `artifacts/` is for JSONL and NDJSON only
- All completion reports go to database via `logDecision()`
- No markdown files outside allowed paths

**3. Manager Monitoring**

Add to manager startup checklist:
- Check for unauthorized markdown in `artifacts/`
- Verify all agents using database feedback process
- Archive or remove any stray markdown files

## Correct Process Summary

### For Data Agent (and all agents)

**Feedback:**
- ✅ Use `logDecision()` for all progress, completions, blockers
- ✅ Use `feedback/data.md` for reference notes only (not daily files)
- ❌ Do NOT create `feedback/data/2025-10-23.md` or similar

**Directions:**
- ✅ Get tasks from database: `npx tsx --env-file=.env scripts/agent/get-my-tasks.ts data`
- ❌ Do NOT read `docs/directions/data.md` (deprecated)

**Evidence:**
- ✅ MCP evidence: `artifacts/data/2025-10-23/mcp/<topic>.jsonl`
- ✅ Heartbeat: `artifacts/data/2025-10-23/heartbeat.ndjson`
- ❌ Do NOT create markdown files in `artifacts/`

**Completion Reports:**
- ✅ Log to database via `logDecision()` with status='completed'
- ✅ Include evidence in `evidenceUrl` field (pointing to JSONL)
- ❌ Do NOT create separate markdown completion reports

## Verification Commands

```bash
# Check for unauthorized markdown in artifacts/
find artifacts -name "*.md" -type f

# Verify database feedback is working
npx tsx --env-file=.env scripts/manager/query-agent-status.ts data

# Check completed tasks
npx tsx --env-file=.env scripts/manager/query-completed-today.ts data

# Verify no daily feedback files
ls -la feedback/data/ 2>/dev/null || echo "Correct: No data directory"

# Verify no direction file
ls -la docs/directions/data.md 2>/dev/null || echo "Correct: No data.md"
```

## Current Status

**Core Process:** ✅ CORRECT
- Database feedback process properly configured
- Direction process properly configured
- No unauthorized daily feedback files
- No unauthorized direction files

**Artifacts Directory:** ❌ VIOLATION
- 7 unauthorized markdown files in `artifacts/data/2025-10-23/`
- Should only contain JSONL and NDJSON files
- Content should be in database via `logDecision()`

**Action Required:** Remove or archive the 7 markdown files in `artifacts/data/2025-10-23/`

## Evidence

- `feedback/data.md` - Correctly configured (reference only)
- `docs/directions/README.md` - States directions are DEPRECATED
- `artifacts/data/2025-10-23/` - Contains 7 unauthorized MD files
- `docs/RULES.md` - Allowed markdown paths (artifacts/ not included)

---

**Audit Completed:** 2025-10-23
**Auditor:** Engineer Agent
**Status:** Core process correct, artifacts cleanup needed

