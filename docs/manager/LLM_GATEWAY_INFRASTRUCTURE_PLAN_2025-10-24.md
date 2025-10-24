# LLM Gateway Infrastructure Plan - 2025-10-24

**Manager:** Augment Agent  
**CEO:** Justin  
**Date:** 2025-10-24  
**Status:** ✅ PLANNED - Task assigned to specialagent001

---

## Executive Summary

**Goal:** Build production LLM infrastructure for ai-customer, ceo-insights, and background agents.

**Solution:** Single Fly.io app with multi-process architecture:
- **LiteLLM Gateway** - OpenAI proxy with caching, quotas, observability
- **Langfuse UI** - Traces, costs, performance monitoring
- **Fly Redis** - Managed cache (exact + semantic)

**Key Decisions:**
- ✅ OpenAI-only (no Anthropic)
- ✅ Supabase same project, separate schema (langfuse.*)
- ✅ Fly Redis managed cache (not local Valkey)
- ✅ Subdomains: gateway.hotrodan.com, langfuse.hotrodan.com
- ✅ Production agents only (no dev team)
- ✅ New agent: specialagent001 (LLM Infrastructure Specialist)

---

## Architecture

### Single Fly App (Multi-Process)

```
hotdash-llm-gateway
├── gateway process → LiteLLM (port 4000) → https://gateway.hotrodan.com
├── ui process      → Langfuse (port 3000) → https://langfuse.hotrodan.com
└── Fly Redis       → hotdash-llm-cache (internal)
```

### Data Flow

```
Production Agent
    ↓
LiteLLM Gateway (https://gateway.hotrodan.com)
    ↓
Fly Redis Cache (check for exact/semantic match)
    ↓ (if miss)
OpenAI API (gpt-4o-mini or gpt-4o)
    ↓
Langfuse (trace logging)
    ↓
Supabase (langfuse schema)
```

---

## Technical Specifications

### 1. Fly.io Configuration

**App Name:** `hotdash-llm-gateway`  
**Region:** `ord` (Chicago)  
**Resources:**
- Memory: 2048 MB
- CPU: 1 shared core

**Processes:**
- `gateway` - LiteLLM (public, port 4000)
- `ui` - Langfuse (public, port 3000)

### 2. Domains

- **Gateway:** `https://gateway.hotrodan.com` (LiteLLM API)
- **Langfuse:** `https://langfuse.hotrodan.com` (Observability UI)

### 3. Database

**Supabase:** Same project as HotDash, separate schema

**Schema Isolation:**
```sql
CREATE SCHEMA IF NOT EXISTS langfuse;
GRANT USAGE ON SCHEMA langfuse TO postgres;
GRANT ALL ON SCHEMA langfuse TO postgres;
```

**Connection Strings:**
- **First boot:** Direct (port 5432) for migrations
- **Runtime:** Pooled (port 6543) for performance

**Why same project:**
- ✅ Cost-effective ($25/mo saved)
- ✅ Shared connection pool
- ✅ Single backup
- ✅ Can join across schemas (agent performance + LLM costs)

### 4. Caching

**Fly Redis (Managed):**
- Name: `hotdash-llm-cache`
- Region: `ord`
- Size: 256 MB ($1.94/month)

**Cache Types:**

**A. Exact Cache (1-day TTL)**
- Character-by-character match
- FREE (just Redis storage)
- Fast (< 10ms)

**B. Semantic Cache (7-day TTL)**
- Meaning-based match using embeddings
- Cost: ~$0.00013 per request
- Expected hit rate: 30-50%
- ROI: $51/month savings (if 30% hit rate)

### 5. OpenAI Models (ONLY)

- `gpt-4o-mini` - Default, cheap ($0.15/$0.60 per 1M tokens)
- `gpt-4o` - Fallback, expensive ($2.50/$10 per 1M tokens)
- `text-embedding-3-large` - Semantic cache ($0.13 per 1M tokens)

**Failover Strategy:**
- Default: gpt-4o-mini
- Escalate to gpt-4o if: input_tokens > 2000

### 6. Team Keys & Quotas

