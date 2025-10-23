# Agent Startup (Daily)

## 🚀 **EXECUTE AGENT STARTUP CHECKLIST**

**Command**: `You are <agent> execute agent_startup_checklist`  
**Purpose**: Complete startup workflow for any agent  
**Time**: 5-10 minutes  
**Result**: Ready to work with tasks, MCP tools, and database access

---

## PATH

- [ ] Navigate to repo root ~/HotDash/hot-dash/ or /home/justin/HotDash/hot-dash/

## 0) Git Setup (MANDATORY FIRST STEP - 60 sec)

**⚠️ CRITICAL: All agents work on the SAME daily branch. Manager announces branch name.**

- [ ] **Fetch Latest**:

  ```bash
  git fetch origin
  ```

- [ ] **Checkout Today's Branch** (Current: `agent-launch-20251023`):

  ```bash
  git checkout agent-launch-20251023
  git pull origin agent-launch-20251023
  ```

- [ ] **Verify Branch**:

  ```bash
  git branch --show-current  # Should show: agent-launch-20251023
  ```

- [ ] **Review File Ownership** (see `docs/RULES.md` "File Ownership" table):
  - Check which directories you own
  - If you need a file owned by another agent → Log blocker via database
  - **Example**: `npx tsx --env-file=.env scripts/agent/log-blocked.ts <agent> <task-id> "Need file owned by Engineer" "Awaiting coordination for app/routes/dashboard.tsx"`

**Commit Style** (when you make changes):

```bash
git add your/files
git commit -m "feat(your-agent-name): what you did"
git push origin agent-launch-20251023
```

---

## 1) MCP Tools Verification (MANDATORY - 90 sec)

**⚠️ CRITICAL: Pull documentation BEFORE writing ANY code. Training data is outdated.**

**MCP TOOL PRIORITY** (Effective 2025-10-21):

1. **Shopify Dev MCP** → FIRST for Polaris + Shopify APIs
2. **Context7 MCP** → For other libraries (React Router, Prisma, etc.)
3. **Web Search** → LAST RESORT ONLY

- [ ] **Shopify Dev MCP** (FIRST for Polaris/Shopify):
  - About to use Polaris components? → `mcp_shopify_learn_shopify_api(api: "polaris-app-home")` then `search_docs_chunks`
  - About to use Shopify Admin API? → `mcp_shopify_learn_shopify_api(api: "admin")` then `validate_graphql_codeblocks`
  - About to use Storefront API? → `mcp_shopify_learn_shopify_api(api: "storefront-graphql")`

- [ ] **Context7 MCP** (SECOND for non-Shopify libraries):
  - About to use Prisma? → `mcp_context7_get-library-docs("/prisma/docs", "your-topic")`
  - About to use React Router 7? → `mcp_context7_get-library-docs("/react-router/react-router", "your-topic")`
  - About to use TypeScript? → `mcp_context7_get-library-docs("/microsoft/TypeScript", "your-topic")`
  - About to use Google Analytics? → `mcp_context7_get-library-docs("/websites/developers_google_analytics_devguides...", "your-topic")`
  - About to use OpenAI SDK? → `mcp_context7_get-library-docs("/openai/openai-node", "your-topic")`
  - About to use LlamaIndex? → `mcp_context7_get-library-docs("/run-llama/LlamaIndexTS", "your-topic")`

- [ ] **Log Tool Usage in Database** (optional, for tracking):

  ```typescript
  await logDecision({
    scope: "build",
    actor: "<your-agent>",
    action: "mcp_tool_used",
    rationale: "Used Shopify Dev MCP for Polaris Card component",
    payload: {
      tool: "Shopify Dev MCP",
      topic: "Polaris Card component",
      keyLearning: "Card requires title and children props",
      appliedTo: "app/components/MyCard.tsx"
    }
  });
  ```

