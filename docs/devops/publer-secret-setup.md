# Publer Secret Setup

**Owner:** DevOps • **Last Updated:** 2025-10-16

---

## Purpose

Configure the official Publer API credentials required for secure social posting. Secrets must be present locally (vault), in GitHub Environments (CI), and in Fly.io apps (runtime) before enabling the `/api/social/post` route.

---

## Required Secrets

| Name | Description | Notes |
| --- | --- | --- |
| `PUBLER_API_KEY` | Publer API key from https://app.publer.com | Use staging workspace key outside production |
| `PUBLER_WORKSPACE_ID` | Workspace identifier (UUID) | Use staging workspace for dev/staging |

---

## Local Vault Setup

```bash
mkdir -p vault/occ/publer
cat <<'EOF' > vault/occ/publer/api_key_staging.env
PUBLER_API_KEY=your-api-key
EOF

cat <<'EOF' > vault/occ/publer/workspace_id_staging.env
PUBLER_WORKSPACE_ID=your-workspace-id
EOF
```

Load into your terminal when testing locally:

```bash
export $(grep -v '^#' vault/occ/publer/api_key_staging.env | xargs)
export $(grep -v '^#' vault/occ/publer/workspace_id_staging.env | xargs)
```

---

## GitHub Environments

1. Navigate to **Settings → Environments → production** (repeat for staging if used).
2. Add/update secrets:
   - `PUBLER_API_KEY`
   - `PUBLER_WORKSPACE_ID`
3. Confirm workflows list the secrets with “Encrypted”.

PR template requires evidence that `scripts/verify_secrets.sh` passes after updates.

---

## Fly.io Secrets

```bash
# Staging
fly secrets set PUBLER_API_KEY="..." PUBLER_WORKSPACE_ID="..." --app hot-dash-staging

# Production
fly secrets set PUBLER_API_KEY="..." PUBLER_WORKSPACE_ID="..." --app hot-dash-production
```

Verify with `fly secrets list` (values will appear as redacted).

---

## Verification Checklist

- [ ] `PUBLER_API_KEY` and `PUBLER_WORKSPACE_ID` present in vault, GitHub, Fly.io
- [ ] `scripts/verify_secrets.sh` passes locally and in CI
- [ ] `/app/routes/api/social.post.ts` returns 401/403 if secrets missing
- [ ] Unit tests mock Publer (`tests/unit/integrations/publer.spec.ts`)

---

## Rotation

Rotate every 90 days or on incident:

1. Generate new API key in Publer dashboard.
2. Update vault files.
3. Update GitHub secrets (staging + production).
4. Update Fly.io secrets.
5. Validate by re-running `scripts/verify_secrets.sh` and the social post integration tests.
6. Revoke the old key in Publer.

---

## Contact

- DevOps lead (Slack: #infra)
- Publer support: https://publer.com/docs

