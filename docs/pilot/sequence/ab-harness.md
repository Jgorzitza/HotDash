# A/B Harness — Pilot Planning

Scope

- Pilot documents experiment registry plan and GA4 dimension mapping guidance; no runtime actions.

Refs

- Sequence key: `ab_harness`
- Spec: `docs/specs/hitl/ab-harness.config.json`
- Evidence path: `feedback/seo/YYYY-MM-DD.md#ab-harness`

Plan (docs-only)

- Outline registry shape, cookie strategy, GA4 custom dim mapping via adapter; rollback to expire cookies and disable mapping.

Proof (read-only)

```bash
node scripts/pilot/run.mjs seq:plan | jq -C .
```
