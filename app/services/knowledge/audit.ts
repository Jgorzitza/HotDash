import type { AuditRecord } from "./learning";
export interface KbAuditRow { id:string; suggestion_id:string; editor_email:string; tone:number; accuracy:number; policy:number; diff_summary:string; edit_distance:number; evidence_refs:string[]; created_at:string; provenance_source:string; provenance_version:string }
export function buildKbAuditInsert(audit:AuditRecord):KbAuditRow{ return { id:audit.id, suggestion_id:audit.suggestionId, editor_email:audit.editor, tone:audit.grades.tone, accuracy:audit.grades.accuracy, policy:audit.grades.policy, diff_summary:audit.edits.diffSummary, edit_distance:audit.edits.editDistance, evidence_refs:audit.evidenceRefs, created_at:audit.createdAt, provenance_source:audit.provenance.source, provenance_version:audit.provenance.version } }

