# HotDash Dashboard - CEO Quick Start Guide

**Version**: 1.0  
**Date**: October 12, 2025  
**Updated**: Oct 12 (Tasks 15-16: Mobile & Integration Training Added)
**Owner**: Enablement Agent  
**Purpose**: Executive training for Hot Rod AN CEO on HotDash dashboard usage  
**Time to Read**: 10 minutes

---

## 🎯 What is HotDash?

HotDash is your **Operator Control Center** - a single dashboard that surfaces real-time insights across your entire Shopify operation:

- **Sales & Revenue** - Current performance and top products
- **Customer Experience** - Support escalations and SLA breaches  
- **Fulfillment** - Order status and shipping issues
- **Inventory** - Low stock alerts and days of cover
- **SEO/Traffic** - Landing page performance and anomalies
- **Operations** - Team activation rates and response times

**The Goal**: One glance tells you what needs attention TODAY.

---

## 🖥️ Dashboard Layout - 6 Tiles

When you log in to `https://hotdash.app`, you'll see 6 tiles arranged on your dashboard:

```
┌─────────────────────┬─────────────────────┐
│   Sales Pulse       │  CX Escalations     │
│                     │                     │
├─────────────────────┼─────────────────────┤
│ Fulfillment Health  │  Inventory Heatmap  │
│                     │                     │
├─────────────────────┼─────────────────────┤
│   SEO Content       │   Ops Metrics       │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

**Each tile** shows real-time data from your Shopify store, Chatwoot support, and Google Analytics.

---

## 📊 Tile 1: Sales Pulse

### What You See
- **Total Revenue** - Current window (today, this week, etc.)
- **Order Count** - Number of orders placed
- **Top SKUs** - Best-selling products with units and revenue
- **Open Fulfillment** - Orders with fulfillment blockers

### What It Tells You
- **Are sales on track?**
- **Which products are driving revenue?**
- **Are there any fulfillment issues blocking orders?**

### Example Display
```
$12,458.50
24 orders in the current window.

Top SKUs:
• Red Widget - 15 units ($2,247.75)
• Blue Gadget - 8 units ($1,599.92)  
• Green Tool - 12 units ($1,800.00)

Open fulfillment:
• Order #1234 - unfulfilled
• Order #1235 - partially fulfilled
```

### When to Act
- ❌ **Revenue below target** → Review pricing, inventory, or marketing
- ❌ **Top SKU changes dramatically** → Investigate demand shifts
- ❌ **Multiple fulfillment blockers** → Check with fulfillment team

---

## 🚨 Tile 2: CX Escalations

### What You See
- **Customer conversations** with SLA breaches
- **Customer name and status** (open, pending, etc.)
- **"Review" button** to see conversation details

### What It Tells You
- **Which customers need immediate attention?**
- **Are we meeting our support SLAs?**
- **What's the current support load?**

### Example Display
```
• Sarah Johnson - open • SLA breached [Review]
• Mike Chen - pending [Review]  
• Lisa Rodriguez - open • SLA breached [Review]
```

OR if everything's good:
```
No SLA breaches detected.
```

### When to Act
- ❌ **Multiple SLA breaches** → Support team may be overloaded
- ❌ **Same customer appearing repeatedly** → Complex issue needs escalation
- ✅ **No breaches** → Team is performing well!

---

## 📦 Tile 3: Fulfillment Health

### What You See
- **Orders with fulfillment issues** (delayed, stuck, etc.)
- **Order name, status, and timestamp**
- Message when everything's on track

### What It Tells You
- **Are orders shipping on time?**
- **Are there fulfillment bottlenecks?**
- **Which orders need attention?**

### Example Display
```
• Order #1234 - unfulfilled (since Oct 11, 9:15 AM)
• Order #1235 - partially fulfilled (since Oct 10, 2:30 PM)
```

OR:
```
All recent orders are on track.
```

### When to Act
- ❌ **Orders stuck >24 hours** → Investigate warehouse/shipping issues
- ❌ **Pattern of delays** → Review fulfillment process
- ✅ **Empty tile** → Fulfillment running smoothly!

---

## 📉 Tile 4: Inventory Heatmap

### What You See
- **Low stock alerts** for products
- **Quantity available** and **days of cover** (how long stock will last)
- No alerts when inventory levels are healthy

### What It Tells You
- **Which products need reordering?**
- **How many days until stockout?**
- **Is inventory balanced across products?**

### Example Display
```
• Red Widget: 12 left • 3 days of cover
• Blue Gadget: 5 left • 2 days of cover
• Green Tool: 8 left • 4 days of cover
```

OR:
```
No low stock alerts right now.
```

### When to Act
- ❌ **<7 days of cover** → Reorder immediately
- ❌ **<3 days of cover** → URGENT - expedite shipment
- ❌ **Best-seller running low** → Double check reorder was placed

---

## 🔍 Tile 5: SEO Content

### What You See
- **Landing page traffic** with session counts
- **Week-over-week (WoW) change** as percentage
- **"Attention" flag** for anomalies (significant drops)

### What It Tells You
- **Which pages are driving traffic?**
- **Is organic traffic growing or declining?**
- **Are there any unexpected traffic drops?**

### Example Display
```
• /products/red-widget - 1,245 sessions (+15.3% WoW)
• /collections/sale - 892 sessions (-8.2% WoW) • attention
• /products/blue-gadget - 654 sessions (+2.1% WoW)
```

OR:
```
Traffic trends stable.
```

### When to Act
- ❌ **Major page shows "attention"** → Check for SEO issues, broken links
- ❌ **Consistent negative WoW** → Review content strategy
- ✅ **Positive WoW growth** → Current strategy working!

---

## 📈 Tile 6: Ops Metrics

### What You See
Two sections showing **7-day performance**:

**Activation (7d)**:
- Activation rate as percentage
- Number of shops activated
- Date range for the window

**SLA Resolution (7d)**:
- Median minutes to first operator action
- P90 (90th percentile) response time
- Sample size

### What It Tells You
- **How quickly is your team activating new shops?**
- **How fast is support responding to escalations?**
- **Is team performance improving or declining?**

### Example Display
```
Activation (7d)
82.5%
33 / 40 shops activated
Window Oct 5 - Oct 12

