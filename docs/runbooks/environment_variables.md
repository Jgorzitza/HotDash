# Environment Variables - Production Requirements

**Version**: 1.0
**Owner**: Manager + DevOps
**Last Updated**: 2025-10-19

## Required for All Environments

### Application

```bash
NODE_ENV=production
PORT=3000
```

### Shopify Integration

```bash
SHOPIFY_API_KEY=<from vault>
SHOPIFY_API_SECRET_KEY=<from vault>
SHOPIFY_SCOPES=read_products,read_orders,read_customers
```

**Source**: Vault/GitHub Secrets
**Rotation**: Every 90 days

### Supabase

```bash
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard - NEVER in client>
```

**Source**: Vault/GitHub Secrets
**Rotation**: Only if compromised

### OpenAI

```bash
OPENAI_API_KEY=<from vault>
OPENAI_ORG_ID=<from OpenAI dashboard>
```

**Source**: Vault/GitHub Secrets
**Rotation**: Every 90 days
**Usage**: AI-Customer drafting, AI-Knowledge embeddings

---

## Optional (Feature-Dependent)

### Chatwoot

```bash
CHATWOOT_BASE_URL=https://app.chatwoot.com
CHATWOOT_API_KEY=<from Chatwoot settings>
CHATWOOT_ACCOUNT_ID=<numeric ID>
```

**Required When**: `CHATWOOT_LIVE=true`

### Publer

```bash
PUBLER_API_KEY=<from Publer dashboard>
PUBLER_ACCOUNT_ID=<numeric ID>
```

**Required When**: `PUBLER_LIVE=true`

### Google Analytics

```bash
GA4_PROPERTY_ID=339826228
GA4_SERVICE_ACCOUNT_KEY=<JSON from Google Cloud>
```

**Required When**: `ANALYTICS_REAL_DATA=true`

---

## Feature Flags

```bash
# Analytics
ANALYTICS_REAL_DATA=false
IDEA_POOL_LIVE=false

# Integrations
SHOPIFY_REAL_DATA=false
PUBLER_LIVE=false
CHATWOOT_LIVE=false

# AI
AI_CUSTOMER_DRAFT_ENABLED=false
AI_KNOWLEDGE_RAG_ENABLED=false

# Approvals
APPROVALS_APPLY_ENABLED=true
```

**Production Defaults**: All `false` except APPROVALS_APPLY_ENABLED

---

## Development-Only

```bash
DISABLE_WELCOME_MODAL=true
TEST_USER_EMAIL=test@example.com
VITE_DEV_PORT=5173
```

**Never in Production**: Development convenience vars

---

## Security Notes

**NEVER**:

- Commit env vars to git
- Log secret values
- Expose in client bundle
- Share in Slack/email

**ALWAYS**:

- Store in GitHub Secrets or Vault
- Rotate on schedule
- Use principle of least privilege
- Audit access logs

---

## Verification

**Check all required vars set**:

```bash
# In app startup
const required = ['SHOPIFY_API_KEY', 'SUPABASE_URL', 'OPENAI_API_KEY'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing: ${key}`);
}
```

**Production checklist**:

- [ ] All required vars in GitHub Secrets
- [ ] All optional vars documented
- [ ] All feature flags set correctly
- [ ] No secrets in code/logs
- [ ] Rotation schedule documented

---

**Created**: 2025-10-19
**Audit**: Required before production deploy
