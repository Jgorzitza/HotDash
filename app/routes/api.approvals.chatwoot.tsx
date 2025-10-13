import { type LoaderFunctionArgs } from 'react-router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

/**
 * API Route: GET /api/approvals/chatwoot
 * 
 * Returns pending Chatwoot customer support approvals from agent_approvals table
 * Sorted by priority (urgent → high → normal → low) and creation time
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase
      .from('agent_approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching Chatwoot approvals:', error);
      return Response.json({ 
        approvals: [], 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 });
    }
    
    // Sort by priority: urgent → high → normal → low
    const priorityOrder: Record<string, number> = {
      urgent: 1,
      high: 2,
      normal: 3,
      low: 4,
    };
    
    const sortedApprovals = (data || []).sort((a, b) => {
      const aPriority = priorityOrder[a.priority || 'normal'] || 3;
      const bPriority = priorityOrder[b.priority || 'normal'] || 3;
      return aPriority - bPriority;
    });
    
    return {
      approvals: sortedApprovals,
      count: sortedApprovals.length,
      error: null,
    };
  } catch (error: any) {
    console.error('Unexpected error fetching Chatwoot approvals:', error);
    return Response.json({
      approvals: [],
      error: 'Unexpected error',
      details: error.message,
    }, { status: 500 });
  }
}

