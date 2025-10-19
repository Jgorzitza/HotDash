## 2025-10-11T15:00:00Z — MANAGER DECISION: LlamaIndex MCP + Agent SDK Architecture

### Executive Summary

CEO approved comprehensive AI agent architecture combining:

1. Google Analytics Direct API integration (immediate)
2. LlamaIndex RAG as HTTP MCP server on Fly.io
3. OpenAI Agent SDK for customer support automation
4. Human-in-the-loop approval workflows

**Cost Impact**: +$10-15/month (LlamaIndex + Agent MCP servers), -$6/month (GA HTTP server destroyed)  
**Timeline**: 2-3 weeks phased implementation  
**Risk**: Low (phased rollout with approval gates)

---

### Strategic Decisions Made

#### 1. Google Analytics Integration Approach ✅

**Decision**: Use Direct Google Analytics API (not MCP) for application data fetching

**Rationale**:

- App knows exactly what queries it needs (sessions, landing pages, traffic sources)
- Best performance (no MCP protocol overhead)
- Most reliable (battle-tested Google client library)
- $0 additional infrastructure cost
- Simplest to maintain

**Impact**:

- Destroy Fly.io GA MCP HTTP server (saves $50-70/year)
- Keep local stdio GA MCP for Cursor/dev tools (working perfectly)
- 2-4 hours engineering work to implement

**Owner**: Engineer agent  
**Timeline**: Week 1, Priority 1

---

#### 2. LlamaIndex as MCP Server Architecture ✅

**Decision**: Deploy LlamaIndex RAG capabilities as HTTP MCP server on Fly.io

**Rationale**:

- Universal access pattern (all agents + dashboard + CLI can use)
- OpenAI Agent SDK natively supports MCP tool calling
- Clean service boundaries (RAG isolated from agent orchestration)
- Independent scaling and versioning
- Reuses completed LlamaIndex workflow (thin wrapper approach)
- Aligns perfectly with existing MCP-first architecture

**Implementation**:

```
apps/llamaindex-mcp-server/  (HTTP MCP endpoint)
  ↓ wraps
scripts/ai/llama-workflow/   (existing CLI, completed 2025-10-11)
  ↓ exposes
MCP Tools: query_support, refresh_index, insight_report
  ↓ used by
Agent SDK + Dashboard + Dev tools
```

**Cost**: ~$5-10/month (Fly.io 512MB instance with auto-stop)  
**Owner**: Engineer agent (implementation) + AI agent (optimization)  
**Timeline**: Week 1

---

#### 3. OpenAI Agent SDK for Customer Support ✅

**Decision**: Build agent orchestration using official OpenAI Agent SDK

**Rationale**:

- Production-grade state management and error handling
- Built-in approval workflows (`needsApproval` flag)
- Human-in-the-loop safety controls
- Structured feedback collection for training
- Multi-agent handoffs (triage → specialists)
- Official support and updates from OpenAI

**Architecture**:

```
Chatwoot Webhook
  ↓
Agent Service (Triage)
  ├─ Order Support Agent
  │   ├─ answer_from_docs (LlamaIndex MCP)
  │   ├─ shopify_find_orders (direct)
  │   └─ shopify_cancel_order (needs approval)
  └─ Product Q&A Agent
      ├─ answer_from_docs (LlamaIndex MCP)
      └─ chatwoot_send_reply (needs approval)
```

**Approval Queue**:

- Operators see pending actions in HotDash dashboard
- One-click approve/reject
- Full audit trail
- Training data captured automatically

**Cost**: ~$5-10/month (Fly.io deployment) + OpenAI API usage  
**Owner**: Engineer agent  
**Timeline**: Week 2-3

---

### Cost-Benefit Analysis

#### Costs

| Item                                      | Monthly | Annual    | Status        |
| ----------------------------------------- | ------- | --------- | ------------- |
| **Savings**: GA HTTP MCP server destroyed | -$6     | -$70      | ✅ Approved   |
| **New**: LlamaIndex MCP server            | +$7     | +$84      | 🚧 Building   |
| **New**: Agent SDK service                | +$7     | +$84      | 🚧 Building   |
| **New**: OpenAI API usage                 | +$20-50 | +$240-600 | 📊 Monitor    |
| **Net Impact**                            | +$28-58 | +$338-698 | ✅ Acceptable |

