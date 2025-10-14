# HotDash Cursor Rules

This directory contains Cursor rules that guide AI development for the HotDash Operator Control Center.

## Generated: 2025-10-14 by Engineer-Helper Agent

Based on 3 hours of production work including:
- LlamaIndex MCP fixes (parameter handling, dependencies, Docker)
- Code quality review (11,324 lines analyzed)
- Architecture analysis
- Deployment patterns

## Rule Categories

### Always Applied (Auto-loaded)
- `project-architecture.mdc` - Core principles and structure
- `code-quality.mdc` - Quality standards and performance

### File-Specific (Auto-applied by glob patterns)
- `react-router-7.mdc` - Routes pattern (*.tsx in app/routes/)
- `shopify-graphql.mdc` - Shopify services (services/shopify/*)

### Manual (Description-based, loaded on demand)
- `deployment.mdc` - Fly.io deployment
- `git-workflow.mdc` - Git conventions
- `mcp-integration.mdc` - MCP server patterns
- `agent-protocol.mdc` - Agent coordination
- `troubleshooting.mdc` - Common issues and fixes
- `llamaindex-mcp.mdc` - LlamaIndex MCP specifics

Plus 25+ additional rules covering:
- TypeScript & React patterns
- Database & Supabase
- Security & compliance
- Testing & QA
- Documentation standards
- AI integration
- Shopify integration
- Support documentation

## Key Principles Encoded

1. **MCP-First Development**: Always verify with MCP tools, don't trust training data
2. **Evidence-Based**: "Evidence or no merge" - document everything
3. **Type Safety**: TypeScript strict mode enforced
4. **Performance**: Caching, lazy loading, parallel fetching
5. **Security**: Secret scanning, input validation, rate limiting

## Usage

Rules are automatically loaded by Cursor based on:
- `alwaysApply: true` - Always active
- `globs: pattern` - Active for matching files
- `description` - Manually loaded when relevant to prompt

## Updates

To update rules:
1. Edit the relevant `.mdc` file
2. Test the changes
3. Commit with evidence
4. Document in feedback file

## Evidence

All rules based on real production code patterns:
- Service layer in app/services/
- Route patterns in app/routes/
- Utility functions in app/utils/
- MCP servers in apps/
- Recent fixes and deployments

Quality: Production-validated ✅
