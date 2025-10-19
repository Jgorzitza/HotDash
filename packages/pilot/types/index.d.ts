export interface ScaffoldStep {
  id: string;
  path: string;
  status: "pending" | "in_progress" | "completed";
}
export interface ScaffoldPlan {
  version: string;
  steps: ScaffoldStep[];
}

export function planScaffold(options?: { version?: string }): ScaffoldPlan;
export function sum(nums?: number[]): number;
export function validatePlan(plan: unknown): { ok: boolean; errors: string[] };
export function normalizeSlug(input?: string): string;
