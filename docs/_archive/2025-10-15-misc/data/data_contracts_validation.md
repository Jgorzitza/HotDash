---
epoch: 2025.10.E1
doc: docs/data/data_contracts_validation.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Data Contracts Validation - Shopify/Chatwoot/GA

## Overview

Validation of external data contracts to ensure schema compatibility and detect drift for operator control center integrations.

**North Star Alignment:** Validates data feeds for CX, sales, SEO/content tiles in Shopify Admin embedded control center.

---

## Shopify Admin API Contract

### Expected Schema: Orders

**Endpoint:** `POST /admin/api/2024-10/graphql`

**Query:**

```graphql
query GetRecentOrders {
  orders(first: 100, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        id
        name
        createdAt
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 10) {
          edges {
            node {
              sku
              quantity
              title
            }
          }
        }
      }
    }
  }
}
```

**Expected Response Shape:**

```typescript
interface ShopifyOrder {
  id: string;
  name: string; // Order number
  createdAt: string; // ISO timestamp
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  lineItems: {
    edges: Array<{
      node: {
        sku: string;
        quantity: number;
        title: string;
      };
    }>;
  };
}
```

**Validation Query:**

```sql
-- Test Shopify order data contract
SELECT
  'Shopify Orders Contract' as contract_name,
  CASE
    WHEN value ? 'id' AND value ? 'totalPriceSet' THEN 'valid'
    ELSE 'schema_drift'
  END as status,
  value as sample_record
FROM facts
WHERE topic = 'shopify.sales' AND key = 'order'
LIMIT 1;
```

### Expected Schema: Inventory Levels

**Endpoint:** `inventoryLevels` query

**Expected Fields:**

- `id`: Inventory level ID
- `available`: Stock quantity
- `location.name`: Warehouse location
- `item.sku`: Product SKU

**Validation:**

```sql
-- Verify inventory schema
SELECT
  CASE
    WHEN value ? 'available' AND value ? 'sku' THEN 'valid'
    ELSE 'missing_required_fields'
  END as validation_status,
  jsonb_object_keys(value) as actual_fields
FROM facts
WHERE topic = 'shopify.inventory'
LIMIT 1;
```

---

## Chatwoot API Contract

### Expected Schema: Conversations

**Endpoint:** `GET /api/v1/accounts/{account_id}/conversations`

**Expected Response:**

```typescript
interface ChatwootConversation {
  id: number;
  inbox_id: number;
  status: "open" | "resolved" | "pending";
  created_at: number; // Unix timestamp
  messages: Array<{
    id: number;
    content: string;
    message_type: 0 | 1; // 0 = incoming, 1 = outgoing
    created_at: number;
    sender: {
      id: number;
      name: string;
      type: "agent_bot" | "user" | "contact";
    };
  }>;
}
```

**Validation Query:**

```sql
-- Test Chatwoot conversation contract
SELECT
  'Chatwoot Conversations' as contract_name,
  CASE
    WHEN value ? 'id' AND value ? 'status' AND value ? 'messages' THEN 'valid'
    WHEN NOT (value ? 'messages') THEN 'missing_messages_array'
    ELSE 'schema_drift'
  END as status,
  jsonb_object_keys(value) as actual_keys
FROM support_curated_replies
LIMIT 1;
```

### Expected Schema: Curated Replies

**Table:** `support_curated_replies`

**Required Fields:**

- `message_body` (TEXT NOT NULL)
- `tags` (TEXT[] NOT NULL)
- `approver` (TEXT NOT NULL)
- `approved_at` (TIMESTAMPTZ NOT NULL)

**Validation:**

```sql
-- Verify curated replies schema
SELECT
  'Required Fields' as check_type,
  COUNT(*) FILTER (WHERE message_body IS NULL) as message_body_nulls,
  COUNT(*) FILTER (WHERE tags IS NULL) as tags_nulls,
  COUNT(*) FILTER (WHERE approver IS NULL) as approver_nulls,
  CASE
    WHEN COUNT(*) FILTER (WHERE message_body IS NULL OR tags IS NULL OR approver IS NULL) = 0
    THEN 'contract_valid'
    ELSE 'contract_violation'
  END as status
FROM support_curated_replies;
```

---

## Google Analytics Contract (Mock/MCP)

### Expected Schema: Landing Page Sessions

**Endpoint:** GA Data API `runReport` (when MCP available)

**Expected Response:**

```typescript
interface GALandingPageSession {
  dimensionValues: [
    { value: string }, // landing page path
  ];
  metricValues: [
    { value: string }, // session count
  ];
}
```

