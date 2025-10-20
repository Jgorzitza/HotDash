# Shopify Dev vs Production

**Created**: 2025-10-20  
**Issue**: `npm run dev` overwrites production Partners config

## Root Cause

- `shopify app dev` automatically updates Partners dashboard
- No separation between dev and production

## Fix Implemented

✅ `npm run dev` → BLOCKED (shows warning, exits)  
✅ `npm run dev:vite` → Safe local dev (no Shopify CLI)  

## Correct Deploy Process

**Manager owns this** - run when Shopify config changes:

1. Update `shopify.app.toml` (if needed)
2. Run: `shopify app deploy --force`
3. Shopify CLI auto-updates Partners dashboard

No CEO action needed - Manager handles Shopify deploys.

## Long-term Solution

Create separate dev vs production Shopify apps in Partners to prevent conflicts.

**Reference**: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
