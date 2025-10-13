#!/bin/bash
# Write Google Analytics credentials from env var to file

if [ -n "$GOOGLE_APPLICATION_CREDENTIALS_JSON" ]; then
  echo "Writing GA credentials to /tmp/gcp-credentials.json..."
  echo "$GOOGLE_APPLICATION_CREDENTIALS_JSON" | base64 -d > /tmp/gcp-credentials.json
  export GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-credentials.json
  echo "GA credentials written successfully"
fi
