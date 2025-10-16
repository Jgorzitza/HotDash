

// Minimal /validate endpoint used by Approvals gating.
// Validates presence of evidence & rollback in request (query flags until full wiring).
// NEVER executes side effects.
export async function loader({ request }: any) {
  const url = new URL(request.url);
  const evidence = url.searchParams.get("evidence");
  const rollback = url.searchParams.get("rollback");

  const hasEvidence = evidence === "true" || evidence === "1";
  const hasRollback = rollback === "true" || rollback === "1";

  if (!hasEvidence || !hasRollback) {
    return Response.json(
      {
        ok: false,
        errors: [
          !hasEvidence ? "Evidence is required" : null,
          !hasRollback ? "Rollback plan is required" : null,
        ].filter(Boolean),
      },
      { status: 400 }
    );
  }

  return Response.json({ ok: true });
}

