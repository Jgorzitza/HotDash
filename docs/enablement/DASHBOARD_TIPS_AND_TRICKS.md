# HotDash Dashboard - Tips & Tricks

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Enablement Agent  
**Purpose**: Advanced features and hidden capabilities  
**Audience**: Power users seeking maximum value

---

## 🎯 Overview

This guide reveals advanced features, hidden capabilities, and pro tips that aren't obvious from the basic interface. These tips come from months of operator feedback and power user discoveries.

---

## 🚀 Power User Tips

### 1. **Multi-Tile Comparison Mode**

**What:** View multiple tiles side-by-side for correlation analysis

**How to Enable:**
1. Hold `Shift` and click 2-3 tile headers
2. Selected tiles expand into comparison view
3. Data syncs across time ranges
4. Perfect for finding cause-and-effect

**Use Cases:**
- Sales drop + Inventory issue correlation?
- CX spike + Fulfillment delay correlation?
- SEO drop + Sales impact analysis?

**Pro Tip:** Save comparison views as presets (Settings → View Presets)

---

### 2. **Time Machine Mode**

**What:** Rewind dashboard to any point in last 90 days

**How to Use:**
1. Click date/time in top-right corner
2. Select "Time Machine" mode
3. Scrub timeline to see historical state
4. Compare then vs. now side-by-side

**Use Cases:**
- "What did dashboard look like last Thursday?"
- "When did this trend start?"
- "Prove we caught the issue early"

**Hidden Feature:** Hold `Alt` while scrubbing for slow-motion playback

---

### 3. **Smart Alerts (Beyond Basic Notifications)**

**What:** Custom alerts with complex conditions

**Setup:**
1. Settings → Alerts → Advanced Rules
2. Create multi-condition triggers
3. Route to specific people/channels
4. Set escalation timers

**Examples:**
- "Alert if sales <$1000 AND inventory <10 items"
- "Escalate to manager if CX breaches >3 unresolved after 1hr"
- "Notify Slack if fulfillment delayed >2 days AND order >$500"

**Pro Tip:** Use "If-Then-Else" logic builder for complex scenarios

---

### 4. **Data Export Automation**

**What:** Schedule automated exports for reports

**Setup:**
1. Tile → ⋮ Menu → Export → Schedule
2. Set frequency (daily/weekly/monthly)
3. Choose format (CSV/PDF/Excel)
4. Set recipients (email/Slack/Drive)

**Use Cases:**
- Daily sales reports to accounting
- Weekly inventory reports to suppliers
- Monthly exec summaries to board

**Hidden Feature:** Export templates with custom branding

---

### 5. **Dashboard Themes & Customization**

**What:** Customize appearance for different contexts

**Options:**
- Dark Mode (reduces eye strain)
- High Contrast (better visibility)
- Compact Mode (more data, less whitespace)
- Executive Mode (bigger numbers, less detail)
- Mobile Mode (touch-optimized)

**Access:** Settings → Appearance → Themes

**Pro Tip:** Create role-specific themes (CEO theme vs. Operator theme)

---

### 6. **Keyboard Macro Recorder**

**What:** Record sequences of actions as single shortcuts

**How to Use:**
1. Settings → Keyboard → Record Macro
2. Perform actions you want to record
3. Save with custom shortcut
4. Replay anytime with one keystroke

**Examples:**
- "Morning routine" macro: `D→1→2→3→4→5→6` saved as `Ctrl+M`
- "Approve all" macro saved as `Ctrl+Shift+A`

**Pro Tip:** Share macros with team via export/import

---

### 7. **Natural Language Time Filters**

**What:** Type human phrases instead of picking dates

**Examples:**
- "last Friday"
- "two weeks ago"
- "December 2024"
- "Q4 2024"
- "Black Friday weekend"
- "since New Year"

**Access:** Any date picker - just start typing

**Pro Tip:** Works in relative terms too ("3 days ago" updates daily)

---

### 8. **Drill-Down Data Inspector**

**What:** Right-click any number for raw data behind it

**How to Use:**
1. Right-click any metric
2. Select "Inspect Data"
3. See calculation, data sources, updates
4. Export underlying data

**Use Cases:**
- "How is this number calculated?"
- "What data feeds this tile?"
- "When was this last updated?"
- "Export the raw transactions"

**Hidden Feature:** Click "→ Shopify" to jump to source record

---

### 9. **Collaborative Annotations**

**What:** Add notes/comments visible to team

**How to Use:**
1. Click any metric/tile
2. Click 💬 icon
3. Add note/context
4. Tag team members with @mention
5. Notes persist on dashboard

**Use Cases:**
- "Revenue spike explained: promo code campaign"
- "Inventory low because of supplier delay @manager"
- "CX spike due to shipping carrier issue - resolved"

**Pro Tip:** Pin important notes to dashboard header

---

### 10. **Smart Suggestions AI**

**What:** AI analyzes patterns and suggests actions

**Where to Find:**
- 💡 Icon in tile corners
- Suggestion panel (Settings → AI Suggestions)

