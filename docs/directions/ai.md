---
epoch: 2025.10.E1
doc: docs/directions/ai.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# AI — Direction

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Recommender Specs: docs/specs/recommender-requirements.md
- Knowledge Base: artifacts/ai/knowledge-base/

> **English Only**: All AI outputs and documentation in English (CEO directive)

## Current Sprint Focus — Recommender Implementation (2025-10-14)

**Status**: Specs complete ✅, awaiting Engineer A4 (Execution Engine)  
**Next**: Implement recommenders when A4 unblocks

**Priority 0: Core Recommenders** (Week 2 - 12-15 hours)

1. **C1: SEO CTR Optimizer** (3-4 hours)
   - Identify low-CTR pages from GSC data
   - Generate improved titles/descriptions
   - Output: 5-10 SEO actions/week
   - Confidence scoring (AI certainty 0-100%)
   - Deliverable: `app/services/recommenders/seo-ctr.server.ts`

2. **C2: Metaobject Generator** (3-4 hours)
   - Generate FAQs, specs, reviews for products
   - Input: Product data + competitor analysis
   - Output: 2-5 metaobject actions/week
   - Deliverable: `app/services/recommenders/metaobject.server.ts`

3. **F3: Confidence Score Adjustment** (1-2 hours)
   - Auto-adjust weights based on approval rates
   - Increase confidence for successful recommenders
   - Decrease for inaccurate ones
   - Deliverable: Learning algorithm

4. **Knowledge Base Preparation** (2-3 hours)
   - Ingest automotive fitment data
   - Build product catalog index
   - Competitor content analysis
   - LlamaIndex integration

5. **Prompt Engineering & Validation** (2-3 hours)
   - Tune prompts for each recommender
   - Anti-hallucination guards
   - Output format validation
   - Test against known good/bad examples

**Priority 1: Advanced Recommenders** (Week 2-3 - 10-12 hours)

6. **C3: Merch Playbook** (2-3 hours)
   - Optimize collection sort order
   - Featured product recommendations
   - Input: Collection performance + analytics
   
7. **C4: Guided Selling** (2-3 hours)
   - Cross-sell/upsell recommendations
   - Purchase pattern analysis
   - Input: Product affinity data

8. **C5: Core Web Vitals** (2-3 hours)
   - Identify performance issues
   - Recommend fixes (image optimization, lazy loading)
   - Input: Lighthouse data

9. **AI Quality Monitoring** (1-2 hours)
   - Track hallucination rate
   - Monitor output quality
   - Auto-alert on degradation

10. **Recommender A/B Testing** (2 hours)
    - Test prompt variations
    - Measure approval rate differences
    - Implement winners

**Priority 2: Optimization** (Week 3 - 8-10 hours)

11. **J1: Recommender Tuning** (2-3 hours)
12. **Advanced Confidence Modeling** (2 hours)
13. **Multi-language Support Prep** (2 hours - framework only)
14. **AI Explainability** (2 hours - rationale quality)
15. **Cost Optimization** (2 hours - token usage reduction)

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
