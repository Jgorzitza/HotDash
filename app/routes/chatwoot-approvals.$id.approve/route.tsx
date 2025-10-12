import { type ActionFunctionArgs, redirect } from 'react-router';
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
    const action = formData.get('action') as string;
    const editedResponse = formData.get('editedResponse') as string | null;
    const operatorNotes = formData.get('operatorNotes') as string | null;
    
    // Fetch the approval item
    const { data: approval, error: fetchError } = await supabase
      .from('agent_approvals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !approval) {
      throw new Error('Approval not found');
    }
    
    // Determine response to send
    const responseToSend = action === 'edit' && editedResponse 
      ? editedResponse 
      : approval.draft_response;
    
    // Send reply via Chatwoot if configured
    if (chatwootToken && approval.chatwoot_conversation_id) {
      const client = chatwootClient({
        baseUrl: chatwootBaseUrl,
        token: chatwootToken,
        accountId: chatwootAccountId,
      });
      
      try {
        // Send the response
        await client.sendReply(approval.chatwoot_conversation_id, responseToSend);
        
        // Add appropriate label
        await client.addLabel(
          approval.chatwoot_conversation_id, 
          action === 'edit' ? 'agent_sdk_edited' : 'agent_sdk_approved'
        );
      } catch (chatwootError) {
        console.error('Chatwoot API error:', chatwootError);
        // Continue with database update even if Chatwoot fails
      }
    }
    
    // Update approval status
    const { error: updateError } = await supabase
      .from('agent_approvals')
      .update({
        status: 'approved',
        approved_by: 'operator', // TODO: Get actual operator ID from auth
        operator_action: action === 'edit' ? 'edit' : 'approve',
        edited_response: action === 'edit' ? editedResponse : null,
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
      operator_version: action === 'edit' ? editedResponse : null,
      operator_action: action === 'edit' ? 'edit' : 'approve',
      outcome: 'pending',
    });
    
    return redirect('/chatwoot-approvals');
  } catch (error) {
    console.error('Error approving:', error);
    throw new Response(JSON.stringify({ error: 'Failed to process approval' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