SLA Resolution (7d)
12.5 min
Median to first operator action
P90: 28.3 min
Sample size: 47
```

### When to Act
- ❌ **Activation rate <70%** → Review onboarding process
- ❌ **Median time >15 min** → Support team may need help
- ❌ **P90 >30 min** → Some customers waiting too long

---

## ⚡ 5-Minute Daily Routine (CEO Version)

### Morning Check (9:00 AM) - 3 minutes

1. **Sales Pulse** (30 sec)
   - Is revenue on track for today?
   - Any fulfillment blockers?

2. **CX Escalations** (30 sec)  
   - Any SLA breaches?
   - Support team handling load?

3. **Inventory Heatmap** (30 sec)
   - Any urgent stockouts?
   - Best-sellers adequately stocked?

4. **SEO Content** (30 sec)
   - Traffic stable or growing?
   - Any anomalies to investigate?

5. **Fulfillment Health** (30 sec)
   - Orders shipping on time?
   
6. **Ops Metrics** (30 sec)
   - Team performance trending up?

### Afternoon Check (3:00 PM) - 2 minutes

Quick scan of all 6 tiles:
- ✅ All green? Great, move on with your day
- ⚠️ Any red flags? Dig into that tile for details

**That's it!** 5 minutes, twice a day keeps you informed.

---

## 🎓 Dashboard Features You Should Know

### 1. Click for Details
Most tiles have a **"View details"** or **"Review"** button:
- **Sales Pulse** → Opens modal with more order data
- **CX Escalations** → Opens conversation thread with full history

**Tip**: Don't click unless you need to dig deeper. The tile view gives you the summary.

### 2. Real-Time Updates
The dashboard updates automatically:
- **Sales/Orders** - Updates every 5 minutes
- **Support/CX** - Updates every 2 minutes
- **Inventory** - Updates every 15 minutes  
- **SEO/Traffic** - Updates hourly

**Tip**: No need to refresh. Just leave it open in a browser tab.

### 3. Time Windows
You can adjust the time window for most tiles:
- **Today** (default)
- **This Week**  
- **Last 7 Days**
- **Last 30 Days**

**Tip**: CEOs usually use "Today" or "This Week" for quick checks.

### 4. Export & Share
Click the **export icon** (top-right) to:
- Download data as CSV
- Share link with your team
- Schedule daily/weekly email reports

---

## 🚀 Getting Started (First 15 Minutes)

### Step 1: Log In (2 min)
1. Go to `https://hotdash.app`
2. Enter your credentials
3. You'll land on the dashboard with 6 tiles

