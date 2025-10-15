#!/bin/bash

# Reliability logging utilities for timestamped command capture
# Source this script with: source scripts/reliability-logger.sh

ts() { 
    date -u +%Y-%m-%dT%H:%M:%SZ
}

log() { 
    printf "[%s] %s\n" "$(ts)" "$*" | tee -a feedback/reliability.md
}

logcmd() {
    log "$ $*"
    bash -c "$*" 2>&1 | sed 's/[A-Za-z0-9_\-]\{16,\}/[REDACTED]/g' | tee -a feedback/reliability.md
    return ${PIPESTATUS[0]}
}
