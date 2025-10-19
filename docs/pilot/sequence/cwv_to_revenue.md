# CWV → Revenue — Pilot Planning

Scope

- Pilot documents interfaces and guardrails only. No changes to production specs or code.

Refs

- Sequence key: `cwv_to_revenue`
- Spec: `n/a`

Plan (docs-only)

- Capture scope, references, guardrails, proof command.
- Autopublish: OFF; no runtime calls.

Proof (read-only)

```bash
node scripts/pilot/run.mjs seq:plan | jq -C .
```
