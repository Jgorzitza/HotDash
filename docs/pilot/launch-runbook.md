# Hot Rodan Launch Runbook

**Version**: 1.0
**Date**: October 12, 2025
**Customer**: Hot Rodan
**Launch Date**: October 15, 2025
**Owner**: Product Agent
**Purpose**: Step-by-step launch procedures, monitoring, and escalation

---

## Launch Timeline Overview

```
Oct 15 (Mon)  → Setup Day: Onboarding call + Shopify install
Oct 16 (Tue)  → Configuration: Team setup + testing
Oct 17 (Wed)  → Validation: CEO trial run + go/no-go
Oct 18 (Fri)  → LAUNCH: Pilot Week 1 begins
```

---

## Pre-Launch Checklist (Oct 14, Day Before)

### System Verification

**Run Health Checks**:
```bash
cd /home/justin/HotDash/hot-dash

# Check all services
npm run health-check

# Expected output:
# ✅ API: healthy
# ✅ Database: connected
# ✅ Shopify API: authenticated
# ✅ Chatwoot API: connected
# ✅ Dashboard: rendering
```

**Verify Components**:
- [ ] Dashboard tiles load in <2 seconds
- [ ] Shopify data syncing (test with dev store)
- [ ] Approval queue functional
- [ ] Mobile view optimized
- [ ] Error logging working

---

### Hot Rodan Preparation

**Gather Hot Rodan Details**:
- [ ] Shopify store URL: [hot-rodan.myshopify.com]
- [ ] CEO name and email: [Name, email@hotrodan.com]
- [ ] Team members (2-3): [Names, emails]
- [ ] Current pain points documented
- [ ] Success criteria agreed

