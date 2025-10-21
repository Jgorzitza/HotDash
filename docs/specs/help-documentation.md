# Help Documentation & Tooltips

**File:** `docs/specs/help-documentation.md`  
**Owner:** Content Agent  
**Version:** 1.0  
**Date:** 2025-10-21  
**Status:** Ready for Implementation  
**Purpose:** User help docs, tooltips for complex metrics, FAQ section

---

## Purpose

Comprehensive help documentation for all HotDash features with inline tooltips for complex metrics. Provides operators with quick answers and contextual help without leaving their workflow.

---

## Help Topics Overview

**6 Main Topics:**
1. Dashboard & Tiles
2. Approvals Queue
3. Notifications & Alerts
4. Analytics & Reports
5. Inventory Management
6. Settings & Integrations

---

## 1. Dashboard & Tiles

### 1.1 Overview

**Title:**
```
Dashboard Overview
```

**Content:**
```
Your HotDash dashboard displays live operational metrics in tiles. Each tile shows real-time data from your integrated services (Shopify, Chatwoot, Google Analytics).

What You Can Do:
• Click any tile to see detailed information
• Drag tiles to reorder them
• Hide tiles you don't need in Settings
• Set auto-refresh intervals

Tiles update automatically based on your refresh settings (default: every 30 seconds).
```

**Related Topics:**
- Customizing Your Dashboard
- Understanding Tile Status Indicators
- Auto-Refresh Settings

### 1.2 Tile Types Explained

**Ops Pulse:**
```
Shows overall operational health across sales, fulfillment, and customer service. Click for detailed breakdown.
```

**Sales Pulse:**
```
Displays today's revenue, order count, and avg order value. Click to see top SKUs and fulfillment issues.
```

**Fulfillment Health:**
```
Monitors order fulfillment status and potential delays. Click to see pending orders and bottlenecks.
```

**Inventory Heatmap:**
```
Shows stock status across all SKUs: in stock (green), low stock (yellow), out of stock (red), urgent reorder (red with alert).
```

**CX Escalations:**
```
Lists customer conversations needing attention, sorted by SLA urgency. Click to review and respond.
```

**Approvals Queue:**
```
AI-suggested actions waiting for your approval: customer replies, inventory orders, social posts.
```

**SEO & Content Watch:**
```
Monitors organic traffic, keyword rankings, and content performance. Click for detailed SEO metrics.
```

**Idea Pool:**
```
Product suggestions from AI based on market trends, customer demand, and inventory analysis.
```

---

## 2. Approvals Queue

### 2.1 How Approvals Work

**Title:**
```
Understanding Approvals
```

**Content:**
```
HotDash AI agents suggest actions (like sending customer emails or creating social posts), but YOU always have final approval.

The Approvals Workflow:
1. AI analyzes data and suggests an action
2. Action appears in Approvals Queue with risk level
3. You review the suggestion, evidence, and projected impact
4. You approve as-is, edit before approving, or reject
5. If approved, the action is executed automatically
6. You grade the AI's suggestion to improve future recommendations

This ensures human oversight on all customer-facing and business-critical actions.
```

**Related Topics:**
- Risk Levels Explained
- How Grading Works
- Editing AI Suggestions

### 2.2 Risk Levels

**HIGH Risk (Red Badge):**
```
Customer-facing communication or financial transactions. Requires careful review.

Examples:
• Replying to customer complaints
• Issuing refunds
• Changing product prices
```

**MEDIUM Risk (Yellow Badge):**
```
Internal operations or draft content. Lower impact if incorrect.

Examples:
• Creating social media draft
• Reordering inventory
• Updating internal notes
```

**LOW Risk (Green Badge):**
```
Read-only analysis or recommendations. No direct action taken.

Examples:
• Analytics insights
• SEO recommendations
• Content performance reports
```

### 2.3 Grading AI Suggestions

