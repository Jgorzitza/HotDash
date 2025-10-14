/**
 * Action Service - Growth Spec B1-B7
 * 
 * Manages agent actions requiring CEO approval.
 * Implements human-in-the-loop workflow for all external actions.
 */

import prisma from "../db.server";

// Action Types per Growth Spec
export type ActionType = 
  | 'seo_ctr_fix'           // SEO CTR optimization
  | 'metaobject_gen'        // Metaobject generation
  | 'merch_playbook'        // Merchandising playbook
  | 'guided_selling'        // Guided selling flow
  | 'cwv_repair';           // Core Web Vitals repair

export interface Action {
  id: string;
  type: ActionType;
  payload: any;
  score?: number;
  merchantId: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'rolled_back';
  version: number;
  createdAt: Date;
  updatedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  executedAt?: Date;
  wasEdited?: boolean;
  editDiff?: any;
  result?: any;
  error?: string;
}

interface CreateActionInput {
  type: ActionType;
  payload: any;
  score?: number;
  merchantId: string;
  status?: Action['status'];
}

interface UpdateActionInput {
  status?: Action['status'];
  approvedBy?: string;
  editedPayload?: any;
  result?: any;
  error?: string;
}

interface ListActionsOptions {
  merchantId?: string;
  status?: Action['status'];
  type?: ActionType;
  limit?: number;
}

const VALID_ACTION_TYPES: ActionType[] = [
  'seo_ctr_fix',
  'metaobject_gen',
  'merch_playbook',
  'guided_selling',
  'cwv_repair',
];

/**
 * Create a new action
 */
export async function createAction(input: CreateActionInput): Promise<Action> {
  // Validate action type
  if (!VALID_ACTION_TYPES.includes(input.type)) {
    throw new Error(`Invalid action type: ${input.type}`);
  }

  const prismaAction = await prisma.action.create({
    data: {
      toolName: input.type,
      agent: 'growth-agent', // TODO: Pass from input
      parameters: input.payload,
      shopDomain: input.merchantId,
      status: input.status || 'pending',
      priority: input.score && input.score > 0.8 ? 'high' : 'normal',
      tags: [input.type],
    },
  });

  return {
    id: prismaAction.id.toString(),
    type: input.type,
    payload: input.payload,
    score: input.score,
    merchantId: input.merchantId,
    status: prismaAction.status as Action['status'],
    version: 1, // Initial version
    createdAt: prismaAction.requestedAt,
  };
}

/**
 * Get action by ID
 */
export async function getAction(id: string): Promise<Action> {
  const prismaAction = await prisma.action.findUnique({
    where: { id: parseInt(id) },
  });

  if (!prismaAction) {
    throw new Error(`Action not found: ${id}`);
  }

  return {
    id: prismaAction.id.toString(),
    type: prismaAction.toolName as ActionType,
    payload: prismaAction.parameters,
    merchantId: prismaAction.shopDomain || '',
    status: prismaAction.status as Action['status'],
    version: 1, // TODO: Track versions properly
    createdAt: prismaAction.requestedAt,
    approvedBy: prismaAction.reviewedBy || undefined,
    approvedAt: prismaAction.reviewedAt || undefined,
    executedAt: prismaAction.executedAt || undefined,
    result: prismaAction.result || undefined,
    error: prismaAction.error || undefined,
  };
}

/**
 * List actions with filtering
 */
export async function listActions(options: ListActionsOptions = {}): Promise<Action[]> {
  const where: any = {};
  
  if (options.merchantId) {
    where.shopDomain = options.merchantId;
  }
  
  if (options.status) {
    where.status = options.status;
  }
  
  if (options.type) {
    where.toolName = options.type;
  }

  const prismaActions = await prisma.action.findMany({
    where,
    orderBy: { requestedAt: 'desc' },
    take: options.limit || 50,
  });

  return prismaActions.map(pa => ({
    id: pa.id.toString(),
    type: pa.toolName as ActionType,
    payload: pa.parameters,
    merchantId: pa.shopDomain || '',
    status: pa.status as Action['status'],
    version: 1,
    createdAt: pa.requestedAt,
    approvedBy: pa.reviewedBy || undefined,
    approvedAt: pa.reviewedAt || undefined,
    executedAt: pa.executedAt || undefined,
    result: pa.result || undefined,
    error: pa.error || undefined,
  }));
}

/**
 * Update action
 */
export async function updateAction(id: string, input: UpdateActionInput): Promise<Action> {
  const updateData: any = {};
  
  if (input.status) {
    updateData.status = input.status;
  }
  
  if (input.approvedBy) {
    updateData.reviewedBy = input.approvedBy;
    updateData.reviewedAt = new Date();
  }
  
  if (input.result !== undefined) {
    updateData.result = input.result;
  }
  
  if (input.error !== undefined) {
    updateData.error = input.error;
  }
  
  // Handle edited payload
  let wasEdited = false;
  let editDiff = undefined;
  
  if (input.editedPayload) {
    const current = await getAction(id);
    wasEdited = true;
    editDiff = {
      original: current.payload,
      edited: input.editedPayload,
    };
    updateData.parameters = input.editedPayload;
  }

  const prismaAction = await prisma.action.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  return {
    id: prismaAction.id.toString(),
    type: prismaAction.toolName as ActionType,
    payload: prismaAction.parameters,
    merchantId: prismaAction.shopDomain || '',
    status: prismaAction.status as Action['status'],
    version: 2, // Increment on update
    createdAt: prismaAction.requestedAt,
    approvedBy: prismaAction.reviewedBy || undefined,
    approvedAt: prismaAction.reviewedAt || undefined,
    executedAt: prismaAction.executedAt || undefined,
    wasEdited,
    editDiff,
    result: prismaAction.result || undefined,
    error: prismaAction.error || undefined,
  };
}

/**
 * Execute an approved action
 */
export async function executeAction(id: string): Promise<{ success: boolean; executedAt: Date }> {
  const action = await getAction(id);
  
  if (action.status !== 'approved') {
    throw new Error(`Action ${id} is not approved (status: ${action.status})`);
  }

  // Update to executed status
  await prisma.action.update({
    where: { id: parseInt(id) },
    data: {
      status: 'executed',
      executedAt: new Date(),
    },
  });

  // TODO: Actually execute the action based on type
  // For now, just mark as executed

  return {
    success: true,
    executedAt: new Date(),
  };
}

/**
 * Rollback an executed action
 */
export async function rollbackAction(id: string): Promise<void> {
  const action = await getAction(id);
  
  if (action.status !== 'executed') {
    throw new Error(`Action ${id} is not executed (status: ${action.status})`);
  }

  await prisma.action.update({
    where: { id: parseInt(id) },
    data: {
      status: 'rolled_back',
    },
  });

  // TODO: Implement actual rollback logic based on action type
}

