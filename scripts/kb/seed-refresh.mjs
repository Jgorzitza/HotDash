#!/usr/bin/env node
/**
 * KB Seed Data Refresh Tool
 * Refresh seed data with latest templates
 * Usage: node scripts/kb/seed-refresh.mjs [--force]
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const force = process.argv.includes('--force');

const seedArticles = [
  {
    question: "Where is my order?",
    answer: "I understand you're eager to receive your order! Let me help you track it. Your order should have a tracking number in your confirmation email. You can also check your order status in your account dashboard.",
    category: "orders",
    tags: ["order_tracking", "order_status"],
    confidence_score: 0.85,
    source: "template"
  },
  {
    question: "How do I return an item?",
    answer: "Returning an item is easy! Log into your account, go to Order History, select the order, click 'Return Items', choose items and reason, print the prepaid label, and drop off at any carrier location.",
    category: "returns",
    tags: ["return_process", "return_instructions"],
    confidence_score: 0.82,
    source: "template"
  },
  {
    question: "When will my order arrive?",
    answer: "Delivery times depend on your shipping method. Standard shipping takes 5-7 business days, expedited is 2-3 business days. Check your confirmation email for your specific delivery estimate.",
    category: "shipping",
    tags: ["shipping_eta", "delivery_time"],
    confidence_score: 0.88,
    source: "template"
  }
];

async function refreshSeedData() {
  console.log('KB Seed Data Refresh Tool');
  console.log('=========================\n');

  if (!force) {
    console.log('⚠️  This will update existing seed articles.');
    console.log('   Use --force to proceed.\n');
    return;
  }

  console.log('Refreshing seed data...\n');

  for (const article of seedArticles) {
    // Check if article exists
    const { data: existing } = await supabase
      .from('kb_articles')
      .select('id')
      .eq('question', article.question)
      .eq('source', 'template')
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('kb_articles')
        .update({
          answer: article.answer,
          tags: article.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) {
        console.error(`❌ Error updating "${article.question}":`, error);
      } else {
        console.log(`✅ Updated: "${article.question}"`);
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('kb_articles')
        .insert({
          ...article,
          created_by: 'seed_refresh'
        });

      if (error) {
        console.error(`❌ Error inserting "${article.question}":`, error);
      } else {
        console.log(`✅ Inserted: "${article.question}"`);
      }
    }
  }

  console.log('\n✅ Seed data refresh complete');
}

refreshSeedData().catch(console.error);

