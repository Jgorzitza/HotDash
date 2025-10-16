# Gitleaks Pre-commit Hook Setup

## Overview

This guide explains how to set up Gitleaks as a pre-commit hook to prevent secrets from being committed to the repository.

## What is Gitleaks?

Gitleaks is a SAST (Static Application Security Testing) tool for detecting and preventing hardcoded secrets like passwords, API keys, and tokens in git repositories.

## Installation

### macOS

```bash
# Using Homebrew
brew install gitleaks

# Verify installation
gitleaks version
```

### Linux

```bash
# Download latest release
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz

# Extract
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz

# Move to PATH
sudo mv gitleaks /usr/local/bin/

# Verify installation
gitleaks version
```

### Windows

```powershell
# Using Chocolatey
choco install gitleaks

# Or download from GitHub releases
# https://github.com/gitleaks/gitleaks/releases
```

## Pre-commit Hook Setup

### Option 1: Manual Git Hook

Create a pre-commit hook in your local repository:

```bash
# Navigate to repository
cd /path/to/hot-dash

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Gitleaks pre-commit hook

echo "Running Gitleaks scan..."

# Run gitleaks
gitleaks detect --source . --redact --no-git

if [ $? -eq 0 ]; then
    echo "✅ No secrets detected"
    exit 0
else
    echo "❌ Secrets detected! Commit blocked."
    echo "Please remove secrets and try again."
    echo "See gitleaks output above for details."
    exit 1
fi
EOF

# Make executable
chmod +x .git/hooks/pre-commit

# Test the hook
git commit --allow-empty -m "Test gitleaks hook"
```

### Option 2: Using pre-commit Framework

Install the pre-commit framework:

```bash
# Install pre-commit
pip install pre-commit

# Or using Homebrew
brew install pre-commit
```

Create `.pre-commit-config.yaml` in repository root:

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

Install the hooks:

```bash
# Install pre-commit hooks
pre-commit install

# Test
pre-commit run --all-files
```

## Usage

### Automatic Scanning (Pre-commit)

Once installed, Gitleaks runs automatically on every commit:

```bash
# Make changes
echo "API_KEY=secret123" > config.js

# Try to commit
git add config.js
git commit -m "Add config"

# Output:
# Running Gitleaks scan...
# ❌ Secrets detected! Commit blocked.
# 
# Finding:     API_KEY=secret123
# Secret:      secret123
# File:        config.js
# Line:        1
# Commit:      (unstaged)
```

### Manual Scanning

Scan repository manually:

```bash
# Scan all files
gitleaks detect --source . --redact

# Scan specific files
gitleaks detect --source . --redact --log-opts="config.js"

# Scan staged files only
gitleaks protect --staged --redact

# Scan with verbose output
gitleaks detect --source . --redact --verbose
```

### Bypass Hook (Emergency Only)

**⚠️ WARNING: Only use in emergencies with manager approval**

```bash
# Bypass pre-commit hook
git commit --no-verify -m "Emergency commit"

# You MUST immediately:
# 1. Rotate any exposed secrets
# 2. Remove secrets from code
# 3. Create follow-up commit
```

## Configuration

### Custom Gitleaks Config

Create `.gitleaks.toml` in repository root to customize detection:

```toml
title = "HotDash Gitleaks Config"

[extend]
# Use default rules
useDefault = true

[[rules]]
# Custom rule for Shopify tokens
id = "shopify-token"
description = "Shopify API Token"
regex = '''shpat_[a-zA-Z0-9]{32}'''
tags = ["shopify", "api", "token"]

[[rules]]
# Custom rule for Supabase keys
id = "supabase-key"
description = "Supabase Service Key"
regex = '''eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*'''
tags = ["supabase", "jwt", "key"]

[allowlist]
# Allowlist for test files
paths = [
  '''tests/fixtures/.*''',
  '''.*\.example$''',
]

# Allowlist for specific strings
regexes = [
  '''EXAMPLE_API_KEY''',
  '''YOUR_API_KEY_HERE''',
]
```

### Ignore False Positives

Add to `.gitleaks.toml`:

```toml
[allowlist]
# Ignore specific commits
commits = [
  "abc123def456",  # Commit hash to ignore
]

# Ignore specific files
paths = [
  '''docs/examples/.*''',
  '''\.env\.example$''',
]

# Ignore specific patterns
regexes = [
  '''PLACEHOLDER_.*''',
  '''EXAMPLE_.*''',
]
```

