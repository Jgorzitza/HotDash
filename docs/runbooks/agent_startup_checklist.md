# Agent Startup (Daily)

## PATH

- [ ] Navigate to repo root ~/HotDash/hot-dash/ or /home/justin/HotDash/hot-dash/

## 0) MCP Tools Verification (MANDATORY FIRST STEP - 90 sec)

**⚠️ CRITICAL: Pull documentation BEFORE writing ANY code. Training data is outdated.**

- [ ] **Context7 MCP**: For EVERY library you'll touch today, pull official docs FIRST:
  - About to use Prisma? → `mcp_context7_get-library-docs("/prisma/docs", "your-topic")`
  - About to use React Router 7? → `mcp_context7_get-library-docs("/react-router/react-router", "your-topic")`
  - About to use TypeScript? → `mcp_context7_get-library-docs("/microsoft/TypeScript", "your-topic")`
  - About to use Supabase? → `mcp_context7_get-library-docs("/supabase/supabase", "your-topic")`
  - About to use Google Analytics? → `mcp_context7_get-library-docs("/websites/developers_google_analytics_devguides...", "your-topic")`
  - About to use OpenAI SDK? → `mcp_context7_get-library-docs("/openai/openai-node", "your-topic")`
  - About to use LlamaIndex? → `mcp_context7_get-library-docs("/run-llama/LlamaIndexTS", "your-topic")`

- [ ] **Log Tool Usage in Feedback**:
  ```md
  ## HH:MM - Context7: [Library Name]
  - Topic: [what I need to learn]
  - Key Learning: [specific pattern/requirement discovered]
  - Applied to: [files I'll change]
  ```

- [ ] **Web Search for Current Info**: If Context7 doesn't have the library, use `web_search` for official docs
  - Example: `web_search("Supabase direct connection vs pooler official docs")`

**Why This Matters**: 
- Training data is 6-12 months old
- Libraries change constantly (Prisma multi-schema rules, React Router 7 patterns)
- 1 tool call saves 3-5 failed deployments (~15 minutes)
- **Real examples**: See RULES.md "Real-World Examples" section (2025-10-20 P0 fixes)

## 1) Align to the Star (60 sec)

- [ ] Skim `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`, and `docs/RULES.md`.
- [ ] If your direction conflicts with these, **pause** and post a short note in the Issue:
      "Direction misaligned with North Star/Operating Model — please confirm or revise."
      (Agents are expected to hold the manager accountable for alignment.)

## 2) Direction & Issue (60 sec)

- [ ] Read `docs/directions/<agent>.md` — note **today’s objective** and **constraints**.
- [ ] Open your **Issue(s)**; copy the **DoD** and confirm **Allowed paths** (fnmatch).
- [ ] Start today’s header in `feedback/<agent>/<YYYY-MM-DD>.md` with your plan.

## 3) Tools & Env (60–90 sec)

- [ ] MCP tools resolve and respond (role-specific): Shopify Admin, Supabase, Chatwoot, etc.
- [ ] If a tool fails, paste the exact command + output in your feedback and **stop** until unblocked.

## 4) Sandbox (30 sec)

- [ ] Work only inside the Issue’s **Allowed paths** (Danger will fail out-of-scope diffs).
- [ ] Do NOT create branches; Manager controls all git operations.

## 5) Feedback Discipline (throughout)

- [ ] Append-only entries to `feedback/<agent>/<YYYY-MM-DD>.md`:
      commands + results, blockers (minimal repro), next intent.
- [ ] Do **not** create new `.md` beyond allow-list; don't edit other agents' files.

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
- [ ] Append the completion block to `feedback/<agent>/<YYYY-MM-DD>.md`:
  ```md
  ## WORK COMPLETE - READY FOR PR

  Summary: <what you built>
  Files: <list>
  Tests: <summary>
  Evidence: <links/notes>
  ```
- [ ] Ensure diffs stay within **Allowed paths**; include tests and evidence in your feedback.

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
