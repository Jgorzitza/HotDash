# HotDash — Operator Control Center

HotDash delivers an operator-first control center for Shopify stores. Tiles surface real-time context across sales, fulfillment, inventory, CX escalations, and SEO anomalies, pairing every insight with an approval-ready workflow and audit trail.

This repo contains the full web application, service layer integrations, agent direction docs, and tooling required to run telemetry jobs and nightly metrics rollups.

## Core Capabilities (October 2025)

- **Always-On Idea Pool** — Supabase-backed `product_suggestions` pipeline keeps five live ideas (one Wildcard) ready for acceptance, rejection, or expiry. Approvals spawn Shopify draft creation jobs automatically.
- **Approvals Everywhere** — Drawer UI, Supabase schema, and API routes enforce HITL for CX replies, inventory actions, growth moves, and product ideas.
- **Operations Spine** — Inventory ROP calculators, analytics anomaly detection, GA4 dashboards, Publer scheduling, Chatwoot CX integrations, and Prometheus metrics.
- **Agent Enablement** — Manager task plans, direction docs, and MCP tooling (GitHub, Context7, Supabase, Shopify, Fly, GA) keep sub-agents coordinated; evidence-first workflows drive commit requirements.

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

2. Copy `.env.local.example` to `.env.local` and fill in the placeholders (Shopify keys, ngrok URL, optional OpenAI key). Add integration credentials so external services stay healthy:
   - **Chatwoot:** `CHATWOOT_BASE_URL` (Fly-hosted URL) and either `CHATWOOT_TOKEN` or `CHATWOOT_TOKEN_FILE` for authenticated API checks. Optional overrides: `CHATWOOT_HEALTH_PATH`, `CHATWOOT_HEALTH_TIMEOUT_MS`.
   - **Publer:** `PUBLER_API_KEY` + `PUBLER_WORKSPACE_ID` for live posting, plus environment-specific keys (`PUBLER_STAGING_API_KEY`, `PUBLER_PRODUCTION_API_KEY`) if you rely on the shell health scripts.
   - **Idea Pool:** `IDEMPOTENCY_SALT` and related orchestrator keys as outlined in `integrations/new_feature_*/manager_agent_pack_v1/09-configuration/.env.example`.

   Keep this file out of git — `.env*` is already ignored.

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

### 4. Verify Integrations

- **Dashboard sanity:** Load the admin app and confirm tiles render in mock mode before switching to live data.
- **Chatwoot health check (CI mirrors this):**

  ```bash
  CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev npm run ops:check-chatwoot-health
  ./scripts/ops/check-chatwoot-health.sh staging   # writes artifacts/ops/chatwoot-health-*.json
  ```

  Capture the JSON artifacts in `artifacts/ops/` for launch verification.

- **Publer API check (verifies `/account_info` + `/social_accounts`):**

  ```bash
  PUBLER_STAGING_API_KEY=... ./scripts/ops/check-publer-health.sh staging
  PUBLER_PRODUCTION_API_KEY=... ./scripts/ops/check-publer-health.sh production
  ```

  A successful run logs `✅ Publer health check passed` and persists results to `artifacts/ops/publer-health-*.json`.

- Add real Shopify, Chatwoot, GA, and Publer credentials only after the above checks pass.

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

## Social Posting Guardrails (Publer)

- All social publishing routes proxy through the Publer REST API; no direct client calls with secrets.
- Queue drafts behind the approvals drawer (`requireApproval: true`) before hitting Publer’s `/posts` or `/posts/schedule` endpoints.
- Coordinate tokens and workspace IDs via GitHub environment secrets—never hard-code or store them in the repo.
- HotDash currently exercises Publer’s `/account_info`, `/social_accounts`, `/posts`, and `/posts/schedule` endpoints from `packages/integrations/publer.ts`; verify both read and write flows with `scripts/ops/check-publer-health.sh` before enabling live posting.
- See `docs/integrations/social_adapter.md` for the current workflow and Publer API references.

## Chatwoot Health Monitoring

