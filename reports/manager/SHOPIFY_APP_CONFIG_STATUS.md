# Shopify App Configuration Status

**Date**: 2025-10-19T15:45:00Z
**Issue**: shopify.app.toml missing/incorrect webhook syntax
**Resolution**: Fixed webhook syntax, app link needed

---

## Current Status

### Found Existing App
**Location**: `.shopify/project.json`
**Dev Store**: hotroddash.myshopify.com ✅
**App Previously Installed**: YES

### shopify.app.toml
**Status**: Fixed webhook syntax (was incorrect)
**Missing**: `client_id` (needs to be populated)

**Before** (incorrect):
```toml
[webhooks.subscriptions]
  [[webhooks.subscriptions.list]]  # ❌ Wrong syntax
```

**After** (correct per Shopify MCP docs):
```toml
[[webhooks.subscriptions]]  # ✅ Correct
topics = ["app/uninstalled"]
uri = "/webhooks/app/uninstalled"
```

---

## What Needs to Happen

**Owner**: DevOps or Engineer
**Task**: Link app to populate client_id

**Command** (interactive - CEO or developer must run):
```bash
shopify app config link
# Select your organization when prompted
# This will populate client_id in shopify.app.toml
```

**Or manually**: 
- Get client_id from Shopify Partner Dashboard → Apps → Hot Dash
- Add to shopify.app.toml: `client_id = "your-client-id-here"`
- Add to .env: `SHOPIFY_API_KEY=your-client-id-here`

---

## App Configuration (Current)

From MCP docs, our shopify.app.toml follows correct format:
- ✅ `name = "hot-dash"`
- ⚠️ `client_id = ""` (empty - needs linking)
- ✅ `application_url = "https://hot-dash.fly.dev"`
- ✅ `embedded = true`
- ✅ Access scopes defined correctly
- ✅ Auth redirect URLs correct
- ✅ Webhooks now using correct syntax
- ✅ API version current (2025-10)

---

## Recommendation

**DEFER to post-manager**: This is configuration task for DevOps/Engineer
**Not blocking**: App can be developed without CLI `shopify app dev`
**Alternative**: Use `npm exec react-router dev` for local development

**Add to DevOps direction** (DEVOPS-001A):
```markdown
### DEVOPS-001A: Link Shopify App Configuration (10 min)
**Command**: `shopify app config link` (interactive)
**Action**: Select organization, link to existing app
**Verify**: client_id populated in shopify.app.toml
**Evidence**: toml file updated, app linked
```

---

**Status**: Non-blocking configuration task
**Owner**: DevOps
**Timeline**: Before using `shopify app dev` CLI

