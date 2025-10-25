import prisma from "../../app/db.server";

async function completeTask() {
  console.log("🎉 Completing ADS-001...");

  const result = await prisma.decisionLog.create({
    data: {
      scope: "build",
      actor: "ads",
      taskId: "ADS-001",
      status: "completed",
      progressPct: 100,
      action: "task_completed",
      rationale: "Google Ads API integration complete - service, routes, test script, and documentation created",
      evidenceUrl: "app/services/ads/googleAdsApi.server.ts",
      durationActual: 2.0,
      payload: {
        commits: [],
        files: [
          { path: "app/services/ads/googleAdsApi.server.ts", lines: 95, type: "created" },
          { path: "app/routes/api.ads.test.ts", lines: 35, type: "created" },
          { path: "app/routes/api.ads.campaigns.ts", lines: 40, type: "created" },
          { path: "scripts/ads/test-google-ads-integration.ts", lines: 65, type: "created" },
          { path: "docs/google-ads-api-setup.md", lines: 120, type: "created" }
        ],
        tests: { overall: "Integration ready for testing with real credentials" },
      },
    },
  });

  console.log("✅ Task completed! ID:", result.id);
  return result;
}

completeTask()
  .then((r) => {
    console.log("\n🎉 ADS-001 COMPLETED - Result:", r.id);
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ ERROR:", err.message);
    process.exit(1);
  });
