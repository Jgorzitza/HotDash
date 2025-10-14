# Security Scripts

Automated security tools for compliance and secret management.

## Secret Scanner

**Purpose**: Detect potential secrets in codebase before they reach git/production.

### Usage

**Manual scan**:
```bash
./scripts/security/scan-secrets.sh
```

**CI/CD**: Automatically runs on every commit via `.github/workflows/secret-scan.yml`

### Features

- ✅ Pattern-based secret detection (API keys, tokens, passwords)
- ✅ Whitelist support for false positives
- ✅ GitHub Actions integration
- ✅ PR comments on violations
- ✅ Zero-config operation

### Patterns Detected

- `api_key`, `api-key`, `apiKey`
- `api_secret`, `api-secret`
- `service_account`
- `private_key`, `private-key`
- `password`
- `token`
- `sk_live`, `sk_test` (Stripe)
- `ghp_`, `gho_`, `github_pat_` (GitHub)
- `glpat-` (GitLab)
- `AKIA` (AWS)
- `-----BEGIN.*PRIVATE KEY-----`
- Bearer tokens

### Whitelist False Positives

Add entries to `scripts/security/secret-whitelist.txt`:

```bash
# Example
api_key:  # Code references to api_key variable
process.env.API_KEY  # Environment variable references
test-api-key  # Test/mock secrets
```

### Exit Codes

- `0`: No secrets detected (pass)
- `1`: Secrets detected (fail)

### CI/CD Integration

The GitHub Action:
1. Runs on every push/PR
2. Fails the build if secrets are detected
3. Comments on PRs with violation details
4. Uploads scan results as artifacts

**Workflow**: `.github/workflows/secret-scan.yml`

### Excluded Directories

- `node_modules/`
- `.git/`
- `dist/`, `build/`
- `.next/`, `.turbo/`, `.vercel/`
- `coverage/`

---

## Secret Rotation (Coming Soon)

Automated credential rotation system with 90-day schedule, expiry alerts, and audit trail.

## Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use .env.example** - Document required env vars
3. **Whitelist carefully** - Only add confirmed false positives
4. **Review regularly** - Update patterns as new secret types emerge
5. **Rotate on exposure** - Immediately rotate any exposed credentials

---

**Maintained by**: Compliance Agent  
**Last Updated**: 2025-10-14

