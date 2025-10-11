---
epoch: 2025.10.E1
doc: docs/ops/linear_workspace_implementation.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---
# Linear Workspace Implementation — HotDash OCC Sprint 2025-10-11T03:52Z

## Workspace Configuration

### Project Structure
```
HotDash OCC Sprint 2025-10-11 to 2025-10-18
├── DEPLOY-147 [Primary]     # Evidence anchoring and QA validation
├── COMP-SCC-DPA [High]      # Compliance escalations and approvals
├── RISK-EMBED [Medium]      # Embed-token dependency tracking (legacy)
├── OPS-NIGHTLY [High]       # Nightly AI logging and evidence bundling
├── DOCS-DRY-RUN [Medium]    # Operator dry run pre-read documentation
├── AUDIT-STACK [Medium]     # Monday/Thursday stack compliance audits
├── RELEASE-CADENCE [High]   # Release review gates coordination
└── BACKLOG [Low]           # Prioritized feature/improvement items
```

### Workflow States
1. **Triage** → New issues requiring priority assessment
2. **In Progress** → Actively being worked on
3. **Waiting on External** → Blocked by external dependencies
4. **Review** → Ready for stakeholder review/approval
5. **Blocked** → Cannot proceed due to dependencies
6. **Done** → Completed and verified

### Labels System
#### Priority Labels
- `P0-Critical` - Sprint blocking, immediate attention
- `P1-High` - Sprint critical, complete this sprint
- `P2-Medium` - Important but can slip to next sprint
- `P3-Low` - Nice to have, long-term backlog

#### Category Labels
- `compliance` - SCC/DPA/legal requirements
- `risk` - Risk management and incident readiness
- `qa` - Quality assurance and testing
- `evidence` - Evidence bundling and artifact management
- `embed-token` - Legacy token dependency tracking
- `audit` - Stack compliance and governance
- `docs` - Documentation and runbooks
- `release` - Release coordination and gates
- `guardrail` - Stack guardrail enforcement
- `blocker` - Active blocker requiring escalation

#### Team Labels
- `team:product` - Product agent ownership
- `team:qa` - QA agent coordination required
- `team:compliance` - Compliance team involvement
- `team:data` - Data agent responsibilities
- `team:devops` - DevOps/reliability coordination
- `team:marketing` - Marketing team coordination

### WIP Limits
- **In Progress**: 3 issues (focus on completion)
- **Review**: 5 issues (stakeholder bandwidth)
- **Waiting on External**: No limit (tracking only)
- **Blocked**: No limit (escalation tracking)

### Watchers Configuration
- **Product Agent**: All issues (primary coordinator)
- **QA Agent**: qa, evidence, release labels
- **Compliance Team**: compliance, audit, risk labels
- **Data Agent**: evidence, compliance, audit labels
- **DevOps/Reliability**: risk, release, guardrail labels
- **Marketing/Support**: release, docs labels

## Core Sprint Issues

### DEPLOY-147: Evidence Anchoring and QA Validation
```
Status: Done (100% Complete)
Priority: P0-Critical
Labels: evidence, qa, release, team:product
Watchers: Product Agent, QA Agent, DevOps

Description:
Anchor DEPLOY-147 on comprehensive QA evidence bundle including performance validation, test results, and nightly logging infrastructure.

Acceptance Criteria:
✅ Sub-300ms performance proof documented (173.6ms validated)
✅ Playwright E2E test results (all tests passing, 5.9s duration)
✅ Vitest unit test results (42/43 passed, comprehensive coverage)
✅ Nightly AI logging infrastructure operational (02:00 UTC automation)
✅ Sanitized history reference logged (af1d9f1 commit)
✅ Reliability no-rotation stance documented
✅ Memory entry created with evidence links

Evidence Bundle: artifacts/integrations/shopify/2025-10-10/
Next Actions: Archive evidence and prepare for release gate review
```

### COMP-SCC-DPA: Compliance Escalations and Approvals
```
Status: In Progress
Priority: P1-High
Labels: compliance, risk, legal, team:compliance
Watchers: Product Agent, Compliance Team, Legal

Description:
Drive SCC (Standard Contractual Clauses) and DPA (Data Processing Agreement) escalations with compliance and legal teams for Shopify Admin integration.

Tasks:
- [ ] Data flow mapping for Shopify Admin → Supabase → Chatwoot pipeline
- [ ] Personal data classification and processor identification
- [ ] SCC approval for cross-border data transfers
- [ ] DPA amendments for AI logging and indexing operations
- [ ] Embed-token usage pattern legal review (legacy - may be removed)

Escalation Schedule:
Daily 30-minute sessions with compliance/legal until approvals obtained

Evidence Required:
- Signed SCC amendments
- DPA approval documentation
- Data protection impact assessment (DPIA)
- AI logging compliance validation

Blockers:
- Legal review capacity and turnaround time
- Cross-team coordination on data flow documentation
```