**Why Grade?:**
```
When you approve an AI suggestion, you can grade it on three factors (1-5 scale):

Tone (1-5): Was the language appropriate and on-brand?
Accuracy (1-5): Were the facts and recommendations correct?
Policy (1-5): Did it follow Hot Rodan policies and guidelines?

Your grades help the AI learn your preferences and improve future suggestions.
```

**Grading Tips:**
```
• Grade honestly — AI learns from your feedback
• 3 = acceptable, no changes needed
• 5 = perfect, use as template
• 1 = needs major improvement
• If you edit heavily, grade lower (AI should learn)
```

---

## 3. Notifications & Alerts

### 3.1 Notification Types

**Title:**
```
Notification Types
```

**Content:**
```
HotDash sends notifications for time-sensitive events:

New Approvals: AI suggested action needs your review
SLA Breaches: Customer conversation exceeded response time target
Queue Backlog: 10+ pending approvals or actions
Performance Alerts: Metrics outside normal range (ROAS, traffic, etc.)
System Updates: Integration status changes or service issues

Control which notifications you receive in Settings → Notifications.
```

### 3.2 Notification Channels

**Desktop (Browser):**
```
Pop-up notifications even when HotDash isn't the active tab. Enable in Settings. Requires browser permission.
```

**In-App (Toast):**
```
Brief messages that appear in HotDash after actions complete. Always enabled.
```

**In-App (Banner):**
```
Persistent alerts at top of dashboard for important ongoing issues. Dismiss to hide.
```

**Email:**
```
Email notifications for critical alerts and weekly reports. Configure frequency in Settings.
```

### 3.3 Managing Notification Overload

**Tips:**
```
Too many notifications? Try these:

1. Disable non-critical types (Settings → Notifications)
2. Set Quiet Hours (10pm-7am by default)
3. Reduce frequency (Real-time → Hourly)
4. Use email digests instead of real-time
5. Focus on HIGH risk approvals only
```

---

## 4. Analytics & Reports

### 4.1 Understanding Analytics

**Title:**
```
Analytics Dashboard Guide
```

**Content:**
```
HotDash tracks performance across 4 key areas:

Social Performance: Engagement, reach, top posts across platforms
Ad Performance: ROAS, CPA, conversion rates for Google/Facebook Ads
SEO Performance: Organic traffic, keyword rankings, top landing pages
Content Performance: Page views, engagement, top-performing content

Each analytics tile shows a summary with mini chart. Click for detailed modal with 30-90 day trends.
```

### 4.2 Key Metrics Glossary

**ROAS (Return on Ad Spend):**
```
Revenue generated per dollar spent on ads.

Formula: Revenue ÷ Ad Spend
Example: $5 revenue per $1 spent = 5:1 ROAS
Target: 3:1 minimum for profitability

If ROAS < 3:1, you're spending more than you're making from ads. Review targeting, copy, or landing pages.
```

**CTR (Click-Through Rate):**
```
Percentage of people who clicked after seeing your content.

Formula: (Clicks ÷ Impressions) × 100
Benchmarks:
• Google Search Ads: 2-5%
• Display Ads: 0.5-1.5%
• Organic Search: 3-10%

Higher CTR = more engaging headlines and descriptions.
```

**CPA (Cost Per Acquisition):**
```
Average cost to acquire one customer.

Formula: Total Ad Spend ÷ Conversions
Example: $2,000 spent, 40 customers = $50 CPA

Target CPA depends on customer lifetime value (LTV). Profitable if CPA < 50% of LTV.
```

**Bounce Rate:**
```
Percentage of visitors who leave after viewing only one page.

Target: < 50% for most pages
High bounce rate (> 70%) may indicate:
• Slow page load times
• Poor content quality
• Misleading title/meta description
• Mobile unfriendly design
```

**Organic Sessions:**
```
Visitors who found your site through search engines (Google, Bing) without clicking ads.

These are "free" visits from SEO efforts. Track this to measure content and SEO effectiveness.
```

