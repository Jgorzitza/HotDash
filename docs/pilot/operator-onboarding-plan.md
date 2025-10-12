# Hot Rodan Operator Onboarding Plan

**Version**: 1.0
**Date**: October 12, 2025
**Customer**: Hot Rodan
**Owner**: Product Agent
**Purpose**: Detailed onboarding workflow for Hot Rodan operators (CEO + team)

---

## Overview

**Goal**: Get Hot Rodan team from "first login" to "confident daily user" in 3 phases

**Participants**:
- CEO (Primary operator)
- Operations Manager (Secondary operator)
- Support Lead (Optional, if applicable)

**Timeline**: Day 1 → Week 1 → Month 1

---

## Phase 1: Day 1 (First Login) - Foundation

**Goal**: Operator completes first successful workflow, understands basics

**Duration**: 30-45 minutes (onboarding call + hands-on practice)

---

### Pre-Day 1: Setup (Product Team)

**Before first call, complete**:
- [ ] Shopify app installed on Hot Rodan store
- [ ] Data sync initiated (orders, inventory, support)
- [ ] User accounts created (CEO, Ops Manager, Support Lead)
- [ ] Test dashboard loads correctly
- [ ] Quick start guide sent via email

**Verification**:
```bash
# Verify Hot Rodan ready for onboarding
npm run pilot:verify-setup --customer=hot-rodan

# Expected output:
# ✅ Shopify connected
# ✅ Data synced (150 orders, 250 products)
# ✅ User accounts created (3)
# ✅ Dashboard rendering
```

---

### Day 1: Onboarding Call (45 minutes)

**Agenda**:

**Welcome (5 min)**:
- "Welcome to HotDash! Today we'll get you set up."
- Introductions
- Today's goal: Complete your first morning routine

**Login & First Look (5 min)**:
1. CEO navigates to https://hotdash.app
2. "Log in with Shopify" (uses existing Shopify credentials)
3. Dashboard loads with Hot Rodan's actual data
4. Screen share so Product Agent can see their view

**Dashboard Tour (15 min)**:

**Tile 1: Sales Pulse** (3 min)
- "This shows today's revenue, orders, average order value"
- Point out: Today's numbers, trend arrows (↑ ↓)
- Click tile to see hourly breakdown
- Ask: "Does this revenue number look right?"

**Tile 2: Inventory Alerts** (3 min)
- "This shows products running low or out of stock"
- Walk through: Red (out of stock), Yellow (low stock), Green (healthy)
- Demo: Click "Reorder" → Auto-fill suggested quantities
- Ask: "Do you currently have any low-stock items?"

**Tile 3: Ops Pulse** (3 min)
- "This shows support queue and approvals"
- Point out: Pending tickets, response times, approvals needed
- Demo: Click "Review Approvals" (if any exist)
- Ask: "Do you usually need to approve refunds or special requests?"

**Tiles 4-6: Quick Overview** (3 min)
- Top Products (bestsellers this week)
- Customer Mood (satisfaction sentiment)
- Order Status (fulfillment tracking)

**Skip detailed demos for now, focus on core 3 tiles**

**Hands-On Practice (15 min)**:
- "Now you drive! I'll watch and guide."

**Exercise 1: Morning Routine** (5 min)
1. Check Sales Pulse → What's today's revenue?
2. Review Inventory Alerts → Any action needed?
3. Check Ops Pulse → Any approvals?
4. Scan Customer Mood → Anyone unhappy?

CEO performs this workflow while Product Agent watches

**Exercise 2: Tile Interaction** (5 min)
- Click into Sales Pulse → Explore hourly breakdown
- Click Inventory Alerts → Review specific products
- Navigate back to dashboard

**Exercise 3: Mobile Access** (5 min)
- CEO opens https://hotdash.app on their phone
- Login works (same Shopify credentials)
- Dashboard renders on mobile
- Try morning routine on mobile

**Wrap-Up (5 min)**:
- "Great! You've completed your first workflow."
- Homework: Try morning routine tomorrow (2 minutes)
- Resources: Quick start guide, Slack #hot-rodan-pilot
- Questions?
- Next call: Tomorrow for team onboarding (Oct 16)

---

### Day 1: Post-Call Checklist (Product Agent)

**Immediately after call**:
- [ ] Log call notes in `feedback/product.md`
- [ ] Verify CEO can log in independently
- [ ] Send follow-up email with quick start guide
- [ ] Create Slack channel invite
- [ ] Set reminder for tomorrow's team onboarding

