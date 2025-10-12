# MCP Server Deployment Fix - Implementation Guide

**Priority**: HIGH - Critical Path for Launch  
**Estimated Time**: 4 hours  
**Assigned To**: Engineer  
**Coordinated By**: AI Agent

---

## Problem Statement

The deployed MCP server at `hotdash-llamaindex-mcp.fly.dev` fails when executing `query_support` tool with error:
```
Cannot find package 'commander' imported from /app/scripts/ai/llama-workflow/dist/cli.js
```

**Root Cause**: MCP server executes llama-workflow CLI via `execSync`, but llama-workflow dependencies are not included in the deployment.

---

## Solution: Refactor to Direct Function Imports

Instead of executing CLI commands, import and call functions directly. This eliminates dependency issues and improves performance.

### Current Architecture (BROKEN)
```typescript
// handlers/query.ts
const result = execSync(
  `node ${cliPath} query -q "${q.replace(/"/g, '\\"')}" --topK ${topK}`,
  { encoding: 'utf-8', cwd: projectRoot }
);
```

### New Architecture (RECOMMENDED)
```typescript
// handlers/query.ts
import { answerQuery } from '../../../scripts/ai/llama-workflow/src/pipeline/query.js';

const result = await answerQuery(q, topK);
return {
  content: [{
    type: 'text',
    text: JSON.stringify(result, null, 2)
  }]
};
```

---

## Implementation Steps

### Step 1: Update Package Dependencies (15 min)

**File**: `apps/llamaindex-mcp-server/package.json`

Add llama-workflow dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "llamaindex": "^0.12.0",
    "@llamaindex/openai": "^0.1.0",
    "@supabase/supabase-js": "^2.75.0",
    "dotenv": "^17.2.3",
    "uuid": "^13.0.0",
    "zod": "^4.1.12"
  }
}
```

**Action**:
```bash
cd apps/llamaindex-mcp-server
npm install llamaindex @llamaindex/openai @supabase/supabase-js dotenv uuid zod
```

### Step 2: Refactor Query Handler (45 min)

**File**: `apps/llamaindex-mcp-server/src/handlers/query.ts`

**Before**:
```typescript
import { execSync } from 'child_process';
import path from 'path';

export async function queryHandler(args: { q: string; topK?: number }) {
  const { q, topK = 5 } = args;
  const cliPath = path.resolve(__dirname, '../../../../scripts/ai/llama-workflow/dist/cli.js');
  
  try {
    const result = execSync(
      `node ${cliPath} query -q "${q.replace(/"/g, '\\"')}" --topK ${topK}`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    return { content: [{ type: 'text', text: result.trim() }] };
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
}
```

**After**:
```typescript
import { answerQuery } from '../../../../scripts/ai/llama-workflow/src/pipeline/query.js';

export async function queryHandler(args: { q: string; topK?: number }) {
  const { q, topK = 5 } = args;
  
  try {
    const result = await answerQuery(q, topK);
    
    // Format response for MCP
    const response = {
      query: result.query,
      answer: result.response,
      sources: result.sources.map(s => ({
        text: s.text.substring(0, 200) + '...',
        metadata: s.metadata,
        score: s.score
      })),
      metadata: result.metadata
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response, null, 2)
      }]
    };
  } catch (error: any) {
    console.error('[query-handler] Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error querying knowledge base: ${error.message}`
      }],
      isError: true
    };
  }
}
```

### Step 3: Refactor Refresh Handler (45 min)

**File**: `apps/llamaindex-mcp-server/src/handlers/refresh.ts`

**Before**:
```typescript
import { execSync } from 'child_process';

export async function refreshHandler(args: { sources?: string; full?: boolean }) {
  const { sources = 'all', full = true } = args;
  const cliPath = path.resolve(__dirname, '../../../../scripts/ai/llama-workflow/dist/cli.js');
  
  try {
    const result = execSync(
      `node ${cliPath} refresh --sources ${sources} ${full ? '--full' : ''}`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    
    return { content: [{ type: 'text', text: result.trim() }] };
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
}
```

**After**:
```typescript
import { buildAll } from '../../../../scripts/ai/llama-workflow/src/pipeline/buildIndex.js';
import { getConfig } from '../../../../scripts/ai/llama-workflow/src/config.js';

export async function refreshHandler(args: { sources?: string; full?: boolean }) {
  const { sources = 'all', full = true } = args;
  
  try {
    const config = getConfig();
    
    // Build index with specified sources
    const result = await buildAll(config.LOG_DIR, {
      sources: sources as any,
      full
    });
    
    const summary = {
      success: true,
      runDir: result.runDir,
      totalNodes: result.count,
      sources: result.sources,
      duration: `${result.duration}ms`,
      indexPath: result.indexPath
    };
    
    return {
      content: [{
        type: 'text',
        text: `Index refresh completed successfully!\n\n${JSON.stringify(summary, null, 2)}`
      }]
    };
  } catch (error: any) {
    console.error('[refresh-handler] Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error refreshing index: ${error.message}`
      }],
      isError: true
    };
  }
}
```

### Step 4: Refactor Insight Handler (45 min)

**File**: `apps/llamaindex-mcp-server/src/handlers/insight.ts`

**Before**:
```typescript
import { execSync } from 'child_process';

