# MCP Server Setup Guide

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Configure MCP (Model Context Protocol) server credentials for agent tools

## Overview

MCP servers provide structured tools for AI agents to interact with external services. HotDash uses 6 MCP servers:

1. **GitHub Official** - Repository operations
2. **Context7** - Documentation lookup
3. **Supabase** - Database operations
4. **Fly.io** - Deployment operations
5. **Shopify** - E-commerce operations
6. **Google Analytics** - Analytics data

**Full documentation**: `mcp/README.md` and `mcp/ALL_SYSTEMS_GO.md`

## Required Credentials

### 1. Supabase MCP (SUPABASE_ACCESS_TOKEN)

**Priority**: P0 - BLOCKS 8 AGENTS

**What**: Service role key from Supabase project  
**Where to get**:

1. Login to Supabase Dashboard (https://app.supabase.com)
2. Select project (HotDash)
3. Settings → API
4. Copy **"service_role"** key (NOT "anon" key)

**Where to store**:

- **GitHub Secrets**: Repository Settings → Secrets and variables → Actions → New repository secret
  - Name: `SUPABASE_ACCESS_TOKEN`
  - Value: `<paste service_role key>`
- **Local .env**: Add line `SUPABASE_ACCESS_TOKEN=<service_role_key>`

**Verification**:

```bash
# Test MCP tool (via agent prompt or MCP client)
mcp_supabase_list_tables(schemas=["public"])

# Expected: Returns list of tables
# Error if not provisioned: "Unauthorized. Please provide a valid access token"
```

**Agents unblocked**: ai-knowledge, data, product, ai-customer, analytics, inventory, integrations, manager

---

### 2. GitHub MCP (GITHUB_MCP_TOKEN)

**Priority**: P0 - BLOCKS 6 AGENTS

**What**: GitHub Personal Access Token (PAT) with repository access  
**Where to get**:

1. GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click "Generate new token"
3. Token name: `MCP Server Token`
4. Expiration: 90 days
5. Repository access: Select "Only select repositories" → `Jgorzitza/HotDash`
6. Permissions:
   - **Repository permissions**:
     - Contents: Read
     - Issues: Read and Write
     - Pull requests: Read and Write
     - Metadata: Read (automatically selected)
7. Generate token and copy immediately

**Where to store**:

- **GitHub Secrets**:
  - Name: `GITHUB_MCP_TOKEN`
  - Value: `<paste PAT>`
- **Local .env**: Add line `GITHUB_MCP_TOKEN=<PAT>`

**Verification**:

```bash
# Test MCP tool
mcp_github_list_commits(owner="Jgorzitza", repo="HotDash", perPage=5)

# Expected: Returns list of commits
# Error if not provisioned: "401 Bad credentials"

# Alternative verification via GitHub CLI
export GITHUB_TOKEN=$GITHUB_MCP_TOKEN
gh api repos/Jgorzitza/HotDash/commits --jq '.[0].sha'
```

**Agents unblocked**: ai-knowledge, designer, product, engineer, qa, manager

**Workaround**: DevOps can use GitHub CLI (`gh`) as alternative for repository operations

---

### 3. Shopify MCP (SHOPIFY_API_KEY + SHOPIFY_API_SECRET)

**Status**: ✅ Already provisioned in .env  
**Configuration**: Shopify Partners Dashboard

**No action required** - credentials already set

---

### 4. Google Analytics MCP (GA*MCP*\* variables)

**Status**: ✅ Already provisioned in .env  
**Configuration**:

- `GA_MCP_HOST`: MCP server endpoint
- `GA_MCP_PROJECT_ID`: Google Cloud project ID
- `GA_MCP_PROPERTY_ID`: GA4 property ID

**No action required** - credentials already set

---

### 5. Fly.io MCP (FLY_API_TOKEN)

**Status**: ⚠️ Check if set for deployments  
**Where to get**:

```bash
# Generate token
fly tokens create deploy -x 365d

# Copy token output
```

**Where to store**:

- **GitHub Secrets**: `FLY_API_TOKEN`

---

### 6. Context7 MCP

**Status**: ✅ No credentials required  
**Usage**: Public documentation API

---

## Setup Procedure

### Step 1: Provision Credentials

Execute steps above for each MCP server requiring credentials.

### Step 2: Configure GitHub Secrets

```bash
# Add each secret via GitHub CLI
gh secret set SUPABASE_ACCESS_TOKEN -b "<service_role_key>"
gh secret set GITHUB_MCP_TOKEN -b "<pat_token>"
gh secret set FLY_API_TOKEN -b "<fly_token>"

# Verify secrets set
gh secret list
```

**Expected output**:

```
SUPABASE_ACCESS_TOKEN    Updated YYYY-MM-DD
GITHUB_MCP_TOKEN         Updated YYYY-MM-DD
FLY_API_TOKEN            Updated YYYY-MM-DD
```

### Step 3: Configure Local .env

Add to `/home/justin/HotDash/hot-dash/.env`:

```bash
# MCP Server Credentials
SUPABASE_ACCESS_TOKEN=<service_role_key>
GITHUB_MCP_TOKEN=<pat_token>
FLY_API_TOKEN=<fly_token>
```

**Security**: Ensure `.env` is in `.gitignore` ✅

### Step 4: Verify MCP Tools

Test each MCP server:

```bash
# Supabase
mcp_supabase_list_tables(schemas=["public"])

# GitHub
mcp_github_list_commits(owner="Jgorzitza", repo="HotDash", perPage=3)

# Shopify (already working)
mcp_shopify_learn_shopify_api(api="admin")

# Google Analytics (already working)
mcp_google_analytics_get_account_summaries()
```

**All should return data without authentication errors**

### Step 5: Update Documentation

Update `required_env_vars.md` maintenance log with provisioning dates.

## Troubleshooting

### "Unauthorized" Error (Supabase)

**Cause**: SUPABASE_ACCESS_TOKEN not set or incorrect  
**Fix**: Verify service_role key copied correctly, not anon key

### "401 Bad credentials" (GitHub)

**Cause**: GITHUB_MCP_TOKEN not set or expired  
**Fix**: Generate new PAT, verify permissions include repo access

### "Not Found" Error (GitHub)

**Cause**: PAT doesn't have access to repository  
**Fix**: Update PAT repository access to include Jgorzitza/HotDash

## Agent Unblocking Timeline

**Once credentials provisioned**:

- T+0min: Credentials added to GitHub Secrets
- T+5min: Verify MCP tools working
- T+10min: Update agent direction files (unblock agents)
- T+15min: All 14 agents can proceed with MCP-dependent tasks

**Total unblocking time**: 15 minutes

## Maintenance

**Rotation Schedule**:

- SUPABASE_ACCESS_TOKEN: Every 90 days
- GITHUB_MCP_TOKEN: Every 90 days (max expiration)

**Rotation Procedure**:

1. Generate new credential
2. Test in local dev first
3. Update GitHub Secrets
4. Update local .env
5. Verify MCP tools still work
6. Invalidate old credential
7. Update maintenance log in `required_env_vars.md`

## Related Documentation

- Environment Variables: `docs/runbooks/required_env_vars.md`
- MCP Overview: `mcp/README.md`
- MCP Usage: `mcp/ALL_SYSTEMS_GO.md`
- Blocker Details: `artifacts/devops/2025-10-19/BLOCKER_mcp_credentials.json`
