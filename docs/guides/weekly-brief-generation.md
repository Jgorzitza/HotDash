# Weekly Content Brief Generation

**Runbook for generating weekly performance reports**

## Process

1. Run analyzer:

```typescript
import { exportWeeklyReport } from "~/services/content/engagement-analyzer";
const report = await exportWeeklyReport(startDate, endDate);
```

2. Review insights and recommendations

3. Share with CEO, Ads agent, AI-Customer agent

4. Update content strategy based on learnings

## Schedule

- **Generate:** Monday 9 AM
- **Review:** Monday 10 AM
- **Distribute:** Monday 11 AM
- **Strategy Updates:** Tuesday

## Template

See: docs/specs/weekly-content-performance-brief.md