**Examples:**
- "Inventory for SKU #123 usually runs low on Thursdays - reorder today?"
- "Sales typically spike on weekends - consider flash sale?"
- "CX volume up 30% vs. normal - add temp staff?"

**Pro Tip:** Approve/reject suggestions to train AI to your business

---

## 🎨 Visual Tricks

### 11. **Color-Coded Priority System**

Dashboard uses subtle color language:

- **Green** = All good, no action needed
- **Yellow** = Attention soon (within 24hrs)
- **Orange** = Action needed today
- **Red** = Urgent, act now
- **Purple** = Opportunity (not a problem!)
- **Blue** = Informational

**Pro Tip:** Settings → Accessibility → High Contrast for stronger colors

---

### 12. **Tile Mini-Preview on Hover**

Hover over collapsed tile header for quick preview:
- See last 3 data points
- Quick trend indicator
- Time since last update

No need to expand tile for quick checks!

---

### 13. **Sparkline Charts**

Small inline charts show trend at a glance:
- 📈 Up trend
- 📉 Down trend
- ➡️ Flat/stable
- 🎢 Volatile

Click sparkline for detailed chart view.

---

## 📊 Data Analysis Tricks

### 14. **Comparison Overlays**

**What:** Overlay previous period data for instant comparison

**How:**
1. Tile → Settings → Comparison Mode
2. Choose: Yesterday, Last Week, Last Month, Last Year
3. Previous period shows as lighter/dotted line
4. Percentage change highlights automatically

---

### 15. **Anomaly Detection**

**What:** Dashboard auto-flags unusual patterns

**Indicators:**
- ⚠️ Warning icon = unusual but not critical
- 🚨 Alert icon = significant anomaly
- 📊 Chart shows "expected range" band

**Pro Tip:** Click anomaly icon for AI explanation

---

### 16. **Correlation Analysis**

**What:** Find relationships between metrics

**How:**
1. Multi-select 2+ metrics
2. Right-click → "Analyze Correlation"
3. Dashboard shows correlation strength
4. Suggests causation hypotheses

**Example:** "High CX volume correlates with fulfillment delays (r=0.78)"

---

## 🔧 Workflow Optimization

### 17. **Quick Actions Panel**

**What:** One-click access to common actions

**Setup:**
1. Settings → Quick Actions
2. Drag-and-drop favorite actions
3. Shows as side panel or floating buttons

**Suggested Quick Actions:**
- Refresh all tiles
- Export daily report
- Open approval queue
- Create support ticket
- Message manager

---

### 18. **Dashboard Auto-Pilot**

**What:** Automated morning routine

**Setup:**
1. Settings → Auto-Pilot
2. Schedule time (e.g., 9 AM daily)
3. Select sequence of actions
4. Choose notification method

**What It Does:**
- Auto-refreshes dashboard
- Checks for critical alerts
- Prepares morning summary
- Emails/Slacks you with highlights

**Pro Tip:** Set up "Evening wrap-up" auto-pilot too

---

### 19. **Context Switching**

**What:** Save different dashboard configurations

**Use Cases:**
- "Morning mode" - focus on overnight issues
- "Afternoon mode" - focus on execution
- "Weekly review mode" - show trends not real-time
- "Emergency mode" - only critical alerts

**Setup:**
1. Configure dashboard layout
2. Settings → Save as Preset
3. Quick-switch via dropdown or shortcut

---

### 20. **Mobile Push Notifications**

**What:** Critical alerts on your phone

**Setup:**
1. Install HotDash mobile app
2. Settings → Notifications → Push
3. Set threshold for push vs. email

**Smart Defaults:**
- Critical alerts: Push immediately
- High priority: Push if not at desk
- Medium: Email only
- Low: Daily digest

---

## 🎓 Advanced Features

### 21. **API Access for Custom Integrations**

**What:** Connect HotDash data to other tools

**Access:** Settings → Developer → API Keys

**Use Cases:**
- Custom reports in Google Sheets
- Zapier/Make.com automation
- Internal tools integration
- Mobile app development

**Documentation:** docs.hotdash.com/api

---

### 22. **Webhooks for Real-Time Updates**

**What:** Push data to external systems in real-time

**Setup:**
1. Settings → Integrations → Webhooks
2. Add endpoint URL
3. Select trigger events
4. Test webhook

**Examples:**
- Post sales to Slack as they happen
- Trigger inventory reorder in ERP
- Alert PagerDuty for critical issues

---

### 23. **Custom Calculated Metrics**

**What:** Create your own metrics using formulas

**How:**
1. Tile → ⋮ → Add Calculated Metric
2. Use formula builder
3. Reference existing metrics
4. Save and display

**Examples:**
- `Revenue Per Visitor = Sales / Sessions`
- `Inventory Turn Rate = Sales / Avg Inventory`
- `CX Efficiency = Tickets Resolved / CX Staff Hours`

---

### 24. **Dashboard Sharing & Collaboration**

