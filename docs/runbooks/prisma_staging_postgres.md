---
runbook: Prisma Supabase Postgres
owner: engineering
last_exercised: TBD
next_window: TBD
---

# Prisma + Supabase Postgres Runbook

## Overview
HotDash uses a single Prisma schema (`prisma/schema.prisma`) targeting Postgres. Developers work against the local Supabase containers, while staging/production use managed Supabase projects. This runbook documents the workflows for applying migrations, validating rollbacks, and mirroring secrets across environments.

## Local Development
1. Start the services:
   ```bash
   supabase start
   ```
2. Export your environment:
   ```bash
   export $(grep -v '^#' .env.local | xargs)
   ```
3. Apply migrations and generate the Prisma client:
   ```bash
   npm run setup
   ```
   Evidence: attach the command output to your feedback entry.

## Staging / Production
1. Mirror credentials from vault to GitHub (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`).
2. From a privileged terminal (with the staging `.env` sourced), run:
   ```bash
   npm run setup
   ```
   - `prisma generate` uses `DATABASE_URL` automatically.
   - `prisma migrate deploy` applies `prisma/migrations/*` to the target database.
3. Record the output and any schema changes in `feedback/deployment.md` and `docs/deployment/env_matrix.md`.

## Rollback / Forward Validation
Use Prisma’s CLI directly:
```bash
prisma migrate status
prisma migrate resolve --rolled-back <migration-id>
prisma migrate deploy
```
- Always pass `--schema prisma/schema.prisma` if executing from outside the repo root.
- Never use SQLite helpers; the Postgres datasource is canonical.

## Resetting a Sandbox Database
```bash
prisma migrate reset --force --skip-seed --schema prisma/schema.prisma
```
Only run inside disposable environments (local dev or QA sandboxes). Capture before/after table counts and log them in `feedback/qa.md`.

## Supabase Specific Tasks
- Run `supabase/sql/observability_logs.sql` to provision the logging table when creating new projects.
- Tail live activity with `scripts/ops/tail-supabase-logs.sh <project-ref>` during deploys.
- Deploy edge functions (e.g., `occ-log`) alongside DB changes using the Supabase CLI commands documented in `docs/runbooks/supabase_local.md`.

## Evidence Checklist
- `npm run setup` output (local + staging)
- Supabase log snippet (`scripts/ops/tail-supabase-logs.sh`)
- Prisma `migrate status` or `migrate resolve` output when rolling back
- Updated env matrix (`docs/deployment/env_matrix.md`)
