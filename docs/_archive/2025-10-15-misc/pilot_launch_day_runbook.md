# Pilot Launch Day Runbook (Oct 28, 2025)

**Version**: 1.0
**Date**: October 12, 2025
**Owner**: Product Agent
**Purpose**: Step-by-step checklist for successful pilot launch
**Evidence Path**: `docs/pilot_launch_day_runbook.md` (Hour-by-hour runbook, verification checks, contingency plans)

---

## Pre-Launch Verification (Oct 27, Day Before)

### System Health Check (3:00 PM - 4:00 PM)

**Verify All Systems Green**:

```bash
# Check API Health
curl https://hotdash.app/api/health
# Expected: {"status":"healthy","services":{"inventory":true,"mcp":true}}

# Check Approval Queue
curl https://hotdash.app/api/approval-queue/status
# Expected: {"queue_depth":0,"system":"ready"}

# Check Knowledge Base
curl https://hotdash.app/api/llamaindex/health
# Expected: {"indexed_docs":42,"last_sync":"2025-10-27T15:00:00Z"}
```

**Evidence Required**:
- [ ] All health checks return 200 OK
- [ ] Screenshot of system status dashboard (all green)
- [ ] Logged in `feedback/product.md` with timestamp

---

### Operator Access Verification (4:00 PM - 4:30 PM)

**Test with Each Pilot Operator**:

```
Pilot Operators:
1. Sarah Johnson - sarah@hotdash.com
2. Marcus Chen - marcus@hotdash.com  
3. David Williams - david@hotdash.com
4. Emily Rodriguez - emily@hotdash.com
5. Aisha Patel - aisha@hotdash.com
```

**For Each Operator**:
- [ ] Can log in to https://hotdash.app/approval-queue
- [ ] Dashboard loads in <2 seconds
- [ ] Mock draft appears in queue
- [ ] Can approve mock draft successfully
- [ ] Dashboard updates with stats

**Evidence Required**:
- [ ] 5 screenshots (one per operator showing successful login)
- [ ] Logged in `feedback/product.md`

---

### Knowledge Base Final Sync (4:30 PM - 5:00 PM)

**Run Final KB Sync**:

```bash
# Sync latest articles
npm run ai:sync-kb

# Verify article count
npm run ai:verify-kb-coverage
# Expected: >40 articles, >85% coverage for common queries
```

**Test Sample Queries**:
- [ ] "Where is my order?" → Returns shipping policy + tracking guide
- [ ] "How do I return this?" → Returns return policy + process
- [ ] "What's your refund policy?" → Returns refund timeline
- [ ] "Is this in stock?" → Returns inventory info or "check with team"

**Evidence Required**:
- [ ] KB coverage report showing >85%
- [ ] 4 test query results (screenshot or log)
- [ ] Logged in `feedback/product.md`

---

### Communications Sent (5:00 PM - 5:30 PM)

**Send Pilot Launch Email** (Template: `docs/pilot_communication_templates.md`):

```
To: 5 pilot operators
Subject: 🚀 Tomorrow is Pilot Day! (Oct 28)
Content: Launch day reminder, expectations, help resources
```

