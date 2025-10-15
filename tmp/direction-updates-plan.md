# Direction Files Update Plan - 2025-10-15

## Goal
Update ALL 15 agent direction files with CURRENT, ALIGNED tasks from NORTH_STAR

## NORTH_STAR Goals (2 DAYS)
1. Dashboard with 7 live tiles + Approvals Drawer
2. Inventory System (ROP, PO, kits, payouts)
3. Customer Ops (Chatwoot HITL)
4. Growth (analytics, then HITL posting)

## Agent Assignments (Based on Feedback Review)

### P0 - Build the App (5 agents)

**engineer:**
- Current: Waiting on Task 6 (Approval Queue UI)
- Designer specs ready in docs/design/HANDOFF-approval-queue-ui.md
- Next: Build Approval Queue UI (3-4h), then E2E testing
- Branch: agent/engineer/dashboard-live-tiles

**integrations:**
- Current: Shopify validation complete, 9 scripts created
- Next: Build API integration layer for dashboard tiles
- Connect Shopify queries to dashboard
- Branch: agent/integrations/dashboard-apis

**data:**
- Current: Hot Rodan models complete
- Next: AG-2 Real-time Dashboard Queries
- Build queries for dashboard tiles using views
- Branch: agent/data/dashboard-queries

**ai-customer:**
- Current: NO FEEDBACK - needs launch
- Next: Build OpenAI SDK customer support agent
- Chatwoot integration with HITL
- Branch: agent/ai-customer/chatwoot-hitl

**devops:**
- Current: PR #27 merged, staging deployed
- Next: Monitor staging, prepare production deployment
- Branch: agent/devops/production-prep

### P1 - Support P0 (4 agents)

**qa:**
- Current: Templates complete, reviewed integrations
- Next: Continue PR reviews, add acceptance criteria to Issues
- Branch: agent/qa/dashboard-testing

**designer:**
- Current: All 6 approval specs complete
- Next: Stand by for Engineer questions during implementation
- Branch: agent/designer/polaris-review

**inventory:**
- Current: Data model spec complete (997 lines)
- Next: Awaiting PR review, then coordinate with data on implementation
- Branch: agent/inventory/schema-design

**product:**
- Current: 22 strategic docs complete
- Next: Monitor launch readiness, prepare user acceptance criteria
- Branch: agent/product/launch-readiness

### P2 - Prepare Growth (6 agents)

**analytics:**
- Current: GA4 work complete
- Next: Provide real data for dashboard tiles
- Branch: agent/analytics/ga4-dashboard

**seo:**
- Current: NO FEEDBACK - needs launch
- Next: Build SEO anomalies detection for dashboard tile
- Branch: agent/seo/anomalies-detection

**ads:**
- Current: Metrics spec complete
- Next: Build ads performance tracking
- Branch: agent/ads/performance-tracking

**content:**
- Current: NO FEEDBACK - needs launch
- Next: Build content performance tracking
- Branch: agent/content/performance-tracking

**support:**
- Current: KB content complete
- Next: Ingest into RAG, test queries
- Branch: agent/support/chatwoot-integration

**ai-knowledge:**
- Current: NO FEEDBACK - needs launch
- Next: Design knowledge base structure
- Branch: agent/ai-knowledge/kb-design

## Update Process
1. Update each direction file's "Today's Objective" section
2. Remove old/completed tasks
3. Add clear, current tasks aligned to NORTH_STAR
4. Include specific next steps
5. Verify file is actually written

## Verification
After updates, each direction file should have:
- Clear current objective
- Specific tasks (not vague)
- Branch name
- Allowed paths
- No old/completed tasks cluttering the file

