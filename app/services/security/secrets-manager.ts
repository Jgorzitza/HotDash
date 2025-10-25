/**
 * Secrets Management Service
 * 
 * Centralized secrets management with validation, rotation tracking, and secure access
 * Follows React Router 7 patterns and security best practices
 * 
 * Task: SECURITY-AUDIT-003
 */

import { z } from 'zod';

// ============================================================================
// Secret Categories
// ============================================================================

export enum SecretCategory {
  SHOPIFY = 'shopify',
  DATABASE = 'database',
  CHATWOOT = 'chatwoot',
  SOCIAL = 'social',
  ANALYTICS = 'analytics',
  COMMUNICATION = 'communication',
  INFRASTRUCTURE = 'infrastructure',
}

// ============================================================================
// Secret Metadata
// ============================================================================

export interface SecretMetadata {
  name: string;
  category: SecretCategory;
  required: boolean;
  rotationDays: number;
  lastRotated?: Date;
  description: string;
}

// ============================================================================
// Secret Validation Schemas
// ============================================================================

const shopifySecretsSchema = z.object({
  SHOPIFY_API_KEY: z.string().min(1, 'Shopify API key is required'),
  SHOPIFY_API_SECRET: z.string().min(1, 'Shopify API secret is required'),
  SHOPIFY_APP_URL: z.string().url('Valid Shopify app URL is required'),
  SHOPIFY_SHOP_DOMAIN: z.string().regex(/\.myshopify\.com$/, 'Must be a valid Shopify domain'),
  SCOPES: z.string().min(1, 'Shopify scopes are required'),
});

const databaseSecretsSchema = z.object({
  DATABASE_URL: z.string().url('Valid database URL is required').optional(),
  SUPABASE_URL: z.string().url('Valid Supabase URL is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'Supabase service key is required'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required').optional(),
});

const chatwootSecretsSchema = z.object({
  CHATWOOT_BASE_URL: z.string().url('Valid Chatwoot URL is required'),
  CHATWOOT_TOKEN: z.string().min(1, 'Chatwoot token is required'),
  CHATWOOT_ACCOUNT_ID: z.string().regex(/^\d+$/, 'Must be a valid account ID'),
  CHATWOOT_SLA_MINUTES: z.string().regex(/^\d+$/).optional(),
  CHATWOOT_EMBED_TOKEN: z.string().optional(),
});

const analyticsSecretsSchema = z.object({
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
});

// ============================================================================
// Secret Registry
// ============================================================================

const SECRET_REGISTRY: SecretMetadata[] = [
  // Shopify
  {
    name: 'SHOPIFY_API_KEY',
    category: SecretCategory.SHOPIFY,
    required: true,
    rotationDays: 90,
    description: 'Shopify Partner app API key',
  },
  {
    name: 'SHOPIFY_API_SECRET',
    category: SecretCategory.SHOPIFY,
    required: true,
    rotationDays: 90,
    description: 'Shopify Partner app API secret',
  },
  
  // Database
  {
    name: 'SUPABASE_URL',
    category: SecretCategory.DATABASE,
    required: true,
    rotationDays: 0, // URL doesn't rotate
    description: 'Supabase project URL',
  },
  {
    name: 'SUPABASE_SERVICE_KEY',
    category: SecretCategory.DATABASE,
    required: true,
    rotationDays: 90,
    description: 'Supabase service role key (full access)',
  },
  {
    name: 'SUPABASE_ANON_KEY',
    category: SecretCategory.DATABASE,
    required: false,
    rotationDays: 90,
    description: 'Supabase anonymous key (RLS enforced)',
  },
  
  // Chatwoot
  {
    name: 'CHATWOOT_BASE_URL',
    category: SecretCategory.CHATWOOT,
    required: true,
    rotationDays: 0,
    description: 'Chatwoot instance URL',
  },
  {
    name: 'CHATWOOT_TOKEN',
    category: SecretCategory.CHATWOOT,
    required: true,
    rotationDays: 90,
    description: 'Chatwoot API access token',
  },
  
  // Analytics
  {
    name: 'GOOGLE_APPLICATION_CREDENTIALS',
    category: SecretCategory.ANALYTICS,
    required: false,
    rotationDays: 90,
    description: 'Google Analytics service account JSON path',
  },
  
  // Social Media
  {
    name: 'META_APP_ID',
    category: SecretCategory.SOCIAL,
    required: false,
    rotationDays: 90,
    description: 'Facebook/Instagram app ID',
  },
  {
    name: 'META_APP_SECRET',
    category: SecretCategory.SOCIAL,
    required: false,
    rotationDays: 90,
    description: 'Facebook/Instagram app secret',
  },
  
  // Communication
  {
    name: 'TWILIO_ACCOUNT_SID',
    category: SecretCategory.COMMUNICATION,
    required: false,
    rotationDays: 90,
    description: 'Twilio account SID',
  },
  {
    name: 'TWILIO_AUTH_TOKEN',
    category: SecretCategory.COMMUNICATION,
    required: false,
    rotationDays: 90,
    description: 'Twilio authentication token',
  },
];

