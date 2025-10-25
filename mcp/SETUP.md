# MCP Tools Setup Guide

This guide explains how to set up and use the Model Context Protocol (MCP) tools configured for this project.

## Available MCP Servers

### 1. GitHub Official
**Purpose**: Repository management, issues, PRs, code search, and workflows

**Configuration**:
- Type: Docker container
- Image: `ghcr.io/github/github-mcp-server`
- Authentication: GitHub Personal Access Token

**Use Cases**:
- Create and manage GitHub issues
- Work with pull requests
- Search code across repositories
- Manage GitHub Actions workflows
- Repository administration

### 2. Context7
**Purpose**: Enhanced context management and semantic search

**Configuration**:
- Type: HTTP server
- URL: `http://localhost:3001/mcp`
- Status: Requires local server running

**Use Cases**:
- Semantic code search
- Building context for complex tasks
- Understanding code relationships
- Cross-file dependency analysis

### 3. Supabase
**Purpose**: Database operations and backend services

**Configuration**:
- Type: NPX command
- Package: `@supabase/mcp-server-supabase`
- Project: `mmbjiyhsvniqxibzgyvx`
- Authentication: Supabase Access Token

**Use Cases**:
- Database schema operations
- Running queries and migrations
- Managing authentication
- Working with storage buckets
- Deploying edge functions

### 4. Fly.io
**Purpose**: Deployment and infrastructure management

**Configuration**:
- Type: HTTP server
- URL: `http://127.0.0.1:8080/mcp`
- Status: Requires local server running

**Use Cases**:
- Deploy applications
- Manage infrastructure
- Monitor application health
- Scale resources
- View logs

### 5. Shopify
**Purpose**: E-commerce operations and Liquid template development

**Configuration**:
- Type: NPX command
- Package: `@shopify/dev-mcp@latest`
- Environment: Partial Liquid validation mode

**Use Cases**:
- Develop Shopify themes
- Work with Liquid templates
- Manage products and orders
- Test Shopify integrations
- Validate Liquid syntax

## Prerequisites

### Docker (for GitHub MCP)
```bash
# Verify Docker is installed
docker --version

# Test GitHub MCP server
docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

### Node.js and NPX (for Supabase and Shopify)
```bash
# Verify Node.js and NPX are installed
node --version
npx --version
```

### Local Servers (for Context7 and Fly)
```bash
# Context7 should be running on port 3001
curl http://localhost:3001/mcp

# Fly MCP should be running on port 8080
curl http://127.0.0.1:8080/mcp
```

## Verification

### Test Each MCP Server

#### GitHub
```bash
docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=[REDACTED] \
  ghcr.io/github/github-mcp-server
```

#### Supabase
```bash
npx -y @supabase/mcp-server-supabase \
  --project-ref mmbjiyhsvniqxibzgyvx
```

#### Shopify
```bash
LIQUID_VALIDATION_MODE=partial npx -y @shopify/dev-mcp@latest
```

## Integration with AI Assistants

### Cursor
The MCP configuration is already set up in `~/.cursor/mcp.json`. Cursor will automatically detect and use these servers.

### Claude Desktop
To use with Claude Desktop, copy the configuration to Claude's config file:

```bash
# macOS
cp mcp/mcp-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Linux
cp mcp/mcp-config.json ~/.config/Claude/claude_desktop_config.json
```

## Security Notes

⚠️ **Important**: The configuration files contain sensitive credentials:
- GitHub Personal Access Token
- Supabase Access Token

**Best Practices**:
1. Never commit credentials to version control
2. Use environment variables for sensitive data
3. Rotate tokens regularly
4. Use minimal required permissions
5. Store credentials in secure vaults

## Troubleshooting

### GitHub MCP Not Working
- Verify Docker is running: `docker ps`
- Check token permissions on GitHub
- Ensure token has not expired

### Supabase MCP Errors
- Verify project reference is correct
- Check Supabase access token validity
- Ensure network connectivity to Supabase

### Context7/Fly Not Responding
- Verify the local server is running
- Check the port is not blocked by firewall
- Ensure correct URL and port configuration

## Advanced Usage

### Custom MCP Server Development
See `apps/llamaindex-mcp-server/` for an example of a custom MCP server implementation.

### Adding New MCP Servers
1. Add configuration to `mcp-config.json`
2. Update this documentation
3. Test the new server
4. Update Cursor config if needed

## Resources

- [Cursor MCP Documentation](https://cursor.com/docs/context/mcp)
- [Claude MCP Documentation](https://docs.claude.com/en/docs/mcp)
- [MCP Specification](https://modelcontextprotocol.io/)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)

