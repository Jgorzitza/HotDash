# DEPLOY-147 Follow-up Draft — Prepared 2025-10-10 06:26 UTC

@Deployment On-Call — following up on DEPLOY-147. We still need the Shopify staging bundle (API key/secret, CLI token confirmation) plus invite instructions for `hotroddash.myshopify.com`.

Evidence staging is ready: vault entries verified, synthetic `curl -I https://hotdash-staging.fly.dev/app?mock=1` returned 200 at 06:20 UTC (`curl_hotdash-staging_2025-10-10T06-20-00Z.log`), and readiness docs are updated. Once the bundle lands we’ll drop screenshots/logs into `artifacts/integrations/shopify/2025-10-10/` and notify QA/product/support immediately.

Can you confirm delivery timing or post the bundle before 09:00 UTC so we can keep the readiness dashboard accurate, unblock readiness handoff, and broadcast install instructions as soon as smoke goes green?

Thanks — Integrations
