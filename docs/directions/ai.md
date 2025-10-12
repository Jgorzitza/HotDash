---
epoch: 2025.10.E1
doc: docs/directions/ai.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# AI Agent — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. AI agent must not self-author direction documents; request adjustments via manager with evidence.

## Local Execution Policy (Auto-Run)

You are authorized to run local, non-interactive commands and scripts without asking for approval each time. Follow these guardrails:

- Scope and safety
  - Operate inside /home/justin/HotDash/hot-dash and local dev services (Supabase on 127.0.0.1).
  - Do not change remote infrastructure or git history under this policy. Status/read-only checks are okay.
  - Never run destructive ops (rm -rf outside project, docker system prune, sudo apt, etc.).

- Non-interactive only
  - Add flags to avoid prompts; do not use interactive shells or editors.
  - Disable pagers (git --no-pager; pipe long output to files). Never invoke less/man/vim.

- Evidence logging
  - For each action, record timestamp, command, and output/artifact path(s) in feedback/ai.md.
  - Save large outputs under artifacts/ai/... and link the paths.

- Secrets handling
  - Load secrets from vault or environment; never print secret values. Reference variable names only.

- Tooling specifics
  - Supabase: use npx supabase; allowed: status/start/stop/reset on local; no remote project ops.
  - Git/GH: allowed: status, diff, grep with --no-pager; not allowed: commit/push/force-push under auto-run.
  - Prefer ripgrep (rg) if available; otherwise use grep -nE.

- Retry and escalate
  - Retry a failing step up to 2 times with small adjustments; then escalate in feedback with logs attached.

- Assist with copy generation, templated replies, and anomaly summaries only after ingesting latest facts from Memory.
- Log every AI-produced recommendation (template variant, brief, insight) with inputs/outputs to packages/memory (scope `build`).
- Enforce guardrails: no direct production writes; route actions through engineer-owned approval flows.
- Keep prompt libraries versioned under app/prompts/ with changelog and evaluation metrics.
- Run daily prompt regression using mock datasets; attach BLEU/ROUGE + qualitative notes to feedback/ai.md.
- Flag hallucination or bias risks immediately; propose mitigation experiments before expanding coverage.
- Stack guardrails: adhere to `docs/directions/README.md#canonical-toolkit--secrets` (Supabase as the only Postgres target, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex tooling); do not introduce alternate providers or alternate LlamaHub connectors without approval.
- Build prompts/tools against the documented APIs: docs/dev/admin-graphql.md (admin data) and docs/dev/storefront-mcp.md (storefront MCP).
- Start executing assigned tasks immediately; report progress or blockers in `feedback/ai.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-10
Work every task to completion—do not hand off after identifying a gap. Capture the command you ran, the output, and the timestamp in `feedback/ai.md`. Retry each failed command twice before escalating with logs attached.

## Aligned Task List — 2025-10-11 (Updated: Manager Decision - LlamaIndex MCP Architecture)

### ✅ COMPLETED (2025-10-11)
- ✅ Pipeline blueprint (`docs/runbooks/llamaindex_workflow.md`)
- ✅ CLI scaffolding (`scripts/ai/llama-workflow/`)
- ✅ Loader implementation (Sitemap, Supabase, Curated replies)
- ✅ MCP tools defined (`docs/mcp/tools/llamaindex.json`)
- ✅ Nightly job + evaluations

**Status**: LlamaIndex workflow operational. Now deploying as MCP server for universal access.

---

### 🚀 NEW PRIORITY: Support Engineer with LlamaIndex MCP Server (Week 1-2)

**Manager Decision**: Transform LlamaIndex workflow into HTTP MCP server for Agent SDK integration.

**Your Role**: Support Engineer agent with LlamaIndex expertise, optimization, and testing.

#### Task 1: Review Engineer's MCP Server Implementation
**What Engineer is building**: `apps/llamaindex-mcp-server/` - thin HTTP wrapper around your `scripts/ai/llama-workflow/` CLI

**Your responsibilities**:
1. **Code review** Engineer's MCP handler implementations
2. **Validate** that CLI calls are correct and efficient
3. **Test** MCP server responses match CLI output
4. **Optimize** query performance if needed

**Evidence**: Review notes in `feedback/ai.md`, any optimization PRs

#### Task 2: Improve Query Performance
**Goal**: Ensure <500ms P95 response time for MCP queries

**Actions**:
- Profile current `llama-workflow query` performance
- Optimize vector search parameters (topK, similarity threshold)
- Cache frequently accessed documents
- Implement query result caching (5-minute TTL)

**Evidence**: 
- Performance benchmarks before/after
- Caching strategy document
- Updated `docs/runbooks/llamaindex_workflow.md`

#### Task 3: Enhance Training Data Collection
**Goal**: Support Agent SDK feedback loop

**Implementation**:
```typescript
// Add to llama-workflow
export async function logQuery(query: string, result: string, metadata: {
  conversationId: number;
  agent: string;
  approved: boolean;
  humanEdited?: string;
}) {
  // Store in Supabase for training
  await supabase.from('agent_queries').insert({
    query,
    result,
    conversation_id: metadata.conversationId,
    agent: metadata.agent,
    approved: metadata.approved,
    human_edited: metadata.humanEdited,
    created_at: new Date().toISOString(),
  });
}
```

**Evidence**: Training data schema, ingestion pipeline, sample logs

#### Task 4: Create Evaluation Golden Dataset
**Goal**: Ensure agent responses meet quality bar

**Actions**:
1. Create `scripts/ai/llama-workflow/eval/agent-qa-dataset.jsonl`
2. Add 50+ test cases covering:
   - Shipping policy questions
   - Return/refund procedures
   - Product specifications
   - Troubleshooting guides
3. Run evaluation suite weekly
4. Report BLEU/ROUGE/Citation accuracy

**Evidence**: 
- Golden dataset file
- Evaluation results
- Quality threshold definitions (BLEU >0.3, ROUGE-L >0.4)

#### Task 5: Monitor MCP Server Health
**Goal**: Ensure 99% uptime once deployed

**Actions**:
- Add health check endpoint to MCP server
- Monitor query latency, error rates
- Alert on index staleness (>24h)
- Document runbook for common issues

**Evidence**:
- Monitoring dashboard access
- Alert configurations
- Incident runbook

---

### Coordination with Engineer Agent

**Engineer owns**:
- MCP server HTTP implementation
- Fly.io deployment
- Agent SDK integration
- Approval queue UI

**AI agent (you) owns**:
- LlamaIndex query optimization
- Training data pipeline
- Evaluation framework
- Knowledge base quality

**Communication**:
- Daily sync in `feedback/ai.md` and `feedback/engineer.md`
- Tag each other with @ai or @engineer for questions
- Escalate blockers to manager immediately

---

### Evidence Logging
Log all activities in `feedback/ai.md` with:
- Timestamp
- Action taken
- Performance metrics
- Optimization results
- Test results
- Coordination notes

Example:
```
## 2025-10-12T09:00:00Z — LlamaIndex MCP Optimization

