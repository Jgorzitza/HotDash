#!/usr/bin/env node
/**
 * KB CLI Tool
 * Command-line interface for KB operations
 * Usage: node scripts/kb/cli.mjs <command> [options]
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const command = process.argv[2];
const args = process.argv.slice(3);

async function reindex() {
  console.log('Reindexing KB articles...\n');

  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, question, answer')
    .is('archived_at', null);

  if (error || !articles) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log(`Found ${articles.length} articles to reindex`);

  for (const article of articles) {
    // Generate embedding
    const text = `${article.question} ${article.answer}`;
    
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text
        })
      });

      const data = await response.json();
      const embedding = data.data[0].embedding;

      // Update article
      await supabase
        .from('kb_articles')
        .update({ embedding })
        .eq('id', article.id);

      console.log(`✅ Reindexed article ${article.id}`);

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error reindexing article ${article.id}:`, error);
    }
  }

  console.log('\n✅ Reindexing complete');
}

async function stats() {
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('*')
    .is('archived_at', null);

  const { data: archived } = await supabase
    .from('kb_articles')
    .select('id')
    .not('archived_at', 'is', null);

  console.log('\nKB Statistics');
  console.log('=============');
  console.log(`Active articles: ${articles?.length || 0}`);
  console.log(`Archived articles: ${archived?.length || 0}`);
  
  if (articles && articles.length > 0) {
    const avgConfidence = articles.reduce((sum, a) => sum + a.confidence_score, 0) / articles.length;
    console.log(`Average confidence: ${avgConfidence.toFixed(2)}`);
    
    const categoryCount: Record<string, number> = {};
    articles.forEach(a => {
      categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
    });
    
    console.log('\nBy category:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
  }
}

async function help() {
  console.log('KB CLI Tool');
  console.log('===========\n');
  console.log('Commands:');
  console.log('  reindex    Reindex all articles with embeddings');
  console.log('  stats      Show KB statistics');
  console.log('  help       Show this help message');
}

async function main() {
  switch (command) {
    case 'reindex':
      await reindex();
      break;
    case 'stats':
      await stats();
      break;
    case 'help':
    default:
      await help();
      break;
  }
}

main().catch(console.error);

