/**
 * Helper for resolving the Storefront Sub-Agent implementation. Handles
 * environments where only the TypeScript source is available (tests) and
 * production builds where the compiled JavaScript output exists.
 */

type StorefrontModule = {
  StorefrontSubAgent: new () => any;
};

const moduleSpecifiers = [
  '../../../../app/services/ai-customer/storefront-sub-agent.service.js',
  '../../../../app/services/ai-customer/storefront-sub-agent.service.ts',
] as const;

let cachedInstance: any | null = null;

const loadStorefrontModule = async (): Promise<StorefrontModule> => {
  for (const specifier of moduleSpecifiers) {
    try {
      return (await import(specifier)) as StorefrontModule;
    } catch (error) {
      // Try the next specifier
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
