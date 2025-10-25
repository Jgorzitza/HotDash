# Store Switch Implementation Checklist

## Overview
This runbook documents the process for switching from development store (`hotroddash.myshopify.com`) to production store (`fm8vte-ex.myshopify.com`) and ensuring all environment variables are properly parameterized.

## Pre-Switch Validation

### 1. Environment Variables Check
- [ ] `SHOPIFY_SHOP_DOMAIN` is set to target store domain
- [ ] `SHOPIFY_APP_URL` points to production app URL
- [ ] `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` are for target store
- [ ] All OAuth redirects use environment variables (no hardcoded URLs)

### 2. Code Validation
- [ ] No hardcoded `*.myshopify.com` domains in codebase
- [ ] All Shopify API calls use `getCurrentShopDomain()` from config
- [ ] OAuth redirects use `getShopifyAuthRedirectUrls()` from config
- [ ] All telemetry IDs are environment-based

### 3. Configuration Files
- [ ] `app/config/shopify.server.ts` contains parameterized configuration
- [ ] Environment validation functions are implemented
- [ ] Production config validation passes

## Switch Execution

### 1. Update Environment Variables
```bash
# Production environment
SHOPIFY_SHOP_DOMAIN=fm8vte-ex.myshopify.com
SHOPIFY_APP_URL=https://hotdash-staging.fly.dev
SHOPIFY_API_KEY=<production_api_key>
SHOPIFY_API_SECRET=<production_api_secret>
```

### 2. Validate Configuration
```bash
# Run configuration validation
npm run validate:shopify-config
```

### 3. Deploy Changes
```bash
# Deploy to staging first
fly deploy --app hotdash-staging

# Verify staging deployment
curl https://hotdash-staging.fly.dev/health
```

### 4. Production Deployment
```bash
# Deploy to production
fly deploy --app hotdash-production

# Verify production deployment
curl https://hotdash-production.fly.dev/health
```

## Post-Switch Verification

### 1. OAuth Flow Test
- [ ] App installation works with new store
- [ ] OAuth redirects function correctly
- [ ] API calls use correct store domain

### 2. API Integration Test
- [ ] Shopify Admin API calls work
- [ ] Webhook endpoints receive data
- [ ] All tiles load with production data

### 3. Telemetry Verification
- [ ] GA4 events include correct `hd_action_key`
- [ ] Analytics data flows to correct property
- [ ] All tracking IDs are environment-based

## Rollback Procedure

### 1. Immediate Rollback
```bash
# Revert environment variables
SHOPIFY_SHOP_DOMAIN=hotroddash.myshopify.com
SHOPIFY_APP_URL=http://localhost:3000

# Redeploy
fly deploy --app hotdash-staging
```

### 2. Code Rollback
```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main
```

## Environment Variable Reference

### Required Variables
- `SHOPIFY_SHOP_DOMAIN`: Target Shopify store domain
- `SHOPIFY_APP_URL`: Application URL for OAuth redirects
- `SHOPIFY_API_KEY`: Shopify app API key
- `SHOPIFY_API_SECRET`: Shopify app API secret
- `SCOPES`: Required API scopes (comma-separated)

### Optional Variables
- `SHOP_CUSTOM_DOMAIN`: Custom domain override
- `NODE_ENV`: Environment mode (development/production)

## Troubleshooting

### Common Issues
1. **OAuth redirect mismatch**: Verify `SHOPIFY_APP_URL` matches app settings
2. **API key mismatch**: Ensure keys match target store
3. **Domain validation errors**: Check `SHOPIFY_SHOP_DOMAIN` format
4. **Scope errors**: Verify all required scopes are included

### Debug Commands
```bash
# Validate configuration
npm run validate:shopify-config

# Check environment variables
npm run env:check

# Test OAuth flow
npm run test:oauth
```

## Success Criteria
- [ ] All hardcoded domains removed
- [ ] Environment variables properly configured
- [ ] OAuth flow works with target store
- [ ] All API integrations functional
- [ ] Telemetry data flows correctly
- [ ] Rollback procedure tested and documented
