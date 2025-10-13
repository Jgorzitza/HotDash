---
epoch: 2025.10.E1
doc: docs/runbooks/SHOPIFY_APP_DEPLOYMENT_FOCUS_2025-10-12T21.md
owner: manager
created: 2025-10-12T21:30:00Z
priority: P0 - URGENT
focus: Deploy Shopify app to dev store for CEO visibility
---

# 🚀 SHOPIFY APP DEPLOYMENT FOCUS — URGENT

**CRITICAL OBJECTIVE**: Get Hot Dash dashboard visible in Shopify dev store NOW  
**CEO Request**: "Push the Shopify app to dev store so I can see current status"  
**Timeline**: Next 2-3 hours  
**Success**: CEO can open Shopify admin, click Hot Dash app, see 5 tiles working

---

## 🎯 P0 - CRITICAL PATH: SHOPIFY APP DEPLOYMENT (4 agents)

### 1. ENGINEER - Deploy Shopify App Embed (60-90 min) ⚡⚡⚡

**CRITICAL**: Get app deployed and embedded in Shopify admin NOW

**Tasks (Execute in Order)**:

```bash
cd ~/HotDash/hot-dash

# TASK 1A: Verify Shopify App Configuration (15 min)
# Use Shopify MCP to validate app setup
# mcp_shopify_learn_shopify_api(api: "admin")
# Verify: SHOPIFY_API_KEY, SHOPIFY_API_SECRET in vault
cat vault/occ/shopify/prod.env
# Confirm: App URL, redirect URLs, scopes configured

# TASK 1B: Build for Production (10 min)
npm run build
# Confirm: Build succeeds, no errors
# Evidence: Build output, dist/ directory created

# TASK 1C: Deploy to Fly.io (15 min)
# Use Fly MCP (MANDATORY)
# mcp_fly_fly-apps-list(org: "hot-dash")
# Check if hotdash-production app exists
# If not: Create new app for production dashboard
# Deploy: Push current build

# TASK 1D: Configure Shopify App URLs (10 min)
# Update app URLs in Shopify Partner Dashboard
# App URL: https://hotdash-production.fly.dev
# Redirect URLs: https://hotdash-production.fly.dev/auth/callback
# Verify: OAuth flow works

# TASK 1E: Test App Installation (10 min)
# Install app on Hot Rod AN dev store
# Navigate to: Apps > Hot Dash
# Expected: Dashboard loads, shows 5 tiles

# TASK 1F: Verify App Embed (10 min)
# Check: App appears in Shopify admin navigation
# Test: Click app, dashboard renders
# Evidence: Screenshot of working app in Shopify admin

# TASK 1G: Fix Any Installation Issues (20 min buffer)
# Debug OAuth, session, rendering issues
# Use Context7 MCP for React Router 7 patterns if needed
# Get app working end-to-end

# Evidence: App deployed, installed, visible in Shopify admin
```

**MCP TOOLS REQUIRED**:
- ✅ Shopify MCP: mcp_shopify_learn_shopify_api
- ✅ Fly MCP: mcp_fly_fly-apps-list, mcp_fly_fly-apps-create, deploy commands
- ✅ Context7 MCP: If debugging React Router 7 issues

**SUCCESS METRIC**: CEO can click "Hot Dash" in Shopify admin and see dashboard

---

### 2. DEPLOYMENT - Production Environment Setup (45-60 min) ⚡⚡

**CRITICAL**: Ensure production environment ready for Shopify app

**Tasks (Execute in Order)**:

```bash
cd ~/HotDash/hot-dash

# TASK 2A: Verify Fly.io Production App (10 min)
# Use Fly MCP (MANDATORY)
# mcp_fly_fly-status(app: "hotdash-production")
# Check: App health, region, scaling

# TASK 2B: Configure Production Secrets (15 min)
# Use Fly MCP to set secrets
# mcp_fly_fly-secrets-list(app: "hotdash-production")
# Verify all secrets: SHOPIFY_*, SUPABASE_*, SESSION_SECRET

# TASK 2C: Set up Custom Domain (10 min)
# Configure: app.hotdash.com or hotdash-production.fly.dev
# Update DNS if needed
# Update Shopify app URLs

# TASK 2D: Configure Auto-scaling (10 min)
# Set min=1, max=3 machines
# Configure health checks
# Set auto-start/auto-stop policies

# TASK 2E: Verify HTTPS/SSL (5 min)
# Confirm: SSL certificate active
# Test: https://hotdash-production.fly.dev/health

# TASK 2F: Set Up Error Monitoring (15 min)
# Configure error tracking
# Set up alerts for 5xx errors
# Document: Where to check logs

# Evidence: Production app healthy, secrets configured, monitoring active
```

