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
/**
 * Validate schema markup across multiple pages
 */
export declare function validateSchemaMarkup(urls: string[]): Promise<SchemaValidationReport>;
//# sourceMappingURL=schema-validator.d.ts.map