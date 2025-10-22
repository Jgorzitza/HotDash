# Manager Startup (On first run)

## PATH

- [ ] Navigate to repo root ~/HotDash/hot-dash/ or /home/justin/HotDash/hot-dash/

## 0) MCP Tools Verification (MANDATORY FIRST STEP - 90 sec)

**⚠️ CRITICAL: Manager follows same tool-first rules as agents. Training data is outdated.**

**MCP TOOL PRIORITY** (Effective 2025-10-21):

1. **Shopify Dev MCP** → FIRST for Polaris + Shopify APIs
2. **Context7 MCP** → For other libraries (React Router, Prisma, etc.)
3. **Fly MCP** → For deployments and infrastructure
4. **Web Search** → LAST RESORT ONLY

- [ ] **Shopify Dev MCP** (FIRST for Polaris/Shopify):
  - Reviewing Polaris components? → `mcp_shopify_learn_shopify_api(api: "polaris-app-home")` then `search_docs_chunks`
  - Reviewing Shopify Admin GraphQL? → `mcp_shopify_learn_shopify_api(api: "admin")` then `validate_graphql_codeblocks`
  - Validating Integrations PRs? → Use `validate_graphql_codeblocks` for ALL Shopify GraphQL

- [ ] **Context7 MCP** (SECOND for non-Shopify libraries):
  - About to review Prisma code? → `mcp_context7_get-library-docs("/prisma/docs", "topic")`
  - About to make React Router 7 decisions? → `mcp_context7_get-library-docs("/react-router/react-router", "topic")`
  - About to configure TypeScript? → `mcp_context7_get-library-docs("/microsoft/TypeScript", "topic")`
  - About to fix Google Analytics? → `mcp_context7_get-library-docs("/websites/developers_google_analytics...", "topic")`
  - About to configure OpenAI SDK? → `mcp_context7_get-library-docs("/openai/openai-node", "topic")`
  - About to work with LlamaIndex? → `mcp_context7_get-library-docs("/run-llama/LlamaIndexTS", "topic")`

- [ ] **Fly MCP** (for deployments):
  - Check app status: `mcp_fly_fly-status("hotdash-staging")`
  - View logs: `mcp_fly_fly-logs("hotdash-staging")`
  - Machine status: `mcp_fly_fly-machine-status("machine-id")`

- [ ] **Log Tool Usage in Manager Feedback**:

  ```md
  ## HH:MM - Shopify Dev MCP: Polaris validation

  - Topic: [what I'm investigating/fixing]
  - Key Learning: [specific requirement discovered]
  - Applied to: [decision made / files changed]
  ```

- [ ] **Web Search** (LAST RESORT ONLY): If no MCP has the info
  - Example: `web_search("GA4 custom dimensions event scope official docs")`

**Why This Matters (Learned 2025-10-20)**:

- Manager's training data is 6-12 months old (same as agents)
- Today's P0 fixes: 3 issues, 13 failed deploys, 39 minutes wasted by guessing
- Tool-first approach: 3 issues, 3 deploys, 9 minutes total (30 min savings)
- **Lead by example**: CEO audits Manager's tool usage same as Manager audits agents

**Real Examples**: See RULES.md "Real-World Examples" section for today's Prisma/GA/Supabase P0 fixes

## 1) Align to the Star (2-3 min)

- [ ] **Read Core Docs** (skim diffs if changed since yesterday):
  1. `docs/NORTH_STAR.md` — Vision, outcomes, Growth Engine section (agent orchestration, handoff patterns, security, Action Queue, telemetry)
  2. `docs/OPERATING_MODEL.md` — Pipeline (Signals → Suggestions → Approvals → Actions → Audit → Learn), Growth Engine orchestration (front-end agents, sub-agents, specialist agents, PII Broker, ABAC)
  3. `docs/RULES.md` — MCP tools (Shopify Dev first for Polaris), Growth Engine rules (MCP evidence JSONL, heartbeat, CI guards, telemetry config)
  4. `.cursor/rules/10-growth-engine-pack.mdc` — CI merge blockers (guard-mcp, idle-guard, dev-mcp-ban)

- [ ] **Growth Engine Checklist**:
  - [ ] Understand agent handoff patterns (Customer-Front → Sub-agents → HITL)
  - [ ] Understand security model (PII Broker, ABAC, no-ask execution boundaries)
  - [ ] Understand evidence requirements (MCP JSONL, heartbeat, Dev MCP ban)
  - [ ] Understand Phase assignments (9-12 dependencies mapped)

## 2) Repo & CI Guardrails (2–4 min)

