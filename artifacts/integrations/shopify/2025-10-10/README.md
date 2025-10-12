# Shopify Secret Bundle Evidence — 2025-10-10

- **Secret bundle status:** Pending delivery from deployment (`DEPLOY-147`).
- **Next action:** Capture GitHub Actions secret audit + 1Password entry screenshots immediately after bundle received.
- **Latest evidence:** HTTP 200 `curl -I https://hotdash-staging.fly.dev/app?mock=1` stored in `curl_hotdash-staging_2025-10-10T02-50-44Z.log` and `...T06-20-00Z.log`; `mock=0` path returns HTTP 410 (`curl_hotdash-staging_2025-10-10T06-34-12Z_mock0.log`). Vault staging entries verified (`vault/occ/shopify/*.env`).
- **Escalation prep:** Drafted deployment follow-up for 09:00 UTC (`deploy_followup_draft.md`, refreshed 06:26 UTC) requesting delivery timing/EOD bundle.
- **Broadcast prep:** Install announcement template staged in `install_broadcast_template.md` so QA/product/support can be notified immediately once smoke goes green.
- **Prepared files:** `staging-deploy-<timestamp>.json`, `staging-smoke-<timestamp>.log`, `production-deploy-<timestamp>.json`, and `production-smoke-<timestamp>.log` will be saved here once deploys run.
- **Notes:** Folder created during restart follow-up so evidence can drop in without additional prep.
