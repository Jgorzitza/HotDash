#!/usr/bin/env node
/**
 * Archive stale KB articles
 * Usage: node scripts/kb/archive-stale.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function archiveStaleArticles() {
  console.log('Finding stale articles...');
  
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('*')
    .is('archived_at', null);

  if (error) {
    console.error('Error fetching articles:', error);
    process.exit(1);
  }

  if (!articles) {
    console.log('No articles found.');
    return;
  }

  const toArchive = [];
  const now = Date.now();

  for (const article of articles) {
    const daysSinceLastUse = article.last_used_at 
      ? Math.floor((now - new Date(article.last_used_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Archive if: not used in 90 days AND confidence < 0.50
    if (daysSinceLastUse > 90 && article.confidence_score < 0.50) {
      toArchive.push(article);
    }
  }

  if (toArchive.length === 0) {
    console.log('No stale articles to archive.');
    return;
  }

  console.log(`Archiving ${toArchive.length} stale articles...`);

  const { error: archiveError } = await supabase
    .from('kb_articles')
    .update({ archived_at: new Date().toISOString() })
    .in('id', toArchive.map(a => a.id));

  if (archiveError) {
    console.error('Error archiving articles:', archiveError);
    process.exit(1);
  }

  console.log('✓ Archived successfully');
  toArchive.forEach(a => {
    console.log(`  - Article ${a.id}: "${a.question}"`);
  });
}

archiveStaleArticles().catch(console.error);

