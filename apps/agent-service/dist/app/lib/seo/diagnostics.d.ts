/**
 * SEO Diagnostics
 *
 * Diagnostic utilities for SEO analysis
 */
export interface SEODiagnostic {
    type: string;
    severity: "info" | "warning" | "error";
    message: string;
}
export declare function runDiagnostics(data: any): SEODiagnostic[];
export declare function buildSeoDiagnostics(data: any): SEODiagnostic[];
//# sourceMappingURL=diagnostics.d.ts.map