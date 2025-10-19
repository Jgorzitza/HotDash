# ALL AGENTS - MCP TOOLS (CORRECT USAGE)

**Effective**: IMMEDIATELY
**Critical**: Tool clarity

## ✅ AVAILABLE MCP TOOLS

### Shopify MCP (NOT "shopify-dev-mcp")

**Available tools**:

1. `mcp_shopify_learn_shopify_api` - Load API context (Admin, Storefront, Partner, Customer, etc.)
2. `mcp_shopify_search_docs_chunks` - Search Shopify docs for examples
3. `mcp_shopify_introspect_graphql_schema` - Get schema for queries/mutations
4. `mcp_shopify_validate_graphql_codeblocks` - Validate GraphQL before committing
5. `mcp_shopify_validate_component_codeblocks` - Validate Polaris components

**Example Usage**:

```typescript
// First: Learn the API
mcp_shopify_learn_shopify_api({
  api: "admin", // or "storefront-graphql", "polaris-admin-extensions", etc.
  conversationId: "<from-previous-call>",
});

// Then: Introspect schema
mcp_shopify_introspect_graphql_schema({
  conversationId: "<required>",
  query: "orders",
  filter: ["queries", "mutations"],
});

// Finally: Validate code
mcp_shopify_validate_graphql_codeblocks({
  conversationId: "<required>",
  codeblocks: ["query { orders { ... } }"],
  api: "admin",
});
```

### Context7 MCP

**Tool**: `mcp_context7_get-library-docs`

**Usage for React Router 7**:

```typescript
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loaders server-side data loading",
  });
```

### Chrome DevTools MCP

**Available**: YES (user confirmed green in Cursor)

**Tools**:

- `mcp_Chrome_DevTools_list_pages` - List open browser pages
- `mcp_Chrome_DevTools_take_snapshot` - Capture page state
- `mcp_Chrome_DevTools_list_console_messages` - Get console errors
- `mcp_Chrome_DevTools_navigate_page` - Open URLs for testing

**Use for**: Console error detection, UI validation, performance profiling

### Google Analytics MCP

**Tool**: `mcp_google-analytics_run_report`

**Usage**:

```typescript
mcp_google -
  analytics_run_report({
    propertyId: "339826228",
    metrics: ["sessions", "users"],
    dimensions: ["date"],
  });
```

---

## ❌ NOT AVAILABLE

**"shopify-dev-mcp"**: This doesn't exist

- Use: `mcp_shopify_*` tools instead
- For local dev server: Use Shopify CLI `shopify app dev` (command line)

---

## 🔧 SHOPIFY CLI vs SHOPIFY MCP

### Shopify CLI (Command Line)

```bash
shopify app dev        # Start dev server
shopify app generate   # Scaffold extensions
shopify version        # Check CLI version
```

**Use for**: Local development, scaffolding, deployment

### Shopify MCP (Tool Calls)

```typescript
mcp_shopify_learn_shopify_api(...)
mcp_shopify_introspect_graphql_schema(...)
mcp_shopify_validate_graphql_codeblocks(...)
```

**Use for**: API discovery, schema validation, code verification

**BOTH are needed** - CLI for dev server, MCP for code generation/validation

---

**All agents**: Use correct tool names. Shopify MCP is `mcp_shopify_*`, not "shopify-dev-mcp".
