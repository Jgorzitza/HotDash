import { getConfig } from "./src/config.js";
import fs from "node:fs/promises";
import path from "node:path";

async function simpleQuery(query: string, topK: number = 3) {
  console.log(`🔍 Query: "${query}"`);
  console.log(`📊 Top K: ${topK}\n`);

  const config = getConfig();
  const indexPath = path.join(
    config.LOG_DIR,
    "indexes",
    "2025-10-12T0324",
    "operator_knowledge.json",
  );

  // Load the index
  console.log(`📂 Loading index from: ${indexPath}`);
  const indexData = await fs.readFile(indexPath, "utf-8");
  const index = JSON.parse(indexData);

  console.log(`✓ Loaded index with ${index.document_count} documents`);

  // Simple keyword search (case-insensitive)
  const queryLower = query.toLowerCase();
  const results = index.documents
    .map((doc: any) => {
      const textLower = doc.text.toLowerCase();
      const matches = (
        textLower.match(new RegExp(queryLower.split(" ").join("|"), "g")) || []
      ).length;
      return {
        ...doc,
        score: matches,
        relevantText: doc.text.slice(0, 300) + "...",
      };
    })
    .filter((doc: any) => doc.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, topK);

  console.log(`\n✅ Found ${results.length} relevant documents:\n`);

  results.forEach((result: any, i: number) => {
    console.log(`${i + 1}. ${result.metadata.url}`);
    console.log(`   Score: ${result.score} matches`);
    console.log(`   Preview: ${result.relevantText.slice(0, 150)}...\n`);
  });

  return results;
}

// Test queries
const testQueries = ["PTFE hose", "fuel pump", "AN fittings", "shipping"];

console.log("🚀 Testing queries against hotrodan.com index\n");
console.log("=".repeat(60) + "\n");

for (const query of testQueries) {
  await simpleQuery(query, 3);
  console.log("\n" + "-".repeat(60) + "\n");
}

console.log("✅ All test queries completed!");
