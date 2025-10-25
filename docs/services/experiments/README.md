# Experiments Services

**Directory**: `app/services/experiments/`  
**Purpose**: A/B testing and feature flag management  
**Owner**: Product Agent

---

## Overview

This directory contains services for product experimentation:

1. **A/B Testing** (`ab-testing.ts`) - Run controlled experiments to test product hypotheses
2. **Feature Flags** (`feature-flags.ts`) - Manage feature rollouts and targeting

Both services enable data-driven product decisions and safe feature releases.

---

## A/B Testing Service

**File**: `ab-testing.ts`  
**Class**: `ABTestingService`  
**Spec**: `docs/specs/ab-test-campaigns.md` (PRODUCT-007)

### Features

- **Deterministic Variant Assignment**: Users always see the same variant (MD5 hashing)
- **Event Tracking**: Exposures, conversions, engagement
- **Statistical Significance**: Chi-square test for conversion rate differences
- **Sample Size Calculation**: Power analysis for test planning

### Usage

```typescript
import { abTestingService } from "~/services/experiments/ab-testing";

// Define experiment
const experiment: Experiment = {
  id: "tile_order_test_001",
  name: "Tile Order Default Test",
  variants: [
    { id: "control", name: "Current Order", weight: 0.5 },
    { id: "variant_a", name: "Value-Optimized", weight: 0.5 },
  ],
  metrics: ["tile_engagement_rate"],
  status: "running",
  startDate: new Date(),
  targetSampleSize: 200,
  minDetectableEffect: 0.1,
};

// Assign variant to user
const assignment = abTestingService.assignVariant(userId, experiment);

// Track exposure (user saw variant)
await abTestingService.trackExposure(experimentId, variantId, userId);

// Track conversion (user clicked tile)
await abTestingService.trackConversion(
  experimentId,
  variantId,
  userId,
  "tile_clicked",
  1, // value
);

// Calculate significance
const results = await abTestingService.calculateSignificance(experimentId);
console.log(`Winner: ${results.winner}, p-value: ${results.pValue}`);
```

### API Routes

**POST `/api/experiments/assign`**

```json
Request:
{ "userId": "shop.myshopify.com", "experimentId": "tile_order_test_001" }

Response:
{
  "success": true,
  "assignment": {
    "experimentId": "tile_order_test_001",
    "variantId": "control",
    "userId": "shop.myshopify.com",
    "assignedAt": "2025-10-21T22:00:00Z",
    "config": { ... }
  }
}
```

**POST `/api/experiments/track`**

```json
Request:
{
  "experimentId": "tile_order_test_001",
  "variantId": "control",
  "userId": "shop.myshopify.com",
  "eventType": "conversion",
  "eventName": "tile_clicked",
  "value": 1
}

Response:
{
  "success": true,
  "tracked": {
    "experimentId": "tile_order_test_001",
    "variantId": "control",
    "userId": "shop.myshopify.com",
    "eventType": "conversion",
    "eventName": "tile_clicked",
    "timestamp": "2025-10-21T22:05:00Z"
  }
}
```

**GET `/api/experiments/results/:experimentId`**

```json
Response:
{
  "success": true,
  "results": {
    "experimentId": "tile_order_test_001",
    "sampleSizes": { "control": 100, "variant_a": 98 },
    "conversionRates": { "control": "45.20%", "variant_a": "52.10%" },
    "statistical": {
      "chiSquare": "4.123",
      "pValue": "0.042",
      "isSignificant": true,
      "confidenceLevel": "95%"
    },
    "winner": "variant_a",
    "recommendation": "Variant 'variant_a' is statistically significant winner (p < 0.05)"
  }
}
```

### Methods

| Method                                                             | Purpose                            | Returns                       |
| ------------------------------------------------------------------ | ---------------------------------- | ----------------------------- |
| `assignVariant(userId, experiment)`                                | Assign user to variant             | `ExperimentAssignment`        |
| `trackExposure(experimentId, variantId, userId)`                   | Track exposure event               | `Promise<void>`               |
| `trackConversion(experimentId, variantId, userId, name, value)`    | Track conversion                   | `Promise<void>`               |
| `trackEngagement(experimentId, variantId, userId, name, metadata)` | Track engagement                   | `Promise<void>`               |
| `calculateSignificance(experimentId)`                              | Calculate statistical significance | `Promise<SignificanceResult>` |
| `calculateSampleSize(baseline, effect, alpha, power)`              | Calculate required sample size     | `number`                      |

---

## Feature Flag Service

**File**: `feature-flags.ts`  
**Class**: `FeatureFlagService`  
**Spec**: Direction v6.0 (PRODUCT-010)

### Features

- **Master On/Off Switch**: Enable/disable features globally
- **Gradual Rollout**: Percentage-based rollout (0-100%)
- **User Targeting**: Whitelist specific users
- **Segment Targeting**: Enable for user segments
- **Environment Filtering**: Dev/staging/production/all

### Usage

```typescript
import { featureFlagService } from "~/services/experiments/feature-flags";

// Check if feature enabled for user
const isEnabled = await featureFlagService.isFeatureEnabled(
  "FEATURE_DARK_MODE",
  "shop.myshopify.com",
);

// Check with detailed reason
const check = await featureFlagService.checkFeature(
  "FEATURE_DARK_MODE",
  "shop.myshopify.com",
  "power", // optional user segment
);
console.log(`Enabled: ${check.isEnabled}, Reason: ${check.reason}`);

// Update rollout percentage (gradual release)
await featureFlagService.updateRolloutPercentage(
  "FEATURE_REALTIME_UPDATES",
  50, // 50% of users
);

// Target specific user
await featureFlagService.addTargetUser(
  "FEATURE_CEO_AGENT",
  "shop.myshopify.com",
);
```

