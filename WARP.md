# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

High-level overview
- HotDash is a React Router 7 SSR app embedded in Shopify Admin. The app is built and served with React Router tooling (not Remix) and uses Shopify’s app kit for auth/session management.
- Persistence: Prisma (Postgres) backs Shopify sessions and dashboard facts; Supabase is the default Postgres platform. A lightweight "Memory" adapter (packages/memory) can also log decisions/facts to Supabase tables for auditability.
- Integrations: Shopify Admin API, Chatwoot, and Google Analytics (via MCP or mock). Data services produce dashboard "facts" that drive UI tiles.

Common terminal commands
- Install deps: npm install
- One-time setup (generate client + apply migrations): npm run setup
- Dev server (Shopify CLI + Vite dev): npm run dev
- Build (SSR + client bundles): npm run build
- Start (serve built app): npm run start
- Lint: npm run lint
- Typecheck: npm run typecheck
- Unit tests (Vitest): npm run test:unit
  - Run a single unit test by file: npm run test:unit -- tests/unit/ga.ingest.spec.ts
  - Run by name pattern: npm run test:unit -- -t "anomalies"
- E2E tests (Playwright): npm run test:e2e
  - Run a single spec: npm run test:e2e -- tests/playwright/dashboard.spec.ts
  - Filter by test title: npm run test:e2e -- -g "renders tiles"
  - Admin-embed smoke (requires creds): PLAYWRIGHT_SHOPIFY_EMAIL={{PLAYWRIGHT_SHOPIFY_EMAIL}} PLAYWRIGHT_SHOPIFY_PASSWORD={{PLAYWRIGHT_SHOPIFY_PASSWORD}} npm run playwright:admin
- Seed development data: npm run seed
- Nightly metrics rollup (manual): npm run ops:nightly-metrics
- Tail Supabase logs locally or by project ref: scripts/ops/tail-supabase-logs.sh [<project-ref>]

Environment and setup
- Requirements: Node >= 20.10, Shopify CLI, Supabase CLI.
- Local DB: supabase start, then export your .env with DATABASE_URL pointing at the local Postgres (see docs/deployment/env_matrix.md for details).
- Core env vars used by the app (set via .env for local, GitHub Actions secrets in CI):
  - Shopify: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL, SCOPES (optional), SHOP_CUSTOM_DOMAIN (optional)
  - Database/Supabase: DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY
  - Chatwoot: CHATWOOT_BASE_URL, CHATWOOT_TOKEN, CHATWOOT_ACCOUNT_ID, CHATWOOT_SLA_MINUTES (optional)
  - GA/MCP: GA_PROPERTY_ID, GA_USE_MOCK (default 1), GA_MCP_HOST (when not mocking)
  - Test-only: PLAYWRIGHT_BASE_URL, PLAYWRIGHT_SHOPIFY_EMAIL, PLAYWRIGHT_SHOPIFY_PASSWORD, DASHBOARD_USE_MOCK
- Note: The Dockerfile uses node:18-alpine but package.json requires Node >= 20.10; prefer local Node 20 for development and CI.

Big-picture architecture
- SSR app entry: app/entry.server.tsx wires ServerRouter streaming and sets Shopify headers via addDocumentResponseHeaders. app/root.tsx composes the document shell.
- Routing/build: React Router Vite plugin discovers routes from app/routes/** (via app/routes.ts and @react-router/fs-routes). Build is react-router build; start uses react-router-serve.
- Shopify auth/session: app/shopify.server.ts configures @shopify/shopify-app-react-router with PrismaSessionStorage; session records live in Prisma (model Session).
- Services layer (app/services/**):
  - shopify/client.ts wraps authenticate.admin and adds retry/backoff for admin.graphql.
  - chatwoot/escalations.ts pulls open conversations, tags, SLA breaches; records a dashboard fact.
  - ga/ingest.ts fetches or mocks GA sessions, flags anomalies, and records a dashboard fact.
  - metrics/aggregate.ts reads most recent rolling aggregates from DashboardFact.
  - facts.server.ts is the single writer for dashboard facts (DashboardFact rows) used by tiles.
  - ai-logging.server.ts logs AI outputs into Memory (Supabase) for an audit trail.
- Memory adapter (packages/memory/**): Provides a consistent interface for decision/fact logging. The Supabase implementation includes retry/backoff and legacy table fallbacks.
- UI composition: app/components/tiles/* render domain tiles (Sales, Inventory, CX, SEO, Ops); routes under app/routes/* load facts and orchestrate workflows.

Testing model
- Vitest runs jsdom-based unit tests under tests/unit/** with setup in tests/unit/setup.ts (see vitest.config.ts). Run single tests via path or -t patterns.
- Playwright spins up a production-like server automatically (see playwright.config.ts webServer command). By default, tests run with DASHBOARD_USE_MOCK=1 and hit http://127.0.0.1:4173.
- CI (tests.yml) executes: typecheck, lint, unit tests, Playwright, and Lighthouse. Nightly metrics are run via a scheduled workflow (nightly-metrics.yml) applying migrations first.

Supabase edge logging (observability)
- A lightweight function lives at supabase/functions/occ-log. Local: supabase functions serve occ-log --env-file .env.local. Deploy: supabase functions deploy occ-log --project-ref <ref> and set SUPABASE_SERVICE_ROLE_KEY.

Pointers to canonical docs in-repo
- Quick start, daily workflows, and Shopify guardrails: README.md
- Environment variable matrix and secret sources: docs/deployment/env_matrix.md
- Data/KPIs and contracts: docs/data/*.md
- Prisma schema and seeds: prisma/schema.prisma and prisma/seeds/README.md
- QA Playwright plan and Supabase runbooks: docs/runbooks/*.md
