---
epoch: 2025.10.E1
doc: docs/deployment/chatwoot_fly_runbook.md
owner: deployment
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Chatwoot on Fly.io — Deployment Runbook

## Goal

Stand up a managed Chatwoot instance on Fly.io so the OCC dashboard can rely on a shared, long-lived CX sandbox instead of local Docker processes.

## Architecture Overview

| Component                 | Purpose                      | Resource                                                         |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| Chatwoot Rails + Sidekiq  | Web UI, API, background jobs | Fly app `hotdash-chatwoot`                                       |
| Postgres (Supabase)       | Persistent data store        | Supabase project (`vault/occ/supabase/database_url_staging.env`) |
| Redis                     | Caching + job queue          | Upstash via Fly `hotdash-chatwoot-cache`                         |
| Object storage (optional) | Attachments, avatars         | Supabase storage bucket (existing) or future S3-compatible store |

> ℹ️ Chatwoot requires **both** a web process and a Sidekiq worker. Fly process groups let us run them from the same image.

## Prerequisites

- Fly CLI authenticated (`fly auth login`)
- Organization: `hotdash` (or update commands below)
- DNS ready for `chatwoot.hotrodan.com` (optional; Fly hostname works for now)
- SMTP credentials (SendGrid, SES, etc.) or acceptance of placeholder until go-live
- Secrets bundle for OCC staging/production (`CHATWOOT_TOKEN`, `CHATWOOT_ACCOUNT_ID`, etc.) stored in vault
- Supabase Postgres connection strings now live at `vault/occ/supabase/database_url_staging.env` (and matching prod file). The DSN points at the Supabase session pooler and already includes `sslmode=require`; `export DATABASE_URL` after sourcing so helper commands can read it.
- `FLY_API_TOKEN` stored in `vault/occ/fly/api_token.env`; run `source vault/occ/fly/api_token.env` before executing any Fly CLI command and confirm with `/home/justin/.fly/bin/fly auth status`.

## 1. Clone Fly template

We keep the Fly config under `deploy/chatwoot/`. If you need a fresh copy:

```bash
cp -R deploy/chatwoot deploy/chatwoot.$(date +%Y%m%d)
```

`fly.chatwoot.toml` ships with sensible defaults (region `ord`, image `chatwoot/chatwoot:latest`).

## 2. Create Fly app + Redis cache

```bash
fly apps create hotdash-chatwoot --org hotdash
fly redis create --name hotdash-chatwoot-cache --org hotdash --plan standard --region ord
```

Record the Redis host/password in `vault/occ/chatwoot/redis_staging.env` as:

```
REDIS_URL=redis://default:<password>@<host>:6379
```

## 3. Generate required secrets

Minimal set:

| Secret                                                                                          | Notes                                                                   |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `SECRET_KEY_BASE`                                                                               | `openssl rand -hex 64`                                                  |
| `FRONTEND_URL` / `BACKEND_URL`                                                                  | `https://hotdash-chatwoot.fly.dev` (update once custom domain attached) |
| `POSTGRES_DATABASE`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_USERNAME`, `POSTGRES_PORT` | Derived from Supabase DSN                                               |
| `REDIS_URL`                                                                                     | `redis://default:<password>@<host>:6379`                                |
| `SMTP_*`                                                                                        | Optional until we wire email (set to dummy + disable)                   |
| `DEFAULT_FROM_EMAIL` / `MAILER_SENDER_EMAIL`                                                    | `customer.support@hotrodan.com`                                         |
| `INSTALLATION_ENV`                                                                              | `fly`                                                                   |
| `ENABLE_ACCOUNT_SIGNUP`                                                                         | `false` (we’ll create agents manually)                                  |

Derive Supabase fields:

```bash
source vault/occ/supabase/database_url_staging.env
export DATABASE_URL
PG_HOST=$(node -pe 'new URL(process.env.DATABASE_URL).hostname')
PG_USER=$(node -pe 'new URL(process.env.DATABASE_URL).username')
PG_PASS=$(node -pe 'decodeURIComponent(new URL(process.env.DATABASE_URL).password)')
PG_DB=$(node -pe 'new URL(process.env.DATABASE_URL).pathname.slice(1)')
```

Apply secrets:

