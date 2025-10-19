# Security Hardening Checklist

**Created**: 2025-10-19  
**Owner**: DevOps  
**Molecule**: D-017  
**Purpose**: GitHub security features and repository hardening

## GitHub Security Features

### Secret Scanning

**Status**: ✅ Enabled  
**Configuration**: Repository → Settings → Security → Secret scanning

**Features**:

- Push protection enabled
- Secret scanning alerts enabled
- Validity checks for supported secrets

**Verification**:

```bash
# Check if secrets detected
gh api repos/Jgorzitza/HotDash/secret-scanning/alerts
```

### Code Scanning

**Status**: ✅ Enabled (Gitleaks)  
**Configuration**: `.github/workflows/gitleaks.yml`

**Features**:

- Daily automated scans (00:00 UTC)
- SARIF upload to Security tab
- Baseline for false positives

**Verification**:

```bash
# Check code scanning alerts
gh api repos/Jgorzitza/HotDash/code-scanning/alerts
```

### Dependabot

**Status**: ⚠️ Recommended  
**Configuration**: Repository → Settings → Security → Dependabot

**Enable**:

1. Dependabot alerts: ✅ ON
2. Dependabot security updates: ✅ ON
3. Dependabot version updates: Optional

**Configuration File** (`.github/dependabot.yml`):

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

### Branch Protection Rules

**Target Branch**: `main`

**Required Settings**:

- [x] Require pull request reviews before merging
  - Required approvals: 1
  - Dismiss stale reviews: Yes
- [x] Require status checks to pass
  - Required checks:
    - CI / build-test
    - Docs Policy
    - Gitleaks
    - Danger
    - Validate AI Agent Config
- [x] Require conversation resolution before merging
- [x] Require linear history: No (allows merge commits)
- [x] Do not allow bypassing settings
- [x] Restrict who can push to matching branches
- [x] Lock branch (prevent deletion): Yes
- [x] Do not allow force pushes: Yes

**Setup**:

```bash
# Via GitHub CLI (if available)
gh api repos/Jgorzitza/HotDash/branches/main/protection \
  --method PUT \
  --field required_pull_request_reviews='{"required_approving_review_count":1}'
```

## Repository Access Audit

### Current Access

**Check collaborators**:

```bash
gh api repos/Jgorzitza/HotDash/collaborators --jq '.[] | {login, permissions}'
```

**Recommended**:

- Owner: CEO only
- Admin: DevOps, Manager (if needed)
- Write: Engineers (via teams, not direct)
- Read: External contractors (time-limited)

### Team Configuration

**Recommended Teams** (GitHub Organizations):

- `@HotDash/core-team` - Write access
- `@HotDash/devops` - Admin access
- `@HotDash/contractors` - Read access (time-limited)

## Security Policies

### SECURITY.md

**Status**: ✅ Exists  
**Location**: `SECURITY.md` (root)

**Contains**:

- Supported versions
- Reporting vulnerabilities
- Security update process

### CODEOWNERS

**Status**: ✅ Exists  
**Location**: `CODEOWNERS` (root)

**Configuration**:

```
# Default owners
* @Jgorzitza

# Docs require approval
/docs/ @Jgorzitza
/docs/NORTH_STAR.md @Jgorzitza
/docs/RULES.md @Jgorzitza

# Security-sensitive files
/.github/workflows/ @Jgorzitza
/security/ @Jgorzitza
```

## Secrets Management

### GitHub Secrets Audit

**Required Secrets** (see `required_env_vars.md`):

- Production credentials
- API keys
- MCP tokens
- Deploy tokens

**Best Practices**:

- ✅ All secrets in GitHub Secrets (not code)
- ✅ Environment-specific secrets
- ✅ Rotation schedule documented
- ✅ Least privilege access

**Verification**:

```bash
# List secrets (names only, not values)
gh secret list
```

### Rotation Schedule

**90-day rotation** (API keys):