### Step 2: Orient Yourself (3 min)
- **Top Row**: Sales Pulse, CX Escalations
- **Middle Row**: Fulfillment Health, Inventory Heatmap
- **Bottom Row**: SEO Content, Ops Metrics

Spend 30 seconds on each tile - just get familiar with the layout.

### Step 3: Practice Your Routine (5 min)
Go through each tile and ask:
1. Sales Pulse: "Is revenue where I expect?"
2. CX Escalations: "Any urgent customer issues?"
3. Fulfillment: "Orders shipping smoothly?"
4. Inventory: "Any stockouts coming?"
5. SEO: "Traffic stable or growing?"
6. Ops Metrics: "Team performing well?"

### Step 4: Set Your Cadence (5 min)
- **Morning**: 9:00 AM - Quick check before standup
- **Afternoon**: 3:00 PM - Mid-day pulse check
- **Optional**: 6:00 PM - End-of-day review

Add these to your calendar as 5-minute blocks.

---

## 💡 CEO Pro Tips

### Tip 1: Focus on Exceptions
> "I only look closely when something's red or unusual. Green tiles mean my team's on it." - Successful CEO

**Trust your team** to handle day-to-day. Use dashboard to catch exceptions.

### Tip 2: Weekly Trend Review
> "Every Monday, I look at 7-day metrics to spot trends. Daily checks are for fires." - Experienced operator

**Use the dashboard** for daily spot-checks, but review trends weekly.

### Tip 3: Share With Your Team
> "When I see something great (or concerning), I screenshot the tile and share in Slack. Keeps everyone aligned." - Engaged leader

**Make it collaborative**, not just top-down monitoring.

### Tip 4: Mobile Access
> "I check the dashboard on my phone during commute. Quick glance keeps me in the loop without being at my desk." - On-the-go executive

**HotDash is mobile-responsive** - works great on phones/tablets.

---

## 🆘 Need Help?

### Slack Channels
- **#hotdash-help** - General questions
- **#hotdash-feedback** - Suggestions for improvements
- **#incidents** - Technical issues

### Direct Support
- **Email**: support@hotdash.com
- **Phone**: 1-800-HOT-DASH (during business hours)
- **Live Chat**: Bottom-right corner of dashboard

### Training Resources
- **Video Walkthrough**: https://hotdash.app/training/ceo-guide
- **Full Documentation**: https://docs.hotdash.com
- **FAQ**: https://docs.hotdash.com/faq

---

## ✅ Success Checklist

**First Day**:
- [ ] Log in to HotDash
- [ ] Complete one full scan of all 6 tiles
- [ ] Click "View details" on at least one tile
- [ ] Set up morning/afternoon calendar reminders

**First Week**:
- [ ] Do 2 daily checks (morning & afternoon) every day
- [ ] Identify 1-2 trends (good or bad) to discuss with team
- [ ] Try adjusting time windows (Today → This Week)
- [ ] Share at least one dashboard screenshot with your team

**By End of Month**:
- [ ] Dashboard check is part of your daily routine
- [ ] You can explain each tile to a new team member
- [ ] You've used the dashboard to catch at least one issue early
- [ ] You're confident using HotDash as your command center

---

## 🎯 Key Takeaways

1. **One Dashboard, Complete View** - Sales, CX, Fulfillment, Inventory, SEO, Ops
2. **5 Minutes, Twice Daily** - Morning and afternoon checks keep you informed
3. **Focus on Exceptions** - Green = good, red = needs attention
4. **Trust Your Team** - Dashboard amplifies their work, doesn't replace it
5. **Mobile-Friendly** - Check from anywhere, anytime

**Welcome to HotDash!** You now have real-time visibility into every critical part of your operation.

---

**Questions?** Reach out to the Enablement team at enablement@hotdash.com

**Document Path**: `docs/enablement/CEO_DASHBOARD_QUICK_START.md`  
**Version**: 1.0  
**Last Updated**: October 12, 2025  
**Status**: Ready for CEO training ✅
