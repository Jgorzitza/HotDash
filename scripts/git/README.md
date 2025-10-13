---
epoch: 2025.10.E1
doc: scripts/git/README.md
owner: git-cleanup
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# Git Maintenance Scripts

This directory contains automated scripts for repository maintenance and cleanup.

## Scripts

### `monthly-cleanup.sh`

**Purpose**: Automated monthly repository maintenance and health check  
**Owner**: git-cleanup agent  
**Schedule**: Run on the 1st of each month  
**Runtime**: ~5-10 minutes

**What it does**:
1. Fetches latest from remote and prunes stale references
2. Runs git fsck to verify repository integrity
3. Identifies stale branches (>30 days no commits)
4. Identifies merged branches ready for deletion
5. Runs garbage collection (git gc)
6. Checks for large files that shouldn't be in git
7. Reminds to run manual secret scan
8. Generates branch report
9. Creates summary log

**Safety Features**:
- **Read-only operations**: Script only identifies issues, doesn't delete anything
- **Manual review required**: All cleanup recommendations logged for manual approval
- **Comprehensive logging**: All actions logged to `artifacts/git-cleanup/monthly-cleanup-YYYY-MM-DD.log`
- **Error handling**: Script stops on critical errors

**Usage**:

```bash
# Run monthly cleanup
cd ~/HotDash/hot-dash
./scripts/git/monthly-cleanup.sh

# Review the log
cat artifacts/git-cleanup/monthly-cleanup-$(date +%Y-%m-%d).log
```

**Scheduling**:

To run automatically on the 1st of each month, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 2am on 1st of each month)
0 2 1 * * cd ~/HotDash/hot-dash && ./scripts/git/monthly-cleanup.sh >> artifacts/git-cleanup/cron.log 2>&1
```

**Output**:
- Console: Color-coded progress and results
- Log file: `artifacts/git-cleanup/monthly-cleanup-YYYY-MM-DD.log`

**Post-Cleanup Actions**:
1. Review the log file
2. Evaluate stale branches for deletion
3. Delete merged branches that are no longer needed
4. Run manual secret scan: `git grep -i 'password\|api_key\|secret\|token' | grep -v 'vault/'`
5. Update feedback/git-cleanup.md with results

## Best Practices

**When to Run**:
- Automatically: 1st of each month via cron
- Manually: After major feature merges or before releases
- On-demand: When repository feels cluttered

**Review Checklist**:
- [ ] Check for stale branches and decide if they can be deleted
- [ ] Review merged branches and delete if safe
- [ ] Verify no large files committed accidentally
- [ ] Run manual secret scan
- [ ] Update repository status documentation

**Evidence Requirements**:
- Log file from each run
- List of branches deleted (if any)
- Secret scan results
- Update to feedback/git-cleanup.md

## Maintenance

**Script Owner**: git-cleanup agent  
**Review Frequency**: Quarterly  
**Last Updated**: 2025-10-13

