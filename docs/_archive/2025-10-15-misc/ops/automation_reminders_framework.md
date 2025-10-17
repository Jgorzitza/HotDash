---
epoch: 2025.10.E1
doc: docs/ops/automation_reminders_framework.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Automation and Reminders Framework — HotDash OCC Sprint 2025-10-11T03:55Z

## Daily Automation Schedule (UTC)

### 02:00 - Nightly Metrics Collection

**Trigger**: `.github/workflows/nightly-metrics.yml` cron schedule
**Owner**: GitHub Actions (automated)
**Purpose**: Generate nightly evidence bundle data

```yaml
# Existing automation - operational
- cron: "0 2 * * *"
```

**Success Criteria**:

- Database metrics collected and stored
- AI logging pipeline execution
- Performance snapshots captured
- Compliance validation data generated

**Failure Handling**:

- Auto-retry once if timeout/network error
- Page reliability on-call for persistent failures
- Log failure details in GitHub Actions logs

### 02:30 - Evidence Bundle Generation

**Trigger**: Custom script execution post-nightly-metrics
**Owner**: Product Agent (automation)
**Purpose**: Consolidate evidence into standardized bundle format

**Implementation**:

```typescript
// scripts/ops/generate-evidence-bundle.ts
interface BundleGenerationConfig {
  sourceDataPath: string;
  targetBundlePath: string;
  bundleDate: string;
  checksumValidation: boolean;
  complianceChecks: boolean;
}

async function generateEvidenceBundle(config: BundleGenerationConfig) {
  // Collect test results from latest runs
  // Aggregate performance metrics
  // Generate compliance validation report
  // Create manifest with checksums
  // Validate bundle completeness
}
```

**Automation Setup**:

```bash
# Add to crontab or GitHub Actions workflow
30 2 * * * /usr/bin/node scripts/ops/generate-evidence-bundle.ts
```

### 08:30 - Nightly Job Verification

**Trigger**: GitHub Actions workflow or cron job
**Owner**: Product Agent (automated)
**Purpose**: Verify previous night's jobs completed successfully

**Verification Checklist**:

```yaml
name: Nightly Job Verification
on:
  schedule:
    - cron: "30 8 * * *"
  workflow_dispatch:

jobs:
  verify-nightly-jobs:
    runs-on: ubuntu-latest
    steps:
      - name: Check nightly metrics completion
        run: |
          # Verify nightly-metrics.yml completed successfully
          # Check evidence bundle generation
          # Validate bundle completeness

      - name: Update Linear issues
        if: success()
        run: |
          # Update OPS-NIGHTLY with success status
          # Link evidence bundle to DEPLOY-147

      - name: Escalate failures
        if: failure()
        run: |
          # Page reliability team
          # Create incident Linear issue
          # Update feedback/product.md with failure details
```

### 09:00 - Morning Evidence Bundle Linking

**Trigger**: GitHub Actions workflow
**Owner**: Product Agent (automated)
**Purpose**: Link latest evidence bundles to Linear and feedback/product.md

**Automation Script**:

```typescript
// scripts/ops/morning-linking-routine.ts
async function morningLinkingRoutine() {
  const bundleDate = new Date();
  bundleDate.setDate(bundleDate.getDate() - 1);
  const bundlePath = `artifacts/nightly/${bundleDate.toISOString().split("T")[0]}`;

  // 1. Validate bundle completeness
  const manifest = await validateBundleManifest(bundlePath);

  // 2. Update Linear issues
  await updateLinearIssues({
    "DEPLOY-147": {
      evidenceBundle: bundlePath,
      status: manifest.validation_status,
    },
    "OPS-NIGHTLY": {
      bundle: bundlePath,
      completeness: manifest.evidence_completeness,
    },
  });

  // 3. Update feedback/product.md
  await appendFeedbackEntry({
    timestamp: new Date().toISOString(),
    category: "Morning Evidence Bundle Link",
    summary: "Latest nightly evidence bundle processed and linked",
    evidence: bundlePath,
    decision: "Bundle ready for consumption by QA and compliance teams",
    nextActions: "[QA] Review by 12:00 UTC; [Compliance] Sign-off by 14:00 UTC",
  });
}
```

