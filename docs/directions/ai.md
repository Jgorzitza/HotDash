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

**Priority 0: Pre-Launch RAG Training** (Complete BEFORE recommenders - 8-10 hours)

1. **Historical Chatwoot Data Ingestion** ⚠️ CRITICAL (3-4 hours)
   - **Goal**: Train agents on past customer interactions BEFORE launch
   - Read ALL previous customer emails from Chatwoot
   - Read ALL past agent responses from Chatwoot
   - Extract: Customer questions, agent answers, resolution patterns
   - **Multimodal**: Include customer screenshots/photos (common in support)
   - Store in LlamaIndex RAG for agent training
   - Deliverable: RAG populated with historical customer data
   - **Coordinate with**: Chatwoot agent (data access), Data agent (ETL)
   
   **Acceptance Criteria**:
   - ✅ All historical Chatwoot conversations ingested
   - ✅ Customer photos/screenshots extracted and indexed
   - ✅ Agent responses available for CEO voice learning
   - ✅ RAG queryable (test: "How do past agents handle X?")
   - ✅ Minimum 100+ conversations indexed before launch

2. **Multimodal Support Implementation** (3-4 hours)
   - **Reference**: https://cookbook.openai.com/examples/multimodal/image_understanding_with_rag
   - **Vision API**: GPT-5 with image understanding
   - Image encoding (base64)
   - Image + text analysis combined
   - Handle: Screenshots (error messages), photos (product issues), diagrams
   - Deliverable: `app/services/ai/multimodal.server.ts`
   
   **Acceptance Criteria**:
   - ✅ Accept image uploads in customer requests
   - ✅ Analyze images with Vision API
   - ✅ Combine image sentiment with text
   - ✅ Store image analysis in RAG context
   - ✅ Test: Customer sends screenshot of error → Agent understands issue

3. **Chatwoot Integration Verification** (2 hours)
   - Verify Chatwoot API access (conversations, messages, attachments)
   - Test image download from Chatwoot
   - Verify webhook delivers image URLs
   - Ensure agent can access conversation history
   - Deliverable: Complete Chatwoot data pipeline
   
   **Acceptance**:
   - ✅ Can query past conversations
   - ✅ Can download customer images
   - ✅ Webhook includes attachment metadata
   - ✅ Real-time access to ongoing conversations

**Priority 1: Core Recommenders** (Week 2 - 12-15 hours)

4. **C1: SEO CTR Optimizer** (3-4 hours)
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

5. **C2: Metaobject Generator** (3-4 hours)
   - **OpenAI Agent SDK**: Assistants v2 with function calling
   - **Multimodal**: Analyze product photos for description generation
   - Generate FAQs, specs, reviews for products
   - Input: Product data + competitor analysis + images
   - Output: 2-5 metaobject actions/week
   - **Human-in-the-Loop**: CEO approval required
   - Deliverable: `app/services/recommenders/metaobject.server.ts`

6. **F3: Confidence Score Adjustment** (1-2 hours)
   - Auto-adjust weights based on CEO approval patterns
   - Increase confidence for successful recommenders
   - Decrease for inaccurate ones
   - Learn from rejection feedback
   - Deliverable: Learning algorithm

7. **Knowledge Base Preparation** (2-3 hours)
   - Ingest automotive fitment data (for correct product recommendations)
   - Build product catalog index
   - Competitor content analysis
   - **CEO Voice Training**: Ingest hotrodan.com content for style/tone
   - LlamaIndex integration
   - Deliverable: Knowledge base with CEO voice examples

8. **Agent SDK Implementation** (2-3 hours) ⚠️ NEW REQUIREMENT
   - Implement using OpenAI Agents API (NOT Completions)
   - Create Assistant with function calling tools
   - Thread management for conversation context
   - Structured outputs (Zod schema validation)
   - Human-in-the-loop approval integration
   - **Multimodal**: Enable vision for image understanding
   - Reference: https://platform.openai.com/docs/guides/agents
   - Deliverable: Base agent service using Agent SDK with vision

