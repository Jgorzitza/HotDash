# MCP Tools Reference for AI Agents

**Last Updated**: 2025-10-11  
**Audience**: AI Agents working on HotDash

---

## Overview

HotDash provides **7 Model Context Protocol (MCP) servers** to help AI agents work effectively. Each serves a distinct purpose with no overlap.

---

## Available MCP Servers

### 1. 🏪 Shopify Dev MCP (`shopify`)

**Purpose**: Official Shopify API documentation, schema validation, and CLI guidance

**Use this for:**
- Shopify Admin API queries/mutations
- Shopify Storefront API
- GraphQL schema validation
- Shopify Partners API
- Polaris UI components
- Shopify CLI commands
- Liquid templating

**Example queries:**
```
"How do I query Shopify orders with GraphQL?"
"Validate this Shopify Admin API mutation"
"What's the schema for Product in Shopify?"
"How to use Polaris BlockStack component?"
```

**Configuration:**
```json
{
  "command": "npx",
  "args": ["-y", "@shopify/dev-mcp@latest"],
  "env": {
    "LIQUID_VALIDATION_MODE": "partial"
  }
}
```

**Status**: ✅ Always available (npm package)

---

### 2. 🔍 Context7 MCP (`context7`)

**Purpose**: Semantic search for HotDash codebase AND external library documentation

**Use this for:**

**HotDash Codebase:**
- Finding existing implementations
- Understanding code patterns
- Locating specific components/services
- Discovering related code

**External Libraries:**
- React Router 7 patterns
- React hooks and patterns
- Prisma schema examples
- Any npm package documentation

**Example queries:**
```
"Show me the Sales Pulse tile implementation"
"Find the Shopify service client"
"How do we structure loaders in React Router 7?"
"React hook patterns for data fetching"
"Prisma migration best practices"
```

**Configuration:**
```json
{
  "type": "http",
  "url": "http://localhost:3001/mcp"
}
```

**Status**: ⚠️ Requires Docker container running
```bash
# Start the server
./scripts/ops/start-context7.sh

# Or manually
docker start context7-mcp
```

**Important**: Context7 must be running BEFORE you start coding. Check with:
```bash
docker ps | grep context7-mcp
```

---

### 3. 🐙 GitHub MCP (`github-official`)

**Purpose**: GitHub repository management and collaboration

**Use this for:**
- Creating/updating PRs
- Managing issues
- Reading commits and diffs
- Searching code across repos
- Branch management
- PR reviews

**Example queries:**
```
"Create a PR for my current branch"
"List open issues labeled 'bug'"
"Show recent commits on main"
"Search for 'metrics' across the repo"
```

**Configuration:**
```json
{
  "command": "docker",
  "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "gho_***"
  }
}
```

**Status**: ✅ Always available (Docker image)

---

### 4. 🗄️ Supabase MCP (`supabase`)

**Purpose**: Supabase project management and database operations

**Use this for:**
- Running migrations
- Querying database
- Managing edge functions
- Checking logs
- Security advisors
- Database schema inspection

**Example queries:**
```
"List all tables in public schema"
"Apply migration for new dashboard_facts column"
"Deploy edge function occ-log"
"Check Supabase security advisors"
"Get logs for API service"
```

**Configuration:**
```json
{
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server-supabase", "--project-ref", "mmbjiyhsvniqxibzgyvx"],
  "env": {
    "SUPABASE_ACCESS_TOKEN": "sbp_***"
  }
}
```

**Status**: ✅ Always available (npm package)

---

### 5. ✈️ Fly.io MCP (`fly`)

**Purpose**: Fly.io deployment and infrastructure management

**Use this for:**
- Deploying apps
- Managing machines
- Checking app status
- Viewing logs
- Managing secrets
- Volume management

**Example queries:**
```
"Deploy hot-dash app to Fly"
"List all machines for hot-dash"
"Check app status"
"View logs for the last hour"
"Set secret DATABASE_URL"
```

**Configuration:**
```json
{
  "type": "http",
  "url": "http://127.0.0.1:8080/mcp"
}
```

**Status**: ⚠️ Requires HTTP server running (check if available)

---

### 6. 📊 Google Analytics MCP (`google-analytics`)

**Purpose**: Google Analytics data queries (dev tools only - not for app)

**Use this for:**
- Querying GA properties and accounts
- Running analytics reports during development
- Exploring GA data structure
- Testing GA integrations

**Important**: This MCP is for **Cursor/dev tools only**. The HotDash application uses the direct Google Analytics API (not MCP) for performance and reliability.

**Example queries:**
```
"List all my GA properties"
"Show pageviews for last 7 days"
"Get real-time active users"
"What dimensions are available?"
```

**Configuration:**
```json
{
  "command": "pipx",
  "args": ["run", "analytics-mcp"],
  "env": {
    "GOOGLE_APPLICATION_CREDENTIALS": "/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json",
    "GOOGLE_PROJECT_ID": "hotrodan-seo-reports"
  }
}
```

**Status**: ✅ Always available (pipx package)

---

### 7. 🧠 LlamaIndex RAG MCP (`llamaindex-rag`)

**Purpose**: Knowledge base queries and support insights

**Use this for:**
- Querying indexed knowledge base (docs, FAQs, policies)
- Support agent automation (answer_from_docs)
- Generating insights from telemetry data
- Refreshing vector indexes
- Customer support workflows

**Example queries:**
```
"Query support KB: How do I integrate with Shopify?"
"Refresh knowledge index from all sources"
"Generate insights report for last 7 days"
```

**Configuration:**
```json
{
  "type": "http",
  "url": "https://hotdash-llamaindex-mcp.fly.dev/mcp"
}
```

**Status**: 🚧 In development (Week 1-2 implementation)

