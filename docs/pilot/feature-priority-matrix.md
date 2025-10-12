# Feature Priority Matrix: HotDash for Hot Rod Shops

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Product Agent  
**Purpose**: Prioritize future features by impact × effort, aligned with Hot Rodan growth goals

---

## Executive Summary

This matrix prioritizes **50+ potential features** for HotDash using the **RICE framework** (Reach × Impact × Confidence / Effort), ensuring development resources focus on highest-value work.

**Prioritization Principle**: **Operator value per development hour**

**Timeline**: Features mapped to 18-month roadmap (Oct 2025 - Mar 2027)

---

## RICE Scoring Framework

### Formula

**RICE Score** = (Reach × Impact × Confidence) / Effort

---

### Scoring Definitions

#### Reach: How many operators/customers affected?

| Score | Definition | Example |
|-------|------------|---------|
| **10** | All customers + all operators | Core dashboard functionality |
| **8** | All customers, subset of operators | CEO-specific features |
| **5** | Growing subset of customers | Team collaboration features (for $1.5MM+ shops) |
| **3** | Niche segment | Hot rod-specific features (custom part tracking) |
| **1** | Very few customers | Edge case features |

---

#### Impact: How much does it improve experience?

| Score | Definition | Example |
|-------|------------|---------|
| **3** | Game-changer (10x improvement) | AI approval queue (6 hrs → 30 min) |
| **2** | Big improvement (2-5x improvement) | Sales trend visualization (20 min → 5 min) |
| **1** | Nice-to-have (20-50% improvement) | Dark mode, keyboard shortcuts |
| **0.5** | Cosmetic (minimal impact) | Color scheme tweaks |

---

#### Confidence: How sure are we this will work?

| Score | Definition | Validation |
|-------|------------|------------|
| **100%** | Proven (customer explicitly requested) | Hot Rodan CEO: "I need this" |
| **80%** | High confidence (observed in pilot) | We saw operators struggle with X |
| **50%** | Medium confidence (hypothesis) | Industry research suggests X |
| **30%** | Low confidence (speculative) | Might be useful someday |

---

#### Effort: How long to build (engineering time)?

| Score | Definition | Timeline |
|-------|------------|----------|
| **1** | Quick win (1-3 days) | Minor UI tweaks, CSV export |
| **2** | Medium (1 week) | New dashboard tile, basic integration |
| **3** | Large (2-3 weeks) | Complex feature (multi-step workflow) |
| **5** | Massive (1-2 months) | Major new product area |
| **8** | Epic (2-4 months) | Platform-level changes |

---

## Feature Categories

### Category 1: Core Dashboard Features

Features that enhance the primary operator dashboard experience.

---

### Category 2: AI & Automation

Features that use AI to automate operator workflows.

---

### Category 3: Vertical-Specific (Hot Rod Shops)

Features unique to hot rod and automotive specialty businesses.

---

### Category 4: Team Collaboration

Features that enable multi-operator coordination.

---

### Category 5: Analytics & Insights

Features that provide business intelligence and predictions.

---

### Category 6: Integrations

Features that connect HotDash to third-party tools.

---

## Feature Priority Matrix (Top 50 Features)

### Priority Tier 1: Ship in Next 3 Months (RICE >15)

| Rank | Feature | Category | Reach | Impact | Conf% | Effort | RICE | Timeline |
|------|---------|----------|-------|--------|-------|--------|------|----------|
| **1** | Export to CSV (Sales Overview) | Core | 10 | 2 | 100% | 1 | **20.0** | Week 1 |
| **2** | Approval Queue Sorting (Urgent First) | Core | 10 | 2 | 100% | 1.5 | **13.3** | Week 2 |
| **3** | Keyboard Shortcuts (Approval Queue) | Core | 8 | 1 | 100% | 1 | **8.0** | Week 2 |
| **4** | Low Stock Alerts (Push Notifications) | Core | 10 | 2 | 80% | 2 | **8.0** | Week 3 |
| **5** | Weekly Business Review Tile | Analytics | 8 | 3 | 80% | 3 | **6.4** | Week 4 |
| **6** | Batch Order Approval | Core | 8 | 2 | 100% | 2 | **8.0** | Week 5 |
| **7** | Sales Trend Forecasting | Analytics | 8 | 2 | 80% | 2 | **6.4** | Week 6 |
| **8** | Custom Part Tracker | Vertical | 5 | 3 | 80% | 3 | **4.0** | Week 7 |
| **9** | Sentiment-Aware Support Responses | AI | 8 | 2 | 80% | 3 | **4.3** | Week 8 |
| **10** | Mobile Dashboard (iOS/Android) | Core | 10 | 2 | 100% | 5 | **4.0** | Month 3 |

