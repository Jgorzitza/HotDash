#!/bin/bash
#
# Fetch Fly.io Logs Script
#
# Fetches logs from Fly.io apps with various filtering options.
#
# Usage:
#   ./scripts/ops/fetch-fly-logs.sh [staging|production] [options]
#
# Examples:
#   ./scripts/ops/fetch-fly-logs.sh staging --tail 100
#   ./scripts/ops/fetch-fly-logs.sh production --since 1h
#   ./scripts/ops/fetch-fly-logs.sh staging --grep ERROR
#

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
ENVIRONMENT="${1:-staging}"
shift || true

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production] [options]"
    exit 1
fi

APP_NAME="hotdash-$ENVIRONMENT"

log_info "Fetching logs from $APP_NAME..."

# Fetch logs with provided options
fly logs -a "$APP_NAME" "$@"

# Exit with fly command's exit code
exit $?

