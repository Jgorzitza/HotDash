# Required Environment Variables

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Comprehensive inventory of environment variables, rotation schedules, and audit results

## Audit Summary (2025-10-19)

**Total variables defined**: 31 (.env.example) + 3 (additional in .env)  
**Variables set**: 30 / 34 (88%)  
**Missing critical**: 4 (SUPABASE_ACCESS_TOKEN, GITHUB_MCP_TOKEN, DISABLE_WELCOME_MODAL, OPENAI_API_KEY not in example)  
**Status**: ⚠️ MCP credentials missing, Playwright config incomplete

---

## Environment Variables Inventory

### 🔴 P0 - Critical (BLOCKS AGENTS)

| Variable                | Status     | Purpose                    | Location       | Notes                                            |
| ----------------------- | ---------- | -------------------------- | -------------- | ------------------------------------------------ |
| `SUPABASE_ACCESS_TOKEN` | ❌ MISSING | MCP Supabase credentials   | GitHub Secrets | **BLOCKS 8 AGENTS** - Needs service_role key     |
| `GITHUB_MCP_TOKEN`      | ❌ MISSING | MCP GitHub credentials     | GitHub Secrets | **BLOCKS 6 AGENTS** - Needs PAT with repo access |
| `SHOPIFY_API_KEY`       | ✅ SET     | Shopify app authentication | .env           | Required for admin reads                         |
| `SHOPIFY_API_SECRET`    | ✅ SET     | Shopify app authentication | .env           | Required for admin mutations                     |
| `DATABASE_URL`          | ✅ SET     | Postgres connection string | .env           | Supabase database                                |
| `SUPABASE_URL`          | ✅ SET     | Supabase project URL       | .env           | API endpoint                                     |
| `SUPABASE_SERVICE_KEY`  | ✅ SET     | Supabase service role key  | .env           | Admin access to database                         |

### 🟡 P1 - High Priority (REQUIRED FOR FEATURES)

| Variable                | Status     | Purpose                      | Location              | Notes                            |
| ----------------------- | ---------- | ---------------------------- | --------------------- | -------------------------------- |
| `OPENAI_API_KEY`        | ✅ SET     | AI agent SDK & MCP tools     | .env                  | Not in .env.example (should add) |
| `CHATWOOT_BASE_URL`     | ✅ SET     | Customer support integration | .env                  | Self-hosted Chatwoot instance    |
| `CHATWOOT_ACCESS_TOKEN` | ✅ SET     | Chatwoot API authentication  | .env                  | Uses ACCESS_TOKEN (not TOKEN)    |
| `GA_MCP_HOST`           | ✅ SET     | Google Analytics MCP server  | .env                  | Default: http://127.0.0.1:8780   |
| `GA_MCP_PROJECT_ID`     | ✅ SET     | Google Analytics project     | .env                  | For analytics MCP calls          |
| `GA_MCP_PROPERTY_ID`    | ✅ SET     | Google Analytics property    | .env                  | For analytics MCP calls          |
| `DISABLE_WELCOME_MODAL` | ❌ MISSING | Playwright test config       | GitHub Secrets + .env | **BLOCKS E2E TESTS**             |

### 🟢 P2 - Medium Priority (OPTIONAL FEATURES)

