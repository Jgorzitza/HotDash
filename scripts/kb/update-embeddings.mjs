#!/usr/bin/env node
/**
 * Update embeddings for all KB articles
 * Usage: node scripts/kb/update-embeddings.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateEmbedding(text) {
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
  return data.data[0].embedding;
}

async function updateEmbeddings() {
  console.log('Fetching articles without embeddings...');
  
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, question, answer')
    .is('embedding', null)
    .is('archived_at', null);

  if (error) {
    console.error('Error fetching articles:', error);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('No articles need embedding updates.');
    return;
  }

  console.log(`Updating embeddings for ${articles.length} articles...`);

  let updated = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      const text = `${article.question} ${article.answer}`;
      const embedding = await generateEmbedding(text);

      const { error: updateError } = await supabase
        .from('kb_articles')
        .update({ embedding })
        .eq('id', article.id);

      if (updateError) {
        console.error(`Error updating article ${article.id}:`, updateError);
        failed++;
      } else {
        updated++;
        console.log(`✓ Updated article ${article.id}`);
      }

      // Rate limit: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing article ${article.id}:`, error);
      failed++;
    }
  }

  console.log(`\nCompleted: ${updated} updated, ${failed} failed`);
}

updateEmbeddings().catch(console.error);

