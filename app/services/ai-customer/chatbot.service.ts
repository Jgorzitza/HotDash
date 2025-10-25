/**
 * AI Customer Service Chatbot Implementation
 * 
 * Implements AI-powered customer service with OpenAI integration,
 * ticket routing, response automation, and HITL approval workflows.
 * 
 * @module app/services/ai-customer/chatbot.service
 */

import OpenAI from 'openai';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { logDecision } from '../decisions.server.js';

export interface CustomerInquiry {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  message: string;
  channel: 'email' | 'chat' | 'sms';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in_progress' | 'pending_approval' | 'resolved';
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface AIResponse {
  id: string;
  inquiryId: string;
  draftResponse: string;
  confidence: number;
  suggestedTags: string[];
  requiresApproval: boolean;
  approvalReason?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  finalResponse?: string;
  sentAt?: string;
  customerSatisfaction?: number;
}

export interface ChatbotConfig {
  openaiApiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  autoApproveThreshold: number;
  escalationKeywords: string[];
  piiDetection: boolean;
  responseTimeTarget: number; // seconds
  shopifyMCPEnabled: boolean;
  storefrontMCPEnabled: boolean;
  customerAccountsMCPEnabled: boolean;
}

export class AICustomerChatbot {
  private openai: OpenAI;
  private supabase: SupabaseClient | null;
  private config: ChatbotConfig;

  constructor(config: Partial<ChatbotConfig> = {}) {
    this.config = {
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
      maxTokens: 500,
      temperature: 0.7,
      systemPrompt: this.getDefaultSystemPrompt(),
      autoApproveThreshold: 0.9,
      escalationKeywords: ['complaint', 'refund', 'cancel', 'urgent', 'escalate'],
      piiDetection: true,
      responseTimeTarget: 300, // 5 minutes
      shopifyMCPEnabled: true,
      storefrontMCPEnabled: true,
      customerAccountsMCPEnabled: true,
      ...config,
    };

    this.openai = new OpenAI({
      apiKey: this.config.openaiApiKey,
    });

    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
    } else {
      this.supabase = null;
    }
  }

  private requireSupabase(): SupabaseClient {
    if (!this.supabase) {
      throw new Error("Supabase credentials not configured");
    }
    return this.supabase;
  }

