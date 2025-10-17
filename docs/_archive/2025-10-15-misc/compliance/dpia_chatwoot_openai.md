---
epoch: 2025.10.E1
doc: docs/compliance/dpia_chatwoot_openai.md
owner: compliance
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-21
---

# DPIA — Chatwoot Transcripts & OpenAI Assistance (via LlamaIndex)

## 1. Processing Overview

- **Controller**: HotDash (Operator Control Center for Shopify merchants).
- **Processors/Subprocessors**:
  - Chatwoot (CX conversations and transcripts).
  - OpenAI (planned AI suggestion service, accessed via OpenAI API).
  - Supabase (decision/fact persistence as secondary storage for operator actions).
  - LlamaIndex service (self-hosted ingestion/orchestration that prepares prompts and context).
- **Processing Activities**:
  1. Ingest open/pending Chatwoot conversations + recent message history to surface SLA breaches.
  2. Generate AI-assisted reply drafts using OpenAI with prompts compiled by LlamaIndex.
  3. Store operator decisions (approve, escalate, resolve) plus metadata in Prisma + Supabase.

## 2. Data Categories & Subjects

| Data Element                   | Source              | Personal Data?    | Notes                                                                                                                        |
| ------------------------------ | ------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Customer name, message content | Chatwoot            | Yes (PD)          | May contain free-form PII (addresses, order details).                                                                        |
| Operator email/name            | Shopify session     | Yes (PD)          | Used for audit trail + analytics.                                                                                            |
| Conversation tags/status       | Chatwoot            | No (metadata)     | Indicates SLA breaches.                                                                                                      |
| AI prompt/response             | LlamaIndex → OpenAI | Yes (PD possible) | Prompt includes sanitized customer message excerpts, trimmed to last 6 messages; stored only as hashes/fingerprints locally. |
| Decision payload               | HotDash form        | Yes (PD possible) | Operators may add free-text notes.                                                                                           |

## 3. Lawful Basis

- **Contractual necessity**: Managing merchants' CX escalations and SLA response obligations.
- **Legitimate interest**: Providing AI suggestions to increase response speed; subject to balancing test (below).
- **Consent**: Not required for operators acting in professional context, but we will provide opt-out for AI suggestions where feasible.

## 4. Risk Assessment

| Risk                                                       | Likelihood | Impact | Rating | Mitigations                                                                                                                                                                              |
| ---------------------------------------------------------- | ---------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI prompt includes excessive PII (addresses, payment info) | Medium     | High   | High   | Enforce prompt sanitizer removing tokens matching patterns (emails, phone numbers, card numbers); limit message history to essential lines; include operator review step before sending. |
| OpenAI retains prompts for training                        | Medium     | Medium | Medium | Secure enterprise agreement with retention opt-out; route via regional endpoint; store only prompt fingerprints locally.                                                                 |
| Supabase mirror exposes decision log to broader team       | Low        | Medium | Medium | Restrict service key access; implement RLS to scope by project; 12-month retention limit.                                                                                                |
| Operators unaware of analytics tracking                    | Medium     | Low    | Medium | Update privacy notice/terms; provide toggle in settings; log consent status.                                                                                                             |
| Chatwoot transcript stored beyond 14 days                  | Medium     | Medium | Medium | Automate purge job (see `docs/compliance/retention_automation_plan.md`).                                                                                                                 |

## 5. Necessity & Proportionality

- Only last six messages ingested; older transcript data remains in Chatwoot.
- AI suggestions are optional; operator must approve before sending.
- Decision log collects minimal metadata (who/what/when) for audit.

## 6. Safeguards & Controls

- **Technical**: TLS enforced for all API calls; secrets managed per `docs/runbooks/secret_rotation.md`; Supabase service key limited to required tables; LlamaIndex service runs within private network.
- **Organizational**: Operators trained via `docs/runbooks/cx_escalations.md`; AI usage monitored by compliance; incidents handled using `docs/runbooks/incident_response_breach.md`.
- **Data Minimization**: Prompt builder to strip URLs, emails, phone numbers; store prompt fingerprints (hash + timestamp) instead of raw payloads; escalate to manual review if blocked content detected.

## 7. Residual Risk & Decision

- Residual risk considered **Medium** pending vendor DPA confirmations and sanitizer implementation. Launch contingent on:
  1. OpenAI data handling assurances documented (enterprise opt-out, regional endpoint).
  2. Retention automation deployed.
  3. Privacy notice update published.

## 8. Action Items

| Task                                          | Owner                   | Due        |
| --------------------------------------------- | ----------------------- | ---------- |
| Implement prompt sanitizer + logging          | Engineering             | 2025-10-12 |
| Capture OpenAI DPA/data retention commitments | Manager/Compliance      | 2025-10-14 |
| Deploy retention purge jobs                   | Engineering/Reliability | 2025-10-14 |
| Publish privacy notice update                 | Marketing/Compliance    | 2025-10-12 |
| Re-run DPIA review post mitigations           | Compliance              | 2025-10-16 |

## 9. Review & Approval

- **Reviewer**: Manager (pending)
- **Next Review**: After OpenAI go-live or by 2025-11-01.
