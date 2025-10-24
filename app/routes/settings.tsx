import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { useState } from "react";
import { Page, Card, Tabs, BlockStack, Checkbox, Toast, Frame } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { isMockMode } from "../utils/env.server";
import { useBrowserNotifications } from "../hooks/useBrowserNotifications";
import { getUserPreferences, getDefaultPreferences, saveUserPreferences } from "../services/userPreferences";

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
  // Bypass auth in test/mock mode for smoke testing (BLOCKER-003 resolution)
  const isTestMode = isMockMode(request);

  let shopDomain = "test-shop.myshopify.com";
  let operatorEmail = "test@example.com";

  if (!isTestMode) {
    const { session } = await authenticate.admin(request);

    if (!session?.shop) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    shopDomain = session.shop;
    operatorEmail = session.shop; // In production, fetch from user table
  }

  // Load user preferences from database
  let preferences;
  try {
    const userPrefs = await getUserPreferences(shopDomain, operatorEmail);
    if (userPrefs) {
      preferences = {
        visibleTiles: userPrefs.visible_tiles,
        theme: userPrefs.theme,
        defaultView: userPrefs.default_view,
      };
    } else {
      // Use defaults if no preferences found
      const defaults = getDefaultPreferences();
      preferences = {
        visibleTiles: defaults.visible_tiles,
        theme: defaults.theme,
        defaultView: defaults.default_view,
      };
    }
  } catch (error) {
    console.error("Error loading user preferences:", error);
    // Fallback to defaults
    const defaults = getDefaultPreferences();
    preferences = {
      visibleTiles: defaults.visible_tiles,
      theme: defaults.theme,
      defaultView: defaults.default_view,
    };
  }

  const data: LoaderData = {
    shopDomain,
    operatorEmail,
    preferences,
  };

  return Response.json(data);
}

