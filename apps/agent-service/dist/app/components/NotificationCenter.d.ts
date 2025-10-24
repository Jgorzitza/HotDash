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
export declare function NotificationCenter(): React.JSX.Element;
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
//# sourceMappingURL=NotificationCenter.d.ts.map