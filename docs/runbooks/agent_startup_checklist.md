# Agent Startup (Daily)

## PATH

- [ ] Navigate to repo root `~/HotDash/hot-dash/` or `/home/justin/HotDash/hot-dash/`

## 0) Align to the Star (60 sec)

- [ ] Skim `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`, and `docs/RULES.md`.
- [ ] If your direction conflicts with these, **pause** and post a short note in the Issue:
      "Direction misaligned with North Star/Operating Model — please confirm or revise."
      (Agents are expected to hold the manager accountable for alignment.)

## 1) Direction & Issue (90 sec)

- [ ] Read `docs/directions/<agent>.md` — note **today's objective** and **constraints**.
- [ ] **Verify direction is current**: Check effective date and issue number match current work
- [ ] **Verify molecule depth**: Confirm 15-20 molecules assigned (if fewer, escalate to Manager)
- [ ] Open your **Issue(s)**; copy the **DoD** and confirm **Allowed paths** (fnmatch).
- [ ] Start today's header in `feedback/<agent>/<YYYY-MM-DD>.md` with your plan.

## 2) Tools & Env (90–120 sec)

### Dev Agent MCP Tools (Cursor/Codex/Claude)

**Required for ALL agents**:

- [ ] **context7**: HotDash codebase search, React Router 7 docs, library patterns
- [ ] **github-official**: PR/issue management, code search
- [ ] **shopify-dev-mcp**: Shopify API docs, GraphQL schema validation (**NOT for running app - use Shopify CLI**)
- [ ] **fly**: Deployments, logs, secrets (DevOps primary)

**Role-Specific**:

- [ ] **chrome-devtools-mcp**: UI diagnostics, screenshots, page snapshots (Pilot, Designer, QA, Engineer)
- [ ] **Shopify CLI**: Use `shopify app dev`, `shopify version` for running app (NOT MCP)
- [ ] **Supabase CLI**: Use `supabase migration`, `psql` commands (NOT MCP)
- [ ] **GA4 API**: Use built-in connectors in `app/services/analytics/` (NOT MCP)

### In-App Agent SDK (customer/CEO-facing agents ONLY)

**OpenAI Agents SDK** (TypeScript):

- [ ] **ai-customer**: HITL customer reply approvals with `human_review: true`
- [ ] **ai-knowledge**: RAG query generation (future CEO-facing features)
- [ ] **NOT for dev agents**: Dev agents use MCP tools, not Agents SDK

**If a tool fails**, paste exact command + output in feedback and **stop** until unblocked.

## 3) Sandbox (30 sec)

- [ ] Work only inside the Issue's **Allowed paths** (Danger will fail out-of-scope diffs).
- [ ] Do NOT create branches; Manager controls all git operations.
- [ ] Do NOT commit or push; Manager handles all git workflows.

## 4) Feedback Discipline (throughout)

- [ ] Append-only entries to `feedback/<agent>/<YYYY-MM-DD>.md`:
      commands + results, blockers (minimal repro), next intent.
- [ ] Use ISO 8601 timestamps (`YYYY-MM-DDTHH:MM:SSZ`)
- [ ] Do **not** create new `.md` beyond allow-list; don't edit other agents' files.
- [ ] Include evidence paths and test results

## 5) Work Protocol

- [ ] **MCP-first / server adapters only.** No freehand HTTP or secrets in logs.
- [ ] **Molecule depth**: Execute 15-20 molecules per direction (5-30 min each, end-to-end testable)
- [ ] **Test coverage**: Aim for 100% passing tests, minimum 95%
- [ ] Keep changes molecule-sized (≤ 2 days); Manager commits with Issue reference

## 6) Completion Protocol (when you finish a slice)

- [ ] Do NOT open a PR yourself; Manager will.
- [ ] Append the completion block to `feedback/<agent>/<YYYY-MM-DD>.md`:

  ```md
  ## WORK COMPLETE - READY FOR PR

  Summary: <what you built>
  Files: <list with line counts>
  Tests: <passing/total, e.g., 23/23 passing>
  Evidence: <artifact paths, test logs, screenshots>
  MCP Tools Used: <list with conversation IDs if applicable>
  ```

- [ ] Ensure diffs stay within **Allowed paths**; include tests and evidence in your feedback.

## 7) Build/Dev Mode Safety

- [ ] **No** customer messaging, payments, or production Shopify mutations.
- [ ] If UI needs sample "approvals," create **fixtures** only:
      `provenance.mode="dev:test"`, include a `feedback_ref`, and keep **Apply disabled**.

## 8) Escalation

- [ ] If blocked > 10 minutes after tool attempts, log the blocker with exact error/output
      in your feedback file and escalate to Manager via feedback (Manager reads daily).
- [ ] **Do NOT** attempt workarounds or self-directed tasks - await Manager direction update

## Shutdown Protocol (end of day)

- [ ] Execute `docs/runbooks/agent_shutdown_checklist.md`
- [ ] Update feedback with shutdown block (self-grade, retrospective, next-start plan)
- [ ] **Do NOT commit** - leave work in working tree for Manager review
