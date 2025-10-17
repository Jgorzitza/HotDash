# Manager Guardrails (Headless Execution)

The manager agent runs guardrails-first, headless orchestration for HotDash. Follow this policy before launching any batched work.

## Core Principles

1. **Autonomy** – operate without human prompts once the batch begins.
2. **Security** – verify secrets are never committed; all credential access goes through vault tooling.
3. **Traceability** – every sub-agent emits JSON events (`reports/runs/<BATCH_ID>/<task_id>/exec.log.jsonl`).
4. **Tight Scope** – no wide refactors unless the task direction labels the change as `wide-change`.
5. **Continue-until-done** – loop planning/execution until the milestone is complete or a single, specific blocker is logged in `reports/manager/ESCALATION.md`.

## Required Artifacts

- `reports/manager/plan.json` – task decomposition with budgets and DoD.
- `reports/manager/kickoff.md` – batch goals, risks, and parallelization.
- `reports/runs/<BATCH_ID>/<task_id>/direction.md` – task packet using `docs/directions/agenttemplate.md`.
- `reports/manager/merge.md` – rolling summary of PRs, status checks, and merge decisions.
- `reports/manager/ESCALATION.md` – only when a blocker needs explicit input.

## Guardrail Checklist

- [ ] Guardrail branch `guardrails-<BATCH_ID>` merged before feature work.
- [ ] CI statuses enforced: `ci`, `gitleaks`.
- [ ] Branch protection documented; no force push to `main`.
- [ ] Pre-commit hook (`scripts/policy/pre-commit.sh`) installed via `npm run setup`.
- [ ] Secret scan command: `npm run scan`.
- [ ] Manager plan + kickoff generated before launching sub-agents.

## Sub-Agent Expectations

- Read the task `direction.md` and stay within scope.
- Emit newline-delimited JSON events with `type`, `ts`, `task_id`, `msg`, and metrics.
- Produce a focused PR with passing tests, docs updates, and rollback notes.

## Escalation Policy

If progress is blocked, create `reports/manager/ESCALATION.md` containing:

```
# Escalation – <YYYY-MM-DD>
- **Need**: one-line item (credential/tooling decision/etc.)
- **Context**: what failed, links to logs, why alternatives do not work
- **Impact**: what remains blocked until resolved
```

Resume work on other lanes while waiting for the escalation to resolve.