- [ ] **Web Search** (LAST RESORT ONLY): If neither MCP has the library
  - Example: `web_search("Supabase direct connection vs pooler official docs")`

**Why This Matters**:

- Training data is 6-12 months old
- Libraries change constantly (Prisma multi-schema rules, React Router 7 patterns)
- 1 tool call saves 3-5 failed deployments (~15 minutes)
- **Real examples**: See RULES.md "Real-World Examples" section (2025-10-20 P0 fixes)

## 1) Align to the Star (60 sec)

- [ ] **Read Core Docs** (in order):
  1. `docs/NORTH_STAR.md` — Vision, outcomes, Growth Engine architecture (agent orchestration, security model)
  2. `docs/OPERATING_MODEL.md` — Pipeline, Growth Engine handoff patterns (Customer-Front → Sub-agents, PII Broker, ABAC)
  3. `docs/RULES.md` — MCP tools (Shopify Dev first), Growth Engine rules (MCP evidence JSONL, heartbeat, CI guards)
  4. `.cursor/rules/10-growth-engine-pack.mdc` — CI merge blockers (guard-mcp, idle-guard, dev-mcp-ban)

- [ ] **Verify Alignment**: If your direction conflicts with these, **pause** and post in Issue:
      "Direction misaligned with North Star/Operating Model — please confirm or revise."
      (Agents hold Manager accountable for alignment.)

## 2) Get Your Tasks (30 sec) [DATABASE-DRIVEN]

**⚠️ CRITICAL: Get your tasks from database, not markdown files**

```bash
# Get all your tasks (shows next unblocked task automatically)
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <your-agent>

# Examples:
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts engineer
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts qa-helper
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts data
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts pilot
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts analytics
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts support
```

- [ ] **Query your tasks** from database
- [ ] **Note next task** to start (highest priority, no unmet dependencies)
- [ ] **Review acceptance criteria** and allowed paths
- [ ] **Log startup completion**:
  ```bash
  # Log startup with task count and next task
  npx tsx --env-file=.env scripts/agent/log-startup.ts <your-agent> <task-count> [next-task-id]

  # Examples:
  npx tsx --env-file=.env scripts/agent/log-startup.ts engineer 5 ENG-060
  npx tsx --env-file=.env scripts/agent/log-startup.ts qa-helper 2 QA-UI-002
  npx tsx --env-file=.env scripts/agent/log-startup.ts data 0
  ```

**Time Savings**: No git pull for direction updates, instant task visibility

**Database Safety**: This script only READS from database (TaskAssignment table) - safe to run

## 2.1) KB Search Before Task Execution (MANDATORY - 60 sec) [NEW 2025-10-25]

**⚠️ CRITICAL: Before starting ANY task, search KB for existing solutions to prevent redoing work.**

- [ ] **KB Search for Next Task**:
  ```bash
  # Search KB for context before starting task
  npx tsx scripts/agent/kb-search.ts <TASK-ID> "<TASK-TITLE>" <your-agent>
  
  # Example:
  npx tsx scripts/agent/kb-search.ts ENG-052 "Approval Queue Route Implementation" engineer
  ```

- [ ] **Review KB Results**:
  - Check for existing solutions or similar implementations
  - Look for common issues and their solutions
  - Identify security considerations
  - Note integration points with other systems
  - Review recommendations before proceeding

- [ ] **Log KB Search Results**:
  ```typescript
  await logDecision({
    scope: "build",
    actor: "<your-agent>",
    action: "kb_search_completed",
    rationale: "KB search completed before starting task",
    taskId: "<TASK-ID>",
    payload: {
      searchResults: "Found existing solutions",
      recommendations: ["Review security considerations", "Check integration points"],
      sources: ["docs/example.md", "docs/patterns.md"]
    }
  });
  ```

**Why This Matters**: Database was wiped and we lost context. KB search prevents redoing work and ensures you have full context before starting tasks.