**Conversion Rate:**
```
Percentage of visitors who completed a desired action (purchase, signup, etc.).

Formula: (Conversions ÷ Total Visitors) × 100
E-commerce benchmark: 2-5%

Improving conversion rate increases revenue without increasing traffic.
```

---

## 5. Inventory Management

### 5.1 Inventory Overview

**Title:**
```
Managing Inventory in HotDash
```

**Content:**
```
HotDash monitors your Shopify inventory in real-time and alerts you to reorder opportunities.

Stock Status Categories:
• In Stock (Green): Above safety threshold
• Low Stock (Yellow): Below ideal levels, reorder soon
• Out of Stock (Red): Zero units available
• Urgent Reorder (Red + Alert): Below reorder point, stockout imminent

Click any inventory alert to see demand velocity analysis and create a draft purchase order.
```

### 5.2 Key Inventory Metrics

**ROP (Reorder Point):**
```
The inventory level that triggers a reorder alert.

Formula: (Avg Daily Sales × Lead Time) + Safety Stock
Example: (5 units/day × 7 days) + 10 safety = 45 units ROP

When stock drops below ROP, you'll get an alert to reorder.
```

**WOS (Weeks of Supply):**
```
How many weeks your current stock will last at current sales velocity.

Formula: Current Stock ÷ Avg Weekly Sales
Example: 100 units ÷ 20 units/week = 5 WOS

Target: 4-8 WOS for most products.
```

**Safety Stock:**
```
Extra inventory buffer to prevent stockouts from unexpected demand spikes or supply delays.

Recommended: 1-2 weeks of average sales
High-demand products: 2-4 weeks
```

**Days of Cover:**
```
How many days until stockout at current sales velocity.

Formula: Current Stock ÷ Avg Daily Sales
Example: 30 units ÷ 3 units/day = 10 days of cover

If < 7 days, consider reordering soon.
```

**Demand Velocity:**
```
How fast a product is selling over a period (usually 14 days).

Visualized as trend chart showing daily sales pattern. Helps identify:
• Seasonal demand changes
• Trending products
• Slow movers
```

### 5.3 Creating Purchase Orders

**Process:**
```
1. Click inventory alert tile or notification
2. Review demand velocity chart (14-day trend)
3. Adjust recommended reorder quantity if needed
4. Select vendor from dropdown
5. Add notes for audit trail
6. Click "Create Draft PO"
7. Draft PO email generated (CSV attachment)
8. Review and send to vendor

HotDash doesn't send POs automatically — you always review first.
```

---

## 6. Settings & Integrations

### 6.1 Connecting Services

**Title:**
```
Connecting Integrations
```

**Content:**
```
HotDash requires connections to your operational tools:

Required (Core Features):
• Shopify: Product, order, customer data
• Google Analytics: Traffic and SEO metrics

Optional (Enhanced Features):
• Chatwoot: Customer support conversations
• Google Ads: Ad campaign performance
• Facebook Ads: Social ad metrics
• Publer: Social media post scheduling

To connect a service:
1. Go to Settings → Integrations tab
2. Click "Connect [Service Name]"
3. Log in and authorize HotDash
4. Verify connection with "Test Connection" button

All credentials are stored securely. HotDash never stores your passwords.
```

### 6.2 Testing Connections

**Why Test?:**
```
Integration health affects data accuracy. Test connections weekly or when data looks incorrect.

Test Results:
• ✓ Connected: All systems operational
• ⚠ Degraded: Partial functionality, some features unavailable
• ✗ Connection Error: No data, reconfigure required

If test fails, try reconnecting or check service status page.
```

### 6.3 Notification Preferences

**Desktop Notifications:**
```
Enable browser notifications to get alerts even when HotDash isn't open.

Requires: Browser permission (Chrome/Firefox/Safari)
Best For: Critical alerts, time-sensitive approvals
Quiet Hours: Set to avoid notifications during off-hours (default: 10pm-7am)
```

