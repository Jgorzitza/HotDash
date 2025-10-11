# Shopify Store Access Log

## 2025-10-10T07:32Z Confirmations
- Deployment confirmed QA/product/support service account invites accepted; audit log excerpt saved in `artifacts/integrations/shopify/2025-10-10/store-invite-audit-20251010T0730Z.md`.
- Vault references verified (`vault/occ/shopify/shop_domain_staging.env`, `app_url_staging.env`) and broadcast shared with recipients at 07:35Z (`install_broadcast_2025-10-10T073500Z.md`).
- Remaining DEPLOY-147 scope: capture sub-300 ms smoke latency proof for `https://hotdash-staging.fly.dev/app?mock=0`.

- **Target store:** `hotroddash.myshopify.com`
- **Status:** Credentials + store invites delivered; DEPLOY-147 remains open only for latency verification (`https://hotdash-staging.fly.dev/app?mock=0` < 300 ms requirement).
- **Evidence captured:**
  - CLI secret hash + GitHub timestamp (`cli-secret-20251010T071858Z.log`).
  - Store invite audit export (`store-invite-audit-20251010T0730Z.md`).
  - Install broadcast (`install_broadcast_2025-10-10T073500Z.md`).
- **Next action:** Attach latency probe logs once reliability provides sub-300 ms smoke evidence, then close DEPLOY-147.
