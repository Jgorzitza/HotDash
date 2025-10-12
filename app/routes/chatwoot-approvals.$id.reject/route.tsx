import { type ActionFunctionArgs, redirect, json } from 'react-router';
import { createClient } from '@supabase/supabase-js';

export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;
  
  if (!id) {
    throw new Response('Missing approval ID', { status: 400 });
  }
  
  try {
    // Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
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
    
    // Update approval status
    const { error: updateError } = await supabase
      .from('agent_approvals')
      .update({
        status: 'rejected',
        approved_by: 'operator',
        operator_action: 'reject',
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
      operator_action: 'reject',
      outcome: 'rejected',
      feedback_notes: operatorNotes,
    });
    
    return redirect('/chatwoot-approvals');
  } catch (error) {
    console.error('Error rejecting:', error);
    return json(
      { error: 'Failed to reject approval' },
      { status: 500 }
    );
  }
}