- [ ] **Status checks green on `main`**: _Docs Policy, Danger, Gitleaks, Validate AI Agent Config_.
- [ ] **Push Protection & Secret Scanning** enabled (Settings → Code security & analysis).
- [ ] Run local policy checks:
  ```bash
  node scripts/policy/check-docs.mjs
  node scripts/policy/check-ai-config.mjs
  gitleaks detect --source . --redact
  ```
  _If any fail: stop, fix, commit before continuing._

## 3) Tools & MCP Health (2–3 min)

- [ ] `shopify version` OK; `supabase --version` OK.
- [ ] Chatwoot API reachable (`npm run ops:check-chatwoot-health`).
- [ ] **Agents SDK/HITL** config intact: `app/agents/config/agents.json` has `ai-customer.human_review: true` and reviewers.
- [ ] (If social enabled) Publer environment secret present (never hard-coded).

## 4) Git Coordination — Daily Branch Model (MANDATORY)

**Manager owns ALL git operations. Daily branch = shared workspace for all 17 agents.**

- [ ] **Create/Checkout Daily Branch**:

  ```bash
  git fetch origin
  # Option A: Use existing branch (today)
  git checkout manager-reopen-20251020
  git pull origin manager-reopen-20251020

  # Option B: Create new daily branch (future days)
  # git checkout main
  # git pull origin main
  # git checkout -b daily/2025-10-20
  # git push origin daily/2025-10-20
  ```

- [ ] **Announce Branch** (database + optional markdown):

  ```typescript
  await logDecision({
    scope: "build",
    actor: "manager",
    action: "branch_announced",
    rationale:
      "Daily branch: manager-reopen-20251020 - all agents should checkout and commit",
    evidenceUrl: "docs/RULES.md",
  });
  ```

- [ ] **Monitor Commits Throughout Day**:

  ```bash
  # Check who's committing what
  git log --oneline --all --graph -20
  # Check for conflicts
  git status
  ```

- [ ] **Coordinate File Conflicts**:
  - If Agent A needs file owned by Agent B → Assign sequentially
  - Log coordination via `logDecision()`:
    ```typescript
    await logDecision({
      scope: "build",
      actor: "manager",
      action: "coordination",
      rationale: "Engineer waiting for Data to finish prisma/schema.prisma",
      evidenceUrl: "prisma/schema.prisma",
    });
    ```

## 5) Project status review and Agent direction (3–5 min)

### 5.1 At-a-glance (30–45 sec)

- [ ] **Milestone** on track? (tasks ≤ 2-day molecules)
- [ ] **CI** green on active PRs (Docs Policy, Danger, Gitleaks, AI Config)
- [ ] **Main** releasable (build/smoke pass)

### 5.2 Feedback sweep **first** (10–30 sec) [DATABASE-DRIVEN]

**NEW (2025-10-22)**: Query database instead of reading 17 markdown files

```bash
# Core 3 queries (< 10 sec total)
npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts
npx tsx --env-file=.env scripts/manager/query-agent-status.ts
npx tsx --env-file=.env scripts/manager/query-completed-today.ts

# Additional queries (as needed)
npx tsx --env-file=.env scripts/manager/query-questions.ts  # Questions waiting for answers
# npx tsx --env-file=.env scripts/manager/query-agent-grades.ts  # Self-grades & retrospectives
```

- [ ] Review blocked tasks output - note `blockedBy` dependencies
- [ ] Tag each blocker with **owner** and **ETA**
- [ ] Use `query-task-details.ts <TASK-ID>` for full context on specific blockers
- [ ] If a decision is needed, add a short **Issue comment** on the task

**Time Savings**: 60-90 sec → 10-30 sec (80% reduction)

### 5.3 Issues & PRs (gate sanity) (60–90 sec)

For each **Issue (label: task)** and its linked PR:

- [ ] **Scope Gate:** Problem + Acceptance Criteria present in Issue
- [ ] **Sandbox:** Issue lists **Allowed paths**; PR body repeats them
- [ ] **Design Gate:** PR describes interfaces/data flow/failure modes
- [ ] **Evidence Gate (dev):** unit/integration tests present or justified
- [ ] **Ship Gate (if merging today):** rollback noted; changelog if user-visible
- [ ] Missing anything? Comment on the PR with the gap and reassign

### 5.4 Prioritize blockers (30–45 sec) [DATABASE-DRIVEN]

From `query-blocked-tasks.ts` output:

