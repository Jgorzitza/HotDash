import { redirect } from "react-router";
export async function action({ params }) {
    const { id, idx } = params;
    if (!id || !idx) {
        throw new Response("Missing approval ID or index", { status: 400 });
    }
    try {
        const response = await fetch(`http://localhost:8002/approvals/${id}/${idx}/approve`, {
            method: "POST",
        });
        if (!response.ok) {
            throw new Error(`Approval failed with status ${response.status}`);
        }
    }
    catch (error) {
        console.error("Error approving action:", error);
        // Still redirect even on error - user will see updated state
    }
    return redirect("/approvals");
}
//# sourceMappingURL=route.js.map