**Sound Alerts:**
```
Play sound when notifications arrive. Useful for high-priority alerts.

Adjust volume or disable in Settings → Notifications → Sound.
```

---

## 7. Tooltips for Complex Metrics

### 7.1 Tooltip Design Pattern

**HTML Structure:**
```html
<span class="metric-with-help">
  {Metric Name}
  <button 
    class="tooltip-trigger"
    aria-label="Learn more about {metric_name}"
    aria-describedby="tooltip-{metric-id}"
  >
    <Icon source={QuestionIcon} />
  </button>
</span>

<div 
  id="tooltip-{metric-id}"
  role="tooltip"
  class="tooltip-content"
>
  <strong>{Metric Name}</strong>
  <p>{Definition}</p>
  <p><em>Example: {concrete_example}</em></p>
</div>
```

### 7.2 Metric Tooltip Content

**ROAS:**
```
ROAS (Return on Ad Spend)

Revenue generated divided by advertising spend.

Example: $500 in sales from $100 in ads = 5:1 ROAS

Target: 3:1 minimum (profitable)
```

**CTR:**
```
CTR (Click-Through Rate)

Percentage of impressions that resulted in clicks.

Example: 50 clicks from 1,000 impressions = 5% CTR

Benchmark: 2-5% for search ads
```

**CPA:**
```
CPA (Cost Per Acquisition)

How much you spend to acquire one customer.

Example: $2,000 ad spend, 40 customers = $50 CPA

Goal: CPA should be less than 50% of customer lifetime value
```

**Bounce Rate:**
```
Bounce Rate

Percentage of visitors who leave after viewing one page.

Example: 40 bounces from 100 visitors = 40% bounce rate

Target: < 50% (lower is better)
```

**Conversion Rate:**
```
Conversion Rate

Percentage of visitors who complete a purchase.

Example: 30 purchases from 1,000 visitors = 3% conversion

E-commerce average: 2-5%
```

**WOS (Weeks of Supply):**
```
WOS (Weeks of Supply)

How many weeks current stock will last.

Example: 200 units ÷ 50 units/week = 4 WOS

Target: 4-8 weeks for most products
```

**ROP (Reorder Point):**
```
ROP (Reorder Point)

Stock level that triggers reorder alert.

Example: (5 units/day × 7 days lead time) + 10 safety stock = 45 units ROP

Reorder when stock hits this number
```

**AOV (Average Order Value):**
```
AOV (Average Order Value)

Average revenue per order.

Example: $10,000 revenue ÷ 100 orders = $100 AOV

Increase AOV with bundles, upsells, free shipping thresholds
```

---

## 8. FAQ Section

### 8.1 Getting Started

**Q: What is HotDash?**
```
A: HotDash is your operations control center for e-commerce. It centralizes sales data, inventory management, customer support, and growth analytics in one Shopify-embedded dashboard. AI agents suggest actions; you approve them.
```

**Q: How do I set up HotDash?**
```
A: First-time setup takes 3 steps:
1. Connect your Shopify store (required)
2. Connect Chatwoot for customer support (optional)
3. Connect Google Analytics for traffic data (optional)

The welcome wizard will guide you through setup. You can add more integrations later in Settings.
```

**Q: Is my data secure?**
```
A: Yes. HotDash uses industry-standard encryption:
• All connections use HTTPS/TLS
• Credentials stored encrypted in Fly.io secrets
• No passwords stored (OAuth tokens only)
• Shopify-embedded security (inherits Shopify's security)
• Regular security audits and penetration testing

We never share your data with third parties.
```

---

### 8.2 Approvals & AI

**Q: Do I have to approve every AI suggestion?**
```
A: Yes. HotDash requires human approval for all actions. This ensures quality control and keeps you in command of your business operations.

You can approve quickly for straightforward suggestions or take time to review complex ones. There are no automatic executions without your explicit approval.
```

**Q: What happens if I reject a suggestion?**
```
A: The suggested action is discarded and logged for learning. The AI adjusts future recommendations based on your rejections. Patterns in rejections help the AI understand your preferences and business policies better.
```

