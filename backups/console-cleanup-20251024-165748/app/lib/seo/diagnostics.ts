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

export function runDiagnostics(data: any): SEODiagnostic[] {
  return [];
}

export function buildSeoDiagnostics(data: any): SEODiagnostic[] {
  return [];
}
