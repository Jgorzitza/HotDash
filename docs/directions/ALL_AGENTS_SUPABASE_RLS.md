# ALL AGENTS - SUPABASE RLS CRITICAL FIX

**Effective**: IMMEDIATELY
**Priority**: P0 - BLOCKS PRODUCTION

## 🚨 CRITICAL: 4 Tables Missing RLS

**Data Agent**: Execute DATA-001-P0 BEFORE any other work

**Tables**:

1. `ads_metrics_daily` - NO RLS
2. `agent_run` - NO RLS
3. `agent_qc` - NO RLS
4. `creds_meta` - NO RLS (CREDENTIALS TABLE!)

**Risk**: These tables are publicly accessible via PostgREST API without RLS

**Fix Time**: 60 minutes
**Owner**: Data agent
**Evidence Required**: RLS enabled verification query output

---

## What RLS Does

**Row Level Security (RLS)**: Database-level access control

- Enforces who can read/write specific rows
- Works even if application has bugs
- Required for all public schema tables

**Without RLS**: Anyone with anon key can query these tables
**With RLS**: Only authorized users/service role can access

---

## Data Agent Instructions

**See**: `docs/directions/data.md` → DATA-001-P0
**Full Plan**: `reports/manager/SUPABASE_REMEDIATION_PLAN.md`

**Do NOT proceed with other data work until P0 complete**

---

**All other agents**: Aware that Data has P0 blocker, production deploy waits for RLS fix
