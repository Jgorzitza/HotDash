import { Component, ReactNode } from "react";
interface Props {
    children: ReactNode;
}
interface State {
    hasError: boolean;
    error?: Error;
}
export declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: any): void;
    render(): string | number | boolean | Iterable<ReactNode> | React.JSX.Element;
}
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map