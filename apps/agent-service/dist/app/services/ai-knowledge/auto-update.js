/**
 * Automated Knowledge Base Update Service
 *
 * Automatically updates KB articles based on:
 * - New information from conversations
 * - Policy/product changes
 * - Quality feedback
 *
 * Growth Engine: Automated Knowledge Maintenance
 */
import { OpenAI } from "openai";
import prisma from "~/db.server";
import { updateArticle, getArticleById } from "~/services/knowledge";
import { logDecision } from "~/services/decisions.server";
// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Detect outdated articles
 *
 * @param days - Consider articles older than this many days
 * @returns Array of potentially outdated articles
 */
export async function detectOutdatedArticles(days = 90) {
    try {
        console.log(`[Auto Update] Detecting outdated articles (>${days} days)`);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const articles = await prisma.knowledge_base.findMany({
            where: {
                is_current: true,
                project: "occ",
                updated_at: {
                    lt: cutoffDate,
                },
            },
            take: 20,
            orderBy: {
                updated_at: "asc",
            },
        });
        const outdated = articles.map((article) => {
            const age = Math.floor((Date.now() - (article.updated_at || article.created_at || new Date()).getTime()) /
                (1000 * 60 * 60 * 24));
            return {
                articleId: article.id,
                title: article.title,
                age,
                lastUpdated: article.updated_at || article.created_at || new Date(),
                reason: `Not updated in ${age} days`,
            };
        });
        console.log(`[Auto Update] ✅ Found ${outdated.length} potentially outdated articles`);
        return outdated;
    }
    catch (error) {
        console.error(`[Auto Update] ❌ Error detecting outdated articles:`, error);
        return [];
    }
}
/**
 * Generate update suggestion using AI
 *
 * @param articleId - Article to update
 * @param newInformation - New information to incorporate
 * @returns Update suggestion
 */
export async function generateUpdateSuggestion(articleId, newInformation) {
    try {
        console.log(`[Auto Update] Generating update suggestion for: ${articleId}`);
        const article = await getArticleById(articleId);
        if (!article) {
            console.warn(`[Auto Update] Article not found: ${articleId}`);
            return null;
        }
        const prompt = `You are a knowledge base editor. Review this FAQ article and suggest an updated version that incorporates new information.

Current Article:
Question: ${article.question}
Answer: ${article.answer}

New Information:
${newInformation.map((info, i) => `${i + 1}. ${info}`).join("\n")}

Generate an updated answer that:
1. Incorporates the new information
2. Maintains accuracy and clarity
3. Keeps the same helpful tone
4. Removes any outdated information

Updated Answer:`;
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a knowledge base editor who updates FAQ articles with new information.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 600,
        });
        const suggestedContent = response.choices[0].message.content || "";
        console.log(`[Auto Update] ✅ Generated update suggestion`);
        return {
            articleId,
            currentContent: article.answer,
            suggestedContent,
            reason: "Incorporating new information from recent conversations",
            confidence: 0.8,
            evidence: newInformation,
        };
    }
    catch (error) {
        console.error(`[Auto Update] ❌ Error generating suggestion:`, error);
        return null;
    }
}
/**
 * Apply update to article
 *
 * @param suggestion - Update suggestion
 * @param autoApprove - Whether to auto-approve (default: false)
 * @returns True if updated successfully
 */
export async function applyUpdate(suggestion, autoApprove = false) {
    try {
        console.log(`[Auto Update] Applying update to: ${suggestion.articleId}`);
        // Log the suggestion for review
        await logDecision({
            scope: "learn",
            actor: "ai-knowledge",
            action: "update_suggested",
            rationale: suggestion.reason,
            payload: {
                articleId: suggestion.articleId,
                confidence: suggestion.confidence,
                evidence: suggestion.evidence,
                autoApprove,
            },
        });
        // Only auto-apply if confidence is high and auto-approve is enabled
        if (autoApprove && suggestion.confidence >= 0.9) {
            const result = await updateArticle(suggestion.articleId, {
                content: suggestion.suggestedContent,
            });
            if (result) {
                console.log(`[Auto Update] ✅ Article updated successfully`);
                return true;
            }
        }
        else {
            console.log(`[Auto Update] ⏸️ Update queued for human review`);
        }
        return false;
    }
    catch (error) {
        console.error(`[Auto Update] ❌ Error applying update:`, error);
        return false;
    }
}
/**
 * Run automated knowledge base updates
 *
 * @param autoApprove - Whether to auto-approve high-confidence updates
 * @returns Summary of update results
 */
export async function runAutomatedUpdates(autoApprove = false) {
    console.log(`[Auto Update] Starting automated knowledge base updates`);
    try {
        // Detect outdated articles
        const outdated = await detectOutdatedArticles(90);
        let suggestionsGenerated = 0;
        let updatesApplied = 0;
        // For each outdated article, check if we have new information
        for (const article of outdated.slice(0, 5)) {
            // This would gather new information from conversations
            // For now, skip actual update generation
            console.log(`[Auto Update] Analyzing: ${article.title}`);
        }
        console.log(`[Auto Update] ✅ Automated updates complete`);
        return {
            articlesAnalyzed: outdated.length,
            suggestionsGenerated,
            updatesApplied,
            timestamp: new Date(),
        };
    }
    catch (error) {
        console.error(`[Auto Update] ❌ Error in automated updates:`, error);
        return {
            articlesAnalyzed: 0,
            suggestionsGenerated: 0,
            updatesApplied: 0,
            timestamp: new Date(),
        };
    }
}
/**
 * Monitor KB health and trigger updates
 *
 * @returns Health report with recommended actions
 */
export async function monitorKBHealth() {
    try {
        console.log(`[Auto Update] Monitoring KB health`);
        const totalArticles = await prisma.knowledge_base.count({
            where: {
                is_current: true,
                project: "occ",
            },
        });
        const outdated = await detectOutdatedArticles(90);
        const recommendedActions = [];
        if (outdated.length > 0) {
            recommendedActions.push(`Review ${outdated.length} outdated articles`);
        }
        if (totalArticles < 20) {
            recommendedActions.push("Generate more FAQ articles from conversations");
        }
        console.log(`[Auto Update] ✅ Health monitoring complete`);
        return {
            totalArticles,
            outdatedArticles: outdated.length,
            lowConfidenceArticles: 0,
            recommendedActions,
            timestamp: new Date(),
        };
    }
    catch (error) {
        console.error(`[Auto Update] ❌ Error monitoring health:`, error);
        return {
            totalArticles: 0,
            outdatedArticles: 0,
            lowConfidenceArticles: 0,
            recommendedActions: [],
            timestamp: new Date(),
        };
    }
}
//# sourceMappingURL=auto-update.js.map