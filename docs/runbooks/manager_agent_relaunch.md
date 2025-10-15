# Manager: Agent Relaunch Runbook

## Purpose
Relaunch agents after blockers resolved, enforcing MCP-first development and correct feedback format.

## Critical Process Enforcement

### 1. MCP-First Development (MANDATORY)

**Rule:** Dev agents MUST use MCP tools - no relying on training data

**Shopify MCP:** https://shopify.dev/docs/apps/build/devmcp
- Polaris components documentation
- Admin GraphQL schema
- App Bridge APIs
- Liquid template validation

**Required MCP Tools:**
- GitHub Official (Docker) - Issues, PRs, workflows
- Context7 (HTTP:3001) - Semantic code search
- Supabase (NPX) - Database operations
- Fly.io (HTTP:8080) - Deployments
- Shopify (NPX) - Polaris, GraphQL, Liquid
- Google Analytics (Pipx) - Analytics data

**Enforcement:**
- Manager MUST verify agents are calling MCP tools
- Check feedback logs for MCP tool usage
- Reject PRs that show reliance on outdated training data
- Example: "Used Shopify MCP to verify Polaris Card component API"

### 2. Feedback File Format (MANDATORY)

**Correct:** `feedback/<agent>/YYYY-MM-DD.md`
**Incorrect:** `feedback/<agent>.md`

**Enforcement:**
- Check feedback directory structure daily
- Reject work from agents using old format
- Require migration to dated format

## Agent Status (2025-10-15)

### Completed Work - Ready for Next Phase
1. **QA** - Test plan template, acceptance criteria guide
2. **Designer** - Dashboard tiles, approvals drawer specs
3. **Inventory** - Data model spec, metafields research

### Blocked - Now Unblocked
4. **Data** - Supabase running at http://127.0.0.1:54321
5. **Integrations** - Supabase running, credentials available
6. **Product** - Issues #25, #26 exist

### Ready to Launch
7. **Engineer** - Fix feedback format, use Shopify MCP for Polaris
8. **DevOps** - CI fixes, staging deployment
9. **AI Customer** - OpenAI SDK implementation
10. **Analytics** - GA4 API integration (not MCP)

## Relaunch Instructions (SIMPLIFIED)

**All agents use same simple prompt:**

```
@docs/directions/<agent>.md Read your direction file and execute today's objective. Remember: NO new .md files, MCP-first, feedback in dated format.
```

### Specific Agent Prompts

**Engineer:**
```
@docs/directions/engineer.md Read your direction file and execute today's objective
```

**Integrations:**
```
@docs/directions/integrations.md Read your direction file and execute today's objective
```

**Data:**
```
@docs/directions/data.md Read your direction file and execute today's objective
```

**DevOps:**
```
@docs/directions/devops.md Read your direction file and execute today's objective
```

**AI Customer:**
```
@docs/directions/ai-customer.md Read your direction file and execute today's objective
```

**Analytics:**
```
@docs/directions/analytics.md Read your direction file and execute today's objective
```

**Product:**
```
@docs/directions/product.md Read your direction file and execute today's objective
```

**QA:**
```
@docs/directions/qa.md Read your direction file and execute today's objective
```

**Designer:**
```
@docs/directions/designer.md Read your direction file and execute today's objective
```

**Inventory:**
```
@docs/directions/inventory.md Read your direction file and execute today's objective
```

## Verification Checklist

Before accepting work from any agent:

- [ ] Feedback file in correct format: `feedback/<agent>/2025-10-15.md`
- [ ] MCP tool usage documented in feedback
- [ ] No reliance on outdated training data
- [ ] Specific MCP commands/queries shown
- [ ] Evidence includes MCP tool outputs

## MCP Verification Examples

**Good (Engineer):**
> "Used Shopify MCP to query Polaris Card component props: `shopify component Card --format json`. Verified `title`, `sectioned`, and `actions` props are available."

**Bad (Engineer):**
> "Used Polaris Card component with title and actions props based on documentation."

**Good (Integrations):**
> "Used Shopify MCP to validate GraphQL query: `shopify graphql validate --query orders.graphql`. Query is valid and returns expected fields."

**Bad (Integrations):**
> "Created GraphQL query for orders based on Shopify Admin API schema."

## Stop the Line

**STOP and send back if:**
- ❌ Agent not using MCP tools
- ❌ Feedback file in wrong format
- ❌ Relying on training data instead of MCP
- ❌ No MCP tool usage documented

## Next Steps

1. Launch all 10 agents with MCP enforcement
2. Monitor feedback for MCP usage
3. Verify MCP tools are being called
4. Reject work that doesn't show MCP usage
5. Update agent directions if MCP usage unclear

