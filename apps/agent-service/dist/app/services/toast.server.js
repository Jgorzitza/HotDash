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
import { createCookieSessionStorage, redirect } from "react-router";
/**
 * Session storage for flash messages
 * Uses cookies to persist toast messages across redirects
 */
const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
        name: "__toast",
        httpOnly: true,
        maxAge: 60, // 1 minute - enough time for redirect and display
        path: "/",
        sameSite: "lax",
        secrets: [process.env.SESSION_SECRET || "default-secret-change-in-production"],
        secure: process.env.NODE_ENV === "production",
    },
});
/**
 * Get toast message from session
 *
 * @param request - Request object
 * @returns Toast message if exists, null otherwise
 */
export async function getToast(request) {
    const session = await getSession(request.headers.get("Cookie"));
    const toast = session.get("toast");
    return toast || null;
}
/**
 * Set toast message in session
 *
 * @param session - Session object
 * @param toast - Toast message to set
 */
function setToast(session, toast) {
    session.flash("toast", toast);
}
/**
 * Create success toast and redirect
 *
 * @param message - Success message
 * @param redirectTo - URL to redirect to
 * @param duration - Optional duration in ms
 */
export async function redirectWithSuccess(request, message, redirectTo, duration) {
    const session = await getSession(request.headers.get("Cookie"));
    setToast(session, { message, type: "success", duration });
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
}
/**
 * Create error toast and redirect
 *
 * @param message - Error message
 * @param redirectTo - URL to redirect to
 * @param retryUrl - Optional URL for retry action
 * @param duration - Optional duration in ms
 */
export async function redirectWithError(request, message, redirectTo, retryUrl, duration) {
    const session = await getSession(request.headers.get("Cookie"));
    setToast(session, { message, type: "error", retryUrl, duration });
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
}
/**
 * Create info toast and redirect
 *
 * @param message - Info message
 * @param redirectTo - URL to redirect to
 * @param duration - Optional duration in ms
 */
export async function redirectWithInfo(request, message, redirectTo, duration) {
    const session = await getSession(request.headers.get("Cookie"));
    setToast(session, { message, type: "info", duration });
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
}
/**
 * Create warning toast and redirect
 *
 * @param message - Warning message
 * @param redirectTo - URL to redirect to
 * @param duration - Optional duration in ms
 */
export async function redirectWithWarning(request, message, redirectTo, duration) {
    const session = await getSession(request.headers.get("Cookie"));
    setToast(session, { message, type: "warning", duration });
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
}
/**
 * Create toast without redirect (for use in loaders/actions that return data)
 *
 * @param request - Request object
 * @param toast - Toast message
 * @returns Headers with Set-Cookie for toast
 */
export async function createToastHeaders(request, toast) {
    const session = await getSession(request.headers.get("Cookie"));
    setToast(session, toast);
    return new Headers({
        "Set-Cookie": await commitSession(session),
    });
}
/**
 * Helper to create success toast headers
 */
export async function successToastHeaders(request, message, duration) {
    return createToastHeaders(request, { message, type: "success", duration });
}
/**
 * Helper to create error toast headers
 */
export async function errorToastHeaders(request, message, retryUrl, duration) {
    return createToastHeaders(request, { message, type: "error", retryUrl, duration });
}
/**
 * Helper to create info toast headers
 */
export async function infoToastHeaders(request, message, duration) {
    return createToastHeaders(request, { message, type: "info", duration });
}
/**
 * Helper to create warning toast headers
 */
export async function warningToastHeaders(request, message, duration) {
    return createToastHeaders(request, { message, type: "warning", duration });
}
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
//# sourceMappingURL=toast.server.js.map