### 09:30 - Morning Blocker Updates

**Trigger**: GitHub Actions workflow + Linear API
**Owner**: Product Agent (semi-automated)
**Purpose**: Generate morning blocker status update

**Implementation**:

```yaml
name: Morning Blocker Updates
on:
  schedule:
    - cron: "30 9 * * *"
  workflow_dispatch:

jobs:
  morning-blockers:
    runs-on: ubuntu-latest
    steps:
      - name: Query Linear for blocked issues
        run: |
          # Query Linear API for issues in "Blocked" state
          # Group by blocker type and owner
          # Calculate aging in hours

      - name: Generate blocker report
        run: |
          # Create structured blocker report
          # Identify escalation candidates (>24h blocked)
          # Format for feedback/product.md update

      - name: Update feedback and Linear
        run: |
          # Append to feedback/product.md
          # Update Linear comments with blocker summary
          # Trigger escalation notifications if needed
```

### 10:00 - Daily Triage and Backlog Prioritization

**Trigger**: GitHub Actions workflow + Linear webhooks
**Owner**: Product Agent (semi-automated)
**Purpose**: Re-prioritize backlog based on current sprint impact

**Triage Automation**:

```typescript
// scripts/ops/daily-triage.ts
interface TriageConfig {
  sprintEndDate: Date;
  primaryBlockers: string[];
  complianceMilestones: string[];
}

async function dailyTriage(config: TriageConfig) {
  // 1. Fetch all Linear issues
  const issues = await linear.issues({
    filter: { state: { name: { in: ["Triage", "In Progress", "Blocked"] } } },
  });

  // 2. Re-rank by impact scoring
  const rankedIssues = issues
    .map((issue) => ({
      ...issue,
      impactScore: calculateImpactScore(issue, config),
    }))
    .sort((a, b) => b.impactScore - a.impactScore);

  // 3. Update priorities and labels
  for (const issue of rankedIssues) {
    await updateIssuePriority(issue);
  }

  // 4. Generate triage report
  await generateTriageReport(rankedIssues);
}
```

### 16:30 - Afternoon Blocker Updates

**Trigger**: GitHub Actions workflow
**Owner**: Product Agent (automated)
**Purpose**: End-of-day blocker status and escalation review

**Similar to morning blockers but with additional escalation logic**:

```typescript
// Enhanced afternoon logic
async function afternoonBlockerUpdate() {
  const blockers = await getBlockedIssues();

  // Check for issues blocked >24h
  const escalationCandidates = blockers.filter(
    (issue) => issue.blockedDurationHours > 24 && issue.priority === "P1-High",
  );

  // Auto-escalate to manager
  for (const issue of escalationCandidates) {
    await escalateToManager(issue);
  }

  // Generate afternoon report
  await generateBlockerReport("afternoon", blockers);
}
```

## Weekly Automation Schedule

### Monday 09:00 - Stack Compliance Audit Preparation

**Trigger**: GitHub Actions workflow (weekly)
**Owner**: Product Agent (automated)
**Purpose**: Pre-audit validation and checklist preparation

```yaml
name: Monday Audit Prep
on:
  schedule:
    - cron: "0 9 * * 1" # Monday 9:00 UTC
  workflow_dispatch:

jobs:
  audit-prep:
    runs-on: ubuntu-latest
    steps:
      - name: Run stack compliance validation
        run: |
          # Execute .github/workflows/stack_guardrails.yml
          # Verify Supabase-only backend
          # Check React Router 7 usage
          # Validate AI dependencies (OpenAI + LlamaIndex only)

      - name: Generate pre-audit report
        run: |
          # Create compliance validation summary
          # Identify any violations or concerns
          # Prepare audit checklist

      - name: Update AUDIT-STACK Linear issue
        run: |
          # Attach pre-audit validation results
          # Update audit preparation status
          # Notify audit participants
```

