# SEO Direction

- **Owner:** SEO Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective
Current Issue: #115


Deliver production-ready SEO monitoring and HITL recommendations with clear evidence, anomaly triage, and rollback guidance.

## Tasks



1. Draft SEO anomaly triage doc referencing Supabase views and alerts; keep it updated.
2. Provide HITL-ready SEO recommendations with evidence (search console, analytics) and approvals payloads.
3. Work with Ads/Content to avoid keyword cannibalization across campaigns.
4. Run web vitals adapter tests and log results.
5. Write feedback to `feedback/seo/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/lib/seo/**`, `docs/specs/seo_pipeline.md`, `docs/specs/seo_anomaly_triage.md`, `feedback/seo/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** HITL approvals required for SEO changes; evidence mandatory.

## Definition of Done

- [ ] Anomaly triage doc updated
- [ ] Web vitals adapter tests executed
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs updated with recommendations
- [ ] Feedback entry completed
- [ ] Contract test passes

## Contract Test

- **Command:** `npx vitest run tests/unit/seo.web-vitals.spec.ts`
- **Expectations:** Web vitals adapter returns expected metrics.

## Risk & Rollback

- **Risk Level:** Medium — Poor SEO guidance harms traffic; mitigated by HITL.
- **Rollback Plan:** Revert recommendations, update triage doc, monitor metrics.
- **Monitoring:** SEO anomaly dashboards, web vitals telemetry.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/seo/2025-10-17.md`
- Specs / Runbooks: `docs/specs/seo_pipeline.md`, `docs/specs/seo_anomaly_triage.md`

## Change Log

- 2025-10-17: Version 2.0 – Production triage + recommendation flow
- 2025-10-16: Version 1.0 – Direction refreshed awaiting scope

---

## 🚨 MANDATORY ENFORCEMENT — 2025-10-19T21:30:00Z

### React Router 7 ONLY (NOT Remix)

**FORBIDDEN** ❌:
- `import { json } from "@remix-run/node"` - NO
- `import { useLoaderData } from "@remix-run/react"` - NO  
- `return json({ data })` - NO

**REQUIRED** ✅:
- `import { useLoaderData } from "react-router"` - YES
- `import type { Route } from "./+types/route-name"` - YES
- `return Response.json({ data })` - YES
- Type with `Route.LoaderArgs` or `LoaderFunctionArgs` - YES

**VERIFY BEFORE COMMIT**:
```bash
rg "@remix-run" app/ --type ts --type tsx
# Must return: NO RESULTS (if any found, fix immediately)
```

### MCP Tools STRICTLY ENFORCED

**MANDATORY for ALL Shopify code**:
1. `mcp_shopify_learn_shopify_api(api: "admin")` - Learn API
2. `mcp_shopify_search_docs_chunks(...)` - Find what you need
3. `mcp_shopify_introspect_graphql_schema(...)` - Explore schema
4. `mcp_shopify_validate_graphql_codeblocks(...)` - VALIDATE before committing

**MANDATORY for library patterns**:
1. `mcp_context7_resolve-library-id(libraryName: "...")` - Find library
2. `mcp_context7_get-library-docs(...)` - Get correct patterns

**Evidence Required in Feedback**:
Every molecule using Shopify/libraries must log MCP conversation IDs.

**See**: `docs/REACT_ROUTER_7_ENFORCEMENT.md` for complete rules

