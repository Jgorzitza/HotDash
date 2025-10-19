# Programmatic SEO — Pilot Planning

Scope

- Pilot documents interfaces and guardrails only. No changes to production specs or code.

Refs

- Sequence key: `programmatic_seo_factory`
- Spec: `docs/specs/hitl/programmatic-seo-factory.md`
- Lanes evidence path: `feedback/seo/YYYY-MM-DD.md#programmatic-seo-factory`

Plan (docs-only)

- Capture template for: metaobject schema, page template plan, internal-link plan, rollback.
- MCP: Shopify via MCP permitted in core lane; pilot will not call MCP.
- Autopublish: OFF; any previews non-destructive.

Proof (read-only)

```bash
node scripts/pilot/run.mjs seq:plan | jq -C .
```
