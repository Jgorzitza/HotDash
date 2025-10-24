import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

export const loader = () => {
  // Don't authenticate here - just render the page
  return null;
};

export default function SessionToken() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const reloadUrl = searchParams.get("shopify-reload");

    if (reloadUrl) {
      // Extract the path from the full URL
      try {
        const url = new URL(reloadUrl);
        const path = url.pathname + url.search;
        // Use React Router navigate to go to the app route
        navigate(path, { replace: true });
      } catch (e) {
        // If URL parsing fails, try direct navigation
        window.location.href = reloadUrl;
      }
    }
  }, [searchParams, navigate]);

  return (
    <AppProvider embedded={true}>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Authenticating...</p>
      </div>
    </AppProvider>
  );
}

