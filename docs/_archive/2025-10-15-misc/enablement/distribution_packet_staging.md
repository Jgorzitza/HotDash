---
epoch: 2025.10.E1
doc: docs/enablement/distribution_packet_staging.md
owner: enablement
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Enablement Distribution Packet — Staging Ready (Hold for QA Evidence + RR7 Testing)

## Distribution Clearance Gates

**Status:** ⏳ **HOLD** - Distribution blocked pending QA evidence and React Router 7 + Shopify CLI v3 validation

### Required Evidence (Update Before Send)

- [ ] **QA Evidence:** `?mock=0` sustained HTTP 200 response logged at `artifacts/integrations/shopify/<date>/curl_mock0_<timestamp>.log`
- [ ] **Synthetic Check:** Sub-300ms latency confirmed with JSON artifact at `artifacts/monitoring/synthetic-check-<timestamp>.json`
- [ ] **Development Workflow:** Shopify CLI v3 `shopify app dev` and routing validation per updated development standards
- [ ] **Supabase Sync:** Latest decision export available at `artifacts/logs/supabase_decision_export_<timestamp>.ndjson`

**Action Required:** Once all four evidence gates clear, replace `<timestamp>` placeholders below with actual artifact paths and execute immediate distribution.

---

## Internal Training Team Notification

### Subject: OCC Training Packet Ready - Updated Job Aids & React Router 7 + Shopify CLI v3 Integration

```
Team,

The updated operator training packet is ready for immediate distribution. Key updates include:

✅ **Enhanced Architecture Documentation:**
- CX Escalations job aid updated with React Router 7 navigation patterns
- Sales Pulse job aid enhanced with Shopify CLI v3 development workflow
- All support references updated to customer.support@hotrodan.com

✅ **React Router 7 + Shopify CLI v3 Integration:**
- Distribution packet includes Shopify CLI v3 development procedures
- Training scenarios updated to reference React Router 7 navigation patterns
- Modal routing flow documented for operator development understanding

✅ **Evidence Package:**
- QA Evidence: <PLACEHOLDER - artifacts/integrations/shopify/<date>/curl_mock0_<timestamp>.log>
- Synthetic Check: <PLACEHOLDER - artifacts/monitoring/synthetic-check-<timestamp>.json>
- Supabase Export: <PLACEHOLDER - artifacts/logs/supabase_decision_export_<timestamp>.ndjson>

**Updated Materials:**
- docs/enablement/job_aids/cx_escalations_modal.md (React Router 7 navigation patterns)
- docs/enablement/job_aids/sales_pulse_modal.md (Shopify CLI v3 development workflow)
- docs/enablement/dry_run_training_materials.md (RR7 + CLI v3 integration)

**Immediate Actions Required:**
1. Review updated job aids and confirm accuracy for your team's training scenarios
2. Validate React Router 7 + Shopify CLI v3 workflow matches your development procedures
3. Reply with ✅ once your team has reviewed and is ready for 2025-10-16 rehearsal

**Access & Support:**
- Staging: https://hotdash-staging.fly.dev/app (access via Shopify Admin → Apps → HotDash)
- Issues: customer.support@hotrodan.com (standard support routing)
- Emergency: #occ-reliability for infrastructure/access issues

Next milestone: 2025-10-16 dry run rehearsal with full training packet deployment.

Thanks,
Enablement Team
```

---

## Stakeholder Distribution Checklist

### Primary Recipients

- [ ] **Support Lead (Morgan Patel):** Email notification + training packet link
- [ ] **Product (Riley Chen):** Training agenda confirmation + evidence package
- [ ] **QA Lead:** Updated scenarios + React Router 7 + Shopify CLI v3 workflow validation
- [ ] **Reliability:** Development workflow review + synthetic check coordination

### Secondary Notifications

- [ ] **Design:** Updated job aids with architecture callouts for screenshot annotation
- [ ] **Marketing:** Training packet readiness for launch coordination
- [ ] **Manager:** Sprint deliverable status + rehearsal readiness confirmation

### Distribution Channels

- [ ] **Email:** occ-training-updates@hotrodan.com (primary announcement)
- [ ] **Slack:** #occ-enablement (link + key highlights)
- [ ] **Documentation:** Link in `feedback/enablement.md` with timestamp and recipient confirmations
- [ ] **Artifact Storage:** Copy packet materials to `artifacts/enablement/distribution_2025-10-16/`

---

## React Router 7 + Shopify CLI v3 Workflow - Training Integration

### Operator Development Quick Reference

