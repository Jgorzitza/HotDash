# Pull Request

## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance testing completed (if applicable)

## Growth Engine Compliance

### MCP Evidence (required for code changes)
<!-- 
REQUIRED: List MCP evidence files OR state "No MCP usage - non-code change"
Format: - artifacts/<agent>/<date>/mcp/<topic>.jsonl
Example:
- artifacts/support/2025-10-22/mcp/shopify-dev.jsonl
- artifacts/support/2025-10-22/mcp/context7.jsonl
OR
- No MCP usage - non-code change
-->
- [ ] MCP evidence files listed above
- [ ] OR "No MCP usage - non-code change" stated

### Heartbeat (if task >2 hours)
<!-- 
REQUIRED: List heartbeat files OR state "Task completed in single session"
Format: - artifacts/<agent>/<date>/heartbeat.ndjson
Example:
- artifacts/support/2025-10-22/heartbeat.ndjson
OR
- Task completed in single session (<2 hours, no heartbeat required)
-->
- [ ] Heartbeat files present: `artifacts/<agent>/<date>/heartbeat.ndjson`
- [ ] OR task completed in single session (<2 hours, no heartbeat required)

### Dev MCP Check (CRITICAL - Production Safety)
<!-- 
REQUIRED: Verify no Dev MCP imports in production code
Must include verification statement
-->
- [ ] No Dev MCP imports in runtime bundles (prod code only)
- [ ] Verified: No `mcp.*dev` or `dev.*mcp` imports in app/ (searched with grep)

## Code Quality
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] No console.log statements in production code
- [ ] Error handling implemented appropriately

## Security
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization checks in place
- [ ] No hardcoded secrets or credentials

## Performance
- [ ] No performance regressions introduced
- [ ] Database queries optimized (if applicable)
- [ ] Large files handled appropriately
- [ ] Memory usage considered

## Documentation
- [ ] README updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] Code comments added for complex logic
- [ ] Changelog updated (if applicable)

## Deployment
- [ ] Environment variables documented
- [ ] Database migrations included (if applicable)
- [ ] Backward compatibility maintained
- [ ] Rollback plan documented (if applicable)

## Checklist
- [ ] All CI checks pass
- [ ] Code review completed
- [ ] Tests pass locally
- [ ] No merge conflicts
- [ ] Branch is up to date with main
- [ ] Commit messages follow conventional format

## Additional Notes
<!-- Any additional information, context, or notes for reviewers -->

## Screenshots (if applicable)
<!-- Add screenshots to help explain your changes -->

## Related Issues
<!-- Link to related issues using "Fixes #123" or "Closes #123" -->