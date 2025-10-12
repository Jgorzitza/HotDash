# LlamaIndex RAG MCP Server

HTTP MCP server that wraps the existing `llama-workflow` CLI to provide knowledge base queries via the Model Context Protocol.

## Overview

This server exposes 3 tools:
1. `query_support` - Query knowledge base for support information
2. `refresh_index` - Rebuild vector index from all sources
3. `insight_report` - Generate AI insights from telemetry

## Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start

# Development mode with auto-reload
npm run dev
```

## API Endpoints

- `GET /health` - Health check
- `POST /mcp` - MCP protocol endpoint
- `POST /mcp/tools/list` - List available tools
- `POST /mcp/tools/call` - Execute a tool

## Deployment

```bash
# Launch Fly.io app
fly launch --no-deploy

# Set secrets
fly secrets set \
  OPENAI_API_KEY="$(cat ../../vault/occ/openai/api_key_staging.env | cut -d= -f2)" \
  SUPABASE_URL="..." \
  SUPABASE_SERVICE_KEY="..."

# Deploy
fly deploy

# Check status
fly status
fly logs
```

## Usage from Cursor

Add to `.mcp.json`:
```json
{
  "mcpServers": {
    "llamaindex-rag": {
      "type": "http",
      "url": "https://hotdash-llamaindex-mcp.fly.dev/mcp"
    }
  }
}
```

Then query: "Using llamaindex-rag, query: shipping policy"

## Environment Variables

- `PORT` - HTTP server port (default: 8080)
- `NODE_ENV` - Environment (production/development)
- `OPENAI_API_KEY` - Required for LlamaIndex
- `SUPABASE_URL` - Required for knowledge base
- `SUPABASE_SERVICE_KEY` - Required for knowledge base