**Mock Data Contract:**

```typescript
// app/services/ga/mockClient.ts
export interface GaSession {
  landingPage: string;
  sessions: number;
  wowDelta: number; // Week-over-week %
  evidenceUrl?: string;
}
```

**Validation:**

```sql
-- Test GA session data contract
SELECT
  'GA Sessions Contract' as contract_name,
  CASE
    WHEN value ? 'landing_page' AND value ? 'sessions' AND value ? 'wow_delta' THEN 'valid'
    ELSE 'schema_drift'
  END as status,
  value as sample
FROM facts
WHERE topic = 'ga.sessions' AND key = 'landing_page'
LIMIT 1;
```

---

## Contract Drift Detection

### Automated Validation Function

```sql
CREATE OR REPLACE FUNCTION validate_data_contracts()
RETURNS TABLE(
  contract_name TEXT,
  status TEXT,
  missing_fields TEXT[],
  unexpected_fields TEXT[],
  last_checked_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Validate Shopify orders contract
  RETURN QUERY
  SELECT
    'shopify.orders'::TEXT,
    CASE
      WHEN COUNT(*) FILTER (WHERE NOT (value ? 'id' AND value ? 'totalPriceSet')) > 0
      THEN 'drift_detected'
      ELSE 'valid'
    END,
    ARRAY(SELECT jsonb_object_keys('{"id":1,"totalPriceSet":1}'::jsonb)
          EXCEPT
          SELECT jsonb_object_keys(value) FROM facts WHERE topic='shopify.sales' LIMIT 1),
    ARRAY[]::TEXT[],
    NOW()
  FROM facts
  WHERE topic = 'shopify.sales' AND key = 'order';

  -- Add more contract validations...
END;
$$ LANGUAGE plpgsql;
```

### Daily Drift Report

```sql
CREATE OR REPLACE VIEW v_contract_drift_report AS
SELECT * FROM validate_data_contracts();

-- Schedule daily check
SELECT cron.schedule(
  'contract_drift_check',
  '0 6 * * *', -- Daily at 06:00 UTC
  $$
    INSERT INTO observability_logs (level, message, metadata)
    SELECT
      CASE WHEN status = 'valid' THEN 'INFO' ELSE 'ERROR' END,
      'Data contract validation: ' || contract_name,
      jsonb_build_object(
        'status', status,
        'missing_fields', missing_fields,
        'unexpected_fields', unexpected_fields
      )
    FROM validate_data_contracts()
    WHERE status != 'valid';
  $$
);
```

---

## Drift Response Procedures

### If Shopify Schema Changes:

1. **Detection:** Automated validation finds drift
2. **Alert:** Log to observability_logs with ERROR level
3. **Investigation:** Check Shopify API changelog
4. **Update:** Modify GraphQL queries and TypeScript types
5. **Test:** Verify with latest API version
6. **Document:** Update data contracts and feedback/data.md
7. **Timeline:** Respond within 24 hours per direction

### If Chatwoot Schema Changes:

1. **Detection:** Curated replies validation fails
2. **Coordinate:** Tag @support in feedback
3. **Migration:** Create Supabase migration if table changes needed
4. **Test:** Validate webhook payload still works
5. **Document:** Update support_curated_replies schema docs

### If GA Contract Changes:

1. **Detection:** Mock vs real MCP mismatch
2. **Update:** Modify mockClient.ts to match MCP
3. **Test:** Ensure tiles still render correctly
4. **Swap:** When MCP credentials available, swap mock → real
5. **Monitor:** Track rate limits and caching effectiveness

---

## Testing

### Contract Validation Test Script

```bash
#!/bin/bash
# Test all data contracts

psql $DATABASE_URL << 'EOF'
-- Run contract validation
SELECT
  contract_name,
  status,
  CASE
    WHEN status = 'valid' THEN '✅'
    ELSE '❌'
  END as check,
  missing_fields,
  unexpected_fields
FROM validate_data_contracts();
EOF
```

### Expected Output:

```
contract_name      | status | check | missing_fields | unexpected_fields
-------------------+--------+-------+----------------+-------------------
shopify.orders     | valid  | ✅    | {}             | {}
chatwoot.replies   | valid  | ✅    | {}             | {}
ga.sessions        | valid  | ✅    | {}             | {}
```

---

**Status:** Data contracts specified and validation framework designed  
**Next:** Implement validation functions and schedule daily checks  
**North Star Alignment:** ✅ CRITICAL - Ensures operator tiles have reliable data
