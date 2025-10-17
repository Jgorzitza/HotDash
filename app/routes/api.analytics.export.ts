/**
 * API Route: Analytics Export
 *
 * GET /api/analytics/export?type=revenue|traffic|products|utm
 *
 * Export analytics data to CSV format.
 */

export async function loader({ request }: any) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "revenue";

    const {
      exportRevenueToCSV,
      exportTrafficToCSV,
      exportProductsToCSV,
      exportUTMToCSV,
      generateCSVFilename,
    } = await import("../services/analytics/export.ts");

    let csv: string;
    let filename: string;

    switch (type) {
      case "revenue":
        csv = await exportRevenueToCSV();
        filename = generateCSVFilename("revenue");
        break;
      case "traffic":
        csv = await exportTrafficToCSV();
        filename = generateCSVFilename("traffic");
        break;
      case "products":
        csv = await exportProductsToCSV();
        filename = generateCSVFilename("products");
        break;
      case "utm":
        csv = await exportUTMToCSV();
        filename = generateCSVFilename("utm");
        break;
      default:
        return new Response("Invalid export type", { status: 400 });
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[API] Export error:", error);
    return new Response(error.message, { status: 500 });
  }
}