export async function insightHandler(args: { window?: string; format?: string }) {
  const { window = '7d', format = 'md' } = args;
  const cliPath = path.resolve(__dirname, '../../../../scripts/ai/llama-workflow/dist/cli.js');
  
  try {
    const result = execSync(
      `node ${cliPath} insight --window ${window} --format ${format}`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    return { content: [{ type: 'text', text: result.trim() }] };
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
}
```

**After**:
```typescript
import { insightReport } from '../../../../scripts/ai/llama-workflow/src/pipeline/query.js';

export async function insightHandler(args: { window?: string; format?: string }) {
  const { window = '7d', format = 'md' } = args;
  
  try {
    const report = await insightReport(window, format);
    
    return {
      content: [{
        type: 'text',
        text: report
      }]
    };
  } catch (error: any) {
    console.error('[insight-handler] Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error generating insights: ${error.message}`
      }],
      isError: true
    };
  }
}
```

### Step 5: Update TypeScript Configuration (15 min)

**File**: `apps/llamaindex-mcp-server/tsconfig.json`

Ensure module resolution works:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ES2022",
    "target": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 6: Update Environment Configuration (15 min)

**File**: `apps/llamaindex-mcp-server/.env` (or fly.toml secrets)

Ensure all required environment variables are set:
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase (for knowledge base)
SUPABASE_URL=https://...
SUPABASE_KEY=...

# Optional: PostgreSQL
PG_URL=postgresql://...

# Paths
LOG_DIR=/app/data/logs
```

### Step 7: Build and Test Locally (30 min)

```bash
# Build TypeScript
cd apps/llamaindex-mcp-server
npm run build

# Test locally
PORT=8080 npm start

# Test query endpoint
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query_support",
      "arguments": {
        "q": "What PTFE hoses do you sell?",
        "topK": 3
      }
    }
  }'

# Test refresh endpoint
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "refresh_index",
      "arguments": {
        "sources": "web",
        "full": true
      }
    }
  }'
```

### Step 8: Update Dockerfile (30 min)

**File**: `apps/llamaindex-mcp-server/Dockerfile`

Ensure vector index is copied to deployment:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY apps/llamaindex-mcp-server/package*.json ./
RUN npm ci --production

# Copy built application
COPY apps/llamaindex-mcp-server/dist ./dist

# Copy llama-workflow source (needed for imports)
COPY scripts/ai/llama-workflow/src ./scripts/ai/llama-workflow/src
COPY scripts/ai/llama-workflow/package.json ./scripts/ai/llama-workflow/

# Install llama-workflow dependencies
WORKDIR /app/scripts/ai/llama-workflow
RUN npm ci --production

WORKDIR /app

# Copy vector index (if pre-built)
COPY scripts/ai/llama-workflow/packages/memory/logs/build/indexes/latest ./data/indexes/latest

# Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/server.js"]
```

### Step 9: Deploy to Fly.io (30 min)

```bash
# Update fly.toml with environment variables
cd apps/llamaindex-mcp-server

# Build and deploy
fly deploy

# Verify deployment
fly status

# Check logs
fly logs

# Test deployed endpoint
curl -X POST https://hotdash-llamaindex-mcp.fly.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query_support",
      "arguments": {
        "q": "What PTFE hoses do you sell?",
        "topK": 3
      }
    }
  }'
```

---

## Testing Checklist

### Local Testing
- [ ] `npm run build` completes without errors
- [ ] Server starts without errors
- [ ] `/health` endpoint returns 200
- [ ] `/metrics` endpoint returns metrics
- [ ] `query_support` tool returns results
- [ ] `refresh_index` tool builds index
- [ ] `insight_report` tool generates report
- [ ] Error handling works correctly

### Deployment Testing
- [ ] Fly.io deployment succeeds
- [ ] Service passes health checks
- [ ] All environment variables set
- [ ] Query tool works in production
- [ ] Refresh tool works in production
- [ ] Response times < 5 seconds
- [ ] No memory leaks over 1 hour

---

## Rollback Plan

If deployment fails:
1. Revert to previous Fly.io deployment: `fly releases rollback`
2. Check logs: `fly logs`
3. Fix issue locally
4. Redeploy

---

## Success Criteria

✅ **Query Tool**: Returns accurate results in < 3 seconds  
✅ **Refresh Tool**: Successfully rebuilds index  
✅ **Insight Tool**: Generates reports without errors  
✅ **Health Check**: Returns 200 with correct metrics  
✅ **No CLI Dependencies**: No `execSync` calls remaining  
✅ **Production Stable**: Runs for 1 hour without errors

---

## Support

**Primary Contact**: AI Agent  
**Questions**: Document in `/feedback/engineer-helper.md`  
**Blockers**: Escalate to Manager

**Estimated Completion**: 4 hours for experienced engineer

