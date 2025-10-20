# 🚨 MANDATORY: React Router 7 + MCP Enforcement

**Effective**: 2025-10-19  
**Applies To**: ALL agents working on HotDash codebase  
**Non-Negotiable**: These are hard requirements, not suggestions

---

## 1. React Router 7 ONLY (NOT Remix)

### ❌ FORBIDDEN - Never Use These (Remix patterns):

```typescript
// ❌ WRONG - Remix imports
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";

// ❌ WRONG - Remix json helper
export const loader = async () => {
  return json({ data: "something" });
};
```

### ✅ REQUIRED - Always Use These (React Router 7 patterns):

```typescript
// ✅ CORRECT - React Router 7 imports
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

// ✅ CORRECT - React Router 7 Response
export const loader = async ({ request }: LoaderFunctionArgs) => {
  return Response.json({ data: "something" });
};

// ✅ CORRECT - Type-safe with route types
import type { Route } from "./+types/your-route";
export const loader = async ({ request }: Route.LoaderArgs) => {
  return Response.json({ data: "something" });
};
```

### Verification Command

**BEFORE committing any route/component changes**:

```bash
# Check for forbidden Remix imports
rg "@remix-run" app/ --type ts --type tsx

# Should return: NO RESULTS
# If results found: FIX IMMEDIATELY before proceeding
```

---

## 2. MCP Tools STRICTLY ENFORCED

### 🔴 MANDATORY MCP Usage (Non-Optional)

**BEFORE** writing any Shopify GraphQL code:
```bash
# 1. Learn the API
mcp_shopify_learn_shopify_api(api: "admin")

# 2. Search for what you need
mcp_shopify_search_docs_chunks(conversationId, prompt: "your query")

# 3. Introspect schema
mcp_shopify_introspect_graphql_schema(conversationId, query: "field name")

# 4. VALIDATE your GraphQL code
mcp_shopify_validate_graphql_codeblocks(conversationId, codeblocks: [...])
```

**BEFORE** using any library (React Router 7, Prisma, etc.):
```bash
# Use Context7 MCP
mcp_context7_resolve-library-id(libraryName: "react-router")
mcp_context7_get-library-docs(context7CompatibleLibraryID: "/react-router/react-router", topic: "loaders")
```

### ❌ FORBIDDEN - Never Do This:

- Writing GraphQL queries without Shopify Dev MCP validation
- Using library patterns without Context7 MCP verification
- Copying code from old Remix examples
- "I think this is how it works" - NO, use MCP to VERIFY
- Skipping MCP tools to "move faster" - NO, use tools to be CORRECT

### ✅ REQUIRED - Evidence of MCP Usage:

Every molecule that touches Shopify or libraries MUST log:
```markdown
**MCP Tools Used**:
- shopify-dev-mcp: Conversation ID xxx, validated GraphQL query
- context7: Verified React Router 7 loader pattern
```

---

## 3. React Router 7 Loader Pattern

### Standard Pattern (Copy This)

```typescript
// app/routes/your-route.ts
import type { Route } from "./+types/your-route";

export const loader = async ({ request }: Route.LoaderArgs) => {
  // Your logic here
  const data = await fetchData();
  
  return Response.json({ data });
};

export default function YourRoute() {
  const { data } = useLoaderData<typeof loader>();
  
  return <div>{data}</div>;
}
```

### Common Mistakes to Avoid

```typescript
// ❌ WRONG - Using Remix json()
import { json } from "@remix-run/node";
return json({ data });

// ✅ CORRECT - Use Response.json()
return Response.json({ data });

// ❌ WRONG - Old Remix LoaderFunction
export const loader: LoaderFunction = async ({ request }) => {

// ✅ CORRECT - React Router 7 typed args
export const loader = async ({ request }: Route.LoaderArgs) => {

// ❌ WRONG - Importing from @remix-run/react
import { useLoaderData } from "@remix-run/react";

// ✅ CORRECT - Import from react-router
import { useLoaderData } from "react-router";
```

---

## 4. Enforcement Checklist

**BEFORE submitting work (every molecule)**:

- [ ] ✅ No `@remix-run` imports (verify: `rg "@remix-run" app/`)
- [ ] ✅ All loaders use `Response.json()` not `json()`
- [ ] ✅ All loaders typed with `Route.LoaderArgs` or `LoaderFunctionArgs`
- [ ] ✅ Shopify GraphQL validated with MCP (conversation ID logged)
- [ ] ✅ Library patterns verified with Context7 MCP
- [ ] ✅ MCP tool usage documented in feedback
- [ ] ✅ Tests passing
- [ ] ✅ Build passing (`npm run build`)

---

## 5. Quick Reference

**React Router 7 Docs**: Use Context7 MCP  
```bash
mcp_context7_get-library-docs("/react-router/react-router", topic: "loaders")
```

**Shopify API Docs**: Use Shopify Dev MCP
```bash
mcp_shopify_learn_shopify_api(api: "admin")
mcp_shopify_search_docs_chunks(conversationId, prompt: "products query")
```

**Verify GraphQL**: Use Shopify Dev MCP
```bash
mcp_shopify_validate_graphql_codeblocks(conversationId, codeblocks: ["query { ... }"])
```

---

## 6. Consequences of Non-Compliance

**If you skip MCP tools**:
- Your code will likely be incorrect (Remix vs React Router 7 mixups)
- Your GraphQL may have hallucinated fields
- Your PR will be rejected
- You'll waste time fixing broken code

**If you use Remix patterns**:
- App will break in production
- Build errors
- Runtime errors
- PR rejected immediately

---

## Manager Enforcement

Manager will **REJECT** any PR that:
- Contains `@remix-run` imports
- Lacks MCP tool usage evidence
- Uses `json()` instead of `Response.json()`
- Has unvalidated GraphQL queries

**No exceptions. Use the tools. Follow the patterns.**

---

**Document Owner**: Manager  
**Last Updated**: 2025-10-19T21:30:00Z  
**Status**: MANDATORY for all agents


