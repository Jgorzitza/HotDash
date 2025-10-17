# Context7 MCP Quick Reference

## What is Context7?

Semantic search MCP for the HotDash codebase. Ask natural language questions, get relevant code and docs.

## Quick Query Templates

### Finding Code

```
"component that handles [feature]"
"service client for [integration]"
"utility function for [task]"
"React hook for [functionality]"
```

### Understanding Architecture

```
"how does [feature] work?"
"pattern for [implementation]"
"database schema for [entity]"
"data flow for [process]"
```

### Finding Documentation

```
"[topic] runbook"
"deployment guide for [environment]"
"integration readiness for [service]"
"direction docs for [role]"
```

### Configuration & Scripts

```
"environment setup for [environment]"
"script to [action]"
"configuration for [service]"
```

## Project-Specific Terms

Use these terms for better results:

- **Dashboard Tiles**: Individual dashboard widgets (Sales Pulse, Inventory, Ops Pulse, etc.)
- **Operator Control Center (OCC)**: The overall HotDash system
- **Nightly Metrics**: Scheduled aggregation jobs
- **Service Clients**: Integration wrappers (Shopify, Chatwoot, GA)
- **Dashboard Facts**: Metrics data stored in database
- **React Router Data Routes**: Loader/action pattern for data fetching
- **Supabase Edge Functions**: Serverless functions for observability

## Indexed Locations

✅ **Indexed:**

- `app/` - All application code
- `docs/` - All documentation
- `scripts/` - Operational scripts
- `tests/` - Test suites
- `prisma/` - Database schema
- `supabase/` - Supabase config & functions
- Root config files

❌ **Excluded:**

- `node_modules/`
- `build/`, `.react-router/`
- `test-results/`, `coverage/`
- `.env*` files
- `vault/`
- Binary files

## Common Search Patterns

### Before Creating New Code

```
"existing implementation of [feature]"
"similar components to [reference]"
"pattern used for [functionality]"
```

### When Debugging

```
"error handling in [module]"
"logging setup for [service]"
"test coverage for [feature]"
```

### For Deployment

```
"deployment checklist"
"environment configuration for staging"
"secret rotation procedure"
```

### Understanding Data Flow

```
"metrics calculation for [metric]"
"data aggregation in [service]"
"database queries for [feature]"
```

## Tips

1. **Start broad, narrow down**: "dashboard tiles" → "Sales Pulse tile" → "Sales Pulse API integration"
2. **Use domain language**: Project terms work better than generic ones
3. **Search both code & docs**: Implementation + documentation = full picture
4. **Check related files**: Context7 understands file relationships
5. **Ask "how" questions**: "how does nightly metrics work?" gets implementation details

## Integration Notes

- **Works alongside** `shopify-dev-mcp` (Shopify API docs)
- **Use context7** for HotDash-specific code
- **Use shopify-dev-mcp** for Shopify API questions

## Need More Details?

See `docs/context7-mcp-guide.md` for complete documentation.
