---
epoch: 2025.10.E1
doc: docs/runbooks/SHOPIFY_SUPPORT_TASKS_2025-10-12T21-45.md
owner: manager
created: 2025-10-12T21:45:00Z
focus: Support Engineer's Shopify deployment
---

# 🚀 SHOPIFY DEPLOYMENT SUPPORT TASKS

**Context**: Engineer deploying to Fly.io NOW (Task 1C in progress)  
**8 Idle Agents**: Need productive work supporting deployment  
**Goal**: CEO sees working app in Shopify admin

---

## 🔴 P0 - DEPLOYMENT SUPPORT (Start Immediately)

### 1. ENGINEER-HELPER — Support Engineer Deployment (30-45 min) ⚡

**CRITICAL**: Pair with Engineer on deployment

```bash
cd ~/HotDash/hot-dash

# CURRENT: Engineer deploying to Fly.io (Task 1C)

# YOUR TASKS:
# 1A: Monitor deployment progress
# Check Engineer's feedback for issues
# Be ready to help debug

# 1B: Prepare Shopify app installation steps
# Read docs/dev/authshop.md
# Document OAuth flow steps
# Prepare for Task 1E (install on dev store)

# 1C: Test OAuth callback locally
npm run dev
# Test: http://localhost:3000/auth/callback
# Verify session management works

# 1D: Verify Shopify app scopes
cat shopify.app.toml
# Confirm: All needed scopes listed
# Compare with vault/occ/shopify/prod.env

# 1E: Help Engineer with Task 1E-1G
# Pair on: App installation, testing, issue fixes
# Use Context7 MCP for React Router 7 patterns

# Evidence: Deployment support, OAuth verification
```

**MCP TOOLS REQUIRED**:
- ✅ Context7 MCP: React Router 7 patterns for OAuth
- ✅ grep: Search for OAuth patterns

---

### 2. DEPLOYMENT — Monitor Production Deployment (30 min) ⚡

**CRITICAL**: Watch Engineer's deployment, be ready to help

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS:
# 2A: Monitor Fly deployment with Fly MCP
# mcp_fly_fly-status(app: "hotdash-staging")
# Check: Deployment succeeds, app starts

# 2B: Monitor logs with Fly MCP
# mcp_fly_fly-logs(app: "hotdash-staging")
# Watch for errors during startup

# 2C: Verify health endpoint
curl https://hotdash-staging.fly.dev/health
# Expected: {"status": "ok"}

# 2D: Check app metrics with Fly MCP
# mcp_fly_fly-machine-list(app: "hotdash-staging")
# Verify: Machines running, no crashes

# 2E: Support Engineer if issues
# Be ready to adjust secrets, restart, debug

# Evidence: Monitoring logs, health verification
```

**MCP TOOLS REQUIRED**:
- ✅ Fly MCP: mcp_fly_fly-status, mcp_fly_fly-logs, mcp_fly_fly-machine-list

---

### 3. RELIABILITY — Active Monitoring During Deployment (45 min) ⚡

**CRITICAL**: Monitor all systems during deployment

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS:
# 3A: Monitor Fly app with Fly MCP
# mcp_fly_fly-status(app: "hotdash-staging")
# Track: CPU, memory, response times

# 3B: Monitor database with Supabase MCP
# mcp_supabase_list_tables
# Verify: All tables healthy during deployment

# 3C: Check for errors with Fly MCP
# mcp_fly_fly-logs(app: "hotdash-staging")
# Alert Manager if errors detected

# 3D: Verify service health
curl https://hotdash-agent-service.fly.dev/health
curl https://hotdash-llamaindex-mcp.fly.dev/health
# Confirm: Both healthy

# 3E: Track deployment metrics
# Response times, error rates, CPU/memory
# Create real-time monitoring log

# Evidence: Active monitoring log every 5 minutes
```

**MCP TOOLS REQUIRED**:
- ✅ Fly MCP: All monitoring tools
- ✅ Supabase MCP: Database health checks

---

### 4. INTEGRATIONS — Shopify API Live Testing (60 min) ⚡

**CRITICAL**: Test Shopify APIs with real store immediately after deployment

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS:
# 4A: Prepare Shopify API test suite
# Review your comprehensive test plan
# File: tests/integration/shopify-production-tests.md

# 4B: When Engineer deploys, test Sales Pulse query
# Use Shopify MCP to validate SALES_PULSE_QUERY
# mcp_shopify_validate_graphql_codeblocks
# Test with real Hot Rod AN orders

# 4C: Test Inventory queries
# Use Shopify MCP for LOW_STOCK_QUERY
# Verify: Real product inventory returns

