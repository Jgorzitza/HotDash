Status: Planned only — do NOT seed or ship yet

# AI Knowledge Base (Day‑1 RAG + Coach Notes)

Goal

- Provide reliable, searchable knowledge for agents (and AI) using retrieval‑augmented generation (RAG) only. No model retraining Day‑1. All content must be sourced from approved, canonical materials with HITL curation.

Principles

- MCP‑first: fetch/live‑cite authoritative sources (Shopify Admin API, internal docs, GA4/GSC metrics where relevant)
- Canonical links only (friendly‑name → URL mapping)
- PII redaction before storage; zero secrets in index
- HITL curation, versioned entries, immutable audit

Sources (Day‑1)

- Internal docs: Install guides, warranty, policies, FAQs (from repo docs)
- Product catalog (Shopify): titles, options, vendor (read‑only), canonical slugs
- Reason codes + macros: agent_reason_codes (normalized), macros (Build Snapshot, Sealant guidance, EFI filter sizing)
- Coach notes library: generated from Approvals diffs (edits + reasons) with tags
- Customer threads (Chatwoot): de‑identified snippets (optional Day‑1), safety‑filtered

Artifact schema (knowledge item)

- id (uuid), version, source_type (doc|shopify|macro|coach_note|faq|policy)
- title, content (markdown/plain), chunks[] (tokenized segments)
- metadata: feature (replies|inventory|social|discounts|seo|ads), category, tags[], vendor, product_variant_id?, canonical_link_name?, url?, updated_at
- controls: pii_redacted (bool), approved_by, approved_at

Indexing

- Chunk size ~ 500–800 tokens; overlap 100 tokens for docs
- Embeddings index (planning): pgvector or FAISS; Day‑1 may use file‑based index
- Metadata filters: feature, category, vendor, product id, tags

Retrieval (RAG)

- Query → filter by feature/context → top‑k by similarity → re‑rank → assemble context
- Always cite sources (link names → URLs); never raw URLs in output
- Safety: block P0 topics; show “escalate to CEO” when a P0 is detected (per reason codes)

Coach Notes Library

- Input: Approvals “Approve/Approve w/ Edit” diffs + reason codes
- Processing: generate concise note (what changed, why) → tag with feature, category, vendor/product if applicable → store as knowledge item (coach_note)
- Usage: surfaces in composers as contextual hints; agents must acknowledge per Approvals policy

Composer Integrations (examples)

- Customer Replies: inline search (Install guide, Sealant guidance macro, Warranty) + coach notes relevant to intent/channel
- Social: canonical link mapping + SOC‑LINK checks + discount defaults
- Inventory: vendor/MPN lookups; HRAN↔UPC rules; receiving checklists
- Content Upgrades: prior upgrades on this page; accepted patterns for titles/meta/FAQs

Governance & Curation

- HITL: New entries require approver and version; edits preserve prior versions
- Redaction pass for any imported thread content; delete on request
- Monthly review of low‑performing notes; sunset stale entries

MCP & Evidence

- Every auto‑fetched source must store an MCP transcript reference in evidence when used for generation in production
- Allowed MCP: Shopify Admin APIs, GA4/GSC data APIs (read‑only), Publer API metadata where relevant

Security & Privacy

- No customer PII in index
- Access control: role‑based; coach notes visible to agents; internal docs read‑only

Open Items

- Index storage selection: pgvector vs FAISS; Day‑1 can ship file‑based
- Drive ingestion (optional) for internal PDFs—requires OCR pass
