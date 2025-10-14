/**
 * Action System Type Definitions
 * 
 * Defines the Action and ActionExecutor interfaces for growth automation
 * Used by all Shopify automation executors
 * 
 * @owner integrations
 */

/**
 * Action - Represents an automated task to be executed
 */
export interface Action {
  id: string;
  type: string; // e.g., 'create_page', 'set_canonical', 'create_metaobject'
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  payload: any; // Action-specific data
  outcome?: ActionOutcome;
  createdAt: Date;
  executedAt?: Date;
  completedAt?: Date;
  executedBy?: string; // Executor class name
  retryCount?: number;
  error?: string;
}

/**
 * ActionOutcome - Result of executing an action
 */
export interface ActionOutcome {
  success: boolean;
  message: string;
  data: any; // Outcome-specific data (IDs, URLs, etc.)
  executionTime?: number; // milliseconds
  rollbackRequired?: boolean;
}

/**
 * ActionExecutor - Interface for all automation executors
 */
export interface ActionExecutor {
  /**
   * Execute the action
   * @returns Outcome of execution
   */
  execute(action: Action): Promise<ActionOutcome>;

  /**
   * Rollback a previously executed action
   * Used when action needs to be undone
   */
  rollback(action: Action): Promise<void>;
}

/**
 * Action types supported by the automation system
 */
export type ActionType =
  // Page automation
  | 'create_page'
  | 'update_page'
  | 'delete_page'
  
  // SEO automation
  | 'generate_structured_data'
  | 'set_canonical'
  | 'add_internal_links'
  
  // Search optimization
  | 'manage_synonyms'
  | 'analyze_search_queries'
  
  // Content automation
  | 'create_metaobject'
  | 'update_metaobject'
  | 'link_metaobject';

/**
 * Action priority levels
 */
export type ActionPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Extended Action with priority and scheduling
 */
export interface ScheduledAction extends Action {
  priority: ActionPriority;
  scheduledFor?: Date;
  dependencies?: string[]; // IDs of actions that must complete first
  timeout?: number; // Maximum execution time in ms
}

