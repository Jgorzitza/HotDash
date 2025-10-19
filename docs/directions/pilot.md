# Pilot Direction

- Owner: Pilot Agent
- Effective: 2025-10-18
- Version: 1.0

## Objective

Clarify the side project’s scope, interfaces, and Allowed paths so it can run in parallel without impacting launch.

## One-Pager (2025-10-18)

Purpose

- Establish a low-risk pilot lane that explores sidecar tooling without touching production code paths or flags. Outcome is clarity: scope, file-only interfaces, and a runnable contract test stub that CI can execute.

Interfaces

- Files-in: `docs/directions/pilot.md` (this doc), `reports/manager/lanes/2025-10-18.json` (policy reference)
- Files-out: `feedback/pilot/YYYY-MM-DD.md` (append-only evidence log)
- No runtime API calls; if future exploration is required, it will be gated and discussed first. Shopify via MCP only when explicitly added to tooling; GA4/GSC strictly via adapters, never MCP.

Data Contract

- Outputs are markdown logs with sections: Plan, Evidence, Next Intent, and Completion.
- If code is later approved (separate task), proposed module shape: `packages/pilot/src/index.ts` exporting pure, typed functions with no side effects; inputs are plain objects, outputs are plain objects suitable for JSON serialization.

Success Criteria

- One-pager approved by Manager; Allowed paths confirmed.
- Contract test passes in CI (`node -e "console.log('pilot ok')"`).
- Zero out-of-scope diffs; no production mutations; Autopublish stays OFF.

Allowed Paths — Approved

- Current: `docs/directions/pilot.md`, `feedback/pilot/**` (active today)
- Approved: `packages/pilot/**` (isolated sidecar), `scripts/pilot/**` (local CLIs), `docs/pilot/**` (pilot-only docs)

Dependencies & Decoupling

- None from core runtime today. Any future code to live under `packages/pilot` with no imports from production app; feature-flagged or entirely separate workspace package if approved.

Rollback/Disable

- Remove `packages/pilot/**` and revert doc references; keep feedback as audit trail. No user-facing impact because pilot never integrates with prod flows.

Contract Test

- Command: `node -e "console.log('pilot ok')"`
- Purpose: CI stub to prove wiring without side effects.

## Tasks

1. Draft a one-pager: purpose, interfaces (APIs or files), data contract, and success criteria.
2. Propose Allowed paths (fnmatch) for any code or docs you will touch.
3. Identify dependencies on core repo and propose decoupling (e.g., separate package or feature flag).
4. Provide a rollback/disable plan and test command for your deliverable.
5. Write feedback to `feedback/pilot/2025-10-18.md` and clean up stray md files.

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes (tooling, CI, review), log a brief blocker in the Issue and continue with the next task in the fallback queue below. Do not idle.
- Keep all diffs within Approved paths; attach evidence (logs/commands/screens); flags stay OFF.

## Foreground Proof (Required)

- For any step expected to run >15s, run via `scripts/policy/with-heartbeat.sh pilot -- <command>`.
- Append ISO timestamps on each step to `artifacts/pilot/<YYYY-MM-DD>/logs/heartbeat.log` and `artifacts/pilot/<YYYY-MM-DD>/heartbeat.ndjson`.
- Include this path under “Foreground Proof” in your PR body and commit the log. PRs without it fail CI.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Scaffold `packages/pilot/` minimal package:
   - `src/index.ts` exporting pure, typed functions (no side‑effects)
   - `package.json` with build/test scripts; `tsconfig.json` (isolated)
   - No imports from production app; no runtime calls
2. Add `scripts/pilot/ci-stub.mjs` — runs the contract test and exits 0 on success
3. Author `docs/pilot/README.md` — purpose, API shape, usage examples, constraints
4. Add a tiny unit test (if allowed) using plain node to validate function contracts
5. Evidence bundle: logs under `artifacts/pilot/YYYY-MM-DD/` (optional)
6. Extend API with one additional pure helper (typed) and update docs
7. Prepare rollback note: removal steps and impact (none)
8. Prepare PR with Allowed paths section in body; ensure CI stub runs in PR checks (optional)

## Constraints

- Allowed Tools: bash, npm, node
- Process: Follow docs/OPERATING_MODEL.md; keep feedback logs current
- Touched Directories: `docs/directions/pilot.md`, `feedback/pilot/**`, optionally `packages/pilot/**` if approved
- Budget: time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50
- Guardrails: No cross-cutting changes without manager approval; no secrets

## Definition of Done

- [ ] One-pager approved by Manager
- [ ] Allowed paths agreed and documented
- [ ] Contract test defined and runnable
- [ ] Feedback entry written with evidence
- [ ] Foreground Proof: committed `artifacts/pilot/<YYYY-MM-DD>/logs/heartbeat.log` (and `heartbeat.ndjson`)

## Contract Test

- Command: `node -e "console.log('pilot ok')"`
- Expectations: Demonstrates a minimal working proof or CI stub

## Risk & Rollback

- Risk Level: Low
- Rollback Plan: Remove or disable `packages/pilot/**`; revert doc references
- Monitoring: N/A

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/pilot/2025-10-18.md`
- Specs / Runbooks: `docs/runbooks/manager_startup_checklist.md`

## Change Log

- 2025-10-18: Version 1.0 – Initial scope and guardrails
