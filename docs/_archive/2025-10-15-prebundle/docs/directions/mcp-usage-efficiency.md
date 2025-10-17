# MCP Tool Usage Efficiency Guide

**Last Updated**: 2025-10-11  
**Owner**: manager  
**Audience**: All agents

---

## Overview

MCP tools are powerful but can consume significant context window space if used inefficiently. This guide ensures agents maximize value while minimizing context consumption.

## 🎯 Quick Reference: Token Limits

| Use Case                 | Token Limit | Expected Results          |
| ------------------------ | ----------- | ------------------------- |
| **Syntax check**         | 500-800     | 1-3 code examples         |
| **Pattern exploration**  | 1000-1500   | 3-7 code examples         |
| **Implementation guide** | 2000-3000   | 10-20 examples (rare)     |
| **Never exceed**         | 3000        | Requires manager approval |

## ⚡ Quick Rules

1. **Verify training data currency FIRST** - Check if you actually know current syntax (see below)
2. **Search HotDash codebase SECOND** - Use grep before external docs
3. **Use Context7 for verification** - Especially for React Router 7 & Shopify
4. **Start with 800 tokens** - Expand to 1200-1500 only if needed
5. **Never demo/test** - Don't use MCP tools to "show off"

## ⚠️ CRITICAL: When Training Data is Unreliable

**Your training data is OUTDATED for:**

| Technology               | Training Cutoff  | Current Version | Risk Level       |
| ------------------------ | ---------------- | --------------- | ---------------- |
| **React Router 7**       | Mostly v6        | v7.x (2024)     | 🔴 **VERY HIGH** |
| **Shopify Admin API**    | 2023-10 or older | 2024-10+        | 🔴 **VERY HIGH** |
| **Shopify App Bridge**   | v2/early v3      | v3.7+           | 🟡 **HIGH**      |
| **React Router loaders** | Remix patterns   | RR7 native      | 🔴 **VERY HIGH** |
| **Prisma**               | v4               | v5/v6           | 🟡 **MEDIUM**    |

**DO NOT trust your training data for:**

- ❌ React Router 7 data loading (loaders, actions, clientLoader)
- ❌ Shopify GraphQL schema (fields change frequently)
- ❌ Shopify App Bridge v3 hooks
- ❌ React Router 7 route modules
- ❌ Any API versioned after 2023

**You CAN trust your training data for:**

- ✅ Basic React patterns (hooks, components, state)
- ✅ TypeScript syntax
- ✅ JavaScript fundamentals
- ✅ CSS/HTML
- ✅ General programming concepts

## 🎯 Decision Framework: Trust Training or Verify?

### Step 1: Ask Yourself

**Am I confident this is:**

1. A stable, fundamental concept? (e.g., React useState)
2. Not version-specific? (e.g., general TypeScript)
3. Not from a rapidly changing API? (e.g., Shopify)
4. Not a new library/version? (e.g., React Router 7)

**If YES to all → Trust training data**  
**If NO to any → VERIFY with MCP tools**

### Step 2: Use This Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│ What are you implementing?                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
      ┌───────────────────────────────────────────────┐
      │ Is it React Router 7 specific?                │
      │ (loaders, actions, route modules, clientLoader) │
      └───────────────────────────────────────────────┘
                              │
                    YES ──────┤───── NO
                              │
                              ▼
              ⚠️ VERIFY WITH CONTEXT7        │
              (Your training has v6)         │
              tokens: 800-1200               │
                                             ▼
                      ┌────────────────────────────────┐
                      │ Is it Shopify API related?     │
                      │ (GraphQL, REST, Admin API)     │
                      └────────────────────────────────┘
                                             │
                                   YES ──────┤───── NO
                                             │
                                             ▼
                           ⚠️ VERIFY WITH SHOPIFY MCP     │
                           (APIs change frequently)       │
                                                          │
                                                          ▼
                                  ┌─────────────────────────────────┐
                                  │ Is it in HotDash codebase?      │
                                  │ (existing pattern we use)       │
                                  └─────────────────────────────────┘
                                                          │
                                                YES ──────┤───── NO
                                                          │
                                                          ▼
                                      ✅ GREP & READ FILE        │
                                      (Use our established        │
                                       patterns)                 │
                                                                 ▼
                                          ┌────────────────────────────────┐
                                          │ Is it a stable, core concept?  │
                                          │ (React basics, TS, JS, etc)    │
                                          └────────────────────────────────┘
                                                                 │
                                                       YES ──────┤───── NO
                                                                 │
                                                                 ▼
                                          ✅ USE TRAINING DATA           │
                                          (0 tokens)                     │
                                                                        ▼
                                                      ⚠️ VERIFY WITH CONTEXT7
                                                      (Better safe than sorry)
                                                      tokens: 800
