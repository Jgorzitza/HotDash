---
description: MCP tools usage guidelines and MCP-first development approach
globs:
  - "**/*"
alwaysApply: true
---

# MCP Tools Usage

**Source:** `mcp/` directory, `docs/NORTH_STAR.md`, `README.md`

## What is MCP?

Model Context Protocol (MCP) enables AI agents to interact with external tools and services through a standardized interface.

## Available MCP Servers (5 Active)

### 1. GitHub Official
- **Purpose:** Repository management, issues, PRs, workflows
- **Type:** Docker
- **Status:** ✅ Active
- **Use for:** Creating issues, managing PRs, searching code, triggering workflows

### 2. Context7
- **Purpose:** Semantic code search and context management
- **Type:** HTTP (port 3001)
- **Status:** ✅ Active
- **Use for:** Finding code patterns, understanding relationships, dependency analysis

### 3. Supabase
- **Purpose:** Database operations and backend services
- **Type:** NPX
- **Status:** ✅ Active
- **Use for:** Querying data, schema operations, edge functions, storage

### 4. Fly.io
- **Purpose:** Deployment and infrastructure management
- **Type:** HTTP (port 8080)
- **Status:** ✅ Active
- **Use for:** Deploying apps, checking status, viewing logs, scaling

### 5. Shopify
- **Purpose:** E-commerce operations and Liquid templates
- **Type:** NPX
- **Status:** ✅ Active
- **Use for:** Shopify API, product management, theme development, Liquid validation

## MCP-First Development Rule

**All dev agents MUST use MCP tools - no freehand API guessing**

### ✅ CORRECT
```
"Use the Shopify MCP to query product inventory levels"
"Use Context7 to find all components using UserContext"
"Use Supabase MCP to create a new table for reviews"
```

### ❌ INCORRECT
```
"Query the Shopify API directly" (use Shopify MCP instead)
"Search the codebase manually" (use Context7 instead)
"Write SQL directly" (use Supabase MCP instead)
```

## When to Use Each Tool

### GitHub MCP
**Use when you need to:**
- Create or update GitHub issues
- Manage pull requests
- Search code across repositories
- Trigger or monitor GitHub Actions
- Manage repository settings

**Example prompts:**
- "Create a GitHub issue for the authentication bug"
- "List all open PRs with the 'bug' label"
- "Search for uses of the deprecated API"

### Context7 MCP
**Use when you need to:**
- Understand code structure and relationships
- Find all usages of a function/component
- Trace data flow through the application
- Analyze cross-file dependencies
- Build context for refactoring

**Example prompts:**
- "Use Context7 to find all React components using authentication"
- "Show me how payment processing flows through the app"
- "Find all database queries related to user management"

### Supabase MCP
**Use when you need to:**
- Query or modify database data
- Create or alter database schemas
- Manage authentication and users
- Work with storage buckets
- Deploy or test edge functions

**Example prompts:**
- "Query Supabase for users created in the last week"
- "Create a new table for product reviews"
- "Show me the schema for the orders table"

### Fly.io MCP
**Use when you need to:**
- Deploy applications
- Check deployment status
- View application logs
- Scale instances
- Monitor resource usage

**Example prompts:**
- "Deploy the agent-service app to Fly.io"
- "Show me the last 100 log lines from production"
- "What's the current status of all deployments?"

### Shopify MCP
**Use when you need to:**
- Query Shopify Admin API
- Validate Liquid templates
- Manage products or collections
- Test Shopify integrations
- Work with theme development

**Example prompts:**
- "Validate this Liquid template syntax"
- "Query Shopify for all products in the Featured collection"
- "Show me the GraphQL schema for Product"

## MCP Documentation

**Complete documentation:** `mcp/` directory (PROTECTED)

### Key Files
- `mcp/README.md` - Overview and quick start
- `mcp/ALL_SYSTEMS_GO.md` - Ready-to-use examples
- `mcp/QUICK_REFERENCE.md` - When to use each tool
- `mcp/USAGE_EXAMPLES.md` - Real-world patterns
- `mcp/SERVER_STATUS.md` - Current server status

### Verification
```bash
# Quick test all servers
./mcp/test-mcp-tools.sh

# Comprehensive verification
./mcp/verify-mcp-servers.sh
```

## MCP Protection Rules

### ⚠️ CRITICAL
The `mcp/` directory is **PROTECTED INFRASTRUCTURE**

- ✅ All `mcp/**/*.md` files are in CI allow-list
- ✅ DO NOT remove or archive
- ✅ See `mcp/PROTECTION_NOTICE.md` for details
- ✅ Documented in `docs/RULES.md`

## Common MCP Workflows

### Bug Investigation
1. **GitHub MCP:** Review issue details
2. **Context7 MCP:** Find related code
3. **Fly.io MCP:** Check production logs
4. **Supabase MCP:** Verify data state
5. **GitHub MCP:** Create PR with fix

### Feature Development
1. **Context7 MCP:** Understand existing code
2. **GitHub MCP:** Create feature issue
3. **Supabase MCP:** Update schema if needed
4. **Fly.io MCP:** Deploy to staging
5. **Google Analytics MCP:** Monitor impact

### E-commerce Work
1. **Shopify MCP:** Validate Liquid templates
2. **Context7 MCP:** Find component dependencies
3. **Supabase MCP:** Sync product data
4. **Fly.io MCP:** Deploy changes
5. **Google Analytics MCP:** Track performance

## Best Practices

### ✅ DO
- Use MCP tools for all external service interactions
- Verify MCP servers are operational before starting work
- Reference MCP documentation for usage examples
- Combine multiple MCP tools in workflows
- Provide specific context in MCP prompts

### ❌ DON'T
- Bypass MCP tools to call APIs directly
- Guess at API endpoints or schemas
- Use MCP tools without understanding their purpose
- Ignore MCP server status or errors
- Remove or modify MCP documentation

## Troubleshooting

### MCP Server Not Responding

**Check status:**
```bash
./mcp/test-mcp-tools.sh
```

**Common fixes:**
- Verify server is running (Context7, Fly.io)
- Check credentials are valid
- Ensure network connectivity
- Restart the MCP server if needed

### MCP Tool Not Working

**Verify:**
1. Server is in the active list
2. Credentials are properly configured
3. Network/firewall not blocking
4. Check MCP documentation for correct usage

**Get help:**
- See `mcp/SETUP.md` for troubleshooting
- Check `mcp/SERVER_STATUS.md` for known issues
- Review `mcp/USAGE_EXAMPLES.md` for correct patterns

## Integration with Agents SDK

### Dev Agents (Cursor/Codex/Claude)
- Use MCP tools via natural language prompts
- Constrained by runbooks and directions
- CI enforces MCP-first approach

### In-App Agents (OpenAI Agents SDK)
- Use server-side tools (not MCP directly)
- Call: Shopify Admin GraphQL, Supabase RPC, Chatwoot API
- HITL enforced for customer-facing actions

## Verification Checklist

Before starting work:
- [ ] All 6 MCP servers operational (`./mcp/test-mcp-tools.sh`)
- [ ] MCP documentation accessible (`mcp/` directory)
- [ ] Understand which MCP tool to use for task
- [ ] Have examples from `mcp/USAGE_EXAMPLES.md`

During work:
- [ ] Using MCP tools (not direct API calls)
- [ ] Providing specific context in prompts
- [ ] Combining tools for complex workflows
- [ ] Documenting new patterns discovered

After work:
- [ ] MCP tools used correctly
- [ ] No direct API calls bypassing MCP
- [ ] New patterns documented if applicable
- [ ] MCP servers still operational

