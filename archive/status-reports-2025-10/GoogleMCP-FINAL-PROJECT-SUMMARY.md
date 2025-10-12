# Google Analytics MCP - Final Project Summary

**Date**: October 11, 2025  
**Project**: Google Analytics Integration for HotDash  
**Status**: ✅ Cursor Integration Complete | 🔄 App Integration Decision Pending

---

## Executive Summary

We successfully integrated Google Analytics with Cursor IDE using the official MCP (Model Context Protocol) server. The integration allows AI assistants to query Google Analytics data directly. For the main HotDash application, we need to decide on the best integration approach.

---

## What We Accomplished

### ✅ 1. Cursor IDE Integration (COMPLETE)

**Status**: **Working perfectly**

**Configuration**:
- Running `analytics-mcp` locally via `pipx` (official Google approach)
- Direct stdio communication (no HTTP overhead)
- Using service account credentials from: `vault/occ/google/analytics-service-account.json`

**Location**: `/home/justin/.cursor/mcp.json`

```json
{
  "google-analytics": {
    "command": "pipx",
    "args": ["run", "analytics-mcp"],
    "env": {
      "GOOGLE_APPLICATION_CREDENTIALS": "/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json",
      "GOOGLE_PROJECT_ID": "hotrodan-seo-reports"
    }
  }
}
```

**Available Tools in Cursor**:
1. `get_account_summaries` - List all GA accounts and properties
2. `get_property_details` - Get property configuration details
3. `list_google_ads_links` - View Google Ads connections
4. `get_custom_dimensions_and_metrics` - List custom dimensions/metrics
5. `run_report` - Run custom analytics reports with date ranges, filters, etc.
6. `run_realtime_report` - Get real-time analytics data

**Example Usage**:
```
Ask Cursor: "Using google-analytics MCP, show me the most popular pages in the last 7 days"
```

### ✅ 2. Google Cloud Service Account Setup (COMPLETE)

**Service Account**: `analytics-mcp-fly@hotrodan-seo-reports.iam.gserviceaccount.com`  
**Project**: `hotrodan-seo-reports`  
**GA Role**: Marketer (full read/write access)  
**Credentials**: Stored securely in `vault/occ/google/analytics-service-account.json`

---

## Journey: What We Tried

### Approach 1: HTTP MCP Server on Fly.io (ATTEMPTED - NOT RECOMMENDED)

We attempted to create an HTTP-based MCP server for remote access from the HotDash app.

**What We Built**:
- Custom HTTP/SSE wrapper for `analytics-mcp`
- Deployed to Fly.io: `hotdash-analytics-mcp.fly.dev`
- Session management for stateful MCP protocol
- Bearer token authentication

**Issues Encountered**:
1. **Out of Memory (OOM)** - 256MB → 512MB required for concurrent sessions
2. **Connection timeouts** - 30-second timeouts on long-running queries
3. **Protocol complexity** - MCP over HTTP/SSE not standard, required custom session management
4. **Cursor incompatibility** - Cursor's MCP client expects stdio, not HTTP
5. **Cost** - ~$4-6/month for 512MB machine (even with auto-stop)

**Current Status**: 
- Deployed and running (Version 8)
- Health checks passing
- **NOT being used** (Cursor uses local stdio instead)
- **Costs money but provides no value currently**

**Files Created**:
- `fly-apps/analytics-mcp/mcp-http-wrapper.py` - Custom HTTP wrapper
- `fly-apps/analytics-mcp/fly.toml` - Fly.io configuration
- `fly-apps/analytics-mcp/Dockerfile` - Container configuration

### Approach 2: Local Stdio Server (SUCCESS - OFFICIAL APPROACH)

