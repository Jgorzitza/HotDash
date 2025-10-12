# Context7 MCP - Final Working Configuration ✅

**Date**: 2025-10-11  
**Status**: ✅ WORKING  
**Transport**: HTTP (Server-Sent Events)

---

## What's Running

Context7 MCP server is now running as a Docker container with HTTP transport:

```bash
Container: context7-mcp
Port: 3001 (host) → 8080 (container)
URL: http://localhost:3001/mcp
Status: Running with auto-restart policy
```

Check status:
```bash
docker ps | grep context7-mcp
docker logs context7-mcp
```

---

## Configuration Files

### 1. Cursor Global Config: `~/.cursor/mcp.json`

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

### 2. Project Config: `~/HotDash/hot-dash/.mcp.json`

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

---

## Starting the Server

### Method 1: Using the Start Script (Recommended)

```bash
cd ~/HotDash/hot-dash
./scripts/ops/start-context7.sh
```

### Method 2: Manual Docker Command

```bash
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

### Method 3: Restart Existing Container

```bash
docker start context7-mcp
```

---

## Stopping the Server

```bash
# Stop the container
docker stop context7-mcp

# Stop and remove
docker rm -f context7-mcp
```

---

## Verification Steps

### 1. Check Container is Running

```bash
docker ps | grep context7-mcp
```

Expected output:
```
context7-mcp   Up X minutes   0.0.0.0:3001->8080/tcp
```

### 2. Check Container Logs

```bash
docker logs context7-mcp
```

Expected output:
```
Context7 Documentation MCP Server running on HTTP at http://localhost:8080/mcp
```

### 3. Test HTTP Endpoint (Optional)

```bash
curl -H "Accept: text/event-stream" http://localhost:3001/mcp
```

Should return MCP protocol events (not an error).

### 4. In Cursor

1. **Reload Window**: `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Check MCP Status**: Settings → MCP
3. **Look for**: `context7` with green indicator
4. **Test Query**: Ask an AI agent to search your codebase

---

## What Gets Indexed

Context7 indexes the HotDash project at `/home/justin/HotDash/hot-dash` with respect to `.context7ignore`:

✅ **Included:**
- `app/` - Application source code
- `docs/` - All documentation
- `scripts/` - Operational scripts
- `packages/` - Shared packages
- `prisma/` - Database schema
- `supabase/` - Supabase configuration
- `tests/` - Test suites
- Root config files

❌ **Excluded** (via `.context7ignore`):
- `node_modules/` - Dependencies
- `build/`, `.react-router/` - Build outputs
- `test-results/`, `coverage/` - Test artifacts
- `.env*` - Environment files
- `vault/` - Secrets
- Binary files (images, fonts, archives)
- `storage` - Large data file

---

## Troubleshooting

### Issue: "No tools, prompts, or resources"

**Solution:**
1. Verify container is running: `docker ps | grep context7-mcp`
2. If not running: `./scripts/ops/start-context7.sh`
3. Reload Cursor window
4. Check Cursor MCP settings for green indicator

### Issue: Container not starting

**Solution:**
```bash
# Check if port 3001 is available
lsof -i :3001

# If port is in use, stop the conflicting service or use different port
docker run -d --name context7-mcp -p 3002:8080 ...

# Update .mcp.json to use the new port
"url": "http://localhost:3002/mcp"
```

### Issue: Container exits immediately

**Solution:**
```bash
# Check logs for errors
docker logs context7-mcp

# Verify volume mount path is correct
docker inspect context7-mcp | grep -A 5 Mounts

# Restart with fresh container
docker rm -f context7-mcp
./scripts/ops/start-context7.sh
```

### Issue: Context7 returns old/stale results

**Solution:**
```bash
# Restart container to force re-indexing
docker restart context7-mcp

# Or rebuild from scratch
docker rm -f context7-mcp
./scripts/ops/start-context7.sh
```

---

## Key Differences from Initial Setup

### ❌ What Didn't Work
- **stdio transport**: Context7 Docker image doesn't support stdio, only HTTP
- **npx method**: The `@upstash/context7-mcp` package requires API key (cloud service)
- **Inline Docker in .mcp.json**: Cursor expects pre-running HTTP servers

### ✅ What Works
- **HTTP transport**: Context7 runs as HTTP server with Server-Sent Events
- **Pre-started container**: Docker container runs separately, Cursor connects to it
- **Auto-restart policy**: Container survives reboots (unless explicitly stopped)
- **Volume mount**: Project files are accessible to Context7 at `/workspace`

---

## Usage Examples

### For AI Agents

Once Context7 is running and Cursor is reloaded, agents can query:

**Finding Code:**
```
"Show me the Sales Pulse dashboard tile implementation"
"Find the Shopify service client for order fulfillment"
"Where is the metrics aggregation logic?"
```

**Understanding Patterns:**
```
"How are dashboard tiles structured?"
"What's the pattern for service clients?"
"Show me how React Router loaders are used"
```

**Finding Documentation:**
```
"Show me the production deployment checklist"
"Find the incident response runbook"
"What's the nightly metrics documentation?"
```

**Configuration:**
```
"What environment variables are needed for staging?"
"Show me the Prisma schema for dashboard facts"
"How is Supabase configured?"
```

---

## Maintenance

### Daily
- No maintenance required (container auto-restarts)

### After System Reboot
- Container should auto-start due to `--restart unless-stopped`
- If not: `docker start context7-mcp`

### After Updating HotDash Code
- No action needed (Context7 re-indexes automatically)

### When Adding Large Directories
- Update `.context7ignore` to exclude them
- Restart container: `docker restart context7-mcp`

---

## Documentation

- **Quick Reference**: `docs/context7-quick-reference.md`
- **Full Guide**: `docs/context7-mcp-guide.md`
- **Setup Details**: `docs/directions/context7-mcp-setup.md`
- **Start Script**: `scripts/ops/start-context7.sh`

---

## Current Status

✅ **Container**: Running (`docker ps | grep context7-mcp`)  
✅ **Port**: 3001 → 8080  
✅ **Workspace**: `/home/justin/HotDash/hot-dash` mounted  
✅ **Cursor Config**: `~/.cursor/mcp.json` updated  
✅ **Project Config**: `.mcp.json` updated  
✅ **Exclusions**: `.context7ignore` configured  
✅ **Documentation**: All docs updated  
✅ **Start Script**: `scripts/ops/start-context7.sh` created  

**Next Step**: Reload Cursor and test a query!

---

**Last Updated**: 2025-10-11  
**Working Configuration**: HTTP transport on port 3001  
**Container**: context7-mcp (auto-restart enabled)

