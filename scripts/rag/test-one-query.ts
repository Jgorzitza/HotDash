#!/usr/bin/env tsx
import { queryKnowledgeBase } from "../../app/services/rag/ceo-knowledge-base";

async function main() {
  const query = "What is the restocking fee for returns?";
  console.log("Query:", query);
  console.log("\n⏱️  Querying...\n");

  const result = await queryKnowledgeBase(query);

  console.log("Answer:", result.answer);
  console.log("\nSources:");
  result.sources.forEach((s, i) => {
    console.log(
      `  ${i + 1}. ${s.document} (${(s.relevance * 100).toFixed(1)}%)`,
    );
    if (s.snippet) {
      console.log(`     "${s.snippet.slice(0, 100)}..."`);
    }
  });
  console.log("\nConfidence:", result.confidence);
}

main().catch(console.error);