**MCP TOOLS REQUIRED**:
- ✅ Fly MCP: All app management, secrets, status commands

**SUCCESS METRIC**: Production environment fully configured and healthy

---

### 3. QA - Shopify App Installation Testing (45-60 min) ⚡

**CRITICAL**: Verify app works in Shopify dev store

**Tasks (Execute in Order)**:

```bash
cd ~/HotDash/hot-dash

# TASK 3A: Test App Installation Flow (15 min)
# Install app on dev store from Partner Dashboard
# Document: Each OAuth screen, permissions requested
# Verify: All scopes granted
# Evidence: Installation screenshots

# TASK 3B: Test Dashboard in Shopify Admin (15 min)
# Navigate: Apps > Hot Dash
# Verify: 5 tiles render
# Test: Each tile loads data
# Evidence: Screenshots of all 5 tiles

# TASK 3C: Test Approval Queue in Shopify (10 min)
# Navigate to: Approval Queue / Mission Control
# Verify: Approvals UI renders
# Test: Approve/reject buttons (if any test data)
# Evidence: Approval queue screenshot

# TASK 3D: Test Mobile View in Shopify Admin (10 min)
# Open Shopify admin on mobile
# Navigate to Hot Dash app
# Verify: Responsive design works
# Evidence: Mobile screenshots

# TASK 3E: Test Shopify Data Integration (15 min)
# Verify: Sales Pulse shows real order data
# Verify: Inventory Watch shows real product data
# Use Shopify MCP to validate data accuracy
# Evidence: Data validation report

# Evidence: Complete installation test report with screenshots
```

**MCP TOOLS REQUIRED**:
- ✅ Shopify MCP: mcp_shopify_introspect_graphql_schema for data validation

**SUCCESS METRIC**: Full test report showing app working in Shopify admin

---

### 4. INTEGRATIONS - Shopify API Production Testing (60-90 min) ⚡

**CRITICAL**: Ensure all Shopify integrations work with real store data

**Tasks (Execute in Order)**:

```bash
cd ~/HotDash/hot-dash

# TASK 4A: Test Sales Pulse Queries (15 min)
# Use Shopify MCP to test SALES_PULSE_QUERY with real store
# mcp_shopify_validate_graphql_codeblocks
# Verify: Returns Hot Rod AN orders
# Evidence: Query results

# TASK 4B: Test Inventory Queries (15 min)
# Use Shopify MCP to test LOW_STOCK_QUERY
# Verify: Returns Hot Rod AN product inventory
# Evidence: Inventory data

# TASK 4C: Test Order Fulfillment Queries (15 min)
# Use Shopify MCP to test ORDER_FULFILLMENTS_QUERY
# Verify: Returns fulfillment status
# Evidence: Fulfillment data

# TASK 4D: Test Product Queries (10 min)
# Query Hot Rod AN product catalog
# Verify: All AN fittings, fuel system parts appear
# Evidence: Product list

# TASK 4E: Test Customer Queries (10 min)
# Query Hot Rod AN customer data
# Verify: Customer segments, orders visible
# Evidence: Customer data

# TASK 4F: Performance Testing (15 min)
# Measure query response times
# Test with 10, 50, 100 orders
# Document: Average response times
# Evidence: Performance report

# TASK 4G: Rate Limit Testing (10 min)
# Test Shopify API rate limits
# Verify: Proper backoff/retry logic
# Evidence: Rate limit handling report

# Evidence: Complete Shopify integration test report
```

**MCP TOOLS REQUIRED**:
- ✅ Shopify MCP: All query validation and testing tools

**SUCCESS METRIC**: All Shopify queries work with production store data

---

## 🎯 P1 - SHOPIFY APP FEATURES (6 agents, 40+ tasks)

### 5. ENGINEER - Dashboard Tiles Implementation (2-3 hours)

**Focus**: Make all 5 tiles functional with real Shopify data

**20 Tasks**:

