# Voice of Customer (VoC) Program: Hot Rodan & Beyond

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Product Agent  
**Purpose**: Create ongoing operator feedback collection and synthesis process

---

## Executive Summary

The Voice of Customer (VoC) program ensures **continuous feedback collection** from Hot Rodan and future customers, enabling rapid iteration and product-market fit.

**Program Goals**:
1. **Listen**: Capture operator feedback (verbatim quotes, pain points, feature requests)
2. **Synthesize**: Identify patterns and prioritize improvements
3. **Act**: Ship improvements based on feedback within 1-2 weeks
4. **Close Loop**: Communicate back to operators ("We heard you, we built X")

**Feedback Channels**: Daily Slack, weekly surveys, monthly calls, quarterly interviews

**Success Metric**: 90% of operators feel "heard and understood" (survey question)

---

## Part 1: VoC Program Overview

### Why Voice of Customer Matters

**Operator-First Philosophy**: Operators (CEOs, team leads) are our internal customers—their needs drive product decisions.

**Benefits of Strong VoC**:
- ✅ **Product-market fit**: Build what operators actually need (not what we think they need)
- ✅ **Retention**: Operators who feel heard stay longer (low churn)
- ✅ **Referrals**: Happy operators become advocates (word-of-mouth growth)
- ✅ **Roadmap clarity**: Customer feedback = clear feature priorities
- ✅ **Competitive moat**: Deep customer relationships hard to replicate

**HotDash Commitment**: We will respond to every piece of feedback within 24 hours.

---

### VoC Principles

1. **Listen More Than Talk** (80/20 rule)
   - 80% listening to operator
   - 20% explaining product

2. **Ask Open-Ended Questions** ("What frustrated you?" not "Did you like X?")

3. **Capture Verbatim Quotes** (exact words operators use)

4. **Avoid Leading Questions** ("What would you improve?" not "Don't you think X is great?")

5. **Close the Feedback Loop** ("You asked for X, we built it—check it out!")

---

## Part 2: Feedback Collection Channels

### Channel 1: Daily Slack Messages (Asynchronous)

**Purpose**: Low-friction way for operators to share thoughts anytime

**Setup**:
- Private Slack channel: `#hotdash-pilot-feedback`
- Participants: Hot Rodan CEO + Product Agent + Engineer
- Expectation: CEO posts anytime something is noteworthy (wins or issues)

**Prompts** (Post these in Slack to encourage feedback):
- "What did you use HotDash for today?"
- "Any bugs or issues you noticed?"
- "What feature would make your day easier?"

**Example Messages**:
```
CEO: "Inventory alert saved me today—Chrome Headers were at 4 units, ordered more just in time 🙌"

CEO: "Approval queue is slower today, taking 10 seconds to load 😕"

CEO: "Wish I could export sales data to CSV—sending to accountant weekly"
```

**Response Time**: <2 hours for issues, <24 hours for feature requests

---

### Channel 2: Weekly Survey (5 Minutes)

**Purpose**: Structured quantitative + qualitative feedback

**Timing**: Every Friday at 4:00 PM (automated email)

**Questions** (6 total, 5 minutes to complete):
1. **Satisfaction**: How satisfied are you with HotDash this week? (1-10)
2. **Time Saved**: How much time did HotDash save you this week? (0-20+ hours dropdown)
3. **Usage**: How many days did you use HotDash this week? (0-7)
4. **Top Win**: What worked well this week? (open-ended, 1 sentence)
5. **Top Frustration**: What frustrated you this week? (open-ended, 1 sentence)
6. **Feature Request**: What feature would make this a 10/10? (open-ended, 1 sentence)

**Tools**: Google Forms, Typeform, or Slack survey bot

**Response Rate Target**: >90% (send reminder Monday morning if not completed)

---

### Channel 3: Weekly Check-In Call (30 Minutes)

**Purpose**: Deep conversation, build relationship, clarify feedback

**Timing**: Every Friday at 4:30 PM (right after survey)

**Agenda**:
1. **Review Week** (10 min): What went well, what didn't?
2. **Survey Debrief** (5 min): Discuss survey answers in detail
3. **Feature Demo** (5 min): Show new features shipped this week
4. **Roadmap Preview** (5 min): What's coming next week/month
5. **Open Discussion** (5 min): Anything else on your mind?

**Recording**: With permission, record call for later analysis

**Notes**: Document in `docs/pilot/weekly-check-ins/week-N.md`

---

### Channel 4: Monthly Deep-Dive Interview (60 Minutes)

**Purpose**: Strategic feedback, long-term vision, relationship building

**Timing**: First Friday of each month (replace weekly check-in)

