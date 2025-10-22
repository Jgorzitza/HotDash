# Agent Startup (Daily)

## PATH

- [ ] Navigate to repo root ~/HotDash/hot-dash/ or /home/justin/HotDash/hot-dash/

## 0) Git Setup (MANDATORY FIRST STEP - 60 sec)

**⚠️ CRITICAL: All agents work on the SAME daily branch. Manager announces branch name.**

- [ ] **Fetch Latest**:
  ```bash
  git fetch origin
  ```

- [ ] **Checkout Daily Branch** (Manager announces in feedback, e.g., `daily/2025-10-20` or `manager-reopen-20251020`):
  ```bash
  git checkout daily/2025-10-20  # Use exact branch name from Manager
  git pull origin daily/2025-10-20
  ```

- [ ] **Verify Branch**:
  ```bash
  git branch --show-current  # Should match Manager's announced branch
  ```

- [ ] **Review File Ownership** (see `docs/RULES.md` "File Ownership" table):
  - Check which directories you own
  - If you need a file owned by another agent → Report to Manager in feedback
  - **Example**: "Need `app/routes/dashboard.tsx` owned by Engineer - awaiting coordination"

**Commit Style** (when you make changes):
```bash
git add your/files
git commit -m "feat(your-agent-name): what you did"
git push origin daily/2025-10-20
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

- [ ] **Log Tool Usage in Feedback**:
  ```md
  ## HH:MM - Shopify Dev MCP: Polaris Card component
  - Topic: [what I need to learn]
  - Key Learning: [specific pattern/requirement discovered]
  - Applied to: [files I'll change]
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

## 2) Tasks & Direction (30 sec) [DATABASE-DRIVEN]

**NEW (2025-10-22)**: Query database for your tasks instead of reading markdown files

```bash
# Get all your tasks (shows next unblocked task automatically)
npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <your-agent>
```

- [ ] Query your tasks from database
- [ ] Note **next task** to start (highest priority, no unmet dependencies)
- [ ] Review acceptance criteria and allowed paths
- [ ] Log startup via `logDecision()`:
  ```typescript
  await logDecision({
    scope: 'build',
    actor: '<your-agent>',
    action: 'startup_complete',
    rationale: 'Agent startup complete, found X active tasks, starting TASK-ID',
    evidenceUrl: 'scripts/agent/get-my-tasks.ts'
  });
  ```

**Time Savings**: No git pull for direction updates, instant task visibility

## 2.1) Growth Engine Evidence Setup (NEW - Effective 2025-10-21) (30 sec)

- [ ] **Create Evidence Directories**:
  ```bash
  mkdir -p artifacts/<your-agent>/2025-10-21/mcp
  mkdir -p artifacts/<your-agent>/2025-10-21/screenshots  # if Designer/Pilot/QA
  ```

- [ ] **Prepare MCP Evidence JSONL**:
  - Create file: `artifacts/<your-agent>/2025-10-21/mcp/<task-name>.jsonl`
  - Append after EACH MCP tool call:
    ```json
    {"tool":"shopify-dev|context7|web-search","doc_ref":"<url>","request_id":"<id>","timestamp":"2025-10-21T14:30:00Z","purpose":"Learn Polaris Card component"}
    ```

- [ ] **Prepare Heartbeat** (if task will be >2 hours):
  - Create file: `artifacts/<your-agent>/2025-10-21/heartbeat.ndjson`
  - Append every 15 minutes:
    ```json
    {"timestamp":"2025-10-21T14:00:00Z","task":"ENG-029","status":"doing","progress":"40%","file":"app/components/PIICard.tsx"}
    ```

**Why**: CI guards (guard-mcp, idle-guard) are merge blockers - PRs fail without evidence

## 3) Tools & Env (60–90 sec)

- [ ] MCP tools resolve and respond (role-specific): Shopify Admin, Supabase, Chatwoot, etc.
- [ ] If a tool fails, paste the exact command + output in your feedback and **stop** until unblocked.

## 4) Sandbox (30 sec)

- [ ] Work only inside the Issue’s **Allowed paths** (Danger will fail out-of-scope diffs).
- [ ] Do NOT create branches; Manager controls all git operations.

## 5) Progress Reporting (throughout) [DATABASE ONLY]

**ONLY METHOD**: Call `logDecision()` - IMMEDIATE on status changes, every 2 hours if in-progress

**When to log** (don't wait for 2-hour interval):
- ✅ Task started (status: 'in_progress')
- ✅ Task completed (status: 'completed') - IMMEDIATE
- ✅ Task blocked (status: 'blocked') - IMMEDIATE
- ✅ Blocker cleared (status: 'in_progress') - IMMEDIATE
- ✅ Every 2 hours if still working on same task

**Why immediate logging matters**: Manager and other agents can see blockers cleared in real-time without waiting for next direction update

```typescript
import { logDecision } from '~/services/decisions.server';

await logDecision({
  scope: 'build',
  actor: '<your-agent>',
  taskId: '{TASK-ID}',
  status: 'in_progress',            // or 'completed', 'blocked'
  progressPct: 50,                  // 0-100
  action: 'task_progress',
  rationale: 'What you did + evidence',
  evidenceUrl: 'artifacts/<agent>/2025-10-22/task.md',
  durationActual: 2.0,
  nextAction: 'What you\'re doing next',
  payload: {                        // Rich metadata
    commits: ['abc123f'],
    files: [{ path: 'app/routes/dashboard.tsx', lines: 45, type: 'modified' }],
    tests: { overall: '22/22 passing' }
  }
});
```

**NO MARKDOWN FILES**: All progress goes to database via `logDecision()`

**See**: Your direction file has complete `logDecision()` examples with payload patterns

## 6) Work Protocol

- [ ] **MCP-first / server adapters only.** No freehand HTTP or secrets in logs.
- [ ] **Tool-First Rule**: NEVER write code before pulling docs via Context7/web_search
- [ ] **Database Safety**: NEVER add migration/db push commands to deployment paths
  - fly.toml release_command = `npx prisma generate` ONLY (no migrations)
  - package.json setup = `prisma generate` ONLY (no db modifications)
  - Schema changes require CEO approval + manual application via Manager
  - See RULES.md "Database Safety" section for full policy
- [ ] Keep changes molecule-sized (≤ 2 days); commit early with Issue reference:
      `Refs #<issue>` → final slice uses `Fixes #<issue>`.

## 7) Completion Protocol (when you finish a slice)

- [ ] Do NOT open a PR yourself; Manager will.
- [ ] Log completion via `logDecision()`:
  ```typescript
  await logDecision({
    scope: 'build',
    actor: '<your-agent>',
    taskId: '{TASK-ID}',
    status: 'completed',
    progressPct: 100,
    action: 'task_completed',
    rationale: 'Summary: what you built',
    evidenceUrl: 'artifacts/<agent>/evidence.md',
    durationActual: 3.5,
    payload: {
      commits: ['abc123f', 'def456g'],
      files: [
        { path: 'app/routes/dashboard.tsx', lines: 245, type: 'modified' },
        { path: 'app/components/Card.tsx', lines: 120, type: 'created' }
      ],
      tests: { unit: { passing: 10, total: 10 }, overall: '10/10 passing' }
    }
  });
  ```
- [ ] Ensure diffs stay within **Allowed paths**; include tests and evidence in payload.

## 8) Build/Dev Mode Safety

- [ ] **No** customer messaging, payments, or production Shopify mutations.
- [ ] If UI needs sample "approvals," create **fixtures** only:
      `provenance.mode="dev:test"`, include a `feedback_ref`, and keep **Apply disabled**.

## 9) Escalation

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
