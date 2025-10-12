# Chatwoot on Fly.io

This folder contains the Fly configuration for the shared Chatwoot instance that powers OCC CX Escalations.

## Files

- `fly.toml` — multi-process config (Rails web + Sidekiq worker) using the official `chatwoot/chatwoot` image.
- Refer to `docs/deployment/chatwoot_fly_runbook.md` for provisioning steps, secrets, and cut-over checklist.

## Quick Deploy (after provisioning Postgres/Redis + secrets)

```bash
cd deploy/chatwoot
fly deploy --app hotdash-chatwoot
```

Run migrations and create the super admin as documented in the runbook.
