import { fetchHotrodanContent } from "./src/loaders/sitemap.js";
import { getConfig } from "./src/config.js";
import fs from "node:fs/promises";
import path from "node:path";

console.log("🚀 Building simple document index with hotrodan.com content...\n");

try {
  const config = getConfig();
  const timestamp = new Date().toISOString().replace(/[:]/g, "").slice(0, 15);
  const runDir = path.join(config.LOG_DIR, "indexes", timestamp);

  await fs.mkdir(runDir, { recursive: true });

  // Fetch hotrodan.com content
  console.log("📥 Fetching hotrodan.com content...");
  const docs = await fetchHotrodanContent();

  console.log(`✓ Fetched ${docs.length} documents`);

  // Create a simple JSON index with all documents
  const index = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    source: "hotrodan.com",
    document_count: docs.length,
    documents: docs.map((doc) => ({
      id: doc.id_,
      text: doc.getText(),
      metadata: doc.metadata,
      length: doc.getText().length,
    })),
  };

  // Save the index
  const indexPath = path.join(runDir, "operator_knowledge.json");
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  console.log(`✓ Saved index to: ${indexPath}`);

  // Create latest symlink
  const latestLink = path.join(config.LOG_DIR, "indexes", "latest");
  try {
    await fs.unlink(latestLink);
  } catch {}
  await fs.symlink(runDir, latestLink, "dir");
  console.log(`✓ Updated latest symlink`);

  // Create manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    runDir,
    indexPath,
    sources: { web: docs.length },
    total_documents: docs.length,
    total_content_length: docs.reduce((sum, d) => sum + d.getText().length, 0),
    build_type: "simple_json",
  };

  await fs.writeFile(
    path.join(runDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log("\n✅ Index build completed successfully!");
  console.log(JSON.stringify(manifest, null, 2));
} catch (error) {
  console.error("❌ Index build failed:", error);
  process.exit(1);
}
