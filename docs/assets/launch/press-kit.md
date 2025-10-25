# HotDash Press Kit

**Launch Date**: October 23, 2025  
**Product**: HotDash Operator Control Center  
**Company**: Hot Rodan  
**Website**: hotdash.fly.dev

---

## Executive Summary

**HotDash** is a next-generation operator control center for Shopify merchants, combining real-time metrics, AI-powered automation, and human-in-the-loop approval workflows to streamline e-commerce operations.

### Key Innovation

HotDash introduces **trustworthy AI automation** through its unique approval queue system - agents propose actions, humans approve or correct, and the system learns from every decision.

---

## Product Overview

### What is HotDash?

HotDash is an embedded Shopify app that provides operators with:

- **Real-time Dashboard**: Live metrics across sales, inventory, customer experience, and growth
- **AI-Powered Automation**: Intelligent suggestions for customer support, inventory management, and marketing
- **Approval Queue**: Human-in-the-loop workflow ensuring every AI action is reviewed before execution
- **Growth Analytics**: Integrated tracking for social media, SEO, and advertising performance

### Target Audience

- **Shopify Merchants**: Small to medium-sized e-commerce businesses
- **Operations Teams**: Store managers, customer support, inventory managers
- **Growth Teams**: Marketing managers, social media coordinators, SEO specialists

---

## Key Features

### 1. Real-Time Metrics Dashboard

**8+ Tiles** providing instant visibility into:
- Sales performance and revenue trends
- Fulfillment status and shipping delays
- Inventory levels and stockout risks
- Customer escalations requiring attention
- Social media engagement metrics
- SEO ranking performance
- Advertising ROAS (Return on Ad Spend)
- Overall growth trajectory

### 2. AI-Powered Customer Support

- **Automated Reply Generation**: AI drafts responses to customer inquiries
- **Context-Aware**: Analyzes order history, previous conversations, and support policies
- **Human Review**: Every reply reviewed and graded before sending
- **Continuous Learning**: System improves based on operator edits and feedback

### 3. Intelligent Inventory Management

- **Reorder Point Calculation**: Automatic ROP based on lead time and sales velocity
- **Purchase Order Generation**: AI-suggested POs with evidence and rationale
- **Stockout Prevention**: Proactive alerts for low-stock items
- **Vendor Management**: Track suppliers and order history

### 4. Growth Engine

- **Social Performance**: Track posts, engagement, and top performers across platforms
- **SEO Impact**: Monitor keyword rankings, indexed pages, and position changes
- **Ads ROAS**: Real-time campaign performance and budget tracking
- **Unified Metrics**: Single dashboard for all growth channels

### 5. Approval Queue (HITL)

**Human-in-the-Loop Workflow**:
- Review AI-generated actions before execution
- Edit suggestions to improve accuracy
- Grade responses (tone, accuracy, policy compliance)
- Rollback capability for all actions
- Complete audit trail

---

## Technical Specifications

### Architecture

- **Framework**: React Router 7
- **Design System**: Shopify Polaris
- **Backend**: Node.js/TypeScript
- **Database**: Supabase (PostgreSQL with RLS)
- **Deployment**: Fly.io
- **Real-time**: Server-Sent Events (SSE)

### Integrations

- **Shopify Admin API**: Orders, products, inventory, customers
- **Chatwoot**: Customer support conversations
- **Google Analytics 4**: Traffic and conversion tracking
- **Ayrshare**: Social media posting (planned)
- **Google Search Console**: SEO data (planned)

### Security & Compliance

- **Row-Level Security (RLS)**: Database-level access control
- **PII Redaction**: Automatic masking of sensitive customer data
- **Audit Logging**: Complete decision trail for all actions
- **WCAG 2.2 AA**: Full accessibility compliance
- **HTTPS**: All communications encrypted

---

## Brand Identity

### Hot Rodan Concept

**Theme**: Hot Rod / Automotive - Fast, powerful, reliable

**Core Values**:
- **Speed**: Instant insights and rapid decision-making
- **Power**: Full control at operator's fingertips
- **Reliability**: Always on, always ready
- **Precision**: Fine-tuned, no wasted motion

### Visual Identity