# 4D: Test Order Fulfillment queries  
# Use Shopify MCP for ORDER_FULFILLMENTS_QUERY
# Verify: Real fulfillment data

# 4E: Test rate limiting behavior
# Multiple rapid queries
# Verify backoff logic works

# 4F: Document all test results
# Query performance, data accuracy
# Any API limitations found

# Evidence: Complete API test report with Shopify MCP validation
```

**MCP TOOLS REQUIRED**:
- ✅ Shopify MCP: ALL validation tools (MANDATORY for every query test)

---

## 🟡 P1 - SHOPIFY APP CONTENT (Support Deployment)

### 5. DESIGNER — Create Shopify App Store Listing (60-90 min)

**PRIORITY**: Prepare app for Shopify App Store

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS (20 tasks total):
# 5A: App Name and Tagline (10 min)
# Name: "Hot Dash - Automotive Operations Center"
# Tagline: "Command center for automotive parts retailers"

# 5B: App Description (30 min)
# Write compelling 500-word description
# Focus: Time savings, automation, Hot Rod AN success
# Automotive-specific benefits

# 5C: Create Screenshots (30 min)
# 5 tile screenshots
# Approval queue screenshot
# Mobile view screenshot
# Use design tools to create beautiful mockups

# 5D: Feature List (15 min)
# List all features for App Store
# Highlight: Real-time dashboards, AI-assisted approvals

# 5E: Benefits Section (15 min)
# CEO time savings (10-12h → <2h/week)
# Data-driven decisions
# Automated insights

# 5F: Pricing Model Design (20 min)
# Free tier: Basic dashboard
# Pro tier: AI approvals, advanced analytics
# Pricing strategy for automotive vertical

# 5G: Support Documentation (30 min)
# Getting started guide
# FAQ
# Contact support

# 5H: App Icon Design (45 min)
# Automotive-themed icon
# Hot Rod AN branding
# Shopify guidelines compliant

# 5I: Marketing Banner (30 min)
# Hero image for App Store
# Professional, automotive theme

# 5J: Video Preview Script (30 min)
# 30-second app preview video script
# Highlight 5 tiles, approval queue

# 5K-5T: Additional polish tasks (10 more)
# Review app listing quality
# A/B test copy
# Optimize for search
# Get feedback from team
# Iterate based on feedback

# Evidence: Complete Shopify App Store listing package
```

**MCP TOOLS REQUIRED**:
- None (design/writing work)

**DELIVERABLE**: Complete App Store listing ready for submission

---

### 6. SUPPORT — Create Shopify App Onboarding Guide (60-90 min)

**PRIORITY**: Help new users get started quickly

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS (15 tasks total):
# 6A: Installation Guide (20 min)
# Step-by-step: Install from Shopify App Store
# Screenshots at each step
# Troubleshooting common issues

# 6B: First-Time Setup Guide (30 min)
# Initial configuration steps
# Connecting data sources
# Setting preferences

# 6C: Dashboard Tour (30 min)
# Guide through all 5 tiles
# What each tile shows
# How to interpret data

# 6D: Approval Queue Training (30 min)
# How to use approval queue
# Approve/reject decisions
# Quality standards

# 6E: Troubleshooting Guide (20 min)
# Common issues and solutions
# Error messages explained
# When to contact support

# 6F: Video Tutorial Script (30 min)
# 5-minute onboarding video
# Screen recording script
# Voiceover text

# 6G: Quick Start Checklist (15 min)
# 5-step checklist for first use
# Print-ready format

# 6H: Operator Certification (45 min)
# Levels: Basic, Intermediate, Advanced
# Quiz for each level
# Certification criteria

# 6I: Best Practices Guide (30 min)
# How to use dashboard efficiently
# Daily workflow recommendations
# Time-saving tips

# 6J: Hot Rod AN Specific Guide (30 min)
# AN fittings inventory management
# Fuel system product support
# Race season prep

# 6K-6O: Additional training tasks (5 more)
# Advanced features guide
# Integration tutorials
# Mobile app guide
# Keyboard shortcuts
# Support escalation

