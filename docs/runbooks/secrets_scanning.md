# Secrets Scanning Automation

**Created**: 2025-10-19  
**Owner**: DevOps  
**Molecule**: D-009  
**Purpose**: Automated daily secrets scanning with Gitleaks

## Overview

Automated secrets scanning runs daily to detect exposed credentials, API keys, tokens, and other sensitive data in the repository. Uses Gitleaks with SARIF upload to GitHub Security tab.

## Workflow Configuration

**File**: `.github/workflows/gitleaks.yml`  
**Schedule**: Daily at 00:00 UTC  
**Triggers**: Push, Pull Request, Daily Cron

### Workflow Jobs

1. **gitleaks** - Scan repository for secrets
   - Checkout full history (`fetch-depth: 0`)
   - Install Gitleaks v8.18.4
   - Run scan with baseline and config
   - Upload SARIF to GitHub Security

### Configuration Files

- `.gitleaks.toml` - Gitleaks configuration (rules, allowlists)
- `security/gitleaks-baseline.json` - Known findings baseline (false positives)

## Schedule

```yaml
schedule:
  - cron: "0 0 * * *" # Daily at 00:00 UTC
```

## Manual Execution

### Via GitHub Actions UI

1. Navigate to Actions tab
2. Select "Gitleaks (Secrets Scan)" workflow
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button

### Via GitHub CLI

```bash
gh workflow run gitleaks.yml --ref main
```

### Local Execution

```bash
# Install gitleaks (if not already installed)
brew install gitleaks  # macOS
# OR download from https://github.com/gitleaks/gitleaks/releases

# Run scan
gitleaks detect \
  --source . \
  --config .gitleaks.toml \
  --baseline-path security/gitleaks-baseline.json \
  --redact \
  --report-format sarif \
  --report-path results.sarif

# View results
cat results.sarif | jq '.runs[0].results'
```

## Baseline Management

The baseline file (`security/gitleaks-baseline.json`) stores known findings that have been reviewed and determined to be false positives or acceptable risks.

### Update Baseline

```bash
# Generate new baseline (overwrites existing)
gitleaks detect \
  --source . \
  --config .gitleaks.toml \
  --redact \
  --report-format json \
  --report-path security/gitleaks-baseline.json
```

**⚠️ WARNING**: Only update baseline after careful review. Do not add real secrets to baseline.

## SARIF Upload

Results are automatically uploaded to GitHub Security tab for centralized tracking.

**Permissions Required**:

- `contents: read` - Read repository
- `actions: read` - Access workflow artifacts
- `security-events: write` - Upload SARIF
- `statuses: write` - Update commit status

## Viewing Results

### GitHub Security Tab

1. Repository → Security tab
2. Code scanning alerts
3. Filter by "Gitleaks"
4. Review findings

### CI Status

Workflow fails if new secrets are detected (not in baseline). Check:

- Pull request checks
- Actions tab → Latest run
- Workflow summary

## Remediation

If secrets are detected:

1. **Rotate immediately** - Assume compromised
2. **Remove from code** - Delete lines, commit, push
3. **Rewrite history if needed** (for recent commits):
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch <file-with-secret>' \
     --prune-empty --tag-name-filter cat -- --all
   ```
4. **Update baseline** (only after rotation and removal)
5. **Verify** - Re-run scan locally

## Configuration

### Gitleaks Config (`.gitleaks.toml`)

Key sections:

- `[allowlist]` - Paths/patterns to skip
- `[[rules]]` - Detection rules
- `[rules.allowlist]` - Rule-specific exceptions

### Common Allowlist Patterns

```toml
[allowlist]
paths = [
  ".*test.*",           # Test files
  ".*example.*",        # Example configs
  ".env.example",       # Template files
  "docs/.*",            # Documentation
]

regexes = [
  "EXAMPLE_.*",         # Example placeholders
  "YOUR_.*_HERE",       # Placeholder patterns
]
```

## Monitoring

### Daily Reports

- Workflow runs appear in Actions tab
- Email notifications (if configured)
- Slack/Discord integration (via GitHub webhooks)

### Metrics

Track:

- Scans run: Daily count
- Secrets found: New vs baseline
- False positive rate: Baseline size vs total findings
- Remediation time: Finding → rotation → removal

## Rotation Integration

Secrets scanning triggers rotation workflow:

1. Alert detected
2. DevOps reviews
3. If real secret → Rotate (see `docs/runbooks/required_env_vars.md`)
4. Remove from code
5. Update baseline
6. Close alert

## Best Practices

### DO ✅

- Run scan before committing sensitive changes
- Review baseline quarterly
- Rotate detected secrets immediately
- Keep `.gitleaks.toml` up to date
- Use `.env.example` templates (never commit `.env`)

### DON'T ❌

- Add real secrets to baseline
- Ignore scan failures
- Commit `.env` files
- Store secrets in code comments
- Disable scanning to "fix" CI

## Troubleshooting

### Workflow Fails on Every Run

**Cause**: New secret detected  
**Fix**: Review findings, rotate if real, remove from code

### Too Many False Positives

**Cause**: Overly broad rules  
**Fix**: Update `.gitleaks.toml` allowlist or rule-specific exceptions

### Baseline Not Working

**Cause**: Baseline format mismatch or path changed  
**Fix**: Regenerate baseline with same config

### SARIF Upload Fails

**Cause**: Missing permissions  
**Fix**: Verify workflow has `security-events: write` permission

## Related Documentation

- GitHub Security: https://docs.github.com/en/code-security/secret-scanning
- Gitleaks: https://github.com/gitleaks/gitleaks
- Environment vars: `docs/runbooks/required_env_vars.md`
- Security policy: `SECURITY.md`
