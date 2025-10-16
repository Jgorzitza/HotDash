/**
 * Meta Tag Optimization Recommendations
 *
 * Provides lightweight, pure functions to audit and suggest improvements
 * for HTML title and meta description tags. No side effects; no API calls.
 *
 * Allowed path: app/services/seo/meta-optimizer.ts
 */

export type MetaField = 'title' | 'description' | 'h1';
export type Severity = 'high' | 'medium' | 'low';

export interface MetaAuditIssue {
  id: string;
  field: MetaField;
  severity: Severity;
  message: string;
  current?: string;
  suggested?: string;
  evidence?: Record<string, unknown>;
}

export interface MetaAuditInput {
  title?: string;
  description?: string;
  h1?: string;
  primaryKeyword?: string; // optional focus keyword
  brand?: string;
}

export interface MetaOptimizeResult {
  title?: string;
  description?: string;
  h1?: string;
  issues: MetaAuditIssue[];
  score: number; // 0-100 simple heuristic
}

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

function within(len: number, min: number, max: number): boolean {
  return len >= min && len <= max;
}

function includesEarly(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  return idx > -1 && idx <= 30; // early means in the first ~30 chars
}

export function suggestTitle(opts: { primaryKeyword?: string; brand?: string; maxLength?: number }): string {
  const { primaryKeyword, brand, maxLength = TITLE_MAX } = opts;
  const base = primaryKeyword ? `${primaryKeyword} ` : '';
  const tail = brand ? `| ${brand}` : '';
  let suggestion = `${base}${tail}`.trim();
  if (!suggestion) suggestion = 'Your Page Title';
  return suggestion.length > maxLength ? suggestion.slice(0, maxLength).trim() : suggestion;
}

export function suggestDescription(opts: { primaryKeyword?: string; usp?: string; cta?: string; maxLength?: number }): string {
  const { primaryKeyword, usp = 'Shop quality products', cta = 'Learn more', maxLength = DESC_MAX } = opts;
  const parts = [primaryKeyword, usp, cta].filter(Boolean);
  let suggestion = parts.join(' — ');
  if (!suggestion) suggestion = 'Discover more on this page.';
  return suggestion.length > maxLength ? suggestion.slice(0, maxLength).trim() : suggestion;
}

export function auditMeta(input: MetaAuditInput): MetaAuditIssue[] {
  const issues: MetaAuditIssue[] = [];
  const { title, description, h1, primaryKeyword } = input;

  // Title checks
  if (!title || !title.trim()) {
    issues.push({ id: 'title.missing', field: 'title', severity: 'high', message: 'Missing <title> tag', suggested: suggestTitle({ primaryKeyword, brand: input.brand }) });
  } else {
    if (!within(title.length, TITLE_MIN, TITLE_MAX)) {
      const severity: Severity = title.length < TITLE_MIN ? 'medium' : 'low';
      issues.push({ id: 'title.length', field: 'title', severity, message: `Title length ${title.length} is outside ${TITLE_MIN}-${TITLE_MAX} characters`, current: title });
    }
    if (primaryKeyword && !includesEarly(title, primaryKeyword)) {
      issues.push({ id: 'title.keyword', field: 'title', severity: 'medium', message: 'Primary keyword not present early in title', current: title, suggested: suggestTitle({ primaryKeyword, brand: input.brand }) });
    }
    if (h1 && h1.trim() === title.trim()) {
      issues.push({ id: 'title.duplicateH1', field: 'title', severity: 'low', message: 'Title matches H1 exactly; consider variation for breadth', current: title });
    }
  }

  // Description checks
  if (!description || !description.trim()) {
    issues.push({ id: 'desc.missing', field: 'description', severity: 'medium', message: 'Missing meta description', suggested: suggestDescription({ primaryKeyword }) });
  } else {
    if (!within(description.length, DESC_MIN, DESC_MAX)) {
      const severity: Severity = description.length < DESC_MIN ? 'medium' : 'low';
      issues.push({ id: 'desc.length', field: 'description', severity, message: `Description length ${description.length} is outside ${DESC_MIN}-${DESC_MAX} characters`, current: description });
    }
    if (primaryKeyword && description.toLowerCase().indexOf(primaryKeyword.toLowerCase()) === -1) {
      issues.push({ id: 'desc.keyword', field: 'description', severity: 'low', message: 'Consider including the primary keyword', current: description, suggested: suggestDescription({ primaryKeyword }) });
    }
  }

  // H1 checks
  if (!h1 || !h1.trim()) {
    issues.push({ id: 'h1.missing', field: 'h1', severity: 'low', message: 'Missing H1 heading' });
  } else if (primaryKeyword && h1.toLowerCase().indexOf(primaryKeyword.toLowerCase()) === -1) {
    issues.push({ id: 'h1.keyword', field: 'h1', severity: 'low', message: 'Consider including the primary keyword in H1', current: h1 });
  }

  return issues;
}

export function optimizeMeta(input: MetaAuditInput): MetaOptimizeResult {
  const issues = auditMeta(input);
  // Simple scoring: start at 100 and subtract per issue severity
  const penalty = issues.reduce((acc, i) => acc + (i.severity === 'high' ? 40 : i.severity === 'medium' ? 20 : 10), 0);
  const score = Math.max(0, 100 - penalty);

  const output: MetaOptimizeResult = {
    title: input.title || suggestTitle({ primaryKeyword: input.primaryKeyword, brand: input.brand }),
    description: input.description || suggestDescription({ primaryKeyword: input.primaryKeyword }),
    h1: input.h1 || (input.primaryKeyword ? `${input.primaryKeyword}` : 'Heading'),
    issues,
    score,
  };

  return output;
}