# Evidence: Complete onboarding package
```

**MCP TOOLS REQUIRED**:
- ✅ grep: Find features to document

**DELIVERABLE**: Comprehensive onboarding guide package

---

### 7. PRODUCT — Create Feature Launch Plan (60-90 min)

**PRIORITY**: Plan next features after initial deployment

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS (20 tasks total):
# 7A: Tile Feature Matrix (30 min)
# Document current vs planned features for each tile
# Sales Pulse: What's live, what's next
# Inventory Watch: Current features, enhancements
# etc.

# 7B: Post-Deployment Iteration Plan (30 min)
# Week 1: Bug fixes, polish
# Week 2: Enhanced analytics
# Week 3: New features
# Week 4: Optimization

# 7C: CEO Feedback Collection Plan (20 min)
# Daily check-ins first week
# Weekly feedback sessions
# Usage analytics review

# 7D: Feature Prioritization Framework (30 min)
# How to decide what to build next
# CEO requests vs technical debt
# Data-driven decisions

# 7E: Beta User Recruitment (30 min)
# Beyond Hot Rod AN
# 5-10 automotive retailers
# Recruitment criteria

# 7F: Product Analytics Setup (45 min)
# Track: Feature usage, tile views, approval rates
# Dashboard for product team
# Weekly reporting

# 7G: Competitor Analysis (45 min)
# Other Shopify dashboard apps
# What we do better
# Differentiation strategy

# 7H: Pricing Strategy (30 min)
# Free vs Pro tiers
# ROI calculation for customers
# Pricing page copy

# 7I: Roadmap Communication (30 min)
# How to communicate upcoming features
# Changelog format
# Release notes

# 7J: User Research Plan (30 min)
# Interview guide for CEO
# Questions about dashboard usage
# Pain points to solve

# 7K-7T: Additional product tasks (10 more)
# Feature specs for next 3 months
# Growth metrics tracking
# Retention strategies
# Churn prevention
# Upsell opportunities
# Partnership opportunities
# Multi-store support
# API access for enterprises
# White-label options
# Vertical expansion (beyond automotive)

# Evidence: Complete product strategy package
```

**MCP TOOLS REQUIRED**:
- None (strategy work)

**DELIVERABLE**: Product roadmap and strategy documents

---

### 8. ENABLEMENT — Create Video Tutorial Content (60-90 min)

**PRIORITY**: Prepare to record videos once app deployed

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS (15 tasks total):
# 8A: Quick Start Video Script (20 min)
# 2-minute quick start
# Installation to first use
# Voiceover text ready

# 8B: Dashboard Overview Video Script (30 min)
# 5-minute full overview
# All 5 tiles explained
# Voiceover and screen recording plan

# 8C: Approval Queue Video Script (20 min)
# 3-minute approval queue tutorial
# How to approve/reject
# Quality standards

# 8D: Troubleshooting Video Script (20 min)
# Common issues and solutions
# Screen recording plan

# 8E: Mobile App Video Script (15 min)
# Using dashboard on mobile
# Shopify admin mobile view

# 8F: Advanced Features Video Script (30 min)
# Power user tips
# Keyboard shortcuts
# Customization options

# 8G: Prepare Screen Recording Setup (30 min)
# Software: OBS or similar
# Recording settings
# Audio setup

# 8H: Create Video Thumbnails (30 min)
# Professional thumbnails for each video
# Consistent branding

# 8I: Video Hosting Plan (20 min)
# Where to host (YouTube, Vimeo)
# Embed on support site
# Access control

# 8J: Video SEO Optimization (20 min)
# Titles, descriptions, tags
# Optimize for discovery

# 8K-8O: Additional video tasks (5 more)
# Animated explainer video
# Customer testimonial videos
# Behind-the-scenes content
# Live demo recordings
# Webinar planning

# Evidence: All video scripts ready, recording setup complete
```

**MCP TOOLS REQUIRED**:
- None (content creation)

**DELIVERABLE**: Complete video tutorial package (ready to record)

---

## 🟡 P1 - SHOPIFY APP QUALITY (Next Phase)

### 9. COMPLIANCE — Shopify App Review Preparation (45-60 min)

**PRIORITY**: Prepare for Shopify App Store review

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS (12 tasks total):
# 9A: Review Shopify App Requirements (15 min)
# Read: Shopify App Store guidelines
# Checklist: All requirements met

# 9B: Privacy Policy for App Store (30 min)
# What data we collect
# How we use it
# GDPR compliance

# 9C: Terms of Service (20 min)
# Service terms for app users
# Liability disclaimers
# Cancellation policy

# 9D: Data Processing Agreement (20 min)
# DPA for enterprise customers
# GDPR requirements
# Data retention

# 9E: Security Documentation (20 min)
# Security practices
# Encryption, authentication
# Compliance certifications

# 9F: App Permissions Justification (15 min)
# Why each scope is needed
# Document for Shopify review

# 9G: Webhook Security Documentation (15 min)
# HMAC verification
# Event handling
# Retry logic

# 9H: Support Contact Information (10 min)
# Support email
# Response time commitments
# Escalation procedures

# 9I: Accessibility Statement (15 min)
# WCAG compliance
# Accessibility features
# Contact for issues

# 9J: App Store Review Checklist (20 min)
# All requirements checked
# Documentation complete
# Ready for submission

# 9K-9L: Additional compliance (2 more)
# Legal review coordination
# Insurance requirements

# Evidence: Complete App Store review package
```

