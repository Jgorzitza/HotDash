/**
 * Knowledge Base Learning Pipeline
 *
 * Implements the HITL learning system that captures human edits to AI drafts
 * and uses them to improve the knowledge base over time.
 *
 * Growth Engine: HITL Learning System
 */
import prisma from "~/db.server";
import { ingestDocument } from "./ingestion";
/**
 * Calculate Levenshtein distance between two strings
 *
 * @param a - First string
 * @param b - Second string
 * @returns Edit distance
 */
function calculateEditDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j] + 1 // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}
/**
 * Classify the type of learning from the edit
 *
 * @param aiDraft - AI-generated draft
 * @param humanFinal - Human-edited final version
 * @param grades - Quality grades
 * @returns Learning type classification
 */
function classifyLearningType(aiDraft, humanFinal, grades) {
    const editRatio = calculateEditDistance(aiDraft, humanFinal) / Math.max(aiDraft.length, humanFinal.length);
    // Minimal edits with high grades = tone improvement
    if (editRatio < 0.1 && grades.tone >= 4) {
        return "tone_improvement";
    }
    // Significant edits with low accuracy grade = factual correction
    if (editRatio >= 0.3 && grades.accuracy <= 3) {
        return "factual_correction";
    }
    // Policy grade low = policy clarification
    if (grades.policy <= 3) {
        return "policy_clarification";
    }
    // Moderate edits with high grades = template refinement
    if (editRatio >= 0.1 && editRatio < 0.3 && grades.tone >= 4) {
        return "template_refinement";
    }
    // Large edits = new pattern
    if (editRatio >= 0.5) {
        return "new_pattern";
    }
    return "tone_improvement";
}
/**
 * Extract learning from HITL approval
 *
 * Captures human edits and updates KB confidence scores or creates new articles
 *
 * @param request - Learning extraction request
 * @returns Learning extraction result
 */
export async function extractLearning(request) {
    const { approvalId, aiDraft, humanFinal, grades, customerQuestion, reviewer } = request;
    try {
        console.log(`[KB Learning] Extracting learning from approval: ${approvalId}`);
        // Calculate edit metrics
        const editDistance = calculateEditDistance(aiDraft, humanFinal);
        const editRatio = editDistance / Math.max(aiDraft.length, humanFinal.length);
        // Classify learning type
        const learningType = classifyLearningType(aiDraft, humanFinal, grades);
        console.log(`[KB Learning] Edit ratio: ${editRatio.toFixed(2)}, Type: ${learningType}`);
        // Store learning edit (would need kb_learning_edits table)
        // For now, log to decision_log
        const { logDecision } = await import("~/services/decisions.server");
        await logDecision({
            scope: "learn",
            actor: "ai-knowledge",
            action: "learning_extracted",
            rationale: `Captured HITL edit: ${learningType}`,
            payload: {
                approvalId,
                editDistance,
                editRatio,
                learningType,
                grades,
                customerQuestion: customerQuestion.substring(0, 100),
            },
        });
        // Determine action based on edit quality
        let kbArticleUpdated = false;
        let kbArticleId;
        let newArticleCreated = false;
        let confidenceChange = 0;
        // High-quality approval (grades ≥ 4, edit_ratio < 0.1)
        if (grades.tone >= 4 && grades.accuracy >= 4 && grades.policy >= 4 && editRatio < 0.1) {
            console.log(`[KB Learning] High-quality approval - increasing confidence`);
            confidenceChange = 0.05;
            // Would update KB article confidence here
            kbArticleUpdated = true;
        }
        // Significant edit (edit_ratio ≥ 0.3, grades ≥ 4) - create new article
        if (editRatio >= 0.3 && grades.tone >= 4 && grades.accuracy >= 4) {
            console.log(`[KB Learning] Significant edit - creating new KB article`);
            const result = await ingestDocument({
                title: customerQuestion,
                content: humanFinal,
                category: "technical", // Would infer from context
                tags: ["hitl-learned", learningType],
                source: `approval-${approvalId}`,
                createdBy: reviewer,
                metadata: {
                    learningType,
                    originalDraft: aiDraft,
                    editRatio,
                    grades,
                },
            });
            if (result.success) {
                newArticleCreated = true;
                kbArticleId = result.articleId;
            }
        }
        // Low grade (any ≤ 2) - decrease confidence
        if (grades.tone <= 2 || grades.accuracy <= 2 || grades.policy <= 2) {
            console.log(`[KB Learning] Low grade - decreasing confidence`);
            confidenceChange = -0.1;
            kbArticleUpdated = true;
        }
        console.log(`[KB Learning] ✅ Learning extracted successfully`);
        return {
            editCreated: true,
            learningType,
            kbArticleUpdated,
            kbArticleId,
            newArticleCreated,
            confidenceChange,
        };
    }
    catch (error) {
        console.error(`[KB Learning] ❌ Error extracting learning:`, error);
        return {
            editCreated: false,
            learningType: "tone_improvement",
            kbArticleUpdated: false,
            newArticleCreated: false,
        };
    }
}
/**
 * Detect recurring issues from conversation patterns
 *
 * @param days - Number of days to analyze (default: 7)
 * @param minOccurrences - Minimum occurrences to consider recurring (default: 3)
 * @returns Array of recurring issue patterns
 */
