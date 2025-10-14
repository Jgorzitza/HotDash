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
    toneShift?: string; // 'more_empathetic', 'less_formal', 'more_direct'
  };
  intent: string;
  originalConfidence: number;
  approvedAt: Date;
  timeToApproval: number; // milliseconds
  metadata?: Record<string, any>;
}

export interface CEOLearningInsights {
  totalApprovals: number;
  approvalRate: number; // % approved without edits
  avgEditCount: number;
  commonEdits: { type: string; frequency: number }[];
  tonePreferences: { tone: string; frequency: number }[];
  phrasesToAvoid: string[];
  preferredPhrases: string[];
}

/**
 * Manages CEO approval learning and feedback
 */
export class CEOApprovalLearning {
  private approvals: CEOApprovalRecord[] = [];
  private readonly maxHistory = 1000; // Keep last 1000 approvals

  /**
   * Track CEO approval
   */
  async trackApproval(record: Omit<CEOApprovalRecord, 'id' | 'approvedAt' | 'wasEdited' | 'editDiff'>): Promise<void> {
    const wasEdited = record.proposedMessage !== record.approvedMessage;
    const editDiff = wasEdited ? this.calculateDiff(record.proposedMessage, record.approvedMessage) : undefined;

    const approval: CEOApprovalRecord = {
      ...record,
      id: `ceo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      approvedAt: new Date(),
      wasEdited,
      editDiff,
    };

    this.approvals.push(approval);

    // Keep only recent history
    if (this.approvals.length > this.maxHistory) {
      this.approvals = this.approvals.slice(-this.maxHistory);
    }

    console.log('[CEO Learning] Tracked approval:', {
      conversationId: approval.conversationId,
      wasEdited,
      confidence: approval.originalConfidence,
      intent: approval.intent,
    });

    // Log for future training
    if (wasEdited && editDiff) {
      console.log('[CEO Learning] Edit patterns:', {
        addedWords: editDiff.addedWords.slice(0, 5),
        removedWords: editDiff.removedWords.slice(0, 5),
        toneShift: editDiff.toneShift,
      });
    }
  }

  /**
   * Calculate diff between proposed and approved messages
   */
  private calculateDiff(proposed: string, approved: string) {
    const proposedWords = new Set(proposed.toLowerCase().split(/\s+/));
    const approvedWords = new Set(approved.toLowerCase().split(/\s+/));

    const addedWords = Array.from(approvedWords).filter(w => !proposedWords.has(w));
    const removedWords = Array.from(proposedWords).filter(w => !approvedWords.has(w));

    // Detect tone shift
    let toneShift: string | undefined;
    
    const empathyWords = ['sorry', 'apologize', 'understand', 'appreciate'];
    const addedEmpathy = addedWords.filter(w => empathyWords.includes(w)).length;
    const removedFormal = removedWords.filter(w => ['regards', 'sincerely', 'formally'].includes(w)).length;
    
    if (addedEmpathy > 0) {
      toneShift = 'more_empathetic';
    } else if (removedFormal > 0) {
      toneShift = 'less_formal';
    } else if (approved.length < proposed.length * 0.7) {
      toneShift = 'more_concise';
    } else if (approved.length > proposed.length * 1.3) {
      toneShift = 'more_detailed';
    }

    return {
      addedWords,
      removedWords,
      toneShift,
    };
  }

  /**
   * Get learning insights from CEO approval history
   */
  getInsights(): CEOLearningInsights {
    if (this.approvals.length === 0) {
      return {
        totalApprovals: 0,
        approvalRate: 0,
        avgEditCount: 0,
        commonEdits: [],
        tonePreferences: [],
        phrasesToAvoid: [],
        preferredPhrases: [],
      };
    }

    const edited = this.approvals.filter(a => a.wasEdited);
    const approvalRate = ((this.approvals.length - edited.length) / this.approvals.length) * 100;

    // Aggregate edit patterns
    const toneShifts: Record<string, number> = {};
    const addedPhrases: Record<string, number> = {};
    const removedPhrases: Record<string, number> = {};

    for (const approval of edited) {
      if (approval.editDiff?.toneShift) {
        toneShifts[approval.editDiff.toneShift] = (toneShifts[approval.editDiff.toneShift] || 0) + 1;
      }

      // Track commonly added/removed phrases
      approval.editDiff?.addedWords.forEach(word => {
        if (word.length > 3) {  // Skip short words
          addedPhrases[word] = (addedPhrases[word] || 0) + 1;
        }
      });

      approval.editDiff?.removedWords.forEach(word => {
        if (word.length > 3) {
          removedPhrases[word] = (removedPhrases[word] || 0) + 1;
        }
      });
    }

    // Sort by frequency
    const commonEdits = Object.entries(toneShifts)
      .map(([type, frequency]) => ({ type, frequency }))
      .sort((a, b) => b.frequency - a.frequency);

    const tonePreferences = Object.entries(toneShifts)
      .map(([tone, frequency]) => ({ tone, frequency }))
      .sort((a, b) => b.frequency - a.frequency);

    const preferredPhrases = Object.entries(addedPhrases)
      .filter(([_, count]) => count >= 3)  // Added at least 3 times
      .map(([phrase, _]) => phrase)
      .slice(0, 20);

    const phrasesToAvoid = Object.entries(removedPhrases)
      .filter(([_, count]) => count >= 3)  // Removed at least 3 times
      .map(([phrase, _]) => phrase)
      .slice(0, 20);

    return {
      totalApprovals: this.approvals.length,
      approvalRate,
      avgEditCount: edited.length / this.approvals.length,
      commonEdits,
      tonePreferences,
      phrasesToAvoid,
      preferredPhrases,
    };
  }

  /**
   * Get confidence adjustment based on CEO approval history
   * 
   * If CEO frequently edits responses of a certain intent or confidence level,
   * we should lower confidence for similar future responses.
   */
  adjustConfidence(originalConfidence: number, intent: string): number {
    const relevantApprovals = this.approvals.filter(a => a.intent === intent);
    
    if (relevantApprovals.length < 5) {
      // Not enough data, return original confidence
      return originalConfidence;
    }

    const editRate = relevantApprovals.filter(a => a.wasEdited).length / relevantApprovals.length;
    
    // If CEO edits > 50% of this intent type, lower confidence
    if (editRate > 0.5) {
      return originalConfidence * 0.8; // Reduce by 20%
    }

    // If CEO rarely edits (< 20%), we can be slightly more confident
    if (editRate < 0.2) {
      return Math.min(1.0, originalConfidence * 1.1); // Increase by 10%, max 1.0
    }

    return originalConfidence;
  }

  /**
   * Get CEO-preferred tone for intent type
   */
  getPreferredTone(intent: string): string {
    const relevantEdits = this.approvals
      .filter(a => a.intent === intent && a.editDiff?.toneShift)
      .map(a => a.editDiff!.toneShift!);

    if (relevantEdits.length === 0) {
      return 'professional'; // Default
    }

    // Find most common tone shift for this intent
    const toneCounts: Record<string, number> = {};
    relevantEdits.forEach(tone => {
      toneCounts[tone] = (toneCounts[tone] || 0) + 1;
    });

    const sortedTones = Object.entries(toneCounts)
      .sort((a, b) => b[1] - a[1]);

    return sortedTones[0]?.[0] || 'professional';
  }

  /**
   * Build prompt enhancement from CEO learnings
   */
  buildPromptEnhancement(): string {
    const insights = this.getInsights();
    
    if (insights.totalApprovals < 10) {
      return ''; // Not enough data yet
    }

    const parts: string[] = [];

    if (insights.tonePreferences.length > 0) {
      const topTone = insights.tonePreferences[0];
      parts.push(`Preferred tone: ${topTone.tone.replace(/_/g, ' ')}`);
    }

    if (insights.preferredPhrases.length > 0) {
      parts.push(`CEO prefers phrases like: ${insights.preferredPhrases.slice(0, 5).join(', ')}`);
    }

    if (insights.phrasesToAvoid.length > 0) {
      parts.push(`Avoid phrases like: ${insights.phrasesToAvoid.slice(0, 5).join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Export approval data for training
   */
  exportForTraining(): { input: string; output: string; metadata: any }[] {
    return this.approvals.map(approval => ({
      input: `Customer intent: ${approval.intent}\nProposed: ${approval.proposedMessage}`,
      output: approval.approvedMessage,
      metadata: {
        conversationId: approval.conversationId,
        wasEdited: approval.wasEdited,
        confidence: approval.originalConfidence,
        intent: approval.intent,
        approvedAt: approval.approvedAt,
        toneShift: approval.editDiff?.toneShift,
      },
    }));
  }

  /**
   * Get approval statistics
   */
  getStats() {
    const insights = this.getInsights();
    
    return {
      total: insights.totalApprovals,
      approvalRate: insights.approvalRate.toFixed(1) + '%',
      avgEditCount: insights.avgEditCount.toFixed(2),
      topTone: insights.tonePreferences[0]?.tone || 'N/A',
      phrasesToAvoid: insights.phrasesToAvoid.slice(0, 5),
      preferredPhrases: insights.preferredPhrases.slice(0, 5),
    };
  }
}

// Export singleton
export const ceoLearning = new CEOApprovalLearning();

