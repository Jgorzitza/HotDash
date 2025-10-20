# 🔐 UPDATE FLY SECRETS: Supabase Password Rotation

**Priority**: P0 - Required for Application Error fix  
**Action**: Update DATABASE_URL in Fly secrets  
**Time**: ~2 minutes

---

## The Issue

**Password was updated** but Fly secrets need to be updated to match vault

**Impact**: Database connection errors, authentication failures

---

## Fix Command

### Option 1: Interactive (RECOMMENDED)

```bash
cd ~/HotDash/hot-dash

# Set new DATABASE_URL from vault
fly secrets set DATABASE_URL="$(cat vault/occ/supabase/database_url_staging.env | cut -d= -f2-)" -a hotdash-staging
```

### Option 2: From Vault File Directly

```bash
# Load from vault and update
export $(cat vault/occ/supabase/database_url_staging.env | xargs)
fly secrets set DATABASE_URL="$DATABASE_URL" -a hotdash-staging
```

---

## What Happens After

1. Fly will restart the app automatically
2. App will connect to database with correct password
3. Prisma migrations will run (via release_command)
4. Session table will be created
5. App will work in Shopify Admin ✅

---

## Verification

```bash
# Check secret was updated
fly secrets list -a hotdash-staging | grep DATABASE

# Check app restarted
fly status -a hotdash-staging

# Check logs for successful connection
fly logs -a hotdash-staging --no-tail | grep -i "prisma\|database" | tail -10
```

**Expected**: No connection errors, migrations succeed

---

## Full Deploy Sequence

**After updating secrets**:

```bash
cd ~/HotDash/hot-dash

# 1. Update Fly secret (password)
fly secrets set DATABASE_URL="$(cat vault/occ/supabase/database_url_staging.env | cut -d= -f2-)" -a hotdash-staging

# 2. Wait for restart (automatic)
sleep 30

# 3. Deploy latest code (with adapter fix)
shopify app deploy

# 4. Verify app works
# Open: https://admin.shopify.com/store/hotroddash/apps/hotdash
```

---

## Vault Updated

**File**: `vault/occ/supabase/database_url_staging.env`  
**Status**: Synchronized with .env.local  
**Rotation Log**: `vault/rotation_log.md` (documented)  
**Date**: 2025-10-19

---

**🔐 Update Fly secrets, then deploy app!**


