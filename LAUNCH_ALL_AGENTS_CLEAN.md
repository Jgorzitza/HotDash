# Launch All Agents - Clean & Aligned to NORTH_STAR

## NORTH_STAR Goals (2 DAYS)
1. **Dashboard** - 7 live tiles (Revenue, AOV, Returns, Stock Risk, SEO, CX Queue, Approvals Queue) + Approvals Drawer
2. **Inventory** - ROP calculation, PO generation, kits/bundles, picker payouts
3. **Customer Ops** - Chatwoot integration with HITL (AI drafts → human approves → send)
4. **Growth** - Read-only analytics first, then HITL posting

## Agent Work Assignments

### P0 - Build the App (Launch First)

**Engineer:**
- Build Dashboard route with 7 Polaris Card tiles
- Build Approvals Drawer component (evidence, impact, rollback, grading)
- Use fixtures (no API calls yet)
- Branch: `agent/engineer/dashboard-live-tiles`

**Integrations:**
- Build Shopify GraphQL queries for tile data (revenue, AOV, returns, stock)
- Build Supabase RPC functions for approvals data
- Branch: `agent/integrations/dashboard-apis`

**Data:**
- Design approvals schema (approvals, grades, edits tables)
- Design audit log schema (immutable audit trail)
- Create migrations with RLS policies
- Branch: `agent/data/approvals-audit-schemas`

**AI-Customer:**
- Build OpenAI SDK agent for customer support drafts
- Integrate with Chatwoot (read conversations, draft replies as Private Notes)
- HITL enforcement (human reviews before sending)
- Branch: `agent/ai-customer/chatwoot-hitl`

**DevOps:**
- Monitor staging deployment (from PR #27)
- Prepare production deployment workflow
- Branch: `agent/devops/production-prep`

### P1 - Support P0 (Launch Second)

**QA:**
- Test dashboard as engineer builds it
- Add acceptance criteria to all open Issues
- Review PRs for quality
- Branch: `agent/qa/dashboard-testing`

**Designer:**
- Review dashboard Polaris compliance
- Suggest UX improvements for Approvals Drawer
- Ensure accessibility (WCAG 2.1 AA)
- Branch: `agent/designer/polaris-review`

**Inventory:**
- Design inventory data model (ROP fields, PO structure, kits, picker payouts)
- Coordinate with data agent on schema
- Define payout brackets
- Branch: `agent/inventory/data-model`

**Product:**
- Write user stories for dashboard features
- Define success metrics for each tile
- Create feature prioritization for M1-M6
- Branch: `agent/product/dashboard-stories`

### P2 - Prepare Growth (Launch Third)

**Analytics:**
- Build GA4 integration for dashboard tiles
- Provide real data for Revenue, AOV, SEO tiles
- Branch: `agent/analytics/ga4-dashboard`

**SEO:**
- Build SEO anomalies detection for dashboard tile
- Define what constitutes an "anomaly" (traffic drop, ranking loss, etc.)
- Branch: `agent/seo/anomalies-detection`

**Ads:**
- Prepare ads performance tracking (ROAS, CPC, conversions)
- Design ads dashboard tile data structure
- Branch: `agent/ads/performance-tracking`

**Content:**
- Prepare content performance tracking (engagement, reach, conversions)
- Design content approval workflow
- Branch: `agent/content/performance-tracking`

**Support:**
- Design Chatwoot integration architecture
- Define triage rules (AI vs human escalation)
- Create support workflow diagram
- Branch: `agent/support/chatwoot-design`

**AI-Knowledge:**
- Design knowledge base structure for customer support
- Define learning extraction from human edits
- Create KB article format
- Branch: `agent/ai-knowledge/kb-design`

## Launch Commands (Simple)

### P0 - Build the App
```
@docs/directions/engineer.md Build dashboard with 7 live tiles + Approvals Drawer. Use Polaris Cards and Drawer. Fixtures only. Branch: agent/engineer/dashboard-live-tiles
```
```
@docs/directions/integrations.md Build Shopify GraphQL queries for dashboard tiles (revenue, AOV, returns, stock) + Supabase RPC for approvals. Branch: agent/integrations/dashboard-apis
```
```
@docs/directions/data.md Design approvals schema (approvals, grades, edits) + audit log schema. Create migrations with RLS. Branch: agent/data/approvals-audit-schemas
```
```
@docs/directions/ai-customer.md Build OpenAI SDK agent for Chatwoot customer support. AI drafts as Private Notes, human approves, then send. Branch: agent/ai-customer/chatwoot-hitl
```
```
@docs/directions/devops.md Monitor staging deployment. Prepare production deployment workflow. Branch: agent/devops/production-prep
```

### P1 - Support P0
```
@docs/directions/qa.md Test dashboard as it's built. Add acceptance criteria to all Issues. Review PRs. Branch: agent/qa/dashboard-testing
```
```
@docs/directions/designer.md Review dashboard Polaris compliance. Suggest UX improvements for Approvals Drawer. Ensure WCAG 2.1 AA. Branch: agent/designer/polaris-review
```
```
@docs/directions/inventory.md Design inventory data model (ROP, PO, kits, picker payouts). Coordinate with data agent. Branch: agent/inventory/data-model
```
```
@docs/directions/product.md Write user stories for dashboard features. Define success metrics. Prioritize M1-M6. Branch: agent/product/dashboard-stories
```

### P2 - Prepare Growth
```
@docs/directions/analytics.md Build GA4 integration for dashboard tiles. Provide real data for Revenue, AOV, SEO. Branch: agent/analytics/ga4-dashboard
```
```
@docs/directions/seo.md Build SEO anomalies detection for dashboard tile. Define anomaly thresholds. Branch: agent/seo/anomalies-detection
```
```
@docs/directions/ads.md Prepare ads performance tracking (ROAS, CPC). Design ads tile data. Branch: agent/ads/performance-tracking
```
```
@docs/directions/content.md Prepare content performance tracking. Design content approval workflow. Branch: agent/content/performance-tracking
```
```
@docs/directions/support.md Design Chatwoot integration. Define triage rules. Create workflow diagram. Branch: agent/support/chatwoot-design
```
```
@docs/directions/ai-knowledge.md Design knowledge base structure. Define learning from human edits. Create KB format. Branch: agent/ai-knowledge/kb-design
```

## Manager Responsibilities
- Merge PRs: `gh pr merge <number> --squash --delete-branch --admin`
- Monitor feedback: `ls -la feedback/*/2025-10-15.md`
- Unblock agents within 1 hour
- Keep all agents working on building the app

## Success Criteria (2 Days)
- Dashboard with 7 tiles deployed to staging
- Approvals Drawer functional with fixtures
- Shopify API queries working
- Approvals schema deployed
- Customer support agent drafting replies
- All agents productive, no idle agents

