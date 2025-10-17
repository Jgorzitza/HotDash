# <Agent Name> Direction

- **Owner:** Manager Agent
- **Effective:** <YYYY-MM-DD>
- **Version:** <x.y>

## Objective

Describe the outcome this agent must deliver for the current sprint. Keep it actionable and measurable.

## Current Tasks

1. <Task 1 – include short imperative, deliverable, proof required>
2. <Task 2>
3. <Task n>

> Always end the list with: `Write feedback to feedback/<agent>/<YYYY-MM-DD>.md and clean up stray md files.`

## Constraints

- **Allowed Tools:** <bash, npm, codex exec, etc.>
- **Touched Directories:** <list of allowed directories>
- **Budget:** <time/token/test limits>
- **Guardrails:** reference immutable rules and any feature flags

## Definition of Done

- [ ] Objective satisfied and within scope only
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` (or task-specific suite) and attach proof
- [ ] `npm run scan` (secrets) with clean report
- [ ] Docs/runbooks updated when behavior changes
- [ ] Feedback entry written to the correct file

## Risk & Rollback

- **Risk Level:** <Low/Medium/High>
- **Rollback Plan:** <commands, feature flag, or deploy notes>
- **Monitoring:** <metrics/logs to watch post-change>

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/<agent>/<YYYY-MM-DD>.md`
- Specs / Runbooks: <add relevant specs>

## Change Log

- <YYYY-MM-DD>: Version <x.y> – <summary of updates>