**Total for Tier 1**: 10 features, ~10 weeks of engineering

---

### Priority Tier 2: Ship in Months 4-6 (RICE 8-15)

| Rank | Feature | Category | Reach | Impact | Conf% | Effort | RICE | Timeline |
|------|---------|----------|-------|--------|-------|--------|------|----------|
| **11** | Project Timeline Tracker | Vertical | 5 | 3 | 80% | 3 | **4.0** | Month 4 |
| **12** | Customer Build Profiles | Vertical | 5 | 2 | 80% | 2 | **4.0** | Month 4 |
| **13** | Seasonal Demand Insights | Analytics | 5 | 2 | 80% | 2 | **4.0** | Month 4 |
| **14** | Team Performance Dashboard | Team | 5 | 2 | 80% | 2 | **4.0** | Month 5 |
| **15** | Inventory Reorder Automation | Core | 8 | 2 | 80% | 3 | **4.3** | Month 5 |
| **16** | Multi-Location Support | Team | 3 | 3 | 80% | 5 | **1.4** | Month 5 |
| **17** | Advanced Analytics (Cohort Analysis) | Analytics | 5 | 2 | 80% | 3 | **2.7** | Month 6 |
| **18** | Predictive Escalation | AI | 8 | 2 | 50% | 3 | **2.7** | Month 6 |
| **19** | QuickBooks Integration | Integration | 5 | 2 | 80% | 3 | **2.7** | Month 6 |
| **20** | Voice Notes (CEO Logs) | Core | 5 | 1 | 80% | 2 | **2.0** | Month 6 |

**Total for Tier 2**: 10 features, ~6 weeks of engineering

---

### Priority Tier 3: Ship in Months 7-12 (RICE 4-8)

| Rank | Feature | Category | Reach | Impact | Conf% | Effort | RICE | Timeline |
|------|---------|----------|-------|--------|-------|--------|------|----------|
| **21** | A/B Testing for AI Responses | AI | 5 | 2 | 80% | 3 | **2.7** | Month 7 |
| **22** | Custom Dashboard Layouts | Core | 5 | 1 | 80% | 3 | **1.3** | Month 7 |
| **23** | Enthusiast Customer Segmentation | Vertical | 3 | 2 | 80% | 2 | **2.4** | Month 8 |
| **24** | Car Show Calendar Integration | Vertical | 3 | 1 | 80% | 2 | **1.2** | Month 8 |
| **25** | Automated Social Media Posts | Marketing | 5 | 2 | 50% | 3 | **1.7** | Month 9 |
| **26** | Email Marketing Campaigns | Marketing | 5 | 2 | 80% | 3 | **2.7** | Month 9 |
| **27** | Vendor Management Dashboard | Core | 5 | 2 | 80% | 3 | **2.7** | Month 10 |
| **28** | Customer Loyalty Program | Marketing | 5 | 2 | 50% | 3 | **1.7** | Month 10 |
| **29** | Profit Margin Tracking | Analytics | 8 | 2 | 80% | 2 | **6.4** | Month 11 |
| **30** | Supplier Performance Metrics | Analytics | 5 | 2 | 80% | 2 | **4.0** | Month 11 |

**Total for Tier 3**: 10 features, ~6 weeks of engineering

---

### Priority Tier 4: Ship in Months 13-18 (RICE <4)

| Rank | Feature | Category | Reach | Impact | Conf% | Effort | RICE | Timeline |
|------|---------|----------|-------|--------|-------|--------|------|----------|
| **31** | Multi-Language Support | Core | 3 | 2 | 80% | 5 | **0.96** | Month 13 |
| **32** | Voice Assistant (Alexa/Google) | Core | 3 | 1 | 50% | 5 | **0.30** | Month 14 |
| **33** | AR Product Visualization | Vertical | 1 | 3 | 30% | 8 | **0.11** | Month 15 |
| **34** | VR Workshop Tour | Marketing | 1 | 1 | 30% | 8 | **0.04** | Month 16 |
| **35** | Blockchain Parts Authentication | Vertical | 1 | 1 | 30% | 8 | **0.04** | Month 17 |

