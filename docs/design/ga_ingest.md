---
epoch: 2025.10.E1
doc: docs/design/ga_ingest.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---

# Technical Design — GA Sessions Ingest (Direct API)

## Goal

Provide the SEO & Content Watch tile with week-over-week session trends and landing-page anomalies. We use the Google Analytics Data API directly (service account credentials) for application data fetching. A mock adapter remains available to unblock development and tests when credentials are not present.

## Approach

- Define a service contract that abstracts GA data retrieval, with a direct API client for production and a mock client for development/tests.
- Persist normalized facts in Prisma to enable historical comparisons and evidence capture.

## Components

1. `app/services/ga/` directory
   - `client.ts`: interface `GaClient { fetchLandingPageSessions(range: DateRange): Promise<GaSession[]> }`.
   - `directClient.ts`: Google Analytics Data API (BetaAnalyticsDataClient) implementation.
   - `mockClient.ts`: deterministic fixture returning sample data for development/tests (guarded by env `GA_USE_MOCK=1`).
   - `ingest.ts`: selects direct vs mock client, orchestrates fetch, computes deltas, writes to `DashboardFact`.
2. Prisma tables (shared `DashboardFact`). Add `fact_type = 'ga.sessions'` records storing `landing_page`, `sessions`, `wow_delta`, `created_at`.
3. Loader integration in dashboard tile reading facts and flagging drops >20%.

## Configuration

- Environment vars: `GA_PROPERTY_ID`, `GA_MODE` (`direct|mock`), `GA_USE_MOCK` (legacy, defaults true), `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON).
- The system defaults to `mock` unless `GA_MODE=direct` or `GOOGLE_APPLICATION_CREDENTIALS` is set. No GA MCP is used.

## Workflow

1. Dashboard loader triggers `getLandingPageAnomalies(range)`; passes `DateRange` (today vs previous 7 days).
2. Service selects client (mock vs direct).
3. Client returns array of `{ landingPage, sessions, wowDelta, evidenceUrl? }`.
4. Service writes facts and returns data for tile rendering.
5. N/A — GA MCP removed from scope. Direct API is the supported integration.

## Testing

- Vitest: unit tests covering mock data flow, delta calculation, Prisma persistence.
- Integration test toggling mock vs MCP (MCP test skipped/pending until available).
- Playwright: ensure tile highlights drops with red badge and surfaces view-details CTA.

## Risks

- GA API changes; mitigate by centralizing request builder in `directClient` and versioning request helpers.
- Data latency: schedule periodic refresh (cron) when MCP live; for now manual refresh via loader.

## Deliverables

1. Service scaffolding with direct API + mock implementation.
2. Tests verifying mock pathway and ingestion math.
3. Documentation: GA uses direct API; no GA MCP.
