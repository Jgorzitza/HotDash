# Guided Selling / Kit Composer — Pilot Planning

Scope

- Pilot documents rules graph outline and UX skeleton proposals; no runtime code.

Refs

- Sequence key: `guided_selling`
- Spec: `docs/specs/hitl/guided-selling.md`
- Evidence path: `feedback/engineer/YYYY-MM-DD.md#guided-selling`

Plan (docs-only)

- Enumerate inputs (catalog facets, compat rules), outputs (kit config), and rollback.
- MCP: Shopify Admin via MCP in core lane; pilot will not call MCP.

Proof (read-only)

```bash
node scripts/pilot/run.mjs seq:plan | jq -C .
```
