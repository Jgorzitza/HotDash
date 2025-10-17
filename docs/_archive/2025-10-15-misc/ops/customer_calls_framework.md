---
epoch: 2025.10.E1
doc: docs/ops/customer_calls_framework.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Customer Calls Coordination Framework — HotDash OCC Sprint 2025-10-11T04:15Z

## Weekly Customer Call Schedule

### Call Frequency and Timing

- **Frequency**: Weekly 30-minute calls
- **Preferred Time**: Tuesday 14:00 UTC (flexible based on customer timezone)
- **Duration**: 30 minutes maximum per call
- **Owner**: Product Agent
- **Participants**: Customer/Design Partner + Product Agent + (optional) Engineering/UX

### Customer Segmentation and Rotation

#### Target Customer Types

1. **Design Partners**: Early adopters providing detailed feedback and co-creation input
2. **Beta Customers**: Active users in controlled rollout providing usage data and insights
3. **Prospect Customers**: Potential users evaluating solution and providing market validation
4. **Reference Customers**: Successful implementations providing case studies and testimonials

#### Weekly Rotation Schedule

```
Week 1: Design Partner Focus
Week 2: Beta Customer Check-in
Week 3: Prospect Discovery Call
Week 4: Reference Customer Success Review
[Repeat cycle with different customers in each category]
```

### Customer Contact Database

**Location**: `docs/customers/contact_database.md` (encrypted/access-controlled)
**Fields**: Company, Contact Name, Role, Email, Timezone, Customer Type, Last Contact Date, Next Scheduled Call

## Call Agenda Template

### Standard 30-Minute Agenda

```markdown
# Customer Call - [Company Name] - [Date]

**Participants**: [Names and roles]
**Duration**: 30 minutes
**Recording**: [Link to recording if approved]

## Agenda (30 minutes)

### 1. Opening & Context (5 minutes)

- Brief introductions if new participants
- Current sprint status and pause context update
- Agenda review and expectations setting

### 2. Operator Experience Walkthrough (10 minutes)

- Demo of current operator dashboard (if approved)
- Key workflow scenarios and decision points
- User interface and experience feedback
- Performance expectations and observations

### 3. Value Hypothesis Validation (10 minutes)

- Business value proposition alignment
- ROI expectations and measurement criteria
- Key use cases and success scenarios
- Integration requirements and constraints

### 4. Technical Requirements & Expectations (5 minutes)

- Latency and performance requirements
- Reliability and uptime expectations
- Security and compliance considerations
- Integration and deployment preferences

### 5. Open Questions & Feedback (5 minutes)

- Customer concerns or questions
- Feature requests and prioritization
- Timeline expectations and flexibility
- Next steps and follow-up actions
```

## Call Preparation Checklist

### Pre-Call Preparation (24 hours before)

- [ ] Review customer profile and previous call notes
- [ ] Prepare demo environment with relevant data scenarios
- [ ] Update current sprint status and pause communication
- [ ] Prepare questions based on customer type and history
- [ ] Send calendar invite with agenda and dial-in info
- [ ] Confirm technical setup (recording, screen sharing)

### During Call Execution

- [ ] Start recording (if approved) and note consent
- [ ] Follow agenda timing strictly (30 minutes max)
- [ ] Take detailed notes on feedback and requirements
- [ ] Capture verbatim quotes for key insights
- [ ] Document action items with owners and timelines
- [ ] Schedule follow-up if needed

### Post-Call Documentation (within 4 hours)

- [ ] Upload call recording to secure storage
- [ ] Complete call notes using standard template
- [ ] Create Linear issues for any feature requests or improvements
- [ ] Update customer profile with latest information
- [ ] Add insights to aggregated customer feedback document
- [ ] Send thank-you email with summary and next steps

## Call Notes Template

### Standard Call Notes Format

