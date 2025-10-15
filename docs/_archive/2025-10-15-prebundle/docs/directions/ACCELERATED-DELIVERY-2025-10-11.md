---
epoch: 2025.10.E1
doc: docs/directions/ACCELERATED-DELIVERY-2025-10-11.md
owner: manager
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-15
---
# 🚀 ACCELERATED DELIVERY - ALL AGENTS

**CEO Directive**: Bump delivery timeline up  
**New Target**: Agent SDK operational in **3-4 DAYS** (was 2-3 weeks)  
**Approach**: Aggressive parallelization, rapid iteration, MVP-first

---

## ⚡ COMPRESSED TIMELINE

| Phase | Original | **NEW** | Status |
|-------|----------|---------|--------|
| Phase 1: GA Direct API | 2-4 hours | ✅ **COMPLETE** | Done in 2h |
| Phase 2: LlamaIndex MCP | Week 1 | **12 hours** (Today+Tomorrow) | Starting now |
| Phase 3: Agent SDK | Week 2-3 | **48 hours** (Day 3-4) | Ready to start |
| Phase 4: Internal Testing | Week 3 | **12 hours** (Day 4) | Test plans ready |
| Phase 5: Pilot Launch | Week 4 | **Day 5** | Go live |

**Total Delivery**: **5 DAYS** from now (was 3 weeks)

---

## 🎯 DAILY BREAKDOWN

### **DAY 1 (Today) - LlamaIndex MCP Foundation**
**Target**: MCP server deployed and responding

**Engineer** (6 hours):
- Hours 1-2: Scaffold MCP server, implement protocol handler
- Hours 3-4: Implement 3 tool wrappers (thin execSync approach)
- Hours 5-6: Deploy to Fly.io, verify health checks

**AI** (parallel, 4 hours):
- Hours 1-2: Code review as Engineer builds
- Hours 3-4: Performance testing, optimization recommendations

**Data** (parallel, 2 hours):
- Create Agent SDK schemas (agent_approvals, agent_feedback, agent_queries)
- Apply migrations to local Supabase

**Designer** (parallel, 3 hours):
- Detailed ApprovalCard component specs
- All state variations documented

**QA** (parallel, 2 hours):
- Resolve test blockers with Engineer
- Create Agent SDK test plan

**End of Day 1**: LlamaIndex MCP server operational, schemas ready

---

### **DAY 2 (Tomorrow) - Agent SDK Core**
**Target**: Agent service deployed, tools working

**Engineer** (8 hours):
- Hours 1-3: Scaffold Agent SDK service (`apps/agent-service/`)
- Hours 4-5: Implement RAG + Shopify + Chatwoot tools
- Hours 6-7: Define triage + specialist agents
- Hour 8: Deploy to Fly.io staging

**AI** (parallel, 4 hours):
- Monitor LlamaIndex MCP performance
- Optimize if needed (<500ms P95)
- Implement caching if bottlenecks found

**Chatwoot** (parallel, 4 hours):
- Configure webhook for Agent SDK
- Test webhook payload delivery
- Implement HMAC verification
- Document conversation flow

**Data** (parallel, 3 hours):
- Test Agent SDK schemas with sample data
- Create seed data for testing
- Document query patterns

**Designer** (parallel, 4 hours):
- Build ApprovalCard component (coordinate with Engineer)
- Create /approvals route skeleton

**QA** (parallel, 4 hours):
- Write integration tests for Agent SDK
- Test webhook → agent → approval flow
- Document test results

**End of Day 2**: Agent SDK service operational, webhook configured

---

### **DAY 3 - Approval Queue UI + Integration**
**Target**: Full end-to-end flow working

**Engineer** (8 hours):
- Hours 1-4: Implement approval queue UI in dashboard
- Hours 5-6: Wire approve/reject endpoints
- Hours 7-8: End-to-end testing, bug fixes

**Designer** (parallel, 4 hours):
- Polish ApprovalCard styling
- Add loading/error states
- Real-time update UI patterns

**Chatwoot** (parallel, 4 hours):
- End-to-end conversation testing
- Private note creation verification
- Public reply approval flow testing

