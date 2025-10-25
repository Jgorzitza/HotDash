# Per‑Lane Molecules (Assign and Execute)

Managers: copy relevant molecules into each agent’s daily task files. Each molecule has a clear DoD and proof requirements. Agents will expand as needed.

## Customer‑Front (Chatwoot intake → handoffs)
- CF‑M1: Enable Chatwoot webhooks to intake endpoint; map to intent slots (order status, returns, product fit, policy).
  - DoD: Message → work item in <5s; dedupe works; event IDs logged.
  - Proof: Screenshot/log of received events; intent → handoff mapping documented.
  - Source: Chatwoot webhook docs.
- CF‑M2: Define handoff matrix and ownership rule (one specialist at a time).
  - DoD: Matrix file exists; transcript of a test where ownership is clear.
  - Proof: Handoff log with tool name and request_id.
- CF‑M3: Redacted reply + PII card for operator approval (HITL).
  - DoD: Dual‑pane preview; operator can approve; PII never in public text.

## Accounts Sub‑Agent (Customer Accounts MCP only)
- ACC‑M1: OAuth + token store; scope minimal set needed.
  - DoD: Auth works; refresh documented; token never logged.
  - Proof: 401→OAuth→authorized call trace; request_id noted.
- ACC‑M2: ABAC policy (agent=accounts_sub AND customer match AND tool allowlist).
  - DoD: Negative tests blocked; audit logs present.
- ACC‑M3: Redaction schema for order/address/email.
  - DoD: Samples show masked formats; operator sees full details in private card.

## Storefront Sub‑Agent (Storefront MCP)
- SF‑M1: Tools inventory and parameters.
  - DoD: Catalog of supported tools and input schemas.
- SF‑M2: Availability/spec‑fit with RAG facts; return SKU + evidence.
  - DoD: Example output with Storefront MCP request_id + RAG citation.

## CEO‑Front Agent
- CEO‑M1: Decision‑pack format (Problem, Draft, Evidence, Expected impact, Rollback).
  - DoD: Three real packs visible in dashboard.
- CEO‑M2: Freshness labels on tiles from telemetry pipeline.
  - DoD: Badges reflect GSC 48–72h lag; no alerts on incomplete days.

## Analytics Agent
- AN‑M1: GSC Bulk Export → BigQuery enabled; table contract documented.
  - DoD: Yesterday’s tables present; partition scheme documented.
- AN‑M2: GA4 runReport specs for landers/revenue/CTR; join with GSC keys.
  - DoD: Spec doc with dimensions/metrics; sample joined output; freshness labels defined.
- AN‑M3: Opportunity rules (rank 4–10, CTR gap, high‑revenue poor CTR pages).
  - DoD: “Top Opportunities” list with expected $$ impact per action.

## Inventory Agent
- INV‑M1: Stock‑risk thresholds using velocity vs on‑hand vs inbound POs.
  - DoD: List of at‑risk SKUs + reasoning; Action drafts with rollback.
- INV‑M2: Slow‑mover and back‑in‑stock playbooks.
  - DoD: Draft banners/badges/bundles (as proposals); evidence attached.

## Content/SEO/Perf Agent
- SEO‑M1: Programmatic page metaobjects plan + internal link rules + JSON‑LD plan (docs only).
  - DoD: Target list with link graph outline.
- SEO‑M2: CWV tasks tied to $$ pages; evidence includes perf traces.
  - DoD: Prioritized list per page with trace evidence.
- SEO‑M3: A/B harness specification (cookie + GA4 dimension; attribution windows).
  - DoD: Spec doc with examples.

## Risk Agent
- RISK‑M1: Order aging thresholds, carrier delays, refund anomaly thresholds.
  - DoD: Action cards with rationale and operator click‑through.

## References
- Storefront MCP server tools: https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront
- Customer Accounts MCP server: https://shopify.dev/docs/apps/build/storefront-mcp/servers/customer-account
- Agents SDK handoffs: https://openai.github.io/openai-agents-js/guides/handoffs/
- Chatwoot webhooks: https://www.chatwoot.com/hc/user-guide/articles/1677693021-how-to-use-webhooks
- GSC Bulk Export: https://developers.google.com/search/blog/2023/02/bulk-data-export
- GA4 Data API: https://developers.google.com/analytics/devguides/reporting/data/v1
