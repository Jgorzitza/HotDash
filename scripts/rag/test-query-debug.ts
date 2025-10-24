#!/usr/bin/env tsx
import { queryKnowledgeBase } from "../../app/services/rag/ceo-knowledge-base";

async function main() {
  const query = "What is the restocking fee for returns?";
  console.log("Query:", query);
  console.log("\n⏱️  Querying...\n");

  try {
    const result = await queryKnowledgeBase(query);

    console.log("=== FULL RESULT ===");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n=== ANSWER ===");
    console.log("Answer:", result.answer);
    console.log("Answer length:", result.answer.length);
    console.log("Answer type:", typeof result.answer);
    
    console.log("\n=== SOURCES ===");
    console.log("Sources count:", result.sources.length);
    result.sources.forEach((s, i) => {
      console.log(
        `  ${i + 1}. ${s.document} (${(s.relevance * 100).toFixed(1)}%)`,
      );
      if (s.snippet) {
        console.log(`     "${s.snippet.slice(0, 100)}..."`);
      }
    });
    
    console.log("\n=== METRICS ===");
    if (result.metrics) {
      console.log("Query time:", result.metrics.queryTime, "ms");
      console.log("Retrieval time:", result.metrics.retrievalTime, "ms");
      console.log("Synthesis time:", result.metrics.synthesisTime, "ms");
      console.log("Chunks retrieved:", result.metrics.chunksRetrieved);
      console.log("Chunks after filter:", result.metrics.chunksAfterFilter);
    }
    
    console.log("\n=== CONFIDENCE ===");
    console.log("Confidence:", result.confidence);
  } catch (error) {
    console.error("ERROR:", error);
    console.error("Stack:", (error as Error).stack);
  }
}

main().catch(console.error);

