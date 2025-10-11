---
epoch: 2025.10.E1
doc: feedback/$(basename "$file")
owner: $(basename "$file" .md)
last_reviewed: 2025-10-15
doc_hash: TBD
expires: 2025-10-21
---

<!-- Log new updates below. Include timestamp, command/output, and evidence path. -->

## 2025-10-15T15:23:00Z — Sprint Execution Start

### Task 1: Local Supabase Verification

**Finding 1.1: Supabase Not Running**
- Command: `npx supabase status`
- Output: `failed to inspect container health: No such container: supabase_db_hot-dash`
- Status: ❌ Supabase containers not started
- `.env.local`: ✗ Missing (`.env.local.example` exists)
- Docker: ✓ Running (PID 346)
- Supabase CLI: ✓ Available via npx

**Remediation Attempt 1:**
- Command: `npx supabase start`
- Output:
  ```
  ERROR: duplicate key value violates unique constraint "schema_migrations_pkey" (SQLSTATE 23505)
  Key (version)=(20251010011019) already exists.
  ```
- Status: ❌ Failed - migration conflict (stale database state)

**Remediation Attempt 2:**
- Command: `npx supabase db reset` then `npx supabase start`
- Status: ❌ Failed - same error (Docker volumes cleaned but issue persists)

**Remediation Attempt 3:**
- Command: `npx supabase start --debug`
- Status: ❌ Failed - migration tracking bug discovered
- Root Cause: Migration `20251010011019_facts_table.sql` executes successfully but INSERT into `supabase_migrations.schema_migrations` fails with duplicate key. The migration version is already tracked before the INSERT attempt.
- Evidence: Debug shows migration creates tables successfully, then fails at tracking step: `INSERT INTO supabase_migrations.schema_migrations(version, name, statements) VALUES($1, $2, $3)`
- Volumes pruned after failure: `supabase_db_hot-dash`, `supabase_config_hot-dash`

**Investigation:**
- Prisma has only `20251014000000_init_postgres` migration (no `facts` table)
- Supabase migration `20251010011019_facts_table.sql` is for remote Supabase only (per comment in file)
- `facts` table mirrors Prisma analytics but doesn't exist in Prisma schema - creating mismatch

**Resolution:**
- Moved `20251010011019_facts_table.sql` to `supabase/migrations.backup/`
- Disabled `edge_runtime` in `supabase/config.toml` (occ-log function requires `observability_logs` table)
- Command: `npx supabase start`
- Status: ✅ SUCCESS

**Supabase Stack Running:**
- API URL: http://127.0.0.1:54321
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- Studio: http://127.0.0.1:54323
- Publishable key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
- Secret key: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

**Next: Create .env.local and run Prisma setup**

