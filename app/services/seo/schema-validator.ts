/**
 * Schema Markup Validator Service
 *
 * Validates JSON-LD structured data on web pages:
 * - Product schema (schema.org/Product)
 * - Organization schema (schema.org/Organization)
 * - WebSite schema (schema.org/WebSite)
 *
 * Features:
 * - Parse and validate JSON-LD markup
 * - Check required fields
 * - Detect schema errors and warnings
 * - Provide recommendations for improvements
 *
 * @module services/seo/schema-validator
 */

import { getCached, setCached } from "../cache.server";
import { appMetrics } from "../../utils/metrics.server";

// ============================================================================
// Types
// ============================================================================

export type SchemaType = "Product" | "Organization" | "WebSite" | "BreadcrumbList" | "FAQPage" | "Unknown";

export interface SchemaValidationIssue {
  type: "error" | "warning" | "info";
  field: string;
  message: string;
  currentValue?: any;
  expectedValue?: string;
  recommendation?: string;
}

export interface SchemaValidationResult {
  url: string;
  schemaType: SchemaType;
  isValid: boolean;
  hasRequiredFields: boolean;
  issues: SchemaValidationIssue[];
  schema: any;
  validatedAt: string;
}

export interface SchemaValidationReport {
  summary: {
    totalPages: number;
    pagesWithSchema: number;
    pagesWithValidSchema: number;
    pagesWithErrors: number;
    pagesWithWarnings: number;
    schemaTypeDistribution: Record<SchemaType, number>;
  };
  results: SchemaValidationResult[];
  topIssues: SchemaValidationIssue[];
  generatedAt: string;
}

// ============================================================================
// Schema Requirements
// ============================================================================

const SCHEMA_REQUIREMENTS = {
  Product: {
    required: ["@type", "name", "image", "description"],
    recommended: ["offers", "brand", "sku", "aggregateRating"],
    offerRequired: ["@type", "price", "priceCurrency", "availability"],
  },
  Organization: {
    required: ["@type", "name", "url"],
    recommended: ["logo", "contactPoint", "sameAs"],
  },
  WebSite: {
    required: ["@type", "name", "url"],
    recommended: ["potentialAction", "description"],
  },
  BreadcrumbList: {
    required: ["@type", "itemListElement"],
    recommended: [],
  },
  FAQPage: {
    required: ["@type", "mainEntity"],
    recommended: [],
  },
} as const;

// ============================================================================
// Schema Extraction
// ============================================================================

/**
 * Extract JSON-LD schemas from HTML
 */
function extractJSONLD(html: string): any[] {
  const schemas: any[] = [];
  
  // Find all script tags with type="application/ld+json"
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const jsonContent = match[1].trim();
      const parsed = JSON.parse(jsonContent);
      
      // Handle @graph arrays
      if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
        schemas.push(...parsed["@graph"]);
      } else {
        schemas.push(parsed);
      }
    } catch (error) {
      console.error("[Schema Validator] Failed to parse JSON-LD:", error);
    }
  }

  return schemas;
}

/**
 * Identify schema type from @type field
 */
function identifySchemaType(schema: any): SchemaType {
  const type = schema["@type"];
  if (!type) return "Unknown";

  const typeStr = Array.isArray(type) ? type[0] : type;

  if (typeStr.includes("Product")) return "Product";
  if (typeStr.includes("Organization")) return "Organization";
  if (typeStr.includes("WebSite")) return "WebSite";
  if (typeStr.includes("BreadcrumbList")) return "BreadcrumbList";
  if (typeStr.includes("FAQPage")) return "FAQPage";

  return "Unknown";
}

// ============================================================================
// Validation Logic
// ============================================================================

/**
 * Check if required fields are present
 */
function checkRequiredFields(
  schema: any,
  schemaType: SchemaType
): SchemaValidationIssue[] {
  const issues: SchemaValidationIssue[] = [];
  
  if (schemaType === "Unknown") return issues;

  const requirements = SCHEMA_REQUIREMENTS[schemaType];
  if (!requirements) return issues;

  // Check required fields
  requirements.required.forEach(field => {
    if (!schema[field] || (typeof schema[field] === "string" && schema[field].trim() === "")) {
      issues.push({
        type: "error",
        field,
        message: `Required field "${field}" is missing or empty`,
        recommendation: `Add a valid "${field}" field to the schema`,
      });
    }
  });

  // Check recommended fields
  requirements.recommended.forEach(field => {
    if (!schema[field]) {
      issues.push({
        type: "warning",
        field,
        message: `Recommended field "${field}" is missing`,
        recommendation: `Consider adding "${field}" to improve schema richness`,
      });
    }
  });

  return issues;
}

