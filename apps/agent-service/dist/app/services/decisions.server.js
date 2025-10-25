import { Prisma } from "@prisma/kb-client";
import kbPrisma from "../kb-db.server";
import { getSupabaseConfig } from "../config/supabase.server";
import { supabaseMemory } from "../../packages/memory/supabase";
// Use KB database for decision logging (keeps dev data separate from production)
const prisma = kbPrisma;
export async function logDecision(input) {
    const decision = await prisma.decisionLog.create({
        data: {
            scope: input.scope,
            actor: input.actor,
            action: input.action,
            rationale: input.rationale,
            evidenceUrl: input.evidenceUrl,
            payload: input.payload ?? Prisma.JsonNull,
            // Enhanced feedback tracking fields
            taskId: input.taskId,
            status: input.status,
            progressPct: input.progressPct,
            blockerDetails: input.blockerDetails,
            blockedBy: input.blockedBy,
            durationEstimate: input.durationEstimate,
            durationActual: input.durationActual,
            nextAction: input.nextAction,
            // Override timestamp for historical imports
            ...(input.createdAt && { createdAt: input.createdAt }),
        },
    });
    const supabaseConfig = getSupabaseConfig();
    if (supabaseConfig) {
        try {
            const memory = supabaseMemory(supabaseConfig.url, supabaseConfig.serviceKey);
            const memoryDecision = {
                id: String(decision.id),
                scope: input.scope,
                who: input.actor,
                what: input.action,
                why: input.rationale ?? "",
                sha: undefined,
                evidenceUrl: input.evidenceUrl,
                createdAt: decision.createdAt.toISOString(),
            };
            await memory.putDecision(memoryDecision);
        }
        catch (error) {
            console.error("Failed to push decision to Supabase memory", error);
        }
    }
    return decision;
}
// Helper function to calculate average self-grade
export function calculateSelfGradeAverage(grades) {
    const sum = grades.progress +
        grades.evidence +
        grades.alignment +
        grades.toolDiscipline +
        grades.communication;
    return Math.round((sum / 5) * 10) / 10; // Round to 1 decimal
}
//# sourceMappingURL=decisions.server.js.map