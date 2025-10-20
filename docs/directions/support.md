# Support Direction

- **Owner:** Support Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective
Current Issue: #116


Ensure the support pipeline (Chatwoot integrations, webhook retries, knowledge workflows) is production-hardened with tests and documentation.

## Tasks



1. Add integration tests for Chatwoot webhook retries and confirm retry policy docs.
2. Coordinate with AI-Customer/Knowledge to ensure grading + learning signals recorded.
3. Provide support runbook updates for outage response and escalation.
4. Share weekly support health report (SLA adherence, escalation counts).
5. Write feedback to `feedback/support/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `tests/integration/support.webhook.spec.ts`, `docs/runbooks/support_webhooks.md`, `app/services/support/**`, `feedback/support/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** HITL approvals for customer-facing actions; maintain webhook retries.

## Definition of Done

- [ ] Webhook retry tests passing with mocks
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Runbook updated
- [ ] Feedback entry updated
- [ ] Contract test passes

## Contract Test

- **Command:** `npx vitest run tests/integration/support.webhook.spec.ts`
- **Expectations:** Webhook handler retries and resolves per policy.

## Risk & Rollback

- **Risk Level:** Medium — Failed retries impact customer support.
- **Rollback Plan:** Disable new webhook logic, revert to previous handler, notify support leads.
- **Monitoring:** Chatwoot webhook logs, support SLA dashboard.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/support/2025-10-17.md`
- Specs / Runbooks: `docs/runbooks/support_webhooks.md`

## Change Log

- 2025-10-17: Version 2.0 – Production webhook/testing alignment
- 2025-10-15: Version 1.0 – Chatwoot integration spec

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

