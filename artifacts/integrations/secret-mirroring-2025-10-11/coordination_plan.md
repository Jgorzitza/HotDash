# Secret Mirroring Coordination Plan - 2025-10-11
**Date:** 2025-10-11 01:25 UTC
**Owner:** Integrations Agent
**Status:** Coordinating with Deployment

## Current Secret Mirroring Status
Based on integration readiness dashboard and credential index analysis:

### Completed Mirroring
- ✅ **Supabase staging**: Service key mirrored to GitHub staging (2025-10-10 19:26Z)
- ✅ **Shopify staging**: Vault + GitHub secrets confirmed (2025-10-10 07:18Z)

### Pending Mirroring
- ⏳ **GA MCP credentials**: Blocked on OCC-INF-221 (escalated to CIO)
- ⏳ **Chatwoot production API token**: Pending token generation
- ⏳ **Fly secrets alignment**: Chatwoot Fly secrets need Supabase DSN update

## Required Secrets for Deployment Readiness

### GA MCP Integration
| Secret | Vault Path | GitHub Target | Status | Blocker |
| --- | --- | --- | --- | --- |
| `GA_MCP_HOST` | `vault/occ/ga_mcp/host.env` | `GA_MCP_HOST` (staging/prod) | ❌ Pending | OCC-INF-221 credential delivery |
| `GA_MCP_CREDENTIALS` | `vault/occ/ga_mcp/credentials.env` | `GA_MCP_CREDENTIALS` (staging/prod) | ❌ Pending | OCC-INF-221 credential delivery |
| `GA_PROPERTY_ID` | `vault/occ/ga_mcp/property_id.env` | `GA_PROPERTY_ID` (staging/prod) | ❌ Pending | OCC-INF-221 credential delivery |

### Chatwoot Integration
| Secret | Vault Path | GitHub Target | Status | Blocker |
| --- | --- | --- | --- | --- |
| `CHATWOOT_TOKEN_PROD` | `vault/occ/chatwoot/api_token_prod.env` | `CHATWOOT_TOKEN_PROD` | ❌ Pending | API token generation blocked on health checks |
| `CHATWOOT_ACCOUNT_ID_PROD` | `vault/occ/chatwoot/account_id_prod.env` | `CHATWOOT_ACCOUNT_ID_PROD` | ❌ Pending | Generated with API token |
| `CHATWOOT_WEBHOOK_SECRET` | `vault/occ/chatwoot/webhook_secret.env` | `CHATWOOT_WEBHOOK_SECRET` | ❌ Pending | Webhook configuration needed |

### Shopify Integration
| Secret | Vault Path | GitHub Target | Status | Notes |
| --- | --- | --- | --- | --- |
| `SHOPIFY_*_STAGING` | `vault/occ/shopify/*.env` | Multiple staging secrets | ✅ Complete | Confirmed 2025-10-10 07:18Z |
| `SHOPIFY_*_PROD` | `vault/occ/shopify/*_prod.env` | Multiple production secrets | ⏳ Pending | Awaiting go-live approval |

## Deployment Coordination Actions

### Immediate Actions (Today)
1. **Verify current GitHub secret status** - Check what's actually mirrored
2. **Coordinate Fly secret alignment** - Ensure Chatwoot Fly secrets match Supabase DSN
3. **Document missing secret blockers** - Clear list for deployment team
4. **Prepare mirroring scripts** - Ready for GA MCP credentials when delivered

### Pending Infrastructure Dependencies
1. **GA MCP credentials** - Waiting on OCC-INF-221 resolution (CIO escalated)
2. **Chatwoot health checks** - Need successful migrations before API token generation
3. **Production approval gates** - Shopify prod secrets pending go-live approval

## Coordination Messages for Deployment Team

### Priority 1: Fly Secret Alignment (Chatwoot)
```
Subject: Chatwoot Fly secrets need Supabase DSN alignment

The Chatwoot Fly app health checks are failing (503) because POSTGRES_* secrets 
don't match the current Supabase DSN. Based on the runbook, we need to:

1. Source vault/occ/supabase/database_url_staging.env
2. Update Fly secrets to match the DSN components
3. Rerun bundle exec rails db:chatwoot_prepare

Current status: Web machine still pointed at Supabase pooler per readiness dashboard
```

### Priority 2: GA MCP Secret Preparation
```
Subject: GA MCP secret mirroring preparation

OCC-INF-221 has been escalated to CIO queue (4 days overdue). When credentials 
are delivered, we'll need immediate mirroring to:

- GA_MCP_HOST → GitHub staging/prod environments  
- GA_MCP_CREDENTIALS → GitHub staging/prod environments
- GA_PROPERTY_ID → GitHub staging/prod environments

Suggest preparing mirroring scripts similar to sync-supabase-secret.sh
```

### Priority 3: Production Secret Strategy
```
Subject: Production secret mirroring timeline

Current production secrets pending:
- SHOPIFY_*_PROD (awaiting go-live approval)
- CHATWOOT_*_PROD (awaiting API token generation)

Need confirmation on:
1. Production mirroring approval process
2. Go-live gate requirements
3. Secret rotation schedule post-deployment
```

## Testing Requirements

### Pre-mirroring Validation
- [ ] Verify vault files exist and contain valid secrets
- [ ] Test sync-supabase-secret.sh pattern for new integrations
- [ ] Confirm GitHub CLI authentication and permissions

### Post-mirroring Validation  
- [ ] Verify GitHub secrets are set with correct values
- [ ] Test application startup with mirrored secrets
- [ ] Confirm secret masking in logs and outputs

## Evidence Tracking
All secret mirroring actions will be logged with:
- Command executed with timestamps
- Output logs (with secrets masked)
- GitHub secret list confirmations
- Application validation results

**Artifact Path:** `artifacts/integrations/secret-mirroring-2025-10-11/`