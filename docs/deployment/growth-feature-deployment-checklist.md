---
epoch: 2025.10.E1
doc: docs/deployment/growth-feature-deployment-checklist.md
owner: deployment
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Growth Feature Deployment Checklist

**Owner**: Deployment Agent  
**Purpose**: Systematic deployment procedures for growth automation features  
**Status**: Ready for when features are implemented

---

## Pre-Deployment Requirements

### Code Readiness

- [ ] Feature implemented and tested locally
- [ ] Unit tests passing (100% coverage on new code)
- [ ] E2E tests passing (critical paths covered)
- [ ] Code review approved
- [ ] Merged to main branch

### Database Readiness

- [ ] Migrations created and tested locally
- [ ] Migration rollback scripts prepared
- [ ] Data backfill scripts ready (if needed)
- [ ] RLS policies defined and tested
- [ ] Performance indexes added

### Infrastructure Readiness

- [ ] Fly.io resources sized appropriately
- [ ] Auto-scaling configured (if needed)
- [ ] Secrets configured in all environments
- [ ] Health check endpoints implemented
- [ ] Monitoring dashboards prepared

---

## Action System Deployment

**Reference**: Growth Spec Section B (B1-B7)

### Prerequisites

- [ ] Action schema (Prisma model) merged
- [ ] Action API routes implemented (`/api/actions/*`)
- [ ] Executor services coded and tested
- [ ] Action lifecycle management ready

### Deployment Steps

#### 1. Database Migration

```bash
# Deploy Action schema to Supabase
cd ~/HotDash/hot-dash

# Verify migration locally first
npx supabase migration list
npx supabase db push

# Apply to staging via MCP
# Use mcp_supabase_apply_migration tool

# Verify tables created
# Use mcp_supabase_list_tables tool

# Check RLS policies
# Use mcp_supabase_get_advisors type:security
```

**Verification**:
- [ ] `actions` table created
- [ ] `action_executors` table created
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] No security advisories

#### 2. Deploy API Routes

```bash
# Trigger staging deployment
gh workflow run deploy-staging.yml

# Monitor deployment
gh run watch

# Verify health checks
curl -f https://hotdash-staging.fly.dev/health

# Test Action API endpoints
curl -f https://hotdash-staging.fly.dev/api/actions
```

**Verification**:
- [ ] Deployment successful
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] No errors in logs

#### 3. Deploy Executor Services

```bash
# If executors are separate services:
# Create new Fly app for executors

source vault/occ/fly/api_token.env
~/.fly/bin/fly apps create hotdash-action-executor --org personal

# Configure secrets
~/.fly/bin/fly secrets set \
  DATABASE_URL="..." \
  SUPABASE_URL="..." \
  SUPABASE_SERVICE_KEY="..." \
  -a hotdash-action-executor

# Deploy
# (deployment process TBD based on executor architecture)
```

**Verification**:
- [ ] Executor service running
- [ ] Processing actions from queue
- [ ] Success rate >95%
- [ ] Error alerting configured

---

## Data Pipeline Deployment

**Reference**: Growth Spec Section A (A1-A7)

### Google Analytics Pipeline

#### Prerequisites

- [ ] GA BigQuery integration code complete
- [ ] Organic search filtering implemented
- [ ] Anomaly detection (wowDelta) implemented
- [ ] Data freshness labeling ready

#### Deployment Steps

```bash
# 1. Verify Google credentials
source vault/occ/fly/api_token.env
~/.fly/bin/fly secrets list -a hotdash-staging | grep GOOGLE

# 2. Deploy updated GA service
gh workflow run deploy-staging.yml

# 3. Test GA data fetching
curl -f https://hotdash-staging.fly.dev/api/analytics/sessions

# 4. Verify data quality
# Check dashboard for:
# - Organic search filtering working
# - WoW delta calculations
# - Freshness labels present
```

**Verification**:
- [ ] GA data flowing
- [ ] Organic search filtered
- [ ] Anomaly detection working
- [ ] Dashboard updated

### Google Search Console Pipeline

#### Prerequisites

- [ ] GSC BigQuery jobs implemented
- [ ] Data ingestion code complete
- [ ] Query performance tracking ready

#### Deployment Steps

```bash
# 1. Configure BigQuery credentials (if different from GA)
source vault/occ/google/analytics-service-account.json
# Verify permissions include BigQuery

# 2. Deploy GSC service code
gh workflow run deploy-staging.yml

# 3. Test GSC data fetching
# API endpoint TBD based on implementation

# 4. Verify BigQuery jobs running
# Check Google Cloud Console for job execution
```

**Verification**:
- [ ] GSC data flowing
- [ ] BigQuery jobs successful
- [ ] Query data accurate
- [ ] Performance acceptable

### Webhook Infrastructure

#### Shopify Webhooks

```bash
# 1. Deploy webhook handlers
# Routes should be in app/routes/webhooks.*

# 2. Configure webhooks in Shopify Partner Dashboard
# - orders/create
# - products/update
# - inventory_levels/update
# - Add HMAC verification

# 3. Test webhook delivery
# Use Shopify webhook testing tool

# 4. Verify idempotency
# Send duplicate webhooks, verify single processing
```

**Verification**:
- [ ] Webhooks registered in Shopify
- [ ] HMAC verification working
- [ ] Idempotency enforced
- [ ] Queue processing if implemented
- [ ] Replay protection active

#### Chatwoot Webhooks

