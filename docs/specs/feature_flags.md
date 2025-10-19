# Feature Flags - Production Configuration

**Version**: 1.0
**Owner**: Manager + DevOps
**Last Updated**: 2025-10-19

## Feature Flags Registry

### Analytics Flags

```typescript
// app/utils/feature-flags.server.ts
ANALYTICS_REAL_DATA: boolean = false; // Use real GA4/Shopify vs mocks
IDEA_POOL_LIVE: boolean = false; // Use real Supabase idea_pool table
```

**Production Default**: `false` (start with mocks, enable after validation)
**Activation**: Set env var, restart app, verify in dashboard

### Integrations Flags

```typescript
SHOPIFY_REAL_DATA: boolean = false; // Real Shopify mutations
PUBLER_LIVE: boolean = false; // Real Publer posting
CHATWOOT_LIVE: boolean = false; // Real Chatwoot integration
```

**Production Default**: `false` (HITL only in dev mode first)
**Activation**: Progressive (enable one at a time, monitor)

### AI Flags

```typescript
AI_CUSTOMER_DRAFT_ENABLED: boolean = false; // AI CX drafting
AI_KNOWLEDGE_RAG_ENABLED: boolean = false; // RAG context in responses
```

**Production Default**: `false` (human-only mode first)
**Activation**: After grading system validated

---

## Activation Sequence

### Week 1: Read-Only Mode

- All flags: `false`
- Dashboard shows data (mocked/cached)
- No mutations, no outbound actions
- Validate UI, performance, monitoring

### Week 2: Analytics Live

- Enable: `ANALYTICS_REAL_DATA=true`
- Validate: Real metrics match expectations
- Monitor: Query performance, error rates

### Week 3: HITL Actions

- Enable: `IDEA_POOL_LIVE=true`
- Enable: `SHOPIFY_REAL_DATA=true` (read-only first)
- Validate: Approvals flow working
- Monitor: Approval latency, grade quality

### Week 4: Full Production

- Enable: `PUBLER_LIVE=true`
- Enable: `CHATWOOT_LIVE=true`
- Enable: `AI_CUSTOMER_DRAFT_ENABLED=true`
- Validate: Full HITL loop
- Monitor: All metrics per North Star

---

## Rollback

**Per Flag**:

- Set flag to `false`
- Restart application
- Verify fallback to mocks
- Monitor for stability

**Emergency All-Off**:

```bash
# Disable all feature flags
export ANALYTICS_REAL_DATA=false
export IDEA_POOL_LIVE=false
export SHOPIFY_REAL_DATA=false
export PUBLER_LIVE=false
export CHATWOOT_LIVE=false
export AI_CUSTOMER_DRAFT_ENABLED=false
# Restart app
```

---

## Monitoring Per Flag

**ANALYTICS_REAL_DATA**:

- Query latency (GA4, Shopify)
- Data accuracy vs baseline
- Error rate

**IDEA_POOL_LIVE**:

- 5 suggestions maintained
- 1 wildcard present
- Acceptance SLA <48h

**SHOPIFY_REAL_DATA**:

- Mutation success rate
- Rollback usage
- Audit trail completeness

**PUBLER_LIVE**:

- Post delivery rate
- Engagement metrics
- Queue health

**CHATWOOT_LIVE**:

- Response time <15 min
- Grade averages (tone/accuracy/policy ≥4.5)
- Escalation rate

**AI_CUSTOMER_DRAFT_ENABLED**:

- % drafted by AI (target ≥90%)
- Edit distance
- Grade quality

---

**Created**: 2025-10-19
**Status**: Ready for production progressive rollout