**Tools Available:**
- `query_support` - Search knowledge base with citations
- `refresh_index` - Rebuild vector index from sources
- `insight_report` - Generate AI insights from data

---

## Tool Selection Guide

### "Which MCP should I use?"

```
┌─────────────────────────────────────────┐
│ What do you need?                       │
└─────────────────────────────────────────┘
           │
           ├─ Shopify API/GraphQL? ──────────────► shopify
           │
           ├─ HotDash code/patterns? ────────────► context7
           │
           ├─ External library docs? ────────────► context7
           │
           ├─ GitHub operations? ────────────────► github-official
           │
           ├─ Database/migrations? ──────────────► supabase
           │
           ├─ Deployment/infrastructure? ────────► fly
           │
           ├─ GA data queries (dev only)? ───────► google-analytics
           │
           └─ Knowledge base/support queries? ───► llamaindex-rag
```

### Common Scenarios

**Building a new dashboard tile:**
1. **context7**: Find existing tile implementations
2. **context7**: Learn React Router 7 loader patterns
3. **shopify**: Get Shopify data schema
4. **supabase**: Check database tables

**Debugging Shopify integration:**
1. **context7**: Find service client implementation
2. **shopify**: Validate GraphQL query
3. **github-official**: Check related PRs/issues
4. **supabase**: Check logs

**Deploying to production:**
1. **github-official**: Create deployment PR
2. **supabase**: Run migrations
3. **fly**: Deploy app
4. **fly**: Check status and logs

---

## Startup Checklist for Agents

Before you start coding, verify all required MCP servers are available:

### Required Always
- ✅ **shopify** - npm package (auto-loads)
- ✅ **github-official** - Docker (auto-loads)
- ✅ **supabase** - npm package (auto-loads)

### Required if Running (check first)
- ⚠️ **context7** - Docker HTTP server
  ```bash
  docker ps | grep context7-mcp
  # If not running: ./scripts/ops/start-context7.sh
  ```

- ⚠️ **fly** - HTTP server (check if needed)
  ```bash
  curl -s http://127.0.0.1:8080/mcp
  ```

---

## Configuration Locations

### Cursor IDE
```
~/.cursor/mcp.json
```

### Codex CLI
```
~/.codex/config.toml
```

### Claude Desktop
```
~/Library/Application Support/Claude/claude_desktop_config.json  # macOS
%APPDATA%\Claude\claude_desktop_config.json                      # Windows
~/.config/Claude/claude_desktop_config.json                      # Linux
```

### Project-specific
```
~/HotDash/hot-dash/.mcp.json
```

---

## Troubleshooting

### "No tools available" for Context7

**Problem**: Context7 Docker container not running

**Solution**:
```bash
./scripts/ops/start-context7.sh
# Then reload your IDE/agent
```

### "Authentication failed" for Shopify/Supabase/GitHub

**Problem**: API tokens expired or invalid

**Solution**: Check vault for current tokens:
```bash
# Shopify: Not needed (docs only)
# Supabase: Check vault/occ/supabase/
# GitHub: Check vault/occ/github/
```

### "Tool not found"

**Problem**: MCP server not configured for your tool

**Solution**: 
1. Check which tool you're using (Cursor, Codex, Claude, Warp)
2. Verify config file exists for that tool
3. Follow setup instructions in README

---

## Best Practices

### 1. Always Check Context7 First
Before asking humans or guessing, search the codebase:
```
"Show me how we handle X"
"Find similar implementations of Y"
```

### 2. Validate Shopify Queries
Never guess Shopify schemas - always validate:
```
"Validate this Admin API query"
"What's the correct schema for Product.variants?"
```

### 3. Use GitHub for Context
Check history before making changes:
```
"Show recent commits touching this file"
"Are there open issues related to X?"
```

### 4. Check Database Schema
Before modifying data structures:
```
"List tables in public schema"
"Show schema for dashboard_facts table"
```

### 5. Combine Tools
Most tasks need multiple MCPs:
- Context7 (find code) → Shopify (validate API) → Supabase (check DB) → GitHub (create PR)

### 6. **Use Tools Efficiently** ⭐
MCP tools consume context window space. Follow efficiency guidelines:
- **Set token limits** on Context7 calls: `tokens: 3000`
- **Query once, reference multiple times** - don't repeat calls
- **Use file tools** for known paths instead of Context7
- **Paginate large results** with `perPage` parameter
- **Combine related queries** into single calls

**See `docs/directions/mcp-usage-efficiency.md` for complete efficiency guide.**

---

## When NOT to Use MCPs

- **Don't use MCPs** for basic programming questions (use your training)
- **Don't use MCPs** excessively (one query per need, not exploratory)
- **Don't use GitHub MCP** for reading files (use file tools instead)
- **Don't use Context7** if you know the exact file location (read directly)

---

## Summary

| MCP | Always Available? | Startup Required? | Primary Use |
|-----|-------------------|-------------------|-------------|
| shopify | ✅ Yes | No | Shopify API docs |
| context7 | ⚠️ Docker | **Yes** | Codebase search |
| github-official | ✅ Yes | No | GitHub operations |
| supabase | ✅ Yes | No | Database management |
| fly | ⚠️ HTTP Server | Maybe | Deployment |
| google-analytics | ✅ Yes | No | GA queries (dev only) |
| llamaindex-rag | 🚧 Development | No | Knowledge base RAG |

**Action Items**:
1. **Always start Context7 first**: `./scripts/ops/start-context7.sh`
2. **Verify with**: `docker ps | grep context7-mcp`
3. **Then begin coding** with full MCP access

---

**Questions?** See:
- Context7 specifics: `docs/context7-mcp-guide.md`
- Tool combinations: This document
- Setup instructions: `README.md` (AI Agent Support section)