```

## 🚨 Real Examples: Training Data vs Current Reality

### Example 1: React Router 7 Loaders

**❌ What training data might suggest (React Router v6/Remix):**

```typescript
// OLD Remix pattern - WRONG for RR7
import { json } from "@remix-run/node";

export const loader = async ({ params }) => {
  const data = await fetchData(params.id);
  return json({ data });
};
```

**✅ What Context7 shows (React Router 7 current):**

```typescript
// CORRECT RR7 pattern from Context7
import type { Route } from "./+types/product";

export async function loader({ params }: Route.LoaderArgs) {
  const data = await fetchData(params.id);
  return { data }; // Direct return, no json() wrapper
}
```

**Risk if you trust training:** App breaks, type errors, incorrect imports

---

### Example 2: Shopify Admin API

**❌ What training data might suggest (2023 API):**

```graphql
# OLD - customer.email was public
query {
  customer(id: "gid://shopify/Customer/123") {
    email
    phone
  }
}
```

**✅ What Shopify MCP shows (2024 API):**

```graphql
# CURRENT - email requires additional scope
query {
  customer(id: "gid://shopify/Customer/123") {
    emailMarketingConsent {
      marketingState
    }
    phone
  }
}
```

**Risk if you trust training:** Privacy violations, API errors, missing data

---

### Example 3: React Router 7 Type Safety

**❌ What training data might suggest:**

```typescript
// Assume you need manual types
import { useLoaderData } from "react-router";

type LoaderData = {
  product: Product;
};

export default function Component() {
  const data = useLoaderData<LoaderData>(); // Manual typing
}
```

**✅ What Context7 shows (RR7 auto-types):**

```typescript
// CORRECT - RR7 auto-infers from loader
import type { Route } from "./+types/product";

export default function Component({ loaderData }: Route.ComponentProps) {
  // loaderData is automatically typed!
}
```

**Risk if you trust training:** Missing type safety benefits, verbose code

---

## When to ALWAYS Verify (Even if Confident)

**Mandatory MCP verification for:**

1. ✅ Any React Router 7 data loading code
2. ✅ Any Shopify GraphQL query
3. ✅ Any Shopify API endpoint call
4. ✅ Any Shopify App Bridge hook
5. ✅ Any route module in React Router 7
6. ✅ API versioning parameters (Shopify)

**Quick verification pattern:**

```typescript
// Before writing RR7 loader code:
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loader function signature",
    tokens: 800,
  });

