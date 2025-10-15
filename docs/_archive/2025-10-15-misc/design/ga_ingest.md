---
epoch: 2025.10.E1
doc: docs/design/ga_ingest.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# Technical Design — GA Sessions Ingest (MCP Pending)

## Goal
Provide the SEO & Content Watch tile with week-over-week session trends and landing-page anomalies. While the Google Analytics MCP is not yet available, we will build the ingest pipeline with a mock adapter to unblock downstream development.

## Approach
- Define a service contract that abstracts GA data retrieval so we can swap the MCP-backed implementation once credentials arrive.
- Persist normalized facts in Prisma to enable historical comparisons and evidence capture.

## Components
1. `app/services/ga/` directory
   - `client.ts`: interface `GaClient { fetchLandingPageSessions(range: DateRange): Promise<GaSession[]> }`.
   - `mcpClient.ts`: placeholder returning `Promise.reject` until MCP configured.
   - `mockClient.ts`: deterministic fixture returning sample data for development/tests (guarded by env `GA_USE_MOCK=1`).
   - `ingest.ts`: orchestrates fetch, computes deltas, writes to `DashboardFact`.
2. Prisma tables (shared `DashboardFact`). Add `fact_type = 'ga.sessions'` records storing `landing_page`, `sessions`, `wow_delta`, `created_at`.
3. Loader integration in dashboard tile reading facts and flagging drops >20%.

## Configuration
- Environment vars: `GA_MCP_HOST` (future), `GA_PROPERTY_ID`, `GA_USE_MOCK` (default true until MCP ready).
- Provide config helper that throws if MCP required but host missing, instructing ops to keep mock mode.

## Workflow
1. Dashboard loader triggers `getLandingPageAnomalies(range)`; passes `DateRange` (today vs previous 7 days).
2. Service selects client (mock vs MCP).
3. Client returns array of `{ landingPage, sessions, wowDelta, evidenceUrl? }`.
4. Service writes facts and returns data for tile rendering.
5. Once MCP ready, implement `mcpClient` using HTTP calls defined in `packages/integrations/ga-mcp.md` (sessions, sources, landing pages) and disable mock in production.

## Testing
- Vitest: unit tests covering mock data flow, delta calculation, Prisma persistence.
- Integration test toggling mock vs MCP (MCP test skipped/pending until available).
- Playwright: ensure tile highlights drops with red badge and surfaces view-details CTA.

## Risks
- MCP contract changes; mitigate by centralizing request builder in `mcpClient` and versioning the schema.
- Data latency: schedule periodic refresh (cron) when MCP live; for now manual refresh via loader.

## Deliverables
1. Service scaffolding with mock implementation + TODO for MCP handshake.
2. Tests verifying mock pathway and ingestion math.
3. Documentation updates once MCP endpoint ready.
