# Pilot Direction

> Direction: Follow reports/manager/lanes/latest.json (pilot — molecules). NO-ASK.


- **Owner:** Manager Agent
- **Effective:** 2025-10-18
- **Version:** 1.0

## Objective

Validate repository baseline by executing all required guardrail checks (fmt, lint, test:ci, scan) and documenting evidence for manager review.

## Tasks

1. Run `scripts/policy/with-heartbeat.sh pilot -- npm run fmt` and archive heartbeat path.
2. Run `scripts/policy/with-heartbeat.sh pilot -- npm run lint` and confirm clean output.
3. Run `scripts/policy/with-heartbeat.sh pilot -- npm run test:ci` recording results.
4. Run `scripts/policy/with-heartbeat.sh pilot -- npm run scan` to confirm secrets scan passes.
5. Write feedback to `feedback/pilot/2025-10-18.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `codex exec` (with `--json`), MCP servers only.
- **Process:** Follow `docs/OPERATING_MODEL.md` (Signals→Learn pipeline); log MCP evidence before each code change; capture heartbeats for long commands.
- **Touched Directories:** `feedback/pilot/**`, `artifacts/pilot/**`, `reports/manager/**` (read-only unless updating status artifacts), scripts per direction.
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, changed files ≤ 50.
- **Guardrails:** Required checks must pass with attached heartbeat logs; no code edits without MCP log; maintain artifacts per startup runbook.

## Definition of Done

- [ ] `npm run fmt` passes (heartbeat log recorded).
- [ ] `npm run lint` passes (heartbeat log recorded).
- [ ] `npm run test:ci` passes (heartbeat log recorded).
- [ ] `npm run scan` passes (heartbeat log recorded).
- [ ] Feedback entry updated with evidence and heartbeat paths.
- [ ] Artifacts directory contains MCP evidence + tasks.\* + heartbeat logs.

## Contract Test

- **Command:** `npm run test:ci`
- **Expectations:** All unit/integration suites complete successfully without failures.

## Risk & Rollback

- **Risk Level:** Low — commands are read-only; potential time cost if suites fail.
- **Rollback Plan:** None required; rerun commands after addressing failures.
- **Monitoring:** Review command outputs and heartbeat logs for errors.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Operating Model: `docs/OPERATING_MODEL.md`
- Required Checks: Runbook `docs/runbooks/agent_startup_checklist.md`
- Feedback: `feedback/pilot/2025-10-18.md`

## Change Log

- 2025-10-18: Version 1.0 – Initial direction established for pilot agent guardrail verification.
