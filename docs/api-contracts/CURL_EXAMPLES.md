# API Testing with curl


## Base variables
```bash
BASE_URL=${BASE_URL:-http://localhost:3000}
```

## Health Check
\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

## Dashboard Metrics
\`\`\`bash
# Revenue
curl http://localhost:3000/api/shopify/revenue

# AOV
curl http://localhost:3000/api/shopify/aov

# Returns
curl http://localhost:3000/api/shopify/returns

# Stock Risk
curl http://localhost:3000/api/shopify/stock
\`\`\`

## Webhooks (POST)
\`\`\`bash
# Shopify Order Create
curl -X POST http://localhost:3000/webhooks/shopify/orders/create \
  -H "Content-Type: application/json" \
  -d '{"id": 123, "name": "#1001"}'

# Chatwoot Conversation Update

curl -X POST http://localhost:3000/webhooks/chatwoot/conversation/update \
  -H "Content-Type: application/json" \
  -H "X-Chatwoot-Signature: test" \
  -d '{"event": "conversation_updated", "conversation": {"id": 1}}'
\`\`\`


## Knowledge Base (read-only)
```bash
# KB metrics
curl "$BASE_URL/api/kb/metrics"

# KB search
curl "$BASE_URL/api/kb/search?q=shipping"
```


## Metrics (Prometheus)
```bash
# Requires /metrics route to be exposed by server
curl "$BASE_URL/metrics"
```
