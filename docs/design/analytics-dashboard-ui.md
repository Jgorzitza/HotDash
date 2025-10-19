# Analytics Dashboard UI Patterns

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0  
**Purpose:** Analytics visualization patterns for metrics & reporting

---

## 1. Metric Card Pattern

```tsx
<Card>
  <Stack gap="small">
    <Text variant="bodySm" tone="subdued">
      {metricLabel}
    </Text>
    <InlineStack align="space-between" blockAlign="center">
      <Text variant="heading2xl" fontWeight="bold">
        {metricValue}
      </Text>
      {trend && (
        <Badge tone={trend > 0 ? "success" : "critical"}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </Badge>
      )}
    </InlineStack>
    <Text variant="bodySm" tone="subdued">
      vs previous period
    </Text>
  </Stack>
</Card>
```

---

## 2. Chart Patterns

### 2.1 Line Chart (Trends)

**Accessibility:**

```tsx
<figure aria-label="Revenue trend over last 30 days">
  <LineChart data={revenueData} />
  <figcaption>
    <Text variant="bodySm" tone="subdued">
      Revenue: ${current} (↑{percentChange}% vs last period)
    </Text>
  </figcaption>
</figure>
```

### 2.2 Bar Chart (Comparisons)

**Accessibility:**

```tsx
<figure aria-label="Sales by product category">
  <BarChart data={categoryData} />
  <Table>
    <caption className="sr-only">Sales data by category</caption>
    <thead>
      <tr>
        <th scope="col">Category</th>
        <th scope="col">Sales</th>
      </tr>
    </thead>
    <tbody>
      {categoryData.map((cat) => (
        <tr key={cat.name}>
          <th scope="row">{cat.name}</th>
          <td>${cat.value}</td>
        </tr>
      ))}
    </tbody>
  </Table>
</figure>
```

---

## 3. Date Range Selector

```tsx
<Select
  label="Date range"
  options={[
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last 90 days", value: "90d" },
    { label: "Custom range", value: "custom" },
  ]}
  value={dateRange}
  onChange={setDateRange}
/>;

{
  dateRange === "custom" && (
    <InlineStack gap="small">
      <DateField label="Start date" value={startDate} onChange={setStartDate} />
      <DateField label="End date" value={endDate} onChange={setEndDate} />
    </InlineStack>
  );
}
```

---

## 4. Microcopy

| Element           | Copy                          | Notes                      |
| ----------------- | ----------------------------- | -------------------------- |
| Metric card trend | "↑ 12%" or "↓ 5%"             | With success/critical tone |
| Period label      | "vs previous period"          | Subdued tone               |
| Empty chart       | "No data for selected period" | Neutral state              |
| Loading           | "Loading analytics..."        | With spinner               |

---

## Change Log

- **2025-10-19:** v1.0 - Analytics dashboard UI patterns
