import { Component, ReactNode } from "react";
import { Banner, Page } from "@shopify/polaris";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Page title="Error">
          <Banner tone="critical">
            <p>Something went wrong. Please refresh the page.</p>
            {this.state.error && <p style={{ marginTop: "8px", fontSize: "12px", opacity: 0.8 }}>{this.state.error.message}</p>}
          </Banner>
        </Page>
      );
    }
    return this.props.children;
  }
}
