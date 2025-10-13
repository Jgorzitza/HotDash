#!/bin/sh
# Docker startup script - writes GA credentials and starts app

# Write Google Analytics credentials if provided
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS_JSON" ]; then
  echo "Writing GA credentials to /tmp/gcp-credentials.json..."
  echo "$GOOGLE_APPLICATION_CREDENTIALS_JSON" | base64 -d > /tmp/gcp-credentials.json
  export GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-credentials.json
  echo "GA credentials written and env var set"
fi

# Run Prisma setup
npm run setup

# Start the app with GOOGLE_APPLICATION_CREDENTIALS env var
if [ -f "/tmp/gcp-credentials.json" ]; then
  GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-credentials.json npm run start
else
  npm run start
fi

