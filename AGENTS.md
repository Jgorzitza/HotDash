# Approved Sub-Agent Configuration

This document lists the guardrails for any headless sub-agent launched by the manager.

## Allowed Tooling

| Tool | Purpose | Notes |
| --- | --- | --- |
| `bash` | Shell automation within repo | Must respect sandbox and guard scripts. |
| `npm` / `npx` | Dependency tasks | Lockfile committed; no global installs. |
| `node` scripts | Local automation | Must log output in JSON events. |
| `codex exec` | Sub-agent launcher | Always pass `--json` to capture telemetry. |

## Budget Defaults

- **Tokens**: ≤ 140k per task unless direction overrides.
- **Runtime**: ≤ 60 minutes wall-clock per task before manager review.
- **Changed files**: ≤ 50 files; above that requires a `wide-change` label in the task direction with justification.

## Required Checks

- `npm run fmt`
- `npm run lint`
- `npm run test:ci`
- `npm run scan`

Attach logs or screenshots of the checks in the PR description.

## Branch & PR Policy

- Branch format: `batch-<BATCH_ID>/<task-slug>`.
- PRs must target `main`; include risk, rollback, and verification steps.
- CI gates required on `main`: `ci`, `Gitleaks (Secrets Scan)`.

## Escalation Rules

- Never commit secrets or vault contents.
- If a credential or product decision is missing, pause that lane and file `reports/manager/ESCALATION.md`.
- If the diff touches more than 50 files or cross-cuts modules, notify manager for re-slicing and add `wide-change` with justification.

## References

- Policy details: `docs/directions/manager-headless.md`
- Task template: `docs/directions/agenttemplate.md`
- Feedback hygiene: `docs/RULES.md`