// Before writing Shopify query:
mcp_shopify_validate_query({ query: myGraphQLQuery });
```

**Cost: 800-1000 tokens**  
**Benefit: Avoid breaking changes, deprecated APIs, wrong patterns**

---

## Context Window Budget

### Typical Agent Context Windows

- **Claude Sonnet 3.5/4**: 200K tokens
- **GPT-4 Turbo**: 128K tokens
- **Working budget**: Reserve 50-75% for code/conversation

### MCP Tool Consumption Estimates

| Tool         | Typical Response | Max Response | Notes                           |
| ------------ | ---------------- | ------------ | ------------------------------- |
| **context7** | 2-10K tokens     | 50K+ tokens  | Configurable via `tokens` param |
| **shopify**  | 1-5K tokens      | 20K tokens   | Schema queries can be large     |
| **github**   | 500-3K tokens    | 10K tokens   | Depends on file count           |
| **supabase** | 500-2K tokens    | 5K tokens    | Schema/table listings           |
| **fly**      | 200-1K tokens    | 3K tokens    | Logs can accumulate             |

---

## Efficiency Principles

### 1. **Query Once, Use Multiple Times**

❌ **Bad:**

```
"Show me the Sales Pulse tile"
"Show me the Inventory tile"
"Show me the Ops Pulse tile"
```

_Cost: 3 separate Context7 calls, ~15K tokens_

✅ **Good:**

```
"Show me all dashboard tile implementations"
```

_Cost: 1 Context7 call, ~8K tokens_

Then reference the results multiple times in conversation.

---

### 2. **Progressive Refinement**

❌ **Bad:**

```
# First call - too broad
"Show me everything about React Router 7"
# Returns 50K tokens of docs
```

✅ **Good:**

```
# Start specific
"Show me React Router 7 loader pattern for data fetching"
# Returns 3K tokens
# If you need more:
"Show me React Router 7 error handling in loaders"
# Returns 2K more tokens
```

---

### 3. **Use Token Limits** ⭐ CRITICAL

Context7 accepts a `tokens` parameter to limit response size:

❌ **Bad:**

```typescript
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loaders",
    // No limit - could return 20K+ tokens
  });
```

❌ **Still Too Much:**

```typescript
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loaders",
    tokens: 3000, // Returns 10-60 examples, fills context fast
  });
```

✅ **Good:**

```typescript
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loader error handling", // Hyper-specific
    tokens: 1000, // Returns 3-7 focused examples
  });
```

✅ **Best:**

```typescript
// Start small, expand if needed
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loader error boundary pattern", // Ultra-specific
    tokens: 800, // Returns 1-3 perfect examples
  });
```

**Recommended token limits:**

- Syntax check: 500-800 tokens (1-3 code examples)
- Pattern exploration: 1000-1500 tokens (3-7 code examples)
- Implementation guidance: 2000-3000 tokens (10-20 code examples)
- Comprehensive research: ONLY with explicit justification
- **Never exceed: 3000 tokens** without manager approval

---

### 4. **Direct File Access vs MCP Tools**

❌ **Bad:**

```
# Using Context7 when you know the exact file
"Show me app/components/tiles/SalesPulse.tsx"
```

_Cost: Context7 call + 5K tokens_

✅ **Good:**

```typescript
// Read the file directly
read_file("app/components/tiles/SalesPulse.tsx");
```

_Cost: File read + 2K tokens_

**Use MCP when:**

- You DON'T know the file location
- You need to FIND similar patterns
- You want MULTIPLE related files
- You need EXTERNAL library docs

**Use file tools when:**

- You KNOW the exact file path
- You're making SPECIFIC edits
- You've ALREADY found the file via MCP

---

### 5. **Combine Related Queries**

❌ **Bad:**

```
"Show me the Shopify service client"
"Show me how we handle Shopify authentication"
"Show me Shopify error handling"
"Show me Shopify GraphQL queries"
```

_Cost: 4 Context7 calls, ~20K tokens_

✅ **Good:**

```
"Show me the Shopify service client implementation including authentication, error handling, and GraphQL query patterns"
```

_Cost: 1 Context7 call, ~6K tokens_

---

### 6. **Cache Results Mentally**

When Context7 returns code, **remember it** for the rest of the conversation:

✅ **Good:**

```
Agent: [Calls Context7 once]
Agent: "I found 3 dashboard tiles following this pattern:
        1. SalesPulse - uses loader for Shopify data
        2. OpsPulse - uses loader for Chatwoot data
        3. Inventory - uses loader for Supabase data"

