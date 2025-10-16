# Expose /metrics Route (Prometheus)

Purpose: Wire up the existing Prometheus metrics handler to a public (internal-only) endpoint for scrape.

Pre-req
- Metrics already implemented: `app/metrics/prometheus.server.ts` (exports `metricsHandler`)

Proposed route (Engineer to implement)
- Path: `app/routes/metrics/index.ts`
- Behavior: `GET /metrics` → returns Prometheus text format from `metricsHandler()`
- Cache: `Cache-Control: no-cache`

Notes
- Keep endpoint protected by network policy in staging/production (internal scrape only)
- Do not log secret values
- Avoid expensive work in handler; it only serializes registered metrics

Validation
- `curl http://localhost:3000/metrics` → should return Prometheus exposition format (text/plain)
- Add curl entry included in docs/api-contracts/CURL_EXAMPLES.md

