# Multi-Tenant Architecture Strategy

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Status**: Strategic Architecture Plan

---

## Executive Summary

This document outlines the multi-tenant architecture strategy for HotDash Agent SDK to support multiple customer organizations on a shared infrastructure while ensuring data isolation, security, and performance.

**Timeline**: Phase 1 (Single-tenant) → Phase 2 (Multi-tenant) by Month 6
**Goal**: Scale to 200+ customers on shared infrastructure while maintaining enterprise-grade security

---

## Multi-Tenancy Models

### Option 1: Single-Tenant (Current/Phase 1)

**Architecture**: Each customer gets dedicated infrastructure

**Pros**:
- Complete data isolation
- Customer-specific customization easy
- No "noisy neighbor" performance issues
- Simpler security model

**Cons**:
- Expensive to operate (1 instance per customer)
- Hard to scale to 100+ customers
- Updates require deploying to each instance
- Higher maintenance burden

**Use Case**: Enterprise customers who require dedicated infrastructure

---

### Option 2: Multi-Tenant Shared Database (Phase 2 Recommended)

**Architecture**: All customers share database, data isolated by tenant_id

**Pros**:
- Cost-effective (1 infrastructure for all customers)
- Easy to scale (add customers without new infra)
- Central updates (deploy once, all customers updated)
- Easier monitoring and maintenance

**Cons**:
- Data isolation via application logic (must be perfect)
- Performance impacts from one tenant affect others
- Security is critical (tenant_id leaks = data breach)

**Use Case**: Managed Basic and most Enterprise customers

---

### Option 3: Hybrid (Recommended Long-Term)

**Architecture**: Multi-tenant by default, single-tenant for enterprise on request

**Implementation**:
- Managed Basic: Multi-tenant (shared DB)
- Enterprise: Multi-tenant by default, single-tenant option (+$1,000/month)
- Open Source: Self-hosted (customers manage their own)

**Benefits**: Flexibility while optimizing costs

---

## Multi-Tenant Database Design

### Core Principle: Tenant Isolation

**Every table includes `tenant_id`**:

```sql
CREATE TABLE draft_actions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,  ← Mandatory on all tables
  draft_id VARCHAR(50) NOT NULL,
  operator_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Composite index for tenant isolation
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) 
    REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_tenant_date ON draft_actions(tenant_id, created_at);
```

**Row-Level Security (RLS)**:

```sql
-- Enable RLS on all tables
ALTER TABLE draft_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their tenant's data
CREATE POLICY tenant_isolation_policy ON draft_actions
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::INTEGER);
```

**Application-Level Enforcement**:

```javascript
// Middleware: Set tenant context for all requests
app.use((req, res, next) => {
  const tenantId = req.user.tenant_id;
  req.db.query('SET LOCAL app.current_tenant_id = $1', [tenantId]);
  next();
});

// All queries automatically filtered by tenant_id
const drafts = await db.query(
  'SELECT * FROM draft_actions WHERE created_at > $1',
  [startDate]
); // RLS ensures only current tenant's data returned
```

---

## Tenant Provisioning

### New Customer Onboarding Flow

**Step 1: Tenant Creation** (30 seconds)
```
Customer signs up → Create tenant record
  ↓
INSERT INTO tenants (name, plan, created_at) VALUES ('Acme Corp', 'basic', NOW());
  ↓
Generate tenant_id: 1234
```

**Step 2: Initial Setup** (2-5 minutes)
- Create admin user for tenant
- Provision knowledge base index (LlamaIndex namespace)
- Configure OpenAI API key (tenant-specific or shared)
- Set up default approval queue workflows
- Import initial knowledge base documents (if provided)

**Step 3: Operator Onboarding** (15 minutes per operator)
- Invite operators via email
- Operators create accounts (SSO or password)
- Assign roles (operator, team lead, manager)
- Complete training tutorial

**Total Time to First Value**: <1 hour

---

## Data Isolation Strategy

### Level 1: Database Isolation

**Row-Level Security (RLS)**: PostgreSQL RLS policies ensure queries only return tenant's data

**Verification**:
```sql
-- Test: Attempt to access another tenant's data
SET app.current_tenant_id = '1234';
SELECT * FROM draft_actions WHERE tenant_id = '5678';
-- Returns: 0 rows (RLS blocks)
```

### Level 2: Application Isolation

**Middleware Enforcement**: Every API request validates tenant_id

