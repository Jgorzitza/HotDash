# Git History Cleanup Options - .mcp.json Secrets

**Date:** 2025-10-12T07:35:00Z  
**Incident:** Hardcoded tokens in .mcp.json (now remediated)  
**Status:** OPTIONAL - Requires manager coordination

---

## Background

**Secrets Exposed in Git History:**
- GitHub Personal Access Token: `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`
- Supabase Access Token: `sbp_12ea9d9810c770c41afd4f80653755b248b133f6`

**Current Status:**
- ✅ Secrets removed from latest commit
- 🟡 Secrets still in git history (previous commits)
- ✅ Per CEO: No token revocation needed (controlled environment)

---

## Git History Cleanup Options

### Option 1: Do Nothing (Acceptable)

**Rationale:**
- CEO confirmed no token revocation needed
- Repository is private
- Environment is controlled
- Tokens have limited scope
- Forward fix applied (tokens now in env vars)

**Risk:** LOW - Tokens in history but not exploitable in controlled environment

**Recommendation:** Acceptable if repo remains private and controlled

---

### Option 2: BFG Repo-Cleaner (Recommended if cleanup desired)

**Tool:** https://rtyley.github.io/bfg-repo-cleaner/

**Advantages:**
- Faster than git-filter-branch
- Safer (protects HEAD)
- Easier to use
- Widely trusted

**Procedure:**
```bash
# 1. Backup repository
cd /home/justin/HotDash
cp -r hot-dash hot-dash-backup

# 2. Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# 3. Run BFG to replace secrets
java -jar bfg-1.14.0.jar \
  --replace-text secrets.txt \
  hot-dash

# secrets.txt content:
# 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
# sbp_12ea9d9810c770c41afd4f80653755b248b133f6

# 4. Clean up
cd hot-dash
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (COORDINATE WITH TEAM FIRST!)
git push --force
```

**Impact:**
- Rewrites git history
- Requires force push
- Team members must re-clone or reset
- **REQUIRES COORDINATION**

**Risk:** MEDIUM - Can disrupt team if not coordinated

---

### Option 3: git-filter-branch (Alternative)

**Procedure:**
```bash
# Replace secrets in history
git filter-branch --tree-filter '
  if [ -f .mcp.json ]; then
    sed -i "s/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/\${GITHUB_PERSONAL_ACCESS_TOKEN}/g" .mcp.json
    sed -i "s/sbp_12ea9d9810c770c41afd4f80653755b248b133f6/\${SUPABASE_ACCESS_TOKEN}/g" .mcp.json
  fi
' --all

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force
```

**Advantages:**
- Built into git
- No external dependencies

**Disadvantages:**
- Slower than BFG
- More complex
- Higher risk of errors

**Impact:** Same as Option 2 (history rewrite, force push required)

---

### Option 4: Create New Repository (Nuclear option)

**Procedure:**
1. Create new GitHub repository
2. Copy current codebase (latest commit only)
3. Initialize fresh git history
4. Push to new repo
5. Archive old repo (make private, don't delete for audit trail)

**Advantages:**
- Clean history guaranteed
- No risk of mistakes
- Simple process

**Disadvantages:**
- Loses all git history
- Loses PR history, issues, etc.
- Most disruptive option

**When to Use:** Only if other options fail or git history is problematic

---

## Recommendation

**For HotDash:**

**Option 1 (Do Nothing):** ✅ RECOMMENDED

**Rationale:**
- CEO confirmed no token revocation needed
- Controlled environment (private repo)
- Limited token scope
- Forward fix applied
- Low actual risk

**Alternative:** If manager wants cleanup, use **Option 2 (BFG)** with full team coordination.

---

## Coordination Requirements (If Cleanup Chosen)

**Before Cleanup:**
1. ✅ Get manager approval
2. ✅ Notify all team members
3. ✅ Choose maintenance window (no active work)
4. ✅ Ensure all work is committed and pushed
5. ✅ Create backup of repository

**During Cleanup:**
1. Execute cleanup procedure
2. Verify secrets removed from history
3. Force push to remote
4. Notify team

**After Cleanup:**
1. Team members re-clone or hard reset
2. Verify all MCPs still work
3. Document completion
4. Update incident response log

---

## Manager Decision Point

**Manager: Please Choose:**

**[ ] Option 1:** Do Nothing (forward fix sufficient)  
**[ ] Option 2:** BFG Cleanup (coordinate with team)  
**[ ] Option 3:** git-filter-branch (if BFG not available)  
**[ ] Option 4:** New Repository (nuclear option)

**If Option 2/3 chosen:**
- Best time: [Choose maintenance window]
- Team notification: [How you'll notify]
- Backup location: [Where to store backup]

**Compliance Recommendation:** Option 1 is sufficient per CEO decision.

---

**Step 4 Status:** ✅ OPTIONS DOCUMENTED  
**Manager Decision:** AWAITING (proceed to Step 5)