- [ ] Review blocker summary (groups agents by what they're blocked on)
- [ ] Rank top 3 blockers (env/data/API/review)
- [ ] Decide per blocker: **unblock now**, **de-scope**, or **timebox & escalate**
- [ ] Record the decision in the **Issue comment**
- [ ] Log resolution via `logDecision()` when unblocked:
  ```typescript
  await logDecision({
    scope: "build",
    actor: "manager",
    action: "blocker_cleared",
    rationale: "BLOCKER-XXX: Applied DATA-017 migration",
    evidenceUrl: "feedback/manager/2025-10-22.md",
  });
  ```

### 5.5 Update agent direction (10–30 sec) [DATABASE-DRIVEN]

**NEW (2025-10-22)**: Assign tasks via database instead of updating 17 markdown files

```bash
# Quick assign for single task
AGENT=engineer TASK_ID=ENG-040 TITLE="New feature" DESC="Build X" \
  CRITERIA="Working|Tests pass" PATHS="app/components/**" PRIORITY=P1 HOURS=3 \
  npx tsx --env-file=.env scripts/manager/assign-task.ts

# Or use task service directly for bulk assignments
npx tsx --env-file=.env scripts/manager/bulk-assign-tasks.ts
```

For each active agent:

- [ ] Query their current status (`query-agent-status.ts`)
- [ ] Assign next task via database (instant, no commit needed)
- [ ] Set priority (P0 for blockers, P1 for active work)
- [ ] Set dependencies if task is blocked by another
- [ ] Agents see new tasks IMMEDIATELY (no git pull needed)

**Time Savings**: 45-60 sec → 10-30 sec per agent update

### 5.6 Sandboxes & safety (quick pass)

- [ ] Diffs stay **within Allowed paths** (Danger enforces)
- [ ] No new `.md` outside allow-list (Docs Policy enforces)
- [ ] No secrets in code/logs; push protection **ON**
- [ ] Dev mode: **no customer messaging, payments, or production Shopify mutations**

### 5.7 Today plan (30 sec)

- [ ] Assign/resize 10–15 molecules **per agent**; confirm DoD + Allowed paths
- [ ] Log day start via `logDecision()`:
  ```typescript
  await logDecision({
    scope: "build",
    actor: "manager",
    action: "day_started",
    rationale:
      "17 agents active, 3 blockers identified, priority: clear DATA-017",
    evidenceUrl: "docs/directions/manager.md",
  });
  ```

> **Note:** Approvals/HITL is **out of scope in build/dev mode**. If the UI needs sample approvals to render, use **fixture entries** with `provenance.mode="dev:test"`, a `feedback_ref`, and **Apply disabled**.

### 5.8 Real-Time Monitoring (throughout day)

**Agents log IMMEDIATELY when tasks complete or blockers clear - check database proactively!**

- [ ] **Every 1-2 hours**: Run quick status check
  ```bash
  npx tsx --env-file=.env scripts/manager/query-agent-status.ts
  npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts
  ```
- [ ] **When notified of completion**: Check specific task details
  ```bash
  npx tsx --env-file=.env scripts/manager/query-task-details.ts TASK-ID
  ```
- [ ] **If blocker cleared**: Update dependent agents' direction files immediately

**Why this matters**: Agents log in real-time, manager can unblock dependencies without waiting for next direction cycle

## 6) Drift Guard (2–4 min)

- [ ] Run docs policy again on your working branch:
  ```bash
  node scripts/policy/check-docs.mjs
  ```
- [ ] **Planning TTL**: archive any `docs/planning/*` older than **2 days**:
  ```bash
  node scripts/ops/archive-docs.mjs
  git commit -am "chore: planning TTL sweep" && git push
  ```
- [ ] Glance for any stray `.md` or cross‑agent edits in repo and Bounce them.

## 7) Quick Health Lights (Tiles should be green)

- [ ] Tile P95 < **3s** (prod).
- [ ] Nightly rollup error rate < **0.5%** (last 24h).
- [ ] Approvals SLA for CX met; growth & inventory reviews on track.
- [ ] **0** secret incidents open.

## 6 “Stop the Line” Triggers (do not proceed until resolved)

- Secrets detected (local or CI) → rotate, purge history, re-scan.
- PR missing Issue linkage or Allowed paths → send back.
- Approvals without evidence/rollback or failing `/validate` → send back.

## 7 Start the Day (2 min)

- [ ] Create/resize **Tasks** (≤ 2-day molecules) and set in the Issue:
      **owner**, **DoD**, and **Allowed paths** (fnmatch).
- [ ] Update `docs/directions/<agent>.md` with **today's objective** + **constraints**,
      and link the **Issue** (and PR if open).
- [ ] Move any blockers from `query-blocked-tasks.ts` output
      into the **Issue** as a comment with **resolver + ETA**.
- [ ] Log day start via `logDecision()`:
  ```typescript
  await logDecision({
    scope: "build",
    actor: "manager",
    taskId: "MANAGER-STARTUP",
    status: "completed",
    action: "startup_complete",
    rationale:
      "Manager startup checklist complete, all 17 agents have direction",
    evidenceUrl: "docs/runbooks/manager_startup_checklist.md",
  });
  ```
- [ ] Dev mode only: if UI needs sample approvals, use **fixtures** with
      `provenance.mode="dev:test"`, a `feedback_ref`, and **Apply disabled**.