**Send CEO Email**:
```
Subject: Welcome to HotDash! 🎉

Hi [CEO Name],

Great call today! You're all set up.

✅ Day 1 Complete:
- Dashboard synced with your Shopify data
- Morning routine practiced
- Mobile access working

📖 Resources:
- Quick Start Guide: [attach]
- Video walkthrough (2 min): [link if available]
- Slack: #hot-rodan-pilot

🎯 Your Homework:
- Try morning routine tomorrow (2 min)
- Check dashboard from your phone
- Note anything confusing

📅 Tomorrow:
- Team onboarding call: 10 AM (Oct 16)
- We'll add Operations Manager and Support Lead

Questions? Reply here or Slack me!

Best,
[Your Name]
```

**Monitor**:
- [ ] Check if CEO logs in again today (practice)
- [ ] Watch for any error logs
- [ ] Be available for questions

---

### Day 1: Success Criteria

**CEO should be able to**:
- ✅ Log in independently
- ✅ Navigate dashboard (click tiles, return to home)
- ✅ Complete morning routine workflow
- ✅ Access dashboard on mobile
- ✅ Know where to get help (Slack, email)

**Red Flags**:
- ❌ CEO confused about what to do
- ❌ CEO can't log in
- ❌ Data looks wrong (revenue doesn't match)
- ❌ CEO says "This is too complicated"

**If red flags**: Pause, simplify, extend Day 1 by 1 day

---

## Phase 2: Week 1 (Days 2-7) - Habit Formation

**Goal**: CEO builds daily habit, team gets onboarded, operators gain confidence

**Duration**: 7 days with daily check-ins

---

### Day 2: Team Onboarding (30 min call)

**Attendees**: CEO + Operations Manager + Support Lead

**Agenda**:

**CEO Shares Experience (5 min)**:
- CEO: "Here's what I learned yesterday"
- Demo morning routine for team
- Share any quick wins or insights

**Team Tour (10 min)**:
- Show team their relevant tiles:
  - Ops Manager: Inventory Alerts, Order Status
  - Support Lead: Ops Pulse, Customer Mood
- Explain how they support CEO's workflow

**Approval Queue Setup (10 min)**:
- Demo approval workflow:
  1. Customer requests refund >$200
  2. Support Lead prepares recommendation
  3. Appears in CEO's approval queue
  4. CEO approves/denies in <1 hour
- Configure thresholds: Refunds >$200, shipping upgrades >$50
- Test with mock approval

**Team Practice (5 min)**:
- Each team member logs in
- Navigate to their relevant tiles
- Complete one workflow

**Wrap-Up**:
- Team homework: Check dashboard daily
- CEO continues morning routine
- Friday: First weekly check-in (Oct 18)

---

### Days 3-7: Daily Monitoring (Async)

**Product Agent's Daily Checklist**:

**Morning (9 AM)**:
- [ ] Check if CEO logged in yesterday
- [ ] Review error logs
- [ ] Post Slack check-in: "How's it going today?"

**Noon**:
- [ ] Respond to any Slack questions (<2 hours)
- [ ] Monitor usage patterns (which tiles clicked?)

**Evening (5 PM)**:
- [ ] Review day's activity
- [ ] Log any feedback received
- [ ] Plan tomorrow's support

**CEO's Daily Routine** (2-5 minutes):
1. Log in to https://hotdash.app
2. Check Sales Pulse
3. Review Inventory Alerts (act if needed)
4. Check Ops Pulse (approve if needed)
5. Scan Customer Mood

**Team's Daily Routine** (as needed):
- Ops Manager: Monitor inventory alerts
- Support Lead: Prepare approval requests
- CEO: Make final approval decisions

---

### Week 1: Progress Milestones

**Day 2-3**: Getting comfortable
- [ ] CEO logs in both days
- [ ] Completes morning routine
- [ ] Team members accessing dashboard

**Day 4-5**: Building confidence
- [ ] CEO uses dashboard without prompting
- [ ] At least 1 approval processed
- [ ] CEO shares feedback or insight

**Day 6-7**: Habit forming
- [ ] CEO checks dashboard first thing AM
- [ ] Mobile usage starts
- [ ] CEO says "This is useful"

---

### Friday (Day 3 of pilot): First Weekly Check-In

**Use**: `weekly-checkin-template.md`

**Key Questions**:
1. How many days did you check the dashboard? (Target: 3-5)
2. How useful was it this week? (Rating 1-10)
3. What worked well?
4. What was confusing?
5. Any quick wins? (caught inventory alert, fast approval, etc.)

**Deliverables**:
- [ ] Week 1 rating recorded
- [ ] Feedback logged
- [ ] Action items created for Week 2 improvements

---

### Week 1: Success Criteria

**Must-Have**:
- ✅ CEO logged in ≥3 days (building habit)
- ✅ Morning routine completed ≥3 times
- ✅ Team members have accessed dashboard
- ✅ Rating ≥6/10 (acceptable start)
- ✅ Zero critical bugs

**Nice-to-Have**:
- 🎯 CEO logged in ≥5 days (strong habit)
- 🎯 At least 1 approval processed
- 🎯 CEO shares positive feedback
- 🎯 Mobile access used

**Red Flags**:
- ❌ CEO logged in <3 days (not using it)
- ❌ Rating ≤4/10 (not valuable)
- ❌ Data accuracy issues
- ❌ CEO wants to pause

**Action**: If 2+ red flags → Emergency call to understand barriers

---

## Phase 3: Month 1 (Weeks 2-4) - Mastery & Optimization

**Goal**: Dashboard becomes CEO's command center, operators are confident power users

---

### Week 2-3: Advanced Features & Workflows

**CEO Progresses To**:
- Using dashboard as primary ops tool (not Shopify admin)
- Checking mobile throughout day
- Processing approvals within 1 hour
- Spotting trends proactively

**New Workflows to Introduce**:

**Week 2: Approval Queue Mastery**:
- Demo bulk approve (if multiple simple approvals)
- Show approval history
- Set up mobile notifications for urgent approvals
- Goal: <30 min avg turnaround

**Week 3: Advanced Analytics**:
- Deep dive into Sales Pulse trends
- Compare week-over-week performance
- Identify bestseller patterns
- Use insights for inventory decisions

**Weekly Check-Ins Continue**:
- Friday 3 PM calls (weeks 2, 3, 4)
- Use same template
- Track rating trend
- Document feature requests

---

### Week 4: Decision Week

**Final Pilot Week Activities**:

**Monday-Thursday**: Normal usage
- CEO uses dashboard as usual
- Product team monitors closely
- Collect final feedback

**Friday: Final Check-In + Decision Call**:
- Comprehensive pilot review
- Go/no-go decision discussion
- Pricing conversation (if GO)
- Case study request (if positive)

**Use**: `weekly-checkin-template.md` (Week 4 questions)

---

### Month 1: Success Criteria

**Must-Have (Required for Conversion)**:
- ✅ CEO rating ≥7/10 average across 4 weeks
- ✅ CEO logged in ≥20/28 days (consistent habit)
- ✅ Time savings ≥5 hours/week (CEO confirms)
- ✅ CEO wants to keep using HotDash
- ✅ Zero critical bugs throughout pilot

**Nice-to-Have (Strong Conversion Signal)**:
- 🎯 Team members actively using dashboard
- 🎯 CEO shares testimonial or case study
- 🎯 Referral to another business owner
- 🎯 CEO requests additional features

**Conversion Likely If**:
- 4/5 must-have criteria met
- CEO says "I can't go back to manual workflow"
- Team relies on dashboard daily
- Measurable business impact (prevented stock-outs, faster decisions)

---

## Onboarding Best Practices

### Do's ✅

**Keep It Simple**:
- Start with 3 core tiles (Sales, Inventory, Ops)
- Add more tiles as CEO gets comfortable
- Focus on morning routine workflow

**Show Real Value Early**:
- Use CEO's actual data (not fake demo data)
- Point out immediate insights: "Your Chrome Headers are low stock!"
- Celebrate quick wins: "You just approved that in 2 minutes!"

**Be Available**:
- Respond to questions <2 hours
- Daily Slack check-ins
- Weekly structured calls
- On-call for urgent issues

**Iterate Fast**:
- CEO reports bug → Fix same day (if critical)
- CEO confused → Simplify immediately
- CEO requests feature → Add if high-value

---

### Don'ts ❌

**Don't Overwhelm**:
- ❌ Showing all 10 tiles on Day 1
- ❌ Teaching keyboard shortcuts before basics
- ❌ Deep technical details

**Don't Assume**:
- ❌ "They'll figure it out on their own"
- ❌ "The guide explains everything"
- ❌ CEO understands without practice

**Don't Ignore Red Flags**:
- ❌ CEO not logging in → Call immediately
- ❌ Rating drops → Emergency check-in
- ❌ Data wrong → Fix within 2 hours

**Don't Rush**:
- ❌ Pushing CEO to use advanced features Week 1
- ❌ Expecting mastery in 3 days
- ❌ Pressuring for positive feedback

---

## Operator Onboarding Checklist

### Pre-Onboarding
- [ ] Shopify app installed
- [ ] Data synced and accurate
- [ ] User accounts created
- [ ] Quick start guide sent
- [ ] Onboarding call scheduled

### Day 1
- [ ] Onboarding call completed
- [ ] CEO logged in successfully
- [ ] Morning routine practiced
- [ ] Mobile access working
- [ ] Follow-up email sent

### Day 2
- [ ] Team onboarding completed
- [ ] All team members can log in
- [ ] Approval queue configured
- [ ] Team roles clear

### Week 1
- [ ] Daily Slack check-ins
- [ ] CEO using dashboard ≥3 days
- [ ] First weekly check-in completed
- [ ] Week 1 rating recorded

### Weeks 2-3
- [ ] Advanced workflows introduced
- [ ] Weekly check-ins continuing
- [ ] Feedback incorporated
- [ ] Rating maintaining ≥6/10

### Week 4
- [ ] Final check-in completed
- [ ] Go/no-go decision made
- [ ] Pilot learnings documented
- [ ] Next steps clear (continue or exit)

---

## Training Resources by Phase

### Day 1 Resources
- Quick Start Guide (1-page)
- Video: "Your First Login" (2 min)
- Slack channel access

### Week 1 Resources
- Morning Routine Workflow Guide
- Approval Queue Tutorial
- Mobile App Guide
- Troubleshooting FAQ

### Weeks 2-4 Resources
- Advanced Analytics Guide
- Keyboard Shortcuts Cheat Sheet
- Best Practices from Other Customers
- ROI Calculator

---

## Troubleshooting Common Onboarding Issues

### Issue 1: CEO Can't Log In
**Symptoms**: Login button doesn't work, redirect fails

**Fix**:
1. Verify Shopify app is installed (check Shopify admin)
2. Check CEO is using correct Shopify account
3. Test OAuth flow in incognito window
4. If broken: Screen share and debug live

**Prevention**: Test login flow 1 day before onboarding

---

### Issue 2: CEO Confused About What To Do
**Symptoms**: "I don't know where to start", staring at dashboard

**Fix**:
1. Walk through morning routine step-by-step
2. Share screen, guide click-by-click
3. Simplify: Hide advanced tiles, show only 3 core tiles
4. Practice workflow 2-3 times until comfortable

**Prevention**: Keep Day 1 extremely simple, focus on one workflow

---

### Issue 3: Data Doesn't Look Right
**Symptoms**: "This revenue number is wrong", "I have more inventory"

**Fix**:
1. Compare HotDash data vs Shopify directly
2. Check data sync status (last updated timestamp)
3. Re-run sync if stale
4. If mismatch: Debug and fix within 2 hours

**Prevention**: Verify data accuracy before Day 1 call

---

### Issue 4: CEO Not Using It After Day 1
**Symptoms**: Zero logins Day 2-3

**Fix**:
1. Call or Slack CEO: "Hey, missed you! What's going on?"
2. Understand barrier: Too busy? Forgot? Not useful?
3. Solutions:
   - Too busy → Daily reminder (Slack bot)
   - Forgot → Add to calendar as 9 AM daily task
   - Not useful → Deep dive on what's missing
4. Extend onboarding if needed

**Prevention**: Set expectation on Day 1 that habit takes 3-5 days

---

## Success Stories (Template for CEO)

### Example 1: Stock-Out Prevention
"On Day 4, I checked the dashboard and saw 'Chrome Headers: 2 left' in red. I ordered more immediately. If I hadn't caught that, we would have run out and lost ~$2K in sales that week."

### Example 2: Fast Approval
"A customer requested a $245 refund. My team prepared the recommendation and it appeared in my approval queue. I approved it in 5 minutes from my phone while getting coffee. Before HotDash, that would have taken 3 hours of back-and-forth emails."

### Example 3: Trend Spotting
"I noticed in Sales Pulse that our performance exhaust sales doubled week-over-week. I increased our ad spend on that product and it became our bestseller for the month."

---

**Document Path**: `docs/pilot/operator-onboarding-plan.md`  
**Owner**: Product Agent  
**Status**: ✅ Ready for Hot Rodan onboarding execution  
**Next**: Execute Day 1 onboarding call October 15, 2025

