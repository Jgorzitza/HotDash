import { assignTask } from '../../app/services/tasks.server';

console.log('================================================================================');
console.log('ASSIGNING COMPLETE PRODUCTION TASKS - ALL 17 AGENTS');
console.log('================================================================================\n');

const tasks = [
  
  // ============================================================================
  // PHASE 9: DATABASE MIGRATIONS & SCHEMA (BLOCKER FOR EVERYTHING)
  // Priority: P0 - Must be done first
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-100',
    title: 'Apply All Phase 7-13 Migrations (33 tables)',
    description: 'Apply all pending migrations from supabase/migrations/ to create complete database schema for Growth Engine. Includes: approvals, vendors, inventory, SEO, ads, social, knowledge base, product suggestions.',
    acceptanceCriteria: [
      'All 33 tables created successfully',
      'All indexes created',
      'All RLS policies enabled',
      'All triggers functional',
      'Rollback script tested',
      'Schema matches docs/specs/database_schema.md'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma'],
    priority: 'P0' as const,
    phase: 'Phase 9',
    estimatedHours: 4,
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-101',
    title: 'Vendor Master Tables & RLS',
    description: 'Create vendor master tables: vendors, vendor_skus, vendor_product_mappings. Implement reliability scoring logic. Set up RLS policies.',
    acceptanceCriteria: [
      'vendors table with reliability_score calculation',
      'vendor_skus mapping (up to 3 SKUs per product per vendor)',
      'RLS policies prevent cross-project access',
      'Triggers for auto-updating reliability scores',
      'Test data loaded for 3-5 vendors'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma'],
    priority: 'P0' as const,
    phase: 'Phase 10',
    estimatedHours: 3,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-102',
    title: 'Bundles-as-BOM Tables & Virtual Stock',
    description: 'Create bundle tables: bundles, bom_components. Implement virtual stock calculation (min of component availability). Nightly reconciliation job schema.',
    acceptanceCriteria: [
      'bundles table links to Shopify product variants',
      'bom_components defines component quantities',
      'Virtual stock calculation view/function',
      'Nightly reconciliation job schema',
      'Handles parameterized bundles (color/length variants)'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'app/services/inventory/**'],
    priority: 'P0' as const,
    phase: 'Phase 11',
    estimatedHours: 4,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-103',
    title: 'ALC Calculation Tables & Receipt Processing',
    description: 'Create receiving tables: purchase_orders, purchase_order_receipts, purchase_order_line_items, product_cost_history. Implement ALC recalculation logic with freight/duty allocation.',
    acceptanceCriteria: [
      'PO and receipt tables with proper relationships',
      'product_cost_history tracks ALC over time',
      'ALC calculation includes freight (by weight) and duty',
      'Shopify cost sync triggers (inventoryItem.unitCost update)',
      'Audit trail for all cost changes'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'app/services/inventory/**'],
    priority: 'P1' as const,
    phase: 'Phase 11',
    estimatedHours: 5,
    dependencies: ['DATA-101'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // PHASE 9-10: APPROVALS SYSTEM BACKEND
  // Priority: P0 - Core HITL infrastructure
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-100',
    title: 'Approvals Drawer Backend Integration',
    description: 'Wire ApprovalsDrawer.tsx to database: load approvals, update status, execute tool calls, store audit logs. Implement /validate endpoint.',
    acceptanceCriteria: [
      'Drawer loads from approvals table',
      'State transitions work (draft→pending→approved→applied)',
      '/validate endpoint checks evidence/rollback',
      'Tool call execution logs to audit_logs',
      'Human edits stored for learning',
      '1-5 grading captured (tone/accuracy/policy)'
    ],
    allowedPaths: ['app/components/approvals/**', 'app/routes/api.approvals.**', 'app/services/approvals/**'],
    priority: 'P0' as const,
    phase: 'Phase 9',
    estimatedHours: 6,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'integrations',
    taskId: 'INTEGRATIONS-100',
    title: 'Shopify Admin GraphQL Approval Actions',
    description: 'Create server-side tool handlers for Shopify mutations: product updates, inventory adjustments, order operations. All guarded by approvals system.',
    acceptanceCriteria: [
      'Product update tool (price, title, description)',
      'Inventory adjustment tool (set levels)',
      'Order operations (fulfill, refund) with receipts',
      'All tools validate approval exists',
      'Dry-run mode for testing',
      'Tool receipts stored in audit_logs'
    ],
    allowedPaths: ['app/services/shopify/**', 'app/routes/api.approvals.execute.**'],
    priority: 'P0' as const,
    phase: 'Phase 9',
    estimatedHours: 5,
    dependencies: ['DATA-100', 'ENG-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // PHASE 10: INVENTORY INTELLIGENCE
  // Priority: P1 - Core business value
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'inventory',
    taskId: 'INVENTORY-100',
    title: 'ROP Calculation Engine',
    description: 'Implement Reorder Point calculation: ROP = LeadTimeDemand + SafetyStock. Use 30-90 day velocity, vendor lead times, 95% service level. Generate reorder suggestions.',
    acceptanceCriteria: [
      'Daily velocity calculation from order history',
      'Lead time demand = velocity × vendor days',
      'Safety stock = Z-score × demand variance',
      'ROP suggestions stored in reorder_suggestions table',
      'Handles seasonal trends and promotional uplift',
      'Recommends vendor + qty + ETA + cost impact'
    ],
    allowedPaths: ['app/services/inventory/**', 'app/routes/api.inventory.rop.**'],
    priority: 'P1' as const,
    phase: 'Phase 10',
    estimatedHours: 8,
    dependencies: ['DATA-101', 'DATA-103'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'inventory',
    taskId: 'INVENTORY-101',
    title: 'Emergency Sourcing Logic (Opportunity Cost)',
    description: 'Implement emergency sourcing recommendations: when OOS component blocks profitable bundle, recommend fast local vendor if Expected Lost Profit > Incremental Cost.',
    acceptanceCriteria: [
      'Calculates Expected Lost Profit = feasible_sales × bundle_margin',
      'Calculates Incremental Cost = (local_cost - primary_cost) × qty',
      'Recommends local vendor when ELP > IC and margin > 20%',
      'Shows comparison: primary vs local (cost, lead time, profit impact)',
      'Creates approval card for CEO review'
    ],
    allowedPaths: ['app/services/inventory/**', 'app/routes/api.inventory.emergency.**'],
    priority: 'P1' as const,
    phase: 'Phase 11',
    estimatedHours: 6,
    dependencies: ['DATA-101', 'DATA-102', 'INVENTORY-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'inventory',
    taskId: 'INVENTORY-102',
    title: 'Nightly Warehouse Reconciliation Job',
    description: 'Create nightly job: enforce Canada available=0, recompute virtual bundle stock, sync Shopify inventory levels, alert on discrepancies.',
    acceptanceCriteria: [
      'Cron job runs nightly at configured time',
      'Sets Canada warehouse available to 0',
      'Recalculates virtual bundle stock for all bundles',
      'Syncs to Shopify via inventoryAdjust mutation',
      'Logs discrepancies to observability_logs',
      'Sends alerts if critical OOS detected'
    ],
    allowedPaths: ['app/services/jobs/**', 'app/routes/api.cron.inventory.**'],
    priority: 'P1' as const,
    phase: 'Phase 11',
    estimatedHours: 4,
    dependencies: ['DATA-102', 'INTEGRATIONS-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // PHASE 11: GROWTH ENGINE AGENTS (OpenAI SDK)
  // Priority: P1 - Core product differentiator
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'ai-customer',
    taskId: 'AI-CUSTOMER-100',
    title: 'Customer-Front Agent Implementation',
    description: 'Build Customer-Front agent using OpenAI Agents SDK: CX triage, transfer to Accounts/Storefront sub-agents, compose redacted reply with PII Card, HITL approval required.',
    acceptanceCriteria: [
      'Agent created with OpenAI SDK in packages/agents/',
      'Tool: transfer_to_accounts (order lookups, refunds)',
      'Tool: transfer_to_storefront (inventory, products)',
      'Composes reply: public (redacted) + PII Card (operator-only)',
      'Creates approval card for every reply',
      'HITL enabled in agents.json (human_review: true)',
      'PII Broker enforces redaction rules'
    ],
    allowedPaths: ['packages/agents/**', 'app/agents/config/**', 'app/routes/api.agents.customer.**'],
    priority: 'P1' as const,
    phase: 'Phase 9',
    estimatedHours: 12,
    dependencies: ['DATA-100', 'ENG-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'ai-customer',
    taskId: 'AI-CUSTOMER-101',
    title: 'Accounts Sub-Agent (Order Operations)',
    description: 'Build Accounts sub-agent: order lookups, refund processing, return handling. Returns structured JSON to Customer-Front agent.',
    acceptanceCriteria: [
      'Tool: search_orders (by email, order number, date range)',
      'Tool: get_order_details (full order with line items)',
      'Tool: process_refund (with reason, amount)',
      'Tool: check_return_status',
      'Returns structured JSON (no direct customer communication)',
      'All operations create approval cards'
    ],
    allowedPaths: ['packages/agents/sub-agents/**', 'app/services/shopify/orders/**'],
    priority: 'P1' as const,
    phase: 'Phase 9',
    estimatedHours: 8,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'ai-customer',
    taskId: 'AI-CUSTOMER-102',
    title: 'Storefront Sub-Agent (Product/Inventory)',
    description: 'Build Storefront sub-agent: product search, inventory checks, collection browsing. Read-only Storefront MCP.',
    acceptanceCriteria: [
      'Tool: search_products (keyword, collection, availability)',
      'Tool: get_product_details (variants, pricing, stock)',
      'Tool: check_inventory (by SKU, location)',
      'Tool: browse_collections',
      'Uses Storefront MCP (read-only)',
      'Returns structured JSON to Customer-Front'
    ],
    allowedPaths: ['packages/agents/sub-agents/**', 'app/services/shopify/storefront/**'],
    priority: 'P1' as const,
    phase: 'Phase 9',
    estimatedHours: 6,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'ai-customer',
    taskId: 'AI-CUSTOMER-103',
    title: 'CEO-Front Agent Implementation',
    description: 'Build CEO-Front agent: business intelligence queries, read-only Storefront MCP + Action Queue, no writes, no Customer Accounts MCP.',
    acceptanceCriteria: [
      'Agent created with OpenAI SDK',
      'Tool: query_action_queue (approved actions, ROI)',
      'Tool: storefront_read_only (products, collections, inventory)',
      'Tool: business_metrics (sales, AOV, returns)',
      'NO write operations',
      'NO Customer Accounts MCP access',
      'Evidence-only responses'
    ],
    allowedPaths: ['packages/agents/**', 'app/routes/api.agents.ceo.**'],
    priority: 'P1' as const,
    phase: 'Phase 9',
    estimatedHours: 8,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // PHASE 11: ACTION ATTRIBUTION & ANALYTICS
  // Priority: P1 - ROI tracking
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'analytics',
    taskId: 'ANALYTICS-100',
    title: 'GA4 Custom Dimension Setup (hd_action_key)',
    description: 'Create GA4 custom dimension "hd_action_key" (event scope). Configure tracking for page_view, add_to_cart, purchase events. Document tracking implementation.',
    acceptanceCriteria: [
      'Custom dimension created in GA4 Property 339826228',
      'Dimension name: hd_action_key (event scope)',
      'Tracking implemented for key events',
      'Test events verified in GA4 DebugView',
      'Documentation: how to generate action keys',
      'Documentation: how to query attribution data'
    ],
    allowedPaths: ['docs/analytics/**', 'app/services/ga/**', 'app/utils/analytics.**'],
    priority: 'P1' as const,
    phase: 'Phase 11',
    estimatedHours: 4,
    dependencies: [],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'analytics',
    taskId: 'ANALYTICS-101',
    title: 'Action Attribution Dashboard Integration',
    description: 'Build attribution panel: for each approved Action, show 7/14/28-day performance (conversions, revenue, ROAS). Update expected_impact based on observed results.',
    acceptanceCriteria: [
      'Attribution panel component (7/14/28 day tabs)',
      'Queries GA4 for hd_action_key metrics',
      'Shows: impressions, clicks, conversions, revenue, ROAS',
      'Compares actual vs expected impact',
      'Updates confidence score based on results',
      'Re-ranks Top-10 actions by realized ROI'
    ],
    allowedPaths: ['app/components/attribution/**', 'app/routes/api.attribution.**', 'app/services/ga/**'],
    priority: 'P1' as const,
    phase: 'Phase 11',
    estimatedHours: 6,
    dependencies: ['ANALYTICS-100', 'DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // PHASE 12: CX→PRODUCT LOOP
  // Priority: P2 - Continuous improvement
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'ai-knowledge',
    taskId: 'AI-KNOWLEDGE-100',
    title: 'Chatwoot Conversation Embedding Pipeline',
    description: 'Build pipeline: sanitize CX conversations (remove PII), embed chunks to pgvector, enable semantic search for recurring themes.',
    acceptanceCriteria: [
      'PII removal from conversation text (emails, phones, addresses)',
      'Text chunking (500-1000 tokens per chunk)',
      'Embeddings generated via OpenAI',
      'Stored in pgvector with metadata (product, collection, theme)',
      'Semantic search function (find similar conversations)',
      'Nightly or on-demand pipeline'
    ],
    allowedPaths: ['app/services/embeddings/**', 'app/services/chatwoot/**', 'supabase/migrations/**'],
    priority: 'P2' as const,
    phase: 'Phase 12',
    estimatedHours: 8,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'product',
    taskId: 'PRODUCT-100',
    title: 'CX→Product Task Generation',
    description: 'Query embeddings for recurring themes (fit/missing/confusion). Generate mini-task Action cards with draft content: add size table, clarify policy, add adapter SKU.',
    acceptanceCriteria: [
      'Weekly query for top 5 recurring themes',
      'Groups by product/collection',
      'Generates Action card with: evidence snippets, draft copy, expected impact',
      'Minimum 3 tasks/week surfaced',
      'CEO approval → task created with ready draft',
      'Tasks route to correct agent (Content, Product, Support)'
    ],
    allowedPaths: ['app/services/product/**', 'app/routes/api.product.cx-loop.**'],
    priority: 'P2' as const,
    phase: 'Phase 12',
    estimatedHours: 6,
    dependencies: ['AI-KNOWLEDGE-100', 'DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // INTEGRATIONS: External Systems
  // Priority: P1-P2
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'integrations',
    taskId: 'INTEGRATIONS-101',
    title: 'Publer API Integration',
    description: 'Integrate Publer for social posting: authenticate, post scheduling, platform selection (FB/IG/Twitter), post preview, receipt storage.',
    acceptanceCriteria: [
      'Publer API authentication working',
      'Tool: schedule_post (content, platforms, time)',
      'Tool: get_account_status (health check)',
      'Platform selector UI component',
      'Post preview before approval',
      'Receipts stored after posting',
      'Health check before launch'
    ],
    allowedPaths: ['app/services/publer/**', 'app/routes/api.publer.**', 'app/components/social/**'],
    priority: 'P1' as const,
    phase: 'Phase 12',
    estimatedHours: 5,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'integrations',
    taskId: 'INTEGRATIONS-102',
    title: 'Bing Webmaster Tools Integration',
    description: 'Add Bing Webmaster Tools verification and basic metrics: site verification, submit sitemap, fetch search performance data.',
    acceptanceCriteria: [
      'Bing site verification complete (hotrodan.com)',
      'Sitemap submitted to Bing',
      'API integration for search performance',
      'Metrics: clicks, impressions, CTR, position',
      'Stored in seo_search_console_metrics (multi-source)'
    ],
    allowedPaths: ['app/services/bing/**', 'docs/integrations/bing-webmaster/**'],
    priority: 'P2' as const,
    phase: 'Phase 12',
    estimatedHours: 3,
    dependencies: [],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'devops',
    taskId: 'DEVOPS-100',
    title: 'Store Switch Implementation (Dev→Prod)',
    description: 'Implement store switch from hotroddash.myshopify.com (dev) to fm8vte-ex.myshopify.com (prod/hotrodan.com). Environment-based configuration, OAuth redirects, telemetry IDs.',
    acceptanceCriteria: [
      'Environment vars: SHOPIFY_SHOP_DOMAIN, SHOPIFY_APP_URL',
      'OAuth redirects parameterized (no literals)',
      'GA4 property ID parameterized',
      'Telemetry IDs environment-based',
      'Deployment checklist for cutover',
      'Rollback procedure documented'
    ],
    allowedPaths: ['app/config/**', 'docs/runbooks/store-switch.**', 'fly.toml'],
    priority: 'P1' as const,
    phase: 'Phase 10',
    estimatedHours: 4,
    dependencies: [],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'devops',
    taskId: 'DEVOPS-101',
    title: 'CI Guards Implementation (MCP Evidence + Heartbeat)',
    description: 'Implement CI guards: guard-mcp (validates MCP evidence JSONL), idle-guard (checks heartbeat freshness), dev-mcp-ban (fails if Dev MCP in prod bundles).',
    acceptanceCriteria: [
      'guard-mcp script validates artifacts/{agent}/{date}/mcp/*.jsonl',
      'idle-guard checks heartbeat.ndjson < 15min stale',
      'dev-mcp-ban scans build output for Dev MCP imports',
      'GitHub Actions workflow runs all 3 guards',
      'Required checks on main branch',
      'Documentation for agents'
    ],
    allowedPaths: ['scripts/ci/**', '.github/workflows/**', 'docs/runbooks/ci-guards.**'],
    priority: 'P1' as const,
    phase: 'Phase 10',
    estimatedHours: 6,
    dependencies: [],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // DESIGN & QA
  // Priority: P1-P2
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'designer',
    taskId: 'DESIGNER-100',
    title: 'Approvals Drawer UX Refinement',
    description: 'Refine ApprovalCard and ApprovalsDrawer to match spec: evidence tabs (Diffs/Samples/Queries/Screenshots), tool calls preview, audit section, sticky footer.',
    acceptanceCriteria: [
      'Evidence section with 4 tabs working',
      'Tool calls preview shows all planned actions',
      'Risks & Rollback section editable',
      'Audit section shows after apply',
      'Sticky footer: Approve/Request changes/Reject',
      'Cmd+Enter shortcut for approve',
      'Approve disabled until /validate passes'
    ],
    allowedPaths: ['app/components/approvals/**', 'app/styles/**'],
    priority: 'P1' as const,
    phase: 'Phase 9',
    estimatedHours: 6,
    dependencies: ['ENG-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'qa',
    taskId: 'QA-100',
    title: 'Complete E2E Test Suite (Phases 9-13)',
    description: 'Create comprehensive E2E tests: approval workflows, agent interactions, inventory operations, CX flows, social posting, attribution tracking.',
    acceptanceCriteria: [
      'E2E: Approval creation → review → apply → audit',
      'E2E: Customer inquiry → agent triage → sub-agent → reply → approval',
      'E2E: ROP calculation → PO generation → receiving → ALC update',
      'E2E: Bundle sale → component deduction → virtual stock update',
      'E2E: Social post → approval → Publer → receipt',
      'E2E: Action attribution → GA4 tracking → ROI calculation',
      'All tests using Playwright',
      'Test coverage > 80%'
    ],
    allowedPaths: ['tests/e2e/**', 'tests/integration/**'],
    priority: 'P1' as const,
    phase: 'Phase 13',
    estimatedHours: 16,
    dependencies: ['ENG-100', 'AI-CUSTOMER-100', 'INVENTORY-100', 'INTEGRATIONS-101', 'ANALYTICS-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'qa',
    taskId: 'QA-101',
    title: 'WCAG 2.2 AA Accessibility Audit',
    description: 'Complete accessibility audit: all tiles, modals, approvals drawer, forms. Zero violations. Screen reader tested.',
    acceptanceCriteria: [
      'All tiles ARIA compliant',
      'All modals keyboard navigable',
      'All forms labeled correctly',
      'Color contrast ratio > 4.5:1',
      'Screen reader tested (NVDA/JAWS)',
      'Automated tests via axe-core',
      'Zero violations found'
    ],
    allowedPaths: ['tests/accessibility/**', 'app/components/**'],
    priority: 'P1' as const,
    phase: 'Phase 13',
    estimatedHours: 8,
    dependencies: ['DESIGNER-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // CONTENT & SEO
  // Priority: P2
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'content',
    taskId: 'CONTENT-100',
    title: 'Social Post Templates & Content Library',
    description: 'Create social post templates for common scenarios: new product launch, sale announcement, customer testimonial, inventory alert, tip/education.',
    acceptanceCriteria: [
      '10+ post templates with placeholders',
      'Templates stored in database or config',
      'Categories: product, sale, testimonial, inventory, education',
      'Character limits enforced (Twitter 280, FB 63k)',
      'Hashtag suggestions included',
      'Image dimension specs included'
    ],
    allowedPaths: ['app/services/content/**', 'docs/specs/social-templates.**'],
    priority: 'P2' as const,
    phase: 'Phase 12',
    estimatedHours: 4,
    dependencies: [],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'seo',
    taskId: 'SEO-100',
    title: 'Search Console Data Persistence',
    description: 'Implement daily sync of Google Search Console data to seo_search_console_metrics table. Track: queries, pages, clicks, impressions, CTR, position over time.',
    acceptanceCriteria: [
      'Daily sync job pulls last 7 days data',
      'Stores in seo_search_console_metrics table',
      'Metrics: query, page, clicks, impressions, CTR, position',
      'Tracks trends (position changes, CTR changes)',
      'Alerts on significant drops (>20% position loss)',
      'Dashboard shows top movers'
    ],
    allowedPaths: ['app/services/seo/**', 'app/routes/api.cron.seo.**'],
    priority: 'P2' as const,
    phase: 'Phase 11',
    estimatedHours: 5,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  {
    assignedBy: 'manager',
    assignedTo: 'seo',
    taskId: 'SEO-101',
    title: 'SEO Audit Automation',
    description: 'Create automated SEO audit system: check title tags, meta descriptions, alt text, structured data, page speed. Store in seo_audits table.',
    acceptanceCriteria: [
      'Crawls key pages (products, collections, home)',
      'Checks: title length, meta description, alt text',
      'Validates JSON-LD structured data',
      'Checks page speed (Core Web Vitals)',
      'Stores audit results in seo_audits table',
      'Creates Action cards for issues found'
    ],
    allowedPaths: ['app/services/seo/**', 'app/routes/api.seo.audit.**'],
    priority: 'P2' as const,
    phase: 'Phase 12',
    estimatedHours: 6,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // ADS & MARKETING
  // Priority: P2
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'ads',
    taskId: 'ADS-100',
    title: 'Campaign Performance Tracking',
    description: 'Implement daily sync of ad campaign data to ad_campaigns and ad_performance tables. Track ROAS, spend, conversions, CTR.',
    acceptanceCriteria: [
      'Daily sync from Google Ads API',
      'Stores: campaign, spend, conversions, revenue, ROAS',
      'Tracks trends over time',
      'Alerts on ROAS < threshold (e.g., < 2.0)',
      'Dashboard shows top/bottom performers',
      'Creates Action cards for optimization opportunities'
    ],
    allowedPaths: ['app/services/ads/**', 'app/routes/api.cron.ads.**'],
    priority: 'P2' as const,
    phase: 'Phase 11',
    estimatedHours: 6,
    dependencies: ['DATA-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // SUPPORT & DOCUMENTATION
  // Priority: P2-P3
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'support',
    taskId: 'SUPPORT-100',
    title: 'Complete Runbook Library',
    description: 'Create runbooks for all operational procedures: vendor onboarding, PO processing, receiving workflow, emergency sourcing, agent troubleshooting, deployment.',
    acceptanceCriteria: [
      'Vendor onboarding runbook (8 steps)',
      'PO processing runbook (create→send→receive→reconcile)',
      'Receiving workflow runbook (partial/full receipts)',
      'Emergency sourcing runbook (opportunity cost decision tree)',
      'Agent troubleshooting runbook (common errors)',
      'Deployment runbook (pre-flight, deploy, verify, rollback)',
      'All runbooks in docs/runbooks/'
    ],
    allowedPaths: ['docs/runbooks/**', 'docs/support/**'],
    priority: 'P2' as const,
    phase: 'Phase 13',
    estimatedHours: 8,
    dependencies: [],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },
  
  // ============================================================================
  // PILOT & TESTING
  // Priority: P2
  // ============================================================================
  
  {
    assignedBy: 'manager',
    assignedTo: 'pilot',
    taskId: 'PILOT-100',
    title: 'Complete UAT Scenarios (All Workflows)',
    description: 'Execute full UAT for all workflows: approvals, inventory, CX, growth, agents. Document findings, verify against acceptance criteria.',
    acceptanceCriteria: [
      'UAT: CX inquiry→agent→approval→reply (5 scenarios)',
      'UAT: Inventory ROP→PO→receiving→stock update (5 scenarios)',
      'UAT: Social post→approval→Publer→verification (3 scenarios)',
      'UAT: Emergency sourcing→approval→vendor selection (2 scenarios)',
      'UAT: Action attribution→GA4→ROI calculation (3 scenarios)',
      'All scenarios pass',
      'Findings documented',
      'Critical bugs escalated'
    ],
    allowedPaths: ['tests/uat/**', 'docs/pilot/**'],
    priority: 'P2' as const,
    phase: 'Phase 13',
    estimatedHours: 12,
    dependencies: ['AI-CUSTOMER-100', 'INVENTORY-100', 'INTEGRATIONS-101', 'ANALYTICS-100'],
    issueUrl: 'https://github.com/hot-rod-an/hotdash/issues/TBD'
  },

];

console.log(`\n📊 Assigning ${tasks.length} production tasks...\n`);

let assigned = 0;
let errors = 0;

for (const task of tasks) {
  try {
    await assignTask(task);
    console.log(`✅ ${task.taskId}: ${task.assignedTo} - ${task.title.substring(0, 50)}`);
    assigned++;
  } catch (error) {
    console.error(`❌ ${task.taskId}: ${error instanceof Error ? error.message : String(error)}`);
    errors++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Assignment Complete:`);
console.log(`   Total: ${tasks.length}`);
console.log(`   Assigned: ${assigned}`);
console.log(`   Errors: ${errors}`);
console.log('\n✅ Production task assignment complete!');
console.log('\nVerify with:');
console.log('  npx tsx --env-file=.env scripts/manager/query-all-tasks.ts');