```yaml
prod_customer_key:     # ai-customer, support
  rpm: 100             # requests per minute
  tpm: 200000          # tokens per minute
  daily_usd_limit: 50

prod_ceo_key:          # ceo-insights, ai-knowledge
  rpm: 60
  tpm: 120000
  daily_usd_limit: 25

prod_background_key:   # analytics, inventory, seo, ads, content
  rpm: 30
  tpm: 60000
  daily_usd_limit: 10

admin_key:             # CEO testing, emergency
  rpm: 200
  tpm: 500000
  daily_usd_limit: 100
```

---

## Implementation Plan

### Phase 1: Build Infrastructure (specialagent001)

**Estimated:** 14-16 hours

**Tasks:**
1. **Setup (2-3h)**
   - Create Fly app structure
   - Generate secrets (vault)
   - Create Supabase schema
   - Create Fly Redis

2. **Build (4-5h)**
   - Write Dockerfile (multi-stage)
   - Write process start scripts
   - Write LiteLLM config (OpenAI-only, quotas, caching)
   - Write fly.toml (multi-process)

3. **Deploy (2-3h)**
   - Create Fly app
   - Set secrets
   - Deploy
   - Configure DNS/certs
   - Switch to pooled connection

4. **Test (3-4h)**
   - Smoke test (200 OK)
   - Exact cache test (< 100ms)
   - Semantic cache test (similar requests)
   - Quota test (429 on limit)
   - Failover test (gpt-4o escalation)
   - Langfuse UI test (traces, costs)

5. **Document (2-3h)**
   - Deployment guide
   - Cutover guide (for regular dev team)
   - Monitoring guide
   - Update vault

**Acceptance Criteria:**
- ✅ Infrastructure deployed and healthy
- ✅ All 6 tests passing
- ✅ Documentation complete
- ✅ Vault updated
- ✅ NO production agents touched

### Phase 2: Cutover (Regular Dev Team)

**Estimated:** 4-6 hours (AFTER Phase 1 complete)

**Tasks:**
1. Update production agent env vars:
   ```bash
   OPENAI_BASE_URL=https://gateway.hotrodan.com
   OPENAI_API_KEY=<prod_customer_key or prod_ceo_key>
   ```

2. Deploy updated agents

3. Monitor Langfuse for traffic

4. Verify cache hits, quotas, costs

**Agents to Cut Over:**
- ai-customer (prod_customer_key)
- support (prod_customer_key)
- ceo-insights (prod_ceo_key)
- ai-knowledge (prod_ceo_key)
- analytics (prod_background_key)
- inventory (prod_background_key)
- seo (prod_background_key)
- ads (prod_background_key)
- content (prod_background_key)

---

## Secrets Management

**Vault:** `vault/hotrodan/llm-gateway-secrets.json`

**Secrets to Generate:**
- `LITELLM_MASTER_KEY` (32 chars)
- `LANGFUSE_ENCRYPTION_KEY` (base64, 32 bytes)
- `LANGFUSE_NEXTAUTH_SECRET` (base64, 32 bytes)
- `PROD_CUSTOMER_KEY` (32 chars)
- `PROD_CEO_KEY` (32 chars)
- `PROD_BACKGROUND_KEY` (32 chars)
- `ADMIN_KEY` (32 chars)

**Langfuse Admin:**
- Email: `justin@hotrodan.com`
- Password: `HotRod@n2024!LLM` (CHANGE after first login)

**Rotation Schedule:** Quarterly (every 90 days)

---

## Monitoring & Alerts

### Langfuse Dashboard

**URL:** https://langfuse.hotrodan.com

**Metrics:**
- Traces by agent/team
- Token counts and costs
- Latency (p50, p95, p99)
- Error rates
- Cache hit rate (exact + semantic)

### Email Alerts

**To:** justin@hotrodan.com

**Triggers:**
- Error rate > 5% (5min window)
- Latency p95 > 10s (5min window)
- Quota exceeded (any team)
- Gateway/UI down (health check fails)
- Daily spend > $100
- Cache unavailable

### Cost Tracking

**Supabase Table:** `llm_usage`

