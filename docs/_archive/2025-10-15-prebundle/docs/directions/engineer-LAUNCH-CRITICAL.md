---
epoch: 2025.10.E1
doc: docs/directions/engineer-LAUNCH-CRITICAL.md
owner: manager
last_reviewed: 2025-10-11
---

# Engineer — LAUNCH CRITICAL FOCUS (Emergency Refocus)

## 🚨 EMERGENCY DIRECTIVE (2025-10-11T22:50Z)

**CEO Decision**: Emergency refocus on launch gates

**Your Mission**: Complete 3 P0 items to unblock launch

**Nothing else matters until these 3 complete.**

---

## ⚡ P0 LAUNCH CRITICAL TASKS (Do ONLY These)

### 1. LlamaIndex MCP Server Deployment (HIGHEST PRIORITY)

**Goal**: Deploy working LlamaIndex RAG MCP server to Fly.io

**Tasks**:

- Fix TypeScript compilation issues in llama-workflow
- Build and test MCP server locally
- Deploy to Fly.io
- Verify MCP server responds to queries
- Document endpoint and test with simple query
- **Evidence**: MCP server URL, test query result, deployment logs

**Blocking**: AI agent (2 tasks), Integrations agent (1 task)

**Timeline**: 8-12 hours

---

### 2. Agent SDK Service Implementation (P0)

**Goal**: Implement core Agent SDK service with approval queue

**Tasks**:

- Create Agent SDK service scaffolding (per docs/AgentSDKopenAI.md)
- Implement basic agent with OpenAI function calling
- Implement approval queue (pending approvals table)
- Create approval API endpoints (POST /approve, POST /reject)
- Basic integration with Supabase for decision logging
- **Evidence**: Service running, approval endpoint working, test approval logged

**Blocking**: Multiple agents waiting for Agent SDK

**Timeline**: 12-16 hours

---

### 3. Webhook Endpoints (P0)

**Goal**: Implement webhook endpoints for Chatwoot

**Tasks**:

- Create POST /api/webhooks/chatwoot endpoint
- Implement signature verification
- Parse webhook events
- Route to appropriate handlers
- Log events to Supabase
- **Evidence**: Endpoint live, test webhook received and processed

**Blocking**: Chatwoot agent (Task 2)

**Timeline**: 4-6 hours

---

## 📋 EVIDENCE REQUIREMENTS

For each completed P0 task, provide:

- ✅ File paths and line numbers of implementation
- ✅ Deployment URL or endpoint
- ✅ Test results showing it works
- ✅ Logs proving success
- ✅ Brief description of what was built

**Example**:

```
Task 1 Complete: LlamaIndex MCP deployed
- Implementation: scripts/ai/llama-workflow/src/mcp-server.ts (lines 1-150)
- Deployed: https://llamaindex-mcp.fly.dev
- Test query: curl https://llamaindex-mcp.fly.dev/query?q=test
- Result: {"response": "...", "sources": [...]}
- Logs: artifacts/ai/mcp-deploy-2025-10-11.log
```

---

## 🔄 WORKFLOW

1. **Start**: Pick P0 task (recommend Task 3 → 1 → 2 order)
2. **Build**: Implement with evidence
3. **Test**: Verify it works
4. **Deploy**: Push to staging/prod
5. **Document**: Log in feedback/engineer.md with evidence
6. **Notify**: Tag @qa for testing, @manager when complete
7. **Repeat**: Next P0 task

**Don't Start** other tasks until all 3 P0s complete.

---

## 🚫 WHAT TO IGNORE (Until P0s Complete)

**PAUSE These** (from previous expansions):

- Tasks 7-85: Microservices, performance, infrastructure, dev tools
- All advanced architecture work
- All future planning

**Why**: These are valuable but NOT launch critical. Do after P0s.

---

## 🎯 SUCCESS CRITERIA

**48-72 Hours from Now**:

- ✅ LlamaIndex MCP server live and queryable
- ✅ Agent SDK service running with approval queue
- ✅ Webhook endpoints receiving and processing events
- ✅ All 3 tested and working
- ✅ Evidence provided for each
- ✅ Launch gates unblocked

**Then**: Resume advanced work, celebrate launch

---

## 🤝 COORDINATION

**With QA**: They'll test your implementations as you complete them

**With Designer**: Coordinate on approval queue UI (they're waiting for your approval APIs)

**With Deployment**: They'll help deploy LlamaIndex MCP and Agent SDK

**With Manager**: Report completion in feedback/engineer.md with evidence

---

## 📊 PRIORITY MATRIX

| Task              | Priority | Blocking                    | Hours | Order               |
| ----------------- | -------- | --------------------------- | ----- | ------------------- |
| Webhook Endpoints | P0       | Chatwoot (1 agent)          | 4-6   | 1st (quickest win)  |
| LlamaIndex MCP    | P0       | AI, Integrations (3 agents) | 8-12  | 2nd (unblocks most) |
| Agent SDK         | P0       | Multiple agents             | 12-16 | 3rd (most complex)  |

**Recommended Order**: 3 → 1 → 2 (quick win first, then unblock agents, then complex work)

---

## 🚀 MANAGER SUPPORT

**You Have**:

- ✅ Full support from Deployment for infrastructure
- ✅ QA ready to test immediately
- ✅ Designer ready to build UI on your APIs
- ✅ All blockers cleared - focus 100% on these 3 tasks

**Timeline**: 48-72 hours total for all 3 P0s

**Goal**: Ship usable tool, launch pilot, celebrate

---

**Status**: 🔴 **LAUNCH CRITICAL - P0 TASKS ONLY**  
**Next**: Start with Task 3 (webhooks - quickest win)  
**Support**: Manager monitoring continuously, clearing blockers immediately

Let's ship this! 🚀