```bash
# 5A: Sales Pulse Tile - Real-Time Data (30 min)
# Connect to Shopify orders API
# Show: Today's revenue, order count, average order value
# Use Shopify MCP to validate queries

# 5B: Sales Pulse Tile - Trend Chart (30 min)
# Add 7-day revenue trend chart
# Use Chart.js or similar
# Real Hot Rod AN data

# 5C: Inventory Watch Tile - Stock Levels (30 min)
# Show current stock for top products
# Highlight low stock items (< 10 units)
# Use Shopify MCP inventory queries

# 5D: Inventory Watch Tile - Reorder Alerts (20 min)
# Calculate reorder points
# Show products needing restock
# Hot Rod AN specific logic

# 5E: Fulfillment Flow Tile - Pending Orders (30 min)
# Show orders awaiting fulfillment
# Group by priority (urgent vs normal)
# Real Hot Rod AN orders

# 5F: Fulfillment Flow Tile - Shipping Status (30 min)
# Show in-transit orders
# Track carrier performance
# Link to tracking numbers

# 5G: CX Pulse Tile - Support Metrics (30 min)
# Show open conversations (Chatwoot integration)
# Average response time
# Customer satisfaction score

# 5H: CX Pulse Tile - Recent Inquiries (20 min)
# List recent customer messages
# Highlight urgent issues
# Link to Chatwoot

# 5I: SEO Pulse Tile - Traffic Sources (30 min)
# Show Google Analytics traffic data
# Top landing pages
# Conversion rates

# 5J: SEO Pulse Tile - Search Rankings (20 min)
# Show keyword rankings (if available)
# Traffic trends
# Content performance

# 5K: Tile Loading States (15 min)
# Add proper loading spinners
# Use HOT_ROD_STATUS constants
# Automotive-themed loading text

# 5L: Tile Error States (15 min)
# Add proper error handling
# Use HOT_ROD_ERROR constants
# Automotive-themed error messages

# 5M: Tile Refresh Functionality (20 min)
# Add refresh button to each tile
# Auto-refresh every 30 seconds
# Show last updated timestamp

# 5N: Tile Click-Through Actions (20 min)
# Make tiles clickable
# Navigate to detail views
# Proper routing

# 5O: Tile Data Caching (20 min)
# Cache tile data for 30 seconds
# Reduce API calls
# Improve performance

# 5P: Tile Responsive Design (20 min)
# Ensure tiles work on mobile
# Test in Shopify admin mobile view
# Fix any layout issues

# 5Q: Tile Accessibility (20 min)
# Implement Designer's P0 fixes
# ARIA labels, keyboard navigation
# Screen reader support

# 5R: Tile Analytics Tracking (15 min)
# Track tile views, clicks
# Log to dashboard_fact table
# CEO usage analytics

# 5S: Tile Customization (25 min)
# Allow operators to reorder tiles
# Show/hide specific tiles
# Save preferences

# 5T: Tile Documentation (15 min)
# Add tooltips explaining each tile
# Inline help text
# Link to support docs

# Evidence: All 20 tasks logged, tiles functional with real data
```

**MCP TOOLS REQUIRED**:
- ✅ Shopify MCP: For all data queries
- ✅ Context7 MCP: For React Router 7 patterns
- ✅ Supabase MCP: For caching and analytics

---

### 6. DATA - Shopify Data Pipelines (2-3 hours)

**Focus**: ETL pipelines for 5 tiles with real Shopify data

**15 Tasks**:

```bash
# 6A: Sales Data ETL Pipeline (30 min)
# Extract orders from Shopify daily
# Transform to sales metrics
# Load to sales_metrics_daily table
# Use Shopify MCP for queries

# 6B: Inventory Snapshot Pipeline (30 min)
# Extract inventory levels
# Create daily snapshots
# Track velocity (items sold per day)

# 6C: Fulfillment Tracking Pipeline (25 min)
# Extract fulfillment events
# Track shipping times
# Carrier performance metrics

# 6D: Customer Segment Pipeline (25 min)
# Extract customer data
# Segment by purchase history
# VIP customers, at-risk customers

# 6E: Product Performance Pipeline (25 min)
# Extract product views, sales
# Calculate conversion rates
# Bestsellers, slow movers

# 6F: Create Materialized Views (30 min)
# sales_pulse_current view
# inventory_watch_current view
# fulfillment_flow_current view
# Use Supabase MCP

# 6G: Optimize Query Performance (30 min)
# Add indexes based on Supabase advisor
# Test query times for each tile
# Target: < 100ms per tile

# 6H: Data Refresh Automation (20 min)
# Set up cron jobs for ETL
# Every 5 minutes for real-time tiles
# Hourly for analytics tiles

# 6I: Data Quality Checks (20 min)
# Validate Shopify data completeness
# Check for null values, outliers
# Log data quality issues

# 6J: Historical Data Backfill (30 min)
# Backfill last 30 days of data
# Ensure trends have history
# Use Shopify MCP for bulk queries

# 6K: Data Documentation (15 min)
# Document each pipeline
# Data flow diagrams
# Update interval, dependencies

# 6L: Error Handling for APIs (20 min)
# Handle Shopify API failures gracefully
# Retry logic with exponential backoff
# Alert on repeated failures

# 6M: Data Retention Policies (15 min)
# Define retention for raw vs aggregated
# Archive old data
# Comply with privacy requirements

# 6N: Analytics Database Setup (20 min)
# Separate analytics schema
# Read replicas for heavy queries
# Don't impact live database

# 6O: Real-time Data Streaming (30 min)
# Set up Shopify webhooks for real-time
# Stream order events to database
# Update tiles instantly

# Evidence: All 15 pipelines documented and operational
```

