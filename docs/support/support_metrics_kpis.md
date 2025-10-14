---
epoch: 2025.10.E1
doc: docs/support/support_metrics_kpis.md
owner: support
status: draft
last_updated: 2025-10-14T00:00:00Z
---

# Support Metrics and KPIs (Draft)

## Purpose
Define support success metrics, response time targets, and customer satisfaction measurement for Hot Rodan.

## Core Support Metrics

### 1. Response Time

**First Response Time (FRT)**:
- Definition: Time from customer inquiry to first support response
- Target: < 1 hour (business hours), < 4 hours (after hours)
- Measurement: Timestamp of inquiry → timestamp of first response

**Average Response Time (ART)**:
- Definition: Average time for all responses in a conversation
- Target: < 2 hours
- Measurement: Average of all response times per ticket

**Resolution Time**:
- Definition: Time from inquiry to issue resolution/close
- Target: < 24 hours (standard), < 4 hours (VIP/urgent)
- Measurement: Ticket open → ticket close

### 2. Customer Satisfaction (CSAT)

**Post-Interaction Survey**:
- Question: "How would you rate your support experience?"
- Scale: 1-5 stars (or thumbs up/down)
- Target: > 4.5 / 5 average (or > 90% positive)

**Net Promoter Score (NPS)**:
- Question: "How likely are you to recommend Hot Rodan to a friend?"
- Scale: 0-10 (Promoters: 9-10, Passives: 7-8, Detractors: 0-6)
- Target: NPS > 50 (Excellent), > 30 (Good)
- Calculation: % Promoters - % Detractors

**Customer Effort Score (CES)**:
- Question: "How easy was it to get your issue resolved?"
- Scale: 1-5 (Very Difficult → Very Easy)
- Target: > 4.2 / 5 average

### 3. Volume & Capacity

**Ticket Volume**:
- Definition: Number of support tickets per day/week/month
- Baseline: Track to understand patterns
- Use: Staffing planning, surge detection

**Tickets per Agent**:
- Definition: Average tickets handled per agent per day
- Target: 15-25 tickets/day (varies by complexity)
- Use: Workload balance, performance assessment

**Ticket Backlog**:
- Definition: Number of open/unresolved tickets
- Target: < 10 tickets aged > 24 hours
- Use: Capacity planning, priority management

### 4. Quality Metrics

**First Contact Resolution (FCR)**:
- Definition: % of issues resolved in first interaction (no follow-up needed)
- Target: > 70%
- Measurement: Tickets closed after 1 response / total tickets

**Escalation Rate**:
- Definition: % of tickets escalated to Tier 2/3
- Target: < 20%
- Measurement: Escalated tickets / total tickets

**Reopened Tickets**:
- Definition: % of tickets reopened after being marked resolved
- Target: < 5%
- Measurement: Reopened tickets / closed tickets

**Quality Score (Internal)**:
- Definition: Manager review of support interactions (communication, accuracy, helpfulness)
- Scale: 1-10
- Target: > 8.5 average
- Process: Random sampling, 5-10 tickets per agent per week

### 5. Channel Metrics

**By Channel** (Email, Chat, Phone):
- Volume per channel
- Response time per channel
- CSAT per channel
- FCR per channel

**Channel Preference**:
- Track which channels customers prefer
- Optimize staffing based on channel demand

## Hot Rodan-Specific Metrics

### 1. Technical Accuracy

**Fitment Success Rate**:
- Definition: % of fitment recommendations that work correctly
- Target: > 95%
- Measurement: Follow-up survey or no fitment-related returns

**Technical Escalation Quality**:
- Definition: % of escalations with complete information (no back-and-forth)
- Target: > 80%
- Measurement: Tech specialist rating of escalation quality

### 2. Race Weekend Performance

**Emergency Order Success Rate**:
- Definition: % of race weekend rush orders delivered on time
- Target: > 90%
- Measurement: Delivered by deadline / total emergency orders

**Event Support Response Time**:
- Definition: Response time during event hotline hours
- Target: < 30 minutes
- Measurement: Customer inquiry → first response during events

### 3. Return/Warranty Metrics

**Return Rate**:
- Definition: % of orders that result in return
- Baseline: Industry average ~2-5%
- Target: < 3%
- Measurement: Returns / total orders

