/**
 * API Route: /api/approvals/[id]/validate
 *
 * Validates an approval request before it can be approved.
 * Checks evidence, rollback, and other requirements.
 */

import { json, type LoaderFunctionArgs } from "react-router";
import { getApprovalById } from "~/services/approvals";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    return json(
      { valid: false, errors: ["Missing approval ID"] },
      { status: 400 },
    );
  }

  try {
    const approval = await getApprovalById(id);

    if (!approval) {
      return json(
        { valid: false, errors: ["Approval not found"] },
        { status: 404 },
      );
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check evidence requirements
    if (!approval.evidence || Object.keys(approval.evidence).length === 0) {
      errors.push("Evidence is required");
    } else {
      if (!approval.evidence.what_changes) {
        errors.push("Evidence must include 'what_changes'");
      }
      if (!approval.evidence.why_now) {
        errors.push("Evidence must include 'why_now'");
      }
    }

    // Check rollback requirements
    if (
      !approval.rollback ||
      !approval.rollback.steps ||
      approval.rollback.steps.length === 0
    ) {
      errors.push("Rollback steps are required");
    }

    // Check actions
    if (!approval.actions || approval.actions.length === 0) {
      errors.push("At least one action is required");
    }

    // Check for dry run status if available
    const hasDryRunErrors = approval.actions?.some(
      (action) => action.dry_run_status && action.dry_run_status !== "success",
    );

    if (hasDryRunErrors) {
      warnings.push("Some actions failed dry run validation");
    }

    // Check impact assessment
    if (!approval.impact || !approval.impact.expected_outcome) {
      warnings.push("Impact assessment is recommended");
    }

    // Check risk assessment
    if (!approval.risk || !approval.risk.what_could_go_wrong) {
      warnings.push("Risk assessment is recommended");
    }

    const valid = errors.length === 0;

    return json({
      valid,
      errors,
      warnings,
      approval: valid ? approval : undefined,
    });
  } catch (error) {
    console.error("Error validating approval:", error);
    return json(
      { valid: false, errors: ["Internal server error"] },
      { status: 500 },
    );
  }
}
