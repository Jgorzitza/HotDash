import { useEffect } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useRevalidator } from 'react-router';
import { Page, Layout, Card, EmptyState, Banner, InlineStack, Badge, Text } from '@shopify/polaris';
import { ChatwootApprovalCard } from '~/components/ChatwootApprovalCard';
import { createClient } from '@supabase/supabase-js';

interface ChatwootApproval {
  id: number;
  chatwoot_conversation_id: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_message: string;
  draft_response: string;
  confidence_score: number;
  knowledge_sources: any[];
  suggested_tags: string[];
  sentiment_analysis: any;
  recommended_action: string;
  priority: string;
  created_at: string;
}

// Loader: Fetch pending approvals from Supabase
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      return { 
        approvals: [], 
        error: 'Supabase configuration missing',
        stats: { urgent: 0, high: 0, normal: 0, low: 0 }
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch pending approvals ordered by priority and creation time
    const { data: approvals, error } = await supabase
      .from('agent_approvals')
      .select('*')
      .eq('status', 'pending')
      .not('chatwoot_conversation_id', 'is', null)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Failed to fetch Chatwoot approvals:', error);
      return { 
        approvals: [], 
        error: 'Failed to load approvals from database',
        stats: { urgent: 0, high: 0, normal: 0, low: 0 }
      };
    }
    
    // Calculate statistics
    const stats = {
      urgent: approvals?.filter(a => a.priority === 'urgent').length || 0,
      high: approvals?.filter(a => a.priority === 'high').length || 0,
      normal: approvals?.filter(a => a.priority === 'normal').length || 0,
      low: approvals?.filter(a => a.priority === 'low').length || 0,
    };
    
    return { 
      approvals: (approvals as ChatwootApproval[]) || [], 
      error: null,
      stats
    };
  } catch (error) {
    console.error('Error fetching Chatwoot approvals:', error);
    return { 
      approvals: [], 
      error: 'Database connection error',
      stats: { urgent: 0, high: 0, normal: 0, low: 0 }
    };
  }
}

export default function ChatwootApprovalsRoute() {
  const { approvals, error, stats } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  
  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 10000);
    return () => clearInterval(interval);
  }, [revalidator]);
  
  const totalPending = approvals.length;
  const avgConfidence = totalPending > 0
    ? Math.round(approvals.reduce((sum, a) => sum + a.confidence_score, 0) / totalPending)
    : 0;
  
  return (
    <Page
      title="Chatwoot Approval Queue"
      subtitle={`${totalPending} pending customer ${totalPending === 1 ? 'response' : 'responses'}`}
    >
      <Layout>
        {/* Statistics Banner */}
        {totalPending > 0 && (
          <Layout.Section>
            <Card>
              <InlineStack gap="400" wrap={false}>
                <div>
                  <Text variant="bodyMd" as="p" fontWeight="bold">Queue Statistics:</Text>
                </div>
                {stats.urgent > 0 && (
                  <Badge tone="critical">{`🚨 ${stats.urgent} Urgent`}</Badge>
                )}
                {stats.high > 0 && (
                  <Badge tone="attention">{`⚡ ${stats.high} High Priority`}</Badge>
                )}
                {stats.normal > 0 && (
                  <Badge tone="info">{`📝 ${stats.normal} Normal`}</Badge>
                )}
                {stats.low > 0 && (
                  <Badge tone="success">{`✓ ${stats.low} Low Priority`}</Badge>
                )}
                <Badge tone="info">{`Avg Confidence: ${avgConfidence}%`}</Badge>
              </InlineStack>
            </Card>
          </Layout.Section>
        )}
        
        {/* Error Banner */}
        {error && (
          <Layout.Section>
            <Banner tone="critical" title="Error loading approvals">
              <p>{error}</p>
              <p>Please check your Supabase configuration and database connection.</p>
            </Banner>
          </Layout.Section>
        )}
        
        {/* Empty State */}
        {approvals.length === 0 && !error ? (
          <Layout.Section>
            <Card>
              <EmptyState
                heading="All caught up!"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>No pending customer responses to review. Great work!</p>
                <p>New messages will appear here when they arrive via Chatwoot.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        ) : (
          // Approval Cards
          approvals.map((approval) => (
            <Layout.Section key={approval.id}>
              <ChatwootApprovalCard approval={approval} />
            </Layout.Section>
          ))
        )}
      </Layout>
    </Page>
  );
}

