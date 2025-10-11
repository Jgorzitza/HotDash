---
epoch: 2025.10.E1
doc: docs/enablement/distribution_packet_staging.md
owner: enablement
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---
# Enablement Distribution Packet — Staging Ready (Hold for QA Evidence + Embed Token)

## Distribution Clearance Gates
**Status:** ⏳ **HOLD** - Distribution blocked pending QA evidence and Shopify embed token delivery

### Required Evidence (Update Before Send)
- [ ] **QA Evidence:** `?mock=0` sustained HTTP 200 response logged at `artifacts/integrations/shopify/<date>/curl_mock0_<timestamp>.log`
- [ ] **Synthetic Check:** Sub-300ms latency confirmed with JSON artifact at `artifacts/monitoring/synthetic-check-<timestamp>.json`
- [ ] **Shopify Embed Token:** Session token captured and validated per `docs/runbooks/shopify_embed_capture.md` workflow
- [ ] **Supabase Sync:** Latest decision export available at `artifacts/logs/supabase_decision_export_<timestamp>.ndjson`

**Action Required:** Once all four evidence gates clear, replace `<timestamp>` placeholders below with actual artifact paths and execute immediate distribution.

---

## Internal Training Team Notification

### Subject: OCC Training Packet Ready - Updated Job Aids & Session Token Integration

```
Team,

The updated operator training packet is ready for immediate distribution. Key updates include:

✅ **Enhanced Architecture Documentation:**
- CX Escalations job aid updated with comprehensive Chatwoot-on-Supabase details
- Sales Pulse job aid enhanced with cross-modal data architecture 
- All support references updated to customer.support@hotrodan.com

✅ **Session Token Workflow Integration:**
- Distribution packet includes Shopify embed token capture procedures
- Training scenarios updated to reference session token authentication
- Modal authentication flow documented for operator troubleshooting

✅ **Evidence Package:**
- QA Evidence: <PLACEHOLDER - artifacts/integrations/shopify/<date>/curl_mock0_<timestamp>.log>
- Synthetic Check: <PLACEHOLDER - artifacts/monitoring/synthetic-check-<timestamp>.json>
- Supabase Export: <PLACEHOLDER - artifacts/logs/supabase_decision_export_<timestamp>.ndjson>

**Updated Materials:**
- docs/enablement/job_aids/cx_escalations_modal.md (enhanced architecture section)
- docs/enablement/job_aids/sales_pulse_modal.md (added data architecture section)
- docs/enablement/dry_run_training_materials.md (session token workflow integration)

**Immediate Actions Required:**
1. Review updated job aids and confirm accuracy for your team's training scenarios
2. Validate session token workflow matches your auth troubleshooting procedures
3. Reply with ✅ once your team has reviewed and is ready for 2025-10-16 rehearsal

**Access & Support:**
- Staging: https://hotdash-staging.fly.dev/app (requires embed token per workflow)
- Issues: customer.support@hotrodan.com (Chatwoot-on-Supabase routing)
- Emergency: #occ-reliability for credential/access issues

Next milestone: 2025-10-16 dry run rehearsal with full training packet deployment.

Thanks,
Enablement Team
```

---

## Stakeholder Distribution Checklist

### Primary Recipients
- [ ] **Support Lead (Morgan Patel):** Email notification + training packet link
- [ ] **Product (Riley Chen):** Training agenda confirmation + evidence package
- [ ] **QA Lead:** Updated scenarios + session token workflow validation
- [ ] **Reliability:** Session token workflow review + synthetic check coordination

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

## Session Token Workflow - Training Integration

### Operator Troubleshooting Quick Reference
**Issue:** Modal fails to load or shows "Authentication Required" error

**Steps:**
1. **Verify Embed Context:** Confirm user accessed dashboard through Shopify Admin → Apps → HotDash (not direct URL)
2. **Check Session Token:** Modal should automatically authenticate via Shopify embed token - no manual token entry required
3. **Credential Validation:** If authentication persists, escalate to `customer.support@hotrodan.com` with screenshot
4. **Fallback Path:** Direct operators to refresh Shopify Admin tab and re-launch OCC from Apps menu

### Training Scenario Updates
**CX Escalations Modal:**
- Pre-flight checklist now includes session token validation steps
- Error handling section updated with embed authentication troubleshooting
- Support escalation path clarified for credential drift scenarios

**Sales Pulse Modal:**
- Cross-modal authentication flow documented for data consistency
- Session token refresh procedures added to decision logging workflow
- Evidence capture updated to include authentication state verification

### Documentation Cross-References
- **Session Token Capture:** `docs/runbooks/shopify_embed_capture.md` - for reliability troubleshooting
- **Authentication Flow:** `docs/dev/authshop.md` - for technical deep-dive during training
- **Embed Integration:** `app/routes/app.tools.session-token.tsx` - for advanced operator scenarios

---

## Evidence Attachment Protocol

### Pre-Distribution Validation
1. **Curl Log Verification:** Confirm `?mock=0` returns consistent HTTP 200 with <300ms response time
2. **Synthetic Check JSON:** Validate monitoring data shows sustained performance under load
3. **Supabase Export:** Verify decision log export contains expected training scenario data
4. **Session Token Test:** Confirm embed token workflow produces valid authentication for modal access

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

| Stakeholder | Role | Packet Sent (UTC) | Evidence Reviewed | Acknowledged (UTC) | Blocker/Questions |
|-------------|------|-------------------|-------------------|--------------------|-------------------|
| Morgan Patel | Support Lead | <PENDING> | <PENDING> | <PENDING> | |
| Riley Chen | Product | <PENDING> | <PENDING> | <PENDING> | |
| QA Lead | Quality Assurance | <PENDING> | <PENDING> | <PENDING> | |
| Reliability Liaison | Infrastructure | <PENDING> | <PENDING> | <PENDING> | |
| Design Partner | Visual Assets | <PENDING> | <PENDING> | <PENDING> | |

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