/**
 * Secrets Management Service
 *
 * Centralized secrets management with validation, rotation tracking, and secure access
 * Follows React Router 7 patterns and security best practices
 *
 * Task: SECURITY-AUDIT-003
 */
export declare enum SecretCategory {
    SHOPIFY = "shopify",
    DATABASE = "database",
    CHATWOOT = "chatwoot",
    SOCIAL = "social",
    ANALYTICS = "analytics",
    COMMUNICATION = "communication",
    INFRASTRUCTURE = "infrastructure"
}
export interface SecretMetadata {
    name: string;
    category: SecretCategory;
    required: boolean;
    rotationDays: number;
    lastRotated?: Date;
    description: string;
}
export declare class SecretsManager {
    private static instance;
    private secrets;
    private metadata;
    private constructor();
    static getInstance(): SecretsManager;
    private loadSecrets;
    private loadMetadata;
    /**
     * Get a secret value by name
     * Throws if secret is required but not found
     */
    getSecret(name: string): string | undefined;
    /**
     * Get a required secret value
     * Throws if not found
     */
    getRequiredSecret(name: string): string;
    /**
     * Validate all secrets for a category
     */
    validateCategory(category: SecretCategory): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Get all secrets for a category
     */
    private getCategorySecrets;
    /**
     * Check which secrets need rotation
     */
    getSecretsNeedingRotation(): SecretMetadata[];
    /**
     * Validate all required secrets are present
     */
    validateAllRequired(): {
        isValid: boolean;
        missing: string[];
    };
    /**
     * Get secrets audit report
     */
    getAuditReport(): {
        total: number;
        present: number;
        missing: number;
        needsRotation: number;
        byCategory: Record<string, {
            present: number;
            total: number;
        }>;
    };
}
/**
 * Get the global secrets manager instance
 */
export declare function getSecretsManager(): SecretsManager;
/**
 * Get a secret value
 */
export declare function getSecret(name: string): string | undefined;
/**
 * Get a required secret value
 */
export declare function getRequiredSecret(name: string): string;
//# sourceMappingURL=secrets-manager.d.ts.map