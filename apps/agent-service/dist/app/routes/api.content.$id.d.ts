/**
 * Individual Content Entry API Routes
 *
 * Provides REST API endpoints for individual content entry operations
 */
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
export declare function loader({ params }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function action({ request, params }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response | {
    success: boolean;
    data: import("~/services/content").ContentEntry;
    message: string;
} | {
    status: number;
}>;
//# sourceMappingURL=api.content.$id.d.ts.map