/**
 * Draft Versioning — Track iterations on same conversation
 *
 * Stores multiple draft versions for a conversation to:
 * - Learn from multi-round edits
 * - Track improvement patterns
 * - Enable draft comparison
 */

export interface DraftVersion {
  id: string;
  conversationId: string;
  version: number; // 1, 2, 3...
  draftReply: string;
  humanReply?: string;
  createdAt: string;
  approvedAt?: string;

  // Quality scores
  tone?: number;
  accuracy?: number;
  policy?: number;

  // Context
  ragSources?: string[];
  confidence?: number;

  // Relationships
  previousVersionId?: string;
  supersededBy?: string;
}

export interface VersionComparison {
  conversationId: string;
  versions: DraftVersion[];
  improvements: Array<{
    metric: "tone" | "accuracy" | "policy" | "editDistance";
    trend: "improving" | "declining" | "stable";
    change: number;
  }>;
  learningSignals: string[];
}

/**
 * Create new draft version
 */
export function createDraftVersion(
  conversationId: string,
  draftReply: string,
  options: {
    ragSources?: string[];
    confidence?: number;
    previousVersionId?: string;
  } = {},
): DraftVersion {
  const existingVersions = getDraftVersions(conversationId);
  const nextVersion = existingVersions.length + 1;

  return {
    id: `draft-${conversationId}-v${nextVersion}-${Date.now()}`,
    conversationId,
    version: nextVersion,
    draftReply,
    createdAt: new Date().toISOString(),
    ragSources: options.ragSources,
    confidence: options.confidence,
    previousVersionId: options.previousVersionId,
  };
}

/**
 * Get all draft versions for a conversation
 * TODO: Implement Supabase storage
 */
export function getDraftVersions(conversationId: string): DraftVersion[] {
  // Stub implementation - returns empty array
  // In production, query Supabase draft_versions table
  return [];
}

/**
 * Update draft version with approval data
 */
export function approveDraftVersion(
  versionId: string,
  humanReply: string,
  grading: {
    tone: number;
    accuracy: number;
    policy: number;
  },
): DraftVersion | null {
  // Stub implementation
  // In production, update Supabase record
  return null;
}

/**
 * Compare versions to identify improvements
 */
export function compareVersions(conversationId: string): VersionComparison {
  const versions = getDraftVersions(conversationId);

  if (versions.length < 2) {
    return {
      conversationId,
      versions,
      improvements: [],
      learningSignals: ["Need at least 2 versions to compare"],
    };
  }

  // Sort by version number
  const sortedVersions = versions.sort((a, b) => a.version - b.version);

  // Calculate improvements between consecutive versions
  const improvements: VersionComparison["improvements"] = [];
  const learningSignals: string[] = [];

  for (let i = 1; i < sortedVersions.length; i++) {
    const prev = sortedVersions[i - 1];
    const curr = sortedVersions[i];

    // Compare tone scores
    if (prev.tone && curr.tone) {
      const toneChange = curr.tone - prev.tone;
      improvements.push({
        metric: "tone",
        trend:
          toneChange > 0
            ? "improving"
            : toneChange < 0
              ? "declining"
              : "stable",
        change: toneChange,
      });

      if (toneChange > 0) {
        learningSignals.push(
          `Tone improved by ${toneChange} points in version ${curr.version}`,
        );
      }
    }

    // Compare accuracy scores
    if (prev.accuracy && curr.accuracy) {
      const accuracyChange = curr.accuracy - prev.accuracy;
      improvements.push({
        metric: "accuracy",
        trend:
          accuracyChange > 0
            ? "improving"
            : accuracyChange < 0
              ? "declining"
              : "stable",
        change: accuracyChange,
      });
    }

    // Compare policy scores
    if (prev.policy && curr.policy) {
      const policyChange = curr.policy - prev.policy;
      improvements.push({
        metric: "policy",
        trend:
          policyChange > 0
            ? "improving"
            : policyChange < 0
              ? "declining"
              : "stable",
        change: policyChange,
      });
    }

    // Compare confidence
    if (prev.confidence && curr.confidence) {
      const confidenceChange = curr.confidence - prev.confidence;
      if (confidenceChange > 0.1) {
        learningSignals.push(
          `Confidence increased by ${(confidenceChange * 100).toFixed(0)}% in version ${curr.version}`,
        );
      }
    }
  }

  // Overall learning signal
  const avgImprovement =
    improvements.reduce((sum, i) => sum + i.change, 0) / improvements.length;
  if (avgImprovement > 0.5) {
    learningSignals.push(
      "Multi-round refinement showing consistent improvement",
    );
  } else if (avgImprovement < -0.5) {
    learningSignals.push("Quality declining across versions - review prompts");
  }

  return {
    conversationId,
    versions: sortedVersions,
    improvements,
    learningSignals,
  };
}

/**
 * Get latest version for conversation
 */
export function getLatestVersion(conversationId: string): DraftVersion | null {
  const versions = getDraftVersions(conversationId);
  if (versions.length === 0) return null;

  return versions.sort((a, b) => b.version - a.version)[0];
}

/**
 * Check if conversation has multiple versions
 */
export function hasMultipleVersions(conversationId: string): boolean {
  return getDraftVersions(conversationId).length > 1;
}

/**
 * Supabase migration for draft_versions table (schema definition)
 */
export const DRAFT_VERSIONS_MIGRATION = `
-- Create draft_versions table
CREATE TABLE IF NOT EXISTS draft_versions (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  draft_reply TEXT NOT NULL,
  human_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  
  -- Quality scores
  tone INTEGER CHECK (tone >= 1 AND tone <= 5),
  accuracy INTEGER CHECK (accuracy >= 1 AND accuracy <= 5),
  policy INTEGER CHECK (policy >= 1 AND policy <= 5),
  
  -- Context
  rag_sources JSONB,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Relationships
  previous_version_id TEXT REFERENCES draft_versions(id),
  superseded_by TEXT REFERENCES draft_versions(id),
  
  UNIQUE(conversation_id, version)
);

CREATE INDEX IF NOT EXISTS idx_draft_versions_conversation_id 
  ON draft_versions(conversation_id);
  
CREATE INDEX IF NOT EXISTS idx_draft_versions_created_at 
  ON draft_versions(created_at DESC);
`;