// ============================================================================
// Secrets Manager Class
// ============================================================================

export class SecretsManager {
  private static instance: SecretsManager;
  private secrets: Map<string, string> = new Map();
  private metadata: Map<string, SecretMetadata> = new Map();
  
  private constructor() {
    this.loadSecrets();
    this.loadMetadata();
  }
  
  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }
  
  private loadSecrets(): void {
    // Load from environment variables
    SECRET_REGISTRY.forEach(meta => {
      const value = process.env[meta.name];
      if (value) {
        this.secrets.set(meta.name, value);
      }
    });
  }
  
  private loadMetadata(): void {
    SECRET_REGISTRY.forEach(meta => {
      this.metadata.set(meta.name, meta);
    });
  }
  
  /**
   * Get a secret value by name
   * Throws if secret is required but not found
   */
  public getSecret(name: string): string | undefined {
    const meta = this.metadata.get(name);
    const value = this.secrets.get(name);
    
    if (!value && meta?.required) {
      throw new Error(`Required secret ${name} is not set`);
    }
    
    return value;
  }
  
  /**
   * Get a required secret value
   * Throws if not found
   */
  public getRequiredSecret(name: string): string {
    const value = this.getSecret(name);
    if (!value) {
      throw new Error(`Required secret ${name} is not set`);
    }
    return value;
  }
  
  /**
   * Validate all secrets for a category
   */
  public validateCategory(category: SecretCategory): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      switch (category) {
        case SecretCategory.SHOPIFY:
          shopifySecretsSchema.parse(this.getCategorySecrets(category));
          break;
        case SecretCategory.DATABASE:
          databaseSecretsSchema.parse(this.getCategorySecrets(category));
          break;
        case SecretCategory.CHATWOOT:
          chatwootSecretsSchema.parse(this.getCategorySecrets(category));
          break;
        case SecretCategory.ANALYTICS:
          analyticsSecretsSchema.parse(this.getCategorySecrets(category));
          break;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push(`Validation failed for ${category}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Get all secrets for a category
   */
  private getCategorySecrets(category: SecretCategory): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {};
    
    this.metadata.forEach((meta, name) => {
      if (meta.category === category) {
        result[name] = this.secrets.get(name);
      }
    });
    
    return result;
  }
  
  /**
   * Check which secrets need rotation
   */
  public getSecretsNeedingRotation(): SecretMetadata[] {
    const needsRotation: SecretMetadata[] = [];
    const now = new Date();
    
    this.metadata.forEach((meta) => {
      if (meta.rotationDays === 0) return; // No rotation needed
      
      if (meta.lastRotated) {
        const daysSinceRotation = Math.floor(
          (now.getTime() - meta.lastRotated.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceRotation >= meta.rotationDays) {
          needsRotation.push(meta);
        }
      } else {
        // Never rotated - add to list
        needsRotation.push(meta);
      }
    });
    
    return needsRotation;
  }
  
  /**
   * Validate all required secrets are present
   */
  public validateAllRequired(): { isValid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    this.metadata.forEach((meta, name) => {
      if (meta.required && !this.secrets.has(name)) {
        missing.push(name);
      }
    });
    
    return {
      isValid: missing.length === 0,
      missing,
    };
  }
  
  /**
   * Get secrets audit report
   */
  public getAuditReport(): {
    total: number;
    present: number;
    missing: number;
    needsRotation: number;
    byCategory: Record<string, { present: number; total: number }>;
  } {
    const byCategory: Record<string, { present: number; total: number }> = {};
    let total = 0;
    let present = 0;
    
    this.metadata.forEach((meta) => {
      total++;
      
      if (!byCategory[meta.category]) {
        byCategory[meta.category] = { present: 0, total: 0 };
      }
      byCategory[meta.category].total++;
      
      if (this.secrets.has(meta.name)) {
        present++;
        byCategory[meta.category].present++;
      }
    });
    
    return {
      total,
      present,
      missing: total - present,
      needsRotation: this.getSecretsNeedingRotation().length,
      byCategory,
    };
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get the global secrets manager instance
 */
export function getSecretsManager(): SecretsManager {
  return SecretsManager.getInstance();
}

/**
 * Get a secret value
 */
export function getSecret(name: string): string | undefined {
  return getSecretsManager().getSecret(name);
}

/**
 * Get a required secret value
 */
export function getRequiredSecret(name: string): string {
  return getSecretsManager().getRequiredSecret(name);
}