```markdown
# Customer Call Notes - [Company] - [YYYY-MM-DD]

## Call Details

- **Date/Time**: [YYYY-MM-DD HH:MM UTC]
- **Duration**: [XX minutes]
- **Participants**:
  - Customer: [Name, Role, Company]
  - HotDash: [Product Agent, others]
- **Recording**: [Link if available]
- **Customer Type**: [Design Partner/Beta/Prospect/Reference]

## Key Insights & Feedback

### Operator Experience Feedback

**Overall Sentiment**: [Positive/Neutral/Negative]
**Specific Feedback**:

- [Quote or paraphrased feedback item 1]
- [Quote or paraphrased feedback item 2]
- [Quote or paraphrased feedback item 3]

### Value Proposition Validation

**ROI Expectations**: [Customer's stated ROI targets]
**Primary Use Cases**: [Key scenarios customer wants to solve]
**Success Criteria**: [How customer will measure success]
**Compelling Value**: [Most compelling aspects mentioned]

### Technical Requirements

**Performance**: [Stated latency/response time requirements]
**Scale**: [Expected user count, transaction volume, etc.]
**Integration**: [Required integrations or compatibility needs]
**Deployment**: [Preferred deployment model and timeline]

### Concerns & Objections

**Primary Concerns**: [Main hesitations or concerns raised]
**Competitive Comparison**: [Mentioned alternatives or comparisons]
**Risk Factors**: [Identified risks or failure scenarios]
**Decision Timeline**: [Customer's decision-making timeline]

## Verbatim Quotes

> "[Exact customer quote that provides key insight]"

- Context: [When/why this was said]

> "[Another important direct quote]"

- Context: [Context for the quote]

## Action Items

| Action          | Owner       | Due Date   | Status |
| --------------- | ----------- | ---------- | ------ |
| [Action item 1] | Product     | YYYY-MM-DD | Open   |
| [Action item 2] | Customer    | YYYY-MM-DD | Open   |
| [Action item 3] | Engineering | YYYY-MM-DD | Open   |

## Follow-Up Plans

- **Next Call Scheduled**: [Date/Time if scheduled]
- **Next Milestone**: [Next expected touchpoint or milestone]
- **Demo/Pilot Timeline**: [If applicable]
- **Decision Timeline**: [Customer's expected decision timeframe]

## Linear Issues Created

- [CUSTOMER-XXX]: [Feature request title] - [Link]
- [FEEDBACK-XXX]: [Feedback item title] - [Link]

## Internal Notes

[Any sensitive or internal-only observations that shouldn't be shared with customer]
```

## Insights Aggregation and Analysis

### Weekly Insights Summary

After each call, update the aggregated insights document with:

#### Quantitative Metrics

- **Sentiment Score**: Rate overall customer sentiment (1-10 scale)
- **Feature Demand**: Count requests for specific features
- **Performance Requirements**: Collect latency and scale requirements
- **Timeline Pressure**: Track customer urgency levels

#### Qualitative Themes

- **Common Pain Points**: Recurring problems or challenges mentioned
- **Value Drivers**: Most frequently cited benefits or value propositions
- **Competitive Mentions**: References to alternatives or competitive solutions
- **Integration Needs**: Common integration patterns or requirements

### Monthly Insights Report

**Location**: `docs/customers/monthly_insights_YYYY-MM.md`
**Audience**: Internal stakeholders, management, product team
**Content**: Aggregated insights, trends, recommendations

```markdown
# Monthly Customer Insights Report - [Month Year]

## Executive Summary

- **Total Calls**: X calls across Y unique customers
- **Overall Sentiment**: [Average sentiment score and trend]
- **Key Themes**: [Top 3-5 insights from the month]
- **Critical Actions**: [Urgent items requiring immediate attention]

## Sentiment Analysis

| Customer Type   | Average Sentiment | Change from Previous Month |
| --------------- | ----------------- | -------------------------- |
| Design Partners | 8.2/10            | +0.3                       |
| Beta Customers  | 7.5/10            | -0.2                       |
| Prospects       | 6.8/10            | +0.5                       |
| References      | 9.1/10            | +0.1                       |

## Feature Request Frequency

| Feature            | Requests | Priority Score |
| ------------------ | -------- | -------------- |
| Advanced Analytics | 12       | High           |
| Mobile Interface   | 8        | Medium         |
| API Integrations   | 15       | High           |

## Performance Requirements Analysis

- **Response Time**: [P50/P90/P99 expectations from customers]
- **Uptime**: [Availability requirements and SLA expectations]
- **Scale**: [User counts, transaction volumes, data sizes]

## Competitive Intelligence

- **Most Mentioned Competitors**: [List and frequency]
- **Competitive Advantages**: [Our strengths mentioned by customers]
- **Competitive Threats**: [Areas where competitors are preferred]

## Recommendations

1. **Product Priorities**: [Recommendations for product roadmap]
2. **Engineering Focus**: [Technical investments suggested]
3. **Marketing Messages**: [Messaging that resonates most]
4. **Sales Enablement**: [Tools/content needed for sales team]
```

## Linear Integration for Customer Feedback

### Customer Feedback Issue Template