- Run `npm run ops:check-chatwoot-health` (`scripts/ops/check-chatwoot-health.mjs`) locally or in CI to assert the base URL, `/rails/health`, and authenticated profile endpoints stay responsive.
- The shell helper `scripts/ops/check-chatwoot-health.sh` records end-to-end health metrics (HTTP status, response times) to `artifacts/ops/chatwoot-health-*.json`; archive the latest artifact in launch evidence.
- If either check fails, treat it as a release blocker—Chatwoot must be reachable before approving customer replies or social posts tied to CX events.

## AI Agent Support: MCP Tools

HotDash provides **4 MCP servers** to help AI agents work effectively:

| Tool                 | Purpose                              | Status                |
| -------------------- | ------------------------------------ | --------------------- |
| **github-official**  | GitHub repo management               | ✅ Active             |
| **context7**         | HotDash codebase + library search    | ✅ Active (port 3001) |
| **fly**              | Deployment & infrastructure          | ✅ Active (port 8080) |
| **shopify**          | Shopify API docs, GraphQL validation | ✅ Active             |
| **llamaindex-rag**   | Knowledge base RAG queries           | 🚧 In development     |

### Tools NOT Using MCP

- **Supabase**: Use `supabase` CLI directly (migrations, queries, edge functions)
- **Google Analytics**: Use built-in API connectors in `app/services/analytics/`

### 📚 MCP Documentation (Protected)

**Complete documentation in `mcp/` directory:**

- **[mcp/README.md](mcp/README.md)** - Overview and quick start
- **[mcp/ALL_SYSTEMS_GO.md](mcp/ALL_SYSTEMS_GO.md)** - Ready-to-use examples
- **[mcp/QUICK_REFERENCE.md](mcp/QUICK_REFERENCE.md)** - When to use each tool
- **[mcp/USAGE_EXAMPLES.md](mcp/USAGE_EXAMPLES.md)** - Real-world patterns
- **[mcp/SERVER_STATUS.md](mcp/SERVER_STATUS.md)** - Current server status

**⚠️ CRITICAL: The `mcp/` directory is protected infrastructure.**

- All `mcp/**/*.md` files are in the CI allow-list
- DO NOT remove or modify without explicit approval
- See `docs/RULES.md` for governance details

**Quick Test:**

```bash
./mcp/test-mcp-tools.sh  # Verify all 6 servers are operational
```

### Quick Start by Tool

<details>
<summary><b>🖱️ Cursor IDE</b> (Click to expand)</summary>

**Prerequisites:**

- MCP configuration: `~/.cursor/mcp.json` (already configured)

**Startup Steps:**

1. **Start Context7** (required):

   ```bash
   cd ~/HotDash/hot-dash
   ./scripts/ops/start-context7.sh
   ```

2. **Verify Context7 is running**:

   ```bash
   docker ps | grep context7-mcp
   ```

3. **Open HotDash in Cursor**:

   ```bash
   cursor ~/HotDash/hot-dash
   ```

4. **Check MCP Status**:
   - Settings → MCP
   - Verify all 5 servers show green indicators

5. **Start coding!** All MCP tools are now available.

</details>

<details>
<summary><b>⌨️ Codex CLI</b> (Click to expand)</summary>

**Prerequisites:**

- MCP configuration: `~/.codex/config.toml` (already configured)

**Startup Steps:**

1. **Start Context7** (required):

   ```bash
   cd ~/HotDash/hot-dash
   ./scripts/ops/start-context7.sh
   ```

2. **Verify Context7 is running**:

   ```bash
   docker ps | grep context7-mcp
   ```

3. **Start Codex in HotDash directory**:

   ```bash
   cd ~/HotDash/hot-dash
   codex
   ```

4. **Verify MCP tools loaded**:

   ```
   codex> /tools
   ```

   Should show shopify, context7, github-official, supabase, fly

5. **Start coding!** All MCP tools are now available.

</details>

<details>
<summary><b>🤖 Claude CLI</b> (Click to expand)</summary>

**Prerequisites:**

- MCP configuration: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- Or: `~/.config/Claude/claude_desktop_config.json` (Linux)

