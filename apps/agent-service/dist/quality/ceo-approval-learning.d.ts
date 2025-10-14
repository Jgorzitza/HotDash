/**
 * CEO Approval Learning System
 *
 * Tracks CEO approvals, edits, and rejections to improve AI responses.
 * Learns CEO's voice, tone, and preferences over time.
 *
 * Direction Reference: docs/directions/chatwoot.md lines 59-65
 */
export interface CEOApprovalRecord {
    id: string;
    conversationId: number;
    proposedMessage: string;
    approvedMessage: string;
    wasEdited: boolean;
    editDiff?: {
        addedWords: string[];
        removedWords: string[];
        toneShift?: string;
    };
    intent: string;
    originalConfidence: number;
    approvedAt: Date;
    timeToApproval: number;
    metadata?: Record<string, any>;
}
export interface CEOLearningInsights {
    totalApprovals: number;
    approvalRate: number;
    avgEditCount: number;
    commonEdits: {
        type: string;
        frequency: number;
    }[];
    tonePreferences: {
        tone: string;
        frequency: number;
    }[];
    phrasesToAvoid: string[];
    preferredPhrases: string[];
}
/**
 * Manages CEO approval learning and feedback
 */
export declare class CEOApprovalLearning {
    private approvals;
    private readonly maxHistory;
    /**
     * Track CEO approval
     */
    trackApproval(record: Omit<CEOApprovalRecord, 'id' | 'approvedAt' | 'wasEdited' | 'editDiff'>): Promise<void>;
    /**
     * Calculate diff between proposed and approved messages
     */
    private calculateDiff;
    /**
     * Get learning insights from CEO approval history
     */
    getInsights(): CEOLearningInsights;
    /**
     * Get confidence adjustment based on CEO approval history
     *
     * If CEO frequently edits responses of a certain intent or confidence level,
     * we should lower confidence for similar future responses.
     */
    adjustConfidence(originalConfidence: number, intent: string): number;
    /**
     * Get CEO-preferred tone for intent type
     */
    getPreferredTone(intent: string): string;
    /**
     * Build prompt enhancement from CEO learnings
     */
    buildPromptEnhancement(): string;
    /**
     * Export approval data for training
     */
    exportForTraining(): {
        input: string;
        output: string;
        metadata: any;
    }[];
    /**
     * Get approval statistics
     */
    getStats(): {
        total: number;
        approvalRate: string;
        avgEditCount: string;
        topTone: string;
        phrasesToAvoid: string[];
        preferredPhrases: string[];
    };
}
export declare const ceoLearning: CEOApprovalLearning;
//# sourceMappingURL=ceo-approval-learning.d.ts.map