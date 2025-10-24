/**
 * Notification Center Component
 * 
 * ENG-071: Browser Notifications Implementation
 * 
 * Manages browser notifications and user preferences.
 * Provides UI for requesting permission and configuring notification settings.
 * 
 * Features:
 * - Request notification permission
 * - Display permission status
 * - Configure notification preferences
 * - Test notifications
 */

import { useState, useEffect } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Banner,
  Checkbox,
  Divider,
} from "@shopify/polaris";

import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationPreferences,
  saveNotificationPreferences,
  showNotification,
  type NotificationPreferences,
} from "../services/notifications.client";

export function NotificationCenter() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    sound: true,
    approvals: true,
    inventory: true,
    sales: true,
  });
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPermission(getNotificationPermission());
      setPreferences(getNotificationPreferences());
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
    } finally {
      setIsRequesting(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    saveNotificationPreferences(updated);
  };

  const handleTestNotification = () => {
    showNotification({
      title: "Test Notification",
      body: "This is a test notification from HotDash",
      tag: "test",
    });
  };

  if (!isNotificationSupported()) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Browser Notifications
          </Text>
          <Banner tone="warning">
            <p>Browser notifications are not supported in your browser.</p>
          </Banner>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Browser Notifications
        </Text>

        {permission === "denied" && (
          <Banner tone="critical">
            <p>
              Notification permission has been denied. Please enable notifications in your browser
              settings to receive alerts.
            </p>
          </Banner>
        )}

        {permission === "default" && (
          <Banner tone="info">
            <p>
              Enable browser notifications to receive real-time alerts for approvals, inventory,
              and sales updates.
            </p>
          </Banner>
        )}

        {permission === "granted" && (
          <Banner tone="success">
            <p>Browser notifications are enabled.</p>
          </Banner>
        )}

        <Divider />

        {permission === "default" && (
          <InlineStack align="start">
            <Button
              onClick={handleRequestPermission}
              loading={isRequesting}
              variant="primary"
            >
              Enable Notifications
            </Button>
          </InlineStack>
        )}

        {permission === "granted" && (
          <>
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">
                Notification Preferences
              </Text>

              <Checkbox
                label="Enable all notifications"
                checked={preferences.enabled}
                onChange={(value) => handlePreferenceChange("enabled", value)}
              />

              <Checkbox
                label="Play sound with notifications"
                checked={preferences.sound}
                onChange={(value) => handlePreferenceChange("sound", value)}
                disabled={!preferences.enabled}
              />

              <Divider />

              <Text as="h3" variant="headingSm">
                Notification Types
              </Text>

              <Checkbox
                label="Approval queue updates"
                checked={preferences.approvals}
                onChange={(value) => handlePreferenceChange("approvals", value)}
                disabled={!preferences.enabled}
                helpText="Get notified when new approvals are pending"
              />

              <Checkbox
                label="Inventory alerts"
                checked={preferences.inventory}
                onChange={(value) => handlePreferenceChange("inventory", value)}
                disabled={!preferences.enabled}
                helpText="Get notified about low stock and reorder points"
              />

              <Checkbox
                label="Sales milestones"
                checked={preferences.sales}
                onChange={(value) => handlePreferenceChange("sales", value)}
                disabled={!preferences.enabled}
                helpText="Get notified about sales goals and achievements"
              />
            </BlockStack>

            <Divider />

            <InlineStack align="start">
              <Button onClick={handleTestNotification} disabled={!preferences.enabled}>
                Test Notification
              </Button>
            </InlineStack>
          </>
        )}

        <Divider />

        <Text as="p" variant="bodySm" tone="subdued">
          Notifications work even when the HotDash tab is hidden or minimized. You can configure
          which types of notifications you want to receive above.
        </Text>
      </BlockStack>
    </Card>
  );
}

/**
 * Example Usage:
 * 
 * // In settings page
 * import { NotificationCenter } from "~/components/NotificationCenter";
 * 
 * export default function SettingsPage() {
 *   return (
 *     <Page title="Settings">
 *       <Layout>
 *         <Layout.Section>
 *           <NotificationCenter />
 *         </Layout.Section>
 *       </Layout>
 *     </Page>
 *   );
 * }
 * 
 * // In app root to request permission on load
 * import { useEffect } from "react";
 * import { requestNotificationPermission } from "~/services/notifications.client";
 * 
 * export default function App() {
 *   useEffect(() => {
 *     requestNotificationPermission();
 *   }, []);
 *   
 *   return <Outlet />;
 * }
 */

