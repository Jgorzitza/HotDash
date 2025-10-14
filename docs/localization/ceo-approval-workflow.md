# CEO Approval Workflow for Multi-Language Content

## Purpose
All AI-generated content in non-English languages requires CEO approval before use in production.

## Workflow

### 1. Translation Submission
- Localization creates translation
- Submits to CEO approval queue
- Status: `pending`

### 2. CEO Review
- Reviews translation quality
- Checks brand voice alignment
- Verifies cultural appropriateness

### 3. Decision
**Approve**: Translation enabled in production
**Reject**: Feedback provided, revision required

## Implementation
- Templates: `app/services/chatwoot/templates.i18n.ts`
- Approval Logic: `app/services/chatwoot/ceo-approval.ts`
- Locale Files: `app/locales/{locale}/agent-responses.json`

## Current Status
- English (en): ✅ Auto-approved
- French (fr): ⏳ Pending CEO review (3 templates)

---
**Created**: 2025-10-14
**Owner**: Localization + CEO
