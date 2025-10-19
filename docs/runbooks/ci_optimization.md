# CI Optimization Guide

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Strategies to reduce CI execution time and costs

## Current CI Performance

**Baseline** (as of 2025-10-19):

- Build time: ~8 seconds
- Test time: ~5-10 minutes (varies by changed files)
- Total CI time: ~10-15 minutes
- Workflow runs: ~50-100 per day

**Targets**:

- Build time: <5 minutes
- Test time: <5 minutes
- Total CI time: <10 minutes
- Cost: Minimize GitHub Actions minutes

## Optimization Strategies

### 1. Dependency Caching (Implemented)

**Current**:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm # Requires package-lock.json
```

**Impact**: ~2-3 minutes saved per run  
**Status**: ⚠️ Blocked by package-lock.json not in git

### 2. Targeted Testing (Implemented)

**Current**:

```bash
# Compute test globs based on changed files
node scripts/ci/compute-test-globs.mjs

# Run only affected tests
npx vitest run $(tr '\n' ' ' < test-globs.txt)
```

**Impact**: 50-80% time reduction on small PRs  
**Status**: ✅ Working

### 3. Parallel Test Execution (Proposed)

**Strategy**: Split tests across multiple jobs

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - name: Run tests
    run: npx vitest run --shard=${{ matrix.shard }}/4
```

**Impact**: 4x faster test execution (parallelized)  
**Tradeoff**: Uses 4x GitHub Actions minutes  
**Recommendation**: Implement for main branch only

### 4. Build Artifact Caching

**Strategy**: Cache build output between jobs

```yaml
- name: Build
  run: npm run build

- name: Cache build
  uses: actions/cache@v3
  with:
    path: build/
    key: build-${{ github.sha }}

# Later jobs use cached build
- name: Restore build
  uses: actions/cache@v3
  with:
    path: build/
    key: build-${{ github.sha }}
```

**Impact**: Skip rebuild in deploy jobs  
**Savings**: ~3-5 minutes per deploy

### 5. Conditional Job Execution

**Strategy**: Skip jobs when not needed

```yaml
- name: Run E2E tests
  if: contains(github.event.head_commit.message, '[e2e]')
  run: npm run test:e2e

- name: Deploy preview
  if: github.event_name == 'pull_request'
  run: npm run deploy:preview
```

**Impact**: Reduce unnecessary job runs  
**Savings**: Varies by PR type

### 6. Workflow Concurrency Control

**Strategy**: Cancel outdated workflow runs

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Impact**: Cancel old runs when new commits pushed  
**Savings**: ~30-50% on active development branches

## Quick Wins

### Immediate (< 1 hour)

1. **Add workflow concurrency** (saves ~30% minutes)
2. **Enable npm caching** (requires fixing .gitignore)
3. **Skip npm audit on PR** (run on schedule instead)

### Short Term (< 1 week)

4. **Implement parallel testing** (4x faster tests)
5. **Cache build artifacts** (skip rebuilds)
6. **Add test result caching** (skip unchanged tests)

### Medium Term (< 1 month)

7. **Set up remote cache** (Turborepo, Nx)
8. **Implement incremental builds**
9. **Optimize Docker layers** (if using containers)

## Measuring Impact

### Before Optimization

```bash
# Get baseline
gh run list --workflow=ci --limit 20 --json conclusion,duration \
  --jq '.[] | select(.conclusion=="success") | .duration' | \
  awk '{sum+=$1; count++} END {print "Average: " sum/count " seconds"}'
```

### After Optimization

```bash
# Compare after changes
# Run same command, compare averages
```

### Cost Analysis

```bash
# GitHub Actions usage
gh api /repos/Jgorzitza/HotDash/actions/billing/usage

# Minutes per month
# Estimated cost (GitHub Free: 2000 min/month)
```

## Best Practices

### DO ✅

- Cache dependencies (npm, pip, etc.)
- Run only necessary jobs
- Use concurrency limits
- Fail fast (critical checks first)
- Optimize Docker builds (if used)
- Use targeted testing

### DON'T ❌

- Run full test suite on every commit
- Build twice (cache artifacts instead)
- Run slow E2E tests on every PR
- Install dependencies multiple times
- Use outdated actions (check for updates)

## Monitoring CI Performance

### Weekly Review

```bash
# Average CI time (last 7 days)
gh run list --workflow=ci --created=$(date -d '7 days ago' +%Y-%m-%d) \
  --json conclusion,duration | \
  jq '[.[] | select(.conclusion=="success")] |
      length as $count |
      (map(.duration) | add / $count) as $avg |
      {total_runs: $count, average_duration_sec: $avg}'
```

### Cost Tracking

```bash
# Minutes used this month
gh api /repos/Jgorzitza/HotDash/actions/billing/usage --jq '.total_minutes_used'
```

## Related Documentation

- CI/CD Pipeline: `docs/runbooks/cicd_pipeline.md`
- Policy Scripts: `docs/runbooks/policy_scripts.md`
