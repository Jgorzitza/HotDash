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

export function runDiagnostics(_data: any): SEODiagnostic[] {
  return [];
}

export function buildSeoDiagnostics(_data: any): SEODiagnostic[] {
  return [];
}