| Variable                 | Status     | Purpose                     | Location | Notes                      |
| ------------------------ | ---------- | --------------------------- | -------- | -------------------------- |
| `CHATWOOT_ACCOUNT_ID`    | ❌ MISSING | Chatwoot account identifier | .env     | Optional if single account |
| `CHATWOOT_SLA_MINUTES`   | ❌ MISSING | SLA tracking                | .env     | Default: 30 minutes        |
| `CHATWOOT_EMBED_TOKEN`   | ❌ MISSING | Widget embed token          | .env     | For storefront widget      |
| `TWILIO_ACCOUNT_SID`     | ✅ SET     | SMS via Chatwoot            | .env     | Twilio account             |
| `TWILIO_AUTH_TOKEN`      | ✅ SET     | Twilio authentication       | .env     | Sensitive                  |
| `TWILIO_NUMBER`          | ✅ SET     | SMS sender number           | .env     | Twilio phone number        |
| `META_APP_ID`            | ✅ SET     | Facebook/Instagram API      | .env     | Meta app credentials       |
| `META_APP_SECRET`        | ✅ SET     | Facebook/Instagram API      | .env     | Sensitive                  |
| `META_PAGE_ID`           | ✅ SET     | Facebook page identifier    | .env     | For social posting         |
| `IG_BUSINESS_ACCOUNT_ID` | ✅ SET     | Instagram business account  | .env     | For IG analytics           |
| `TIKTOK_CLIENT_KEY`      | ✅ SET     | TikTok API credentials      | .env     | For TikTok integration     |
| `TIKTOK_CLIENT_SECRET`   | ✅ SET     | TikTok API credentials      | .env     | Sensitive                  |
| `ZOHO_ACCESS_TOKEN`      | ✅ SET     | Zoho Mail API               | .env     | Email integration          |
| `ZOHO_REFRESH_TOKEN`     | ✅ SET     | Zoho token refresh          | .env     | Sensitive                  |
| `ZOHO_CLIENT_ID`         | ✅ SET     | Zoho app credentials        | .env     | OAuth client               |
| `ZOHO_CLIENT_SECRET`     | ✅ SET     | Zoho app credentials        | .env     | Sensitive                  |
| `ZOHO_MAIL_API_BASE`     | ✅ SET     | Zoho API endpoint           | .env     | API base URL               |
| `ZOHO_TOKEN_TYPE`        | ✅ SET     | Zoho token type             | .env     | Usually "Bearer"           |

### 🔵 P3 - Low Priority (DEVELOPMENT/TESTING)

| Variable                 | Status     | Purpose                | Location | Notes                                                            |
| ------------------------ | ---------- | ---------------------- | -------- | ---------------------------------------------------------------- |
| `SHOPIFY_APP_URL`        | ✅ SET     | App callback URL       | .env     | Default: http://localhost:3000                                   |
| `SCOPES`                 | ✅ SET     | Shopify API scopes     | .env     | Minimum: read_orders,read_products,read_inventory,read_locations |
| `STAGING_SMOKE_TEST_URL` | ❌ MISSING | Smoke test target      | .env     | Default: http://localhost:3000/app?mock=1                        |
| `LIGHTHOUSE_TARGET`      | ❌ MISSING | Performance testing    | .env     | Inherits from STAGING_SMOKE_TEST_URL                             |
| `AGENT_SERVICE_PORT`     | ✅ SET     | Agent SDK service port | .env     | Not in .env.example                                              |
| `LLAMAINDEX_MCP_PORT`    | ✅ SET     | LlamaIndex MCP port    | .env     | Not in .env.example                                              |

---

## Critical Missing Variables

### 1. SUPABASE_ACCESS_TOKEN

**Status**: ❌ MISSING  
**Priority**: P0 - CRITICAL  
**Impact**: Blocks 8 agents (ai-knowledge, data, product, ai-customer, analytics, inventory, integrations, manager)  
**Required Action**: CEO must provision service_role key from Supabase dashboard  
**Location**: Store in GitHub Secrets (repository settings)  
**Rotation**: Every 90 days or on team member departure

### 2. GITHUB_MCP_TOKEN

**Status**: ❌ MISSING  
**Priority**: P0 - CRITICAL  
**Impact**: Blocks 6 agents (ai-knowledge, designer, product, engineer, qa, manager)  
**Required Action**: CEO must generate GitHub PAT (Personal Access Token)  
**Permissions**: Repository: Read (code, issues, PRs), Write (issues, PRs)  
**Location**: Store in GitHub Secrets  
**Rotation**: Every 90 days (max expiration)

### 3. DISABLE_WELCOME_MODAL

**Status**: ❌ MISSING  
**Priority**: P1 - HIGH  
**Impact**: Playwright tests cannot run (welcome modal interferes)  
**Required Action**: Add to .env and GitHub Secrets  
**Value**: `true`  
**Location**: Local .env + GitHub Actions secrets

### 4. OPENAI_API_KEY (Not in .env.example)

**Status**: ✅ SET (but not documented)  
**Priority**: P1 - HIGH  
**Impact**: AI agent SDK and MCP tools require this  
**Required Action**: Add to .env.example for documentation  
**Location**: .env (currently set)  
**Rotation**: Every 90 days, monitor usage quotas

---

## Rotation Schedule

### Immediate Rotation Required

**When to rotate**:

- Team member with access departs
- Suspected credential compromise
- Service indicates unusual activity
- 90 days elapsed (maximum)

