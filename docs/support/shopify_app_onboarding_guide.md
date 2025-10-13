---
epoch: 2025.10.E1
doc: docs/support/shopify_app_onboarding_guide.md
owner: support
category: onboarding
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [shopify-app, onboarding, installation, dashboard, hot-dash]
---

# HotDash Shopify App Onboarding Guide

**Purpose**: Complete onboarding guide for installing and using HotDash in Shopify  
**Target Audience**: Hot Rod AN CEO, operators, merchants  
**App**: HotDash — AI-powered customer operations dashboard  
**Created**: October 12, 2025

---

## 🎯 What Is HotDash?

**HotDash** is an AI-powered operations dashboard embedded in your Shopify admin. It gives you real-time visibility and control over your customer operations through 5 actionable tiles.

**Your Benefits**:
- ✅ **Save Time**: Reduce CEO operational burden from 10-12h/week to <2h/week
- ✅ **Real-Time Insights**: See what's happening across your business instantly
- ✅ **AI-Assisted Actions**: Get AI recommendations with human approval
- ✅ **All in Shopify**: No switching between tools

**The 5 Tiles**:
1. **CX Pulse** — Customer support metrics and inquiries
2. **Sales Pulse** — Revenue, orders, and trends
3. **SEO Pulse** — Traffic sources and search rankings
4. **Inventory Watch** — Stock levels and reorder alerts
5. **Fulfillment Flow** — Pending orders and shipping status

---

## 📋 Prerequisites

Before installing HotDash, ensure you have:

- [ ] **Shopify Store**: An active Shopify store (Hot Rod AN dev store for pilot)
- [ ] **Admin Access**: Shopify admin permissions to install apps
- [ ] **Email Address**: For account notifications
- [ ] **Browser**: Chrome, Firefox, Edge, or Safari (latest version)
- [ ] **5 Minutes**: Installation takes less than 5 minutes

---

## 🚀 Installation Guide

### Step 1: Install HotDash from Shopify App Store

**Option A: Direct Installation Link** (Recommended)
```
1. You'll receive an installation link via email
2. Click the link → Opens Shopify admin
3. Click "Install App"
4. Review permissions → Click "Install"
5. HotDash installs automatically
```

**Option B: Shopify Admin**
```
1. Log into your Shopify admin
2. Go to: Apps > App Store
3. Search: "HotDash"
4. Click: HotDash by HotDash
5. Click: "Install"
6. Review permissions → Click "Install"
```

**Permissions HotDash Requires**:
- ✅ Read orders (for Sales Pulse, Fulfillment Flow)
- ✅ Read products (for Inventory Watch)
- ✅ Read customers (for CX Pulse)
- ✅ Read analytics (for traffic data)

**Why These Permissions?** HotDash needs read-only access to display your store data in the dashboard. We never write, modify, or delete your data.

---

### Step 2: First Login

**After Installation**:
```
1. Installation complete → Redirects to HotDash dashboard
2. You'll see: "Welcome to HotDash!"
3. Click: "Get Started"
4. Dashboard loads with 5 tiles
```

**First Login Setup** (One-Time):
```
1. Review welcome screen
2. Take quick tour (optional, 2 minutes)
3. Dashboard displays with your store data
4. All tiles populate automatically
```

