**Agent:** integrations
**Priority:** P0
**Deadline:** 2025-10-17 (2 days)

## Definition of Done
- [ ] Shopify Admin GraphQL queries for revenue, AOV, returns
- [ ] API route handlers in `app/routes/api/shopify.*`
- [ ] Input validation and sanitization
- [ ] Audit logging for all queries
- [ ] Integration tests with staging store
- [ ] Error handling for all error classes
- [ ] curl examples in PR

## Acceptance Checks
- [ ] Queries return correct data from staging store
- [ ] P95 latency < 500ms
- [ ] All queries logged to audit table
- [ ] Error responses are actionable
- [ ] Integration tests pass

## Allowed paths
```
app/routes/api/shopify.*
app/lib/shopify/*
tests/integration/shopify.*
```

## Context
- Load credentials: `source vault/occ/shopify/*.env`
- Use Shopify MCP to validate GraphQL queries
- Implement read-only queries only (no mutations)
- Reference Shopify Admin GraphQL schema

## Branch
`agent/integrations/api-foundation`

## Evidence Required
- Integration test results
- curl examples
- Audit log samples
- Performance metrics

