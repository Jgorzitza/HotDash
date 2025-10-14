#!/bin/bash
# Cron job for automated rotation alerts
# Install: crontab -e
# Add: 0 9 * * * /path/to/hot-dash/scripts/security/rotation-cron.sh

cd "$(dirname "$0")/../.." || exit 1

# Run rotation check and alerts
./scripts/security/rotate-secrets.sh alert

# Log execution
echo "[$(date -Iseconds)] Rotation check completed" >> /tmp/rotation-cron.log

