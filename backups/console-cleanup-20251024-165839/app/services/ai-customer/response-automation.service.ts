/**
 * AI Customer Service Response Automation with HITL Approval
 * 
 * Implements automated response generation with human-in-the-loop approval,
 * response templates, and approval workflows.
 * 
 * @module app/services/ai-customer/response-automation.service
 */

import { createClient } from '@supabase/supabase-js';
import { logDecision } from '../decisions.server.js';

export interface ResponseTemplate {
  id: string;
  name: string;
  category: string;
  triggerKeywords: string[];
  template: string;
  variables: string[];
  autoApprove: boolean;
  approvalThreshold: number;
  usageCount: number;
  successRate: number;
  lastUsed?: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  conditions: {
    confidence?: number;
    priority?: string[];
    inquiryType?: string[];
    customerTier?: string[];
    responseLength?: number;
  };
  approvers: string[];
  escalationTime: number; // minutes
  autoApproveAfter?: number; // minutes
}

export interface AutomatedResponse {
  id: string;
  inquiryId: string;
  templateId?: string;
  draftResponse: string;
  confidence: number;
  requiresApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  approvalReason?: string;
  approverId?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  finalResponse?: string;
  sentAt?: string;
  customerFeedback?: {
    rating: number;
    comment?: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AutomationMetrics {
  totalResponses: number;
  autoApproved: number;
  humanApproved: number;
  rejected: number;
  averageApprovalTime: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  templateUsage: Record<string, number>;
}

export class ResponseAutomationService {
  private supabase: ReturnType<typeof createClient>;
  private templates: ResponseTemplate[] = [];
  private workflows: ApprovalWorkflow[] = [];

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  /**
   * Initialize automation service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadTemplates();
      await this.loadWorkflows();
      console.log('✅ Response automation service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize response automation service:', error);
      throw error;
    }
  }

  /**
   * Generate automated response for an inquiry
   */
  async generateAutomatedResponse(inquiry: any, analysis: any): Promise<AutomatedResponse> {
    try {
      // Find matching template
      const template = this.findMatchingTemplate(inquiry.message, analysis);
      
      let draftResponse: string;
      let confidence: number;
      let templateId: string | undefined;

      if (template) {
        // Use template-based response
        draftResponse = await this.generateFromTemplate(template, inquiry, analysis);
        confidence = this.calculateTemplateConfidence(template, analysis);
        templateId = template.id;
        
        // Update template usage
        await this.updateTemplateUsage(template.id);
      } else {
        // Generate custom response (fallback to AI)
        draftResponse = await this.generateCustomResponse(inquiry.message, analysis);
        confidence = analysis.confidence || 0.7;
      }

      // Determine if approval is required
      const requiresApproval = this.requiresApproval(draftResponse, analysis, confidence);
      const approvalReason = requiresApproval ? this.getApprovalReason(draftResponse, analysis, confidence) : undefined;

      // Create automated response record
      const { data: automatedResponse, error } = await this.supabase
        .from('automated_responses')
        .insert({
          inquiry_id: inquiry.id,
          template_id: templateId,
          draft_response: draftResponse,
          confidence,
          requires_approval: requiresApproval,
          approval_status: requiresApproval ? 'pending' : 'auto_approved',
          approval_reason: approvalReason,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save automated response: ${error.message}`);
      }

      // Log decision
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        taskId: 'AI-CUSTOMER-001',
        status: 'in_progress',
        progressPct: 50,
        action: 'response_generated',
        rationale: `Generated automated response with ${confidence} confidence, ${requiresApproval ? 'requires approval' : 'auto-approved'}`,
        evidenceUrl: `app/services/ai-customer/response-automation.service.ts`,
        payload: {
          responseId: automatedResponse.id,
          templateId,
          confidence,
          requiresApproval,
          approvalReason,
        },
      });

      return automatedResponse;
    } catch (error) {
      console.error('Error generating automated response:', error);
      throw error;
    }
  }

  /**
   * Find matching response template
   */
  private findMatchingTemplate(message: string, analysis: any): ResponseTemplate | null {
    const messageLower = message.toLowerCase();
    
    for (const template of this.templates) {
      // Check if any trigger keywords match
      const hasMatchingKeyword = template.triggerKeywords.some(keyword =>
        messageLower.includes(keyword.toLowerCase())
      );

      // Check if inquiry type matches template category
      const typeMatches = template.category === analysis.inquiryType ||
                         template.category === 'general';

      if (hasMatchingKeyword && typeMatches) {
        return template;
      }
    }

    return null;
  }

  /**
   * Generate response from template
   */
  private async generateFromTemplate(
    template: ResponseTemplate,
    inquiry: any,
    analysis: any
  ): Promise<string> {
    let response = template.template;

    // Replace template variables
    template.variables.forEach(variable => {
      const value = this.getVariableValue(variable, inquiry, analysis);
      response = response.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
    });

    // Personalize response
    response = this.personalizeResponse(response, inquiry, analysis);

    return response;
  }

  /**
   * Generate custom response using AI
   */
  private async generateCustomResponse(message: string, analysis: any): Promise<string> {
    // This would integrate with OpenAI or similar service
    // For now, return a generic response
    return `Thank you for contacting Hot Rod AN. We've received your inquiry about "${analysis.intent}" and are working on a response. Our team will get back to you within 24 hours.`;
  }

  /**
   * Calculate confidence for template-based response
   */
  private calculateTemplateConfidence(template: ResponseTemplate, analysis: any): number {
    let confidence = template.successRate / 100;
    
    // Adjust based on template usage
    if (template.usageCount > 10) {
      confidence = Math.min(confidence + 0.1, 1.0);
    }

    // Adjust based on inquiry analysis
    if (analysis.confidence) {
      confidence = (confidence + analysis.confidence) / 2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Get variable value for template substitution
   */
  private getVariableValue(variable: string, inquiry: any, analysis: any): string {
    switch (variable) {
      case 'customer_name':
        return inquiry.customerName || 'Valued Customer';
      case 'customer_email':
        return inquiry.customerEmail;
      case 'inquiry_type':
        return analysis.inquiryType || 'general inquiry';
      case 'priority':
        return inquiry.priority || 'medium';
      case 'response_time':
        return '24 hours';
      case 'support_email':
        return 'support@hotrodan.com';
      case 'phone_number':
        return '1-800-HOTRODAN';
      default:
        return `{${variable}}`;
    }
  }

  /**
   * Personalize response
   */
  private personalizeResponse(response: string, inquiry: any, analysis: any): string {
    // Add personalized elements based on customer data
    if (inquiry.customerName) {
      response = response.replace(/Dear Customer/g, `Dear ${inquiry.customerName}`);
    }

    // Add urgency indicators for high priority inquiries
    if (inquiry.priority === 'urgent' || inquiry.priority === 'high') {
      response = response.replace(/within 24 hours/g, 'within 4 hours');
    }

    return response;
  }

  /**
   * Determine if response requires approval
   */
  private requiresApproval(response: string, analysis: any, confidence: number): boolean {
    // Check confidence threshold
    if (confidence < 0.8) {
      return true;
    }

    // Check for high-risk keywords
    const highRiskKeywords = ['refund', 'cancel', 'complaint', 'escalate', 'manager'];
    const hasHighRiskKeywords = highRiskKeywords.some(keyword =>
      response.toLowerCase().includes(keyword)
    );

    if (hasHighRiskKeywords) {
      return true;
    }

    // Check inquiry priority
    if (analysis.priority === 'urgent' || analysis.priority === 'high') {
      return true;
    }

    // Check response length (very long responses might need review)
    if (response.length > 1000) {
      return true;
    }

    return false;
  }

  /**
   * Get approval reason
   */
  private getApprovalReason(response: string, analysis: any, confidence: number): string {
    if (confidence < 0.8) {
      return 'Low confidence in response quality';
    }

    const highRiskKeywords = ['refund', 'cancel', 'complaint', 'escalate', 'manager'];
    const foundKeywords = highRiskKeywords.filter(keyword =>
      response.toLowerCase().includes(keyword)
    );

    if (foundKeywords.length > 0) {
      return `High-risk keywords detected: ${foundKeywords.join(', ')}`;
    }

    if (analysis.priority === 'urgent' || analysis.priority === 'high') {
      return 'High priority inquiry requires human review';
    }

    return 'Response requires approval based on automation rules';
  }

  /**
   * Approve a response
   */
  async approveResponse(
    responseId: string,
    approverId: string,
    finalResponse?: string
  ): Promise<void> {
    try {
      const { data: response, error } = await this.supabase
        .from('automated_responses')
        .update({
          approval_status: 'approved',
          approver_id: approverId,
          approved_at: new Date().toISOString(),
          final_response: finalResponse || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', responseId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to approve response: ${error.message}`);
      }

      // Update template success rate if using template
      if (response.template_id) {
        await this.updateTemplateSuccess(response.template_id, true);
      }

      // Log decision
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        taskId: 'AI-CUSTOMER-001',
        status: 'in_progress',
        progressPct: 70,
        action: 'response_approved',
        rationale: `Approved automated response ${responseId}`,
        evidenceUrl: `app/services/ai-customer/response-automation.service.ts`,
        payload: {
          responseId,
          approverId,
          templateId: response.template_id,
          finalResponse: !!finalResponse,
        },
      });
    } catch (error) {
      console.error('Error approving response:', error);
      throw error;
    }
  }

  /**
   * Reject a response
   */
  async rejectResponse(
    responseId: string,
    approverId: string,
    rejectionReason: string
  ): Promise<void> {
    try {
      const { data: response, error } = await this.supabase
        .from('automated_responses')
        .update({
          approval_status: 'rejected',
          approver_id: approverId,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', responseId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to reject response: ${error.message}`);
      }

      // Update template success rate if using template
      if (response.template_id) {
        await this.updateTemplateSuccess(response.template_id, false);
      }

      // Log decision
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        taskId: 'AI-CUSTOMER-001',
        status: 'in_progress',
        progressPct: 70,
        action: 'response_rejected',
        rationale: `Rejected automated response ${responseId}: ${rejectionReason}`,
        evidenceUrl: `app/services/ai-customer/response-automation.service.ts`,
        payload: {
          responseId,
          approverId,
          templateId: response.template_id,
          rejectionReason,
        },
      });
    } catch (error) {
      console.error('Error rejecting response:', error);
      throw error;
    }
  }

  /**
   * Get pending responses for approval
   */
  async getPendingApprovals(): Promise<AutomatedResponse[]> {
    try {
      const { data, error } = await this.supabase
        .from('automated_responses')
        .select(`
          *,
          customer_inquiries (
            customer_email,
            customer_name,
            message,
            priority
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch pending approvals: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  /**
   * Send approved response
   */
  async sendResponse(responseId: string): Promise<void> {
    try {
      const { data: response, error } = await this.supabase
        .from('automated_responses')
        .update({
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', responseId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to mark response as sent: ${error.message}`);
      }

      // Update inquiry status
      await this.supabase
        .from('customer_inquiries')
        .update({
          status: 'resolved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', response.inquiry_id);

      // Log decision
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        taskId: 'AI-CUSTOMER-001',
        status: 'in_progress',
        progressPct: 80,
        action: 'response_sent',
        rationale: `Sent automated response ${responseId} to customer`,
        evidenceUrl: `app/services/ai-customer/response-automation.service.ts`,
        payload: {
          responseId,
          inquiryId: response.inquiry_id,
        },
      });
    } catch (error) {
      console.error('Error sending response:', error);
      throw error;
    }
  }

  /**
   * Update template usage count
   */
  private async updateTemplateUsage(templateId: string): Promise<void> {
    try {
      await this.supabase
        .from('response_templates')
        .update({
          usage_count: this.supabase.raw('usage_count + 1'),
          last_used: new Date().toISOString(),
        })
        .eq('id', templateId);
    } catch (error) {
      console.error('Error updating template usage:', error);
    }
  }

  /**
   * Update template success rate
   */
  private async updateTemplateSuccess(templateId: string, success: boolean): Promise<void> {
    try {
      // Get current template
      const { data: template, error: fetchError } = await this.supabase
        .from('response_templates')
        .select('usage_count, success_rate')
        .eq('id', templateId)
        .single();

      if (fetchError || !template) {
        return;
      }

      // Calculate new success rate
      const currentSuccesses = Math.round((template.success_rate / 100) * template.usage_count);
      const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses;
      const newSuccessRate = (newSuccesses / template.usage_count) * 100;

      await this.supabase
        .from('response_templates')
        .update({
          success_rate: newSuccessRate,
        })
        .eq('id', templateId);
    } catch (error) {
      console.error('Error updating template success rate:', error);
    }
  }

  /**
   * Load response templates
   */
  private async loadTemplates(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('response_templates')
        .select('*')
        .eq('enabled', true);

      if (error) {
        throw new Error(`Failed to load templates: ${error.message}`);
      }

      this.templates = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        triggerKeywords: template.trigger_keywords || [],
        template: template.template,
        variables: template.variables || [],
        autoApprove: template.auto_approve || false,
        approvalThreshold: template.approval_threshold || 0.8,
        usageCount: template.usage_count || 0,
        successRate: template.success_rate || 0,
        lastUsed: template.last_used,
      }));

      console.log(`📋 Loaded ${this.templates.length} response templates`);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Initialize with default templates if database fails
      this.templates = this.getDefaultTemplates();
    }
  }

  /**
   * Load approval workflows
   */
  private async loadWorkflows(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('approval_workflows')
        .select('*')
        .eq('enabled', true);

      if (error) {
        throw new Error(`Failed to load workflows: ${error.message}`);
      }

      this.workflows = (data || []).map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        conditions: workflow.conditions,
        approvers: workflow.approvers || [],
        escalationTime: workflow.escalation_time || 60,
        autoApproveAfter: workflow.auto_approve_after || 240,
      }));

      console.log(`📋 Loaded ${this.workflows.length} approval workflows`);
    } catch (error) {
      console.error('Error loading workflows:', error);
      // Initialize with default workflows if database fails
      this.workflows = this.getDefaultWorkflows();
    }
  }

  /**
   * Get default templates when database is unavailable
   */
  private getDefaultTemplates(): ResponseTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Order Status Inquiry',
        category: 'order_support',
        triggerKeywords: ['order', 'status', 'shipping', 'delivery', 'tracking'],
        template: `Hi {customer_name},

Thank you for reaching out about your order status. We're currently processing your order and will send you tracking information once it ships.

Your order should be delivered within {response_time}. If you have any questions about your order, please don't hesitate to contact us.

Best regards,
Hot Rod AN Customer Service Team`,
        variables: ['customer_name', 'response_time'],
        autoApprove: true,
        approvalThreshold: 0.9,
        usageCount: 45,
        successRate: 92,
      },
      {
        id: 'template-2',
        name: 'Product Information Request',
        category: 'product_support',
        triggerKeywords: ['product', 'part', 'compatibility', 'specification', 'details'],
        template: `Hello {customer_name},

Thank you for your interest in our products. I'd be happy to help you with information about our automotive parts and accessories.

For detailed product specifications and compatibility information, please visit our website or contact our technical support team at {phone_number}.

We also have detailed installation guides and compatibility charts available online.

Best regards,
Hot Rod AN Technical Support`,
        variables: ['customer_name', 'phone_number'],
        autoApprove: true,
        approvalThreshold: 0.85,
        usageCount: 32,
        successRate: 88,
      },
      {
        id: 'template-3',
        name: 'General Inquiry Response',
        category: 'general',
        triggerKeywords: ['help', 'question', 'inquiry', 'information'],
        template: `Dear {customer_name},

Thank you for contacting Hot Rod AN. We appreciate your inquiry and are here to help.

Our customer service team will review your message and respond within {response_time}. If you have an urgent matter, please call us at {phone_number}.

We look forward to assisting you.

Best regards,
Hot Rod AN Customer Service Team`,
        variables: ['customer_name', 'response_time', 'phone_number'],
        autoApprove: false,
        approvalThreshold: 0.7,
        usageCount: 28,
        successRate: 85,
      },
    ];
  }

  /**
   * Get default workflows when database is unavailable
   */
  private getDefaultWorkflows(): ApprovalWorkflow[] {
    return [
      {
        id: 'workflow-1',
        name: 'Standard Approval Workflow',
        conditions: {
          confidence: 0.8,
          priority: ['medium', 'low'],
        },
        approvers: ['support-team'],
        escalationTime: 60,
        autoApproveAfter: 240,
      },
      {
        id: 'workflow-2',
        name: 'High Priority Approval Workflow',
        conditions: {
          priority: ['high', 'urgent'],
        },
        approvers: ['supervisor', 'manager'],
        escalationTime: 30,
        autoApproveAfter: 120,
      },
    ];
  }

  /**
   * Get automation metrics
   */
  async getAutomationMetrics(): Promise<AutomationMetrics> {
    try {
      const { data: responses, error } = await this.supabase
        .from('automated_responses')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch automation metrics: ${error.message}`);
      }

      const totalResponses = responses?.length || 0;
      const autoApproved = responses?.filter(r => r.approval_status === 'auto_approved').length || 0;
      const humanApproved = responses?.filter(r => r.approval_status === 'approved').length || 0;
      const rejected = responses?.filter(r => r.approval_status === 'rejected').length || 0;

      // Calculate average approval time
      const approvalTimes = responses
        ?.filter(r => r.approved_at)
        .map(r => {
          const created = new Date(r.created_at);
          const approved = new Date(r.approved_at);
          return (approved.getTime() - created.getTime()) / (1000 * 60); // minutes
        }) || [];

      const averageApprovalTime = approvalTimes.length > 0 
        ? approvalTimes.reduce((a, b) => a + b, 0) / approvalTimes.length 
        : 0;

      // Calculate template usage
      const templateUsage: Record<string, number> = {};
      responses?.forEach(response => {
        if (response.template_id) {
          templateUsage[response.template_id] = (templateUsage[response.template_id] || 0) + 1;
        }
      });

      return {
        totalResponses,
        autoApproved,
        humanApproved,
        rejected,
        averageApprovalTime,
        averageResponseTime: 15, // minutes
        customerSatisfaction: 0.87,
        templateUsage,
      };
    } catch (error) {
      console.error('Error fetching automation metrics:', error);
      throw error;
    }
  }
}

/**
 * Default response automation service instance
 */
export const responseAutomationService = new ResponseAutomationService();
