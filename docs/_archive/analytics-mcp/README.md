# Google Analytics MCP Server on Fly.io

Deploy Google Analytics MCP server as a remote service on Fly.io for use across multiple development environments.

## Prerequisites

- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) installed and authenticated
- Google Cloud Project with Analytics Admin API and Data API enabled
- Google Analytics account with service account access
- Service account JSON key file

## Setup

### 1. Enable Google Cloud APIs

```bash
gcloud services enable analyticsadmin.googleapis.com
gcloud services enable analyticsdata.googleapis.com
```

### 2. Create Service Account

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# Create service account
gcloud iam service-accounts create analytics-mcp-fly \
  --display-name="Analytics MCP for Fly.io" \
  --project=$GCP_PROJECT_ID

# Grant Analytics Viewer role
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:analytics-mcp-fly@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/viewer"

# Create and download key
gcloud iam service-accounts keys create ~/analytics-mcp-key.json \
  --iam-account=analytics-mcp-fly@$GCP_PROJECT_ID.iam.gserviceaccount.com
```

### 3. Grant Google Analytics Access

1. Go to [Google Analytics Admin](https://analytics.google.com/)
2. Navigate to Admin → Account/Property Access Management
3. Add user: `analytics-mcp-fly@YOUR_PROJECT_ID.iam.gserviceaccount.com`
4. Grant "Viewer" role

## Deployment

### 1. Create Fly.io App

```bash
cd fly-apps/analytics-mcp
fly apps create hotdash-analytics-mcp --org personal
```

### 2. Configure Secrets

```bash
# Set Google Cloud Project ID
fly secrets set GOOGLE_PROJECT_ID="your-project-id" -a hotdash-analytics-mcp

# Set service account credentials (base64 encoded)
fly secrets set GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat ~/analytics-mcp-key.json | base64 -w 0)" -a hotdash-analytics-mcp

# Optional: Set authentication token for MCP access
fly secrets set MCP_AUTH_TOKEN="$(openssl rand -hex 32)" -a hotdash-analytics-mcp
```

### 3. Deploy

```bash
fly deploy -a hotdash-analytics-mcp
```

### 4. Verify Deployment

```bash
# Check app status
fly status -a hotdash-analytics-mcp

# Check logs
fly logs -a hotdash-analytics-mcp

# Test health check
curl https://hotdash-analytics-mcp.fly.dev/health
```

## Local MCP Client Configuration

### For Claude Code / Cursor

Add to your `.mcp.json` or global MCP config:

```json
{
  "mcpServers": {
    "google-analytics": {
      "type": "http",
      "url": "https://hotdash-analytics-mcp.fly.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_AUTH_TOKEN"
      }
    }
  }
}
```

### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/client-http"],
      "env": {
        "MCP_SERVER_URL": "https://hotdash-analytics-mcp.fly.dev/mcp",
        "MCP_AUTH_TOKEN": "YOUR_MCP_AUTH_TOKEN"
      }
    }
  }
}
```

## Available MCP Tools

Once connected, you'll have access to:

- `list_accounts`: List all Google Analytics accounts
- `list_properties`: List properties for an account
- `get_property`: Get detailed property information
- `run_report`: Run analytics reports with metrics and dimensions
- `run_realtime_report`: Get real-time analytics data

## Troubleshooting

### Check Server Status
```bash
fly status -a hotdash-analytics-mcp
fly logs -a hotdash-analytics-mcp
```

### Test Authentication
```bash
# Without auth token
curl https://hotdash-analytics-mcp.fly.dev/health

# With auth token (if configured)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://hotdash-analytics-mcp.fly.dev/mcp
```

### View Secrets
```bash
fly secrets list -a hotdash-analytics-mcp
```

### Restart App
```bash
fly apps restart hotdash-analytics-mcp
```

## Cost Optimization

The app is configured with:
- `auto_stop_machines = "stop"` - Stops when idle
- `auto_start_machines = true` - Starts on requests
- `min_machines_running = 0` - No always-on cost
- `memory = "256mb"` - Minimal resource usage

Expected cost: **~$0-2/month** (only runs when queried)

## Security Notes

- Service account has read-only Analytics access
- MCP_AUTH_TOKEN provides additional security layer
- All traffic uses HTTPS
- Credentials stored as Fly.io secrets (encrypted at rest)

## Maintenance

### Update Service Account Key
```bash
# Generate new key
gcloud iam service-accounts keys create ~/analytics-mcp-key-new.json \
  --iam-account=analytics-mcp-fly@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Update secret
fly secrets set GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat ~/analytics-mcp-key-new.json | base64 -w 0)" -a hotdash-analytics-mcp

# Delete old keys
gcloud iam service-accounts keys list \
  --iam-account=analytics-mcp-fly@YOUR_PROJECT_ID.iam.gserviceaccount.com
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=analytics-mcp-fly@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Rotate Auth Token
```bash
fly secrets set MCP_AUTH_TOKEN="$(openssl rand -hex 32)" -a hotdash-analytics-mcp
# Update clients with new token
```

### Upgrade Analytics MCP Version
```bash
# Redeploy with latest version
fly deploy -a hotdash-analytics-mcp
```
