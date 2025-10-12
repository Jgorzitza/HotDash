# Staging Deploy Evidence — 2025-10-10T07:18Z

- Deploy log: `artifacts/deploy/staging-deploy-20251010T071828Z.log`
- Synthetic smoke log: `artifacts/deploy/staging-smoke-20251010T071828Z.log`
- Synthetic artifact JSON: `artifacts/monitoring/synthetic-check-2025-10-10T07-18-47.553Z.json`
- Shopify CLI structured log: `artifacts/engineering/shopify_cli/2025-10-10T07-18-28.809Z-staging-app-deploy.json`

Notes:
- Smoke executed against `https://hotdash-staging.fly.dev/app?mock=1` with 258.4 ms duration (≤300 ms budget).
- CLI run used `SHOPIFY_CLI_AUTH_TOKEN_STAGING` exported via vault bundle with `--client-id` staging flow.
