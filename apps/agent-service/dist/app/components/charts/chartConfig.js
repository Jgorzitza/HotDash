/**
 * Chart.js Configuration and Registration
 *
 * Per Context7 react-chartjs-2 docs: Must register Chart.js elements
 * for tree-shaking in v4+
 *
 * Registers only the elements we need to reduce bundle size.
 */
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, } from "chart.js";
// Register Chart.js components (required for tree-shaking)
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);
/**
 * Get OCC-themed chart options
 *
 * Applies OCC design tokens to Chart.js charts for consistent styling
 * with the rest of the application.
 */
export function getOCCChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    color: "rgb(var(--occ-text-default))",
                    font: {
                        family: "var(--occ-font-family)",
                        size: 12,
                    },
                    padding: 12,
                    usePointStyle: true,
                },
            },
            title: title
                ? {
                    display: true,
                    text: title,
                    color: "rgb(var(--occ-text-default))",
                    font: {
                        family: "var(--occ-font-family)",
                        size: 16,
                        weight: "600",
                    },
                    padding: {
                        top: 10,
                        bottom: 20,
                    },
                }
                : undefined,
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    size: 14,
                    weight: "600",
                },
                bodyFont: {
                    size: 13,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                },
                ticks: {
                    color: "rgb(var(--occ-text-secondary))",
                    font: {
                        size: 11,
                    },
                },
            },
            y: {
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                },
                ticks: {
                    color: "rgb(var(--occ-text-secondary))",
                    font: {
                        size: 11,
                    },
                },
                beginAtZero: true,
            },
        },
    };
}
/**
 * OCC Color Palette for Charts
 *
 * Consistent colors across all analytics charts
 */
export const OCC_CHART_COLORS = {
    primary: "rgb(0, 91, 211)", // OCC primary blue
    success: "rgb(0, 128, 96)", // OCC success green
    warning: "rgb(255, 184, 0)", // OCC warning yellow
    critical: "rgb(239, 77, 47)", // OCC critical red
    purple: "rgb(156, 39, 176)",
    teal: "rgb(0, 151, 167)",
    orange: "rgb(255, 152, 0)",
    pink: "rgb(233, 30, 99)",
};
/**
 * Transparent version of OCC colors (for area fills)
 */
export const OCC_CHART_COLORS_TRANSPARENT = {
    primary: "rgba(0, 91, 211, 0.2)",
    success: "rgba(0, 128, 96, 0.2)",
    warning: "rgba(255, 184, 0, 0.2)",
    critical: "rgba(239, 77, 47, 0.2)",
    purple: "rgba(156, 39, 176, 0.2)",
    teal: "rgba(0, 151, 167, 0.2)",
    orange: "rgba(255, 152, 0, 0.2)",
    pink: "rgba(233, 30, 99, 0.2)",
};
//# sourceMappingURL=chartConfig.js.map