Following the [official Google Analytics MCP documentation](https://github.com/googleanalytics/google-analytics-mcp), we configured the local stdio server.

**Why It Works**:
- ✅ Simple configuration (just 3 lines)
- ✅ No HTTP overhead or complexity
- ✅ Official Google-supported approach
- ✅ No hosting costs
- ✅ Cursor natively supports this
- ✅ Fast and reliable

**Result**: **Working perfectly in Cursor**

---

## Options for HotDash App Integration

Now that Cursor is working, here are your options for integrating Google Analytics into your HotDash application on Fly.io:

### Option 1: Direct Google Analytics API Calls (RECOMMENDED)

**Description**: Use the official Google Analytics Python client library directly in your app.

**Pros**:
- ✅ **Simplest** - Standard Google client library
- ✅ **Most reliable** - Battle-tested, well-documented
- ✅ **Best performance** - No MCP overhead
- ✅ **Most control** - Direct API access, all features available
- ✅ **No additional infrastructure** - Just import and use
- ✅ **Lower memory usage** - No subprocess overhead

**Cons**:
- ⚠️ Need to write code for each query type (not dynamic like MCP)
- ⚠️ No tool discovery (but your app knows what it needs)

**Implementation Example**:

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)

# Initialize client (uses GOOGLE_APPLICATION_CREDENTIALS env var)
client = BetaAnalyticsDataClient()

# Run a report
request = RunReportRequest(
    property=f"properties/{property_id}",
    dimensions=[Dimension(name="pagePath")],
    metrics=[Metric(name="screenPageViews")],
    date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
)

response = client.run_report(request)
# Process response...
```

**Installation**:
```bash
pip install google-analytics-data
```

**Documentation**: https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries

**Cost**: $0 (no additional infrastructure)

**Estimated Implementation Time**: 2-4 hours

---

### Option 2: Embed analytics-mcp as Subprocess (MODERATE COMPLEXITY)

**Description**: Run `analytics-mcp` as a subprocess within your Fly.io app container, similar to how Cursor does it.

**Pros**:
- ✅ **Dynamic tool discovery** - Can adapt to new GA features automatically
- ✅ **Consistent with Cursor** - Same tools available in both environments
- ✅ **Google-maintained** - Benefits from Google's updates
- ✅ **No external dependencies** - Self-contained in your app

**Cons**:
- ⚠️ **More complex** - Need to manage subprocess lifecycle
- ⚠️ **Higher memory usage** - ~60-80MB per subprocess
- ⚠️ **Slower** - Subprocess startup overhead (1-2 seconds per query)
- ⚠️ **Error handling complexity** - Need to handle subprocess crashes

**Implementation Example**:

```python
import asyncio
import json

class AnalyticsMCPClient:
    def __init__(self):
        self.process = None
    
    async def start(self):
        self.process = await asyncio.create_subprocess_exec(
            "analytics-mcp",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            env={
                "GOOGLE_APPLICATION_CREDENTIALS": "/app/credentials.json",
                "GOOGLE_PROJECT_ID": "hotrodan-seo-reports"
            }
        )
        # Initialize MCP connection...
    
    async def query(self, method, params):
        request = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
        self.process.stdin.write(json.dumps(request).encode() + b'\n')
        await self.process.stdin.drain()
        
        response = await self.process.stdout.readline()
        return json.loads(response)
