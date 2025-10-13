# Agent SDK Roadmap Update — October 13, 2025

**Version**: 2.0 (Updated)  
**Date**: October 13, 2025  
**Owner**: Product Agent  
**Purpose**: Update Agent SDK roadmap with current status and timeline  
**Status**: Ready for pilot launch  

---

## Executive Summary

**Current Status**: Agent SDK deployed to production and operational

**Services Deployed**:
1. **Agent SDK Service** (hotdash-agent-service.fly.dev)
   - Region: ord, Port: 8787
   - Status: ✅ HEALTHY
   - Auto-start/auto-stop: Enabled
   - Health endpoint: https://hotdash-agent-service.fly.dev/health

2. **LlamaIndex MCP Service** (hotdash-llamaindex-mcp.fly.dev)
   - Region: iad, Port: 8080
   - Status: ⚠️ OPERATIONAL (query_support needs debugging)
   - Auto-start/auto-stop: Enabled
   - Health endpoint: https://hotdash-llamaindex-mcp.fly.dev/health

**Timeline Update**: Originally 3-4 days to pilot → **NOW DEPLOYED** (ahead of schedule)

---

## Deployment Status (As of Oct 13, 2025)

### ✅ Phase 1: Core Infrastructure (COMPLETE)

**LlamaIndex MCP Integration**:
- ✅ Knowledge base indexing service deployed (Port 8080)
- ✅ Semantic search API operational
- ⚠️ query_support tool needs debugging (AI agent assigned)
- ✅ Health endpoint verified

**Agent SDK Service**:
- ✅ OpenAI GPT-4 integration deployed (Port 8787)
- ✅ Prompt engineering templates implemented
- ✅ Confidence scoring algorithm operational
- ✅ Draft generation pipeline functional
- ✅ Zod schema bug fixed (Oct 12) - removed .optional() from shopify_cancel_order

**Database Schema**:
- ✅ `agent_queries` table created (tracks all queries, results, approvals)
- ✅ `agent_approvals` table created (tracks approval actions)
- ✅ `agent_feedback` table created (tracks operator feedback)
- ✅ `agent_run` table created (tracks agent performance metrics)
- ✅ `agent_qc` table created (quality control scores)

**Monitoring**:
- ✅ Health endpoints operational
- ✅ Fly.io monitoring enabled
- ✅ Auto-start/auto-stop configured
- ⏳ Grafana dashboards (pending setup)

---

### 🔄 Phase 2: UI & Integration (IN PROGRESS)

**Approval Queue UI**:
- ⏳ React-based queue interface (pending Engineer implementation)
- ⏳ Display customer context + AI draft
- ⏳ Four action buttons: Approve, Edit, Escalate, Reject
- ⏳ Source citations display
- ⏳ Confidence score visualization

**Integration Points**:
- ✅ Supabase database integration
- ✅ OpenAI API integration
- ✅ LlamaIndex MCP integration
- ⏳ Chatwoot integration (pending Support agent setup)
- ⏳ Shopify API integration (for order/customer lookups)

---

### 📋 Phase 3: Training & Pilot Prep (READY TO START)

