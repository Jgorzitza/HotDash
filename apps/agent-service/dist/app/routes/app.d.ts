import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
export declare const loader: ({ request }: LoaderFunctionArgs) => Promise<{
    apiKey: string;
    mockMode: boolean;
    pendingCount: number;
}>;
export default function App(): React.JSX.Element;
export declare function ErrorBoundary(): any;
export declare const headers: HeadersFunction;
//# sourceMappingURL=app.d.ts.map