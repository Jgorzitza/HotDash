/**
 * Content Approval Route
 *
 * Review and approve content before publishing
 */
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("react-router").UNSAFE_DataWithResponseInit<{
    approvals: any[];
    total: number;
    stats: {
        pending_review: number;
        approved_today: number;
        rejected_today: number;
        average_review_time_minutes: number;
    };
    error: any;
}> | {
    approvals: import("~/services/content/approval-workflow.service").ContentApproval[];
    total: number;
    stats: import("~/services/content/approval-workflow.service").ApprovalStats;
}>;
export declare function action({ request }: ActionFunctionArgs): Promise<import("react-router").UNSAFE_DataWithResponseInit<{
    success: boolean;
    error: any;
}> | {
    success: boolean;
    message: string;
}>;
export default function ContentApprovalPage(): React.JSX.Element;
//# sourceMappingURL=content.approval.d.ts.map