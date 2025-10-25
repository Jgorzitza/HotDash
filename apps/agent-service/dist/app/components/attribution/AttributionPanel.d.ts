/**
 * Action Attribution Panel Component
 *
 * ANALYTICS-101: Attribution panel with 7/14/28-day tabs showing performance metrics
 * for each approved Action with GA4 hd_action_key attribution data
 */
import type { AttributionPanelData } from "~/services/ga/attribution";
interface AttributionPanelProps {
    data: AttributionPanelData;
    loading?: boolean;
    error?: string;
}
export declare function AttributionPanel({ data, loading, error, }: AttributionPanelProps): React.JSX.Element;
export default AttributionPanel;
//# sourceMappingURL=AttributionPanel.d.ts.map