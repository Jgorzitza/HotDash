/**
 * Structured Data Generator
 * 
 * Generate SEO schema (JSON-LD) for Shopify pages/products
 * Growth Spec D2: Automated structured data injection
 * 
 * @owner integrations
 * @task P1 Task 3
 */

import type { Action, ActionOutcome } from '~/types/action';

/**
 * Supported schema.org types
 */
export type SchemaType = 
  | 'Product'
  | 'FAQPage'
  | 'HowTo'
  | 'Article'
  | 'BreadcrumbList'
  | 'Organization';

/**
 * Product Schema Generator
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  sku: string;
  brand: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  ratingValue?: number;
  reviewCount?: number;
}): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.image,
    'sku': product.sku,
    'brand': {
      '@type': 'Brand',
      'name': product.brand
    },
    'offers': {
      '@type': 'Offer',
      'price': product.price.toFixed(2),
      'priceCurrency': product.currency,
      'availability': `https://schema.org/${product.availability}`
    }
  };

  // Add aggregate rating if available
  if (product.ratingValue && product.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': product.ratingValue,
      'reviewCount': product.reviewCount
    };
  }

  return schema;
}

/**
 * FAQ Page Schema Generator
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * HowTo Schema Generator
 */
export function generateHowToSchema(howTo: {
  name: string;
  description?: string;
  totalTime?: string; // ISO 8601 duration
  steps: Array<{ name: string; text: string; image?: string }>;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': howTo.name,
    'description': howTo.description,
    'totalTime': howTo.totalTime,
    'step': howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      'position': index + 1,
      'name': step.name,
      'text': step.text,
      ...(step.image && { 'image': step.image })
    }))
  };
}

/**
 * Article Schema Generator
 */
export function generateArticleSchema(article: {
  headline: string;
  description?: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.headline,
    'description': article.description,
    'author': {
      '@type': 'Organization',
      'name': article.author
    },
    'datePublished': article.datePublished,
    'dateModified': article.dateModified || article.datePublished,
    ...(article.image && { 'image': article.image })
  };
}

/**
 * Breadcrumb List Schema Generator
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url
    }))
  };
}

/**
 * Organization Schema Generator
 */
export function generateOrganizationSchema(org: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[]; // Social media URLs
  contactPoint?: {
    telephone: string;
    contactType: string;
  };
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': org.name,
    'url': org.url,
    ...(org.logo && { 'logo': org.logo }),
    ...(org.sameAs && { 'sameAs': org.sameAs }),
    ...(org.contactPoint && { 
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': org.contactPoint.telephone,
        'contactType': org.contactPoint.contactType
      }
    })
  };
}

/**
 * Generate JSON-LD script tag
 */
export function generateJSONLD(schema: object): string {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/**
 * Structured Data Executor
 * Implements ActionExecutor interface
 */
export class StructuredDataExecutor {
  async execute(action: Action): Promise<ActionOutcome> {
    const { schemaType, data } = action.payload as {
      schemaType: SchemaType;
      data: any;
    };

    try {
      let schema: object;

      switch (schemaType) {
        case 'Product':
          schema = generateProductSchema(data);
          break;
        case 'FAQPage':
          schema = generateFAQSchema(data);
          break;
        case 'HowTo':
          schema = generateHowToSchema(data);
          break;
        case 'Article':
          schema = generateArticleSchema(data);
          break;
        case 'BreadcrumbList':
          schema = generateBreadcrumbSchema(data);
          break;
        case 'Organization':
          schema = generateOrganizationSchema(data);
          break;
        default:
          throw new Error(`Unsupported schema type: ${schemaType}`);
      }

      const jsonLD = generateJSONLD(schema);

      return {
        success: true,
        message: `Generated ${schemaType} structured data`,
        data: {
          schemaType,
          jsonLD,
          schema
        }
      };
    } catch (error) {
      console.error('[StructuredData] Generation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: { error: String(error) }
      };
    }
  }

  async rollback(action: Action): Promise<void> {
    // Structured data is idempotent, no rollback needed
    console.log('[StructuredData] No rollback needed (idempotent operation)');
  }
}

/**
 * Validate structured data against schema.org
 */
export function validateStructuredData(schema: object): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const obj = schema as any;

  // Basic validation
  if (!obj['@context']) {
    errors.push('Missing @context field');
  }
  if (!obj['@type']) {
    errors.push('Missing @type field');
  }

  // Type-specific validation
  if (obj['@type'] === 'Product') {
    if (!obj.name) errors.push('Product missing name');
    if (!obj.offers) errors.push('Product missing offers');
  }

  if (obj['@type'] === 'FAQPage') {
    if (!obj.mainEntity || !Array.isArray(obj.mainEntity)) {
      errors.push('FAQPage missing mainEntity array');
    }
  }

  if (obj['@type'] === 'HowTo') {
    if (!obj.step || !Array.isArray(obj.step)) {
      errors.push('HowTo missing step array');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Example: Generate FAQ schema for Hot Rod AN
 */
export function exampleFAQGeneration() {
  return generateFAQSchema([
    {
      question: 'What size AN fitting do I need for my fuel line?',
      answer: 'For most street applications, -6 AN (3/8") is standard for fuel lines. High-performance applications may require -8 AN or larger.'
    },
    {
      question: 'Are AN fittings compatible with NPT threads?',
      answer: 'No, AN fittings use 37-degree flare fittings and are not directly compatible with NPT (tapered pipe threads). You need an AN-to-NPT adapter.'
    },
    {
      question: 'How do I prevent leaks with AN fittings?',
      answer: 'AN fittings use a metal-to-metal seal and don\'t require thread sealant. Proper torque and clean, undamaged flare surfaces are essential.'
    }
  ]);
}

