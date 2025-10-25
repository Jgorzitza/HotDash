/**
 * SEO Optimization Service
 * 
 * Comprehensive SEO implementation including:
 * - Meta tags optimization
 * - Structured data (JSON-LD)
 * - Performance optimization
 * - SEO audit capabilities
 */

export interface SEOConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  defaultImage: string;
  twitterHandle?: string;
  facebookAppId?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleId?: string;
  bingWebmasterId?: string;
}

export interface PageSEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'organization';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export class SEOOptimizer {
  private config: SEOConfig;

  constructor(config: SEOConfig) {
    this.config = config;
  }

  /**
   * Generate comprehensive meta tags for a page
   */
  generateMetaTags(pageData: PageSEOData): string {
    const {
      title,
      description,
      keywords,
      canonicalUrl,
      image,
      type = 'website',
      publishedTime,
      modifiedTime,
      author,
      section,
      tags,
      noindex,
      nofollow
    } = pageData;

    const fullTitle = `${title} | ${this.config.siteName}`;
    const fullImage = image ? `${this.config.siteUrl}${image}` : this.config.defaultImage;
    const canonical = canonicalUrl || this.config.siteUrl;

    let metaTags = `
      <title>${fullTitle}</title>
      <meta name="description" content="${description}" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta charset="utf-8" />
      <link rel="canonical" href="${canonical}" />
    `;

    if (keywords && keywords.length > 0) {
      metaTags += `\n      <meta name="keywords" content="${keywords.join(', ')}" />`;
    }

    if (author) {
      metaTags += `\n      <meta name="author" content="${author}" />`;
    }

    if (noindex) {
      metaTags += `\n      <meta name="robots" content="noindex" />`;
    } else if (nofollow) {
      metaTags += `\n      <meta name="robots" content="nofollow" />`;
    } else {
      metaTags += `\n      <meta name="robots" content="index, follow" />`;
    }

    // Open Graph tags
    metaTags += `
      <meta property="og:type" content="${type}" />
      <meta property="og:title" content="${fullTitle}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:url" content="${canonical}" />
      <meta property="og:site_name" content="${this.config.siteName}" />
      <meta property="og:image" content="${fullImage}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    `;

    if (publishedTime) {
      metaTags += `\n      <meta property="article:published_time" content="${publishedTime}" />`;
    }

    if (modifiedTime) {
      metaTags += `\n      <meta property="article:modified_time" content="${modifiedTime}" />`;
    }

    if (author) {
      metaTags += `\n      <meta property="article:author" content="${author}" />`;
    }

    if (section) {
      metaTags += `\n      <meta property="article:section" content="${section}" />`;
    }

    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        metaTags += `\n      <meta property="article:tag" content="${tag}" />`;
      });
    }

    // Twitter Card tags
    metaTags += `
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${fullTitle}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${fullImage}" />
    `;

    if (this.config.twitterHandle) {
      metaTags += `\n      <meta name="twitter:site" content="@${this.config.twitterHandle}" />`;
    }

    // Additional SEO tags
    metaTags += `
      <meta name="theme-color" content="#ffffff" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    `;

    // Google Analytics
    if (this.config.googleAnalyticsId) {
      metaTags += `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${this.config.googleAnalyticsId}');
        </script>
      `;
    }

    return metaTags;
  }

  /**
   * Generate structured data (JSON-LD) for different content types
   */
  generateStructuredData(pageData: PageSEOData, additionalData?: any): StructuredData[] {
    const structuredData: StructuredData[] = [];

    // Organization schema
    const organizationSchema: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.config.siteName,
      url: this.config.siteUrl,
      description: this.config.siteDescription,
      logo: {
        '@type': 'ImageObject',
        url: `${this.config.siteUrl}/logo.png`
      },
      sameAs: []
    };

    if (this.config.twitterHandle) {
      organizationSchema.sameAs.push(`https://twitter.com/${this.config.twitterHandle}`);
    }

    structuredData.push(organizationSchema);

    // Website schema
    const websiteSchema: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.config.siteName,
      url: this.config.siteUrl,
      description: this.config.siteDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.config.siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    structuredData.push(websiteSchema);

    // Page-specific schema based on type
    if (pageData.type === 'article' && pageData.publishedTime) {
      const articleSchema: StructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: pageData.title,
        description: pageData.description,
        url: pageData.canonicalUrl || this.config.siteUrl,
        datePublished: pageData.publishedTime,
        dateModified: pageData.modifiedTime || pageData.publishedTime,
        author: {
          '@type': 'Person',
          name: pageData.author || this.config.siteName
        },
        publisher: {
          '@type': 'Organization',
          name: this.config.siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${this.config.siteUrl}/logo.png`
          }
        }
      };

      if (pageData.image) {
        articleSchema.image = `${this.config.siteUrl}${pageData.image}`;
      }

      structuredData.push(articleSchema);
    }

    if (pageData.type === 'product' && additionalData?.product) {
      const productSchema: StructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: additionalData.product.name,
        description: additionalData.product.description,
        url: pageData.canonicalUrl || this.config.siteUrl,
        image: additionalData.product.image ? `${this.config.siteUrl}${additionalData.product.image}` : this.config.defaultImage,
        brand: {
          '@type': 'Brand',
          name: this.config.siteName
        }
      };

      if (additionalData.product.price) {
        productSchema.offers = {
          '@type': 'Offer',
          price: additionalData.product.price,
          priceCurrency: additionalData.product.currency || 'USD',
          availability: 'https://schema.org/InStock'
        };
      }

      structuredData.push(productSchema);
    }

    return structuredData;
  }

  /**
   * Generate JSON-LD script tags
   */
  generateJSONLD(structuredData: StructuredData[]): string {
    return structuredData.map(data => 
      `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`
    ).join('\n      ');
  }

  /**
   * SEO audit function to check page optimization
   */
  auditPageSEO(pageData: PageSEOData, htmlContent: string): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check title length
    if (pageData.title.length < 30) {
      issues.push('Title is too short (less than 30 characters)');
      score -= 10;
    } else if (pageData.title.length > 60) {
      issues.push('Title is too long (more than 60 characters)');
      score -= 5;
    }

    // Check description length
    if (pageData.description.length < 120) {
      issues.push('Description is too short (less than 120 characters)');
      score -= 10;
    } else if (pageData.description.length > 160) {
      issues.push('Description is too long (more than 160 characters)');
      score -= 5;
    }

    // Check for keywords in title
    if (pageData.keywords && pageData.keywords.length > 0) {
      const titleLower = pageData.title.toLowerCase();
      const hasKeywordInTitle = pageData.keywords.some(keyword => 
        titleLower.includes(keyword.toLowerCase())
      );
      if (!hasKeywordInTitle) {
        recommendations.push('Include primary keyword in title');
        score -= 5;
      }
    }

    // Check for keywords in description
    if (pageData.keywords && pageData.keywords.length > 0) {
      const descLower = pageData.description.toLowerCase();
      const hasKeywordInDesc = pageData.keywords.some(keyword => 
        descLower.includes(keyword.toLowerCase())
      );
      if (!hasKeywordInDesc) {
        recommendations.push('Include primary keyword in description');
        score -= 5;
      }
    }

    // Check for image alt text (would need to parse HTML)
    if (!htmlContent.includes('alt=')) {
      recommendations.push('Add alt text to images');
      score -= 5;
    }

    // Check for heading structure
    if (!htmlContent.includes('<h1>')) {
      issues.push('Missing H1 tag');
      score -= 15;
    }

    if (!htmlContent.includes('<h2>')) {
      recommendations.push('Add H2 tags for better content structure');
      score -= 5;
    }

    // Check for internal links
    const internalLinks = (htmlContent.match(/href="[^"]*"/g) || []).length;
    if (internalLinks < 2) {
      recommendations.push('Add more internal links');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  /**
   * Generate sitemap data
   */
  generateSitemapData(pages: Array<{
    url: string;
    lastModified: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }>): string {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(disallowPaths: string[] = []): string {
    let robots = `User-agent: *
Allow: /

Sitemap: ${this.config.siteUrl}/sitemap.xml
`;

    if (disallowPaths.length > 0) {
      robots += disallowPaths.map(path => `Disallow: ${path}`).join('\n');
    }

    return robots;
  }
}

// Default SEO configuration
export const defaultSEOConfig: SEOConfig = {
  siteName: 'Hot Dash',
  siteDescription: 'Hot Rod AN Control Center - Centralized metrics, inventory control, CX, and growth levers for Shopify stores.',
  siteUrl: process.env.SITE_URL || 'https://hotdash.fly.dev',
  defaultImage: '/og-image.png',
  twitterHandle: 'hotdash',
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  googleSearchConsoleId: process.env.GOOGLE_SEARCH_CONSOLE_ID,
  bingWebmasterId: process.env.BING_WEBMASTER_ID
};

// Export default optimizer instance
export const seoOptimizer = new SEOOptimizer(defaultSEOConfig);