## 2.1) Growth Engine Evidence Setup (NEW - Effective 2025-10-21) (30 sec)

- [ ] **Create Evidence Directories**:

  ```bash
  mkdir -p artifacts/<your-agent>/2025-10-23/mcp
  mkdir -p artifacts/<your-agent>/2025-10-23/screenshots  # if Designer/Pilot/QA
  ```

- [ ] **Prepare MCP Evidence JSONL**:
  - Create file: `artifacts/<your-agent>/2025-10-23/mcp/<task-name>.jsonl`
  - Append after EACH MCP tool call:
    ```json
    {
      "tool": "shopify-dev|context7|web-search",
      "doc_ref": "<url>",
      "request_id": "<id>",
      "timestamp": "2025-10-23T14:30:00Z",
      "purpose": "Learn Polaris Card component"
    }
    ```

- [ ] **Prepare Heartbeat** (if task will be >2 hours):
  - Create file: `artifacts/<your-agent>/2025-10-23/heartbeat.ndjson`
  - Append every 15 minutes:
    ```json
    {
      "timestamp": "2025-10-23T14:00:00Z",
      "task": "ENG-029",
      "status": "doing",
      "progress": "40%",
      "file": "app/components/PIICard.tsx"
    }
    ```

**Why**: CI guards (guard-mcp, idle-guard) are merge blockers - PRs fail without evidence

## 3) Tools & Env (60–90 sec)

- [ ] MCP tools resolve and respond (role-specific): Shopify Admin, Supabase, Chatwoot, etc.
- [ ] If a tool fails, paste the exact command + output in your feedback and **stop** until unblocked.

## 4) Sandbox (30 sec)

- [ ] Work only inside the Issue's **Allowed paths** (Danger will fail out-of-scope diffs).
- [ ] Do NOT create branches; Manager controls all git operations.

## 5) Progress Reporting (throughout) [DATABASE ONLY]

**ONLY METHOD**: Use provided scripts or call `logDecision()` directly - IMMEDIATE on status changes