/**
 * Validate Product schema specifics
 */
function validateProductSchema(schema: any): SchemaValidationIssue[] {
  const issues: SchemaValidationIssue[] = [];

  // Check offers
  if (schema.offers) {
    const offers = Array.isArray(schema.offers) ? schema.offers : [schema.offers];
    const offerRequired = SCHEMA_REQUIREMENTS.Product.offerRequired;

    offers.forEach((offer, index) => {
      offerRequired.forEach(field => {
        if (!offer[field]) {
          issues.push({
            type: "error",
            field: `offers[${index}].${field}`,
            message: `Required offer field "${field}" is missing`,
            recommendation: `Add "${field}" to the product offer`,
          });
        }
      });

      // Validate price is a valid number
      if (offer.price && isNaN(parseFloat(offer.price))) {
        issues.push({
          type: "error",
          field: `offers[${index}].price`,
          message: "Price must be a valid number",
          currentValue: offer.price,
          recommendation: "Use a numeric value for price (e.g., 29.99)",
        });
      }

      // Check availability is a valid schema.org value
      if (offer.availability) {
        const validAvailability = [
          "https://schema.org/InStock",
          "https://schema.org/OutOfStock",
          "https://schema.org/PreOrder",
          "https://schema.org/Discontinued",
          "https://schema.org/LimitedAvailability",
        ];
        
        if (!validAvailability.includes(offer.availability)) {
          issues.push({
            type: "warning",
            field: `offers[${index}].availability`,
            message: "Availability should use schema.org URL format",
            currentValue: offer.availability,
            recommendation: "Use https://schema.org/InStock or other valid schema.org availability values",
          });
        }
      }
    });
  }

  // Check image format
  if (schema.image) {
    const images = Array.isArray(schema.image) ? schema.image : [schema.image];
    images.forEach((img, index) => {
      if (typeof img === "string" && !img.startsWith("http")) {
        issues.push({
          type: "warning",
          field: `image[${index}]`,
          message: "Image URL should be absolute (start with http/https)",
          currentValue: img,
          recommendation: "Use absolute URLs for images",
        });
      }
    });
  }

  // Check aggregateRating if present
  if (schema.aggregateRating) {
    const rating = schema.aggregateRating;
    if (!rating.ratingValue || !rating.reviewCount) {
      issues.push({
        type: "error",
        field: "aggregateRating",
        message: "aggregateRating must include ratingValue and reviewCount",
        recommendation: "Add both ratingValue and reviewCount to aggregateRating",
      });
    }

    if (rating.ratingValue) {
      const value = parseFloat(rating.ratingValue);
      if (isNaN(value) || value < 0 || value > 5) {
        issues.push({
          type: "error",
          field: "aggregateRating.ratingValue",
          message: "ratingValue must be between 0 and 5",
          currentValue: rating.ratingValue,
          recommendation: "Set ratingValue to a number between 0 and 5",
        });
      }
    }
  }

  return issues;
}

/**
 * Validate Organization schema specifics
 */
function validateOrganizationSchema(schema: any): SchemaValidationIssue[] {
  const issues: SchemaValidationIssue[] = [];

  // Check URL format
  if (schema.url && !schema.url.startsWith("http")) {
    issues.push({
      type: "error",
      field: "url",
      message: "URL must be absolute (start with http/https)",
      currentValue: schema.url,
      recommendation: "Use absolute URL for organization website",
    });
  }

  // Check logo format
  if (schema.logo && typeof schema.logo === "string" && !schema.logo.startsWith("http")) {
    issues.push({
      type: "warning",
      field: "logo",
      message: "Logo URL should be absolute",
      currentValue: schema.logo,
      recommendation: "Use absolute URL for logo image",
    });
  }

  return issues;
}

/**
 * Validate schema markup
 */