**MCP TOOLS REQUIRED**:
- ✅ Shopify MCP: For all data extraction
- ✅ Supabase MCP: For database operations, advisors

---

### 7. QA-HELPER - Shopify Integration Tests (2 hours)

**Focus**: Automated tests for Shopify integration

**12 Tasks**:

```bash
# 7A: Test Shopify Authentication (20 min)
# Test OAuth flow
# Token refresh
# Session management

# 7B: Test Sales Queries (15 min)
# Mock Shopify API responses
# Test data transformation
# Validate output format

# 7C: Test Inventory Queries (15 min)
# Test low stock detection
# Test reorder logic
# Edge cases (0 stock, negative)

# 7D: Test Order Processing (15 min)
# Test order status tracking
# Test fulfillment updates
# Test cancellations

# 7E: Test Rate Limiting (20 min)
# Test Shopify API rate limit handling
# Test retry logic
# Test backoff strategy

# 7F: Test Error Handling (20 min)
# Test network failures
# Test invalid responses
# Test timeout handling

# 7G: Test Data Caching (15 min)
# Test cache hit/miss
# Test cache invalidation
# Test stale data handling

# 7H: Test Webhook Processing (20 min)
# Test order webhooks
# Test product webhooks
# Test verification signatures

# 7I: Integration Test Suite (30 min)
# Create E2E test for each tile
# Test with mock Shopify data
# All tiles render correctly

# 7J: Performance Tests (20 min)
# Test query performance
# Test concurrent requests
# Test under load

# 7K: Security Tests (15 min)
# Test OAuth security
# Test token storage
# Test API key handling

# 7L: Documentation (15 min)
# Document all test scenarios
# How to run tests
# Expected results

# Evidence: 12 test suites created, all passing
```

**MCP TOOLS REQUIRED**:
- ✅ Shopify MCP: For validation and test data
- ✅ Context7 MCP: For React testing patterns

---

### 8. RELIABILITY - Production Monitoring (1.5-2 hours)

**Focus**: Monitor Shopify app in production

**12 Tasks**:

```bash
# 8A: Set Up Uptime Monitoring (15 min)
# Monitor: https://hotdash-production.fly.dev
# Check every 1 minute
# Alert if down > 2 minutes

# 8B: API Response Time Monitoring (20 min)
# Track response times for each tile
# p50, p95, p99 percentiles
# Alert if > 2 seconds

# 8C: Error Rate Monitoring (15 min)
# Track 4xx and 5xx errors
# Alert if error rate > 1%
# Log error details

# 8D: Shopify API Health (20 min)
# Monitor Shopify API calls
# Track rate limit usage
# Alert if approaching limits

# 8E: Database Performance (20 min)
# Monitor query times using Supabase MCP
# Track slow queries (> 1 second)
# Connection pool utilization

# 8F: Memory and CPU Monitoring (15 min)
# Track Fly app resource usage
# Alert if memory > 80%
# Auto-scale if needed

# 8G: User Activity Tracking (20 min)
# Track dashboard views
# Track tile interactions
# CEO usage patterns

# 8H: Tile Load Time Monitoring (20 min)
# Track how long each tile takes
# Identify slowest tiles
# Optimization opportunities

# 8I: Create Monitoring Dashboard (30 min)
# Grafana or similar
# Key metrics visible
# Real-time updates

# 8J: Set Up Alerting (20 min)
# Email/Slack alerts
# Define alert thresholds
# Escalation procedures

# 8K: Log Aggregation (20 min)
# Central logging for all services
# Searchable logs
# Retention policy

# 8L: Incident Runbook (20 min)
# Document common issues
# Resolution procedures
# Who to contact

# Evidence: Monitoring fully operational, alerts configured
```

**MCP TOOLS REQUIRED**:
- ✅ Fly MCP: App status, logs monitoring
- ✅ Supabase MCP: Database performance monitoring

---

### 9. COMPLIANCE - Shopify App Security (1-1.5 hours)

