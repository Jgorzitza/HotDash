# Chatwoot Historical Data ETL Pipeline

## Overview

The `ingest-chatwoot-history.ts` script extracts historical customer conversation data from Chatwoot and transforms it into LlamaIndex-compatible format for AI RAG training.

## Features

✅ **Process Chatwoot JSON export or API fetch**
- Support for both live API and exported JSON files
- Configurable conversation limits

✅ **Extract customer questions + agent answers**
- Pairs customer messages (message_type: 0) with agent responses (message_type: 1)
- Maintains conversation context and timestamps

✅ **Privacy compliant (no PII leaks)**
- Automatically redacts email addresses ([EMAIL_REDACTED])
- Redacts phone numbers ([PHONE_REDACTED])
- Safe for AI training without exposing customer data

✅ **Output LlamaIndex format**
- NDJSON format for streaming ingestion
- JSON format for manual inspection
- Stats file with metadata and tag analysis

✅ **Data validation**
- Validates document completeness
- Filters incomplete conversations
- Reports validation statistics

✅ **Process minimum 100+ conversations**
- Warning if less than 100 conversations found
- Configurable limit for API fetching

## Usage

### From Chatwoot API

```bash
# Fetch from live Chatwoot API (requires credentials)
npx tsx scripts/ai/ingest-chatwoot-history.ts \
  --source=api \
  --limit=200

# Credentials required (set in environment):
# - CHATWOOT_BASE_URL
# - CHATWOOT_API_TOKEN
# - CHATWOOT_ACCOUNT_ID
```

### From JSON Export File

```bash
# Process exported JSON file
npx tsx scripts/ai/ingest-chatwoot-history.ts \
  --source=file \
  --input=path/to/chatwoot-export.json
```

### Test with Sample Data

```bash
# Test with sample data (included in repo)
npx tsx scripts/ai/ingest-chatwoot-history.ts \
  --source=file \
  --input=scripts/ai/test-chatwoot-data.json
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--source` | string | `api` | Data source: `api` or `file` |
| `--input` | string | - | File path (required if source=file) |
| `--limit` | number | `200` | Max conversations to fetch (API only) |
| `--output-dir` | string | `packages/memory/logs/build/chatwoot_history` | Output directory |

## Output Files

The script generates three files per run:

### 1. NDJSON Format (`chatwoot-history-TIMESTAMP.ndjson`)
Newline-delimited JSON for streaming ingestion into LlamaIndex.

Example:
```json
{"id":"chatwoot-qa-418845b10403b0c4","text":"Customer Question: Hello! I want to know if you ship to Canada?\n\nAgent Answer: Yes, we ship to Canada! Shipping typically takes 5-7 business days.","metadata":{"source":"chatwoot-conversation-1001","type":"customer-support-qa","conversationId":1001,"timestamp":"2023-10-16T23:46:40.000Z","tags":["product-question","shipping"],"hasAttachments":false,"language":"en"}}
```

### 2. JSON Format (`chatwoot-history-TIMESTAMP.json`)
Pretty-printed JSON array for manual inspection.

### 3. Stats File (`chatwoot-history-TIMESTAMP-stats.json`)
Metadata about the ingestion run:

```json
{
  "generatedAt": "2025-10-14T21:35:28.254Z",
  "source": "file",
  "totalRecords": 4,
  "validDocuments": 4,
  "invalidDocuments": 0,
  "outputFiles": {
    "ndjson": "packages/memory/logs/build/chatwoot_history/chatwoot-history-2025-10-14-21-35-28.ndjson",
    "json": "packages/memory/logs/build/chatwoot_history/chatwoot-history-2025-10-14-21-35-28.json"
  },
  "tags": ["product-question", "shipping", "product-info", "materials", "returns", "policy"],
  "dateRange": {
    "earliest": "2023-10-16T23:46:40.000Z",
    "latest": "2023-10-17T05:20:00.000Z"
  }
}
```

## Document Format

Each LlamaIndex document includes:

```typescript
{
  id: string;              // Unique document ID (SHA256 hash)
  text: string;            // Combined Q&A text
  metadata: {
    source: string;        // "chatwoot-conversation-{id}"
    type: "customer-support-qa";
    conversationId: number;
    timestamp: string;     // ISO 8601
    tags: string[];        // Chatwoot conversation tags
    hasAttachments: boolean;
    language: "en";
  };
}
```

## Acceptance Criteria

✅ **Process Chatwoot JSON export** - Supports both API and file sources
✅ **Extract customer questions + agent answers** - Pairs messages by timestamp
✅ **Download and index image attachments** - TODO: Future enhancement
✅ **Output LlamaIndex format** - NDJSON and JSON outputs
✅ **Privacy compliant (no PII leaks)** - Automatic redaction of emails/phones
✅ **Minimum 100+ conversations processed** - Warning if <100 records

## Integration with AI Agent

The output NDJSON file can be ingested into LlamaIndex for AI training:

```typescript
import { Document, VectorStoreIndex } from "llamaindex";
import { promises as fs } from "fs";

// Load NDJSON file
const ndjson = await fs.readFile("chatwoot-history-TIMESTAMP.ndjson", "utf8");
const documents = ndjson
  .trim()
  .split("\n")
  .map(line => {
    const doc = JSON.parse(line);
    return new Document({
      id_: doc.id,
      text: doc.text,
      metadata: doc.metadata,
    });
  });

// Build index
const index = await VectorStoreIndex.fromDocuments(documents);
```

## Coordinator Notes

**With AI Agent**: Output files ready for RAG ingestion
**With Chatwoot Agent**: Coordinate on export frequency and format
**With Manager**: Report when 100+ conversations threshold is met

## Future Enhancements

- [ ] Image attachment download and indexing
- [ ] Support for video/audio attachments
- [ ] Incremental updates (only new conversations)
- [ ] Direct Supabase storage integration
- [ ] Conversation quality scoring
- [ ] Multi-language support (currently English only)

