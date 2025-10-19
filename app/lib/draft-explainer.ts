/**
 * Draft Explainer — Help reviewers understand AI reasoning
 *
 * Generates explanations for why AI chose specific reply content.
 * Improves transparency and builds trust in HITL workflow.
 */

import type { ReplyDraft } from "~/agents/customer/draft-generator";

export interface DraftExplanation {
  reasoning: string[];
  ragInfluence: string[];
  confidenceFactors: string[];
  alternatives: string[];
  reviewGuidance: string;
}

/**
 * Generate explanation for draft reply
 */
export function explainDraft(draft: ReplyDraft): DraftExplanation {
  const reasoning: string[] = [];
  const ragInfluence: string[] = [];
  const confidenceFactors: string[] = [];
  const alternatives: string[] = [];

  // Explain customer intent analysis
  const lastCustomerMsg = draft.context
    .filter((m) => m.startsWith("[customer]"))
    .slice(-1)[0];
  if (lastCustomerMsg) {
    const query = lastCustomerMsg.replace("[customer]", "").trim();
    reasoning.push(`Customer inquiry: "${query}"`);

    // Detect query type
    if (/ship|track|deliver/i.test(query)) {
      reasoning.push("Detected shipping/delivery question");
      alternatives.push(
        "Could also provide tracking link if order number mentioned",
      );
    }
    if (/return|refund/i.test(query)) {
      reasoning.push("Detected return/refund inquiry");
      alternatives.push("Consider offering exchange as alternative to refund");
    }
    if (/compatible|fit/i.test(query)) {
      reasoning.push("Detected product compatibility question");
      alternatives.push(
        "Suggest verifying specific model details with customer",
      );
    }
  }

  // Explain RAG usage
  if (draft.evidence.ragSources && draft.evidence.ragSources.length > 0) {
    ragInfluence.push(
      `Used ${draft.evidence.ragSources.length} knowledge base articles`,
    );

    for (const source of draft.evidence.ragSources) {
      ragInfluence.push(`• ${source}`);
    }

    if (draft.evidence.confidence && draft.evidence.confidence >= 0.8) {
      ragInfluence.push("High RAG relevance - articles closely match query");
    } else if (draft.evidence.confidence && draft.evidence.confidence < 0.6) {
      ragInfluence.push(
        "Low RAG relevance - articles may not fully address query",
      );
      alternatives.push(
        "Consider adding more specific articles to knowledge base",
      );
    }
  } else {
    ragInfluence.push("No knowledge base articles used");
    ragInfluence.push(
      "Draft generated from general customer service knowledge",
    );
    alternatives.push(
      "Add relevant articles to knowledge base for better accuracy",
    );
  }

  // Explain confidence factors
  if (draft.evidence.confidence !== undefined) {
    const confidencePct = (draft.evidence.confidence * 100).toFixed(0);
    confidenceFactors.push(`Overall confidence: ${confidencePct}%`);

    if (draft.evidence.confidence >= 0.85) {
      confidenceFactors.push("High confidence - RAG sources strongly relevant");
    } else if (draft.evidence.confidence >= 0.7) {
      confidenceFactors.push("Moderate confidence - may need human refinement");
    } else {
      confidenceFactors.push(
        "Low confidence - manual review strongly recommended",
      );
      alternatives.push("Consider manual reply instead of editing draft");
    }
  }

  // Conversation complexity
  const messageCount = draft.context.length;
  if (messageCount > 10) {
    confidenceFactors.push(
      `Long conversation (${messageCount} messages) - context summarized`,
    );
  } else if (messageCount <= 3) {
    confidenceFactors.push(
      `Short conversation (${messageCount} messages) - limited context`,
    );
  }

  // Generate review guidance
  let reviewGuidance = "Review for tone, accuracy, and policy compliance. ";

  if (draft.evidence.confidence && draft.evidence.confidence < 0.7) {
    reviewGuidance += "⚠️ Low confidence - verify all facts before approving. ";
  }

  if (draft.risk.includes("Low confidence")) {
    reviewGuidance +=
      "Consider adding knowledge base articles for this topic. ";
  }

  if (messageCount > 10) {
    reviewGuidance += "Long thread - verify context was captured correctly.";
  }

  return {
    reasoning,
    ragInfluence,
    confidenceFactors,
    alternatives,
    reviewGuidance,
  };
}

/**
 * Format explanation as readable text
 */
export function formatExplanation(explanation: DraftExplanation): string {
  const sections: string[] = [];

  if (explanation.reasoning.length > 0) {
    sections.push("**Why this reply?**");
    sections.push(...explanation.reasoning.map((r) => `• ${r}`));
    sections.push("");
  }

  if (explanation.ragInfluence.length > 0) {
    sections.push("**Knowledge sources:**");
    sections.push(...explanation.ragInfluence.map((r) => `${r}`));
    sections.push("");
  }

  if (explanation.confidenceFactors.length > 0) {
    sections.push("**Confidence factors:**");
    sections.push(...explanation.confidenceFactors.map((f) => `• ${f}`));
    sections.push("");
  }

  if (explanation.alternatives.length > 0) {
    sections.push("**Alternative approaches:**");
    sections.push(...explanation.alternatives.map((a) => `• ${a}`));
    sections.push("");
  }

  sections.push("**Review guidance:**");
  sections.push(explanation.reviewGuidance);

  return sections.join("\n");
}

/**
 * Add explanation to Private Note
 */
export function enrichPrivateNoteWithExplanation(
  privateNote: string,
  explanation: DraftExplanation,
): string {
  const explanationText = formatExplanation(explanation);

  return `${privateNote}

---

## AI Reasoning

${explanationText}`;
}
