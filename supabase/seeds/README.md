# Supabase Seed Data

**Purpose**: Synthetic test data for local development and RLS testing

**Usage**:
```bash
# Apply all seed files
psql $DATABASE_URL -f supabase/seeds/01_users.sql
psql $DATABASE_URL -f supabase/seeds/02_hot_rodan_data.sql
psql $DATABASE_URL -f supabase/seeds/03_agent_data.sql
psql $DATABASE_URL -f supabase/seeds/04_facts_and_logs.sql
psql $DATABASE_URL -f supabase/seeds/05_rls_test_data.sql

# Or apply all at once
cat supabase/seeds/*.sql | psql $DATABASE_URL
```

## Seed Files

### 01_users.sql
Test users with different roles:
- Admin user (full access)
- Operator user (read-only + operations)
- Viewer user (read-only)
- RLS test users (for policy validation)

### 02_hot_rodan_data.sql
Hot Rodan automotive parts data:
- product_categories (engine parts, restoration parts, custom fab)
- customer_segments (DIY builders, professional shops, enthusiasts)

### 03_agent_data.sql
AI agent data:
- agent_approvals (sample approval workflows)
- agent_feedback (graded responses)
- agent_queries (operator queries with responses)

### 04_facts_and_logs.sql
Audit and analytics data:
- facts (multi-tenant project data)
- decision_sync_event_logs (scope-based decision logs)
- observability_logs (request tracking)

### 05_rls_test_data.sql
Comprehensive RLS test scenarios:
- Multi-tenant isolation tests
- Role-based access tests
- Cross-project data leakage tests
- Edge cases for RLS policies

## Data Volume

- **Development**: Minimal data for functionality testing (~50 rows per table)
- **RLS Testing**: Comprehensive coverage of policy scenarios (~200 rows per table)
- **Performance Testing**: Not included here (use separate performance seed script)

## Safety

⚠️ **This data is for LOCAL DEVELOPMENT ONLY**
- Do NOT apply to staging or production
- All data is synthetic and publicly visible
- Uses hardcoded test values
- Passwords are plaintext for testing

## Maintenance

- Update seeds when schema changes
- Keep aligned with migration files
- Document any table relationships
- Include foreign key references

Last Updated: 2025-10-19

