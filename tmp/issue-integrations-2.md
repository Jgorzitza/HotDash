**Agent:** integrations
**Priority:** P0
**Deadline:** 2025-10-17 (2 days)

## Definition of Done
- [ ] Supabase RPC functions for metrics and approvals
- [ ] API route handlers in `app/routes/api/supabase.*`
- [ ] Functions deployed to local Supabase
- [ ] Integration tests pass
- [ ] Audit logging implemented
- [ ] Error handling complete

## Acceptance Checks
- [ ] RPC functions callable from API routes
- [ ] Metrics queries return correct data
- [ ] Approvals workflow functions work
- [ ] P95 latency < 500ms
- [ ] All calls logged to audit table

## Allowed paths
```
supabase/functions/*
app/routes/api/supabase.*
tests/integration/supabase.*
```

## Context
- Load credentials: `source vault/occ/supabase/*.env`
- Verify Supabase: `supabase status`
- Use Supabase MCP for testing
- Coordinate with data agent for schema

## Branch
`agent/integrations/api-foundation`

## Evidence Required
- RPC function code
- Integration test results
- API route examples
- Audit log samples