Agent: [References this knowledge for next 10 messages without recalling]
```

❌ **Bad:**

```
Agent: [Calls Context7]
Agent: "I found Sales Pulse..."
User: "Now add error handling"
Agent: [Calls Context7 AGAIN for same file]
```

---

### 7. **Pagination for Large Results**

GitHub and Supabase support pagination:

❌ **Bad:**

```
# Get all commits from repo history
mcp_github_list_commits({ owner, repo })
# Returns 100+ commits, 15K tokens
```

✅ **Good:**

```
# Get recent commits only
mcp_github_list_commits({
  owner,
  repo,
  perPage: 10  // Just what we need
})
# Returns 10 commits, 2K tokens
```

---

### 8. **Targeted Library Documentation**

❌ **Bad:**

```
# Get ALL React Router 7 docs
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "/remix-run/react-router"
})
# Returns everything, 30K+ tokens
```

✅ **Good:**

```
# Get specific topic with token limit
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "/remix-run/react-router",
  topic: "loaders error handling",  // Specific
  tokens: 4000                       // Limited
})
# Returns relevant examples, 4K tokens
```

---

## Tool-Specific Efficiency Tips

### Context7

**Efficient:**

- Hyper-specific topics: `"loader error boundary pattern"`
- Conservative token limits: `tokens: 800-1500`
- Search once, reference multiple times
- Use for discovery, then switch to file reads
- Try training data first, Context7 second

**Inefficient:**

- Broad topics: `"loaders and actions"`
- High token limits: `tokens: 3000+`
- Repeated searches for same code
- Using for known file locations
- Using to "demonstrate" or "test" the tool

**❌ NEVER Use Context7 For:**

- Patterns you confidently know from training
- Simple CRUD operations
- Demonstrating/testing the tool
- General exploration without specific need
- When HotDash codebase has the pattern (search with grep first)

---

### Shopify MCP

**Efficient:**

- Specific queries: `"Product GraphQL schema fields"`
- Validate individual queries, not entire files
- Cache schema knowledge in conversation

**Inefficient:**

- `"Show me everything about Shopify API"`
- Validating same query multiple times
- Not remembering schema from previous responses

---

### GitHub MCP

**Efficient:**

- Use `perPage` parameter: `perPage: 10`
- Specific searches: `"commits touching metrics.ts"`
- Read file contents directly when you have the path

**Inefficient:**

- Listing all commits/PRs/issues without pagination
- Using GitHub MCP to read files (use file tools)
- Repeated calls for same information

---

### Supabase MCP

**Efficient:**

- Query specific schemas: `schemas: ["public"]`
- Cache table structures in conversation
- Use for schema inspection, not data queries

**Inefficient:**

- Listing all tables repeatedly
- Getting logs without time limits
- Using for routine database queries (use Prisma)

---

### Fly MCP

**Efficient:**

- Tail logs with limits: last hour only
- Check specific app status
- Cache deployment state

**Inefficient:**

- Getting full log history
- Listing all machines repeatedly
- Status checks every message

---

## Context7 Iterative Refinement Workflow

**Start small, expand only if needed:**

```typescript
// Step 1: Try from training data first
// If uncertain...

// Step 2: Search HotDash codebase first
grep("loader error handling pattern");

// Step 3: If pattern not in codebase, fetch minimal Context7
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loader error boundary", // Ultra-specific
    tokens: 800, // Just 1-3 examples
  });

// Step 4: If insufficient, refine and request more
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loader error boundary with redirect", // Even more specific
    tokens: 1200, // A few more examples
  });
```

**Decision making:**

```
Do I need external library docs?
├─ Can I answer from training? ────────────► Skip Context7
├─ Is pattern in HotDash codebase? ────────► Grep, skip Context7
├─ Need library-specific syntax? ──────────► Context7 (tokens: 800)
└─ Still unclear? ─────────────────────────► Context7 (tokens: 1200)
```

---

## Decision Tree: Which Tool to Use?

```
Need to find code/pattern in HotDash?
├─ Know exact file? ──────────────► Use read_file
├─ Pattern likely exists? ────────► Use grep FIRST
└─ Pattern not in codebase? ──────► Context7 (tokens: 800-1500)

Need external library docs?
├─ Confident from training? ──────► Skip Context7
├─ Need current syntax? ──────────► Context7 (tokens: 800)
└─ Complex pattern? ──────────────► Context7 (tokens: 1200-1500)

Need Shopify API info?
├─ General docs/patterns? ────────► Shopify MCP
└─ HotDash Shopify code? ─────────► grep first, then Context7

Need GitHub operation?
├─ Create/update PR/issue? ───────► GitHub MCP
└─ Read existing files? ──────────► Use read_file

Need database info?
├─ Schema structure? ─────────────► Supabase MCP (once, cache)
├─ Run migration? ────────────────► Supabase MCP
└─ Query data? ───────────────────► Use Prisma/direct query