  /**
   * Process a new customer inquiry
   */
  async processInquiry(inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<AIResponse> {
    try {
      const supabase = this.requireSupabase();
      // Create inquiry in database
      const { data: savedInquiry, error } = await supabase
        .from('customer_inquiries')
        .insert({
          customer_id: inquiry.customerId,
          customer_email: inquiry.customerEmail,
          customer_name: inquiry.customerName,
          message: inquiry.message,
          channel: inquiry.channel,
          priority: inquiry.priority,
          status: 'new',
          tags: inquiry.tags || [],
          metadata: inquiry.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save inquiry: ${error.message}`);
      }

      // Analyze inquiry and generate response
      const analysis = await this.analyzeInquiry(inquiry.message);
      
      // Call appropriate MCP tools based on analysis
      let mcpData: any = {};
      if (analysis.mcpToolsNeeded.includes('storefront-mcp')) {
        mcpData.storefront = await this.callStorefrontMCP(inquiry.message, inquiry.customerId);
      }
      if (analysis.mcpToolsNeeded.includes('customer-accounts-mcp')) {
        // This would require OAuth token in real implementation
        mcpData.customerAccounts = await this.callCustomerAccountsMCP('get_orders', inquiry.customerId, 'mock-token');
      }
      
      // Generate AI response with MCP data
      const draftResponse = await this.generateResponse(inquiry.message, analysis, mcpData);
      
      // Determine if approval is required
      const requiresApproval = this.requiresApproval(draftResponse, analysis);
      
      // Create AI response record
      const { data: aiResponse, error: responseError } = await supabase
        .from('ai_responses')
        .insert({
          inquiry_id: savedInquiry.id,
          draft_response: draftResponse,
          confidence: analysis.confidence,
          suggested_tags: analysis.suggestedTags,
          requires_approval: requiresApproval,
          approval_reason: requiresApproval ? analysis.approvalReason : null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (responseError) {
        throw new Error(`Failed to save AI response: ${responseError.message}`);
      }

      // Log decision
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        taskId: 'AI-CUSTOMER-001',
        status: 'in_progress',
        progressPct: 20,
        action: 'inquiry_processed',
        rationale: `Processed customer inquiry from ${inquiry.customerEmail}, generated response with ${analysis.confidence} confidence`,
        evidenceUrl: `app/services/ai-customer/chatbot.service.ts`,
        payload: {
          inquiryId: savedInquiry.id,
          confidence: analysis.confidence,
          requiresApproval,
          suggestedTags: analysis.suggestedTags,
        },
      });

      return aiResponse;
    } catch (error) {
      console.error('Error processing inquiry:', error);
      throw error;
    }
  }

  /**
   * Analyze customer inquiry to determine intent, sentiment, and routing
   */
  private async analyzeInquiry(message: string): Promise<{
    intent: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: number;
    confidence: number;
    suggestedTags: string[];
    approvalReason?: string;
    requiresEscalation: boolean;
    mcpToolsNeeded: string[];
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `Analyze this customer inquiry and return a JSON response with:
            - intent: what the customer wants (e.g., "order_status", "refund_request", "product_inquiry")
            - sentiment: "positive", "neutral", or "negative"
            - urgency: score from 0-1 (1 being most urgent)
            - confidence: how confident you are in your analysis (0-1)
            - suggestedTags: array of relevant tags
            - requiresEscalation: boolean if this needs human attention
            - approvalReason: reason if approval is needed
            - mcpToolsNeeded: array of MCP tools needed (e.g., ["storefront-mcp", "customer-accounts-mcp"])`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        intent: analysis.intent || 'general_inquiry',
        sentiment: analysis.sentiment || 'neutral',
        urgency: analysis.urgency || 0.5,
        confidence: analysis.confidence || 0.8,
        suggestedTags: analysis.suggestedTags || [],
        approvalReason: analysis.approvalReason,
        requiresEscalation: analysis.requiresEscalation || false,
        mcpToolsNeeded: analysis.mcpToolsNeeded || [],
      };
    } catch (error) {
      console.error('Error analyzing inquiry:', error);
      return {
        intent: 'general_inquiry',
        sentiment: 'neutral',
        urgency: 0.5,
        confidence: 0.5,
        suggestedTags: ['unclear'],
        requiresEscalation: true,
        mcpToolsNeeded: ['storefront-mcp'],
      };
    }
  }

  /**
   * Generate AI response to customer inquiry
   */
  private async generateResponse(message: string, analysis: any, mcpData?: any): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: this.config.systemPrompt,
          },
          {
            role: 'user',
            content: `Customer inquiry: "${message}"\n\nAnalysis: ${JSON.stringify(analysis)}\n\nMCP Data: ${mcpData ? JSON.stringify(mcpData) : 'No MCP data available'}\n\nGenerate a helpful, professional response using the available data.`,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I need more information to help you. Please provide additional details.';
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize for the delay. Our team is working on your inquiry and will respond shortly.';
    }
  }

  /**
   * Determine if response requires human approval
   */
  private requiresApproval(response: string, analysis: any): boolean {
    // Check confidence threshold
    if (analysis.confidence < this.config.autoApproveThreshold) {
      return true;
    }

    // Check for escalation keywords
    const hasEscalationKeywords = this.config.escalationKeywords.some(keyword =>
      response.toLowerCase().includes(keyword) || analysis.suggestedTags.includes(keyword)
    );

    if (hasEscalationKeywords) {
      return true;
    }

    // Check if escalation is required
    if (analysis.requiresEscalation) {
      return true;
    }

    return false;
  }

  /**
   * Get default system prompt for AI responses
   */
  private getDefaultSystemPrompt(): string {
    return `You are a helpful customer service representative for Hot Rod AN, a premium automotive parts retailer. 

Key guidelines:
- Be friendly, professional, and helpful
- Always prioritize customer satisfaction
- Provide accurate information about products, orders, and policies
- If you don't know something, say so and offer to connect them with a specialist
- For refunds, cancellations, or complaints, always offer to escalate to a human agent
- Keep responses concise but comprehensive
- Always end with asking if there's anything else you can help with

Company information:
- We sell premium automotive parts and accessories
- We offer fast shipping and excellent customer service
- We have a satisfaction guarantee on all products
- Customer service hours: Monday-Friday 8AM-6PM EST

Never make promises about specific timelines or policies that you're not certain about.`;
  }

  /**
   * Approve and send a response
   */
  async approveResponse(responseId: string, approvedBy: string, finalResponse?: string): Promise<void> {
    try {
      const supabase = this.requireSupabase();
      const { data: response, error } = await supabase
        .from('ai_responses')
        .update({
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          final_response: finalResponse || undefined,
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', responseId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to approve response: ${error.message}`);
      }

      // Update inquiry status
      await supabase
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
        progressPct: 60,
        action: 'response_approved',
        rationale: `Approved AI response ${responseId} for customer inquiry`,
        evidenceUrl: `app/services/ai-customer/chatbot.service.ts`,
        payload: {
          responseId,
          approvedBy,
          finalResponse: !!finalResponse,
        },
      });
    } catch (error) {
      console.error('Error approving response:', error);
      throw error;
    }
  }

  /**
   * Get pending responses that need approval
   */
  async getPendingResponses(): Promise<AIResponse[]> {
    try {
      const supabase = this.requireSupabase();
      const { data, error } = await supabase
        .from('ai_responses')
        .select(`
          *,
          customer_inquiries (
            customer_email,
            customer_name,
            message,
            channel,
            priority
          )
        `)
        .eq('requires_approval', true)
        .is('approved_at', null)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch pending responses: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching pending responses:', error);
      throw error;
    }
  }

  /**
   * Call Shopify Storefront MCP for product/catalog queries
   */
  async callStorefrontMCP(query: string, customerId?: string): Promise<any> {
    try {
      if (!this.config.storefrontMCPEnabled) {
        throw new Error('Storefront MCP is not enabled');
      }

      // This would integrate with actual MCP tools
      // For now, simulate the call structure
      const mcpCall = {
        tool: 'storefront-mcp',
        action: 'search_products',
        query,
        customerId,
        timestamp: new Date().toISOString(),
      };

      // Log MCP call
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        action: 'storefront_mcp_call',
        rationale: `Called Storefront MCP for query: ${query}`,
        evidenceUrl: 'app/services/ai-customer/chatbot.service.ts',
        payload: mcpCall,
      });

      // Simulate response (would be actual MCP response)
      return {
        products: [],
        collections: [],
        requestId: `storefront-${Date.now()}`,
      };
    } catch (error) {
      console.error('Error calling Storefront MCP:', error);
      throw error;
    }
  }

  /**
   * Call Customer Accounts MCP for authenticated customer data
   */
  async callCustomerAccountsMCP(action: string, customerId: string, token: string): Promise<any> {
    try {
      if (!this.config.customerAccountsMCPEnabled) {
        throw new Error('Customer Accounts MCP is not enabled');
      }

      // This would integrate with actual MCP tools
      const mcpCall = {
        tool: 'customer-accounts-mcp',
        action,
        customerId,
        token: token.substring(0, 10) + '...', // Truncate for logging
        timestamp: new Date().toISOString(),
      };

      // Log MCP call with PII audit
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        action: 'customer_accounts_mcp_call',
        rationale: `Called Customer Accounts MCP for action: ${action}`,
        evidenceUrl: 'app/services/ai-customer/chatbot.service.ts',
        payload: mcpCall,
      });

      // Simulate response (would be actual MCP response)
      return {
        customer: null,
        orders: [],
        requestId: `customer-accounts-${Date.now()}`,
      };
    } catch (error) {
      console.error('Error calling Customer Accounts MCP:', error);
      throw error;
    }
  }

  /**
   * Get chatbot performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    totalInquiries: number;
    autoResolved: number;
    humanApproved: number;
    averageResponseTime: number;
    customerSatisfaction: number;
  }> {
    try {
      const supabase = this.requireSupabase();
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('customer_inquiries')
        .select('*');

      if (inquiriesError) {
        throw new Error(`Failed to fetch inquiries: ${inquiriesError.message}`);
      }

      const { data: responses, error: responsesError } = await supabase
        .from('ai_responses')
        .select('*');

      if (responsesError) {
        throw new Error(`Failed to fetch responses: ${responsesError.message}`);
      }

      const totalInquiries = inquiries?.length || 0;
      const autoResolved = responses?.filter(r => !r.requires_approval && r.sent_at).length || 0;
      const humanApproved = responses?.filter(r => r.approved_at).length || 0;

      // Calculate average response time
      const responseTimes = responses?.map(r => {
        const created = new Date(r.created_at);
        const sent = r.sent_at ? new Date(r.sent_at) : new Date();
        return (sent.getTime() - created.getTime()) / 1000; // seconds
      }) || [];

      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      // Calculate customer satisfaction (placeholder - would need actual survey data)
      const customerSatisfaction = 0.85; // 85% satisfaction rate

      return {
        totalInquiries,
        autoResolved,
        humanApproved,
        averageResponseTime,
        customerSatisfaction,
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }
}

/**
 * Default chatbot instance
 */
export const aiChatbot = new AICustomerChatbot();