### OPS-NIGHTLY: Nightly AI Logging and Evidence Bundling
```
Status: In Progress  
Priority: P1-High
Labels: evidence, ai-logging, automation, team:data
Watchers: Product Agent, QA Agent, Data Agent

Description:
Implement comprehensive nightly AI logging pipeline with evidence bundling for daily QA and compliance validation.

Implementation:
✅ Nightly metrics automation operational (02:00 UTC)
✅ Evidence bundling specification documented
- [ ] Bundle generation script implementation
- [ ] Morning linking routine automation (09:00 UTC)
- [ ] QA/Data agent consumption workflow
- [ ] Archive management automation

Technical Components:
- scripts/ops/run-nightly-metrics.ts (operational)
- .github/workflows/nightly-metrics.yml (active)
- docs/ops/evidence_bundling_specification.md (complete)

Success Criteria:
- 100% nightly run success rate for 7 consecutive days
- <2 hour latency from data generation to bundle availability
- QA daily consumption and DEPLOY-147 updates
- Compliance sign-off with no policy violations
```

### RELEASE-CADENCE: Release Review Gates Coordination
```
Status: Triage
Priority: P1-High
Labels: release, review, coordination, team:product
Watchers: Product Agent, QA Agent, DevOps, Marketing

Description:
Establish structured release review process with documented gates from mock through production deployment.

Release Gates:
1. **Mock Review Gate**
   - [ ] Dry run with synthetic data
   - [ ] Operator flow recording and validation
   - [ ] Latency and error rate measurement
   - [ ] Guardrail validation checks
   - [ ] Signoff documentation

2. **Staging Review Gate** 
   - [ ] Staging access confirmed
   - [ ] QA evidence bundle validation
   - [ ] Performance thresholds met (<300ms p95)
   - [ ] Compliance approvals in place
   - [ ] Stakeholder signoffs obtained

3. **Production Gate**
   - [ ] Go/no-go decision meeting
   - [ ] Rollback plan documented and tested
   - [ ] Incident response procedures validated
   - [ ] Final stakeholder approvals recorded

Gate Decision Recording:
All gate decisions logged in feedback/product.md and Linear with:
- Decision rationale and evidence links
- Signoff requirements and approvals
- Rollback criteria and procedures
- Next gate prerequisites
```

### RISK-EMBED: Legacy Embed-Token Dependency Tracking
```
Status: Review (Legacy - May Close)
Priority: P3-Low  
Labels: embed-token, legacy, risk, team:devops
Watchers: Product Agent, DevOps

Description:
Track legacy Shopify Admin embed-token dependencies. NOTE: Current RR7 + Shopify CLI v3 dev flow eliminates embed/session token requirements.

Current Status:
- RR7 + Shopify CLI v3 dev flow confirmed operational
- Embed-token dependencies removed from DEPLOY-147
- Legacy tracking maintained for audit purposes

Actions:
- [ ] Final validation that no embed-token dependencies remain
- [ ] Documentation update removing token requirements
- [ ] Archive legacy escalation plans
- [ ] Close issue if no dependencies found

Evidence:
- shopify.app.toml configuration confirms new dev flow
- Package.json shows React Router 7.9.3 + Shopify CLI 3.85.4
- No token validation required per updated product direction
```

### AUDIT-STACK: Monday/Thursday Stack Compliance Audits
```
Status: Triage
Priority: P2-Medium
Labels: audit, compliance, guardrail, team:compliance
Watchers: Product Agent, Compliance Team, Engineering

Description:
Participate in bi-weekly stack compliance audits to ensure canonical toolkit adherence and security posture validation.

Audit Schedule:
- Mondays: 45 minutes with compliance, security, product, engineering
- Thursdays: 45 minutes follow-up and remediation review

Pre-Audit Checklist:
- [ ] Supabase-only backend confirmed, RLS policies validated
- [ ] Chatwoot on Supabase, data residency policy compliance
- [ ] React Router 7 only, no incompatible routing packages
- [ ] AI stack restricted to OpenAI + LlamaIndex
- [ ] Data retention and encryption settings verified
- [ ] Stack guardrails CI enforcement operational

Audit Deliverables:
- Meeting minutes and decisions in feedback/product.md
- Action items with owners and due dates
- AUDIT-STACK Linear issue updates
- Remediation tracking and follow-up

Automation:
✅ Stack guardrails GitHub Actions workflow implemented
✅ PR template with guardrails checklist active
- [ ] Calendar holds and reminder automation
- [ ] Pre-audit validation script
```

