# Fly.io Shopify Deployment Notes

Source: https://fly.io/docs/js/shopify/

## Key takeaways

- Scaffold with Shopify CLI (`shopify app init`) and launch with Fly (`fly launch`).
- `fly launch` parses the output of `shopify app env show`, writing everything except `SHOPIFY_API_SECRET` into `fly.toml` and storing that secret via Fly secrets.
- When deploying from the Fly dashboard/UI, manually add Shopify env vars to `fly.toml` after the first deployment.
- Default machine behaviour is auto-stop/auto-start. Production workloads must meet Shopify performance requirements:
  - Optionally use `suspend` to reduce cold starts.
  - Set `min_machines_running = 1` to keep a machine warm.
  - Disable `auto_stop_machines` for always-on behaviour when needed.
- Prefer Postgres for production; SQLite apps experience brief unavailability on deploys.
- Rolling deploys are the default for Postgres apps without volumes.

## Actions for HotDash

- Ensure `fly.toml` includes Shopify env vars: `SHOPIFY_API_KEY`, `SHOPIFY_APP_URL`, plus secrets via `fly secrets set`.
- Configure scaling (`min_machines_running`, `auto_stop_machines`) before production launch.
- Confirm deployments use Postgres (aligned with our Supabase-first posture).
- Include these checks in deployment runbooks and direction docs.
