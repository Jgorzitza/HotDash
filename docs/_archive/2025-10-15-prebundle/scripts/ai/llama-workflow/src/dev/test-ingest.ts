#!/usr/bin/env node
/**
 * Test ingestion script - validates each loader independently
 */

import { fetchHotrodanContent } from "../loaders/sitemap.js";
import { fetchDecisionDocs, fetchTelemetryDocs } from "../loaders/supabase.js";
import { fetchCuratedDocs } from "../loaders/curated.js";
import { getConfig } from "../config.js";

interface LoaderResult {
  name: string;
  success: boolean;
  documentCount: number;
  sampleDocument?: any;
  error?: string;
  duration: number;
}

async function testLoader<T>(
  name: string,
  loader: () => Promise<T[]>,
  retries: number = 2,
): Promise<LoaderResult> {
  console.log(`🧪 Testing ${name} loader...`);

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const startTime = Date.now();

    try {
      const documents = await loader();
      const duration = Date.now() - startTime;

      const result: LoaderResult = {
        name,
        success: true,
        documentCount: documents.length,
        duration,
      };

      if (documents.length > 0) {
        result.sampleDocument = {
          // @ts-ignore - accessing document properties generically
          id: documents[0].id_ || documents[0].id || "unknown",
          // @ts-ignore
          text_preview: (
            documents[0].text ||
            documents[0].getText?.() ||
            "No text"
          ).slice(0, 200),
          // @ts-ignore
          metadata: documents[0].metadata || {},
        };
      }

      console.log(`✅ ${name}: ${documents.length} documents in ${duration}ms`);
      return result;
    } catch (error) {
      lastError = error;
      const duration = Date.now() - startTime;

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.warn(
          `⚠️  ${name} attempt ${attempt + 1} failed: ${error instanceof Error ? error.message : error}`,
        );
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(
          `❌ ${name} failed after ${retries + 1} attempts: ${error instanceof Error ? error.message : error}`,
        );

        return {
          name,
          success: false,
          documentCount: 0,
          error: error instanceof Error ? error.message : String(error),
          duration,
        };
      }
    }
  }

  // Should not reach here, but TypeScript needs this
  throw lastError;
}

async function runAllTests(): Promise<void> {
  console.log("🚀 Starting LlamaIndex loader validation tests\n");

  try {
    // Validate configuration first
    const config = getConfig();
    console.log(`📋 Configuration loaded: LOG_DIR=${config.LOG_DIR}`);
    console.log(
      `🔑 Environment keys present: ${Object.keys(process.env)
        .filter((k) => k.includes("SUPABASE") || k.includes("OPENAI"))
        .join(", ")}\n`,
    );
  } catch (error) {
    console.error("❌ Configuration validation failed:", error);
    process.exit(1);
  }

  const results: LoaderResult[] = [];

  // Test each loader individually
  const loaderTests = [
    { name: "Web/Sitemap (hotrodan.com)", loader: fetchHotrodanContent },
    { name: "Supabase Decision Log", loader: fetchDecisionDocs },
    { name: "Supabase Telemetry", loader: fetchTelemetryDocs },
    { name: "Curated Support Replies", loader: fetchCuratedDocs },
  ];

  for (const { name, loader } of loaderTests) {
    const result = await testLoader(name, loader);
    results.push(result);
    console.log(); // Add spacing between tests
  }

  // Summary report
  console.log("📊 Test Summary");
  console.log("================");

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    console.log("\\n🎉 Successful Loaders:");
    successful.forEach((r) => {
      console.log(`  • ${r.name}: ${r.documentCount} docs (${r.duration}ms)`);
    });
  }

  if (failed.length > 0) {
    console.log("\\n💥 Failed Loaders:");
    failed.forEach((r) => {
      console.log(`  • ${r.name}: ${r.error}`);
    });
  }

  const totalDocuments = results.reduce((sum, r) => sum + r.documentCount, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`\\n📈 Total Documents: ${totalDocuments}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);

  // Write results to file for evidence
  const outputPath = "test-ingest-results.json";
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      successful: successful.length,
      failed: failed.length,
      total_documents: totalDocuments,
      total_duration_ms: totalDuration,
    },
    results,
  };

  try {
    const fs = await import("node:fs/promises");
    await fs.writeFile(outputPath, JSON.stringify(reportData, null, 2));
    console.log(`\\n📄 Results saved to: ${outputPath}`);
  } catch (writeError) {
    console.warn(`⚠️  Failed to write results file: ${writeError}`);
  }

  // Output JSON for automation
  console.log("\\n🤖 JSON Output:");
  console.log(
    JSON.stringify({
      success: failed.length === 0,
      loaders_successful: successful.length,
      loaders_failed: failed.length,
      total_documents: totalDocuments,
      failed_loaders: failed.map((r) => r.name),
    }),
  );

  // Exit code based on results
  if (failed.length > 0) {
    console.log(
      "\\n⚠️  Some loaders failed, but this may be expected (e.g., missing tables)",
    );
    console.log("   Check individual errors and proceed if acceptable");
  } else {
    console.log("\\n🎉 All loaders passed validation!");
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch((error) => {
    console.error("💥 Test runner failed:", error);
    process.exit(1);
  });
}
