#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF' >&2
Usage: chatwoot-fly-smoke.sh [host] [--host <host>] [--interval <seconds>] [--token <api-token>] \
                             [--token-file <path>] [--env <staging>] [--account-id <id>]

Examples:
  chatwoot-fly-smoke.sh                                # defaults to staging host
  chatwoot-fly-smoke.sh --env staging                  # load token from vault env file
  chatwoot-fly-smoke.sh --host custom.fly.dev --token abc123
  chatwoot-fly-smoke.sh --token-file ./token.txt --interval 120

Notes:
  - --env staging loads vault/occ/chatwoot/api_token_staging.env for token/account defaults.
  - HOST can be passed as a positional argument or with --host. Defaults to hotdash-chatwoot.fly.dev.
  - You can also set CHATWOOT_API_TOKEN / CHATWOOT_FLY_HOST environment variables.
EOF
  exit 1
}

DEFAULT_HOST="hotdash-chatwoot.fly.dev"
HOST="${CHATWOOT_FLY_HOST:-$DEFAULT_HOST}"
INTERVAL=300
AUTH_TOKEN="${CHATWOOT_API_TOKEN:-}"
TOKEN_FILE=""
ENV_NAME=""
ACCOUNT_ID="${CHATWOOT_ACCOUNT_ID:-}"
HOST_SET=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      [[ $# -ge 2 ]] || usage
      HOST="$2"
      HOST_SET=1
      shift 2
      ;;
    --interval)
      [[ $# -ge 2 ]] || usage
      INTERVAL="$2"
      shift 2
      ;;
    --token)
      [[ $# -ge 2 ]] || usage
      AUTH_TOKEN="$2"
      shift 2
      ;;
    --token-file)
      [[ $# -ge 2 ]] || usage
      TOKEN_FILE="$2"
      shift 2
      ;;
    --env)
      [[ $# -ge 2 ]] || usage
      ENV_NAME="$2"
      shift 2
      ;;
    --account-id)
      [[ $# -ge 2 ]] || usage
      ACCOUNT_ID="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    --*)
      echo "Unknown option: $1" >&2
      usage
      ;;
    *)
      if [[ $HOST_SET -eq 0 ]]; then
        HOST="$1"
        HOST_SET=1
        shift
      else
        echo "Unexpected argument: $1" >&2
        usage
      fi
      ;;
  esac
done

load_token_file() {
  local path="$1"
  shift || true
  local token_keys=("$@")
  if [[ ${#token_keys[@]} -eq 0 ]]; then
    token_keys=("CHATWOOT_API_TOKEN")
  fi
  if [[ ! -f "$path" ]]; then
    echo "Token file not found: $path" >&2
    exit 1
  fi

  if grep -q '=' "$path"; then
    local token_line=""
    for token_key in "${token_keys[@]}"; do
      token_line=$(grep -E "^${token_key}=" "$path" | tail -n 1 || true)
      if [[ -n "$token_line" ]]; then
        break
      fi
    done
    if [[ -z "$token_line" ]]; then
      echo "None of the keys (${token_keys[*]}) found in $path" >&2
      exit 1
    fi
    AUTH_TOKEN="$(echo "${token_line#*=}" | tr -d '\r\n')"

    local account_line
    account_line=$(grep -E '^CHATWOOT_ACCOUNT_ID' "$path" | tail -n 1 || true)
    if [[ -n "$account_line" ]]; then
      ACCOUNT_ID="$(echo "${account_line#*=}" | tr -d '\r\n')"
    fi
  else
    AUTH_TOKEN="$(tr -d '\r\n' < "$path")"
  fi
}

case "$ENV_NAME" in
  "") ;;
  staging)
    TOKEN_FILE="${TOKEN_FILE:-vault/occ/chatwoot/api_token_staging.env}"
    if [[ $HOST_SET -eq 0 ]]; then
      HOST="$DEFAULT_HOST"
    fi
    ;;
  *)
    echo "Unknown environment: $ENV_NAME" >&2
    usage
    ;;
esac

if [[ -n "$TOKEN_FILE" ]]; then
  load_token_file "$TOKEN_FILE" "CHATWOOT_API_TOKEN" "CHATWOOT_API_TOKEN_STAGING"
fi

if [[ -n "$AUTH_TOKEN" ]]; then
  AUTH_TOKEN="$(printf '%s' "$AUTH_TOKEN" | tr -d '[:space:]')"
fi

if [[ -n "$ACCOUNT_ID" ]]; then
  ACCOUNT_ID="$(printf '%s' "$ACCOUNT_ID" | tr -d '[:space:]')"
fi

if [[ -z "$HOST" ]]; then
  echo "Chatwoot host is required." >&2
  usage
fi

if [[ -z "$AUTH_TOKEN" ]]; then
  echo "WARNING: No Chatwoot API token configured; public API probe may be rate limited" >&2
fi

STAMP() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log_root="artifacts/support/chatwoot-fly-deploy"
log_dir="${log_root}/${HOST}"
mkdir -p "${log_dir}"

echo "Logging Chatwoot smoke results to ${log_dir}"
if [[ -n "$ACCOUNT_ID" ]]; then
  echo "Expecting account id ${ACCOUNT_ID} in response payload" >&2
fi

while true; do
  ts=$(STAMP)
  echo "[${ts}] Probing Chatwoot Fly host ${HOST}"

  tmp_json=$(mktemp)
  tmp_status=$(mktemp)

  curl_args=("-sS" "-o" "${tmp_json}" "-w" "%{http_code}" "https://${HOST}/public/api/v1/accounts")
  if [[ -n "${AUTH_TOKEN}" ]]; then
    curl_args=("-sS" "-H" "Authorization: Bearer ${AUTH_TOKEN}" "-o" "${tmp_json}" "-w" "%{http_code}" "https://${HOST}/public/api/v1/accounts")
  fi

  curl "${curl_args[@]}" > "${tmp_status}"
  status=$(cat "${tmp_status}")

  if [[ "${status}" != "200" ]]; then
    echo "[${ts}] ERROR: Chatwoot API probe returned status ${status}" >&2
    rm -f "${tmp_json}"
  else
    dest_json="${log_dir}/accounts_${ts}.json"
    mv "${tmp_json}" "${dest_json}"
    echo "[${ts}] Chatwoot API probe succeeded"

    if command -v jq >/dev/null 2>&1; then
      if [[ -n "${ACCOUNT_ID}" ]]; then
        if jq -e --arg id "${ACCOUNT_ID}" '.[] | select((.id | tostring) == $id)' "${dest_json}" >/dev/null 2>&1; then
          echo "[${ts}] Verified account ${ACCOUNT_ID} present in response"
        else
          echo "[${ts}] WARNING: Expected account ${ACCOUNT_ID} not found in response" >&2
        fi
      fi
    fi
  fi

  mv "${tmp_status}" "${log_dir}/accounts_${ts}.status"

  echo "[${ts}] OCC conversation list probe"
  if ! curl -sS -o "${log_dir}/occ_tile_${ts}.json" "https://hotdash-staging.fly.dev/api/chatwoot/conversations?mock=1"; then
    echo "[${ts}] WARNING: OCC proxy call failed" >&2
  fi

  echo "[${ts}] Sleeping ${INTERVAL}s before next probe…"
  sleep "${INTERVAL}"
done
