# Training Data Reliability Check

**Quick Reference for AI Agents**  
**Last Updated**: 2025-10-11

---

## ⚠️ Your Training Data is OUTDATED for HotDash

Most AI agents were trained on data from 2023 or earlier. HotDash uses:

- **React Router 7** (released late 2024)
- **Shopify Admin API 2024-10** (monthly updates)
- **Shopify App Bridge v3.7+** (frequent updates)

**Your training data likely contains React Router v6 and Shopify APIs from 2023.**

---

## 🚨 ALWAYS Verify (Never Trust Training)

✅ **Mandatory MCP verification for:**

### React Router 7

- [ ] Loader functions (`export async function loader`)
- [ ] Action functions (`export async function action`)
- [ ] Client loaders (`export async function clientLoader`)
- [ ] Route module structure (`+types` imports)
- [ ] Type definitions (`Route.LoaderArgs`, `Route.ComponentProps`)
- [ ] Data loading patterns (direct return vs `json()`)
- [ ] Error boundaries in routes

### Shopify

- [ ] GraphQL queries (any query/mutation)
- [ ] Admin API REST endpoints
- [ ] API version parameters (`2024-10`)
- [ ] App Bridge hooks (`useAppBridge`, etc.)
- [ ] Shopify CLI commands
- [ ] Authentication flows
- [ ] Webhook structures

---

## ✅ You Can Trust Training For

Safe to use without verification:

- Basic React hooks (`useState`, `useEffect`, etc.)
- TypeScript syntax
- JavaScript fundamentals
- CSS/HTML
- General programming concepts
- Array methods, object manipulation
- Async/await patterns
- Promise handling

---

## Decision Tree (30 Second Check)

```
Am I writing code that involves:
  ├─ React Router 7? ───────────► VERIFY with Context7
  ├─ Shopify API? ──────────────► VERIFY with Shopify MCP
  ├─ HotDash pattern? ──────────► GREP codebase first
  └─ Basic React/TS/JS? ────────► Trust training
```

---

## Quick Verification Commands

### For React Router 7

```typescript
// Before writing loader:
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loader function signature and types",
    tokens: 800,
  });
```

### For Shopify GraphQL

```typescript
// Before any query:
mcp_shopify_validate_graphql_query({
  query: `query { ... }`,
  api: "admin",
});
```

### For HotDash Patterns

```bash
# Always search codebase first:
grep("loader pattern")
grep("Shopify service client")
```

---

## Red Flags (Your Training is Probably Wrong)

🚩 **If you're about to write:**

```typescript
// ❌ This is React Router v6/Remix (OLD)
import { json } from "@remix-run/node";
export const loader = async () => {
  return json({ data });
};
```

**STOP! Verify with Context7 first.**

🚩 **If you're about to write:**

```graphql
# ❌ This might use deprecated fields
query {
  customer {
    email # Field access changed in 2024
  }
}
```

**STOP! Validate with Shopify MCP first.**

---

## Common Mistakes from Outdated Training

### Mistake 1: Wrong React Router 7 Import

❌ `import { json } from "@remix-run/node"`  
✅ `import type { Route } from "./+types/product"`

### Mistake 2: Wrong Loader Pattern

❌ `export const loader = async () => json({ data })`  
✅ `export async function loader() { return { data } }`

### Mistake 3: Wrong Type Definitions

❌ `const data = useLoaderData<MyType>()`  
✅ `function Component({ loaderData }: Route.ComponentProps)`

### Mistake 4: Outdated Shopify Fields

❌ Assuming all 2023 fields still exist  
✅ Validate schema with Shopify MCP

### Mistake 5: Wrong API Version

❌ Using hardcoded old version strings  
✅ Check current version in HotDash config

---

## Manager Will Reject PRs For

❌ React Router v6/Remix patterns in RR7 code  
❌ Unvalidated Shopify GraphQL queries  
❌ Missing `+types` imports in route modules  
❌ Using `json()` wrapper in RR7 loaders  
❌ Shopify API calls without version check  
❌ Context7 calls without token limits  
❌ Not searching HotDash codebase first

---

## Cost vs Benefit

**Verification Cost:**

- 800-1200 tokens per Context7 call
- < 500 tokens per Shopify validation
- ~30 seconds of time

**Cost of NOT Verifying:**

- Broken application
- Type errors
- Deprecated API usage
- Privacy violations
- Failed code review
- Wasted debugging time
- Loss of type safety

**Always verify. It's cheaper than fixing mistakes.**

---

## Workflow Template

```
1. [ ] Check this document - is verification needed?
2. [ ] If React Router 7 → Context7 verification (tokens: 800)
3. [ ] If Shopify API → Shopify MCP validation
4. [ ] If HotDash pattern → grep codebase first
5. [ ] If basic concept → trust training
6. [ ] Implement with verified/current patterns
7. [ ] Reference verification in PR description
```

---

## Questions to Ask Yourself

Before trusting your training data:

1. **Was this library/API updated after 2023?**
   - React Router 7: YES (late 2024)
   - Shopify: YES (monthly updates)
   - React basics: NO (stable)

2. **Is this version-specific syntax?**
   - RR7 loaders: YES
   - Shopify schema: YES
   - TypeScript: NO

3. **Could this API have changed?**
   - Shopify GraphQL: DEFINITELY
   - React Router 7: DEFINITELY
   - JavaScript fundamentals: NO

4. **Am I 100% certain this is current?**
   - If NO → Verify
   - If YES but involves RR7/Shopify → Still verify

---

## Remember

**When in doubt, verify.**  
**When certain, still verify if it's RR7 or Shopify.**  
**Cost: 800 tokens.**  
**Benefit: Correct, current, type-safe code.**

---

**Related Docs:**

- `docs/directions/mcp-usage-efficiency.md` - Full decision matrix
- `docs/directions/mcp-tools-reference.md` - Tool usage guide
- `docs/NORTH_STAR.md` - Development principles
