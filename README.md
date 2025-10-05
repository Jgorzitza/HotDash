# HotDash — Operator Control Center

HotDash delivers an operator-first control center for Shopify stores. Tiles surface real-time context across sales, fulfillment, inventory, CX escalations, and SEO anomalies, pairing every insight with an approval-ready workflow and audit trail.

This repo contains the full web application, service layer integrations, agent direction docs, and tooling required to run telemetry jobs and nightly metrics rollups.

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 20.10
- **npm** (ships with Node) or pnpm/yarn if you prefer
- **Shopify CLI** (`npm install -g @shopify/cli@latest`)
- **Shopify Partner account** + development store
- **Supabase project** (for decision/fact persistence)

### 1. Clone & Install
```bash
git clone https://github.com/Jgorzitza/HotDash.git
cd HotDash
npm install
```

### 2. Configure Environment
Create a `.env` file (or export the values) with the following variables:

```dotenv
# Shopify app configuration
SHOPIFY_API_KEY=your_app_key
SHOPIFY_API_SECRET=your_app_secret
SHOPIFY_APP_URL=https://your-ngrok-or-hosted-url
SCOPES=write_products,read_orders

# Supabase memory / decisions
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Optional: override default SQLITE dev db
DATABASE_URL=file:dev.sqlite
```

> ℹ️  CI uses `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `DATABASE_URL`. Mirror these values in GitHub Actions secrets so workflows succeed.

### 3. Initialize the Project
```bash
npm run setup   # prisma generate + migrate deploy
npm run dev     # starts Shopify dev tunnel + Remix/React Router app
```
Press `p` in the CLI output to open the embedded admin URL and complete app installation in your development store.

### 4. Verification
Once the dashboard loads, ensure tiles render in mock mode. Add real credentials (Shopify, Chatwoot, GA) to move to live data.

---

## Daily Workflows

| Task | Command | Notes |
| ---- | ------- | ----- |
| Start dev server | `npm run dev` | Spins up Shopify CLI + Vite dev server |
| Run unit tests | `npm run test:unit` | Vitest test suite |
| Run Playwright smoke | `npm run test:e2e` | Browser tests with mock data |
| Lint | `npm run lint` | ESLint configured with project rules |
| Type check | `npm run typecheck` | React Router typegen + `tsc --noEmit` |
| Nightly metrics rollup | `npm run ops:nightly-metrics` | Writes aggregate facts (`metrics.activation.rolling7d`, `metrics.sla_resolution.rolling7d`) |
| Backfill Chatwoot facts | `npm run ops:backfill-chatwoot` | One-time script to add breach timestamps |

GitHub Actions mirror the critical flows (`tests.yml`, `nightly-metrics.yml`). Ensure repository secrets include the environment variables listed above before enabling schedules.

---

## Project Structure Highlights

```
app/                    # Remix/React Router app code
  components/tiles/     # Dashboard tiles (Sales, Inventory, Ops Pulse, etc.)
  services/             # Shopify, Chatwoot, GA clients & metrics aggregation
  routes/               # Remix route loaders/actions
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

---

## Working With Shopify & Supabase

1. Run `npm run dev` to start the Shopify CLI tunnel and obtain the install URL.
2. Install the app in your development store.
3. Populate `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` so decision logs and telemetry facts persist beyond SQLite.
4. To switch to production, set `NODE_ENV=production`, configure a persistent database (e.g., Postgres), and update `shopify.app.toml`/`shopify.web.toml` as outlined in Shopify’s deployment docs.

---

## Contribution Guidelines

1. Follow `docs/git_protocol.md` (branch naming, evidence requirements, PR checklist).
2. Keep direction docs read-only unless you are the manager; log questions in the relevant `feedback/*.md` file.
3. Always attach evidence (tests, metrics) when shipping tile or service changes.
4. Update `docs/directions/product_changelog.md` for any roadmap-impacting doc or process change.

Need help? Check the feedback logs in `feedback/` or ping the manager noted in `docs/directions/manager.md`.
