# P0 SECURITY INCIDENT - Secret Exposure

**Date**: 2025-10-21T22:30Z  
**Severity**: P0 CRITICAL  
**Status**: ACTIVE REMEDIATION REQUIRED

---

## Incident Summary

**4 Secrets Detected by GitGuardian**:

### Incident 1: Chatwoot Widget Token (commit 018383a)
- **Commit**: 018383a (feat(support): deploy Chatwoot live chat widget)
- **Secret Type**: Generic High Entropy Secret
- **Exposure Location**: Commit message (line: "Token: ieNpPnBaZXd9joxoeMts7qTA")
- **Impact**: Widget token exposed publicly
- **Risk**: Medium (widget token less sensitive than API token, but still should be protected)

### Incident 2: PostgreSQL URI (commit 6f5b563)
- **Commit**: 6f5b563 (feat(devops): complete direction v6.0 tasks)
- **Secret Type**: PostgreSQL connection string (DATABASE_URL)
- **Exposure Location**: Commit message referencing postgresql://postgres:...@db.mmbjiyhsvniqxibzgyvx.supabase.co
- **Impact**: Database credentials exposed publicly
- **Risk**: CRITICAL (full database access)

### Incident 3: PostgreSQL URI duplicate (commit 6f5b563)
- **Same as Incident 2** (GitGuardian detected multiple references in same commit)

### Incident 4: Chatwoot Widget Token REPEATED (commit a644ca6)
- **Commit**: a644ca6 (feat(support): complete direction v6.0)
- **Secret Type**: Generic High Entropy Secret  
- **Exposure Location**: `docs/support/chatwoot-integration-guide.md` (line: "Token: ieNpPnBaZXd9joxoeMts7qTA")
- **Impact**: SAME token as Incident 1, now in documentation file AND commit message
- **Risk**: Medium (but repeated exposure - worse than single incident)
- **Additional**: Test file has mock token `hCzzpYtFgiiy2aX4ybcV2ts2` (likely flagged too)

---

## Immediate Actions Required

### 1. Revoke Exposed Secrets ✅ URGENT
- [ ] **Revoke Chatwoot widget token** (exposed in commits 018383a AND a644ca6)
  - Regenerate in Chatwoot dashboard: Settings → Inboxes → Hot Rod AN Website → Regenerate Widget Token
  - Update vault/occ/chatwoot/widget_token.env with new token
  - Update app/root.tsx to use env var (not hardcoded)
  - Redeploy staging with new token
- [ ] **Rotate Supabase DATABASE_URL** (exposed in commit 6f5b563)
  - Supabase Dashboard → Settings → Database → Reset Password
  - Update Fly secrets: `fly secrets set DATABASE_URL=new_url --app hotdash-staging`
  - Restart app: `fly apps restart hotdash-staging`
- [ ] **Verify no unauthorized access**
  - Check Chatwoot logs for unexpected widget sessions
  - Check Supabase logs for unauthorized database connections
  - Monitor for 24 hours post-rotation

### 2. Remove Secrets from Git History
- [ ] **Clean commit 018383a message** (Chatwoot token in message)
- [ ] **Clean commit a644ca6** (Chatwoot token in docs/support/chatwoot-integration-guide.md + commit message)
- [ ] **Clean commit 6f5b563 message** (PostgreSQL URI in message)
- [ ] Use git filter-branch or BFG Repo Cleaner
- [ ] Force push cleaned history (requires CEO approval)
- [ ] Notify all team members to re-clone repository

**Files to Clean**:
- docs/support/chatwoot-integration-guide.md (remove line: "Token: ieNpPnBaZXd9joxoeMts7qTA")
- Replace with: "Token: [FROM_ENV_VAR]" or "<WIDGET_TOKEN>"

### 3. Update Affected Services
- [ ] Deploy new Chatwoot widget token to staging/production
- [ ] Update DATABASE_URL in Fly.io secrets
- [ ] Verify services still operational after rotation

### 4. Security Audit
- [ ] Scan all commits for additional secret exposures
- [ ] Review commit message policy
- [ ] Implement commit message sanitization
- [ ] Add pre-commit hooks to prevent future exposures

---

## Root Cause Analysis

### Why This Happened

**Commit 018383a (Chatwoot token)**:
- Support agent included token in commit message for "documentation"
- Gitleaks scans code files, NOT commit messages
- Commit message bypass: Gitleaks didn't catch it
- GitGuardian caught it after push to GitHub

