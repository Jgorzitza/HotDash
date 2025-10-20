# Idea Pool Supabase Activation — Feature Flag

## Purpose

Enable production Supabase-backed queries for `/api/analytics/idea-pool` once Data migrations are live. Default behavior remains fixture-backed to protect dashboard stability until migrations are applied.

## Prerequisites

1. **Data Migrations Applied**: Data agent must confirm Supabase migrations are live for:
   - `product_suggestions` table
   - `content_performance` table
   - `trend_opportunities` table
   - `product_collections` table
   - `user_generated_content` table

2. **Supabase Credentials**: Environment variables must be configured:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (or `SUPABASE_ANON_KEY` for client-side)

3. **Contract Test Passing**: Verify contract test passes locally:
   ```bash
   npx vitest run tests/integration/idea-pool.api.spec.ts
   ```
   Expected: 13/13 tests passing

## Feature Flag Configuration

The idea pool route supports two feature flag prefixes:

### Prefix 1: `FEATURE_SUPABASE_IDEA_POOL` (Recommended)

```bash
export FEATURE_SUPABASE_IDEA_POOL=1
```

### Prefix 2: `FEATURE_FLAG_SUPABASE_IDEA_POOL` (Legacy)

```bash
export FEATURE_FLAG_SUPABASE_IDEA_POOL=1
```

Both prefixes are detected by the `isFeatureEnabled()` and `getFeatureFlag()` utilities in `app/config/featureFlags.ts`.

## Activation Steps

### Step 1: Verify Prerequisites ✅

```bash
# Confirm Data migrations applied
# (Check with Data agent or run migration status check)

# Verify Supabase credentials
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# Verify contract tests pass
npx vitest run tests/integration/idea-pool.api.spec.ts
```

Expected output: `✓ tests/integration/idea-pool.api.spec.ts (13 tests) Xms`

### Step 2: Enable Feature Flag 🚀

**Development/Staging**:

```bash
export FEATURE_SUPABASE_IDEA_POOL=1
```

**Production (Fly.io)**:

```bash
fly secrets set FEATURE_SUPABASE_IDEA_POOL=1 --app hotdash
```

### Step 3: Verify Activation ✅

```bash
# Call the API endpoint
curl -sSL "https://admin.shopify.com/store/hotroddash/apps/hotdash/api/analytics/idea-pool" | jq '.data.source'
```

**Expected output when Supabase integration is implemented**:

```json
"supabase"
```

**Current output (until Supabase integration code is added)**:

```json
"fixture"
```

with `fallback_reason`: "Supabase integration pending Data migrations"

### Step 4: Monitor Logs 📊

```bash
# Development
npm run dev
# Watch for console.warn messages about fixture fallback

# Production
fly logs --app hotdash | grep "FEATURE_SUPABASE_IDEA_POOL"
```

## Rollback Procedure

### Option 1: Disable Feature Flag

**Development/Staging**:

```bash
unset FEATURE_SUPABASE_IDEA_POOL
# or
export FEATURE_SUPABASE_IDEA_POOL=0
```

**Production**:

```bash
fly secrets unset FEATURE_SUPABASE_IDEA_POOL --app hotdash
```

### Option 2: Verify Rollback

```bash
# Call API again
curl -sSL "$BASE_URL/api/analytics/idea-pool" | jq '.data.source'
```

**Expected output**: `"fixture"`

### Step 5: Document Rollback

Update `feedback/integrations/{YYYY-MM-DD}.md` with:

- Timestamp of rollback
- Reason for rollback
- Error context (if applicable)
- Next steps

## Testing Checklist

Before activating feature flag in production:

- [ ] Data migrations applied and verified
- [ ] Supabase credentials configured
- [ ] Contract test passing (13/13 tests)
- [ ] Feature flag tested in development
- [ ] API returns expected `source: "supabase"` (or appropriate fallback message)
- [ ] Rollback procedure tested and documented
- [ ] Manager approved activation

## Notes

- **Current State**: Route always falls back to fixtures until Supabase integration code is implemented (see TODO comments in `app/routes/api.analytics.idea-pool.ts`)
- **Graceful Degradation**: Route will never return a 500 error - it always falls back to fixtures if Supabase queries fail
- **Idea Pool Requirements**:
  - Exactly 5 ideas at all times
  - Exactly 1 wildcard
  - Valid types: launch, evergreen, wildcard
  - Valid statuses: draft, approved, pending_review, rejected
  - Valid priorities: low, medium, high, urgent

## References

- **API Route**: `app/routes/api.analytics.idea-pool.ts`
- **Contract Test**: `tests/integration/idea-pool.api.spec.ts`
- **Feature Flags**: `app/config/featureFlags.ts`
- **Fixture Data**: `app/fixtures/content/idea-pool.json`
- **Direction**: `docs/directions/integrations.md`
- **North Star**: `docs/NORTH_STAR.md` (Idea Pool section)

## Change Log

- **2025-10-20**: Initial documentation created for Issue #110
