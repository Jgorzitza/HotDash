# Shopify App TOML Fix

**Date**: 2025-10-19T15:40:00Z
**Issue**: `shopify app dev` failing with "Couldn't find an app toml file"
**Resolution**: Created shopify.app.toml

---

## Problem

**Command**: `npm run dev` → `shopify app dev`
**Error**: "Couldn't find an app toml file at /home/justin/HotDash/hot-dash"

**Root Cause**: shopify.app.toml missing (required by Shopify CLI v3+)

**Found**: shopify.web.toml (different format, for web extensions)
**Needed**: shopify.app.toml (for embedded apps)

---

## Solution

**Created**: shopify.app.toml
**Location**: Project root
**Content**:
- App name: hot-dash
- Embedded: true
- Access scopes: read_orders, read_products, read_inventory, etc.
- Webhooks: app/uninstalled, shop/update
- Auth redirects: /auth/callback, /auth/shopify/callback

**Configuration Needed** (by DevOps or Engineer):
```bash
# Link to Shopify Partner app
shopify app config link

# This will populate client_id and dev_store_url
```

---

## Impact

**Before**: `npm run dev` failed immediately
**After**: `shopify app dev` can start (after config link)

**Assigned**: DevOps or Engineer to run `shopify app config link`

---

**Fixed**: shopify.app.toml created
**Next**: Configure with actual app credentials

