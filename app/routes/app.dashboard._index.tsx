/**
 * Dashboard Index Route
 *
 * Main dashboard with all tiles including new ContentTile.
 *
 * @see app/components/dashboard/ContentTile.tsx
 */

import { json, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import {
  ContentTile,
  getContentTileMockData,
} from "~/components/dashboard/ContentTile";

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Fetch real data from Supabase
  const contentData = getContentTileMockData();

  return json({
    contentData,
  });
}

export default function DashboardIndex() {
  const { contentData } = useLoaderData<typeof loader>();

  return (
    <div>
      <ContentTile data={contentData} />
      {/* Other tiles will be added by dashboard route owner */}
    </div>
  );
}
