/**
 * Structured Data Validator
 * 
 * Validate JSON-LD, Microdata, and RDFa structured data
 * 
 * @module lib/seo/structured-data
 */

export type SchemaType = 'Product' | 'Article' | 'Organization' | 'LocalBusiness' | 'BreadcrumbList' | 'FAQPage' | 'Review';

export interface StructuredData {
  '@context': string;
  '@type': SchemaType | string;
  [key: string]: any;
}

export interface StructuredDataValidation {
  isValid: boolean;
  schemas: StructuredData[];
  issues: StructuredDataIssue[];
  warnings: StructuredDataIssue[];
}

export interface StructuredDataIssue {
  type: 'error' | 'warning';
  schemaType: string;
  field?: string;
  message: string;
}

/**
 * Required fields for common schema types
 */
export const REQUIRED_FIELDS: Record<string, string[]> = {
  Product: ['name', 'image', 'description'],
  Article: ['headline', 'image', 'datePublished', 'author'],
  Organization: ['name', 'url'],
  LocalBusiness: ['name', 'address', 'telephone'],
  BreadcrumbList: ['itemListElement'],
  FAQPage: ['mainEntity'],
  Review: ['itemReviewed', 'reviewRating', 'author'],
};

/**
 * Validate structured data
 */
export function validateStructuredData(data: StructuredData): StructuredDataIssue[] {
  const issues: StructuredDataIssue[] = [];
  
  if (!data['@context']) {
    issues.push({
      type: 'error',
      schemaType: data['@type'] || 'Unknown',
      message: 'Missing @context',
    });
  }
  
  if (!data['@type']) {
    issues.push({
      type: 'error',
      schemaType: 'Unknown',
      message: 'Missing @type',
    });
    return issues;
  }
  
  const requiredFields = REQUIRED_FIELDS[data['@type']];
  
  if (requiredFields) {
    requiredFields.forEach(field => {
      if (!data[field]) {
        issues.push({
          type: 'error',
          schemaType: data['@type'],
          field,
          message: `Missing required field: ${field}`,
        });
      }
    });
  }
  
  return issues;
}

/**
 * Validate multiple schemas
 */
export function validateSchemas(schemas: StructuredData[]): StructuredDataValidation {
  const allIssues: StructuredDataIssue[] = [];
  const allWarnings: StructuredDataIssue[] = [];
  
  schemas.forEach(schema => {
    const issues = validateStructuredData(schema);
    issues.forEach(issue => {
      if (issue.type === 'error') {
        allIssues.push(issue);
      } else {
        allWarnings.push(issue);
      }
    });
  });
  
  return {
    isValid: allIssues.length === 0,
    schemas,
    issues: allIssues,
    warnings: allWarnings,
  };
}

