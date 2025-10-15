---
epoch: 2025.10.E1
doc: docs/deployment/production_environment_setup.md
owner: deployment
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-16
---
# Production Environment Setup Playbook

This playbook codifies the exact steps for bringing the GitHub `production` environment online with the required secrets, vault references, and approval guardrails. Use it alongside `docs/deployment/env_matrix.md` and `docs/deployment/production_go_live_checklist.md`.

## 1. Reliability — Provision Secrets

1. **Create/Verify Vault Entries**
   - Populate secrets in vault paths listed below, using environment-specific values:
     - `occ/shopify/api_key_prod`
     - `occ/shopify/api_secret_prod`
     - `occ/shopify/cli_auth_token_prod`
     - `occ/supabase/url_prod`
     - `occ/supabase/service_key_prod`
     - `occ/chatwoot/base_url_prod`
     - `occ/chatwoot/token_prod`
     - `occ/chatwoot/account_id_prod`
     - `occ/anthropic/api_key_prod`
     - `occ/ga_mcp/host_prod`
     - `occ/ga/property_id_prod`
   - Record the vault references in `feedback/reliability.md` once populated.

2. **Set GitHub Environment Secrets**
   - For each vault entry, mirror the value into the GitHub `production` environment secret with matching names:
     - `SHOPIFY_API_KEY_PROD`
     - `SHOPIFY_API_SECRET_PROD`
     - `SHOPIFY_CLI_AUTH_TOKEN_PROD`
     - `SUPABASE_URL_PROD`
     - `SUPABASE_SERVICE_KEY_PROD`
     - `CHATWOOT_BASE_URL_PROD`
     - `CHATWOOT_TOKEN_PROD`
     - `CHATWOOT_ACCOUNT_ID_PROD`
     - `ANTHROPIC_API_KEY_PROD`
     - `GA_MCP_HOST_PROD`
     - `GA_PROPERTY_ID_PROD`
     - `PRODUCTION_APP_URL`
     - `PRODUCTION_SMOKE_TEST_URL`
   - Recommended CLI workflow (requires GitHub admin token with `repo` + `admin:org` scope):

     ```bash
     gh secret set SHOPIFY_API_KEY_PROD \
       --body "$(vault read -field=value occ/shopify/api_key_prod)" \
       --env production
     ```

   - Repeat for each secret. Verify with `gh secret list --env production` (values should appear as `Repository` scope, type `env`).

3. **Document Completion**
   - Update `docs/deployment/env_matrix.md` Status column to `Provisioned` for each secret.
   - Add a reliability log entry noting the vault paths, date, and operator who performed the provisioning.

## 2. Deployment — Generate Shopify CLI Token

> Run once service-account credentials arrive from reliability.

1. Authenticate as the Shopify service user: `shopify login --store <production-store-domain>`.
2. Generate the CLI token:

   ```bash
   SHOP_DOMAIN="<production-store-domain>"
   shopify app login --store "$SHOP_DOMAIN" --client-id "$SHOPIFY_API_KEY_PROD"
   shopify app tunnel auth token write --store "$SHOP_DOMAIN"
   ```

3. Capture the token output and write it to vault `occ/shopify/cli_auth_token_prod` with 90-day rotation reminder.
4. Set the GitHub secret `SHOPIFY_CLI_AUTH_TOKEN_PROD` via `gh secret set` as described above.
5. Record the rotation date and vault reference in `feedback/deployment.md`.

## 3. Repo Admins — Enforce Environment Reviewers

1. Navigate to **Settings → Environments → production** in GitHub.
2. Under **Required reviewers**, add:
   - `@HotDash/manager`
   - `@HotDash/reliability`
3. Save changes; GitHub will now require an approval from both groups before the production workflow dispatch can run.
4. Optional CLI alternative:

   ```bash
   gh api \
     --method PUT \
     -H "Accept: application/vnd.github+json" \
     "/repos/{owner}/{repo}/environments/production" \
     -f reviewers='[{"type":"Team","id":<manager_team_id>},{"type":"Team","id":<reliability_team_id>}]'
   ```

## 4. Verification Checklist

- [ ] Run `scripts/deploy/check-production-env.sh` (or pass custom environment) to ensure all required secrets exist.
- [ ] `gh secret list --env production` shows all required secrets.
- [ ] Vault references documented in `feedback/reliability.md`.
- [ ] `docs/deployment/env_matrix.md` reflects `Provisioned` status for production secrets.
- [ ] GitHub environment lists manager + reliability teams as required reviewers.
- [ ] Dry-run dispatch of `.github/workflows/deploy-production.yml` succeeds through the approval gate using staging values (Lighthouse + smoke steps should stub out until production secrets validated).

## 5. Escalation Path

- If any secret cannot be provisioned by the target date, notify deployment via `feedback/deployment.md` and open a blocking item in the manager's daily status log.
- For GitHub permission issues, escalate to repo admins (cc manager) with the failing API call/output.
- For Shopify CLI token issues, confirm service account access in the Shopify Partner Dashboard and regenerate credentials if the token fails the first deploy attempt.