```bash
fly secrets set \
  SECRET_KEY_BASE=$(openssl rand -hex 64) \
  FRONTEND_URL=https://hotdash-chatwoot.fly.dev \
  BACKEND_URL=https://hotdash-chatwoot.fly.dev \
  DEFAULT_FROM_EMAIL=customer.support@hotrodan.com \
  MAILER_SENDER_EMAIL=customer.support@hotrodan.com \
  POSTGRES_HOST=$PG_HOST \
  POSTGRES_USERNAME=$PG_USER \
  POSTGRES_PASSWORD="$PG_PASS" \
  POSTGRES_DATABASE=$PG_DB \
  POSTGRES_PORT=5432 \
  REDIS_URL=$(grep REDIS_URL= vault/occ/chatwoot/redis_staging.env | cut -d= -f2-) \
  INSTALLATION_ENV=fly \
  ENABLE_ACCOUNT_SIGNUP=false \
  RAILS_ENV=production \
  NODE_ENV=production \
  --app hotdash-chatwoot
```

Add SMTP secrets when ready (`SMTP_ADDRESS`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_DOMAIN`, `SMTP_AUTHENTICATION`, `SMTP_ENABLE_STARTTLS_AUTO`).

## 4. Deploy Chatwoot app

Ensure `deploy/chatwoot/fly.toml` references the correct app name and region, then capture every command’s output (use `tee` into `artifacts/integrations/chatwoot-fly-deployment-$(date -u +%Y%m%dT%H%M%SZ)/` for reuse):

```bash
cd deploy/chatwoot
fly deploy --app hotdash-chatwoot
```

First deploy seeds the app but the database still needs initial schema.

## 5. Run database migrations + bootstrap

```bash
fly ssh console --app hotdash-chatwoot -C "bundle exec rails db:chatwoot_prepare" | tee artifacts/integrations/chatwoot-fly-deployment-$(date -u +%Y%m%dT%H%M%SZ)/db_chatwoot_prepare.log
```

If the command times out or the app still fails health checks, follow the recovery loop:

1. Review `fly logs -a hotdash-chatwoot` (or the Fly dashboard) to confirm whether the failure is a migration error, OOM, or boot timeout.
2. Load the Supabase DSN from `vault/occ/supabase/database_url_staging.env` (e.g. `source vault/occ/supabase/database_url_staging.env` to export `DATABASE_URL`). Verify each `POSTGRES_*` Fly secret aligns with that DSN (`fly secrets list --app hotdash-chatwoot`). Update secrets if the DSN rotated.
3. SSH back in and rerun `bundle exec rails db:chatwoot_prepare`. Capture the command output for the deployment artifact.

Document each pass/fail (logs, outputs, next steps) in `artifacts/integrations/chatwoot-fly-deployment-2025-10-10.md` and mirror the status in `feedback/integrations.md`, noting the file paths you generated.

Create the default admin once migrations succeed:

```bash
fly ssh console --app hotdash-chatwoot -C "bundle exec rails chatwoot:create_redis_keys"
fly ssh console --app hotdash-chatwoot -C "bundle exec rails chatwoot:create_super_admin[email='admin@hotrodan.com' password='<random_pw>']"
```

Store the generated password securely in `vault/occ/chatwoot/super_admin_staging.env` (do not commit).

## 6. Process groups (web + worker)

`fly.toml` defines two process groups:

```toml
[processes]
  web = "bundle exec rails server -p 3000"
  worker = "bundle exec sidekiq -C config/sidekiq.yml"
```

Scale workers if needed:

```bash
fly scale count 1 --process web --app hotdash-chatwoot
fly scale count 1 --process worker --app hotdash-chatwoot
```

## 7. Health checks

Fly config includes:

```toml
[[services]]
  internal_port = 3000
  processes = ["web"]
  [[services.http_checks]]
    path = "/hc"
    grace_period = "30s"
    interval = "15s"
    timeout = "10s"
```

Confirm the route before relying on it:

```bash
fly ssh console --app hotdash-chatwoot -C "bundle exec rails routes | grep -i health || true"
```

If no `/hc` route exists, update `deploy/chatwoot/fly.toml` (and this runbook) with the route that is available, redeploy, and re-run the check:

```bash
curl https://hotdash-chatwoot.fly.dev/<resolved-health-path>
```

Archive the HTTP status/body for each attempt in the deployment artifact directory; only proceed once the endpoint returns `200`.

## 8. Memory scaling & log capture

- Check current allocations: `fly status --app hotdash-chatwoot --json | jq '.app.instances[] | {name: .name, memoryMB: .spec.memoryMB, cpuKind: .spec.cpuKind}'`.
- Scale workers to 1024 MB when Sidekiq queue depth > 100:
  ```bash
  fly scale memory 1024 --process worker --app hotdash-chatwoot
  fly scale memory 1024 --process web --app hotdash-chatwoot
  ```
- Capture operational logs before handing off to integrations/support:
  ```bash
  fly logs --app hotdash-chatwoot --since 15m --region ord \
    | tee artifacts/ops/chatwoot-fly-logs-$(date -u +%Y%m%dT%H%M%SZ).log
  ```
- Share scaling/log artifact paths in `feedback/reliability.md`.

## 9. Post-deploy tasks

- Update `CHATWOOT_BASE_URL_STAGING` / `_PROD` secrets with the Fly hostname.
- Generate API token for OCC integration:
  1. Sign into Chatwoot as super admin.
  2. Create inbox + bot accounts as needed.
  3. Generate an API token scoped for OCC (Settings → API).
  4. Store token + account id in vault / GitHub secrets.
- Configure SMTP (SendGrid/SES) before enabling outbound emails.
- Set up backup strategy (Supabase retains daily snapshots; schedule weekly exports via Supabase tools to S3/Supabase bucket).
- Broadcast host + API token updates to support so the smoke script stays current:
  - Log new host/token in `feedback/support.md`.
  - Share the command snippet below with support for validation runs:
    ```bash
    scripts/ops/chatwoot-fly-smoke.sh hotdash-chatwoot.fly.dev --interval 180 --token <CHATWOOT_API_TOKEN>
    ```
  - Confirm support captured the update in `docs/runbooks/cx_escalations.md` before closing the deployment handoff.

### Secret mapping & documentation sync — 2025-10-10

- `CHATWOOT_BASE_URL_STAGING` updated to `https://hotdash-chatwoot.fly.dev` in vault and mirrored to GitHub staging secrets.
- `CHATWOOT_TOKEN_STAGING` and `CHATWOOT_ACCOUNT_ID_STAGING` remain valid; no rotation required until Fly cut-over completes (tracked in `docs/deployment/env_matrix.md`).
- Env matrix + integration dashboard refreshed to reflect Fly host and no-rotation posture; reference `feedback/deployment.md` for timestamped evidence.

## 10. Cut-over checklist

| Task                                                | Owner                | Status                                                        |
| --------------------------------------------------- | -------------------- | ------------------------------------------------------------- |
| Deploy Fly app + migrations                         | Reliability          | ☐                                                             |
| Create API token & update vault                     | Support/Integrations | ☐                                                             |
| Update OCC secrets (`CHATWOOT_*`)                   | Reliability          | ☐ (staging secret now points to Fly host; production pending) |
| Smoke test from OCC (`/app?mock=0`)                 | QA                   | ☐                                                             |
| Update runbooks (`docs/runbooks/cx_escalations.md`) | Support              | ☐ (pending embed token + Fly host confirmation)               |
| Decommission local Docker instructions              | Deployment           | ☐                                                             |

## Troubleshooting

- **App boot loop (database errors):** Capture `fly logs -a hotdash-chatwoot` output, then source `vault/occ/supabase/database_url_staging.env` and verify every `POSTGRES_*` secret matches the DSN. Re-run `bundle exec rails db:chatwoot_prepare` via SSH and record the results in the deployment artifact before escalating.
- **db:chatwoot_prepare hits OOM:** Temporarily bump memory to 2048 MB for the web and worker groups with `fly scale memory 2048 --process web --app hotdash-chatwoot` (repeat for `--process worker` if needed), rerun the task, then scale back after the database finishes.
- **Redis auth failures:** Verify `REDIS_URL` matches Fly Redis format (`redis://default:PASSWORD@HOST:6379`).
- **Emails failing:** Provide real SMTP creds or set `MAILER_INBOUND_EMAIL_DOMAIN` to disable inbound features.
- **Sidekiq not processing:** Confirm worker process scaled and logs (`fly logs --app hotdash-chatwoot --process worker`) show jobs running.
- **Health check timeouts:** Review `fly logs`, rerun `bundle exec rails db:chatwoot_prepare`, and ensure the Supabase connection string from `vault/occ/supabase/database_url_staging.env` is mirrored in Fly secrets. Increase memory (e.g., `fly scale memory 1024`) if the web process OOMs during boot.

## Future Enhancements

- Attach Supabase storage bucket for attachments.
- Configure custom domain + SSL via `fly certs create chatwoot.hotrodan.com`.
- Add SSO (Google/SAML) for operators.
- Wire Grafana/Loki for log aggregation.

## References

- [Chatwoot Deployment Docs](https://www.chatwoot.com/docs/self-hosted/deployment/docker)
- [Fly.io Multi-Process Apps](https://fly.io/docs/apps/processes/)
- `packages/integrations/chatwoot.ts` (OCC client implementation)