**What You'll See**:
```
┌────────────────────────────────────────────────────────┐
│                  🔥 HotDash Dashboard                  │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐         │
│  │ CX Pulse  │  │Sales Pulse│  │ SEO Pulse │         │
│  │  ○○○○○○   │  │  ○○○○○○   │  │  ○○○○○○   │         │
│  └───────────┘  └───────────┘  └───────────┘         │
│                                                         │
│  ┌───────────┐  ┌───────────┐                         │
│  │Inventory  │  │Fulfillment│                         │
│  │  Watch    │  │   Flow    │                         │
│  │  ○○○○○○   │  │  ○○○○○○   │                         │
│  └───────────┘  └───────────┘                         │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

### Step 3: Verify Installation

**Check That Everything Works**:
```
☐ All 5 tiles visible
☐ Tiles show real data (not "Loading...")
☐ No error messages
☐ Can click into each tile
☐ Data matches your Shopify admin
```

**If You See Errors**:
- "No data available" → Wait 30 seconds, data is loading
- "Connection error" → Refresh browser (Ctrl+Shift+R)
- "Permission denied" → Reinstall app from Step 1

**Need Help?** See **Troubleshooting Guide** (docs/support/shopify_app_troubleshooting.md)

---

## 📊 The 5 Tiles Explained

### Tile 1: CX Pulse 💬

**What It Shows**: Customer support metrics and recent inquiries

**Key Metrics**:
- **Active Conversations**: Open support tickets
- **Response Time**: Average time to first response
- **CSAT Score**: Customer satisfaction (%)
- **Urgent Issues**: Priority tickets needing attention

**What You Can Do**:
- ✅ View recent customer inquiries
- ✅ See pending support actions
- ✅ Approve AI-suggested responses
- ✅ Track support team performance

**Example**:
```
┌─────────────────────────────────────┐
│ CX PULSE                            │
├─────────────────────────────────────┤
│ Active Conversations: 12            │
│ Avg Response Time: 2.3h             │
│ CSAT: 94% ↑                         │
│                                     │
│ RECENT INQUIRIES:                   │
│ • AN-6 fitting size? (2 min ago)    │
│ • Order #1234 status (15 min ago)   │
│ • Return request (1h ago)           │
│                                     │
│ [View All] [Approve AI Responses]   │
└─────────────────────────────────────┘
```

**Hot Rod AN Use Case**: See customer questions about AN fittings, fuel systems, and orders in real-time. AI suggests responses based on your playbooks.

---

### Tile 2: Sales Pulse 💰

**What It Shows**: Revenue, orders, and sales trends

**Key Metrics**:
- **Today's Revenue**: Sales so far today
- **Orders**: Number of orders today
- **Average Order Value** (AOV): Revenue per order
- **Trend**: ↑ or ↓ vs yesterday/last week

**What You Can Do**:
- ✅ Track daily sales performance
- ✅ Compare to previous periods
- ✅ See top-selling products
- ✅ Identify sales anomalies (spikes/dips)

**Example**:
```
┌─────────────────────────────────────┐
│ SALES PULSE                         │
├─────────────────────────────────────┤
│ Today's Revenue: $2,347 ↑ 15%       │
│ Orders: 23 (↑ 3 vs yesterday)       │
│ AOV: $102 ↓ 5%                      │
│                                     │
│ TOP SELLERS TODAY:                  │
│ 1. AN-6 Fuel Line Kit (8 sold)     │
│ 2. AN-8 Fittings (6 sold)          │
│ 3. Fuel Pressure Regulator (4 sold)│
│                                     │
│ [View Details] [Export Report]      │
└─────────────────────────────────────┘
```

**Hot Rod AN Use Case**: Track which AN fittings and fuel system parts are selling today. See revenue trends for race season planning.

---

### Tile 3: SEO Pulse 🔍

**What It Shows**: Traffic sources and search rankings

**Key Metrics**:
- **Visitors Today**: Traffic to your store
- **Top Traffic Sources**: Where visitors come from
- **Search Rankings**: Your Google positions
- **Top Landing Pages**: Most visited pages

**What You Can Do**:
- ✅ See where your traffic comes from
- ✅ Track SEO performance
- ✅ Identify top-performing content
- ✅ Spot traffic anomalies

**Example**:
```
┌─────────────────────────────────────┐
│ SEO PULSE                           │
├─────────────────────────────────────┤
│ Visitors Today: 342 ↑ 8%            │
│                                     │
│ TOP TRAFFIC SOURCES:                │
│ • Organic Search: 58% (198 visits)  │
│ • Direct: 22% (75 visits)           │
│ • Social: 12% (41 visits)           │
│ • Paid: 8% (28 visits)              │
│                                     │
│ TOP KEYWORDS:                       │
│ • "AN-6 fuel fittings" (#3 Google)  │
│ • "hot rod fuel system" (#7 Google) │
│                                     │
│ [View Analytics] [SEO Report]       │
└─────────────────────────────────────┘
```

**Hot Rod AN Use Case**: See which automotive/hot rod keywords drive traffic. Track SEO rankings for "AN fittings" and fuel system products.

---

### Tile 4: Inventory Watch 📦

**What It Shows**: Stock levels and reorder alerts

**Key Metrics**:
- **Low Stock Items**: Products running low
- **Out of Stock**: Products unavailable
- **Reorder Alerts**: When to restock
- **Fast Movers**: Best-selling inventory

**What You Can Do**:
- ✅ See which products need reordering
- ✅ Track inventory levels
- ✅ Get low-stock alerts
- ✅ Prevent stockouts on popular items

**Example**:
```
┌─────────────────────────────────────┐
│ INVENTORY WATCH                     │
├─────────────────────────────────────┤
│ Low Stock Alerts: 5 items           │
│ Out of Stock: 2 items               │
│                                     │
│ REORDER NOW:                        │
│ • AN-6 90° Fittings (3 left) 🔴     │
│ • AN-8 Straight (8 left) 🟡         │
│ • Fuel Pressure Gauge (0 left) 🔴   │
│                                     │
│ FAST MOVERS (This Week):            │
│ • AN-6 Hose Ends (45 sold)          │
│ • AN-8 Adapters (32 sold)           │
│                                     │
│ [Reorder] [View Inventory]          │
└─────────────────────────────────────┘
```

**Hot Rod AN Use Case**: Never run out of popular AN fittings during race season. Get alerted when top sellers are low.

---

### Tile 5: Fulfillment Flow 📮

**What It Shows**: Pending orders and shipping status

**Key Metrics**:
- **Orders to Fulfill**: Not yet shipped
- **Shipped Today**: Orders sent out
- **Pending Pickups**: Ready for carrier
- **Delayed Orders**: Behind schedule

**What You Can Do**:
- ✅ See orders needing fulfillment
- ✅ Track shipping performance
- ✅ Identify delayed orders
- ✅ Prioritize rush orders

**Example**:
```
┌─────────────────────────────────────┐
│ FULFILLMENT FLOW                    │
├─────────────────────────────────────┤
│ Orders to Fulfill: 8                │
│ Shipped Today: 15                   │
│ Avg Fulfillment Time: 1.2 days ↓    │
│                                     │
│ URGENT:                             │
│ • Order #5678 (Rush - race wknd) 🔴 │
│ • Order #5679 (2 days old) 🟡       │
│                                     │
│ READY TO SHIP:                      │
│ • 3 orders packed, awaiting pickup  │
│                                     │
│ [Fulfill Orders] [Print Labels]     │
└─────────────────────────────────────┘
```

**Hot Rod AN Use Case**: Prioritize rush orders for customers racing this weekend. Track fulfillment performance for race season.

---

## 🎓 Using the Dashboard (Day-to-Day)

### Daily Workflow

**Morning Routine** (5 minutes):
```
1. Open Shopify admin
2. Click: Apps > HotDash
3. Quick scan of all 5 tiles:
   • CX Pulse: Any urgent customer issues?
   • Sales Pulse: How's revenue tracking today?
   • SEO Pulse: Any traffic spikes/dips?
   • Inventory Watch: Any low stock alerts?
   • Fulfillment Flow: Orders to fulfill today?
4. Click into tiles with alerts
5. Take action as needed
```

**Throughout the Day** (As Needed):
```
• New customer inquiry → Check CX Pulse
• Check sales progress → Sales Pulse
• Reorder inventory → Inventory Watch
• Ship orders → Fulfillment Flow
```

**Weekly Review** (15 minutes):
```
• Sales trends: Week over week comparison
• CX metrics: Response times, CSAT
• SEO performance: Traffic sources, rankings
• Inventory patterns: Best sellers, slow movers
• Fulfillment efficiency: Avg time, delays
```

---

## 🤖 AI-Assisted Approvals

**What Is AI Assistance?**

HotDash uses AI to suggest actions based on your data and playbooks. You review and approve before anything happens.

**Example: Customer Inquiry**
```
Customer asks: "What size AN fitting for 3/8" hose?"

AI suggests response:
"Hi John,

For a 3/8" fuel hose, you'll need AN-6 fittings.
That's perfect for your 350 HP small block.

Would you like me to help you select the right
adapters for your carburetor and fuel pump?

Best,
Hot Rod AN Support"

Your options:
[✓ APPROVE] [✏ MODIFY] [✗ REJECT]
```

**Approval Workflow**:
1. **AI Drafts** → Appears in approval queue
2. **You Review** → Check accuracy, tone, helpfulness
3. **You Decide**:
   - ✅ **APPROVE** → Sends to customer immediately
   - ✏️ **MODIFY** → Edit response, then send
   - ❌ **REJECT** → Don't send, handle manually

**Benefits**:
- ⚡ Faster response times (AI drafts instantly)
- ✅ Quality control (you approve everything)
- 📚 Consistent with playbooks (AI references your docs)
- 🎯 Reduce workload (handle 2X more tickets)

---

## 📱 Mobile Access

**Access HotDash on Mobile**:
```
1. Open Shopify mobile app
2. Tap: Apps
3. Tap: HotDash
4. Dashboard loads (optimized for mobile)
```

**Mobile Features**:
- ✅ View all 5 tiles
- ✅ See key metrics
- ✅ Approve AI responses
- ✅ Quick actions (fulfill orders, reply to customers)

**Best For**:
- Quick checks while away from desk
- Approve urgent AI responses
- Monitor sales/traffic in real-time

---

## 🔔 Notifications

**Get Notified When**:
- 🔴 Urgent customer issue (CX Pulse)
- 🟡 Low stock alert (Inventory Watch)
- 🔵 New AI response to approve (CX Pulse)
- 🟢 Daily summary (performance recap)

**Configure Notifications**:
```
1. HotDash dashboard → Settings
2. Notifications
3. Choose:
   • Email notifications (immediate, daily digest)
   • Push notifications (mobile app)
   • Slack integration (coming soon)
4. Save preferences
```

---

## 💡 Tips for Success

### Getting the Most from HotDash

**1. Check Daily** (5 minutes)
- Make HotDash your morning routine
- Quick scan of all 5 tiles
- Action only what needs attention

**2. Trust AI, But Verify**
- AI suggestions are usually accurate
- Always review before approving
- Modify tone/details as needed

**3. Use for Decisions**
- Low stock? Reorder before stockout
- Traffic spike? Investigate why
- Sales dip? Check inventory/marketing

**4. Track Trends**
- Compare week over week
- Identify patterns (race season, holidays)
- Plan ahead based on data

**5. Train Your Team**
- Share access with operators
- Define approval criteria
- Use approval queue efficiently

---

## 🆘 Common Questions

### Q: How often does data refresh?

**A**: Real-time to every 15 minutes, depending on tile:
- **CX Pulse**: Real-time (new inquiries appear instantly)
- **Sales Pulse**: Every 15 minutes
- **SEO Pulse**: Every hour (Google data)
- **Inventory Watch**: Every 15 minutes
- **Fulfillment Flow**: Real-time

### Q: Can multiple people use HotDash?

**A**: Yes! Share access with your team:
- CEO: Full access, view all tiles
- Operators: CX Pulse access, approval queue
- Warehouse: Fulfillment Flow access
- Marketing: Sales + SEO Pulse access

**Set Permissions**: Settings → Team → Add Users

### Q: Does AI send responses automatically?

**A**: No, never. All AI responses require human approval. You review and approve before anything sends to customers.

### Q: What if I see wrong data?

**A**: First, refresh browser (Ctrl+Shift+R). If still wrong, see **Troubleshooting Guide** (docs/support/shopify_app_troubleshooting.md).

### Q: Can I export data?

**A**: Yes, each tile has an "Export" button for CSV/PDF reports.

### Q: Is my data secure?

**A**: Yes. HotDash uses read-only Shopify API access. We don't store customer payment info. All data is encrypted in transit and at rest.

---

## 📚 Next Steps

**You're Ready to Use HotDash!**

**Recommended Next**:
1. ✅ **Explore Each Tile** (10 minutes) — Click into each tile, see detailed views
2. ✅ **Approve First AI Response** (5 minutes) — Try the approval workflow
3. ✅ **Set Up Notifications** (2 minutes) — Get alerts for urgent items
4. ✅ **Read Operator Quick Start** (5 minutes) — If you have a support team

**Additional Resources**:
- **Operator Quick Start**: `docs/support/operator_quick_start.md`
- **Troubleshooting Guide**: `docs/support/shopify_app_troubleshooting.md`
- **Hot Rod AN Specific Guide**: `docs/support/hot_rod_an_operator_guide.md`
- **Training Checklist**: `docs/support/operator_training_checklist.md`

---

## 💬 Need Help?

**Support Options**:
- **📧 Email**: support@hotdash.com
- **💬 Chat**: In-app chat (bottom right of dashboard)
- **📖 Docs**: Full documentation at docs.hotdash.com
- **🎥 Videos**: Video tutorials coming soon

**Response Time**: <2 hours during business hours (8am-6pm EST)

---

**Welcome to HotDash! 🔥 Let's save you 10 hours a week. 🚀**

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Review Frequency**: Monthly  
**Next Review**: November 12, 2025

**Questions or feedback?** Email support@hotdash.com