**Agenda**:
1. **Month in Review** (15 min): Biggest wins, biggest frustrations, ROI assessment
2. **Product Roadmap** (15 min): Show next 3 months, get feedback on priorities
3. **Business Impact** (15 min): How is HotDash helping grow business?
4. **Feature Exploration** (10 min): Brainstorm future features
5. **Wrap-Up** (5 min): Any other feedback, concerns, requests?

**Recording**: Always record (for case studies, testimonials, pattern analysis)

**Deliverable**: Interview summary sent to CEO within 3 days

---

### Channel 5: Quarterly Executive Interview (90 Minutes)

**Purpose**: Strategic alignment, renewal decision, testimonial collection

**Timing**: End of Q1, Q2, Q3, Q4

**Agenda**:
1. **Quarter Review** (20 min): Metrics, ROI, satisfaction
2. **Product Feedback** (20 min): What's working, what's not, what's missing
3. **Business Goals** (20 min): Where is business going next 6-12 months?
4. **Roadmap Alignment** (15 min): Does our roadmap support CEO's goals?
5. **Testimonial/Case Study** (10 min): If satisfied, request testimonial
6. **Renewal Discussion** (5 min): Confirm commitment to next quarter

**Outcome**: Renewal decision, testimonial, updated roadmap priorities

---

## Part 3: Feedback Synthesis Process

### Step 1: Capture Feedback (Daily)

**All Feedback Goes Into Feedback Log**: `feedback/product.md`

**Format**:
```markdown
### 2025-10-15 - Hot Rodan CEO Feedback

**Channel**: Slack  
**Quote**: "Inventory alert saved me today—Chrome Headers were at 4 units"

**Category**: Win / Feature Works  
**Action**: Celebrate, document as success story  
**Priority**: N/A (positive feedback)
```

**Categories**:
- 🎉 Win / Feature Works
- 😕 Frustration / Bug
- 💡 Feature Request
- 📊 Usage Data
- 🗣️ Testimonial-Worthy Quote

---

### Step 2: Tag & Categorize (Weekly)

**Categorization Framework**:

| Category | Definition | Example |
|----------|------------|---------|
| **Bug** | Something broken | "Approval queue slow to load" |
| **Feature Request** | New capability desired | "Export to CSV" |
| **UX Improvement** | Existing feature needs polish | "Keyboard shortcuts would be nice" |
| **Win** | Something working well | "Inventory alerts are amazing" |
| **Pain Point** | Recurring frustration | "Switching between 5 tabs is annoying" |
| **ROI Evidence** | Measurable value | "Saved 2 hours today" |
| **Testimonial** | Quote-worthy praise | "HotDash gave me my weekends back" |

**Tools**: Airtable, Notion, or Google Sheets for feedback database

---

### Step 3: Identify Patterns (Weekly)

**Every Monday Morning** (30 minutes):
- Review last week's feedback
- Group by category
- Count frequency ("Export to CSV" mentioned 3 times this week)
- Identify emerging trends

**Pattern Questions**:
1. What's the #1 frustration this week? (mentioned most often)
2. What's the #1 requested feature? (highest priority to operators)
3. What's working really well? (preserve and amplify)
4. Any new pain points emerging? (previously not mentioned)
5. Is satisfaction trending up or down? (compare weekly survey scores)

**Output**: "Top 3 Patterns This Week" doc

---

### Step 4: Prioritize Actions (Monday Planning)

**Prioritization Framework**: RICE Score (Reach × Impact × Confidence / Effort)

**Example**:
| Feedback | Category | RICE Score | Action |
|----------|----------|-----------|--------|
| "Export to CSV" | Feature Request | 20.0 | Ship in Week 1 |
| "Slow page load" | Bug | 13.3 | Fix in Week 1 |
| "Dark mode" | UX Improvement | 2.0 | Defer to Month 3 |

**Prioritization Output**: Sprint plan for next week (top 3 priorities)

---

### Step 5: Close the Loop (Weekly)

**Respond to Feedback Within 1 Week**:

**For Feature Requests**:
- If YES (building it): "Great idea! We're shipping 'Export to CSV' next Friday."
- If NOT YET (roadmap): "Love this idea—added to Q2 roadmap. Here's why..."
- If NO (not aligned): "Interesting idea, but doesn't fit vertical focus. Here's alternative..."

**For Bugs**:
- **<2 hours**: "We're investigating X, will fix ASAP"
- **<24 hours**: "Fixed! Can you confirm it's working now?"

**For Wins**:
- **<1 day**: "So happy to hear this! Mind if we share your quote as testimonial?"

**Communication Channel**: Slack, email, or mention in weekly check-in call

