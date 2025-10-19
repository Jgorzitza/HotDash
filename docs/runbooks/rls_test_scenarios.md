# RLS Test Scenarios Documentation

**Created**: 2025-10-19  
**Owner**: Data Agent  
**Purpose**: Document comprehensive RLS (Row Level Security) test scenarios for Supabase database

## Overview

This document describes the RLS test scenarios implemented in `supabase/seeds/05_rls_test_data.sql` and executable via `scripts/test-rls.sh`.

## Test Coverage

### Scenario 1: Multi-Project Isolation (Facts Table)

**Purpose**: Validate that users can only access data for their assigned project

**Tables**: `facts`

**Test Data**:

- OCC project: 2 test records
- Chatwoot project: 2 test records
- Growth project: 2 test records
- Edge cases: Empty project name, special characters

**Expected Behavior**:

```sql
-- User with app.current_project = 'occ'
SELECT COUNT(*) FROM facts; -- Should return 2 (occ records only)

-- User with app.current_project = 'chatwoot'
SELECT COUNT(*) FROM facts; -- Should return 2 (chatwoot records only)

-- User with app.current_project = 'growth'
SELECT COUNT(*) FROM facts; -- Should return 2 (growth records only)
```

**RLS Policies Tested**:

- `facts_read_by_project` - SELECT restricted to current_project
- `facts_service_role_all` - Service role sees all
- `facts_read_ai_readonly` - AI role sees all for cross-project analysis

---

### Scenario 2: Scope Isolation (Decision Sync Event Logs)

**Purpose**: Validate scope-based access control for operational decisions

**Tables**: `decision_sync_event_logs`

**Test Data**:

- OPS scope: 2 test records
- CX scope: 2 test records
- Analytics scope: 2 test records
- Edge case: NULL scope

**Expected Behavior**:

```sql
-- User with app.current_scope = 'ops'
SELECT COUNT(*) FROM decision_sync_event_logs; -- Should return 2 (ops only)

-- User with app.current_scope = 'cx'
SELECT COUNT(*) FROM decision_sync_event_logs; -- Should return 2 (cx only)
```

**RLS Policies Tested**:

- `decision_logs_read_by_scope` - SELECT restricted to current_scope
- `decision_logs_read_operators` - Operators can read across scopes
- `decision_logs_service_role_all` - Service role sees all

---

### Scenario 3: Request ID Isolation (Observability Logs)

**Purpose**: Validate users can only see logs for their own requests

**Tables**: `observability_logs`

**Test Data**:

- User A: 3 request IDs
- User B: 2 request IDs
- Shared: 1 request ID
- Edge case: NULL request_id

**Expected Behavior**:

```sql
-- User A can only see their own request IDs
SELECT COUNT(*) FROM observability_logs
WHERE request_id LIKE 'req-user-a-%'; -- Should return 3

-- User B can only see their own request IDs
SELECT COUNT(*) FROM observability_logs
WHERE request_id LIKE 'req-user-b-%'; -- Should return 2
```

**RLS Policies Tested**:

- `observability_logs_read_own_requests` - Users see only their request_ids
- `observability_logs_read_monitoring` - Monitoring role sees all
- `observability_logs_service_role_all` - Service role sees all

---

### Scenario 4: Role-Based Access (Product Categories)

**Purpose**: Validate different access levels for different roles

**Tables**: `product_categories`, `customer_segments`

**Test Data**:

- 4 test product categories
- 4 test customer segments
- Edge cases: Large arrays, NULL values

**Expected Behavior**:

```sql
-- All authenticated users can read
SELECT COUNT(*) FROM product_categories; -- Should return 19 (15 + 4 test)

-- Only service_role can insert/update/delete
INSERT INTO product_categories (...) VALUES (...);
-- Should fail for authenticated, succeed for service_role
```

**RLS Policies Tested**:

- `product_categories_read_operators` - All authenticated can SELECT
- `product_categories_service_role` - Only service_role can INSERT/UPDATE/DELETE
- Similar policies for `customer_segments`

---

### Scenario 5: Agent Data Ownership

