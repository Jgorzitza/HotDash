# Agent Direction - specialagent001 (LLM Infrastructure Specialist)

**Agent:** specialagent001  
**Role:** LLM Infrastructure Specialist  
**Effective:** 2025-10-24  
**Status:** ACTIVE  
**Purpose:** Build and deploy LiteLLM + Langfuse + Fly Redis infrastructure for production agents

---

## 🎯 Mission

Build a **single Fly.io app** that consolidates all LLM infrastructure:
- **LiteLLM Gateway** - OpenAI proxy with caching, quotas, and observability
- **Langfuse UI** - Observability dashboard for traces, costs, and performance
- **Fly Redis** - Managed cache for exact and semantic caching

**Goal:** Production-ready infrastructure for ai-customer, ceo-insights, and background agents.

**NOT for dev team** - This is production infrastructure only.

---

## 📋 Current Task

**SPECIALAGENT001-INFRA-001: Build LLM Gateway Infrastructure**

**Priority:** P0 (Critical)  
**Estimated Hours:** 14-16 hours  
**Status:** NOT STARTED

---

## 🏗️ Architecture Overview

### Single Fly App (Multi-Process)

```
hotdash-llm-gateway (Fly app)
├── gateway process (LiteLLM) → https://gateway.hotrodan.com
├── ui process (Langfuse)      → https://langfuse.hotrodan.com
└── Fly Redis (managed)        → Internal cache
```

### Data Flow

```
Production Agent → LiteLLM Gateway → OpenAI API
                        ↓
                   Fly Redis Cache (check)
                        ↓
                   Langfuse (trace logging)
                        ↓
                   Supabase (langfuse schema)
```

---

## 🔧 Technical Specifications

### 1. **Fly App Configuration**

**App Name:** `hotdash-llm-gateway`  
**Region:** `ord` (Chicago)  
**Processes:**
- `gateway` - LiteLLM (port 4000)
- `ui` - Langfuse (port 3000)

**Resources:**
- Memory: 2048 MB
- CPU: 1 shared core

### 2. **Domains**

- **Gateway:** `https://gateway.hotrodan.com` (LiteLLM API)
- **Langfuse:** `https://langfuse.hotrodan.com` (Observability UI)

### 3. **Database Strategy**

**Supabase:** Same project as HotDash, separate schema

```sql
-- Create langfuse schema
CREATE SCHEMA IF NOT EXISTS langfuse;
GRANT USAGE ON SCHEMA langfuse TO postgres;
GRANT ALL ON SCHEMA langfuse TO postgres;
```

**Connection Strings:**
- **First boot (migrations):** Direct connection (port 5432)
  ```
  postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres?schema=langfuse&sslmode=require
  ```
- **Runtime (after migrations):** Pooled connection (port 6543)
  ```
  postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:6543/postgres?schema=langfuse&sslmode=require
  ```

### 4. **Caching Strategy**

**Fly Redis (Managed):**
- Name: `hotdash-llm-cache`
- Region: `ord`
- Size: 256 MB ($1.94/month)

**Cache Types:**
- **Exact Cache:** 1-day TTL (character-by-character match)
- **Semantic Cache:** 7-day TTL (meaning-based match using embeddings)

### 5. **OpenAI Models (ONLY)**

- `gpt-4o-mini` (default, cheap)
- `gpt-4o` (fallback, expensive)
- `text-embedding-3-large` (semantic cache)

**NO Anthropic, NO other providers**

### 6. **Team Keys & Quotas**

