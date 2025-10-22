# Feature Flags

Simple feature flag system for controlling feature availability.

## Usage

### Environment Variables

Set feature flags via environment variables:

```bash
# Enable idea pool feature
FEATURE_IDEA_POOL=true

# Enable social posting
FEATURE_SOCIAL_POSTING=true

# Enable advanced analytics
FEATURE_ADVANCED_ANALYTICS=true

# Enable AI suggestions
FEATURE_AI_SUGGESTIONS=true

# Enable all beta features
FEATURE_BETA=true
```

### In Code

```typescript
import { isFeatureEnabled, getFeatureFlags } from "~/lib/feature-flags";

// Check if a feature is enabled
if (isFeatureEnabled("ideaPool")) {
  // Show idea pool drawer
}

// Get all feature flags
const flags = getFeatureFlags();
```

### Query Parameter Overrides

For testing/preview, enable features via query parameters:

```
?feature_idea_pool=1
?feature_social_posting=1
?feature_advanced_analytics=1
?feature_ai_suggestions=1
?feature_beta=1
```

## Available Features

| Feature             | Description                  | Status           |
| ------------------- | ---------------------------- | ---------------- |
| `ideaPool`          | Product idea pool drawer     | Stub implemented |
| `socialPosting`     | Social media posting         | Planned          |
| `advancedAnalytics` | Enhanced analytics dashboard | Planned          |
| `aiSuggestions`     | AI-powered suggestions       | Partial          |
| `betaFeatures`      | All beta features            | Flag for testing |

## Implementation

Feature flags are checked at:

1. **Server-side**: In route loaders
2. **Client-side**: In component rendering
3. **Build-time**: Via environment variables

## Adding New Features

1. Add feature to `FeatureFlags` interface in `app/lib/feature-flags.ts`
2. Add environment variable check in `getFeatureFlags()`
3. Add query parameter override in `getFeatureFlagsWithOverrides()`
4. Document in this file
5. Use feature flag checks in components/routes

## Security

- Feature flags should not be used for security
- Always implement proper authorization checks
- Feature flags are for UI visibility, not access control