**When to log** (don't wait for 2-hour interval):

- ✅ Task started (status: 'in_progress') - use `start-task.ts`
- ✅ Task progress (every 2 hours) - use `log-progress.ts`
- ✅ Task blocked (status: 'blocked') - IMMEDIATE - use `log-blocked.ts`
- ✅ Task completed (status: 'completed') - IMMEDIATE - use `complete-task.ts`

**Why immediate logging matters**: Manager and other agents can see blockers cleared in real-time without waiting for next direction update

### Using Progress Scripts (Recommended)

```bash
# Log task progress (every 2 hours while working)
npx tsx --env-file=.env scripts/agent/log-progress.ts <agent> <task-id> <progress-pct> "<rationale>" "<evidence-url>" "<next-action>"

# Example:
npx tsx --env-file=.env scripts/agent/log-progress.ts engineer ENG-060 50 "Implemented PII redaction, working on ABAC validation" "app/services/security/pii.ts" "Next: ABAC validation tests"

# Log task blocked (IMMEDIATE when blocked)
npx tsx --env-file=.env scripts/agent/log-blocked.ts <agent> <task-id> "<blocked-by>" "<rationale>" "<evidence-url>" "<next-action>"

# Example:
npx tsx --env-file=.env scripts/agent/log-blocked.ts qa-helper QA-UI-002 "duplicate exports in analytics.ts" "Cannot run tests due to import errors" "tests/unit/Card.spec.tsx" "Waiting for Engineer to fix analytics.ts"

# Complete task (IMMEDIATE when done)
npx tsx --env-file=.env scripts/agent/complete-task.ts <task-id> "<completion notes>"

# Example:
npx tsx --env-file=.env scripts/agent/complete-task.ts ENG-060 "Security hardening complete: PII redaction, ABAC validation, all tests passing 45/45"
```

### Using logDecision() Directly (Advanced)

```typescript
import { logDecision } from "~/services/decisions.server";

await logDecision({
  scope: "build",
  actor: "<your-agent>",
  taskId: "{TASK-ID}",
  status: "in_progress", // or 'completed', 'blocked'
  progressPct: 50, // 0-100
  action: "task_progress",
  rationale: "What you did + evidence",
  evidenceUrl: "artifacts/<agent>/2025-10-23/task.md",
  durationActual: 2.0,
  nextAction: "What you're doing next",
  payload: {
    // Rich metadata
    commits: ["abc123f"],
    files: [{ path: "app/routes/dashboard.tsx", lines: 45, type: "modified" }],
    tests: { overall: "22/22 passing" },
  },
});
```

**NO MARKDOWN FILES**: All progress goes to database via `logDecision()`

**Database Safety**: Progress logging scripts are SAFE - they only INSERT into decision_log table (no schema changes, no data deletion)

## 6) Work Protocol

- [ ] **MCP-first / server adapters only.** No freehand HTTP or secrets in logs.
- [ ] **Tool-First Rule**: NEVER write code before pulling docs via Context7/web_search

### 🚨 DATABASE SAFETY - CRITICAL RULES 🚨

**⚠️ VIOLATION OF THESE RULES = IMMEDIATE STOP THE LINE**

- [ ] **NEVER run database modification commands**:
  - ❌ **FORBIDDEN**: `prisma db push` (destroys data)
  - ❌ **FORBIDDEN**: `prisma migrate deploy` (applies migrations)
  - ❌ **FORBIDDEN**: `prisma migrate dev` (creates migrations)
  - ❌ **FORBIDDEN**: Direct SQL modifications via psql/Supabase UI
  - ❌ **FORBIDDEN**: Adding migration commands to fly.toml or package.json

- [ ] **ONLY ALLOWED database commands**:
  - ✅ **SAFE**: `npx prisma generate` (updates Prisma client only)
  - ✅ **SAFE**: Reading from database via Prisma queries
  - ✅ **SAFE**: Using `logDecision()` to write to decision_log table
  - ✅ **SAFE**: Using task scripts (get-my-tasks, start-task, complete-task)

- [ ] **Schema changes process**:
  1. Create schema change proposal in your task notes
  2. Log blocker: "Need schema change - awaiting Manager approval"
  3. Manager coordinates with Data agent
  4. Data agent creates migration
  5. CEO approves migration
  6. Manager applies migration manually
  7. You run `npx prisma generate` to update client

- [ ] **Deployment safety**:
  - fly.toml `release_command` = `npx prisma generate` ONLY
  - package.json `setup` script = `prisma generate` ONLY
  - NO migration commands in automated deployment paths

**Why this matters**: Database is shared across all agents. One wrong command can wipe all task assignments, decision logs, and agent progress. There is NO undo.

**If you need a schema change**: Log it as a blocker and wait for Manager coordination. Do NOT attempt to modify the schema yourself.

- [ ] Keep changes molecule-sized (≤ 2 days); commit early with Issue reference:
      `Refs #<issue>` → final slice uses `Fixes #<issue>`.

## 7) Completion Protocol (when you finish a slice)

- [ ] Do NOT open a PR yourself; Manager will.
- [ ] **Complete task via script** (RECOMMENDED):
  ```bash
  # Complete task with notes (preserves context)
  npx tsx --env-file=.env scripts/agent/complete-task.ts <TASK-ID> "<completion notes>"

  # Example:
  npx tsx --env-file=.env scripts/agent/complete-task.ts ENG-060 "Security hardening complete: PII redaction enforced, ABAC validation working, store switch safety checks implemented, dev MCP ban verified. All tests passing 45/45. Evidence in artifacts/engineer/2025-10-23/security-hardening.md"
  ```

- [ ] **OR log completion via `logDecision()` directly**:
  ```typescript
  await logDecision({
    scope: "build",
    actor: "<your-agent>",
    taskId: "{TASK-ID}",
    status: "completed",
    progressPct: 100,
    action: "task_completed",
    rationale: "Summary: what you built",
    evidenceUrl: "artifacts/<agent>/evidence.md",
    durationActual: 3.5,
    payload: {
      commits: ["abc123f", "def456g"],
      files: [
        { path: "app/routes/dashboard.tsx", lines: 245, type: "modified" },
        { path: "app/components/Card.tsx", lines: 120, type: "created" },
      ],
      tests: { unit: { passing: 10, total: 10 }, overall: "10/10 passing" },
    },
  });
  ```
- [ ] Ensure diffs stay within **Allowed paths**; include tests and evidence in payload.
- [ ] **Move to next task immediately** - run `get-my-tasks.ts` again to see next task

**Database Safety**: Task completion scripts are SAFE - they UPDATE TaskAssignment.status and INSERT into decision_log (no schema changes, no data deletion)

## 8) Build/Dev Mode Safety

- [ ] **No** customer messaging, payments, or production Shopify mutations.
- [ ] If UI needs sample "approvals," create **fixtures** only:
      `provenance.mode="dev:test"`, include a `feedback_ref`, and keep **Apply disabled**.

## 9) START WORKING (MANDATORY - DO NOT STOP HERE)

**⚠️ CRITICAL: After completing startup checklist, BEGIN WORKING IMMEDIATELY**

- [ ] **Start your next task** (from step 2):
  ```bash
  npx tsx --env-file=.env scripts/agent/start-task.ts <TASK-ID>
  
  # Examples:
  npx tsx --env-file=.env scripts/agent/start-task.ts ENG-052
  npx tsx --env-file=.env scripts/agent/start-task.ts QA-001
  npx tsx --env-file=.env scripts/agent/start-task.ts SECURITY-AUDIT-001
  npx tsx --env-file=.env scripts/agent/start-task.ts PILOT-001
  npx tsx --env-file=.env scripts/agent/start-task.ts ANALYTICS-001
  npx tsx --env-file=.env scripts/agent/start-task.ts SUPPORT-001
  ```

- [ ] **Begin implementation** - Do not report "ready to start"
- [ ] **Log progress immediately** as you work via `logDecision()`
- [ ] **Complete the task** and move to the next one
- [ ] **Continue working** until all tasks are done or you're blocked

**DO NOT**: 
- ❌ Stop and report "startup complete, ready to start"
- ❌ Wait for manager approval to begin work
- ❌ Ask "what should I work on next"

**DO**:
- ✅ Start working immediately after startup
- ✅ Log progress as you work
- ✅ Complete tasks and move to next ones
- ✅ Only stop when truly blocked or all tasks complete

## 10) Escalation

- [ ] If blocked > 10 minutes after tool attempts, log the blocker with exact error/output
      in your feedback file and @mention the manager in the **Issue** with a proposed next step.

---

## QA-Specific: Code Verification Protocol

**When reviewing any agent's code, QA MUST validate using tools:**

- [ ] **Prisma code?** → Pull `/prisma/docs` and verify schema patterns match official docs
- [ ] **React Router 7 code?** → Pull `/react-router/react-router` and verify routing patterns
- [ ] **Shopify integration?** → Use Shopify Dev MCP to validate GraphQL queries
- [ ] **TypeScript patterns?** → Pull `/microsoft/TypeScript` and verify type usage
- [ ] **API integrations?** → Pull relevant library docs and verify implementation

**Evidence Format in QA Feedback**:

```md
## Code Review: [Feature/File]

- Verified using: Context7 `/library/path` - topic: [what I checked]
- Official docs say: [key requirement from docs]
- Code matches: ✅ / ❌ [explain if mismatch]
- Recommendation: [pass / request changes]
```

**Why**: Training data is outdated. QA must verify code against current library documentation, not rely on LLM knowledge alone.