### Thursday 09:00 - Stack Compliance Audit Follow-up

**Trigger**: GitHub Actions workflow (weekly)
**Owner**: Product Agent (automated)
**Purpose**: Post-audit action item tracking

### Sunday 15:00 - Sprint Progress Review

**Trigger**: GitHub Actions workflow (weekly)
**Owner**: Product Agent (automated)
**Purpose**: Generate sprint summary and next week planning

## Linear Integration and Automations

### Issue Creation Rules

```typescript
// Linear webhook handler
async function handleIssueCreated(issue: LinearIssue) {
  // Auto-assign based on team labels
  if (issue.labels.includes("team:product")) {
    await issue.assignTo("product-agent");
  }

  // Set initial priority based on keywords
  const priority = determinePriority(issue.title, issue.description);
  await issue.updatePriority(priority);

  // Add to appropriate project board
  const project = determineProject(issue.labels);
  await issue.addToProject(project);
}
```

### Status Change Automations

```typescript
// Auto-comment on status changes
async function handleStatusChange(
  issue: LinearIssue,
  oldStatus: string,
  newStatus: string,
) {
  if (newStatus === "Blocked") {
    await issue.addComment(`
      Issue moved to Blocked status. 
      
      Next actions:
      - [ ] Identify blocking dependency
      - [ ] Set escalation timeline (24h for P1, 48h for P2)
      - [ ] Update blocker registry
      - [ ] Notify stakeholders
    `);
  }

  if (newStatus === "Review") {
    await issue.addComment(`
      Issue ready for review.
      
      Review checklist:
      - [ ] Evidence links attached
      - [ ] Acceptance criteria met
      - [ ] Stakeholder approval required
      - [ ] Documentation updated
    `);
  }
}
```

### Reminder and Escalation Automations

```typescript
// Daily reminder system
interface ReminderRule {
  condition: (issue: LinearIssue) => boolean;
  action: (issue: LinearIssue) => Promise<void>;
  frequency: "daily" | "weekly";
}

const reminderRules: ReminderRule[] = [
  {
    condition: (issue) =>
      issue.priority === "P0-Critical" && issue.status !== "Done",
    action: async (issue) => {
      await notifySlack(`P0 Critical issue requires attention: ${issue.title}`);
    },
    frequency: "daily",
  },
  {
    condition: (issue) =>
      issue.status === "Blocked" &&
      issue.blockedDurationHours > 24 &&
      issue.priority === "P1-High",
    action: async (issue) => {
      await escalateToManager(issue);
      await issue.addComment("Escalated to manager due to 24+ hour block");
    },
    frequency: "daily",
  },
];
```

## Notification and Escalation Framework

### Slack Integration

```typescript
// Slack notification service
class SlackNotifier {
  async notifyP0Critical(issue: LinearIssue) {
    await this.sendMessage("#hotdash-alerts", {
      text: `🚨 P0 Critical Issue: ${issue.title}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Issue*: ${issue.title}\n*Status*: ${issue.status}\n*Owner*: ${issue.assignee}`,
          },
        },
        {
          type: "actions",
          elements: [
            { type: "button", text: "View in Linear", url: issue.url },
            {
              type: "button",
              text: "View Evidence",
              url: `artifacts/issues/${issue.id}`,
            },
          ],
        },
      ],
    });
  }

  async dailyBlockerSummary(blockers: LinearIssue[]) {
    const summary = blockers
      .map(
        (issue) => `• ${issue.title} - ${issue.blockedDurationHours}h blocked`,
      )
      .join("\n");

    await this.sendMessage("#hotdash-product", {
      text: `📋 Daily Blocker Summary (${blockers.length} blocked issues)\n${summary}`,
    });
  }
}
```

### Manager Escalation Rules