Need deployment info?
├─ Deploy/manage infra? ──────────► Fly MCP
└─ Check one-time status? ────────► Fly MCP (cache result)
```

---

## Anti-Patterns to Avoid

### ❌ The Repeat Caller

```
Message 1: "Show me Sales Pulse"
Message 5: "Show me Sales Pulse again"
Message 10: "What was in Sales Pulse?"
```

**Fix**: Reference the result from Message 1

---

### ❌ The Kitchen Sink

```
"Show me everything about dashboard tiles, React Router,
Shopify integration, Prisma schema, and deployment"
```

**Fix**: Break into focused queries

---

### ❌ The File Browser

```
Using Context7 to browse through files one by one
when you know the directory structure
```

**Fix**: Use `list_dir` and `read_file`

---

### ❌ The Documentation Downloader

```
Getting entire library docs instead of specific topics
```

**Fix**: Use `topic` parameter and `tokens` limit

---

### ❌ The Validator Spammer

```
Validating every GraphQL query individually
when they follow the same pattern
```

**Fix**: Validate the pattern once, apply knowledge

---

## Efficiency Checklist for Agents

Before calling an MCP tool, ask:

- [ ] Do I already have this information in context?
- [ ] Can I use a more direct method (file read, list_dir)?
- [ ] Is my query as specific as possible?
- [ ] Have I set appropriate limits (tokens, perPage)?
- [ ] Will I reuse this information multiple times?
- [ ] Can I combine multiple related needs into one query?

**If 3+ are "No"**, reconsider the MCP call.

---

## Manager Enforcement

### In Code Reviews

**Red flags:**

- Multiple Context7 calls for same code
- No token limits on library doc calls
- Using Context7 for known file paths
- Pagination params not used
- Same schema/status checks repeated

**Green flags:**

- One MCP call, multiple references
- Specific, targeted queries
- Token limits set appropriately
- Results cached in conversation
- Progressive refinement pattern

### In Stand-ups

Monitor context efficiency:

- Are agents making redundant MCP calls?
- Are context windows filling up too quickly?
- Are agents using file tools appropriately?

---

## Best Practices Summary

1. **Query specifically** - "Show me X" not "Show me everything"
2. **Set limits** - Use `tokens`, `perPage` parameters
3. **Query once** - Cache and reference results
4. **Use direct tools** - File reads for known paths
5. **Progressive refinement** - Start narrow, expand if needed
6. **Combine related queries** - One call for related needs
7. **Remember results** - Don't repeat MCP calls
8. **Check decision tree** - Use right tool for the job

---

## Metrics for Efficiency

**Excellent context efficiency:**

- Average MCP calls per feature: 1-2
- Context7 token limit: 800-1500 per call
- Average tokens per Context7 call: < 1500
- File reads vs Context7: 5:1 ratio
- Repeated queries: 0%
- Uses training data first: 80%+ of the time

**Good context efficiency:**

- Average MCP calls per feature: 2-4
- Context7 token limit: 1000-2000 per call
- Average tokens per Context7 call: < 2500
- File reads vs Context7: 3:1 ratio
- Repeated queries: < 5%
- Uses training data first: 60%+ of the time

**Poor context efficiency (needs improvement):**

- Average MCP calls per feature: 5-8
- Context7 token limit: 2000-3000 per call
- Average tokens per Context7 call: > 3000
- File reads vs Context7: 1:1 ratio
- Repeated queries: 10-20%
- Uses training data first: < 40% of the time

**Unacceptable (requires manager intervention):**

- Average MCP calls per feature: 10+
- Context7 token limit: 3000+ or no limit set
- Average tokens per Context7 call: > 5000
- File reads vs Context7: 1:1 or worse
- Repeated queries: > 20%
- Using Context7 for demonstration/testing

---

## Examples of Efficient Workflows

### Example 1: Building a New Dashboard Tile

**Excellent approach:**

```
1. Grep: Search for "dashboard tile" pattern in HotDash
   (Find existing SalesPulse.tsx)

2. File read: Read SalesPulse.tsx
   (Understand pattern from existing code)