**Q: Can I edit AI suggestions before approving?**
```
A: Absolutely! For customer replies and content, you can edit the AI's draft before approval. Your edits are captured so the AI learns your writing style and preferences. This improves future suggestions.
```

**Q: How does grading work?**
```
A: After approving an action, you grade it on 1-5 scale:
• Tone: Was the language appropriate?
• Accuracy: Were facts and recommendations correct?
• Policy: Did it follow your guidelines?

Higher grades mean the AI should suggest similar content. Lower grades indicate areas for improvement. Grading is optional but helps AI learn faster.
```

---

### 8.3 Inventory

**Q: When should I reorder products?**
```
A: HotDash alerts you when products hit the Reorder Point (ROP). This is calculated based on:
• Average daily sales
• Vendor lead time
• Safety stock buffer

Generally, reorder when stock drops below 2 weeks of cover (adjustable in Settings).
```

**Q: What is demand velocity?**
```
A: Demand velocity shows how fast a product is selling over time (usually 14 days). The velocity chart helps you:
• Identify trending products (velocity increasing)
• Spot slow movers (velocity decreasing)
• Plan seasonal inventory (predictable velocity patterns)

Higher velocity = reorder more frequently, larger quantities.
```

**Q: Can HotDash automatically reorder for me?**
```
A: No. HotDash creates DRAFT purchase orders for your review. You always approve before sending to vendors. This ensures you control spending and can verify quantities, vendors, and pricing before committing.
```

---

### 8.4 Analytics

**Q: Why is my social/ad/SEO data not showing?**
```
A: Analytics tiles require service connections:
• Social: Connect Publer in Settings → Integrations
• Ads: Connect Google Ads and/or Facebook Ads
• SEO: Connect Google Analytics and Search Console

Empty state messages in each tile will guide you to the right settings.
```

**Q: How often does analytics data update?**
```
A: Update frequency depends on the source:
• Shopify data: Real-time (sales, orders, inventory)
• Google Analytics: 24-48 hour delay (Google's processing)
• Ads platforms: Daily (Google/Facebook APIs)
• Social media: Hourly (Publer API)

Refresh manually by clicking the refresh icon on any analytics tile.
```

**Q: What's a good ROAS target?**
```
A: Minimum 3:1 ROAS (making $3 for every $1 spent).

• 3-5:1 ROAS: Profitable, sustainable
• 5-10:1 ROAS: Excellent performance
• < 3:1 ROAS: Review targeting, ad copy, landing pages
• < 1:1 ROAS: Losing money, pause and optimize

Your specific target depends on profit margins and customer lifetime value.
```

---

### 8.5 Customer Support

**Q: How do AI-suggested customer replies work?**
```
A: When a customer message arrives in Chatwoot:
1. AI drafts a reply based on conversation history and Hot Rodan policies
2. Draft appears as a Private Note in Chatwoot
3. HotDash shows it in CX Escalations tile
4. You review, edit if needed, and approve
5. HotDash sends the reply as a public message
6. You grade the AI's suggestion for future improvement

You're always in control. AI speeds up drafting, you ensure quality.
```

**Q: What if the AI suggestion is completely wrong?**
```
A: Reject it and write your own reply. Grade it 1/5 on all factors so the AI learns. If you see repeated issues:
1. Check conversation history (AI may lack context)
2. Review AI training data and policies
3. Report to Content team for policy updates

The AI improves with your feedback.
```

---

### 8.6 Technical

**Q: Which browsers are supported?**
```
A: HotDash works best on:
• Chrome/Edge (recommended)
• Firefox
• Safari (desktop and iOS)

Minimum versions: Released within last 2 years.
Mobile responsive design works on all modern smartphones.
```

**Q: Can I use HotDash on mobile?**
```
A: Yes! HotDash is fully responsive. Key features work on mobile:
• View dashboard tiles
• Review and approve actions
• Respond to customer messages
• Check inventory alerts

Complex analytics and detailed charts are optimized for desktop viewing.
```