**Issue:** Modal navigation fails or shows routing errors

**Steps:**

1. **Verify Development Setup:** Confirm local development using `shopify app dev` command
2. **Check Router Configuration:** Modal navigation handled by React Router 7 routing patterns - verify route definitions
3. **Development Validation:** If routing persists, escalate to `customer.support@hotrodan.com` with screenshot
4. **Fallback Path:** Restart development server with `shopify app dev --reset` and verify modal routes

### Training Scenario Updates

**CX Escalations Modal:**

- Pre-flight checklist now includes React Router 7 route validation steps
- Error handling section updated with routing troubleshooting procedures
- Support escalation path clarified for development workflow scenarios

**Sales Pulse Modal:**

- Cross-modal navigation flow documented using React Router 7 patterns
- Shopify CLI v3 deployment procedures added to training workflow
- Evidence capture updated to include development environment validation

### Documentation Cross-References

- **Shopify CLI v3 Workflow:** `docs/dev/shopify_cli_setup.md` - for development environment setup
- **React Router 7 Patterns:** `docs/dev/routing.md` - for technical deep-dive during training
- **Modal Navigation:** App router configuration - for advanced development scenarios

---

## Evidence Attachment Protocol

### Pre-Distribution Validation

1. **Curl Log Verification:** Confirm `?mock=0` returns consistent HTTP 200 with <300ms response time
2. **Synthetic Check JSON:** Validate monitoring data shows sustained performance under load
3. **Supabase Export:** Verify decision log export contains expected training scenario data
4. **Development Workflow Test:** Confirm Shopify CLI v3 development setup and React Router 7 navigation work correctly

### Artifact Organization

```
artifacts/enablement/distribution_2025-10-16/
├── evidence/
│   ├── curl_mock0_2025-10-11T<timestamp>.log
│   ├── synthetic-check-2025-10-11T<timestamp>.json
│   └── supabase_decision_export_2025-10-11T<timestamp>.ndjson
├── job_aids/
│   ├── cx_escalations_modal_v2025-10-11.md
│   └── sales_pulse_modal_v2025-10-11.md
├── training_materials/
│   └── dry_run_training_materials_v2025-10-11.md
└── distribution_log.md
```

### Post-Distribution Actions

- [ ] Log all recipient acknowledgements in `feedback/enablement.md`
- [ ] Archive evidence bundle with timestamps for compliance audit trail
- [ ] Update training agenda with final participant list and confirmed dependencies
- [ ] Schedule follow-up review 24h before rehearsal to address any outstanding questions

---

## Acknowledgement Tracker

| Stakeholder         | Role              | Packet Sent (UTC) | Evidence Reviewed | Acknowledged (UTC) | Blocker/Questions |
| ------------------- | ----------------- | ----------------- | ----------------- | ------------------ | ----------------- |
| Morgan Patel        | Support Lead      | <PENDING>         | <PENDING>         | <PENDING>          |                   |
| Riley Chen          | Product           | <PENDING>         | <PENDING>         | <PENDING>          |                   |
| QA Lead             | Quality Assurance | <PENDING>         | <PENDING>         | <PENDING>          |                   |
| Reliability Liaison | Infrastructure    | <PENDING>         | <PENDING>         | <PENDING>          |                   |
| Design Partner      | Visual Assets     | <PENDING>         | <PENDING>         | <PENDING>          |                   |

**Completion Criteria:** All stakeholders confirm ✅ and no blockers remain for 2025-10-16 rehearsal execution.

---

## Distribution Execution Script

### When Evidence Gates Clear:

```bash
# 1. Replace placeholders with actual evidence paths
sed -i 's/<PLACEHOLDER - //' docs/enablement/distribution_packet_staging.md
sed -i 's/<timestamp>/actual_timestamp_here/g' docs/enablement/distribution_packet_staging.md

# 2. Copy materials to distribution folder
mkdir -p artifacts/enablement/distribution_2025-10-16/{evidence,job_aids,training_materials}
cp artifacts/integrations/shopify/<date>/curl_mock0_*.log artifacts/enablement/distribution_2025-10-16/evidence/
cp artifacts/monitoring/synthetic-check-*.json artifacts/enablement/distribution_2025-10-16/evidence/
cp docs/enablement/job_aids/*.md artifacts/enablement/distribution_2025-10-16/job_aids/

# 3. Send notification email using template above
# 4. Post to #occ-enablement slack channel
# 5. Log distribution completion in feedback/enablement.md
```

**Execute immediately upon evidence clearance - no additional approvals required per enablement direction.**
