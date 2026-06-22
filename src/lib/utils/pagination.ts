import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import { appConfig } from "@/config/app.config";

export function paginate<T>(
  items: T[],
  params: PaginationParams = {},
): PaginatedResult<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? appConfig.defaultPageSize;
  const search = params.search?.toLowerCase().trim();

  let filtered = items;

  if (search) {
    filtered = items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search),
    );
  }

  if (params.sortBy) {
    const sortBy = params.sortBy as keyof T;
    const order = params.sortOrder === "desc" ? -1 : 1;
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total, page, pageSize, totalPages };
}

export function simulateDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