**MCP TOOLS REQUIRED**:
- ✅ Supabase MCP: Verify RLS for privacy claims
- ✅ grep: Verify security patterns

---

### 10. SUPPORT — Create In-App Help System (60-90 min)

**PRIORITY**: Build help system inside dashboard

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS (15 tasks total):
# 10A: Help Button Component Design (20 min)
# Floating help button
# Contextual help
# Always accessible

# 10B: Tooltips for Each Tile (30 min)
# Sales Pulse: What data means
# Inventory Watch: How to interpret alerts
# Fulfillment Flow: Next actions
# CX Pulse: Priority indicators
# SEO Pulse: Traffic interpretation

# 10C: Inline Help Text (30 min)
# Add help text throughout UI
# Explain complex features
# Link to detailed docs

# 10D: FAQ Widget (30 min)
# Common questions
# Searchable
# Quick answers

# 10E: Video Tutorials Integration (20 min)
# Embed tutorial videos in app
# Contextual video help
# "Watch how" links

# 10F: Keyboard Shortcuts Help (15 min)
# Shortcut reference modal
# Accessible via "?"
# Grouped by function

# 10G: Onboarding Tour (45 min)
# First-time user walkthrough
# Highlight key features
# Interactive tutorial

# 10H: Contextual Help System (30 min)
# Help changes based on current page
# Relevant tips shown
# Smart suggestions

# 10I: Search-Based Help (30 min)
# Search across all help content
# Instant answers
# Link to detailed guides

# 10J: Feedback Widget (20 min)
# In-app feedback button
# Report bugs, suggest features
# Direct to product team

# 10K-10O: Additional help tasks (5 more)
# Help analytics (track what users search)
# Help content updates process
# Multilingual help (future)
# Help API for developers
# Help widget customization

# Evidence: In-app help system specification
```

**MCP TOOLS REQUIRED**:
- ✅ grep: Find features needing help text

---

### 11. PRODUCT — User Analytics Implementation (60-90 min)

**PRIORITY**: Track how CEO uses the dashboard

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS (18 tasks total):
# 11A: Define Key Events to Track (20 min)
# Dashboard views, tile interactions
# Approval actions, search queries
# Time spent per session

# 11B: Analytics Schema Design (30 min)
# Create: dashboard_events table
# Fields: user_id, event_type, properties, timestamp
# Use Supabase MCP to create migration

# 11C: Implement Event Tracking (45 min)
# Add tracking to critical actions
# Tile clicks, approvals, searches
# Log to dashboard_events table

# 11D: Create Analytics Dashboard (45 min)
# Query: Most used tiles
# Query: Average session duration
# Query: Approval patterns

# 11E: Weekly Report Generator (30 min)
# Automated weekly usage report
# Email to CEO with insights
# Key metrics highlighted

# 11F: A/B Testing Framework (30 min)
# Test different tile layouts
# Test messaging variations
# Track which performs better

# 11G: Funnel Analysis (30 min)
# Track: Login → Tile view → Action
# Identify drop-off points
# Optimization opportunities

# 11H: Cohort Analysis (30 min)
# Group users by behavior
# Power users vs casual users
# Engagement patterns

# 11I: Retention Metrics (20 min)
# Daily active users
# Weekly active users
# Churn tracking

# 11J: Feature Adoption Tracking (25 min)
# Which features used most
# Which features ignored
# Feature improvement priorities

# 11K-11R: Additional analytics (8 more)
# Performance tracking
# Error tracking
# Search analytics
# Mobile vs desktop usage
# Time-of-day patterns
# Seasonal trends
# Predictive analytics
# Custom reports

# Evidence: Complete analytics implementation
```

**MCP TOOLS REQUIRED**:
- ✅ Supabase MCP: Create tables, run queries

---

### 12. ENABLEMENT — Interactive Demo Creation (45-60 min)

**PRIORITY**: Create interactive demo for prospects

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS (12 tasks total):
# 12A: Demo Environment Setup (20 min)
# Separate demo store
# Sample Hot Rod AN data
# Pre-populated scenarios

# 12B: Demo Script Creation (30 min)
# 10-minute live demo script
# Key talking points
# Feature highlights

# 12C: Demo Data Generator (30 min)
# Script to populate demo data
# Realistic Hot Rod AN orders
# Sample customer inquiries

