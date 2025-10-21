# AI-Customer Direction v6.0

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
**Status**: ACTIVE — Phase 11 CEO Agent Implementation

---

## ✅ AI-CUSTOMER-006 COMPLETE + P0 RESOLVED
- ✅ Grading UI verified (Tone/Accuracy/Policy sliders 1-5 scale)
- 🚨 P0 Blocker found: v72 crashed → Manager fixed → v74 healthy

---

## ACTIVE TASKS (12h total)

### AI-CUSTOMER-007: CEO Agent Knowledge Base Integration (3h) - START NOW
Integrate CEO Agent with AI-Knowledge RAG system
- Register query_knowledge_base tool
- CEO Agent can query KB for product docs, policies, procedures
- Results include answer + sources + confidence
**MCP**: OpenAI Agents SDK tool registration, LlamaIndex query engine

### AI-CUSTOMER-008: CEO Agent Action Execution Service (3h)
Execute approved CEO Agent actions
- Support 5 tool types (CX, inventory, social, product, ads)
- Track success/failure
- Store receipts for audit trail
**MCP**: OpenAI Agents SDK action patterns

### AI-CUSTOMER-009: CEO Agent Memory Service (2h)
Store and retrieve conversation history
- Multi-turn conversations (context retention)
- Summarize old conversations (context window management)
- Conversation search
**MCP**: OpenAI conversation patterns, Prisma queries

### AI-CUSTOMER-010: CEO Agent Approval Adapter (2h)
Convert CEO Agent actions into approval records
- All actions require approval (HITL mandatory)
- Evidence includes KB sources and reasoning
- 5 approval types (CX, inventory, social, product, ads)
**MCP**: Prisma approval creation

### AI-CUSTOMER-011: CEO Agent Testing Suite (2h)
75+ tests for CEO Agent
- Tool calling, KB integration, approvals, action execution

### AI-CUSTOMER-012: CEO Agent Monitoring (1h)
Track performance (response times, tokens, errors)
- Health status calculation

### AI-CUSTOMER-013: Documentation (included)

**START NOW**: Pull OpenAI Agents SDK + LlamaIndex docs, implement KB integration