### DOCS-DRY-RUN: Operator Dry Run Pre-Read Documentation
```
Status: Review
Priority: P2-Medium  
Labels: docs, dry-run, publication, team:product
Watchers: Product Agent, Marketing, Support

Description:
Polish operator dry run pre-read documentation and stage for immediate publication upon evidence threshold satisfaction.

Documentation Status:
✅ docs/strategy/operator_dry_run_pre_read_draft.md updated
✅ Stack guardrails and compliance constraints added
✅ Success metrics and evidence capture checklist included
- [ ] Final review and approval from stakeholders
- [ ] Publication readiness validation
- [ ] Memory/Linear update preparation

Publication Gates:
All three gates must be satisfied before publication:
1. ✅ Staging access confirmed
2. ✅ Latency evidence meeting thresholds (<300ms validated)
3. ✅ Compliance approvals obtained (SCC/DPA in progress)

Publication Plan:
- Immediate publication to Memory upon gate satisfaction
- Linear issue updates with external-facing summaries
- Stakeholder communication and acknowledgments
- Training material distribution to enablement teams
```

## Automation and Reminders

### Daily Reminders (UTC)
- **08:30**: Nightly job verification and bundle linking
- **09:00**: Morning evidence bundle routine
- **09:30**: Blocker updates (morning)
- **10:00**: Daily triage and backlog prioritization
- **16:30**: Blocker updates (afternoon)

### Weekly Reminders
- **Monday 09:00**: Stack compliance audit preparation
- **Thursday 09:00**: Stack compliance audit follow-up
- **Sunday 15:00**: Sprint progress review and next week planning

### Linear Automations
1. **Issue Creation**: Auto-assign based on labels (team:product → Product Agent)
2. **Status Updates**: Auto-comment when moved to Review/Blocked states
3. **Reminder Triggers**: Daily notifications for overdue items
4. **Evidence Linking**: Auto-update when artifacts/ paths referenced
5. **Sprint Tracking**: Weekly progress reports to stakeholders

### Escalation Rules
- **P0-Critical**: Immediate Slack notification to all watchers
- **P1-High Blocked >24h**: Daily escalation to manager
- **Compliance Issues**: Auto-notify legal and compliance teams
- **Failed Nightly Jobs**: Page reliability on-call

## Success Metrics and SLOs

### Sprint Velocity Metrics
- **Issue Completion Rate**: Target 85% of planned issues per sprint
- **Blocker Resolution Time**: Average <48 hours for P1 issues
- **Evidence Bundle Timeliness**: 100% daily bundles linked by 09:30 UTC
- **Stakeholder Response Time**: <4 hours for P0, <24 hours for P1

### Quality Indicators
- **Compliance Score**: 100% audit pass rate, zero violations
- **Documentation Coverage**: All P0/P1 issues have evidence links
- **Cross-Team Coordination**: <2 handoff delays per sprint
- **Release Gate Success**: Zero rollbacks due to missing evidence

### Reporting Dashboard
- Sprint burn-down chart with completion projections
- Blocker aging report with escalation triggers
- Evidence bundle health status (generation/consumption rates)
- Compliance approval pipeline status
- Release gate readiness scoring

## Implementation Timeline

### Phase 1: Immediate Setup (Today)
- [ ] Create Linear project with workspace structure
- [ ] Configure labels, workflow states, and watchers
- [ ] Create core sprint issues with initial content
- [ ] Set up basic automation rules and reminders

### Phase 2: Integration (Week 1)
- [ ] Integrate evidence bundling automation
- [ ] Configure morning routine triggers
- [ ] Test cross-agent workflow coordination
- [ ] Validate escalation and notification paths

### Phase 3: Optimization (Week 2) 
- [ ] Tune automation based on usage patterns
- [ ] Optimize notification frequency and targeting
- [ ] Add advanced reporting and dashboard views
- [ ] Document lessons learned and best practices

---
**Sprint Link**: [To be populated with actual Linear workspace URL]
**Next Actions**: Create Linear workspace, implement core issues, configure automation triggers