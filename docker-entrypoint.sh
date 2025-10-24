#!/bin/sh
set -e

# Write Google Analytics credentials to file if JSON env var exists
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS_BASE64" ]; then
  mkdir -p /tmp/gcp
  echo "$GOOGLE_APPLICATION_CREDENTIALS_BASE64" | base64 -d > /tmp/gcp/credentials.json
  export GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp/credentials.json
  echo "✓ Google Analytics credentials decoded and written to $GOOGLE_APPLICATION_CREDENTIALS"
elif [ -n "$GOOGLE_APPLICATION_CREDENTIALS_JSON" ]; then
  mkdir -p /tmp/gcp
  echo "$GOOGLE_APPLICATION_CREDENTIALS_JSON" > /tmp/gcp/credentials.json
  export GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp/credentials.json
  echo "✓ Google Analytics credentials written to $GOOGLE_APPLICATION_CREDENTIALS"
fi

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Migration failed, continuing anyway..."

# Execute the command passed to the entrypoint
exec "$@"

