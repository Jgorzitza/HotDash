import type { ReactNode } from "react";
import { TileRefreshIndicator } from "../realtime/TileRefreshIndicator";

export type TileStatus = "ok" | "error" | "unconfigured";
export type TileSource = "fresh" | "cache" | "mock" | "api";

export interface TileFact {
  id: number;
  createdAt: string;
}

export interface TileState<T> {
  status: TileStatus;
  data?: T;
  fact?: TileFact;
  source?: TileSource;
  error?: string;
}

interface TileCardProps<T> {
  title: string;
  tile: TileState<T>;
  render: (data: T) => ReactNode;
  testId?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  autoRefreshInterval?: number;
  showRefreshIndicator?: boolean;
}

const STATUS_LABELS: Record<TileStatus, string> = {
  ok: "Healthy",
  error: "Attention needed",
  unconfigured: "Configuration required",
};

function formatDateTime(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleString();
}

export function TileCard<T>({
  title,
  tile,
  render,
  testId,
  onRefresh,
  isRefreshing = false,
  autoRefreshInterval,
  showRefreshIndicator = false,
}: TileCardProps<T>) {
  const statusClass =
    tile.status === "ok"
      ? "occ-status-healthy"
      : tile.status === "error"
        ? "occ-status-attention"
        : "occ-status-unconfigured";

  let content: ReactNode;

  if (tile.status === "ok" && tile.data !== undefined) {
    content = render(tile.data as T);
  } else {
    const message =
      tile.error ||
      (tile.status === "unconfigured"
        ? "Connect integration to enable this tile."
        : "Data unavailable right now.");

    content = (
      <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>{message}</p>
    );
  }

  return (
    <div className="occ-tile" data-testid={testId}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "var(--occ-font-size-heading)",
            fontWeight: "var(--occ-font-weight-semibold)",
            color: "var(--occ-text-primary)",
          }}
        >
          {title}
        </h2>
        <span className={statusClass}>{STATUS_LABELS[tile.status]}</span>
      </div>

      {/* Real-time refresh indicator (Phase 5 - ENG-025) */}
      {showRefreshIndicator && tile.fact && (
        <TileRefreshIndicator
          lastUpdated={tile.fact.createdAt}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          autoRefreshInterval={autoRefreshInterval}
        />
      )}

      {/* Fallback timestamp for tiles without refresh indicator */}
      {!showRefreshIndicator && tile.fact && (
        <p className="occ-text-meta" style={{ margin: 0 }}>
          Last refreshed {formatDateTime(tile.fact.createdAt)}
          {tile.source ? ` • Source: ${tile.source}` : ""}
        </p>
      )}

      {content}
    </div>
  );
}
