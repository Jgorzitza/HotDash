# Staging Deploy Evidence — 2025-10-10T07:51Z

- Deploy log: `artifacts/deploy/staging-deploy-20251010T075141Z.log`
- Synthetic smoke log: `artifacts/deploy/staging-smoke-20251010T075141Z.log`
- Synthetic artifact JSON: `artifacts/monitoring/synthetic-check-2025-10-10T07-52-05.482Z.json`
- Shopify CLI structured log: `artifacts/engineering/shopify_cli/2025-10-10T07-51-41.218Z-staging-app-deploy.json`

Notes:
- Smoke executed against `https://hotdash-staging.fly.dev/app?mock=1` with 241.02 ms duration (≤300 ms budget).
- Live `?mock=0` path still averages 360–430 ms despite warm-up; reliability tuning in progress before issuing the live evidence gate.
- CLI run used `SHOPIFY_CLI_AUTH_TOKEN_STAGING` via vault bundle with `--client-id` staging flow.
