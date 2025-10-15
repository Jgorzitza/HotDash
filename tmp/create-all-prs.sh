#\!/bin/bash

# Engineer PR
gh pr create --base main --head agent/engineer/approval-queue-ui \
  --title "Engineer: Approval Queue UI Implementation" \
  --body "**Agent:** engineer
**Priority:** P0
**Task:** Build Approval Queue UI with Designer specs

## Work Completed
- ApprovalCard component with Polaris Card
- Approvals route with queue list
- Fixtures for approval data
- Tests passing
- Responsive design (mobile, tablet, desktop)

## Evidence
- Feedback: feedback/engineer/2025-10-15.md
- Commit: 465ea5f
- Branch: agent/engineer/approval-queue-ui

## WORK COMPLETE - READY FOR REVIEW" \
  --label "task,P0" 2>&1 || echo "Engineer PR may exist"

# SEO PR
gh pr create --base main --head agent/seo/anomalies-detection \
  --title "SEO: Anomalies Detection for Dashboard Tile" \
  --body "**Agent:** seo
**Priority:** P2

## Work Completed
- SEO anomalies detection API route
- Traffic drop detection (>20%)
- Ranking loss detection
- Tests passing
- Spec document created

## Evidence
- Feedback: feedback/seo/2025-10-15.md

## WORK COMPLETE - READY FOR REVIEW" \
  --label "task,P2" 2>&1 || echo "SEO PR may exist"

# Support PR
gh pr create --base main --head agent/support/chatwoot-integration \
  --title "Support: Chatwoot Integration Spec & RAG Testing" \
  --body "**Agent:** support
**Priority:** P2

## Work Completed
- Chatwoot integration spec (300+ lines)
- RAG testing script
- Triage rules defined
- SLA targets documented

## Evidence
- Feedback: feedback/support/2025-10-15.md

## WORK COMPLETE - READY FOR REVIEW" \
  --label "task,P2" 2>&1 || echo "Support PR may exist"

# AI-Knowledge PR
gh pr create --base main --head agent/ai-knowledge/kb-design \
  --title "AI-Knowledge: Knowledge Base Design & Learning Extraction" \
  --body "**Agent:** ai-knowledge
**Priority:** P2

## Work Completed
- KB design spec (300 lines)
- Learning extraction pipeline
- Quality metrics defined
- Article format specified

## Evidence
- Feedback: feedback/ai-knowledge/2025-10-15.md
- Commit: a0ed14d

## WORK COMPLETE - READY FOR REVIEW" \
  --label "task,P2" 2>&1 || echo "AI-Knowledge PR may exist"

echo "PRs created for all completed agents"