3. [Implement feature using existing pattern]

4. Context7: "React Router 7 loader error boundary"
   (Only if uncertain, tokens: 800, returns 2-3 examples)

5. Shopify MCP: "Validate this GraphQL query" (single validation)

6. [Complete implementation]
```

**Total**: 2 MCP calls, ~1.5K tokens ⭐

**Good approach:**

```
1. Context7: "Dashboard tile React Router 7 loader pattern"
   (tokens: 1200, returns 5-7 focused examples)

2. [Work with results in memory]

3. File read: Read specific files found in step 1

4. Shopify MCP: "Validate this GraphQL query" (single validation)

5. [Implement feature]
```

**Total**: 2 MCP calls, ~2K tokens

**Poor approach:**

```
1. Context7: "Show me dashboard tiles" (tokens: 3000)
2. Context7: "Show me Sales Pulse specifically" (tokens: 3000)
3. Context7: "Show me React Router 7" (tokens: 3000)
4. Shopify MCP: "Show me all Shopify APIs"
5. Shopify MCP: "Validate query 1"
6. Shopify MCP: "Validate query 2"
7. Context7: "What was the pattern again?" (tokens: 3000)
8. Supabase MCP: "List tables"
9. Supabase MCP: "List tables" (repeated!)
```

**Total**: 9 MCP calls, ~40K+ tokens ❌

---

### Example 2: Debugging an Integration

**Excellent approach:**

```
1. Grep: Search for "ShopifyClient" in HotDash codebase

2. File read: Read app/services/shopify/client.ts

3. [Review code, identify issue - try to fix from training data]

4. GitHub MCP: "Recent commits touching ShopifyClient" (perPage: 5)

5. [If still uncertain about error pattern]
   Context7: "Shopify client error retry pattern"
   (tokens: 800, returns 2-3 examples)

6. [Fix and test]
```

**Total**: 1-2 MCP calls, ~1.5K tokens ⭐

**Good approach:**

```
1. Context7: "Shopify service client error handling"
   (tokens: 1200, returns 5-7 targeted examples)

2. [Review code, identify issue]

3. File read: Read the specific client file

4. GitHub MCP: "Recent commits touching ShopifyClient" (perPage: 5)

5. [Fix and test]
```

**Total**: 2 MCP calls, ~2.5K tokens

**Poor approach:**

```
1. Context7: "Shopify integrations" (tokens: 3000)
2. Context7: "Error handling patterns" (tokens: 3000)
3. Context7: "Retry logic" (tokens: 3000)
4. GitHub MCP: "All commits" (no perPage limit)
5. Context7: "What was the client pattern?" (repeated!)
```

**Total**: 5 MCP calls, ~15K+ tokens ❌

---

## Conclusion

MCP tools are invaluable but must be used strategically. Context7 can easily consume 10-15K tokens per call if used carelessly, leaving little room for actual development work.

### The Conservative Approach

**Prioritize in this order:**

1. ✅ Use your training data (0 tokens)
2. ✅ Search HotDash codebase with grep (~100 tokens)
3. ✅ Read files directly (~2K tokens)
4. ⚠️ Use Context7 with 800 token limit (~1K tokens)
5. ⚠️ Expand to 1200-1500 tokens only if needed
6. ❌ Never use 3000+ tokens without explicit justification

### Real-World Impact

**Claude's experience:**

- 11.4K token Context7 call = "fills up context quickly"
- Recommended: 800-1500 tokens = 3-10 focused examples
- Result: **90% reduction in context consumption**

**Your agents should:**

- Start with smallest token budget that solves the problem
- Expand iteratively only if truly needed
- Default to 800 tokens, not 3000
- Use Context7 as a last resort, not first choice

**Remember**: The goal is to be **effective and efficient**, not **exhaustive**.

---

**Manager's role**: Enforce these limits in code reviews. Reject PRs with Context7 calls > 1500 tokens unless explicitly justified.

---

**Related Docs:**

- `docs/directions/mcp-tools-reference.md` - Complete tool guide
- `docs/context7-quick-reference.md` - Context7 query patterns
- `docs/directions/README.md` - Direction governance
