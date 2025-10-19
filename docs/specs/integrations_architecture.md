# Third-Party Integrations Architecture

**Version**: 1.0
**Owner**: Integrations + Manager
**Last Updated**: 2025-10-19

## Integration Overview

### 1. Shopify Admin (Primary Platform)

**Type**: Embedded App
**Authentication**: OAuth 2.0
**APIs Used**:

- Admin GraphQL API (orders, products, customers, inventory)
- App Bridge (UI embedding)
- Webhooks (scopes update, app uninstall)

**Required Credentials**:

- SHOPIFY_API_KEY
- SHOPIFY_API_SECRET_KEY
- SHOPIFY_SCOPES

**Feature Flags**:

- `SHOPIFY_REAL_DATA` - Enable real mutations (default: false)

**Rollback**: Disable mutations via feature flag

---

### 2. Supabase (Database + Auth)

**Type**: Backend Database
**Authentication**: Service Role Key
**APIs Used**:

- PostgreSQL database
- RLS policies
- Edge Functions (future)
- Realtime subscriptions (future)

**Required Credentials**:

- SUPABASE_URL
- SUPABASE_ANON_KEY (client-side)
- SUPABASE_SERVICE_ROLE_KEY (server-side only)

**CLI Access**: `supabase` CLI with vault credentials

**Rollback**: Restore from automated backup (hourly)

---

### 3. Chatwoot (Customer Support)

**Type**: Customer Communication Platform
**Authentication**: API Token
**APIs Used**:

- Conversations API (fetch, reply)
- Webhooks (new messages, conversation updates)
- Private Notes (AI draft format)

**Required Credentials**:

- CHATWOOT_BASE_URL
- CHATWOOT_API_KEY
- CHATWOOT_ACCOUNT_ID

**Feature Flags**:

- `CHATWOOT_LIVE` - Enable real API calls (default: false)

**Health Check**: `/rails/health` + authenticated probe

**Rollback**: Disable via feature flag, manual replies only

---

### 4. Google Analytics 4

**Type**: Analytics Platform
**Authentication**: Service Account
**APIs Used**:

- Data API (metrics, reports)
- Real-time API (live sessions)

**Required Credentials**:

- GA4_PROPERTY_ID (339826228)
- GA4_SERVICE_ACCOUNT_KEY (JSON)

**Feature Flags**:

- `ANALYTICS_REAL_DATA` - Use real GA4 vs mocks

**Rollback**: Disable via feature flag

---

### 5. Publer (Social Media Publishing)

**Type**: Social Media Management
**Authentication**: API Token
**APIs Used**:

- Account Info API (health check)
- Social Accounts API (connected accounts)
- Post Scheduling API
- Post Status API

**Required Credentials**:

- PUBLER_API_KEY
- PUBLER_ACCOUNT_ID

**Feature Flags**:

- `PUBLER_LIVE` - Enable real posting (default: false)

**Health Check**: `/account_info` + `/social_accounts`

**Rollback**: Disable via feature flag

---

### 6. OpenAI (AI Services)

**Type**: AI/ML Platform
**Authentication**: API Key
**APIs Used**:

- Chat Completions (AI-Customer drafting)
- Embeddings (text-embedding-3-small for AI-Knowledge)

**Required Credentials**:

- OPENAI_API_KEY
- OPENAI_ORG_ID

**Feature Flags**:

- `AI_CUSTOMER_DRAFT_ENABLED`
- `AI_KNOWLEDGE_RAG_ENABLED`

**Cost Monitoring**: Track token usage

**Rollback**: Disable AI features via flags

---

## Integration Health Monitoring

**All Integrations Must Report**:

- Connection status (connected/error)
- Last successful call timestamp
- Error count (last hour)
- Rate limit status

**Dashboard Component**: Integration health tile

**Alerts**:

- Any integration down >5 minutes → Alert on-call
- Error rate >10% → Alert manager
- Rate limit approaching → Throttle requests

---

## Progressive Rollout Strategy

### Week 1: Shopify Read-Only

- Enable: Shopify GraphQL queries
- Disable: All mutations
- Monitor: Query performance, data accuracy

### Week 2: Analytics Live

- Enable: `ANALYTICS_REAL_DATA=true`
- Monitor: GA4 quota, metric accuracy

### Week 3: Database Actions

- Enable: `IDEA_POOL_LIVE=true`
- Enable: Supabase writes via approvals
- Monitor: RLS, data integrity

### Week 4: External Actions

- Enable: `CHATWOOT_LIVE=true` (CX replies)
- Enable: `PUBLER_LIVE=true` (social posts)
- Monitor: HITL quality, grade averages

### Week 5: Full AI

- Enable: `AI_CUSTOMER_DRAFT_ENABLED=true`
- Enable: `AI_KNOWLEDGE_RAG_ENABLED=true`
- Monitor: Draft quality, human edits

---

## Integration Testing

**Each Integration Requires**:

- Unit tests (mocked)
- Integration tests (real API in test env)
- E2E tests (full flow)
- Health check monitoring
- Rollback tested

**Test Coverage Target**: 80% per integration

---

**Created**: 2025-10-19
**Status**: Ready for production integration validation
