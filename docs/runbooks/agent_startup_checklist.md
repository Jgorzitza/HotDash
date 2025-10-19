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

## 5) Work Protocol — Continuous, No‑Wait

- [ ] **Continuous execution. Do not wait for CEO/Manager input.** If blocked > 15 minutes, log a one‑line blocker in the Issue and continue with your Fallback Work Queue. No idle gaps.
- [ ] **Foreground Proof required.** For any step expected to run >15s, wrap the command:
      `scripts/policy/with-heartbeat.sh <agent> -- <command>`
      This appends ISO timestamps to `artifacts/<agent>/<YYYY-MM-DD>/logs/heartbeat.log` and prints progress. Include this path in your PR (“Foreground Proof”).
- [ ] **MCP-first / server adapters only.** Shopify/Supabase/Fly/GitHub via MCP. GA4/GSC via internal adapters. No freehand HTTP or secrets in logs.
- [ ] Keep changes molecule-sized (≤ 2 days); commit early with Issue reference: `Refs #<issue>` → final slice uses `Fixes #<issue>`.

### Codex Quick Start (continuous)

- Run the continuous runner to avoid any idle periods and produce Foreground Proof automatically:
  - `node scripts/policy/codex-run.mjs <agent>`
  - Optional extra step(s): `node scripts/policy/codex-run.mjs <agent> -- "npm run test:a11y"`
  - This wraps each step with `scripts/policy/with-heartbeat.sh` and writes telemetry under `artifacts/<agent>/<YYYY-MM-DD>/logs/`.

### Task + Evidence Files (create on start)

- [ ] Create per-agent task trackers in today’s folder:
  - `artifacts/<agent>/<YYYY-MM-DD>/tasks.todo.md` (append-only checklist)
  - `artifacts/<agent>/<YYYY-MM-DD>/tasks.todo.json` (machine-readable mirror)
- [ ] Before any code edit, produce MCP evidence JSONL:
  - Path: `artifacts/<agent>/<YYYY-MM-DD>/mcp/<topic>.jsonl`
  - Line format: `{"tool":"context7|shopify-dev|...","doc_ref":"<url|path>","request_id":"<id>","timestamp":"ISO","purpose":"<why>"}`
- [ ] Foreground Proof while doing work:
  - Append heartbeats every ~10 min to `artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson`:
    - `{"ts":"ISO","task":"<id>","status":"doing"}`
  - Long steps: always use `scripts/policy/with-heartbeat.sh` (also writes `logs/heartbeat.log`)
- [ ] PR body must include a section:
  - `## MCP Evidence:` followed by the exact artifact paths (relative) to `mcp/*.jsonl`
  - `## Foreground Proof:` path to `logs/heartbeat.ndjson` (or `logs/heartbeat.log`) committed in the PR
- [ ] NO-ASK mode: do not chat. Write artifacts and ship PRs.

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
- [ ] Add PR sections: **Allowed paths**, **MCP Evidence** (artifacts/<agent>/<date>/mcp/\*.jsonl), and **Foreground Proof** (artifacts/<agent>/<date>/logs/heartbeat.log). The heartbeat log must be committed.

## 7) Build/Dev Mode Safety

- [ ] **No** customer messaging, payments, or production Shopify mutations.
- [ ] If UI needs sample “approvals,” create **fixtures** only:
      `provenance.mode="dev:test"`, include a `feedback_ref`, and keep **Apply disabled**.
- [ ] Autopublish toggles exist but are OFF. Do not enable; stage work behind flags.

## 8) Escalation (No CEO involvement)

- [ ] If blocked > 10–15 minutes after tool attempts, log the blocker with exact error/output in your feedback file and @mention the manager in the **Issue** with a proposed next step.
- [ ] Do not wait for a reply to continue; proceed to the next fallback task and keep emitting Foreground Proof heartbeats. Use `reports/manager/ESCALATION.md` only for credential/product decisions.
