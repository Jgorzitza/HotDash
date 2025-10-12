---
epoch: 2025.10.E1
doc: docs/directions/URGENT-CHATWOOT-DSN-2025-10-11.md
owner: manager
created: 2025-10-11T21:10:00Z
priority: P0-CRITICAL
expires: 2025-10-12T00:00:00Z
---
# 🚨 URGENT: Chatwoot Supabase DSN Fix - P0 BLOCKER

**Issued**: 2025-10-11T21:10:00Z  
**Owner**: Deployment Agent  
**Priority**: P0 - BLOCKS 10-TASK DEPENDENCY CHAIN  
**Deadline**: Complete within 2 hours

---

## Critical Finding

Integrations agent identified Chatwoot Fly.io app has misconfigured database connection:
- ❌ **Pointing at Supabase POOLER (wrong)**
- ✅ **Must point at DIRECT Postgres connection**
- ❌ **BLOCKS: migrations, health check, API token, all automation**

**Evidence**: `artifacts/integrations/audit-2025-10-11/chatwoot_readiness_findings.md`

**Impact**: Entire 10-task Chatwoot readiness checklist blocked

---

## IMMEDIATE ACTION REQUIRED

### 1. Source Correct Connection String

```bash
# Read the correct Supabase connection string
cat vault/occ/supabase/database_url_staging.env
```

**Expected Format**: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**Key**: Must be DIRECT connection, not pooler (no port 6543)

---

### 2. Extract Connection Parameters

From the connection string, extract:
- POSTGRES_HOST (e.g., db.xyz.supabase.co)
- POSTGRES_PASSWORD (percent-encode if special chars)
- POSTGRES_USER (typically "postgres")
- POSTGRES_DATABASE (typically "postgres")
- POSTGRES_PORT (typically 5432, NOT 6543)

---

### 3. Update Fly Secrets

```bash
# Source Fly credentials first
source vault/occ/fly/api_token.env

# Set each secret individually
~/.fly/bin/fly secrets set \
  POSTGRES_HOST="..." \
  POSTGRES_PASSWORD="..." \
  POSTGRES_USER="postgres" \
  POSTGRES_DATABASE="postgres" \
  POSTGRES_PORT="5432" \
  -a hotdash-chatwoot

# Verify secrets updated
~/.fly/bin/fly secrets list -a hotdash-chatwoot
```

---

### 4. Restart Chatwoot App

```bash
# Restart to pick up new secrets
~/.fly/bin/fly apps restart hotdash-chatwoot

# Wait 30 seconds for startup
sleep 30

# Verify health check
curl -I https://hotdash-chatwoot.fly.dev/hc
```

**Expected**: HTTP 200 OK (currently returns 503)

---

### 5. Notify Integrations Agent

After successful fix, tag in feedback/deployment.md:

```
## 2025-10-11T[TIME]Z — Chatwoot DSN Fix Complete

**Actions**:
- Updated Fly secrets with direct Supabase connection
- Restarted hotdash-chatwoot app
- Health check now returns: HTTP 200 OK

**Evidence**: [artifact path]

@integrations - DSN fixed, you can proceed with migrations and downstream tasks
```

---

## Validation Checklist

After fix:
- [ ] Health check returns 200 (not 503)
- [ ] Connection string points to direct Postgres (port 5432, not 6543)
- [ ] All 5 POSTGRES_* secrets set in Fly
- [ ] App restarted successfully
- [ ] Evidence logged in feedback/deployment.md

---

## Downstream Impact

**Once Fixed, Integrations Agent Can Proceed With**:
1. Database migrations (`bundle exec rails db:chatwoot_prepare`)
2. Super admin account creation
3. API token generation
4. Webhook configuration
5. Secret mirroring
6. Integration testing
7. Support team coordination
8. Production readiness

**Total Unblocked**: 10 tasks across 3 agents (Integrations, Support, Data)

---

## Why This is P0

**Current State**: Chatwoot deployed but non-functional (503 errors)  
**Blocked Tasks**: 10-task dependency chain  
**Blocked Agents**: Integrations, Support, Data  
**Business Impact**: No customer support automation possible  
**Timeline Risk**: Each day of delay cascades

---

**Manager Directive**: Fix Chatwoot DSN immediately. This is blocking critical path. Complete within 2 hours and notify @integrations when done.

**Evidence Required**: Health check returning 200, logged in feedback/deployment.md with command outputs and timestamps.

