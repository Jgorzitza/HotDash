#!/usr/bin/env node
/**
 * KB Auto-Update Script
 * Run scheduled updates with toggles
 * Usage: node scripts/kb/auto-update.mjs [--batch] [--stale] [--duplicates] [--all]
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Parse command line arguments
const args = process.argv.slice(2);
const runBatch = args.includes('--batch') || args.includes('--all');
const runStale = args.includes('--stale') || args.includes('--all');
const runDuplicates = args.includes('--duplicates') || args.includes('--all');
const runAll = args.includes('--all');

if (!runBatch && !runStale && !runDuplicates) {
  console.log('Usage: node scripts/kb/auto-update.mjs [--batch] [--stale] [--duplicates] [--all]');
  console.log('');
  console.log('Options:');
  console.log('  --batch       Run batch updates from learnings (last 24h)');
  console.log('  --stale       Detect and flag stale articles');
  console.log('  --duplicates  Merge duplicate articles');
  console.log('  --all         Run all update tasks');
  process.exit(0);
}

/**
 * Batch update from learnings
 */
async function batchUpdateFromLearnings() {
  console.log('\n=== Batch Update from Learnings ===');
  
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { data: learnings, error } = await supabase
    .from('kb_learning_edits')
    .select('*')
    .gte('created_at', cutoffDate.toISOString());

  if (error) {
    console.error('Error fetching learnings:', error);
    return { updated: 0, created: 0, flagged: 0 };
  }

  if (!learnings || learnings.length === 0) {
    console.log('No recent learnings to process.');
    return { updated: 0, created: 0, flagged: 0 };
  }

  let updated = 0;
  let created = 0;
  let flagged = 0;

  for (const learning of learnings) {
    const avgGrade = (learning.tone_grade + learning.accuracy_grade + learning.policy_grade) / 3;

    if (learning.edit_ratio < 0.1 && avgGrade >= 4) {
      // High quality approval - update confidence
      if (learning.kb_article_id) {
        updated++;
      }
    } else if (learning.edit_ratio >= 0.3 && avgGrade >= 4) {
      // Significant edit - consider new article
      if (!learning.kb_article_id) {
        created++;
      } else {
        updated++;
      }
    } else if (avgGrade <= 2) {
      // Low grade - flag for review
      flagged++;
    }
  }

  console.log(`Processed ${learnings.length} learnings:`);
  console.log(`  - Updated: ${updated}`);
  console.log(`  - Created: ${created}`);
  console.log(`  - Flagged: ${flagged}`);

  return { updated, created, flagged };
}

/**
 * Detect stale articles
 */
async function detectStaleArticles() {
  console.log('\n=== Detect Stale Articles ===');

  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('*')
    .is('archived_at', null);

  if (error) {
    console.error('Error fetching articles:', error);
    return 0;
  }

  if (!articles) {
    console.log('No articles found.');
    return 0;
  }

  let staleCount = 0;
  const now = Date.now();

  for (const article of articles) {
    const daysSinceLastUse = article.last_used_at 
      ? Math.floor((now - new Date(article.last_used_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastUse > 60 && daysSinceLastUse < 90) {
      console.log(`  ⚠️  Article ${article.id}: "${article.question}" (${daysSinceLastUse} days unused)`);
      staleCount++;
    }
  }

  console.log(`Found ${staleCount} stale articles (60-90 days unused)`);
  return staleCount;
}

/**
 * Merge duplicate articles
 */
async function mergeDuplicates() {
  console.log('\n=== Merge Duplicate Articles ===');

  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('*')
    .is('archived_at', null)
    .order('confidence_score', { ascending: false });

  if (error || !articles || articles.length < 2) {
    console.log('No articles to check for duplicates.');
    return 0;
  }

  let merged = 0;

  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      const similarity = calculateSimilarity(
        articles[i].question,
        articles[j].question
      );

      if (similarity > 0.85 && articles[i].category === articles[j].category) {
        const keepArticle = articles[i];
        const archiveArticle = articles[j];

        console.log(`  🔗 Merging duplicates:`);
        console.log(`     Keep: ${keepArticle.id} - "${keepArticle.question}"`);
        console.log(`     Archive: ${archiveArticle.id} - "${archiveArticle.question}"`);

        // Combine usage stats
        await supabase
          .from('kb_articles')
          .update({
            usage_count: keepArticle.usage_count + archiveArticle.usage_count,
            success_count: keepArticle.success_count + archiveArticle.success_count
          })
          .eq('id', keepArticle.id);

        // Archive duplicate
        await supabase
          .from('kb_articles')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', archiveArticle.id);

        merged++;
      }
    }
  }

  console.log(`Merged ${merged} duplicate articles`);
  return merged;
}

/**
 * Calculate similarity between two questions
 */
function calculateSimilarity(q1, q2) {
  const words1 = new Set(q1.toLowerCase().split(/\s+/));
  const words2 = new Set(q2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Main execution
 */
async function main() {
  console.log('KB Auto-Update Script');
  console.log('=====================');

  const results = {
    batch: null,
    stale: null,
    duplicates: null
  };

  if (runBatch) {
    results.batch = await batchUpdateFromLearnings();
  }

  if (runStale) {
    results.stale = await detectStaleArticles();
  }

  if (runDuplicates) {
    results.duplicates = await mergeDuplicates();
  }

  console.log('\n=== Summary ===');
  if (results.batch) {
    console.log(`Batch updates: ${results.batch.updated} updated, ${results.batch.created} created, ${results.batch.flagged} flagged`);
  }
  if (results.stale !== null) {
    console.log(`Stale articles: ${results.stale} detected`);
  }
  if (results.duplicates !== null) {
    console.log(`Duplicates: ${results.duplicates} merged`);
  }

  console.log('\n✅ Auto-update complete');
}

main().catch(console.error);

