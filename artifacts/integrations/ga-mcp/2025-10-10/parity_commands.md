# GA MCP Parity Command Prep — 2025-10-10T07:25Z

## Connectivity Smoke (run once host/token delivered)
```
export GA_MCP_HOST="<provided-host>"
export GA_MCP_TOKEN="<service-token>"
curl -sv -H "Authorization: Bearer ${GA_MCP_TOKEN}" "${GA_MCP_HOST}/landing-pages" -o artifacts/integrations/ga-mcp/2025-10-10/ga-mcp-landing-pages.json
```

## Contract Test Unskip
```
GA_USE_MOCK=0 GA_MCP_HOST="${GA_MCP_HOST}" GA_PROPERTY_ID="<property-id>" \
  npm run test:unit -- tests/unit/contracts/ga.sessions.contract.test.ts --runInBand
```

## Rate Limit Probe
```
for i in $(seq 1 10); do
  curl -s -w "%.0f ms\n" -H "Authorization: Bearer ${GA_MCP_TOKEN}" \
    "${GA_MCP_HOST}/landing-pages" -o /dev/null | tee -a artifacts/integrations/ga-mcp/2025-10-10/rate-limit-probe.log
  sleep 5
done
```

## Dashboard Parity Capture
- Launch staging app with `GA_USE_MOCK=0` and GA MCP env set (per app README).
- Grab screenshots of Sales Pulse tile + supporting metrics; save in `artifacts/integrations/ga-mcp/2025-10-10/`.

## Monitoring Hand-off
- Coordinate with reliability to attach Grafana screenshot + alert JSON export to `artifacts/monitoring/ga-mcp/` once host live.
