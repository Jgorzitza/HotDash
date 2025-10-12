# HotDash Dashboard - Operator Best Practices

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Enablement Agent  
**Purpose**: Efficiency tips and best practices for operators  
**Audience**: Daily HotDash users (operators, managers, support team)

---

## 🎯 Core Principles

### 1. **Exceptions Over Everything**
Focus on red flags, not green lights. If a tile shows "No issues" or "All on track," move on quickly. Your time is valuable - spend it on problems, not confirmations.

### 2. **Morning Routine, Afternoon Spot-Check**
Morning (9 AM): 3-5 minute full dashboard scan.  
Afternoon (2-3 PM): 2-minute spot-check for new issues.

Don't obsessively refresh. The dashboard updates automatically.

### 3. **Trust But Verify**
The dashboard is accurate, but context matters. If something looks off, dig in. Click for details, check Shopify/Chatwoot directly, talk to your team.

### 4. **Communicate Up and Across**
See something critical? Don't fix it silently. Tell your manager, Slack the team. Visibility prevents duplicated effort and ensures escalations happen.

### 5. **Continuous Improvement**
Track what works for you. Share tips with the team. Suggest features. HotDash gets better when you tell us what helps.

---

## ⚡ Dashboard Efficiency Tips

### Morning Routine (5 Minutes)

**9:00 AM - Before you dive into tasks**

#### 1️⃣ Sales Pulse (45 seconds)
- **Quick scan**: Revenue number - on track?
- **Top SKUs**: Same as usual, or new trends?
- **Fulfillment**: Any blockers? (If empty, move on)

**✅ Green?** Move on.  
**🚨 Red?** Note it, check back at noon to see if resolved.

---