**Commit 6f5b563 (PostgreSQL URI)**:
- DevOps agent likely included DATABASE_URL in file content or commit message
- Investigating exact location

### Prevention Failures
1. ❌ Gitleaks doesn't scan commit messages
2. ❌ No commit message sanitization
3. ❌ Agents not trained on commit message security

---

## Remediation Plan

### Immediate (Next 1 Hour)

**Step 1: Revoke Chatwoot Widget Token**
```bash
# Chatwoot Dashboard
1. Navigate to: Settings → Inboxes → Hot Rod AN Website
2. Widget Settings → Regenerate Token
3. Copy new token to vault/occ/chatwoot/widget_token.env
4. Update app/root.tsx with new token (from env var, not hardcoded)
5. Redeploy staging
```

**Step 2: Check DATABASE_URL Exposure**
```bash
# Check if DATABASE_URL exposed in commit
git show 6f5b563 | grep -i "postgresql://\|postgres://"

# If found, IMMEDIATELY:
1. Rotate Supabase credentials (Dashboard → Settings → Database → Reset Password)
2. Update Fly secrets: fly secrets set DATABASE_URL=new_url --app hotdash-staging
3. Restart app: fly apps restart hotdash-staging
```

**Step 3: Scan All Recent Commits**
```bash
# Scan last 100 commits
git log -100 --pretty=format:"%H %s" | while read commit msg; do
  git show $commit | gitleaks detect --no-git --verbose
done
```

### Short-Term (Next 24 Hours)

**Step 4: Clean Git History** (requires CEO approval)
```bash
# Option A: Rewrite commit messages (safer)
git rebase -i HEAD~20  # Interactive rebase last 20 commits
# Edit commit 018383a to remove token from message

# Option B: BFG Repo Cleaner (if secrets in files)
java -jar bfg.jar --replace-text secrets.txt repo.git

# Force push (REQUIRES CEO APPROVAL)
git push --force-with-lease origin manager-reopen-20251020
```

**Step 5: Implement Commit Message Sanitization**
```bash
# Pre-commit hook: .git/hooks/prepare-commit-msg
#!/bin/bash
# Scan commit message for secrets before commit
gitleaks protect --staged --commit-msg-file="$1"
```

**Step 6: Update Agent Training**
- Add to agent direction: "NEVER include credentials in commit messages"
- Add to RULES.md: Commit message security policy
- Add to agent startup checklist: Verify no secrets in commits

### Long-Term (Next Week)

**Step 7: Implement GitGuardian Pre-Push Hook**
- Scan commits before push
- Block push if secrets detected
- Alert developer immediately

**Step 8: Rotate All Secrets (Precautionary)**
- Shopify API keys
- Google service account keys
- OpenAI API keys
- All Supabase credentials
- Chatwoot API tokens

**Step 9: Security Training for All Agents**
- Commit message security
- How secrets get exposed
- How to use vault/ properly
- How to verify commits before push

---

## Assigned to QA Agent

### New Direction: P0 Secret Remediation

**QA-INCIDENT-001: Secret Exposure Remediation (4h) - START IMMEDIATELY**

**Tasks**:
1. Scan all commits since 2025-10-20 for additional secrets (1h)
2. Create comprehensive secret exposure report (1h)
3. Implement commit message sanitization (pre-commit hook) (1h)
4. Create secret scanning runbook for future incidents (1h)

**MCP Required**: Web search for BFG Repo Cleaner, git filter-branch, GitGuardian best practices

**Deliverable**: 
- Secret exposure report (all incidents catalogued)
- Remediation status (revoked, rotated, cleaned)
- Prevention measures implemented (pre-commit hooks)
- Incident response runbook

---

## Manager Actions Required

**IMMEDIATE**:
1. ✅ Document incident (this file)
2. ⏳ Revoke Chatwoot widget token
3. ⏳ Check DATABASE_URL exposure
4. ⏳ Rotate affected credentials
5. ⏳ Assign QA to remediation

**NEXT**:
6. CEO approval for git history rewrite (force push)
7. Deploy rotated credentials
8. Verify no unauthorized access
9. Update all agent directions with commit message security policy

---

**Incident Status**: ACTIVE  
**Next Update**: 1 hour (after initial remediation)

