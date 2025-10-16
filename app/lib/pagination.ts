/**
 * Cursor-based Pagination Utilities
 * Owner: integrations agent
 * Date: 2025-10-15
 */

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

export function encodeCursor(value: string | number): string {
  return Buffer.from(String(value)).toString('base64');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8');
}

export function createCursorPaginationResult<T>(
  items: T[],
  limit: number,
  getCursorValue: (item: T) => string | number,
): CursorPaginationResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? encodeCursor(getCursorValue(data[data.length - 1])) : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
}

export interface OffsetPaginationParams {
  page?: number;
  perPage?: number;
}

export interface OffsetPaginationResult<T> {
  data: T[];
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export function createOffsetPaginationResult<T>(
  items: T[],
  totalCount: number,
  page: number,
  perPage: number,
): OffsetPaginationResult<T> {
  return {
    data: items,
    meta: {
      currentPage: page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage),
      totalCount,
    },
  };
}
