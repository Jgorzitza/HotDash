# Cursor Rules - HotDash Project

## Overview
This directory contains Cursor-specific rules to help AI assistants navigate and understand the HotDash codebase effectively.

## Rules Index

### Always Applied Rules
- **00-project-structure.mdc** - Project layout and key files
- **04-mcp-first-development.mdc** - MCP verification requirements (CRITICAL)

### Context-Specific Rules

#### Development
- **02-error-handling.mdc** - Error message standards
- **05-ui-components.mdc** - UI component patterns
- **09-react-router-7.mdc** - React Router 7 (NOT Remix v6)
- **13-copy-centralization.mdc** - Copy organization strategy

#### Integrations
- **06-shopify-integration.mdc** - Shopify GraphQL patterns
- **07-database-supabase.mdc** - Database and Supabase
- **12-agent-sdk.mdc** - Agent SDK and OpenAI

#### Process & Standards
- **01-hot-rod-an-voice.mdc** - Brand voice guidelines
- **03-localization.mdc** - Localization standards
- **08-agent-coordination.mdc** - Agent workflow
- **11-git-workflow.mdc** - Git commit standards
- **14-compliance-security.mdc** - Security procedures
- **15-testing-qa.mdc** - Testing standards
- **16-documentation-standards.mdc** - Doc formatting

#### Reference
- **17-known-issues.mdc** - Known issues and solutions

## How to Use

### For AI Assistants
Rules are automatically applied based on:
- `alwaysApply: true` - Applied to every request
- `globs` - Applied when working on matching files
- `description` - Manually fetchable by context

### For Developers
1. Review relevant rules before working on features
2. Update rules when patterns change
3. Add new rules for new patterns
4. Keep rules current with codebase

## Key References

### Critical Documents
- [docs/NORTH_STAR.md](mdc:docs/NORTH_STAR.md) - Project vision
- [docs/design/hot_rod_an_voice_tone_guide.md](mdc:docs/design/hot_rod_an_voice_tone_guide.md) - Brand voice (60+ pages)
- [docs/git_protocol.md](mdc:docs/git_protocol.md) - Git workflow

### Localization Audits
- [docs/design/error_message_localization_audit.md](mdc:docs/design/error_message_localization_audit.md)
- [docs/design/help_text_localization_audit.md](mdc:docs/design/help_text_localization_audit.md)
- [docs/design/email_template_localization_audit.md](mdc:docs/design/email_template_localization_audit.md)

### Compliance
- [docs/compliance/evidence/](mdc:docs/compliance/evidence/) - Evidence artifacts
- [docs/runbooks/incident_response_supabase.md](mdc:docs/runbooks/incident_response_supabase.md)

## Maintenance

**Update Frequency**: 
- After major architectural changes
- When new patterns are established
- When issues are discovered and solved
- Quarterly review recommended

**Owner**: Manager agent coordinates rule updates
**Contributors**: All agents can propose updates via feedback files

---

Generated: 2025-10-13T23:58:00Z
Last Updated: 2025-10-13T23:58:00Z