#### Benefits

- **Scalability**: Handle 10x conversation volume with same team
- **Quality**: Consistent responses based on knowledge base
- **Speed**: <30s response time vs manual hours
- **Training**: Systematic improvement via feedback loop
- **Safety**: Zero unapproved customer-facing actions
- **Maintainability**: Official SDK vs custom orchestration

**ROI**: Break-even at 5-10 support conversations per day automated

---

### Implementation Plan

#### Week 1: GA + LlamaIndex MCP

**Priority 1**: Google Analytics Direct API

- Owner: Engineer agent
- Timeline: 2-4 hours
- Evidence: Working GA tile with real data
- CEO Note: Verify service account credentials with CEO before implementing

**Priority 2**: LlamaIndex MCP Server

- Owner: Engineer agent (implementation) + AI agent (optimization)
- Timeline: 5-7 days
- Evidence: MCP server deployed, <500ms P95 response time
- Coordination: Daily sync in feedback files

#### Week 2: Agent SDK Foundation

**Tasks**:

- Scaffold agent service
- Implement tools (RAG, Shopify, Chatwoot)
- Define agents (triage, order support, product Q&A)
- Deploy to Fly.io

**Owner**: Engineer agent  
**Evidence**: Agent service responds to test conversations

#### Week 3: Integration + Approval UI

**Tasks**:

- Build approval queue UI in dashboard
- End-to-end testing
- Operator training
- Production rollout (pilot with 5-10 beta customers)

**Owner**: Engineer agent (backend) + Product agent (UI design)  
**Evidence**: Operators can approve/reject actions in dashboard

---

### Phased Rollout Plan

#### Phase 1: Internal Testing (Week 3)

- Enable for team@hotrodan.com conversations
- All approval gates ON
- Full monitoring and logging
- Success criteria: Zero false positives, <30s approval latency

#### Phase 2: Pilot (Week 4)

- Expand to 5-10 beta customers (opt-in)
- Continue with approval gates
- Collect feedback from operators
- Success criteria: >80% operator satisfaction, <5 escalations

#### Phase 3: Production (Week 5+)

- Gradual rollout to broader customer base
- Monitor approval queue depth, latency
- Relax approval gates for safe actions (read-only queries)
- Success criteria: 50% first-time resolution, >90% accuracy

---

### Documentation Updates Made

#### 1. North Star (`docs/NORTH_STAR.md`)

- Updated MCP server list (5 → 7 servers)
- Added GA Direct API clarification
- Added LlamaIndex MCP architecture notes

#### 2. README (`README.md`)

- Updated MCP tools section (5 → 7 servers)
- Added google-analytics and llamaindex-rag entries
- Updated example queries

#### 3. MCP Tools Reference (`docs/directions/mcp-tools-reference.md`)

- Added Section 6: Google Analytics MCP (dev tools only)
- Added Section 7: LlamaIndex RAG MCP
- Updated tool selection guide
- Updated summary table

#### 4. Credential Index (`docs/ops/credential_index.md`)

- Added Google Analytics Service Account entry
- Path: `vault/occ/google/analytics-service-account.json`
- Usage notes for direct API + MCP queries

#### 5. Agent Direction Files

- **Deployment** (`docs/directions/deployment.md`): 🚨 URGENT task to destroy GA HTTP MCP server
- **Engineer** (`docs/directions/engineer-sprint-llamaindex-agentsdk.md`): NEW comprehensive 3-phase sprint plan
- **AI** (`docs/directions/ai.md`): Updated to support Engineer with LlamaIndex MCP optimization

---

### Agent Assignments

#### Deployment Agent

**Task**: Destroy `hotdash-analytics-mcp` Fly.io app  
**Priority**: URGENT (within 24 hours)  
**Evidence Required**: Command output showing successful deletion  
**Cost Savings**: $50-70/year

#### Engineer Agent

**Tasks**:

1. GA Direct API implementation (2-4 hours)
2. LlamaIndex MCP server (Week 1)
3. Agent SDK service (Week 2-3)

