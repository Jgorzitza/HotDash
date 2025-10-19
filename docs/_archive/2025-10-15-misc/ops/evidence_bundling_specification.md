---
epoch: 2025.10.E1
doc: docs/ops/evidence_bundling_specification.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Evidence Bundling Specification — HotDash OCC Sprint 2025-10-11T03:50Z

## Standard Folder Structure

### Daily Evidence Bundle Pattern

```
artifacts/nightly/YYYY-MM-DD/
├── bundle_manifest.json          # Checksum registry, data freshness timestamps
├── test_results/
│   ├── playwright_summary.json   # E2E test results with timing and failures
│   ├── vitest_summary.json       # Unit test results with coverage
│   └── lighthouse_report.json    # Performance metrics and accessibility
├── metrics/
│   ├── latency_snapshot.json     # Response times, p95/p99, staging performance
│   ├── supabase_performance.json # Database metrics, query times, connection stats
│   └── nightly_metrics.json      # From scripts/ops/run-nightly-metrics.ts output
├── ai_logging/
│   ├── llamaindex_build_report.json  # Index stats, document counts, build duration
│   ├── openai_usage_summary.json     # API usage, costs, rate limits
│   └── ai_decision_logs.json         # AI feature performance and errors
├── compliance/
│   ├── pii_redaction_audit.json  # Sanitization effectiveness validation
│   ├── retention_verification.json # 14-day purge validation, policy compliance
│   └── chatwoot_volume_metrics.json # Sanitized conversation analytics
└── links/
    ├── linear_updates.md          # Links to updated Linear issues
    ├── feedback_entries.md        # Links to feedback/product.md entries
    └── memory_entries.md          # Links to Memory scope entries
```

### Weekly Evidence Archive Pattern

```
artifacts/weekly/YYYY-WW/
├── sprint_summary.json           # Aggregated metrics for sprint period
├── compliance_attestations.json  # SCC/DPA approvals and audit results
├── customer_feedback.json        # Anonymized customer call insights
└── risk_register_snapshot.json   # Risk status and mitigation progress
```

### Release Evidence Pattern

```
artifacts/releases/vYYYY.MM.DD/
├── release_manifest.json         # Complete evidence checklist and signoffs
├── mock_review/
│   ├── synthetic_data_test_results.json
│   ├── operator_flow_recording.md
│   └── guardrail_validation.json
├── staging_review/
│   ├── qa_evidence_bundle.json
│   ├── performance_validation.json
│   └── compliance_signoff.json
└── production_gate/
    ├── go_no_go_decision.json
    ├── rollback_plan.md
    └── stakeholder_approvals.json
```

## Standard File Formats

### bundle_manifest.json

```json
{
  "timestamp": "2025-10-11T03:50:00.000Z",
  "bundle_type": "nightly",
  "bundle_version": "1.0",
  "evidence_completeness": {
    "test_results": true,
    "metrics": true,
    "ai_logging": true,
    "compliance": true,
    "links": true
  },
  "checksums": {
    "playwright_summary.json": "sha256:abc123...",
    "vitest_summary.json": "sha256:def456...",
    "latency_snapshot.json": "sha256:ghi789..."
  },
  "data_freshness": {
    "oldest_artifact": "2025-10-11T02:00:00.000Z",
    "newest_artifact": "2025-10-11T03:45:00.000Z",
    "staleness_hours": 1.75
  },
  "validation_status": {
    "all_files_present": true,
    "checksums_valid": true,
    "compliance_approved": true,
    "ready_for_consumption": true
  }
}
```

### Test Results Format

```json
{
  "timestamp": "2025-10-11T03:24:00.000Z",
  "test_suite": "playwright",
  "execution_summary": {
    "total_tests": 12,
    "passed": 12,
    "failed": 0,
    "skipped": 0,
    "flaky": 0,
    "duration_seconds": 5.9
  },
  "performance_metrics": {
    "avg_response_time_ms": 173.6,
    "p95_response_time_ms": 189.2,
    "p99_response_time_ms": 205.1
  },
  "artifacts": [
    "test-results/.last-run.json",
    "test-results/playwright-report/index.html"
  ]
}
```

### Compliance Validation Format