```bash
# 1. Verify webhook handler deployed
curl -X POST https://hotdash-staging.fly.dev/api/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 2. Configure webhook in Chatwoot
# Chatwoot → Settings → Integrations → Webhooks
# Add URL: https://hotdash-staging.fly.dev/api/webhooks/chatwoot

# 3. Test webhook delivery
# Create test conversation in Chatwoot

# 4. Verify queue processing (if implemented)
# Check queue status/logs
```

**Verification**:
- [ ] Webhook handler responding
- [ ] Queue offloading (if implemented)
- [ ] Replay protection active
- [ ] CW_REPLY_DRAFT staging working

---

## Recommender Services Deployment

**Reference**: Growth Spec Section C (C1-C5)

### Prerequisites

- [ ] Recommender logic implemented
- [ ] LlamaIndex MCP integration tested
- [ ] Scoring algorithms validated
- [ ] Scheduling mechanism ready

### Deployment Options

**Option A: Cron Jobs (Simple)**
```bash
# Use Fly.io scheduled machines
# Add to fly.toml:
[[services.mounts]]
  source = "data"
  destination = "/data"

[[services.processes]]
  schedule = "0 * * * *"  # Hourly
  command = "node dist/recommenders/run.js"
```

**Option B: Queue Workers (Scalable)**
```bash
# Deploy worker processes
# Separate app or process group in main app

# Configure queue (if using Upstash or similar)
# Set queue connection in secrets
```

#### Deployment Steps

```bash
# 1. Deploy recommender code
gh workflow run deploy-staging.yml

# 2. Verify LlamaIndex MCP accessible
curl -f https://hotdash-llamaindex-mcp.fly.dev/health

# 3. Test recommender execution
# Trigger manually first, then enable scheduling

# 4. Monitor action generation
# Check logs for actions being created
~/.fly/bin/fly logs -a hotdash-staging | grep recommender

# 5. Verify action quality
# Check dashboard for generated actions
```

**Verification**:
- [ ] Recommenders executing on schedule
- [ ] Actions being generated
- [ ] Confidence scores reasonable
- [ ] No errors in logs
- [ ] Resource usage acceptable

---

## Post-Deployment Verification

### Standard Checks (All Features)

```bash
# 1. Health checks
for app in hotdash-staging hotdash-agent-service hotdash-llamaindex-mcp; do
  curl -f https://$app.fly.dev/health || echo "❌ $app health check failed"
done

# 2. Smoke tests
bash scripts/deploy/automated-smoke-test.sh

# 3. Performance
bash scripts/monitoring/executive-dashboard.sh

# 4. Security
bash scripts/deploy/harden-production.sh

# 5. Logs review
source vault/occ/fly/api_token.env
~/.fly/bin/fly logs -a hotdash-staging | grep -i "error\|fail" | head -20
```

### Growth-Specific Checks

```bash
# Action System
curl -f https://hotdash-staging.fly.dev/api/actions
# Should return action list or empty array

# Data Pipelines
curl -f https://hotdash-staging.fly.dev/api/analytics/sessions
# Should return GA session data

# Recommenders
# Check database for recent actions
# Use Supabase dashboard or API query
```

---

## Rollback Procedures

### If Deployment Fails

**Auto-Rollback** (already configured):
- Health check failures trigger automatic rollback
- GitHub issue created automatically
- Review workflow logs for failure cause

**Manual Rollback**:
```bash
# Trigger rollback workflow
gh workflow run rollback-deployment.yml \
  --ref main \
  -f environment=staging \
  -f reason="Growth feature deployment failed - [specific error]"

# Monitor rollback
gh run watch

# Verify rollback successful
curl -f https://hotdash-staging.fly.dev/health
```

### If Data Issues Occur

**Database Rollback**:
```bash
# Roll back migration
cd ~/HotDash/hot-dash
npx supabase migration repair --status reverted <migration-version>

# Or manually:
# Use Supabase dashboard for point-in-time recovery
```

---

## Success Criteria

### Action System Deployed When:
- [ ] Action API responding
- [ ] Executors processing actions
- [ ] Action lifecycle working (create → execute → complete)
- [ ] SLA tracking operational
- [ ] Dashboard showing actions

### Data Pipelines Deployed When:
- [ ] GA data flowing with organic filter
- [ ] GSC data ingesting to BigQuery
- [ ] Webhooks processing with HMAC verification
- [ ] Data freshness labels accurate
- [ ] No data quality issues

### Recommenders Deployed When:
- [ ] Recommenders running on schedule
- [ ] Actions generating automatically
- [ ] Confidence scores reasonable
- [ ] Resource usage within limits
- [ ] Error rate <1%

---

## Monitoring

**Dashboards to Create** (when features deploy):
- Action throughput (actions/hour)
- Executor success rate (% completed successfully)
- Data pipeline health (last successful run, error rate)
- Recommender performance (actions generated, avg confidence)

**Alerts to Configure**:
- Action queue depth >100
- Executor error rate >5%
- Data pipeline failures
- Recommender errors

---

## Notes

**Current Status** (2025-10-14):
- Growth features at 0% implementation (per growth audit)
- Deployment checklist prepared
- Infrastructure ready for deployment
- Waiting for engineering completion

**When to Use This Checklist**:
- Engineer completes Action System → Use Action System section
- Data agent completes pipelines → Use Data Pipeline section
- AI agent completes recommenders → Use Recommender section

---

**This checklist is ready for execution once growth features are implemented by engineering team.**

