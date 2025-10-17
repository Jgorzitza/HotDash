---
runbook: Supabase Local Development
owner: reliability
last_exercised: TBD
next_window: TBD
---

# Supabase Local Development Runbook

## Overview

We run Supabase locally (Postgres, REST, Auth, Storage) via the Supabase CLI. This runbook covers bringing the stack up, exporting environment variables, tailing logs, and deploying the `occ-log` edge function used for observability.

## Prerequisites

- Supabase CLI (`npm install -g supabase`)
- Docker running locally
- Repository cloned and `.env.local` created from `.env.local.example`

## Startup

```bash
supabase start
```

Outputs include connection strings and the path to the generated service keys. Services listen on:

- Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- REST API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`

## Environment

1. Copy `.env.local.example` to `.env.local` and populate Shopify + OpenAI placeholders.
2. Export the file before running commands:
   ```bash
   export $(grep -v '^#' .env.local | xargs)
   ```
3. Verify Prisma can connect:
   ```bash
   npm run setup
   ```

## Logs

Use the helper script to stream local events:

```bash
scripts/ops/tail-supabase-logs.sh
```

Pass a remote project ref to target a hosted project:

```bash
scripts/ops/tail-supabase-logs.sh abcd1234
```

## Observability Edge Function

The `occ-log` edge function centralises structured logs.

1. Create the backing table:
   ```bash
   psql "$DATABASE_URL" -f supabase/sql/observability_logs.sql
   ```
2. Serve locally:
   ```bash
   supabase functions serve occ-log --env-file .env.local
   ```
3. Deploy remotely:
   ```bash
   supabase functions deploy occ-log --project-ref <project-ref>
   supabase secrets set --project-ref <project-ref> SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```
4. Smoke test:
   ```bash
   curl -X POST "https://<project>.functions.supabase.co/occ-log" \
     -H "Content-Type: application/json" \
     -d '{"level":"INFO","message":"local smoke","metadata":{"source":"runbook"}}'
   ```

## Shutdown

```bash
supabase stop
```

This halts the containers but keeps your data volumes. Use `supabase db reset` only for clean-room scenarios.

## Evidence

- Capture CLI output, screenshots (Studio, logs), and curl responses in `feedback/reliability.md` or `feedback/data.md` depending on the task.
- Reference this runbook ID when noting playback in stand-ups or direction updates.
