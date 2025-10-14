#!/bin/bash
# Install Git hooks for secret scanning
# Usage: ./scripts/security/install-git-hooks.sh

echo "📦 Installing Git hooks..."

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook: Run secret scanner

echo "🔍 Running secret scanner..."

if ./scripts/security/scan-secrets.sh; then
  echo "✅ Secret scan passed"
  exit 0
else
  echo ""
  echo "❌ Secret scan failed - commit blocked"
  echo "   Fix the issues above or add false positives to scripts/security/secret-whitelist.txt"
  exit 1
fi
EOF

chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "Pre-commit hook will now:"
echo "  - Run secret scanner before each commit"
echo "  - Block commits if secrets are detected"
echo "  - Prevent accidental secret exposure"
echo ""
echo "To bypass (NOT recommended):"
echo "  git commit --no-verify"

