---
epoch: 2025.10.E1
doc: docs/ops/daily_triage_routine.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Daily Triage Routine and Prioritized Backlog Maintenance — HotDash OCC Sprint 2025-10-11T04:12Z

## Daily Triage Schedule

### 10:00 UTC Daily Triage Window

**Duration**: 30 minutes maximum
**Owner**: Product Agent
**Purpose**: Re-prioritize backlog based on current sprint impact and emerging needs

### Triage Automation Trigger

```yaml
name: Daily Triage Automation
on:
  schedule:
    - cron: "0 10 * * *" # 10:00 UTC daily
  workflow_dispatch:

jobs:
  daily-triage:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch Linear issues
        run: |
          # Query Linear API for all active issues
          # Filter by current sprint and project
          # Group by priority and status

      - name: Calculate impact scores
        run: |
          # Run impact scoring algorithm
          # Update issue priorities based on scoring
          # Generate triage report

      - name: Update feedback log
        run: |
          # Append triage results to feedback/product.md
          # Link to updated issues and priority changes
```

## Impact Scoring Algorithm

### Primary Factors (Weighted Scoring)

1. **DEPLOY-147 Impact** (Weight: 40%)
   - Direct blocker: 100 points
   - Indirect dependency: 70 points
   - Supporting evidence: 40 points
   - No relation: 0 points

2. **Compliance Milestone Impact** (Weight: 30%)
   - SCC/DPA approval blocker: 100 points
   - Audit requirement: 70 points
   - Documentation need: 40 points
   - No compliance impact: 0 points

3. **Sprint Timeline Urgency** (Weight: 20%)
   - Must complete this week: 100 points
   - Must complete this sprint: 70 points
   - Can slip to next sprint: 40 points
   - Long-term backlog: 10 points

4. **Stakeholder Impact** (Weight: 10%)
   - Manager escalation: 100 points
   - Customer-facing issue: 70 points
   - Internal process improvement: 40 points
   - Nice-to-have enhancement: 10 points

### Impact Score Calculation

```typescript
// scripts/ops/impact-scoring.ts
interface IssueImpactScore {
  issueId: string;
  title: string;
  currentPriority: string;
  deployImpact: number;
  complianceImpact: number;
  timelineUrgency: number;
  stakeholderImpact: number;
  totalScore: number;
  recommendedPriority: string;
}

function calculateImpactScore(issue: LinearIssue): IssueImpactScore {
  const weights = {
    deploy: 0.4,
    compliance: 0.3,
    timeline: 0.2,
    stakeholder: 0.1,
  };

  const deployScore = assessDeployImpact(issue);
  const complianceScore = assessComplianceImpact(issue);
  const timelineScore = assessTimelineUrgency(issue);
  const stakeholderScore = assessStakeholderImpact(issue);

  const totalScore =
    deployScore * weights.deploy +
    complianceScore * weights.compliance +
    timelineScore * weights.timeline +
    stakeholderScore * weights.stakeholder;

  return {
    issueId: issue.id,
    title: issue.title,
    currentPriority: issue.priority,
    deployImpact: deployScore,
    complianceImpact: complianceScore,
    timelineUrgency: timelineScore,
    stakeholderImpact: stakeholderScore,
    totalScore: Math.round(totalScore),
    recommendedPriority: scoreToPriority(totalScore),
  };
}

function scoreToPriority(score: number): string {
  if (score >= 80) return "P0-Critical";
  if (score >= 60) return "P1-High";
  if (score >= 40) return "P2-Medium";
  return "P3-Low";
}
```

## Triage Process Flow

### 1. Data Collection (5 minutes)

```bash
# Fetch all active Linear issues
linear-cli issues list --state active --project "HotDash OCC Sprint" --format json > issues.json

# Fetch current sprint metadata
linear-cli projects show "HotDash OCC Sprint" --format json > sprint.json

# Fetch DEPLOY-147 status
linear-cli issues show DEPLOY-147 --format json > deploy-status.json
```

### 2. Impact Assessment (10 minutes)

- **Automated Scoring**: Run impact scoring algorithm on all issues
- **Manual Review**: Review high-impact score changes and edge cases
- **Dependency Analysis**: Check for new blockers or unblocked issues

### 3. Priority Adjustment (10 minutes)

- **Priority Updates**: Apply recommended priority changes
- **Label Management**: Update labels based on new priorities and categories
- **Assignment Review**: Ensure appropriate owners assigned