| Credential            | Rotation Frequency | Last Rotated    | Next Due | Responsibility |
| --------------------- | ------------------ | --------------- | -------- | -------------- |
| SUPABASE_ACCESS_TOKEN | 90 days            | N/A (never set) | TBD      | CEO → DevOps   |
| GITHUB_MCP_TOKEN      | 90 days            | N/A (never set) | TBD      | CEO → DevOps   |
| OPENAI_API_KEY        | 90 days            | Unknown         | TBD      | CEO → DevOps   |
| SHOPIFY_API_SECRET    | 180 days           | Unknown         | TBD      | CEO → DevOps   |
| SUPABASE_SERVICE_KEY  | 180 days           | Unknown         | TBD      | CEO → DevOps   |
| TWILIO_AUTH_TOKEN     | 180 days           | Unknown         | TBD      | CEO → DevOps   |
| META_APP_SECRET       | 180 days           | Unknown         | TBD      | CEO → Support  |
| TIKTOK_CLIENT_SECRET  | 180 days           | Unknown         | TBD      | CEO → Support  |
| ZOHO_CLIENT_SECRET    | 180 days           | Unknown         | TBD      | CEO → Support  |
| CHATWOOT_ACCESS_TOKEN | 180 days           | Unknown         | TBD      | CEO → Support  |

### Rotation Procedure

1. Generate new credential in source system
2. Test in staging environment first
3. Update GitHub Secrets (for CI/CD)
4. Update .env file (for local dev)
5. Verify all services still work
6. Invalidate old credential
7. Document rotation in this file (update Last Rotated column)
8. Set calendar reminder for next rotation

---

## Security Best Practices

### DO ✅

- Store sensitive values in GitHub Secrets
- Use .env.example as template (without actual values)
- Add .env to .gitignore
- Rotate credentials every 90-180 days
- Use service accounts where possible
- Monitor API usage for anomalies
- Document rotation dates

### DON'T ❌

- Commit .env files to git
- Share credentials via Slack/email
- Use production credentials in development
- Store credentials in code
- Reuse credentials across environments
- Skip rotation schedule

---

## GitHub Secrets Setup

### Required for CI/CD

```bash
# MCP Credentials (P0 - CRITICAL)
SUPABASE_ACCESS_TOKEN=<service_role_key_from_supabase_dashboard>
GITHUB_MCP_TOKEN=<github_pat_with_repo_access>

# Playwright Environment
DISABLE_WELCOME_MODAL=true

# Optional (if running Playwright in CI)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test123
```

### How to Add

1. Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: Variable name (e.g., `SUPABASE_ACCESS_TOKEN`)
4. Secret: Actual value (will be masked)
5. Click "Add secret"

---

## Verification

### Local Development

```bash
# Check which variables are set
cat .env | grep -E "^[A-Z_]+=" | cut -d'=' -f1 | sort

# Verify critical variables have values
grep -E "^(SHOPIFY_API_KEY|DATABASE_URL|OPENAI_API_KEY)=" .env
```

### GitHub Actions

```yaml
# In workflow file, verify secret is available
- name: Verify secrets
  run: |
    if [ -z "${{ secrets.SUPABASE_ACCESS_TOKEN }}" ]; then
      echo "❌ SUPABASE_ACCESS_TOKEN not set"
      exit 1
    fi
    echo "✅ SUPABASE_ACCESS_TOKEN is set"
```

---

## Maintenance Log

| Date       | Action        | Credential            | Performed By | Notes                                       |
| ---------- | ------------- | --------------------- | ------------ | ------------------------------------------- |
| 2025-10-19 | Initial audit | All                   | DevOps       | Molecule D-008 - Baseline inventory created |
| TBD        | Provision     | SUPABASE_ACCESS_TOKEN | CEO          | Blocker for 8 agents                        |
| TBD        | Provision     | GITHUB_MCP_TOKEN      | CEO          | Blocker for 6 agents                        |
| TBD        | Add           | DISABLE_WELCOME_MODAL | DevOps       | Blocker for Playwright tests                |

---

## Related Documentation

- `.env.example` - Template with all variables
- `.env` - Local environment (gitignored)
- GitHub Secrets - Production credentials
- MCP setup: `docs/runbooks/mcp_setup.md`
- Security policy: `SECURITY.md`
