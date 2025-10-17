# Google Analytics MCP - Testing Guide

**Status**: ✅ Server deployed and responding
**Date**: October 11, 2025

## 🎯 Server Verification Complete

The Google Analytics MCP server is successfully:

- ✅ Deployed on Fly.io at `https://hotdash-analytics-mcp.fly.dev`
- ✅ Responding to health checks
- ✅ Initializing correctly (Google Analytics Server v1.17.0)
- ✅ Authenticated with Bearer token
- ✅ Service account added to Google Analytics (Marketer role)

## 🛠️ Available Tools

The server provides these tools for querying Google Analytics:

### Account & Property Information

- `get_account_summaries` - List all your GA accounts and properties
- `get_property_details` - Get details about a specific property
- `list_google_ads_links` - List Google Ads connections

### Reporting

- `run_report` - Run custom GA reports
- `run_realtime_report` - Get realtime analytics data
- `get_custom_dimensions_and_metrics` - List custom dimensions/metrics for a property

## 🧪 How to Test (In Cursor)

### Step 1: Restart Cursor

**IMPORTANT**: You must restart Cursor to load the new MCP configuration from `.mcp.json`.

After restarting, the `google-analytics` MCP server will be available.

### Step 2: Verify MCP Connection

In Cursor, type:

```
/mcp
```

You should see `google-analytics` listed among your available MCP servers.

### Step 3: Test Basic Query

Try this prompt:

```
Using the google-analytics MCP server, get my account summaries and list all my Google Analytics properties
```

### Step 4: Get Property Details

Once you see your properties, try:

```
Using google-analytics MCP, get details about property [PROPERTY_ID]
```

### Step 5: Run a Report

Try running a simple report:

```
Using google-analytics MCP, run a report for [PROPERTY_NAME] showing active users in the last 7 days
```

## 📋 Sample Prompts to Try

1. **List all properties**:

   ```
   What are all my Google Analytics properties?
   ```

2. **Get property details**:

   ```
   Give me details about my Google Analytics property with 'hotrodan' in the name
   ```

3. **Popular events**:

   ```
   What are the most popular events in my Google Analytics property in the last 30 days?
   ```

4. **User analysis**:

   ```
   Were most of my users in the last month logged in?
   ```

5. **Custom dimensions**:

   ```
   What are the custom dimensions and custom metrics in my property?
   ```

6. **Realtime data**:
   ```
   Show me realtime active users on my site right now
   ```

## 🔍 Troubleshooting

### If MCP Server Doesn't Appear

1. **Verify .mcp.json**:

   ```bash
   cat /home/justin/HotDash/hot-dash/.mcp.json | grep -A5 "google-analytics"
   ```

2. **Check server status**:

   ```bash
   ~/.fly/bin/flyctl status --app hotdash-analytics-mcp
   ```

3. **View server logs**:
   ```bash
   ~/.fly/bin/flyctl logs --app hotdash-analytics-mcp --no-tail
   ```

### If Queries Fail

1. **Check GA access**: Verify the service account (`analytics-mcp-fly@hotrodan-seo-reports.iam.gserviceaccount.com`) has access to your GA property

2. **Check property ID**: Make sure you're using the correct GA4 property ID

3. **View error logs**: Check Fly logs for error messages:
   ```bash
   ~/.fly/bin/flyctl logs --app hotdash-analytics-mcp --no-tail | tail -50
   ```

## ⚙️ Configuration Details

### Service Account

- **Email**: `analytics-mcp-fly@hotrodan-seo-reports.iam.gserviceaccount.com`
- **Project**: `hotrodan-seo-reports`
- **GA Role**: Marketer (full read/write capabilities)

### MCP Configuration

**File**: `/home/justin/HotDash/hot-dash/.mcp.json`

```json
{
  "google-analytics": {
    "type": "http",
    "url": "https://hotdash-analytics-mcp.fly.dev/mcp",
    "headers": {
      "Authorization": "Bearer 0c03d0464df8bfca7aff619e5f16a0976ad01ead16af8da26dc42a0eb5448af2"
    }
  }
}
```

### Server Details

- **URL**: https://hotdash-analytics-mcp.fly.dev
- **Health**: https://hotdash-analytics-mcp.fly.dev/health
- **Region**: ord (Chicago)
- **Auto-start/stop**: Enabled (cost optimization)
- **Expected cost**: $0-2/month

## 📚 Next Steps

1. **Restart Cursor** to load the MCP configuration
2. **Test basic queries** using the sample prompts above
3. **Explore the data** - ask complex analytical questions
4. **Build dashboards** - use the data in your applications

## 📖 Additional Resources

- **Main Documentation**: `~/HotDash/hot-dash/GoogleMCP.md`
- **Completion Summary**: `~/HotDash/hot-dash/GoogleMCP-COMPLETION-SUMMARY.md`
- **Google Analytics MCP GitHub**: https://github.com/googleanalytics/google-analytics-mcp
- **Fly App Dashboard**: https://fly.io/apps/hotdash-analytics-mcp

---

**Ready to test!** Restart Cursor and try the sample prompts above. 🚀
