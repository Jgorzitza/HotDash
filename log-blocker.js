import { logDecision } from "~/services/decisions.server";

async function logBlocker() {
  try {
    await logDecision({
      scope: "build",
      actor: "content",
      action: "task_blocked",
      rationale: "Database connection pool timeout preventing task retrieval. Connection pool timeout: 10s, connection limit: 13. Cannot access task database to get newly assigned tasks.",
      status: "blocked",
      blockerDetails: "PrismaClientInitializationError: Timed out fetching a new connection from the connection pool",
      blockedBy: "database-connection-pool",
      nextAction: "Wait for database connection pool issue to be resolved",
      payload: {
        blockerType: "technical",
        attemptedSolutions: ["Tried to get tasks from database"],
        impact: "Cannot access newly assigned tasks or begin work",
        urgency: "high",
        errorCode: "PrismaClientInitializationError",
        connectionPoolTimeout: "10s",
        connectionLimit: 13
      }
    });
    console.log("✅ Blocker logged successfully");
  } catch (error) {
    console.error("Failed to log blocker to database", error);
  }
}

logBlocker();