**Warranty Claim Approval Rate**:
- Definition: % of warranty claims approved by vendor
- Target: > 70% (shows we're submitting valid claims)
- Measurement: Approved claims / total claims

**Average Return Resolution Time**:
- Definition: Time from return request to refund/exchange complete
- Target: < 5 business days
- Measurement: RMA request → refund issued or exchange shipped

### 4. Upsell/Cross-Sell

**Attachment Rate**:
- Definition: % of support interactions that result in additional purchase
- Target: > 10%
- Measurement: Support tickets with related purchase / total tickets

**Average Order Value (AOV) - Support Driven**:
- Definition: Average order value when placed through support
- Target: 20% higher than website average
- Measurement: Support orders total value / support orders count

## Reporting & Dashboards

### Daily Dashboard

**Morning Standup (9 AM)**:
- Open tickets (count and age)
- Yesterday's metrics (FRT, CSAT, volume)
- Today's priorities (VIP tickets, escalations, aged items)
- Staffing (who's on, who's off, coverage gaps)

**Format**:
```
📊 Daily Support Metrics - [Date]

Open Tickets: [X] ([Y] > 24hrs old)
Yesterday:
  - FRT: [X] min
  - CSAT: [X]%
  - Volume: [X] tickets
  - FCR: [X]%

Today's Priorities:
  1. [VIP ticket #123 - race weekend]
  2. [Aged ticket #456 - 3 days old]
  3. [Escalation #789 - awaiting vendor]

Coverage: [Names on shift today]
```

### Weekly Report

**Monday Review (Previous Week)**:
- Volume trends (up/down vs. prior week)
- Performance vs. targets (FRT, CSAT, FCR, etc.)
- Top issues (categories, products, problems)
- Agent performance (tickets handled, quality, CSAT)
- Action items for coming week

### Monthly Report

**Executive Summary**:
- Key metrics vs. targets (dashboard view)
- Trends (3-month view)
- Wins (stories, highlights, customer praise)
- Challenges (recurring issues, capacity concerns)
- Recommendations (process improvements, staffing, training)

**Deep Dives**:
- Product quality issues (returns, warranties by SKU)
- Vendor performance (quality, warranty approval rate)
- Channel analysis (email vs. chat vs. phone)
- Agent development (training needs, promotion readiness)

## Target Setting & Benchmarks

### Industry Benchmarks (B2C Ecommerce)

**Response Time**:
- Excellent: < 1 hour FRT
- Good: 1-4 hours FRT
- Poor: > 24 hours FRT

**CSAT**:
- Excellent: > 90%
- Good: 80-90%
- Poor: < 80%

**FCR**:
- Excellent: > 75%
- Good: 65-75%
- Poor: < 65%

### Hot Rodan Targets (Aspirational)

**Year 1**:
- FRT: < 2 hours
- CSAT: > 85%
- FCR: > 65%
- Resolution Time: < 48 hours

**Year 2** (Optimized):
- FRT: < 1 hour
- CSAT: > 90%
- FCR: > 75%
- Resolution Time: < 24 hours

**Year 3** (Best-in-Class):
- FRT: < 30 min
- CSAT: > 95%
- FCR: > 80%
- Resolution Time: < 12 hours

## Using Metrics to Improve

### Performance Reviews

**Agent Scorecards** (Monthly):
- Tickets handled
- Average FRT/Resolution Time
- CSAT score
- Quality score (manager review)
- Notable wins (customer praise, creative solutions)
- Development areas (training needs, skills gaps)

### Process Improvements

**Identify Bottlenecks**:
- High volume categories → Create self-service content
- Low FCR categories → Improve training, better tools
- High escalation rate → Empower Tier 1 with more knowledge

**Example**:
- Problem: FCR for "fuel pump sizing" is 50% (industry: 70%)
- Root cause: Agents lack calculation knowledge
- Solution: Training on fuel pump sizing, create calculator tool
- Result: FCR improves to 72% in 30 days

### Customer Feedback Loop

**CSAT Analysis**:
- Read every < 3-star review
- Identify patterns (slow response, wrong info, rude tone)
- Action plan (coaching, process change, tool improvement)

**NPS Analysis**:
- Detractors (0-6): What made them unhappy? Fix it.
- Passives (7-8): What would make them promoters? Do it.
- Promoters (9-10): What delighted them? Replicate it.

## Metric Gamification (Optional)

### Team Challenges

**Weekly Wins**:
- Highest CSAT: $50 bonus
- Fastest FRT: Team lunch
- Most FCRs: Extra PTO day
- Creative Solution of the Week: Public recognition + swag

**Monthly Goals**:
- Team hits > 90% CSAT → Pizza party
- Team hits > 80% FCR → Half-day Friday
- Team hits all targets → $500 team budget (spend on outing/dinner)

### Leaderboards

**Post Weekly** (Internal):
- Top 3 agents by CSAT
- Top 3 by FCR
- Top 3 by tickets handled
- "Agent of the Week" (combo of metrics + quality)

**Recognition**:
- Spotlight in team meeting
- Feature in newsletter
- Social media shoutout (with permission)
- Gift card or bonus

## Continuous Improvement

### Monthly Metric Review

**Questions to Ask**:
1. Are we hitting targets? (If not, why?)
2. What's trending up? (Volume, escalations, complaints)
3. What's trending down? (CSAT, FCR, quality)
4. What changed? (New products, process tweaks, staffing)
5. What should we try? (Experiments, pilots, training)

### Quarterly Strategic Review

**Bigger Picture**:
- Are targets still relevant? (Adjust if needed)
- Are we tracking the right metrics? (Add/remove)
- What's the ROI of support? (Revenue driven, churn prevented)
- How does support contribute to business goals? (Retention, advocacy, upsell)

---
Status: Draft metrics framework. Update with actual targets and reporting cadence.