**Dashboard Tiles (Phase 2):**
- Daily LLM cost by agent
- Token usage trends
- Cache hit rate
- Top 10 most expensive requests
- Quota usage by team

---

## Success Metrics

### Week 1 (After Cutover)

**Performance:**
- Cache hit rate: > 30%
- P95 latency: < 2s
- Error rate: < 1%

**Cost:**
- Daily spend: < $50
- Semantic cache ROI: Positive (savings > embedding costs)

**Reliability:**
- Uptime: > 99.9%
- Quota violations: 0 (except intentional testing)

---

## Rollback Plan

**If infrastructure fails:**

1. Revert production agent env vars:
   ```bash
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_API_KEY=<original OpenAI key>
   ```

2. Deploy reverted agents

3. Keep infrastructure running for investigation

4. Check Langfuse traces for root cause

5. Fix and re-cutover when ready

---

## Agent Assignment

### specialagent001 (LLM Infrastructure Specialist)

**Task:** SPECIALAGENT001-INFRA-001  
**Priority:** P0 (Critical)  
**Estimated:** 15 hours  
**Status:** ASSIGNED

**Responsibilities:**
- Build Fly app infrastructure
- Deploy and test
- Document for cutover
- DO NOT touch production agents

**Direction:** `docs/directions/specialagent001.md`  
**Feedback:** `feedback/specialagent001/YYYY-MM-DD.md`

---

## Timeline

**Phase 1 (specialagent001):** 2-3 days (15 hours)  
**Phase 2 (Regular dev team):** 1 day (4-6 hours)  
**Total:** 3-4 days

**Start:** 2025-10-24  
**Target Completion:** 2025-10-27

---

## Key Resources

**Documentation:**
- LiteLLM: https://docs.litellm.ai/
- Langfuse: https://langfuse.com/docs
- Fly.io Multi-Process: https://fly.io/docs/apps/processes/
- Fly Redis: https://fly.io/docs/reference/redis/

**Vault:**
- `vault/hotrodan/llm-gateway-secrets.json`

**Codebase:**
- `fly/hotdash-llm-gateway/` (to be created)
- `docs/runbooks/llm-gateway-*.md` (to be created)
- `docs/directions/specialagent001.md` (created)

---

## Questions Answered

1. **Domain:** Subdomains (gateway.hotrodan.com, langfuse.hotrodan.com)
2. **Database:** Same Supabase project, separate schema (langfuse.*)
3. **Team Keys:** Production agents only (4 keys: customer, ceo, background, admin)
4. **Models:** OpenAI-only (gpt-4o-mini, gpt-4o, text-embedding-3-large)
5. **Semantic Cache:** Enabled, 7-day TTL, monitor ROI in Week 1
6. **Langfuse Admin:** justin@hotrodan.com / HotRod@n2024!LLM
7. **Deployment:** Phase 1 (build), Phase 2 (cutover after ready)
8. **Alerts:** Email to justin@hotrodan.com
9. **Cost Tracking:** Supabase table + dashboard (Phase 2)
10. **Agent:** specialagent001 (added to config)
11. **Testing:** Production-ready only (no dev agents)
12. **App Name:** hotdash-llm-gateway
13. **Cache:** Fly Redis (managed, not local Valkey)
14. **Scaling:** Fly Redis supports multi-machine
15. **Secrets:** Generated via openssl, stored in vault

---

## Summary

**Infrastructure:** Single Fly app (LiteLLM + Langfuse + Fly Redis)  
**Purpose:** Production LLM gateway for ai-customer, ceo-insights, background agents  
**Agent:** specialagent001 (new)  
**Timeline:** 3-4 days  
**Cost:** ~$2/month (Fly Redis) + OpenAI usage  
**Benefits:** Caching (30-50% savings), quotas, observability, cost tracking

**Next Steps:**
1. specialagent001: Start SPECIALAGENT001-INFRA-001
2. Manager: Monitor progress via decision_log
3. Regular dev team: Wait for Phase 1 completion
4. CEO: Review Langfuse dashboard after cutover

---

**Infrastructure build starts now. Production agents untouched until ready.**

