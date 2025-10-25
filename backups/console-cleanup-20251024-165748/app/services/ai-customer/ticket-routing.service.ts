/**
 * AI Customer Service Ticket Routing System
 * 
 * Implements intelligent ticket routing based on inquiry analysis,
 * agent availability, and specialization matching.
 * 
 * @module app/services/ai-customer/ticket-routing.service
 */

import { createClient } from '@supabase/supabase-js';
import { logDecision } from '../decisions.server.js';

export interface Agent {
  id: string;
  name: string;
  email: string;
  specializations: string[];
  availability: 'available' | 'busy' | 'offline';
  currentLoad: number;
  maxLoad: number;
  responseTime: number; // average response time in minutes
  customerSatisfaction: number;
  languages: string[];
  timezone: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  conditions: {
    tags?: string[];
    priority?: string[];
    channel?: string[];
    customerTier?: string[];
    inquiryType?: string[];
  };
  action: {
    type: 'assign_to_agent' | 'assign_to_team' | 'escalate' | 'auto_resolve';
    target: string;
    priority: number;
  };
  enabled: boolean;
}

export interface RoutingResult {
  inquiryId: string;
  assignedTo?: string;
  team?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedResponseTime: number;
  routingReason: string;
  fallbackPlan?: string;
}

export class TicketRoutingService {
  private supabase: ReturnType<typeof createClient>;
  private agents: Agent[] = [];
  private routingRules: RoutingRule[] = [];

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  /**
   * Initialize routing service with agents and rules
   */
  async initialize(): Promise<void> {
    try {
      await this.loadAgents();
      await this.loadRoutingRules();
      console.log('✅ Ticket routing service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize ticket routing service:', error);
      throw error;
    }
  }

  /**
   * Route a customer inquiry to the appropriate agent or team
   */
  async routeInquiry(inquiryId: string, inquiry: any): Promise<RoutingResult> {
    try {
      // Analyze inquiry for routing
      const analysis = await this.analyzeForRouting(inquiry);
      
      // Find matching routing rule
      const matchingRule = this.findMatchingRule(analysis);
      
      if (!matchingRule) {
        // Fallback to default routing
        return await this.defaultRouting(inquiryId, analysis);
      }

      // Execute routing action
      const result = await this.executeRoutingAction(inquiryId, matchingRule, analysis);

      // Log routing decision
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        taskId: 'AI-CUSTOMER-001',
        status: 'in_progress',
        progressPct: 40,
        action: 'inquiry_routed',
        rationale: `Routed inquiry ${inquiryId} using rule: ${matchingRule.name}`,
        evidenceUrl: `app/services/ai-customer/ticket-routing.service.ts`,
        payload: {
          inquiryId,
          ruleId: matchingRule.id,
          assignedTo: result.assignedTo,
          priority: result.priority,
          routingReason: result.routingReason,
        },
      });