# 12D: Demo Walkthrough Guide (20 min)
# Step-by-step demo guide
# For sales presentations
# Consistent messaging

# 12E: Demo FAQ (15 min)
# Common questions during demos
# Prepared answers
# Objection handling

# 12F: Demo Customization Guide (20 min)
# How to customize for prospects
# Industry-specific examples
# Personalization options

# 12G: Demo Metrics Tracking (20 min)
# Track demo effectiveness
# Conversion rates
# Feedback collection

# 12H: Self-Service Demo (45 min)
# Automated demo environment
# Prospects can try themselves
# Guided tour included

# 12I: Demo Video Recording (30 min)
# Record professional demo
# Edit and polish
# Host on website

# 12J: Sales Team Training (30 min)
# Train sales on giving demos
# Best practices
# Common pitfalls

# 12K-12L: Additional demo tasks (2 more)
# Demo analytics dashboard
# Demo iteration based on feedback

# Evidence: Complete demo package
```

**MCP TOOLS REQUIRED**:
- ✅ Shopify MCP: Create demo store data

---

### 13. MARKETING — Shopify App Launch Campaign (60-90 min)

**PRIORITY**: Prepare comprehensive launch campaign

```bash
cd ~/HotDash/hot-dash

# YOUR TASKS (20 tasks total):
# 13A: Launch Email Sequence (30 min)
# Email 1: App launch announcement
# Email 2: Feature highlights (3 days later)
# Email 3: Success story (1 week later)

# 13B: Social Media Campaign (45 min)
# LinkedIn: 5 posts over 2 weeks
# Twitter: 10 tweets with visuals
# Instagram: 3 carousel posts

# 13C: Blog Post Series (60 min)
# Post 1: Announcing Hot Dash
# Post 2: How we built it
# Post 3: Hot Rod AN success story

# 13D: Press Release Distribution (30 min)
# Target: Automotive trade publications
# Target: E-commerce publications
# Target: Tech publications

# 13E: Influencer Outreach (30 min)
# Identify automotive influencers
# Personalized outreach messages
# Partnership opportunities

# 13F: Community Engagement Plan (30 min)
# Hot rod forums
# Facebook groups
# Reddit communities

# 13G: Content Calendar (30 min)
# 30-day post-launch content plan
# Themes, topics, formats
# Posting schedule

# 13H: Launch Metrics Tracking (20 min)
# Track: App installs, website visits
# Social media engagement
# Press coverage

# 13I: Retargeting Campaign (30 min)
# Pixel implementation
# Retargeting ads for visitors
# Conversion optimization

# 13J: Partnership Announcements (30 min)
# Partner with complementary apps
# Co-marketing opportunities
# Cross-promotion

# 13K-13T: Additional marketing (10 more)
# SEO optimization
# Paid advertising strategy
# Affiliate program
# Referral incentives
# Case study creation
# Testimonial collection
# Review generation
# PR media kit
# Podcast outreach
# Conference presentations

# Evidence: Complete launch campaign package
```

**MCP TOOLS REQUIRED**:
- ✅ grep: Find features to promote

---

## 🟢 P2 - ADDITIONAL SUPPORT TASKS

### 14-18. Remaining Agents

**Designer**: Additional 10 Shopify app polish tasks  
**Support**: Additional 10 help system tasks  
**Product**: Additional 10 analytics tasks  
**Enablement**: Additional 8 video tasks  
**Marketing**: Additional 10 campaign tasks

**Total Additional**: 48+ tasks

---

## 📊 TASK SUMMARY

**Total New Tasks**: 150+ across 8 idle agents  
**P0**: 25 tasks (Deployment support)  
**P1**: 80 tasks (App quality and content)  
**P2**: 45+ tasks (Additional support)

**Timeline**:
- Next 1 hour: Deployment support (critical)
- Next 2 hours: App Store listing, onboarding
- Next 3 hours: Marketing campaign, analytics
- Ongoing: Video content, feature planning

---

## ⚠️ MCP TOOL REQUIREMENTS

**All Tasks Include**:
- ✅ Specific MCP tools where applicable
- ✅ grep for file searching
- ✅ Context7 for React patterns
- ✅ Shopify MCP for API validation
- ✅ Supabase MCP for database work
- ✅ Fly MCP for deployment monitoring

**Forbidden**:
- ❌ Manual file searching (use grep)
- ❌ Direct CLI usage (use MCPs)

---

**Manager**: All agents check this file for detailed task assignments  
**Goal**: Support Engineer's deployment, prepare for CEO visibility  
**Success**: Comprehensive support for Shopify app launch

🚀 DEPLOY TO DEV STORE NOW!

