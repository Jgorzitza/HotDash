# Agent SDK Deployment Status Report

**Date**: 2025-10-12T04:21:00Z  
**Operator**: Reliability Agent  
**Status**: PARTIAL SUCCESS - 1 critical issue found  
**Direction**: Task 2 - Agent SDK Infrastructure Monitoring

## Executive Summary

Engineer successfully deployed both Agent SDK services to Fly.io. **LlamaIndex MCP is fully operational**, but **Agent Service has a critical startup error** that prevents it from running.

**Immediate Action Required**: Engineer must fix Zod schema validation error in agent-service.

---

## Service Status

### ✅ hotdash-llamaindex-mcp - OPERATIONAL

**Deployment Info**:
- **Status**: Healthy ✅
- **Deployed**: ~1h 41m ago (2025-10-12T02:38Z approx)
- **Region**: iad (Ashburn, VA)
- **Image**: hotdash-llamaindex-mcp:deployment-01K7B41NCC63QCXB576BX9VS92

**Resources**:
- **Machines**: 2
- **Memory**: 512MB per machine
- **vCPUs**: 1 per machine (shared)
- **State**: Stopped (auto-scaling active)

**Health Check Results**:
- **Endpoint**: https://hotdash-llamaindex-mcp.fly.dev/health
- **Status**: 200 OK ✅
- **Response Time**: 2.202s (cold start, within 10s target)
- **Service**: llamaindex-rag-mcp v1.0.0

**Available Tools**:
1. `query_support` - Query support knowledge base
2. `refresh_index` - Refresh RAG index
3. `insight_report` - Generate insight reports

**Metrics** (As of deployment):
```json
{
  "query_support": {"calls": 0, "errors": 0, "errorRate": "0%", "avgLatencyMs": 0, "p95LatencyMs": 0},
  "refresh_index": {"calls": 0, "errors": 0, "errorRate": "0%", "avgLatencyMs": 0, "p95LatencyMs": 0},
  "insight_report": {"calls": 0, "errors": 0, "errorRate": "0%", "avgLatencyMs": 0, "p95LatencyMs": 0}
}
```

**Auto-scaling**: ✅ WORKING
- Machines stop when idle
- Auto-start on request (2.2s cold start time, acceptable)

**Assessment**: Fully operational and ready for use ✅

---

### 🚨 hotdash-agent-service - CRITICAL STARTUP ERROR

**Deployment Info**:
- **Status**: NOT OPERATIONAL ❌
- **Deployed**: ~22m ago (2025-10-12T03:47Z approx)
- **Region**: ord (Chicago, IL)
- **Image**: hotdash-agent-service:deployment-01K7B8G8RRGPKV2WAT288JY78K

**Resources**:
- **Machines**: 1
- **Memory**: 1024MB
- **vCPUs**: 1 (shared)
- **State**: Stopped (crashes on startup)

**Health Check Results**:
- **Endpoint**: https://hotdash-agent-service.fly.dev/health
- **Status**: 502 Bad Gateway ❌
- **Response Time**: 42.058s (timeout waiting for service)
- **Issue**: Service crashes before health endpoint can respond

**Critical Error**:
```
Error: Zod field at `#/definitions/shopify_cancel_order/properties/reason` 
uses `.optional()` without `.nullable()` which is not supported by the API.

