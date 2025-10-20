# 🚨 DEPLOY NOW: Fix Application Error

**Status**: ✅ FIX COMMITTED, READY TO DEPLOY  
**Action Required**: CEO run `shopify app deploy`  
**Fix Time**: ~5-10 minutes

---

## The Problem

**"Application Error"** shows in Shopify Admin because:
1. Prisma migrations never ran on production
2. `Session` table doesn't exist in database
3. App crashes when trying to authenticate users

**Error from logs**:
```
PrismaClientKnownRequestError at PrismaSessionStorage.loadSession
GET /app?embedded=1&... 500 - - 653.424 ms
```

---

## The Solution

### ✅ COMMITTED TO MAIN:

1. **fly.toml** - Added release command:
```toml
[deploy]
  release_command = "npx prisma migrate deploy"
```

2. **docs/REACT_ROUTER_7_ENFORCEMENT.md** - Strict enforcement rules

3. **7 agent directions** - Updated with React Router 7 + MCP requirements

---

## Deploy Command

```bash
cd ~/HotDash/hot-dash
shopify app deploy
```

This will:
1. ✅ Build app with React Router 7
2. ✅ Run `npx prisma migrate deploy` (creates Session table + all others)
3. ✅ Deploy to hotdash-staging.fly.dev
4. ✅ App should work in Shopify Admin

**Expected Duration**: 5-10 minutes

---

## Verification After Deploy

1. **Reload Shopify App**:
   ```
   https://admin.shopify.com/store/hotroddash/apps/hotdash
   ```
   Should show dashboard (not "Application Error")

2. **Check Database Tables**:
   ```bash
   fly ssh console -a hotdash-staging
   > npx prisma studio
   ```
   Should see: Session, DashboardFact, DecisionLog tables

3. **Test All 6 Tiles**:
   - Ops Pulse
   - Sales Pulse
   - Fulfillment Health
   - Inventory Heatmap
   - CX Escalations
   - SEO & Content Watch

---

## What's Enforced Now

**ALL agents MUST**:
- ✅ Use React Router 7 (NOT Remix)
- ✅ Use Shopify Dev MCP for ALL GraphQL
- ✅ Use Context7 MCP for ALL library patterns
- ✅ Validate with MCP before committing
- ✅ Log MCP conversation IDs in feedback

**See**: `docs/REACT_ROUTER_7_ENFORCEMENT.md`

---

## Current Status

**PRs Open**: 9 (#99-#107)  
**Agents Ready**: 12 can work now  
**Blockers**: Just this deploy (then all agents can proceed)  
**Security**: ✅ 0 secrets

---

**🚀 Run `shopify app deploy` to fix the Application Error!**


