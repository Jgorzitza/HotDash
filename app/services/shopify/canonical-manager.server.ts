/**
 * Canonical Manager
 * 
 * Automated canonical URL management for Shopify pages/products
 * Growth Spec D3: Prevent duplicate content, manage variant canonicals
 * 
 * @owner integrations
 * @task P1 Task 4
 */

import type { Action, ActionOutcome } from '~/types/action';

/**
 * Canonical URL strategies
 */
export type CanonicalStrategy = 
  | 'self' // Canonical to self (this is the canonical version)
  | 'parent' // Canonical to parent (for variants → main product)
  | 'custom' // Custom canonical URL
  | 'cross-domain'; // Cross-domain canonical (for content syndication)

interface CanonicalConfig {
  strategy: CanonicalStrategy;
  targetUrl?: string; // For 'custom' and 'cross-domain'
  parentId?: string; // For 'parent' strategy
}

/**
 * Detect duplicate content candidates
 */
export async function detectDuplicateContent(pages: Array<{
  id: string;
  title: string;
  body: string;
  handle: string;
}>): Promise<Array<{ canonical: string; duplicates: string[] }>> {
  const groups: Map<string, string[]> = new Map();

  // Simple similarity detection (production would use more sophisticated algorithm)
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const similarity = calculateSimilarity(pages[i].body, pages[j].body);
      
      if (similarity > 0.85) { // 85% similar
        const canonical = pages[i].handle; // First one is canonical
        const duplicates = groups.get(canonical) || [];
        duplicates.push(pages[j].handle);
        groups.set(canonical, duplicates);
      }
    }
  }

  return Array.from(groups.entries()).map(([canonical, duplicates]) => ({
    canonical,
    duplicates
  }));
}

/**
 * Calculate content similarity (simple version)
 * Production should use more sophisticated algorithms (cosine similarity, etc.)
 */
