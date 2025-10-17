---
epoch: 2025.10.E1
doc: docs/data/nightly_ai_logging_implementation_plan_2025-10-11.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Nightly AI Logging & Index Cadence — Implementation Plan 2025-10-11T01:40Z

## Schedule & Retention Policy

- **Target Schedule:** 02:00 UTC daily (automated execution)
- **Artifact Retention:** Minimum 14 days, maximum 30 days for compliance
- **Reporting Window:** Evidence bundle linked in feedback/product.md by 08:30 UTC following day
- **Linear Updates:** Daily attachment of index freshness report to DEPLOY-147

## Data Sources & Processing Pipeline

### 1. Application Logs (AI Feature Focus)

```
Source: App service logs via structured logging
├── AI Decision Latency: Response times for OpenAI API calls
├── LlamaIndex Query Performance: Embedding search and context retrieval
├── Error Rates: Failed AI suggestions, timeout events, API quota issues
└── Sanitization Events: PII detection and redaction in prompts
```

### 2. LlamaIndex Build Logs & Index Stats

```
Source: scripts/ai/build-llama-index.ts execution output
├── Index Size: Document count, vector dimensions, storage utilization
├── Build Duration: Full rebuild time, incremental update performance
├── Content Analysis: Document types processed, chunk counts per source
└── Checkpoints: Snapshot metadata, hash validation, rollback readiness
```

### 3. Chatwoot Transcript Metadata (PII Redacted)

```
Source: Supabase dashboard_facts table (factType=chatwoot.escalations)
├── Volume Metrics: Conversation count, message count, SLA breach frequency
├── Sanitized Patterns: Common PII types detected and redacted before processing
├── Decision Outcomes: Operator actions taken, AI suggestion acceptance rates
└── Retention Compliance: 14-day purge validation, audit trail preservation
```

### 4. Supabase Database Performance (OCC Scope)

```
Source: Supabase monitoring API + pg_cron evidence
├── Query Performance: decision_log/facts table response times
├── Storage Growth: Table size growth rates, retention policy effectiveness
├── Connection Metrics: Service key usage patterns, connection pooling efficiency
└── Backup/Recovery: Automated backup success, point-in-time recovery readiness
```

## Evidence Bundle Structure

### Daily Artifact Organization

```
artifacts/nightly/YYYY-MM-DD/
├── ai_logs_summary.json          # Application AI feature logs digest
├── llamaindex_build_report.json  # Index build stats and validation
├── chatwoot_volume_metrics.json  # Sanitized conversation analytics
├── supabase_performance.json     # Database metrics and health checks
├── compliance_validation.json    # PII redaction audit, retention verification
└── bundle_manifest.json          # Checksum registry, data freshness timestamps
```

### Index Freshness Report Template

```json
{
  "timestamp": "2025-10-11T02:00:00.000Z",
  "index_stats": {
    "document_count": 1247,
    "last_rebuild": "2025-10-10T02:00:00.000Z",
    "freshness_hours": 24,
    "vector_dimensions": 1536,
    "storage_mb": 89.4
  },
  "data_sources": {
    "docs_runbooks": {
      "last_updated": "2025-10-10T14:32:00.000Z",
      "doc_count": 78
    },
    "support_faqs": {
      "last_updated": "2025-10-09T16:45:00.000Z",
      "doc_count": 34
    },
    "compliance_evidence": {
      "last_updated": "2025-10-10T19:15:00.000Z",
      "doc_count": 12
    }
  },
  "compliance_status": {
    "pii_redaction": "PASS",
    "retention_policy": "PASS",
    "access_controls": "PASS",
    "audit_trail": "COMPLETE"
  }
}
```

## Team Coordination Protocol

### QA Agent Responsibilities

1. **Daily Consumption:** Check evidence bundle by 09:00 UTC and validate completeness
2. **DEPLOY-147 Updates:** Attach index freshness summary to Linear issue with pass/fail assessment
3. **Regression Testing:** Include AI logging artifacts in end-to-end test validation
4. **Performance Validation:** Confirm index query times meet sub-300ms target for staging

### Data Agent Responsibilities