### 4. Documentation (5 minutes)

- **Triage Report**: Generate summary of priority changes
- **Feedback Update**: Log triage results in feedback/product.md
- **Sprint Link Update**: Update sprint view link if needed

## Backlog Prioritization Rules

### Priority Assignment Guidelines

#### P0-Critical (Sprint Blockers)

- **Criteria**: Blocks DEPLOY-147 or critical compliance milestone
- **Examples**: Failed nightly jobs, compliance violations, production issues
- **SLA**: Immediate attention, manager escalation if not addressed within 4 hours
- **WIP Limit**: Maximum 2 P0 issues active at any time

#### P1-High (Sprint Critical)

- **Criteria**: Must complete in current sprint, high DEPLOY-147 impact
- **Examples**: QA evidence gaps, performance optimization, documentation updates
- **SLA**: Daily progress check, escalate if blocked >24 hours
- **WIP Limit**: Maximum 5 P1 issues active at any time

#### P2-Medium (Sprint Important)

- **Criteria**: Important for sprint success but can slip if necessary
- **Examples**: Process improvements, automation enhancements, nice-to-have features
- **SLA**: Weekly progress review, can be deprioritized for higher priorities
- **WIP Limit**: No strict limit, but prefer focus on P0/P1

#### P3-Low (Backlog Items)

- **Criteria**: Future improvements, technical debt, long-term enhancements
- **Examples**: Code refactoring, documentation improvements, tool upgrades
- **SLA**: Monthly review, candidates for next sprint planning
- **WIP Limit**: Work on only when P0-P2 queues are clear

### Ad Hoc Request Handling

#### Request Intake Process

1. **Immediate Assessment**: Determine if request is critical (P0) or can wait for triage
2. **Linear Issue Creation**: Convert all requests to Linear issues with standard template
3. **Initial Labeling**: Apply appropriate labels and assign to triage queue
4. **Stakeholder Notification**: Acknowledge request and provide triage timeline

#### Standard Issue Template for Ad Hoc Requests

```markdown
Title: [REQUEST] [Brief Description]
Priority: [To be determined in triage]
Labels: request, triage-needed, [source-team]

## Request Details

- **Requestor**: [Name/Team]
- **Request Date**: [YYYY-MM-DD]
- **Urgency**: [Immediate/High/Medium/Low]
- **Business Justification**: [Why this is needed]

## Requirements

### Functional Requirements

- [ ] Requirement 1
- [ ] Requirement 2

### Non-Functional Requirements

- [ ] Performance requirements
- [ ] Compliance requirements
- [ ] Integration requirements

## Acceptance Criteria

- [ ] Criteria 1 with measurable outcome
- [ ] Criteria 2 with measurable outcome

## Impact Assessment

- **DEPLOY-147 Impact**: [High/Medium/Low/None]
- **Compliance Impact**: [High/Medium/Low/None]
- **Timeline Impact**: [Current Sprint/Next Sprint/Future]
- **Resource Requirements**: [Hours/Days estimated]

## Dependencies

- Related Linear issues: [Links]
- External dependencies: [List]
- Blocking issues: [List]

## Definition of Done

- [ ] Functional requirements met
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Stakeholder sign-off obtained
```

### Backlog Grooming Rules

#### Weekly Grooming (Fridays 15:00 UTC)

- **Scope**: Review all P2-P3 issues for next sprint readiness
- **Actions**:
  - Clean up completed/duplicate issues
  - Update estimates and acceptance criteria
  - Identify issues ready for next sprint
  - Archive old/irrelevant issues

#### Sprint Boundary Management

- **Sprint Overflow**: Move incomplete P2-P3 issues to next sprint
- **Scope Creep Prevention**: Require manager approval for new P1+ items after sprint start
- **Velocity Tracking**: Track completion rates to improve future sprint planning

## Sprint View Maintenance

### Sprint Dashboard Link

**Location**: feedback/product.md Quick Navigation Index
**Update Frequency**: Daily during triage, weekly during grooming

### Sprint View Configuration

```
HotDash OCC Sprint View
├── P0-Critical (🚨)
│   ├── DEPLOY-147 [Completed]
│   └── [Any active P0 items]
├── P1-High (🔴)
│   ├── COMP-SCC-DPA
│   ├── OPS-NIGHTLY
│   └── [Other P1 items]
├── P2-Medium (🟡)
│   ├── DOCS-DRY-RUN
│   ├── AUDIT-STACK
│   └── [Other P2 items]
└── P3-Low (🔵)
    ├── [Backlog items ready for next sprint]
    └── [Long-term improvement items]
```

