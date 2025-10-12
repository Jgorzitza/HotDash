# HotDash Dashboard - Frequently Asked Questions (FAQ)

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Enablement Agent  
**Purpose**: Quick answers to common operator questions  
**Audience**: All HotDash users

---

## 📑 Table of Contents

- [Getting Started](#getting-started)
- [Dashboard Basics](#dashboard-basics)
- [Tiles & Data](#tiles--data)
- [Integrations](#integrations)
- [Performance & Speed](#performance--speed)
- [Mobile Access](#mobile-access)
- [Account & Billing](#account--billing)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Q: How do I get access to HotDash?
**A:** Contact your manager or email support@hotdash.com with your:
- Full name
- Company email address
- Role (Operator, Manager, CEO, etc.)
- Shopify store domain

You'll receive an invite email within 24 hours.

---

### Q: What browser should I use?
**A:** **Best**: Chrome or Edge (Chromium version)  
**Good**: Firefox, Safari  
**Not supported**: Internet Explorer

All browsers should be on the latest version.

---

### Q: Do I need to install anything?
**A:** No! HotDash is 100% web-based. Just open your browser and go to https://hotdash.app.

---

### Q: How long does initial setup take?
**A:** About 15 minutes:
- 5 min: Account setup + password
- 5 min: Connect Shopify, Chatwoot, and Google Analytics
- 5 min: Configure settings (time zone, alerts, etc.)

After that, you're ready to go!

---

### Q: What if I've never used a dashboard like this before?
**A:** No problem! Resources:
1. Watch the [5-minute video tutorial](CEO_DASHBOARD_VIDEO_SCRIPT.md)
2. Read the [CEO Quick Start Guide](CEO_DASHBOARD_QUICK_START.md)
3. Do the morning routine for 3-5 days - it becomes second nature fast

Most users are comfortable within Week 1.

---

## 📊 Dashboard Basics

### Q: What do the 6 tiles show?
**A:**
1. **Sales Pulse** - Revenue, orders, top products, fulfillment issues
2. **CX Escalations** - Customer support SLA breaches
3. **Fulfillment Health** - Orders not shipping on time
4. **Inventory Heatmap** - Low stock alerts
5. **SEO Content** - Landing page traffic and anomalies
6. **Ops Metrics** - Team activation rate and SLA response times

---

### Q: How often does the dashboard update?
**A:**
- **Sales Pulse**: Every 5 minutes
- **CX Escalations**: Every 2 minutes
- **Fulfillment Health**: Every 5 minutes
- **Inventory Heatmap**: Every 15 minutes
- **SEO Content**: Every hour (GA4 data has 24-48h delay)
- **Ops Metrics**: Every 15 minutes

No need to manually refresh - it auto-updates!

---

### Q: What does "WoW" mean?
**A:** **Week-over-Week** - The percentage change compared to the same day last week.

Example: If today (Tuesday) you had 1,000 sessions, and last Tuesday you had 800, your WoW is +25%.

Used in SEO Content tile to detect traffic changes.

---

### Q: What does "P90" mean?
**A:** **90th Percentile** - The value below which 90% of data points fall.

Example: If P90 response time is 28 minutes, that means 90% of customers got a response in <28 minutes, but 10% waited longer.

Used in Ops Metrics to measure worst-case performance.

---

### Q: Can I customize which tiles I see?
**A:** Not yet, but it's on the roadmap! For now, all users see the same 6 tiles.

**Workaround**: Use [keyboard shortcuts](OPERATOR_BEST_PRACTICES.md#tip-1-keyboard-shortcuts) to jump directly to your most-used tiles.

---

### Q: Can I rearrange tiles?
**A:** Not yet (coming soon!). Current layout is optimized based on user research.

---

### Q: What does the time window selector do?
**A:** Changes the date range for that tile:
- **Today** - Midnight to now (default)
- **Yesterday** - Previous 24 hours
- **Last 7 Days** - Rolling week
- **Last 30 Days** - Rolling month

Use "Today" for daily operations, "Last 7 Days" for weekly reviews.

---

## 🎯 Tiles & Data

### Q: Why is my tile empty or showing "No data"?
**A:** Common reasons:
1. **Sales Pulse**: No orders in this time window
2. **CX Escalations**: No SLA breaches (good thing!)
3. **Fulfillment Health**: All orders on track (good thing!)
4. **Inventory Heatmap**: No low stock alerts (good thing!)
5. **SEO Content**: No traffic anomalies (good thing!)
6. **Ops Metrics**: Not enough data yet (need 7 days)

**If unexpected**, see [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md#data-issues).

---

### Q: Why don't my numbers match Shopify/Chatwoot/GA4?
**A:** Most common causes:
1. **Time zone difference** - Match time zones in Settings
2. **Sync delay** (5-15 min depending on tile)
3. **Different views** - HotDash shows landing pages, GA4 may show all pages
4. **Filters** - One system may have filters applied

See [Data Accuracy Issues](TROUBLESHOOTING_GUIDE.md#data-accuracy-issues) for details.

---

### Q: What does "Days of cover" mean in Inventory Heatmap?
**A:** How many days your current stock will last at current sales velocity.

Example: You have 12 Red Widgets. You sell 4/day on average. Days of cover = 12 ÷ 4 = 3 days.

**<7 days** = Warning (reorder soon)  
**<3 days** = Critical (reorder NOW)

---

### Q: What triggers an "attention" flag in SEO Content?
**A:** A significant traffic drop, usually >15-20% week-over-week.

It means: "This page lost a lot of traffic. Investigate why."

Common causes: SEO penalty, broken link, competitor surge, or content change.

---

### Q: Why does Sales Pulse show different revenue than I expect?
**A:** Check these:
1. **Time window** - Are you looking at "Today" or "Last 7 Days"?
2. **Time zone** - Does your HotDash time zone match your mental time zone?
3. **Refunds** - HotDash shows *net* revenue (after refunds)
4. **Currency** - Multi-currency stores converted to base currency

---

### Q: Can I export data from tiles?
**A:** Yes! Click the **export icon** (top-right of tile) to download:
- CSV format
- Excel format
- Date range you're viewing

**Limits**:
- Free accounts: 1,000 rows
- Pro accounts: 10,000 rows
- Enterprise: Unlimited

---

### Q: Can I share a tile with my team?
**A:** Yes! Click **share icon** (top-right of tile) to:
- Copy link (opens that specific tile view)
- Share via email
- Schedule daily/weekly email reports

**Note**: Recipients need a HotDash account to view.

---

## 🔗 Integrations

### Q: Which integrations do I need to set up?
**A:**
- **Required**: Shopify (for Sales Pulse, Fulfillment, Inventory tiles)
- **Recommended**: Chatwoot (for CX Escalations tile)
- **Recommended**: Google Analytics 4 (for SEO Content tile)
- **Internal**: Ops Metrics (auto-tracked, no setup needed)

---

### Q: How do I connect Shopify?
**A:**
1. Settings → Integrations → Shopify
2. Click "Connect"
3. Log in to Shopify (if not already)
4. Click "Install app" and grant permissions
5. Wait 5-10 minutes for initial data sync

Need more help? See [Shopify Integration Issues](TROUBLESHOOTING_GUIDE.md#problem-shopify-integration-not-working).

---

### Q: How do I connect Chatwoot?
**A:**
1. In Chatwoot: Go to Profile Settings → Access Token → Copy token
2. In HotDash: Settings → Integrations → Chatwoot → Paste token
3. Click "Connect"
4. Wait 2-5 minutes for initial sync

**Note**: Requires Chatwoot Business plan or higher (API access).

---

### Q: How do I connect Google Analytics?
**A:**
1. Settings → Integrations → Google Analytics → Click "Connect with Google"
2. Select your Google account (must have GA4 access)
3. Select your GA4 property
4. Grant permissions
5. Wait 24-48 hours for initial data (GA4 has delay)

**Important**: Must be GA4, not Universal Analytics (UA). UA is not supported.

---

### Q: What happens if an integration breaks?
**A:** The affected tile(s) will show:
- "Unable to load data"
- "Connection error"
- Or an empty state

**Fix**: Go to Settings → Integrations → Reconnect the affected integration.

If still broken, see [Integration Issues](TROUBLESHOOTING_GUIDE.md#integration-issues).

---

### Q: Can HotDash write data back to Shopify/Chatwoot?
**A:** **Currently**: Read-only (HotDash reads data but doesn't modify it)

**Coming soon**: Write capabilities for:
- Replying to Chatwoot conversations from HotDash
- Creating Shopify orders
- Updating inventory levels

---

## ⚡ Performance & Speed

### Q: How fast should HotDash load?
**A:** 
- **Initial page load**: 2-4 seconds
- **Tile refresh**: <1 second
- **Opening modal**: <1 second

**If slower**, see [Performance Issues](TROUBLESHOOTING_GUIDE.md#performance-issues).

---

### Q: Why is HotDash slow today?
**A:** Common causes:
1. **Slow internet** - Run speed test (need >5 Mbps)
2. **Too many browser tabs** - Close unused tabs
3. **Old browser** - Update to latest version
4. **Corrupted cache** - Clear cache (see Troubleshooting Guide)
5. **HotDash outage** - Check https://status.hotdash.com

---

### Q: Does HotDash work offline?
**A:** No, HotDash requires internet connection. It's a cloud-based dashboard that pulls real-time data from Shopify, Chatwoot, and Google Analytics.

---

### Q: Can I use HotDash on a slow internet connection?
**A:** Yes, but:
- **Minimum**: 2 Mbps download speed
- **Recommended**: 5+ Mbps for smooth experience
- **Best**: 10+ Mbps for no lag

If <2 Mbps, tiles may load slowly or time out.

---

## 📱 Mobile Access

### Q: Is there a mobile app?
**A:** Not yet (coming 2026!). For now, use mobile browser:
- iOS: Safari, Chrome, or Firefox
- Android: Chrome, Firefox, or Samsung Internet

HotDash is mobile-responsive - it adapts to your screen size.

---

### Q: Can I check HotDash on my phone?
**A:** Yes! Go to https://hotdash.app on your mobile browser.

**Best for mobile**:
- CX Escalations (respond quickly)
- Inventory Heatmap (approve reorders)
- Quick glance at all tiles

**Better on desktop**:
- Sales Pulse (detailed order analysis)
- SEO Content (investigating traffic drops)

---

### Q: Why does dashboard look different on mobile?
**A:** Mobile layout is optimized for smaller screens:
- Tiles stack vertically (not side-by-side)
- Some details hidden (click to expand)
- Touch-friendly buttons (larger)

This is intentional for better mobile experience.

---

### Q: Can I get mobile notifications?
**A:** **Coming soon!** You'll be able to set up push notifications for:
- SLA breaches
- Inventory <X days
- Revenue drops >X%
- Traffic anomalies

For now, check dashboard manually or set up email alerts.

---

## 💳 Account & Billing

### Q: How much does HotDash cost?
**A:** Pricing (as of Oct 2025):
- **Free**: 1 user, 1 store, basic features
- **Pro**: $49/month, 5 users, advanced features
- **Enterprise**: Custom pricing, unlimited users, white-label

Check https://hotdash.com/pricing for current pricing.

---

### Q: Can I try HotDash for free?
**A:** Yes! **14-day free trial**, no credit card required.

After 14 days, you can:
- Upgrade to Pro/Enterprise
- Downgrade to Free plan (limited features)
- Cancel (data deleted after 30 days)

---

### Q: How do I add more users?
**A:** 
1. Settings → Team → Invite User
2. Enter email address and role (Operator, Manager, Admin)
3. They'll receive an invite email

**Note**: Check your plan's user limit. Pro = 5 users, Enterprise = unlimited.

---

### Q: Can I change my plan later?
**A:** Yes! Upgrade or downgrade anytime:
- Settings → Billing → Change Plan

**Upgrades**: Effective immediately.  
**Downgrades**: Effective at next billing cycle.

---

### Q: What happens if I cancel?
**A:** 
- **Immediate**: Access to Pro/Enterprise features removed
- **After 30 days**: Data deleted (export first if you want to keep it)
- **After 90 days**: Account deleted

You can reactivate anytime within 30 days without data loss.

---

## 🔧 Troubleshooting

### Q: I can't log in. What should I do?
**A:** Try these in order:
1. Check Caps Lock (password is case-sensitive)
2. Click "Forgot password?" to reset
3. Clear browser cache
4. Try different browser

Still stuck? Email support@hotdash.com with your email address.

---

### Q: Tile shows "No data" but I know data exists. Why?
**A:** Common causes:
1. **Integration not connected** - Check Settings → Integrations
2. **Time window too narrow** - Try "Last 7 Days" instead of "Today"
3. **Sync delay** - Wait 5-15 minutes (depending on tile)
4. **Filters applied** - Check Settings → [Tile Name] → Filters

Full guide: [Data Issues](TROUBLESHOOTING_GUIDE.md#data-issues)

---

### Q: Numbers don't match Shopify. Is HotDash wrong?
**A:** Usually not wrong, just different:
1. **Time zone difference** - Match in Settings
2. **Sync delay** (5-15 min)
3. **Net vs. gross revenue** - HotDash shows net (after refunds)
4. **Different filters** - HotDash may show all locations, Shopify filtered to one

See [Data Accuracy Issues](TROUBLESHOOTING_GUIDE.md#data-accuracy-issues).

---

### Q: Dashboard is slow. How do I fix it?
**A:** Quick fixes:
1. Close unused browser tabs
2. Clear browser cache (Ctrl+Shift+Delete)
3. Update browser to latest version
4. Try in Incognito mode (rules out extensions)

Full guide: [Performance Issues](TROUBLESHOOTING_GUIDE.md#performance-issues).

---

### Q: I found a bug. How do I report it?
**A:** Thank you!
1. Screenshot the issue (include whole screen)
2. Note what you were doing when it happened
3. Email support@hotdash.com with:
   - Screenshot
   - Steps to reproduce
   - Browser name and version
   - Account email

We'll investigate and update you within 48 hours.

---

### Q: Where can I see known issues?
**A:** Check https://status.hotdash.com for:
- Current outages
- Scheduled maintenance
- Known bugs and workarounds
- Incident history

---

## 💡 Best Practices

### Q: How often should I check the dashboard?
**A:** **Recommended**:
- **Morning** (9 AM): 5-minute full scan
- **Afternoon** (2-3 PM): 2-minute spot-check

**Avoid**: Obsessively refreshing every 10 minutes. Let the auto-update handle it.

---

### Q: What's the fastest way to use HotDash?
**A:** 
1. **Learn keyboard shortcuts** (Shift+S, Shift+C, etc.) - Saves 50% of time
2. **Focus on red flags**, ignore green tiles - Saves 30% of time
3. **Use mobile for quick checks** - Saves trips to desk

See [Best Practices Guide](OPERATOR_BEST_PRACTICES.md) for more tips.

---

### Q: Should I check every tile every time?
**A:** **Morning**: Yes, scan all 6 tiles (5 minutes).

**Afternoon**: Focus on your role:
- **Support Manager**: CX Escalations + Ops Metrics
- **Operations Manager**: Fulfillment + Inventory
- **CEO**: All 6 tiles (but faster scan, 2 min)

---

### Q: When should I escalate to my manager?
**A:** **Immediately**:
- 5+ SLA breaches
- Fulfillment issues affecting >10 orders
- Best-seller <2 days inventory
- Traffic drop >30%

**Within 2-4 hours**:
- 1-3 SLA breaches
- 1-2 stuck orders
- Minor inventory/traffic issues

See [Communication Best Practices](OPERATOR_BEST_PRACTICES.md#communication-best-practices).

---

### Q: Can I use HotDash in meetings?
**A:** Yes! Great for:
- Daily standups (screen share dashboard)
- Weekly reviews (use "Last 7 Days" view)
- 1:1s with manager (show your metrics)
- Customer calls (reference data to answer questions)

**Tip**: Export data beforehand for offline access if needed.

---

### Q: How do I train a new team member?
**A:** Follow this sequence:
1. **Day 1**: Watch video, read CEO Quick Start Guide
2. **Day 2-3**: Shadow you during morning routine
3. **Day 4-5**: They do morning routine, you observe
4. **Week 2**: Independent but check in daily
5. **Week 3**: Fully independent

Resources: [All training materials](./README.md)

---

## 🆘 Getting More Help

### Q: Where can I learn more?
**A:** Resources:
- **Quick Start**: [CEO Dashboard Quick Start Guide](CEO_DASHBOARD_QUICK_START.md)
- **Deep Dive**: [Tile-by-Tile Reference Guide](TILE_BY_TILE_REFERENCE_GUIDE.md)
- **Efficiency**: [Operator Best Practices](OPERATOR_BEST_PRACTICES.md)
- **Issues**: [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
- **Videos**: Coming soon to https://hotdash.com/training

---

### Q: How do I contact support?
**A:**
- **Email**: support@hotdash.com (response <4 hours)
- **Live Chat**: Bottom-right corner of dashboard (business hours)
- **Phone**: 1-800-HOT-DASH (Mon-Fri 9 AM - 5 PM EST)
- **Slack**: #hotdash-help (if your company has integration)

---

### Q: What information should I include in support requests?
**A:** For faster resolution:
- What you were trying to do
- What happened instead
- What you've tried so far
- Screenshot (if applicable)
- Browser name and version
- Account email

Bad: "Dashboard is broken"  
Good: "Sales Pulse tile shows 'No data' even though I have 20 orders today. Tried clearing cache and different browser. See attached screenshot. Using Chrome 118 on Windows 11. Account: operator@mystore.com"

---

### Q: Is there a community forum or Slack?
**A:** 
- **Slack**: #hotdash-community (if your company has integration)
- **Forum**: Coming Q1 2026 at https://community.hotdash.com

For now, reach out to your team or support for questions.

---

### Q: Can I request features?
**A:** Absolutely! We love feedback.

**How to submit**:
- Email: features@hotdash.com
- Live chat: "I have a feature request"
- Slack: #hotdash-feedback

**What to include**:
- What feature you want
- Why you need it (use case)
- How often you'd use it

We review all requests and respond within 1 week.

---

## 🎓 Training & Certification

### Q: Is there formal training available?
**A:** Yes! Training options:
- **Self-paced**: Read docs, watch videos (free)
- **Live training**: Monthly webinars (free, register at https://hotdash.com/training)
- **1:1 training**: Custom training for your team (Enterprise customers only)

---

### Q: Is there a certification program?
**A:** Coming Q2 2026! **HotDash Certified Operator** program:
- Online course (2 hours)
- Assessment (30 min)
- Certificate upon passing
- Badge for LinkedIn

Stay tuned!

---

## 📝 Feedback & Improvements

### Q: How can I help improve HotDash?
**A:** We love hearing from users!
- **Feature requests**: features@hotdash.com
- **Bug reports**: support@hotdash.com
- **General feedback**: feedback@hotdash.com
- **Beta testing**: Sign up at https://hotdash.com/beta

Active contributors get:
- Early access to new features
- Swag (stickers, t-shirts)
- Recognition in release notes

---

### Q: Can I see what's coming next?
**A:** Yes! Check our **public roadmap**: https://hotdash.com/roadmap

You can:
- See planned features
- Vote on what you want most
- Comment on proposals

---

## 🙏 Thank You

Thank you for using HotDash! We're here to make your job easier.

**Quick links**:
- Dashboard: https://hotdash.app
- Docs: https://docs.hotdash.com
- Support: support@hotdash.com
- Status: https://status.hotdash.com

**Have a question not answered here?** Email faq@hotdash.com and we'll add it!

---

**Document Path**: `docs/enablement/FAQ_OPERATORS.md`  
**Version**: 1.0  
**Last Updated**: October 12, 2025  
**Status**: Ready for user reference ✅

**Questions or feedback on this FAQ?** Email enablement@hotdash.com