Reference: https://platform.openai.com/docs/guides/structured-outputs?api-mode=responses#all-fields-must-be-required
```

**Root Cause Analysis**:

**Issue**: OpenAI Structured Outputs API validation failure
- **Service**: Uses @openai/agents-core (OpenAI Agents SDK)
- **Error**: Zod schema incompatibility
- **Field**: `shopify_cancel_order.reason` 
- **Problem**: Uses `.optional()` instead of `.optional().nullable()`

**OpenAI Requirement**:
All optional fields in Structured Outputs must explicitly allow null values. Using `.optional()` alone is not sufficient.

**Incorrect**:
```typescript
{
  reason: z.string().optional()  // ❌ Not supported
}
```

**Correct**:
```typescript
{
  reason: z.string().optional().nullable()  // ✅ Supported
}
```

**Impact**:
- Service exits with code 1 on every startup attempt
- Cannot serve health checks or API requests
- Auto-scaling repeatedly tries to restart (crashes in ~1s)
- Agent approval queue functionality unavailable

**Required Fix**:
1. Locate Zod schema for `shopify_cancel_order` tool
2. Change `reason: z.string().optional()` to `reason: z.string().optional().nullable()`
3. Rebuild and redeploy agent-service
4. Verify health check passes

**File Location**: Likely in agent-service codebase tools/shopify/*.ts

---

## Performance Analysis

### LlamaIndex MCP

**Cold Start Performance**:
- **Time**: 2.202s
- **Target**: < 10s
- **Status**: ✅ Pass (78% under target)

**Recommendation**: Cold start is acceptable. Monitor P95 latency under actual usage (target <500ms for warm requests).

### Agent Service

**Cannot Assess**: Service not running due to startup error

**Expected Targets** (when fixed):
- Approval queue response: <30s
- Health check: <1s (warm)
- Cold start: <10s

---

## Resource Utilization

### LlamaIndex MCP
- **Memory Allocation**: 512MB per machine
- **Usage**: Cannot assess (machines stopped)
- **Recommendation**: Monitor under load, may need to scale up based on index size

### Agent Service  
- **Memory Allocation**: 1024MB
- **Usage**: Not running
- **Recommendation**: Verify 1024MB is sufficient once service is fixed

---

## Auto-scaling Verification

### LlamaIndex MCP
- ✅ **Auto-stop**: Working (machines stopped after idle)
- ✅ **Auto-start**: Working (started on health check request)
- ✅ **Start Time**: 2.2s (acceptable)

### Agent Service
- ❌ **Cannot verify**: Service crashes on startup
- **Expected**: Should auto-stop/start like LlamaIndex once fixed

---

## Recommendations

### Immediate (CRITICAL)

**1. Fix Agent Service Zod Schema** (Engineer - URGENT)
- Change `shopify_cancel_order.reason` to use `.optional().nullable()`
- Rebuild and redeploy
- Priority: SEV-1 (blocks Agent SDK functionality)

### Short-term (Post-Fix)

**2. Verify Agent Service Health** (Reliability)
- Run health check script after fix deployed
- Confirm 200 OK response
- Verify auto-scaling works
- Test approval queue response time (<30s target)

**3. Establish Usage Baselines** (Reliability + Engineer)
- Monitor MCP query latency under real usage
- Track approval queue processing times
- Document resource utilization patterns

**4. Set Up Monitoring Alerts** (Reliability)
- Configure alerts per docs/runbooks/agent-sdk-monitoring.md
- Critical: Service down, high error rate, OOM
- Warning: Elevated latency, high memory usage

### Ongoing

**5. Daily Monitoring** (Reliability)
- Run `./scripts/ops/agent-sdk-health-check.sh` daily
- Log results to feedback/reliability.md
- Report issues immediately

**6. Performance Monitoring** (Reliability)
- Track P95 latency for MCP queries (target <500ms)
- Track approval queue response (target <30s)
- Document resource usage patterns

**7. Capacity Planning** (Reliability + Engineer)
- Monitor memory usage under load
- Adjust allocations if needed
- Plan for scaling if traffic increases

---

## Deployment Quality Assessment

### What Went Well ✅

1. **LlamaIndex MCP**: Clean deployment, operational immediately
2. **Auto-scaling**: Configured correctly (machines stop/start properly)
3. **Health Endpoints**: Implemented with proper status/metrics
4. **Monitoring Readiness**: Scripts and runbooks already in place

### Issues Found ⚠️

1. **Agent Service**: Critical startup error (Zod schema validation)
2. **Testing Gap**: Startup errors should have been caught pre-deployment
3. **Health Check**: Service not tested in staging before production

### Lessons Learned

1. **Pre-deployment Testing**: Verify service actually starts and serves health checks
2. **OpenAI Validation**: Test Structured Outputs compatibility before deployment
3. **Staging First**: Deploy to staging, validate, then production
4. **Health Check Loop**: Automated health checks should run post-deployment

---

## Next Steps

### Immediate

1. **Engineer**: Fix Zod schema in agent-service (`reason.optional().nullable()`)
2. **Engineer**: Rebuild and redeploy agent-service
3. **Reliability**: Verify fix with health check script
4. **Reliability**: Document resolution time

### Post-Fix

5. **Reliability**: Run comprehensive monitoring for 24 hours
6. **Reliability**: Establish usage baselines
7. **Reliability**: Set up automated monitoring alerts
8. **Engineer**: Document fix in postmortem
9. **Team**: Update deployment checklist to catch similar issues

---

## Evidence

**Health Check Command**:
```bash
./scripts/ops/agent-sdk-health-check.sh
```

**Results**:
- LlamaIndex MCP: ✅ Pass (200 OK, 2.2s)
- Agent Service: ❌ Fail (502, startup crash)

**Logs**:
- Agent service logs show consistent OpenAI Zod validation error
- Service crashes in ~1 second on every startup attempt
- Error message is clear and actionable

**Documentation**:
- Full error logged in feedback/reliability.md
- Health check results saved
- Monitoring report (this document)

---

## Escalation

**To**: Engineer Team  
**Priority**: CRITICAL (SEV-1)  
**Issue**: agent-service startup failure (Zod schema validation)  
**Fix**: Change `.optional()` to `.optional().nullable()` for `shopify_cancel_order.reason`  
**Evidence**: Logs in feedback/reliability.md  
**Timeline**: Fix and redeploy ASAP (blocks Agent SDK functionality)  

**Report Generated**: 2025-10-12T04:22:00Z  
**Operator**: Reliability Agent  
**Next Check**: After engineer fix deployed