```javascript
function validateTenant(req, res, next) {
  const userTenantId = req.user.tenant_id;
  const requestTenantId = req.params.tenant_id || req.body.tenant_id;
  
  if (userTenantId !== requestTenantId) {
    return res.status(403).json({ error: 'Forbidden: Tenant mismatch' });
  }
  
  next();
}
```

### Level 3: Knowledge Base Isolation

**LlamaIndex Namespacing**: Each tenant's documents indexed separately

```python
# Tenant-specific index
index = VectorStoreIndex.from_documents(
  documents,
  namespace=f"tenant_{tenant_id}"
)

# Query only returns tenant's documents
query_engine = index.as_query_engine()
response = query_engine.query("shipping policy")  # Only tenant 1234's shipping policy
```

### Level 4: OpenAI Isolation

**Tenant-Specific Context**: Prompts include tenant branding and policies

```
System: You are a support agent for {tenant.company_name}.
Use the following brand voice: {tenant.brand_voice}
Company policies: {tenant.policies}
```

**No Cross-Tenant Contamination**: Each request is isolated, no shared context

---

## Performance & Scaling

### Resource Allocation

**Shared Resources**:
- Database pool (connection limit: 200)
- API servers (load balanced)
- Redis cache (separate keyspaces per tenant)
- LlamaIndex service (namespaced indexes)

**Per-Tenant Limits**:
- Max concurrent requests: 50 (prevents one tenant monopolizing)
- Rate limiting: 100 requests/minute per tenant
- OpenAI API quota: Based on plan (5K tickets for Basic, 20K for Enterprise)
- Knowledge base size: 10GB per tenant

**Scaling Strategy**:
- **0-50 customers**: Single database + API cluster
- **51-200 customers**: Sharded database (by tenant_id range)
- **201-500 customers**: Multi-region deployment
- **500+ customers**: Hybrid (high-value enterprise gets dedicated, others multi-tenant)

---

## Security & Compliance

### Tenant Data Security

**Encryption**:
- At rest: AES-256 encryption of all sensitive fields
- In transit: TLS 1.3 for all API calls
- Tenant-specific encryption keys (optional for Enterprise)

**Access Control**:
- Role-based permissions (operator, team lead, manager, admin)
- Operators can only see their assigned tickets
- Admins can access all tenant data (audit trail logged)

**Audit Logging**:
```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INTEGER,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example: Log every data access
INSERT INTO audit_log (tenant_id, user_id, action, resource_type, resource_id)
VALUES (1234, 567, 'viewed_draft', 'draft', 8910);
```

**Compliance**:
- GDPR: Tenant data can be deleted on request
- CCPA: Tenant data exportable (JSON format)
- SOC 2: Annual audit for multi-tenant infrastructure

---

## Tenant Management

### Tenant Admin Portal

**Features**:
- Manage operators (invite, remove, change roles)
- Configure knowledge base (upload/edit documents)
- View usage metrics (tickets, API calls, costs)
- Billing management (upgrade/downgrade plan)
- Export data (compliance)

**Self-Service**:
- Upgrade plan: Instant (credit card on file)
- Add operators: Instant (send invite)
- Knowledge base updates: Instant (auto-reindex)

---

## Migration Strategy

### Phase 1 to Phase 2 Migration

**Current**: Pilot customers on single-tenant (Oct-Nov 2025)
**Future**: Migrate to multi-tenant (Dec 2025)

**Migration Plan**:
1. Build multi-tenant infrastructure (parallel to pilot)
2. Migrate pilot customers one-by-one (zero downtime)
3. Test data isolation thoroughly
4. All new customers join multi-tenant by default

**Timeline**: 4 weeks (Dec 2025)

---

## Cost Optimization

### Multi-Tenant Savings

**Single-Tenant Costs** (per customer):
- Database: $100/month
- App servers: $150/month
- Monitoring: $50/month
- **Total**: $300/month per customer
- **200 customers**: $60,000/month

**Multi-Tenant Costs** (shared):
- Database cluster: $2,000/month (handles 200 customers)
- App servers: $3,000/month (load balanced)
- Monitoring: $500/month
- **Total**: $5,500/month for 200 customers

**Savings**: $54,500/month (91% reduction in infrastructure costs)

---

**Document Owner**: Product Agent  
**Last Updated**: October 11, 2025  
**Status**: Architecture Strategy Complete  
**Next Action**: Coordinate with Engineering on implementation plan (Month 4-6)

**Related Documents**:
- [Product Vision](product_vision_12_month.md)
- [Pricing Strategy](pricing_strategy_ai_features.md)