```yaml
prod_customer_key:     # ai-customer, support
  rpm: 100
  tpm: 200000
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

## 📝 Implementation Tasks

### Phase 1: Setup (2-3 hours)

**1.1 Create Fly App Structure**
```bash
mkdir -p fly/hotdash-llm-gateway/{bin,config}
cd fly/hotdash-llm-gateway
```

**1.2 Generate Secrets**
```bash
# Run these commands and save to vault/hotrodan/llm-gateway-secrets.json
LITELLM_MASTER_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
LANGFUSE_ENCRYPTION_KEY=$(openssl rand -base64 32)
LANGFUSE_NEXTAUTH_SECRET=$(openssl rand -base64 32)
PROD_CUSTOMER_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
PROD_CEO_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
PROD_BACKGROUND_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
ADMIN_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
```

**1.3 Create Supabase Schema**
```sql
-- Run in Supabase SQL Editor
CREATE SCHEMA IF NOT EXISTS langfuse;
GRANT USAGE ON SCHEMA langfuse TO postgres;
GRANT ALL ON SCHEMA langfuse TO postgres;
```

**1.4 Create Fly Redis**
```bash
fly redis create --name hotdash-llm-cache --region ord
# Save connection URL to vault
```

---

### Phase 2: Build Infrastructure (4-5 hours)

**2.1 Write Dockerfile**
- Multi-stage build (Langfuse base + custom)
- Install: Python3, pip, Node.js, Redis client
- Install LiteLLM: `pip3 install litellm`
- Copy Langfuse app from official image
- Create non-root user
- Set entrypoint

**2.2 Write Process Start Scripts**
- `bin/start-litellm.sh` - Start LiteLLM gateway
- `bin/start-langfuse.sh` - Start Langfuse UI

**2.3 Write LiteLLM Config**
- `config/litellm.config.yaml`
- OpenAI-only models
- Team keys and quotas
- Fly Redis cache config
- Langfuse callbacks
- Failover strategy (gpt-4o-mini → gpt-4o)

**2.4 Write fly.toml**
- Multi-process configuration
- Public services: gateway (4000), ui (3000)
- Health checks
- Environment variables
- VM resources

---

### Phase 3: Deploy (2-3 hours)

**3.1 Create Fly App**
```bash
fly apps create hotdash-llm-gateway --org personal
```

**3.2 Set Secrets**
```bash
fly secrets set \
  LITELLM_MASTER_KEY="<from vault>" \
  OPENAI_API_KEY="<from vault>" \
  LANGFUSE_ENCRYPTION_KEY="<from vault>" \
  LANGFUSE_NEXTAUTH_SECRET="<from vault>" \
  DATABASE_URL="<direct connection for first boot>" \
  REDIS_URL="<from fly redis status>" \
  NEXTAUTH_URL="https://langfuse.hotrodan.com" \
  ADMIN_EMAIL="justin@hotrodan.com" \
  ADMIN_PASSWORD="HotRod@n2024!LLM" \
  --app hotdash-llm-gateway
```

**3.3 Deploy**
```bash
fly deploy --app hotdash-llm-gateway
```

**3.4 Configure DNS**
```bash
# Create certs for custom domains
fly certs create gateway.hotrodan.com -a hotdash-llm-gateway
fly certs create langfuse.hotrodan.com -a hotdash-llm-gateway

# Follow DNS instructions from Fly output
# Add CNAME records in domain registrar
```

**3.5 Switch to Pooled Connection**
```bash
# After Langfuse migrations complete
fly secrets set DATABASE_URL="<pooled connection port 6543>" -a hotdash-llm-gateway
fly deploy -a hotdash-llm-gateway
```

---

### Phase 4: Testing (3-4 hours)

**4.1 Smoke Test (Gateway)**
```bash
curl https://gateway.hotrodan.com/v1/chat/completions \
  -H "Authorization: Bearer <ADMIN_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Test message"}]
  }'
