import { Banner } from "@shopify/polaris";

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationBannerProps {
  errors: ValidationError[];
  onDismiss?: () => void;
}

export function ValidationBanner({ errors, onDismiss }: ValidationBannerProps) {
  if (errors.length === 0) return null;

  return (
    <Banner tone="critical" onDismiss={onDismiss}>
      <p>
        <strong>Validation errors:</strong>
      </p>
      <ul>
        {errors.map((error, idx) => (
          <li key={idx}>
            <strong>{error.field}:</strong> {error.message}
          </li>
        ))}
      </ul>
    </Banner>
  );
}
