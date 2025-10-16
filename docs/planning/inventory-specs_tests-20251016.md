# Issue Seed — Inventory — Specs & Tests (Start 2025-10-16)

Agent: inventory

Definition of Done:
- Finalize inventory_data_model.md and shopify_inventory_metafields.md
- Provide Heatmap UI spec to Engineer with prop types
- Add unit tests: rop.ts and po-generator.ts (units/currency)
- Draft alert severity thresholds and scoring rubric
- Provide sample fixtures for demo stock states
- Evidence bundle: doc links, test outputs, sample payloads

Acceptance Checks:
- Docs align with current structures and integrations contracts
- rop.ts and po-generator.ts tests pass; conversions accurate
- Fixtures render correctly in the dashboard tiles (via Engineer)

Allowed paths: docs/specs/**, app/lib/inventory/**, tests/**, docs/integrations/**

Evidence:
- Doc links, test logs, sample payloads

Rollback Plan:
- Revert tests/spec changes; keep previous fixtures