**QA** (parallel, 6 hours):
- E2E Playwright tests for approval queue
- Test all user flows (approve, reject, timeout)
- Security testing (CSRF, auth, permissions)
- Performance testing under load

**AI** (parallel, 3 hours):
- Monitor LlamaIndex query patterns
- Optimize cache hit rates
- Document performance metrics

**Support** (parallel, 4 hours):
- Create operator training materials
- Document approval workflow
- Prepare FAQ for operators

**End of Day 3**: Full system operational, ready for internal testing

---

### **DAY 4 - Internal Testing + Polish**
**Target**: Production-ready system

**ALL AGENTS** - Internal testing sprint:

**Morning (4 hours)**:
- QA: Execute full test suite, regression testing
- Support: Operator training session with team
- Engineer: Bug fixes from testing
- Designer: UI polish based on feedback

**Afternoon (4 hours)**:
- Reliability: Production deployment preparation
- Deployment: Secrets mirroring to production
- Compliance: Final security review
- Data: Production data migration readiness

**Evening (4 hours)**:
- All agents: Internal pilot testing
- Real conversations through the system
- Approval queue usage by team
- Performance monitoring

**End of Day 4**: System tested, polished, ready for pilot

---

### **DAY 5 - Pilot Launch**
**Target**: 5-10 beta customers live

**Morning**:
- Deployment: Production deployment
- Chatwoot: Enable webhook for pilot customers
- Support: Notify pilot customers
- Reliability: Monitoring dashboards active

**Afternoon**:
- All agents: Monitor pilot performance
- Support: Operator assistance as needed
- Engineer: Hot fixes if needed
- QA: Monitor error rates

**Evening**:
- Manager: Pilot performance review
- All agents: Document learnings
- Product: Customer feedback collection

**End of Day 5**: Pilot running, feedback collected

---

## 🔥 RAPID ITERATION PRINCIPLES

### 1. **MVP First**
- Ship core functionality only
- Polish later
- No nice-to-haves until MVP works

### 2. **Parallel Work**
- Multiple agents on different components simultaneously
- Daily coordination via feedback files
- Real-time unblocking

### 3. **Continuous Testing**
- Test as you build, not after
- QA embedded in development
- Catch issues immediately

### 4. **Risk Mitigation**
- Keep rollback procedures ready
- Feature flags for everything
- Monitor aggressively

### 5. **Rapid Feedback**
- 2-hour check-ins (not daily)
- Immediate blocker escalation
- CEO notified of any delays

---

## 📋 AGENT-SPECIFIC ACCELERATED DIRECTION

### 🚀 ENGINEER - Rapid Implementation Mode

**DAY 1 SPRINT** (6 hours total, 30-min sprints):

**Sprint 1-2 (1 hour)**: Scaffold LlamaIndex MCP Server
```bash
cd /home/justin/HotDash/hot-dash
mkdir -p apps/llamaindex-mcp-server/src/handlers
cd apps/llamaindex-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk express zod
npm install -D typescript @types/node @types/express
# Create tsconfig.json, package.json scripts
```

**Sprint 3-4 (1 hour)**: Implement MCP Protocol Handler
- Create src/server.ts with MCP server setup
- Define 3 tool schemas (query_support, refresh_index, insight_report)
- Implement tool routing

**Sprint 5-6 (1 hour)**: Implement Tool Handlers (Thin Wrappers)
- src/handlers/query.ts - execSync wrapper around llama-workflow CLI
- src/handlers/refresh.ts - same pattern
- src/handlers/insight.ts - same pattern
- **Key**: Don't reinvent, just wrap existing CLI

**Sprint 7-8 (1 hour)**: Create Fly.io Deployment Config
- Create Dockerfile
- Create fly.toml (512MB, auto-stop)
- Test local build

**Sprint 9-10 (1 hour)**: Deploy to Fly.io
```bash
fly launch --no-deploy
fly secrets set OPENAI_API_KEY="..." SUPABASE_URL="..." SUPABASE_SERVICE_KEY="..."
fly deploy
```

**Sprint 11-12 (1 hour)**: Verify and Document
- Test MCP server responds
- Update .mcp.json
- Test from Cursor: "Using llamaindex-rag, query: test"
- Document in feedback/engineer.md

**Evidence**: 6 check-ins in feedback/engineer.md (1 per hour)

