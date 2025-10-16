# AI-Customer KB Search Integration Plan

## Integration Approach
1. AI-Customer calls consumeKBSearch() hook
2. Hook queries MCP server or local index
3. Returns relevant KB articles
4. AI-Customer uses for context in responses

## Implementation
- Hook: app/lib/support/ai-customer-integration.ts
- Test queries: app/lib/support/test-queries.fixtures.ts
- MCP server: hotdash-llamaindex-mcp.fly.dev

## Timeline
- Phase 1: MCP server queries (ready now)
- Phase 2: Local index (when embeddings resolved)
- Phase 3: Hybrid approach (best of both)
