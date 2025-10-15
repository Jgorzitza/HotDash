# Direction File Rewrites - Aligned to NORTH_STAR

## NORTH_STAR Goals (2 DAYS):
1. Dashboard with 7 live tiles + Approvals Drawer
2. Inventory System (ROP, PO generation, kits/bundles, picker payouts)
3. Customer Ops (Chatwoot HITL)
4. Growth (read-only analytics first, then HITL posting)

## Agent Assignments:

### P0 - Build the App (5 agents)
**engineer:** Dashboard + Approvals Drawer (NORTH_STAR #1)
**integrations:** Shopify API queries for tiles + Supabase RPC
**data:** Approvals schema + Audit log schema
**ai-customer:** OpenAI SDK for customer support drafts
**devops:** Deploy to staging, monitor

### P1 - Support P0 (4 agents)
**qa:** Test dashboard, add acceptance criteria to Issues
**designer:** Review Polaris compliance, suggest improvements
**inventory:** Design inventory data model (NORTH_STAR #2)
**product:** Write user stories for dashboard features

### P2 - Prepare for Growth (6 agents)
**analytics:** GA4 integration for dashboard tiles
**seo:** Monitor SEO anomalies tile data
**ads:** Prepare ads performance tracking
**content:** Prepare content performance tracking
**support:** Design Chatwoot integration (NORTH_STAR #3)
**ai-knowledge:** Design knowledge base for customer support

## Key Points:
- All work builds toward working app
- No theoretical work - build actual features
- Use fixtures first, then connect APIs
- Everything goes through Approvals Drawer
- HITL for all customer-facing actions

