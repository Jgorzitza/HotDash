/**
 * Admin Feature Toggles
 * 
 * Runtime feature flags that can be toggled by admins.
 * Backlog task #24: Admin toggles to disable features
 */

import { z } from 'zod';

/**
 * Feature toggle schema
 */
export const FeatureToggleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  category: z.enum(['ai', 'hitl', 'escalation', 'learning', 'safety']),
  updatedAt: z.string(),
  updatedBy: z.string().optional(),
});

export type FeatureToggle = z.infer<typeof FeatureToggleSchema>;

/**
 * Feature toggle store (in-memory, will be replaced with Supabase)
 */
class FeatureToggleStore {
  private toggles: Map<string, FeatureToggle> = new Map();

  constructor() {
    // Initialize default toggles
    this.initializeDefaults();
  }

  /**
   * Initialize default feature toggles
   */
  private initializeDefaults(): void {
    const defaults: FeatureToggle[] = [
      {
        id: 'ai_draft_replies',
        name: 'AI Draft Replies',
        description: 'Enable AI to draft customer support replies',
        enabled: true,
        category: 'ai',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ai_ceo_insights',
        name: 'AI CEO Insights',
        description: 'Enable AI to generate CEO insights and recommendations',
        enabled: true,
        category: 'ai',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hitl_enforcement',
        name: 'HITL Enforcement',
        description: 'Require human approval for all customer-facing messages',
        enabled: true,
        category: 'hitl',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'grading_capture',
        name: 'Grading Capture',
        description: 'Capture tone/accuracy/policy grades on approvals',
        enabled: true,
        category: 'hitl',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'auto_escalation',
        name: 'Auto Escalation',
        description: 'Automatically escalate conversations based on rules',
        enabled: true,
        category: 'escalation',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'legal_threat_detection',
        name: 'Legal Threat Detection',
        description: 'Detect and escalate legal threats',
        enabled: true,
        category: 'escalation',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'vip_prioritization',
        name: 'VIP Prioritization',
        description: 'Prioritize VIP customers automatically',
        enabled: true,
        category: 'escalation',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'learning_pipeline',
        name: 'Learning Pipeline',
        description: 'Capture edits and learn from human corrections',
        enabled: true,
        category: 'learning',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'fine_tuning_dataset',
        name: 'Fine-tuning Dataset Generation',
        description: 'Generate fine-tuning datasets from approved responses',
        enabled: true,
        category: 'learning',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pii_scrubbing',
        name: 'PII Scrubbing',
        description: 'Remove PII from logs and outputs',
        enabled: true,
        category: 'safety',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'policy_filters',
        name: 'Policy Filters',
        description: 'Enforce policy limits on discounts and refunds',
        enabled: true,
        category: 'safety',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rag_integration',
        name: 'RAG Integration',
        description: 'Use knowledge base for answering questions',
        enabled: true,
        category: 'ai',
        updatedAt: new Date().toISOString(),
      },
    ];

    defaults.forEach(toggle => {
      this.toggles.set(toggle.id, toggle);
    });
  }

  /**
   * Get feature toggle by ID
   */
  get(id: string): FeatureToggle | undefined {
    return this.toggles.get(id);
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(id: string): boolean {
    const toggle = this.toggles.get(id);
    return toggle?.enabled ?? false;
  }

  /**
   * Enable feature
   */
  enable(id: string, updatedBy?: string): void {
    const toggle = this.toggles.get(id);
    if (toggle) {
      toggle.enabled = true;
      toggle.updatedAt = new Date().toISOString();
      toggle.updatedBy = updatedBy;
      this.toggles.set(id, toggle);

      // TODO: Persist to Supabase
      console.log(`[FeatureToggle] Enabled: ${id}`);
    }
  }

  /**
   * Disable feature
   */
  disable(id: string, updatedBy?: string): void {
    const toggle = this.toggles.get(id);
    if (toggle) {
      toggle.enabled = false;
      toggle.updatedAt = new Date().toISOString();
      toggle.updatedBy = updatedBy;
      this.toggles.set(id, toggle);

      // TODO: Persist to Supabase
      console.log(`[FeatureToggle] Disabled: ${id}`);
    }
  }

  /**
   * Get all toggles
   */
  getAll(): FeatureToggle[] {
    return Array.from(this.toggles.values());
  }

  /**
   * Get toggles by category
   */
  getByCategory(category: FeatureToggle['category']): FeatureToggle[] {
    return Array.from(this.toggles.values()).filter(
      toggle => toggle.category === category
    );
  }

  /**
   * Bulk update toggles
   */
  bulkUpdate(updates: Array<{ id: string; enabled: boolean }>, updatedBy?: string): void {
    updates.forEach(({ id, enabled }) => {
      if (enabled) {
        this.enable(id, updatedBy);
      } else {
        this.disable(id, updatedBy);
      }
    });
  }
}

/**
 * Global feature toggle store
 */
export const featureToggles = new FeatureToggleStore();

/**
 * Helper functions for common feature checks
 */
export const features = {
  canDraftReplies: () => featureToggles.isEnabled('ai_draft_replies'),
  canGenerateInsights: () => featureToggles.isEnabled('ai_ceo_insights'),
  requiresHITL: () => featureToggles.isEnabled('hitl_enforcement'),
  shouldCaptureGrades: () => featureToggles.isEnabled('grading_capture'),
  shouldAutoEscalate: () => featureToggles.isEnabled('auto_escalation'),
  shouldDetectLegalThreats: () => featureToggles.isEnabled('legal_threat_detection'),
  shouldPrioritizeVIPs: () => featureToggles.isEnabled('vip_prioritization'),
  shouldLearn: () => featureToggles.isEnabled('learning_pipeline'),
  shouldGenerateFineTuningData: () => featureToggles.isEnabled('fine_tuning_dataset'),
  shouldScrubPII: () => featureToggles.isEnabled('pii_scrubbing'),
  shouldEnforcePolicies: () => featureToggles.isEnabled('policy_filters'),
  shouldUseRAG: () => featureToggles.isEnabled('rag_integration'),
};