**Focus**: Ensure Shopify app meets security requirements

**10 Tasks**:

```bash
# 9A: OAuth Security Audit (15 min)
# Verify OAuth implementation
# Check token storage
# Validate redirect URLs

# 9B: API Key Security (10 min)
# Confirm no keys in code
# All in Fly secrets
# Proper access controls

# 9C: Session Security (15 min)
# Verify session encryption
# Check session expiry
# Test session hijacking prevention

# 9D: Data Privacy Compliance (20 min)
# Verify RLS on all tables
# Customer data handling

# Implement customer data request webhook
# Implement customer redact webhook
# Implement shop redact webhook

# 9F: Security Headers (10 min)
# Verify CSP, CORS headers
# X-Frame-Options
# HSTS configuration

# 9G: Input Validation (15 min)
# Verify all user inputs validated
# SQL injection prevention
# XSS prevention

# 9H: Rate Limiting (10 min)
# Verify rate limiting on endpoints
# Prevent abuse
# DDoS protection

# 9I: Security Testing (20 min)
# Run security scan
# Test for vulnerabilities
# Document findings

# 9J: Security Checklist (15 min)
# Create production security checklist
# Sign-off requirements
# Launch approval

# Evidence: Security audit complete, all checks passed
```

**MCP TOOLS REQUIRED**:
- ✅ Supabase MCP: For RLS verification
- ✅ grep: For security pattern checks

---

### 10. DESIGNER - Shopify App Polish (1-1.5 hours)

**Focus**: Make Shopify app look professional

**10 Tasks**:

```bash
# 10A: Shopify Polaris Compliance (20 min)
# Ensure consistent with Shopify admin
# Use Polaris components
# Match Shopify design system

# 10B: Hot Rod AN Branding (15 min)
# Add Hot Rod AN logo
# Automotive-themed colors
# Brand consistency

# 10C: Loading States Design (15 min)
# Design loading animations
# Automotive-themed (engine starting, etc.)
# Smooth transitions

# 10D: Empty States Design (15 min)
# Design empty state for each tile
# Helpful messaging
# Call-to-action

# 10E: Error States Design (15 min)
# Design error pages
# "Engine Trouble" theme
# Clear next steps

# 10F: Mobile Optimization (20 min)
# Optimize for mobile Shopify admin
# Touch-friendly buttons
# Responsive tiles

# 10G: Accessibility Review (20 min)
# WCAG 2.1 AA compliance
# Keyboard navigation
# Screen reader support

# 10H: Create Style Guide (15 min)
# Document Hot Rod AN design system
# Colors, typography, components
# For future development

# 10I: Create UI Component Library (20 min)
# Reusable tile components
# Button styles
# Form elements

# 10J: Screenshot/Demo Assets (20 min)
# Create beautiful screenshots
# For Shopify App Store listing
# For marketing materials

# Evidence: Design polish complete, screenshots ready
```

**MCP TOOLS REQUIRED**:
- None (design work)

---

## 🎯 P2 - SUPPORTING WORK (Additional 40+ tasks)

### 11-18. Additional Agent Tasks

**Chatwoot** (8 tasks): Approval queue integration testing  
**Support** (10 tasks): Operator training materials for Shopify app  
**Product** (10 tasks): Feature prioritization, CEO feedback loops  
**Marketing** (8 tasks): Shopify App Store listing, screenshots  
**Enablement** (10 tasks): Video tutorials for using app in Shopify  
**Localization** (6 tasks): Ensure consistent copy throughout  
**AI** (8 tasks): Expand knowledge base with Shopify-specific content  
**Engineer-Helper** (10 tasks): Support Engineer with tile implementation

---

## 📊 TASK SUMMARY

**Total Tasks Assigned**: 150+ tasks across 18 agents  
**Focus**: Get Shopify app deployed and visible to CEO  
**Timeline**: 2-3 hours for P0, ongoing for P1/P2  
**Success**: CEO can use Hot Dash in Shopify admin with real data

---

## ⚠️ CRITICAL MCP USAGE

- ✅ Shopify MCP: For ALL Shopify queries, validation, data
- ✅ Context7 MCP: For React Router 7 patterns
- ✅ Fly MCP: For ALL deployment operations
- ✅ Supabase MCP: For ALL database operations
- ❌ NO manual CLI usage - use MCPs

---

**Manager Priority**: DEPLOY SHOPIFY APP TO DEV STORE NOW  
**CEO Visibility**: This is #1 priority  
**All agents**: Focus on Shopify app deployment and functionality

🚀 LET'S DEPLOY!
