# GitHub Secret Sync Evidence — 2025-10-10T07:31Z

- Environment: `staging`
- Secrets mirrored: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- Source: `vault/occ/supabase/service_key_staging.env`, `.env`
- Command: `scripts/deploy/sync-supabase-secret.sh staging vault/occ/supabase/service_key_staging.env SUPABASE_SERVICE_KEY` (invoked via ops playbook)
- Timestamp captured immediately after sync so audit trails include the latest rotation.
