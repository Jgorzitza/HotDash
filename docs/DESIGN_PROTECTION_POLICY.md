# 🛡️ DESIGN FILES PROTECTION POLICY

**Effective**: 2025-10-20  
**Status**: MANDATORY - NON-NEGOTIABLE

---

## INCIDENT THAT CAUSED THIS POLICY

**Date**: 2025-10-15  
**Error**: Manager archived 57 design files as "design drafts"  
**Impact**: Agents built to wrong spec for 4 days (only 30% of designed features)  
**CEO Impact**: Full day of planning work appeared lost  
**Recovery**: All files restored 2025-10-20, but significant time wasted

**This must NEVER happen again.**

---

## PROTECTED DIRECTORIES (Never Archive)

**NEVER ARCHIVE OR DELETE**:

1. `/docs/design/**` - ALL design files (approved or draft)
2. `/docs/specs/**` - ALL specification files
3. `/docs/runbooks/**` - ALL operational runbooks
4. `/docs/directions/**` - ALL agent direction files
5. `/docs/integrations/**` - ALL integration documentation
6. `/mcp/**` - ALL MCP tool documentation

**ALLOWED TO ARCHIVE** (with CEO approval only):

- `/docs/_archive/**` - Already archived content
- `/artifacts/**` (after 90 days)
- `/feedback/**` (after 30 days, with backup)

---

## RULES FOR DESIGN WORK

### Rule 1: Design Files Are Sacred

**ALL files in `/docs/design/` are considered APPROVED unless explicitly marked "DRAFT"**

**Marking as Draft**:

- Filename must start with `DRAFT-`
- Example: `DRAFT-experimental-feature.md`
- Header must include: `status: draft`

**If Not Marked**: Assume APPROVED, never archive

---

### Rule 2: Never Delete Without Verification

**Before archiving or deleting ANY file in protected directories**:

1. ✅ Check with CEO explicitly
2. ✅ Get written confirmation
3. ✅ Create backup in git (tag the commit)
4. ✅ Document reason for archival
5. ✅ Update ARCHIVE_INDEX.md with what was moved and why

**NEVER EVER**:

- ❌ Archive design files as "cleanup"
- ❌ Delete specs because they seem old
- ❌ Remove files that "don't look used"
- ❌ Assume any file is a "draft" without explicit marking

---

### Rule 3: Archive Documentation Required

**If archiving with CEO approval**:

Create entry in `docs/ARCHIVE_INDEX.md`:

```markdown
## 2025-XX-XX: [Description]

**Archived By**: Manager
**Approved By**: CEO (date, context)
**Reason**: [Why these files were archived]
**Recovery**: Files remain at docs/\_archive/YYYY-MM-DD-[name]/

**Files Archived** (X files):

- file1.md
- file2.md
  ...

**Impact**: None (verified unused) / Requires agent direction update / Other
```

---

### Rule 4: Design Verification Checklist

**Before ANY documentation cleanup**:

- [ ] Listed all files to be archived
- [ ] Verified NO design files in list
- [ ] Verified NO spec files in list
- [ ] Verified NO active runbooks in list
- [ ] CEO explicitly approved the list
- [ ] Created git tag: `archive-YYYY-MM-DD`
- [ ] Updated ARCHIVE_INDEX.md
- [ ] Notified all agents of changes

**If ANY design file would be affected**: STOP and get CEO approval.

---

## CONSEQUENCE OF VIOLATION

**If this policy is violated**:

- Immediate rollback of changes
- Full audit of what was lost
- Recovery procedure executed
- CEO notification
- Manager accountability

**This policy exists because I made this mistake.**  
**I will not make it again.**

---

## MONTHLY AUDIT

**Every month** (1st of month):

1. Review `/docs/design/` for outdated files
2. Identify candidates for archival
3. Present list to CEO with justification
4. Get explicit approval
5. Execute archival with full documentation

**Never do sweeping cleanups without CEO approval.**

---

## PROTECTED PATH ENFORCEMENT

**Update CI/CD** to enforce this policy:

```yaml
# .github/workflows/protect-design-files.yml
name: Protect Design Files
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for design file deletions
        run: |
          deleted=$(git diff --diff-filter=D --name-only origin/main | grep "^docs/design/")
          if [ -n "$deleted" ]; then
            echo "ERROR: Design files cannot be deleted without CEO approval"
            echo "Deleted files:"
            echo "$deleted"
            exit 1
          fi
```

---

**Manager Commitment**: I will NEVER archive design/planning work without explicit CEO approval.

**Effective**: Immediately (2025-10-20)