- SUPABASE_ACCESS_TOKEN
- GITHUB_MCP_TOKEN
- OPENAI_API_KEY

**180-day rotation** (OAuth secrets):

- SHOPIFY_API_SECRET
- TWILIO_AUTH_TOKEN
- META_APP_SECRET

**See**: `docs/runbooks/required_env_vars.md`

## Vulnerability Scanning

### npm audit

**Frequency**: Every PR + weekly  
**Command**: `npm audit`

**Auto-fix**:

```bash
# Fix non-breaking vulnerabilities
npm audit fix

# Fix including breaking changes (review first)
npm audit fix --force
```

**CI Integration**:

```yaml
# In .github/workflows/ci.yml
- name: Security audit
  run: npm audit --audit-level=high
```

### Gitleaks

**Status**: ✅ Configured  
**Frequency**: Daily + every push/PR  
**Configuration**: `.gitleaks.toml`

**Manual scan**:

```bash
gitleaks detect --source . --config .gitleaks.toml --redact
```

## Network Security

### HTTPS Enforcement

**Fly.io**: Automatic HTTPS redirect  
**Custom domain**: TLS certificates auto-managed

**Verification**:

```bash
curl -I http://app.hotrodan.com
# Should return 301/308 redirect to https://
```

### Security Headers

**Recommended Headers** (via middleware):

```typescript
// app/middleware/security-headers.ts
export function securityHeaders() {
  return {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };
}
```

## Compliance Checklist

### GDPR/Privacy

- [ ] Privacy policy documented
- [ ] Data retention policy defined
- [ ] User data deletion capability
- [ ] Consent mechanisms in place
- [ ] Data processing agreements with vendors

### Security Standards

- [ ] Secrets not in code ✅
- [ ] All communications encrypted (HTTPS)
- [ ] Authentication required for sensitive operations
- [ ] Authorization checks on all API endpoints
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention (React auto-escaping)
- [ ] CSRF protection (tokens)

## Incident Response

### Security Incident Process

1. **Detect**: Gitleaks alert, security report, or suspicious activity
2. **Contain**: Rotate compromised credentials immediately
3. **Investigate**: Determine scope and impact
4. **Remediate**: Fix vulnerability, deploy patch
5. **Document**: Create incident report
6. **Learn**: Update security policies and training

### Emergency Contacts

**Security Issues**:

- GitHub Security: security@github.com
- Supabase Security: security@supabase.io
- Fly.io Security: security@fly.io

**Internal**:

- DevOps: See escalation runbook
- CEO: See escalation runbook

## Hardening Checklist Summary

### Repository

- [x] Secret scanning enabled
- [x] Push protection enabled
- [x] Code scanning (Gitleaks) configured
- [x] Branch protection on main
- [ ] Dependabot alerts enabled (recommended)
- [ ] Dependabot security updates enabled (recommended)
- [x] SECURITY.md present
- [x] CODEOWNERS configured

### Secrets

- [x] All secrets in GitHub Secrets
- [x] Rotation schedule documented
- [ ] SUPABASE_ACCESS_TOKEN provisioned (pending CEO)
- [ ] GITHUB_MCP_TOKEN provisioned (pending CEO)
- [x] No secrets in code (verified by Gitleaks)

### Access Control

- [ ] Collaborator audit completed (needs review)
- [ ] Branch protection rules active (needs setup)
- [x] PR review required (via process)
- [x] Status checks required (CI workflows)

### Monitoring

- [x] Daily Gitleaks scans
- [x] Drift sweep automation
- [x] CI failure tracking
- [ ] Vulnerability scanning in CI (recommended: add npm audit)

## Related Documentation

- Secrets Scanning: `docs/runbooks/secrets_scanning.md`
- Environment Variables: `docs/runbooks/required_env_vars.md`
- CI/CD Pipeline: `docs/runbooks/cicd_pipeline.md`
