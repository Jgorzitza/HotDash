/**
 * CSV/Excel Data Export Service
 *
 * Streams analytics data to CSV format
 * Supports all 4 analytics areas: social, SEO, ads, growth
 * Date range filtering
 * Large dataset streaming support
 */
export type ExportType = "social" | "seo" | "ads" | "growth" | "all";
export interface ExportOptions {
    type: ExportType;
    shopDomain: string;
    startDate?: Date;
    endDate?: Date;
    format?: "csv" | "json";
}
/**
 * Generate CSV content for analytics data
 * Uses async generator for streaming large datasets
 */
export declare function generateCSVStream(options: ExportOptions): AsyncGenerator<string>;
/**
 * Convert async generator to ReadableStream for Response
 */
export declare function createCSVStream(options: ExportOptions): Promise<ReadableStream<Uint8Array>>;
/**
 * Generate filename for export
 */
export declare function generateExportFilename(type: ExportType, format?: string): string;
//# sourceMappingURL=csv-export.d.ts.map