**Action**: Profiled query_support performance
- Baseline: 850ms P95
- After caching: 320ms P95 (-62%)
- Cache hit rate: 78%

**Evidence**: artifacts/ai/20251012T0900Z/perf-report.json

**Coordination**: Shared results with @engineer, MCP server ready for deployment
```

---

**PRIORITY**: Support Engineer with LlamaIndex MCP implementation this week. Optimize, test, monitor.

---

### 🚀 ADDITIONAL PARALLEL TASKS (While Waiting for Engineer MCP Deployment)

**Since Task 1 complete, execute these in parallel while Engineer builds MCP server**:

**Task A: Knowledge Base Content Audit** - Review current RAG content quality
- Audit data/ directory content for completeness
- Identify gaps in FAQ coverage
- Review Supabase curated replies for quality
- Document content improvement recommendations
- Coordinate: Tag @support for content gaps
- Evidence: Content audit report in feedback/ai.md

**Task B: Agent Response Template Library** - Create reusable templates
- Create response templates for common questions (shipping, returns, order status)
- Document template variables and customization points
- Ensure templates follow brand voice
- Store in scripts/ai/llama-workflow/templates/
- Evidence: Template library with 10+ templates

**Task C: Training Data Quality Analysis** - Analyze existing LlamaIndex queries
- Review query logs from llama-workflow
- Identify common query patterns
- Document frequently asked questions
- Recommend index optimization based on usage
- Evidence: Quality analysis report

**Task D: Agent SDK Integration Documentation** - Document how agents will use LlamaIndex MCP
- Create usage guide for Agent SDK calling LlamaIndex MCP
- Document expected response formats
- Create troubleshooting guide
- Provide example queries and responses
- Evidence: Integration guide in docs/

Execute A, B, C, D in any order. All are independent and don't block on Engineer.

---

### 🚨 URGENT ADDITION: Task from Support Agent

**Task E: Knowledge Base Content Creation** (REASSIGNED FROM SUPPORT)
- Create data/support/shipping-policy.md (return window, procedures, costs)
- Create data/support/refund-policy.md (eligibility, process, timelines)
- Create data/support/product-troubleshooting.md (common issues, solutions)
- Create data/support/order-tracking.md (how to track, common delays)
- Create data/support/exchange-process.md (eligibility, steps)
- Create data/support/common-questions-faq.md (top 20 customer questions)
- Format: Markdown, clear sections, scannable by LlamaIndex
- Coordinate: Tag @support for operational review when done
- Evidence: 6+ content files created

**Priority**: HIGH (needed for LlamaIndex RAG quality)

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task F: Prompt Engineering for Agent SDK**
- Create system prompts for triage, order, and product agents
- Design prompt templates with variable injection
- Test prompt effectiveness with sample conversations
- Document prompt optimization process
- Evidence: Prompt library with test results

**Task G: Agent Response Quality Monitoring**
- Create automated quality scoring system
- Implement BLEU/ROUGE metrics for responses
- Design real-time quality dashboard
- Document quality thresholds and alerts
- Evidence: Quality monitoring system

**Task H: LlamaIndex Index Optimization**
- Optimize vector search parameters (topK, similarity)
- Implement semantic caching
- Tune embedding model settings
- Benchmark query performance improvements
- Evidence: Optimization report with metrics

**Task I: Agent Conversation Context Management**
- Design context window management for multi-turn conversations
- Implement conversation memory optimization
- Create context summarization strategies
- Document context limits and handling
- Evidence: Context management framework

**Task J: AI Safety and Guardrails**
- Design content safety filters for agent responses
- Implement PII detection and redaction
- Create policy compliance checks
- Document safety violation handling
- Evidence: Safety framework with test cases

**Task K: Model Fine-tuning Preparation**
- Design data collection pipeline for fine-tuning
- Create data labeling guidelines
- Document fine-tuning dataset requirements
- Plan for model versioning and A/B testing
- Evidence: Fine-tuning preparation guide

Execute E immediately (urgent), then F-K in any order.

---

### 🚀 THIRD MASSIVE EXPANSION (Another 20 Tasks)

**Task L-Q: Advanced AI Features** (6 tasks)
- L: Design multi-agent orchestration patterns
- M: Create agent specialization and routing logic
- N: Implement conversational memory and context tracking
- O: Design agent personality and tone customization
- P: Create dynamic prompt generation based on context
- Q: Implement agent capability discovery and documentation

**Task R-W: Model Operations** (6 tasks)
- R: Design model deployment and rollout strategy
- S: Create model performance monitoring and alerting
- T: Implement automated model evaluation pipeline
- U: Design shadow mode testing for new models
- V: Create model fallback and graceful degradation
- W: Implement cost optimization for LLM calls

**Task X-AC: Training & Improvement** (8 tasks)
- X: Design automated training data curation pipeline
- Y: Create active learning system for hard examples
- Z: Implement human-in-the-loop labeling workflow
- AA: Design model comparison and selection framework
- AB: Create synthetic data generation for edge cases
- AC: Implement continuous model improvement cycle

Execute L-AC in any order. Total: 35 tasks, ~20-25 hours work.

---

### 🚀 SIXTH MASSIVE EXPANSION (Another 25 Tasks)

**Task AD-AH: AI Safety & Ethics** (5 tasks)
- AD: Design AI bias detection and mitigation
- AE: Create AI explainability framework
- AF: Implement AI fairness metrics
- AG: Design AI safety testing protocols
- AH: Create AI ethics guidelines

**Task AI-AM: Production AI Systems** (5 tasks)
- AI: Design multi-model ensemble strategies
- AJ: Create model hot-swapping infrastructure
- AK: Implement model blue-green deployments
- AL: Design model canary releases
- AM: Create model rollback procedures

**Task AN-AR: AI Operations** (5 tasks)
- AN: Design prompt engineering workflow
- AO: Create prompt versioning and A/B testing
- AP: Implement prompt performance tracking
- AQ: Design context injection strategies
- AR: Create token usage optimization

**Task AS-AW: Advanced RAG** (5 tasks)
- AS: Design hybrid search (vector + keyword)
- AT: Create query expansion and rewriting
- AU: Implement retrieval result reranking
- AV: Design contextual chunking strategies
- AW: Create RAG evaluation metrics

**Task AX-BA: Knowledge Management** (5 tasks)
- AX: Design knowledge graph integration
- AY: Create entity extraction and linking
- AZ: Implement temporal knowledge updates
- BA: Design knowledge provenance tracking
- BB: Create knowledge quality scoring

Execute AD-BB in any order. Total: 60 tasks, ~35-40 hours work.

---

## 🚨 LAUNCH CRITICAL REFOCUS (2025-10-11T22:50Z)

**CEO Decision**: Emergency refocus on launch gates

**Your Status**: PAUSED - Stand by until launch gates complete

**Why PAUSED**: Launch gates require Engineer, QA, Designer, Deployment work. Your tasks are valuable but not launch-blocking.

**When to Resume**: After all 7 launch gates complete (~48-72 hours)

**What to Do Now**: Stand by, review your completed work quality, ensure evidence is documented

**Your tasks remain in direction file - will resume after launch.**

---

## ✅ BLOCKER CLEARED (2025-10-11T23:20Z)

**Engineer Update**: Your blockers are CLEARED! 🎉

**What's Ready**:
- LlamaIndex MCP Server: DEPLOYED and WORKING
- Webhook Endpoints: LIVE and TESTED

**Your Action**: Resume blocked tasks immediately + continue with your task list

**Evidence**: Test the new functionality, document results, continue with remaining tasks

**Timeline**: No more waiting - execute now
