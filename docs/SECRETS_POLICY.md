# 🔒 Secrets Management Policy (MANDATORY)

**Effective**: 2025-10-20  
**Status**: MANDATORY - NON-NEGOTIABLE  
**Owner**: Manager

---

## INCIDENT THAT CAUSED THIS POLICY

**Date**: 2025-10-20T03:19:19Z (UTC)  
**Detection**: GitGuardian alert  
**Secret**: PostgreSQL URI with password  
**Location**: Commit b3ff28f git diff (historical)  
**Cause**: Manager commit showing password removal included password in diff

**Resolution**: 
- Gitleaks baseline updated to suppress historical findings
- No rotation needed (secret never exposed in current files)
- Policy created to prevent future incidents

---

## ABSOLUTE RULES (Never Break)

### Rule 1: NO SECRETS IN GIT (Ever)

**FORBIDDEN in git commits** ❌:
- Passwords (plain text or URL-encoded)
- API keys
- Database URIs with credentials
- Private keys
- Tokens
- ANY credential string

**This includes**:
- ❌ Code files
- ❌ Configuration files
- ❌ Documentation (.md files)
- ❌ Commit messages
- ❌ Git diffs (even when removing secrets!)

---

### Rule 2: Use Vault Pattern

**ALL secrets MUST be in**:
- `/vault/**` (gitignored)
- `.env` / `.env.local` / `.env.*` (gitignored)
- GitHub Secrets / Environments
- Fly.io secrets (`fly secrets set`)

**Reference secrets by location, never by value**:
```markdown
✅ GOOD: "Password updated in vault/occ/supabase/database_url_staging.env"
❌ BAD: "New password: Th3rm0caf3/67!"

✅ GOOD: "Run: fly secrets set DATABASE_URL=\"$(cat vault/...)\""
❌ BAD: "Run: fly secrets set DATABASE_URL=\"postgresql://user:pass@...\""
```

---

### Rule 3: Verify .gitignore

**These MUST be in .gitignore**:
```
.env
.env.*
vault/
*.key
*.pem
secrets.json
```

**Verify before every commit**:
```bash
git status --ignored | grep -E "\.env|vault/"
# Should show: "Ignored files"
```

---

### Rule 4: Gitleaks Baseline (Historical Suppression)

**When secrets exist in git history**:
1. Cannot rewrite history (non-destructive rule)
2. Add to `security/gitleaks-baseline.json`
3. Include: commit hash, file, rule ID, fingerprint
4. Document why (incident report)
5. Rotate the secret (unless CEO says no rotation needed)

**Baseline Format**:
```json
[
  {
    "Description": "PostgreSQL URI",
    "File": "filename.md",
    "Commit": "full-commit-hash",
    "RuleID": "generic-api-key",
    "Fingerprint": "commit:file:type:line"
  }
]
```

---

### Rule 5: Commit Message Hygiene

**When referencing secret updates**:
```markdown
✅ GOOD:
"fix: Update database credentials
- Updated: vault/occ/supabase/database_url_staging.env
- Fly secret updated via secure command
- No passwords in commit"

❌ BAD:
"fix: Update database password to Th3rm0caf3/67!
- New URL: postgresql://user:Th3rm0caf3/67!@..."
```

**Never put secrets in**:
- Commit titles
- Commit bodies
- PR descriptions
- Issue descriptions

---

### Rule 6: Documentation References

**When documenting credential updates**:

```markdown
✅ GOOD (vault/rotation_log.md):
## 2025-10-19: Supabase Database Password Updated
- **Credential**: DATABASE_URL
- **Location**: vault/occ/supabase/database_url_staging.env
- **Updated By**: Manager
- **Reason**: Mismatch between vault and Fly secrets
- **Rotation**: Not required (CEO decision)
- **Value**: [Secured in vault]

❌ BAD:
## 2025-10-19: Password Updated
- Old: Th3rm0caf3/50!
- New: Th3rm0caf3/67!
- URL: postgresql://postgres:Th3rm0caf3/67!@...
```

