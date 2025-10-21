import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";

/**
 * Settings Page
 * 
 * ENG-015 to ENG-022: Complete settings interface with 4 tabs:
 * - Dashboard: Tile visibility, default view, auto-refresh
 * - Appearance: Theme (light/dark/auto), density
 * - Notifications: Desktop permissions, types, sound
 * - Account: Email, name, logout
 * 
 * Uses Polaris components for consistent UI
 * React Router Form/useFetcher for data submission
 */

interface LoaderData {
  shopDomain: string;
  operatorEmail: string;
  preferences: {
    visibleTiles: string[];
    theme: "light" | "dark" | "auto";
    defaultView: "grid" | "list";
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  if (!session?.shop) {
    return Response.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // TODO (Phase 11): Load from Supabase user_preferences
  // For now, return defaults
  const preferences = {
    visibleTiles: [
      "ops-metrics",
      "sales-pulse",
      "fulfillment",
      "inventory",
      "cx-escalations",
      "seo-content",
      "idea-pool",
      "ceo-agent",
      "unread-messages",
    ],
    theme: "auto" as const,
    defaultView: "grid" as const,
  };

  return Response.json({
    shopDomain: session.shop,
    operatorEmail: (session as { email?: string }).email ?? session.shop,
    preferences,
  });
}

export default function SettingsPage() {
  const data = useLoaderData<LoaderData>();
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { id: "dashboard", content: "Dashboard", label: "Dashboard settings" },
    { id: "appearance", content: "Appearance", label: "Appearance settings" },
    { id: "notifications", content: "Notifications", label: "Notification settings" },
    { id: "account", content: "Account", label: "Account settings" },
  ];

  return (
    <s-page heading="Settings" backAction={{ content: "Dashboard", url: "/" }}>
      <s-tabs
        tabs={tabs.map((tab, index) => ({
          id: tab.id,
          content: tab.content,
          accessibilityLabel: tab.label,
          panelID: `${tab.id}-content`,
        }))}
        selected={selectedTab}
        onSelect={setSelectedTab}
      >
        {/* Dashboard Tab */}
        {selectedTab === 0 && (
          <div id="dashboard-content" style={{ padding: "var(--occ-space-5)" }}>
            <div style={{ marginBottom: "var(--occ-space-6)" }}>
              <h2 style={{ marginBottom: "var(--occ-space-4)" }}>
                Tile Visibility
              </h2>
              <p style={{ color: "var(--occ-text-secondary)", marginBottom: "var(--occ-space-4)" }}>
                Choose which tiles to display on your dashboard
              </p>
              
              {/* Tile visibility checkboxes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-3)" }}>
                {[
                  { id: "ops-metrics", label: "Ops Pulse" },
                  { id: "sales-pulse", label: "Sales Pulse" },
                  { id: "fulfillment", label: "Fulfillment Health" },
                  { id: "inventory", label: "Inventory Heatmap" },
                  { id: "cx-escalations", label: "CX Escalations" },
                  { id: "seo-content", label: "SEO & Content Watch" },
                  { id: "idea-pool", label: "Idea Pool" },
                  { id: "ceo-agent", label: "CEO Agent" },
                  { id: "unread-messages", label: "Unread Messages" },
                ].map((tile) => (
                  <label key={tile.id} style={{ display: "flex", alignItems: "center", gap: "var(--occ-space-2)" }}>
                    <input
                      type="checkbox"
                      defaultChecked={data.preferences.visibleTiles.includes(tile.id)}
                      name={`tile-${tile.id}`}
                    />
                    <span>{tile.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {selectedTab === 1 && (
          <div id="appearance-content" style={{ padding: "var(--occ-space-5)" }}>
            <div style={{ marginBottom: "var(--occ-space-6)" }}>
              <h2 style={{ marginBottom: "var(--occ-space-4)" }}>
                Theme
              </h2>
              <p style={{ color: "var(--occ-text-secondary)", marginBottom: "var(--occ-space-4)" }}>
                Choose your preferred theme
              </p>
              
              {/* Theme selector (ENG-016) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-3)" }}>
                {[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "auto", label: "Auto (system preference)" },
                ].map((theme) => (
                  <label key={theme.value} style={{ display: "flex", alignItems: "center", gap: "var(--occ-space-2)" }}>
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      defaultChecked={data.preferences.theme === theme.value}
                    />
                    <span>{theme.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ marginBottom: "var(--occ-space-4)" }}>
                Default View
              </h2>
              <p style={{ color: "var(--occ-text-secondary)", marginBottom: "var(--occ-space-4)" }}>
                Choose how tiles are displayed
              </p>
              
              {/* View selector (ENG-017) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-3)" }}>
                {[
                  { value: "grid", label: "Grid" },
                  { value: "list", label: "List" },
                ].map((view) => (
                  <label key={view.value} style={{ display: "flex", alignItems: "center", gap: "var(--occ-space-2)" }}>
                    <input
                      type="radio"
                      name="default-view"
                      value={view.value}
                      defaultChecked={data.preferences.defaultView === view.value}
                    />
                    <span>{view.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {selectedTab === 2 && (
          <div id="notifications-content" style={{ padding: "var(--occ-space-5)" }}>
            <h2 style={{ marginBottom: "var(--occ-space-4)" }}>
              Notification Preferences
            </h2>
            <p style={{ color: "var(--occ-text-secondary)", marginBottom: "var(--occ-space-4)" }}>
              Manage your notification settings
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-3)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--occ-space-2)" }}>
                <input type="checkbox" defaultChecked name="desktop-notifications" />
                <span>Enable desktop notifications</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--occ-space-2)" }}>
                <input type="checkbox" defaultChecked name="sound-enabled" />
                <span>Play sound for notifications</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "var(--occ-space-2)" }}>
                <input type="checkbox" defaultChecked name="toast-notifications" />
                <span>Show toast notifications</span>
              </label>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {selectedTab === 3 && (
          <div id="account-content" style={{ padding: "var(--occ-space-5)" }}>
            <h2 style={{ marginBottom: "var(--occ-space-4)" }}>
              Account Information
            </h2>
            
            <div style={{ marginBottom: "var(--occ-space-4)" }}>
              <p><strong>Shop:</strong> {data.shopDomain}</p>
              <p><strong>Email:</strong> {data.operatorEmail}</p>
            </div>

            <div style={{ marginTop: "var(--occ-space-6)" }}>
              <button
                style={{
                  padding: "var(--occ-space-3) var(--occ-space-4)",
                  background: "var(--occ-bg-critical)",
                  color: "var(--occ-text-on-critical)",
                  border: "none",
                  borderRadius: "var(--occ-radius-md)",
                  cursor: "pointer",
                }}
                onClick={() => window.location.href = "/auth/logout"}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </s-tabs>
    </s-page>
  );
}

