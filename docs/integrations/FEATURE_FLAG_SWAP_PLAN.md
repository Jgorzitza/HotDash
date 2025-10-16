# Feature Flag Swap: Mocks → Live Clients

Purpose: Safely switch UI/tiles and server routes from mock data to live clients, with rollback.

Pre-reqs
- All live clients present: Shopify, Supabase, Chatwoot, GA4
- Health route reports all adapters healthy
- Read-only first; writes remain behind HITL approvals

Steps
1) Identify flags and injection points
   - DASHBOARD_USE_MOCK (app/routes/app._index.tsx reads `mock` or env)
   - Tile loaders (sales, inventory, SEO, CX) resolve via service context
2) Staging switch plan
   - Set DASHBOARD_USE_MOCK=0 on staging
   - Validate tiles load within P95 < 500ms (see Metrics below)
3) Observability
   - Use app/metrics/prometheus.server.ts helpers
   - Track shopifyApiCalls / shopifyApiDuration for live requests
   - Expose /metrics (if not already exposed) for Prometheus scrape
4) Rollback
   - Set DASHBOARD_USE_MOCK=1 to return to mocked dataset
   - Re-run /api/health and tiles smoke

Validation
- /api/health → status: healthy
- Dashboard tiles load without errors
- P95 per adapter: < 500ms (reads); Error rate < 0.5%

Notes
- Do not enable write paths without HITL approvals enabled
- Keep Apply disabled in dev builds