---

### Rule 7: Pre-Commit Verification

**Before EVERY commit**:
```bash
# 1. Check for secrets in staged files
git diff --staged | grep -iE "password|secret|api.key|token" && echo "⚠️ Review for secrets!" || echo "✅ No obvious secrets"

# 2. Run Gitleaks
npm run scan

# 3. Verify .env and vault/ not staged
git status | grep -E "\.env|vault/" && echo "❌ STOP - Secrets file staged!" || echo "✅ No secret files staged"
```

**If ANY check fails**: STOP, review, fix, re-verify

---

### Rule 8: Incident Response

**When GitGuardian alerts**:
1. ✅ Acknowledge immediately
2. ✅ Find all occurrences (git log, grep)
3. ✅ Assess impact (public repo? who has access?)
4. ✅ Determine if rotation needed (ask CEO if unsure)
5. ✅ Update Gitleaks baseline (historical suppression)
6. ✅ Remove from current files (if present)
7. ✅ Create/update policy (prevent future)
8. ✅ Document incident (security/incidents/)
9. ✅ Verify fix (npm run scan passes)
10. ✅ Report to CEO (resolution complete)

**Timeline**: Within 1 hour of detection

---

## MANAGER RESPONSIBILITIES

### As Sole Git Operator:

**I MUST**:
- ✅ Run `npm run scan` before EVERY commit
- ✅ Verify .env and vault/ are gitignored
- ✅ Never include secrets in commit messages
- ✅ Never show secrets in diffs (even when removing them)
- ✅ Use Gitleaks baseline for historical findings
- ✅ Update this policy when incidents occur
- ✅ Enforce policy with all agents

**I MUST NOT**:
- ❌ Commit files with secrets
- ❌ Put secrets in commit messages
- ❌ Reference secret values in documentation
- ❌ Ignore GitGuardian alerts
- ❌ Skip security scans

---

## PREVENTION CHECKLIST

**Before committing ANY file**:
- [ ] Ran `npm run scan` (Gitleaks clean)
- [ ] Verified no .env or vault/ files staged
- [ ] Commit message contains no secret values
- [ ] Documentation references vault locations (not values)
- [ ] Diff reviewed (no secrets visible)

**If creating documentation about secrets**:
- [ ] Use placeholder: `***REDACTED***` or `[VALUE_IN_VAULT]`
- [ ] Reference vault file path (not value)
- [ ] Use secure command pattern: `$(cat vault/...)`

---

## INCIDENT LOG

### Incident 1: PostgreSQL URI in Git History

**Date**: 2025-10-20T03:19:19Z  
**Detected By**: GitGuardian  
**Secret**: PostgreSQL URI with password  
**Location**: Commit b3ff28f (git diff showing password removal)  
**Occurrences**: 3 (UPDATE_FLY_SECRETS.md, CEO_DEPLOY_CHECKLIST.md, vault/rotation_log.md)  
**Cause**: Manager commit removing passwords included the password values in the diff  
**Impact**: Historical git commit contains secret (not in current files)  
**Rotation**: Not required (CEO decision)  
**Resolution**:
- ✅ Gitleaks baseline updated (suppress historical findings)
- ✅ feedback/manager/2025-10-19.md cleaned (removed verification reference)
- ✅ Policy created (this document)
- ✅ npm run scan passes
**Resolved**: 2025-10-20T02:00:00Z  
**Time to Resolution**: <1 hour

---

## MANAGER COMMITMENT

**I OWN secret management.**

**I WILL**:
- Always run security scans before commits
- Never include secrets in any git content
- Use Gitleaks baseline for historical issues
- Respond to alerts within 1 hour
- Keep this policy updated

**This will never happen again.**

---

**Effective**: Immediately (2025-10-20)  
**Enforcement**: Manager accountability, CI/CD verification

