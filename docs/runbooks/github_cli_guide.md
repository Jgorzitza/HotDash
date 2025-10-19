# GitHub CLI Guide (MCP Alternative)

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: GitHub CLI commands as workaround for missing GitHub MCP credentials

## Overview

While GitHub MCP credentials are being provisioned, DevOps and other agents can use GitHub CLI (`gh`) for repository operations. This guide maps common MCP operations to equivalent `gh` commands.

## Installation

**Already installed**: gh version 2.45.0 ✅

**Verify**:

```bash
gh --version
gh auth status
```

## MCP → GitHub CLI Mapping

### Repository Operations

#### List Commits

**MCP**:

```typescript
mcp_github_list_commits(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (perPage = 10),
);
```

**GitHub CLI**:

```bash
gh api repos/Jgorzitza/HotDash/commits \
  --jq '.[0:10] | .[] | {sha, message: .commit.message, author: .commit.author.name}'
```

#### Get Commit Details

**MCP**:

```typescript
mcp_github_get_commit(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (sha = "abc123"),
  (include_diff = true),
);
```

**GitHub CLI**:

```bash
gh api repos/Jgorzitza/HotDash/commits/abc123
```

### Issue Operations

#### List Issues

**MCP**:

```typescript
mcp_github_list_issues(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (state = "OPEN"),
  (perPage = 20),
);
```

**GitHub CLI**:

```bash
gh issue list --limit 20 --state open --json number,title,state,labels
```

#### Get Issue

**MCP**:

```typescript
mcp_github_get_issue(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (issue_number = 114),
);
```

**GitHub CLI**:

```bash
gh issue view 114 --json number,title,body,state,labels,comments
```

#### Create Issue

**MCP**:

```typescript
mcp_github_create_issue(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (title = "..."),
  (body = "..."),
);
```

**GitHub CLI**:

```bash
gh issue create --title "Issue title" --body "Issue body" --label "task"
```

#### Update Issue

**MCP**:

```typescript
mcp_github_update_issue(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (issue_number = 114),
  (state = "closed"),
);
```

**GitHub CLI**:

```bash
gh issue close 114 --reason "completed"
gh issue edit 114 --title "New title" --body "New body"
```

### Pull Request Operations

#### List PRs

**MCP**:

```typescript
mcp_github_list_pull_requests(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (state = "open"),
);
```

**GitHub CLI**:

```bash
gh pr list --state open --json number,title,state,headRefName
```

#### Get PR Details

**MCP**:

```typescript
mcp_github_pull_request_read(
  (method = "get"),
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (pullNumber = 95),
);
```

**GitHub CLI**:

```bash
gh pr view 95 --json number,title,body,state,commits,reviews
```

#### Get PR Diff

**MCP**:

```typescript
mcp_github_pull_request_read(
  (method = "get_diff"),
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (pullNumber = 95),
);
```

**GitHub CLI**:

```bash
gh pr diff 95
```

#### Create PR

**MCP**:

```typescript
mcp_github_create_pull_request(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (title = "..."),
  (head = "feature-branch"),
  (base = "main"),
  (body = "..."),
);
```

**GitHub CLI**:

```bash
gh pr create --title "PR title" --body "PR body" --base main --head feature-branch
```

#### Merge PR

**MCP**:

```typescript
mcp_github_merge_pull_request(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (pullNumber = 95),
  (merge_method = "squash"),
);
```

**GitHub CLI**:

```bash
gh pr merge 95 --squash --delete-branch
```

### Workflow Operations

#### List Workflows

```bash
gh workflow list
```

#### Run Workflow

```bash
gh workflow run ci --ref main
gh workflow run deploy-production --ref main
```

#### List Workflow Runs

```bash
gh run list --workflow=ci --limit 10
```

#### View Run Details

```bash
gh run view <run-id>
gh run view <run-id> --log
gh run view <run-id> --log-failed
```

#### Watch Running Workflow

```bash
gh run watch <run-id>
```

### Branch Operations

#### List Branches

**MCP**:

```typescript
mcp_github_list_branches((owner = "Jgorzitza"), (repo = "HotDash"));
```

**GitHub CLI**:

```bash
gh api repos/Jgorzitza/HotDash/branches --jq '.[] | {name, protected}'
```

#### Create Branch

**MCP**:

```typescript
mcp_github_create_branch(
  (owner = "Jgorzitza"),
  (repo = "HotDash"),
  (branch = "new-feature"),
  (from_branch = "main"),
);
```

**GitHub CLI**:

```bash
git checkout main
git pull
git checkout -b new-feature
git push -u origin new-feature
```

## Advanced Usage

### Search Code

```bash
gh search code --repo Jgorzitza/HotDash "function name"
```

### Search Issues

```bash
gh search issues --repo Jgorzitza/HotDash "bug label:P0"
```

### Repository Info

```bash
gh repo view Jgorzitza/HotDash --json name,description,stars,forks
```

### Release Operations

```bash
# List releases
gh release list

# View release
gh release view v1.0.0

# Create release
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes"
```

## Automation Scripts

### Monitor CI Status

```bash
#!/bin/bash
# scripts/ops/check-ci.sh
FAILURES=$(gh run list --limit 10 --json conclusion \
  --jq '[.[] | select(.conclusion=="failure")] | length')

if [ "$FAILURES" -gt 2 ]; then
  echo "⚠️ High CI failure rate: $FAILURES/10"
  exit 1
fi
```

### Auto-merge Dependabot PRs

```bash
#!/bin/bash
# scripts/ops/auto-merge-dependabot.sh
gh pr list --author app/dependabot --json number,title \
  --jq '.[] | .number' | while read pr; do
  # Check if CI passed
  if gh pr checks "$pr" --watch; then
    gh pr merge "$pr" --squash --delete-branch
  fi
done
```

### Daily Repository Health

```bash
#!/bin/bash
# scripts/ops/repo-health.sh
echo "📊 Repository Health Report"
echo "Open PRs: $(gh pr list --state open --json number --jq 'length')"
echo "Open Issues: $(gh issue list --state open --json number --jq 'length')"
echo "Recent commits: $(gh api repos/Jgorzitza/HotDash/commits --jq 'length')"
echo "CI status: $(gh run list --limit 1 --json conclusion --jq '.[0].conclusion')"
```

## Limitations vs MCP

**GitHub CLI Advantages**:

- ✅ Already authenticated
- ✅ No token setup required
- ✅ Direct repository access
- ✅ Richer output formatting

**GitHub CLI Limitations vs MCP**:

- ❌ Not available to non-DevOps agents in MCP server environment
- ❌ Requires shell access (not available to in-app agents)
- ❌ Less structured for programmatic use

**Recommendation**: Use GitHub CLI for DevOps operations now, provision MCP token for other agents

## Related Documentation

- MCP Setup: `docs/runbooks/mcp_setup.md`
- GitHub CLI Docs: https://cli.github.com/manual/
- Environment Variables: `docs/runbooks/required_env_vars.md`
