# HotDash — Operator Control Center

HotDash delivers an operator-first control center for Shopify stores. Tiles surface real-time context across sales, fulfillment, inventory, CX escalations, and SEO anomalies, pairing every insight with an approval-ready workflow and audit trail.

This repo contains the full web application, service layer integrations, agent direction docs, and tooling required to run telemetry jobs and nightly metrics rollups.

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 20.10
- **npm** (ships with Node) or pnpm/yarn if you prefer
- **Shopify CLI** (`npm install -g @shopify/cli@latest`)
- **Supabase CLI** (`npm install -g supabase`)
- **Shopify Partner account** + development store
- **Supabase project** (remote) _and_ the local Supabase containers started via `supabase start`

### 1. Clone & Install
```bash
git clone https://github.com/Jgorzitza/HotDash.git
cd HotDash
npm install
```

### 2. Configure Environment
1. Start the Supabase containers (first run can take ~2 minutes):

   ```bash
   supabase start
   ```

   Local services expose:

   - Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
   - REST: `http://127.0.0.1:54321`
   - Studio: `http://127.0.0.1:54323`

   You can confirm any time with `supabase status`.

2. Copy `.env.local.example` to `.env.local` and fill in the placeholders (Shopify keys, ngrok URL, optional OpenAI key). Keep this file out of git — `.env*` is already ignored.

3. Load the env file when working locally:

   ```bash
   export $(grep -v '^#' .env.local | xargs)
   ```

   > CI pulls secrets from GitHub environments; no manual export required in pipelines.

### 3. Initialize the Project
```bash
npm run setup   # prisma generate + migrate deploy
npm run dev     # starts Shopify dev tunnel + React Router 7 app
```
Press `p` in the CLI output to open the embedded admin URL and complete app installation in your development store.

### 4. Verification
Once the dashboard loads, ensure tiles render in mock mode. Add real credentials (Shopify, Chatwoot, GA) to move to live data.

### 5. Tail Supabase logs (optional)
```bash
scripts/ops/tail-supabase-logs.sh
```
The helper uses the Supabase CLI to stream local events. Pass a project ref to target a remote instance: `scripts/ops/tail-supabase-logs.sh <project-ref>`.

---

## Shopify Integration Guardrails
- Always reference the Shopify developer MCP (`shopify-dev-mcp`) for APIs, schema, and CLI workflows—no guessing or undocumented endpoints.
- React Router 7 powers our data loaders/actions; follow data-route conventions when wiring Shopify fetchers or mutations.
- Log new findings or edge cases in `docs/integrations/shopify_readiness.md` so the whole team shares the context.

### AI Integration Notes
- Retrieve the staging OpenAI API key from `vault/occ/openai/api_key_staging.env` before running AI tooling.
- Set `OPENAI_API_KEY` in your shell (`source vault/occ/openai/api_key_staging.env`) so `npm run ai:build-index` and regression scripts can talk to OpenAI.

---

## Daily Workflows

| Task | Command | Notes |
| ---- | ------- | ----- |
| Start dev server | `npm run dev` | Spins up Shopify CLI + Vite dev server |
| Run unit tests | `npm run test:unit` | Vitest test suite |
| Run Playwright smoke | `npm run test:e2e` | Browser tests with mock data (automatically logs into Admin using `PLAYWRIGHT_SHOPIFY_EMAIL/PASSWORD`) |
| Shopify Admin embed smoke | `npx playwright test tests/playwright/admin-embed.spec.ts` | Uses the Shopify CLI tunnel and staging store credentials; LOGIN must be provided via `PLAYWRIGHT_SHOPIFY_EMAIL/PASSWORD`. |
| Lint | `npm run lint` | ESLint configured with project rules |
| Type check | `npm run typecheck` | React Router typegen + `tsc --noEmit` |
| Nightly metrics rollup | `npm run ops:nightly-metrics` | Writes aggregate facts (`metrics.activation.rolling7d`, `metrics.sla_resolution.rolling7d`) |
| Backfill Chatwoot facts | `npm run ops:backfill-chatwoot` | One-time script to add breach timestamps |
| Tail Supabase logs | `scripts/ops/tail-supabase-logs.sh` | Streams local or remote Supabase logs via the CLI |

GitHub Actions mirror the critical flows (`tests.yml`, `nightly-metrics.yml`). Ensure repository secrets include the environment variables listed above before enabling schedules.

---

## Project Structure Highlights

```
app/                    # React Router 7 app code
  components/tiles/     # Dashboard tiles (Sales, Inventory, Ops Pulse, etc.)
  services/             # Shopify, Chatwoot, GA clients & metrics aggregation
  routes/               # React Router data routes and actions
packages/               # Shared integrations + memory adapters
docs/                   # Direction docs, strategy, design specs
scripts/ops/            # Operational scripts (backfill, nightly metrics)
tests/                  # Vitest + Playwright suites
```

Canonical workflow documentation lives in:
- `docs/directions/README.md` – governance
- `docs/directions/*` – role-specific expectations (engineer, product, QA, etc.)
- `docs/strategy/initial_delivery_plan.md` – roadmap
- `docs/data/nightly_metrics.md` – telemetry automation playbook

### Supabase Edge Function — Observability
We ship a lightweight edge function (`supabase/functions/occ-log`) that centralises structured logs in Supabase.

Deploy locally:

```bash
supabase functions serve occ-log --env-file .env.local
```

Deploy to a remote project:

```bash
supabase functions deploy occ-log --project-ref <your-project-ref>
supabase secrets set --project-ref <your-project-ref> SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

After deployment, call it from the app or scripts:

```bash
curl -X POST "https://<project>.functions.supabase.co/occ-log" \
  -H "Content-Type: application/json" \
  -d '{"level":"INFO","message":"playwright smoke started","metadata":{"suite":"admin"}}'
```

> Run `psql` (or Supabase SQL editor) with `supabase/sql/observability_logs.sql` once per project to create the backing table.

---

## Working With Shopify & Supabase

1. Start the Supabase containers locally (`supabase start`) and export `.env.local` so `DATABASE_URL` points at the local Postgres instance (`postgresql://postgres:postgres@127.0.0.1:54322/postgres`).
2. Run `npm run dev` to start the Shopify CLI tunnel and obtain the install URL.
3. Install the app in your development store (press `p` in the CLI prompt) and use the embedded admin experience.
4. For staging/production, mirror secrets from vault to GitHub (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) and update `shopify.app.toml`/`shopify.web.toml` according to Shopify’s deployment docs.

---

## Contribution Guidelines

1. Follow `docs/git_protocol.md` (branch naming, evidence requirements, PR checklist).
2. Keep direction docs read-only unless you are the manager; log questions in the relevant `feedback/*.md` file.
3. Always attach evidence (tests, metrics) when shipping tile or service changes.
4. Update `docs/directions/product_changelog.md` for any roadmap-impacting doc or process change.

Need help? Check the feedback logs in `feedback/` or ping the manager noted in `docs/directions/manager.md`.
