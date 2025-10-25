import prisma from "../../app/db.server";

async function logProgress() {
  console.log("📊 Logging ADS-001 progress...");

  const result = await prisma.decisionLog.create({
    data: {
      scope: "build",
      actor: "ads",
      taskId: "ADS-001",
      status: "in_progress",
      progressPct: 75,
      action: "task_progress",
      rationale: "Google Ads API integration implemented - service, routes, and test script created",
      evidenceUrl: "app/services/ads/googleAdsApi.server.ts",
      durationActual: 1.5,
      nextAction: "Test integration with real credentials",
      payload: {
        commits: [],
        files: [
          { path: "app/services/ads/googleAdsApi.server.ts", lines: 95, type: "created" },
          { path: "app/routes/api.ads.test.ts", lines: 35, type: "created" },
          { path: "app/routes/api.ads.campaigns.ts", lines: 40, type: "created" },
          { path: "scripts/ads/test-google-ads-integration.ts", lines: 65, type: "created" },
          { path: "docs/google-ads-api-setup.md", lines: 120, type: "created" }
        ],
        tests: { overall: "Integration ready for testing" },
      },
    },
  });

  console.log("✅ Progress logged! ID:", result.id);
  return result;
}

logProgress()
  .then((r) => {
    console.log("\n✅ DONE - Result:", r.id);
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ ERROR:", err.message);
    process.exit(1);
  });
