# Chatwoot Webhook Setup

## Configuration
1. Go to Chatwoot Settings → Integrations → Webhooks
2. Add webhook URL: `https://hotdash.app/api/webhooks/chatwoot`
3. Subscribe to events: `message_created`, `conversation_status_changed`
4. Set webhook secret (store in GitHub Secrets)

## Testing
```bash
curl -X POST https://hotdash.app/api/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -d '{"event":"message_created","id":1}'
```
