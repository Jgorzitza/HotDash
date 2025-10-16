/**
 * Environment Adapters (Staging vs Production)
 * 
 * Provides environment-specific configurations and behaviors.
 * Backlog task #22: Adapters for staging vs prod
 */

import { z } from 'zod';

/**
 * Environment types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

/**
 * Environment configuration schema
 */
export const EnvironmentConfigSchema = z.object({
  environment: z.nativeEnum(Environment),
  apiBaseUrl: z.string().url(),
  chatwootUrl: z.string().url(),
  supabaseUrl: z.string().url(),
  openaiModel: z.string(),
  enableHITL: z.boolean(),
  enableRealActions: z.boolean(),
  enableTelemetry: z.boolean(),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']),
  maxRetries: z.number(),
  timeoutMs: z.number(),
});

export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;

/**
 * Environment configurations
 */
const ENVIRONMENT_CONFIGS: Record<Environment, EnvironmentConfig> = {
  [Environment.DEVELOPMENT]: {
    environment: Environment.DEVELOPMENT,
    apiBaseUrl: 'http://localhost:3000',
    chatwootUrl: 'http://localhost:3100',
    supabaseUrl: 'http://localhost:54321',
    openaiModel: 'gpt-4o-mini', // Cheaper model for dev
    enableHITL: true,
    enableRealActions: false, // No real actions in dev
    enableTelemetry: false,
    logLevel: 'debug',
    maxRetries: 1,
    timeoutMs: 10000,
  },

  [Environment.STAGING]: {
    environment: Environment.STAGING,
    apiBaseUrl: 'https://staging-api.hotrodan.com',
    chatwootUrl: 'https://staging-chat.hotrodan.com',
    supabaseUrl: 'https://staging-db.hotrodan.com',
    openaiModel: 'gpt-4o',
    enableHITL: true,
    enableRealActions: true, // Real actions allowed in staging
    enableTelemetry: true,
    logLevel: 'info',
    maxRetries: 3,
    timeoutMs: 30000,
  },

  [Environment.PRODUCTION]: {
    environment: Environment.PRODUCTION,
    apiBaseUrl: 'https://api.hotrodan.com',
    chatwootUrl: 'https://chat.hotrodan.com',
    supabaseUrl: 'https://db.hotrodan.com',
    openaiModel: 'gpt-4o',
    enableHITL: true, // Always enforce HITL in production
    enableRealActions: true,
    enableTelemetry: true,
    logLevel: 'warn',
    maxRetries: 3,
    timeoutMs: 30000,
  },
};

/**
 * Get current environment from env var
 */
export function getCurrentEnvironment(): Environment {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return Environment.PRODUCTION;
    case 'staging':
      return Environment.STAGING;
    default:
      return Environment.DEVELOPMENT;
  }
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig(env?: Environment): EnvironmentConfig {
  const environment = env || getCurrentEnvironment();
  return ENVIRONMENT_CONFIGS[environment];
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getCurrentEnvironment() === Environment.PRODUCTION;
}

/**
 * Check if running in staging
 */
export function isStaging(): boolean {
  return getCurrentEnvironment() === Environment.STAGING;
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getCurrentEnvironment() === Environment.DEVELOPMENT;
}

/**
 * API adapter - switches between real and mock implementations
 */
export class APIAdapter {
  private config: EnvironmentConfig;

  constructor(environment?: Environment) {
    this.config = getEnvironmentConfig(environment);
  }

  /**
   * Execute action with environment-specific behavior
   */
  async executeAction<T>(
    action: () => Promise<T>,
    mockResult: T
  ): Promise<T> {
    if (this.config.enableRealActions) {
      return action();
    } else {
      console.log('[APIAdapter] Using mock result (real actions disabled)');
      return mockResult;
    }
  }

  /**
   * Get API base URL
   */
  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  /**
   * Get Chatwoot URL
   */
  getChatwootUrl(): string {
    return this.config.chatwootUrl;
  }

  /**
   * Get Supabase URL
   */
  getSupabaseUrl(): string {
    return this.config.supabaseUrl;
  }

  /**
   * Get OpenAI model
   */
  getOpenAIModel(): string {
    return this.config.openaiModel;
  }

  /**
   * Check if HITL is enabled
   */
  isHITLEnabled(): boolean {
    return this.config.enableHITL;
  }

  /**
   * Check if telemetry is enabled
   */
  isTelemetryEnabled(): boolean {
    return this.config.enableTelemetry;
  }

  /**
   * Get log level
   */
  getLogLevel(): string {
    return this.config.logLevel;
  }

  /**
   * Get max retries
   */
  getMaxRetries(): number {
    return this.config.maxRetries;
  }

  /**
   * Get timeout
   */
  getTimeout(): number {
    return this.config.timeoutMs;
  }
}

/**
 * Global API adapter instance
 */
export const apiAdapter = new APIAdapter();

/**
 * Feature flags based on environment
 */
export const featureFlags = {
  enableAIResponses: () => {
    const env = getCurrentEnvironment();
    return env === Environment.STAGING || env === Environment.PRODUCTION;
  },

  enableAutoEscalation: () => {
    return !isDevelopment();
  },

  enableLearningPipeline: () => {
    return !isDevelopment();
  },

  enableCostTracking: () => {
    return isProduction();
  },

  enableDebugLogs: () => {
    return isDevelopment();
  },
};

