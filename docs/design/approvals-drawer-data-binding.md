# Approvals Drawer UI ↔ Data RPC Binding Spec

**File:** `docs/design/approvals-drawer-data-binding.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** Connect Approvals Drawer UI spec to Supabase RPC functions

---

## 1. Overview

This document maps the Approvals Drawer UI components (from `docs/specs/approvals_drawer_spec.md`) to the actual Supabase RPC functions and data structures, ensuring seamless data binding for implementation.

---

## 2. Data Flow Architecture

```
┌─────────────────┐
│  Approvals UI   │
│   (Polaris)     │
└────────┬────────┘
         │
         ↓ Loader/Action
┌─────────────────┐
│  Route Handler  │
│ (React Router)  │
└────────┬────────┘
         │
         ↓ RPC Call
┌─────────────────┐
│ Supabase Client │
│  (app/lib/...)  │
└────────┬────────┘
         │
         ↓ SQL Function
┌─────────────────┐
│  Database RPC   │
│   (Postgres)    │
└─────────────────┘
```

---

## 3. RPC Function Mapping

### 3.1 Get Approval Queue

**UI Need:** Load list of pending approvals for `/approvals` route

**RPC Function:** `get_approval_queue(p_limit, p_offset, p_status)`

**Location:** `supabase/migrations/20251015_dashboard_rpc_functions.sql`

**Signature:**
```sql
CREATE OR REPLACE FUNCTION public.get_approval_queue(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_status TEXT DEFAULT 'pending'
)
RETURNS TABLE (
  id BIGINT,
  conversation_id TEXT,
  serialized JSONB,
  last_interruptions JSONB,
  created_at TIMESTAMPTZ,
  approved_by TEXT,
  status TEXT,
  updated_at TIMESTAMPTZ
)
```

**Usage in Route:**
```typescript
// app/routes/approvals.tsx
export async function loader() {
  const client = createSupabaseClient();
  const { data, error } = await client.rpc('get_approval_queue', {
    p_limit: 50,
    p_offset: 0,
    p_status: 'pending'
  });
  
  if (error) throw error;
  return json({ approvals: data });
}
```

**UI Binding:**
```tsx
function ApprovalsRoute() {
  const { approvals } = useLoaderData<typeof loader>();
  
  return (
    <Page title="Approvals Queue">
      {approvals.map(approval => (
        <ApprovalCard key={approval.id} approval={approval} />
      ))}
    </Page>
  );
}
```

### 3.2 Get Approvals List (Filtered)

**UI Need:** Filter approvals by state/kind

**RPC Function:** `get_approvals_list(p_state, p_kind, p_limit)`

**Location:** `supabase/migrations/20251015_additional_rpc_functions.sql`

**Signature:**
```sql
CREATE OR REPLACE FUNCTION public.get_approvals_list(
  p_state TEXT DEFAULT NULL,
  p_kind TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  kind TEXT,
  state TEXT,
  summary TEXT,
  created_by TEXT,
  reviewer TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Usage in Route:**
```typescript
// app/routes/approvals.tsx (with filters)
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const kind = url.searchParams.get('kind');
  
  const client = createSupabaseClient();
  const { data, error } = await client.rpc('get_approvals_list', {
    p_state: state,
    p_kind: kind,
    p_limit: 50
  });
  
  if (error) throw error;
  return json({ approvals: data });
}
```

**UI Binding:**
```tsx
<Select
  label="Filter by state"
  options={[
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Applied', value: 'applied' },
  ]}
  value={state}
  onChange={(value) => navigate(`?state=${value}`)}
/>
```

### 3.3 Get Single Approval (Drawer)

**UI Need:** Load full approval details for drawer

**RPC Function:** Direct table query via Supabase client

**Usage in Route:**
```typescript
// app/routes/approvals.$id.tsx
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const client = createSupabaseClient();
  
  const { data, error } = await client
    .from('approvals')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return json({ approval: data });
}
```

**UI Binding:**
```tsx
function ApprovalDrawer() {
  const { approval } = useLoaderData<typeof loader>();
  
  return (
    <Modal open={true} onClose={handleClose} title={approval.summary}>
      <Modal.Section>
        <EvidenceSection evidence={approval.evidence} />
        <RisksSection risk={approval.risk} rollback={approval.rollback} />
        <ToolCallsSection actions={approval.actions} />
      </Modal.Section>
    </Modal>
  );
}
```

### 3.4 Approve Action

**UI Need:** Approve button in drawer

**RPC Function:** Direct table update + audit log

**Usage in Action:**
```typescript
// app/routes/approvals.$id.approve/route.tsx
export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  const formData = await request.formData();
  const reviewer = formData.get('reviewer');
  const notes = formData.get('notes');
  
  const client = createSupabaseClient();
  
  // Update approval state
  const { error: updateError } = await client
    .from('approvals')
    .update({
      state: 'approved',
      reviewer: reviewer,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (updateError) throw updateError;
  
  // Log audit entry
  await client.rpc('log_audit_entry', {
    p_scope: 'approvals',
    p_actor: reviewer,
    p_action: 'approve',
    p_payload: { approval_id: id, notes }
  });
  
  return redirect('/approvals');
}
```

**UI Binding:**
```tsx
<Form method="post" action={`/approvals/${approval.id}/approve`}>
  <input type="hidden" name="reviewer" value={currentUser} />
  <TextField name="notes" label="Notes (optional)" />
  <Button submit variant="primary">Approve</Button>
</Form>
```

### 3.5 Reject Action

**UI Need:** Reject button in drawer

**Usage in Action:**
```typescript
// app/routes/approvals.$id.reject/route.tsx
export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  const formData = await request.formData();
  const reviewer = formData.get('reviewer');
  const reason = formData.get('reason');
  
  const client = createSupabaseClient();
  
  // Update approval state
  const { error: updateError } = await client
    .from('approvals')
    .update({
      state: 'rejected',
      reviewer: reviewer,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (updateError) throw updateError;
  
  // Log audit entry
  await client.rpc('log_audit_entry', {
    p_scope: 'approvals',
    p_actor: reviewer,
    p_action: 'reject',
    p_payload: { approval_id: id, reason }
  });
  
  return redirect('/approvals');
}
```

### 3.6 Log Audit Entry

**UI Need:** Track all approval actions

**RPC Function:** `log_audit_entry(...)`

**Location:** `supabase/migrations/20251015_dashboard_rpc_functions.sql`

**Signature:**
```sql
CREATE OR REPLACE FUNCTION public.log_audit_entry(
  p_scope TEXT,
  p_actor TEXT,
  p_action TEXT,
  p_rationale TEXT DEFAULT NULL,
  p_evidence_url TEXT DEFAULT NULL,
  p_shop_domain TEXT DEFAULT NULL,
  p_external_ref TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS BIGINT
```

**Usage:**
```typescript
await client.rpc('log_audit_entry', {
  p_scope: 'approvals',
  p_actor: 'github:justin',
  p_action: 'approve',
  p_rationale: 'Looks good',
  p_payload: { approval_id: 123, notes: 'Ship it' }
});
```

---

## 4. Data Structure Mapping

### 4.1 Approvals Table → UI Components

**Database Schema:**
```sql
CREATE TABLE approvals (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT CHECK (kind IN ('cx_reply', 'inventory', 'growth', 'misc')),
  state TEXT CHECK (state IN ('draft', 'pending_review', 'approved', 'applied', 'audited', 'learned')),
  summary TEXT NOT NULL,
  created_by TEXT NOT NULL,
  reviewer TEXT,
  evidence JSONB,
  impact JSONB,
  risk JSONB,
  rollback JSONB,
  actions JSONB,
  receipts JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**UI Component Mapping:**

| Database Field | UI Component | Section |
|----------------|--------------|---------|
| `id` | Hidden field, URL param | - |
| `kind` | Badge (CX Reply, Inventory, Growth) | Header |
| `state` | Status chip (Pending, Approved, etc.) | Header |
| `summary` | Heading text | Header |
| `created_by` | Agent name | Header meta |
| `reviewer` | Reviewer name | Header meta (after approval) |
| `evidence` | Evidence tabs (Diffs, Samples, Queries) | Evidence Section |
| `impact` | Impact forecast cards | Evidence Section |
| `risk` | Risk list | Risks & Rollback Section |
| `rollback` | Rollback steps | Risks & Rollback Section |
| `actions` | Tool calls list | Tool Calls Preview Section |
| `receipts` | Receipt list | Audit Section (after apply) |
| `created_at` | Timestamp | Header meta |
| `updated_at` | Timestamp | Header meta |

### 4.2 Evidence JSONB Structure

**Database:**
```json
{
  "queries": ["SELECT * FROM orders WHERE..."],
  "samples": ["Customer: Where is my order?"],
  "diffs": [
    {
      "path": "email_template.html",
      "before": "...",
      "after": "..."
    }
  ],
  "screenshots": ["https://..."]
}
```

**UI Tabs:**
```tsx
<Tabs
  tabs={[
    { id: 'diffs', content: 'Diffs', badge: evidence.diffs?.length },
    { id: 'samples', content: 'Samples', badge: evidence.samples?.length },
    { id: 'queries', content: 'Queries', badge: evidence.queries?.length },
    { id: 'screenshots', content: 'Screenshots', badge: evidence.screenshots?.length },
  ]}
  selected={selectedTab}
  onSelect={setSelectedTab}
>
  {selectedTab === 'diffs' && <DiffsView diffs={evidence.diffs} />}
  {selectedTab === 'samples' && <SamplesView samples={evidence.samples} />}
  {selectedTab === 'queries' && <QueriesView queries={evidence.queries} />}
  {selectedTab === 'screenshots' && <ScreenshotsView urls={evidence.screenshots} />}
</Tabs>
```

### 4.3 Actions JSONB Structure

**Database:**
```json
[
  {
    "tool": "chatwoot.reply.fromNote",
    "args": {
      "conversationId": "123",
      "noteId": "456"
    }
  }
]
```

**UI List:**
```tsx
<ResourceList
  items={approval.actions}
  renderItem={(action) => (
    <ResourceItem>
      <InlineStack align="space-between">
        <Text variant="bodyMd">{action.tool}</Text>
        <Badge tone="info">Validated</Badge>
      </InlineStack>
      <details>
        <summary>Arguments</summary>
        <Code>{JSON.stringify(action.args, null, 2)}</Code>
      </details>
    </ResourceItem>
  )}
/>
```

---

## 5. Real-time Updates (Future)

### 5.1 Supabase Realtime Subscription

**UI Need:** Auto-refresh when new approvals arrive

**Implementation:**
```typescript
useEffect(() => {
  const client = createSupabaseClient();
  
  const subscription = client
    .channel('approvals-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'approvals',
        filter: 'state=eq.pending_review'
      },
      (payload) => {
        console.log('Approval changed:', payload);
        revalidator.revalidate();
      }
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## 6. Error Handling

### 6.1 RPC Error Responses

**Network Error:**
```typescript
try {
  const { data, error } = await client.rpc('get_approval_queue');
  if (error) throw error;
} catch (error) {
  return json(
    { error: 'Unable to load approvals. Check your connection.' },
    { status: 500 }
  );
}
```

**UI Display:**
```tsx
{error && (
  <Banner tone="critical">
    <p>{error}</p>
  </Banner>
)}
```

### 6.2 Validation Errors

**RPC Validation:**
```sql
IF p_status NOT IN ('pending', 'approved', 'rejected', 'expired') THEN
  RAISE EXCEPTION 'Invalid status: %. Must be one of: pending, approved, rejected, expired', p_status;
END IF;
```

**UI Handling:**
```typescript
try {
  await client.rpc('get_approval_queue', { p_status: invalidStatus });
} catch (error) {
  // Display validation error
  setError(error.message);
}
```

---

## 7. Performance Optimization

### 7.1 Pagination

**RPC Support:**
```typescript
const { data } = await client.rpc('get_approval_queue', {
  p_limit: 20,
  p_offset: page * 20,
  p_status: 'pending'
});
```

**UI Pagination:**
```tsx
<Pagination
  hasPrevious={page > 0}
  hasNext={approvals.length === 20}
  onPrevious={() => setPage(page - 1)}
  onNext={() => setPage(page + 1)}
/>
```

### 7.2 Caching

**React Router Loader Caching:**
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const cacheKey = `approvals-${url.searchParams.toString()}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30000) {
    return json(cached.data);
  }
  
  // Fetch fresh data
  const data = await fetchApprovals();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return json(data);
}
```

---

## 8. Testing Data Binding

### 8.1 Unit Tests

**Test RPC Function:**
```typescript
describe('get_approval_queue', () => {
  it('returns pending approvals', async () => {
    const { data } = await client.rpc('get_approval_queue', {
      p_status: 'pending'
    });
    
    expect(data).toBeInstanceOf(Array);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('status', 'pending');
  });
});
```

### 8.2 Integration Tests

**Test Full Flow:**
```typescript
describe('Approval workflow', () => {
  it('approves an approval', async () => {
    // Create approval
    const { data: approval } = await client
      .from('approvals')
      .insert({ kind: 'cx_reply', summary: 'Test', created_by: 'test' })
      .select()
      .single();
    
    // Approve
    await client
      .from('approvals')
      .update({ state: 'approved', reviewer: 'test' })
      .eq('id', approval.id);
    
    // Verify
    const { data: updated } = await client
      .from('approvals')
      .select()
      .eq('id', approval.id)
      .single();
    
    expect(updated.state).toBe('approved');
  });
});
```

---

## 9. Implementation Checklist

### 9.1 Route Setup
- [ ] Create `/approvals` route with loader using `get_approval_queue`
- [ ] Create `/approvals/$id` route with loader for single approval
- [ ] Create `/approvals/$id/approve` action route
- [ ] Create `/approvals/$id/reject` action route
- [ ] Add error boundaries for RPC failures

### 9.2 UI Components
- [ ] ApprovalCard component with data binding
- [ ] ApprovalDrawer component with all sections
- [ ] EvidenceSection with tabs bound to JSONB
- [ ] RisksSection with editable fields
- [ ] ToolCallsSection with action list
- [ ] AuditSection with receipts display

### 9.3 Data Flow
- [ ] Loader fetches approvals via RPC
- [ ] Action updates approval state
- [ ] Audit log entries created
- [ ] Revalidation triggers on state change
- [ ] Error handling for all RPC calls

---

## 10. References

- **UI Spec:** `docs/specs/approvals_drawer_spec.md`
- **RPC Functions:** `supabase/migrations/20251015_dashboard_rpc_functions.sql`
- **Additional RPCs:** `supabase/migrations/20251015_additional_rpc_functions.sql`
- **Schema:** `supabase/migrations/20251015_approvals_workflow.sql`
- **Supabase Client:** `app/lib/supabase/client.ts`
- **API Contracts:** `docs/api-contracts/README.md`

