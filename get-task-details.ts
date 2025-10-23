import { createClient } from '@supabase/supabase-js';

async function getTaskDetails() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const result = await supabase.from('TaskAssignment').select('*').eq('taskId', 'AI-CUSTOMER-001').single();
  console.log('Task Details:', JSON.stringify(result.data, null, 2));
}

getTaskDetails().catch(console.error);
