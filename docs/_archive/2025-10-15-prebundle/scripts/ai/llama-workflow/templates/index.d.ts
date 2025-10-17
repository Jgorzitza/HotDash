/**
 * Agent Response Template Library
 *
 * Reusable, brand-voice-compliant templates for Agent SDK customer support
 * Created: 2025-10-11
 */
export interface ResponseTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  variables: string[];
  template: string;
  tone: "professional" | "empathetic" | "apologetic" | "informative";
  needsApproval: boolean;
  tags: string[];
}
export declare const templates: ResponseTemplate[];
/**
 * Utility: Render template with variables
 */
export declare function renderTemplate(
  template: string,
  variables: Record<string, string>,
): string;
/**
 * Utility: Find templates by category
 */
export declare function getTemplatesByCategory(
  category: string,
): ResponseTemplate[];
/**
 * Utility: Find templates by tag
 */
export declare function getTemplatesByTag(tag: string): ResponseTemplate[];
/**
 * Utility: Get template by ID
 */
export declare function getTemplateById(
  id: string,
): ResponseTemplate | undefined;
/**
 * Export counts for monitoring
 */
export declare const templateStats: {
  total: number;
  by_category: {
    order_status: number;
    shipping: number;
    returns: number;
    account: number;
    product: number;
    escalation: number;
    technical: number;
    acknowledgment: number;
    apology: number;
    closure: number;
    security: number;
    vip: number;
  };
  requires_approval: number;
};
//# sourceMappingURL=index.d.ts.map
