# MCP Tools - Complete Index

Welcome to the MCP (Model Context Protocol) tools documentation! This index will help you find what you need.

## 🚀 Getting Started

**New to MCP?** Start here:
1. Read [MCP_SETUP_SUMMARY.md](./MCP_SETUP_SUMMARY.md) - Overview of what's available
2. Run `./mcp/test-mcp-tools.sh` - Quick test of all tools
3. Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - When to use each tool

## 📚 Documentation Files

### Core Documentation

| File | Purpose | When to Read |
|------|---------|--------------|
| [README.md](./README.md) | Main overview and links | First stop |
| [MCP_SETUP_SUMMARY.md](./MCP_SETUP_SUMMARY.md) | Complete setup summary | After initial setup |
| [SETUP.md](./SETUP.md) | Detailed setup instructions | When installing/configuring |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Quick guide for each tool | Daily reference |
| [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | Real-world examples | Learning how to use |
| [INDEX.md](./INDEX.md) | This file - navigation guide | Finding documentation |

### Configuration Files

| File | Purpose |
|------|---------|
| [mcp-config.json](./mcp-config.json) | Complete MCP server configuration |
| `~/.cursor/mcp.json` | Cursor editor MCP configuration (source) |

### Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| [test-mcp-tools.sh](./test-mcp-tools.sh) | Quick test of all MCP servers | `./mcp/test-mcp-tools.sh` |
| [verify-mcp-servers.sh](./verify-mcp-servers.sh) | Comprehensive verification | `./mcp/verify-mcp-servers.sh` |

### Examples

| Directory | Contents |
|-----------|----------|
| [examples/](./examples/) | Example configurations for specific tools |
| [examples/supabase.json](./examples/supabase.json) | Supabase MCP example |
| [examples/chatwoot.json](./examples/chatwoot.json) | Chatwoot MCP example |
| [examples/llamaindex.json](./examples/llamaindex.json) | LlamaIndex MCP example |

## 🎯 Quick Navigation

### I want to...

#### Learn About MCP
→ Start with [README.md](./README.md)
→ Then read [MCP_SETUP_SUMMARY.md](./MCP_SETUP_SUMMARY.md)

#### Set Up MCP Tools
→ Follow [SETUP.md](./SETUP.md)
→ Run `./mcp/test-mcp-tools.sh` to verify

#### Use MCP Tools
→ Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for which tool to use
→ See [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for how to use it

#### Troubleshoot Issues
→ See "Troubleshooting" section in [SETUP.md](./SETUP.md)
→ Check [MCP_SETUP_SUMMARY.md](./MCP_SETUP_SUMMARY.md) for common issues

#### Find Examples
→ Browse [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
→ Check [examples/](./examples/) directory

#### Configure New Tools
→ Review [mcp-config.json](./mcp-config.json)
→ Follow patterns in [examples/](./examples/)

## 🛠️ Available MCP Servers

Quick reference to all configured servers:

### 1. GitHub Official
- **File**: [QUICK_REFERENCE.md#github-official](./QUICK_REFERENCE.md)
- **Examples**: [USAGE_EXAMPLES.md#github-mcp-examples](./USAGE_EXAMPLES.md)
- **Type**: Docker
- **Use for**: Issues, PRs, code search, workflows

### 2. Context7
- **File**: [QUICK_REFERENCE.md#context7](./QUICK_REFERENCE.md)
- **Examples**: [USAGE_EXAMPLES.md#context7-examples](./USAGE_EXAMPLES.md)
- **Type**: HTTP
- **Use for**: Semantic search, code understanding

### 3. Supabase
- **File**: [QUICK_REFERENCE.md#supabase](./QUICK_REFERENCE.md)
- **Examples**: [USAGE_EXAMPLES.md#supabase-mcp-examples](./USAGE_EXAMPLES.md)
- **Type**: NPX
- **Use for**: Database, auth, storage, edge functions

### 4. Fly.io
- **File**: [QUICK_REFERENCE.md#flyio](./QUICK_REFERENCE.md)
- **Examples**: [USAGE_EXAMPLES.md#flyio-mcp-examples](./USAGE_EXAMPLES.md)
- **Type**: HTTP
- **Use for**: Deployment, infrastructure, logs

### 5. Shopify
- **File**: [QUICK_REFERENCE.md#shopify](./QUICK_REFERENCE.md)
- **Examples**: [USAGE_EXAMPLES.md#shopify-mcp-examples](./USAGE_EXAMPLES.md)
- **Type**: NPX
- **Use for**: E-commerce, Liquid templates

### 6. Google Analytics
- **File**: [QUICK_REFERENCE.md#google-analytics](./QUICK_REFERENCE.md)
- **Examples**: [USAGE_EXAMPLES.md#google-analytics-mcp-examples](./USAGE_EXAMPLES.md)
- **Type**: Pipx
- **Use for**: Analytics, reporting, metrics

## 📖 Learning Path

### Beginner
1. ✅ Read [README.md](./README.md)
2. ✅ Run `./mcp/test-mcp-tools.sh`
3. ✅ Try one example from [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
4. ✅ Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) as needed

### Intermediate
1. ✅ Read all of [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
2. ✅ Try combining multiple tools
3. ✅ Create your own workflows
4. ✅ Explore [examples/](./examples/) directory

### Advanced
1. ✅ Study [mcp-config.json](./mcp-config.json)
2. ✅ Create custom MCP servers
3. ✅ Integrate with CI/CD
4. ✅ Build team-specific tools

## 🔍 Search Guide

### By Task

| Task | Document | Section |
|------|----------|---------|
| Create GitHub issue | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | GitHub Examples |
| Query database | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | Supabase Examples |
| Deploy app | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | Fly.io Examples |
| Validate Liquid | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | Shopify Examples |
| Get analytics | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | Google Analytics Examples |
| Find code | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Context7 |

### By Problem

| Problem | Document | Section |
|---------|----------|---------|
| MCP not working | [SETUP.md](./SETUP.md) | Troubleshooting |
| Don't know which tool | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | When to Use |
| Need example | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | All sections |
| Setup issues | [SETUP.md](./SETUP.md) | Prerequisites |
| Server not responding | [MCP_SETUP_SUMMARY.md](./MCP_SETUP_SUMMARY.md) | Troubleshooting |

### By Tool

| Tool | Config | Examples | Reference |
|------|--------|----------|-----------|
| GitHub | [mcp-config.json](./mcp-config.json) | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Context7 | [mcp-config.json](./mcp-config.json) | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Supabase | [mcp-config.json](./mcp-config.json) | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Fly.io | [mcp-config.json](./mcp-config.json) | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Shopify | [mcp-config.json](./mcp-config.json) | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Google Analytics | [mcp-config.json](./mcp-config.json) | [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |

## 🎓 Common Workflows

Find workflow examples in [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md):

- **Development Workflow** - Context7 → GitHub → Supabase → Fly → Analytics
- **Bug Investigation** - GitHub → Context7 → Fly → Supabase
- **Feature Development** - Context7 → Supabase → Analytics → GitHub
- **E-commerce** - Shopify → Supabase → Fly → Analytics
- **Deployment** - GitHub → Fly → Analytics

## 🔗 External Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Cursor MCP Docs](https://cursor.com/docs/context/mcp)
- [Claude MCP Docs](https://docs.claude.com/en/docs/mcp)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [Supabase MCP](https://github.com/supabase/mcp-server-supabase)

## 📝 Quick Commands

```bash
# Test all MCP servers
./mcp/test-mcp-tools.sh

# Comprehensive verification
./mcp/verify-mcp-servers.sh

# View configuration
cat mcp/mcp-config.json

# Check Cursor config
cat ~/.cursor/mcp.json
```

## 🎯 Next Steps

1. Choose your experience level above
2. Follow the learning path
3. Try examples from [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
4. Create your own workflows
5. Share what you learn!

---

**Need help?** Check the troubleshooting sections in:
- [SETUP.md](./SETUP.md)
- [MCP_SETUP_SUMMARY.md](./MCP_SETUP_SUMMARY.md)

**Ready to start?** Run `./mcp/test-mcp-tools.sh` now!

