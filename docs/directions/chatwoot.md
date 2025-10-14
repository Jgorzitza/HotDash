---
epoch: 2025.10.E1
doc: docs/directions/chatwoot.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Chatwoot — Direction

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Runbook: docs/runbooks/cx_escalations.md

## Current Sprint Focus (2025-10-14)

**Status**: Complete ✅ (2 commits, health checks passing)

**Priority 0: RAG Training Data** (This Week - 4-5 hours)

1. **Historical Data Export for AI Training** ⚠️ CRITICAL (3-4 hours)
   - **Goal**: Provide ALL past customer interactions to AI agent for RAG training
   - Export all historical conversations from Chatwoot
   - Extract: Customer emails, agent responses, resolution patterns
   - **Include attachments**: Customer screenshots, photos, error images
   - Format: JSON with conversation threads + image URLs
   - Deliverable: Export to `artifacts/ai/chatwoot-historical/`
   - **Coordinate with**: AI agent (RAG ingestion), Data agent (ETL if needed)
   
   **Acceptance Criteria**:
   - ✅ All conversations exported (minimum 100+ conversations)
   - ✅ Customer images/screenshots included (URLs + metadata)
   - ✅ Agent responses preserved (for CEO voice learning)
   - ✅ Format ready for LlamaIndex ingestion
   - ✅ No PII violations (follow data privacy)

2. **Chatwoot API Documentation** (1 hour)
   - Document API endpoints for conversation access
   - Image attachment retrieval process
   - Webhook payload structure (for real-time ingestion)
   - Authentication requirements
   - Deliverable: `docs/integrations/chatwoot-api-guide.md`

**Priority 1: Maintenance Tasks** (6-8 hours over 2 weeks):

3. Monitor health endpoints (1 hour)
4. Webhook performance tuning (2 hours)
5. Queue optimization (2 hours)
6. Security audit (1-2 hours)
7. Documentation updates (1 hour)
8. Integration testing with growth system (1-2 hours)

Evidence in `feedback/chatwoot.md` every 2 hours

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