```typescript
// Manager escalation system
class ManagerEscalator {
  shouldEscalate(issue: LinearIssue): boolean {
    return (
      (issue.priority === "P0-Critical" && issue.ageHours > 4) ||
      (issue.priority === "P1-High" &&
        issue.status === "Blocked" &&
        issue.blockedDurationHours > 24) ||
      (issue.labels.includes("compliance") && issue.status === "Blocked")
    );
  }

  async escalate(issue: LinearIssue) {
    // Create manager escalation issue
    const escalationIssue = await linear.createIssue({
      title: `ESCALATION: ${issue.title}`,
      description: `
        Original Issue: ${issue.url}
        Escalation Reason: ${this.getEscalationReason(issue)}
        Required Actions: Manager review and unblocking
        Timeline: Immediate attention required
      `,
      priority: "P0-Critical",
      labels: ["escalation", "manager-review"],
      assignee: "manager",
    });

    // Notify manager via multiple channels
    await this.notifyManager(issue, escalationIssue);
  }
}
```

## Failure Handling and Recovery

### Automation Failure Detection

```typescript
// Health check system for automations
class AutomationHealthCheck {
  async checkNightlyJobs() {
    const lastRun = await this.getLastNightlyMetricsRun();
    const hoursAgo = (Date.now() - lastRun.timestamp) / (1000 * 60 * 60);

    if (hoursAgo > 26) {
      // Allow 2h buffer past expected 24h cycle
      await this.createIncident({
        title: "Nightly Metrics Job Failed",
        priority: "P0-Critical",
        description: "Nightly metrics collection has not run in >26 hours",
      });
    }
  }

  async checkEvidenceBundles() {
    const expectedBundlePath = `artifacts/nightly/${this.getYesterdayDate()}`;
    const bundleExists = await this.checkBundleExists(expectedBundlePath);

    if (!bundleExists) {
      await this.createIncident({
        title: "Evidence Bundle Generation Failed",
        priority: "P1-High",
        description: "Daily evidence bundle was not generated",
      });
    }
  }
}
```

### Auto-Recovery Mechanisms

```typescript
// Auto-recovery for common failures
class AutoRecovery {
  async recoverFailedNightlyJob() {
    // Attempt to rerun failed nightly metrics
    await this.triggerWorkflow(".github/workflows/nightly-metrics.yml");

    // Wait for completion and verify
    const success = await this.waitForWorkflowCompletion(300); // 5 min timeout

    if (!success) {
      await this.escalateToReliability("Nightly job auto-recovery failed");
    }
  }

  async recoverMissingEvidenceBundle() {
    // Attempt to regenerate evidence bundle from available data
    await this.runScript("scripts/ops/generate-evidence-bundle.ts");

    // Validate bundle completeness
    const bundle = await this.validateBundle();
    if (!bundle.valid) {
      await this.createPartialBundleAlert();
    }
  }
}
```

## Success Metrics and Monitoring

### Automation Performance Metrics

```typescript
interface AutomationMetrics {
  nightlyJobSuccessRate: number; // Target: >99%
  evidenceBundleCompleteness: number; // Target: 100%
  reminderDeliveryLatency: number; // Target: <5 min
  escalationResponseTime: number; // Target: <1 hour for P0
  automationFailureRate: number; // Target: <1%
}

// Daily metrics collection
async function collectAutomationMetrics(): Promise<AutomationMetrics> {
  return {
    nightlyJobSuccessRate: await this.getNightlyJobSuccessRate(7), // Last 7 days
    evidenceBundleCompleteness: await this.getBundleCompletenessRate(7),
    reminderDeliveryLatency: await this.getReminderLatency(24), // Last 24 hours
    escalationResponseTime: await this.getEscalationResponseTime(7),
    automationFailureRate: await this.getAutomationFailureRate(7),
  };
}
```

### Automation Dashboard

- Real-time automation health status
- Daily/weekly success rate trends
- Failure root cause analysis
- Manual intervention requirements
- Recovery time objectives (RTO) tracking

---

**Implementation Priority**:

1. Nightly job verification (critical)
2. Morning linking routine (high)
3. Blocker update automation (high)
4. Escalation framework (medium)
5. Health monitoring dashboard (medium)
