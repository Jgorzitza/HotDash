# Product Dependency Tracking

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Evidence Path**: `docs/product_dependency_tracking.md` (Dependency map, tracking system, risk assessment)

---

## Dependency Categories

### External Dependencies

- **OpenAI API**: Critical (Agent SDK depends on it)
- **LlamaIndex**: Critical (knowledge base depends on it)
- **Chatwoot**: Critical (customer communication)
- **Shopify API**: Important (for e-commerce customers)

### Internal Dependencies

- **Agent SDK** depends on **LlamaIndex Service**
- **Dashboard** depends on **Metrics API**
- **Multi-Agent** depends on **Agent SDK v1.0 success**

**Risk Assessment**:

- OpenAI outage = system unusable → Mitigation: Fallback to manual queue
- LlamaIndex issues = poor draft quality → Mitigation: Cache common KB queries

**Document Path**: `docs/product_dependency_tracking.md`
**Status**: Dependency map with risk mitigation
