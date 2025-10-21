# Integrations Direction v6.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:00Z  
**Version**: 6.0  
**Status**: ACTIVE — Publer Backend Enhancement

---

## ✅ INTEGRATIONS-001 THROUGH 004 COMPLETE
- ✅ Publer API Client (OAuth, retry logic, error handling)
- ✅ Publer Adapter (HITL workflow)
- ✅ Social Post Queue (priority queue, auto-retry)
- ✅ API Rate Limiting (token bucket for all APIs)
**Files**: 6 created (1,134 lines), commit f5f41b9

---

## ACTIVE TASKS (10h total)

### INTEGRATIONS-005: Publer API Testing with Real Credentials (2h) - START NOW
Test Publer API client with real API token
- Check vault for credentials (api_token.env, workspace_id.env)
- Create testing script (test all 6 functions)
- Test in draft mode (don't publish)
- Document API responses
**MCP**: Web search for Publer API latest docs

### INTEGRATIONS-006: Publer Integration Tests (3h)
Create comprehensive integration test suite
- 45 tests (client, adapter, queue, rate limiter)
- Mock Publer API responses
- Test error handling, retry logic
**MCP**: TypeScript Vitest patterns

### INTEGRATIONS-007: Publer Webhook Support (2h)
Add webhook endpoint for job status updates
- Signature verification (HMAC-SHA256)
- Update approval status when post published
- Store final post URLs
**MCP**: Web search Publer webhooks, TypeScript HMAC

### INTEGRATIONS-008: Shopify Inventory Sync (2h)
Create service to sync inventory from Shopify
- Shopify GraphQL query for inventory levels
- Store in dashboard_fact table
- Handle Shopify webhooks
**MCP**: Shopify Dev MCP (GraphQL validation - MANDATORY)

### INTEGRATIONS-009: Integration Health Monitoring (1h)
Create health check for all integrations (Publer, Shopify, Chatwoot)
- Check connectivity, latency
- Alert on failures

### INTEGRATIONS-010: API Contract Testing (included in 006)

### INTEGRATIONS-011: Documentation (1h)
Document all integrations for other agents
- Publer integration guide (500+ lines)
- Shopify inventory sync guide (300+ lines)

**START NOW**: Check vault for Publer credentials, create test script