```json
{
  "timestamp": "2025-10-11T02:00:00.000Z",
  "validation_type": "pii_redaction_audit",
  "status": "PASS",
  "checks_performed": {
    "chatwoot_transcripts": {
      "total_messages": 1247,
      "pii_detected": 23,
      "redaction_success": 23,
      "redaction_rate": 1.0
    },
    "ai_logs": {
      "prompt_logs": 89,
      "pii_found": 0,
      "sanitization_applied": true
    }
  },
  "compliance_score": 100,
  "violations": [],
  "next_audit": "2025-10-12T02:00:00.000Z"
}
```

## Morning Linking Routine (09:00 UTC)

### Automated Tasks

1. **Verify Bundle Completeness**

   ```bash
   # Check latest nightly bundle exists and is complete
   BUNDLE_DATE=$(date -d "yesterday" +%Y-%m-%d)
   BUNDLE_PATH="artifacts/nightly/${BUNDLE_DATE}"

   # Validate manifest and all required files
   if [[ -f "${BUNDLE_PATH}/bundle_manifest.json" ]]; then
     # Extract validation status and evidence completeness
     READY=$(jq -r '.validation_status.ready_for_consumption' "${BUNDLE_PATH}/bundle_manifest.json")
   fi
   ```

2. **Update Linear Issues**
   - DEPLOY-147: Attach test results summary with pass/fail status
   - OPS-NIGHTLY: Update with bundle path and compliance validation
   - COMP-SCC-DPA: Include compliance validation results

3. **Update feedback/product.md**

   ```markdown
   ### YYYY-MM-DDTHH:MM:SSZ — Morning Evidence Bundle Link

   - **Summary:** Latest nightly evidence bundle processed and linked
   - **Evidence:** artifacts/nightly/YYYY-MM-DD/ - [validation status]
   - **Decision:** Bundle ready for consumption by QA and compliance teams
   - **Next Actions:** [QA] Review test results by 12:00 UTC; [Compliance] Sign-off by 14:00 UTC
   ```

### Manual Verification Checklist

- [ ] Bundle manifest shows all evidence types present
- [ ] No validation failures in compliance checks
- [ ] Test results show acceptable pass rates (>95% for critical paths)
- [ ] Performance metrics within thresholds (<300ms p95)
- [ ] Linear issues updated with bundle links
- [ ] feedback/product.md entry created with timestamp

## Integration Points

### QA Agent Consumption

- Daily consumption by 09:00 UTC
- Validate test result completeness
- Attach summary to DEPLOY-147 Linear issue
- Flag any regression or performance degradation

### Data Agent Validation

- PII redaction effectiveness audit
- Retention policy compliance verification
- Data quality metrics sign-off
- Compliance reporting updates

### Reliability Agent Review

- Infrastructure performance metrics validation
- Incident threshold monitoring
- Backup/recovery readiness verification
- Production risk assessment updates

## Automation Scripts

### Bundle Generation Script

Location: `scripts/ops/generate-evidence-bundle.ts`
Trigger: Nightly at 02:30 UTC (after metrics collection)
Output: Complete evidence bundle with manifest

### Bundle Validation Script

Location: `scripts/ops/validate-evidence-bundle.ts`
Trigger: Daily at 08:30 UTC
Output: Validation report and Linear/feedback updates

### Archive Management Script

Location: `scripts/ops/archive-evidence-bundles.ts`  
Trigger: Weekly on Sunday 03:00 UTC
Output: Weekly summary and 30-day retention enforcement

## Success Metrics

### Daily Success Criteria

- 100% bundle generation success rate
- <2 hour latency from data generation to bundle availability
- 100% validation pass rate for compliance checks
- <15 minutes for morning linking routine completion

### Quality Indicators

- Test result reliability (no flaky test tolerance)
- Performance consistency (±5% variance from baseline)
- Compliance audit pass rate (100% PII redaction success)
- Stakeholder consumption rate (QA/Data/Reliability reviews within SLA)

### Escalation Thresholds

- **Critical**: Bundle generation failure, compliance violation detected
- **Warning**: Performance degradation >10%, test failure rate >5%
- **Info**: Bundle processing delay, minor data quality issues

---

**Next Actions**: Implement bundle generation script, set up automation triggers, validate morning routine workflow
