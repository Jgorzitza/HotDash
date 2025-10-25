/**
 * Helper for resolving the Storefront Sub-Agent implementation. Handles
 * environments where only the TypeScript source is available (tests) and
 * production builds where the compiled JavaScript output exists.
 */

const moduleSpecifiers = [
  '../../../../app/services/ai-customer/storefront-sub-agent.service.js',
  '../../../../app/services/ai-customer/storefront-sub-agent.service.ts',
];

let cachedInstance = null;

const loadStorefrontModule = async () => {
  for (const specifier of moduleSpecifiers) {
    try {
      return await import(specifier);
    } catch (error) {
      // Continue to next specifier
    }
  }

  throw new Error('Unable to locate storefront-sub-agent service implementation');
};

export const getStorefrontService = async () => {
  if (!cachedInstance) {
    const { StorefrontSubAgent } = await loadStorefrontModule();
    cachedInstance = new StorefrontSubAgent();
  }

  return cachedInstance;
};
