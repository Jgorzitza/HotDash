import { recordDashboardFact } from "./facts.server";
import { toInputJson } from "./json";
export async function recordDashboardSessionOpen(options) {
    const openedAt = new Date().toISOString();
    try {
        await recordDashboardFact({
            shopDomain: options.shopDomain,
            factType: "dashboard.session.opened",
            scope: "ops",
            value: toInputJson({
                openedAt,
                operatorEmail: options.operatorEmail ?? null,
            }),
            metadata: toInputJson({
                requestId: options.requestId ?? null,
                generatedAt: openedAt,
            }),
        });
    }
    catch (error) {
        console.error("Failed to record dashboard.session.opened fact", error);
    }
}
//# sourceMappingURL=dashboardSession.server.js.map