**Prepare Materials**:
- [ ] Quick start guide printed/sent
- [ ] Onboarding call agenda
- [ ] Demo environment ready
- [ ] Slack channel created (#hot-rodan-pilot)

---

### Internal Team Alignment

**Team Briefing** (Oct 14, 4 PM):
- [ ] Product Agent: Primary contact, runs check-ins
- [ ] Engineer: On-call for setup + bugs
- [ ] Manager: Available for escalations
- [ ] QA: Monitoring error logs

**Backup Plan**:
- [ ] If CEO unavailable Oct 15 → Reschedule to Oct 16
- [ ] If critical bug discovered → Delay launch 1-2 days
- [ ] If Hot Rodan cancels → Document learnings, move on

---

## Day 1: Setup (October 15, Monday)

### 9:00 AM - Final Pre-Call Check

**Run pre-flight checks**:
```bash
# Verify system health
npm run health-check

# Test Shopify OAuth flow
npm run test:shopify-oauth

# Check dashboard loads
curl https://hotdash.app/health
```

**Confirm**:
- [ ] All green lights
- [ ] Demo account works
- [ ] Screen share ready
- [ ] Zoom link sent to CEO

---

### 10:00 AM - Onboarding Call with CEO (45 min)

**Agenda**:

**Introduction (5 min)**:
- Welcome to HotDash!
- Brief overview: "Your command center for running Hot Rodan"
- Today's goal: Get you set up and comfortable

**Shopify Installation (10 min)**:
1. Share screen with CEO
2. Navigate to Hot Rodan Shopify admin
3. Install HotDash app:
   - Go to Apps → Search "HotDash"
   - OR use direct install link: [Install URL]
4. Authorize app (read access to orders, inventory, customers)
5. Redirect to HotDash dashboard

**Data Sync (5 min)**:
- Initial sync starts automatically
- Takes 2-5 minutes for first load
- CEO can see progress bar: "Importing your data..."

**Dashboard Walkthrough (15 min)**:
- Quick tour of each tile (use Quick Start Guide)
- Show CEO their actual data (sales, inventory, etc.)
- Demo morning routine workflow:
  1. Check Sales Pulse
  2. Review Inventory Alerts
  3. Check Ops Pulse
  4. Scan Customer Mood

**CEO Tries It (5 min)**:
- Have CEO navigate dashboard themselves
- Answer questions as they arise
- Note any confusion or friction

**Next Steps (5 min)**:
- Tomorrow: Team onboarding call (Oct 16, 10 AM)
- Your homework: Try morning routine workflow
- How to reach us: Slack #hot-rodan-pilot or email

**Post-Call Actions**:
- [ ] Verify Hot Rodan data synced correctly
- [ ] Send follow-up email with quick start guide
- [ ] Log call notes in `feedback/product.md`
- [ ] Create any tickets for issues discovered

---

### 11:00 AM - Post-Call Verification

**Check Hot Rodan Dashboard**:
```bash
# Query Hot Rodan's data in database
npm run pilot:verify-customer --customer=hot-rodan

# Expected output:
# ✅ Sales data: 150 orders synced
# ✅ Inventory: 250 products synced
# ✅ Support tickets: 45 tickets synced
# ✅ Dashboard rendering correctly
```

**Manual Spot Checks**:
- [ ] Sales Pulse shows accurate revenue
- [ ] Inventory counts match Shopify
- [ ] Support tickets are recent
- [ ] No data showing for wrong store

**If issues found**:
1. Fix immediately (same-day priority)
2. Call CEO if blocking (don't let them discover bugs first)
3. Log issue and resolution

---

### 2:00 PM - Day 1 Summary Email

**Send CEO summary**:

```
Subject: Hot Rodan + HotDash - Day 1 Complete! 🎉

Hi [CEO Name],

Great call this morning! Your dashboard is live and syncing data.

✅ Setup Complete:
- Shopify app installed
- Dashboard syncing your data
- Login: https://hotdash.app

📖 Resources:
- Quick Start Guide (attached)
- Video walkthrough (2 min): [link if available]

🎯 Your Homework:
- Try the morning routine workflow tomorrow
- Check dashboard at least once
- Note anything confusing or broken

📅 Next Steps:
- Tomorrow (Oct 16): Team onboarding call at 10 AM
- We'll add your Operations Manager and Support Lead

Questions? Reply here or Slack me in #hot-rodan-pilot

Best,
[Your Name]
Product Team
```

---

## Day 2: Configuration (October 16, Tuesday)

### 10:00 AM - Team Onboarding Call (30 min)

**Attendees**: CEO + Operations Manager + Support Lead (if applicable)

**Agenda**:

**Welcome Team (5 min)**:
- Introduce HotDash
- CEO shares their experience from Day 1

**Dashboard Tour for Team (10 min)**:
- Focus on their roles:
  - Ops Manager: Inventory Alerts, Order Status
  - Support Lead: Ops Pulse, Approval Queue
- Show how to collaborate with CEO on approvals

**Approval Queue Setup (10 min)**:
- Demo approval workflow:
  1. Request comes in (e.g., refund over $200)
  2. Team prepares recommendation
  3. CEO sees in approval queue
  4. CEO approves/denies quickly
- Set approval thresholds (e.g., refunds >$200, shipping upgrades >$50)

**Access and Logins (5 min)**:
- Send team member login invites
- Verify they can access dashboard
- Set up mobile access

**Post-Call**:
- [ ] Team logins working
- [ ] Approval thresholds configured
- [ ] Slack channel invites sent

---

### 2:00 PM - Data Accuracy Validation

**CEO Homework Check**:
- Did CEO log in today?
- Any feedback from CEO?
- Any data issues reported?

**Run Validation Tests**:
```bash
# Compare HotDash data vs Shopify directly
npm run pilot:validate-data --customer=hot-rodan

# Check:
# - Sales totals match
# - Inventory counts match
# - Support ticket counts match
# - No missing orders
```

**Fix any discrepancies** immediately

---

### 4:00 PM - Configuration Review

**Verify All Settings**:
- [ ] Approval thresholds correct
- [ ] Notification settings (email, Slack)
- [ ] Tile preferences (which tiles to show)
- [ ] Mobile access configured
- [ ] Team access levels set

**Test Approval Queue**:
- [ ] Create test approval request
- [ ] CEO receives notification
- [ ] CEO can approve/deny
- [ ] Action reflects in system

---

## Day 3: Validation (October 17, Wednesday)

### 9:00 AM - CEO Trial Run

**Send CEO Slack message**:
```
Good morning! Today is trial run day.

Your goal: Use the dashboard as if it's your normal routine.

Try:
1. Morning check-in (2 minutes)
2. Review any approvals
3. Check inventory alerts
4. Note anything that feels off

We'll chat at 2 PM to review. Questions? Ping me!
```

**Monitor Usage**:
- [ ] Is CEO logging in?
- [ ] Which tiles are they clicking?
- [ ] Any errors in logs?
- [ ] Response time acceptable?

---

### 2:00 PM - Pre-Launch Review Call (30 min)

**Agenda**:

**Check-In (5 min)**:
- How did today's trial run go?
- Did morning routine workflow feel natural?
- Any confusion or friction?

**Data Validation (5 min)**:
- Walk through dashboard together
- CEO confirms: "These numbers look right"
- Fix any discrepancies spotted

**Feature Review (10 min)**:
- Which tiles are most useful?
- Which tiles are confusing or not useful?
- Any missing features?

**Mobile Check (5 min)**:
- Has CEO tried mobile?
- Is mobile experience acceptable?
- Set up push notifications?

**Go/No-Go Decision (5 min)**:
- CEO: "Are you ready to officially start the pilot on Friday?"
- If YES: Launch Friday (Oct 18)
- If NO: What needs to be fixed first?

**Post-Call**:
- [ ] Log go/no-go decision
- [ ] If issues: Fix by Thursday
- [ ] Send pre-launch email (if GO)

---

### 4:00 PM - Final Pre-Launch Checks (If GO)

**System Verification**:
```bash
# Final health check
npm run health-check

# Load test
npm run load-test --users=5 --duration=10min

# Error log review
npm run logs:errors --since=24h
```

**Confirm**:
- [ ] No critical bugs
- [ ] Performance acceptable (<2s load time)
- [ ] All team members can access
- [ ] Mobile working
- [ ] Approval queue functional

**If any RED FLAGS**:
- Delay launch 1-2 days
- Fix critical issues
- Re-validate before launching

---

### 5:00 PM - Pre-Launch Email (If GO)

**Send to CEO + Team**:

```
Subject: 🚀 Hot Rodan Pilot Launches Friday!

Hi team,

We're ready to launch! Here's what happens next:

📅 Launch Day: Friday, Oct 18
- Pilot officially begins
- Start using dashboard as your primary ops tool
- First weekly check-in: Friday Oct 18 at 3 PM

✅ You're Set Up:
- Dashboard: https://hotdash.app
- Mobile access: Working
- Team logins: Active
- Approval queue: Configured

📖 Quick Reference:
- Morning routine: Check Sales Pulse → Inventory → Ops → Mood (2 min)
- Approvals: Review and approve/deny as they come in
- Questions: Slack #hot-rodan-pilot or email us

🎯 Week 1 Goal:
- Use dashboard daily
- Share feedback (good and bad!)
- Let's prove this saves you time

Let's crush it! 🚀

[Your Name]
Product Team
```

---

## Launch Day: October 18, Friday

### 9:00 AM - Launch Day Monitoring

**Morning Check**:
```bash
# System health
npm run health-check

# Hot Rodan activity
npm run pilot:activity --customer=hot-rodan --date=today

# Error monitoring
npm run logs:errors --live
```

**Watch For**:
- [ ] CEO logging in
- [ ] Team activity
- [ ] Any errors in logs
- [ ] Performance issues

---

### 12:00 PM - Mid-Day Check-In (Slack)

**Post in #hot-rodan-pilot**:
```
How's your first official day with the dashboard going?

Any questions? Issues? Quick wins?

We're monitoring everything and here to help!
```

**Monitor responses**:
- Address questions immediately (<30 min)
- Create tickets for any bugs
- Celebrate any wins shared

---

### 3:00 PM - Week 1 Check-In Call

**Use**: `weekly-checkin-template.md`

**Key Questions**:
1. How was your first week (3 days so far)?
2. Is the dashboard becoming part of your routine?
3. What's working well?
4. What's frustrating?
5. Quick rating (1-10)?

**Deliverable**: Notes logged, action items created

---

### 5:00 PM - Day 1 Summary

**Run Metrics Report**:
```bash
# Generate Day 1 report
npm run pilot:report --customer=hot-rodan --period=today

# Output:
# Login frequency: [X] logins today
# Tiles clicked: [breakdown]
# Approvals processed: [X]
# Avg session duration: [X] minutes
```

**Post Summary in Slack**:
```
📊 Hot Rodan Pilot - Day 1 Complete!

Great first day! Here's what happened:

✅ CEO logged in [X] times
✅ Most-used tile: [Tile name]
✅ Approvals processed: [X]
✅ No critical bugs

See you Monday for Week 1 continuation!
```

---

## Post-Launch Monitoring (Week 1)

### Daily Monitoring (Every Day)

**9:00 AM - Morning Check**:
```bash
# Health check
npm run health-check

# Yesterday's activity
npm run pilot:activity --customer=hot-rodan --date=yesterday
```

**Confirm**:
- [ ] CEO logged in yesterday
- [ ] No errors in logs
- [ ] Performance acceptable

**If CEO didn't log in**:
- Send Slack message: "Hey, missed you yesterday! Everything ok?"
- Understand barrier (too busy, forgot, not useful?)

---

**12:00 PM - Noon Check**:
- [ ] Check #hot-rodan-pilot Slack for questions
- [ ] Respond to any issues immediately
- [ ] Monitor error logs

---

**5:00 PM - End of Day**:
- [ ] Review day's activity
- [ ] Log any feedback received
- [ ] Create tickets for bugs/features
- [ ] Plan tomorrow's focus

---

### Weekly Check-In Calls (Fridays 3 PM)

**Use**: `weekly-checkin-template.md`

**Track**:
- [ ] Week 1: Oct 18 (Day 1 + first call)
- [ ] Week 2: Oct 25
- [ ] Week 3: Nov 1
- [ ] Week 4: Nov 8 (final pilot call)

---

## Escalation Paths

### Level 1: Minor Issues (Product Agent Handles)
**Examples**: UX confusion, tile layout preferences, feature requests

**Response Time**: <2 hours during business hours

**Process**:
1. CEO reports issue via Slack or call
2. Product Agent logs issue
3. Product Agent creates ticket (P2/P3)
4. Product Agent responds with timeline

---

### Level 2: Bugs (Engineer Required)
**Examples**: Data inaccuracy, tile not loading, approval queue broken

**Response Time**: <4 hours for P1, same-day for P2

**Process**:
1. CEO reports bug
2. Product Agent reproduces bug
3. Product Agent escalates to Engineer
4. Engineer fixes (same-day for P1)
5. Product Agent confirms fix with CEO

---

### Level 3: Critical Issues (All Hands)
**Examples**: Dashboard down, data loss, security issue

**Response Time**: <30 minutes

**Process**:
1. CEO reports critical issue OR we detect it
2. Product Agent immediately escalates to Manager + Engineer
3. Manager calls CEO within 30 min
4. All hands fix issue
5. Post-mortem and prevention plan

**Criteria for Critical**:
- Dashboard completely unavailable
- Data loss or corruption
- Security/privacy breach
- CEO explicitly says "This is blocking us"

---

## Success Metrics (Week 1)

### Usage Metrics
- [ ] CEO logs in ≥5 days
- [ ] Avg session duration: 2-10 minutes
- [ ] Approvals processed: ≥1
- [ ] Mobile access used: Yes/No

### Satisfaction Metrics
- [ ] Week 1 rating: ≥6/10
- [ ] CEO shares ≥1 positive feedback
- [ ] No "I want to stop" signals

### Impact Metrics
- [ ] Time savings (CEO self-reported): ≥3 hours
- [ ] Quick wins: ≥1 (caught inventory alert, fast approval, etc.)

**If 2/3 metrics hit targets**: Week 1 success, continue pilot

---

## Contingency Plans

### Scenario 1: CEO Doesn't Use Dashboard
**Trigger**: <3 logins in first week

**Action**:
1. Call CEO immediately: "We noticed you haven't been using it much. What's going on?"
2. Understand barrier: too busy, not useful, forgot, etc.
3. Options:
   - Simplify (reduce to 2-3 core tiles)
   - Daily reminder (Slack bot or email digest)
   - Extend Week 1 by 3-5 days
   - Pause pilot if CEO isn't committed

---

### Scenario 2: Data Accuracy Issues
**Trigger**: CEO reports "This number is wrong"

**Action**:
1. Reproduce issue immediately
2. Compare HotDash data vs Shopify directly
3. Fix within 2 hours
4. Call CEO to confirm fix
5. If happens twice: Full data audit before continuing

**Critical**: CEO must trust data. If trust breaks, pilot fails.

---

### Scenario 3: Dashboard Too Slow
**Trigger**: CEO reports "This is too slow to use"

**Action**:
1. Measure load times (should be <2 seconds)
2. Optimize immediately (caching, query optimization)
3. Target: <1 second load time
4. Confirm improvement with CEO

---

### Scenario 4: CEO Wants to Stop
**Trigger**: CEO says "I don't think this is working"

**Action**:
1. Don't argue or defend
2. Ask: "Help me understand—what's not working?"
3. Assess: Is it fixable in 2-3 days?
   - If YES: Fix and ask for 3 more days
   - If NO: Exit gracefully
4. Exit interview: Document learnings
5. Part ways professionally

---

**Document Path**: `docs/pilot/launch-runbook.md`  
**Owner**: Product Agent  
**Status**: ✅ Ready for Hot Rodan launch execution (Oct 15)  
**Next**: Execute day-by-day starting Oct 15, 2025

