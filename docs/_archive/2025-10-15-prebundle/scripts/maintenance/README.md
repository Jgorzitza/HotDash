# Repository Maintenance Scripts

This directory contains automated scripts for ongoing repository maintenance.

## Scripts

### `monthly-cleanup.sh`

Automated monthly repository cleanup script.

**Schedule**: 1st of each month at 2:00 AM UTC (via GitHub Actions)

**Tasks**:

1. Archive old status files from root directory
2. Delete merged branches
3. Clean old artifacts (>90 days)
4. Update REPO_STATUS.md statistics
5. Run security scan (gitleaks)
6. Generate cleanup report

**Usage**:

```bash
# Dry run (preview changes)
./scripts/maintenance/monthly-cleanup.sh --dry-run

# Execute cleanup
./scripts/maintenance/monthly-cleanup.sh
```

**Automation**:

- GitHub Actions workflow: `.github/workflows/monthly-cleanup.yml`
- Runs automatically on 1st of each month
- Creates PR for review (no auto-merge)
- Can be triggered manually via GitHub Actions UI

**Evidence**:

- Cleanup reports: `reports/maintenance/cleanup-YYYY-MM.md`
- Archive locations: `archive/status-reports-YYYY-MM/`, `archive/artifacts-YYYY-MM/`
- Logs: `logs/cleanup-YYYY-MM.log`

---

## GitHub Actions Workflows

### `monthly-cleanup.yml`

**Trigger**:

- Schedule: 1st of each month at 2:00 AM UTC
- Manual: GitHub Actions UI (workflow_dispatch)

**Options**:

- `dry_run`: Preview changes without committing (default: true for manual runs)

**Output**:

- Pull request with cleanup changes
- Cleanup report artifact (90-day retention)
- Logs in job output

**Safety**:

- Always creates PR (never commits directly to main)
- Requires review before merge
- Secret scanning with gitleaks
- Only deletes merged branches

---

## Manual Cleanup

If you need to run cleanup manually:

```bash
cd ~/HotDash/hot-dash

# Preview changes
./scripts/maintenance/monthly-cleanup.sh --dry-run

# Execute cleanup
./scripts/maintenance/monthly-cleanup.sh

# Review changes
git status

# Commit if satisfied
git add -A
git commit -m "chore: monthly cleanup $(date +%Y-%m)"
git push origin main
```

---

## Maintenance Schedule

| Task                   | Frequency | Automation     | Owner     |
| ---------------------- | --------- | -------------- | --------- |
| Archive status files   | Monthly   | GitHub Actions | Automated |
| Delete merged branches | Monthly   | GitHub Actions | Automated |
| Clean old artifacts    | Monthly   | GitHub Actions | Automated |
| Update REPO_STATUS.md  | Monthly   | GitHub Actions | Automated |
| Secret scan            | Monthly   | GitHub Actions | Automated |
| Review remote branches | Quarterly | Manual         | Engineer  |
| Documentation audit    | Quarterly | Manual         | Manager   |

---

## Troubleshooting

**Script fails with permission error**:

```bash
chmod +x scripts/maintenance/monthly-cleanup.sh
```

**GitHub Actions workflow fails**:

- Check workflow logs in GitHub Actions UI
- Verify repository permissions
- Ensure GitHub token has write access

**False positive in dry-run**:

- Some files may appear in dry-run but not exist (expected)
- Re-run without --dry-run to see actual changes

---

**Last Updated**: 2025-10-12  
**Owner**: Git Cleanup Agent  
**Status**: Active
