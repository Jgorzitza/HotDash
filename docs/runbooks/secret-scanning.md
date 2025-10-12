---
epoch: 2025.10.E1
doc: docs/runbooks/secret-scanning.md
owner: compliance
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-11-11
---
# Secret Scanning Runbook

## Overview
Automated secret scanning prevents credentials from being committed to the repository. This runbook covers local pre-commit hooks and CI/CD integration.

## Local Secret Scanning

### Pre-Commit Hook
**Location:** `.git/hooks/pre-commit`
**Tool:** Gitleaks
**Installed:** 2025-10-11 by Compliance Agent

**Behavior:**
- Scans all staged files for secrets before commit
- Redacts secret values in output
- Blocks commit if secrets detected
- Provides remediation instructions

**Bypass (NOT RECOMMENDED):**
```bash
git commit --no-verify
```

**Installation:**
```bash
# Hook is already installed in .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Installing Gitleaks

**macOS:**
```bash
brew install gitleaks
```

**Linux:**
```bash
# Download latest release
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_<VERSION>_linux_x64.tar.gz
tar -xzf gitleaks_<VERSION>_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**Windows:**
```bash
# Use Scoop
scoop install gitleaks
```

## CI/CD Secret Scanning

### GitHub Actions Workflows

**Active Scanners:**
1. **Gitleaks** - `.github/workflows/secret_scan.yml`
   - Runs on: All PRs, pushes to main
   - Configuration: `.github/gitleaks.toml`
   - Redacts secrets in output

2. **Semgrep** - `.github/workflows/security.yml`
   - Runs on: PRs, pushes, daily schedule (03:17 UTC)
   - Includes security audit rules
   - Generates SARIF reports

3. **CodeQL** - `.github/workflows/security.yml`
   - Runs on: PRs, pushes, daily schedule
   - JavaScript/TypeScript analysis
   - Detects security vulnerabilities

**Verification:**
```bash
# Check workflow status
gh run list --workflow=secret_scan.yml --limit 5
gh run list --workflow=security.yml --limit 5
```

## Secret Detection Patterns

**Detected Patterns:**
- API keys (sk-, pk-, etc.)
- AWS credentials
- Database connection strings
- JWT tokens
- Private keys
- OAuth tokens
- Passwords in URLs

**Configuration:** `.github/gitleaks.toml`

## Remediation Process

### If Secret Detected in Commit

1. **DO NOT commit the secret**
2. Remove secret from staged changes
3. Add `[REDACTED-<TYPE>]` placeholder
4. Store actual secret in `vault/` with 600 permissions
5. Update `docs/ops/credential_index.md`
6. Verify vault permissions: `find vault/ -type f ! -perm 600`

### If Secret Already Committed

1. **IMMEDIATE:** Revoke the exposed credential
2. **URGENT:** Rotate credential via service provider
3. Contact compliance team: Document in `feedback/compliance.md`
4. Consider git history rewrite if recent (manager approval required)
5. Update all services using the credential
6. Document incident in compliance log

### If Secret in Git History

**⚠️ CRITICAL: Do not attempt git history rewrite without manager approval**

1. Revoke and rotate the credential IMMEDIATELY
2. Document exposure in `docs/compliance/evidence/secret_incidents_<date>.md`
3. Escalate to manager + security team
4. Follow incident response procedures: `docs/runbooks/incident_response_breach.md`

## Testing Secret Scanning

### Test Pre-Commit Hook

```bash
# Create test file with fake secret
echo "aws_access_key_id=AKIAIOSFODNN7EXAMPLE" > test_secret.txt
git add test_secret.txt

# Attempt commit (should fail)
git commit -m "test: secret detection"

# Clean up
git reset HEAD test_secret.txt
rm test_secret.txt
```

**Expected:** Commit blocked with secret detected message

### Test CI Scanning

```bash
# Trigger secret scan workflow
gh workflow run secret_scan.yml

# Check results
gh run list --workflow=secret_scan.yml --limit 1
```

## Monitoring & Alerts

**GitHub Security Alerts:**
- Navigate to: Repository → Security → Code scanning alerts
- Review Semgrep and CodeQL findings
- Address P0/P1 findings immediately

**Email Notifications:**
- Configured for: Repository collaborators
- Triggers: Secret detected, security vulnerability
- Action: Review and remediate within 24 hours

## Exclusions & False Positives

**Allowlist:** `.github/gitleaks.toml`

**Adding Exclusions:**
```toml
[[rules]]
description = "Exclude specific file patterns"
regex = '''pattern-to-exclude'''
path = '''specific/path/to/exclude'''
```

**Common False Positives:**
- Example credentials in docs (should be marked `[EXAMPLE]`)
- Test fixtures (should use fake data)
- Public API keys (verify they're actually public)

## Compliance Requirements

**Frequency:**
- Pre-commit: Every commit (local)
- CI/CD: Every PR + push to main
- Full audit: Weekly (manual review of alerts)

**Evidence:**
- Pre-commit hook: `.git/hooks/pre-commit`
- CI workflow logs: GitHub Actions artifacts
- Compliance reports: `feedback/compliance.md`

**Audit Trail:**
- All secret detections logged
- Remediation actions documented
- Rotation confirmations archived

## Escalation

**Local Detection:**
- Developer remediates immediately
- No escalation needed if secret not committed

**CI Detection:**
- Block PR merge
- Developer remediates in next commit
- Compliance review if pattern indicates systematic issue

**History Detection:**
- Immediate escalation to compliance + security
- Follow incident response procedures
- Manager approval for any git rewrites

## Resources

- Gitleaks documentation: https://github.com/gitleaks/gitleaks
- GitHub secret scanning: https://docs.github.com/en/code-security/secret-scanning
- Credential index: `docs/ops/credential_index.md`
- Incident response: `docs/runbooks/incident_response_breach.md`

## Maintenance

**Monthly Review:**
- Verify CI workflows active
- Check for workflow failures
- Review exclusion list
- Update detection patterns

**Quarterly Audit:**
- Test pre-commit hook
- Verify all developers have gitleaks installed
- Review false positive rate
- Update runbook

---

**Last Updated:** 2025-10-11 by Compliance Agent
**Next Review:** 2025-11-11