**Q: What if an integration stops working?**
```
A: Check Settings → Integrations for connection status. If degraded or disconnected:
1. Click "Test Connection" to diagnose
2. Try "Reconnect" to refresh authentication
3. Check service status page (Shopify, Google, etc.)
4. Contact support if issue persists

HotDash monitors integration health automatically and sends alerts if services degrade.
```

---

### 8.7 Billing & Account

**Q: How much does HotDash cost?**
```
A: HotDash pricing is based on your Shopify plan and feature usage. Check the Shopify App Store listing for current pricing tiers.

All core features (dashboard, approvals, inventory) are included. Premium features (advanced analytics, AI customer support) may have additional costs.
```

**Q: Can I cancel anytime?**
```
A: Yes. Uninstall from Shopify Admin → Apps. Your data is retained for 30 days in case you want to reinstall. After 30 days, all data is permanently deleted per our privacy policy.
```

**Q: Can multiple team members use HotDash?**
```
A: Yes. HotDash uses Shopify's built-in staff account system. Any staff member with Shopify admin access can use HotDash. Permissions follow Shopify's role-based access control.
```

---

## 9. Troubleshooting Guide

### 9.1 Common Issues

**Dashboard Not Loading:**
```
Problem: Dashboard shows loading indefinitely

Solutions:
1. Refresh the page (Ctrl+R or Cmd+R)
2. Clear browser cache and cookies
3. Check internet connection
4. Try different browser
5. Check Shopify status page (status.shopify.com)

If issue persists: Contact support with browser console errors.
```

**Tiles Showing Old Data:**
```
Problem: Metrics not updating

Solutions:
1. Click refresh icon on tile
2. Check auto-refresh settings (Settings → Dashboard)
3. Verify integration connection (Settings → Integrations)
4. Check if data source is experiencing delays (Google Analytics often has 24-48hr lag)

HotDash shows "Last updated: {time}" on each tile.
```

**Approval Actions Not Working:**
```
Problem: Click "Approve" but nothing happens

Solutions:
1. Check browser console for errors
2. Verify integration connection (Chatwoot, Shopify)
3. Ensure you have necessary Shopify permissions
4. Try refreshing and approving again
5. Check if action already executed (may be timing issue)

Action history is logged even if UI doesn't update immediately.
```

**Charts Not Displaying:**
```
Problem: Analytics charts blank or broken

Solutions:
1. Ensure JavaScript enabled in browser
2. Disable ad blockers (may block Chart.js)
3. Check browser console for errors
4. Try different browser
5. Verify you have data for selected time period

Empty state message should explain if no data available.
```

---

## 10. Keyboard Shortcuts

### 10.1 Global Shortcuts

**Navigation:**
```
G then D = Go to Dashboard
G then A = Go to Approvals
G then I = Go to Inventory
G then S = Go to Settings
```

**Actions:**
```
? = Show keyboard shortcuts help
/ = Focus search
Esc = Close modal or dialog
```

### 10.2 Approvals Queue

```
J = Next approval
K = Previous approval
A = Approve current
E = Edit current
R = Reject current
Space = Toggle details
```

### 10.3 Modals

```
Tab = Next focusable element
Shift+Tab = Previous focusable element
Enter = Confirm/Submit
Esc = Close modal
```

---

## 11. Best Practices

### 11.1 Daily Workflow

**Morning Routine (15 min):**
```
1. Check Dashboard for overnight alerts
2. Review Approvals Queue (HIGH risk first)
3. Respond to customer escalations (SLA breaches)
4. Review inventory alerts (urgent reorders)
```

**Throughout Day:**
```
• Respond to desktop notifications within 15 minutes
• Check dashboard hourly for new approvals
• Monitor ad performance if running active campaigns
```

**End of Day (10 min):**
```
1. Clear remaining approvals queue
2. Review daily sales performance
3. Address any critical inventory alerts
4. Set up tomorrow's priority actions
```

