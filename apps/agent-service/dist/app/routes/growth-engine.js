/**
 * Growth Engine Route
 *
 * ENG-026: Main route for Growth Engine Core Infrastructure
 * Provides access to advanced Growth Engine dashboard with optimized performance
 */
import { useLoaderData } from "react-router";
import { GrowthEngineCoreDashboard } from "~/components/growth-engine/GrowthEngineCoreDashboard";
import { isMockMode } from "~/utils/mock-mode";
export async function loader({ request }) {
    // Bypass auth in test/mock mode for smoke testing
    const isTestMode = isMockMode(request);
    let shopDomain = "test-shop.myshopify.com";
    let operatorEmail = "test@example.com";
    let userPermissions = [
        "growth:read",
        "growth:write",
        "analytics:read",
        "actions:read",
        "phases:read",
        "optimization:write",
        "ai:write"
    ];
    let currentPhase = 9;
    if (!isTestMode) {
        // In production, this would:
        // 1. Authenticate the user
        // 2. Fetch user permissions from database
        // 3. Get current phase from user preferences or system state
        // 4. Validate access to Growth Engine features
        // For now, using mock data
        shopDomain = "production-shop.myshopify.com";
        operatorEmail = "operator@production-shop.com";
        currentPhase = 10; // Example: user is in phase 10
    }
    const data = {
        userPermissions,
        currentPhase,
        shopDomain,
        operatorEmail,
    };
    return Response.json(data);
}
export default function GrowthEngineRoute() {
    const data = useLoaderData();
    return (<GrowthEngineCoreDashboard userPermissions={data.userPermissions} currentPhase={data.currentPhase} shopDomain={data.shopDomain} operatorEmail={data.operatorEmail}/>);
}
//# sourceMappingURL=growth-engine.js.map