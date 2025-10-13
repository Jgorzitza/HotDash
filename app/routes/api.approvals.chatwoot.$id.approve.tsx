import { type ActionFunctionArgs } from 'react-router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

/**
 * API Route: POST /api/approvals/chatwoot/:id/approve
 * 
 * Approves a Chatwoot draft response and optionally sends it to the customer
 */
export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  
  if (!id) {
    return Response.json({ error: 'Missing approval ID' }, { status: 400 });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Parse request body for optional edited response
    let editedResponse: string | null = null;
    try {
      const body = await request.json();
      editedResponse = body.edited_response || null;
    } catch {
      // No body provided, use original draft
    }
    
    // Update approval status to 'approved'
    const { data: approval, error: fetchError } = await supabase
      .from('agent_approvals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return Response.json({ 
        error: 'Approval not found', 
        details: fetchError.message 
      }, { status: 404 });
    }
    
    // Mark as approved
    const { data, error: updateError } = await supabase
      .from('agent_approvals')
      .update({
        status: editedResponse ? 'edited' : 'approved',
        edited_response: editedResponse,
        reviewed_by: 1, // TODO: Get actual operator ID from session
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error approving:', updateError);
      return Response.json({ 
        error: 'Failed to approve', 
        details: updateError.message 
      }, { status: 500 });
    }
    
    // Create learning data record
    if (editedResponse && editedResponse !== approval.draft_response) {
      await supabase.from('agent_sdk_learning_data').insert({
        approval_id: id,
        draft_version: approval.draft_response,
        final_version: editedResponse,
        was_sent: true,
        message_category: 'unknown', // TODO: Classify message type
      });
    }
    
    // TODO: Send the approved/edited response to Chatwoot
    // This would call the Chatwoot API to post the message to the conversation
    // For now, just mark as approved in our system
    
    return Response.json({
      success: true,
      approval: data,
      message: 'Approval processed successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error approving:', error);
    return Response.json({
      error: 'Unexpected error',
      details: error.message,
    }, { status: 500 });
  }
}

