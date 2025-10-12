---
epoch: 2025.10.E1
doc: docs/directions/ai.md
owner: manager
last_reviewed: 2025-10-12
---

# AI — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

### 1️⃣ **North Star Obsession**
Every task must help operators see actionable tiles TODAY for Hot Rod AN.
**Memory Lock**: "North Star = Operator value TODAY"

### 2️⃣ **MCP Tools Mandatory**
Use MCPs for ALL validation. NEVER rely on memory.
**Memory Lock**: "MCPs always, memory never"

### 3️⃣ **Feedback Process Sacred**
ALL work logged in `feedback/ai.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"

### 4️⃣ **No New Files Ever**
Never create new .md files without Manager approval.
**Memory Lock**: "Update existing, never create new"

### 5️⃣ **Immediate Blocker Escalation**
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/ai.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.

**Memory Lock**: "Blocker found = immediate flag"

### 6️⃣ **Manager-Only Direction**
Only Manager assigns tasks.
**Memory Lock**: "Manager directs, I execute"

---

## Canon

- North Star: docs/NORTH_STAR.md
- LlamaIndex Workflow: docs/runbooks/llamaindex_workflow.md
- Agent SDK: docs/AgentSDKopenAI.md

## Mission

You build the Hot Rod AN knowledge base that powers agent-assisted customer support.

## Current Sprint Focus — Hot Rod AN Knowledge Base (Oct 13-15, 2025)

**Primary Goal**: Complete Hot Rod AN knowledge for AI-assisted support

## 🎯 ACTIVE TASKS

### Task 1 - Complete hotrodan.com Ingestion (P0)

**What**: Finish ingesting www.hotrodan.com into RAG
**Evidence**: 50+ pages indexed, test queries return Hot Rod AN content
**Timeline**: 2-3 hours
**Success**: Agents can answer Hot Rod AN product questions

---

### Task 2 - Hot Rod AN Product Catalog

**What**: Build product knowledge base for 49 AN fitting products
**Focus**: AN sizing, pressure ratings, applications, compatibility
**Evidence**: Product Q&A pairs, accurate recommendations
**Timeline**: 2-3 hours

---

### Task 3 - Fuel System Technical Guides

**What**: Create technical content for LS swap fuel systems, AN plumbing
**Topics**: Sizing, routing, pressure requirements, common builds
**Evidence**: Technical guides in RAG, accurate answers to tech questions
**Timeline**: 2-3 hours

---

### Task 4 - Customer Support Templates

**What**: Extract templates from Hot Rod AN email/social history
**Sources**: Email exports, Facebook/Instagram DMs, Shopify inbox
**Evidence**: Response templates matching CEO's proven patterns
**Timeline**: 2-3 hours

---

### Task 5 - Test LlamaIndex MCP

**What**: When Engineer fixes dependency, test all 3 MCP tools
**Test**: refresh_index, query_support, insight_report
**Evidence**: All tools working, <500ms response
**Timeline**: 1 hour

---

### Task 6 - Hot Rod AN FAQ Build

**What**: Create comprehensive FAQ from customer questions
**Topics**: Shipping, returns, AN sizing, LS swaps, compatibility
**Evidence**: FAQ indexed, agents can reference
**Timeline**: 2 hours

---

### Task 7 - Knowledge Quality Check

**What**: Verify RAG retrieval accuracy for Hot Rod AN queries
**Test**: Sample queries, verify correct answers
**Evidence**: >90% accuracy on test questions
**Timeline**: 1-2 hours

---

## Git Workflow (MANDATORY)

**Branch**: `ai/work`

---

## Shutdown Checklist

[Standard 9 sections]

---

## Startup Process

[Standard 4 steps]

---

**Previous Work**: Archived  
**Status**: 🔴 ACTIVE - Task 1 (hotrodan.com ingestion)


---

## 🚀 DEEP PRODUCTION TASK LIST (Aligned to North Star - Oct 12 Update)

**North Star Goal**: Power agent-assisted approvals with accurate Hot Rod AN knowledge that helps CEO scale from $1MM to $10MM revenue.

**AI Mission**: Build and maintain LlamaIndex RAG, improve agent responses, enable AI-assisted operator decisions.

### 🎯 P0 - PRODUCTION RAG QUALITY (Week 1)

**Task 1: Hot Rod AN Content Verification** (3 hours)
- Test 50 queries against LlamaIndex MCP covering all product categories
- Verify product SKU accuracy (AN fittings, fuel systems, brake lines)
- Test technical spec retrieval (thread sizes, pressure ratings, materials)
- Validate Hot Rod AN company info (history, values, expertise)
- **Evidence**: 50 test queries with quality scores (accuracy, completeness)
- **North Star**: Accurate product knowledge = trustworthy agent responses
- **Deadline**: Oct 13 06:00 UTC

**Task 2: Agent Response Quality Rubric** (2 hours)
- Define quality criteria (accuracy, tone, completeness, automotive terminology)
- Create scoring system (1-5 scale per criterion)
- Test 20 agent responses against rubric
- Document quality thresholds (>4.0 avg to approve)
- **Evidence**: Quality rubric + 20 scored responses
- **North Star**: Consistent high-quality agent interactions
- **Deadline**: Oct 13 06:00 UTC

**Task 3: LlamaIndex MCP Health Monitoring** (2 hours)
- Monitor query latency (target <500ms P95)
- Track error rates (target <1%)
- Alert on MCP downtime
- **Evidence**: Monitoring dashboard active
- **North Star**: Reliable RAG = reliable agent suggestions
- **Deadline**: Oct 13 06:00 UTC

---

### 🧠 P1 - AGENT INTELLIGENCE IMPROVEMENT (Week 1-2)

**Task 4: Customer Support Agent Prompts** (4 hours)
- Refine prompts for Hot Rod AN customer inquiries
- Optimize for automotive terminology and tone
- Test responses with 30 real customer scenarios
- Iterate based on quality scores
- **Evidence**: Customer support agent quality >4.2/5.0
- **North Star**: AI-assisted support saves CEO 4-5 hours/week

**Task 5: Product Recommendation Agent** (4 hours)
- Build agent for product compatibility recommendations
- Train on AN fitting compatibility (hose sizes, thread types)
- Test with 20 "which part do I need?" scenarios
- **Evidence**: Product recommendation accuracy >90%
- **North Star**: Helps customers find right parts = higher conversion

**Task 6: Technical Support Agent** (4 hours)
- Build agent for installation/troubleshooting questions
- Index technical guides (fuel system install, brake line routing)
- Test with 20 technical scenarios
- **Evidence**: Technical support quality >4.0/5.0
- **North Star**: Reduce technical support burden on CEO

**Task 7: Order Status Agent** (3 hours)
- Build agent for order tracking inquiries
- Integrate with Shopify order data
- Test with 15 "where's my order?" scenarios
- **Evidence**: Order status agent accuracy 100%
- **North Star**: Automate routine order status inquiries

---

### 📚 P2 - KNOWLEDGE BASE EXPANSION (Week 2-4)

**Task 8: Competitor Analysis Ingestion** (3 hours)
- Research top 5 competitors (AN fitting suppliers)
- Index competitive pricing, features, positioning
- Enable "how do we compare?" queries
- **Evidence**: Competitive intelligence in RAG
- **North Star**: Helps operator understand market position

**Task 9: Industry Knowledge Base** (4 hours)
- Ingest hot rod forums (H.A.M.B., Speedtalk, etc.)
- Index common hot rod builds (LS swaps, SBC builds)
- Learn automotive terminology and trends
- **Evidence**: Industry knowledge in RAG
- **North Star**: Authentic communication with hot rod community

**Task 10: Product Catalog Deep Indexing** (3 hours)
- Index all product technical specs
- Index compatibility matrices
- Index installation guides
- **Evidence**: Complete product knowledge in RAG
- **North Star**: Answer any product question accurately

**Task 11: Customer FAQ Library** (2 hours)
- Compile 100 most common customer questions
- Create high-quality answer templates
- Index into RAG for quick retrieval
- **Evidence**: FAQ library in RAG
- **North Star**: Instant answers to common questions

---

### 🎓 P3 - CONTINUOUS LEARNING (Week 3-5)

**Task 12: CEO Feedback Loop** (4 hours)
- Track CEO approve/edit/reject patterns
- Identify response quality gaps
- Refine prompts based on CEO edits
- Measure quality improvement over time
- **Evidence**: Quality trending upward week-over-week
- **North Star**: AI learns from CEO, gets better over time

**Task 13: Hot Rod AN Voice & Tone** (3 hours)
- Analyze Hot Rod AN brand voice (website, emails, social)
- Train agent to match brand personality
- Test for brand consistency (automotive enthusiasm, expertise)
- **Evidence**: Brand voice match >90%
- **North Star**: Authentic Hot Rod AN communication

**Task 14: Seasonal Knowledge Updates** (3 hours)
- Track racing season trends (spring prep, winter storage)
- Update inventory recommendations seasonally
- Adjust marketing messaging for seasons
- **Evidence**: Seasonal intelligence active
- **North Star**: Timely, relevant operator insights

---

### 🔬 P4 - ADVANCED AI CAPABILITIES (Week 4-6)

**Task 15: Multi-Agent Orchestration** (5 hours)
- Coordinate multiple specialized agents (support, sales, tech)
- Route inquiries to appropriate agent
- Combine insights from multiple agents
- **Evidence**: Multi-agent system working
- **North Star**: Sophisticated AI assistance for complex scenarios

**Task 16: Context-Aware Responses** (4 hours)
- Track conversation history per customer
- Reference previous interactions
- Personalize responses based on customer history
- **Evidence**: Context-aware responses tested
- **North Star**: Personalized customer experience

**Task 17: Proactive Agent Suggestions** (4 hours)
- Agent suggests actions without being asked
- Monitor patterns, recommend optimizations
- Alert operator to opportunities (e.g., "low stock on best seller")
- **Evidence**: Proactive suggestions working
- **North Star**: AI partner that thinks ahead for operator

**Task 18: Agent Performance Analytics** (3 hours)
- Track agent accuracy over time
- Measure operator approval rates
- Identify improvement opportunities
- **Evidence**: Analytics dashboard showing agent performance
- **North Star**: Data-driven AI improvement

---

### 🛡️ P5 - QUALITY & SAFETY (Week 5-6)

**Task 19: Response Safety Filters** (3 hours)
- Prevent inappropriate responses
- Filter out hallucinations
- Verify factual accuracy before suggesting
- **Evidence**: Safety filters tested, no inappropriate responses
- **North Star**: Safe AI operators can trust

**Task 20: Bias Detection & Mitigation** (3 hours)
- Test for response bias
- Ensure fair treatment of all customers
- Document bias mitigation strategies
- **Evidence**: Bias audit passing
- **North Star**: Fair, unbiased customer service

---

**Total AI Tasks**: 20 production-aligned tasks (8-10 weeks focused work)  
**Every task supports**: Agent-assisted approvals, Hot Rod AN knowledge, operator efficiency  
**Prioritization**: RAG quality → Agent training → Continuous learning → Advanced capabilities  
**Evidence Required**: Every task logged in `feedback/ai.md` with test queries, quality scores, improvements

**AI Stack**: OpenAI GPT-4 (only), LlamaIndex RAG, Supabase for conversation history

