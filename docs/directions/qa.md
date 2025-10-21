# QA Direction v6.1 - P0 SECRET REMEDIATION

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:30Z  
**Version**: 6.1 (EMERGENCY UPDATE)  
**Status**: 🚨 P0 ACTIVE — Secret Exposure Remediation

---

## 🚨 P0 SECURITY INCIDENT - IMMEDIATE ACTION REQUIRED

**GitGuardian Detected 3 Secrets in Commits**:
1. Chatwoot Widget Token (commit 018383a) - exposed in commit message
2. PostgreSQL URI (commit 6f5b563) - exposed in commit/files
3. PostgreSQL URI (commit 6f5b563) - duplicate detection

**Your Mission**: Remediate secret exposure, prevent future incidents

---

## ✅ QA-001 COMPLETE (from feedback)
**Found Critical Issues**:
- ⚠️ TypeScript error: `app/services/seo/content-optimizer.ts:549` (unterminated string)
- ✅ React Router 7: Compliant
- ✅ Shopify GraphQL: All queries valid
- ✅ Security: 8.5/10 (2 warnings: CSP headers, Chatwoot script)

**Continue QA-002 through QA-008 AFTER P0 remediation**

---

## 🚨 P0 TASKS (4h) - START IMMEDIATELY

### QA-INCIDENT-001: Comprehensive Secret Scan (1h) - START NOW

**Requirements**:
- Scan ALL commits since 2025-10-20 for secrets
- Check commit messages AND file contents
- Identify all exposed secrets
- Categorize by severity

**Implementation**:
```bash
# Scan last 100 commits with Gitleaks
git log -100 --pretty=format:"%H" | while read commit; do
  echo "Scanning commit: $commit"
  git show $commit | gitleaks detect --no-git --verbose
done > secret-scan-results.txt

# Scan commit messages specifically
git log -100 --pretty=format:"%H %s %b" | grep -E "(token|key|password|secret|api_key|DATABASE_URL)" > commit-message-secrets.txt

# Check specific commits reported by GitGuardian
git show 018383a | grep -i "token"
git show 6f5b563 | grep -i "postgresql\|database_url"
```

**Deliverable**: `artifacts/qa/secret-exposure-scan-2025-10-21.md`
- All secrets found (commit hash, location, type)
- Severity classification (critical/high/medium/low)
- Impact assessment
- Affected services

**Acceptance**:
- [ ] All commits scanned (last 100)
- [ ] Commit messages scanned separately
- [ ] All secrets catalogued
- [ ] Report created with remediation priorities

**Time**: 1 hour

---

### QA-INCIDENT-002: Secret Exposure Report (1h)

**Requirements**:
- Document all secret incidents found
- Provide remediation steps for each secret
- Create timeline of exposure
- Estimate blast radius

**Deliverable**: `artifacts/qa/secret-exposure-report-2025-10-21.md`

**Content**:
1. **Executive Summary**: Number of secrets, severity, impact
2. **Incident Timeline**: When exposed, when detected, remediation status
3. **Secret Inventory**:
   - Chatwoot widget token: ieNpPnBaZXd9joxoeMts7qTA
   - PostgreSQL URI: [details from commit 6f5b563]
   - Any additional secrets found in scan
4. **Impact Assessment**:
   - Chatwoot: Medium risk (widget token, not API token)
   - Database: CRITICAL risk (full database access if credentials exposed)
5. **Remediation Steps** (for Manager):
   - Revoke each secret
   - Rotate credentials
   - Update services
   - Verify no unauthorized access
6. **Prevention Recommendations**:
   - Pre-commit hooks
   - Commit message sanitization
   - Agent training on commit security
   - Regular secret scans

**Acceptance**:
- [ ] Report comprehensive (all secrets documented)
- [ ] Remediation steps clear and actionable
- [ ] Impact assessment realistic
- [ ] Prevention measures specified

**Time**: 1 hour

---

### QA-INCIDENT-003: Implement Commit Message Sanitization (1h)

**Requirements**:
- Create pre-commit hook to scan commit messages
- Block commits with secrets in messages
- Alert developer immediately
- Document commit message security policy

**Implementation**:

**File**: `.git/hooks/prepare-commit-msg` (new, executable)
```bash
#!/bin/bash
# Scan commit message for secrets before committing

COMMIT_MSG_FILE=$1

# Run gitleaks on commit message
if gitleaks protect --commit-msg-file="$COMMIT_MSG_FILE" --verbose; then
  echo "✅ Commit message clean (no secrets detected)"
else
  echo "❌ BLOCKED: Secrets detected in commit message!"
  echo "Remove secrets from commit message and try again."
  echo "Use environment variables or vault/ for credentials."
  exit 1
fi
```

