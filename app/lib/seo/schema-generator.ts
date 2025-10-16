/**
 * Schema.org Generator
 * @module lib/seo/schema-generator
 */

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: string;
  brand?: string;
  sku?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
    },
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    sku: product.sku,
  };
}

export function generateArticleSchema(article: {
  headline: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  publisher: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@type': 'Organization', name: article.publisher },
  };
}
