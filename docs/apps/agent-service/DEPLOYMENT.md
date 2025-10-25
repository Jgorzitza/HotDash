# Agent Service Deployment Guide

**Service:** Agent SDK Service  
**Platform:** Fly.io  
**App Name:** hotdash-agent-service  
**Region:** iad (US East)

## Prerequisites

1. **Fly.io CLI installed:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Fly.io authenticated:**
   ```bash
   fly auth login
   ```

3. **Environment variables configured:**
   - See `.env.example` for required variables
   - Set secrets in Fly.io (see below)

## Initial Setup (One-Time)

### 1. Create Fly.io App

```bash
cd /home/justin/HotDash/hot-dash
fly apps create hotdash-agent-service --org personal
```

### 2. Configure Secrets

```bash
# OpenAI API Key
fly secrets set OPENAI_API_KEY="sk-..." -a hotdash-agent-service

# Chatwoot Configuration
fly secrets set CHATWOOT_BASE_URL="https://your-chatwoot.com" -a hotdash-agent-service
fly secrets set CHATWOOT_API_TOKEN="your-token" -a hotdash-agent-service
fly secrets set CHATWOOT_ACCOUNT_ID="123" -a hotdash-agent-service

# Shopify Configuration
fly secrets set SHOPIFY_STORE_DOMAIN="yourstore.myshopify.com" -a hotdash-agent-service
fly secrets set SHOPIFY_ADMIN_TOKEN="shpat_..." -a hotdash-agent-service

# Optional: Slack Webhook
fly secrets set SLACK_WEBHOOK_URL="https://hooks.slack.com/..." -a hotdash-agent-service

# Optional: PostgreSQL
fly secrets set PG_URL="postgres://..." -a hotdash-agent-service
```

### 3. Verify Secrets

```bash
fly secrets list -a hotdash-agent-service
```

## Deployment

### Standard Deployment

```bash
cd /home/justin/HotDash/hot-dash
fly deploy -a hotdash-agent-service \
  -c apps/agent-service/fly.toml \
  --dockerfile apps/agent-service/Dockerfile
```

### With Build Logs

```bash
fly deploy -a hotdash-agent-service \
  -c apps/agent-service/fly.toml \
  --dockerfile apps/agent-service/Dockerfile \
  --verbose
```

### Force Rebuild (No Cache)

```bash
fly deploy -a hotdash-agent-service \
  -c apps/agent-service/fly.toml \
  --dockerfile apps/agent-service/Dockerfile \
  --no-cache
```

## Post-Deployment Verification

### 1. Check Status

```bash
fly status -a hotdash-agent-service
```

Expected output:
```
App
  Name     = hotdash-agent-service
  Owner    = personal
  Hostname = hotdash-agent-service.fly.dev
  Platform = machines

Machines
ID              STATE   REGION  HEALTH CHECKS   LAST UPDATED
...             started iad     1 total         ...
```

### 2. Check Health

```bash
curl https://hotdash-agent-service.fly.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "agent-service",
  "version": "1.0.0",
  "timestamp": "2025-10-24T..."
}
```

### 3. View Logs

```bash
# Real-time logs
fly logs -a hotdash-agent-service

# Last 100 lines
fly logs -a hotdash-agent-service --lines 100
```

### 4. Test Webhook Endpoint

```bash
curl -X POST https://hotdash-agent-service.fly.dev/webhook/chatwoot \
  -H "Content-Type: application/json" \
  -d '{"event":"message_created","data":{"conversation":{"id":123}}}'
```

## Monitoring

### View Metrics

```bash
fly dashboard -a hotdash-agent-service
```

### SSH into Machine

```bash
fly ssh console -a hotdash-agent-service
```

### Check Resource Usage

```bash
fly status -a hotdash-agent-service --all
```

## Scaling

### Scale Memory

```bash
# Increase to 1GB
fly scale memory 1024 -a hotdash-agent-service

# Decrease to 512MB
fly scale memory 512 -a hotdash-agent-service
```

### Scale CPU

