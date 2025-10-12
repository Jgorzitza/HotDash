---
epoch: 2025.10.E1
doc: docs/directions/data.md
owner: manager
last_reviewed: 2025-10-12
---

# Data — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

### 1️⃣ North Star Obsession
**Memory Lock**: "North Star = Operator value TODAY"
### 2️⃣ MCP Tools Mandatory  
**Memory Lock**: "MCPs always, memory never"
### 3️⃣ Feedback Process Sacred
ALL work logged in `feedback/data.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"
### 4️⃣ No New Files Ever
**Memory Lock**: "Update existing, never create new"
### 5️⃣ Immediate Blocker Escalation
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/data.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.

**Memory Lock**: "Blocker found = immediate flag"
### 6️⃣ Manager-Only Direction
**Memory Lock**: "Manager directs, I execute"

---

## Mission
Build Hot Rod AN data models, analytics, ensure data powers all 5 tiles.

## 🎯 ACTIVE TASKS

### Task 1 - Hot Rod AN Data Models
**What**: Product categories, customer segments for automotive
**Timeline**: 2-3 hours

### Task 2 - Real-Time Dashboard Queries  
**What**: Optimize queries for 5 tiles (<200ms)
**Timeline**: 2-3 hours

### Task 3 - Historical Trend Analysis
**What**: Sales patterns, inventory velocity, seasonality
**Timeline**: 2-3 hours

### Task 4 - Data Quality Monitoring
**What**: Validate Shopify/Chatwoot/GA data accuracy
**Timeline**: 2-3 hours

### Task 5 - Operator Analytics
**What**: Track operator efficiency metrics
**Timeline**: 2-3 hours

### Task 6 - Growth Metrics Dashboard
**What**: Track $1MM → $10MM progress
**Timeline**: 2-3 hours

### Task 7 - Agent Training Pipeline
**What**: Capture CEO feedback for agent training
**Timeline**: 2-3 hours

### Task 8 - Data Backup Strategy
**What**: Automated backups for critical data
**Timeline**: 2-3 hours

### Task 9 - API Performance Monitoring
**What**: Track Shopify/Chatwoot/GA API latency
**Timeline**: 2-3 hours

### Task 10 - Data Documentation
**What**: Document all tables, views, queries
**Timeline**: 2-3 hours

### Task 11 - RLS Policy Verification
**What**: Use Supabase MCP to verify RLS enabled
**Timeline**: 1-2 hours

### Task 12 - Migration Testing
**What**: Test all database migrations
**Timeline**: 2 hours

### Task 13 - Query Performance Optimization
**What**: Add indexes, optimize joins
**Timeline**: 2-3 hours

### Task 14 - Caching Strategy
**What**: Design caching for frequently accessed data
**Timeline**: 2 hours

### Task 15 - Data Integrity Checks
**What**: Verify referential integrity, no orphaned data
**Timeline**: 2 hours

### Task 16 - Analytics Queries
**What**: Build queries for Hot Rod AN business analytics
**Timeline**: 3 hours

### Task 17 - Time-Savings Metrics
**What**: Track CEO time saved (Rec #1 from 10X plan)
**Timeline**: 2-3 hours

### Task 18 - Dashboard KPI Definitions
**What**: Define KPIs for all 5 tiles
**Timeline**: 2 hours

### Task 19 - Data Export Capabilities
**What**: Enable data export for operators
**Timeline**: 2 hours

### Task 20 - Launch Data Validation
**What**: Verify all data correct for Hot Rod AN launch
**Timeline**: 2 hours

## Git Workflow
**Branch**: `data/work`

**Status**: 🔴 ACTIVE


---

## 🚀 DEEP PRODUCTION TASK LIST (Aligned to North Star - Oct 12 Update)

**North Star Goal**: Build data pipelines for 5 actionable tiles that surface insights helping Hot Rod AN CEO scale from $1MM to $10MM.

**Data Mission**: Own data architecture, ETL pipelines, and analytics that power operator decision-making.

### 🎯 P0 - PRODUCTION DATA FOUNDATION (Week 1)

**Task 1: Audit Trail & Decision Logging** (3 hours)
- Verify decision_log table capturing all approvals/rejections
- Implement audit queries (who approved what, when)
- Set up audit retention (180 days per compliance)
- Create audit export functionality
- **Evidence**: Audit trail complete, queryable
- **North Star**: Evidence-based operations with full traceability
- **Deadline**: Oct 13 00:00 UTC

**Task 2: RLS Policy Verification** (2 hours)
- Verify RLS on all operator-facing tables
- Test multi-tenant data isolation
- Document RLS coverage
- **Evidence**: RLS tests passing, security confirmed
- **North Star**: Secure multi-operator platform
- **Deadline**: Oct 12 22:00 UTC

**Task 3: Data Quality Monitoring** (2 hours)
- Create data quality checks (completeness, accuracy)
- Monitor for null values, outliers
- Alert on data quality issues
- **Evidence**: Quality monitoring active
- **North Star**: Trustworthy data operators can rely on
- **Deadline**: Oct 13 06:00 UTC

---

### 📊 P1 - TILE DATA PIPELINES (Week 1-3)

**Build ETL pipelines for each of the 5 actionable tiles**

**Task 4: CX Pulse Data Pipeline** (8 hours)
- Design Supabase schema for CX metrics (conversations, satisfaction, response times)
- Build ETL: Chatwoot → Supabase transformation
- Create aggregation queries (daily/weekly trends)
- Implement caching (5-minute TTL for dashboard)
- Build API contract for CX Pulse tile
- **Evidence**: CX data flowing to Supabase, queries optimized
- **North Star**: Powers CX Pulse tile with real-time customer insights

**Task 5: Sales Pulse Data Pipeline** (8 hours)
- Design Supabase schema for sales metrics (revenue, orders, products, conversions)
- Build ETL: Shopify Orders → Supabase
- Build ETL: Google Analytics → Supabase
- Create aggregation queries (revenue trends, top products)
- Implement caching strategy
- Build API contract for Sales Pulse tile
- **Evidence**: Sales data pipeline complete, tested
- **North Star**: Powers Sales Pulse tile with revenue insights

**Task 6: SEO Pulse Data Pipeline** (8 hours)
- Design Supabase schema for SEO metrics (traffic, rankings, content performance)
- Build ETL: Google Analytics → Supabase (organic traffic, landing pages)
- Build ETL: Shopify Products → Supabase (page views, bounce rates)
- Create content gap analysis queries
- Implement caching (15-minute TTL)
- Build API contract for SEO Pulse tile
- **Evidence**: SEO data pipeline complete
- **North Star**: Powers SEO Pulse tile with content insights

**Task 7: Inventory Watch Data Pipeline** (8 hours)
- Design Supabase schema for inventory metrics (stock levels, velocity, reorder points)
- Build ETL: Shopify Inventory → Supabase
- Calculate sales velocity (units/day per product)
- Calculate days of stock remaining
- Identify reorder triggers and overstock
- Build API contract for Inventory Watch tile
- **Evidence**: Inventory pipeline complete, calculations validated
- **North Star**: Powers Inventory Watch tile with stock insights

**Task 8: Fulfillment Flow Data Pipeline** (8 hours)
- Design Supabase schema for fulfillment metrics (orders, shipments, carrier performance)
- Build ETL: Shopify Fulfillments → Supabase
- Calculate carrier performance (on-time %, avg delivery days)
- Identify delayed orders
- Track fulfillment trends
- Build API contract for Fulfillment Flow tile
- **Evidence**: Fulfillment pipeline complete
- **North Star**: Powers Fulfillment Flow tile with shipping insights

---

### 🔧 P2 - DATA INFRASTRUCTURE (Week 2-4)

**Task 9: Data Warehouse Optimization** (4 hours)
- Optimize Supabase queries for performance
- Create indexes for common queries
- Implement materialized views for aggregations
- Monitor query performance
- **Evidence**: Query performance <100ms for dashboard
- **North Star**: Fast data = fast dashboard

**Task 10: Data Refresh Automation** (3 hours)
- Schedule ETL jobs (hourly for critical data)
- Implement incremental updates (not full refresh)
- Monitor ETL job health
- Alert on ETL failures
- **Evidence**: Automated ETL running reliably
- **North Star**: Always-fresh data for operators

**Task 11: Data Backup & Recovery** (3 hours)
- Implement automated Supabase backups
- Test data recovery procedures
- Document recovery runbooks
- **Evidence**: Backup/recovery tested
- **North Star**: Operator data protected

**Task 12: Data Retention Policies** (2 hours)
- Implement 180-day retention for audit logs
- Archive old data appropriately
- Set up pg_cron for automatic cleanup
- **Evidence**: Retention policies active
- **North Star**: Compliance with data retention rules

---

### 🎯 P3 - ANALYTICS & INTELLIGENCE (Week 3-5)

**Task 13: Predictive Analytics Foundation** (5 hours)
- Build historical data models (sales, inventory, fulfillment)
- Implement trend analysis algorithms
- Create forecasting models (revenue, stock-outs)
- **Evidence**: Predictive models working
- **North Star**: Help operators plan proactively

**Task 14: Anomaly Detection** (4 hours)
- Detect unusual patterns (sudden sales drops, CX spikes)
- Alert operators to anomalies automatically
- Provide context for anomalies
- **Evidence**: Anomaly detection active
- **North Star**: Catch issues before they become problems

**Task 15: Cross-Tile Correlation Analysis** (4 hours)
- Identify relationships (CX satisfaction → sales)
- Find leading indicators (inventory → fulfillment)
- Generate holistic business insights
- **Evidence**: Correlation insights displaying
- **North Star**: Understand business as a system, not silos

**Task 16: Recommendation Engine** (5 hours)
- ML model for action recommendations
- Learn from CEO approval patterns
- Improve recommendations over time
- **Evidence**: Recommendations improving with feedback
- **North Star**: AI gets smarter as CEO uses it

---

### 🔐 P4 - DATA GOVERNANCE (Week 4-6)

**Task 17: Data Lineage Documentation** (3 hours)
- Document data sources and transformations
- Create data dictionary
- Map data flow through system
- **Evidence**: Data lineage documented
- **North Star**: Transparent data operations

**Task 18: Data Quality Framework** (4 hours)
- Define data quality metrics (completeness, accuracy, timeliness)
- Implement automated quality checks
- Create quality scorecard
- **Evidence**: Quality framework active
- **North Star**: Trustworthy data foundation

**Task 19: Privacy Controls** (3 hours - GDPR for future EU expansion)
- Implement data export functionality
- Implement data deletion functionality
- Document data retention policies
- **Evidence**: Privacy controls tested
- **North Star**: GDPR-ready if expanding to EU

**Task 20: Data Access Controls** (2 hours)
- Implement role-based data access
- Audit data access patterns
- Log sensitive data access
- **Evidence**: Access controls tested
- **North Star**: Secure data access

---

**Total Data Tasks**: 20 production-aligned tasks (6-8 weeks focused work)  
**Every task supports**: 5-tile architecture, operator insights, Hot Rod AN growth  
**Prioritization**: Audit trail → Tile pipelines → Analytics → Governance  
**Evidence Required**: Every task logged in `feedback/data.md` with schema, queries, test results

**Stack Compliance**: Supabase-only (no alternatives), PostgREST for APIs, pg_cron for automation