---

**DAY 2 SPRINT** (8 hours total, 30-min sprints):

**Sprint 1-4 (2 hours)**: Scaffold Agent SDK Service
```bash
mkdir -p apps/agent-service/src/{agents,tools,feedback}
cd apps/agent-service
npm init -y
npm install @openai/agents zod express body-parser
npm install -D typescript @types/node @types/express
```

**Sprint 5-8 (2 hours)**: Implement Tools
- tools/rag.ts (MCP wrapper)
- tools/shopify.ts (Direct GraphQL)
- tools/chatwoot.ts (Direct API)
- **Use code from docs/AgentSDKopenAI.md directly**

**Sprint 9-12 (2 hours)**: Define Agents
- agents/index.ts
- Triage agent + 2 specialists
- Tool assignments
- Handoff configuration

**Sprint 13-16 (2 hours)**: Server + Endpoints
- server.ts with Express
- POST /webhooks/chatwoot
- GET /approvals
- POST /approvals/:id/:idx/:action

**Evidence**: 8 check-ins in feedback/engineer.md (1 per hour)

---

**DAY 3 SPRINT** (8 hours total, 30-min sprints):

**Sprint 1-8 (4 hours)**: Approval Queue UI
- Create app/routes/approvals.tsx
- Implement ApprovalCard component (use Designer specs)
- Wire to Agent SDK /approvals endpoint
- Implement approve/reject actions

**Sprint 9-12 (2 hours)**: Real-time Updates
- Polling or websockets
- Optimistic UI updates
- Error handling

**Sprint 13-16 (2 hours)**: Bug Fixes + Polish
- Address QA findings
- Performance optimization
- Final testing

**Evidence**: 8 check-ins in feedback/engineer.md

---

### 🤖 AI AGENT - Performance Guardian

**DAY 1** (4 hours):
- Hour 1-2: Code review Engineer's MCP implementation as it's built
- Hour 3-4: Performance testing, document baseline metrics

**DAY 2** (4 hours):
- Hour 1-2: Monitor MCP server performance in staging
- Hour 3-4: Implement optimizations if needed (caching, query optimization)

**DAY 3** (3 hours):
- Hour 1-2: Final performance validation
- Hour 3: Documentation of metrics and optimization results

**Evidence**: Feedback every 2 hours

---

### 🗄️ DATA AGENT - Schema Speed Run

**DAY 1** (2 hours):
- Hour 1: Create 3 migrations (agent_approvals, agent_feedback, agent_queries)
- Hour 2: Apply to local, test, document

**DAY 2** (3 hours):
- Hour 1: Create seed data for testing
- Hour 2-3: Test with Engineer's Agent SDK, iterate if needed

**Evidence**: Migrations in prisma/migrations/, test results

---

### 🎨 DESIGNER AGENT - Component Sprint

**DAY 1** (3 hours):
- Hour 1: Detailed ApprovalCard specs
- Hour 2-3: All state variations, interaction patterns

**DAY 2** (4 hours):
- Hour 1-3: Build ApprovalCard with Engineer
- Hour 4: Real-time update UI patterns

**DAY 3** (4 hours):
- Hour 1-2: Polish styling
- Hour 3-4: Loading/error states

**Evidence**: Component specs, implementation reviews

---

### ✅ QA AGENT - Continuous Testing

**DAY 1** (2 hours):
- Hour 1: Resolve test blockers
- Hour 2: Agent SDK test plan

**DAY 2** (4 hours):
- Hour 1-2: Integration tests for Agent SDK
- Hour 3-4: Webhook flow testing

**DAY 3** (6 hours):
- Hour 1-3: E2E Playwright tests
- Hour 4-5: Security testing
- Hour 6: Performance testing

**DAY 4** (8 hours):
- Full regression suite
- Bug verification
- Sign-off for pilot

**Evidence**: Test results every 2 hours

---

### 💬 CHATWOOT AGENT - Webhook Hero

**DAY 2** (4 hours):
- Hour 1: Configure webhook endpoint
- Hour 2: Test payload delivery
- Hour 3: HMAC verification
- Hour 4: Document conversation flow

