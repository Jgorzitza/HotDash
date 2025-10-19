# Growth & Social Posting UI Patterns

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0  
**Purpose:** Publer integration UI patterns (North Star scope #4)

---

## 1. Social Post Composer

### 1.1 Drawer Structure

```tsx
<Modal heading="Schedule Social Post" size="large" onClose={handleClose}>
  <Stack gap="base">
    {/* Platform selector */}
    <ChoiceList
      label="Choose platforms"
      multiple
      values={selectedPlatforms}
      onChange={setSelectedPlatforms}
    >
      <Checkbox value="instagram" label="Instagram" />
      <Checkbox value="facebook" label="Facebook" />
      <Checkbox value="tiktok" label="TikTok" />
      <Checkbox value="twitter" label="X (Twitter)" />
    </ChoiceList>

    {/* Caption */}
    <TextField
      label="Post caption"
      multiline={6}
      placeholder="Lead with the key outcome. Attach links or UTM tags."
      value={caption}
      onChange={setCaption}
      maxLength={2200}
      showCharacterCount
    />

    {/* First comment */}
    <TextField
      label="First comment (optional)"
      multiline={3}
      placeholder="Use hashtags or supporting links."
      value={firstComment}
      onChange={setFirstComment}
    />

    {/* Media upload */}
    <DropZone
      label="Upload images or video"
      accept="image/*,video/*"
      multiple
      onChange={handleMediaUpload}
    >
      <Text variant="bodySm" tone="subdued">
        Images and video share one queue. Publer enforces per-platform limits.
      </Text>
    </DropZone>

    {/* Schedule controls */}
    <ChoiceList
      label="Publishing schedule"
      values={[scheduleType]}
      onChange={([v]) => setScheduleType(v)}
    >
      <Checkbox value="now" label="Publish now" />
      <Checkbox value="schedule" label="Schedule for later" />
      <Checkbox value="custom" label="Custom time" />
    </ChoiceList>

    {scheduleType === "custom" && (
      <DateField
        label="Publish date & time"
        value={customTime}
        onChange={setCustomTime}
      />
    )}

    <Text variant="bodySm" tone="subdued">
      All times in store timezone (America/Chicago).
    </Text>

    {/* Approval reminder */}
    <Banner tone="warning">
      All social posts must be approved before publishing.
    </Banner>

    {/* CTAs */}
    <ButtonGroup slot="primary-action">
      <Button onClick={handleClose}>Cancel</Button>
      <Button onClick={saveDraft}>Save as draft</Button>
      <Button
        variant="primary"
        onClick={submitForApproval}
        disabled={!caption || selectedPlatforms.length === 0}
      >
        Submit for approval
      </Button>
    </ButtonGroup>
  </Stack>
</Modal>
```

### 1.2 Microcopy

| Element                   | Copy                                                                     | Notes                                |
| ------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| Drawer title              | "Schedule social post"                                                   | Clear action                         |
| Caption placeholder       | "Lead with the key outcome. Attach links or UTM tags."                   | Guidance                             |
| First comment placeholder | "Use hashtags or supporting links."                                      | Optional field                       |
| Media help text           | "Images and video share one queue. Publer enforces per-platform limits." | Plain sentence                       |
| Schedule helper           | "All times in store timezone (America/Chicago)."                         | Clarity                              |
| Approval banner           | "All social posts must be approved before publishing."                   | HITL requirement                     |
| Primary CTA               | "Submit for approval"                                                    | Disabled until caption + platform    |
| Secondary CTA             | "Save as draft"                                                          | Persists without approval            |
| Cancel action             | "Cancel"                                                                 | Confirm if unsaved: "Discard draft?" |

---

## 2. Approval Queue Entry

### 2.1 Summary Format

```
Publer draft — {primary_channel}
```

Examples:

- "Publer draft — Instagram"
- "Publer draft — Instagram + Facebook"
- "Publer draft — TikTok"

### 2.2 Evidence Tab

```
What changes:
Scheduling new social post via Publer.

Platforms: Instagram, Facebook
Caption: {first 100 chars}...
Media: {count} images
Publish time: {UTC timestamp} (America/Chicago)

Why now:
Product launch announcement for {product}

Impact forecast:
Expected reach: {estimated_impressions} impressions
Target engagement rate: {target_rate}%
```

### 2.3 Impact Tab

```
Projected Impact:
• Reach: {estimated_impressions} impressions
• Engagement rate: {target_rate}%
• Click-through rate: {target_ctr}%
• Traffic to product page: +{traffic_estimate} visits

Risks & Rollback:
1. If engagement <50% of target, pause similar content
2. Cancel scheduled post in Publer
3. Notify Marketing in #growth
4. Review messaging strategy
```

### 2.4 Actions Tab

```json
{
  "endpoint": "/api/publer/schedule",
  "method": "POST",
  "payload": {
    "platforms": ["instagram", "facebook"],
    "caption": "...",
    "first_comment": "...",
    "media_urls": ["..."],
    "publish_at": "2025-10-20T14:00:00Z"
  }
}
```

---

## 3. Social Analytics Tile

### 3.1 Tile Structure

```tsx
<TileCard title="Growth Performance" tile={growthState}>
  <Stack gap="base">
    {/* Key metrics */}
    <Grid gridTemplateColumns="repeat(3, 1fr)" gap="small">
      <MetricBox
        label="Posts This Week"
        value={metrics.posts_approved}
        subtext={`${metrics.posts_pending} pending approval`}
      />
      <MetricBox
        label="Avg Engagement"
        value={`${metrics.avg_engagement_rate}%`}
        trend={metrics.engagement_trend}
      />
      <MetricBox
        label="Total Reach"
        value={formatNumber(metrics.total_reach)}
        subtext="Last 7 days"
      />
    </Grid>

    {/* Approval queue summary */}
    {metrics.posts_pending > 0 && (
      <Banner tone="info">
        {metrics.posts_pending} post{metrics.posts_pending > 1 ? "s" : ""}{" "}
        awaiting approval
      </Banner>
    )}

    {/* CTA */}
    <ButtonGroup>
      <Button url="/growth" variant="primary">
        View Growth Dashboard
      </Button>
      <Button url="/growth/composer">Create Post</Button>
    </ButtonGroup>
  </Stack>
</TileCard>
```

### 3.2 Microcopy

| Element        | Copy                                           | Notes               |
| -------------- | ---------------------------------------------- | ------------------- |
| Tile title     | "Growth Performance"                           | Dashboard tile      |
| Empty state    | "No social posts yet. Create your first post." | With CTA            |
| Error state    | "Unable to load growth data. Try again"        | Network error       |
| Pending banner | "{count} post(s) awaiting approval"            | Info tone           |
| Primary CTA    | "View Growth Dashboard"                        | Routes to `/growth` |
| Secondary CTA  | "Create Post"                                  | Opens composer      |

---

## 4. Growth Dashboard View

### 4.1 Layout

```
┌──────────────────────────────────────────────┐
│ Growth Performance              [Create Post] │
├──────────────────────────────────────────────┤
│ Week Performance │ Platform Breakdown         │
│ Posts: 12        │ Instagram: 8               │
│ Reach: 45K       │ Facebook: 3                │
│ Engagement: 4.2% │ TikTok: 1                  │
├──────────────────────────────────────────────┤
│ Pending Approvals (3)                        │
│ • Product launch — Instagram (2h ago)        │
│ • Sale announcement — Facebook (5h ago)      │
│ • Behind the scenes — TikTok (1d ago)        │
├──────────────────────────────────────────────┤
│ Recent Posts                                 │
│ [Grid of post cards with metrics]            │
└──────────────────────────────────────────────┘
```

### 4.2 Post Card Pattern

```tsx
<Card>
  <Stack gap="small">
    {/* Platform badge */}
    <InlineStack gap="small-200">
      <Badge>{platform}</Badge>
      {status === "scheduled" && <Badge tone="info">Scheduled</Badge>}
    </InlineStack>

    {/* Caption preview */}
    <Text lineClamp={3}>{caption}</Text>

    {/* Metrics */}
    <InlineStack gap="base">
      <Text variant="bodySm" tone="subdued">
        👁️ {reach} reach
      </Text>
      <Text variant="bodySm" tone="subdued">
        💬 {engagement} engagement
      </Text>
      <Text variant="bodySm" tone="subdued">
        🔗 {clicks} clicks
      </Text>
    </InlineStack>

    {/* Timestamp */}
    <Text variant="bodySm" tone="subdued">
      {publishedAt ? `Posted ${timeAgo}` : `Scheduled for ${futureTime}`}
    </Text>

    {/* Actions */}
    <Button variant="tertiary" onClick={viewDetails}>
      View Details
    </Button>
  </Stack>
</Card>
```

**Accessibility:**

- Card has `aria-label="Social post: {caption preview}"`
- Metrics use accessible labels (not emoji-only)
- Time relative ("2 hours ago") with full timestamp in title attribute

---

## 5. Responsive Behavior

### Desktop (≥1280px)

- Two-column layout (performance + pending approvals)
- Post cards in 3-column grid

### Tablet (768-1279px)

- Single column stack
- Post cards in 2-column grid

### Mobile (<768px)

- All stacked
- Post cards single column
- Composer drawer becomes full-screen

---

## Change Log

- **2025-10-19:** v1.0 - Growth & social posting UI patterns (North Star scope #4)
