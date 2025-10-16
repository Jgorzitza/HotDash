# RAG Build Fallback Workflow

**Version:** 1.0  
**Date:** 2025-10-16  
**Owner:** support  
**Status:** Active

---

## Overview

This document defines the fallback workflow for RAG index building when embeddings configuration is unavailable or unsafe. The workflow ensures that existing indexes are never deleted unless embeddings are properly validated.

## Safety Principles

1. **Never delete existing index** unless embeddings configuration is validated
2. **Fail safe** - prefer MCP server fallback over risky local builds
3. **Dry-run first** - validate documents before attempting build
4. **CI-safe** - no-write mode for validation without persistence

## Workflow Decision Tree

```
Start
  │
  ├─ Has OPENAI_API_KEY?
  │   ├─ YES → Validate embeddings config
  │   │         ├─ Valid → Build local index
  │   │         └─ Invalid → Use MCP fallback
  │   └─ NO → Use MCP fallback
  │
  └─ MCP Fallback
      └─ Use hotdash-llamaindex-mcp.fly.dev
```

## Build Modes

### 1. Normal Build (Production)

**When to use:** OpenAI API key available and validated

**Command:**
```bash
npx tsx scripts/rag/build-index.ts
```

**Behavior:**
- Validates OpenAI API key
- Loads documents from `data/support/`
- Builds LlamaIndex vector store
- Persists to `packages/memory/indexes/operator_knowledge/`
- Writes metadata file

**Safety:** Only cleans existing index if embeddings are validated

### 2. Dry Run Mode

**When to use:** Validate documents without building index

**Command:**
```bash
npx tsx scripts/rag/build-index.ts --dry-run
```

**Behavior:**
- Loads documents from source directory
- Prints document statistics
- Does NOT build or persist index
- Safe to run anytime

**Output:**
```
📊 Dry Run - Document Statistics:
  Total Documents: 6
  Total Characters: 53,050
  Avg Document Size: 8,842 chars
  Duration: 45ms

✅ Dry run complete - no index built
```

### 3. No-Write Mode (CI)

**When to use:** CI/CD validation without persistence

**Command:**
```bash
npx tsx scripts/rag/build-index.ts --no-write
```

**Behavior:**
- Validates OpenAI API key
- Loads documents
- Builds index in memory
- Does NOT persist to disk
- Validates build process

**Use case:** CI checks to ensure build process works

### 4. MCP Fallback Mode

**When to use:** No OpenAI API key or embeddings config unavailable

**Command:**
```bash
npx tsx scripts/rag/build-index.ts --use-mcp-fallback
```

**Behavior:**
- Loads documents (validates they exist)
- Recommends using MCP server
- Does NOT build local index
- Returns MCP server URL

**Output:**
```
🔄 MCP Fallback Mode
  Recommendation: Use existing LlamaIndex MCP server
  Server: hotdash-llamaindex-mcp.fly.dev
  Documents ready for MCP ingestion: 6

✅ Use MCP server for queries instead of local index
```

## MCP Server Fallback

### When to Use MCP Server

- ✅ No OpenAI API key available
- ✅ Embeddings configuration invalid
- ✅ Local build fails
- ✅ CI/CD environment
- ✅ Development environment

### MCP Server Details

**URL:** `hotdash-llamaindex-mcp.fly.dev`  
**Status:** Operational  
**Purpose:** Centralized RAG query service

### Using MCP Server

Instead of building local index, query the MCP server:

```typescript
// Query MCP server
const response = await fetch('https://hotdash-llamaindex-mcp.fly.dev/mcp/tools/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'query_support',
    arguments: {
      q: 'How do I process a return?',
      topK: 5,
    },
  }),
});

const result = await response.json();
console.log(result.content[0].text);
```

## CLI Flags Reference

