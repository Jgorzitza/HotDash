# Ads Module Deployment Runbook

> **Owner:** ads agent  
> **Date:** 2025-10-16  
> **Version:** 1.0

## Pre-Deployment Checklist

- [ ] All unit tests passing (`npm test`)
- [ ] Integration tests passing
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations applied (if any)
- [ ] API adapters configured for production

## Environment Variables

Required for production:

```bash
# Ad Platform API Keys (stored in GitHub Secrets)
META_ADS_API_KEY=xxx
META_ADS_API_SECRET=xxx
GOOGLE_ADS_API_KEY=xxx
GOOGLE_ADS_CLIENT_ID=xxx
TIKTOK_ADS_API_KEY=xxx

# Environment
NODE_ENV=production

# Cache TTL (optional, defaults to 5 minutes)
ADS_CACHE_TTL_MS=300000
```

## Deployment Steps

### 1. Build

```bash
npm run build
```

### 2. Run Tests

```bash
npm test
npm run test:integration
```

### 3. Deploy to Staging

```bash
fly deploy --config fly.staging.toml
```

### 4. Smoke Test Staging

```bash
curl https://staging.hotdash.app/api/ads/performance
curl https://staging.hotdash.app/api/ads/slo
```

### 5. Deploy to Production

```bash
fly deploy --config fly.toml
```

### 6. Verify Production

```bash
curl https://hotdash.app/api/ads/performance
curl https://hotdash.app/api/ads/slo
```

## Rollback Procedure

If issues detected:

```bash
# Rollback to previous version
fly releases
fly releases rollback <version>
```

## Monitoring

### SLO Dashboard

Check `/api/ads/slo` for:
- API Availability (target: 99.9%)
- Latency P95 (target: <500ms)
- Error Rate (target: <0.1%)
- Cache Hit Rate (target: >80%)

### Alerts

Set up alerts for:
- SLO violations
- Error rate > 1%
- Latency P95 > 1000ms
- Cache hit rate < 60%

## Troubleshooting

### High Latency

1. Check cache hit rate
2. Review slow queries
3. Increase cache TTL
4. Scale up instances

### API Errors

1. Check adapter configurations
2. Verify API keys are valid
3. Review rate limits
4. Check external API status

### Low Cache Hit Rate

1. Verify cache is enabled
2. Check cache TTL settings
3. Review cache key generation
4. Monitor cache size

## Post-Deployment

- [ ] Monitor SLO dashboard for 1 hour
- [ ] Check error logs
- [ ] Verify all API endpoints responding
- [ ] Test dashboard UI
- [ ] Notify team of successful deployment

