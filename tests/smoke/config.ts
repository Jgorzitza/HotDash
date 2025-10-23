/**
 * Smoke Test Configuration
 * 
 * Centralized configuration for all smoke tests
 */

export const SMOKE_TEST_CONFIG = {
  // Base URLs
  urls: {
    production: process.env.PRODUCTION_URL || 'https://hotdash-production.fly.dev',
    staging: process.env.STAGING_URL || 'https://hotdash-staging.fly.dev',
    local: 'http://localhost:3000',
  },

  // Timeouts (in milliseconds)
  timeouts: {
    short: 5000,      // 5 seconds - for fast operations
    medium: 15000,    // 15 seconds - for API calls
    long: 30000,      // 30 seconds - for page loads
  },

  // Performance thresholds
  performance: {
    pageLoad: 3000,        // Max page load time (ms)
    apiResponse: 500,      // Max API response time (ms)
    databaseQuery: 100,    // Max database query time (ms)
    tileLoad: 2000,        // Max tile load time (ms)
  },

  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000,  // 1 second between retries
  },

  // Critical paths to test
  criticalPaths: [
    '/app',                    // Dashboard
    '/app/approvals',          // Approval queue
    '/app/settings',           // Settings
    '/app/analytics',          // Analytics
  ],

  // API endpoints to health check
  healthEndpoints: [
    '/health',
    '/api/health',
    '/api/shopify/health',
    '/api/supabase/health',
  ],

  // Database tables to verify
  criticalTables: [
    'DecisionLog',
    'TaskAssignment',
    'Session',
  ],

  // External services to check
  externalServices: {
    shopify: {
      endpoint: process.env.SHOPIFY_SHOP_URL,
      timeout: 5000,
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      timeout: 5000,
    },
    chatwoot: {
      endpoint: process.env.CHATWOOT_BASE_URL,
      timeout: 5000,
    },
  },

  // Alert thresholds
  alerts: {
    consecutiveFailures: 3,    // Alert after 3 consecutive failures
    failureRate: 0.2,          // Alert if >20% of tests fail
  },
};

// Environment-specific overrides
export function getSmokeTestConfig(env: 'production' | 'staging' | 'local' = 'production') {
  const config = { ...SMOKE_TEST_CONFIG };
  
  // Adjust timeouts for local development
  if (env === 'local') {
    config.timeouts.short = 10000;
    config.timeouts.medium = 30000;
    config.timeouts.long = 60000;
  }
  
  return config;
}

