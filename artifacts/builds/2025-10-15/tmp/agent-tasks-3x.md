# Agent Tasks (3x Expansion) - Aligned to NORTH_STAR

## P0 - Build the App

### Engineer (9 tasks - was 3)
1. ✅ Approval Queue UI (COMPLETE - PR #29)
2. Approvals Drawer Detail View (expand ApprovalCard into full drawer)
3. Dashboard Shell with 7 Tile Grid
4. Revenue Tile (connect to integrations API)
5. AOV Tile (connect to integrations API)
6. Returns Tile (connect to integrations API)
7. Stock Risk Tile (connect to integrations API)
8. SEO Anomalies Tile (connect to seo API)
9. CX Queue Tile (connect to Chatwoot)

### Integrations (9 tasks - was 3)
1. ✅ Dashboard API Routes (COMPLETE - PR #33)
2. Shopify Admin GraphQL client (reusable)
3. Supabase RPC client (reusable)
4. Chatwoot API client (reusable)
5. GA4 API client integration
6. Audit logging middleware
7. Rate limiting for external APIs
8. Error handling and retries
9. API integration tests

### Data (9 tasks - was 3)
1. ✅ Dashboard RPC Functions (COMPLETE - PR #34)
2. Approvals schema (tables for approvals, grades, edits)
3. Audit log schema (immutable audit trail)
4. Inventory schema (ROP, kits, payouts)
5. CX metrics schema (conversation stats)
6. Growth metrics schema (SEO, ads, content)
7. RLS policies for all tables
8. Database indexes for performance
9. Migration rollback scripts

### AI-Customer (9 tasks - was 3)
1. OpenAI SDK initialization
2. Customer support agent (draft Chatwoot replies)
3. HITL approval workflow
4. Grading interface (tone, accuracy, policy 1-5)
5. RAG integration (query KB for answers)
6. Conversation context management
7. Auto-escalation rules
8. Learning from human edits
9. Integration tests with fixtures

### DevOps (9 tasks - was 3)
1. ✅ CI health + staging deployment (COMPLETE - PR #27)
2. Production deployment workflow
3. Rollback workflow (< 2 min)
4. Health check monitoring
5. Prometheus metrics setup
6. Log aggregation (structured logs)
7. Alerting (PagerDuty/Slack)
8. Backup and restore procedures
9. Disaster recovery plan

## P1 - Support P0

### QA (9 tasks - was 3)
1. ✅ Test plan template (COMPLETE)
2. ✅ Acceptance criteria guide (COMPLETE)
3. PR reviews (engineer, integrations, data)
4. E2E test suite (Playwright)
5. Integration test suite (API routes)
6. Performance testing (load, stress)
7. Security testing (OWASP Top 10)
8. Accessibility testing (WCAG 2.1 AA)
9. Test automation CI integration

### Designer (9 tasks - was 3)
1. ✅ Approval Queue UI specs (COMPLETE)
2. Dashboard tile design system
3. Responsive breakpoints (mobile, tablet, desktop)
4. Loading states and skeletons
5. Error states and empty states
6. Accessibility annotations
7. Polaris component usage guide
8. Design tokens documentation
9. Handoff specs for all features

### Inventory (9 tasks - was 3)
1. ✅ Data model spec (COMPLETE - PR #32)
2. ROP calculation service
3. PO generation service
4. Kit/bundle tracking
5. Picker payout calculation
6. Inventory heatmap UI
7. Low stock alerts
8. Reorder suggestions
9. Integration with Shopify metafields

### Product (9 tasks - was 3)
1. Dashboard launch checklist
2. User acceptance criteria (all features)
3. Success metrics definition
4. User training materials
5. Feature prioritization matrix (M0-M6)
6. Rollback decision criteria
7. Post-launch monitoring plan
8. Iteration planning (based on feedback)
9. Stakeholder communication plan

## P2 - Prepare Growth

### Analytics (9 tasks - was 3)
1. ✅ GA4 integration (COMPLETE - PR #29)
2. Traffic analysis dashboard
3. Conversion funnel tracking
4. Attribution modeling
5. Custom event tracking
6. Real-time analytics
7. Anomaly detection (traffic, conversions)
8. Reporting automation
9. Data export and backup

### SEO (9 tasks - was 3)
1. ✅ Anomalies detection (COMPLETE - PR #30)
2. Keyword ranking tracker
3. Core Web Vitals monitoring
4. Crawl error detection
5. Meta tag optimization recommendations
6. Content gap analysis
7. Backlink monitoring
8. Competitor analysis
9. SEO recommendations engine

### Ads (9 tasks - was 3)
1. Ads performance tracking
2. ROAS calculation engine
3. Budget allocation optimizer
4. Campaign performance dashboard
5. Creative performance analysis
6. Audience insights
7. A/B test tracking
8. Attribution modeling
9. HITL campaign recommendations

### Content (9 tasks - was 3)
1. ✅ Content performance tracking (COMPLETE - PR #29)
2. Social post drafting (HITL)
3. Engagement analysis
4. Content calendar
5. Hashtag optimization
6. Best time to post analysis
7. Competitor content analysis
8. Content recommendations
9. HITL posting workflow

### Support (9 tasks - was 3)
1. ✅ Chatwoot integration spec (COMPLETE - PR #28)
2. RAG index build and testing
3. KB article ingestion
4. Triage automation
5. SLA monitoring
6. Response quality tracking
7. Escalation workflow
8. Customer satisfaction tracking
9. Support analytics dashboard

### AI-Knowledge (9 tasks - was 3)
1. ✅ KB design spec (COMPLETE - PR #31)
2. KB schema implementation
3. Learning extraction pipeline
4. Article quality scoring
5. Recurring issue detection
6. KB update automation
7. Search optimization
8. Knowledge graph
9. Integration with ai-customer