```markdown
Title: [CUSTOMER-XXX] [Brief Description] - [Company Name]
Priority: [P1-High/P2-Medium/P3-Low]
Labels: customer-feedback, [customer-type], [feature-category]

## Customer Details

- **Company**: [Company Name]
- **Contact**: [Primary Contact Name, Role]
- **Customer Type**: [Design Partner/Beta/Prospect/Reference]
- **Call Date**: [YYYY-MM-DD]

## Feedback Summary

[Brief summary of the customer feedback or request]

## Customer Quote

> "[Verbatim quote if impactful]"

## Business Context

- **Customer Use Case**: [How they plan to use this feature]
- **Business Impact**: [Expected ROI or business value]
- **Timeline**: [Customer's expected timeline]
- **Priority for Customer**: [High/Medium/Low]

## Technical Requirements

- **Functional Requirements**: [What the feature should do]
- **Performance Requirements**: [Speed, scale, reliability needs]
- **Integration Requirements**: [Systems it needs to work with]
- **Compliance Requirements**: [Security, data protection, audit needs]

## Impact Assessment

- **Other Customers**: [How many other customers have similar needs]
- **Revenue Impact**: [Potential revenue impact of this feature]
- **Competitive Impact**: [Does this address competitive gaps]
- **Technical Effort**: [Initial effort estimate]

## Related Issues

- Call Notes: [Link to detailed call notes]
- Related Customer Requests: [Links to similar requests]
- Existing Features: [Links to related existing functionality]

## Customer Success Criteria

[How the customer will measure success of this feature]
```

### Customer Feature Request Workflow

1. **During Call**: Note feature requests and capture customer context
2. **Post-Call**: Create Linear issue using customer feedback template
3. **Weekly Triage**: Review all customer feedback issues for prioritization
4. **Product Planning**: Include high-impact customer requests in sprint planning
5. **Customer Communication**: Update customers on progress via follow-up calls

## Success Metrics and KPIs

### Call Quality Metrics

- **Call Completion Rate**: % of scheduled calls that occur successfully
- **Customer Participation**: Average number of customer participants per call
- **Call Duration Efficiency**: % of calls that stay within 30-minute limit
- **Follow-up Rate**: % of calls with documented follow-up actions

### Insight Generation Metrics

- **Insights per Call**: Average number of actionable insights per call
- **Feature Request Rate**: Number of feature requests generated per call
- **Quote Capture**: % of calls with at least one verbatim quote captured
- **Linear Issue Creation**: % of calls resulting in Linear issues

### Customer Engagement Metrics

- **Sentiment Trend**: Month-over-month customer sentiment scoring
- **Repeat Engagement**: % of customers participating in multiple calls
- **Reference Conversion**: % of customers willing to provide references
- **Feedback Implementation**: % of customer requests that get implemented

### Business Impact Metrics

- **Feature Adoption**: Usage of features requested by customers
- **Customer Retention**: Correlation between call participation and retention
- **Sales Velocity**: Impact of customer calls on sales cycle length
- **Product-Market Fit**: Quantitative assessment of market alignment

## Automation and Integration

### Calendar and Scheduling

- **Calendar Integration**: Automated scheduling with timezone detection
- **Reminder System**: 24-hour and 1-hour call reminders
- **Rescheduling Automation**: Easy rescheduling with minimal friction

### Recording and Transcription

- **Auto-Recording**: Automatic call recording with consent management
- **Transcription Service**: AI-powered transcription for easier note-taking
- **Quote Extraction**: Automated identification of key quotes and insights

### Linear Integration

- **Auto-Issue Creation**: Streamlined creation of Linear issues from call notes
- **Tagging Automation**: Automatic labeling based on customer type and feedback category
- **Progress Updates**: Automated customer updates when their requested features ship

### Reporting Automation

- **Weekly Summaries**: Automated compilation of weekly insights
- **Monthly Reports**: Automated generation of monthly insights reports
- **Trend Analysis**: Automated detection of emerging themes and patterns

## Risk Management and Compliance

### Data Privacy and Security

- **Recording Consent**: Explicit consent for all call recordings
- **Data Retention**: Clear policies for how long call data is retained
- **Access Controls**: Limited access to customer information and recordings
- **Anonymization**: Customer data anonymization in reports when required

### Customer Relationship Management

- **Over-Communication Prevention**: Limits on call frequency per customer
- **Expectation Management**: Clear communication about product timeline and capabilities
- **Escalation Procedures**: Process for handling dissatisfied customers or urgent issues

### Competitive Intelligence Protection

- **NDA Management**: Ensuring appropriate confidentiality agreements
- **Sensitive Information**: Proper handling of competitive or proprietary information
- **Internal Communication**: Secure sharing of insights within the team

---

**Implementation Priority**:

1. Set up customer contact database and call scheduling system
2. Create call agenda templates and note-taking processes
3. Integrate with Linear for customer feedback tracking
4. Establish monthly insights reporting and analysis
5. Automate recording, transcription, and issue creation workflows
