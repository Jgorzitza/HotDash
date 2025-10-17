import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "./src/config.js";

async function testProductQA(query: string) {
  const config = getConfig();
  const qaPath = path.join(
    config.LOG_DIR,
    "product-catalog",
    "product-qa-knowledge.md",
  );
  const qaContent = await fs.readFile(qaPath, "utf-8");

  console.log(`🔍 Query: "${query}"`);

  // Simple keyword search
  const lines = qaContent.split("\n");
  const matches: string[] = [];
  const queryLower = query.toLowerCase();

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(queryLower)) {
      // Capture context around match (previous and next lines)
      const context = lines
        .slice(Math.max(0, i - 2), Math.min(lines.length, i + 3))
        .join("\n");
      matches.push(context);
    }
  }

  console.log(`✓ Found ${matches.length} matches\n`);
  console.log(matches.slice(0, 3).join("\n\n---\n\n"));
  console.log("\n");
}

// Test queries
await testProductQA("blue hose");
await testProductQA("fuel pump 255");
await testProductQA("90 degree");

console.log("✅ Product Q&A testing complete!");
