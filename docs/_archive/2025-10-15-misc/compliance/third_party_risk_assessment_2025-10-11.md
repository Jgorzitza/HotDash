---
epoch: 2025.10.E1
doc: docs/compliance/third_party_risk_assessment_2025-10-11.md
owner: compliance
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2026-01-11
---

# Third-Party Risk Assessment — 2025-10-11

## Executive Summary

**Assessment Date:** 2025-10-11T22:30:00Z  
**Vendors Assessed:** 6  
**Overall Risk:** MEDIUM (with mitigation: LOW-MEDIUM)  
**High-Risk Vendors:** 2 (OpenAI, Supabase - DPAs pending)

---

## Vendor Risk Matrix

| Vendor          | Data Sensitivity | Volume | DPA Status  | Security Posture | Overall Risk        |
| --------------- | ---------------- | ------ | ----------- | ---------------- | ------------------- |
| **OpenAI**      | CRITICAL (PII)   | Low    | ⏳ PENDING  | Strong           | **HIGH** → MEDIUM\* |
| **Supabase**    | HIGH (PII)       | Medium | ⏳ PENDING  | Strong           | **HIGH** → MEDIUM\* |
| **Shopify**     | HIGH (PII/PCI)   | High   | ✅ REVIEWED | Excellent        | **LOW**             |
| **Fly.io**      | MEDIUM           | Medium | ✅ TOS      | Good             | **LOW**             |
| **Chatwoot**    | HIGH (PII)       | Medium | Self-hosted | Good             | **MEDIUM**          |
| **GA (future)** | LOW              | Low    | ⏳ PENDING  | Strong           | **MEDIUM**          |

\*With DPA completion

---

## Individual Vendor Assessments

### 1. OpenAI (CRITICAL PRIORITY)

**Risk Level:** HIGH → MEDIUM (with DPA)

**Processing:**

- Customer message content (PII)
- AI model training (opt-out required)
- Prompt processing

**Security Controls:**

- ✅ Encryption in transit (TLS)
- ✅ Enterprise features available
- ✅ Regional endpoints (US/EU)
- ⏳ Prompt retention opt-out (DPA pending)

**Mitigation:**

- LlamaIndex PII sanitizer
- Human approval required
- Customer opt-out available
- DPA escalation active (2025-10-16)

**Recommendation:** Complete DPA before production

### 2. Supabase

**Risk Level:** HIGH → MEDIUM (with SCC)

**Processing:**

- Customer data storage
- Operator data
- Decision logs

**Security Controls:**

- ✅ Encryption at rest/transit
- ✅ ISO 27001, SOC 2
- ✅ RLS and access controls
- ⏳ SCC countersignature pending

**Mitigation:**

- Self-serve DPA documented
- Service key scoped to required tables
- Audit logging active
- SCC escalation active (2025-10-16)

**Recommendation:** Continue escalation, acceptable for pilot

### 3. Shopify

**Risk Level:** LOW

**Processing:**

- Admin authentication
- Order/inventory data
- App hosting

**Security Controls:**

- ✅ DPA reviewed
- ✅ PCI DSS compliant
- ✅ Industry-leading security

**Mitigation:** None needed

**Recommendation:** Approved

### 4. Fly.io

**Risk Level:** LOW

**Processing:**

- Infrastructure hosting
- Application logs
- Network routing

**Security Controls:**

- ✅ SOC 2 Type II
- ✅ Encryption
- ✅ DDoS protection

**Mitigation:** Standard TOS adequate

**Recommendation:** Approved

### 5. Chatwoot (Self-Hosted)

**Risk Level:** MEDIUM

**Processing:**

- Customer conversations
- Operator actions
- Support tickets

**Security Controls:**

- ✅ Self-hosted on Fly.io + Supabase
- ✅ No third-party data sharing
- ✅ Full control over data

**Mitigation:** Self-hosted reduces risk

**Recommendation:** Approved

### 6. Google Analytics (Future)

**Risk Level:** MEDIUM

**Processing:**

- Page view analytics
- User behavior (anonymized)
- Landing page metrics

**Security Controls:**

- ✅ Industry-standard security
- ✅ GDPR compliance tools
- ⏳ Data residency confirmation pending

**Mitigation:** Read-only access, no PII collection

**Recommendation:** Complete data residency confirmation before Phase 2

---

## Risk Mitigation Strategy

**High-Risk Vendors (2):**

1. OpenAI - Complete Enterprise DPA (escalation 2025-10-16)
2. Supabase - Obtain SCC countersignature (escalation 2025-10-16)

**Medium-Risk Vendors (2):**

1. Chatwoot - Maintain self-hosted architecture
2. GA - Confirm data residency before activation

**Low-Risk Vendors (2):**

1. Shopify - Continue current arrangement
2. Fly.io - Monitor SOC 2 compliance

---

## Ongoing Vendor Management

**Quarterly Reviews:**

- Security posture assessment
- DPA compliance verification
- Incident review
- Contract renewal tracking

**Annual Actions:**

- DPA renewal
- Security questionnaire
- SOC 2 report review
- Subprocessor list update

---

**Assessment Status:** ✅ COMPLETE  
**Overall Risk:** ACCEPTABLE for pilot  
**Next Review:** 2025-11-11 (monthly)
