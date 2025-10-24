import { Component } from "react";
import { Banner, Page } from "@shopify/polaris";
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (<Page title="Error">
          <Banner tone="critical">
            <p>Something went wrong. Please refresh the page.</p>
            {this.state.error && (<p style={{ marginTop: "8px", fontSize: "12px", opacity: 0.8 }}>
                {this.state.error.message}
              </p>)}
          </Banner>
        </Page>);
        }
        return this.props.children;
    }
}
//# sourceMappingURL=ErrorBoundary.js.map