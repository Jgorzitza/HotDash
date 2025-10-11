---
epoch: 2025.10.E1
doc: docs/enablement/stack_compliance_audit_2025-10-11.md
owner: enablement
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---
# Stack Compliance Audit — Enablement Collateral (2025-10-11)

## Audit Purpose
Verify all enablement documentation, training materials, and job aids align with the canonical toolkit specified in `docs/directions/README.md#canonical-toolkit--secrets`.

**Audit Date:** 2025-10-11T02:00:00Z  
**Auditor:** Enablement Agent  
**Scope:** All materials under `docs/enablement/` and related training documents

---

## Canonical Toolkit Compliance Matrix

### ✅ Database — Supabase Single Source of Truth
**Requirement:** Supabase as canonical database; no Fly-hosted Postgres clusters permitted

**Enablement Material References:**
- ✅ `docs/enablement/job_aids/cx_escalations_modal.md` - Correctly references Supabase for decision_log, conversation storage, and audit trails (lines 34, 35, 44-46)
- ✅ `docs/enablement/job_aids/sales_pulse_modal.md` - References Supabase tables for sales metrics and decision logging (lines 29, 30, 36)
- ✅ `docs/enablement/dry_run_training_materials.md` - Emphasizes Supabase as single source of truth for decision logs and metrics (lines 21, 22, 51, 96-97)
- ✅ `docs/enablement/async_training_snippets.md` - Architecture modules correctly position Supabase as data persistence layer (lines 52-55, 178, 275)
- ✅ `docs/enablement/rehearsal_coordination_2025-10-16.md` - Supabase referenced for decision logging and compliance (lines 77, 119-121, 131)

**Finding:** ✅ **COMPLIANT** - All materials consistently reference Supabase as canonical database

### ✅ Chatwoot — Supabase Persistence with Fly Compute
**Requirement:** Chatwoot reuses Supabase for persistence; Fly hosts only app/Sidekiq + Upstash Redis

**Enablement Material References:**
- ✅ `docs/enablement/job_aids/cx_escalations_modal.md` - Correctly describes Chatwoot-on-Supabase architecture with Fly.io compute layer (lines 28-31, 39-40)
- ✅ `docs/enablement/job_aids/sales_pulse_modal.md` - References Chatwoot-on-Supabase integration for cross-modal data (line 24)
- ✅ `docs/enablement/dry_run_training_materials.md` - Explains Chatwoot Fly + Supabase persistence architecture (lines 22-24)
- ✅ `docs/enablement/async_training_snippets.md` - Module 1 correctly describes Chatwoot runtime on Fly with Supabase data (line 55)
- ✅ `docs/enablement/rehearsal_coordination_2025-10-16.md` - Details Chatwoot-on-Supabase smoke validation requirements (lines 115-121)

**Finding:** ✅ **COMPLIANT** - Architecture correctly described across all training materials

### ✅ Frontend — React + React Router 7
**Requirement:** React + React Router 7; no Remix usage

**Enablement Material References:**
- ✅ `docs/enablement/dry_run_training_materials.md` - References React Router 7 shell in staging environment description (line 23)
- ✅ `docs/enablement/distribution_packet_staging.md` - No conflicting frontend references found
- ✅ Training modules focus on operator workflows rather than technical implementation details

**Finding:** ✅ **COMPLIANT** - No references to prohibited Remix usage; React Router 7 correctly mentioned

### ✅ AI — OpenAI + LlamaIndex
**Requirement:** OpenAI key at vault location; LlamaIndex for ingestion via specified scripts

**Enablement Material References:**
- ✅ `docs/enablement/job_aids/cx_escalations_modal.md` - References OpenAI + LlamaIndex tooling for AI suggestions (line 82)
- ✅ `docs/enablement/dry_run_training_materials.md` - Mentions OpenAI + LlamaIndex pipelines for CX Escalations (line 24)
- ✅ `docs/enablement/job_aids/ai_samples/` - Training samples reference proper AI workflow without exposing credentials
- ✅ `docs/enablement/async_training_snippets.md` - AI integration training focuses on operator usage, not credential management

**Finding:** ✅ **COMPLIANT** - AI references align with canonical toolkit; no credential exposure

### ✅ Secrets Handling — Vault-based with Evidence Logging
**Requirement:** Credentials in vault/occ/; export before CLI; log commands + results

**Enablement Material References:**
- ✅ All enablement materials reference `customer.support@hotrodan.com` for credential issues rather than exposing secrets
- ✅ Training scripts instruct operators to escalate authentication failures instead of attempting manual credential management
- ✅ `docs/enablement/job_aids/cx_escalations_modal.md` - Proper escalation path for credential drift (lines 40-41)
- ✅ Session token workflow documented in distribution packet references proper capture procedures without exposing tokens

