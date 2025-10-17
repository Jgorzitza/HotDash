# Context7 MCP Setup Guide for HotDash

## Overview

Context7 MCP provides semantic search capabilities over the HotDash codebase. It helps AI agents quickly find relevant code, documentation, and configuration by understanding the meaning and context of queries, not just keyword matching.

## What Gets Indexed

Context7 indexes the following parts of the HotDash project:

### Source Code

- **`app/`** - React Router 7 application code
  - `components/` - Dashboard tiles and UI components
  - `routes/` - React Router data routes and actions
  - `services/` - Shopify, Chatwoot, GA clients & metrics aggregation
  - `utils/` - Utility functions and helpers
  - `hooks/` - Custom React hooks
  - `prompts/` - AI prompt templates

### Configuration

- **Root config files** - `package.json`, `tsconfig.json`, `vite.config.ts`, etc.
- **`prisma/`** - Database schema and migrations
- **`supabase/`** - Supabase configuration, functions, and SQL
- **`shopify.app.toml`** - Shopify app configuration

### Documentation

- **`docs/`** - All project documentation including:
  - `directions/` - Role-specific guidelines and governance
  - `strategy/` - Roadmap and planning documents
  - `integrations/` - Integration readiness and vendor docs
  - `deployment/` - Environment setup and deployment guides
  - `runbooks/` - Operational procedures and incident response
  - `data/` - Data architecture and metrics documentation

### Scripts

- **`scripts/`** - Operational scripts
  - `ops/` - Backfill, metrics, and maintenance scripts
  - `ai/` - AI tooling and index building
  - `ci/` - CI/CD helper scripts

### Tests

- **`tests/`** - Test suites (Vitest and Playwright)

## What Gets Excluded

See `.context7ignore` for the full list. Key exclusions:

- `node_modules/` - Third-party dependencies
- `build/`, `dist/`, `.react-router/` - Build artifacts
- `coverage/`, `test-results/`, `reports/` - Test outputs
- `.env*` files - Environment secrets
- `vault/` - Sensitive credential storage
- `storage` - Large binary data file
- Binary assets (images, fonts, archives)

## Using Context7 MCP with AI Agents

### Common Search Queries

**Finding Components:**

```
"dashboard tile component that shows sales metrics"
"Shopify order fulfillment integration"
"Chatwoot conversation service client"
```

**Understanding Architecture:**

```
"how does the metrics aggregation work?"
"database schema for dashboard facts"
"React Router loader pattern for Shopify data"
```

**Finding Documentation:**

```
"deployment checklist for production"
"incident response procedures"
"nightly metrics calculation logic"
```

**Configuration & Setup:**

```
"environment variables needed for staging"
"Supabase edge function deployment"
"Shopify app configuration"
```

### Best Practices for Agents

1. **Be Specific**: Instead of "show me the dashboard", try "show me the Sales Pulse tile component implementation"

2. **Use Domain Terms**: Context7 understands project-specific terminology like "dashboard tile", "nightly metrics", "operator control center"

3. **Search Before Implementing**: Always search for existing implementations before creating new ones
   - Example: Before adding a new service client, search "service client implementation pattern"

4. **Cross-Reference Documentation**: Search both code and docs
   - Code: "metrics aggregation implementation"
   - Docs: "nightly metrics rollup process"

5. **Find Related Code**: Use context to find similar patterns
   - "other dashboard tiles similar to Sales Pulse"
   - "services that follow the same client pattern as Shopify"

## Configuration Details

### .mcp.json Setup

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

### Docker Configuration

Context7 runs as an **HTTP MCP server** in a Docker container. The container must be started separately:

```bash
# Start the container (or use scripts/ops/start-context7.sh)
docker run -d \
  --name context7-mcp \
  -p 3001:8080 \
  -v /home/justin/HotDash/hot-dash:/workspace \
  -e WORKSPACE_PATH=/workspace \
  -e MCP_TRANSPORT=http \
  -e PORT=8080 \
  --restart unless-stopped \
  mcp/context7
```

**Configuration Details:**

- **Transport**: HTTP (not stdio) - Uses Server-Sent Events (SSE)
- **Port**: 3001 (host) → 8080 (container)
- **Volume Mount**: Your HotDash project → `/workspace` in container
- **Auto-restart**: Container restarts automatically unless explicitly stopped
- **MCP Endpoint**: `http://localhost:3001/mcp`

## Indexing Performance

Context7 automatically indexes the workspace on first use. The indexing process:

1. **Scans** all files not in `.context7ignore`
2. **Extracts** semantic meaning from code and documentation
3. **Builds** searchable embeddings
4. **Caches** the index for fast subsequent searches

**Initial indexing** may take 1-2 minutes for a project of this size. Subsequent searches are nearly instantaneous.

## Integration with Other MCPs

HotDash uses multiple MCP servers:

- **`shopify-dev-mcp`** - Shopify API documentation and schema
- **`context7`** - Project codebase semantic search

Agents can use both simultaneously:

- Use `shopify-dev-mcp` for Shopify API questions
- Use `context7` for HotDash implementation questions

## Troubleshooting

### Context7 not finding results

1. Check if the file is in `.context7ignore`
2. Ensure the workspace path is correct
3. Try broader search terms, then narrow down
4. Restart the MCP server to trigger re-indexing

### Indexing takes too long

- Review `.context7ignore` to ensure large directories are excluded
- Check that `node_modules/`, `build/`, and binary files are excluded

### Results seem outdated

- Context7 re-indexes automatically, but you can force a refresh by restarting the MCP server
- In Cursor, this typically means reloading the window

## Example Workflows

### Adding a New Dashboard Tile

1. **Search existing tiles**: "dashboard tile component structure"
2. **Find the tile pattern**: "Sales Pulse tile implementation"
3. **Check services**: "service client pattern for API integration"
4. **Review docs**: "dashboard tile specification requirements"

### Debugging an Integration

1. **Find the service client**: "Chatwoot service implementation"
2. **Check error handling**: "error handling pattern in service clients"
3. **Review runbooks**: "incident response for integration failures"
4. **Check logs setup**: "logging and observability setup"

### Understanding Metrics

1. **Find calculations**: "nightly metrics aggregation logic"
2. **Check database schema**: "metrics table structure in Prisma"
3. **Review scripts**: "nightly metrics rollup script"
4. **Read documentation**: "metrics calculation specification"

## Maintenance

The `.context7ignore` file should be updated when:

- Adding new build output directories
- Introducing new artifact directories
- Adding large data directories
- Creating temporary file locations

Always exclude:

- Dependencies (`node_modules/`)
- Build outputs
- Credentials and secrets
- Binary assets
- Test artifacts

---

**Last Updated**: 2025-10-11  
**Maintainer**: justin  
**Related Docs**:

- `README.md` - Project overview
- `docs/directions/README.md` - Development governance
- `.mcp.json` - MCP server configuration
