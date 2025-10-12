import { type ActionFunctionArgs, redirect, json } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import { chatwootClient } from '~/../../packages/integrations/chatwoot';

export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  
  if (!id) {
    throw new Response('Missing approval ID', { status: 400 });
  }
  
  try {
    // Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const chatwootToken = process.env.CHATWOOT_API_TOKEN;
    const chatwootBaseUrl = process.env.CHATWOOT_BASE_URL || 'https://hotdash-chatwoot.fly.dev';
    const chatwootAccountId = parseInt(process.env.CHATWOOT_ACCOUNT_ID || '1');
    
    if (!supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse form data
    const formData = await request.formData();
    const operatorNotes = formData.get('operatorNotes') as string;
    
    // Fetch the approval item
    const { data: approval, error: fetchError } = await supabase
      .from('agent_approvals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !approval) {
      throw new Error('Approval not found');
    }
    
    // Handle escalation in Chatwoot if configured
    if (chatwootToken && approval.chatwoot_conversation_id) {
      const client = chatwootClient({
        baseUrl: chatwootBaseUrl,
        token: chatwootToken,
        accountId: chatwootAccountId,
      });
      
      try {
        // Add escalation labels
        await client.addLabel(approval.chatwoot_conversation_id, 'escalated');
        await client.addLabel(approval.chatwoot_conversation_id, 'agent_sdk');
        
        // Create escalation note
        const escalationNote = `
⚠️ **ESCALATED** from Agent SDK approval queue

**Escalation Reason:** ${operatorNotes}

**Customer Message:**
${approval.customer_message}

**Agent SDK Draft (Confidence: ${approval.confidence_score}%):**
${approval.draft_response}

**Knowledge Sources Used:**
${approval.knowledge_sources ? JSON.stringify(approval.knowledge_sources, null, 2) : 'None'}

**Sentiment Analysis:**
${approval.sentiment_analysis ? JSON.stringify(approval.sentiment_analysis, null, 2) : 'N/A'}

**Recommended Next Steps:**
${approval.recommended_action === 'escalate' ? 'Agent SDK recommended escalation due to low confidence or high urgency.' : 'Operator determined escalation necessary.'}
`;
        
        await client.createPrivateNote(approval.chatwoot_conversation_id, escalationNote);
        
        // TODO: Assign to senior agent if assignee ID is configured
        // const seniorAgentId = process.env.CHATWOOT_SENIOR_AGENT_ID;
        // if (seniorAgentId) {
        //   await client.assignAgent(approval.chatwoot_conversation_id, parseInt(seniorAgentId));
        // }
      } catch (chatwootError) {
        console.error('Chatwoot API error during escalation:', chatwootError);
        // Continue with database update even if Chatwoot fails
      }
    }
    
    // Update approval status
    const { error: updateError } = await supabase
      .from('agent_approvals')
      .update({
        status: 'escalated',
        approved_by: 'operator',
        operator_action: 'escalate',
        operator_notes: operatorNotes,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    
    if (updateError) {
      throw updateError;
    }
    
    // Store in learning data
    await supabase.from('agent_sdk_learning_data').insert({
      queue_item_id: approval.id,
      customer_message: approval.customer_message,
      agent_draft: approval.draft_response,
      operator_action: 'escalate',
      outcome: 'escalated',
      feedback_notes: operatorNotes,
    });
    
    // Create escalation notification
    await supabase.from('agent_sdk_notifications').insert({
      type: 'escalation',
      queue_item_id: approval.id,
      conversation_id: approval.chatwoot_conversation_id,
      priority: 'high',
    });
    
    return redirect('/chatwoot-approvals');
  } catch (error) {
    console.error('Error escalating:', error);
    return json(
      { error: 'Failed to escalate approval' },
      { status: 500 }
    );
  }
}

