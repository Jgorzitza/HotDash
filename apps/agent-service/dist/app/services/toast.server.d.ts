/**
 * Toast Service (Server-side)
 *
 * ENG-069: Toast Infrastructure Implementation
 *
 * Server-side utilities for managing toast notifications via session flash messages.
 * Integrates with React Router's session management for cross-request toast persistence.
 *
 * Features:
 * - Session-based flash messages
 * - Type-safe toast creation
 * - Automatic serialization/deserialization
 * - Support for all toast types (success, error, info, warning)
 */
export type ToastType = "success" | "error" | "info" | "warning";
export interface ToastMessage {
    message: string;
    type: ToastType;
    duration?: number;
    retryUrl?: string;
}
/**
 * Get toast message from session
 *
 * @param request - Request object
 * @returns Toast message if exists, null otherwise
 */
export declare function getToast(request: Request): Promise<ToastMessage | null>;
/**
 * Create success toast and redirect
 *
 * @param message - Success message
 * @param redirectTo - URL to redirect to
 * @param duration - Optional duration in ms
 */
export declare function redirectWithSuccess(request: Request, message: string, redirectTo: string, duration?: number): Promise<Response>;
/**
 * Create error toast and redirect
 *
 * @param message - Error message
 * @param redirectTo - URL to redirect to
 * @param retryUrl - Optional URL for retry action
 * @param duration - Optional duration in ms
 */
export declare function redirectWithError(request: Request, message: string, redirectTo: string, retryUrl?: string, duration?: number): Promise<Response>;
/**
 * Create info toast and redirect
 *
 * @param message - Info message
 * @param redirectTo - URL to redirect to
 * @param duration - Optional duration in ms
 */
export declare function redirectWithInfo(request: Request, message: string, redirectTo: string, duration?: number): Promise<Response>;
/**
 * Create warning toast and redirect
 *
 * @param message - Warning message
 * @param redirectTo - URL to redirect to
 * @param duration - Optional duration in ms
 */
export declare function redirectWithWarning(request: Request, message: string, redirectTo: string, duration?: number): Promise<Response>;
/**
 * Create toast without redirect (for use in loaders/actions that return data)
 *
 * @param request - Request object
 * @param toast - Toast message
 * @returns Headers with Set-Cookie for toast
 */
export declare function createToastHeaders(request: Request, toast: ToastMessage): Promise<Headers>;
/**
 * Helper to create success toast headers
 */
export declare function successToastHeaders(request: Request, message: string, duration?: number): Promise<Headers>;
/**
 * Helper to create error toast headers
 */
export declare function errorToastHeaders(request: Request, message: string, retryUrl?: string, duration?: number): Promise<Headers>;
/**
 * Helper to create info toast headers
 */
export declare function infoToastHeaders(request: Request, message: string, duration?: number): Promise<Headers>;
/**
 * Helper to create warning toast headers
 */
export declare function warningToastHeaders(request: Request, message: string, duration?: number): Promise<Headers>;
/**
 * Example Usage:
 *
 * // In an action function (with redirect)
 * export async function action({ request }: ActionFunctionArgs) {
 *   try {
 *     await approveAction();
 *     return redirectWithSuccess(request, "Action approved and executed", "/approvals");
 *   } catch (error) {
 *     return redirectWithError(
 *       request,
 *       "Approval failed",
 *       "/approvals",
 *       "/approvals/retry"
 *     );
 *   }
 * }
 *
 * // In a loader function (without redirect)
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   const data = await fetchData();
 *
 *   if (data.hasNewApprovals) {
 *     const headers = await infoToastHeaders(
 *       request,
 *       `${data.newApprovalCount} new approvals in queue`
 *     );
 *     return json(data, { headers });
 *   }
 *
 *   return json(data);
 * }
 *
 * // In a component (reading toast from loader)
 * export function MyRoute() {
 *   const toast = useLoaderData<typeof loader>();
 *
 *   return (
 *     <>
 *       {toast && <Toast {...toast} />}
 *       {/* rest of component *\/}
 *     </>
 *   );
 * }
 */
//# sourceMappingURL=toast.server.d.ts.map