**Setup (one-time):**

```bash
# Copy MCP config to Claude
mkdir -p ~/Library/Application\ Support/Claude  # macOS
# OR
mkdir -p ~/.config/Claude  # Linux

# Convert from JSON to Claude format (already done if using Claude Desktop)
# See docs/directions/mcp-tools-reference.md for config format
```

**Startup Steps:**

1. **Start Context7** (required):

   ```bash
   cd ~/HotDash/hot-dash
   ./scripts/ops/start-context7.sh
   ```

2. **Start Claude CLI**:

   ```bash
   claude
   ```

3. **Verify MCP tools**:

   ```
   > What MCP tools do you have access to?
   ```

4. **Start coding!** All MCP tools are now available.

</details>

<details>
<summary><b>🚀 Warp Terminal</b> (Click to expand)</summary>

**Prerequisites:**

- Warp AI Drive integration
- MCP support (check Warp version supports MCP)

**Setup (one-time):**

- Configure MCP in Warp settings
- Import from `~/.cursor/mcp.json` or `~/.codex/config.toml`

**Startup Steps:**

1. **Start Context7** (required):

   ```bash
   cd ~/HotDash/hot-dash
   ./scripts/ops/start-context7.sh
   ```

2. **Open Warp** in HotDash directory:

   ```bash
   cd ~/HotDash/hot-dash
   # Use Warp AI (Ctrl+`)
   ```

3. **Verify MCP tools available** in Warp AI panel

4. **Start coding!** All MCP tools are now available.

</details>

### What's Available

**MCP Tools Provide:**

- 🏪 **Shopify**: API docs, GraphQL validation
- 🔍 **Context7**: HotDash code search + React Router/Prisma/etc. docs
- 🐙 **GitHub**: PR/issue management, code search
- ✈️ **Fly.io**: Deployments, logs, secrets
- 🧠 **LlamaIndex RAG**: Knowledge base queries, support insights

**Non-MCP Tools (Use Directly)**:
- 🗄️ **Supabase CLI**: Migrations, queries, edge functions
- 📊 **GA4 API**: Built-in connectors in `app/services/analytics/`

**Example Agent Queries:**

```
"Show me the Sales Pulse tile implementation"  (context7)
"Validate this Shopify GraphQL query"          (shopify)
"Create a PR for this feature"                 (github-official)
"Deploy hot-dash to production"                (fly)
"Query support knowledge base"                 (llamaindex-rag, coming soon)

# Use CLI/API directly (NOT MCP):
"Run migration: supabase migration up"         (Supabase CLI)
"Get GA4 metrics: app/services/analytics/"     (Built-in API)
```

### What Context7 Indexes

**Included:**

- Source code (`app/`, `packages/`, `scripts/`)
- Documentation (`docs/`)
- Configuration (root configs, `prisma/`, `supabase/`)
- Tests (`tests/`)

**Excluded** (via `.context7ignore`):

- Dependencies, build artifacts, test outputs
- Environment files and secrets
- Binary assets

### Documentation

- **Training Data Check**: `docs/directions/training-data-reliability-check.md` 🚨 **READ FIRST**
- **MCP Tools Overview**: `docs/directions/mcp-tools-reference.md` (comprehensive guide)
- **Efficiency Guide**: `docs/directions/mcp-usage-efficiency.md` ⭐ (avoid context overload)
- **Context7 Usage**: `docs/context7-mcp-guide.md` (detailed Context7 guide)
- **Quick Reference**: `docs/context7-quick-reference.md` (common queries)
- **Setup Summary**: `docs/directions/context7-mcp-setup.md` (setup details)

### ⚠️ Critical for AI Agents

**Your training data is outdated for:**

- React Router 7 (you have v6/Remix patterns)
- Shopify APIs (you have 2023 or older)

**Always verify with MCP tools before implementing RR7 or Shopify code.**  
See `docs/directions/training-data-reliability-check.md` for decision matrix.

### Troubleshooting

**"Context7 not available":**

```bash
# Check if running
docker ps | grep context7-mcp

