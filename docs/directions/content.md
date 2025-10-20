# Content Direction

- **Owner:** Content Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #105

Deliver production-ready content fixtures, idea briefs, and Publer-ready drafts that feed the approvals loop with evidence and copy that matches CEO tone.

## Tasks

1. Maintain idea pool fixtures (`app/fixtures/content/idea-pool.json`) and ensure each scenario has evidence + Supabase linkage.
2. Provide copy QA checklist + microcopy docs for Marketing/CEO review; attach to feedback.
3. Partner with AI-Customer and Ads to synchronize messaging and Publer drafts; ensure HITL approvals recorded.
4. Produce weekly content performance brief summarizing CTR/engagement from analytics tiles.
5. Write feedback to `feedback/content/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/fixtures/content/**`, `docs/specs/content_pipeline.md`, `docs/design/**`, `feedback/content/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No publishing without HITL approval; maintain tone guidelines.

## Definition of Done

- [ ] Fixtures + specs updated for production cadence
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` (relevant suites) green
- [ ] `npm run scan`
- [ ] Docs/runbooks updated for new workflows
- [ ] Feedback entry completed with evidence
- [ ] Contract test passes

## Contract Test

- **Command:** `jq '. | length >= 3' app/fixtures/content/idea-pool.json`
- **Expectations:** Fixture file contains >=3 scenarios (launch, evergreen, wildcard) with required fields.

## Risk & Rollback

- **Risk Level:** Low — Incorrect copy is caught by HITL, but delays launches.
- **Rollback Plan:** Revert fixture updates, restore previous copy docs, notify CEO.
- **Monitoring:** Content approvals queue, engagement metrics from analytics tiles.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/content/2025-10-17.md`
- Specs / Runbooks: `docs/specs/content_pipeline.md`

## Change Log

- 2025-10-17: Version 2.0 – Production alignment for fixtures + briefs
- 2025-10-15: Version 1.0 – Initial launch planning

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
