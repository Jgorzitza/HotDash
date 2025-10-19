# Guided Selling / Kit Composer — Pilot Planning

Scope

- Pilot documents interfaces and guardrails only. No changes to production specs or code.

Refs

- Sequence key: `guided_selling`
- Spec: `docs/specs/hitl/guided-selling.md`

Plan (docs-only)

- Capture scope, references, guardrails, proof command.
- Autopublish: OFF; no runtime calls.

Proof (read-only)

```bash
node scripts/pilot/run.mjs seq:plan | jq -C .
```
