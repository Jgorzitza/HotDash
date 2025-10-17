---
epoch: 2025.10.E1
doc: docs/compliance/ISMS_Framework_2025-10-11.md
owner: compliance
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2026-10-11
classification: CONFIDENTIAL
---

# Information Security Management System (ISMS) Framework

## HotDash Operator Control Center

**Framework Version:** 1.0  
**Implementation Date:** 2025-10-11  
**Status:** OPERATIONAL (Pilot Phase)  
**Based On:** ISO/IEC 27001:2022, NIST CSF

---

## 1. ISMS Scope

**Organization:** Hot Rodan Inc. - HotDash Division  
**System:** Operator Control Center (Shopify Admin embedded application)  
**Data Assets:** Customer PII, business data, operator data, AI training data  
**Geographic Scope:** US, EU (via Shopify platform)  
**Regulatory:** GDPR, CCPA, state privacy laws

---

## 2. Information Security Policy

### 2.1 Policy Statement

Hot Rodan is committed to protecting the confidentiality, integrity, and availability of all information assets related to the HotDash Operator Control Center through a comprehensive information security management system.

### 2.2 Security Objectives

1. Protect customer personal information from unauthorized access
2. Ensure availability of support and operations systems
3. Maintain integrity of business data and audit trails
4. Comply with all applicable privacy and security regulations
5. Enable secure AI-assisted customer support operations

### 2.3 Management Commitment

- Security integrated into all business processes
- Resources allocated for security controls
- Regular management review of security posture
- Continuous improvement culture

---

## 3. Risk Management Process

### 3.1 Risk Assessment Methodology

- **Frequency:** Quarterly (minimum)
- **Triggers:** New features, incidents, regulatory changes
- **Method:** Likelihood × Impact = Risk Score
- **Documentation:** Risk register maintained

### 3.2 Risk Treatment Options

1. **Mitigate:** Implement controls to reduce risk
2. **Accept:** Document acceptance for low risks
3. **Transfer:** Insurance or third-party management
4. **Avoid:** Eliminate risky processing

### 3.3 Current Risk Register

**Location:** `docs/compliance/COMPLIANCE_DASHBOARD.md` (Risk Register section)

- 0 Critical risks
- 2 High risks (with mitigation plans)
- 4 Medium risks (accepted for pilot)

---

## 4. Asset Management

### 4.1 Information Assets

**Customer Data:**

- Conversations, messages, PII
- Classification: CONFIDENTIAL
- Owner: Support/Operations
- Retention: 14 days (messages), 1 year (analytics)

**Business Data:**

- Order data, inventory, sales metrics
- Classification: CONFIDENTIAL
- Owner: Operations
- Retention: Per business requirements

**Credentials & Secrets:**

- API keys, service keys, tokens
- Classification: RESTRICTED
- Owner: Reliability/Deployment
- Storage: vault/ with 600 permissions

**AI Models & Training Data:**

- LlamaIndex embeddings, approved responses
- Classification: CONFIDENTIAL
- Owner: AI/Data teams
- Retention: 1 year

### 4.2 Asset Classification

| Level            | Description         | Examples                     | Controls                     |
| ---------------- | ------------------- | ---------------------------- | ---------------------------- |
| **RESTRICTED**   | Extreme sensitivity | Credentials, encryption keys | Vault, 600 perms, encrypted  |
| **CONFIDENTIAL** | High sensitivity    | Customer PII, business data  | RLS, encryption, access logs |
| **INTERNAL**     | Medium sensitivity  | Documentation, code          | Access controls, backups     |
| **PUBLIC**       | No sensitivity      | Marketing materials          | Standard controls            |

---

## 5. Access Control

### 5.1 Access Control Policy

- Principle of least privilege enforced
- Role-based access control (RBAC)
- Regular access reviews (quarterly)
- Immediate revocation on role change

### 5.2 Authentication Requirements

- Multi-factor authentication (MFA) where available
- Strong passwords (Shopify OAuth)
- Service account key rotation (90-365 days)
- Session timeout: 8 hours

### 5.3 Authorization Model

