import type { Route } from "./+types/health";

export async function loader({ request }: Route.LoaderArgs) {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    build: process.env.BUILD_ID || "local",
  };
}

