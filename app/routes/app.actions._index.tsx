/**
 * Actions Dashboard Route
 * 
 * Displays pending actions for operator approval
 * Shows top 10 actions prioritized by urgency and timestamp
 */

import { type LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useRevalidator } from 'react-router';
import { useEffect } from 'react';
import { Page, Layout, Banner, Text } from '@shopify/polaris';
import { ActionDock } from '~/components/actions/ActionDock';

// Helper function for JSON responses
function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

/**
 * Load pending actions
 * Returns top 10 pending actions sorted by priority and time
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Fetch pending actions from API
    const url = new URL(request.url);
    const apiUrl = new URL('/api/actions', url.origin);
    apiUrl.searchParams.set('status', 'pending');
    apiUrl.searchParams.set('limit', '10');

    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch actions');
    }

    const data = await response.json();

    // Sort by priority (urgent→low) then by requestedAt (newest first)
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const sortedActions = data.actions.sort((a: any, b: any) => {
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                          priorityOrder[b.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });

    return json({
      actions: sortedActions,
      count: sortedActions.length,
    });
  } catch (error) {
    console.error('Error loading actions:', error);
    return json({
      actions: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to load actions',
    });
  }
}

/**
 * Actions Dashboard Page Component
 */
export default function ActionsPage() {
  const { actions, count, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  // Auto-refresh every 30 seconds for new actions
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [revalidator]);

  return (
    <Page
      title="Pending Actions"
      subtitle={`${count} action${count !== 1 ? 's' : ''} awaiting review`}
    >
      <Layout>
        <Layout.Section>
          {error && (
            <Banner tone="critical">
              <Text>Failed to load actions: {error}</Text>
            </Banner>
          )}
          
          <ActionDock
            actions={actions}
            onApprove={async (id) => {
              await fetch(`/api/actions/${id}/approve`, { method: 'POST' });
              revalidator.revalidate();
            }}
            onReject={async (id) => {
              await fetch(`/api/actions/${id}/reject`, { method: 'POST' });
              revalidator.revalidate();
            }}
            onViewDetail={(id) => {
              // Navigate to detail view (to be implemented in Priority 2)
              console.log('View detail:', id);
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

