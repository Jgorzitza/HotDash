/**
 * Page Factory Executor
 * 
 * Programmatic Shopify page creation/updates from AI recommendations
 * Growth Spec D1: Automated page factory for content at scale
 * 
 * @owner integrations
 * @task P1 Task 2
 */

import type { Action, ActionOutcome } from '~/types/action';

// Shopify Page mutations (validated with Shopify MCP 2025-10-14)
const CREATE_PAGE_MUTATION = `#graphql
mutation CreatePage($page: PageCreateInput!) {
  pageCreate(page: $page) {
    page {
      id
      title
      handle
      body
      isPublished
      publishedAt
      metafields(first: 10) {
        edges {
          node {
            key
            value
            namespace
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}`;

const UPDATE_PAGE_MUTATION = `#graphql
mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
  pageUpdate(id: $id, page: $page) {
    page {
      id
      title
      handle
      body
      isPublished
      updatedAt
    }
    userErrors {
      field
      message
    }
  }
}`;

const QUERY_PAGE_BY_HANDLE = `#graphql
query PageByHandle($handle: String!) {
  pageByHandle(handle: $handle) {
    id
    title
    handle
    body
    isPublished
  }
}`;

interface PageFactoryPayload {
  title: string;
  handle?: string;
  body: string;
  isPublished?: boolean;
  publishDate?: string;
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
  structuredData?: {
    type: 'FAQPage' | 'HowTo' | 'Article' | 'Product';
    data: any;
  };
  canonicalUrl?: string;
}

/**
 * Execute Shopify Admin GraphQL query
 */
async function shopifyGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!domain || !token) {
    throw new Error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN');
  }

  const response = await fetch(
    `https://${domain}/admin/api/2025-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${await response.text()}`);
  }

  const json = await response.json() as any;
  
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

/**
 * Generate structured data JSON-LD for SEO
 */
function generateStructuredData(payload: PageFactoryPayload): string | null {
  if (!payload.structuredData) return null;

  const { type, data } = payload.structuredData;

  const schemas: Record<string, any> = {
    FAQPage: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': data.questions?.map((q: any) => ({
        '@type': 'Question',
        'name': q.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': q.answer
        }
      })) || []
    },
    HowTo: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': data.name || payload.title,
      'step': data.steps?.map((step: any, index: number) => ({
        '@type': 'HowToStep',
        'position': index + 1,
        'name': step.name,
        'text': step.text
      })) || []
    },
    Article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': data.headline || payload.title,
      'author': {
        '@type': 'Organization',
        'name': data.author || 'Hot Rod AN'
      },
      'datePublished': data.datePublished || new Date().toISOString()
    }
  };

  return JSON.stringify(schemas[type] || {});
}

/**
 * Inject structured data and canonical into page body
 */
function enhancePageBody(payload: PageFactoryPayload): string {
  let enhancedBody = payload.body;

  // Add structured data as JSON-LD script tag
  const structuredData = generateStructuredData(payload);
  if (structuredData) {
    enhancedBody += `\n\n<script type="application/ld+json">\n${structuredData}\n</script>`;
  }

  // Add canonical link if specified
  if (payload.canonicalUrl) {
    enhancedBody = `<link rel="canonical" href="${payload.canonicalUrl}" />\n\n${enhancedBody}`;
  }

  return enhancedBody;
}

/**
 * Page Factory Executor
 * Implements ActionExecutor interface for automated page operations
 */