**Total for Tier 4**: 5 features, ~8 weeks of engineering (low priority)

---

## Detailed Feature Specs (Top 10)

### Feature #1: Export to CSV (Sales Overview)

**RICE Score**: 20.0 (Highest Priority)  
**Category**: Core Dashboard  
**Timeline**: Week 1 (Nov 2025)

**Problem**: Hot Rodan CEO needs to share sales data with accountant/partners weekly, currently manually copies from Shopify.

**Solution**: Add "Export to CSV" button to Sales Overview tile → downloads sales data for selected date range.

**User Story**: "As a CEO, I want to export sales data to CSV so I can share it with my accountant in their preferred format."

**Acceptance Criteria**:
- [ ] "Export to CSV" button visible on Sales Overview tile
- [ ] Clicking button downloads CSV file (filename: `hotdash-sales-YYYY-MM-DD.csv`)
- [ ] CSV includes: Date, Product, Quantity, Revenue, Profit Margin
- [ ] Date range filter applies to export (default: last 30 days)
- [ ] Export completes in <5 seconds

**Metrics to Track**:
- Export usage: How many times per week?
- Time saved: 10 minutes per export (vs manual Shopify data pull)

---

### Feature #2: Approval Queue Sorting (Urgent First)

**RICE Score**: 13.3  
**Category**: Core Dashboard  
**Timeline**: Week 2 (Nov 2025)

**Problem**: Support lead wants to see urgent customer tickets first (angry customers, high-value orders) instead of oldest-first sorting.

**Solution**: Add sorting options to approval queue: Urgent → High → Medium → Low (based on sentiment analysis + order value).

**User Story**: "As a support operator, I want to prioritize urgent tickets so I can prevent customer churn from angry customers."

**Acceptance Criteria**:
- [ ] Dropdown menu: Sort by Urgent / Order Value / Oldest First / Newest First
- [ ] Default: Urgent first
- [ ] Urgent detected by: Sentiment analysis (angry/frustrated) OR Order value >$1,000
- [ ] Visual indicator: Red flag for urgent tickets
- [ ] Sorting persists across sessions (saved in user preferences)

**Metrics to Track**:
- % of urgent tickets resolved within 1 hour
- Reduction in escalations (target: -20%)
- Operator satisfaction with sorting (survey)

---

### Feature #3: Keyboard Shortcuts (Approval Queue)

**RICE Score**: 8.0  
**Category**: Core Dashboard  
**Timeline**: Week 2 (Nov 2025)

**Problem**: Ops manager clicks "Approve" button 50+ times/day, would save time with keyboard shortcut.

**Solution**: Add keyboard shortcuts for common approval queue actions.

**User Story**: "As an operator, I want to approve tickets with a keyboard shortcut so I can process approvals faster."

**Keyboard Shortcuts**:
- `A` → Approve
- `E` → Edit & Approve
- `X` → Escalate
- `R` → Reject
- `→` → Next ticket
- `←` → Previous ticket
- `/` → Search tickets

**Acceptance Criteria**:
- [ ] Keyboard shortcuts work when approval queue is focused
- [ ] "?" key opens shortcut help menu
- [ ] Shortcuts work on Mac and Windows
- [ ] Visual indicator when shortcut used (brief highlight)
- [ ] Option to disable shortcuts in settings

**Metrics to Track**:
- Keyboard shortcut usage rate (target: >50% of operators use them)
- Time to approve (before/after shortcuts)
- Operator satisfaction (survey: "Do shortcuts make you faster?")

---

### Feature #4: Low Stock Alerts (Push Notifications)

**RICE Score**: 8.0  
**Category**: Core Dashboard  
**Timeline**: Week 3 (Dec 2025)

**Problem**: Hot Rodan CEO doesn't always check dashboard daily → misses low stock alerts → stockouts → lost sales.

**Solution**: Push notifications (email + SMS) when inventory falls below reorder point.

**User Story**: "As a CEO, I want to receive alerts when inventory is low so I can reorder before running out of stock."

**Alert Triggers**:
- **Critical**: Stock < 5 units (immediate SMS + email)
- **Warning**: Stock < 10 units (email only)
- **Info**: Projected stockout in 7 days (weekly email digest)

**Acceptance Criteria**:
- [ ] CEO can configure alert thresholds per product
- [ ] SMS alerts sent via Twilio (<30 second delivery)
- [ ] Email alerts include: Product name, current stock, reorder link
- [ ] Option to snooze alerts for 24 hours
- [ ] Alert history log (view past alerts)

