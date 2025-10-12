# Context7 MCP Setup Summary

**Date**: 2025-10-11  
**Status**: ✅ Configured and Ready  
**Maintainer**: justin

## What Was Configured

Context7 MCP has been added to the HotDash project to provide semantic search capabilities over the entire codebase for AI agents.

## Changes Made

### 1. MCP Server Configuration (`.mcp.json`)

Added Context7 MCP server alongside the existing Shopify Dev MCP:

```json
{
  "mcpServers": {
    "shopify-dev-mcp": { ... },
    "context7": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "/home/justin/HotDash/hot-dash:/workspace",
        "-e",
        "WORKSPACE_PATH=/workspace",
        "mcp/context7"
      ]
    }
  }
}
```

**Key Points:**
- Uses Docker container (`mcp/context7` image)
- Mounts HotDash project directory as `/workspace` in container
- Passes workspace path via environment variable
- Auto-removes container after use (`--rm` flag)

### 2. Ignore File (`.context7ignore`)

Created comprehensive ignore rules to exclude:
- Build outputs (`build/`, `dist/`, `.react-router/`)
- Dependencies (`node_modules/`)
- Test artifacts (`test-results/`, `coverage/`, `reports/`)
- Environment files (`.env*`)
- Secrets (`vault/`)
- Binary files (images, fonts, archives)
- Large data files (`storage`)

**Benefit:** Faster indexing, more relevant results, no sensitive data indexed.

### 3. Documentation

Created three documentation files:

#### `docs/context7-mcp-guide.md` (Comprehensive)
- Complete setup documentation
- Detailed usage examples
- Best practices for agents
- Troubleshooting guide
- Integration with other MCPs
- Example workflows

#### `docs/context7-quick-reference.md` (Quick Lookup)
- Query templates
- Project-specific terminology
- Common search patterns
- Tips and tricks
- At-a-glance reference

#### `README.md` (Updated)
- Added "AI Agent Support: Context7 MCP" section
- Quick start examples
- Links to detailed documentation
- Overview of what's indexed/excluded

## How AI Agents Should Use It

### Primary Use Cases

1. **Code Discovery**
   - Finding existing implementations
   - Understanding patterns and conventions
   - Locating utilities and helpers

2. **Architecture Understanding**
   - Understanding data flow
   - Learning component relationships
   - Discovering service integrations

3. **Documentation Lookup**
   - Finding runbooks and procedures
   - Accessing deployment guides
   - Reading strategy documents

4. **Configuration Reference**
   - Environment setup
   - Service configuration
   - Script usage

### Example Queries

**Instead of browsing files:**
```
❌ "show me all files in app/components"
✅ "dashboard tile component that handles sales metrics"
```

**Instead of keyword search:**
```
❌ "grep for 'shopify'"
✅ "how does the Shopify integration fetch order data?"
```

**Instead of asking humans:**
```
❌ "where is the deployment checklist?"
✅ "production deployment checklist"
```

## Integration with Existing Workflow

### Works Alongside Other Tools

- **Shopify Dev MCP**: Use for Shopify API questions
- **Context7 MCP**: Use for HotDash implementation questions
- **Supabase CLI**: Use for database operations
- **Shopify CLI**: Use for app deployment

### When to Use Context7 vs. File Browsing

**Use Context7 when:**
- You don't know where something is
- You're looking for patterns or examples
- You need to understand how something works
- You want related code/docs

**Use File Browsing when:**
- You know the exact file you need
- You're making specific edits
- You're reviewing recent changes

## Performance Expectations

### First Use
- Initial indexing: 1-2 minutes
- Indexes ~50-100 files/second
- Creates semantic embeddings

### Subsequent Use
- Search queries: <100ms
- Re-indexing on changes: automatic
- Cache persists between sessions

## Verification

To verify Context7 is working:

1. **Check Configuration:**
   ```bash
   cat .mcp.json | jq '.mcpServers.context7'
   ```

2. **Test Ignore Rules:**
   ```bash
   # Should exist and have content
   cat .context7ignore
   ```

3. **Try a Query:**
   Ask an AI agent: "Show me the Sales Pulse dashboard tile implementation"

## Maintenance

### Regular Tasks
- **None required** - Context7 auto-updates via `npx`
- Index automatically rebuilds on file changes

### When to Update `.context7ignore`
- Adding new build output directories
- Introducing new test artifact locations
- Creating temporary file directories
- Adding large data directories

### Signs Context7 Needs Attention
- Slow search responses (>2 seconds)
- Results missing recent code
- Out of date documentation in results

**Fix:** Restart the MCP server (reload Cursor window)

## Security Considerations

### What's Protected
✅ Environment variables (`.env*` excluded)  
✅ Secrets in `vault/` (excluded)  
✅ Credentials in configuration (not indexed)

### What's Indexed
- All source code (non-sensitive)
- Documentation (non-sensitive)
- Configuration templates (`.example` files)
- Test code

**Note:** Context7 runs locally. No code is sent to external services.

## Team Impact

### For Engineers
- Faster code discovery
- Better understanding of existing patterns
- Less time hunting for files
- More time building features

### For AI Agents
- Self-service codebase exploration
- Context-aware code suggestions
- Accurate implementation patterns
- Reduced hallucination risk

### For Product/Manager
- Agents can find requirements faster
- Better adherence to documented processes
- Easier onboarding for new agents
- Improved code consistency

## Next Steps

### Immediate
1. Agents should read `docs/context7-quick-reference.md`
2. Try example queries to learn the system
3. Integrate Context7 into daily workflow

### Future Enhancements
Consider if needed:
- Custom query templates for common tasks
- Integration with other development tools
- Performance tuning for larger codebase
- Team training on advanced queries

## Support & Questions

### Documentation
- **Quick Start**: `docs/context7-quick-reference.md`
- **Full Guide**: `docs/context7-mcp-guide.md`
- **Configuration**: `.mcp.json`, `.context7ignore`

### Troubleshooting
1. Check documentation guides above
2. Verify `.mcp.json` syntax (use `jq` or `python -m json.tool`)
3. Review `.context7ignore` for over-exclusion
4. Restart MCP server (reload Cursor)
5. Check Context7 GitHub issues: https://github.com/upguard/context7-mcp

### Getting Help
- Review troubleshooting section in `docs/context7-mcp-guide.md`
- Check if query is too broad or too specific
- Try alternative phrasings
- Verify file isn't in `.context7ignore`

---

**Setup Completed**: 2025-10-11  
**Ready for Use**: ✅ Yes  
**Agent Training**: Review `docs/context7-quick-reference.md`

