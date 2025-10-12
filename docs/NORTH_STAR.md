---
epoch: 2025.10.E1
doc: docs/NORTH_STAR.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# North Star — Operator Control Center

Deliver a trustworthy, operator-first control center embedded inside Shopify Admin that unifies CX, sales, SEO/content, inventory, and fulfillment into actionable tiles with agent-assisted approvals. Evidence or no merge.

## Mission

Build the command center that helps **Hot Rod AN** (and automotive parts retailers) 10X their business from $1MM to $10MM annual revenue by:
- Reducing CEO operational burden from 10-12 hours/week to <2 hours/week
- Surfacing actionable insights in 5 unified tiles (not scattered dashboards)
- Enabling AI-assisted customer support (draft → human approve → send)
- Automating data analysis, alerts, and recommendations
- Providing evidence-based decision support for inventory, marketing, and sales

**First Customer**: Hot Rod AN (www.hotrodan.com) - Automotive AN fittings and fuel system parts  
**Vertical Focus**: Automotive parts e-commerce (hot rods, racing, performance builds)  
**Growth Target**: $1MM → $10MM annual revenue (10X)

## Core Product: 5 Actionable Tiles

Each tile shows: **Data + AI Insight + Recommended Action + One-Click Execution**

1. **CX Pulse** - Customer experience health, support queue, satisfaction trends
2. **Sales Pulse** - Revenue trends, top products, conversion alerts
3. **SEO Pulse** - Search rankings, content performance, traffic sources
4. **Inventory Watch** - Stock levels, velocity alerts, reorder recommendations
5. **Fulfillment Flow** - Order status, shipping delays, carrier performance

**Not just metrics - actionable tiles with agent-assisted decisions**

## Development Principles

**MCP-First Development** — All code work must reference the latest tools, patterns, and examples from our available MCP servers (Shopify, Context7, GitHub, Supabase, Fly, Google Analytics, LlamaIndex RAG). **Agent training data is outdated for React Router 7 (contains v6/Remix patterns) and Shopify APIs (2023 or older).** Agents must verify current syntax before implementation - never trust training data for RR7 loaders, Shopify GraphQL, or Shopify App Bridge. Before implementing features, agents search HotDash codebase first (grep), then verify with appropriate MCP tools using conservative token limits (800-1500). All Shopify queries must be validated with Shopify MCP. All React Router 7 patterns must be verified with Context7. Google Analytics integration uses direct API (not MCP) for application data fetching. LlamaIndex RAG capabilities exposed via MCP server for universal agent access. This ensures we use current APIs, avoid deprecated patterns, maintain type safety, and stay aligned with 2024 best practices.

**Evidence or No Merge** — Every feature, fix, or improvement must demonstrate:
- Working code (not plans or designs)
- Test results (proof it functions)
- Evidence trail (commands, outputs, screenshots)
- Operator value (how does this help Hot Rod AN CEO?)

No theoretical planning, no future roadmaps during launch, no infrastructure before proving need. Ship operator value NOW.

## Success Metrics

**Launch Success (Oct 13-15, 2025):**
- Hot Rod AN CEO uses dashboard daily
- 5 tiles surface actionable insights
- Agent-assisted approvals save CEO 8+ hours/week
- Zero P0 security or data issues
- CEO satisfaction: "This is invaluable" feedback

**Week 1 Validation (Oct 15-18, 2025):**
- Dashboard used daily without issues
- At least 10 agent-assisted approvals processed
- Time savings measured and documented
- CEO provides initial feedback for iteration

**10X Growth Enablers (Immediate):**
- CEO time freed up → redirected to sales and partnerships
- Data-driven decisions → better inventory, marketing, customer service
- Vertical automotive expertise → competitive differentiation
- Word-of-mouth in hot rod community → viral growth potential