**Metrics to Track**:
- Stockout prevention rate (target: 90% of low-stock alerts result in reorder)
- Time to reorder (alert → purchase order)
- Revenue saved (estimated lost sales prevented)

---

### Feature #5: Weekly Business Review Tile

**RICE Score**: 6.4  
**Category**: Analytics  
**Timeline**: Week 4 (Dec 2025)

**Problem**: Hot Rodan CEO spends 1 hour weekly pulling data for team meeting → wants auto-generated insights.

**Solution**: New dashboard tile: "Weekly Business Review" with auto-generated insights and trends.

**User Story**: "As a CEO, I want a weekly summary of business performance so I can quickly brief my team on Monday mornings."

**Insights Included**:
- **Top 3 Wins**: "Chrome Headers sales +150% this week"
- **Top 3 Concerns**: "Brake Kits inventory low, reorder by Friday"
- **Top 3 Actions**: "Increase ad spend on Chrome Headers, negotiate better Brake Kit pricing"
- **Revenue Trend**: Week-over-week growth (+15%)
- **Best-Selling Products**: Top 5 products with revenue
- **Customer Insights**: New vs returning customer ratio

**Acceptance Criteria**:
- [ ] Tile displays every Monday at 8:00 AM
- [ ] Insights generated using GPT-4 (analyzing Shopify data)
- [ ] CEO can download PDF summary (for team meeting)
- [ ] CEO can edit insights before sharing with team
- [ ] Archive of past weekly reviews (for trend analysis)

**Metrics to Track**:
- Usage rate (% of weeks CEO views tile)
- Time saved (1 hour/week → 5 minutes/week)
- CEO satisfaction (survey: "Is this useful for team meetings?")

---

### Feature #6: Batch Order Approval

**RICE Score**: 8.0  
**Category**: Core Dashboard  
**Timeline**: Week 5 (Dec 2025)

**Problem**: Ops manager approves 20-30 orders/day individually → time-consuming.

**Solution**: "Approve All" button for bulk order approval (with safety checks).

**User Story**: "As an ops manager, I want to approve multiple orders at once so I can process morning orders in 2 minutes instead of 10 minutes."

**Acceptance Criteria**:
- [ ] "Select All" checkbox in order approval list
- [ ] "Approve Selected" button (appears when ≥2 orders selected)
- [ ] Safety check: Confirm dialog if total value >$5,000
- [ ] Visual feedback: Progress bar during batch approval
- [ ] Rollback: Undo batch approval within 5 minutes

**Metrics to Track**:
- Batch approval usage rate (% of orders approved in batches)
- Time saved (before: 30 min/day, after: 5 min/day)
- Error rate (accidental approvals that needed reversal)

---

### Feature #7: Sales Trend Forecasting

**RICE Score**: 6.4  
**Category**: Analytics  
**Timeline**: Week 6 (Jan 2026)

**Problem**: Hot Rodan CEO plans inventory based on gut feeling → sometimes over-orders or under-orders.

**Solution**: Predictive sales forecasting using historical data + seasonality.

**User Story**: "As a CEO, I want to see predicted sales for next 30 days so I can optimize inventory purchases."

**Forecast Inputs**:
- Historical sales (last 12 months)
- Seasonality (spring is busy season for hot rod shops)
- Marketing campaigns (planned ad spend)
- External factors (car show calendar, holidays)

**Acceptance Criteria**:
- [ ] "Sales Forecast" chart shows predicted revenue (30-day, 90-day)
- [ ] Confidence bands (best case, expected, worst case)
- [ ] Breakdown by product category
- [ ] Alert if forecast shows stockout risk
- [ ] Actual vs forecast tracking (measure accuracy weekly)

**Metrics to Track**:
- Forecast accuracy (% deviation from actual sales)
- Inventory optimization (reduction in overstock/understock)
- CEO confidence in forecasting (survey)

---

### Feature #8: Custom Part Tracker

**RICE Score**: 4.0  
**Category**: Vertical-Specific (Hot Rod)  
**Timeline**: Week 7 (Jan 2026)

**Problem**: Hot Rodan handles custom one-off orders (unique car builds) → hard to track in standard Shopify.

**Solution**: Dedicated "Custom Parts" tracker with project-based workflow.