**Primary Color**: Hot Rodan Red (#D72C0D)
**Accent Colors**: Chrome Silver (#8C9196), Matte Black (#1A1A1A)
**Typography**: Inter (Polaris default)
**Design System**: Shopify Polaris

### Brand Voice

- **Professional yet approachable**
- **Action-oriented** ("Full speed ahead!" vs "Success")
- **Automotive metaphors** (used sparingly)
- **Operator-first** language

---

## Launch Metrics & Goals

### Success Criteria

**Week 1**:
- 10+ active merchants
- 95%+ uptime
- < 3s P95 tile load time
- 90%+ AI draft rate for customer support

**Month 1**:
- 50+ active merchants
- 4.5+ average grades (tone, accuracy, policy)
- 15 min median approval time
- Zero critical security incidents

### Performance Benchmarks

- **Dashboard Load**: < 3 seconds (P95)
- **Tile Refresh**: < 1 second
- **Modal Open**: < 500ms
- **Approval Processing**: < 2 seconds

---

## Quotes

### CEO Statement

> "HotDash represents a fundamental shift in how we think about AI in e-commerce. Instead of black-box automation, we've built a system where AI and humans work together - agents propose, humans approve, and everyone learns. This is the future of trustworthy automation."
> 
> — Justin Gorzitza, CEO, Hot Rodan

### Product Vision

> "Every Shopify merchant deserves a mission control center. HotDash brings enterprise-grade operations to businesses of all sizes, with AI that augments rather than replaces human judgment."
> 
> — HotDash Product Team

---

## Media Assets

### Logos

- **Primary Logo**: `public/assets/launch/hotdash-logo.svg`
- **Icon Only**: `public/assets/status-icon-healthy.svg`
- **Formats**: SVG (vector), PNG (raster)

### Screenshots

Available in `docs/assets/tutorials/`:
- Dashboard overview
- Tile interactions
- Approval queue
- CX escalation modal
- Inventory heatmap
- Growth analytics charts
- Settings page
- Accessibility features

### Diagrams

Available in `docs/assets/help/`:
- Workflow diagram (approval process)
- Dashboard anatomy (annotated)
- Architecture overview (planned)

### Announcement Graphics

- **Social Banner**: `public/assets/launch/announcement-banner.svg` (1200x630)
- **Email Header**: (planned)
- **Website Hero**: (planned)

---

## Contact Information

### Media Inquiries

- **Email**: press@hotrodan.com
- **Website**: hotdash.fly.dev
- **Twitter**: @hotdash
- **LinkedIn**: Hot Rodan

### Product Demos

- **Live Demo**: Available upon request
- **Video Walkthrough**: Coming soon
- **Documentation**: docs.hotdash.fly.dev

### Support

- **Email**: support@hotrodan.com
- **Slack**: #hotdash-support
- **Status Page**: status.hotdash.fly.dev

---

## Boilerplate

### Short (50 words)

HotDash is an operator control center for Shopify merchants, combining real-time metrics, AI-powered automation, and human-in-the-loop approval workflows. Built on Shopify Polaris, HotDash provides instant visibility into sales, inventory, customer experience, and growth - with trustworthy AI that learns from every decision.

### Medium (100 words)

HotDash is a next-generation operator control center for Shopify merchants, designed to streamline e-commerce operations through intelligent automation and human oversight. The platform provides real-time dashboards for sales, inventory, customer support, and growth metrics, while its unique approval queue ensures every AI-generated action is reviewed before execution. Built on Shopify Polaris and integrated with Chatwoot, Google Analytics, and the Shopify Admin API, HotDash delivers enterprise-grade operations to businesses of all sizes. The system continuously learns from operator feedback, improving accuracy and relevance with every approved action.

### Long (200 words)

HotDash is a comprehensive operator control center for Shopify merchants, revolutionizing e-commerce operations through the combination of real-time metrics, AI-powered automation, and human-in-the-loop approval workflows. The platform addresses a critical gap in the market: trustworthy AI automation that augments rather than replaces human judgment.

At its core, HotDash provides operators with instant visibility into every aspect of their business through an intuitive dashboard featuring 8+ tiles covering sales performance, fulfillment status, inventory levels, customer escalations, and growth metrics across social media, SEO, and advertising. Each tile offers drill-down capabilities for detailed analysis and action.

The platform's unique approval queue implements a human-in-the-loop workflow where AI agents propose actions - from customer support replies to inventory purchase orders - and operators review, edit, and approve before execution. Every interaction is graded and logged, creating a continuous learning loop that improves AI accuracy over time.

Built on Shopify Polaris and fully integrated with the Shopify Admin API, Chatwoot, and Google Analytics 4, HotDash delivers enterprise-grade operations to businesses of all sizes. The platform maintains WCAG 2.2 AA accessibility compliance, implements row-level security for data protection, and provides complete audit trails for all actions.

HotDash represents the future of e-commerce operations: fast, powerful, reliable, and always under human control.

---

## FAQ

### Q: What makes HotDash different from other Shopify apps?

**A**: HotDash is the only operator control center that combines real-time metrics, AI automation, and mandatory human approval in a single platform. While other apps focus on individual functions (analytics, support, inventory), HotDash provides a unified command center with trustworthy AI that learns from operator decisions.

### Q: How does the approval queue work?

**A**: AI agents analyze data and propose actions (customer replies, purchase orders, marketing recommendations). These suggestions appear in the approval queue with full evidence, projected impact, and rollback plans. Operators review, edit if needed, grade the quality, and approve or reject. The system learns from every decision to improve future suggestions.

### Q: Is HotDash suitable for small businesses?

**A**: Yes! HotDash is designed to bring enterprise-grade operations to businesses of all sizes. The platform scales from solo operators to full teams, with role-based access and customizable dashboards.

### Q: What integrations are supported?

**A**: Currently: Shopify Admin API, Chatwoot (customer support), Google Analytics 4. Planned: Ayrshare (social media), Google Search Console (SEO), Google Ads, Meta Ads.

### Q: How is customer data protected?

**A**: HotDash implements row-level security (RLS) at the database level, automatic PII redaction for customer-facing communications, complete audit logging, and HTTPS encryption for all data transmission. The platform is WCAG 2.2 AA compliant and follows Shopify's security best practices.

### Q: Can I try HotDash before committing?

**A**: Yes! Contact us for a demo or trial access. We offer guided onboarding and training for all new merchants.

---

**Last Updated**: October 23, 2025  
**Version**: 1.0  
**Contact**: press@hotrodan.com

