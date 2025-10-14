import { useEffect, useState } from 'react';
import { type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useRevalidator } from 'react-router';

// For returning JSON responses in React Router 7
function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}
import { Page, Layout, Card, EmptyState, Spinner, Banner, Text } from '@shopify/polaris';
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
      return json({ approvals: [], error: 'Failed to load approvals' });
    }
    
    const approvals: Approval[] = await response.json();
    return json({ approvals, error: null });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return json({ approvals: [], error: 'Agent service unavailable' });
  }
}

interface LoaderData {
  approvals: Approval[];
  error: string | null;
}

export default function ApprovalsRoute() {
  const data = useLoaderData() as LoaderData;
  const { approvals, error } = data;
  const revalidator = useRevalidator();
  const isRevalidating = revalidator.state === 'loading';
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [revalidator]);
  
  // Online/offline detection for graceful UX
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <Page
      title="Approval Queue"
      titleMetadata={isRevalidating ? <Spinner size="small" /> : null}
      subtitle={`${approvals.length} pending ${approvals.length === 1 ? 'approval' : 'approvals'}`}
    >
      <Layout>
        {!isOnline && (
          <Layout.Section>
            <Banner
              tone="warning"
              title="Connection Lost"
              action={{ content: 'Retry Connection', onAction: () => revalidator.revalidate() }}
            >
              <Text variant="bodyMd" as="p">
                You are currently offline. Your approvals are safe and will automatically sync when your
                connection is restored.
              </Text>
            </Banner>
          </Layout.Section>
        )}
        {error && (
          <Layout.Section>
            <Card>
              <div style={{ padding: '16px', color: '#bf0711' }}>
                <strong>Error:</strong> {error}
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
          approvals.map((approval: Approval) => (
            <Layout.Section key={approval.id}>
              <ApprovalCard approval={approval} />
            </Layout.Section>
          ))
        )}
      </Layout>
    </Page>
  );
}