```

**Installation** (in Dockerfile):
```dockerfile
RUN pip install pipx && pipx install analytics-mcp
```

**Cost**: $0 (runs in existing app container)

**Memory Impact**: +60-80MB per concurrent MCP session

**Estimated Implementation Time**: 4-8 hours

---

### Option 3: Keep HTTP MCP Server (NOT RECOMMENDED)

**Description**: Continue using the Fly.io HTTP wrapper we built.

**Pros**:
- ✅ Already deployed and working (technically)
- ✅ Centralized - one server for all apps

**Cons**:
- ❌ **Ongoing costs** - $4-6/month
- ❌ **Complex maintenance** - Custom code to maintain
- ❌ **Performance issues** - Timeouts, OOM errors
- ❌ **Not standard** - MCP over HTTP is non-standard
- ❌ **Reliability concerns** - Multiple issues encountered
- ❌ **Overkill** - Most apps don't need MCP's dynamic discovery

**Current Status**: 
- Deployed but not being used
- Would need significant hardening for production use
- Costs money with no current benefit

**Cost**: ~$4-6/month (with 512MB machine)

**Recommendation**: **Destroy this server** unless you have specific remote MCP needs

---

## Cost Analysis

| Option | Setup Cost | Monthly Cost | Maintenance | Reliability |
|--------|-----------|--------------|-------------|-------------|
| **Direct API** (Recommended) | 2-4 hours dev time | $0 | Minimal | Excellent |
| **Subprocess MCP** | 4-8 hours dev time | $0 | Low | Good |
| **HTTP MCP Server** | Already built | **$4-6/month** | High | Fair |

---

## Technical Specifications

### Service Account Details
- **Email**: `analytics-mcp-fly@hotrodan-seo-reports.iam.gserviceaccount.com`
- **Project**: `hotrodan-seo-reports`
- **Credentials Path**: `/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json`
- **Permissions**: 600 (owner read/write only)
- **Google Analytics Role**: Marketer (can read and modify GA properties)

### APIs Enabled
- ✅ Google Analytics Admin API
- ✅ Google Analytics Data API

### Fly.io Server (If Keeping It)
- **App Name**: `hotdash-analytics-mcp`
- **URL**: `https://hotdash-analytics-mcp.fly.dev/mcp`
- **Region**: ord (Chicago)
- **Memory**: 512MB
- **Auto-stop**: Enabled (cost optimization)
- **Version**: 8 (deployment-01K7ADJ29FTQP4Z5CNE14ADCWY)

---

## Recommendations

### For Cursor/AI Development: ✅ DONE
- **Keep current setup** - Local stdio server works perfectly
- **No changes needed** - Configuration is optimal

### For HotDash Application: 🎯 DECISION REQUIRED

**Our Strong Recommendation: Option 1 - Direct API Calls**

**Why?**
1. **Simplicity** - Less code, fewer dependencies, easier to debug
2. **Performance** - Direct API calls are fastest
3. **Reliability** - Google's official client library is battle-tested
4. **Cost** - $0 additional infrastructure
5. **Maintenance** - Minimal ongoing work

**When would you choose Option 2 (Subprocess MCP)?**
- If you need dynamic tool discovery
- If you want exact parity with Cursor's capabilities
- If you're building an AI agent that needs to discover tools at runtime

**When would you choose Option 3 (HTTP Server)?**
- If you need to access GA from multiple applications
- If you need remote access from services that can't run subprocesses
- If you need centralized rate limiting/quota management

**For most use cases (including HotDash), Option 1 is the clear winner.**

### For the HTTP MCP Server: 💰 COST SAVING OPPORTUNITY

**Recommendation: Destroy it**

**Why?**
- Currently costing $4-6/month
- Not being used (Cursor uses local version)
- HotDash app should use direct API or subprocess
- Complex to maintain
- Has had reliability issues

**Command to destroy**:
```bash
~/.fly/bin/flyctl apps destroy hotdash-analytics-mcp
```

**When to keep it**:
- If you decide on Option 3 for your app
- If you have other services that need remote MCP access
- If you want to experiment with remote MCP architecture

**Cost savings**: ~$50-70/year

---

## Next Steps

### Immediate (No Action Needed)
- ✅ Cursor integration working
- ✅ Service account configured
- ✅ Credentials secured

### Decision Required (Project Manager)

**1. Choose integration approach for HotDash app:**
- [ ] **Option 1**: Direct Google Analytics API (Recommended)
- [ ] **Option 2**: Subprocess MCP
- [ ] **Option 3**: HTTP MCP Server

**2. Decide on HTTP MCP Server:**
- [ ] **Destroy** (Recommended - saves $4-6/month)
- [ ] **Keep** (if choosing Option 3 or have other use cases)

### Implementation (After Decision)

If **Option 1** chosen (Direct API):
1. Add `google-analytics-data` to requirements.txt
2. Implement analytics queries in your app code
3. Test with service account credentials
4. Deploy to Fly.io
5. Destroy HTTP MCP server (if decided)

**Estimated time**: 1 day

