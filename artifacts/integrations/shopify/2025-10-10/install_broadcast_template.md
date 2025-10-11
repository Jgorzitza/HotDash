# Shopify Staging Install Broadcast Template — Prepared 2025-10-10 06:36 UTC

Recipients: QA, Product, Support
Subject: Shopify staging bundle ready — install + smoke instructions

Body draft:
1. Credentials delivered
   - Shopify API key/secret: <link to vault>
   - Shopify CLI token: <link to vault>
   - Staging app URL: https://hotdash-staging.fly.dev/app
   - Shop domain: hotroddash.myshopify.com
2. Required actions (QA)
   - Pull latest `.env.staging`
   - Run Prisma forward/back drill (`npm run db:migrate:postgres`)
   - Execute contract tests (orders/inventory)
3. Required actions (Product)
   - Validate dashboard tiles render with live staging data
   - Log findings in readiness brief
4. Required actions (Support)
   - Rehearse Shopify validation queue using staging host
   - Confirm updated SOP links
5. Evidence logging
   - Drop GitHub secret audit + vault screenshots into `artifacts/integrations/shopify/2025-10-10/`
   - Update `feedback/integrations.md` with broadcast timestamp and recipients

Checklist before sending:
- [ ] Confirm DEPLOY-147 closed
- [ ] Capture Fly smoke artifact (attach link)
- [ ] Verify vault entries updated with delivery timestamp
- [ ] Attach curl logs (`...?mock=0` and `...?mock=1`)
