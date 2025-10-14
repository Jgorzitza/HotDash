/**
 * CEO Approval Workflow for Multi-Language Agent Content
 */

import type { SupportedLocale } from './templates.i18n';

export interface CEOApprovalRequest {
  id: string;
  templateId: string;
  locale: SupportedLocale;
  originalText: string;
  translatedText: string;
  context: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

const approvalQueue: CEOApprovalRequest[] = [];

export async function submitForCEOApproval(params: {
  templateId: string;
  locale: SupportedLocale;
  originalText: string;
  translatedText: string;
  context: string;
}): Promise<CEOApprovalRequest> {
  const request: CEOApprovalRequest = {
    id: `ceo_approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: params.templateId,
    locale: params.locale,
    originalText: params.originalText,
    translatedText: params.translatedText,
    context: params.context,
    createdAt: new Date(),
    status: 'pending',
  };

  approvalQueue.push(request);
  console.log(`[CEO Approval] New translation submitted:`, { id: request.id, template: request.templateId, locale: request.locale });
  return request;
}

export function getPendingCEOApprovals(): CEOApprovalRequest[] {
  return approvalQueue.filter((req) => req.status === 'pending');
}

export async function approveCEOTranslation(approvalId: string, approvedBy: string): Promise<CEOApprovalRequest | null> {
  const request = approvalQueue.find((req) => req.id === approvalId);
  if (!request || request.status !== 'pending') return null;

  request.status = 'approved';
  request.approvedBy = approvedBy;
  request.approvedAt = new Date();
  console.log(`[CEO Approval] Translation approved:`, { id: request.id, template: request.templateId, locale: request.locale, approvedBy });
  return request;
}

export async function rejectCEOTranslation(approvalId: string, reason: string, rejectedBy: string): Promise<CEOApprovalRequest | null> {
  const request = approvalQueue.find((req) => req.id === approvalId);
  if (!request || request.status !== 'pending') return null;

  request.status = 'rejected';
  request.rejectionReason = reason;
  request.approvedBy = rejectedBy;
  console.log(`[CEO Approval] Translation rejected:`, { id: request.id, template: request.templateId, locale: request.locale, reason });
  return request;
}

export function getApprovalStatus(templateId: string, locale: SupportedLocale): 'pending' | 'approved' | 'rejected' | 'not_submitted' {
  const request = approvalQueue.find((req) => req.templateId === templateId && req.locale === locale);
  return request?.status ?? 'not_submitted';
}

export function isApprovedForProduction(templateId: string, locale: SupportedLocale): boolean {
  if (locale === 'en') return true;
  const status = getApprovalStatus(templateId, locale);
  return status === 'approved';
}
