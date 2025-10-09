---
runbook: Prisma Staging Postgres Setup
owner: engineering
last_exercised: TBD
next_window: TBD
---

# Prisma Postgres Setup — Staging / Test

## Overview
QA and deployment need a dedicated Postgres instance to validate Prisma migrations before they hit production. This runbook describes how to configure the HotDash app against the managed Postgres database, apply forward migrations, and roll back using the new staging helpers introduced in `package.json`.

## Prerequisites
- Postgres database provisioned (Supabase or managed instance) with credentials stored in the secret vault and GitHub actions (`DATABASE_URL`).
- Node 20+, npm, and Prisma CLI (`npx prisma`).
- Access to the repository plus `.env.staging` populated from `.env.staging.example` (never commit real secrets).

## Environment Configuration
1. Copy `.env.staging.example` to `.env.staging`.
2. Fill in the placeholders:
   ```bash
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/hotdash_staging?schema=public
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   SHOPIFY_API_KEY=...
   SHOPIFY_API_SECRET=...
   SHOPIFY_APP_URL=https://staging.hotdash.app
   ```
3. Export the staging env file when running commands locally:
   ```bash
   export $(grep -v '^#' .env.staging | xargs)
   ```
   > CI pipelines should inject the same values as GitHub secrets; no manual export necessary there.

## Forward Migration Workflow
```bash
npm ci
npm run db:generate:postgres
npm run db:migrate:postgres
```
- `db:generate:postgres` regenerates the Prisma client using `prisma/schema.postgres.prisma`.
- `db:migrate:postgres` runs `prisma migrate deploy` against the Postgres datasource.
- Artifacts (migration SQL) remain identical to the sqlite workflow; the only difference is the datasource.

## Backward Validation
To validate rollback or prior state:
```bash
npm run db:migrate:postgres -- --schema-dir prisma/migrations --skip-generate
# or apply a specific migration bundle:
prisma migrate resolve --rolled-back "20251008000000_migration_name" --schema prisma/schema.postgres.prisma
```
Confirm table counts match expectations and log results in `feedback/qa.md`.

## Resetting the Database (QA Sandbox)
When QA requests a clean slate:
```bash
export $(grep -v '^#' .env.staging | xargs)
prisma migrate reset --force --skip-seed --schema prisma/schema.postgres.prisma
```
> Use with caution — this drops the database. Only run against disposable staging/test environments.

## Application Runtime
At runtime the Remix app reads `DATABASE_URL` directly (`app/db.server.ts`). No additional code changes are required. Switching between sqlite (dev) and Postgres (staging/test) is now controlled entirely by which Prisma schema and env file you use.

## Evidence Logging
- Capture command output (forward + reverse) and attach to `feedback/qa.md` or `feedback/deployment.md` when completing migration drills.
- Update `docs/deployment/env_matrix.md` if database hostnames or credentials rotate.

## Supabase Analytics Mirror Prep
- For Supabase-backed instances, bootstrap the analytics mirror by running `supabase/sql/analytics_facts_table.sql` in the Supabase SQL editor (service role) or via the Supabase CLI.
- This script creates the `facts` table plus supporting indexes used by `packages/memory/supabase`. Without it, parity checks and analytics logging throw `PGRST205` errors.
- After running the script, rerun `scripts/ops/check-dashboard-analytics-parity.ts` to verify Supabase and Prisma row counts stay within the 1% threshold. Attach JSON output to `feedback/data.md`.

## Support
Contact the deployment agent or engineering owner if migrations fail or schema drift occurs. For supabase-hosted databases, cross-check logs in the Supabase dashboard and ensure RLS policies continue to allow service key write access.