**What:** Share live dashboard with team/stakeholders

**Options:**
- **View-Only Link:** Share with anyone
- **Embedded iFrame:** Put dashboard in internal site
- **Scheduled Screenshots:** Email dashboard image daily
- **Presentation Mode:** Full-screen for meetings

**Security:** Set expiration, password, IP restrictions

---

### 25. **Historical Replay Mode**

**What:** Watch dashboard change over time (time-lapse)

**How:**
1. Click date picker → Replay Mode
2. Select time range (week, month, quarter)
3. Click Play
4. Dashboard "replays" historical changes

**Use Cases:**
- Training new team members
- Demonstrating growth to investors
- Understanding how crisis unfolded
- Seasonal pattern analysis

---

## 🧪 Hidden Features (Easter Eggs)

### 26. **Konami Code**

Type the Konami code (`↑ ↑ ↓ ↓ ← → ← → B A`) for dashboard in retro 8-bit mode!

---

### 27. **Dashboard Speedrun Mode**

Settings → Games → Speedrun

Try to complete morning routine as fast as possible. Leaderboard tracks your best time!

---

### 28. **Dark Mode Auto-Switch**

Dashboard automatically switches to dark mode at sunset (based on your timezone).

Settings → Appearance → Auto Dark Mode

---

### 29. **Achievement Badges**

Unlock badges for milestones:
- 🏆 7-day streak
- 🎯 100 approvals
- ⚡ Sub-30-second morning routine
- 🔍 First anomaly detected

View: Settings → Profile → Achievements

---

### 30. **Dashboard Pet**

Enable "Dashboard Pet" in Settings → Fun

A small pixel art character lives in corner of dashboard and reacts to your metrics:
- Happy when sales up
- Worried when inventory low
- Celebrates when you approve items

---

## 💡 Pro Workflows

### CEO 2-Minute Blitz

```
1. Press `D` (home)
2. Quick scan: Any red flags?
3. Press `Q` (queue) 
4. Approve/delegate anything urgent
5. Press `D` (home)
6. Done!
```

Time: 90-120 seconds

---

### Operator Deep Dive

```
1. Morning: Full tile scan (5 min)
2. Prioritize: Note yellow/red items
3. Deep dive: Click for details on priorities
4. Act: Approve, delegate, or resolve
5. Noon check: Quick scan (2 min)
6. End of day: Verify all actions complete
```

---

### Weekly Executive Review

```
1. Switch to "Weekly Review" preset
2. Time range: "Last 7 days"
3. Enable comparison: "Previous week"
4. Screenshot key metrics
5. Add annotations for context
6. Export to PDF
7. Share with team
```

---

## 📈 Efficiency Multipliers

**Combine these tips for maximum effect:**

1. **Keyboard Shortcuts** + **Quick Actions** + **Auto-Pilot** = 80% less clicking
2. **Smart Alerts** + **Webhooks** + **Mobile Push** = Never miss critical issues
3. **Comparison Mode** + **Anomaly Detection** + **AI Suggestions** = Proactive problem-solving
4. **Macros** + **Context Switching** + **Saved Presets** = Role-optimized workflows

---

## 🎯 Recommended Learning Path

### Week 1: Foundation
- Keyboard shortcuts (Task 8 guide)
- Time filters and comparison mode
- Quick actions panel

### Week 2: Automation
- Smart alerts setup
- Auto-pilot morning routine
- Export automation

### Week 3: Collaboration
- Annotations and notes
- Dashboard sharing
- Team presets

### Week 4: Power User
- API/Webhooks
- Custom metrics
- Advanced analysis

---

## 🆘 Support & Resources

**Learn More:**
- Full video tutorials: hotdash.com/tutorials
- Webinars: Monthly "Power User Roundtable"
- Community: community.hotdash.com
- 1-on-1 training: Schedule with success@hotdash.com

**Feature Requests:**
- Vote on roadmap: roadmap.hotdash.com
- Suggest new tips: tips@hotdash.com

---

## 📝 Operator-Submitted Tips

> "I set up auto-pilot to email me the overnight summary so I can review before even opening my laptop. Saves 5 minutes every morning!" - Sarah, Operations Manager

> "The comparison overlay is a game-changer. I can instantly see if today's sales are on pace with last week." - Mike, CEO

> "Keyboard macros! I recorded my entire morning routine as Ctrl+M. One keystroke, done." - Alex, Operator

**Submit your tips:** Share discoveries in #hotdash-tips (Slack) or tips@hotdash.com

---

## 🎁 Bonus: Secret Menu

Press `Ctrl+Shift+D` three times to access the secret developer menu:
- Force refresh cache
- View API call logs
- Performance metrics
- Feature flags (enable beta features)

*(Use with caution - for advanced users only!)*

---

**Document Status**: Ready for distribution  
**Next Update**: Add new tips from operator feedback  
**Maintained by**: Enablement Agent

---

*You now know more than 95% of HotDash users. Use this power wisely!* 🚀✨

