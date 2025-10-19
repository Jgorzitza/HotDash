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

- [ ] MCP tools resolve and respond (role-specific): Shopify Admin, Supabase, Chatwoot, etc. Shopify dev + storefront work requires MCP.
- [ ] GA4/GSC use internal adapters (no MCP). Use provided scripts/adapters and attach command + stderr to feedback.
- [ ] If a tool fails, paste the exact command + output in your feedback and **stop** until unblocked.

## 2.5) Pre‑Flight Contract Paths (30 sec)

- [ ] Run `npm run policy:contracts` to verify all Contract Test command paths in your direction exist (tests, scripts, SQL).
- [ ] If it fails, note the missing path(s) in your feedback and switch to the next task (Autonomy Mode) while the Manager fixes the contract reference or provides a shim.

## 3) Sandbox (30 sec)

- [ ] Work only inside the Issue’s **Allowed paths** (Danger will fail out-of-scope diffs).
- [ ] Do NOT create branches; Manager controls all git operations.

## 4) Feedback Discipline (throughout)

- [ ] Append-only entries to `feedback/<agent>/<YYYY-MM-DD>.md`:
      commands + results, blockers (minimal repro), next intent.
- [ ] Do **not** create new `.md` beyond allow-list; don’t edit other agents’ files.

## 5) Work Protocol

- [ ] **MCP-first / server adapters only.** Shopify/Supabase/Fly/GitHub via MCP. GA4/GSC via internal adapters. No freehand HTTP or secrets in logs.
- [ ] Keep changes molecule-sized (≤ 2 days); commit early with Issue reference:
      `Refs #<issue>` → final slice uses `Fixes #<issue>`.

## 6) Completion Protocol (when you finish a slice)

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

## 7) Build/Dev Mode Safety

- [ ] **No** customer messaging, payments, or production Shopify mutations.
- [ ] If UI needs sample “approvals,” create **fixtures** only:
      `provenance.mode="dev:test"`, include a `feedback_ref`, and keep **Apply disabled**.
- [ ] Autopublish toggles exist but are OFF. Do not enable; stage work behind flags.

## 8) Escalation

- [ ] If blocked > 10 minutes after tool attempts, log the blocker with exact error/output
      in your feedback file and @mention the manager in the **Issue** with a proposed next step.