```

**Expected:** 200 OK with response

**4.2 Cache Test**
```bash
# Send same request 3 times
# 1st = cache miss (slow)
# 2nd = exact cache hit (fast)
# 3rd = exact cache hit (fast)
```

**Expected:** 2nd and 3rd requests < 100ms

**4.3 Semantic Cache Test**
```bash
# Send similar requests with different wording
# Request 1: "What is the return policy?"
# Request 2: "What's your refund policy?"
# Request 3: "How do I return an item?"
```

**Expected:** Requests 2 and 3 hit semantic cache

**4.4 Quota Test**
```bash
# Send 101 requests with prod_customer_key (limit: 100 rpm)
# 101st request should be rate limited
```

**Expected:** 429 Too Many Requests on 101st request

**4.5 Failover Test**
```bash
# Send request with >2000 input tokens
# Should trigger gpt-4o escalation policy
```

**Expected:** Response from gpt-4o (check Langfuse trace)

**4.6 Langfuse UI Test**
```bash
# Login to https://langfuse.hotrodan.com
# Email: justin@hotrodan.com
# Password: HotRod@n2024!LLM
```

**Expected:**
- Login successful
- Traces visible from tests
- Cost estimates shown
- Cache hit rate > 0%

---

### Phase 5: Documentation (2-3 hours)

**5.1 Create Deployment Guide**
- File: `fly/hotdash-llm-gateway/README.md`
- Include: Setup, deployment, testing, troubleshooting

**5.2 Create Cutover Guide**
- File: `docs/runbooks/llm-gateway-cutover.md`
- For regular dev team to cut over production agents
- Include: Env var changes, deployment steps, rollback

**5.3 Create Monitoring Guide**
- File: `docs/runbooks/llm-gateway-monitoring.md`
- Include: Langfuse dashboards, alerts, cost tracking

**5.4 Update Vault**
- Fill in all generated secrets
- Document rotation schedule
- Add to `vault/hotrodan/llm-gateway-secrets.json`

---

## ✅ Acceptance Criteria

**Infrastructure:**
- [ ] Fly app deployed and healthy
- [ ] LiteLLM gateway accessible at https://gateway.hotrodan.com
- [ ] Langfuse UI accessible at https://langfuse.hotrodan.com
- [ ] Fly Redis operational
- [ ] Supabase langfuse schema created
- [ ] All secrets set in Fly

**Testing:**
- [ ] Smoke test passes (200 OK)
- [ ] Exact cache working (2nd request < 100ms)
- [ ] Semantic cache working (similar requests cached)
- [ ] Quotas enforced (429 on limit exceeded)
- [ ] Failover working (gpt-4o escalation)
- [ ] Langfuse UI shows traces and costs

**Documentation:**
- [ ] Deployment guide complete
- [ ] Cutover guide complete
- [ ] Monitoring guide complete
- [ ] Vault updated with all secrets

**Handoff:**
- [ ] Regular dev team can follow cutover guide
- [ ] No production agents touched yet
- [ ] Infrastructure ready for cutover

---

## 🚨 Critical Rules

### Database Safety
- ✅ **SAFE:** Create langfuse schema
- ✅ **SAFE:** Run Langfuse migrations (automatic on first boot)
- ❌ **FORBIDDEN:** Modify HotDash tables (public schema)
- ❌ **FORBIDDEN:** Drop or alter existing schemas

### Production Agents
- ❌ **DO NOT touch production agents** (ai-customer, ceo-insights, etc.)
- ❌ **DO NOT change OPENAI_BASE_URL** for any agent
- ❌ **DO NOT deploy agent changes**
- ✅ **ONLY build infrastructure** - cutover is Phase 2 (regular dev team)

### Secrets Management
- ✅ **ALWAYS** store secrets in vault first
- ✅ **ALWAYS** use `fly secrets set` (never in fly.toml or code)
- ✅ **ALWAYS** use strong random generation (openssl rand)
- ❌ **NEVER** commit secrets to git

### Testing
- ✅ **ALWAYS** test with admin_key first
- ✅ **ALWAYS** verify in Langfuse UI
- ✅ **ALWAYS** check Fly logs for errors
- ❌ **NEVER** test with production agent keys (they don't exist yet)

---

## 📊 Progress Reporting

**Log progress every 2 hours via:**
```bash
npx tsx --env-file=.env scripts/agent/log-progress.ts specialagent001 SPECIALAGENT001-INFRA-001 <progress-pct> "<rationale>" "<evidence-url>" "<next-action>"
```

**Example:**
```bash
npx tsx --env-file=.env scripts/agent/log-progress.ts specialagent001 SPECIALAGENT001-INFRA-001 25 "Completed Dockerfile and start scripts, starting LiteLLM config" "fly/hotdash-llm-gateway/Dockerfile" "Next: Write litellm.config.yaml"
```

**Log completion:**
```bash
npx tsx --env-file=.env scripts/agent/complete-task.ts SPECIALAGENT001-INFRA-001 "LLM Gateway infrastructure deployed and tested. All 6 tests passing. Documentation complete. Ready for production agent cutover."
```

---

## 🔗 Key Resources

**Documentation:**
- LiteLLM: https://docs.litellm.ai/
- Langfuse: https://langfuse.com/docs
- Fly.io Multi-Process: https://fly.io/docs/apps/processes/
- Fly Redis: https://fly.io/docs/reference/redis/

**Vault:**
- `vault/hotrodan/llm-gateway-secrets.json` - All secrets and keys

**Codebase:**
- `fly/hotdash-llm-gateway/` - Infrastructure code
- `docs/runbooks/llm-gateway-*.md` - Operational guides

---

## 🎯 Success Metrics

**Week 1 (After Cutover):**
- Cache hit rate: > 30%
- P95 latency: < 2s
- Error rate: < 1%
- Daily cost: < $50
- Quota violations: 0

**Monitoring:**
- Langfuse dashboard: https://langfuse.hotrodan.com
- Fly metrics: `fly dashboard -a hotdash-llm-gateway`
- Email alerts: justin@hotrodan.com

---

**Start immediately. Build production-ready infrastructure. DO NOT touch production agents.**