If **Option 2** chosen (Subprocess):
1. Update Dockerfile to install `pipx` and `analytics-mcp`
2. Create MCP client wrapper class
3. Implement query methods
4. Test subprocess lifecycle management
5. Deploy to Fly.io
6. Destroy HTTP MCP server (if decided)

**Estimated time**: 2-3 days

If **Option 3** chosen (HTTP Server):
1. Harden error handling in HTTP wrapper
2. Add rate limiting and retry logic
3. Implement health monitoring
4. Add logging/alerting for OOM events
5. Document API endpoints for app team
6. Keep server running

**Estimated time**: 3-5 days + ongoing maintenance

---

## Files Reference

### Active/In-Use
- `/home/justin/.cursor/mcp.json` - Cursor MCP configuration (ACTIVE)
- `/home/justin/HotDash/hot-dash/.mcp.json` - Project MCP config (ACTIVE)
- `/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json` - Credentials (ACTIVE)

### Documentation
- `/home/justin/HotDash/hot-dash/GoogleMCP-FINAL-PROJECT-SUMMARY.md` - This document
- `/home/justin/HotDash/hot-dash/GoogleMCP.md` - Original deployment docs
- `/home/justin/HotDash/hot-dash/GoogleMCP-TEST-GUIDE.md` - Testing guide
- `/home/justin/HotDash/hot-dash/GoogleMCP-FIX-SUMMARY.md` - Concurrency fix notes
- `/home/justin/HotDash/hot-dash/GoogleMCP-MEMORY-FIX.md` - Memory issue resolution
- `/home/justin/HotDash/hot-dash/GoogleMCP-SESSION-FIX.md` - Session management details

### Fly.io Deployment (Optional - May Destroy)
- `/home/justin/HotDash/hot-dash/fly-apps/analytics-mcp/` - HTTP server code
  - `mcp-http-wrapper.py` - Custom HTTP/SSE wrapper
  - `fly.toml` - Fly.io configuration
  - `Dockerfile` - Container definition
  - `README.md` - Deployment instructions
  - `deploy.sh` - Automated deployment script

---

## Support Resources

### Google Analytics MCP
- **Repository**: https://github.com/googleanalytics/google-analytics-mcp
- **Discord**: #🤖-analytics-mcp channel

### Google Analytics Data API
- **Documentation**: https://developers.google.com/analytics/devguides/reporting/data/v1
- **Python Client**: https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries
- **API Schema**: https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema

### MCP Protocol
- **Official Site**: https://modelcontextprotocol.io
- **Documentation**: https://modelcontextprotocol.io/docs

---

## Questions for Decision Making

1. **Does HotDash need dynamic tool discovery, or do you know what GA queries you need?**
   - Known queries → Option 1 (Direct API)
   - Dynamic discovery → Option 2 (Subprocess)

2. **Do multiple applications/services need to access GA data?**
   - Single app → Option 1 or 2
   - Multiple apps → Consider Option 3 (but still evaluate direct API for each)

3. **Is $4-6/month for centralized access worth the convenience?**
   - No → Option 1 or 2, destroy HTTP server
   - Yes → Option 3, improve HTTP server

4. **What's your team's Python expertise?**
   - Strong → Option 1 (easiest)
   - Moderate → Option 1 or 2
   - Limited → Option 1 (most documented)

5. **How critical is performance?**
   - Very critical → Option 1 (fastest)
   - Moderate → Any option works
   - Not critical → Any option works

---

## Conclusion

We successfully completed the Cursor integration using the official Google Analytics MCP approach. The integration is working perfectly for AI-assisted development.

For the HotDash application, we recommend **Option 1 (Direct Google Analytics API)** because it's simpler, faster, more reliable, and costs nothing additional.

The HTTP MCP server on Fly.io was a valuable learning experience but is not necessary for the current architecture. We recommend destroying it to save costs unless you identify a specific remote MCP use case.

**Total Project Status**: ✅ Cursor Complete | 🎯 App Integration Decision Pending

---

**Prepared by**: AI Assistant (Claude)  
**Date**: October 11, 2025  
**Next Review**: After integration approach is decided