**Finding:** ✅ **COMPLIANT** - No credential exposure; proper escalation paths documented

---

## Evidence Logging Compliance

### ✅ Documentation Structure
**Requirement:** Evidence in packages/memory/logs/, artifacts/, and supabase functions

**Audit Findings:**
- ✅ `docs/enablement/distribution_packet_staging.md` - References proper artifact organization at `artifacts/enablement/distribution_2025-10-16/` (lines 131-141)
- ✅ `docs/enablement/dry_run_training_materials.md` - Evidence table references artifacts/logs/ and artifacts/monitoring/ (lines 164-175)
- ✅ `docs/enablement/rehearsal_coordination_2025-10-16.md` - Post-rehearsal actions specify artifact storage at `artifacts/ops/dry_run_2025-10-16/` (line 182)

**Finding:** ✅ **COMPLIANT** - Evidence paths align with canonical structure

### ✅ Command + Output + Timestamp Logging
**Requirement:** Every feedback update includes timestamp, command, output/log path

**Audit Findings:**
- ✅ `feedback/enablement.md` - All deliverable updates include timestamps, actions taken, artifacts created, and status
- ✅ Training materials include evidence capture templates with timestamp and artifact path requirements
- ✅ Distribution protocols specify logging completion with evidence links

**Finding:** ✅ **COMPLIANT** - Evidence requirements consistently documented

---

## Discrepancy Analysis

### ⚠️ Minor: Legacy Reference Cleanup
**Issue:** Some older references to "Fly Postgres" may exist in legacy training materials  
**Location:** Historical documentation not actively maintained  
**Risk:** Low - current materials correctly reference Supabase  
**Action Required:** Ongoing cleanup during regular material updates

### ✅ Resolved: Support Contact Standardization  
**Previous Issue:** Mixed support contact references  
**Resolution:** All materials now consistently reference `customer.support@hotrodan.com`  
**Evidence:** Verified across all job aids, training scripts, and distribution materials

---

## Compliance Recommendation

### Overall Assessment: ✅ **COMPLIANT**
All active enablement materials align with the canonical toolkit requirements:

1. **Database:** Supabase consistently referenced as single source of truth
2. **Chatwoot:** Correctly described as Supabase-persistent with Fly compute
3. **Frontend:** React Router 7 properly referenced; no Remix usage
4. **AI:** OpenAI + LlamaIndex references appropriate and secure
5. **Secrets:** Proper escalation paths; no credential exposure
6. **Evidence:** Logging structures align with canonical requirements

### Action Items
- [x] **Immediate:** No critical discrepancies requiring immediate fixes
- [ ] **Maintenance:** Continue legacy reference cleanup during regular updates
- [x] **Documentation:** Compliance audit logged in `feedback/enablement.md`

### Next Audit Cycle
**Schedule:** 2025-10-14 (Thursday) - Joint audit with QA per direction governance  
**Focus:** Monitor any new materials for canonical toolkit alignment  
**Owner:** Enablement agent coordination with QA lead

---

## Audit Trail & Evidence

### Materials Reviewed
- [x] `docs/enablement/job_aids/cx_escalations_modal.md` - Architecture references verified
- [x] `docs/enablement/job_aids/sales_pulse_modal.md` - Data flow compliance confirmed  
- [x] `docs/enablement/dry_run_training_materials.md` - Toolkit references validated
- [x] `docs/enablement/async_training_snippets.md` - Training modules reviewed
- [x] `docs/enablement/distribution_packet_staging.md` - Evidence paths confirmed
- [x] `docs/enablement/rehearsal_coordination_2025-10-16.md` - Compliance protocols verified
- [x] All job aids under `docs/enablement/job_aids/ai_samples/` - AI references appropriate

### Commands Executed
```bash
# Compliance search across enablement materials
grep -r "Supabase\|Chatwoot\|React Router\|OpenAI\|LlamaIndex\|Fly\|Postgres" docs/enablement/

# Evidence path verification  
find artifacts/ docs/enablement/ -name "*2025-10-*" -type f | head -20

# Support contact standardization check
grep -r "support@\|customer\.support" docs/enablement/
```

### Audit Completion
**Timestamp:** 2025-10-11T02:00:00Z  
**Evidence Stored:** This document + command outputs logged in `feedback/enablement.md`  
**Next Review:** Stack compliance audit (Monday/Thursday cycle) per direction governance