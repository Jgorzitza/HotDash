/**
 * KB System Metrics API
 * Exposes quality distribution and system-wide metrics
 */

import { json } from '@remix-run/node';
import { getSystemQualityMetrics } from '../../../lib/knowledge/quality';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function loader() {
  try {
    // Get system-wide quality metrics
    const qualityMetrics = await getSystemQualityMetrics();

    // Get category distribution
    const { data: categoryDist } = await supabase
      .from('kb_articles')
      .select('category')
      .is('archived_at', null);

    const categoryCount: Record<string, number> = {};
    categoryDist?.forEach(a => {
      categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
    });

    // Get usage stats
    const { data: usageStats } = await supabase
      .from('kb_usage_log')
      .select('was_helpful')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const helpfulCount = usageStats?.filter(u => u.was_helpful === true).length || 0;
    const totalUsage = usageStats?.length || 0;

    return json({
      success: true,
      metrics: {
        quality: qualityMetrics,
        categories: categoryCount,
        usage: {
          total: totalUsage,
          helpful: helpfulCount,
          helpfulness_rate: totalUsage > 0 ? helpfulCount / totalUsage : 0
        }
      }
    });
  } catch (error) {
    console.error('[KB Metrics API] Error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