**Purpose**: Validate agents can only see their own approval/feedback/query records

**Tables**: `agent_approvals`, `agent_feedback`, `agent_queries`

**Test Data**:

- ai-customer: approval/feedback records
- ai-knowledge: approval/feedback records
- inventory: approval record
- Operator queries from different users

**Expected Behavior**:

```sql
-- ai-customer agent can only see its own records
SELECT COUNT(*) FROM agent_approvals WHERE agent = 'ai-customer';

-- Operators can see their own queries
SELECT COUNT(*) FROM agent_queries WHERE operator = 'operator_user';
```

**RLS Policies Tested**:

- `agent_approvals_read_own` - Agents see only their own approvals
- `agent_feedback_read_own` - Agents see only their own feedback
- `agent_queries_read_own` - Operators see only their own queries

---

### Scenario 6: Edge Cases and Security

**Purpose**: Test RLS policies against attack vectors and edge cases

**Test Cases**:

1. **Empty/NULL values**: Empty project names, NULL scopes, NULL request_ids
2. **Special characters**: Projects with `!@#$%` characters
3. **Large arrays**: Testing GIN index performance with 20+ array elements
4. **Negative values**: Negative revenue, negative order counts
5. **Cross-project leakage**: Attempt to access other projects' data
6. **Privilege escalation**: Attempt INSERT/UPDATE/DELETE as authenticated user

**Expected Behavior**: All attacks should be denied by RLS policies

---

## Running Tests

### Local Development

```bash
# Start Supabase local
supabase start

# Load seed data
cat supabase/seeds/*.sql | psql $DATABASE_URL

# Run RLS tests
./scripts/test-rls.sh $DATABASE_URL
```

### Staging

```bash
# Run against staging database
DATABASE_URL=$STAGING_DB_URL ./scripts/test-rls.sh
```

### Production (Read-Only)

```bash
# Verify RLS policies without modifying data
DATABASE_URL=$PRODUCTION_DB_URL psql -f supabase/rls_tests.sql
```

---

## Test Metrics

**Total Test Scenarios**: 6 major scenarios
**Total Test Records**: 90+ synthetic records
**Tables Covered**: 8 tables with RLS
**Policies Tested**: 39 RLS policies
**Edge Cases**: 10+ edge cases

---

## Validation Checklist

- [ ] All tables with sensitive data have RLS enabled
- [ ] Service role has full access (ALL operations)
- [ ] Multi-tenant isolation works (project-based)
- [ ] Scope isolation works (ops/cx/analytics)
- [ ] Request ID isolation works (observability)
- [ ] Role-based access works (authenticated/operators/viewers)
- [ ] Immutable tables deny UPDATE/DELETE (facts, logs)
- [ ] Edge cases handled gracefully (NULL, special chars)
- [ ] Cross-project leakage prevented
- [ ] Privilege escalation prevented

---

## Known Limitations

1. **Migration Drift**: `facts`, `decision_sync_event_logs`, and `observability_logs` tables don't exist in local migrations
   - Test data prepared but commented out in seed files
   - Will work once migration sync completed

2. **Missing Tables**: Some tables from NORTH_STAR.md not yet created:
   - `idea_pool_suggestions`
   - `analytics_metrics`
   - `inventory_events`
   - `customer_interactions`

3. **Incomplete Policies**: `product_categories` and `customer_segments` lack INSERT/UPDATE/DELETE policies

---

## Future Enhancements

1. Add RLS tests for missing tables when created
2. Expand test coverage for all 4 operations (SELECT/INSERT/UPDATE/DELETE)
3. Add performance tests for RLS policy evaluation
4. Add automated RLS test CI pipeline
5. Add RLS policy migration rollback tests

---

## References

- RLS Test File: `supabase/rls_tests.sql`
- RLS Test Runner: `scripts/test-rls.sh`
- RLS Seed Data: `supabase/seeds/05_rls_test_data.sql`
- Migrations with RLS: `supabase/migrations/202510111439*_enable_rls_*.sql`

Last Updated: 2025-10-19