9. **Prompt Engineering & Validation** (2-3 hours)
   - Tune prompts for each recommender
   - Anti-hallucination guards (verify facts with MCP)
   - Output format validation (structured outputs)
   - CEO voice consistency checks
   - **Multimodal prompts**: Instructions for image analysis
   - Test against known good/bad examples (text + images)

**Priority 1: Advanced Recommenders** (Week 2-3 - 10-12 hours)

10. **C3: Merch Playbook** (2-3 hours)
    - **OpenAI Agent SDK**: Assistants v2 implementation
    - **Multimodal**: Analyze product images for placement optimization
    - Optimize collection sort order
    - Featured product recommendations
    - Input: Collection performance + analytics + product images
    - **Human Approval**: ALL merchandising changes require CEO review
   
11. **C4: Guided Selling** (2-3 hours)
    - **OpenAI Agent SDK**: Function calling for purchase data
    - **Multimodal**: Analyze product photos for cross-sell suggestions
    - Cross-sell/upsell recommendations
    - Purchase pattern analysis
    - Input: Product affinity data + images
    - **CEO Voice**: Match hotrodan.com selling style

12. **C5: Core Web Vitals** (2-3 hours)
    - **OpenAI Agent SDK**: Technical recommendations
    - **Multimodal**: Analyze page screenshots for performance issues
    - Identify performance issues
    - Recommend fixes (image optimization, lazy loading)
    - Input: Lighthouse data + page screenshots
    - **Human Approval**: Performance changes reviewed by CEO

13. **Human-in-the-Loop Integration** (2-3 hours) ⚠️ NEW REQUIREMENT
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

14. **AI Quality Monitoring** (1-2 hours)
    - Track hallucination rate (fact-check against MCP tools)
    - Monitor output quality
    - Auto-alert on degradation
    - CEO approval rate by recommender
    - **Multimodal quality**: Image understanding accuracy

15. **Recommender A/B Testing** (2 hours)
    - Test prompt variations (text + image prompts)
    - Measure CEO approval rate differences
    - Implement winners based on CEO feedback

**Priority 2: Optimization** (Week 3 - 10-12 hours)

16. **J1: Recommender Tuning** (2-3 hours)
    - Adjust prompts based on CEO feedback
    - Improve confidence scoring accuracy based on approval patterns
    - Tune multimodal prompts for better image understanding
    
17. **Advanced Confidence Modeling** (2 hours)
    - Machine learning for approval prediction
    - Factor in CEO preferences over time
    - Consider image vs text-only context in scoring
    
18. **Multi-language Support Prep** (2 hours - framework only)
    - English-first architecture
    - i18n preparation (NO implementation until CEO approval)
    
19. **AI Explainability** (2 hours - rationale quality)
    - Improve "why this action" explanations
    - CEO-friendly language (match hotrodan.com)
    - Explain image analysis in plain language
    
20. **Cost Optimization** (2-3 hours - token usage reduction)
    - Cache common queries
    - Reduce token usage per action
    - Optimize Agent SDK calls
    - Efficient image encoding (compress before sending)
    - Smart image analysis (only when needed)

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

- **Week 1 (P0)**: RAG Training + Multimodal + Chatwoot integration - 8-10 hours
- **Week 2 (P1)**: Core recommenders (C1, C2) + Agent SDK + Prompts - 14-18 hours
- **Week 3 (P1-P2)**: Advanced recommenders (C3, C4, C5) + Human-loop - 12-15 hours
- **Week 4 (P2)**: Monitoring + A/B testing + Tuning - 10-12 hours
- **Total**: 44-55 hours over 4 weeks

**Critical Path**: 
1. Historical data ingestion FIRST (enables CEO voice learning)
2. Multimodal support (customers send images)
3. Then recommenders (after A4 Execution Engine complete)

---

**Last Updated**: 2025-10-14T21:30:00Z  
**Start**: Historical Chatwoot data ingestion (P0 Task 1) - BEFORE launch  
**Evidence**: All work in `feedback/ai.md`

**CRITICAL**: Complete P0 tasks 1-3 (RAG + Multimodal + Chatwoot) BEFORE implementing recommenders. Agents must learn from past customer interactions first.
