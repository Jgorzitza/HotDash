---
epoch: 2025.10.E1
doc: docs/integrations/chatwoot_readiness.md
owner: integrations
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---
# Chatwoot Production Readiness Tracking

## Current Status
- **Deployment state:** Fly app deployed, health checks returning 503 (per integration readiness dashboard)
- **Credential status:** Secrets mirroring blocked on DB DSN fix; API token pending
- **Priority:** Source production-ready API token and webhook secret per integrations direction
- **Next milestone:** Complete Supabase DSN alignment, generate scoped API token, coordinate with Support team

## Production Credential Requirements

| Credential | Description | Storage Target | Status | Notes |
| --- | --- | --- | --- | --- |
| `CHATWOOT_TOKEN_PROD` | Scoped API token for automation | Vault (`vault/occ/chatwoot/api_token_prod.env`) + GitHub Actions secret | ⏳ Pending | Requires super admin access to Chatwoot Fly deployment |
| `CHATWOOT_ACCOUNT_ID_PROD` | Account ID for API requests | Vault + GitHub Actions secret | ⏳ Pending | Generated with API token |
| `CHATWOOT_WEBHOOK_SECRET` | Webhook validation secret | Vault (`vault/occ/chatwoot/webhook_secret.env`) + GitHub Actions secret | ⏳ Pending | For inbound automation webhooks |
| `CHATWOOT_BASE_URL_PROD` | Production Chatwoot instance URL | Config + GitHub Actions secret | 🚧 Staging only | Currently `https://hotdash-chatwoot.fly.dev` |

## Shared Inbox Configuration Requirements

Per integrations direction: "Coordinate with Support to ensure the shared inbox + automation scopes match the plan"

| Configuration Item | Owner | Status | Evidence Required |
| --- | --- | --- | --- |
| customer.support@hotrodan.com inbox setup | Support | ⏳ Pending | IMAP/SMTP configuration screenshots |
| Automation scope definition | Support + Integrations | ⏳ Pending | API token scope permissions document |
| Inbound email flow testing | Support | ⏳ Pending | Test email receipt + response evidence |
| Webhook endpoint coordination | Data + Integrations | ⏳ Pending | Supabase webhook endpoint confirmation |

## Current Blockers (From Integration Dashboard)
1. **Supabase DSN alignment:** Web machine still pointed at Supabase pooler; need to rerun migrations after correcting Postgres secrets
2. **Health check failure:** `/hc` returning 503, preventing progression to API token generation
3. **Migration status:** Need successful `bundle exec rails db:chatwoot_prepare` completion

## Readiness Checklist

| # | Task | Owner | Due | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Fix Supabase DSN in Fly secrets | Integrations | 2025-10-11 | ⏳ In Progress | Update POSTGRES_* secrets to match `vault/occ/supabase/database_url_staging.env` |
| 2 | Complete database migrations | Integrations | 2025-10-11 | ⏳ Pending | Successful `db:chatwoot_prepare` output log |
| 3 | Verify health check endpoint | Integrations | 2025-10-11 | ⏳ Pending | `/hc` returning 200 status |
| 4 | Create super admin account | Integrations | 2025-10-11 | ⏳ Pending | Admin credentials stored in vault |
| 5 | Generate production API token | Integrations | 2025-10-11 | ⏳ Pending | Token + account ID stored in vault |
| 6 | Configure customer.support inbox | Support | 2025-10-12 | ⏳ Pending | Inbox configuration screenshots |
| 7 | Define automation scopes | Support | 2025-10-12 | ⏳ Pending | API permissions documentation |
| 8 | Test inbound email flow | Support | 2025-10-12 | ⏳ Pending | Email receipt + processing evidence |
| 9 | Configure webhook endpoint | Data | 2025-10-12 | ⏳ Pending | Supabase webhook URL confirmation |
| 10 | Mirror secrets to GitHub/Fly | Integrations | 2025-10-12 | ⏳ Pending | Secret mirroring evidence logs |

## Support Coordination Plan

### Inbox Scope Requirements
- **Email:** customer.support@hotrodan.com
- **Integration type:** IMAP/SMTP or API (to be confirmed with Support)
- **Automation scope:** Reply curation and Supabase posting (coordinate with Data team)
- **Permissions:** Read/write access for automation API token

### Action Items for Support Team
1. Review Chatwoot shared inbox configuration requirements
2. Provide IMAP/SMTP credentials OR confirm API-based integration preference
3. Define automation scope and permissions for API token generation
4. Test inbound email routing once Chatwoot health checks pass

## Integration Testing Requirements

### Pre-production Validation
- [ ] Health check returns 200 (`curl https://hotdash-chatwoot.fly.dev/hc`)
- [ ] API token authentication test
- [ ] Webhook payload validation
- [ ] Inbound email processing test
- [ ] Outbound email delivery test (if SMTP configured)

### Evidence Capture Requirements
All testing evidence should be stored in `artifacts/integrations/chatwoot-readiness-2025-10-11/`:
- Health check curl outputs with timestamps
- API token generation screenshots
- Webhook test payload examples
- Email flow test results
- Secret mirroring command outputs

## Dependencies & Risks
- **Critical dependency:** Supabase DSN fix must complete before API token generation
- **Support coordination:** Inbox configuration blocked until Support defines requirements
- **Secret rotation:** API tokens should be rotated after initial production deployment
- **SMTP dependency:** Email features limited until SMTP credentials provided

## Contact Log
| Date (UTC) | Contact | Team | Channel | Summary | Next Step |
| --- | --- | --- | --- | --- | --- |
| 2025-10-11 | TBD | Support | TBD | Initial coordination for inbox scopes | Awaiting Support team contact |

## Timeline
| Date | Milestone |
| --- | --- |
| 2025-10-11 | Fix Supabase DSN, complete migrations, generate API token |
| 2025-10-12 | Support coordination for inbox setup, webhook configuration |
| 2025-10-13 | Complete integration testing and secret mirroring |
| 2025-10-14 | Production readiness approval |