### Sprint Metrics Tracking

```typescript
interface SprintMetrics {
  totalIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  blockedIssues: number;
  completionRate: number;
  velocityPoints: number;
  burndownProgress: number;
}

// Daily metrics collection during triage
async function updateSprintMetrics(): Promise<SprintMetrics> {
  const issues = await fetchSprintIssues();
  const completed = issues.filter((i) => i.status === "Done").length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const blocked = issues.filter((i) => i.status === "Blocked").length;

  return {
    totalIssues: issues.length,
    completedIssues: completed,
    inProgressIssues: inProgress,
    blockedIssues: blocked,
    completionRate: completed / issues.length,
    velocityPoints: calculateVelocityPoints(issues),
    burndownProgress: calculateBurndownProgress(issues),
  };
}
```

## Triage Report Template

### Daily Triage Summary

```markdown
### YYYY-MM-DDTHH:MM:SSZ — Daily Triage Results

- **Summary:** Daily backlog prioritization and impact assessment completed
- **Issues Reviewed**: XX total issues assessed
- **Priority Changes**: XX issues re-prioritized based on impact scoring
- **New Issues**: XX ad hoc requests converted to Linear issues
- **Evidence**:
  - Triage Report: [Link to detailed report]
  - Priority Changes: [List of significant changes]
  - Sprint Metrics: XX% completion rate, XX velocity points
  - Sprint View: [Updated Linear sprint view link]
- **Decision**: Backlog optimized for DEPLOY-147 and compliance milestone impact
- **Next Actions**: [Product] Monitor P0/P1 progress; [Teams] Execute prioritized work

#### Priority Changes Summary

| Issue         | Old Priority | New Priority | Rationale                     |
| ------------- | ------------ | ------------ | ----------------------------- |
| [Issue Title] | P2-Medium    | P1-High      | DEPLOY-147 blocker identified |
| [Issue Title] | P3-Low       | P2-Medium    | Compliance impact discovered  |

#### Sprint Health Check

- **P0 Issues**: X active (Target: ≤2)
- **P1 Issues**: X active (Target: ≤5)
- **Blocked Issues**: X total (Target: ≤3)
- **Completion Rate**: XX% (Target: >80%)
- **Velocity**: On track/Behind/Ahead of sprint target
```

## Automation and Integration

### Linear Webhook Integration

```typescript
// Handle new issue creation
async function handleNewLinearIssue(issue: LinearIssue) {
  // Auto-label as triage-needed
  await issue.addLabel("triage-needed");

  // Add to triage queue
  await addToTriageQueue(issue);

  // Set initial priority as P3-Low pending triage
  await issue.updatePriority("P3-Low");

  // Schedule for next triage window
  await scheduleForTriage(issue, getNextTriageTime());
}

// Handle priority changes
async function handlePriorityChange(
  issue: LinearIssue,
  oldPriority: string,
  newPriority: string,
) {
  // Log priority change
  await logPriorityChange(issue, oldPriority, newPriority);

  // Update watchers based on new priority
  if (newPriority === "P0-Critical") {
    await notifyManager(issue);
  }

  // Validate WIP limits
  await validateWIPLimits(newPriority);
}
```

### Slack Notifications

- **Daily Triage Summary**: Posted to #hotdash-product channel
- **P0 Escalations**: Immediate notifications for critical issues
- **WIP Limit Violations**: Alerts when too many high-priority issues active

## Success Metrics

### Triage Effectiveness

- **Triage Consistency**: <5 minutes average triage time per issue
- **Priority Accuracy**: <10% priority changes after initial triage
- **Stakeholder Satisfaction**: >90% approval rating on priority decisions

### Backlog Health

- **Sprint Completion Rate**: >80% of planned work completed
- **Scope Creep Rate**: <20% of issues added mid-sprint
- **Backlog Age**: <30 days average age for P1-P2 issues

### Automation Performance

- **Triage Automation Uptime**: >99% daily automation execution
- **Issue Creation Time**: <2 minutes from request to Linear issue
- **Notification Latency**: <5 minutes for critical issue alerts

---

**Implementation Steps**:

1. Set up daily triage automation at 10:00 UTC
2. Implement impact scoring algorithm and Linear integration
3. Create ad hoc request intake process and templates
4. Configure sprint view and metrics tracking
5. Establish weekly grooming and sprint boundary management
