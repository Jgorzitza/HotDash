---
epoch: 2025.10.E1
doc: docs/compliance/comp_scc_dpa_escalation_plan_2025-10-11.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---
# COMP-SCC-DPA Escalation Plan — 2025-10-11T01:30Z

## Current Status Summary
| Vendor | Process | Status | Owner | Due Date | Evidence Path |
|--------|---------|--------|--------|----------|---------------|
| Supabase | SCC Countersignature | BLOCKED | Compliance | 2025-10-16 15:00 UTC | `docs/compliance/evidence/supabase/scc/` |
| Supabase | DPA Review | COMPLETE | Compliance | N/A | `docs/compliance/evidence/supabase/dpa/dpa_review_2025-10-11.md` |
| OpenAI | DPA Finalization | PENDING | Manager/Compliance | 2025-10-16 18:00 UTC | `docs/compliance/evidence/openai/` |
| GA MCP | Data Residency | PENDING | Integrations | 2025-10-16 17:00 UTC | `docs/compliance/evidence/ga_mcp/dpa/` |

## Data Flow Summary & Personal Data Classification

### Shopify Admin Embed Token → HotDash Data Pipeline
```
Shopify Admin OAuth → Session Storage (Prisma) → Dashboard Facts (Prisma/Supabase)
├── Personal Data (PD): Shop domain, operator email/name, collaborator status
├── Confidential Business Data (CBD): Access tokens, order IDs, SKU data, revenue
└── Retention: 90 days (sessions), 30 days (dashboard facts), 1 year (decisions)
```

### Chatwoot → OCC CX Pipeline  
```
Chatwoot REST API → Dashboard Facts → Decision Log → Supabase Mirror
├── Personal Data (PD): Customer names, message transcripts, operator notes
├── Metadata: Conversation IDs, SLA breach timestamps, tags
└── Retention: 14 days (transcripts), 1 year (decisions)
```

### AI Processing Chain (OpenAI + LlamaIndex)
```
Chatwoot Transcripts → LlamaIndex Sanitizer → OpenAI API → Decision Suggestions
├── PII Risk: HIGH - Customer message content may contain addresses, phone numbers
├── Mitigation: Prompt sanitizer, regional endpoints, enterprise opt-out
└── Retention: Prompt fingerprints only (no raw content), 30 days
```

### Supabase Memory Storage
```
Decision Log → Supabase `decision_log` table → Facts → `facts` table  
├── Personal Data (PD): Operator emails, customer references in decision notes
├── Legal Basis: Audit trail (legal obligation), analytics (legitimate interest)
└── Retention: 12 months (decisions), 180 days (facts)
```

## Open Questions & Blocking Decisions

### Supabase SCC (Ticket #SUP-49213)
- **Q1:** Project `hotdash-occ-staging` confirmed in `us-east-1` region?
- **Q2:** Countersigned SCC bundle with HotDash legal entity details?
- **Q3:** pg_cron evidence for retention automation compliance?
- **Escalation:** Support phone queue if silent by 2025-10-16 15:00 UTC

### OpenAI Enterprise DPA  
- **Q1:** Prompt retention opt-out enabled for enterprise accounts?
- **Q2:** Regional data residency assurances (US/EU endpoints)?
- **Q3:** Rate-limit and audit logging policies documented?
- **Escalation:** Manager to provide signed agreement or direct vendor contact

### GA MCP Data Processing
- **Q1:** MCP endpoint region (EU vs US) for production deployment?
- **Q2:** Data retention defaults (≤26 months) or custom configuration?
- **Q3:** Subprocessors appendix with Schrems II safeguards?
- **Escalation:** Integrations team to secure vendor response by 2025-10-16 17:00 UTC

## Embed Token Risk Assessment

### Token Scope & Lifetime Analysis
- **Storage:** Prisma Session table, encrypted at rest via platform controls
- **Transmission:** HTTPS only, no external vendor sharing
- **Lifetime:** 90-day rotation per Shopify requirements
- **Access:** App service only, no Supabase replication

### Risk Mitigation Controls
- **Technical:** TLS enforced, service key scoped to required tables only
- **Organizational:** Incident response per `docs/runbooks/incident_response_breach.md`
- **Revocation:** Shopify Admin API token invalidation documented in reliability runbooks

### Compliance Requirements
- **DPA Alignment:** Token usage must align with finalized Shopify DPA addendum
- **Audit Trail:** All token access logged in `decision_log` with operator context
- **Retention:** Token metadata purged with session expiry (90 days max)

## Nightly AI Logging Audit Points

### Data Protection Compliance Checks
1. **PII Redaction:** Prompt sanitizer removes emails, phone numbers, card data
2. **Retention Policy:** Log files purged after 30 days, index rebuilt every 90 days  
3. **Access Controls:** AI service account only, no external storage replication
4. **Encryption:** Artifacts stored with platform encryption at rest

### DPA Requirements Integration
- **OpenAI Processing:** Ensure prompt retention opt-out active before production
- **LlamaIndex Build:** Document text chunking and PII detection methodology
- **Supabase Logging:** Mirror compliance with service key table restrictions
- **Audit Evidence:** Hash register maintained per `docs/compliance/evidence/ai_logging/`

## Daily Escalation Session Plan

### Schedule: 30 minutes daily until approvals obtained
- **Time:** 16:00 UTC daily
- **Participants:** Product (lead), Compliance, Legal (when available), Manager
- **Agenda Template:**
  1. Vendor response status update (5 min)
  2. Open question review and assignments (10 min)  
  3. Escalation decisions and next touchpoints (10 min)
  4. Evidence capture and Linear updates (5 min)

### Session Deliverables
- **Feedback Log:** Every touchpoint logged in `feedback/product.md` with evidence links
- **Linear Updates:** COMP-SCC-DPA issue status and comments updated daily
- **Evidence Archive:** New documents hashed and stored in respective vendor folders
- **Risk Register:** Updated in Linear with likelihood/impact assessments

## Success Criteria & Exit Conditions

### Completion Gates
1. **Supabase:** Countersigned SCC received and region confirmed  
2. **OpenAI:** Enterprise DPA signed with retention opt-out documented
3. **GA MCP:** Data residency confirmation and subprocessor list obtained
4. **Embed Token:** Legal/compliance written approval for usage patterns documented

### Evidence Requirements
- **All DPAs:** PDF copies stored with SHA256 hashes in evidence folders
- **SCC Bundle:** Signed annexes with party details and project identifiers  
- **Approval Emails:** Vendor confirmations archived with receipt timestamps
- **Risk Assessment:** Final compliance sign-off recorded in `feedback/compliance.md`

---
**Next Actions:** Create Linear issue COMP-SCC-DPA with this plan attached; schedule first escalation session for 2025-10-11 16:00 UTC