**Post in Slack** (#agent-sdk-pilot):

```
🚀 Pilot launches TOMORROW at 9:00 AM!

What to expect:
- Daily standup at 9:00 AM (15 min)
- Start reviewing drafts after standup
- Take your time, no rush
- Share feedback as you go

Help available:
- Slack: #agent-sdk-pilot (we monitor 24/7)
- Office hours: 2-3 PM daily
- Troubleshooting: [link to playbook]

See you tomorrow! 🎉
```

**Evidence Required**:
- [ ] Email sent confirmation
- [ ] Slack message posted (screenshot)
- [ ] Logged in `feedback/product.md`

---

## Launch Day: Oct 28, 2025

### 8:00 AM - 8:30 AM: Final Pre-Flight Checks

**System Status**:
- [ ] All services healthy (API, approval queue, KB)
- [ ] Monitoring dashboard shows green across all metrics
- [ ] Log aggregation working (check recent logs flowing)

**Queue Status**:
- [ ] 10% traffic routing to approval queue (not 100%)
- [ ] Estimated 50-75 inquiries today for pilot team
- [ ] Auto-escalation rules active (refunds >$100, angry customers)

**Team Readiness**:
- [ ] Product agent available all day (me!)
- [ ] Engineer on call for critical bugs
- [ ] Manager available for escalations
- [ ] QA monitoring error logs

**Evidence**: System status dashboard screenshot, logged

---

### 8:30 AM - 9:00 AM: Operator Check-Ins

**Slack Check-In** (#agent-sdk-pilot):

```
Good morning pilots! 🌅

Quick check before standup:
- Can you log in to the approval queue? (test now)
- Any questions before we start?
- Feeling ready? Nervous? (Totally normal!)

Reply with 👍 when you're logged in successfully.

Standup in 30 minutes at 9:00 AM sharp!
```

**Monitor Responses**:
- [ ] All 5 operators confirm login successful
- [ ] Address any login issues immediately
- [ ] If system issue: Escalate to Engineer, consider 30-min delay

---

### 9:00 AM - 9:15 AM: Launch Standup

**Standup Agenda** (in-person or Zoom):

1. **Welcome & Excitement** (2 min)
   - "Today is day 1 of making your jobs better!"
   - "You're pioneers, shaping this tool"

2. **How It Works** (3 min)
   - Quick demo: log in → review draft → approve
   - "You're in control, AI assists"

3. **Expectations** (3 min)
   - Start slow: aim for 10-15 drafts today
   - Quality over speed
   - Share feedback as you go (good and bad!)

4. **Help Resources** (2 min)
   - Slack: #agent-sdk-pilot (we respond in minutes)
   - Office hours: 2-3 PM daily (drop-in)
   - Troubleshooting playbook: [link]

5. **Questions** (5 min)
   - Open floor

**After Standup**:
- [ ] Post summary in Slack for those who missed it
- [ ] Send quick-start guide link to all operators

---

### 9:15 AM - 12:00 PM: Morning Session Monitoring

**Active Monitoring** (Product Agent's Job):

**Every 30 minutes, check**:
- [ ] Queue depth (should be <10 pending)
- [ ] System uptime (should be 100%)
- [ ] Error logs (should be zero critical errors)
- [ ] Operator activity (all 5 active?)

**Slack Monitoring**:
- [ ] Respond to questions in <5 minutes
- [ ] Celebrate first approvals publicly: "🎉 Sarah just approved her first draft! Nice!"
- [ ] Share tips: "Pro tip: Use Ctrl+A to approve quickly!"

**Red Flags to Watch**:
- ⚠️ Operator reports "all drafts are wrong" → Investigate KB immediately
- ⚠️ System slow (>5s load time) → Escalate to Engineer
- ⚠️ Error rate >5% → Pause pilot, investigate
- ⚠️ Operator frustration ("this is terrible") → Call immediately, understand why

**Green Flags to Celebrate**:
- ✅ First approval ("🎉 Sarah approved a draft!")
- ✅ Positive feedback ("This is actually helpful!")
- ✅ Operator sharing tips with each other

---

### 12:00 PM - 1:00 PM: Lunch Break & Mid-Day Review

**Mid-Day Metrics Check**:

```bash
# Run metrics query
npm run pilot:metrics:summary

# Expected output:
# Drafts reviewed: 40-60
# Approval rate: 35-50% (target: >35%)
# Avg review time: 1-2 min (target: <2 min)
# System uptime: 100%
# Operator satisfaction: TBD (survey at end of day)
```

**Mid-Day Slack Update**:

```
📊 Mid-Day Pilot Update (12:00 PM)

Great morning, team! Here's where we're at:

✅ 52 drafts reviewed (above target!)
✅ 45% approval rate (above our 35% goal!)
✅ System uptime: 100% (rock solid)
✅ Team is crushing it!

Keep up the great work! 💪

Remember: 
- Office hours at 2 PM if you have questions
- No rush, take your time with each draft
- Share feedback as you go!
```

**Evidence Required**:
- [ ] Metrics screenshot
- [ ] Slack update posted
- [ ] Logged in `feedback/product.md`

---

### 1:00 PM - 2:00 PM: Afternoon Session Begins

**Continue Monitoring** (same as morning):
- [ ] Queue depth check every 30 min
- [ ] Respond to Slack questions <5 min
- [ ] Log any bugs or issues reported

**Address Any Morning Issues**:
- If bugs reported: Create tickets, assign to Engineer
- If KB gaps found: Alert Support Agent to create articles
- If UX confusion: Note for post-pilot improvements

---

### 2:00 PM - 3:00 PM: Office Hours

**Product Agent Available**:
- Zoom link open: [link]
- Operators can drop in with questions
- Screen share to troubleshoot issues
- Collect detailed feedback

**Typical Questions**:
- "How do I know if a draft is good?"
- "When should I escalate vs reject?"
- "Can I customize the drafts?"
- "What if I disagree with the AI?"

**Document All Feedback**:
- [ ] Log questions in `feedback/product.md`
- [ ] Note patterns (if 3+ operators ask same question, it's a training gap)
- [ ] Share tips in Slack after office hours

---

### 3:00 PM - 5:00 PM: Final Push & Wrap-Up

**Continue Monitoring**:
- [ ] Same 30-min checks
- [ ] Encourage operators to hit daily goals (10-15 drafts)
- [ ] Celebrate milestones: "Team just hit 100 drafts reviewed! 🎉"

**5:00 PM: End of Day Wrap-Up**

**Post in Slack**:

```
🎉 Day 1 Complete! 🎉

You crushed it today, team! Here's what we accomplished:

📊 Final Stats:
- ✅ 87 drafts reviewed (above target!)
- ✅ 48% approval rate (above goal!)
- ✅ System uptime: 100%
- ✅ Zero critical bugs

🌟 Highlights:
- Sarah approved 20 drafts (team high score!)
- Marcus shared great feedback on KB gaps
- Emily's editing skills are 🔥

📝 Quick Survey:
Please take 30 seconds to rate your experience today:
[Google Form link]

Questions? Concerns?
- Reply here or DM me
- Tomorrow's standup: 9:00 AM

Great work, team! See you tomorrow! 💪
```

---

### 5:30 PM - 6:00 PM: Product Team Debrief

**Internal Debrief** (Product, Engineer, Manager):

**Review Metrics**:
- [ ] Final day 1 numbers
- [ ] Any system issues?
- [ ] Operator feedback themes

**Action Items for Day 2**:
- [ ] Bugs to fix overnight
- [ ] KB articles to add
- [ ] Process improvements

**Evidence Required**:
- [ ] Day 1 metrics report
- [ ] Action items list
- [ ] Logged in `feedback/product.md`

---

## Contingency Plans

### Scenario 1: System Down

**If API/Queue is Down**:
1. Immediately post in Slack: "System issue detected, investigating"
2. Escalate to Engineer (ping @engineering-oncall)
3. Switch operators to manual workflow temporarily
4. Post ETA updates every 15 minutes
5. Once fixed: "System back up, resuming pilot"

**Decision**: If down >2 hours, consider pausing pilot for the day

---

### Scenario 2: All Drafts Are Wrong

**If Operators Report Major Quality Issues**:
1. Check KB sync status (run `npm run ai:verify-kb-coverage`)
2. Check API health (are we getting correct data?)
3. If KB issue: Run emergency sync
4. If API issue: Escalate to Engineer
5. Post in Slack: "We're investigating quality issues, hold tight"

**Decision**: If quality <50% accurate, pause pilot and fix

---

### Scenario 3: Operator Wants to Quit

**If Operator Says "I hate this, I want out"**:
1. Jump on a call immediately (don't handle via Slack)
2. Listen: What's frustrating them?
3. Validate: "I hear you, this is hard"
4. Problem-solve: Can we fix the issue?
5. Give option: "You can opt out, no pressure"
6. Follow up: Share feedback with team

**Decision**: Operator happiness > pilot success. Let them opt out if needed.

---

### Scenario 4: Security/Data Issue

**If Operator Reports Data Leakage or Security Concern**:
1. **IMMEDIATELY PAUSE PILOT** (stop all traffic)
2. Escalate to Manager + Engineer
3. Post in Slack: "Pilot paused for security review"
4. Investigate thoroughly (30-60 min)
5. If false alarm: Resume
6. If real issue: Pilot stays paused until fixed

**Priority**: Security > Pilot > Everything Else

---

## Success Criteria (Day 1)

**Green Light (Continue Pilot)**:
- ✅ System uptime >95%
- ✅ Approval rate >35%
- ✅ Operator satisfaction >6.5/10
- ✅ Zero critical bugs
- ✅ Operators willing to continue

**Yellow Light (Fix & Continue)**:
- ⚠️ System uptime 90-95%
- ⚠️ Approval rate 25-35%
- ⚠️ Operator satisfaction 5.0-6.5/10
- ⚠️ 1-2 non-critical bugs
- ⚠️ Some operator concerns but willing to continue

**Red Light (Pause Pilot)**:
- ❌ System uptime <90%
- ❌ Approval rate <25%
- ❌ Operator satisfaction <5/10
- ❌ Critical bug affecting all operators
- ❌ Operators want to quit

---

**Document Path**: `docs/pilot_launch_day_runbook.md`  
**Purpose**: Hour-by-hour guide for successful pilot launch  
**Status**: Ready for Oct 28 execution  
**North Star**: ✅ **Detailed runbook ensures smooth launch, operator success**