```bash
# Increase to 2 CPUs
fly scale vm shared-cpu-2x -a hotdash-agent-service

# Back to 1 CPU
fly scale vm shared-cpu-1x -a hotdash-agent-service
```

### Auto-Scaling

Auto-scaling is configured in `fly.toml`:
```toml
[http_service.concurrency]
  type = "requests"
  hard_limit = 250
  soft_limit = 200

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
```

## Rollback

### List Releases

```bash
fly releases -a hotdash-agent-service
```

### Rollback to Previous Version

```bash
fly releases rollback <version> -a hotdash-agent-service
```

### Rollback to Specific Version

```bash
fly releases rollback v42 -a hotdash-agent-service
```

## Troubleshooting

### Build Failures

1. **Check Dockerfile:**
   ```bash
   docker build -f apps/agent-service/Dockerfile .
   ```

2. **Check TypeScript compilation:**
   ```bash
   cd apps/agent-service
   npm run build
   ```

3. **Check dependencies:**
   ```bash
   cd apps/agent-service
   npm ci
   ```

### Runtime Errors

1. **Check logs:**
   ```bash
   fly logs -a hotdash-agent-service --lines 500
   ```

2. **Check environment variables:**
   ```bash
   fly ssh console -a hotdash-agent-service
   env | grep -E "OPENAI|CHATWOOT|SHOPIFY"
   ```

3. **Restart app:**
   ```bash
   fly apps restart hotdash-agent-service
   ```

### Health Check Failures

1. **Check health endpoint locally:**
   ```bash
   cd apps/agent-service
   npm start
   curl http://localhost:8787/health
   ```

2. **Check Fly.io health checks:**
   ```bash
   fly checks list -a hotdash-agent-service
   ```

3. **Update health check configuration in fly.toml**

## Configuration Files

### fly.toml

Location: `apps/agent-service/fly.toml`

Key settings:
- App name: `hotdash-agent-service`
- Region: `iad`
- Port: `8787`
- Health check: `/health`
- Auto-scaling: Enabled

### Dockerfile

Location: `apps/agent-service/Dockerfile`

Multi-stage build:
1. Build stage: Compile TypeScript
2. Production stage: Run compiled JavaScript

## Environment Variables

### Required

- `OPENAI_API_KEY` - OpenAI API key
- `CHATWOOT_BASE_URL` - Chatwoot instance URL
- `CHATWOOT_API_TOKEN` - Chatwoot API token
- `CHATWOOT_ACCOUNT_ID` - Chatwoot account ID
- `SHOPIFY_STORE_DOMAIN` - Shopify store domain
- `SHOPIFY_ADMIN_TOKEN` - Shopify Admin API token

### Optional

- `SLACK_WEBHOOK_URL` - Slack webhook for notifications
- `PG_URL` - PostgreSQL connection string
- `LLAMAINDEX_MCP_URL` - LlamaIndex MCP server URL
- `DEBUG` - Enable debug logging

## Security

### Secrets Management

- ✅ All secrets stored in Fly.io secrets
- ✅ No secrets in code or configuration files
- ✅ Secrets encrypted at rest
- ✅ Secrets only accessible to app instances

### HTTPS

- ✅ Automatic HTTPS via Fly.io
- ✅ TLS certificates auto-renewed
- ✅ HTTP redirects to HTTPS

### Access Control

- ✅ Webhook endpoints validate signatures (TODO)
- ✅ HITL approval gates for sensitive actions
- ✅ No public admin endpoints

## Performance Targets

- Health check response: < 100ms
- Handoff decision latency: < 100ms
- Webhook processing: < 3s
- Memory usage: < 400MB
- CPU usage: < 80%

## Support

### Logs

```bash
fly logs -a hotdash-agent-service
```

### Metrics

```bash
fly dashboard -a hotdash-agent-service
```

### Status Page

https://fly.io/dashboard/personal/hotdash-agent-service

---

**Last Updated:** 2025-10-24  
**Maintained by:** ai-customer agent