# If not, start it
./scripts/ops/start-context7.sh

# Reload your AI tool
```

**"Which tool do I have?":**

- Check config file for your tool (see above)
- All configs point to same MCP servers
- Just ensure Context7 is running first!

### AI Integration Notes

- Retrieve the staging OpenAI API key from `vault/occ/openai/api_key_staging.env` before running AI tooling.
- Set `OPENAI_API_KEY` in your shell (`source vault/occ/openai/api_key_staging.env`) so `npm run ai:build-index` and regression scripts can talk to OpenAI.

---

## Daily Workflows

| Task                      | Command                                                    | Notes                                                                                                                      |
| ------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Start dev server          | `npm run dev`                                              | Spins up Shopify CLI + Vite dev server                                                                                     |
| Run unit tests            | `npm run test:unit`                                        | Vitest test suite                                                                                                          |
| Run Playwright smoke      | `npm run test:e2e`                                         | Browser tests with mock data (automatically logs into Admin using `PLAYWRIGHT_SHOPIFY_EMAIL/PASSWORD`)                     |
| Shopify Admin embed smoke | `npx playwright test tests/playwright/admin-embed.spec.ts` | Uses the Shopify CLI tunnel and staging store credentials; LOGIN must be provided via `PLAYWRIGHT_SHOPIFY_EMAIL/PASSWORD`. |
| Lint                      | `npm run lint`                                             | ESLint configured with project rules                                                                                       |
| Type check                | `npm run typecheck`                                        | React Router typegen + `tsc --noEmit`                                                                                      |
| Nightly metrics rollup    | `npm run ops:nightly-metrics`                              | Writes aggregate facts (`metrics.activation.rolling7d`, `metrics.sla_resolution.rolling7d`)                                |
| Backfill Chatwoot facts   | `npm run ops:backfill-chatwoot`                            | One-time script to add breach timestamps                                                                                   |
| Tail Supabase logs        | `scripts/ops/tail-supabase-logs.sh`                        | Streams local or remote Supabase logs via the CLI                                                                          |

GitHub Actions mirror the critical flows (`tests.yml`, `nightly-metrics.yml`). Ensure repository secrets include the environment variables listed above before enabling schedules.

---

## Project Structure Highlights

```
app/                    # React Router 7 app code
  components/tiles/     # Dashboard tiles (Sales, Inventory, Ops Pulse, etc.)
  services/             # Shopify, Chatwoot, GA clients & metrics aggregation
  routes/               # React Router data routes and actions
apps/                   # Microservices (agent-service, llamaindex-mcp-server)
packages/               # Shared integrations + memory adapters
docs/                   # Direction docs, strategy, design specs (537+ files)
scripts/                # Automation scripts (AI, ops, deploy, qa, security)
tests/                  # Vitest + Playwright suites
archive/                # Historical status reports and deprecated docs
artifacts/              # Build artifacts and evidence logs
supabase/               # Database migrations, edge functions, SQL
integrations/new_feature_*/manager_agent_pack_v1/  # Manager agent pack (idea pool, product creation artifacts)
```

See `REPO_STATUS.md` for detailed repository organization and branch strategy.

Canonical workflow documentation lives in:

- `docs/README.md` – documentation map + manager updates
- `docs/NORTH_STAR.md` – vision, outcomes, success metrics
- `docs/roadmap.md` – milestone plan & cross-agent dependencies
- `docs/manager/PROJECT_PLAN.md` – daily execution sequencing
- `docs/directions/*.md` – role-specific expectations (engineer, product, QA, etc.)

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
5. **Repository Cleanup**: Historical status reports are in `archive/` - don't create new status files in root directory.

Need help? Check the feedback logs in `feedback/` or ping the manager noted in `docs/directions/manager.md`.

---

## Repository Status

For current repository health, branch inventory, and recent changes, see `REPO_STATUS.md`.

**Last Cleanup**: 2025-10-12 (50+ files archived, 20 branches deleted)  
**Branch Count**: 38 active branches (down from 58)  
**Documentation**: 635+ markdown files across docs/, feedback/, and archive/