**User Story**: "As a hot rod shop owner, I want to track custom part orders separately so I don't lose track of unique customer builds."

**Features**:
- **Project-Based Tracking**: Group custom parts by customer car build
- **Status Updates**: Design → Fabrication → Testing → Delivery
- **Photo Gallery**: Upload progress photos
- **Customer Collaboration**: Share progress with customer via link
- **Timeline Tracking**: Estimated vs actual completion dates

**Acceptance Criteria**:
- [ ] "Custom Parts" tab in dashboard
- [ ] Create new project: Customer name, car specs, parts list
- [ ] Status workflow: Design → Fab → Test → Deliver
- [ ] Upload photos (up to 20 per project)
- [ ] Customer portal: View-only link for customer
- [ ] Timeline tracking: Planned vs actual dates

**Metrics to Track**:
- Custom project usage (how many custom projects per month?)
- On-time delivery rate (planned vs actual)
- Customer satisfaction with custom part process

---

### Feature #9: Sentiment-Aware Support Responses

**RICE Score**: 4.3  
**Category**: AI & Automation  
**Timeline**: Week 8 (Jan 2026)

**Problem**: AI drafts same tone for all customers → sometimes too casual for angry customers, too formal for friendly customers.

**Solution**: AI adjusts response tone based on customer sentiment analysis.

**User Story**: "As a support operator, I want AI to match the customer's emotional tone so responses feel more human."

**Sentiment Detection**:
- **Angry/Frustrated** → Empathetic, apologetic tone
- **Confused** → Patient, explanatory tone
- **Happy** → Friendly, enthusiastic tone
- **Neutral** → Professional, straightforward tone

**Acceptance Criteria**:
- [ ] Sentiment analysis runs on incoming customer message
- [ ] AI draft response matches detected sentiment
- [ ] Sentiment displayed in approval queue (emoji indicator)
- [ ] Operator can override sentiment if incorrect
- [ ] Track sentiment accuracy (operator feedback)

**Metrics to Track**:
- Sentiment detection accuracy (% correct)
- Customer satisfaction by sentiment (do angry customers respond better?)
- Operator satisfaction with tone matching

---

### Feature #10: Mobile Dashboard (iOS/Android)

**RICE Score**: 4.0  
**Category**: Core Dashboard  
**Timeline**: Month 3 (Jan 2026)

**Problem**: Hot Rodan CEO wants to check dashboard while at car shows or on vacation → currently desktop-only.

**Solution**: Native mobile app (iOS + Android) with core dashboard features.

**User Story**: "As a CEO who travels to car shows, I want to check sales and approve orders from my phone so I can stay on top of business while on the road."

