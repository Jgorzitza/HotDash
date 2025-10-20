# 🚨 FIX: Application Error in Shopify App

**Problem**: "Application Error" when loading dashboard in Shopify Admin  
**Root Cause**: Prisma migrations not run on production database (Session table missing)  
**Fix Time**: ~5 minutes

---

## Root Cause (from logs)

```
PrismaClientKnownRequestError:
    at PrismaSessionStorage.loadSession
    at Object.authenticateAdmin
    at loader (app._index)
```

**Issue**: When Shopify loads `/app`, the loader calls `authenticate.admin()` which tries to access the `Session` table, but the table doesn't exist in production database because migrations haven't been deployed.

---

## Fix Options

### Option 1: Redeploy App with Migration Command (RECOMMENDED)

**Updated**: `fly.toml` now includes:
```toml
[deploy]
  release_command = "npx prisma migrate deploy"
```

**Action**:
```bash
cd ~/HotDash/hot-dash
shopify app deploy
```

This will:
1. Build app
2. Run `npx prisma migrate deploy` (creates Session table)
3. Deploy to Fly.io
4. App should work in Shopify Admin

**Time**: ~5-10 minutes

### Option 2: Manually Run Migrations (QUICK FIX)

**If you need immediate fix**:
```bash
# Connect to production and run migrations
fly ssh console -a hotdash-staging
> npx prisma migrate deploy
> exit

# Then restart app
fly apps restart hotdash-staging
```

**Time**: ~2-3 minutes

---

## Verification

After fix:

1. **Check app loads in Shopify**:
   ```
   https://admin.shopify.com/store/hotroddash/apps/hotdash
   ```
   Should show dashboard (not "Application Error")

2. **Check logs are clean**:
   ```bash
   fly logs -a hotdash-staging --no-tail | grep -i error | tail -20
   ```
   Should not show Prisma Session errors

3. **Test dashboard tiles**:
   - All 6 tiles should render
   - No authentication errors
   - Data loads correctly

---

## Files Modified

1. **fly.toml** - Added `release_command` for Prisma migrations
2. **docs/REACT_ROUTER_7_ENFORCEMENT.md** - Strict React Router 7 + MCP enforcement

---

## React Router 7 + MCP Enforcement

Created `docs/REACT_ROUTER_7_ENFORCEMENT.md` with MANDATORY rules:

**FORBIDDEN**:
- ❌ `@remix-run` imports
- ❌ `json()` helper from Remix
- ❌ Remix LoaderFunction types

**REQUIRED**:
- ✅ `react-router` imports only
- ✅ `Response.json()` for all loaders
- ✅ `Route.LoaderArgs` or `LoaderFunctionArgs` types
- ✅ Shopify Dev MCP validation for ALL GraphQL
- ✅ Context7 MCP for ALL library patterns

**Verification**:
```bash
# Must return NO RESULTS
rg "@remix-run" app/ --type ts --type tsx
```

---

## Next Steps

1. **CEO/Manager**: Deploy app with migrations
   ```bash
   cd ~/HotDash/hot-dash
   shopify app deploy
   ```

2. **Verify fix** in Shopify Admin

3. **Notify agents**: App is working, proceed with testing

4. **All agents**: Read `docs/REACT_ROUTER_7_ENFORCEMENT.md` (mandatory)

---

**Status**: ✅ FIX READY - Deploy with migrations to resolve


