---
epoch: 2025.10.E1
doc: docs/directions/ai.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# AI — Direction

## Canon
- North Star: docs/NORTH_STAR.md (MCP-First Development)
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Agent Workflow Rules: .cursor/rules/04-agent-workflow.mdc (alwaysApply: true)
- **OpenAI Agent SDK**: https://platform.openai.com/docs/guides/agents (MANDATORY)
- Recommender Specs: docs/specs/recommender-requirements.md
- CEO Voice Reference: hotrodan.com content
- Knowledge Base: artifacts/ai/knowledge-base/

> **CRITICAL - OpenAI Agent SDK (NOT OpenAI API)**: Use Agents API (Assistants v2, Threads, Runs, Function Calling). ALL AI agents require human-in-the-loop approval. Train agents with CEO voice from hotrodan.com.

> **Training Data WARNING**: We are in 2025. Shopify APIs in training are from 2023 (2 YEARS OLD). NEVER trust training data - verify with Shopify MCP.

> **English Only**: All AI outputs and documentation in English (CEO directive)

## Current Sprint Focus — Recommender Implementation (2025-10-14)

**Status**: Specs complete ✅, awaiting Engineer A4 (Execution Engine)  
**Next**: Implement recommenders when A4 unblocks

**Priority 0: Core Recommenders** (Week 2 - 12-15 hours)

1. **C1: SEO CTR Optimizer** (3-4 hours)
   - **OpenAI Agent SDK**: Use Assistants v2 API (NOT Completions API)
   - **Function Calling**: Define tools for GSC data access
   - **Structured Outputs**: Enforce output schema validation
   - Identify low-CTR pages from GSC data
   - Generate improved titles/descriptions
   - Output: 5-10 SEO actions/week
   - Confidence scoring (AI certainty 0-100%)
   - **Human-in-the-Loop**: ALL actions require approval queue
   - **CEO Voice Training**: Match hotrodan.com style/tone
   - Deliverable: `app/services/recommenders/seo-ctr.server.ts`
   
   **Acceptance Criteria**:
   - ✅ Uses OpenAI Agent SDK (Assistants v2, Threads, Runs)
   - ✅ Function calling for data access (not direct queries)
   - ✅ Structured output validation (Zod schema)
   - ✅ Actions route to approval queue (no auto-execute)
   - ✅ CEO can approve/reject with feedback
   - ✅ Agent learns from approval patterns

2. **C2: Metaobject Generator** (3-4 hours)
   - **OpenAI Agent SDK**: Assistants v2 with function calling
   - Generate FAQs, specs, reviews for products
   - Input: Product data + competitor analysis
   - Output: 2-5 metaobject actions/week
   - **Human-in-the-Loop**: CEO approval required
   - Deliverable: `app/services/recommenders/metaobject.server.ts`

3. **F3: Confidence Score Adjustment** (1-2 hours)
   - Auto-adjust weights based on CEO approval patterns
   - Increase confidence for successful recommenders
   - Decrease for inaccurate ones
   - Learn from rejection feedback
   - Deliverable: Learning algorithm

4. **Knowledge Base Preparation** (2-3 hours)
   - Ingest automotive fitment data (for correct product recommendations)
   - Build product catalog index
   - Competitor content analysis
   - **CEO Voice Training**: Ingest hotrodan.com content for style/tone
   - LlamaIndex integration
   - Deliverable: Knowledge base with CEO voice examples

5. **Agent SDK Implementation** (2-3 hours) ⚠️ NEW REQUIREMENT
   - Implement using OpenAI Agents API (NOT Completions)
   - Create Assistant with function calling tools
   - Thread management for conversation context
   - Structured outputs (Zod schema validation)
   - Human-in-the-loop approval integration
   - Reference: https://platform.openai.com/docs/guides/agents
   - Deliverable: Base agent service using Agent SDK

6. **Prompt Engineering & Validation** (2-3 hours)
   - Tune prompts for each recommender
   - Anti-hallucination guards (verify facts with MCP)
   - Output format validation (structured outputs)
   - CEO voice consistency checks
   - Test against known good/bad examples