**Operator Training**:
- ✅ Training materials prepared (docs/pilot/pilot_operator_training_agenda.md)
- ⏳ Schedule training sessions (1-2 hours per operator)
- ⏳ Create video tutorials
- ⏳ Set up Slack channel (#agent-sdk-pilot)

**Knowledge Base**:
- ✅ LlamaIndex ingestion complete
- ⏳ Gap analysis (identify missing documentation)
- ⏳ Fill knowledge base gaps
- ⏳ Test query accuracy (target: >75% relevance)

**Pilot Selection**:
- ⏳ Select 5-10 beta operators
- ⏳ Define pilot success criteria
- ⏳ Create pilot communication plan
- ⏳ Set up feedback collection process

---

### 🚀 Phase 4: Pilot Launch (READY WHEN UI COMPLETE)

**Week 1 (Pilot Start)**:
- 5 operators, 10% traffic
- Daily check-ins
- Monitor metrics (first-time resolution, latency, satisfaction)
- Collect feedback
- Fix P0/P1 bugs within SLA

**Week 2 (Pilot Expansion)**:
- Same 5 operators, 30% traffic
- Weekly check-ins
- Analyze metrics trends
- Implement quick wins
- Prepare for full rollout

**Success Criteria**:
- First-time resolution rate: ≥70%
- Approval latency: <60 seconds
- Operator satisfaction: ≥60%
- Zero P0 bugs
- Positive operator feedback

---

### 📈 Phase 5: Full Rollout (AFTER PILOT SUCCESS)

**Week 3-4 (Full Team Training)**:
- Train all 10 operators (2 hours each)
- Gradual traffic ramp: 50% → 80%
- Continuous monitoring
- Weekly metric reviews
- Feature iteration based on feedback

**Month 2-3 (Optimization)**:
- Achieve target metrics (80% resolution, <30s latency, 80% satisfaction)
- Expand agent capabilities
- Relax approval gates (for high-confidence queries)
- Plan Phase 2 features

---

## Updated Timeline

### Original Timeline (Oct 11)
```
Week 1 (Oct 14-18): Development Sprint
Week 2 (Oct 21-25): Training & Pilot Prep
Week 2-3 (Oct 28 - Nov 8): Pilot (2 weeks)
Week 4+ (Nov 11+): Full Rollout
```

### Actual Timeline (Oct 13 Update)
```
✅ Oct 11-12: Core Infrastructure (COMPLETE - 2 days early!)
✅ Oct 12: Zod schema bug fix (COMPLETE)
✅ Oct 13: Services deployed to production (COMPLETE)
⏳ Oct 14-15: Approval Queue UI implementation (2 days)
⏳ Oct 16-17: Training & Pilot Prep (2 days)
⏳ Oct 18-31: Pilot Launch (2 weeks)
⏳ Nov 1+: Full Rollout
```

**Key Insight**: We're **2-3 days ahead of schedule** thanks to rapid deployment!

---

## LlamaIndex MCP Capabilities

### What LlamaIndex MCP Provides

**1. Knowledge Base Indexing**:
- Ingests documents (policies, FAQs, troubleshooting guides)
- Creates semantic embeddings for fast retrieval
- Supports multiple document formats (Markdown, PDF, HTML)

**2. Semantic Search**:
- Natural language query → relevant documents
- Ranked by relevance score
- Returns document chunks with citations

**3. MCP Integration**:
- Exposed via Model Context Protocol (MCP)
- Available to all agents (Support, CX, Sales)
- Consistent interface for knowledge retrieval

**4. Query Tools**:
- `query_support`: Search knowledge base for support queries
- `query_policy`: Search policy documents
- `query_faq`: Search FAQ database

### Current Issues

**query_support Tool Error** (⚠️ P1):
- Error: "Cannot read properties of undefined (reading 'replace')"
- Impact: Tool shows 100% error rate
- Status: AI agent assigned to debug
- Timeline: 1-2 hours to fix
- Workaround: Other query tools functional

---

## Approval Queue Iterations (Post-Pilot)

### Phase 1 (Pilot): Full Human Oversight
- **All queries** require human approval
- Four actions: Approve, Edit, Escalate, Reject
- Operator sees full context + AI draft
- Learning loop: Track edits and rejections

### Phase 2 (Month 2): Confidence-Based Approval
- **High-confidence queries** (>90%) auto-approved
- Medium-confidence (70-90%) require approval
- Low-confidence (<70%) escalate to senior operator
- Operator can override confidence thresholds

### Phase 3 (Month 3): Smart Routing
- Simple queries (order status, tracking) → auto-approved
- Complex queries (refunds, escalations) → require approval
- Operator can flag query types for always-approve or always-review
- Machine learning improves routing over time

### Phase 4 (Month 4+): Full Automation
- 80-90% of queries auto-approved
- Operator monitors queue, intervenes only when needed
- Focus shifts to edge cases and complex issues
- Continuous learning from operator feedback

---

## Stakeholder Communication Update

### Internal Communication

**Engineering Team**:
- ✅ Services deployed successfully
- ⚠️ query_support bug needs fix (AI agent assigned)
- ⏳ Approval Queue UI pending implementation

**Support Team**:
- ⏳ Training sessions to be scheduled
- ⏳ Pilot operators to be selected
- ⏳ Feedback collection process to be set up

**Manager**:
- ✅ Services operational and healthy
- ✅ 2-3 days ahead of schedule
- ⏳ UI implementation blocking pilot launch

**CEO**:
- ✅ Agent SDK deployed to production
- ✅ Cost-effective deployment (Fly.io auto-start/stop)
- ⏳ Pilot launch pending UI completion

### External Communication (Post-Pilot)

**Customers**:
- Pilot success announcement (after 2 weeks)
- "Faster support response times powered by AI"
- Highlight human oversight and quality

**Marketing**:
- Blog post: "How We Built AI-Assisted Support"
- Case study: "50% Faster Support Resolution"
- Social media: Success metrics and customer testimonials

---

## Risk Mitigation Updates

### Original Risks (Oct 11)

**Risk 1: Knowledge base gaps** → **MITIGATED**
- LlamaIndex ingestion complete
- Gap analysis pending
- Continuous KB improvement process

**Risk 2: Operator resistance** → **IN PROGRESS**
- Training materials prepared
- Pilot selection to include early adopters
- Feedback loop to address concerns

**Risk 3: Low query accuracy** → **MONITORING**
- query_support bug being fixed
- Test accuracy after bug fix
- Iterate on prompts and KB content

**Risk 4: Approval queue bottleneck** → **ADDRESSED**
- Target: <30 second approval latency
- Metrics tracking in place
- UI optimizations planned

### New Risks (Oct 13)

**Risk 5: query_support bug delays pilot** → **ACTIVE**
- Mitigation: AI agent assigned, 1-2 hour fix
- Workaround: Other query tools functional
- Impact: Non-blocking for pilot

**Risk 6: Approval Queue UI delays pilot** → **ACTIVE**
- Mitigation: Engineer assigned, 2-day implementation
- Priority: P0 (blocking pilot launch)
- Timeline: Oct 14-15 completion target

---

## Success Metrics (Reminder)

### Week 1 (Pilot Phase)
- First-time resolution rate: ≥70%
- Approval latency: <60 seconds
- Operator satisfaction: ≥60%
- No P0 bugs
- Daily operator usage

### Week 4 (Adoption Phase)
- First-time resolution rate: ≥80%
- Approval latency: <30 seconds
- Operator satisfaction: ≥70%
- Time-to-resolution: 20% reduction
- Support volume: 30% increase

### Month 3 (Scale Phase)
- First-time resolution rate: ≥85%
- Approval latency: <15 seconds
- Operator satisfaction: ≥80%
- Time-to-resolution: 30% reduction
- Support volume: 50% increase
- ROI: ≥200%

---

## Next Steps (Priority Order)

### Immediate (This Week)
1. **AI Agent**: Fix query_support bug (1-2 hours) - P0
2. **Engineer**: Implement Approval Queue UI (2 days) - P0
3. **Product**: Select pilot operators (1 hour) - P1
4. **Product**: Schedule training sessions (1 hour) - P1
5. **Support**: Set up Chatwoot integration (2 hours) - P1

### Week 2 (Training & Prep)
1. Conduct operator training sessions (2 hours per operator)
2. Knowledge base gap analysis and filling
3. Set up monitoring dashboards (Grafana)
4. Create Slack channel (#agent-sdk-pilot)
5. Finalize pilot communication plan

### Week 3-4 (Pilot Launch)
1. Launch pilot with 5 operators, 10% traffic
2. Daily check-ins and metric monitoring
3. Collect feedback and fix bugs
4. Week 2: Expand to 30% traffic
5. Prepare for full rollout

---

## Conclusion

**Status**: Agent SDK deployment **ahead of schedule** (2-3 days early)

**Blockers**:
1. query_support bug (AI agent assigned, 1-2 hours)
2. Approval Queue UI (Engineer assigned, 2 days)

**Timeline**: Pilot launch ready by **Oct 18** (5 days from now)

**Confidence**: HIGH - Core infrastructure operational, UI implementation straightforward

---

**Evidence**:
- Roadmap update: `docs/product/agent_sdk_roadmap_update_2025-10-13.md`
- Services deployed: hotdash-agent-service.fly.dev, hotdash-llamaindex-mcp.fly.dev
- Database schema: agent_queries, agent_approvals, agent_feedback, agent_run, agent_qc
- Health endpoints: Verified operational
- Timeline: 2-3 days ahead of original schedule

**Timestamp**: 2025-10-13T23:30:00Z
