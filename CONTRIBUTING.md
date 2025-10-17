# Contributing Guide

HotDash uses a guardrails-first workflow. Every change goes through a feature branch and a Pull Request with automated checks.

## Getting Started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and populate with vault-provided secrets.
3. Run `./scripts/policy/install-hooks.sh` to install the repo pre-commit hook.

## Branching Model

- Branch names must follow `batch-<BATCH_ID>/<slug>` (example: `batch-20251017T033137Z/chatwoot-health`).
- Guardrail work uses `guardrails-<BATCH_ID>` and is merged before feature work.
- Never force-push to `main`; all merges go through PR review.

## Commit Style

- Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- Scope optional but recommended (e.g. `feat(app): add idea pool tile`).
- Squash commits in PR unless the history is intentionally meaningful.

## Pull Request Checklist

- [ ] Linked task ID with clear objective.
- [ ] Updated docs/runbooks/specs when behavior changes.
- [ ] Added or updated tests (unit, integration, or Playwright) to cover changes.
- [ ] Ran `npm run fmt && npm run lint && npm run test:ci` locally.
- [ ] Ran `npm run scan` for secrets before pushing.
- [ ] Described risk level, rollback plan, and deployment impact in the PR template.

## Required Commands

| Command | Purpose |
| --- | --- |
| `npm run fmt` | Apply project formatting rules (Prettier + ESLint fixes). |
| `npm run lint` | Run linting on the codebase. |
| `npm run test:unit` | Execute unit tests via Vitest. |
| `npm run test:e2e` | Execute Playwright end-to-end tests (headless). |
| `npm run test:ci` | CI smoke including unit + integration suites. |
| `npm run scan` | Run gitleaks secret scan. |
| `npm run ci` | Wrapper that runs `fmt`, `lint`, `test:ci`, and `scan`. |

## Reviews & Code Owners

See `CODEOWNERS` for required reviewers. Areas touching `/app`, `/supabase`, `/scripts`, `/deploy`, `/fly-apps`, or workflows require explicit approval from the listed leads.

## Reporting Issues

Use the feedback workflow: create an entry under `feedback/<agent>/<YYYY-MM-DD>.md` describing the issue, steps to reproduce, expected and actual behavior, and suggested resolution.