### 11.2 Optimization Tips

**Improve AI Suggestions:**
```
• Grade every approval honestly (1-5 scale)
• Edit drafts to show your preferences
• Reject poor suggestions (don't approve "good enough")
• Review AI learning data monthly

Better grading = better future suggestions.
```

**Reduce False Alerts:**
```
• Adjust inventory thresholds for seasonal products
• Set quiet hours for non-urgent notifications
• Disable alert types you don't need
• Customize ROP based on actual lead times
```

**Faster Approvals:**
```
• Use keyboard shortcuts (J/K to navigate, A to approve)
• Review evidence quickly with checklist mindset
• Trust AI for LOW risk items (approve faster)
• Take time on HIGH risk items (customer-facing)
```

---

## 12. Contact & Support

### 12.1 Getting Help

**In-App Help:**
```
Click ? icon in top navigation for:
• Searchable help articles
• Video tutorials
• Feature guides
```

**Email Support:**
```
support@hotrodan.com
Response time: Within 24 hours (business days)

Include:
• Screenshot of issue
• Browser and OS version
• Steps to reproduce
• Any error messages
```

**Community Forum:**
```
forum.hotrodan.com

Ask questions, share tips, connect with other operators.
```

### 12.2 Feature Requests

**How to Request:**
```
Settings → Feedback → "Request a Feature"

Include:
• What you want to do
• Why it would help your workflow
• How often you'd use it

We review all requests and prioritize based on user demand and business impact.
```

---

## 13. Glossary of Terms

**AI Agent:**
```
Software that analyzes data and suggests actions. All suggestions require human approval in HotDash.
```

**Approval:**
```
Your explicit permission for AI to execute a suggested action. You review, approve/reject, and grade.
```

**Dashboard Tile:**
```
Individual widget showing live operational data. Click to see details. Drag to reorder.
```

**Empty State:**
```
Placeholder shown when no data available. Usually includes guidance on how to connect data source.
```

**Escalation:**
```
Customer conversation flagged as urgent (SLA breach, VIP customer, complaint).
```

**HITL (Human-in-the-Loop):**
```
Process where AI suggests, human approves. Ensures quality control on all actions.
```

**Integration:**
```
Connection to external service (Shopify, Analytics, Chatwoot). Required for data flow.
```

**Modal:**
```
Overlay window with detailed information or actions. Opens when you click a tile.
```

**SLA (Service Level Agreement):**
```
Target response time for customer inquiries. HotDash alerts when SLA breached.
```

**Toast Notification:**
```
Brief message that appears after action completes. Auto-dismisses after few seconds.
```

**Tooltip:**
```
Help text that appears when hovering over ? icon. Explains complex metrics or features.
```

---

## Quick Reference Card

**Most Common Actions:**
```
✓ Review approvals: Dashboard → Approvals Queue tile
✓ Respond to customer: CX Escalations tile → Click conversation
✓ Reorder inventory: Inventory Heatmap → Click alert → Create PO
✓ Check analytics: Click Social/Ads/SEO/Content tile
✓ Connect service: Settings → Integrations → Connect
✓ Adjust alerts: Settings → Notifications
```

**When Things Go Wrong:**
```
✗ Data not loading: Test connection in Settings
✗ Tile not updating: Click refresh icon, check auto-refresh
✗ Approval failed: Check integration status, verify permissions
✗ Chart broken: Disable ad blocker, check browser console
```

**Getting Help:**
```
? icon → Search help
support@hotrodan.com → Email support
forum.hotrodan.com → Community help
```

---

**END OF DOCUMENT**

**Implementation Notes:**
1. Help content accessible via ? icon in navigation
2. Tooltips appear on hover/click for metric labels
3. FAQ searchable and categorized
4. Video tutorials linked where helpful
5. Keep help docs updated with each feature release

**Questions?** Contact Content team for help documentation updates or additions.

