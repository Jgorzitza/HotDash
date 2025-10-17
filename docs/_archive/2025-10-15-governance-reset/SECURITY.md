# Security Baseline

- CodeQL (JS/TS) blocks on errors.
- Semgrep OWASP + audit, high/critical block.
- Gitleaks for secrets on push and in pre-commit.
- ZAP Baseline nightly against DEV_TUNNEL_URL.
- MCP servers: allowlisted + checksummed; versions pinned; SBOMs under `sbom/`.

## Secrets

Never commit secrets. Use `.env` locally and GitHub Actions secrets in CI.
