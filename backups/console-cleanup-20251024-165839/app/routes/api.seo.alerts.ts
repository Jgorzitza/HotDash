/**
 * SEO Alerts API
 * 
 * GET /api/seo/alerts - Get active alerts
 * POST /api/seo/alerts/resolve - Resolve an alert
 * POST /api/seo/alerts/diagnose - Diagnose an alert and create resolution workflow
 * POST /api/seo/alerts/approve - Approve a resolution workflow
 * POST /api/seo/alerts/apply - Apply an approved resolution
 * POST /api/seo/alerts/rollback - Rollback an applied resolution
 */

import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { getActiveAlerts, resolveAlert } from "~/services/seo/ranking-tracker";
import {
  diagnoseIssue,
  createResolutionWorkflow,
  approveResolution,
  applyResolution,
  rollbackResolution,
  type ResolutionWorkflow
} from "~/services/seo/automated-resolution";
import { logDecision } from "~/services/decisions.server";

/**
 * GET - Get active alerts
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const severity = url.searchParams.get('severity');

    let alerts = await getActiveAlerts();

    // Filter by severity if specified
    if (severity && ['critical', 'warning', 'info'].includes(severity)) {
      alerts = alerts.filter(a => a.severity === severity);
    }

    return Response.json({
      success: true,
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API] Get alerts error:', error);

    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to fetch alerts',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Handle alert actions
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { action: actionType, ...params } = body;

    switch (actionType) {
      case 'resolve':
        return await handleResolve(params);
      
      case 'diagnose':
        return await handleDiagnose(params);
      
      case 'approve':
        return await handleApprove(params);
      
      case 'apply':
        return await handleApply(params);
      
      case 'rollback':
        return await handleRollback(params);
      
      default:
        return Response.json(
          {
            success: false,
            error: `Unknown action: ${actionType}`,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[API] Alert action error:', error);

    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to process action',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Handle resolve action
 */
async function handleResolve(params: any) {
  const { alertId, resolution } = params;

  if (!alertId || !resolution) {
    return Response.json(
      {
        success: false,
        error: 'Missing required fields: alertId and resolution',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  await resolveAlert(alertId, resolution);

  await logDecision({
    scope: 'seo',
    actor: 'user',
    action: 'alert_resolved',
    rationale: `Manually resolved alert: ${alertId}`,
    payload: { alertId, resolution }
  });

  return Response.json({
    success: true,
    message: 'Alert resolved successfully',
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle diagnose action
 */
async function handleDiagnose(params: any) {
  const { alert } = params;

  if (!alert) {
    return Response.json(
      {
        success: false,
        error: 'Missing required field: alert',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  // Diagnose the issue
  const suggestion = await diagnoseIssue(alert);

  // Create resolution workflow
  const workflow = await createResolutionWorkflow(suggestion);

  return Response.json({
    success: true,
    data: {
      suggestion,
      workflow
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle approve action
 */
async function handleApprove(params: any) {
  const { workflowId, approvedBy } = params;

  if (!workflowId || !approvedBy) {
    return Response.json(
      {
        success: false,
        error: 'Missing required fields: workflowId and approvedBy',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  const workflow = await approveResolution(workflowId, approvedBy);

  return Response.json({
    success: true,
    data: workflow,
    message: 'Resolution workflow approved',
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle apply action
 */
async function handleApply(params: any) {
  const { workflowId } = params;

  if (!workflowId) {
    return Response.json(
      {
        success: false,
        error: 'Missing required field: workflowId',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  const result = await applyResolution(workflowId);

  return Response.json({
    success: true,
    data: result,
    message: 'Resolution applied successfully',
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle rollback action
 */
async function handleRollback(params: any) {
  const { workflowId, reason } = params;

  if (!workflowId || !reason) {
    return Response.json(
      {
        success: false,
        error: 'Missing required fields: workflowId and reason',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  const result = await rollbackResolution(workflowId, reason);

  return Response.json({
    success: true,
    data: result,
    message: 'Resolution rolled back successfully',
    timestamp: new Date().toISOString()
  });
}