**Priority 1: Advanced Recommenders** (Week 2-3 - 10-12 hours)

7. **C3: Merch Playbook** (2-3 hours)
   - **OpenAI Agent SDK**: Assistants v2 implementation
   - Optimize collection sort order
   - Featured product recommendations
   - Input: Collection performance + analytics
   - **Human Approval**: ALL merchandising changes require CEO review
   
8. **C4: Guided Selling** (2-3 hours)
   - **OpenAI Agent SDK**: Function calling for purchase data
   - Cross-sell/upsell recommendations
   - Purchase pattern analysis
   - Input: Product affinity data
   - **CEO Voice**: Match hotrodan.com selling style

9. **C5: Core Web Vitals** (2-3 hours)
   - **OpenAI Agent SDK**: Technical recommendations
   - Identify performance issues
   - Recommend fixes (image optimization, lazy loading)
   - Input: Lighthouse data
   - **Human Approval**: Performance changes reviewed by CEO

10. **Human-in-the-Loop Integration** (2-3 hours) ⚠️ NEW REQUIREMENT
    - Build approval queue integration for all AI agents
    - CEO feedback collection system
    - Rejection reason tracking
    - Voice/style learning from CEO edits
    - Confidence adjustment based on approval patterns
    - Deliverable: `app/services/ai/human-loop.server.ts`
    
    **Acceptance**:
    - ✅ All AI outputs route to approval queue
    - ✅ CEO can approve/reject/edit with feedback
    - ✅ System learns from CEO edits
    - ✅ Confidence scores adjust based on approval rate
    - ✅ Agent voice improves toward CEO style

11. **AI Quality Monitoring** (1-2 hours)
    - Track hallucination rate (fact-check against MCP tools)
    - Monitor output quality
    - Auto-alert on degradation
    - CEO approval rate by recommender

12. **Recommender A/B Testing** (2 hours)
    - Test prompt variations
    - Measure CEO approval rate differences
    - Implement winners based on CEO feedback

**Priority 2: Optimization** (Week 3 - 8-10 hours)

13. **J1: Recommender Tuning** (2-3 hours)
    - Adjust prompts based on CEO feedback
    - Improve confidence scoring accuracy based on approval patterns
    
14. **Advanced Confidence Modeling** (2 hours)
    - Machine learning for approval prediction
    - Factor in CEO preferences over time
    
15. **Multi-language Support Prep** (2 hours - framework only)
    - English-first architecture
    - i18n preparation (NO implementation until CEO approval)
    
16. **AI Explainability** (2 hours - rationale quality)
    - Improve "why this action" explanations
    - CEO-friendly language (match hotrodan.com)
    
17. **Cost Optimization** (2 hours - token usage reduction)
    - Cache common queries
    - Reduce token usage per action
    - Optimize Agent SDK calls

## Evidence & Compliance

Report every 2 hours:
```
## YYYY-MM-DDTHH:MM:SSZ — AI: [Recommender] [Status]
**Working On**: [P0 task]
**Progress**: [% or milestone]
**Evidence**: 
- Service: app/services/recommenders/file.ts
- Test outputs: X actions generated
- Approval rate: Y% (from QA testing)
- Confidence: Z% average
**Blockers**: [None or details]
**Next**: [Next recommender]
```

## Success Criteria

**P0 Complete**: C1 SEO CTR generating 5+ actions/week, 60%+ approval rate  
**P1 Complete**: All 5 recommenders operational, Learning loop functional  
**P2 Complete**: Tuned for 70%+ approval, Cost optimized

## Coordination

**With Engineer**: Wait for A4 completion, then implement C1 first  
**With Data**: Use B4-B7 pipelines for recommender inputs  
**With Product**: Validate outputs against operator needs

## Timeline

- Week 1: Prepare (knowledge base, prompts) - 4-6 hours
- Week 2: Core recommenders (C1, C2, F3) - 12-15 hours
- Week 3: Advanced + tuning - 8-10 hours
- **Total**: 24-31 hours

---

**Last Updated**: 2025-10-14T21:20:00Z  
**Start**: Prepare knowledge base now, implement C1 when A4 ready  
**Evidence**: All work in `feedback/ai.md`
