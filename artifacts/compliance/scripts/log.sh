#!/usr/bin/env bash
set -euo pipefail
TS="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
DESC="${1:-}"
ART="${2:-}"
{
  echo "[$TS] ${DESC}"
  [ -n "$ART" ] && echo "ARTIFACT: ${ART}"
  echo
} >> feedback/compliance.md
