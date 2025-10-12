import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';

export async function action({ params }: ActionFunctionArgs) {
  const { id, idx } = params;
  
  if (!id || !idx) {
    throw new Response('Missing approval ID or index', { status: 400 });
  }
  
  try {
    // Use production Agent SDK service (deployed to Fly.io)
    const agentServiceUrl = process.env.AGENT_SERVICE_URL || 'https://hotdash-agent-service.fly.dev';
    const response = await fetch(`${agentServiceUrl}/approvals/${id}/${idx}/approve`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Approval failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error approving action:', error);
    // Still redirect even on error - user will see updated state
  }
  
  return redirect('/approvals');
}

