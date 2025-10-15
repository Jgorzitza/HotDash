# MCP Servers

Model Context Protocol (MCP) tools enable AI assistants to interact with external services and tools.

## 🎉 Status: All Systems Operational!

✅ **All 6 MCP servers are active and ready to use!**

See [ALL_SYSTEMS_GO.md](./ALL_SYSTEMS_GO.md) for ready-to-use examples and workflows.

## Quick Start

1. **Verify Setup**: Run the verification script
   ```bash
   ./mcp/verify-mcp-servers.sh
   ```

2. **Try It Now**: Use a prompt in Cursor
   ```
   "Create a GitHub issue for improving documentation"
   "Query Supabase for users created today"
   "Show me Fly.io deployment status"
   ```

3. **Learn More**: See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for common use cases

## Available MCP Servers

- **GitHub Official** - Repository management, issues, PRs, workflows
- **Context7** - Enhanced semantic code search and context management
- **Supabase** - Database operations and backend services
- **Fly.io** - Deployment and infrastructure management
- **Shopify** - E-commerce operations and Liquid templates
- **Google Analytics** - Analytics data and reporting

## Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions and prerequisites
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference for when to use each tool
- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - Real-world usage examples and patterns
- **[mcp-config.json](./mcp-config.json)** - Complete configuration with all servers

## Integration

- **Dev agents** (Cursor/Codex/Claude) use MCP to access real tools during development
- **In‑app agents** can also call MCP-hosted tools via Agents SDK
- Configuration synced from `~/.cursor/mcp.json`

## Examples

Examples under `mcp/examples/` show Supabase CLI, Chatwoot HTTP, and LlamaIndex.

## Resources

- Cursor: https://cursor.com/docs/context/mcp
- Claude: https://docs.claude.com/en/docs/mcp
- MCP Specification: https://modelcontextprotocol.io/