---

## Part 4: Feedback-Driven Roadmap Process

### How Customer Feedback Influences Roadmap

**Product Roadmap Sources** (in priority order):
1. **Customer Requests** (70%): What operators explicitly ask for
2. **Usage Data** (20%): What operators actually use (vs say they want)
3. **Strategic Bets** (10%): What we believe will delight operators (even if not requested)

**Process**:
1. **Collect**: All feedback goes into feedback log
2. **Synthesize**: Weekly pattern analysis
3. **Prioritize**: RICE scoring
4. **Commit**: Top 3 features per week go into sprint
5. **Ship**: Release features weekly
6. **Communicate**: Close loop with customers

**Transparency**: Share roadmap with customers (public Trello board or Notion page)

---

### Example: From Feedback to Feature (1-Week Cycle)

**Monday Oct 14**: Hot Rodan CEO mentions in Slack: "Wish I could export sales data to CSV"

**Tuesday Oct 15**: 
- Product Agent logs feature request
- Calculates RICE score: 20.0 (high priority)
- Adds to sprint plan

**Wednesday Oct 16**: 
- Engineer builds "Export to CSV" button
- QA tests feature

**Thursday Oct 17**: 
- Deploy to staging
- Product Agent previews feature with CEO (Slack screenshot)

**Friday Oct 18**: 
- Deploy to production
- Product Agent: "We heard you wanted CSV export—it's live! Try it out and let us know what you think."

**Result**: Customer feels heard, feature shipped in 4 days.

---

## Part 5: Feedback Templates

### Template 1: Weekly Survey

**Subject**: Your HotDash Experience This Week

**Body**:
> Hi [CEO Name],
>
> Quick 5-minute check-in on your HotDash experience this week.
>
> Your feedback drives our roadmap—we read every response!
>
> [Survey Link]
>
> Questions:
> 1. Satisfaction (1-10)
> 2. Time saved (hours)
> 3. Usage (days)
> 4. Top win (1 sentence)
> 5. Top frustration (1 sentence)
> 6. Feature request (1 sentence)
>
> Thanks,  
> [Product Agent Name]

---

### Template 2: Check-In Call Confirmation

**Subject**: Weekly Check-In Call - Friday 4:30 PM

**Body**:
> Hi [CEO Name],
>
> Looking forward to our weekly check-in tomorrow at 4:30 PM.
>
> **Agenda**:
> - Review this week's wins and issues
> - Demo new features we shipped
> - Preview what's coming next week
>
> **Zoom Link**: [link]
>
> Anything specific you'd like to discuss? Let me know!
>
> Thanks,  
> [Product Agent Name]

---

### Template 3: Feature Request Acknowledgment

**Subject**: Re: [Feature Request Name]

**Body**:
> Hi [CEO Name],
>
> Thanks for the feedback on [feature]! We love this idea.
>
> **What's Next**:
> - RICE Score: [score] (High Priority)
> - Timeline: Shipping in [week/month]
> - We'll keep you updated as we build it
>
> **Why This Feature Matters**:
> [1-2 sentences on value/impact]
>
> Any specific requirements or use cases we should keep in mind?
>
> Thanks,  
> [Product Agent Name]

---

### Template 4: Bug Fix Notification

**Subject**: [Bug Name] - FIXED ✅

**Body**:
> Hi [CEO Name],
>
> Great news—we've fixed the [bug description] issue you reported.
>
> **What was wrong**: [brief explanation]  
> **What we fixed**: [solution]  
> **Status**: Deployed to production, live now
>
> Can you confirm it's working as expected on your end?
>
> Sorry for the inconvenience, and thanks for reporting it!
>
> Thanks,  
> [Product Agent Name]

---

### Template 5: Monthly Interview Invitation

**Subject**: Monthly Deep-Dive Interview - [Month]

**Body**:
> Hi [CEO Name],
>
> Time for our monthly deep-dive! I'd love to get 60 minutes to discuss:
>
> 1. Your HotDash experience in [Month]
> 2. Product roadmap for next quarter
> 3. How HotDash is helping grow your business
>
> **Proposed Time**: [Date] at [Time]  
> **Zoom Link**: [link]
>
> Does this work for you? If not, send me 2-3 other times.
>
> Looking forward to the conversation!
>
> Thanks,  
> [Product Agent Name]

---

## Part 6: VoC Metrics & Goals

### VoC Health Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Response Rate** | % of surveys completed | >90% |
| **Feedback Frequency** | Average feedback items per week | >5 |
| **Time to Response** | Hours from feedback to acknowledgment | <24 |
| **Time to Fix** (bugs) | Hours from bug report to fix | <24 |
| **Time to Ship** (features) | Days from request to deployed | <14 |
| **Loop Closure Rate** | % of feedback items responded to | 100% |
| **Operator Sentiment** | "I feel heard" (1-10) | >8 |

