# Production Security Audit Checklist

**Version**: 1.0
**Owner**: Manager + DevOps
**Last Updated**: 2025-10-19

## Pre-Production Security Review

### Code Security

- [ ] Gitleaks scan: 0 secrets detected (`npm run scan`)
- [ ] No hardcoded credentials in codebase
- [ ] No API keys in client bundle
- [ ] No sensitive data in logs
- [ ] No debug endpoints in production build

### GitHub Security

- [ ] Push protection: ENABLED
- [ ] Secret scanning: ENABLED
- [ ] Dependabot alerts: ENABLED
- [ ] Code scanning: ENABLED
- [ ] Branch protection rules: ENABLED on main
- [ ] Required reviews: At least 1
- [ ] Required status checks: All CI checks
- [ ] No force push allowed
- [ ] No branch deletion allowed

### Authentication & Authorization

- [ ] Shopify OAuth: Correctly implemented
- [ ] Session management: Secure cookies, HttpOnly, SameSite
- [ ] Admin routes: Protected
- [ ] API routes: Authenticated
- [ ] No authentication bypasses in code

### Database Security

- [ ] RLS policies: All tables protected
- [ ] RLS tests: All passing
- [ ] Service role key: Only server-side
- [ ] Anon key: Limited permissions
- [ ] Connection strings: Not in code (env vars only)
- [ ] Backup encryption: Enabled (Supabase default)

### API Security

- [ ] Rate limiting: Configured on all endpoints
- [ ] Input validation: All user inputs validated
- [ ] SQL injection: Parameterized queries only
- [ ] XSS prevention: All outputs escaped
- [ ] CSRF protection: Enabled
- [ ] CORS: Restrictive policy

### Secrets Management

- [ ] All secrets in GitHub Secrets or Vault
- [ ] No secrets in `.env` files in repo
- [ ] `.env.example` has placeholders only
- [ ] Rotation schedule documented
- [ ] Access audit: Who has access to what

### Third-Party Integrations

- [ ] Shopify: API key secured
- [ ] Supabase: Service role key secured
- [ ] OpenAI: API key secured
- [ ] Chatwoot: API token secured
- [ ] Publer: API token secured
- [ ] GA4: Service account key secured

### Network Security

- [ ] HTTPS only in production
- [ ] TLS 1.2+ required
- [ ] Security headers: CSP, HSTS, X-Frame-Options
- [ ] No mixed content warnings

### Dependency Security

- [ ] `npm audit`: 0 high/critical vulnerabilities
- [ ] Outdated packages: Reviewed and updated
- [ ] License compliance: No GPL violations
- [ ] Supply chain: Dependencies from npm registry only

### Logging & Monitoring

- [ ] No sensitive data logged (PII, credentials, tokens)
- [ ] Error logs: Sanitized
- [ ] Access logs: Enabled
- [ ] Security events: Monitored

---

## Security Testing

### Automated Tests

```bash
# Secrets scan
npm run scan

# Dependency audit
npm audit --audit-level=high

# TypeScript security
npm run lint -- --max-warnings 0
```

### Manual Tests

- [ ] SQL injection attempt
- [ ] XSS attempt
- [ ] CSRF attempt
- [ ] Authentication bypass attempt
- [ ] Authorization escalation attempt
- [ ] Rate limit bypass attempt

---

## Security Incident Response

### If Secret Exposed

1. Rotate immediately
2. Revoke exposed credential
3. Audit access logs
4. Notify affected parties
5. Update Gitleaks config
6. Document in incident log

### If Vulnerability Found

1. Assess severity (CVSS score)
2. If P0: Immediate hotfix
3. If P1: Fix within 24 hours
4. If P2/P3: Schedule fix
5. Document and track

---

## Compliance

### HITL Requirements

- [ ] All customer-facing actions: Approval required
- [ ] All social posts: Approval required
- [ ] All inventory mutations: Approval required
- [ ] Grading: Mandatory for CX
- [ ] Audit trail: All actions logged

### Data Privacy

- [ ] Customer data: RLS protected
- [ ] PII: Not logged
- [ ] Data retention: Documented policy
- [ ] Data export: Available on request
- [ ] Data deletion: Implemented

---

## Post-Launch Security

### Daily

- [ ] Review Gitleaks scan results
- [ ] Check Dependabot alerts
- [ ] Review access logs for anomalies

### Weekly

- [ ] Rotate test credentials
- [ ] Review security alerts
- [ ] Update security runbooks

### Monthly

- [ ] Rotate production credentials
- [ ] Security audit
- [ ] Penetration testing (if budget allows)

---

**Created**: 2025-10-19
**Status**: Ready for production security validation
**Last Audit**: Pending (run before production deploy)