**File**: `.git/hooks/commit-msg` (new, executable)
```bash
#!/bin/bash
# Additional commit message validation

COMMIT_MSG_FILE=$1

# Check for common secret patterns
if grep -qE "(token|password|api_key|secret|DATABASE_URL|postgresql://).*[A-Za-z0-9]{20,}" "$COMMIT_MSG_FILE"; then
  echo "❌ BLOCKED: Potential secret detected in commit message"
  echo "Patterns found: token, password, api_key, DATABASE_URL, etc."
  echo "Remove credentials and use generic descriptions instead."
  exit 1
fi

echo "✅ Commit message validated"
```

**Make executable**:
```bash
chmod +x .git/hooks/prepare-commit-msg
chmod +x .git/hooks/commit-msg
```

**Documentation**: `docs/COMMIT_MESSAGE_SECURITY.md` (new)
- What NOT to include in commit messages
- How to reference credentials (use generic terms)
- Examples of safe vs unsafe commit messages

**Acceptance**:
- [ ] Pre-commit hook created and executable
- [ ] Commit message hook created
- [ ] Hooks block commits with secrets
- [ ] Documentation created
- [ ] Tested with sample secret (should block)

**Time**: 1 hour

---

### QA-INCIDENT-004: Secret Scanning Runbook (1h)

**Requirements**:
- Create runbook for responding to secret exposure incidents
- Include: Detection, assessment, remediation, prevention
- Document tools (Gitleaks, GitGuardian, BFG Repo Cleaner)
- Create incident response checklist

**Deliverable**: `docs/runbooks/secret-exposure-incident-response.md`

**Content**:
1. **Incident Detection**: How secrets are detected (GitGuardian, Gitleaks, manual review)
2. **Severity Classification**: Critical/High/Medium/Low based on secret type
3. **Immediate Response** (< 1 hour):
   - Revoke/rotate exposed secret
   - Verify no unauthorized access
   - Update services with new credentials
4. **Git History Cleanup** (< 24 hours):
   - Rewrite commit messages (BFG or git rebase)
   - Force push (with approval)
   - Notify team
5. **Prevention Measures**:
   - Pre-commit hooks
   - Commit message sanitization
   - Regular secret scans
   - Agent training
6. **Tools Reference**:
   - Gitleaks usage
   - GitGuardian setup
   - BFG Repo Cleaner guide
7. **Incident Response Checklist**: Step-by-step actions

**Acceptance**:
- [ ] Runbook created (600+ lines)
- [ ] All incident response steps documented
- [ ] Tools usage documented
- [ ] Checklist provided
- [ ] Manager can execute remediation using runbook

**Time**: 1 hour

---

## AFTER P0 REMEDIATION - Resume QA-002 Through QA-008

**Original Tasks** (10h) - RESUME after P0 complete:
- QA-002: Phase 3-8 Feature Testing (3h)
- QA-003: Performance Testing Suite (2h)
- QA-004: Security & Vulnerability Testing (2h)
- QA-005: API Contract Testing (2h)
- QA-006: Accessibility Testing (2h)
- QA-007: Test Automation Infrastructure
- QA-008: QA Documentation

**Total Work**: 4h P0 remediation + 10h original tasks = 14h

---

## Work Protocol

**1. P0 PRIORITY**: Secret remediation BEFORE all other tasks

**2. MCP Tools** (MANDATORY):
- Web Search: GitGuardian best practices, BFG Repo Cleaner, git security
- Shopify Dev MCP: GraphQL validation (when resume QA-002)
- Chrome DevTools MCP: UI testing (when resume)

**3. Reporting (Every 1 hour during P0 in feedback/qa/2025-10-21.md)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — QA: P0 Secret Remediation Progress

**Working On**: QA-INCIDENT-001 (Comprehensive Secret Scan)
**Progress**: 100% - All 100 commits scanned, 3 secrets confirmed

**Evidence**:
- Scan results: artifacts/qa/secret-scan-results.txt
- Secrets found: 3 (Chatwoot widget token, 2x PostgreSQL URI)
- Commits affected: 018383a, 6f5b563
- Report: artifacts/qa/secret-exposure-scan-2025-10-21.md (400 lines)
- Additional secrets: None found beyond GitGuardian alerts

**Blockers**: None
**Next**: QA-INCIDENT-002 (Secret Exposure Report)
```

---

## Critical Reminders

**DO**:
- ✅ Treat as P0 CRITICAL (drop all other work)
- ✅ Scan commits thoroughly
- ✅ Document ALL findings
- ✅ Provide clear remediation steps
- ✅ Use Web Search for best practices

**DO NOT**:
- ❌ Delay remediation (time-sensitive)
- ❌ Skip any commits in scan
- ❌ Assume only 3 secrets (scan comprehensively)
- ❌ Resume normal QA work until P0 resolved

---

**START NOW**: Scan commits 018383a and 6f5b563, then scan all recent commits for additional secrets