**Mobile Features (MVP)**:
- View Sales Overview tile (today's revenue, week-over-week)
- View Inventory Alerts (low stock notifications)
- Approve orders (basic approval, not full editing)
- View support queue (approve AI drafts)
- Push notifications (low stock, urgent tickets)

**Acceptance Criteria**:
- [ ] iOS app (App Store)
- [ ] Android app (Google Play)
- [ ] Biometric login (Face ID, fingerprint)
- [ ] Offline mode (view cached data)
- [ ] Sync with web dashboard (<30 second lag)
- [ ] Push notifications enabled

**Metrics to Track**:
- Mobile adoption rate (% of operators using mobile)
- Mobile vs web usage (which features used more on mobile?)
- CEO satisfaction with mobile (survey)

---

## Feature Trade-off Analysis

### When to Ship vs Defer

**Ship Immediately If** (RICE >15):
- ✅ Operator explicitly requested (confidence 100%)
- ✅ Quick win (effort ≤1.5)
- ✅ High reach (all operators/customers)
- ✅ Measurable time savings

**Ship Soon If** (RICE 8-15):
- ⚠️ Strongly requested but not urgent
- ⚠️ Medium effort (1-2 weeks)
- ⚠️ Significant impact on subset of operators

**Defer If** (RICE <8):
- ❌ Speculative (low confidence)
- ❌ High effort (>3 weeks)
- ❌ Low reach (niche use case)
- ❌ Cosmetic (minimal impact)

---

### Quick Wins vs Strategic Bets

**Quick Wins (Effort ≤1, RICE >5)**:
- Export to CSV
- Keyboard shortcuts
- Dark mode
- Notification preferences

**Strategy**: Ship 1-2 quick wins every week to maintain momentum.

---

**Strategic Bets (Effort ≥3, RICE >4)**:
- Weekly Business Review tile
- Custom Part Tracker
- Mobile app
- Predictive analytics

**Strategy**: 1 strategic bet per month, validate with pilot before full rollout.

---

## Roadmap Alignment

### Q4 2025 (Oct-Dec): Pilot Success

**Focus**: Features that make Hot Rodan pilot successful

**Priority Features** (Top 10):
1. Export to CSV
2. Approval Queue Sorting
3. Keyboard Shortcuts
4. Low Stock Alerts
5. Weekly Business Review Tile
6. Batch Order Approval
7. Sales Trend Forecasting
8. Custom Part Tracker
9. Sentiment-Aware Support
10. Mobile Dashboard

**Goal**: Hot Rodan CEO rates dashboard 8/10+, provides testimonial

---

### Q1 2026 (Jan-Mar): Scale to 3-5 Customers

**Focus**: Features that work for multiple hot rod shops (not just Hot Rodan)

**Priority Features**:
- Project Timeline Tracker
- Customer Build Profiles
- Seasonal Demand Insights
- Team Performance Dashboard
- Inventory Reorder Automation

**Goal**: 3-5 paying customers, validated product-market fit

---

### Q2-Q3 2026 (Apr-Sep): Vertical Dominance

**Focus**: Hot rod-specific features that create competitive moat

**Priority Features**:
- Multi-location support
- QuickBooks integration
- Enthusiast customer segmentation
- Car show calendar integration
- Vendor management dashboard

**Goal**: 10-20 hot rod shops, recognized as "the dashboard for hot rod shops"

---

### Q4 2026 (Oct-Dec): Adjacent Verticals

**Focus**: Expand to motorcycle shops, RV shops, classic car shops

**Priority Features**:
- Multi-vertical templates
- Custom branding
- White-label option
- API access

**Goal**: 50-100 customers across automotive specialty shops

---

## Feature Request Process

### How to Evaluate New Feature Requests

**Step 1: Capture Request**
- Who requested? (customer name, role)
- What problem does it solve? (verbatim quote)
- How often do they encounter this problem? (daily, weekly, monthly)
- What's their workaround today? (manual process, competitor tool)

**Step 2: Calculate RICE Score**
- Reach: How many customers/operators affected?
- Impact: How much does it improve experience?
- Confidence: How sure are we this is valuable?
- Effort: How long to build? (engineering estimate)

**Step 3: Compare to Roadmap**
- Does it fit current phase focus? (pilot success, scaling, vertical)
- Is there a higher-priority feature? (RICE score comparison)
- Can we defer to next quarter? (nice-to-have vs critical)

**Step 4: Communicate Decision**
- If YES: "We're building this in [month], here's why"
- If NOT NOW: "Great idea, we'll revisit in [quarter] because [reason]"
- If NO: "This doesn't align with our vertical focus, but here's an alternative"

---

## Metrics to Track Feature Success

### Post-Launch Metrics (Week 1-4)

**Adoption**:
- % of operators who use new feature
- Usage frequency (daily, weekly, monthly)
- Time to first use (how long after launch?)

**Impact**:
- Time saved (before/after feature)
- Error reduction (if applicable)
- Operator satisfaction (survey: "Does this feature solve your problem?")

**Issues**:
- Bug reports (count + severity)
- Support tickets about feature
- Feature requests for improvements

---

### Long-Term Metrics (Month 2-6)

**Retention**:
- % of operators still using feature after 30 days
- Frequency trends (usage increasing or decreasing?)

**Business Impact**:
- Revenue impact (did feature drive sales growth?)
- Cost savings (reduced manual labor hours)
- Customer acquisition (did feature help close deals?)

---

## Quick Reference: Feature Evaluation Checklist

**Before Building Any Feature, Ask**:
- [ ] Did an operator explicitly request this?
- [ ] Can we ship it in ≤2 weeks?
- [ ] Does it save operators ≥1 hour/week?
- [ ] Will ≥50% of operators use it?
- [ ] Does it align with current phase focus?
- [ ] Is RICE score >8?

**If 4+ YES**: Ship it  
**If 2-3 YES**: Defer to next quarter  
**If <2 YES**: Reject and explain why

---

**Document Owner**: Product Agent  
**Last Updated**: October 12, 2025  
**Next Review**: Post-Pilot (Nov 12, 2025)  
**Status**: Active - Priorities Validated During Pilot

---

**End of Feature Priority Matrix**

