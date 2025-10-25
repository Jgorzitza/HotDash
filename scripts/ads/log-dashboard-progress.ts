import prisma from "../../app/db.server";

async function logDashboardProgress() {
  console.log("📊 Logging ADS-002 progress...");

  const result = await prisma.decisionLog.create({
    data: {
      scope: "build",
      actor: "ads",
      taskId: "ADS-002",
      status: "in_progress",
      progressPct: 90,
      action: "task_progress",
      rationale: "Ad Performance Dashboard implemented with Recharts - multiple chart types, metrics display, and test page created",
      evidenceUrl: "app/components/ads/AdPerformanceDashboard.tsx",
      durationActual: 1.5,
      nextAction: "Test dashboard functionality",
      payload: {
        commits: [],
        files: [
          { path: "app/routes/ads.dashboard.tsx", lines: 60, type: "created" },
          { path: "app/components/ads/AdPerformanceDashboard.tsx", lines: 200, type: "created" },
          { path: "app/routes/ads.test.tsx", lines: 80, type: "created" }
        ],
        tests: { overall: "Dashboard ready for testing" },
      },
    },
  });

  console.log("✅ Progress logged! ID:", result.id);
  return result;
}

logDashboardProgress()
  .then((r) => {
    console.log("\n✅ DONE - Result:", r.id);
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ ERROR:", err.message);
    process.exit(1);
  });