- **Operators:** Shopify Admin OAuth, limited to assigned conversations
- **Service Accounts:** Scoped API keys, RLS enforcement
- **Administrators:** Manager approval required for sensitive operations

**Audit Status:** ✅ EXCELLENT (9/10) - See `docs/compliance/access_control_audit_2025-10-11.md`

---

## 6. Cryptography Controls

### 6.1 Encryption Standards

- **At Rest:** AES-256 (Supabase platform)
- **In Transit:** TLS 1.2+ (all connections)
- **Backups:** Encrypted (platform default)
- **Keys:** Managed by cloud providers

### 6.2 Key Management

- Service keys stored in vault/ (600 permissions)
- Key rotation per schedule (90-365 days)
- No hardcoded keys in code
- Emergency key revocation procedures

---

## 7. Physical & Environmental Security

**Scope:** Cloud-hosted (Shopify, Fly.io, Supabase)
**Responsibility:** Cloud provider physical security
**HotDash Controls:** Vendor security assessment, DPA requirements

---

## 8. Operations Security

### 8.1 Change Management

- All code changes via git pull requests
- Manager approval for production deploys
- Rollback procedures documented
- Change logging in feedback files

### 8.2 Capacity Management

- Fly.io scaling monitored
- Supabase usage tracked
- Performance baselines established
- Capacity planning quarterly

### 8.3 Malware Protection

- Dependency scanning (npm audit)
- Code scanning (CodeQL, Semgrep)
- Container scanning (if applicable)
- Regular updates

### 8.4 Backup

- Supabase automated backups (daily)
- Point-in-time recovery available
- Backup retention: 7 days (Supabase default)
- Restoration tested: TBD (scheduled)

### 8.5 Logging & Monitoring

- Audit logs: 1 year retention
- Application logs: 30 days
- Security logs: 1 year
- Log integrity: Supabase platform

---

## 9. Communications Security

### 9.1 Network Security

- All external connections via HTTPS/TLS 1.2+
- No cleartext transmission of credentials
- API authentication required
- Rate limiting implemented (Shopify GraphQL)

### 9.2 Information Transfer

- Encrypted channels only
- Secure API integrations
- No email of credentials
- Secure file transfer (vault access only)

---

## 10. System Acquisition, Development & Maintenance

### 10.1 Secure Development

- Secret scanning (pre-commit + CI)
- Security code review
- Dependency vulnerability scanning
- Security testing in CI/CD

### 10.2 Security Requirements

- Authentication required for all endpoints
- Input validation mandatory
- Output encoding enforced
- Audit logging implemented

### 10.3 Test Data

- No production data in testing
- Synthetic data for tests
- Test data sanitization
- Isolated test environments

---

## 11. Supplier Relationships

### 11.1 Vendor Management

- Risk assessment before onboarding
- DPA required for data processors
- Annual security reviews
- Vendor incident notification required

### 11.2 Current Vendors

**Status:** See `docs/compliance/third_party_risk_assessment_2025-10-11.md`

- 6 vendors assessed
- 2 high-risk (DPAs pending)
- Mitigation plans active

---

## 12. Information Security Incident Management

### 12.1 Incident Response

**Procedures:** `docs/runbooks/incident_response_breach.md`
**Tested:** 2025-10-11 tabletop exercise (7.8/10)
**Templates:** Regulatory + customer notifications created

### 12.2 Incident Categories

- **P0 (Critical):** Data breach, credential exposure
- **P1 (High):** System compromise, DDoS
- **P2 (Medium):** Vulnerability, policy violation
- **P3 (Low):** Minor security event

### 12.3 Response Targets

- Detection: <15 minutes
- Containment: <30 minutes
- Investigation: <2 hours
- Notification: <72 hours (GDPR)
- Resolution: Based on severity

---

## 13. Business Continuity

### 13.1 Continuity Objectives

- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 1 hour
- **Critical Systems:** Shopify Admin app, Supabase database, Chatwoot

### 13.2 Backup & Recovery

- Database: Daily automated backups (Supabase)
- Code: Git version control
- Secrets: vault/ with documented restore procedures
- Testing: Quarterly recovery drills planned

---

## 14. Compliance

### 14.1 Regulatory Requirements

