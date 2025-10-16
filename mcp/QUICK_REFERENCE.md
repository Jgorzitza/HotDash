# MCP Tools Quick Reference

Quick reference for using MCP tools in your AI assistant workflows.

## When to Use Each Tool

### 🐙 GitHub Official
**Use when you need to:**
- ✅ Create, update, or close issues
- ✅ Manage pull requests
- ✅ Search code across repositories
- ✅ Trigger or monitor GitHub Actions
- ✅ Manage repository settings

**Example prompts:**
- "Create a GitHub issue for the bug we just found"
- "List all open PRs in the repository"
- "Search for all files using the deprecated API"
- "Show me the status of the latest workflow run"

---

### 🧠 Context7
**Use when you need to:**
- ✅ Deep semantic code search
- ✅ Understand complex code relationships
- ✅ Build comprehensive context for refactoring
- ✅ Analyze cross-file dependencies

**Example prompts:**
- "Find all components that use the UserContext"
- "Show me how authentication flows through the app"
- "What are all the dependencies of the payment module?"

---

### 🗄️ Supabase
**Use when you need to:**
- ✅ Query or modify database data
- ✅ Create or alter database schemas
- ✅ Manage authentication and users
- ✅ Work with storage buckets
- ✅ Deploy or test edge functions

**Example prompts:**
- "Show me all users created in the last week"
- "Create a new table for storing product reviews"
- "Upload this file to the avatars bucket"
- "Deploy the email-notification edge function"

---

### 🚀 Fly.io
**Use when you need to:**
- ✅ Deploy applications
- ✅ Check deployment status
- ✅ View application logs
- ✅ Scale instances
- ✅ Monitor resource usage

**Example prompts:**
- "Deploy the latest version to production"
- "Show me the logs from the last hour"
- "Scale the app to 3 instances"
- "What's the current status of all deployments?"

---

### 🛍️ Shopify
**Use when you need to:**
- ✅ Validate Liquid templates
- ✅ Work with Shopify themes
- ✅ Manage products or collections
- ✅ Test Shopify API integrations
- ✅ Debug theme issues

**Example prompts:**
- "Validate this Liquid template syntax"
- "Create a new product with these details"
- "Test the checkout flow integration"
- "Show me all products in the 'Featured' collection"

---

### 📊 Google Analytics
**Use when you need to:**
- ✅ Fetch analytics metrics
- ✅ Generate traffic reports
- ✅ Analyze user behavior
- ✅ Track conversion funnels
- ✅ Monitor campaign performance

**Example prompts:**
- "Show me page views for the last 30 days"
- "What's the conversion rate for the signup funnel?"
- "Generate a report of top traffic sources"
- "How many users visited from mobile devices?"

---

---

### 🧩 Chrome DevTools
**Use when you need to:**
- ✅ Inspect live console and network logs during dev sessions
- ✅ Record performance traces (CPU, timeline, memory) to diagnose slowness
- ✅ Run accessibility/Lighthouse-style audits via agent workflows
- ✅ Automate DOM inspection and state collection for bug reports

**Example prompts:**
- "Capture console errors while loading /app and return stack traces"
- "Record a 10s performance trace during dashboard render and summarize long tasks"
- "Collect a HAR for the login flow and highlight 4xx/5xx responses"
- "Query DOM for #inventory-table and list rows with aria-invalid=true"


## Common Workflows

### 🔄 Development Workflow
1. **Context7**: Understand existing code structure
2. **GitHub**: Create issue for new feature
3. **Supabase**: Update database schema if needed
4. **Fly**: Deploy to staging
5. **Google Analytics**: Monitor impact

### 🐛 Bug Fix Workflow
1. **GitHub**: Review issue details
2. **Context7**: Find related code
3. **Supabase**: Check database state
4. **Fly**: View production logs
5. **GitHub**: Create PR with fix

### 🎨 Theme Development Workflow
1. **Shopify**: Validate Liquid templates
2. **Context7**: Find component dependencies
3. **GitHub**: Create feature branch
4. **Shopify**: Test theme changes
5. **GitHub**: Submit PR

### 📈 Analytics Review Workflow
1. **Google Analytics**: Fetch metrics
2. **Supabase**: Query user data
3. **GitHub**: Create optimization issues
4. **Fly**: Check performance logs

---

## Tool Combinations

### Database + Analytics
```
"Show me Supabase user signups and correlate with Google Analytics traffic"
```

### GitHub + Deployment
```
"Create a GitHub issue for the deployment failure shown in Fly logs"
```

### Shopify + Database
```
"Sync Shopify product data to our Supabase database"
```

### Context7 + GitHub
```
"Find all TODOs in the codebase and create GitHub issues for them"
```

---

## Status Check Commands

### Check All MCP Servers
```bash
# GitHub (Docker)
docker ps | grep github-mcp-server

# Context7 (HTTP)
curl -s http://localhost:3001/mcp/health || echo "Context7 not running"

# Supabase (NPX)
npx -y @supabase/mcp-server-supabase --version

# Fly (HTTP)
curl -s http://127.0.0.1:8080/mcp/health || echo "Fly MCP not running"

# Shopify (NPX)
npx -y @shopify/dev-mcp@latest --version

# Google Analytics (Pipx)
pipx list | grep analytics-mcp
```

---

## Tips for Effective Use

### 1. Be Specific
❌ "Check the database"
✅ "Query the users table in Supabase for accounts created today"

### 2. Chain Operations
❌ Multiple separate requests
✅ "Use Context7 to find the auth code, then create a GitHub issue for refactoring it"

### 3. Provide Context
❌ "Deploy it"
✅ "Deploy the agent-service app to Fly.io production"

### 4. Use the Right Tool
- Don't use GitHub for code search when Context7 is better
- Don't use Supabase CLI when the MCP server can do it
- Don't manually check logs when Fly MCP can fetch them

### 5. Combine Tools
- Use Google Analytics + Supabase for user behavior analysis
- Use Context7 + GitHub for comprehensive code reviews
- Use Shopify + Fly for e-commerce deployment workflows

---

## Troubleshooting Quick Fixes

### "MCP server not responding"
1. Check if the server is running (see Status Check Commands)
2. Verify network connectivity
3. Check credentials/tokens are valid
4. Restart the MCP server

### "Permission denied"
1. Verify token/credentials have correct permissions
2. Check service account roles (for Google Analytics)
3. Ensure project references are correct

### "Command not found"
1. Verify prerequisites are installed (Docker, Node, Python)
2. Check PATH includes necessary binaries
3. Reinstall the MCP package

---

## Environment Variables Reference

```bash
# GitHub
export GITHUB_PERSONAL_ACCESS_TOKEN="gho_..."

# Supabase
export SUPABASE_ACCESS_TOKEN="sbp_..."
export SUPABASE_PROJECT_REF="mmbjiyhsvniqxibzgyvx"

# Google Analytics
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_PROJECT_ID="hotrodan-seo-reports"

# Shopify
export LIQUID_VALIDATION_MODE="partial"
```

---

## Next Steps

1. ✅ Verify all MCP servers are accessible
2. ✅ Test each server with a simple command
3. ✅ Try combining tools in a workflow
4. ✅ Create custom workflows for your common tasks
5. ✅ Document any new patterns you discover

For detailed setup instructions, see [SETUP.md](./SETUP.md)

