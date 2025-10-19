# A/B Harness — Pilot Planning

Scope

- Pilot documents interfaces and guardrails only. No changes to production specs or code.

Refs

- Sequence key: `ab_harness`
- Spec: `docs/specs/hitl/ab-harness.config.json`

Plan (docs-only)

- Capture scope, references, guardrails, proof command.
- Autopublish: OFF; no runtime calls.

Proof (read-only)

```bash
node scripts/pilot/run.mjs seq:plan | jq -C .
```