1. **Redaction Validation:** Audit PII detection and sanitization effectiveness daily
2. **Retention Sign-off:** Verify automated purge operations and compliance with data inventory
3. **Quality Metrics:** Monitor data completeness, accuracy, and freshness indicators
4. **Compliance Reporting:** Document any data protection violations or retention policy gaps

### Product Agent Responsibilities

1. **Morning Linking:** Add evidence bundle path to feedback/product.md by 08:30 UTC
2. **Cross-Team Sync:** Coordinate QA validation and Data sign-off requirements
3. **Linear Automation:** Ensure OPS-NIGHTLY Linear issue reflects latest status
4. **Escalation Management:** Handle any nightly job failures or compliance issues

## Implementation Steps & Dependencies

### Phase 1: Pipeline Setup (2025-10-11 to 2025-10-12)

- [ ] Configure artifact storage path and retention automation
- [ ] Implement nightly script with JSON output formatting
- [ ] Set up automated evidence bundle generation at 02:00 UTC
- [ ] Create Linear automation for OPS-NIGHTLY status updates

### Phase 2: QA Integration (2025-10-12 to 2025-10-13)

- [ ] QA Agent testing of evidence bundle consumption workflow
- [ ] DEPLOY-147 attachment process validation and templates
- [ ] Index freshness validation criteria and pass/fail thresholds
- [ ] Staging performance benchmarking with AI logging overhead

### Phase 3: Data Compliance (2025-10-13 to 2025-10-14)

- [ ] Data Agent PII redaction audit procedures implementation
- [ ] Retention policy automation verification and testing
- [ ] Compliance reporting integration with evidence archive
- [ ] Data quality metrics dashboard or monitoring setup

### Phase 4: Production Readiness (2025-10-14 to 2025-10-16)

- [ ] End-to-end pipeline testing with realistic data volumes
- [ ] Failure handling and alerting for missed nightly runs
- [ ] Performance impact assessment on production workloads
- [ ] Documentation and runbook completion for operational handoff

## Linear Automation & Reminders

### OPS-NIGHTLY Issue Structure

```
Title: OPS-NIGHTLY - AI Logging & Index Cadence Coordination
Status: In Progress
Priority: High
Labels: ai-logging, index-cadence, evidence, automation

Acceptance Criteria:
- [ ] 02:00 UTC automated execution successful for 7 consecutive days
- [ ] QA daily evidence bundle consumption and DEPLOY-147 updates
- [ ] Data Agent compliance sign-off with no policy violations
- [ ] Sub-300ms index query performance maintained in staging
- [ ] 14-day artifact retention automation verified

Daily Updates:
- Evidence bundle path: [Link to latest artifacts/nightly/YYYY-MM-DD/]
- QA validation status: [PASS/FAIL/PENDING]
- Data compliance sign-off: [APPROVED/ISSUES/PENDING]
- Performance metrics: [Sub-300ms: YES/NO, Index size: X MB]
```

### Automated Reminder Schedule

- **01:55 UTC:** Pre-flight check reminder (verify dependencies running)
- **02:05 UTC:** Post-execution validation (confirm artifacts generated)
- **08:25 UTC:** Morning evidence linking reminder for Product Agent
- **08:35 UTC:** QA validation reminder with bundle path
- **16:00 UTC:** Data Agent compliance review reminder
- **17:00 UTC:** Linear issue status update with all team confirmations

## Success Criteria & Monitoring

### Daily Success Metrics

- **Execution Success Rate:** 100% nightly runs completed within 30-minute window
- **Evidence Completeness:** All 6 artifact files generated with valid checksums
- **Index Freshness:** <24 hours staleness, rebuild success rate >99%
- **Performance Impact:** <5% latency increase on staging environment

### Weekly Quality Metrics

- **PII Redaction Accuracy:** >99.9% sensitive data detection and sanitization
- **Retention Compliance:** 100% automated purge operations within policy windows
- **Data Quality Score:** >95% completeness, accuracy, and consistency metrics
- **Team Coordination:** <2 hour average response time for evidence validation

### Alerting & Escalation Thresholds

- **Critical:** Nightly job failure, PII exposure detected, retention violation
- **Warning:** Index freshness >36 hours, performance degradation >10%
- **Info:** Minor data quality issues, delayed team validation responses

---

**Next Actions:** Coordinate with QA/Data teams for implementation timeline; create OPS-NIGHTLY Linear issue with automation setup