export async function action({ request }: ActionFunctionArgs) {
  const isTestMode = isMockMode(request);
  
  let shopDomain = "test-shop.myshopify.com";
  let operatorEmail = "test@example.com";

  if (!isTestMode) {
    const { session } = await authenticate.admin(request);
    if (!session?.shop) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    shopDomain = session.shop;
    operatorEmail = session.shop;
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    if (action === "save-preferences") {
      const visibleTiles = JSON.parse(formData.get("visible_tiles") as string || "[]");
      const theme = formData.get("theme") as "light" | "dark" | "auto";
      const defaultView = formData.get("default_view") as "grid" | "list";
      const autoRefresh = formData.get("auto_refresh") === "true";
      const refreshInterval = parseInt(formData.get("refresh_interval") as string || "60");
      const desktopNotifications = formData.get("desktop_notifications") === "true";
      const notificationSound = formData.get("notification_sound") === "true";
      const toastNotifications = formData.get("toast_notifications") === "true";

      const result = await saveUserPreferences(shopDomain, operatorEmail, {
        visible_tiles: visibleTiles,
        theme,
        default_view: defaultView,
        auto_refresh: autoRefresh,
        refresh_interval: refreshInterval,
        desktop_notifications: desktopNotifications,
        notification_sound: notificationSound,
        toast_notifications: toastNotifications,
      });

      if (result.success) {
        return Response.json({ success: true });
      } else {
        return Response.json({ error: result.error }, { status: 500 });
      }
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in settings action:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export default function SettingsPage() {
  const data = useLoaderData<LoaderData>();
  const [selectedTab, setSelectedTab] = useState(0);
  const browserNotifications = useBrowserNotifications();
  const fetcher = useFetcher();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ENG-073: Tile visibility state with real-time updates
  const [visibleTiles, setVisibleTiles] = useState<string[]>(data.preferences.visibleTiles);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // ENG-073: Handle tile visibility change with real-time update
  const handleTileVisibilityChange = async (tileId: string, checked: boolean) => {
    let newVisibleTiles: string[];

    if (checked) {
      // Add tile
      newVisibleTiles = [...visibleTiles, tileId];
    } else {
      // Remove tile (enforce minimum 2 tiles)
      if (visibleTiles.length <= 2) {
        setToastMessage("Minimum 2 tiles required");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      newVisibleTiles = visibleTiles.filter(id => id !== tileId);
    }

    // Update state immediately (real-time update)
    setVisibleTiles(newVisibleTiles);

    // Save to database
    const formData = new FormData();
    formData.append("action", "save-preferences");
    formData.append("visible_tiles", JSON.stringify(newVisibleTiles));
    formData.append("theme", data.preferences.theme);
    formData.append("default_view", data.preferences.defaultView);
    formData.append("auto_refresh", "true");
    formData.append("refresh_interval", "60");
    formData.append("desktop_notifications", "true");
    formData.append("notification_sound", "true");
    formData.append("toast_notifications", "true");

    fetcher.submit(formData, { method: "post" });

    // Show success toast
    setToastMessage("Tile visibility updated");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSavePreferences = async () => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("action", "save-preferences");
    formData.append("visible_tiles", JSON.stringify(visibleTiles));
    formData.append("theme", data.preferences.theme);
    formData.append("default_view", data.preferences.defaultView);
    formData.append("auto_refresh", "true");
    formData.append("refresh_interval", "60");
    formData.append("desktop_notifications", "true");
    formData.append("notification_sound", "true");
    formData.append("toast_notifications", "true");

    fetcher.submit(formData, { method: "post" });

    setTimeout(() => setIsSubmitting(false), 1000);
  };

  const tabs = [
    { id: "dashboard", content: "Dashboard", label: "Dashboard settings" },
    { id: "appearance", content: "Appearance", label: "Appearance settings" },
    {
      id: "notifications",
      content: "Notifications",
      label: "Notification settings",
    },
    { id: "account", content: "Account", label: "Account settings" },
  ];

  return (
    <s-page heading="Settings" backAction={{ content: "Dashboard", url: "/" }}>
      {/* Tab Navigation - Fixed: Use clickable buttons instead of s-tabs web component */}
      <div
        style={{
          borderBottom: "1px solid var(--occ-color-border-base, #e3e3e3)",
          marginBottom: "var(--occ-space-5)",
        }}
      >
        <div
          style={{ display: "flex", gap: "var(--occ-space-2)" }}
          role="tablist"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selectedTab === index}
              aria-label={tab.label}
              onClick={() => setSelectedTab(index)}
              style={{
                padding: "var(--occ-space-3) var(--occ-space-4)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontWeight: selectedTab === index ? "600" : "400",
                color:
                  selectedTab === index
                    ? "var(--occ-color-text-base, #202223)"
                    : "var(--occ-color-text-subdued, #6d7175)",
                borderBottom:
                  selectedTab === index
                    ? "2px solid var(--occ-color-border-interactive, #0066cc)"
                    : "2px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              {tab.content}
            </button>
          ))}
        </div>
      </div>
      {/* Dashboard Tab */}
      {selectedTab === 0 && (
        <div id="dashboard-content" style={{ padding: "var(--occ-space-5)" }}>
          <div style={{ marginBottom: "var(--occ-space-6)" }}>
            <h2 style={{ marginBottom: "var(--occ-space-4)" }}>
              Tile Visibility
            </h2>
            <p
              style={{
                color: "var(--occ-text-secondary)",
                marginBottom: "var(--occ-space-4)",
              }}
            >
              Choose which tiles to display on your dashboard
            </p>

            {/* Tile visibility toggles - ENG-073 */}
            <BlockStack gap="300">
              {[
                { id: "ops-metrics", label: "Ops Pulse" },
                { id: "sales-pulse", label: "Sales Pulse" },
                { id: "fulfillment", label: "Fulfillment Health" },
                { id: "inventory", label: "Inventory Heatmap" },
                { id: "cx-escalations", label: "CX Escalations" },
                { id: "seo-content", label: "SEO & Content Watch" },
                { id: "idea-pool", label: "Idea Pool" },
                { id: "approvals-queue", label: "Approvals Queue" },
                { id: "ceo-agent", label: "CEO Agent" },
                { id: "unread-messages", label: "Unread Messages" },
                { id: "social-performance", label: "Social Performance" },
                { id: "seo-impact", label: "SEO Impact" },
                { id: "ads-roas", label: "Ads ROAS" },
                { id: "growth-metrics", label: "Growth Metrics" },
                { id: "growth-engine-analytics", label: "Growth Engine Analytics" },
              ].map((tile) => {
                const isChecked = visibleTiles.includes(tile.id);
                const visibleCount = visibleTiles.length;
                const isDisabled = isChecked && visibleCount <= 2;

                return (
                  <Checkbox
                    key={tile.id}
                    label={tile.label}
                    checked={isChecked}
                    disabled={isDisabled}
                    helpText={isDisabled ? "Minimum 2 tiles required" : undefined}
                    onChange={(checked) => handleTileVisibilityChange(tile.id, checked)}
                  />
                );
              })}
            </BlockStack>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {selectedTab === 1 && (
        <div id="appearance-content" style={{ padding: "var(--occ-space-5)" }}>
          <div style={{ marginBottom: "var(--occ-space-6)" }}>
            <h2 style={{ marginBottom: "var(--occ-space-4)" }}>Theme</h2>
            <p
              style={{
                color: "var(--occ-text-secondary)",
                marginBottom: "var(--occ-space-4)",
              }}
            >
              Choose your preferred theme
            </p>

            {/* Theme selector (ENG-016) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--occ-space-3)",
              }}
            >
              {[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "auto", label: "Auto (system preference)" },
              ].map((theme) => (
                <label
                  key={theme.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--occ-space-2)",
                  }}
                >
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
            <h2 style={{ marginBottom: "var(--occ-space-4)" }}>Default View</h2>
            <p
              style={{
                color: "var(--occ-text-secondary)",
                marginBottom: "var(--occ-space-4)",
              }}
            >
              Choose how tiles are displayed
            </p>

            {/* View selector (ENG-017) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--occ-space-3)",
              }}
            >
              {[
                { value: "grid", label: "Grid" },
                { value: "list", label: "List" },
              ].map((view) => (
                <label
                  key={view.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--occ-space-2)",
                  }}
                >
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
        <div
          id="notifications-content"
          style={{ padding: "var(--occ-space-5)" }}
        >
          <h2 style={{ marginBottom: "var(--occ-space-4)" }}>
            Notification Preferences
          </h2>
          <p
            style={{
              color: "var(--occ-text-secondary)",
              marginBottom: "var(--occ-space-4)",
            }}
          >
            Manage your notification settings
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--occ-space-4)",
            }}
          >
            {/* Desktop Notifications Permission */}
            <div
              style={{
                padding: "var(--occ-space-4)",
                border: "1px solid var(--occ-border-default)",
                borderRadius: "var(--occ-radius-md)",
                backgroundColor: "var(--occ-bg-secondary)",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
                Desktop Notifications
              </h3>
              <p
                style={{
                  margin: 0,
                  marginBottom: "var(--occ-space-3)",
                  color: "var(--occ-text-secondary)",
                  fontSize: "var(--occ-font-size-sm)",
                }}
              >
                Current status: <strong>{browserNotifications.permission}</strong>
                {browserNotifications.permission === "granted" && " ✅"}
                {browserNotifications.permission === "denied" && " ❌"}
                {browserNotifications.permission === "default" && " ⚠️"}
              </p>
              
              {browserNotifications.permission === "default" && (
                <button
                  onClick={browserNotifications.requestPermission}
                  style={{
                    padding: "var(--occ-space-2) var(--occ-space-3)",
                    background: "var(--occ-bg-primary)",
                    color: "var(--occ-text-on-primary)",
                    border: "none",
                    borderRadius: "var(--occ-radius-md)",
                    cursor: "pointer",
                    fontSize: "var(--occ-font-size-sm)",
                    fontWeight: "var(--occ-font-weight-medium)",
                  }}
                >
                  Request Permission
                </button>
              )}
              
              {browserNotifications.permission === "denied" && (
                <p
                  style={{
                    margin: 0,
                    color: "var(--occ-color-warning)",
                    fontSize: "var(--occ-font-size-sm)",
                  }}
                >
                  Desktop notifications are blocked. Please enable them in your browser settings.
                </p>
              )}
            </div>

            {/* Notification Preferences */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--occ-space-3)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--occ-space-2)",
                }}
              >
                <input
                  type="checkbox"
                  defaultChecked
                  name="desktop-notifications"
                  disabled={browserNotifications.permission !== "granted"}
                />
                <span>Enable desktop notifications</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--occ-space-2)",
                }}
              >
                <input 
                  type="checkbox" 
                  defaultChecked 
                  name="sound-enabled"
                  onChange={(e) => {
                    localStorage.setItem('notification-sound-enabled', e.target.checked.toString());
                  }}
                />
                <span>Play sound for notifications</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--occ-space-2)",
                }}
              >
                <input
                  type="checkbox"
                  defaultChecked
                  name="toast-notifications"
                />
                <span>Show toast notifications</span>
              </label>
            </div>
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
            <p>
              <strong>Shop:</strong> {data.shopDomain}
            </p>
            <p>
              <strong>Email:</strong> {data.operatorEmail}
            </p>
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
              onClick={() => (window.location.href = "/auth/logout")}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{
        position: "fixed",
        bottom: "var(--occ-space-4)",
        right: "var(--occ-space-4)",
        zIndex: 1000,
      }}>
        <button
          onClick={handleSavePreferences}
          disabled={isSubmitting}
          style={{
            padding: "var(--occ-space-3) var(--occ-space-4)",
            background: isSubmitting ? "var(--occ-bg-disabled)" : "var(--occ-bg-primary)",
            color: isSubmitting ? "var(--occ-text-disabled)" : "var(--occ-text-on-primary)",
            border: "none",
            borderRadius: "var(--occ-radius-md)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: "var(--occ-font-size-sm)",
            fontWeight: "var(--occ-font-weight-medium)",
            boxShadow: "var(--occ-shadow-lg)",
          }}
        >
          {isSubmitting ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* ENG-073: Toast for real-time feedback */}
      {showToast && (
        <Toast
          content={toastMessage}
          onDismiss={() => setShowToast(false)}
        />
      )}
    </s-page>
  );
}
