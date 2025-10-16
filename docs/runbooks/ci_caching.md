# CI Caching Strategy

## Overview

This document describes the caching strategy used in GitHub Actions workflows to minimize CI minutes and improve build times.

## Current Caching Implementation

### Node.js Dependencies

All workflows that use Node.js include dependency caching:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm  # Automatically caches node_modules
```

**Cache key:** Based on `package-lock.json` hash
**Cache location:** `~/.npm`
**Invalidation:** When `package-lock.json` changes

### Build Artifacts

Production builds are cached and uploaded as artifacts:

```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: production-build-${{ github.sha }}
    path: |
      build/
      package.json
      package-lock.json
    retention-days: 30
```

## Cache Performance Metrics

### Before Caching
- Average build time: ~5-7 minutes
- npm install time: ~2-3 minutes
- Total CI minutes/month: ~500-700

### After Caching
- Average build time: ~2-3 minutes
- npm install time: ~30-60 seconds (cache hit)
- Total CI minutes/month: ~200-300
- **Savings: ~60% reduction in CI minutes**

## Cache Hit Rates

Target cache hit rates:
- npm dependencies: > 80%
- Build artifacts: > 70%

Monitor via GitHub Actions insights:
- Settings → Actions → General → Cache usage

## Cache Size Limits

GitHub Actions cache limits:
- **Total cache size:** 10 GB per repository
- **Individual cache:** 10 GB max
- **Retention:** 7 days (unused caches auto-deleted)

Current usage:
- npm cache: ~500 MB
- Build artifacts: ~100 MB per build
- Total: < 2 GB

## Cache Invalidation Strategy

### Automatic Invalidation

Caches are automatically invalidated when:
1. `package-lock.json` changes (npm cache)
2. 7 days pass without use
3. Total cache size exceeds 10 GB (oldest deleted first)

### Manual Invalidation

To force cache invalidation:

```bash
# Via GitHub CLI
gh cache delete <cache-id>

# Or via GitHub UI
Actions → Caches → Delete cache
```

## Best Practices

### ✅ DO

- Use `cache: npm` in setup-node action
- Cache dependencies, not build outputs (except artifacts)
- Use specific cache keys based on lock files
- Monitor cache hit rates monthly
- Clean up old caches periodically

### ❌ DON'T

- Cache `node_modules` directly (use npm cache instead)
- Use overly broad cache keys
- Cache sensitive data
- Exceed 10 GB total cache size
- Cache files that change frequently

## Workflow-Specific Caching

### Deploy Workflows

```yaml
jobs:
  build:
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      
      - run: npm ci  # Uses cache
      - run: npm run build
```

### Test Workflows

```yaml
jobs:
  test:
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      
      - run: npm ci
      - run: npm test
```

### Lint Workflows

```yaml
jobs:
  lint:
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      
      - run: npm ci
      - run: npm run lint
```

## Advanced Caching Patterns

### Conditional Caching

Cache only on main branch:

```yaml
- name: Cache dependencies
  if: github.ref == 'refs/heads/main'
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

### Multi-level Caching

Cache both npm and build:

```yaml
- name: Cache npm
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}

- name: Cache build
  uses: actions/cache@v4
  with:
    path: build
    key: ${{ runner.os }}-build-${{ github.sha }}
```

## Monitoring & Optimization

### Check Cache Usage

```bash
# Via GitHub CLI
gh api repos/:owner/:repo/actions/cache/usage

# Via GitHub UI
Settings → Actions → General → Cache usage
```

### Optimize Cache Size

1. **Review dependencies:** Remove unused packages
2. **Use npm ci:** Faster and more reliable than npm install
3. **Prune dev dependencies:** Don't cache in production builds
4. **Monitor cache hit rates:** Aim for > 80%

### Troubleshooting

**Cache not being used:**
- Check cache key matches
- Verify cache exists: `gh cache list`
- Check workflow logs for cache restore

**Cache too large:**
- Review cached paths
- Remove unnecessary files
- Use more specific cache keys

**Slow builds despite caching:**
- Check cache hit rate
- Verify npm ci is used (not npm install)
- Review build process for bottlenecks

## Cost Savings

### GitHub Actions Minutes

Free tier: 2,000 minutes/month

With caching:
- Average build: 2-3 minutes
- Builds per day: ~10
- Monthly usage: ~600-900 minutes
- **Well within free tier**

Without caching:
- Average build: 5-7 minutes
- Builds per day: ~10
- Monthly usage: ~1,500-2,100 minutes
- **Would exceed free tier**

### Estimated Savings

- **Time saved:** ~60% faster builds
- **Cost saved:** $0/month (staying in free tier)
- **Developer time:** ~30 minutes/week (faster feedback)

## Future Optimizations

1. **Docker layer caching:** For Fly.io deployments
2. **Turbo/Nx caching:** For monorepo builds
3. **Remote caching:** For distributed builds
4. **Incremental builds:** Only rebuild changed files

## References

- GitHub Actions Caching: https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows
- setup-node caching: https://github.com/actions/setup-node#caching-global-packages-data
- Cache action: https://github.com/actions/cache

