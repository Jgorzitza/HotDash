# Integrations Agent Direction
**Updated**: 2025-10-14
**Priority**: GROWTH SPEC EXECUTION
**Focus**: Build Shopify Automation Layer

## Mission

Build **Shopify integration layer** that enables automated storefront actions. NOT manually updating Shopify - build the SYSTEMS that execute actions automatically.

## Current State (Growth Audit)

**Finding**: No storefront automation (Growth Spec D1-D5)
- No programmatic page factory
- No structured data generation
- No canonical management
- No internal link orchestration
- No search synonym control

**Your Role**: Build Shopify automation that executes Actions

## Priority 0 - Webhook Infrastructure (COORDINATES WITH ENGINEER)

### Task 1: Shopify Webhook Handlers (WITH ENGINEER) (3-4 hours)
**Goal**: Reliable webhook ingestion with HMAC + idempotency

**Requirements** (Growth Spec A3):
- Coordinate with Engineer on implementation
- Provide Shopify API expertise
- Verify HMAC validation
- Test with Shopify MCP

**Your Contribution**:
- [ ] Provide Shopify webhook documentation
- [ ] Verify HMAC implementation
- [ ] Test webhook payloads
- [ ] Shopify MCP validation
- [ ] Document webhook types needed

## Priority 1 - Storefront Automation Executors

### Task 2: Build Page Factory Executor (6-8 hours)
**Goal**: Programmatic page creation/updates

**Requirements** (Growth Spec D1):

```typescript
// app/services/shopify/page-factory.server.ts
class PageFactoryExecutor implements ActionExecutor {
  async execute(action: Action) {
    const { pageType, content, metafields } = action.payload;
    
    // 1. Create/update page via Shopify Admin API
    const page = await shopify.createPage({
      title: content.title,
      body_html: content.body,
      metafields: metafields,
    });
    
    // 2. Add structured data
    await addStructuredData(page.id, content.schema);
    
    // 3. Set canonical URL
    await setCanonical(page.id, content.canonical);
    
    // 4. Return outcome
    return { pageId: page.id, url: page.url };
  }
  
  async rollback(action: Action) {
    // Delete or revert page
  }
}
```

**Deliverables**:
- [ ] Page factory executor implemented
- [ ] Shopify Admin API integration
- [ ] Metafields support
- [ ] Verify with Shopify MCP
- [ ] Integration tests
- [ ] GitHub commit

### Task 3: Build Structured Data Generator (4-6 hours)
**Goal**: SEO schema injection

**Requirements** (Growth Spec D2):

**Supported Schemas**:
- Product schema (price, availability, reviews)
- FAQ schema
- How-to schema
- BreadcrumbList schema
- Organization schema

**Implementation**:
- [ ] Schema generator service
- [ ] Validation against schema.org
- [ ] Injection via Shopify metafields or theme
- [ ] Shopify MCP validation
- [ ] GitHub commit

### Task 4: Build Canonical Manager (3-4 hours)
**Goal**: Automated canonical URL management

**Requirements** (Growth Spec D3):
- Detect duplicate content
- Set canonical tags
- Handle variant pages
- Cross-domain canonicals

**Deliverables**:
- [ ] Canonical detection logic
- [ ] Shopify theme integration
- [ ] Bulk canonical updates
- [ ] Verify with Shopify MCP
- [ ] GitHub commit

### Task 5: Build Internal Link Orchestrator (4-6 hours)
**Goal**: Automated internal linking

**Requirements** (Growth Spec D4):
- Analyze content relevance
- Generate contextual links
- Update page content with links
- Track link graph

**Deliverables**:
- [ ] Link relevance algorithm
- [ ] Content update service
- [ ] Link graph tracking
- [ ] Shopify MCP validation
- [ ] GitHub commit

### Task 6: Build Search Synonym Controller (3-4 hours)
**Goal**: Automated search synonym management

**Requirements** (Growth Spec D5):
- Analyze search queries
- Generate synonym mappings
- Update Shopify search config
- Track search performance

**Deliverables**:
- [ ] Synonym generation logic
- [ ] Shopify search API integration
- [ ] Performance tracking
- [ ] Shopify MCP validation
- [ ] GitHub commit

## Priority 2 - Metaobject Automation

### Task 7: Build Metaobject Executor (4-6 hours)
**Goal**: Create/update metaobjects from AI recommendations

**Requirements** (Growth Spec C2):
```typescript
// app/services/shopify/metaobject-executor.server.ts
class MetaobjectExecutor implements ActionExecutor {
  async execute(action: Action) {
    const { type, definition, entries } = action.payload;
    
    // 1. Create/verify definition
    const def = await shopify.createMetaobjectDefinition(definition);
    
    // 2. Create entries
    const created = await Promise.all(
      entries.map(entry => 
        shopify.createMetaobject({
          type: def.type,
          fields: entry.fields
        })
      )
    );
    
    // 3. Link to products/pages
    await linkMetaobjects(created, action.payload.linkTo);
    
    return { definitionId: def.id, entryIds: created.map(c => c.id) };
  }
}
```

**Deliverables**:
- [ ] Metaobject executor implemented
- [ ] Definition management
- [ ] Entry creation
- [ ] Product/page linking
- [ ] Shopify MCP validation
- [ ] GitHub commit

## Principles for All Work

**Build Executors, Not Execute Manually**:
- ✅ Build page factory executor (creates 100s of pages)
- ❌ Manually create individual Shopify pages (not scalable)

**Build Automation, Not Manual Updates**:
- ✅ Build canonical manager (handles all pages automatically)
- ❌ Manually set canonicals one by one (one-off work)

**Shopify MCP First**:
- Verify ALL Shopify GraphQL with Shopify MCP
- Validate queries before implementation
- Test with conservative token limits
- Never trust training data for Shopify APIs

**Evidence Required**:
- Git commits for all executor code
- Shopify MCP validation screenshots
- Integration test results
- Working executor demonstrations

**Report Every 2 Hours**:
- Update `feedback/integrations.md` with progress
- Log evidence (commits, Shopify MCP validation, tests)
- Escalate blockers immediately
- NO verbatim GraphQL responses (summary only)

## Success Criteria

**Week 1 Complete When**:
- [ ] Webhook handlers operational (HMAC + idempotency)
- [ ] Page factory executor working
- [ ] Structured data generator operational
- [ ] Canonical manager implemented
- [ ] At least 1 additional executor (links/synonyms/metaobjects)
- [ ] All verified with Shopify MCP

**This enables**: AI recommendations can execute automatically on Shopify storefronts

## Blockers to Escalate

- Action API not ready → Engineer agent
- Shopify API rate limits → Deployment agent
- GraphQL schema questions → Use Shopify MCP
- Executor design questions → Product agent

---

**Remember**: You're building the SHOPIFY AUTOMATION LAYER that executes actions, not doing Shopify updates manually. Build systems that scale.
