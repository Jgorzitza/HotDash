import { useEffect, useMemo, useRef, useState } from 'react';

import { useLoaderData, useRevalidator, useSearchParams } from 'react-router';
import { Page, Layout, Card, EmptyState, InlineStack, Badge, Button } from '@shopify/polaris';
import { ApprovalCard } from '../../components/ApprovalCard';
import { ApprovalsDrawer } from '../../components/approvals/ApprovalsDrawer';

interface Approval {
  id: string;
  conversationId: number;
  createdAt: string;
  pending: {
    agent: string;
    tool: string;
    args: Record<string, any>;
  }[];
}

// Loader: Fetch approvals from agent service
export async function loader({ request }: any) {
  try {
    const response = await fetch('http://localhost:8002/approvals');

    if (!response.ok) {
      console.error('Failed to fetch approvals:', response.status);
      return Response.json({ approvals: [], error: 'Failed to load approvals' });
    }

    const approvals: Approval[] = await response.json();
    return Response.json({ approvals, error: null });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return Response.json({ approvals: [], error: 'Agent service unavailable' });
  }

}

export default function ApprovalsRoute() {
  const { approvals, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<any | null>(null);
  const [suppressedIds, setSuppressedIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const retryRef = useRef<null | (() => Promise<void>)>(null);

  const stateFilter = searchParams.get('state') || undefined;
  const kindFilter = searchParams.get('kind') || undefined;
  const page = Number(searchParams.get('page') || '1');
  const pageSize = 10;

  const filtered = useMemo(() => {
    let list = approvals as Approval[];
    if (stateFilter) {
      list = list.filter(() => true); // placeholder until backend filters
    }
    if (kindFilter) {
      list = list.filter(() => true); // placeholder until backend filters
    }
    return list;
  }, [approvals, stateFilter, kindFilter]);

  const visible = useMemo(
    () => filtered.filter((a) => !suppressedIds.has(a.id)),
    [filtered, suppressedIds]
  );
  const total = visible.length;
  const start = (page - 1) * pageSize;
  const pageItems = visible.slice(start, start + pageSize);

  function openDetails(a: Approval) {
    setSelected({
      id: a.id,
      conversationId: a.conversationId,
      createdAt: a.createdAt,
      agent: a.pending[0]?.agent,
      tool: a.pending[0]?.tool,
      args: a.pending[0]?.args,
      evidence: { summary: 'Auto-generated summary based on pending tool call.' },
      projectedImpact: 'N/A',
      risks: [],
      rollback: { steps: [] },
    });
  }

  async function handleApprove() {
    if (!selected) return;
    const id = selected.id;
    // optimistic hide
    setSuppressedIds((prev) => new Set(prev).add(id));
    setSelected(null);
    try {
      const res = await fetch(`/approvals/${id}/0/approve`, { method: 'POST' });
      if (!res.ok) throw new Error(String(res.status));
      setActionError(null);
    } catch (e) {
      // undo optimistic hide
      setSuppressedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setActionError('Failed to approve. Please retry.');
      retryRef.current = async () => {
        try {
          const res = await fetch(`/approvals/${id}/0/approve`, { method: 'POST' });
          if (!res.ok) throw new Error(String(res.status));
          setSuppressedIds((prev) => new Set(prev).add(id));
          setActionError(null);
        } finally {
          revalidator.revalidate();
        }
      };
    } finally {
      revalidator.revalidate();
    }
  }

  async function handleReject(reason: string) {
    if (!selected) return;
    const id = selected.id;
    // optimistic hide
    setSuppressedIds((prev) => new Set(prev).add(id));
    setSelected(null);
    try {
      const res = await fetch(`/approvals/${id}/0/reject`, { method: 'POST' });
      if (!res.ok) throw new Error(String(res.status));
      setActionError(null);
    } catch (e) {
      // undo optimistic hide
      setSuppressedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setActionError('Failed to reject. Please retry.');
      retryRef.current = async () => {
        try {
          const res = await fetch(`/approvals/${id}/0/reject`, { method: 'POST' });
          if (!res.ok) throw new Error(String(res.status));
          setSuppressedIds((prev) => new Set(prev).add(id));
          setActionError(null);
        } finally {
          revalidator.revalidate();
        }
      };
    } finally {
      revalidator.revalidate();
    }
  }

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [revalidator]);

  return (
    <Page
      title="Approval Queue"
      subtitle={`${approvals.length} pending ${approvals.length === 1 ? 'approval' : 'approvals'}`}
    >
        {/* Active filters */}
        {(stateFilter || kindFilter) && (
          <Layout.Section>
            <InlineStack gap="200">
              {stateFilter && <Badge>state: {stateFilter}</Badge>}
              {kindFilter && <Badge>kind: {kindFilter}</Badge>}
              <Button onClick={() => setSearchParams((prev) => { const p = new URLSearchParams(prev); p.delete('state'); p.delete('kind'); p.set('page', '1'); return p; })}>Clear filters</Button>
            </InlineStack>
          </Layout.Section>
        )}

      <Layout>
        {(error || actionError) && (
          <Layout.Section>
            <Card>
              <div style={{ padding: '16px', color: '#bf0711', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                <div>
                  <strong>Error:</strong> {actionError ?? error}
                </div>
                {actionError && (
                  <InlineStack gap="200">
                    <Button onClick={() => retryRef.current?.()}>Retry</Button>
                    <Button onClick={() => setActionError(null)}>Dismiss</Button>
                  </InlineStack>
                )}
              </div>
            </Card>
          </Layout.Section>
        )}

        {approvals.length === 0 ? (
          <Layout.Section>
            <Card>
              <EmptyState

                heading="All clear!"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>No pending approvals. Check back later.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        ) : (
          pageItems.map((approval) => (
            <Layout.Section key={approval.id}>
              <ApprovalCard approval={approval} onDetails={() => openDetails(approval)} />
            </Layout.Section>
          ))
        )}

        {/* Pagination controls */}
        <Layout.Section>
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Badge>Total: {total}</Badge>
            <InlineStack gap="200">
              <Button
                disabled={page <= 1}
                onClick={() => setSearchParams((prev) => { const p = new URLSearchParams(prev); p.set('page', String(Math.max(1, page - 1))); return p; })}
              >
                Prev
              </Button>
              <Button
                disabled={start + pageSize >= total}
                onClick={() => setSearchParams((prev) => { const p = new URLSearchParams(prev); p.set('page', String(page + 1)); return p; })}
              >
                Next
              </Button>
            </InlineStack>
          </InlineStack>
        </Layout.Section>

        {/* Drawer */}
        {selected && (
          <ApprovalsDrawer
            open={true}
            approval={selected}
            onClose={() => setSelected(null)}
            onApprove={() => handleApprove()}
            onReject={(reason) => handleReject(reason)}
          />
        )}
      </Layout>
    </Page>
  );
}