## CI Integration

Gitleaks is already integrated in CI via `.github/workflows/gitleaks.yml`:

```yaml
name: Gitleaks

on: [push, pull_request]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Troubleshooting

### Hook Not Running

```bash
# Check if hook exists
ls -la .git/hooks/pre-commit

# Check if executable
chmod +x .git/hooks/pre-commit

# Test manually
.git/hooks/pre-commit
```

### False Positives

```bash
# Add to allowlist in .gitleaks.toml
# Or use inline comment
API_KEY="example" # gitleaks:allow
```

### Gitleaks Not Found

```bash
# Check installation
which gitleaks

# Check PATH
echo $PATH

# Reinstall if needed
brew reinstall gitleaks
```

### Slow Scans

```bash
# Scan only staged files
gitleaks protect --staged

# Use baseline (scan only new changes)
gitleaks detect --baseline-path .gitleaks-baseline.json
```

## Best Practices

### ✅ DO

- Run Gitleaks before every commit
- Use `.env.example` for example configurations
- Store secrets in GitHub Secrets or Fly.io Secrets
- Use environment variables for all secrets
- Review Gitleaks output carefully
- Update Gitleaks regularly

### ❌ DON'T

- Bypass the hook without manager approval
- Commit secrets even temporarily
- Use `--no-verify` flag routinely
- Ignore Gitleaks warnings
- Hardcode secrets in any file
- Share secrets in code comments

## Secret Detection Examples

### Detected Secrets

```javascript
// ❌ BAD - Will be detected
const apiKey = "sk_live_abc123def456";
const password = "MyP@ssw0rd123";
const token = "ghp_abc123def456ghi789";

// ❌ BAD - Will be detected
DATABASE_URL="postgresql://user:password@host:5432/db"
```

### Safe Patterns

```javascript
// ✅ GOOD - Using environment variables
const apiKey = process.env.SHOPIFY_API_KEY;
const password = process.env.DATABASE_PASSWORD;
const token = process.env.GITHUB_TOKEN;

// ✅ GOOD - Example placeholders
const apiKey = "YOUR_API_KEY_HERE";
const password = "PLACEHOLDER_PASSWORD";
```

## Emergency Response

### If Secret Committed

**IMMEDIATE ACTIONS:**

1. **DO NOT PUSH** if not yet pushed
   ```bash
   # Remove from last commit
   git reset --soft HEAD~1
   # Remove secret from file
   # Commit again
   ```

2. **If Already Pushed:**
   ```bash
   # Rotate the secret immediately
   fly secrets set SECRET_NAME=new_value -a hotdash-production
   
   # Remove from git history
   git filter-repo --path path/to/file --invert-paths
   
   # Force push (coordinate with team)
   git push --force-with-lease
   ```

3. **Follow Incident Response:**
   - See `docs/runbooks/secrets_management.md`
   - Create security incident report
   - Document timeline and actions

## Maintenance

### Update Gitleaks

```bash
# macOS
brew upgrade gitleaks

# Linux
# Download latest release from GitHub

# Verify version
gitleaks version
```

### Update Pre-commit Hooks

```bash
# Update pre-commit framework
pre-commit autoupdate

# Reinstall hooks
pre-commit install --install-hooks
```

## Team Onboarding

### New Developer Setup

1. **Install Gitleaks:**
   ```bash
   brew install gitleaks  # macOS
   ```

2. **Install Pre-commit Hook:**
   ```bash
   cd hot-dash
   pre-commit install
   ```

3. **Test Setup:**
   ```bash
   # Create test file with fake secret
   echo "API_KEY=test123" > test.txt
   git add test.txt
   git commit -m "Test"
   # Should be blocked
   
   # Clean up
   git reset HEAD test.txt
   rm test.txt
   ```

4. **Read Documentation:**
   - This guide
   - `docs/runbooks/secrets_management.md`

## References

- Gitleaks GitHub: https://github.com/gitleaks/gitleaks
- Gitleaks Documentation: https://github.com/gitleaks/gitleaks/wiki
- Pre-commit Framework: https://pre-commit.com/
- Secrets Management: `docs/runbooks/secrets_management.md`

