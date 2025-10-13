import { type LoaderFunctionArgs } from 'react-router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

/**
 * API Route: GET /api/approvals/chatwoot/:id
 * 
 * Returns a specific Chatwoot approval by ID
 */
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  
  if (!id) {
    return Response.json({ error: 'Missing approval ID' }, { status: 400 });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase
      .from('agent_approvals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return Response.json({ error: 'Approval not found' }, { status: 404 });
      }
      console.error('Error fetching approval:', error);
      return Response.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 });
    }
    
    return Response.json({ approval: data });
  } catch (error: any) {
    console.error('Unexpected error fetching approval:', error);
    return Response.json({
      error: 'Unexpected error',
      details: error.message,
    }, { status: 500 });
  }
}

