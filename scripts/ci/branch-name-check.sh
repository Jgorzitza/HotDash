#!/usr/bin/env bash
set -euo pipefail
ref="${GITHUB_HEAD_REF:-${GITHUB_REF_NAME:-}}"
if [[ -z "$ref" ]]; then echo "Unable to determine branch name"; exit 2; fi
if [[ "$ref" =~ ^agent/[a-z0-9_-]+/[a-z0-9_-]+$ || "$ref" =~ ^hotfix/[a-z0-9_-]+$ || "$ref" == "main" ]]; then
  echo "Branch name OK: $ref"; exit 0; fi
echo "Branch name '$ref' violates policy. Use agent/<agent>/<molecule> or hotfix/<slug>."; exit 1