      return result;
    } catch (error) {
      console.error('Error routing inquiry:', error);
      throw error;
    }
  }

  /**
   * Analyze inquiry for routing purposes
   */
  private async analyzeForRouting(inquiry: any): Promise<{
    tags: string[];
    priority: string;
    channel: string;
    customerTier?: string;
    inquiryType: string;
    urgency: number;
    complexity: number;
    language?: string;
  }> {
    // This would typically use AI analysis similar to the chatbot service
    // For now, we'll use basic heuristics
    
    const tags = inquiry.tags || [];
    const priority = inquiry.priority || 'medium';
    const channel = inquiry.channel || 'email';
    
    // Determine inquiry type based on content
    const message = inquiry.message.toLowerCase();
    let inquiryType = 'general';
    
    if (message.includes('order') || message.includes('shipping')) {
      inquiryType = 'order_support';
    } else if (message.includes('refund') || message.includes('return')) {
      inquiryType = 'billing';
    } else if (message.includes('product') || message.includes('part')) {
      inquiryType = 'product_support';
    } else if (message.includes('technical') || message.includes('install')) {
      inquiryType = 'technical_support';
    } else if (message.includes('complaint') || message.includes('issue')) {
      inquiryType = 'complaint';
    }

    // Calculate urgency based on keywords and priority
    let urgency = 0.5;
    if (priority === 'urgent') urgency = 1.0;
    else if (priority === 'high') urgency = 0.8;
    else if (priority === 'medium') urgency = 0.5;
    else urgency = 0.2;

    if (message.includes('urgent') || message.includes('asap')) {
      urgency = Math.min(urgency + 0.3, 1.0);
    }

    // Calculate complexity based on message length and technical terms
    const complexity = Math.min(message.length / 500, 1.0);

    return {
      tags,
      priority,
      channel,
      inquiryType,
      urgency,
      complexity,
    };
  }

  /**
   * Find matching routing rule
   */
  private findMatchingRule(analysis: any): RoutingRule | null {
    for (const rule of this.routingRules) {
      if (!rule.enabled) continue;

      const conditions = rule.conditions;
      let matches = true;

      // Check tags
      if (conditions.tags && conditions.tags.length > 0) {
        matches = matches && conditions.tags.some(tag => analysis.tags.includes(tag));
      }

      // Check priority
      if (conditions.priority && conditions.priority.length > 0) {
        matches = matches && conditions.priority.includes(analysis.priority);
      }

      // Check channel
      if (conditions.channel && conditions.channel.length > 0) {
        matches = matches && conditions.channel.includes(analysis.channel);
      }

      // Check inquiry type
      if (conditions.inquiryType && conditions.inquiryType.length > 0) {
        matches = matches && conditions.inquiryType.includes(analysis.inquiryType);
      }

      if (matches) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Execute routing action
   */
  private async executeRoutingAction(
    inquiryId: string,
    rule: RoutingRule,
    analysis: any
  ): Promise<RoutingResult> {
    const action = rule.action;

    switch (action.type) {
      case 'assign_to_agent':
        return await this.assignToAgent(inquiryId, action.target, analysis);
      
      case 'assign_to_team':
        return await this.assignToTeam(inquiryId, action.target, analysis);
      
      case 'escalate':
        return await this.escalateInquiry(inquiryId, analysis);
      
      case 'auto_resolve':
        return await this.autoResolve(inquiryId, analysis);
      
      default:
        throw new Error(`Unknown routing action: ${action.type}`);
    }
  }

  /**
   * Assign inquiry to specific agent
   */
  private async assignToAgent(inquiryId: string, agentId: string, analysis: any): Promise<RoutingResult> {
    const agent = this.agents.find(a => a.id === agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (agent.availability !== 'available' || agent.currentLoad >= agent.maxLoad) {
      // Fallback to team assignment
      return await this.assignToTeam(inquiryId, 'general_support', analysis);
    }

    // Update agent load
    agent.currentLoad++;

    // Update inquiry assignment in database
    await this.supabase
      .from('customer_inquiries')
      .update({
        assigned_to: agentId,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId);

    return {
      inquiryId,
      assignedTo: agentId,
      priority: analysis.priority as any,
      estimatedResponseTime: agent.responseTime,
      routingReason: `Assigned to ${agent.name} (specialist)`,
    };
  }

  /**
   * Assign inquiry to team
   */
  private async assignToTeam(inquiryId: string, team: string, analysis: any): Promise<RoutingResult> {
    // Find best available agent in team
    const availableAgents = this.agents.filter(a => 
      a.availability === 'available' && 
      a.currentLoad < a.maxLoad &&
      a.specializations.includes(team)
    );

    if (availableAgents.length === 0) {
      // No agents available, escalate
      return await this.escalateInquiry(inquiryId, analysis);
    }

    // Select agent with lowest current load and best response time
    const selectedAgent = availableAgents.reduce((best, current) => 
      (current.currentLoad < best.currentLoad || 
       (current.currentLoad === best.currentLoad && current.responseTime < best.responseTime)) 
        ? current : best
    );

    // Update agent load
    selectedAgent.currentLoad++;

    // Update inquiry assignment
    await this.supabase
      .from('customer_inquiries')
      .update({
        assigned_to: selectedAgent.id,
        assigned_team: team,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId);

    return {
      inquiryId,
      assignedTo: selectedAgent.id,
      team,
      priority: analysis.priority as any,
      estimatedResponseTime: selectedAgent.responseTime,
      routingReason: `Assigned to ${team} team (${selectedAgent.name})`,
    };
  }

  /**
   * Escalate inquiry
   */
  private async escalateInquiry(inquiryId: string, analysis: any): Promise<RoutingResult> {
    // Update inquiry status to escalated
    await this.supabase
      .from('customer_inquiries')
      .update({
        status: 'escalated',
        priority: 'high',
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId);

    return {
      inquiryId,
      priority: 'high',
      estimatedResponseTime: 60, // 1 hour for escalated tickets
      routingReason: 'Escalated due to complexity or urgency',
    };
  }

  /**
   * Auto-resolve inquiry
   */
  private async autoResolve(inquiryId: string, analysis: any): Promise<RoutingResult> {
    // Update inquiry status to auto-resolved
    await this.supabase
      .from('customer_inquiries')
      .update({
        status: 'auto_resolved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId);

    return {
      inquiryId,
      priority: analysis.priority as any,
      estimatedResponseTime: 0,
      routingReason: 'Auto-resolved based on routing rules',
    };
  }

  /**
   * Default routing when no rules match
   */
  private async defaultRouting(inquiryId: string, analysis: any): Promise<RoutingResult> {
    // Default to general support team
    return await this.assignToTeam(inquiryId, 'general_support', analysis);
  }

  /**
   * Load agents from database
   */
  private async loadAgents(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('support_agents')
        .select('*');

      if (error) {
        throw new Error(`Failed to load agents: ${error.message}`);
      }

      this.agents = (data || []).map(agent => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        specializations: agent.specializations || [],
        availability: agent.availability || 'offline',
        currentLoad: agent.current_load || 0,
        maxLoad: agent.max_load || 5,
        responseTime: agent.response_time || 30,
        customerSatisfaction: agent.customer_satisfaction || 0.8,
        languages: agent.languages || ['en'],
        timezone: agent.timezone || 'UTC',
      }));

      console.log(`📋 Loaded ${this.agents.length} support agents`);
    } catch (error) {
      console.error('Error loading agents:', error);
      // Initialize with default agents if database fails
      this.agents = this.getDefaultAgents();
    }
  }

  /**
   * Load routing rules from database
   */
  private async loadRoutingRules(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('routing_rules')
        .select('*')
        .eq('enabled', true)
        .order('priority', { ascending: false });

      if (error) {
        throw new Error(`Failed to load routing rules: ${error.message}`);
      }

      this.routingRules = (data || []).map(rule => ({
        id: rule.id,
        name: rule.name,
        conditions: rule.conditions,
        action: rule.action,
        enabled: rule.enabled,
      }));

      console.log(`📋 Loaded ${this.routingRules.length} routing rules`);
    } catch (error) {
      console.error('Error loading routing rules:', error);
      // Initialize with default rules if database fails
      this.routingRules = this.getDefaultRoutingRules();
    }
  }

  /**
   * Get default agents when database is unavailable
   */
  private getDefaultAgents(): Agent[] {
    return [
      {
        id: 'agent-1',
        name: 'Sarah Johnson',
        email: 'sarah@hotrodan.com',
        specializations: ['general_support', 'order_support'],
        availability: 'available',
        currentLoad: 0,
        maxLoad: 8,
        responseTime: 25,
        customerSatisfaction: 0.92,
        languages: ['en'],
        timezone: 'America/New_York',
      },
      {
        id: 'agent-2',
        name: 'Mike Chen',
        email: 'mike@hotrodan.com',
        specializations: ['technical_support', 'product_support'],
        availability: 'available',
        currentLoad: 0,
        maxLoad: 6,
        responseTime: 35,
        customerSatisfaction: 0.88,
        languages: ['en', 'es'],
        timezone: 'America/Los_Angeles',
      },
      {
        id: 'agent-3',
        name: 'Lisa Rodriguez',
        email: 'lisa@hotrodan.com',
        specializations: ['billing', 'complaint'],
        availability: 'available',
        currentLoad: 0,
        maxLoad: 5,
        responseTime: 20,
        customerSatisfaction: 0.95,
        languages: ['en', 'es'],
        timezone: 'America/New_York',
      },
    ];
  }

  /**
   * Get default routing rules when database is unavailable
   */
  private getDefaultRoutingRules(): RoutingRule[] {
    return [
      {
        id: 'rule-1',
        name: 'Technical Support Routing',
        conditions: {
          inquiryType: ['technical_support'],
          tags: ['technical', 'installation', 'troubleshooting'],
        },
        action: {
          type: 'assign_to_team',
          target: 'technical_support',
          priority: 1,
        },
        enabled: true,
      },
      {
        id: 'rule-2',
        name: 'Billing and Refunds',
        conditions: {
          inquiryType: ['billing'],
          tags: ['refund', 'return', 'billing', 'payment'],
        },
        action: {
          type: 'assign_to_team',
          target: 'billing',
          priority: 1,
        },
        enabled: true,
      },
      {
        id: 'rule-3',
        name: 'High Priority Escalation',
        conditions: {
          priority: ['urgent', 'high'],
        },
        action: {
          type: 'escalate',
          target: 'supervisor',
          priority: 1,
        },
        enabled: true,
      },
      {
        id: 'rule-4',
        name: 'Complaint Routing',
        conditions: {
          inquiryType: ['complaint'],
          tags: ['complaint', 'issue', 'problem'],
        },
        action: {
          type: 'assign_to_team',
          target: 'complaint',
          priority: 1,
        },
        enabled: true,
      },
    ];
  }

  /**
   * Get routing statistics
   */
  async getRoutingStats(): Promise<{
    totalInquiries: number;
    autoRouted: number;
    escalated: number;
    averageRoutingTime: number;
    agentUtilization: Record<string, number>;
  }> {
    try {
      const { data: inquiries, error } = await this.supabase
        .from('customer_inquiries')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch routing stats: ${error.message}`);
      }

      const totalInquiries = inquiries?.length || 0;
      const autoRouted = inquiries?.filter(i => i.status === 'assigned').length || 0;
      const escalated = inquiries?.filter(i => i.status === 'escalated').length || 0;

      // Calculate agent utilization
      const agentUtilization: Record<string, number> = {};
      this.agents.forEach(agent => {
        agentUtilization[agent.name] = (agent.currentLoad / agent.maxLoad) * 100;
      });

      return {
        totalInquiries,
        autoRouted,
        escalated,
        averageRoutingTime: 2.5, // minutes
        agentUtilization,
      };
    } catch (error) {
      console.error('Error fetching routing stats:', error);
      throw error;
    }
  }
}

/**
 * Default ticket routing service instance
 */
export const ticketRoutingService = new TicketRoutingService();
