# Vault Preparation Plan - 2025-10-11 Security Response

## Overview

This document outlines the immediate steps needed to prepare our vault infrastructure for the secure credential migration following SEC-2025-10-11-01.

## Directory Structure

```
vault/
  ├── occ/                   # Operator Control Center
  │   ├── supabase/         # Supabase credentials
  │   ├── shopify/          # Shopify API credentials
  │   ├── chatwoot/         # Chatwoot integration credentials
  │   ├── twilio/           # Twilio SMS credentials
  │   └── zoho/            # Zoho email credentials
  └── docs/
      └── credential_index.md  # Master list of vault paths
```

## 1. Vault Service Setup (0800-0830Z)

- [ ] Verify AWS Secrets Manager access
- [ ] Configure Fly.io secret store
- [ ] Set up local development vault
- [ ] Test vault helper scripts
- [ ] Verify access logging

## 2. Vault Path Creation (0830-0900Z)

- [ ] Create vault directory structure
- [ ] Set up access policies
- [ ] Configure rotation schedules
- [ ] Document vault paths
- [ ] Test vault operations

## 3. Migration Templates (0900-0930Z)

### Supabase Credentials

```env
SUPABASE_URL={{vault:occ/supabase/url}}
SUPABASE_ANON_KEY={{vault:occ/supabase/anon_key}}
SUPABASE_SERVICE_ROLE_KEY={{vault:occ/supabase/service_role_key}}
POSTGRES_PASSWORD={{vault:occ/supabase/postgres_password}}
```

### Shopify Credentials

```env
SHOPIFY_ADMIN_TOKEN={{vault:occ/shopify/admin_token}}
SHOPIFY_APP_API_KEY={{vault:occ/shopify/app_api_key}}
SHOPIFY_APP_SECRET={{vault:occ/shopify/app_secret}}
```

### Chatwoot Credentials

```env
CHATWOOT_TOKEN={{vault:occ/chatwoot/api_token}}
CHATWOOT_INBOX_TOKEN={{vault:occ/chatwoot/inbox_token}}
```

### Twilio Credentials

```env
TWILIO_ACCOUNT_SID={{vault:occ/twilio/account_sid}}
TWILIO_AUTH_TOKEN={{vault:occ/twilio/auth_token}}
```

### Zoho Credentials

```env
ZOHO_CLIENT_ID={{vault:occ/zoho/client_id}}
ZOHO_CLIENT_SECRET={{vault:occ/zoho/client_secret}}
ZOHO_REFRESH_TOKEN={{vault:occ/zoho/refresh_token}}
```

## 4. Local Development (0930-1000Z)

- [ ] Update .env.example with vault patterns
- [ ] Create vault helper for local dev
- [ ] Document local vault setup
- [ ] Add vault loading to tests
- [ ] Update CI configuration

## 5. Service Updates (1000-1030Z)

- [ ] Update Fly.io deployments
- [ ] Configure GitHub Action secrets
- [ ] Update Docker Compose files
- [ ] Modify Supabase edge functions
- [ ] Test service configurations

## Files to Update

1. `.env.example`
2. `docker-compose.yml`
3. `fly.toml`
4. `.github/workflows/*.yml`
5. `supabase/functions/*`
6. `scripts/deploy/*.sh`
7. `tests/setup/*.ts`

## Required Scripts

1. `scripts/vault/load_secrets.sh`
2. `scripts/vault/rotate_secrets.sh`
3. `scripts/vault/check_access.sh`
4. `scripts/vault/sync_services.sh`

## Evidence Collection

Store all vault setup evidence in:

```
artifacts/security/vault_setup_20251011/
  ├── access_logs/
  ├── rotation_logs/
  ├── service_configs/
  └── verification/
```

## Sign-off Requirements

- [ ] Reliability Lead: Vault configuration
- [ ] Security Lead: Access policies
- [ ] DevOps: Service integration
- [ ] Data: Database credentials
- [ ] QA: Validation tests

## Rollback Plan

1. Maintain current credentials during migration
2. Keep .env.backup for each service
3. Document restoration procedures
4. Test rollback process
5. Monitor service health

## Next Steps

1. Execute this plan 0800-1030Z
2. Coordinate with teams for rotation
3. Update documentation
4. Train developers on vault usage
5. Schedule regular rotation
