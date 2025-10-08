---
epoch: 2025.10.E1
doc: docs/compliance/data_inventory.md
owner: compliance
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-14
---
# Data Inventory & Retention Matrix — Operator Control Center

## Scope & Methodology
- Systems in scope: Shopify Admin app (Remix), Prisma (SQLite/Postgres), Supabase Memory, Chatwoot, Google Analytics MCP, Anthropic SDK (planned for AI assistance), operator decision/fact pipelines, in-app caches.
- Sources: Service implementations under `app/services`, contract specs in `docs/data/data_contracts.md`, and runbooks/governance documents referenced in the compliance canon.
- Classification: Mark data elements containing personal data (PD), sensitive personal data (SPD), or confidential business data (CBD). Absence of classification indicates operational metadata only.

---

## Summary Matrix
| Processing Activity | Source / Interface | Data Categories | Storage Location(s) | Retention Target | Purpose & Legal Basis | Access Controls | Notes / Gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Shopify OAuth Session Mgmt | Shopify Admin OAuth callbacks via `@shopify/shopify-app-session-storage-prisma` | Shop domain (CBD), access token (confidential), operator email/first/last name (PD), collaborator flag (PD) | Prisma `Session` table (`prisma/schema.prisma`) | 90 days or on session expiry (automation pending) | Maintain authenticated session (contractual necessity with merchant) | Prisma access from app server; no Supabase replication | Expired sessions not auto-purged; add cron/worker to delete. |
| Sales Pulse Tile | Shopify Admin GraphQL `SalesPulse` query | Order id/name (CBD), createdAt, fulfillment status, financial status, SKU + revenue aggregates (CBD) | Prisma `DashboardFact` (`factType=shopify.sales.summary`); in-memory cache (TTL via `app/services/shopify/orders.ts`) | 30 days (pending purge job) | Provide sales overview to operators (legitimate interest / contractual) | App service only; Supabase facts not used | No customer PII captured. Implement fact purge script. |
| Fulfillment Issues Tile | Shopify Admin GraphQL `ORDER_FULFILLMENTS_QUERY` | Order id/name (CBD), display status, createdAt timestamps | Prisma `DashboardFact` (`factType=shopify.fulfillment.issues`) | 30 days | Highlight fulfillment blockers (contractual) | App service; cached in memory | Ensure purge aligns with Sales Pulse cadence. |
| Inventory Heatmap Tile | Shopify Admin GraphQL `InventoryLevels` | Variant id, SKU (CBD), product title, inventoryQuantity (CBD) | Prisma `DashboardFact` (`factType=shopify.inventory.health`) | 30 days | Prevent stockouts (contractual) | App service only | Negative inventory clamped to 0 before storage. |
| CX Escalations Tile | Chatwoot REST `/conversations` + `/messages` | Conversation id, inbox id (CBD), customer name (PD), tags, message transcript excerpts (PD) | Prisma `DashboardFact` (`factType=chatwoot.escalations`); cached in-memory (`CACHE_TTL_MS` env) | 14 days (pending purge) | Surface SLA breaches and recommended actions (legitimate interest / contractual) | App service; no Supabase replication | Transcript data carries PD; limit retention + mask where feasible. |
| Operator Actions on CX Escalations | HotDash action `/actions/chatwoot.escalate` | Conversation id (CBD), reply body (PD possible), operator note (PD possible), AI suggestion metadata, actor email (PD) | Prisma `DecisionLog`; Supabase `decision_log` mirror via `logDecision`; payload JSON persisted | 1 year (audit requirement); rotate Supabase service key per `docs/runbooks/secret_rotation.md` | Maintain audit trail for approvals (legal obligation / contractual) | Prisma + Supabase service key (least privilege); decisions accessible via internal tooling only | Need documented purge process post-retention; Supabase table currently unlimited. |
| Dashboard Analytics Tracking | App logs via `logDashboardView`/`logDashboardRefresh` | Operator email (PD), requestId (CBD), tile identifier, timestamps | Supabase `facts` table (`topic=dashboard.analytics`); in-memory fallback if Supabase absent | 180 days (support trend analysis) | Measure operator engagement (legitimate interest, requires notice/consent) | Supabase service key write; read limited to analytics tooling | Add opt-out toggle and update privacy notice before production. |
| GA Landing Page Anomalies | GA MCP `/landing-pages` (planned) | Landing page URL path (CBD), session counts, WoW deltas | Prisma `DashboardFact` (`factType=ga.sessions.anomalies`) | 30 days | Identify SEO/traffic issues (legitimate interest) | App-only access | Ensure GA MCP contract covers EU data transfer (pending). |
| Decision Log (non-Chatwoot) | Various approval flows (future tiles) | Actor identifier/email (PD), action summary, rationale, optional evidence URL | Prisma `DecisionLog`; Supabase `decision_log` mirror | 1 year | Central audit log for operator actions (legal obligation) | As above | Need DPIA once additional tiles ship. |
| In-app Cache Layer | Node memory via `app/services/cache.server.ts` | Cached API responses (data listed above) | Process memory (no disk) | <=5 minutes TTL | Reduce vendor calls (legitimate interest) | Resets on deploy | No additional controls required; document in DPIA. |
| Planned: Hootsuite Social Sentiment Tile | Hootsuite API (future) | TBD sentiment metrics, campaign tags (CBD) | Not yet implemented | TBD | Marketing insights (legitimate interest) | Will require OAuth scopes + contract review | Block go-live until DPA reviewed. |

---

## Data Flow Notes
- **Shopify → HotDash**: Queries executed server-side with app access token; responses written to Prisma `DashboardFact`. No replication to Supabase today. Facts returned to Remix loaders for tile rendering.
- **Chatwoot → HotDash**: Conversations/messages retrieved per page, truncated to latest six messages. Stored facts include message excerpts and customer names. Operator actions push replies/tags back to Chatwoot and log decisions locally + Supabase.
- **Supabase Memory**: When configured, `logDecision` and analytics services mirror data to Supabase tables `decision_log` and `facts`. Service key scoped to those tables per `docs/runbooks/secret_rotation.md`.
- **Google Analytics MCP**: Currently mocked; production flow will POST date ranges to MCP host and ingest aggregated session metrics. No end-user identifiers transmitted.
- **Anthropic SDK**: Not yet active in production for CX tile; when enabled, prompt/response payloads may include conversation context. Ensure prompts redact customer PII before transit.

---

## Retention Controls & Required Actions
1. Implement scheduled purge job for Prisma `DashboardFact` records older than 30 days (Shopify + GA) and 14 days for Chatwoot transcripts; mirror deletion to Supabase if replication added.
2. Add automated cleanup of expired Shopify sessions and revoke corresponding tokens via Shopify Admin API.
3. Define Supabase retention policy (SQL TTL or scheduled function) to delete `decision_log` entries older than 12 months and `facts` older than 180 days.
4. Document operator analytics collection in privacy notice and provide opt-out for GA/analytics tracking before MCP go-live.
5. Conduct DPIA covering Chatwoot transcript handling and upcoming Anthropic usage; capture in `docs/compliance/`.

---

## Risk & Mitigation Tracker
- Track implementation status in `feedback/compliance.md` (see latest entry).
- Evidence (purge scripts, policy approvals, DPIA) must be stored under `docs/compliance/evidence/` once generated.
