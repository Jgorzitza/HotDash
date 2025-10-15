# Agent Startup (Daily)

## PATH
- [ ] Navigate to repo root ~/HotDash/hot-dash/ or /home/justin/HotDash/hot-dash/

## 0) Align to the Star (60 sec)
- [ ] Skim `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`, and `docs/RULES.md`.
- [ ] If your direction conflicts with these, **pause** and post a short note in the Issue:
      “Direction misaligned with North Star/Operating Model — please confirm or revise.”
      (Agents are expected to hold the manager accountable for alignment.)

## 1) Direction & Issue (60 sec)
- [ ] Read `docs/directions/<agent>.md` — note **today’s objective** and **constraints**.
- [ ] Open your **Issue(s)**; copy the **DoD** and confirm **Allowed paths** (fnmatch).
- [ ] Start today’s header in `feedback/<agent>/<YYYY-MM-DD>.md` with your plan.

## 2) Tools & Env (60–90 sec)
- [ ] MCP tools resolve and respond (role-specific): Shopify Admin, Supabase, Chatwoot, etc.
- [ ] If a tool fails, paste the exact command + output in your feedback and **stop** until unblocked.

## 3) Sandbox & Branch (30 sec)
- [ ] Use a short-lived branch: `agent/<agent>/<molecule>`.
- [ ] Work **only** inside the Issue’s **Allowed paths** (Danger will fail out-of-scope diffs).

## 4) Feedback Discipline (throughout)
- [ ] Append-only entries to `feedback/<agent>/<YYYY-MM-DD>.md`:
      commands + results, blockers (minimal repro), next intent.
- [ ] Do **not** create new `.md` beyond allow-list; don’t edit other agents’ files.

## 5) Work Protocol
- [ ] **MCP-first / server adapters only.** No freehand HTTP or secrets in logs.
- [ ] Keep changes molecule-sized (≤ 2 days); commit early with Issue reference:
      `Refs #<issue>` → final slice uses `Fixes #<issue>`.

## 6) PR Protocol (when you have a slice)
- [ ] Open a PR with:
  - `Fixes #<issue>` in the body
  - A line: `Allowed paths: <pattern(s)>`
  - Brief **Design sketch** (interfaces/data flow/failure modes) if introducing new code paths
  - Evidence for DoD (tests, logs, screenshots)
- [ ] Ensure diffs stay **within Allowed paths**; add/adjust tests; push and fix CI (Docs Policy, Danger, Gitleaks, AI Config) before asking for review.

## 7) Build/Dev Mode Safety
- [ ] **No** customer messaging, payments, or production Shopify mutations.
- [ ] If UI needs sample “approvals,” create **fixtures** only:
      `provenance.mode="dev:test"`, include a `feedback_ref`, and keep **Apply disabled**.

## 8) Escalation
- [ ] If blocked > 10 minutes after tool attempts, log the blocker with exact error/output
      in your feedback file and @mention the manager in the **Issue** with a proposed next step.
