import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function reportPhaseStatus() {
  console.log("📊 PHASE STATUS REPORT (Database-Driven)");
  console.log("=".repeat(60));

  // Get all tasks grouped by phase
  const tasks = await prisma.taskAssignment.findMany({
    select: {
      taskId: true,
      title: true,
      status: true,
      priority: true,
      assignedTo: true,
      createdAt: true,
    },
    orderBy: [{ assignedTo: "asc" }, { priority: "asc" }],
  });

  // Group by phase (extract from taskId patterns)
  const phases: { [key: string]: any[] } = {};

  for (const task of tasks) {
    let phase = "Unknown";

    // Extract phase from taskId patterns
    if (
      task.taskId.includes("ENG-") ||
      task.taskId.includes("DES-") ||
      task.taskId.includes("DATA-")
    ) {
      if (
        task.taskId.includes("ENG-100") ||
        task.taskId.includes("DES-100") ||
        task.taskId.includes("DATA-100")
      ) {
        phase = "Phase 9 (Growth Engine Core)";
      } else if (
        task.taskId.includes("ENG-101") ||
        task.taskId.includes("DES-101") ||
        task.taskId.includes("DATA-101")
      ) {
        phase = "Phase 10 (Advanced Features)";
      } else if (
        task.taskId.includes("ENG-102") ||
        task.taskId.includes("DES-102") ||
        task.taskId.includes("DATA-102")
      ) {
        phase = "Phase 11 (AI Integration)";
      } else if (
        task.taskId.includes("ENG-103") ||
        task.taskId.includes("DES-103") ||
        task.taskId.includes("DATA-103")
      ) {
        phase = "Phase 12 (Analytics & Insights)";
      } else if (
        task.taskId.includes("ENG-104") ||
        task.taskId.includes("DES-104") ||
        task.taskId.includes("DATA-104")
      ) {
        phase = "Phase 13 (Production Polish)";
      } else {
        phase = "Phase 1-8 (Foundation)";
      }
    } else if (task.taskId.includes("PILOT-") || task.taskId.includes("AI-")) {
      phase = "Phase 9+ (AI & Pilot)";
    } else {
      phase = "Legacy Tasks";
    }

    if (!phases[phase]) {
      phases[phase] = [];
    }
    phases[phase].push(task);
  }

  // Report each phase
  for (const [phaseName, phaseTasks] of Object.entries(phases)) {
    const total = phaseTasks.length;
    const completed = phaseTasks.filter((t) => t.status === "completed").length;
    const inProgress = phaseTasks.filter(
      (t) => t.status === "in_progress",
    ).length;
    const blocked = phaseTasks.filter((t) => t.status === "blocked").length;
    const assigned = phaseTasks.filter((t) => t.status === "assigned").length;
    const cancelled = phaseTasks.filter((t) => t.status === "cancelled").length;

    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    console.log(`\n🎯 ${phaseName}`);
    console.log(`   Total Tasks: ${total}`);
    console.log(`   ✅ Completed: ${completed} (${completionPct}%)`);
    console.log(`   🔄 In Progress: ${inProgress}`);
    console.log(`   🚫 Blocked: ${blocked}`);
    console.log(`   📋 Assigned: ${assigned}`);
    console.log(`   ❌ Cancelled: ${cancelled}`);

    // Show top 5 tasks for this phase
    const topTasks = phaseTasks.slice(0, 5);
    if (topTasks.length > 0) {
      console.log(`   📝 Top Tasks:`);
      for (const task of topTasks) {
        const statusIcon =
          task.status === "completed"
            ? "✅"
            : task.status === "in_progress"
              ? "🔄"
              : task.status === "blocked"
                ? "🚫"
                : "📋";
        console.log(
          `      ${statusIcon} ${task.taskId}: ${task.title.substring(0, 50)}...`,
        );
      }
    }
  }

  // Overall summary
  const overallTotal = tasks.length;
  const overallCompleted = tasks.filter((t) => t.status === "completed").length;
  const overallCompletionPct =
    overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  console.log(`\n📈 OVERALL PROJECT STATUS`);
  console.log(`   Total Tasks: ${overallTotal}`);
  console.log(
    `   Overall Completion: ${overallCompleted} (${overallCompletionPct}%)`,
  );
  console.log(`   Active Phases: ${Object.keys(phases).length}`);

  // Show tasks that will be cancelled/downgraded
  const duplicateTasks = tasks.filter(
    (t) =>
      t.status === "assigned" &&
      (t.taskId.includes("ENG-") ||
        t.taskId.includes("DES-") ||
        t.taskId.includes("DATA-")),
  );

  if (duplicateTasks.length > 0) {
    console.log(`\n⚠️  TASKS TO REVIEW (${duplicateTasks.length} found):`);
    console.log(
      `   These tasks are assigned but may have been completed in DecisionLog:`,
    );
    for (const task of duplicateTasks.slice(0, 10)) {
      console.log(`   - ${task.taskId}: ${task.title.substring(0, 40)}...`);
    }
    if (duplicateTasks.length > 10) {
      console.log(`   ... and ${duplicateTasks.length - 10} more`);
    }
  }
}

reportPhaseStatus().finally(() => prisma.$disconnect());