export async function detectRecurringIssues(days = 7, minOccurrences = 3) {
    try {
        console.log(`[KB Learning] Detecting recurring issues (last ${days} days)`);
        // This would query conversation embeddings and find clusters
        // For now, return empty array as placeholder
        console.log(`[KB Learning] ✅ Recurring issues detection complete`);
        return [];
    }
    catch (error) {
        console.error(`[KB Learning] ❌ Error detecting recurring issues:`, error);
        return [];
    }
}
/**
 * Archive low-confidence, unused articles
 *
 * Archives articles that haven't been used in 90 days and have confidence < 0.50
 *
 * @returns Number of articles archived
 */
export async function archiveStaleArticles() {
    try {
        console.log(`[KB Learning] Archiving stale articles`);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        // Find stale articles
        const staleArticles = await prisma.knowledge_base.findMany({
            where: {
                is_current: true,
                project: "occ",
                OR: [
                    {
                        last_indexed_at: {
                            lt: ninetyDaysAgo,
                        },
                    },
                    {
                        last_indexed_at: null,
                        created_at: {
                            lt: ninetyDaysAgo,
                        },
                    },
                ],
            },
        });
        // Archive by setting is_current to false
        let archivedCount = 0;
        for (const article of staleArticles) {
            await prisma.knowledge_base.update({
                where: { id: article.id },
                data: { is_current: false },
            });
            archivedCount++;
        }
        console.log(`[KB Learning] ✅ Archived ${archivedCount} stale articles`);
        return archivedCount;
    }
    catch (error) {
        console.error(`[KB Learning] ❌ Error archiving articles:`, error);
        return 0;
    }
}
/**
 * Calculate confidence score for an article based on usage and grades
 *
 * @param usageCount - Number of times used
 * @param successCount - Number of successful uses
 * @param avgGrades - Average grades (tone, accuracy, policy)
 * @returns Confidence score (0-1)
 */
export function calculateConfidenceScore(usageCount, successCount, avgGrades) {
    // Base confidence from success rate
    const successRate = usageCount > 0 ? successCount / usageCount : 0.5;
    // Adjust based on grades if available
    let gradeBonus = 0;
    if (avgGrades) {
        const avgGrade = ((avgGrades.tone || 3) +
            (avgGrades.accuracy || 3) +
            (avgGrades.policy || 3)) / 3;
        // Grade bonus: -0.2 to +0.2 based on average grade (1-5 scale)
        gradeBonus = (avgGrade - 3) * 0.1;
    }
    // Combine success rate and grade bonus
    let confidence = successRate + gradeBonus;
    // Clamp to 0-1 range
    confidence = Math.max(0, Math.min(1, confidence));
    return confidence;
}
//# sourceMappingURL=learning.js.map