function validateSchema(schema: any, url: string): SchemaValidationResult {
  const schemaType = identifySchemaType(schema);
  const issues: SchemaValidationIssue[] = [];

  // Check for @context
  if (!schema["@context"] || !schema["@context"].includes("schema.org")) {
    issues.push({
      type: "error",
      field: "@context",
      message: "@context must be set to https://schema.org",
      currentValue: schema["@context"],
      recommendation: 'Add "@context": "https://schema.org" to the schema',
    });
  }

  // Check required fields
  issues.push(...checkRequiredFields(schema, schemaType));

  // Type-specific validation
  if (schemaType === "Product") {
    issues.push(...validateProductSchema(schema));
  } else if (schemaType === "Organization") {
    issues.push(...validateOrganizationSchema(schema));
  }

  const hasErrors = issues.some(i => i.type === "error");
  const hasRequiredFields = issues.filter(i => 
    i.type === "error" && i.message.includes("Required field")
  ).length === 0;

  return {
    url,
    schemaType,
    isValid: !hasErrors,
    hasRequiredFields,
    issues,
    schema,
    validatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate schema markup on a single page
 */
async function validatePageSchema(url: string): Promise<SchemaValidationResult[]> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "HotDash Schema Validator/1.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const schemas = extractJSONLD(html);

    if (schemas.length === 0) {
      return [{
        url,
        schemaType: "Unknown",
        isValid: false,
        hasRequiredFields: false,
        issues: [{
          type: "warning",
          field: "schema",
          message: "No JSON-LD schema found on page",
          recommendation: "Add structured data markup to improve search visibility",
        }],
        schema: null,
        validatedAt: new Date().toISOString(),
      }];
    }

    return schemas.map(schema => validateSchema(schema, url));
  } catch (error: any) {
    return [{
      url,
      schemaType: "Unknown",
      isValid: false,
      hasRequiredFields: false,
      issues: [{
        type: "error",
        field: "page",
        message: `Failed to validate schema: ${error.message}`,
      }],
      schema: null,
      validatedAt: new Date().toISOString(),
    }];
  }
}

/**
 * Validate schema markup across multiple pages
 */
export async function validateSchemaMarkup(urls: string[]): Promise<SchemaValidationReport> {
  const startTime = Date.now();

  const cacheKey = `seo:schema:${urls.length}:${urls[0]}`;
  const cached = getCached<SchemaValidationReport>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    // Validate all pages (limit concurrency to 5)
    const batchSize = 5;
    const allResults: SchemaValidationResult[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(url => validatePageSchema(url))
      );
      allResults.push(...batchResults.flat());
    }

    // Generate summary
    const pagesWithSchema = allResults.filter(r => r.schemaType !== "Unknown").length;
    const pagesWithValidSchema = allResults.filter(r => r.isValid).length;
    const pagesWithErrors = allResults.filter(r => 
      r.issues.some(i => i.type === "error")
    ).length;
    const pagesWithWarnings = allResults.filter(r =>
      r.issues.some(i => i.type === "warning")
    ).length;

    const schemaTypeDistribution: Record<SchemaType, number> = {
      Product: 0,
      Organization: 0,
      WebSite: 0,
      BreadcrumbList: 0,
      FAQPage: 0,
      Unknown: 0,
    };

    allResults.forEach(result => {
      schemaTypeDistribution[result.schemaType]++;
    });

    // Get top issues (most common)
    const issueMap = new Map<string, { issue: SchemaValidationIssue; count: number }>();
    allResults.forEach(result => {
      result.issues.forEach(issue => {
        const key = `${issue.type}:${issue.field}:${issue.message}`;
        if (issueMap.has(key)) {
          issueMap.get(key)!.count++;
        } else {
          issueMap.set(key, { issue, count: 1 });
        }
      });
    });

    const topIssues = Array.from(issueMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => item.issue);

    const report: SchemaValidationReport = {
      summary: {
        totalPages: urls.length,
        pagesWithSchema,
        pagesWithValidSchema,
        pagesWithErrors,
        pagesWithWarnings,
        schemaTypeDistribution,
      },
      results: allResults,
      topIssues,
      generatedAt: new Date().toISOString(),
    };

    const durationMs = Date.now() - startTime;
    appMetrics.gaApiCall("validateSchemaMarkup", true, durationMs);

    // Cache for 1 hour
    setCached(cacheKey, report, 3600000);

    return report;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    appMetrics.gaApiCall("validateSchemaMarkup", false, durationMs);
    throw error;
  }
}

