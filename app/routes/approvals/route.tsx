import { useEffect } from 'react';
import { type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useRevalidator } from 'react-router';
import { Page, Layout, Card, EmptyState } from '@shopify/polaris';
import { ApprovalCard } from '../../components/ApprovalCard';

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
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const response = await fetch('http://localhost:8002/approvals');
    
    if (!response.ok) {
      console.error('Failed to fetch approvals:', response.status);
      return { approvals: [], error: 'Failed to load approvals' };
    }
    
    const approvals: Approval[] = await response.json();
    return { approvals, error: null };
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return { approvals: [], error: 'Agent service unavailable' };
  }
}

export default function ApprovalsRoute() {
  const { approvals, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  
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
      <Layout>
        {error && (
          <Layout.Section>
            <Card>
              <div style={{ padding: '16px', color: '#bf0711' }}>
                <strong>Engine Trouble:</strong> {error}
              </div>
            </Card>
          </Layout.Section>
        )}
        
        {approvals.length === 0 ? (
          <Layout.Section>
            <Card>
              <EmptyState
                heading="All systems ready"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>No pending approvals. New items will appear here automatically.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        ) : (
          approvals.map((approval) => (
            <Layout.Section key={approval.id}>
              <ApprovalCard approval={approval} />
            </Layout.Section>
          ))
        )}
      </Layout>
    </Page>
  );
}

