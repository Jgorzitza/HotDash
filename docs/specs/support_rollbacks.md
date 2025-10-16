# Support Service Rollbacks

## RAG Index Build
- Rollback: Use --use-mcp-fallback
- Recovery: Restore from backup or rebuild

## Triage Rules
- Rollback: Revert triage.ts to previous version
- Recovery: Git revert commit

## SLA Thresholds
- Rollback: Restore sla-thresholds.ts
- Recovery: Update thresholds config
