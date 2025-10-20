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

**To update Shopify app URL** (from Shopify Dev MCP):

1. Update `shopify.app.toml`:
   ```toml
   application_url = "https://hotdash-staging.fly.dev"
   
   [auth]
   redirect_urls = [
     "https://hotdash-staging.fly.dev/api/auth",
     "https://hotdash-staging.fly.dev/api/auth/callback"
   ]
   ```

2. Deploy:
   ```bash
   shopify app deploy
   ```

3. Shopify CLI automatically updates Partners dashboard (no manual steps needed)

## Long-term Solution

Create separate dev vs production Shopify apps in Partners to prevent conflicts.

**Reference**: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