#### 2️⃣ CX Escalations (45 seconds)
- **Count SLA breaches**: 0 = perfect, 1-2 = review, 3+ = escalate to manager
- **Click "Review"** only if YOU can resolve (don't just read for curiosity)

**✅ Green?** Move on.  
**🚨 Red?** Assign to operators or escalate immediately.

---

#### 3️⃣ Fulfillment Health (30 seconds)
- **Any orders?** Check age - <24h = monitor, >24h = investigate
- **If multiple orders stuck**, likely warehouse issue (alert fulfillment lead)

**✅ Green?** Move on.  
**🚨 Red?** Prioritize Express/Next-day, then high-value orders.

---

#### 4️⃣ Inventory Heatmap (45 seconds)
- **Check days of cover**: <7 days = reorder, <3 days = URGENT
- **Best-sellers first**: Prioritize top 3 SKUs from Sales Pulse tile

**✅ Green?** Move on.  
**🚨 Red?** Place reorder or notify purchasing team NOW.

---

#### 5️⃣ SEO Content (30 seconds)
- **Any "attention" flags?** Click to see what page dropped
- **If no flags**, quick glance at WoW %'s (all positive = good)

**✅ Green?** Move on.  
**🚨 Red?** Escalate to marketing/SEO team with page URL.

---

#### 6️⃣ Ops Metrics (45 seconds)
- **Activation rate**: >80% = good, <70% = review onboarding
- **SLA median**: <15 min = good, >20 min = team stretched

**✅ Green?** Move on.  
**🚨 Red?** Discuss with manager in standup.

---

**Total time: 5 minutes. Now you know exactly where to focus your day.**

---

### Afternoon Spot-Check (2 Minutes)

**2:00 PM - Mid-day pulse**

- **Sales Pulse**: Revenue still on track? Any new fulfillment blockers?
- **CX Escalations**: New breaches since morning?
- **Fulfillment**: Morning issues resolved?

**That's it.** If nothing's new, you're done in 90 seconds.

---

## 🔥 Advanced Efficiency Tips

### Tip 1: Keyboard Shortcuts
Master these shortcuts to move 2-3x faster:

| Shortcut | Action | Use Case |
|----------|--------|----------|
| `Shift + S` | Focus Sales Pulse | Jump directly to tile |
| `Shift + C` | Focus CX Escalations | Jump directly to tile |
| `Shift + F` | Focus Fulfillment | Jump directly to tile |
| `Shift + I` | Focus Inventory | Jump directly to tile |
| `Shift + E` | Focus SEO | Jump directly to tile |
| `Shift + O` | Focus Ops Metrics | Jump directly to tile |
| `Enter` | Open details | View more info |
| `Esc` | Close modal | Quick exit |
| `R` | Refresh tile | Get latest data |
| `T` | Time window selector | Change date range |

**Practice**: Use only keyboard for one full scan. You'll be surprised how fast you get.

---

### Tip 2: Time Window Optimization
Don't always use "Today" view. Adapt to your needs:

| Time Window | Best For | Example Use Case |
|------------|---------|------------------|
| **Today** | Morning routine, daily operations | "What needs attention NOW?" |
| **Yesterday** | Post-mortem, identifying issues | "Why did revenue miss target yesterday?" |
| **Last 7 Days** | Weekly review, trend spotting | "Are fulfillment issues getting better or worse?" |
| **Last 30 Days** | Monthly reporting, strategic planning | "Which SKUs are trending up this month?" |

**Power move**: Check "Today" in morning, "Last 7 Days" on Monday for weekly review.

---

### Tip 3: Mobile + Desktop Strategy
**Desktop (office)**: Full scans with deep dives.  
**Mobile (commute, breaks)**: Quick spot-checks for critical alerts.

**Mobile-optimized tiles**:
- CX Escalations (respond to breaches)
- Fulfillment Health (ping warehouse)
- Inventory (approve emergency reorders)

**Desktop-optimized tiles**:
- Sales Pulse (detailed order analysis)
- SEO Content (investigate traffic drops)
- Ops Metrics (team performance reviews)

**Pro tip**: Set mobile push notifications for critical thresholds (e.g., "Inventory <2 days").

---

### Tip 4: Tile Prioritization (By Role)

**If you're a Support Manager**:
1. **CX Escalations** (most important)
2. **Ops Metrics** (team performance)
3. **Sales Pulse** (context for customer issues)
4. Fulfillment, Inventory, SEO (quick glance)

**If you're an Operations Manager**:
1. **Fulfillment Health** (most important)
2. **Inventory Heatmap** (stockouts = sales loss)
3. **Sales Pulse** (revenue tracking)
4. CX, SEO, Ops (quick glance)

**If you're a CEO/GM**:
- **All tiles equally** (5-minute full scan, 2x/day)
- Focus on exceptions (red flags)

---

### Tip 5: One-Click Actions
Where possible, take action FROM the dashboard:

| Tile | One-Click Actions Available |
|------|---------------------------|
| Sales Pulse | "View details" → See all orders |
| CX Escalations | "Review" → Open conversation → Reply inline |
| Fulfillment | Click order → Opens Shopify order (new tab) |
| Inventory | "Reorder" → Pre-fills PO form |
| SEO | Click page → Opens page + GSC data |
| Ops Metrics | "View trends" → Drilldown report |

**Don't**: Copy order #, open Shopify, search, find order.  
**Do**: Click order # from dashboard → Opens directly.

**Saves**: 30-60 seconds per action × 20 actions/day = 10-20 min/day saved.

---

## 🏆 Pro-Level Workflows

### Workflow 1: Morning Triage
**Goal**: Identify and prioritize all issues in under 5 minutes.

1. **Scan all 6 tiles** (5 min) → Create mental/written list of issues
2. **Prioritize issues**:
   - **P0 (Urgent)**: SLA breaches, fulfillment >48h, inventory <2 days
   - **P1 (Important)**: Revenue misses, traffic drops >20%, inventory <7 days
   - **P2 (Monitor)**: Minor WoW declines, single stuck order
3. **Tackle P0 first**, delegate P1, note P2 for later

**Example triage list**:
```
P0:
- [ ] 3 SLA breaches (assign to operators)
- [ ] Red Widget inventory: 2 days left (reorder NOW)

P1:
- [ ] Order #1234 stuck 30h (check with warehouse)
- [ ] /products/blue-gadget traffic -18% (alert SEO team)

P2:
- [ ] Activation rate 72% (monitor through week)
```

---

### Workflow 2: Weekly Review
**Goal**: Spot trends and prevent future issues.

**Every Monday at 9 AM**:
1. **Change all tiles to "Last 7 Days"** view
2. **Sales Pulse**: Which SKUs are trending up/down? Adjust marketing.
3. **CX Escalations**: What were common themes? Train operators.
4. **Fulfillment**: How many orders delayed? Root cause?
5. **Inventory**: Which products had alerts? Adjust reorder triggers.
6. **SEO**: Which pages grew/declined? Optimize top performers.
7. **Ops Metrics**: Team improving or declining? Coaching needed?

**Deliverable**: Share 3 key insights with team in standup or Slack.

---

### Workflow 3: Crisis Mode
**Goal**: Handle high-priority issues without panic.

**When**: Multiple tiles show red flags simultaneously (site-wide issue).

**Process**:
1. **Screenshot all tiles** (30 sec) → Visual record for later
2. **Identify root cause** (2 min):
   - Sales + Fulfillment + Inventory down? → Warehouse issue
   - CX + Ops Metrics spiking? → Support overload
   - SEO + Sales down? → Site outage or algo penalty
3. **Escalate to manager** with screenshots + hypothesis (1 min)
4. **Monitor every 30 min** until resolved
5. **Post-mortem after resolution** (document what happened, how to prevent)

**Don't**: Fix issues one-by-one in isolation. Look for common root cause.

---

## 💬 Communication Best Practices

### When to Alert Your Manager

**Immediate Slack/Call (Don't Wait)**:
- 5+ SLA breaches in CX Escalations
- Fulfillment issues affecting >10 orders or >$5K revenue
- Best-selling SKU <2 days inventory
- Site-wide traffic drop >30%
- Ops Metrics show team performance in critical range

**Daily Standup (Can Wait 2-4 Hours)**:
- 1-3 SLA breaches
- 1-2 orders stuck >24h
- Inventory alerts for non-critical SKUs
- Minor traffic drops (10-15%)

**Weekly Review (Can Wait Until Monday)**:
- Trends over 7 days (e.g., activation rate slowly declining)
- Process improvement suggestions
- Feature requests for HotDash

---

### How to Write Effective Alerts

**Bad**: "Sales Pulse looks weird."  
**Good**: "Sales Pulse: Revenue down 25% vs. yesterday ($10K vs $13K). Top SKU changed from Red Widget to Blue Gadget. No fulfillment blockers."

**Template**:
```
[Tile Name]: [Issue Summary]
- Metric: [Specific number/change]
- Context: [Why it matters]
- Action Taken: [What you did, if anything]
- Need: [What you need from manager]
```

**Example**:
```
Inventory Heatmap: Red Widget critically low
- Current: 8 units, 2 days of cover
- Context: Our #1 SKU, $15K revenue last week
- Action Taken: Reached out to supplier (awaiting response)
- Need: Approval to expedite shipment ($200 extra)
```

---

### Slack Channel Strategy

**Where to post what**:
- **#hotdash-alerts**: Urgent issues requiring immediate action (P0)
- **#hotdash-discuss**: Questions, insights, non-urgent issues (P1-P2)
- **#hotdash-feedback**: Feature requests, bugs, UX suggestions
- **DM to Manager**: Sensitive issues (e.g., team performance concerns)

**Don't**: Post everything in #general. Use dedicated channels.

---

## 🛠️ Tool Integration Tips

### HotDash + Shopify
- **Click order numbers** in HotDash → Opens Shopify (new tab)
- **Use "View in Shopify"** button on Sales Pulse modal
- **Sync is 5 min**: If you just fulfilled an order, wait 5 min to see tile update

### HotDash + Chatwoot
- **Click "Review"** in CX Escalations → Opens conversation modal
- **Reply directly** from modal (no need to open Chatwoot)
- **Sync is 2 min**: If you just replied in Chatwoot, wait 2 min to see SLA clear

### HotDash + Google Analytics
- **Click page URL** in SEO tile → Opens page + GSC report (side-by-side)
- **Data is delayed 24-48h**: Don't expect today's traffic to show yet
- **Use "Last 7 Days"** view for more stable SEO insights

### HotDash + Slack (Future Integration)
- **Coming soon**: Slack notifications for critical alerts
- **You'll be able to**: Respond to CX escalations from Slack
- **Custom alerts**: Set thresholds for your role (e.g., inventory <5 days → Slack me)

---

## 📊 Metrics That Matter (Don't Obsess Over Others)

### Focus On:
- **Revenue trajectory** (Sales Pulse) - Is it growing?
- **SLA breach count** (CX Escalations) - Keeping it low?
- **Orders >24h stuck** (Fulfillment) - Clearing fast?
- **Inventory <7 days** (Inventory) - Reordering proactively?
- **Pages with "attention"** (SEO) - Fixing drops?
- **Activation rate + SLA median** (Ops) - Team improving?

### Don't Obsess Over:
- **Exact revenue number** - Focus on trend, not single day
- **Every WoW %** - Small fluctuations are normal
- **P90 if median is good** - Outliers happen
- **Sample sizes <30** - Too small to be meaningful

**Rule of thumb**: If you're spending >10 seconds staring at a metric without taking action, move on.

---

## 🚫 Common Pitfalls to Avoid

### Pitfall 1: Analysis Paralysis
**Problem**: Spending 10 minutes analyzing why Revenue is $100 below target.

**Solution**: Set decision thresholds. <10% variance? Monitor. >10%? Investigate. Don't debate 2-5% variances.

---

### Pitfall 2: Reacting to Every Fluctuation
**Problem**: Panicking when one page's traffic drops 12% on a Tuesday.

**Solution**: Look for 3-day trends, not single-day spikes. Most single-day changes are noise.

---

### Pitfall 3: Not Using Keyboard Shortcuts
**Problem**: Clicking around with mouse, taking 8 minutes for a 5-minute scan.

**Solution**: Force yourself to use shortcuts for 1 week. By week 2, it's muscle memory.

---

### Pitfall 4: Only Checking in Crisis
**Problem**: Ignoring dashboard until something breaks, then scrambling.

**Solution**: Daily 5-minute routine prevents fires. Consistency > intensity.

---

### Pitfall 5: Siloing Information
**Problem**: You see a critical issue, fix it, don't tell anyone. Manager finds out later.

**Solution**: Communication is part of the job. Slack critical issues immediately.

---

## 🎓 Training Resources

### Week 1: Foundation
- [ ] Read CEO Quick Start Guide (10 min)
- [ ] Watch Video Walkthrough (5 min)
- [ ] Complete first morning routine (5 min)
- [ ] Join #hotdash-discuss on Slack
- [ ] Ask 1 question to get comfortable

### Week 2: Proficiency
- [ ] Read Tile-by-Tile Reference for your top 3 tiles (20 min)
- [ ] Practice keyboard shortcuts (5 min/day)
- [ ] Set up mobile access
- [ ] Share 1 tip with team

### Week 3: Mastery
- [ ] Read full Tile-by-Tile Reference (30 min)
- [ ] Complete weekly review workflow
- [ ] Customize alert thresholds
- [ ] Mentor a new operator

---

## ✅ Self-Assessment Checklist

**Beginner (Week 1)**:
- [ ] I can log in and view all 6 tiles
- [ ] I understand what each tile shows
- [ ] I can identify when something is "red" vs "green"
- [ ] I complete morning routine daily

**Intermediate (Week 2-4)**:
- [ ] I use keyboard shortcuts regularly
- [ ] I know when to escalate vs. handle myself
- [ ] I complete morning routine in <5 min
- [ ] I communicate issues effectively to my manager

**Advanced (Month 2+)**:
- [ ] I spot trends before they become problems
- [ ] I teach new operators how to use HotDash
- [ ] I suggest process improvements based on dashboard insights
- [ ] I've customized HotDash to match my workflow

**Expert (Month 3+)**:
- [ ] HotDash is muscle memory - I don't think about it
- [ ] I can triage a crisis in under 2 minutes
- [ ] I proactively share insights with the team weekly
- [ ] I've contributed ideas that improved HotDash for everyone

---

## 🏁 Key Takeaways

1. **Morning routine (5 min) + Afternoon spot-check (2 min) = Complete operational awareness**
2. **Focus on exceptions, not confirmations** - Red flags deserve your time, green lights don't
3. **Keyboard shortcuts save 10-20 min/day** - Learn them in Week 1
4. **Communicate up and across** - Critical issues need visibility
5. **Consistency beats intensity** - Daily 5-minute check > Weekly 1-hour deep-dive
6. **Trust but verify** - Dashboard is accurate, but context matters
7. **Continuous improvement** - Track what works, share tips, suggest features

**Remember**: HotDash is a tool, not a task. The goal is to make your job easier, not add work. If something feels inefficient, tell us - we'll fix it.

---

**Document Path**: `docs/enablement/OPERATOR_BEST_PRACTICES.md`  
**Version**: 1.0  
**Last Updated**: October 12, 2025  
**Status**: Ready for operator training ✅

**Questions?** Slack #hotdash-discuss or email enablement@hotdash.com
