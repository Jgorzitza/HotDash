// Simplified build index implementation for initial compilation and testing
import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "../config.js";
export async function buildAll(logDir, options = {}) {
  console.log("🏗️  Starting LlamaIndex build process...");
  const config = getConfig();
  const baseLogDir = logDir || config.LOG_DIR;
  const timestamp = new Date().toISOString().replace(/[:]/g, "").slice(0, 15);
  const runDir = path.join(baseLogDir, "indexes", timestamp);
  const startTime = Date.now();
  try {
    // Create directory structure
    await fs.mkdir(runDir, { recursive: true });
    console.log(`📁 Created run directory: ${runDir}`);
    // Mock document processing
    console.log("📚 Processing documents from sources...");
    const sources = [
      "hotrodan.com",
      "decision_log",
      "telemetry_events",
      "curated_replies",
    ];
    const mockDocumentCount = 42; // Mock count for testing
    // Create a simple manifest file
    const manifest = {
      timestamp: new Date().toISOString(),
      sources,
      document_count: mockDocumentCount,
      processing_time_ms: Date.now() - startTime,
      build_version: "1.0.0-mock",
      index_type: "simple_mock",
    };
    await fs.writeFile(
      path.join(runDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
    // Create mock index files
    await fs.writeFile(
      path.join(runDir, "index.json"),
      JSON.stringify({ mock: true, documents: mockDocumentCount }, null, 2),
    );
    // Update latest symlink
    const latestPath = path.join(baseLogDir, "indexes", "latest");
    try {
      await fs.unlink(latestPath).catch(() => {}); // Ignore errors if symlink doesn't exist
      await fs.symlink(runDir, latestPath);
      console.log(`🔗 Updated latest symlink to: ${runDir}`);
    } catch (error) {
      console.warn("⚠️  Could not update latest symlink:", error);
    }
    const processingTime = Date.now() - startTime;
    console.log(`✅ Build completed in ${processingTime}ms`);
    console.log(
      `📊 Processed ${mockDocumentCount} documents from ${sources.length} sources`,
    );
    return {
      success: true,
      runDir,
      count: mockDocumentCount,
      manifest,
    };
  } catch (error) {
    console.error("❌ Build failed:", error);
    // Write error log
    const errorLog = {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      sources: options.sources || "all",
    };
    try {
      await fs.mkdir(runDir, { recursive: true });
      await fs.writeFile(
        path.join(runDir, "error.log"),
        JSON.stringify(errorLog, null, 2),
      );
    } catch (writeError) {
      console.error("Failed to write error log:", writeError);
    }
    throw error;
  }
}
export async function getLatestIndexPath() {
  const config = getConfig();
  const latestPath = path.join(config.LOG_DIR, "indexes", "latest");
  try {
    const stats = await fs.lstat(latestPath);
    if (stats.isSymbolicLink()) {
      return await fs.readlink(latestPath);
    }
    return latestPath;
  } catch {
    return null;
  }
}
//# sourceMappingURL=buildIndex_simple.js.map
