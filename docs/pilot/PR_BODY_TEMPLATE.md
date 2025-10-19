## Spec path/section implemented

- <insert exact spec section, e.g., docs/specs/hitl/programmatic-seo-factory.md#metaobject-schema>

## MCP Evidence:

artifacts/pilot/2025-10-18/mcp/shopify_metaobjects.jsonl
artifacts/pilot/2025-10-18/mcp/shopify_cart.jsonl
artifacts/pilot/2025-10-18/mcp/react_router_docs.jsonl

## Env/flag context

- dev/staging; feature flags OFF; autopublish=false

## Tests (unit/integration/smoke)

- Scripts (JSON logs):
  - `node scripts/pilot/test.mjs`
  - `node scripts/pilot/run.mjs status`
  - `node scripts/pilot/generate-sequence.mjs`

## Rollback plan (tested)

- Remove `packages/pilot/**`, `scripts/pilot/**`, `docs/pilot/**`; leave artifacts for audit.

## Logs/trace evidence

- JSONL MCP evidence as above; no perf traces required for docs-only scaffold.

## Framework policy

- No Remix imports; React Router 7 alignment confirmed via Context7 docs.