function calculateSimilarity(text1: string, text2: string): number {
  // Strip HTML and normalize
  const clean1 = text1.replace(/<[^>]*>/g, '').toLowerCase().trim();
  const clean2 = text2.replace(/<[^>]*>/g, '').toLowerCase().trim();

  // Simple word-based similarity
  const words1 = new Set(clean1.split(/\s+/));
  const words2 = new Set(clean2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Generate canonical URL for a page
 */
export function generateCanonicalUrl(config: CanonicalConfig, context: {
  storeDomain: string;
  pageHandle: string;
  productHandle?: string;
}): string {
  const baseUrl = `https://${context.storeDomain}`;

  switch (config.strategy) {
    case 'self':
      // Canonical to self
      return `${baseUrl}/pages/${context.pageHandle}`;

    case 'parent':
      // Canonical to parent product (for variant pages)
      if (!context.productHandle) {
        throw new Error('Parent strategy requires productHandle');
      }
      return `${baseUrl}/products/${context.productHandle}`;

    case 'custom':
      // Custom canonical URL
      if (!config.targetUrl) {
        throw new Error('Custom strategy requires targetUrl');
      }
      return config.targetUrl;

    case 'cross-domain':
      // Cross-domain canonical (for syndicated content)
      if (!config.targetUrl) {
        throw new Error('Cross-domain strategy requires targetUrl');
      }
      return config.targetUrl;

    default:
      throw new Error(`Unknown canonical strategy: ${config.strategy}`);
  }
}

/**
 * Inject canonical link tag into page HTML
 */
export function injectCanonicalTag(html: string, canonicalUrl: string): string {
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;

  // Check if canonical tag already exists
  if (html.includes('rel="canonical"')) {
    // Replace existing canonical
    return html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/gi,
      canonicalTag
    );
  } else {
    // Add canonical at the beginning
    return `${canonicalTag}\n\n${html}`;
  }
}

/**
 * Canonical Manager Executor
 * Implements ActionExecutor interface
 */
export class CanonicalManagerExecutor {
  async execute(action: Action): Promise<ActionOutcome> {
    const payload = action.payload as {
      pageId: string;
      pageHandle: string;
      canonicalConfig: CanonicalConfig;
      currentBody: string;
    };

    try {
      // 1. Generate canonical URL
      const canonicalUrl = generateCanonicalUrl(
        payload.canonicalConfig,
        {
          storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
          pageHandle: payload.pageHandle,
          productHandle: payload.canonicalConfig.parentId
        }
      );

      // 2. Inject canonical tag into page body
      const updatedBody = injectCanonicalTag(payload.currentBody, canonicalUrl);

      // 3. Update page via Shopify API (would use pageUpdate mutation)
      // This is handled by PageFactoryExecutor, this executor just generates the canonical

      return {
        success: true,
        message: `Canonical URL set: ${canonicalUrl}`,
        data: {
          pageId: payload.pageId,
          canonicalUrl,
          strategy: payload.canonicalConfig.strategy,
          updatedBody
        }
      };
    } catch (error) {
      console.error('[CanonicalManager] Execution error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: { error: String(error) }
      };
    }
  }

  async rollback(action: Action): Promise<void> {
    // Remove canonical tag (would update page to remove canonical)
    console.log('[CanonicalManager] Rollback: Remove canonical tag');
  }
}

/**
 * Bulk canonical management
 * Set canonicals for all duplicate content
 */
export async function bulkSetCanonicals(pages: Array<{
  id: string;
  title: string;
  body: string;
  handle: string;
}>): Promise<ActionOutcome[]> {
  // 1. Detect duplicate content
  const duplicateGroups = await detectDuplicateContent(pages);

  // 2. Set canonicals for duplicates
  const executor = new CanonicalManagerExecutor();
  const results: ActionOutcome[] = [];

  for (const group of duplicateGroups) {
    const canonicalPage = pages.find(p => p.handle === group.canonical);
    if (!canonicalPage) continue;

    // Set canonical for each duplicate
    for (const duplicateHandle of group.duplicates) {
      const duplicatePage = pages.find(p => p.handle === duplicateHandle);
      if (!duplicatePage) continue;

      const action: Action = {
        id: `canonical-${duplicateHandle}`,
        type: 'set_canonical',
        status: 'pending',
        payload: {
          pageId: duplicatePage.id,
          pageHandle: duplicatePage.handle,
          canonicalConfig: {
            strategy: 'custom',
            targetUrl: `https://${process.env.SHOPIFY_STORE_DOMAIN}/pages/${canonicalPage.handle}`
          },
          currentBody: duplicatePage.body
        },
        createdAt: new Date()
      };

      const outcome = await executor.execute(action);
      results.push(outcome);
    }
  }

  return results;
}

/**
 * Variant canonical handling
 * Set product variants to canonical to main product page
 */
export async function setVariantCanonicals(productId: string, variantHandles: string[]): Promise<ActionOutcome[]> {
  const executor = new CanonicalManagerExecutor();
  const results: ActionOutcome[] = [];

  // Get main product handle
  const mainProductHandle = variantHandles[0]; // First variant is typically main

  for (const variantHandle of variantHandles.slice(1)) {
    const action: Action = {
      id: `canonical-variant-${variantHandle}`,
      type: 'set_canonical',
      status: 'pending',
      payload: {
        pageId: `variant-${variantHandle}`,
        pageHandle: variantHandle,
        canonicalConfig: {
          strategy: 'parent',
          parentId: mainProductHandle
        },
        currentBody: '' // Would fetch from Shopify
      },
      createdAt: new Date()
    };

    const outcome = await executor.execute(action);
    results.push(outcome);
  }

  return results;
}

/**
 * Example: Set canonical for duplicate blog posts
 */
export function exampleCanonicalUsage() {
  const executor = new CanonicalManagerExecutor();

  const action: Action = {
    id: 'example-canonical',
    type: 'set_canonical',
    status: 'pending',
    payload: {
      pageId: 'gid://shopify/Page/123456',
      pageHandle: 'an-fitting-installation-guide-2',
      canonicalConfig: {
        strategy: 'custom',
        targetUrl: 'https://hotrodan.com/guides/an-fitting-installation'
      },
      currentBody: '<h1>AN Fitting Installation</h1><p>Duplicate content...</p>'
    },
    createdAt: new Date()
  };

  return executor.execute(action);
}

