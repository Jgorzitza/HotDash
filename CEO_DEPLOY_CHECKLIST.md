# 🚀 CEO DEPLOY CHECKLIST: Fix Application Error

**Priority**: P0 - Launch Blocker  
**Time Required**: ~10-15 minutes  
**Status**: All fixes committed, ready for deploy

---

## Step-by-Step Instructions

### STEP 1: Update Fly Secrets (2 min) ⚠️ DO THIS FIRST

**Problem**: Supabase password was rotated but Fly still has old password

**Command**:
```bash
cd ~/HotDash/hot-dash

# Update DATABASE_URL with new password from vault
fly secrets set DATABASE_URL="$(cat vault/occ/supabase/database_url_staging.env | cut -d= -f2-)" -a hotdash-staging
```

**What Happens**:
- Fly automatically restarts app
- App connects to database with correct password
- Wait 30 seconds for restart

**Verification**:
```bash
fly status -a hotdash-staging
# Should show: started
```

### STEP 2: Deploy App with Fixes (5-10 min)

**Command**:
```bash
cd ~/HotDash/hot-dash

# Deploy app with adapter fix + Prisma migrations
shopify app deploy
```

**What Happens**:
1. Builds app with Shopify adapter import (fixes crypto error)
2. Runs `npx prisma generate` (generates Prisma client)
3. Runs `npx prisma migrate deploy` (creates Session table)
4. Deploys to hotdash-staging.fly.dev
5. **App should work in Shopify Admin** ✅

**Expected Output**:
```
✔ Building...
✔ Deploying to Fly.io...
✔ Running release command: npx prisma generate && npx prisma migrate deploy
✔ Deployment successful
```

### STEP 3: Verify App Works (2 min)

**Open in Browser**:
```
https://admin.shopify.com/store/hotroddash/apps/hotdash
```

**Expected**:
- ✅ Dashboard loads (not "Application Error")
- ✅ 6 tiles visible (Ops Pulse, Sales Pulse, Fulfillment, Inventory, CX, SEO)
- ✅ Tiles show data or loading states
- ✅ No error messages

**Check Logs**:
```bash
fly logs -a hotdash-staging --no-tail | grep -E "GET /app|error" | tail -10
```

**Expected**:
- ✅ `GET /app?embedded=1&... 200` (not 500)
- ✅ No "crypto is not defined" errors
- ✅ No Prisma Session errors

---

## What Was Fixed

### Fix 1: Shopify Adapter Import ✅
**File**: `app/entry.server.tsx`  
**Added**: `import "@shopify/shopify-app-react-router/adapters/node";` (LINE 1)  
**Why**: Initializes crypto global for Shopify's HMAC functions

### Fix 2: Crypto Import ✅
**File**: `app/routes/api.webhooks.chatwoot.tsx`  
**Changed**: `crypto` → `node:crypto`  
**Why**: Proper Node.js crypto import

### Fix 3: Prisma Migrations ✅
**File**: `fly.toml`  
**Added**: `release_command = "npx prisma generate && npx prisma migrate deploy"`  
**Why**: Creates Session table on deploy

### Fix 4: Supabase Password ✅
**File**: `vault/occ/supabase/database_url_staging.env`  
**Updated**: New password `Th3rm0caf3/67!`  
**Why**: Old password causing connection failures

---

## Troubleshooting

### If Step 1 Fails (Fly Secrets)
```bash
# Check current secrets
fly secrets list -a hotdash-staging

# Manual set if vault command fails
fly secrets set DATABASE_URL="postgresql://postgres.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require" -a hotdash-staging
```

### If Step 2 Fails (Deploy)
```bash
# Check for build errors
npm run build

# If build fails, check for @remix-run imports
rg "@remix-run" app/ --type ts --type tsx

# Deploy with verbose logging
shopify app deploy --verbose
```

### If Step 3 Fails (App Still Shows Error)
```bash
# Check logs for specific error
fly logs -a hotdash-staging --no-tail | grep -i error | tail -20

# Restart app manually
fly apps restart hotdash-staging

# Wait 30 seconds, then reload in browser
```

---

## Related Documents

- **FINAL_P0_FIX_DEPLOY.md** - Detailed fix explanation
- **UPDATE_FLY_SECRETS.md** - Password update details
- **REACT_ROUTER_7_ENFORCEMENT.md** - Mandatory React Router 7 + MCP rules
- **feedback/manager/2025-10-19.md** - Complete manager log

---

## After Success

### Notify Agents
All 16 agents have updated direction files with:
- ✅ Date correction (use 2025-10-19.md)
- ✅ React Router 7 + MCP enforcement
- ✅ New tasks (240+ molecules)

**Agents Can Proceed Immediately** (15 total):
- Data, Inventory, Content, Product, SEO (fresh tasks)
- Integrations, AI-Knowledge, Support (fresh tasks)
- DevOps, Ads, Engineer (continue work)
- AI-Customer, Designer, QA, Pilot (dashboard testing)

### Manager Next Steps
1. Monitor agent execution
2. Review PRs (#99-#107)
3. Merge approved PRs
4. Create remaining PRs for completed work
5. Track QA GO/NO-GO decision

---

## Summary

**Root Cause**: Missing Shopify adapter + old Supabase password  
**Fixes Committed**: 4 (adapter, crypto, migrations, password)  
**Deploy Steps**: 3 (update secrets, deploy app, verify)  
**Time**: ~15 minutes total  
**After**: App functional, 15 agents proceed, launch timeline resumes

---

**🚀 Execute Steps 1-3 Above to Fix Application Error!**