| Flag | Description | Safe? | Use Case |
|------|-------------|-------|----------|
| `--dry-run` | Print stats only | ✅ Yes | Validate documents |
| `--no-write` | Build but don't persist | ✅ Yes | CI validation |
| `--use-mcp-fallback` | Use MCP server | ✅ Yes | No API key |
| `--force-mock` | Mock embeddings | ⚠️ No | Not recommended |
| `--skip-test` | Skip testing | ✅ Yes | Fast builds |
| `--source-dir <path>` | Custom source | ✅ Yes | Custom KB location |
| `--output-dir <path>` | Custom output | ⚠️ Careful | Custom index location |

## Directory Arguments

### Source Directory

**Flag:** `--source-dir <path>`  
**Default:** `data/support`  
**Purpose:** Location of KB markdown files

**Example:**
```bash
npx tsx scripts/rag/build-index.ts --source-dir ./custom-kb
```

### Output Directory

**Flag:** `--output-dir <path>`  
**Default:** `packages/memory/indexes/operator_knowledge`  
**Purpose:** Location to persist index

**Example:**
```bash
npx tsx scripts/rag/build-index.ts --output-dir ./custom-index
```

## Safety Guards

### 1. Never Delete Existing Index

**Implementation:**
```typescript
async function ensureCleanDir(dirPath: string, safeToDelete: boolean = false): Promise<void> {
  if (!safeToDelete) {
    console.warn('⚠️  Skipping directory cleanup - embeddings not validated');
    await fs.mkdir(dirPath, { recursive: true });
    return;
  }
  // Only delete if safe
  await fs.rm(dirPath, { recursive: true, force: true });
  await fs.mkdir(dirPath, { recursive: true });
}
```

**Trigger:** `safeToDelete` only true when embeddings are validated

### 2. API Key Validation

**Check:**
```typescript
const apiKey = await loadOpenAIKey();
if (!apiKey && !forceMock) {
  console.log('⚠️  No OpenAI API key found');
  console.log('  Recommendation: Use --use-mcp-fallback');
  throw new Error('No embeddings configuration available');
}
```

### 3. MCP Fallback Recommendation

**Automatic:** If no API key, recommend MCP fallback instead of failing

## Error Handling

### No API Key

**Error:**
```
No embeddings configuration available. Use --use-mcp-fallback or provide OPENAI_API_KEY
```

**Solution:**
```bash
npx tsx scripts/rag/build-index.ts --use-mcp-fallback
```

### No Documents Found

**Error:**
```
No documents found in sources directory
```

**Solution:**
- Check `data/support/` has markdown files
- Use `--source-dir` to specify correct location

### Embeddings Config Invalid

**Error:**
```
OpenAI API key required. Use --use-mcp-fallback instead
```

**Solution:**
```bash
npx tsx scripts/rag/build-index.ts --use-mcp-fallback
```

## Recommended Workflows

### Development

```bash
# 1. Validate documents
npx tsx scripts/rag/build-index.ts --dry-run

# 2. Use MCP server for queries
npx tsx scripts/rag/build-index.ts --use-mcp-fallback
```

### CI/CD

```bash
# Validate build process without persistence
npx tsx scripts/rag/build-index.ts --no-write
```

### Production

```bash
# Build with validated embeddings
npx tsx scripts/rag/build-index.ts
```

## Rollback Plan

If build fails or corrupts index:

1. **Stop the build** - Ctrl+C
2. **Check existing index** - `ls -la packages/memory/indexes/operator_knowledge/`
3. **Use MCP fallback** - `--use-mcp-fallback`
4. **Restore from backup** - If index was backed up
5. **Rebuild** - Once embeddings config is fixed

## Monitoring

### Success Metrics

- ✅ Build completes without errors
- ✅ Index metadata file created
- ✅ Test queries return results
- ✅ No existing index deleted

### Failure Indicators

- ❌ Build throws error
- ❌ No metadata file
- ❌ Existing index deleted
- ❌ Test queries fail

## Next Steps

1. **Resolve embeddings config** - Install required packages
2. **Test MCP server** - Validate queries work
3. **Document MCP usage** - Update integration docs
4. **Monitor adoption** - Track MCP vs local usage

---

**References:**
- Build script: `scripts/rag/build-index.ts`
- MCP server: `hotdash-llamaindex-mcp.fly.dev`
- KB content: `data/support/`