- GDPR (EU General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- State privacy laws (VA, CO, CT, UT)
- SOC 2 (planned)
- ISO 27001 (planned)

### 14.2 Compliance Status

**Overall:** ✅ COMPLIANT (pilot phase)
**Details:** See `docs/compliance/COMPLIANCE_DASHBOARD.md`

---

## 15. Management Review

### 15.1 Review Frequency

- **Weekly:** Compliance dashboard review (Manager)
- **Monthly:** Security metrics and incidents
- **Quarterly:** Full ISMS review
- **Annually:** Complete ISMS audit

### 15.2 Review Topics

- Security incidents and response
- Audit findings and remediation
- Compliance posture and gaps
- Risk register updates
- Resource allocation
- Improvement opportunities

---

## 16. Continuous Improvement

### 16.1 Improvement Process

1. Identify improvement opportunities
2. Assess impact and effort
3. Prioritize improvements
4. Implement changes
5. Verify effectiveness
6. Document lessons learned

### 16.2 Current Improvements

- Security score: 5.8 → 8.5 (+47% in one sprint)
- Automation: 0% → 50% coverage
- Documentation: 20% → 100% coverage

---

## 17. ISMS Documentation

### 17.1 Policy Suite

**Location:** `docs/compliance/COMPLIANCE_POLICY_SUITE.md`

- 12 policies documented
- 100% coverage
- Regular review schedule

### 17.2 Procedures

- Incident response
- Change management
- Access control
- Backup and recovery
- Vendor management

### 17.3 Work Instructions

- Secret scanning runbook
- Compliance checking procedures
- DSR handling
- Incident response playbooks

---

## 18. Roles & Responsibilities

| Role            | Responsibilities                                        |
| --------------- | ------------------------------------------------------- |
| **Manager**     | ISMS ownership, resource allocation, policy approval    |
| **Compliance**  | ISMS operation, audits, reporting, DPO functions        |
| **Reliability** | Infrastructure security, monitoring, incident response  |
| **Engineering** | Secure development, code security, security testing     |
| **Deployment**  | Secrets management, production security, change control |
| **Support**     | Customer privacy, DSR execution, privacy training       |

---

## 19. Performance Metrics

### 19.1 Security KPIs

- Security score: 8.5/10 (target: 9.0+)
- Incident count: 0 (target: 0)
- Patch time: TBD (target: <7 days)
- Audit findings: 0 critical (target: 0)

### 19.2 Compliance KPIs

- Policy coverage: 100% (target: 100%)
- Audit pass rate: TBD (target: 100%)
- Training completion: TBD (target: 100%)
- DSR response time: TBD (target: <30 days)

---

## 20. ISMS Maturity Assessment

**Current Maturity Level:** 3 (Defined) out of 5

**Level 1 (Initial):** ❌ Passed - Processes exist
**Level 2 (Managed):** ✅ Passed - Documented and managed
**Level 3 (Defined):** ✅ Current - Standardized and integrated
**Level 4 (Quantitatively Managed):** ⏳ Target - Measured and controlled
**Level 5 (Optimizing):** ⏳ Future - Continuous improvement

**Target:** Level 4 by end of 2026

---

## ISMS Implementation Roadmap

### Phase 1: Foundation (COMPLETE ✅)

- ✅ Security policies documented
- ✅ Access controls implemented
- ✅ Incident response procedures
- ✅ Compliance framework established

### Phase 2: Pilot (CURRENT)

- ✅ ISMS framework documented
- ⏳ Limited deployment (10 customers)
- ⏳ Monitoring and metrics
- ⏳ Continuous improvement

### Phase 3: Production (Q1 2026)

- SOC 2 certification
- ISO 27001 certification
- Full automation
- Advanced threat detection

### Phase 4: Optimization (2026+)

- Predictive security
- AI-powered threat detection
- Zero-trust architecture
- Continuous compliance

---

**ISMS Status:** ✅ ESTABLISHED AND OPERATIONAL  
**Compliance:** EXCELLENT (8.5/10)  
**Next Review:** 2025-11-11 (monthly)

---

_This ISMS provides the foundation for all information security activities at HotDash, ensuring systematic and comprehensive protection of information assets._
