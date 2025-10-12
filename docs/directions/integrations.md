---
epoch: 2025.10.E1
doc: docs/directions/integrations.md
owner: manager
last_reviewed: 2025-10-12
---

# Integrations — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

### 1️⃣ North Star Obsession
**Memory Lock**: "North Star = Operator value TODAY"
### 2️⃣ MCP Tools Mandatory
**Memory Lock**: "MCPs always, memory never"
### 3️⃣ Feedback Process Sacred
ALL work logged in `feedback/integrations.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"
### 4️⃣ No New Files Ever
**Memory Lock**: "Update existing, never create new"
### 5️⃣ Immediate Blocker Escalation
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/integrations.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.

**Memory Lock**: "Blocker found = immediate flag"
### 6️⃣ Manager-Only Direction
**Memory Lock**: "Manager directs, I execute"

---

## Mission
Ensure Hot Rod AN integrations work: Shopify, Chatwoot, Google Analytics, MCPs.

## ⚡ START HERE NOW (Updated: 2025-10-13 13:03 UTC by Manager)

**Your immediate priority**: Monitor MCP health during launch

**Current status**: All integrations validated yesterday, monitoring NOW

**Your action**:
```bash
cd ~/HotDash/hot-dash

# Monitor MCP servers (every 30 min today)
# 1. Shopify MCP - health check
# 2. Supabase MCP - health check  
# 3. Context7 MCP - health check
# 4. GitHub MCP - health check

# If any MCP down, escalate IMMEDIATELY to Manager
# Evidence: Hourly MCP health report in feedback/integrations.md
```

**Expected outcome**: All MCPs healthy, no downtime

**Frequency**: Check every 30 minutes TODAY

**Manager checking**: Hourly

---

## 🎯 ACTIVE TASKS

### Task 1 - Monitor MCP Health (ASSIGNED ABOVE)

### Task 2 - Hot Rod AN Integration Testing
**What**: Test Shopify data for Hot Rod AN store
**Timeline**: 2-3 hours

### Task 3 - Webhook Reliability Testing
**What**: Test Chatwoot webhook under load
**Timeline**: 2-3 hours

### Task 4 - Google Analytics Integration
**What**: Verify GA data flowing correctly
**Timeline**: 2 hours

### Task 5 - MCP Health Monitoring
**What**: Monitor all MCP servers
**Timeline**: 1-2 hours

### Task 6 - API Rate Limiting
**What**: Test rate limits don't break functionality
**Timeline**: 2 hours

### Task 7 - Error Recovery Testing
**What**: Test API failure scenarios
**Timeline**: 2-3 hours

### Task 8 - Data Sync Verification
**What**: Verify data stays in sync across systems
**Timeline**: 2 hours

### Task 9 - Shopify Webhook Testing
**What**: Test Shopify webhooks for order/inventory updates
**Timeline**: 2-3 hours

### Task 10 - Integration Performance
**What**: Measure integration latencies
**Timeline**: 2 hours

### Task 11 - Retry Logic Testing
**What**: Test retry mechanisms for failed API calls
**Timeline**: 2 hours

### Task 12 - Authentication Testing
**What**: Test OAuth flows, token refresh
**Timeline**: 2 hours

### Task 13 - Integration Documentation
**What**: Document all integration points
**Timeline**: 2-3 hours

### Task 14 - Third-Party Service Monitoring
**What**: Monitor Shopify/Chatwoot/GA uptime
**Timeline**: 1-2 hours

### Task 15 - API Contract Validation
**What**: Verify APIs match expected contracts
**Timeline**: 2 hours

### Task 16 - Integration Error Logging
**What**: Ensure all integration errors logged
**Timeline**: 1-2 hours

### Task 17 - Webhook Security
**What**: Verify HMAC signatures working
**Timeline**: 1-2 hours

### Task 18 - Hot Rod AN Data Validation
**What**: Verify Hot Rod AN data correct in all systems
**Timeline**: 2-3 hours

### Task 19 - Integration Runbook
**What**: Create troubleshooting runbook
**Timeline**: 2 hours

### Task 20 - Launch Integration Monitoring
**What**: Monitor integrations during launch
**Timeline**: On-call Oct 13-15

## Git Workflow
**Branch**: `integrations/work`

**Status**: 🔴 ACTIVE


---

## 🚀 DEEP PRODUCTION TASK LIST (Aligned to North Star - Oct 12 Update)

**North Star Goal**: Own all external service integrations that power the 5 actionable tiles with reliable, real-time data.

**Integrations Mission**: Maintain Shopify, Chatwoot, Google Analytics integrations; ensure MCP servers healthy.

### 🎯 P0 - PRODUCTION INTEGRATION HEALTH (Week 1)

**Task 1: MCP Server Monitoring** (3 hours)
- Monitor all 5 MCP servers (Shopify, Context7, GitHub, Supabase, Fly)
- Track response times, error rates
- Alert on downtime or degradation
- **Evidence**: MCP health dashboard
- **North Star**: Reliable developer tools

**Task 2: Shopify Integration Validation** (3 hours)
- Validate all GraphQL queries with Shopify MCP
- Test rate limiting and error handling
- Monitor API usage vs limits
- **Evidence**: Shopify integration validated
- **North Star**: Reliable Shopify data for all tiles

**Task 3: Google Analytics Integration** (2 hours)
- Test Direct API connections
- Verify service account permissions
- Monitor query performance
- **Evidence**: GA integration healthy
- **North Star**: Reliable analytics for Sales/SEO tiles

---

### 🔧 P1 - INTEGRATION RELIABILITY (Week 1-2)

**Task 4-8: Per-Tile Integration Support** (15 hours total, 3h each)
- CX Pulse: Chatwoot API reliability
- Sales Pulse: Shopify Orders + GA Conversions
- SEO Pulse: GA Organic + Shopify Products
- Inventory Watch: Shopify Inventory API
- Fulfillment Flow: Shopify Fulfillments API
- **Evidence**: Each tile's integrations validated
- **North Star**: Each tile has reliable data source

---

**Total Integrations Tasks**: 10 production-aligned tasks (4-5 weeks work)  
**Evidence Required**: Logged in `feedback/integrations.md` with health checks, API tests

