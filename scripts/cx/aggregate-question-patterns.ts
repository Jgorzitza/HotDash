#!/usr/bin/env tsx
/**
 * Aggregate Question Patterns (Nightly Job)
 * 
 * Analyzes resolved conversations to detect repeated questions
 * Queues patterns for article generation
 */

import { generateKnowledgeBaseArticles } from "../../app/services/cx/article-generator.server";

async function main() {
  console.log("[Article Generation] Starting pattern aggregation...");
  console.log(`[Article Generation] Date: ${new Date().toISOString()}`);

  try {
    const articles = await generateKnowledgeBaseArticles();

    console.log(`[Article Generation] Complete - Generated ${articles.length} articles`);
    
    articles.forEach((article) => {
      console.log(`  - ${article.title} (${article.basedonOccurrences} occurrences)`);
    });

    process.exit(0);
  } catch (error) {
    console.error("[Article Generation] Error:", error);
    process.exit(1);
  }
}

main();