export class PageFactoryExecutor {
  /**
   * Execute page creation or update action
   */
  async execute(action: Action): Promise<ActionOutcome> {
    const payload = action.payload as PageFactoryPayload;

    try {
      // Check if page already exists by handle
      let existingPage: any = null;
      if (payload.handle) {
        try {
          const result = await shopifyGraphQL<{ pageByHandle: any }>(
            QUERY_PAGE_BY_HANDLE,
            { handle: payload.handle }
          );
          existingPage = result.pageByHandle;
        } catch (error) {
          // Page doesn't exist, will create new
          console.log(`[PageFactory] Page with handle ${payload.handle} not found, creating new`);
        }
      }

      // Enhance body with structured data and canonical
      const enhancedBody = enhancePageBody(payload);

      // Prepare metafields
      const metafields = payload.metafields?.map(mf => ({
        namespace: mf.namespace,
        key: mf.key,
        value: mf.value,
        type: mf.type
      }));

      if (existingPage) {
        // Update existing page
        const result = await shopifyGraphQL<{ pageUpdate: any }>(
          UPDATE_PAGE_MUTATION,
          {
            id: existingPage.id,
            page: {
              title: payload.title,
              body: enhancedBody,
              isPublished: payload.isPublished ?? true,
              metafields
            }
          }
        );

        if (result.pageUpdate.userErrors?.length > 0) {
          throw new Error(JSON.stringify(result.pageUpdate.userErrors));
        }

        const updatedPage = result.pageUpdate.page;
        return {
          success: true,
          message: `Page updated: ${updatedPage.title}`,
          data: {
            pageId: updatedPage.id,
            title: updatedPage.title,
            handle: updatedPage.handle,
            url: `https://${process.env.SHOPIFY_STORE_DOMAIN}/pages/${updatedPage.handle}`,
            operation: 'update'
          }
        };
      } else {
        // Create new page
        const result = await shopifyGraphQL<{ pageCreate: any }>(
          CREATE_PAGE_MUTATION,
          {
            page: {
              title: payload.title,
              handle: payload.handle,
              body: enhancedBody,
              isPublished: payload.isPublished ?? true,
              publishDate: payload.publishDate,
              metafields
            }
          }
        );

        if (result.pageCreate.userErrors?.length > 0) {
          throw new Error(JSON.stringify(result.pageCreate.userErrors));
        }

        const createdPage = result.pageCreate.page;
        return {
          success: true,
          message: `Page created: ${createdPage.title}`,
          data: {
            pageId: createdPage.id,
            title: createdPage.title,
            handle: createdPage.handle,
            url: `https://${process.env.SHOPIFY_STORE_DOMAIN}/pages/${createdPage.handle}`,
            operation: 'create'
          }
        };
      }
    } catch (error) {
      console.error('[PageFactory] Execution error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: { error: String(error) }
      };
    }
  }

  /**
   * Rollback page creation/update
   */
  async rollback(action: Action): Promise<void> {
    const outcome = action.outcome;
    if (!outcome?.data?.pageId) {
      console.warn('[PageFactory] No page ID to rollback');
      return;
    }

    try {
      if (outcome.data.operation === 'create') {
        // Delete created page
        await shopifyGraphQL(
          `mutation DeletePage($id: ID!) {
            pageDelete(id: $id) {
              deletedPageId
              userErrors { field message }
            }
          }`,
          { id: outcome.data.pageId }
        );
        console.log(`[PageFactory] Rolled back page creation: ${outcome.data.pageId}`);
      } else {
        // Restore previous version (would need to store original state)
        console.warn('[PageFactory] Update rollback not fully implemented - requires state storage');
      }
    } catch (error) {
      console.error('[PageFactory] Rollback error:', error);
      throw error;
    }
  }
}

/**
 * Batch page creation for scale operations
 */
export async function batchCreatePages(pages: PageFactoryPayload[]): Promise<ActionOutcome[]> {
  const executor = new PageFactoryExecutor();
  const results: ActionOutcome[] = [];

  for (const pagePayload of pages) {
    const action: Action = {
      id: `page-${Date.now()}-${Math.random()}`,
      type: 'create_page',
      status: 'pending',
      payload: pagePayload,
      createdAt: new Date()
    };

    const outcome = await executor.execute(action);
    results.push(outcome);

    // Rate limiting: Wait 250ms between creates (40 points/sec limit)
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  return results;
}

/**
 * Example usage
 */
export async function examplePageCreation() {
  const executor = new PageFactoryExecutor();

  const action: Action = {
    id: 'example-1',
    type: 'create_page',
    status: 'pending',
    payload: {
      title: 'How to Install AN Fittings',
      handle: 'how-to-install-an-fittings',
      body: '<h1>Installation Guide</h1><p>Step-by-step instructions...</p>',
      isPublished: true,
      metafields: [
        {
          namespace: 'seo',
          key: 'description',
          value: 'Learn how to properly install AN fittings for your hot rod',
          type: 'single_line_text_field'
        }
      ],
      structuredData: {
        type: 'HowTo',
        data: {
          name: 'How to Install AN Fittings',
          steps: [
            { name: 'Prepare the fitting', text: 'Clean the threads...' },
            { name: 'Apply sealant', text: 'Use thread sealant...' },
            { name: 'Tighten to spec', text: 'Torque to 15 ft-lbs...' }
          ]
        }
      },
      canonicalUrl: 'https://hotrodan.com/guides/install-an-fittings'
    },
    createdAt: new Date()
  };

  return await executor.execute(action);
}

