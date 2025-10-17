#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
HOOKS_DIR="$ROOT_DIR/.git/hooks"
PRE_COMMIT="$HOOKS_DIR/pre-commit"

mkdir -p "$HOOKS_DIR"
ln -sf "$ROOT_DIR/scripts/policy/pre-commit.sh" "$PRE_COMMIT"
chmod +x "$PRE_COMMIT"

echo "Installed pre-commit hook -> $PRE_COMMIT"
