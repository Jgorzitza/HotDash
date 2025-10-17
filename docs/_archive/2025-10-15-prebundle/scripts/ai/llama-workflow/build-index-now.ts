import { buildAll } from "./src/pipeline/buildIndex.js";
import { getConfig } from "./src/config.js";

console.log("🚀 Building LlamaIndex with hotrodan.com content...\n");

try {
  const config = getConfig();
  const result = await buildAll(config.LOG_DIR, { sources: "web", full: true });

  console.log("\n✅ Index build completed successfully!");
  console.log(
    JSON.stringify(
      {
        runDir: result.runDir,
        totalDocuments: result.count,
        sources: result.sources,
        duration: result.duration + "ms",
        indexPath: result.indexPath,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error("❌ Index build failed:", error);
  process.exit(1);
}