**Coordination**: Daily sync with AI agent  
**CEO Note**: Check GA credentials availability before starting

#### AI Agent

**Tasks**:

1. Review Engineer's MCP implementation
2. Optimize query performance (<500ms P95)
3. Enhance training data collection
4. Create evaluation golden dataset
5. Monitor MCP server health

**Coordination**: Support Engineer with LlamaIndex expertise

---

### Success Metrics

#### Phase 1 (GA Direct API)

- ✅ Dashboard shows real analytics data
- ✅ <100ms P95 query latency
- ✅ Zero mock mode usage in production

#### Phase 2 (LlamaIndex MCP)

- ✅ MCP server responds to queries
- ✅ <500ms P95 response time
- ✅ Accessible from Cursor and Agent SDK
- ✅ 99% uptime

#### Phase 3 (Agent SDK)

- ✅ Agents handle 3+ conversation types
- ✅ Zero unapproved customer-facing actions
- ✅ <30s approval queue latency
- ✅ 50% first-time resolution rate
- ✅ >80% operator satisfaction

---

### Risk Mitigation

#### Technical Risks

- **LlamaIndex API changes**: Centralize in MCP server, version carefully
- **Agent SDK learning curve**: Reference official docs, escalate questions
- **Performance issues**: Monitor P95 latency, scale Fly.io resources as needed

#### Operational Risks

- **False approvals**: Start with approval gates ON for all actions
- **Queue buildup**: Monitor depth, scale operator capacity
- **Training data quality**: Establish quality bar (BLEU >0.3, ROUGE-L >0.4)

#### Rollback Plan

- GA: Set `GA_USE_MOCK=1` → instant revert
- LlamaIndex MCP: Remove from `.mcp.json` → agents fall back to inline
- Agent SDK: Disable Chatwoot webhook → revert to manual support

**All rollbacks preserve training data for future attempts**

---

### Next Actions (Manager)

✅ **Completed**:

1. Update North Star and README
2. Update MCP tools reference
3. Update credential index
4. Issue direction to Deployment agent
5. Issue direction to Engineer agent
6. Issue direction to AI agent
7. Log this decision record

⏭️ **Monitoring**:

- Daily check of agent feedback logs
- Weekly progress review (Monday standup)
- Escalation response (blockers within 24h)

---

### Evidence Package

**Artifacts Generated**:

- Decision record: `feedback/manager-2025-10-11-agentsdk-decision.md` (this file)
- Documentation updates: 6 files modified
- Direction updates: 3 agent direction files updated
- Architecture diagrams: Embedded in engineer direction

**Total Documentation**: ~15,000 words of comprehensive direction

---

### CEO Approval

✅ **Approved**: CEO confirmed full plan approval with note to verify GA credentials

**CEO Quote**:

> "Approve the plan, let's get everything up to date and push direction to the agents please. Ensure agent working on GA knows to check current secrets sources as they may already be present or to work with the CEO (me) to enable so we can use live data from the get go."

---

### Communication Plan

**To Agents**:

- Direction files updated with clear priorities
- Evidence requirements specified
- Coordination points identified
- Timeline expectations set

**To CEO**:

- Weekly progress reports
- Cost monitoring updates
- Blocker escalations (immediate)
- Success metric tracking

**To Operators** (when ready):

- Training materials on approval queue
- Agent capabilities documentation
- Escalation procedures
- Feedback collection process

---

### Compliance & Governance

**WARP Compliance**: ✅

- All changes follow direction governance
- Evidence-based decision making
- Canon references maintained
- MCP-first development enforced

**Secret Management**: ✅

- GA credentials in vault (600 permissions)
- OpenAI API key in vault
- No secrets in git history
- Fly secrets management via CLI

**Stack Guardrails**: ✅

- Supabase-only Postgres
- React Router 7
- OpenAI + LlamaIndex (approved AI stack)
- MCP-first verification for current APIs

---

**Manager**: Claude (Acting Manager Agent)  
**Date**: 2025-10-11  
**Status**: ✅ ALL DIRECTION ISSUED - AGENTS READY TO EXECUTE  
**Next Review**: 2025-10-14 (Monday standup)