---

### Quarterly VoC Goals

**Q4 2025 (Pilot Phase)**:
- [ ] 100% weekly survey response rate
- [ ] 100% feedback loop closure (every item acknowledged)
- [ ] <2 hours response time for critical bugs
- [ ] 90% of operators feel "heard and understood"

**Q1 2026 (Scale-Up)**:
- [ ] Expand VoC to 3-5 customers (consistent process)
- [ ] Automate survey reminders and tracking
- [ ] Create public roadmap (transparency)
- [ ] Publish quarterly VoC report (internal)

---

## Part 7: VoC Roles & Responsibilities

### Product Agent (Owner)

**Responsibilities**:
- Monitor all feedback channels daily
- Respond to feedback within 24 hours
- Synthesize weekly patterns
- Prioritize features based on feedback
- Close feedback loop (communicate actions taken)
- Quarterly VoC report

**Time Commitment**: 5-10 hours/week

---

### Engineer (Contributor)

**Responsibilities**:
- Fix bugs within 24 hours (critical), 7 days (minor)
- Build features based on customer requests
- Participate in weekly check-in calls (optional)
- Provide estimates for feature requests (RICE effort scoring)

**Time Commitment**: 2-3 hours/week (excluding build time)

---

### Manager Agent (Reviewer)

**Responsibilities**:
- Review quarterly VoC report
- Escalation point for major customer issues
- Approve major roadmap changes based on feedback
- Strategic guidance on customer relationships

**Time Commitment**: 1 hour/month

---

## Part 8: VoC Playbook for Future Customers

### Onboarding New Customer to VoC Program

**Day 1 (Kickoff Call)**:
1. Explain VoC program: "We'll check in weekly to hear your feedback"
2. Set up Slack channel: `#[customer-name]-feedback`
3. Share survey schedule: "Every Friday at 4 PM, takes 5 minutes"
4. Set expectations: "We respond to all feedback within 24 hours"

**Week 1**:
- Send first weekly survey (Friday 4 PM)
- Schedule first weekly call (Friday 4:30 PM)
- Monitor Slack channel daily

**Week 2-4**:
- Continue weekly cadence
- Start closing feedback loops (ship features, fix bugs)
- Build relationship and trust

**Month 2+**:
- Monthly deep-dive interviews
- Quarterly executive interviews
- Ongoing weekly check-ins

---

### Scaling VoC to 10+ Customers

**Challenge**: Can't do 10 weekly calls (Product Agent capacity)

**Solutions**:
1. **Automation**: Automate surveys, reminders, tracking
2. **Async-First**: Reduce calls to bi-weekly or monthly (increase Slack usage)
3. **Cohort Calls**: Group similar customers into cohort calls (3-4 customers per call)
4. **Customer Success Manager**: Hire CSM at 20+ customers ($60K/year)
5. **Self-Service**: Build help center so customers can find answers without asking

**Timeline**:
- 1-5 customers: 1 Product Agent, weekly calls
- 5-10 customers: 1 Product Agent, bi-weekly calls
- 10-20 customers: 1 Product Agent + 0.5 CSM, monthly calls
- 20+ customers: 1 Product Agent + 1 CSM, quarterly calls

---

## Quick Reference: VoC Program Checklist

**Daily (Product Agent)**:
- [ ] Check Slack for new feedback
- [ ] Respond to feedback within 2 hours (issues) or 24 hours (requests)
- [ ] Log feedback in feedback/product.md

**Weekly (Product Agent)**:
- [ ] Send weekly survey (Friday 4 PM)
- [ ] Weekly check-in call (Friday 4:30 PM)
- [ ] Synthesize patterns (Monday 9 AM)
- [ ] Prioritize features based on feedback (Monday planning)
- [ ] Close feedback loops (communicate actions taken)

**Monthly (Product Agent)**:
- [ ] Monthly deep-dive interview (1st Friday)
- [ ] Monthly VoC metrics review
- [ ] Update roadmap based on feedback trends

**Quarterly (Product Agent + Manager)**:
- [ ] Quarterly executive interview
- [ ] Quarterly VoC report (trends, metrics, insights)
- [ ] Roadmap alignment review

---

**Document Owner**: Product Agent  
**Last Updated**: October 12, 2025  
**Next Review**: Post-Pilot (Nov 12, 2025)  
**Status**: Active - Implement Throughout Pilot

---

**End of Voice of Customer Program**