### API Routes

**GET `/api/features/check/:flagId?userId=X`**
**POST `/api/features/check`**

```json
Request:
{ "flagId": "FEATURE_DARK_MODE", "userId": "shop.myshopify.com" }

Response:
{
  "success": true,
  "flagId": "FEATURE_DARK_MODE",
  "userId": "shop.myshopify.com",
  "isEnabled": true,
  "reason": "User in rollout (100%)",
  "checkedAt": "2025-10-21T22:00:00Z"
}
```

**GET `/api/features/list`**

```json
Response:
{
  "success": true,
  "flags": [
    {
      "id": "FEATURE_DARK_MODE",
      "name": "Dark Mode",
      "description": "Enable dark theme for users",
      "enabled": true,
      "rolloutPercentage": 100,
      "environment": "all"
    },
    ...
  ],
  "count": 4
}
```

**POST `/api/features/update`**

```json
Request:
{
  "flagId": "FEATURE_REALTIME_UPDATES",
  "action": "updateRollout",
  "value": 75
}

Response:
{
  "success": true,
  "flag": { ... },
  "message": "Feature flag FEATURE_REALTIME_UPDATES updated successfully"
}
```

### Methods

| Method                                       | Purpose           | Returns                        |
| -------------------------------------------- | ----------------- | ------------------------------ |
| `isFeatureEnabled(flagId, userId, segment?)` | Check if enabled  | `Promise<boolean>`             |
| `checkFeature(flagId, userId, segment?)`     | Check with reason | `Promise<FeatureFlagCheck>`    |
| `getFeatureFlag(flagId)`                     | Get flag config   | `Promise<FeatureFlag \| null>` |
| `getAllFeatureFlags()`                       | Get all flags     | `Promise<FeatureFlag[]>`       |
| `enableFeature(flagId)`                      | Enable flag       | `Promise<void>`                |
| `disableFeature(flagId)`                     | Disable flag      | `Promise<void>`                |
| `updateRolloutPercentage(flagId, %)`         | Update rollout    | `Promise<void>`                |
| `addTargetUser(flagId, userId)`              | Whitelist user    | `Promise<void>`                |

---

## Available Feature Flags

| Flag ID                    | Name              | Description          | Default Rollout |
| -------------------------- | ----------------- | -------------------- | --------------- |
| `FEATURE_DARK_MODE`        | Dark Mode         | Dark theme for users | 100%            |
| `FEATURE_REALTIME_UPDATES` | Real-time Updates | SSE for dashboard    | 50%             |
| `FEATURE_CEO_AGENT`        | CEO Agent         | AI assistant         | 0% (dev only)   |
| `FEATURE_ADVANCED_CHARTS`  | Advanced Charts   | Polaris Viz charts   | 100%            |

---

## Best Practices

### A/B Testing

1. **Define hypothesis before testing**: Clear H0 and H1
2. **Calculate sample size**: Use `calculateSampleSize()` to ensure sufficient power
3. **Set success criteria upfront**: Define conversion metrics and targets
4. **Run for minimum duration**: At least 7 days or until 200+ users
5. **Avoid peeking**: Check results only after reaching target sample size
6. **Document results**: Log winner and learnings in decision_log

### Feature Flags

1. **Start with 0-10% rollout**: Test with small audience first
2. **Monitor metrics**: Track feature usage, errors, performance
3. **Gradual increase**: 0% → 10% → 25% → 50% → 100%
4. **Use target users for testing**: CEO and power users test first
5. **Remove flags after 100% rollout**: Clean up code after full release
6. **Emergency kill switch**: Keep master switch for quick disable

---

## Data Storage

### A/B Testing Events

**Table**: `DashboardFact` (category: "ab_test")

```typescript
{
  shop: "shop.myshopify.com",
  category: "ab_test",
  metric: "variant_exposed", // or "tile_clicked"
  value: 1,
  metadata: JSON.stringify({
    test_id: "tile_order_test_001",
    variant: "control",
    event_type: "exposure",
    event_name: "variant_exposed"
  }),
  timestamp: new Date()
}
```

### Feature Flag Checks

**Storage**: Currently in-memory (hardcoded flags)  
**Future**: `FeatureFlag` table in Supabase

---

## Testing

**Unit Tests**: (To be created by QA)

```bash
npm run test -- app/services/experiments
```

**Integration Tests**:

```bash
# Test API routes
curl -X POST http://localhost:3000/api/experiments/assign \
  -H "Content-Type: application/json" \
  -d '{"userId":"test.myshopify.com","experimentId":"test_001"}'
```

---

## Related Documentation

- **Specs**: `docs/specs/ab-test-campaigns.md` (5 campaign designs)
- **Roadmap**: `docs/specs/advanced-features-roadmap.md` (Phase 11-12 integration)
- **API Contracts**: See route files for request/response schemas

---

**Last Updated**: 2025-10-21  
**Questions**: Contact Product agent in `feedback/product/2025-10-21.md`
