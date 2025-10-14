---
epoch: 2025.10.E1
doc: docs/directions/integrations.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Integrations — Direction

## Canon
- North Star: docs/NORTH_STAR.md (MCP-First Development)
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Credential Map: docs/ops/credential_index.md

> **Training Data WARNING**: We are in 2025. Shopify APIs in training from 2023 (2 YEARS OLD). React Router 7 training has v6/Remix (2+ years old). ALWAYS verify with appropriate MCP tools.

## Current Sprint Focus — Growth Data Integration (2025-10-14)

**Status**: Shopify automation complete ✅, GA/GSC integration needs enhancement

**Priority 0: Data Pipeline Enhancement** (This Week - 8-10 hours)

1. **Google Search Console Enhancement** (2-3 hours)
   - Add filtering for organic traffic only
   - Anomaly detection math (WoW delta)
   - BigQuery export setup
   - Deliverable: Enhanced GSC client

2. **GA4 Organic Aggregation** (2-3 hours)
   - Filter: sessionDefaultChannelGroup=Organic Search
   - Calculate proper WoW delta (not hard-coded 0)
   - Store aggregated metrics
   - Deliverable: `app/services/ga/organic-aggregation.server.ts`

3. **Shopify Webhook Security** (2 hours)
   - HMAC validation for all webhooks
   - Idempotency keys
   - Replay protection
   - Deliverable: Secure webhook middleware

4. **Webhook Queue System** (2-3 hours)
   - Durable queue for Chatwoot/Shopify webhooks
   - Retry logic with exponential backoff
   - Dead letter queue
   - Deliverable: Queue service with Supabase

**Priority 1: Advanced Integration** (Week 2 - 10-12 hours)

5. **Lighthouse CI Integration** (2-3 hours)
   - Automated CWV measurements
   - Daily performance snapshots
   - Alert on regressions

6. **Shopify Inventory Webhooks** (2 hours)
   - Track inventory changes
   - Feed into recommenders
   - HMAC + idempotency

7. **Shopify Order Webhooks** (2 hours)
   - Order data for purchase patterns
   - Revenue attribution tracking
   - Secure processing

8. **Email Integration** (2-3 hours)
   - SendGrid/Postmark setup
   - Email operator summaries
   - Action approval notifications

9. **Slack Integration** (2 hours)
   - Alert on critical events
   - Daily summary posts
   - Escalation notifications

**Priority 2: Optimization** (Week 3 - 8-10 hours)

10. **API Rate Limiting** (2 hours)
11. **Caching Strategy** (2 hours)
12. **Error Recovery** (2-3 hours)
13. **Integration Monitoring** (2-3 hours)

## Evidence & Compliance

Report every 2 hours:
```
## YYYY-MM-DDTHH:MM:SSZ — Integrations: [Task] [Status]
**Working On**: [P0 task]
**Progress**: [% or milestone]
**Evidence**: 
- Integration: [service name]
- Tests: [X/Y passing]
- Security: [HMAC verified]
**Blockers**: [None or details]
**Next**: [Next integration]
```

## Success Criteria

**P0 Complete**: GSC enhanced, GA4 accurate, Webhooks secure, Queue operational  
**P1 Complete**: All integrations live, Monitoring active  
**P2 Complete**: Rate limits enforced, Caching optimized

## Timeline

- Week 1: 8-10 hours (Core enhancements)
- Week 2: 10-12 hours (Advanced)
- Week 3: 8-10 hours (Optimization)
- **Total**: 26-32 hours

---

## ⚠️ EXECUTION INSTRUCTION

**DO NOT STOP TO ASK "WHAT'S NEXT"**:
- Your direction file contains ALL your tasks (P0, P1, P2)
- Execute them sequentially until ALL complete
- Report progress every 2 hours (don't ask permission)
- Log blockers and move to next task if stuck
- Only stop when ALL assigned work is done

**See**: .cursor/rules/04-agent-workflow.mdc for complete execution rules

---

**Last Updated**: 2025-10-14T21:20:00Z  
**Start**: GSC enhancement immediately  
**Evidence**: All work in `feedback/integrations.md`
