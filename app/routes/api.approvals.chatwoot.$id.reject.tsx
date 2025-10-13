import { type ActionFunctionArgs } from 'react-router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

/**
 * API Route: POST /api/approvals/chatwoot/:id/reject
 * 
 * Rejects a Chatwoot draft response
 */
export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  
  if (!id) {
    return Response.json({ error: 'Missing approval ID' }, { status: 400 });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Parse request body for optional rejection reason
    let operatorNotes: string | null = null;
    try {
      const body = await request.json();
      operatorNotes = body.operator_notes || null;
    } catch {
      // No body provided
    }
    
    // Mark as rejected
    const { data, error: updateError } = await supabase
      .from('agent_approvals')
      .update({
        status: 'rejected',
        operator_notes: operatorNotes,
        reviewed_by: 1, // TODO: Get actual operator ID from session
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error rejecting:', updateError);
      return Response.json({ 
        error: 'Failed to reject', 
        details: updateError.message 
      }, { status: 500 });
    }
    
    // Create learning data record for rejected drafts
    await supabase.from('agent_sdk_learning_data').insert({
      approval_id: id,
      draft_version: data.draft_response,
      final_version: data.draft_response, // Same as draft since rejected
      was_sent: false,
      operator_feedback: operatorNotes || 'Draft rejected by operator',
      message_category: 'unknown',
    });
    
    return Response.json({
      success: true,
      approval: data,
      message: 'Draft rejected successfully',
    });
  } catch (error: any) {
    console.error('Unexpected error rejecting:', error);
    return Response.json({
      error: 'Unexpected error',
      details: error.message,
    }, { status: 500 });
  }
}