**DAY 3** (4 hours):
- Hour 1-2: End-to-end conversation testing
- Hour 3-4: Private note + public reply testing

**Evidence**: Webhook test results, integration verification

---

### 🛡️ COMPLIANCE AGENT - Security Sprint

**DAY 1-2** (4 hours):
- Execute P0 remediations
- Document completion
- Final security review

**DAY 4** (2 hours):
- Production security checklist
- Sign-off for pilot

**Evidence**: Remediation completion, security approval

---

### 📊 RELIABILITY AGENT - Production Prep

**DAY 4** (6 hours):
- Hour 1-2: Production deployment preparation
- Hour 3-4: Monitoring setup
- Hour 5-6: Load testing

**DAY 5** (ongoing):
- Production monitoring
- Performance dashboards
- Incident response readiness

**Evidence**: Deployment runbook, monitoring dashboards

---

### 🚀 DEPLOYMENT AGENT - Ship It

**DAY 4** (4 hours):
- Hour 1-2: Production secrets mirroring
- Hour 3-4: Deployment execution

**DAY 5** (ongoing):
- Production deployment
- Rollback readiness
- Hot fix capability

**Evidence**: Deployment logs, production verification

---

### 🎓 SUPPORT AGENT - Operator Enablement

**DAY 3** (4 hours):
- Hour 1-2: Training materials
- Hour 3-4: Operator documentation

**DAY 4** (4 hours):
- Internal training session
- FAQ creation

**DAY 5** (ongoing):
- Operator support during pilot
- Feedback collection

**Evidence**: Training docs, operator feedback

---

## 📈 SUCCESS METRICS (Compressed)

**DAY 1 Success**:
- ✅ LlamaIndex MCP responding <500ms P95
- ✅ Agent SDK schemas deployed
- ✅ Component specs ready

**DAY 2 Success**:
- ✅ Agent SDK service deployed
- ✅ Webhook configured and tested
- ✅ Tools working end-to-end

**DAY 3 Success**:
- ✅ Approval queue UI functional
- ✅ Full flow working (webhook → agent → approval → action)
- ✅ All tests passing

**DAY 4 Success**:
- ✅ Internal testing complete
- ✅ Production deployment ready
- ✅ All security approvals

**DAY 5 Success**:
- ✅ Pilot running with 5-10 customers
- ✅ Zero critical issues
- ✅ Performance within targets

---

## 🚨 ESCALATION (Compressed Timeline)

**2-Hour Rule**: If stuck >2 hours, escalate immediately  
**4-Hour Rule**: Critical path blocker >4 hours, CEO notified  
**Daily Checkpoint**: 20:00 UTC - All agents report status

---

## 💡 KEY DIFFERENCES FROM ORIGINAL PLAN

| Aspect | Original | **Accelerated** |
|--------|----------|-----------------|
| Timeline | 3 weeks | **5 days** |
| Sprint Size | 1 week | **4-8 hours** |
| Parallelization | Sequential | **Aggressive** |
| Testing | End of phase | **Continuous** |
| MVP Scope | Full features | **Core only** |
| Check-ins | Daily | **Every 2 hours** |

---

## ✅ READINESS CHECKLIST

### Day 1 Ready?
- [x] Engineer has LlamaIndex CLI working
- [x] AI agent has evaluation dataset
- [x] Data agent knows schema requirements
- [x] Designer has initial mockups
- [x] All agents have updated direction

### Day 2 Ready?
- [ ] LlamaIndex MCP deployed ← **Day 1 deliverable**
- [ ] Agent SDK schemas in database ← **Day 1 deliverable**
- [ ] Component specs complete ← **Day 1 deliverable**

### Day 3 Ready?
- [ ] Agent SDK service deployed ← **Day 2 deliverable**
- [ ] Webhook configured ← **Day 2 deliverable**
- [ ] All tools tested ← **Day 2 deliverable**

---

**Manager Commitment**: 
- Check all feedback logs every 2 hours
- Unblock within 30 minutes
- Daily 20:00 UTC status report to CEO
- Immediate escalation of any delays

**CEO Approval**: Required for this accelerated timeline

---

**Generated**: 2025-10-11T20:50:00Z  
**Authority**: CEO directive  
**Expires**: 2025-10-15 (or when pilot launches)

